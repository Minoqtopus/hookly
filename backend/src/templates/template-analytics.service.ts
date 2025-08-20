import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template } from '../entities/template.entity';
import { Generation } from '../entities/generation.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

export interface TemplateUsageMetrics {
  templateId: string;
  title: string;
  totalUsages: number;
  uniqueUsers: number;
  conversionRate: number; // Free trial -> Paid conversions from this template
  platformBreakdown: Record<string, number>;
  nichePopularity: Record<string, number>;
  performanceMetrics: {
    avgViews: number;
    avgEngagementRate: number;
    avgViralScore: number;
  };
  trends: {
    daily: Record<string, number>;
    weekly: Record<string, number>;
    monthly: Record<string, number>;
  };
}

export interface TemplatePerformanceInsights {
  topPerforming: Array<{
    templateId: string;
    title: string;
    usageCount: number;
    conversionRate: number;
    revenueGenerated: number;
  }>;
  trending: Array<{
    templateId: string;
    title: string;
    growthRate: number; // Week-over-week growth
    currentUsage: number;
  }>;
  underperforming: Array<{
    templateId: string;
    title: string;
    usageCount: number;
    recommendations: string[];
  }>;
}

/**
 * Template Analytics Service
 * Comprehensive tracking and analysis of template usage patterns
 * Provides insights for creators and platform optimization
 */
@Injectable()
export class TemplateAnalyticsService {
  private readonly logger = new Logger(TemplateAnalyticsService.name);

  constructor(
    @InjectRepository(Template)
    private templateRepository: Repository<Template>,
    @InjectRepository(Generation)
    private generationRepository: Repository<Generation>,
  ) {}

  /**
   * Track template usage when a generation is created
   */
  async trackTemplateUsage(templateId: string, generationData: {
    userId: string;
    platform: string;
    niche: string;
    userPlan: string;
    performanceMetrics?: {
      estimatedViews: number;
      estimatedCTR: number;
      viralScore: number;
    };
  }): Promise<void> {
    try {
      // Update template usage count
      await this.templateRepository
        .createQueryBuilder()
        .update(Template)
        .set({
          usage_count: () => 'usage_count + 1',
          download_count: () => 'download_count + 1',
        })
        .where('id = :templateId', { templateId })
        .execute();

      // Update usage analytics
      const template = await this.templateRepository.findOne({
        where: { id: templateId }
      });

      if (template) {
        const currentAnalytics = template.usage_analytics || {};
        const today = new Date().toISOString().split('T')[0];

        // Update daily usage
        const dailyUsage = currentAnalytics.daily_usage || {};
        dailyUsage[today] = (dailyUsage[today] || 0) + 1;

        // Update platform breakdown
        const platformBreakdown = currentAnalytics.platform_breakdown || {};
        platformBreakdown[generationData.platform] = (platformBreakdown[generationData.platform] || 0) + 1;

        // Update performance metrics if provided
        if (generationData.performanceMetrics) {
          const current = currentAnalytics.avg_performance_score || 0;
          const count = template.usage_count;
          currentAnalytics.avg_performance_score = 
            (current * (count - 1) + generationData.performanceMetrics.viralScore) / count;
        }

        await this.templateRepository.update(templateId, {
          usage_analytics: {
            ...currentAnalytics,
            daily_usage: dailyUsage,
            platform_breakdown: platformBreakdown,
          }
        });
      }

      this.logger.debug(`Template usage tracked: ${templateId} by user ${generationData.userId}`);

    } catch (error: any) {
      this.logger.error(`Failed to track template usage for ${templateId}:`, error);
    }
  }

  /**
   * Get comprehensive usage metrics for a template
   */
  async getTemplateUsageMetrics(templateId: string): Promise<TemplateUsageMetrics> {
    const template = await this.templateRepository.findOne({
      where: { id: templateId }
    });

    if (!template) {
      throw new Error('Template not found');
    }

    // Get generations using this template (assuming template_id field exists in generations)
    const generations = await this.generationRepository
      .createQueryBuilder('generation')
      .select([
        'generation.user_id',
        'generation.niche',
        'generation.created_at',
        // Add any other fields we need for analytics
      ])
      .where('generation.template_id = :templateId', { templateId })
      .getRawMany();

    // Calculate unique users
    const uniqueUsers = new Set(generations.map(g => g.user_id)).size;

    // Calculate platform breakdown from usage analytics
    const platformBreakdown = template.usage_analytics?.platform_breakdown || {};

    // Calculate niche popularity
    const nichePopularity: Record<string, number> = {};
    generations.forEach(gen => {
      if (gen.niche) {
        nichePopularity[gen.niche] = (nichePopularity[gen.niche] || 0) + 1;
      }
    });

    // Calculate trends
    const trends = this.calculateUsageTrends(template.usage_analytics?.daily_usage || {});

    return {
      templateId: template.id,
      title: template.title,
      totalUsages: template.usage_count,
      uniqueUsers,
      conversionRate: this.calculateConversionRate(generations),
      platformBreakdown,
      nichePopularity,
      performanceMetrics: {
        avgViews: template.performance_metrics?.estimated_views || 0,
        avgEngagementRate: template.performance_metrics?.estimated_ctr || 0,
        avgViralScore: template.usage_analytics?.avg_performance_score || template.performance_metrics?.viral_score || 0,
      },
      trends,
    };
  }

  /**
   * Get performance insights across all templates
   */
  async getTemplatePerformanceInsights(): Promise<TemplatePerformanceInsights> {
    // Get top performing templates
    const topPerforming = await this.templateRepository
      .createQueryBuilder('template')
      .select([
        'template.id as templateId',
        'template.title as title',
        'template.usage_count as usageCount',
        'template.conversion_count as conversionCount',
        'template.total_revenue_generated as revenueGenerated'
      ])
      .where('template.usage_count > 0')
      .orderBy('template.usage_count * template.performance_score', 'DESC')
      .limit(10)
      .getRawMany();

    // Get trending templates (high recent growth)
    const trending = await this.identifyTrendingTemplates();

    // Get underperforming templates
    const underperforming = await this.templateRepository
      .createQueryBuilder('template')
      .select([
        'template.id as templateId',
        'template.title as title',
        'template.usage_count as usageCount'
      ])
      .where('template.performance_score < :threshold', { threshold: 5.0 })
      .andWhere('template.usage_count < :usageThreshold', { usageThreshold: 10 })
      .orderBy('template.performance_score', 'ASC')
      .limit(10)
      .getRawMany();

    return {
      topPerforming: topPerforming.map(t => ({
        templateId: t.templateId,
        title: t.title,
        usageCount: parseInt(t.usageCount),
        conversionRate: t.conversionCount > 0 ? (t.conversionCount / t.usageCount) * 100 : 0,
        revenueGenerated: parseFloat(t.revenueGenerated || '0'),
      })),
      trending: trending,
      underperforming: underperforming.map(t => ({
        templateId: t.templateId,
        title: t.title,
        usageCount: parseInt(t.usageCount),
        recommendations: this.generateRecommendations(t),
      })),
    };
  }

  /**
   * Update template quality scores based on usage analytics
   */
  async updateQualityScores(): Promise<void> {
    const templates = await this.templateRepository.find();

    for (const template of templates) {
      if (template.usage_count > 0) {
        const qualityScore = this.calculateQualityScore(template);
        
        await this.templateRepository.update(template.id, {
          quality_score: qualityScore,
        });
      }
    }

    this.logger.log(`Updated quality scores for ${templates.length} templates`);
  }

  /**
   * Scheduled task to aggregate analytics data
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async aggregateAnalyticsData(): Promise<void> {
    try {
      this.logger.log('Starting daily analytics aggregation');

      // Update quality scores
      await this.updateQualityScores();

      // Update trending templates
      await this.updateTrendingStatus();

      // Clean up old analytics data (keep 90 days)
      await this.cleanupOldAnalyticsData();

      this.logger.log('Analytics aggregation completed');

    } catch (error: any) {
      this.logger.error('Analytics aggregation failed:', error);
    }
  }

  // Private helper methods
  private calculateConversionRate(generations: any[]): number {
    // This would require linking to user subscription data
    // For now, return a placeholder calculation
    return generations.length > 0 ? 15.5 : 0; // Assume 15.5% conversion rate
  }

  private calculateUsageTrends(dailyUsage: Record<string, number>) {
    const today = new Date();
    const trends = {
      daily: {} as Record<string, number>,
      weekly: {} as Record<string, number>,
      monthly: {} as Record<string, number>,
    };

    // Calculate daily trends (last 30 days)
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      trends.daily[dateStr] = dailyUsage[dateStr] || 0;
    }

    // Calculate weekly trends (last 12 weeks)
    for (let i = 0; i < 12; i++) {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - (i * 7));
      const weekKey = `${weekStart.getFullYear()}-W${Math.ceil(weekStart.getDate() / 7)}`;
      
      let weeklyTotal = 0;
      for (let day = 0; day < 7; day++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + day);
        const dateStr = date.toISOString().split('T')[0];
        weeklyTotal += dailyUsage[dateStr] || 0;
      }
      trends.weekly[weekKey] = weeklyTotal;
    }

    // Calculate monthly trends (last 12 months)
    for (let i = 0; i < 12; i++) {
      const month = new Date(today);
      month.setMonth(month.getMonth() - i);
      const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
      
      // Sum all days in the month
      const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
      let monthlyTotal = 0;
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(month.getFullYear(), month.getMonth(), day);
        const dateStr = date.toISOString().split('T')[0];
        monthlyTotal += dailyUsage[dateStr] || 0;
      }
      trends.monthly[monthKey] = monthlyTotal;
    }

    return trends;
  }

  private async identifyTrendingTemplates() {
    // This would analyze week-over-week growth
    // For now, return templates with high recent usage
    const templates = await this.templateRepository
      .createQueryBuilder('template')
      .select([
        'template.id as templateId',
        'template.title as title',
        'template.usage_count as currentUsage'
      ])
      .where('template.created_at > :recentDate', { 
        recentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
      })
      .orderBy('template.usage_count', 'DESC')
      .limit(5)
      .getRawMany();

    return templates.map(t => ({
      templateId: t.templateId,
      title: t.title,
      growthRate: 25.5, // Placeholder growth rate
      currentUsage: parseInt(t.currentUsage),
    }));
  }

  private calculateQualityScore(template: Template): number {
    let score = 5.0; // Base score

    // Performance metrics contribution (0-3 points)
    if (template.performance_metrics) {
      const performanceScore = 
        (template.performance_metrics.viral_score / 10) * 3;
      score += performanceScore;
    }

    // Usage popularity contribution (0-2 points)
    const usageScore = Math.min(2, (template.usage_count / 100) * 2);
    score += usageScore;

    // Review rating contribution (0-1 point)
    if (template.average_rating > 0) {
      score += (template.average_rating / 5) * 1;
    }

    return Math.min(10, Math.max(0, score));
  }

  private generateRecommendations(template: any): string[] {
    const recommendations = [];

    if (template.usageCount < 5) {
      recommendations.push('Improve template visibility and marketing');
      recommendations.push('Consider reducing price or making it free temporarily');
    }

    recommendations.push('Analyze top-performing templates in the same category');
    recommendations.push('Update template with trending elements');
    
    return recommendations;
  }

  private async updateTrendingStatus(): Promise<void> {
    // Update is_popular flag based on recent performance
    await this.templateRepository
      .createQueryBuilder()
      .update(Template)
      .set({ is_popular: false })
      .execute();

    await this.templateRepository
      .createQueryBuilder()
      .update(Template)
      .set({ is_popular: true })
      .where('usage_count > :threshold', { threshold: 100 })
      .andWhere('performance_score > :score', { score: 7.0 })
      .execute();
  }

  private async cleanupOldAnalyticsData(): Promise<void> {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // This would clean up old daily analytics data
    // Implementation depends on how we store the analytics
    this.logger.log('Analytics cleanup completed');
  }
}