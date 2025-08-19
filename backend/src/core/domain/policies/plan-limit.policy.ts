import { UserPlan } from '../../../entities/user.entity';

export interface PlanLimits {
  monthlyGenerations: number;
  trialGenerations: number;
  trialDuration: number; // days
  teamMembers: number;
  platforms: string[];
  features: string[];
}

export interface UsageStatus {
  canGenerate: boolean;
  remainingGenerations: number;
  limitType: 'monthly' | 'trial' | 'lifetime';
  resetDate: Date;
  upgradeMessage?: string;
  trialStatus?: {
    isActive: boolean;
    daysRemaining: number;
    generationsRemaining: number;
  };
}

export class PlanLimitPolicy {
  private readonly PLAN_LIMITS: Record<UserPlan, PlanLimits> = {
    [UserPlan.TRIAL]: {
      monthlyGenerations: 0, // Not applicable for trial
      trialGenerations: 15,
      trialDuration: 7,
      teamMembers: 0,
      platforms: ['TikTok'],
      features: ['basic_generation', 'basic_templates'],
    },
    [UserPlan.STARTER]: {
      monthlyGenerations: 50,
      trialGenerations: 0, // Not applicable for paid plans
      trialDuration: 0,
      teamMembers: 0,
      platforms: ['TikTok', 'Instagram'],
      features: ['basic_generation', 'basic_templates', 'advanced_templates', 'export_formats'],
    },
    [UserPlan.PRO]: {
      monthlyGenerations: 200,
      trialGenerations: 0,
      trialDuration: 0,
      teamMembers: 3,
      platforms: ['TikTok', 'Instagram', 'X'],
      features: ['basic_generation', 'basic_templates', 'advanced_templates', 'export_formats', 'batch_generation', 'team_collaboration', 'performance_analytics'],
    },
    [UserPlan.AGENCY]: {
      monthlyGenerations: 500,
      trialGenerations: 0,
      trialDuration: 0,
      teamMembers: 10,
      platforms: ['TikTok', 'Instagram', 'X', 'YouTube'],
      features: ['basic_generation', 'basic_templates', 'advanced_templates', 'export_formats', 'batch_generation', 'team_collaboration', 'performance_analytics', 'api_access', 'white_label', 'priority_support'],
    },
  };

  /**
   * Check if user can generate content based on their plan and usage
   */
  canUserGenerate(
    userPlan: UserPlan,
    monthlyCount: number,
    trialGenerationsUsed: number,
    trialStartedAt?: Date,
    trialEndsAt?: Date
  ): UsageStatus {
    const limits = this.PLAN_LIMITS[userPlan];
    const now = new Date();

    if (userPlan === UserPlan.TRIAL) {
      return this.checkTrialLimits(trialGenerationsUsed, limits, trialStartedAt, trialEndsAt);
    }

    return this.checkMonthlyLimits(monthlyCount, limits, userPlan);
  }

  /**
   * Check trial-specific limits
   */
  private checkTrialLimits(
    trialGenerationsUsed: number,
    limits: PlanLimits,
    trialStartedAt?: Date,
    trialEndsAt?: Date
  ): UsageStatus {
    const now = new Date();

    // Check if trial has started
    if (!trialStartedAt) {
      return {
        canGenerate: true,
        remainingGenerations: limits.trialGenerations,
        limitType: 'trial',
        resetDate: new Date(now.getTime() + limits.trialDuration * 24 * 60 * 60 * 1000),
        trialStatus: {
          isActive: true,
          daysRemaining: limits.trialDuration,
          generationsRemaining: limits.trialGenerations,
        },
      };
    }

    // Check if trial has expired
    if (trialEndsAt && now > trialEndsAt) {
      return {
        canGenerate: false,
        remainingGenerations: 0,
        limitType: 'trial',
        resetDate: trialEndsAt,
        upgradeMessage: 'Free trial has expired. Please upgrade to continue creating ads.',
        trialStatus: {
          isActive: false,
          daysRemaining: 0,
          generationsRemaining: 0,
        },
      };
    }

    // Check trial generation limit
    if (trialGenerationsUsed >= limits.trialGenerations) {
      return {
        canGenerate: false,
        remainingGenerations: 0,
        limitType: 'trial',
        resetDate: trialEndsAt || new Date(),
        upgradeMessage: 'Trial generation limit of 15 reached. Upgrade to Starter plan for 50 generations/month.',
        trialStatus: {
          isActive: true,
          daysRemaining: trialEndsAt ? Math.ceil((trialEndsAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)) : 0,
          generationsRemaining: 0,
        },
      };
    }

    // Trial is active and has remaining generations
    const daysRemaining = trialEndsAt ? Math.ceil((trialEndsAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)) : 0;
    const generationsRemaining = limits.trialGenerations - trialGenerationsUsed;

    return {
      canGenerate: true,
      remainingGenerations: generationsRemaining,
      limitType: 'trial',
      resetDate: trialEndsAt || new Date(),
      trialStatus: {
        isActive: true,
        daysRemaining,
        generationsRemaining,
      },
    };
  }

  /**
   * Check monthly limits for paid plans
   */
  private checkMonthlyLimits(
    monthlyCount: number,
    limits: PlanLimits,
    userPlan: UserPlan
  ): UsageStatus {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const remainingGenerations = limits.monthlyGenerations - monthlyCount;

    if (remainingGenerations <= 0) {
      const upgradeMessage = this.getUpgradeMessage(userPlan);
      return {
        canGenerate: false,
        remainingGenerations: 0,
        limitType: 'monthly',
        resetDate: nextMonth,
        upgradeMessage,
      };
    }

    return {
      canGenerate: true,
      remainingGenerations,
      limitType: 'monthly',
      resetDate: nextMonth,
    };
  }

  /**
   * Get upgrade message based on current plan
   */
  private getUpgradeMessage(currentPlan: UserPlan): string {
    switch (currentPlan) {
      case UserPlan.STARTER:
        return 'Monthly generation limit of 50 reached. Upgrade to Pro for 200 generations/month.';
      case UserPlan.PRO:
        return 'Monthly generation limit of 200 reached. Upgrade to Agency for 500 generations/month.';
      default:
        return 'Generation limit reached. Please upgrade your plan.';
    }
  }

  /**
   * Get plan limits for a specific plan
   */
  getPlanLimits(plan: UserPlan): PlanLimits {
    return this.PLAN_LIMITS[plan];
  }

  /**
   * Check if user can access a specific feature
   */
  canAccessFeature(userPlan: UserPlan, feature: string): boolean {
    const limits = this.PLAN_LIMITS[userPlan];
    return limits.features.includes(feature);
  }

  /**
   * Check if user can access a specific platform
   */
  canAccessPlatform(userPlan: UserPlan, platform: string): boolean {
    const limits = this.PLAN_LIMITS[userPlan];
    return limits.platforms.includes(platform);
  }

  /**
   * Get team member limit for a plan
   */
  getTeamMemberLimit(userPlan: UserPlan): number {
    const limits = this.PLAN_LIMITS[userPlan];
    return limits.teamMembers;
  }

  /**
   * Check if user can add more team members
   */
  canAddTeamMember(userPlan: UserPlan, currentTeamSize: number): boolean {
    const limit = this.getTeamMemberLimit(userPlan);
    return currentTeamSize < limit;
  }
}
