import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiService } from '../ai/ai.service';
import { Generation, GenerationStatus, GenerationType } from '../entities/generation.entity';
import { User, UserPlan } from '../entities/user.entity';
import { BUSINESS_CONSTANTS, ERROR_MESSAGES } from '../constants/business-rules';
import { UserPlanModel } from '../domain/models/user-plan.model';
import { GenerationRequestModel, GenerationRequestData } from '../domain/models/generation-request.model';
import { GenerationDomainService } from '../domain/services/generation-domain.service';
import { ValidationService } from '../domain/services/validation.service';

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
    requestData: GenerationRequestData
  ): Promise<Generation> {
    // Get user with current limits
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new ForbiddenException('User not found');
    }

    // Create domain models for business logic
    const userPlan = UserPlanModel.fromUserEntity({
      plan: user.plan,
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

    // Note: Domain context validation already completed above through centralized validation service

    // Generate AI content
    const generatedContent = await this.aiService.generateContent({
      productName: generationRequest.productName,
      niche: generationRequest.niche,
      targetAudience: generationRequest.targetAudience,
      platform: generationRequest.platform
    });

    // Calculate performance metrics using domain service
    const performanceMetrics = this.generationDomainService.calculatePerformanceMetrics(generationRequest);

    // Quality score calculation available via domain service for future analytics features

    // Create and save generation with enhanced metrics
    const generation = this.generationRepository.create({
      user,
      title: generatedContent.title,
      platform: generationRequest.platform.toUpperCase() as GenerationType,
      niche: generationRequest.niche,
      target_audience: generationRequest.targetAudience,
      hook: generatedContent.hook,
      script: generatedContent.script,
      performance_data: performanceMetrics, // Keep original structure for now
      status: GenerationStatus.COMPLETED,
      is_demo: false,
      is_favorite: false
    });

    const savedGeneration = await this.generationRepository.save(generation);

    // Update user generation counts atomically
    await this.updateUserGenerationCount(user);

    return savedGeneration;
  }

  // Staff Engineer Note: Platform access and limit validation now handled by domain models
  // This separation of concerns makes the code more testable and maintainable

  /**
   * Update user generation count with atomic database operation to prevent race conditions
   * 
   * Staff Engineer Note: This is CRITICAL. Race conditions here could allow users to exceed limits
   * or cause billing inconsistencies. We use SQL increment operations for atomicity.
   */
  private async updateUserGenerationCount(user: User): Promise<void> {
    const now = new Date();
    const currentMonth = now.getMonth();
    const resetMonth = user.monthly_reset_date ? new Date(user.monthly_reset_date).getMonth() : -1;
    const needsReset = currentMonth !== resetMonth;

    if (user.plan === UserPlan.TRIAL) {
      // Atomic increment for trial users
      await this.userRepository
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
        // Reset monthly count and update date atomically
        await this.userRepository
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
        // Atomic increment for monthly count
        await this.userRepository
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
}