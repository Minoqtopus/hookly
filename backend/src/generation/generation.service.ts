import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiService } from '../ai/ai.service';
import { Generation, GenerationStatus, GenerationType } from '../entities/generation.entity';
import { User, UserPlan } from '../entities/user.entity';
import { BUSINESS_CONSTANTS, ERROR_MESSAGES, getGenerationLimit } from '../constants/business-rules';
import { UserPlanModel } from '../domain/models/user-plan.model';
import { GenerationRequestModel, GenerationRequestData } from '../domain/models/generation-request.model';
import { GenerationDomainService } from '../domain/services/generation-domain.service';
import { ValidationService } from '../domain/services/validation.service';
import { GenerationGateway } from './generation.gateway';
// FUTURE: Tiered content generation system
// import { ViralContentPrompts } from '../ai/prompts/viral-content-prompts';
// import { getContentQualityTier, getCostOptimization, getQualityIndicator } from '../ai/quality-tiers.config';

@Injectable()
export class GenerationService {
  constructor(
    @InjectRepository(Generation)
    private generationRepository: Repository<Generation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private aiService: AiService,
    private generationDomainService: GenerationDomainService,
    private validationService: ValidationService,
    private generationGateway: GenerationGateway,
  ) {}

  /**
   * Create AI-generated demo content to showcase the product capabilities (public endpoint)
   * Uses Gemini AI to generate high-quality, personalized viral content
   * No user authentication required - perfect for landing page demos
   */
  async createDemoGenerations(demoData?: { productName: string; niche: string; targetAudience: string }): Promise<Generation[]> {
    // Use provided data or fallback defaults
    const productName = demoData?.productName || 'Our Amazing Product';
    const niche = demoData?.niche || 'Productivity';
    const targetAudience = demoData?.targetAudience || 'Working professionals aged 25-40';

    // Define platforms for demo content generation
    const platforms = [
      { type: GenerationType.INSTAGRAM, name: 'instagram' as const },
      { type: GenerationType.TIKTOK, name: 'tiktok' as const },
      { type: GenerationType.YOUTUBE, name: 'youtube' as const }
    ];

    // Generate AI content for each platform
    const demoGenerations = await Promise.all(
      platforms.map(async (platform, index) => {
        try {
          // FUTURE: Use DEMO tier for public demos - basic quality to encourage signups
          // const tieredPrompt = ViralContentPrompts.generateTieredPrompt(...)
          // const costConfig = getCostOptimization('demo');
          
          const generatedContent = await this.aiService.generateContent({
            productName,
            niche,
            targetAudience,
            platform: platform.name as 'instagram' | 'tiktok' | 'youtube'
          });

          return {
            id: `demo-${index + 1}`,
            title: generatedContent.title,
            platform: platform.type,
            niche: niche,
            target_audience: targetAudience,
            hook: generatedContent.hook,
            script: generatedContent.script,
            performance_data: generatedContent.performance_data,
            status: GenerationStatus.COMPLETED,
            is_demo: true,
            is_favorite: false,
            created_at: new Date(),
            updated_at: new Date(),
            user: null // No user for public demo
          };
        } catch (error) {
          // Fallback generation if AI fails
          return {
            id: `demo-${index + 1}`,
            title: `How ${productName} Changed My Life`,
            platform: platform.type,
            niche: niche,
            target_audience: targetAudience,
            hook: `I was skeptical about ${productName} until I tried it. The results were incredible...`,
            script: `I was skeptical about ${productName} until I tried it. The results were incredible.

Here's what happened:
• Week 1: I noticed immediate improvements
• Week 2: Friends started asking what changed
• Week 3: I realized this was a game-changer

Perfect for ${targetAudience} who want real results.

What's been your experience with ${niche}? Let me know! 👇`,
            performance_data: {
              views: Math.floor(Math.random() * 80000) + 20000,
              clicks: Math.floor(Math.random() * 5000) + 2000,
              conversions: Math.floor(Math.random() * 300) + 100,
              ctr: parseFloat((Math.random() * 4 + 3).toFixed(1)),
              engagement_rate: parseFloat((Math.random() * 8 + 5).toFixed(1))
            },
            status: GenerationStatus.COMPLETED,
            is_demo: true,
            is_favorite: false,
            created_at: new Date(),
            updated_at: new Date(),
            user: null
          };
        }
      })
    );

    return demoGenerations as Generation[];
  }

  /**
   * Get all generations for a user
   */
  async getUserGenerations(userId: string, limit: number = 50): Promise<Generation[]> {
    return this.generationRepository.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
      take: limit
    });
  }

  /**
   * Get recent generations for user (for dashboard)
   */
  async getRecentGenerations(userId: string, limit: number = 10): Promise<Generation[]> {
    return this.generationRepository.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
      take: limit
    });
  }

  /**
   * Create generation for authenticated user with domain-driven business logic
   * 
   * Staff Engineer Note: This method now uses domain models to encapsulate
   * business logic and provide better separation of concerns.
   */
  async createUserGeneration(
    userId: string,
    requestData: GenerationRequestData,
    generationId?: string
  ): Promise<Generation> {
    const streamingId = generationId || `gen_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    
    try {
      console.log(`🚀 Starting streaming generation with ID: ${streamingId}`);
      
      // Emit generation started stage
      this.generationGateway.emitGenerationStage(streamingId, {
        stage: 'analyzing',
        message: 'Analyzing your request and preparing AI generation...',
        progress: 10
      });
      console.log(`📡 Emitted 'analyzing' stage for ${streamingId}`);

      // Get user with current limits
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new ForbiddenException('User not found');
      }

      // Create domain models for business logic
      // CRITICAL FIX: Include email verification status
      const userPlan = UserPlanModel.fromUserEntity({
        plan: user.plan,
        is_email_verified: user.is_email_verified, // CRITICAL: Added missing field
        trial_ends_at: user.trial_ends_at,
        monthly_generation_count: user.monthly_generation_count,
        trial_generations_used: user.trial_generations_used,
        monthly_reset_date: user.monthly_reset_date
      });

      const generationRequest = GenerationRequestModel.fromRequestData(requestData, userId);

      // Comprehensive validation using centralized validation service
      const validationResult = this.validationService.validateGenerationRequest(userPlan, generationRequest);
      
      // If validation fails, throw exception with detailed error information
      if (!validationResult.isValid) {
        this.validationService.throwValidationException(validationResult, 'Generation request validation failed');
      }

      // Emit validation completed stage
      this.generationGateway.emitGenerationStage(streamingId, {
        stage: 'generating',
        message: 'Validation successful! Starting AI content generation...',
        progress: 30
      });
      console.log(`📡 Emitted 'generating' stage for ${streamingId}`);

      // Generate AI content with streaming support
      console.log(`🤖 Starting AI content generation for ${streamingId}`);
      const generatedContent = await this.aiService.generateContent({
        productName: generationRequest.productName,
        niche: generationRequest.niche,
        targetAudience: generationRequest.targetAudience,
        platform: generationRequest.platform
      }, {
        streamingId,
        onContentChunk: (section, content, isComplete, progress) => {
          console.log(`🎯 Content chunk for ${streamingId}: ${section} (${progress}% complete)`);
          this.generationGateway.emitContentChunk(streamingId, {
            section: section as 'title' | 'hook' | 'script' | 'cta',
            content,
            isComplete,
            totalProgress: progress
          });
        }
      });
      console.log(`✅ AI content generation completed for ${streamingId}`);

      // Emit optimization stage
      this.generationGateway.emitGenerationStage(streamingId, {
        stage: 'optimizing',
        message: 'Optimizing content and calculating performance metrics...',
        progress: 85
      });

      // Calculate performance metrics using domain service
      const performanceMetrics = this.generationDomainService.calculatePerformanceMetrics(generationRequest);

      // Ensure platform enum compatibility
      const platformValue = generationRequest.platform as GenerationType;

      // Emit saving stage
      this.generationGateway.emitGenerationStage(streamingId, {
        stage: 'saving',
        message: 'Saving your generated content...',
        progress: 95
      });

      // CRITICAL FIX: Wrap database operations in transaction with re-validation for race condition prevention
      const savedGeneration = await this.generationRepository.manager.transaction(async manager => {
        // CRITICAL: Re-fetch user with row lock to prevent race conditions
        const userWithLock = await manager.findOne(User, {
          where: { id: userId },
          lock: { mode: 'pessimistic_write' }
        });

        if (!userWithLock) {
          throw new ForbiddenException('User not found during generation creation');
        }

        // CRITICAL: Re-validate limits with fresh data inside transaction
        const freshUserPlan = UserPlanModel.fromUserEntity({
          plan: userWithLock.plan,
          is_email_verified: userWithLock.is_email_verified,
          trial_ends_at: userWithLock.trial_ends_at,
          monthly_generation_count: userWithLock.monthly_generation_count,
          trial_generations_used: userWithLock.trial_generations_used,
          monthly_reset_date: userWithLock.monthly_reset_date
        });

        const finalValidationResult = this.validationService.validateGenerationRequest(freshUserPlan, generationRequest);
        
        if (!finalValidationResult.isValid) {
          this.validationService.throwValidationException(finalValidationResult, 'Generation limit exceeded during creation');
        }

        // Create generation entity
        const generation = manager.create(Generation, {
          user: userWithLock,
          title: generatedContent.title,
          platform: platformValue,
          niche: generationRequest.niche,
          target_audience: generationRequest.targetAudience,
          hook: generatedContent.hook,
          script: generatedContent.script,
          performance_data: performanceMetrics,
          status: GenerationStatus.COMPLETED,
          is_demo: false,
          is_favorite: false
        });

        // Save generation record
        const savedGeneration = await manager.save(Generation, generation);

        // Update user generation counts atomically within transaction
        await this.updateUserGenerationCountInTransaction(manager, userWithLock);

        return savedGeneration;
      });

      // Emit completion
      this.generationGateway.emitGenerationCompleted(streamingId, savedGeneration);

      return savedGeneration;
    } catch (error) {
      // Emit error to connected clients
      const errorMessage = error instanceof Error ? error.message : 'Generation failed';
      this.generationGateway.emitGenerationError(streamingId, errorMessage);
      throw error;
    }
  }

  // Staff Engineer Note: Platform access and limit validation now handled by domain models
  // This separation of concerns makes the code more testable and maintainable

  /**
   * Update user generation count within a database transaction
   * CRITICAL FIX: Transaction-aware version for data consistency
   */
  private async updateUserGenerationCountInTransaction(manager: any, user: User): Promise<void> {
    const now = new Date();
    const currentMonth = now.getMonth();
    const resetMonth = user.monthly_reset_date ? new Date(user.monthly_reset_date).getMonth() : -1;
    const needsReset = currentMonth !== resetMonth;

    if (user.plan === UserPlan.TRIAL) {
      // Atomic increment for trial users within transaction
      await manager
        .createQueryBuilder()
        .update(User)
        .set({
          trial_generations_used: () => 'trial_generations_used + 1',
          total_generations: () => 'total_generations + 1'
        })
        .where('id = :id', { id: user.id })
        .execute();
    } else {
      if (needsReset) {
        // Reset monthly count and update date atomically within transaction
        await manager
          .createQueryBuilder()
          .update(User)
          .set({
            monthly_generation_count: 1,
            monthly_reset_date: now,
            total_generations: () => 'total_generations + 1'
          })
          .where('id = :id', { id: user.id })
          .execute();
      } else {
        // Atomic increment for monthly count within transaction
        await manager
          .createQueryBuilder()
          .update(User)
          .set({
            monthly_generation_count: () => 'monthly_generation_count + 1',
            total_generations: () => 'total_generations + 1'
          })
          .where('id = :id', { id: user.id })
          .execute();
      }
    }
  }

  // REMOVED: Legacy updateUserGenerationCount method - now using transaction-aware version only

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    return this.userRepository.findOne({
      where: { id: userId },
      select: [
        'id', 'plan', 'trial_generations_used', 'monthly_generation_count', 
        'monthly_reset_date', 'is_email_verified', 'trial_ends_at'
      ]
    });
  }

  /**
   * Calculate remaining generations for a user
   */
  calculateRemainingGenerations(user: User): number {
    if (!user) return 0;

    if (user.plan === UserPlan.TRIAL) {
      // Use centralized pricing system (simplified to 5 generations)
      const maxTrialGenerations = getGenerationLimit(user.plan, user.is_email_verified);
      return Math.max(0, maxTrialGenerations - user.trial_generations_used);
    }

    // For paid plans, check monthly limits using centralized pricing
    const monthlyLimit = getGenerationLimit(user.plan);
    return Math.max(0, monthlyLimit - user.monthly_generation_count);
  }
}