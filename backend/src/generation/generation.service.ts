import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { GenerationPolicy } from '../core/domain/policies/generation.policy';
import { PlanLimitPolicy } from '../core/domain/policies/plan-limit.policy';
import { ContentGeneratorPort } from '../core/ports/content-generator.port';
import { Generation } from '../entities/generation.entity';
import { User, UserPlan } from '../entities/user.entity';
import { OpenAIService } from '../openai/openai.service';
import { GenerateVariationsDto } from './dto/generate-variations.dto';
import { GenerateDto } from './dto/generate.dto';
import { GuestGenerateDto } from './dto/guest-generate.dto';

@Injectable()
export class GenerationService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Generation)
    private generationRepository: Repository<Generation>,
    private openaiService: OpenAIService,
    @Inject('ContentGeneratorPort')
    private contentGenerator: ContentGeneratorPort,
    private planLimitPolicy: PlanLimitPolicy,
    private generationPolicy: GenerationPolicy,
  ) {}

  async generateContent(userId: string, generateDto: GenerateDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if user can generate content using domain policy
    const usageStatus = this.planLimitPolicy.canUserGenerate(
      user.plan,
      user.monthly_count,
      user.trial_generations_used,
      user.trial_started_at,
      user.trial_ends_at
    );
    
    if (!usageStatus.canGenerate) {
      throw new ForbiddenException(usageStatus.upgradeMessage || 'Generation limit reached');
    }

    // Get generation configuration from domain policy
    const generationConfig = this.generationPolicy.getGenerationConfig();

    let retryCount = 0;
    let generatedContent: any;
    let processingStartTime: number;
    let processingTime: number;

    while (retryCount < generationConfig.maxRetries) {
      try {
        processingStartTime = Date.now();
        
        // Generate content using content generator port with timeout
        generatedContent = await Promise.race([
          this.contentGenerator.generateUGCContent({
            productName: generateDto.productName,
            niche: generateDto.niche,
            targetAudience: generateDto.targetAudience,
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Generation timeout')), generationConfig.timeout)
          )
        ]);

        processingTime = Date.now() - processingStartTime;
        break; // Success, exit retry loop

      } catch (error) {
        retryCount++;
        processingTime = Date.now() - processingStartTime;
        
        if (retryCount >= generationConfig.maxRetries) {
          console.error(`Generation failed after ${generationConfig.maxRetries} attempts:`, error);
          throw new BadRequestException(
            retryCount === 1 
              ? 'AI generation service is temporarily unavailable. Please try again in a moment.'
              : `Generation failed after ${generationConfig.maxRetries} attempts. Please try again later.`
          );
        }

        // Wait before retry using policy-based backoff
        const waitTime = this.generationPolicy.calculateRetryDelay(retryCount);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        console.warn(`Generation attempt ${retryCount} failed, retrying in ${waitTime}ms:`, error instanceof Error ? error.message : 'Unknown error');
      }
    }

    try {
      // Add watermark for trial users only
      let output = generatedContent;
      if (user.plan === UserPlan.TRIAL) {
        output = {
          ...generatedContent,
          script: generatedContent.script + '\n\n---\nGenerated with Hookly (Trial)',
          hook: generatedContent.hook + ' [Generated with Hookly Trial]',
        };
      }
      // STARTER, PRO, and AGENCY plans get no watermarks

      // Save generation to database with metadata
      const generation = this.generationRepository.create({
        user_id: userId,
        product_name: generateDto.productName,
        niche: generateDto.niche,
        target_audience: generateDto.targetAudience,
        hook: output.hook,
        script: output.script,
        visuals: output.visuals,
        generation_metadata: {
          processing_time_ms: processingTime,
          model_version: 'gpt-4-turbo', // This should come from OpenAI service
          ai_provider: 'openai',
          retry_count: retryCount,
          error_count: retryCount,
          generated_at: new Date().toISOString(),
        },
      });
      await this.generationRepository.save(generation);

      // Increment appropriate counter
      if (user.plan === UserPlan.TRIAL) {
        user.trial_generations_used += 1;
      } else {
        user.monthly_count += 1;
      }
      await this.userRepository.save(user);

      const remainingGenerations = usageStatus.remainingGenerations;

      return {
        id: generation.id,
        hook: generation.hook,
        script: generation.script,
        visuals: generation.visuals,
        performance: {
          estimatedViews: Math.floor(Math.random() * 200000) + 50000, // 50K-250K views
          estimatedCTR: parseFloat((Math.random() * 4 + 2).toFixed(1)), // 2-6% CTR
          viralScore: parseFloat((Math.random() * 3 + 7).toFixed(1)), // 7-10 viral score
        },
        created_at: generation.created_at,
        remaining_generations: remainingGenerations,
        trial_days_left: user.trial_ends_at && user.plan === UserPlan.TRIAL 
          ? Math.max(0, Math.ceil((user.trial_ends_at.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000)))
          : null,
      };
    } catch (error) {
      console.error('Generation error:', error);
      throw new BadRequestException('Failed to generate content. Please try again.');
    }
  }

  async generateGuestContent(guestGenerateDto: GuestGenerateDto, ipAddress: string) {
    // Rate limiting for guests: 1 generation per IP per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentGuestGenerations = await this.generationRepository.count({
      where: {
        is_guest_generation: true,
        created_at: MoreThan(oneHourAgo),
        // In a real app, you'd store IP in a separate field
        // For now, we'll use a simple session-based approach
      },
    });

    if (recentGuestGenerations >= 1) {
      throw new ForbiddenException('Guest limit reached. Please sign up for more generations.');
    }

    try {
      // Generate content using OpenAI
      const generatedContent = await this.openaiService.generateUGCContent({
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
          estimatedViews: Math.floor(Math.random() * 150000) + 30000, // 30K-180K views for guests
          estimatedCTR: parseFloat((Math.random() * 3 + 1.5).toFixed(1)), // 1.5-4.5% CTR
          viralScore: parseFloat((Math.random() * 2.5 + 6).toFixed(1)), // 6-8.5 viral score
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

  async generateVariations(userId: string, generateVariationsDto: GenerateVariationsDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if user has batch generation feature (Pro+ only)
    if (!user.has_batch_generation) {
      throw new ForbiddenException('Batch generation is a Pro feature. Upgrade to generate multiple variations at once.');
    }

    // Check if user can generate variations using domain policy
    const variationsCount = 3; // Always generate 3 variations
    const canGenerateVariations = await this.planLimitPolicy.canUserGenerate(
      user.plan,
      user.monthly_count + variationsCount,
      user.trial_generations_used + variationsCount,
      user.trial_started_at,
      user.trial_ends_at
    );
    
    if (!canGenerateVariations.canGenerate) {
      throw new ForbiddenException(`Not enough generations remaining. Need ${variationsCount} generations for variations.`);
    }

    try {
      // Generate 3 variations with single API call
      const variationsData = await this.contentGenerator.generateUGCVariations({
        productName: generateVariationsDto.productName,
        niche: generateVariationsDto.niche,
        targetAudience: generateVariationsDto.targetAudience,
      }, 3);

      // Save each variation as a separate generation
      const savedGenerations = [];
      for (let i = 0; i < variationsData.length; i++) {
        const variation = variationsData[i];
        const performance = variation.performance;

        // Add performance data to the variation
        const variationWithPerformance = {
          ...variation,
          performance,
          variationNumber: i + 1,
          variationApproach: i === 0 ? 'Problem/Solution' : i === 1 ? 'Transformation/Results' : 'Social Proof/Trending'
        };

        const generation = this.generationRepository.create({
          user_id: userId,
          product_name: generateVariationsDto.productName,
          niche: generateVariationsDto.niche,
          target_audience: generateVariationsDto.targetAudience,
          hook: variation.hook,
          script: variation.script,
          visuals: variation.visuals,
        });

        const saved = await this.generationRepository.save(generation);
        savedGenerations.push({
          id: saved.id,
          hook: saved.hook,
          script: saved.script,
          visuals: saved.visuals,
          performance: performance,
          variationNumber: i + 1,
          variationApproach: i === 0 ? 'Problem/Solution' : i === 1 ? 'Transformation/Results' : 'Social Proof/Trending',
          created_at: saved.created_at,
        });
      }

      // Update user's count
      if (user.plan === UserPlan.TRIAL) {
        user.trial_generations_used += variationsCount;
      } else {
        user.monthly_count += variationsCount;
      }
      await this.userRepository.save(user);

      const updatedCurrentCount = user.plan === UserPlan.TRIAL ? user.trial_generations_used : user.monthly_count;
      
      return {
        variations: savedGenerations,
        totalGenerated: variationsCount,
        remaining_generations: Math.max(0, canGenerateVariations.remainingGenerations - variationsCount),
        message: `Generated ${variationsCount} variations with different approaches for maximum testing potential.`
      };
    } catch (error) {
      console.error('Variations generation error:', error);
      throw new BadRequestException('Failed to generate variations. Please try again.');
    }
  }

  async toggleFavorite(userId: string, generationId: string) {
    try {
      // Find the generation and verify ownership
      const generation = await this.generationRepository.findOne({
        where: { id: generationId, user_id: userId },
      });

      if (!generation) {
        throw new NotFoundException('Generation not found or access denied');
      }

      // Toggle favorite status
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
}