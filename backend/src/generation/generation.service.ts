import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { User, UserPlan } from '../entities/user.entity';
import { Generation } from '../entities/generation.entity';
import { OpenAIService } from '../openai/openai.service';
import { GenerateDto } from './dto/generate.dto';
import { GenerateVariationsDto } from './dto/generate-variations.dto';
import { GuestGenerateDto } from './dto/guest-generate.dto';

@Injectable()
export class GenerationService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Generation)
    private generationRepository: Repository<Generation>,
    private openaiService: OpenAIService,
  ) {}

  async generateContent(userId: string, generateDto: GenerateDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if user has reached monthly limit or trial limit
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const resetMonth = user.reset_date.getMonth();
    const resetYear = user.reset_date.getFullYear();
    
    if (currentMonth !== resetMonth || currentYear !== resetYear) {
      // Reset monthly count if it's a new month
      user.monthly_count = 0;
      user.reset_date = new Date();
      await this.userRepository.save(user);
    }

    // Check trial status and limits
    if (user.plan === UserPlan.TRIAL) {
      // Start trial if not started
      if (!user.trial_started_at) {
        user.trial_started_at = now;
        user.trial_ends_at = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await this.userRepository.save(user);
      }
      
      // Check if trial has expired
      if (user.trial_ends_at && now > user.trial_ends_at) {
        throw new ForbiddenException('Free trial has expired. Please upgrade to continue creating ads.');
      }
      
      // Check trial generation limit (3 generations)
      if (user.trial_generations_used >= 3) {
        throw new ForbiddenException('Trial generation limit reached. Upgrade to Creator plan for 150 generations/month.');
      }
    }

    // Check monthly limits for paid plans
    const monthlyLimits = {
      [UserPlan.TRIAL]: 3, // handled above but keeping for consistency
      [UserPlan.CREATOR]: 150,
      [UserPlan.AGENCY]: 500
    };

    const limit = monthlyLimits[user.plan];
    const currentCount = user.plan === UserPlan.TRIAL ? user.trial_generations_used : user.monthly_count;
    
    if (limit && currentCount >= limit) {
      const upgradeMessage = user.plan === UserPlan.CREATOR 
        ? 'Monthly generation limit of 150 reached. Upgrade to Agency for 500 generations/month.'
        : 'Generation limit reached. Please upgrade your plan.';
      throw new ForbiddenException(upgradeMessage);
    }

    try {
      // Generate content using OpenAI
      const generatedContent = await this.openaiService.generateUGCContent({
        productName: generateDto.productName,
        niche: generateDto.niche,
        targetAudience: generateDto.targetAudience,
      });

      // Add watermark for trial users
      let output = generatedContent;
      if (user.plan === UserPlan.TRIAL) {
        output = {
          ...generatedContent,
          script: generatedContent.script + '\n\n---\nGenerated with Hookly (Trial)',
          hook: generatedContent.hook + ' [Generated with Hookly Trial]',
        };
      }
      // Creator and Agency plans get no watermarks

      // Save generation to database
      const generation = this.generationRepository.create({
        user_id: userId,
        output,
      });
      await this.generationRepository.save(generation);

      // Increment appropriate counter
      if (user.plan === UserPlan.TRIAL) {
        user.trial_generations_used += 1;
      } else {
        user.monthly_count += 1;
      }
      await this.userRepository.save(user);

      const remainingGenerations = user.plan === UserPlan.TRIAL 
        ? Math.max(0, 3 - user.trial_generations_used)
        : limit ? Math.max(0, limit - user.monthly_count) : null;

      return {
        id: generation.id,
        output,
        created_at: generation.created_at,
        remaining_generations: remainingGenerations,
        trial_days_left: user.trial_ends_at && user.plan === UserPlan.TRIAL 
          ? Math.max(0, Math.ceil((user.trial_ends_at.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
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
        output,
        is_guest_generation: true,
      });

      await this.generationRepository.save(generation);

      return {
        id: generation.id,
        output,
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
        output: gen.output,
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

    // Check monthly limits (variations count as 3 generations)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const resetMonth = user.reset_date.getMonth();
    const resetYear = user.reset_date.getFullYear();
    
    if (currentMonth !== resetMonth || currentYear !== resetYear) {
      user.monthly_count = 0;
      user.reset_date = new Date();
      await this.userRepository.save(user);
    }

    const monthlyLimits = {
      [UserPlan.TRIAL]: 3,
      [UserPlan.CREATOR]: 150,
      [UserPlan.AGENCY]: 500
    };

    const limit = monthlyLimits[user.plan];
    const variationsCount = 3; // Always generate 3 variations
    const currentCount = user.plan === UserPlan.TRIAL ? user.trial_generations_used : user.monthly_count;
    
    if (limit && (currentCount + variationsCount) > limit) {
      throw new ForbiddenException(`Not enough generations remaining. Need ${variationsCount} generations for variations.`);
    }

    try {
      // Generate 3 variations with single API call
      const variationsData = await this.openaiService.generateUGCVariations({
        productName: generateVariationsDto.productName,
        niche: generateVariationsDto.niche,
        targetAudience: generateVariationsDto.targetAudience,
      });

      // Save each variation as a separate generation
      const savedGenerations = [];
      for (let i = 0; i < variationsData.variations.length; i++) {
        const variation = variationsData.variations[i];
        const performance = variationsData.performance[i];

        // Add performance data to the variation
        const variationWithPerformance = {
          ...variation,
          performance,
          variationNumber: i + 1,
          variationApproach: i === 0 ? 'Problem/Solution' : i === 1 ? 'Transformation/Results' : 'Social Proof/Trending'
        };

        const generation = this.generationRepository.create({
          user_id: userId,
          output: variationWithPerformance,
          product_name: generateVariationsDto.productName,
          niche: generateVariationsDto.niche,
          target_audience: generateVariationsDto.targetAudience,
        });

        const saved = await this.generationRepository.save(generation);
        savedGenerations.push({
          id: saved.id,
          output: variationWithPerformance,
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
        remaining_generations: limit ? Math.max(0, limit - updatedCurrentCount) : null,
        message: `Generated ${variationsCount} variations with different approaches for maximum testing potential.`
      };
    } catch (error) {
      console.error('Variations generation error:', error);
      throw new BadRequestException('Failed to generate variations. Please try again.');
    }
  }
}