import { Injectable, Logger } from '@nestjs/common';

export interface UserStyle {
  tone: 'professional' | 'casual' | 'friendly' | 'authoritative' | 'conversational';
  vocabulary: 'simple' | 'moderate' | 'advanced' | 'technical';
  sentenceLength: 'short' | 'medium' | 'long';
  industry: string;
  brandPersonality: string[];
  targetAudience: string;
  contentSamples?: string[];
}

export interface PromptContext {
  platform: 'tiktok' | 'x' | 'instagram' | 'youtube';
  niche: string;
  industry: string;
  targetAudience: string;
  userStyle: UserStyle;
  previousPerformance?: {
    views: number;
    ctr: number;
    engagement: number;
  };
}

export interface GeneratedPrompt {
  systemPrompt: string;
  userPrompt: string;
  expectedOutput: string;
  qualityMetrics: {
    uniqueness: number;
    relevance: number;
    platformOptimization: number;
  };
}

@Injectable()
export class PromptService {
  private readonly logger = new Logger(PromptService.name);

  // Platform-specific optimization strategies
  private readonly platformStrategies = {
    tiktok: {
      hookLength: '3-5 seconds',
      contentStyle: 'trendy, viral, attention-grabbing',
      hashtagStrategy: 'trending + niche-specific',
      callToAction: 'swipe, follow, comment',
    },
    x: {
      hookLength: '280 characters max',
      contentStyle: 'concise, engaging, shareable',
      hashtagStrategy: 'trending topics + brand hashtags',
      callToAction: 'retweet, like, reply',
    },
    instagram: {
      hookLength: '10-15 seconds',
      contentStyle: 'visual, aesthetic, lifestyle-focused',
      hashtagStrategy: 'aesthetic + niche + trending',
      callToAction: 'double-tap, save, share',
    },
    youtube: {
      hookLength: '5-10 seconds',
      contentStyle: 'educational, entertaining, value-driven',
      hashtagStrategy: 'educational + trending + niche',
      callToAction: 'subscribe, like, comment',
    },
  };

  // Industry-specific vocabulary and tone adjustments
  private readonly industryAdjustments = {
    'e-commerce': {
      tone: 'friendly',
      vocabulary: 'moderate',
      keyTerms: ['exclusive', 'limited time', 'best seller', 'customer favorite'],
    },
    'saas': {
      tone: 'professional',
      vocabulary: 'technical',
      keyTerms: ['efficiency', 'productivity', 'automation', 'scalability'],
    },
    'health-fitness': {
      tone: 'motivational',
      vocabulary: 'moderate',
      keyTerms: ['transform', 'achieve', 'breakthrough', 'results'],
    },
    'food-beverage': {
      tone: 'casual',
      vocabulary: 'simple',
      keyTerms: ['delicious', 'fresh', 'authentic', 'homemade'],
    },
    'fashion-beauty': {
      tone: 'trendy',
      vocabulary: 'moderate',
      keyTerms: ['stylish', 'trending', 'must-have', 'exclusive'],
    },
  };

  /**
   * Generate context-aware prompt with user style injection
   */
  async generatePrompt(context: PromptContext): Promise<GeneratedPrompt> {
    try {
      const platformStrategy = this.platformStrategies[context.platform];
      const industryAdjustment = this.industryAdjustments[context.industry] || this.industryAdjustments['e-commerce'];

      // Build system prompt with user style and platform optimization
      const systemPrompt = this.buildSystemPrompt(context, platformStrategy, industryAdjustment);
      
      // Build user prompt with specific requirements
      const userPrompt = this.buildUserPrompt(context, platformStrategy);
      
      // Define expected output format
      const expectedOutput = this.buildExpectedOutput(context.platform);
      
      // Calculate quality metrics
      const qualityMetrics = this.calculateQualityMetrics(context, platformStrategy);

      return {
        systemPrompt,
        userPrompt,
        expectedOutput,
        qualityMetrics,
      };
    } catch (error) {
      this.logger.error('Failed to generate prompt:', error);
      throw new Error('Failed to generate optimized prompt');
    }
  }

  /**
   * Build system prompt with user style and platform optimization
   */
  private buildSystemPrompt(
    context: PromptContext, 
    platformStrategy: any, 
    industryAdjustment: any
  ): string {
    const { userStyle } = context;
    
    return `You are an expert ${context.platform} content creator specializing in ${context.industry} content.

STYLE REQUIREMENTS:
- Tone: ${userStyle.tone} and ${industryAdjustment.tone}
- Vocabulary: ${userStyle.vocabulary} level, using industry terms like: ${industryAdjustment.keyTerms.join(', ')}
- Sentence length: ${userStyle.sentenceLength}
- Brand personality: ${userStyle.brandPersonality.join(', ')}
- Target audience: ${userStyle.targetAudience}

PLATFORM OPTIMIZATION (${context.platform.toUpperCase()}):
- Hook length: ${platformStrategy.hookLength}
- Content style: ${platformStrategy.contentStyle}
- Hashtag strategy: ${platformStrategy.hashtagStrategy}
- Call to action: ${platformStrategy.callToAction}

CONTENT REQUIREMENTS:
- Create viral, engaging content that performs well on ${context.platform}
- Use trending elements while maintaining brand authenticity
- Include platform-specific best practices
- Optimize for maximum engagement and shares
- Ensure content is unique and not generic

OUTPUT FORMAT:
- Hook (attention-grabbing opening)
- Script (main content with clear structure)
- Visual suggestions (specific visual elements)
- Hashtags (trending + niche-specific)
- Call to action (platform-optimized)`;
  }

  /**
   * Build user prompt with specific requirements
   */
  private buildUserPrompt(context: PromptContext, platformStrategy: any): string {
    return `Create a viral ${context.platform} ad for ${context.niche} targeting ${context.targetAudience}.

SPECIFIC REQUIREMENTS:
- Niche: ${context.niche}
- Target audience: ${context.targetAudience}
- Platform: ${context.platform}
- Hook style: ${platformStrategy.hookLength} attention-grabbing opening
- Content focus: ${platformStrategy.contentStyle}
- Engagement goal: High views, shares, and ${platformStrategy.callToAction}

INCLUDE:
1. Hook that captures attention in first ${platformStrategy.hookLength}
2. Engaging script that maintains interest
3. Visual suggestions that enhance the message
4. Optimized hashtags for ${context.platform}
5. Strong call to action for ${platformStrategy.callToAction}

Make it unique, relevant, and optimized for ${context.platform} success.`;
  }

  /**
   * Build expected output format
   */
  private buildExpectedOutput(platform: string): string {
    const formats = {
      tiktok: 'Hook (3-5s) | Script (15-60s) | Visuals | Hashtags | CTA',
      x: 'Hook (280 chars) | Thread structure | Visuals | Hashtags | CTA',
      instagram: 'Hook (10-15s) | Script (30s-2min) | Visuals | Hashtags | CTA',
      youtube: 'Hook (5-10s) | Script (2-5min) | Visuals | Hashtags | CTA',
    };
    
    return formats[platform] || formats.tiktok;
  }

  /**
   * Calculate quality metrics for the prompt
   */
  private calculateQualityMetrics(context: PromptContext, platformStrategy: any): any {
    let uniqueness = 80; // Base uniqueness score
    let relevance = 85; // Base relevance score
    let platformOptimization = 90; // Base platform optimization score

    // Adjust uniqueness based on user style complexity
    if (context.userStyle.contentSamples && context.userStyle.contentSamples.length > 0) {
      uniqueness += 10; // More samples = better uniqueness
    }

    // Adjust relevance based on industry specificity
    if (this.industryAdjustments[context.industry]) {
      relevance += 10; // Industry-specific optimization
    }

    // Adjust platform optimization based on platform strategy
    if (platformStrategy && platformStrategy.hookLength) {
      platformOptimization += 5; // Platform-specific requirements
    }

    return {
      uniqueness: Math.min(100, uniqueness),
      relevance: Math.min(100, relevance),
      platformOptimization: Math.min(100, platformOptimization),
    };
  }

  /**
   * Extract user style from content samples
   */
  async extractUserStyle(contentSamples: string[]): Promise<UserStyle> {
    try {
      // This would integrate with AI to analyze content samples
      // For now, return a default style that can be customized
      return {
        tone: 'conversational',
        vocabulary: 'moderate',
        sentenceLength: 'medium',
        industry: 'general',
        brandPersonality: ['authentic', 'helpful', 'engaging'],
        targetAudience: 'general audience',
        contentSamples,
      };
    } catch (error) {
      this.logger.error('Failed to extract user style:', error);
      throw new Error('Failed to extract user style from content samples');
    }
  }

  /**
   * Validate prompt quality
   */
  async validatePromptQuality(prompt: string, context: PromptContext): Promise<boolean> {
    try {
      // Basic validation checks
      const hasHook = prompt.toLowerCase().includes('hook');
      const hasScript = prompt.toLowerCase().includes('script');
      const hasVisuals = prompt.toLowerCase().includes('visual');
      const hasHashtags = prompt.toLowerCase().includes('hashtag');
      const hasCTA = prompt.toLowerCase().includes('call to action') || prompt.toLowerCase().includes('cta');

      return hasHook && hasScript && hasVisuals && hasHashtags && hasCTA;
    } catch (error) {
      this.logger.error('Failed to validate prompt quality:', error);
      return false;
    }
  }

  /**
   * Get platform-specific optimization tips
   */
  getPlatformOptimizationTips(platform: string): any {
    return this.platformStrategies[platform] || this.platformStrategies.tiktok;
  }

  /**
   * Get industry-specific adjustments
   */
  getIndustryAdjustments(industry: string): any {
    return this.industryAdjustments[industry] || this.industryAdjustments['e-commerce'];
  }
}
