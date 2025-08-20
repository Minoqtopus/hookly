import { AnalyticsService, EventType } from './analytics';

export interface ViralGrowthMetrics {
  shares: number;
  impressions: number;
  signups: number;
  conversionRate: number;
  viralCoefficient: number;
}

export interface ShareableContent {
  id: string;
  title: string;
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
  platforms: string[];
  createdAt: Date;
}

export class ViralGrowthService {
  private static readonly STORAGE_KEY = 'hookly_viral_growth_data';
  private static readonly SHARE_URL_BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://hookly.ai';

  /**
   * Track viral content creation
   */
  static trackViralContentCreation(content: ShareableContent): void {
    try {
      // Store content for viral tracking
      this.storeViralContent(content);
      
      // Track analytics event
      AnalyticsService.trackEvent(EventType.VIRAL_WATERMARK_ADDED, {
        eventData: {
          content_id: content.id,
          platforms: content.platforms,
          estimated_performance: content.estimatedPerformance.viralScore,
          content_type: 'ugc_generation'
        }
      });
    } catch (error) {
      console.error('Failed to track viral content creation:', error);
    }
  }

  /**
   * Track social sharing completion
   */
  static trackSocialShare(platform: string, contentId: string, shareUrl: string): void {
    try {
      // Track analytics event
      AnalyticsService.trackEvent(EventType.SOCIAL_SHARE_COMPLETED, {
        eventData: {
          platform,
          content_id: contentId,
          share_url: shareUrl,
          timestamp: new Date().toISOString()
        }
      });

      // Update local viral growth metrics
      this.updateViralMetrics(contentId, 'shares');
    } catch (error) {
      console.error('Failed to track social share:', error);
    }
  }

  /**
   * Track viral growth signup conversion
   */
  static trackViralGrowthSignup(contentId: string, source: string): void {
    try {
      // Track analytics event
      AnalyticsService.trackEvent(EventType.VIRAL_GROWTH_SIGNUP, {
        eventData: {
          content_id: contentId,
          source,
          timestamp: new Date().toISOString(),
          viral_path: true
        }
      });

      // Update local viral growth metrics
      this.updateViralMetrics(contentId, 'signups');
    } catch (error) {
      console.error('Failed to track viral growth signup:', error);
    }
  }

  /**
   * Generate shareable content URL
   */
  static generateShareableUrl(content: ShareableContent): string {
    const shareData = {
      id: content.id,
      title: content.title,
      hook: content.hook.substring(0, 100),
      platforms: content.platforms,
      performance: content.estimatedPerformance.viralScore,
      timestamp: content.createdAt.getTime()
    };

    const encodedData = btoa(JSON.stringify(shareData));
    return `${this.SHARE_URL_BASE}/demo?share=${encodeURIComponent(encodedData)}`;
  }

  /**
   * Create viral growth loops
   */
  static createViralGrowthLoop(content: ShareableContent): {
    shareText: string;
    shareUrl: string;
    hashtags: string[];
    callToAction: string;
  } {
    const shareUrl = this.generateShareableUrl(content);
    
    // Platform-specific share text
    const shareText = `🚀 Just created viral content with Hookly!\n\n${content.hook.substring(0, 100)}...\n\nEstimated: ${content.estimatedPerformance.views.toLocaleString()} views\nViral Score: ${content.estimatedPerformance.viralScore}/100\n\nCreate your own at hookly.ai`;
    
    // Viral hashtags
    const hashtags = [
      '#viralcontent',
      '#ugccreator',
      '#hookly',
      '#aigenerated',
      '#contentcreator',
      '#viralmarketing',
      '#socialmediamarketing',
      '#contentmarketing'
    ];

    const callToAction = `Ready to create viral content? Try Hookly for free at hookly.ai 🎯`;

    return {
      shareText,
      shareUrl,
      hashtags,
      callToAction
    };
  }

  /**
   * Get viral growth analytics
   */
  static getViralGrowthAnalytics(): ViralGrowthMetrics {
    try {
      const storedData = localStorage.getItem(this.STORAGE_KEY);
      if (!storedData) {
        return {
          shares: 0,
          impressions: 0,
          signups: 0,
          conversionRate: 0,
          viralCoefficient: 0
        };
      }

      const data = JSON.parse(storedData);
      const totalShares = data.shares || 0;
      const totalSignups = data.signups || 0;
      const totalImpressions = data.impressions || 0;

      return {
        shares: totalShares,
        impressions: totalImpressions,
        signups: totalSignups,
        conversionRate: totalImpressions > 0 ? (totalSignups / totalImpressions) * 100 : 0,
        viralCoefficient: totalShares > 0 ? totalSignups / totalShares : 0
      };
    } catch (error) {
      console.error('Failed to get viral growth analytics:', error);
      return {
        shares: 0,
        impressions: 0,
        signups: 0,
        conversionRate: 0,
        viralCoefficient: 0
      };
    }
  }

  /**
   * Store viral content for tracking
   */
  private static storeViralContent(content: ShareableContent): void {
    try {
      const storedData = localStorage.getItem(this.STORAGE_KEY);
      const data = storedData ? JSON.parse(storedData) : { contents: [], shares: 0, signups: 0, impressions: 0 };
      
      // Add new content
      data.contents.push({
        ...content,
        createdAt: content.createdAt.toISOString()
      });

      // Keep only last 50 contents
      if (data.contents.length > 50) {
        data.contents = data.contents.slice(-50);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to store viral content:', error);
    }
  }

  /**
   * Update viral growth metrics
   */
  private static updateViralMetrics(contentId: string, metricType: 'shares' | 'signups' | 'impressions'): void {
    try {
      const storedData = localStorage.getItem(this.STORAGE_KEY);
      if (!storedData) return;

      const data = JSON.parse(storedData);
      
      // Update metric
      if (metricType === 'shares') {
        data.shares = (data.shares || 0) + 1;
      } else if (metricType === 'signups') {
        data.signups = (data.signups || 0) + 1;
      } else if (metricType === 'impressions') {
        data.impressions = (data.impressions || 0) + 1;
      }

      // Update content-specific metrics
      const content = data.contents?.find((c: any) => c.id === contentId);
      if (content) {
        content[metricType] = (content[metricType] || 0) + 1;
        content.lastUpdated = new Date().toISOString();
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to update viral metrics:', error);
    }
  }

  /**
   * Get viral growth recommendations
   */
  static getViralGrowthRecommendations(): {
    bestTimeToShare: string;
    recommendedPlatforms: string[];
    contentOptimizationTips: string[];
    hashtagStrategy: string[];
  } {
    return {
      bestTimeToShare: 'Tuesday-Thursday, 9 AM - 2 PM EST',
      recommendedPlatforms: ['TikTok', 'Instagram Reels', 'X (Twitter)'],
      contentOptimizationTips: [
        'Hook viewers in the first 3 seconds',
        'Use trending sounds and music',
        'Include captions for accessibility',
        'Encourage comments and shares',
        'Post consistently (2-3 times per day)'
      ],
      hashtagStrategy: [
        'Use 3-5 trending hashtags',
        'Include 2-3 niche hashtags',
        'Add 1-2 branded hashtags',
        'Research hashtag performance weekly',
        'Avoid overused hashtags'
      ]
    };
  }

  /**
   * Calculate viral coefficient
   */
  static calculateViralCoefficient(shares: number, signups: number): number {
    if (shares === 0) return 0;
    return signups / shares;
  }

  /**
   * Estimate viral reach
   */
  static estimateViralReach(
    initialViews: number,
    shares: number,
    averageReachPerShare: number = 100
  ): number {
    return initialViews + (shares * averageReachPerShare);
  }

  /**
   * Get viral growth success stories
   */
  static getViralSuccessStories(): Array<{
    creator: string;
    platform: string;
    views: number;
    shares: number;
    signups: number;
    story: string;
  }> {
    return [
      {
        creator: 'Sarah M.',
        platform: 'TikTok',
        views: 250000,
        shares: 1500,
        signups: 45,
        story: 'Generated 45 signups from one viral TikTok using Hookly!'
      },
      {
        creator: 'Mike R.',
        platform: 'Instagram',
        views: 89000,
        shares: 800,
        signups: 28,
        story: 'Hookly helped me create content that went viral and brought in 28 new customers.'
      },
      {
        creator: 'Lisa K.',
        platform: 'X (Twitter)',
        views: 45000,
        shares: 300,
        signups: 12,
        story: 'Used Hookly to create viral Twitter content that generated 12 signups in 24 hours.'
      }
    ];
  }
}
