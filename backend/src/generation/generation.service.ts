import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { User, UserPlan } from '../entities/user.entity';
import { Generation } from '../entities/generation.entity';
import { OpenAIService } from '../openai/openai.service';
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
  ) {}

  async generateContent(userId: string, generateDto: GenerateDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if user has reached daily limit
    const today = new Date().toISOString().split('T')[0];
    if (user.reset_date.toISOString().split('T')[0] !== today) {
      // Reset daily count if it's a new day
      user.daily_count = 0;
      user.reset_date = new Date();
      await this.userRepository.save(user);
    }

    // Check rate limits based on plan
    const dailyLimits = {
      [UserPlan.FREE]: 3,
      [UserPlan.STARTER]: 50, // 50 per month, roughly 1.6 per day
      [UserPlan.PRO]: null, // unlimited
      [UserPlan.AGENCY]: null // unlimited
    };

    const limit = dailyLimits[user.plan];
    if (limit && user.daily_count >= limit) {
      const upgradeMessage = user.plan === UserPlan.FREE 
        ? 'Daily generation limit reached. Upgrade to Starter for 50 generations/month or Pro for unlimited.'
        : `Monthly generation limit of ${limit} reached. Upgrade to Pro for unlimited generations.`;
      throw new ForbiddenException(upgradeMessage);
    }

    try {
      // Generate content using OpenAI
      const generatedContent = await this.openaiService.generateUGCContent({
        productName: generateDto.productName,
        niche: generateDto.niche,
        targetAudience: generateDto.targetAudience,
      });

      // Add watermark for free and starter users
      let output = generatedContent;
      if (user.plan === UserPlan.FREE) {
        output = {
          ...generatedContent,
          script: generatedContent.script + '\n\n---\nGenerated with AI UGC Ad Generator (Free Plan)',
          hook: generatedContent.hook + ' [Generated with AI UGC Ad Generator]',
        };
      } else if (user.plan === UserPlan.STARTER) {
        output = {
          ...generatedContent,
          script: generatedContent.script + '\n\n---\nGenerated with AI UGC Ad Generator (Starter Plan)',
          hook: generatedContent.hook + ' [AI UGC Ad Generator]',
        };
      }
      // Pro and Agency plans get no watermarks

      // Save generation to database
      const generation = this.generationRepository.create({
        user_id: userId,
        output,
      });
      await this.generationRepository.save(generation);

      // Increment daily count
      user.daily_count += 1;
      await this.userRepository.save(user);

      return {
        id: generation.id,
        output,
        created_at: generation.created_at,
        remaining_generations: limit ? Math.max(0, limit - user.daily_count) : null,
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
        script: generatedContent.script + '\n\n---\n🚀 Generated with AI UGC Ad Generator - Sign up for unlimited generations!',
        hook: generatedContent.hook + ' [Try AI UGC Ad Generator Free]',
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
        upgrade_message: 'Sign up to save this generation and create unlimited ads!',
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
}