import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface GenerationRequest {
  productName: string;
  niche: string;
  targetAudience: string;
  platform: 'instagram' | 'tiktok' | 'twitter';
}

export interface GeneratedContent {
  title: string;
  hook: string;
  script: string;
  performance_data: {
    views: number;
    clicks: number;
    conversions: number;
    ctr: number;
    engagement_rate: number;
  };
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY not found. AI generation will use fallback templates.');
      return;
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    this.logger.log('Gemini AI service initialized successfully');
  }

  async generateContent(request: GenerationRequest): Promise<GeneratedContent> {
    if (!this.model) {
      this.logger.warn('Gemini API not available, using fallback generation');
      return this.generateFallbackContent(request);
    }

    try {
      const prompt = this.buildPrompt(request);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseAiResponse(text, request);
    } catch (error) {
      this.logger.error('AI generation failed, using fallback', error instanceof Error ? error.message : 'Unknown error');
      return this.generateFallbackContent(request);
    }
  }

  private buildPrompt(request: GenerationRequest): string {
    const platformSpecs = this.getPlatformSpecs(request.platform);
    
    return `Generate high-converting UGC (User Generated Content) for ${request.platform.toUpperCase()} that feels authentic and viral-worthy.

PRODUCT CONTEXT:
- Product/Service: ${request.productName}
- Niche: ${request.niche}
- Target Audience: ${request.targetAudience}

PLATFORM: ${request.platform.toUpperCase()}
${platformSpecs}

CONTENT REQUIREMENTS:
1. Write a compelling TITLE (max 80 characters)
2. Create an attention-grabbing HOOK (first 1-2 sentences that stop the scroll)
3. Write a complete SCRIPT that feels authentic and personal

TONE & STYLE:
- Sound like a real person sharing their experience
- Use casual, conversational language
- Include specific details and numbers when possible
- Be enthusiastic but not salesy
- Use emotional triggers (curiosity, FOMO, social proof)

STRUCTURE GUIDELINES:
- Start with a hook that creates curiosity or controversy
- Share a personal story or transformation
- Highlight specific benefits/results
- Include a soft call-to-action
- Use platform-appropriate formatting and hashtags

FORMAT YOUR RESPONSE AS JSON:
{
  "title": "Your compelling title here",
  "hook": "Your attention-grabbing hook here",
  "script": "Your complete script here with proper formatting"
}

Generate content that feels authentic, personal, and viral-worthy for ${request.targetAudience} interested in ${request.niche}.`;
  }

  private getPlatformSpecs(platform: string): string {
    const specs = {
      tiktok: `
- Length: 60-90 seconds of content (400-600 words)
- Style: Fast-paced, energetic, trend-focused
- Format: Quick tips, transformations, before/after
- Use relevant hashtags and trending sounds references
- Include hook in first 3 seconds`,
      
      instagram: `
- Length: 30-60 seconds (300-500 words)  
- Style: Visually appealing, lifestyle-focused
- Format: Stories, carousels, reels
- Use Instagram-specific language and hashtags
- Focus on aesthetics and lifestyle benefits`,
      
      twitter: `
- Length: Thread format (280 chars per tweet, 5-8 tweets)
- Style: Conversational, insightful, shareable
- Format: Thread with numbered points or story
- Use relevant hashtags sparingly
- Include engaging questions or polls`,
      
      facebook: `
- Length: 100-300 words
- Style: Community-focused, discussion-starter
- Format: Personal story with engaging visuals
- Encourage comments and shares
- Use Facebook groups and community language`,
      
      linkedin: `
- Length: 150-400 words
- Style: Professional, value-driven, educational
- Format: Industry insights, case studies, lessons learned
- Use professional language and industry hashtags
- Focus on business value and ROI`
    };

    return specs[platform] || specs.tiktok;
  }

  private parseAiResponse(text: string, request: GenerationRequest): GeneratedContent {
    try {
      // Extract JSON from the AI response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        return {
          title: parsed.title || `${request.productName} Changed My Life`,
          hook: parsed.hook || `I was skeptical about ${request.productName} until this happened...`,
          script: parsed.script || this.generateFallbackScript(request),
          performance_data: this.generatePerformanceData()
        };
      }
    } catch (parseError) {
      this.logger.warn('Failed to parse AI response as JSON', parseError instanceof Error ? parseError.message : 'Unknown parse error');
    }

    // If JSON parsing fails, extract content manually
    return {
      title: this.extractTitle(text) || `${request.productName} Success Story`,
      hook: this.extractHook(text) || `You won't believe what ${request.productName} did for me...`,
      script: text || this.generateFallbackScript(request),
      performance_data: this.generatePerformanceData()
    };
  }

  private extractTitle(text: string): string | null {
    const titleMatch = text.match(/(?:title|TITLE)["']?:\s*["']?([^"'\n]+)["']?/i);
    return titleMatch ? titleMatch[1].trim() : null;
  }

  private extractHook(text: string): string | null {
    const hookMatch = text.match(/(?:hook|HOOK)["']?:\s*["']?([^"'\n]+)["']?/i);
    return hookMatch ? hookMatch[1].trim() : null;
  }

  private generateFallbackContent(request: GenerationRequest): GeneratedContent {
    return {
      title: `How ${request.productName} Transformed My ${request.niche} Game`,
      hook: `I was struggling with ${request.niche} until I discovered ${request.productName}. The results were incredible...`,
      script: this.generateFallbackScript(request),
      performance_data: this.generatePerformanceData()
    };
  }

  private generateFallbackScript(request: GenerationRequest): string {
    return `I was struggling with ${request.niche} until I discovered ${request.productName}. The results were incredible...

Here's what happened:
• Week 1: I noticed immediate improvements
• Week 2: Friends started asking what changed  
• Week 3: I realized this was a game-changer
• Week 4: I couldn't imagine going back

${request.productName} completely transformed how I approach ${request.niche}.

Perfect for ${request.targetAudience} who want real results.

If you're struggling like I was, don't wait. This actually works.

What's been your biggest challenge with ${request.niche}? Let me know below! 👇`;
  }

  private generatePerformanceData() {
    // Generate realistic performance metrics with some randomization
    const baseViews = Math.floor(Math.random() * 80000) + 20000; // 20K-100K views
    const baseCTR = parseFloat((Math.random() * 4 + 3).toFixed(1)); // 3-7% CTR
    const conversionRate = parseFloat((Math.random() * 0.05 + 0.02).toFixed(3)); // 2-7% conversion
    
    return {
      views: baseViews,
      clicks: Math.floor(baseViews * (baseCTR / 100)),
      conversions: Math.floor(baseViews * conversionRate),
      ctr: baseCTR,
      engagement_rate: parseFloat((Math.random() * 8 + 5).toFixed(1)) // 5-13% engagement
    };
  }
}