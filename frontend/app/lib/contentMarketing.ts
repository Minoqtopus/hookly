import { AnalyticsService, EventType } from './analytics';

export interface ContentMarketingMetrics {
  newsletter_revenue: number;
  blog_revenue: number;
  affiliate_revenue: number;
  sponsored_content_revenue: number;
  total_revenue: number;
  newsletter_subscribers: number;
  blog_views: number;
  conversion_rate: number;
}

export interface AffiliateLink {
  id: string;
  product_name: string;
  affiliate_url: string;
  commission_rate: number;
  clicks: number;
  conversions: number;
  revenue: number;
  created_at: Date;
}

export interface SponsoredContent {
  id: string;
  title: string;
  sponsor_name: string;
  sponsor_logo: string;
  content_type: 'blog' | 'newsletter' | 'video';
  price: number;
  status: 'draft' | 'published' | 'completed';
  published_at?: Date;
  metrics: {
    views: number;
    clicks: number;
    engagement_rate: number;
  };
}

export interface NewsletterCampaign {
  id: string;
  subject: string;
  content: string;
  audience: 'free' | 'premium' | 'all';
  scheduled_at: Date;
  sent_at?: Date;
  metrics: {
    sent: number;
    opened: number;
    clicked: number;
    unsubscribed: number;
    revenue: number;
  };
}

export class ContentMarketingService {
  private static readonly STORAGE_KEY = 'hookly_content_marketing_data';
  private static readonly AFFILIATE_LINKS_KEY = 'hookly_affiliate_links';

  /**
   * Track content marketing revenue
   */
  static trackRevenue(source: 'newsletter' | 'blog' | 'affiliate' | 'sponsored', amount: number, metadata?: any): void {
    try {
      const revenueData = {
        source,
        amount,
        timestamp: new Date().toISOString(),
        ...metadata
      };

      // Track analytics event
      AnalyticsService.trackEvent(EventType.UPGRADE_COMPLETED, {
        eventData: {
          revenue_source: source,
          revenue_amount: amount,
          content_marketing: true,
          ...metadata
        }
      });

      // Update local revenue tracking
      this.updateRevenueMetrics(source, amount);
    } catch (error) {
      console.error('Failed to track content marketing revenue:', error);
    }
  }

  /**
   * Track affiliate link clicks
   */
  static trackAffiliateClick(affiliateId: string, productName: string, url: string): void {
    try {
      // Track analytics event
      AnalyticsService.trackEvent(EventType.COPY_TO_CLIPBOARD, {
        eventData: {
          interaction_type: 'affiliate_click',
          affiliate_id: affiliateId,
          product_name: productName,
          affiliate_url: url
        }
      });

      // Update affiliate link metrics
      this.updateAffiliateMetrics(affiliateId, 'clicks');
    } catch (error) {
      console.error('Failed to track affiliate click:', error);
    }
  }

  /**
   * Track affiliate conversions
   */
  static trackAffiliateConversion(affiliateId: string, revenue: number): void {
    try {
      // Track analytics event
      AnalyticsService.trackEvent(EventType.UPGRADE_COMPLETED, {
        eventData: {
          revenue_source: 'affiliate',
          affiliate_id: affiliateId,
          revenue_amount: revenue,
          conversion_type: 'affiliate_purchase'
        }
      });

      // Update affiliate link metrics
      this.updateAffiliateMetrics(affiliateId, 'conversions', revenue);
    } catch (error) {
      console.error('Failed to track affiliate conversion:', error);
    }
  }

  /**
   * Track newsletter engagement
   */
  static trackNewsletterEngagement(campaignId: string, action: 'opened' | 'clicked' | 'unsubscribed'): void {
    try {
      // Track analytics event
      AnalyticsService.trackEvent(EventType.COPY_TO_CLIPBOARD, {
        eventData: {
          interaction_type: 'newsletter_engagement',
          campaign_id: campaignId,
          action,
          timestamp: new Date().toISOString()
        }
      });

      // Update campaign metrics
      this.updateCampaignMetrics(campaignId, action);
    } catch (error) {
      console.error('Failed to track newsletter engagement:', error);
    }
  }

  /**
   * Track sponsored content performance
   */
  static trackSponsoredContent(contentId: string, action: 'view' | 'click', metadata?: any): void {
    try {
      // Track analytics event
      AnalyticsService.trackEvent(EventType.COPY_TO_CLIPBOARD, {
        eventData: {
          interaction_type: 'sponsored_content',
          content_id: contentId,
          action,
          timestamp: new Date().toISOString(),
          ...metadata
        }
      });

      // Update sponsored content metrics
      this.updateSponsoredContentMetrics(contentId, action);
    } catch (error) {
      console.error('Failed to track sponsored content:', error);
    }
  }

  /**
   * Get content marketing analytics
   */
  static getContentMarketingMetrics(): ContentMarketingMetrics {
    try {
      const storedData = localStorage.getItem(this.STORAGE_KEY);
      if (!storedData) {
        return {
          newsletter_revenue: 0,
          blog_revenue: 0,
          affiliate_revenue: 0,
          sponsored_content_revenue: 0,
          total_revenue: 0,
          newsletter_subscribers: 0,
          blog_views: 0,
          conversion_rate: 0
        };
      }

      const data = JSON.parse(storedData);
      
      return {
        newsletter_revenue: data.newsletter_revenue || 0,
        blog_revenue: data.blog_revenue || 0,
        affiliate_revenue: data.affiliate_revenue || 0,
        sponsored_content_revenue: data.sponsored_content_revenue || 0,
        total_revenue: (data.newsletter_revenue || 0) + (data.blog_revenue || 0) + (data.affiliate_revenue || 0) + (data.sponsored_content_revenue || 0),
        newsletter_subscribers: data.newsletter_subscribers || 0,
        blog_views: data.blog_views || 0,
        conversion_rate: data.conversion_rate || 0
      };
    } catch (error) {
      console.error('Failed to get content marketing metrics:', error);
      return {
        newsletter_revenue: 0,
        blog_revenue: 0,
        affiliate_revenue: 0,
        sponsored_content_revenue: 0,
        total_revenue: 0,
        newsletter_subscribers: 0,
        blog_views: 0,
        conversion_rate: 0
      };
    }
  }

  /**
   * Get affiliate links with performance data
   */
  static getAffiliateLinks(): AffiliateLink[] {
    try {
      const storedData = localStorage.getItem(this.AFFILIATE_LINKS_KEY);
      if (!storedData) {
        // Return mock affiliate links
        return [
          {
            id: 'aff_1',
            product_name: 'CapCut Pro',
            affiliate_url: 'https://capcut.com/pro?ref=hookly',
            commission_rate: 30,
            clicks: 1250,
            conversions: 87,
            revenue: 1305,
            created_at: new Date('2025-01-01')
          },
          {
            id: 'aff_2',
            product_name: 'Canva Pro',
            affiliate_url: 'https://canva.com/pro?ref=hookly',
            commission_rate: 25,
            clicks: 890,
            conversions: 124,
            revenue: 1860,
            created_at: new Date('2025-01-01')
          },
          {
            id: 'aff_3',
            product_name: 'Later Social Media Scheduler',
            affiliate_url: 'https://later.com?ref=hookly',
            commission_rate: 35,
            clicks: 654,
            conversions: 45,
            revenue: 945,
            created_at: new Date('2025-01-01')
          }
        ];
      }

      const data = JSON.parse(storedData);
      return data.map((link: any) => ({
        ...link,
        created_at: new Date(link.created_at)
      }));
    } catch (error) {
      console.error('Failed to get affiliate links:', error);
      return [];
    }
  }

  /**
   * Get sponsored content campaigns
   */
  static getSponsoredContent(): SponsoredContent[] {
    try {
      // Return mock sponsored content data
      return [
        {
          id: 'sp_1',
          title: 'The Complete Guide to Viral Video Editing',
          sponsor_name: 'CapCut Pro',
          sponsor_logo: '/api/placeholder/120/40',
          content_type: 'blog',
          price: 2500,
          status: 'published',
          published_at: new Date('2025-01-10'),
          metrics: {
            views: 22100,
            clicks: 1250,
            engagement_rate: 5.7
          }
        },
        {
          id: 'sp_2',
          title: 'Design Templates That Convert',
          sponsor_name: 'Canva Pro',
          sponsor_logo: '/api/placeholder/120/40',
          content_type: 'newsletter',
          price: 1800,
          status: 'completed',
          published_at: new Date('2025-01-05'),
          metrics: {
            views: 8934,
            clicks: 534,
            engagement_rate: 6.0
          }
        },
        {
          id: 'sp_3',
          title: 'Social Media Scheduling Masterclass',
          sponsor_name: 'Later',
          sponsor_logo: '/api/placeholder/120/40',
          content_type: 'video',
          price: 3200,
          status: 'draft',
          metrics: {
            views: 0,
            clicks: 0,
            engagement_rate: 0
          }
        }
      ];
    } catch (error) {
      console.error('Failed to get sponsored content:', error);
      return [];
    }
  }

  /**
   * Get newsletter campaigns
   */
  static getNewsletterCampaigns(): NewsletterCampaign[] {
    try {
      // Return mock newsletter campaign data
      return [
        {
          id: 'nl_1',
          subject: 'How to Create Viral TikTok Hooks (Premium Strategies Inside)',
          content: 'Exclusive strategies for premium subscribers...',
          audience: 'premium',
          scheduled_at: new Date('2025-01-15T10:00:00Z'),
          sent_at: new Date('2025-01-15T10:00:00Z'),
          metrics: {
            sent: 423,
            opened: 179,
            clicked: 34,
            unsubscribed: 2,
            revenue: 225
          }
        },
        {
          id: 'nl_2',
          subject: 'Instagram Algorithm Update: What You Need to Know',
          content: 'Free insights for all subscribers...',
          audience: 'all',
          scheduled_at: new Date('2025-01-12T14:00:00Z'),
          sent_at: new Date('2025-01-12T14:00:00Z'),
          metrics: {
            sent: 2847,
            opened: 1205,
            clicked: 156,
            unsubscribed: 8,
            revenue: 0
          }
        }
      ];
    } catch (error) {
      console.error('Failed to get newsletter campaigns:', error);
      return [];
    }
  }

  /**
   * Calculate content marketing ROI
   */
  static calculateROI(): {
    monthly_roi: number;
    cost_per_acquisition: number;
    lifetime_value: number;
    profit_margin: number;
  } {
    const metrics = this.getContentMarketingMetrics();
    const totalCosts = 500; // Estimated monthly content marketing costs
    
    return {
      monthly_roi: metrics.total_revenue > 0 ? ((metrics.total_revenue - totalCosts) / totalCosts) * 100 : 0,
      cost_per_acquisition: metrics.newsletter_subscribers > 0 ? totalCosts / metrics.newsletter_subscribers : 0,
      lifetime_value: metrics.newsletter_subscribers > 0 ? metrics.total_revenue / metrics.newsletter_subscribers : 0,
      profit_margin: metrics.total_revenue > 0 ? ((metrics.total_revenue - totalCosts) / metrics.total_revenue) * 100 : 0
    };
  }

  /**
   * Get content marketing recommendations
   */
  static getContentMarketingRecommendations(): {
    newsletter_optimization: string[];
    blog_optimization: string[];
    affiliate_optimization: string[];
    sponsored_content_optimization: string[];
  } {
    const metrics = this.getContentMarketingMetrics();
    const affiliateLinks = this.getAffiliateLinks();
    
    return {
      newsletter_optimization: [
        'Increase premium subscriber conversion with exclusive case studies',
        'A/B test subject lines for higher open rates',
        'Segment audience based on engagement for personalized content',
        'Add more affiliate links to high-performing newsletters'
      ],
      blog_optimization: [
        'Focus on long-form content (2000+ words) for better SEO',
        'Create more case study content - highest engagement type',
        'Optimize for featured snippets with FAQ sections',
        'Add more internal linking between related posts'
      ],
      affiliate_optimization: [
        'Promote CapCut Pro more - highest conversion rate',
        'Create dedicated tutorials for affiliate products',
        'Add affiliate links to email signatures',
        'Partner with tools that complement Hookly\'s features'
      ],
      sponsored_content_optimization: [
        'Increase sponsored blog post frequency - high ROI',
        'Create video content for sponsors - premium pricing',
        'Offer package deals (blog + newsletter + social)',
        'Focus on SaaS tools and creator economy brands'
      ]
    };
  }

  // Private helper methods

  private static updateRevenueMetrics(source: string, amount: number): void {
    try {
      const storedData = localStorage.getItem(this.STORAGE_KEY);
      const data = storedData ? JSON.parse(storedData) : {};
      
      const key = `${source}_revenue`;
      data[key] = (data[key] || 0) + amount;
      data.last_updated = new Date().toISOString();

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to update revenue metrics:', error);
    }
  }

  private static updateAffiliateMetrics(affiliateId: string, metric: 'clicks' | 'conversions', revenue?: number): void {
    try {
      const storedData = localStorage.getItem(this.AFFILIATE_LINKS_KEY);
      const data = storedData ? JSON.parse(storedData) : [];
      
      const linkIndex = data.findIndex((link: any) => link.id === affiliateId);
      if (linkIndex >= 0) {
        data[linkIndex][metric] = (data[linkIndex][metric] || 0) + 1;
        if (revenue) {
          data[linkIndex].revenue = (data[linkIndex].revenue || 0) + revenue;
        }
        data[linkIndex].last_updated = new Date().toISOString();
      }

      localStorage.setItem(this.AFFILIATE_LINKS_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to update affiliate metrics:', error);
    }
  }

  private static updateCampaignMetrics(campaignId: string, action: string): void {
    try {
      // In a real implementation, this would update campaign metrics in the database
      console.log(`Updated campaign ${campaignId} metrics: ${action}`);
    } catch (error) {
      console.error('Failed to update campaign metrics:', error);
    }
  }

  private static updateSponsoredContentMetrics(contentId: string, action: string): void {
    try {
      // In a real implementation, this would update sponsored content metrics in the database
      console.log(`Updated sponsored content ${contentId} metrics: ${action}`);
    } catch (error) {
      console.error('Failed to update sponsored content metrics:', error);
    }
  }
}
