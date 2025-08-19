import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface UserStyleProfile {
  brandPersonality: {
    primary: string;
    secondary: string[];
    brandValues: string[];
    brandMission: string;
    uniqueSellingPoints: string[];
  };
  audienceDemographics: {
    ageRange: string;
    interests: string[];
    painPoints: string[];
    aspirations: string[];
  };
  contentPreferences: {
    preferredLength: string;
    formatPreferences: string[];
    storytellingApproach: string;
  };
  toneAndVoice: {
    formality: string;
    enthusiasm: string;
    humor: string;
    empathy: string;
    authority: string;
    friendliness: string;
  };
  vocabularyStyle: {
    complexity: string;
    industryTerms: boolean;
    slangUsage: string;
  };
}

export interface ContentGenerationRequest {
  niche: string;
  platform: 'tiktok' | 'instagram' | 'x' | 'youtube';
  contentType: string;
  targetAudience: string;
  userStyleProfile: UserStyleProfile;
  additionalContext?: string;
}

export interface GeneratedContent {
  hook: string;
  script: string;
  visualDescription: string;
  callToAction: string;
  platformOptimization: string;
  estimatedPerformance: {
    views: number;
    engagement: number;
    viralScore: number;
  };
  styleConfidence: number;
}

@Injectable()
export class AdvancedPromptService {
  private readonly openaiApiKey: string;
  private readonly modelName: string;

  constructor(private configService: ConfigService) {
    this.openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.modelName = this.configService.get<string>('OPENAI_MODEL_NAME', 'gpt-4o-mini');
  }

  /**
   * Generate personalized content using advanced prompt engineering
   * This is the core competitive advantage of Hookly
   */
  async generatePersonalizedContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
    try {
      const systemPrompt = this.buildSystemPrompt(request.userStyleProfile);
      const userPrompt = this.buildUserPrompt(request);
      
      // TODO: Integrate with OpenAI API
      // For now, return a structured response that demonstrates the system
      return this.generateMockResponse(request);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to generate personalized content: ${errorMessage}`);
    }
  }

  /**
   * Build system prompt based on user style profile
   * This creates the AI's personality and behavior
   */
  private buildSystemPrompt(userStyle: UserStyleProfile): string {
    const brandPersonality = this.formatBrandPersonality(userStyle.brandPersonality);
    const toneAndVoice = this.formatToneAndVoice(userStyle.toneAndVoice);
    const audienceUnderstanding = this.formatAudienceUnderstanding(userStyle.audienceDemographics);
    const contentStyle = this.formatContentStyle(userStyle.contentPreferences, userStyle.vocabularyStyle);

    return `You are Hookly, an AI content generation expert specializing in viral UGC content creation.

${brandPersonality}

${toneAndVoice}

${audienceUnderstanding}

${contentStyle}

Your mission is to create high-converting, platform-optimized content that:
1. Captures attention within the first 3 seconds
2. Maintains engagement throughout the entire piece
3. Drives action through compelling calls-to-action
4. Reflects the user's unique brand voice and style
5. Optimizes for the specific platform's algorithm and user behavior

Always consider:
- Platform-specific best practices and trends
- Current viral content patterns
- User engagement psychology
- Brand consistency and authenticity
- Performance optimization techniques`;
  }

  /**
   * Build user prompt for specific content generation request
   */
  private buildUserPrompt(request: ContentGenerationRequest): string {
    const platformOptimization = this.getPlatformOptimization(request.platform);
    const nicheContext = this.getNicheContext(request.niche);
    
    return `Create viral UGC content for:

NICHE: ${request.niche}
${nicheContext}

PLATFORM: ${request.platform.toUpperCase()}
${platformOptimization}

CONTENT TYPE: ${request.contentType}
TARGET AUDIENCE: ${request.targetAudience}

${request.additionalContext ? `ADDITIONAL CONTEXT: ${request.additionalContext}` : ''}

Please provide:
1. A compelling hook (first 3 seconds)
2. A complete script optimized for the platform
3. Visual description and styling recommendations
4. A strong call-to-action
5. Platform-specific optimization tips
6. Estimated performance metrics

Focus on creating content that will perform exceptionally well on ${request.platform} while maintaining the user's unique brand voice.`;
  }

  /**
   * Format brand personality for prompt injection
   */
  private formatBrandPersonality(brand: any): string {
    return `BRAND PERSONALITY:
Primary Trait: ${brand.primary}
Secondary Traits: ${brand.secondary.join(', ')}
Brand Values: ${brand.brandValues.join(', ')}
Mission: ${brand.brandMission}
Unique Selling Points: ${brand.uniqueSellingPoints.join(', ')}`;
  }

  /**
   * Format tone and voice for prompt injection
   */
  private formatToneAndVoice(tone: any): string {
    return `COMMUNICATION STYLE:
Formality: ${tone.formality}
Enthusiasm: ${tone.enthusiasm}
Humor: ${tone.humor}
Empathy: ${tone.empathy}
Authority: ${tone.authority}
Friendliness: ${tone.friendliness}`;
  }

  /**
   * Format audience understanding for prompt injection
   */
  private formatAudienceUnderstanding(audience: any): string {
    return `TARGET AUDIENCE INSIGHTS:
Age Range: ${audience.ageRange}
Interests: ${audience.interests.join(', ')}
Pain Points: ${audience.painPoints.join(', ')}
Aspirations: ${audience.aspirations.join(', ')}`;
  }

  /**
   * Format content style preferences for prompt injection
   */
  private formatContentStyle(preferences: any, vocabulary: any): string {
    return `CONTENT STYLE PREFERENCES:
Preferred Length: ${preferences.preferredLength}
Format Preferences: ${preferences.formatPreferences.join(', ')}
Storytelling Approach: ${preferences.storytellingApproach}
Vocabulary Complexity: ${vocabulary.complexity}
Industry Terms: ${vocabulary.industryTerms ? 'Use appropriate industry terminology' : 'Keep language accessible'}
Slang Usage: ${vocabulary.slangUsage}`;
  }

  /**
   * Get platform-specific optimization guidance
   */
  private getPlatformOptimization(platform: string): string {
    const optimizations = {
      tiktok: `- Hook must grab attention in first 3 seconds
- Use trending sounds and hashtags
- Vertical video format (9:16)
- Encourage comments and shares
- Use captions for accessibility`,
      instagram: `- High-quality visuals are crucial
- Use relevant hashtags (5-15 optimal)
- Encourage saves and shares
- Stories format for engagement
- Reels for discoverability`,
      x: `- Concise, impactful messaging
- Use trending hashtags strategically
- Encourage retweets and replies
- Visual content performs better
- Thread format for longer content`,
      youtube: `- Longer-form content (1-3 minutes)
- Strong intro hook
- Use cards and end screens
- Encourage subscriptions
- SEO-optimized titles and descriptions`
    };

    return optimizations[platform] || optimizations.tiktok;
  }

  /**
   * Get niche-specific context and trends
   */
  private getNicheContext(niche: string): string {
    const nicheContexts = {
      'fitness': `- Focus on transformation and results
- Use motivational language
- Include before/after potential
- Emphasize community and support
- Address common fitness pain points`,
      'business': `- Focus on ROI and growth
- Use professional but accessible language
- Include actionable tips
- Emphasize scalability and efficiency
- Address common business challenges`,
      'lifestyle': `- Focus on daily improvements
- Use relatable language
- Include practical tips
- Emphasize work-life balance
- Address common lifestyle struggles`,
      'technology': `- Focus on innovation and efficiency
- Use current tech trends
- Include practical applications
- Emphasize problem-solving
- Address common tech frustrations`
    };

    return nicheContexts[niche.toLowerCase()] || `- Focus on providing value to the target audience
- Use engaging storytelling
- Include practical takeaways
- Emphasize unique benefits
- Address common challenges in this niche`;
  }

  /**
   * Generate mock response for demonstration
   * TODO: Replace with actual OpenAI API integration
   */
  private generateMockResponse(request: ContentGenerationRequest): GeneratedContent {
    const platform = request.platform;
    const niche = request.niche;
    
    // Mock content generation based on platform and niche
    const mockContent = {
      tiktok: {
        hook: `"Stop doing ${niche} the hard way! This 30-second trick changed everything for me..."`,
        script: `Hey ${niche} creators! 👋 I've been in your shoes, struggling with the same old methods that just don't work anymore. But guess what? I discovered this game-changing approach that literally saved me hours every day. Here's what I learned: [Key insight]. The secret? [Simple technique]. I know it sounds too good to be true, but trust me, this is the ${niche} hack you've been waiting for. Try it for yourself and let me know in the comments how it works for you!`,
        visualDescription: `Start with a surprised expression, show the problem, demonstrate the solution, end with confident smile. Use bright lighting, quick cuts, and trending background music.`,
        callToAction: `Drop a ❤️ if this helped and follow for more ${niche} tips!`,
        platformOptimization: `Use trending sounds, add captions, encourage comments, use relevant hashtags like #${niche}hacks #${niche}tips #viral`,
        estimatedPerformance: { views: 50000, engagement: 8500, viralScore: 78 }
      },
      instagram: {
        hook: `"The ${niche} secret nobody talks about..."`,
        script: `Want to know the ${niche} strategy that top performers use but never share? 🤫 I've been studying successful ${niche} creators for months, and I finally cracked the code. Here's what I discovered: [Key insight]. The game-changer? [Technique]. I've tested this myself, and the results are incredible. My ${niche} game has never been stronger. Want to know the best part? It's actually super simple once you understand it.`,
        visualDescription: `Clean, aesthetic shots with consistent color palette. Show the journey from struggle to success. Use high-quality images and smooth transitions.`,
        callToAction: `Save this post and share with someone who needs to see it!`,
        platformOptimization: `Use 5-15 relevant hashtags, encourage saves, create carousel posts, use Stories for behind-the-scenes`,
        estimatedPerformance: { views: 25000, engagement: 4200, viralScore: 72 }
      },
      x: {
        hook: `"Just discovered the ${niche} hack that's going viral..."`,
        script: `🚨 ${niche} creators, listen up! I found something that's literally changing the game. Here's the deal: [Key insight]. The hack? [Technique]. I've been testing this for weeks, and the results are insane. My ${niche} performance has improved by [percentage]. The best part? It's so simple, you'll wonder why you didn't think of it before.`,
        visualDescription: `Use eye-catching visuals, infographics, or short video clips. Keep it clean and professional.`,
        callToAction: `Retweet if you found this helpful!`,
        platformOptimization: `Use trending hashtags, encourage retweets, keep it concise, use visual content`,
        estimatedPerformance: { views: 15000, engagement: 2800, viralScore: 68 }
      },
      youtube: {
        hook: `"The ${niche} Method That's Taking Over Social Media"`,
        script: `What's up ${niche} community! 👋 Today I'm sharing the method that's completely transformed my approach to ${niche}. I've been getting so many DMs asking how I've been so successful lately, so I decided to break it down for you. Here's what we're covering: [Outline of key points]. This isn't just theory - I've been using this method for months, and the results speak for themselves.`,
        visualDescription: `Professional setup with good lighting, use graphics and examples, include B-roll footage, maintain consistent branding.`,
        callToAction: `Hit that subscribe button and turn on notifications so you never miss these valuable ${niche} tips!`,
        platformOptimization: `Strong intro hook, use cards and end screens, encourage subscriptions, SEO-optimized title`,
        estimatedPerformance: { views: 35000, engagement: 6200, viralScore: 75 }
      }
    };

    const content = mockContent[platform] || mockContent.tiktok;
    
    return {
      ...content,
      styleConfidence: this.calculateStyleConfidence(request.userStyleProfile)
    };
  }

  /**
   * Calculate confidence score based on profile completeness
   */
  private calculateStyleConfidence(profile: UserStyleProfile): number {
    let score = 0;
    const maxScore = 100;

    // Profile completeness (40 points)
    const profileFields = [
      profile.brandPersonality.brandMission,
      profile.brandPersonality.brandValues,
      profile.audienceDemographics.interests,
      profile.audienceDemographics.painPoints
    ];
    
    const completedFields = profileFields.filter(field => 
      field && (typeof field === 'string' ? field.length > 0 : field.length > 0)
    ).length;
    
    score += (completedFields / profileFields.length) * 40;

    // Tone and voice completeness (30 points)
    const toneFields = Object.values(profile.toneAndVoice).filter(v => v && v !== '');
    score += (toneFields.length / 6) * 30;

    // Content preferences (20 points)
    const contentFields = Object.values(profile.contentPreferences).filter(v => v && v !== '');
    score += (contentFields.length / 5) * 20;

    // Vocabulary style (10 points)
    const vocabFields = Object.values(profile.vocabularyStyle).filter(v => v !== undefined);
    score += (vocabFields.length / 3) * 10;

    return Math.min(Math.round(score), maxScore);
  }

  /**
   * Validate user style profile completeness
   */
  validateProfileCompleteness(profile: UserStyleProfile): {
    isComplete: boolean;
    missingFields: string[];
    completenessScore: number;
  } {
    const requiredFields = [
      { path: 'brandPersonality.brandMission', value: profile.brandPersonality.brandMission },
      { path: 'brandPersonality.brandValues', value: profile.brandPersonality.brandValues },
      { path: 'audienceDemographics.interests', value: profile.audienceDemographics.interests },
      { path: 'audienceDemographics.painPoints', value: profile.audienceDemographics.painPoints },
      { path: 'toneAndVoice.formality', value: profile.toneAndVoice.formality },
      { path: 'toneAndVoice.enthusiasm', value: profile.toneAndVoice.enthusiasm }
    ];

    const missingFields = requiredFields
      .filter(field => !field.value || (Array.isArray(field.value) && field.value.length === 0))
      .map(field => field.path);

    const completenessScore = ((requiredFields.length - missingFields.length) / requiredFields.length) * 100;

    return {
      isComplete: missingFields.length === 0,
      missingFields,
      completenessScore: Math.round(completenessScore)
    };
  }

  /**
   * Get content generation recommendations based on profile
   */
  getContentRecommendations(profile: UserStyleProfile, platform: string): {
    recommendedFormats: string[];
    optimalLength: string;
    toneAdjustments: string[];
    platformTips: string[];
  } {
    const recommendations = {
      recommendedFormats: this.getRecommendedFormats(profile, platform),
      optimalLength: this.getOptimalLength(profile, platform),
      toneAdjustments: this.getToneAdjustments(profile, platform),
      platformTips: this.getPlatformTips(platform)
    };

    return recommendations;
  }

  private getRecommendedFormats(profile: UserStyleProfile, platform: string): string[] {
    const baseFormats = profile.contentPreferences.formatPreferences;
    
    // Platform-specific adjustments
    if (platform === 'tiktok') {
      return [...baseFormats, 'trending', 'challenge', 'duet'];
    } else if (platform === 'instagram') {
      return [...baseFormats, 'story', 'reel', 'carousel'];
    } else if (platform === 'x') {
      return [...baseFormats, 'thread', 'quote', 'poll'];
    } else if (platform === 'youtube') {
      return [...baseFormats, 'tutorial', 'review', 'vlog'];
    }

    return baseFormats;
  }

  private getOptimalLength(profile: UserStyleProfile, platform: string): string {
    const baseLength = profile.contentPreferences.preferredLength;
    
    // Platform-specific adjustments
    if (platform === 'tiktok') {
      return 'short'; // 15-30 seconds
    } else if (platform === 'youtube') {
      return 'long'; // 1-3 minutes
    }

    return baseLength;
  }

  private getToneAdjustments(profile: UserStyleProfile, platform: string): string[] {
    const adjustments = [];
    const tone = profile.toneAndVoice;

    if (platform === 'tiktok') {
      if (tone.enthusiasm !== 'high' && tone.enthusiasm !== 'extreme') {
        adjustments.push('Increase enthusiasm for TikTok engagement');
      }
      if (tone.humor === 'none') {
        adjustments.push('Consider adding playful humor for TikTok');
      }
    } else if (platform === 'x') {
      if (tone.formality === 'very_casual') {
        adjustments.push('Slightly increase formality for X');
      }
    } else if (platform === 'youtube') {
      if (tone.authority !== 'high' && tone.authority !== 'expert') {
        adjustments.push('Increase authority for YouTube credibility');
      }
    }

    return adjustments;
  }

  private getPlatformTips(platform: string): string[] {
    const tips = {
      tiktok: [
        'Use trending sounds and hashtags',
        'Hook viewers in first 3 seconds',
        'Encourage comments and shares',
        'Use vertical 9:16 format'
      ],
      instagram: [
        'Focus on high-quality visuals',
        'Use 5-15 relevant hashtags',
        'Encourage saves and shares',
        'Create engaging Stories'
      ],
      x: [
        'Keep content concise and impactful',
        'Use trending hashtags strategically',
        'Encourage retweets and replies',
        'Include visual content when possible'
      ],
      youtube: [
        'Create strong intro hooks',
        'Use cards and end screens',
        'Encourage subscriptions',
        'Optimize titles and descriptions for SEO'
      ]
    };

    return tips[platform] || tips.tiktok;
  }
}
