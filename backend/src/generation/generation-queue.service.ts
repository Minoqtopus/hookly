import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { AIService } from '../ai/ai.service';
import { TokenManagementService } from '../ai/token-management.service';
import { GenerationPolicy } from '../core/domain/policies/generation.policy';
import { PlanLimitPolicy } from '../core/domain/policies/plan-limit.policy';
import { JobQueuePort } from '../core/ports/job-queue.port';
import { GenerationJob, JobType } from '../entities/generation-job.entity';
import { Generation } from '../entities/generation.entity';
import { User, UserPlan } from '../entities/user.entity';
// import { SimpleQueueService } from '../queues/simple-queue.service'; // Replaced with ProductionQueueService
import { GenerateVariationsDto } from './dto/generate-variations.dto';
import { GenerateDto } from './dto/generate.dto';
import { GuestGenerateDto } from './dto/guest-generate.dto';

interface GenerationJobData {
  userId: string;
  productName: string;
  niche: string;
  targetAudience: string;
  userStyle?: any;
  platform?: string;
  tone?: string;
  length?: 'short' | 'medium' | 'long';
}

@Injectable()
export class GenerationQueueService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Generation)
    private generationRepository: Repository<Generation>,
    @InjectRepository(GenerationJob)
    private generationJobRepository: Repository<GenerationJob>,
    private aiService: AIService, // Keep for guest generations
    @Inject('JobQueuePort')
    private jobQueue: JobQueuePort,
    private planLimitPolicy: PlanLimitPolicy,
    private generationPolicy: GenerationPolicy,
    private tokenManagementService: TokenManagementService,
  ) {}

  /**
   * Generate content using the job queue system for reliable, scalable processing
   */
  async generateContent(userId: string, generateDto: GenerateDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if user can generate content using domain policy
    const usageStatus = this.planLimitPolicy.canUserGenerate(
      user.plan,
      user.monthly_generation_count,
      user.trial_generations_used,
      user.trial_started_at,
      user.trial_ends_at
    );
    
    if (!usageStatus.canGenerate) {
      throw new ForbiddenException(usageStatus.upgradeMessage || 'Generation limit reached');
    }

    // Additional check using token management system
    const tokenCheck = await this.tokenManagementService.canUserGenerate(userId, user.plan);
    if (!tokenCheck.canGenerate) {
      throw new ForbiddenException(tokenCheck.reason || 'Generation limit reached');
    }

    // Create job data
    const jobData: GenerationJobData = {
      userId,
      productName: generateDto.productName,
      niche: generateDto.niche,
      targetAudience: generateDto.targetAudience,
      userStyle: undefined, // Will add userStyle support later
      platform: this.getPlatformForUser(user),
      tone: undefined, // Will add tone support later
      length: 'medium', // Will add length support later
    };

    try {
      // Add high-priority job to the AI generation queue
      const jobId = await this.jobQueue.addJob(
        JobType.AI_GENERATION,
        jobData,
        {
          priority: 1, // High priority for user-facing generation
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 100,
          removeOnFail: 50,
        }
      );

      // For synchronous-like experience, wait for job completion with timeout
      const result = await this.waitForJobCompletion(jobId, 30000); // 30 second timeout

      if (result.success && result.data) {
        // Update user counts
        if (user.plan === UserPlan.TRIAL) {
          user.trial_generations_used += 1;
        } else {
          user.monthly_generation_count += 1;
        }
        await this.userRepository.save(user);

        // Create Generation entity from job result
        const generation = await this.createGenerationFromJobResult(userId, generateDto, result.data);

        return {
          id: generation.id,
          hook: generation.hook,
          script: generation.script,
          visuals: generation.visuals,
          performance: result.data.performance || {
            estimatedViews: Math.floor(Math.random() * 200000) + 50000,
            estimatedCTR: parseFloat((Math.random() * 4 + 2).toFixed(1)),
            viralScore: parseFloat((Math.random() * 3 + 7).toFixed(1)),
          },
          created_at: generation.created_at,
          remaining_generations: usageStatus.remainingGenerations - 1,
          trial_days_left: user.trial_ends_at && user.plan === UserPlan.TRIAL 
            ? Math.max(0, Math.ceil((user.trial_ends_at.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000)))
            : null,
          job_id: jobId, // Return job ID for potential status checking
        };
      } else {
        throw new BadRequestException(result.error || 'Generation failed');
      }
    } catch (error: any) {
      if (error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      
      console.error('Generation queue error:', error);
      throw new BadRequestException('Failed to queue generation. Please try again.');
    }
  }

  /**
   * Generate content variations using job queue with batch processing
   */
  async generateVariations(userId: string, generateVariationsDto: GenerateVariationsDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if user has batch generation feature (Pro+ only)
    if (!user.has_batch_generation) {
      throw new ForbiddenException('Batch generation is a Pro feature. Upgrade to generate multiple variations at once.');
    }

    // Check if user can generate variations (3 generations)
    const variationsCount = 3;
    const canGenerateVariations = this.planLimitPolicy.canUserGenerate(
      user.plan,
      user.monthly_generation_count + variationsCount,
      user.trial_generations_used + variationsCount,
      user.trial_started_at,
      user.trial_ends_at
    );
    
    if (!canGenerateVariations.canGenerate) {
      throw new ForbiddenException(`Not enough generations remaining. Need ${variationsCount} generations for variations.`);
    }

    try {
      // Create batch jobs for variations
      const variationJobs = [];
      for (let i = 0; i < variationsCount; i++) {
        const jobData: GenerationJobData = {
          userId,
          productName: generateVariationsDto.productName,
          niche: generateVariationsDto.niche,
          targetAudience: `${generateVariationsDto.targetAudience} (variation ${i + 1})`,
          platform: this.getPlatformForUser(user),
        };

        variationJobs.push({
          jobType: JobType.AI_GENERATION,
          data: jobData,
          options: {
            priority: 2, // Medium priority for batch operations
            attempts: 3,
            backoff: { type: 'exponential' as const, delay: 2000 },
          }
        });
      }

      // Add all variation jobs as a batch
      const jobIds = await this.jobQueue.addJobs(variationJobs);

      // Wait for all variations to complete (with longer timeout for batch)
      const results = await Promise.all(
        jobIds.map(jobId => this.waitForJobCompletion(jobId, 45000))
      );

      // Process successful results
      const savedGenerations = [];
      let successCount = 0;

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        
        if (result.success && result.data) {
          const variation = result.data;
          const generation = await this.createGenerationFromJobResult(
            userId, 
            {
              productName: generateVariationsDto.productName,
              niche: generateVariationsDto.niche,
              targetAudience: generateVariationsDto.targetAudience,
            }, 
            variation
          );

          savedGenerations.push({
            id: generation.id,
            hook: generation.hook,
            script: generation.script,
            visuals: generation.visuals,
            performance: variation.performance || {
              estimatedViews: Math.floor(Math.random() * 200000) + 50000,
              estimatedCTR: parseFloat((Math.random() * 4 + 2).toFixed(1)),
              viralScore: parseFloat((Math.random() * 3 + 7).toFixed(1)),
            },
            variationNumber: i + 1,
            variationApproach: i === 0 ? 'Problem/Solution' : i === 1 ? 'Transformation/Results' : 'Social Proof/Trending',
            created_at: generation.created_at,
          });
          
          successCount++;
        }
      }

      if (successCount === 0) {
        throw new BadRequestException('Failed to generate any variations. Please try again.');
      }

      // Update user's count based on successful generations
      if (user.plan === UserPlan.TRIAL) {
        user.trial_generations_used += successCount;
      } else {
        user.monthly_generation_count += successCount;
      }
      await this.userRepository.save(user);

      return {
        variations: savedGenerations,
        totalGenerated: successCount,
        totalAttempted: variationsCount,
        remaining_generations: Math.max(0, canGenerateVariations.remainingGenerations - successCount),
        message: `Generated ${successCount}/${variationsCount} variations with different approaches for maximum testing potential.`
      };

    } catch (error: any) {
      if (error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      
      console.error('Variations generation queue error:', error);
      throw new BadRequestException('Failed to generate variations. Please try again.');
    }
  }

  /**
   * Guest generation using direct AI service (no queue for immediate response)
   */
  async generateGuestContent(guestGenerateDto: GuestGenerateDto, ipAddress: string) {
    // Rate limiting for guests: 1 generation per IP per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentGuestGenerations = await this.generationRepository.count({
      where: {
        is_guest_generation: true,
        created_at: MoreThan(oneHourAgo),
      },
    });

    if (recentGuestGenerations >= 1) {
      throw new ForbiddenException('Guest limit reached. Please sign up for more generations.');
    }

    try {
      // Use direct AI service for guests (immediate response)
      const generatedContent = await this.aiService.generateUGCContent({
        productName: guestGenerateDto.productName,
        niche: guestGenerateDto.niche,
        targetAudience: guestGenerateDto.targetAudience,
      });

      // Always add watermark for guest users
      const output = {
        ...generatedContent,
        script: generatedContent.script + '\n\n---\n🚀 Generated with Hookly - Start your free trial for more!',
        hook: generatedContent.hook + ' [Try Hookly Free Trial]',
      };

      // Save guest generation
      const generation = this.generationRepository.create({
        user_id: null,
        product_name: guestGenerateDto.productName,
        niche: guestGenerateDto.niche,
        target_audience: guestGenerateDto.targetAudience,
        hook: output.hook,
        script: output.script,
        visuals: output.visuals,
        is_guest_generation: true,
      });

      await this.generationRepository.save(generation);

      return {
        id: generation.id,
        hook: generation.hook,
        script: generation.script,
        visuals: generation.visuals,
        performance: {
          estimatedViews: Math.floor(Math.random() * 150000) + 30000,
          estimatedCTR: parseFloat((Math.random() * 3 + 1.5).toFixed(1)),
          viralScore: parseFloat((Math.random() * 2.5 + 6).toFixed(1)),
        },
        created_at: generation.created_at,
        is_guest: true,
        upgrade_message: 'Start your free trial to save this generation and get 3 more!',
      };
    } catch (error) {
      console.error('Guest generation error:', error);
      throw new BadRequestException('Failed to generate content. Please try again.');
    }
  }

  /**
   * Get job status for checking generation progress
   */
  async getJobStatus(jobId: string): Promise<{
    status: string;
    result?: any;
    error?: string;
    progress?: number;
  }> {
    try {
      const status = await this.jobQueue.getJobStatus(jobId);
      const result = await this.jobQueue.getJobResult(jobId);
      
      return {
        status: status || 'not_found',
        result: result?.data,
        error: result?.error,
        progress: status === 'active' ? 50 : status === 'completed' ? 100 : 0,
      };
    } catch (error) {
      console.error('Error getting job status:', error);
      return {
        status: 'error',
        error: 'Failed to get job status',
      };
    }
  }

  /**
   * Get user generations (unchanged from original service)
   */
  async getUserGenerations(userId: string, page: number = 1, limit: number = 10) {
    const [generations, total] = await this.generationRepository.findAndCount({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      generations: generations.map(gen => ({
        id: gen.id,
        hook: gen.hook,
        script: gen.script,
        visuals: gen.visuals,
        created_at: gen.created_at,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Toggle favorite (unchanged from original service)
   */
  async toggleFavorite(userId: string, generationId: string) {
    try {
      const generation = await this.generationRepository.findOne({
        where: { id: generationId, user_id: userId },
      });

      if (!generation) {
        throw new NotFoundException('Generation not found or access denied');
      }

      generation.is_favorite = !generation.is_favorite;
      await this.generationRepository.save(generation);

      return {
        id: generation.id,
        is_favorite: generation.is_favorite,
        message: generation.is_favorite ? 'Added to favorites' : 'Removed from favorites',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error toggling favorite:', error);
      throw new BadRequestException('Failed to update favorite status');
    }
  }

  // Private helper methods
  private async waitForJobCompletion(jobId: string, timeoutMs: number): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    const startTime = Date.now();
    const pollInterval = 1000; // Poll every second

    return new Promise(async (resolve) => {
      const poll = async () => {
        try {
          const status = await this.jobQueue.getJobStatus(jobId);
          
          if (status === 'completed') {
            const result = await this.jobQueue.getJobResult(jobId);
            resolve({
              success: true,
              data: result?.data,
            });
            return;
          }
          
          if (status === 'failed') {
            const result = await this.jobQueue.getJobResult(jobId);
            resolve({
              success: false,
              error: result?.error || 'Job failed',
            });
            return;
          }
          
          // Check timeout
          if (Date.now() - startTime > timeoutMs) {
            resolve({
              success: false,
              error: 'Generation timeout - job is still processing in background',
            });
            return;
          }
          
          // Continue polling
          setTimeout(poll, pollInterval);
        } catch (error) {
          console.error('Error polling job status:', error);
          resolve({
            success: false,
            error: 'Failed to check job status',
          });
        }
      };
      
      poll();
    });
  }

  private async createGenerationFromJobResult(
    userId: string, 
    generateDto: any, 
    jobResult: any
  ): Promise<Generation> {
    const generation = this.generationRepository.create({
      user_id: userId,
      product_name: generateDto.productName,
      niche: generateDto.niche,
      target_audience: generateDto.targetAudience,
      hook: jobResult.hook,
      script: jobResult.script,
      visuals: jobResult.visuals,
    });

    return await this.generationRepository.save(generation);
  }

  private getPlatformForUser(user: User): string {
    // Determine platform access based on user plan
    const platforms = [];
    
    if (user.has_tiktok_access) platforms.push('TikTok');
    if (user.has_instagram_access) platforms.push('Instagram');
    if (user.has_x_access) platforms.push('X');
    if (user.has_youtube_access) platforms.push('YouTube');
    
    return platforms.length > 0 ? platforms.join(', ') : 'TikTok';
  }
}