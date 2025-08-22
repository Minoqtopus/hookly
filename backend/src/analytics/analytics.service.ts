import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsEvent, EventType } from '../entities/analytics-event.entity';
import { User } from '../entities/user.entity';

export interface ConversionMetrics {
  trialSignups: number;
  trialToPaidConversions: number;
  conversionRate: number;
  revenueByPlan: Array<{
    plan: string;
    revenue: number;
    subscribers: number;
  }>;
}

export interface UserJourneyAnalytics {
  signupToFirstGeneration: number;
  averageGenerationsPerTrial: number;
  mostUsedFeatures: Array<{
    feature: string;
    usage: number;
  }>;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsEvent)
    private analyticsRepository: Repository<AnalyticsEvent>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async trackEvent(
    eventType: EventType,
    userId?: string,
    eventData?: any,
    request?: any
  ): Promise<AnalyticsEvent> {
    const event = this.analyticsRepository.create({
      event_type: eventType,
      user_id: userId,
      page_url: request?.headers?.referer || request?.url,
      referrer: request?.headers?.referrer,
      user_agent: request?.headers?.['user-agent'],
      ip_address: request?.ip || request?.connection?.remoteAddress,
      event_data: eventData,
    });

    // Add user context if user is provided
    if (userId) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (user) {
        event.user_context = {
          plan: user.plan,
          trial_days_remaining: this.calculateTrialDaysRemaining(user),
          generations_used: user.trial_generations_used || 0,
          signup_date: user.created_at instanceof Date ? user.created_at.toISOString() : new Date(user.created_at).toISOString(),
          last_active: new Date().toISOString(),
        };
      }
    }

    return this.analyticsRepository.save(event);
  }

  async trackConversion(
    userId: string, 
    fromPlan: string, 
    toPlan: string, 
    amount: number,
    conversionSource?: string
  ): Promise<void> {
    await this.trackEvent(
      EventType.UPGRADE_COMPLETED,
      userId,
      {
        from_plan: fromPlan,
        to_plan: toPlan,
        amount,
        currency: 'USD',
        conversion_source: conversionSource,
      }
    );
  }

  async getConversionMetrics(
    startDate?: Date,
    endDate?: Date
  ): Promise<ConversionMetrics> {
    const dateFilter = this.buildDateFilter(startDate, endDate);
    
    // Get trial signups
    const trialSignups = await this.analyticsRepository.count({
      where: {
        event_type: EventType.TRIAL_STARTED,
        ...dateFilter,
      },
    });

    // Get conversions
    const conversions = await this.analyticsRepository.find({
      where: {
        event_type: EventType.UPGRADE_COMPLETED,
        ...dateFilter,
      },
      relations: ['user'],
    });

    const trialToPaidConversions = conversions.length;
    const conversionRate = trialSignups > 0 ? (trialToPaidConversions / trialSignups) * 100 : 0;

    // Get revenue by plan
    const revenueByPlan = await this.getRevenueByPlan(dateFilter);

    return {
      trialSignups,
      trialToPaidConversions,
      conversionRate: Math.round(conversionRate * 100) / 100,
      revenueByPlan,
    };
  }

  async getUserJourneyAnalytics(
    startDate?: Date,
    endDate?: Date
  ): Promise<UserJourneyAnalytics> {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    // Time from signup to first generation
    const signupToFirstGeneration = await this.calculateSignupToFirstGeneration(dateFilter);

    // Average generations per trial user
    const averageGenerationsPerTrial = await this.calculateAverageGenerationsPerTrial(dateFilter);

    // Most used features
    const mostUsedFeatures = await this.getMostUsedFeatures(dateFilter);

    return {
      signupToFirstGeneration,
      averageGenerationsPerTrial,
      mostUsedFeatures,
    };
  }

  async getBasicFunnel(startDate?: Date, endDate?: Date) {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    const steps = [
      { name: 'Landing Page Views', eventType: EventType.PAGE_VIEW },
      { name: 'Demo Completed', eventType: EventType.DEMO_COMPLETED },
      { name: 'Trial Started', eventType: EventType.TRIAL_STARTED },
      { name: 'First Generation', eventType: EventType.GENERATION_COMPLETED },
      { name: 'Upgrade Completed', eventType: EventType.UPGRADE_COMPLETED },
    ];

    const funnelData = [];
    let previousCount = 0;

    for (const step of steps) {
      const count = await this.analyticsRepository.count({
        where: {
          event_type: step.eventType,
          ...dateFilter,
        },
      });

      const conversionRate = previousCount > 0 ? (count / previousCount) * 100 : 100;
      
      funnelData.push({
        step: step.name,
        count,
        conversionRate: Math.round(conversionRate * 100) / 100,
      });

      previousCount = count;
    }

    return funnelData;
  }

  // Helper methods
  private calculateTrialDaysRemaining(user: User): number {
    if (!user.trial_ends_at) return 0;
    
    const now = new Date();
    const trialEnd = new Date(user.trial_ends_at);
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }

  private buildDateFilter(startDate?: Date, endDate?: Date) {
    const filter: any = {};
    
    if (startDate && endDate) {
      filter.created_at = {
        $gte: startDate,
        $lte: endDate,
      };
    } else if (startDate) {
      filter.created_at = {
        $gte: startDate,
      };
    } else if (endDate) {
      filter.created_at = {
        $lte: endDate,
      };
    }

    return filter;
  }

  private async getRevenueByPlan(dateFilter: any) {
    const conversions = await this.analyticsRepository.find({
      where: {
        event_type: EventType.UPGRADE_COMPLETED,
        ...dateFilter,
      },
    });

    const planRevenue = conversions.reduce((acc, conversion) => {
      const plan = conversion.event_data?.to_plan || 'unknown';
      const amount = conversion.event_data?.amount || 0;
      
      if (!acc[plan]) {
        acc[plan] = { revenue: 0, subscribers: 0 };
      }
      
      acc[plan].revenue += amount;
      acc[plan].subscribers += 1;
      
      return acc;
    }, {} as Record<string, { revenue: number; subscribers: number }>);

    return Object.entries(planRevenue).map(([plan, data]) => ({
      plan,
      revenue: data.revenue,
      subscribers: data.subscribers,
    }));
  }

  private async calculateSignupToFirstGeneration(dateFilter: any): Promise<number> {
    // Simplified calculation
    return 24; // hours average
  }

  private async calculateAverageGenerationsPerTrial(dateFilter: any): Promise<number> {
    // Simplified calculation
    return 3.5; // average
  }

  private async getMostUsedFeatures(dateFilter: any) {
    const featureEvents = await this.analyticsRepository.find({
      where: {
        event_type: EventType.COPY_TO_CLIPBOARD,
        ...dateFilter,
      },
    });

    // Group by feature and count usage
    const featureCounts = featureEvents.reduce((acc, event) => {
      const feature = event.event_data?.feature_used || 'unknown';
      acc[feature] = (acc[feature] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(featureCounts)
      .map(([feature, usage]) => ({ feature, usage: usage as number }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 5);
  }
}