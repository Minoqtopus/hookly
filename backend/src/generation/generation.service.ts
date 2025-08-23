import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiService } from '../ai/ai.service';
import { Generation, GenerationStatus, GenerationType } from '../entities/generation.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class GenerationService {
  constructor(
    @InjectRepository(Generation)
    private generationRepository: Repository<Generation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private aiService: AiService,
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
      { type: GenerationType.TWITTER, name: 'twitter' as const }
    ];

    // Generate AI content for each platform
    const demoGenerations = await Promise.all(
      platforms.map(async (platform, index) => {
        try {
          const generatedContent = await this.aiService.generateContent({
            productName,
            niche,
            targetAudience,
            platform: platform.name
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
}