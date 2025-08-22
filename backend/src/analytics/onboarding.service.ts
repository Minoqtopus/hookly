import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { AnalyticsEvent, EventType } from '../entities/analytics-event.entity';
import { User } from '../entities/user.entity';
import { AnalyticsService } from './analytics.service';

export interface OnboardingStep {
  step: string;
  completed: boolean;
  completedAt?: Date;
  timeToComplete?: number; // in hours
}

export interface UserEngagementScore {
  userId: string;
  score: number;
  level: 'low' | 'medium' | 'high' | 'super_user';
  factors: {
    daysActive: number;
    generationsCreated: number;
    featuresUsed: number;
    emailVerified: boolean;
    trialToActiveTime: number; // hours from signup to first generation
    socialSharing: number;
    upgradeIntent: number; // shown upgrade modal, clicked pricing, etc.
  };
  lastCalculated: Date;
}

export interface OnboardingAnalytics {
  completionRate: number;
  averageTimeToComplete: number; // days
  dropoffPoints: Array<{
    step: string;
    dropoffRate: number;
    usersDropped: number;
  }>;
  stepCompletionRates: Array<{
    step: string;
    completionRate: number;
    averageTime: number; // hours
  }>;
}

@Injectable()
export class OnboardingService {
  constructor(
    private analyticsService: AnalyticsService,
    @InjectRepository(AnalyticsEvent)
    private analyticsRepository: Repository<AnalyticsEvent>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private readonly ONBOARDING_STEPS = [
    'email_verified',
    'first_generation',
    'template_explored',
    'feature_discovered', // copy, export, save, etc.
    'upgrade_awareness', // viewed pricing or upgrade modal
  ];

  async getUserOnboardingProgress(userId: string): Promise<OnboardingStep[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const signupDate = user.created_at;
    const steps: OnboardingStep[] = [];

    // Email verified
    const emailVerified = await this.analyticsRepository.findOne({
      where: {
        user_id: userId,
        event_type: EventType.EMAIL_VERIFIED,
      },
      order: { created_at: 'ASC' },
    });

    steps.push({
      step: 'email_verified',
      completed: user.is_verified || !!emailVerified,
      completedAt: emailVerified?.created_at,
      timeToComplete: emailVerified 
        ? this.calculateHoursBetween(signupDate, emailVerified.created_at)
        : undefined,
    });

    // First generation
    const firstGeneration = await this.analyticsRepository.findOne({
      where: {
        user_id: userId,
        event_type: EventType.GENERATION_COMPLETED,
      },
      order: { created_at: 'ASC' },
    });

    steps.push({
      step: 'first_generation',
      completed: !!firstGeneration,
      completedAt: firstGeneration?.created_at,
      timeToComplete: firstGeneration 
        ? this.calculateHoursBetween(signupDate, firstGeneration.created_at)
        : undefined,
    });

    // Template explored
    const templateUsed = await this.analyticsRepository.findOne({
      where: {
        user_id: userId,
        event_type: EventType.GENERATION_COMPLETED,
      },
      order: { created_at: 'ASC' },
    });

    steps.push({
      step: 'template_explored',
      completed: !!templateUsed,
      completedAt: templateUsed?.created_at,
      timeToComplete: templateUsed 
        ? this.calculateHoursBetween(signupDate, templateUsed.created_at)
        : undefined,
    });

    // Feature discovered (any engagement feature)
    const featureUsed = await this.analyticsRepository.findOne({
      where: {
        user_id: userId,
        event_type: EventType.COPY_TO_CLIPBOARD,
      },
      order: { created_at: 'ASC' },
    });

    steps.push({
      step: 'feature_discovered',
      completed: !!featureUsed,
      completedAt: featureUsed?.created_at,
      timeToComplete: featureUsed 
        ? this.calculateHoursBetween(signupDate, featureUsed.created_at)
        : undefined,
    });

    // Upgrade awareness
    const upgradeAwareness = await this.analyticsRepository.findOne({
      where: [
        { user_id: userId, event_type: EventType.UPGRADE_MODAL_SHOWN },
        { user_id: userId, event_type: EventType.PRICING_PAGE_VIEWED },
      ],
      order: { created_at: 'ASC' },
    });

    steps.push({
      step: 'upgrade_awareness',
      completed: !!upgradeAwareness,
      completedAt: upgradeAwareness?.created_at,
      timeToComplete: upgradeAwareness 
        ? this.calculateHoursBetween(signupDate, upgradeAwareness.created_at)
        : undefined,
    });

    return steps;
  }

  async calculateUserEngagementScore(userId: string): Promise<UserEngagementScore> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const signupDate = user.created_at;
    const now = new Date();
    const daysSinceSignup = this.calculateDaysBetween(signupDate, now);

    // Get user events
    const events = await this.analyticsRepository.find({
      where: {
        user_id: userId,
        created_at: MoreThan(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), // Last 30 days
      },
      order: { created_at: 'DESC' },
    });

    // Calculate engagement factors
    const factors = {
      daysActive: this.calculateActiveDays(events),
      generationsCreated: events.filter(e => e.event_type === EventType.GENERATION_COMPLETED).length,
      featuresUsed: this.calculateUniqueFeatures(events),
      emailVerified: user.is_verified,
      trialToActiveTime: await this.calculateTrialToActiveTime(userId, signupDate),
      socialSharing: events.filter(e => e.event_type === EventType.COPY_TO_CLIPBOARD).length,
      upgradeIntent: this.calculateUpgradeIntent(events),
    };

    // Calculate engagement score (0-100)
    let score = 0;

    // Base activity score (0-30 points)
    score += Math.min(30, factors.daysActive * 2);

    // Generation activity (0-25 points)
    score += Math.min(25, factors.generationsCreated * 2);

    // Feature diversity (0-15 points)
    score += Math.min(15, factors.featuresUsed * 3);

    // Email verification bonus (10 points)
    if (factors.emailVerified) score += 10;

    // Quick activation bonus (0-10 points) - bonus for generating within 24 hours
    if (factors.trialToActiveTime <= 24) score += 10;
    else if (factors.trialToActiveTime <= 72) score += 5;

    // Social engagement bonus (0-5 points)
    score += Math.min(5, factors.socialSharing);

    // Upgrade intent bonus (0-5 points)
    score += Math.min(5, factors.upgradeIntent);

    // Determine engagement level
    let level: 'low' | 'medium' | 'high' | 'super_user';
    if (score >= 80) level = 'super_user';
    else if (score >= 60) level = 'high';
    else if (score >= 35) level = 'medium';
    else level = 'low';

    return {
      userId,
      score: Math.round(score),
      level,
      factors,
      lastCalculated: now,
    };
  }

  async getOnboardingAnalytics(
    startDate?: Date, 
    endDate?: Date
  ): Promise<OnboardingAnalytics> {
    const dateFilter = this.buildDateFilter(startDate, endDate);
    
    // Get users who signed up in the period
    const users = await this.userRepository.find({
      where: dateFilter,
      order: { created_at: 'ASC' },
    });

    const totalUsers = users.length;
    if (totalUsers === 0) {
      return {
        completionRate: 0,
        averageTimeToComplete: 0,
        dropoffPoints: [],
        stepCompletionRates: [],
      };
    }

    // Calculate completion rates for each step
    const stepCompletionRates = [];
    let fullyCompletedUsers = 0;
    const totalCompletionTimes = [];

    for (const step of this.ONBOARDING_STEPS) {
      const completedUsers = await this.calculateStepCompletion(users, step);
      const averageTime = this.calculateAverageStepTime(completedUsers);
      
      stepCompletionRates.push({
        step,
        completionRate: (completedUsers.length / totalUsers) * 100,
        averageTime,
      });

      // Check if this is the last step for overall completion
      if (step === this.ONBOARDING_STEPS[this.ONBOARDING_STEPS.length - 1]) {
        fullyCompletedUsers = completedUsers.length;
        totalCompletionTimes.push(...completedUsers.map(u => u.completionTime || 0));
      }
    }

    // Calculate dropoff points
    const dropoffPoints = [];
    for (let i = 1; i < stepCompletionRates.length; i++) {
      const previousStep = stepCompletionRates[i - 1];
      const currentStep = stepCompletionRates[i];
      const dropoffRate = previousStep.completionRate - currentStep.completionRate;
      
      dropoffPoints.push({
        step: currentStep.step,
        dropoffRate,
        usersDropped: Math.round((dropoffRate / 100) * totalUsers),
      });
    }

    return {
      completionRate: (fullyCompletedUsers / totalUsers) * 100,
      averageTimeToComplete: totalCompletionTimes.length > 0 
        ? totalCompletionTimes.reduce((a, b) => a + b, 0) / totalCompletionTimes.length / 24 // Convert to days
        : 0,
      dropoffPoints,
      stepCompletionRates,
    };
  }

  async getUsersNeedingNudge(
    daysInactive: number = 3,
    engagementThreshold: number = 30
  ): Promise<Array<{ user: User; onboardingStep: string; engagementScore: number }>> {
    const cutoffDate = new Date(Date.now() - daysInactive * 24 * 60 * 60 * 1000);
    
    // Get users who haven't been active recently
    const inactiveUsers = await this.userRepository.createQueryBuilder('user')
      .leftJoin('analytics_events', 'event', 'event.user_id = user.id')
      .where('user.created_at > :thirtyDaysAgo', { thirtyDaysAgo: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) })
      .andWhere('user.plan = :plan', { plan: 'trial' })
      .groupBy('user.id')
      .having('MAX(event.created_at) < :cutoffDate OR MAX(event.created_at) IS NULL', { cutoffDate })
      .getMany();

    const results = [];
    
    for (const user of inactiveUsers) {
      const onboardingSteps = await this.getUserOnboardingProgress(user.id);
      const engagementScore = await this.calculateUserEngagementScore(user.id);
      
      // Find the first incomplete step
      const incompleteStep = onboardingSteps.find(step => !step.completed);
      
      if (engagementScore.score < engagementThreshold) {
        results.push({
          user,
          onboardingStep: incompleteStep?.step || 'completed',
          engagementScore: engagementScore.score,
        });
      }
    }

    return results;
  }

  // Helper methods
  private calculateHoursBetween(start: Date, end: Date): number {
    return Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }

  private calculateDaysBetween(start: Date, end: Date): number {
    return Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  }

  private calculateActiveDays(events: AnalyticsEvent[]): number {
    const uniqueDays = new Set();
    events.forEach(event => {
      const day = event.created_at.toISOString().split('T')[0];
      uniqueDays.add(day);
    });
    return uniqueDays.size;
  }

  private calculateUniqueFeatures(events: AnalyticsEvent[]): number {
    const featureEvents = events.filter(e => 
              [EventType.COPY_TO_CLIPBOARD, EventType.SAVE_TO_FAVORITES].includes(e.event_type)
    );
    const uniqueFeatures = new Set(featureEvents.map(e => e.event_type));
    return uniqueFeatures.size;
  }

  private async calculateTrialToActiveTime(userId: string, signupDate: Date): Promise<number> {
    const firstGeneration = await this.analyticsRepository.findOne({
      where: {
        user_id: userId,
        event_type: EventType.GENERATION_COMPLETED,
      },
      order: { created_at: 'ASC' },
    });

    if (!firstGeneration) return Infinity;
    return this.calculateHoursBetween(signupDate, firstGeneration.created_at);
  }

  private calculateUpgradeIntent(events: AnalyticsEvent[]): number {
    return events.filter(e => 
      [EventType.UPGRADE_MODAL_SHOWN, EventType.PRICING_PAGE_VIEWED, EventType.UPGRADE_INITIATED].includes(e.event_type)
    ).length;
  }

  private buildDateFilter(startDate?: Date, endDate?: Date) {
    const filter: any = {};
    
    if (startDate && endDate) {
      filter.created_at = MoreThan(startDate);
    } else if (startDate) {
      filter.created_at = MoreThan(startDate);
    }

    return filter;
  }

  private async calculateStepCompletion(users: User[], step: string): Promise<Array<{userId: string, completionTime?: number}>> {
    const results = [];
    
    for (const user of users) {
      let eventType: EventType;
      let completed = false;
      let completionTime: number | undefined;

      switch (step) {
        case 'email_verified':
          completed = user.is_verified;
          if (completed) {
            const event = await this.analyticsRepository.findOne({
              where: { user_id: user.id, event_type: EventType.EMAIL_VERIFIED },
              order: { created_at: 'ASC' },
            });
            completionTime = event ? this.calculateHoursBetween(user.created_at, event.created_at) : 0;
          }
          break;
        case 'first_generation':
          eventType = EventType.GENERATION_COMPLETED;
          break;
        case 'template_explored':
          eventType = EventType.GENERATION_COMPLETED;
          break;
        case 'feature_discovered':
          eventType = EventType.COPY_TO_CLIPBOARD;
          break;
        case 'upgrade_awareness':
          eventType = EventType.UPGRADE_MODAL_SHOWN;
          break;
      }

      if (eventType && !completed) {
        const event = await this.analyticsRepository.findOne({
          where: { user_id: user.id, event_type: eventType },
          order: { created_at: 'ASC' },
        });
        
        if (event) {
          completed = true;
          completionTime = this.calculateHoursBetween(user.created_at, event.created_at);
        }
      }

      if (completed) {
        results.push({ userId: user.id, completionTime });
      }
    }
    
    return results;
  }

  private calculateAverageStepTime(completedUsers: Array<{userId: string, completionTime?: number}>): number {
    const times = completedUsers.map(u => u.completionTime || 0).filter(t => t > 0);
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }
}