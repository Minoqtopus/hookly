/**
 * User Plan Domain Model
 * 
 * Encapsulates business logic related to user plans, limits, and features.
 * This separates business rules from data access concerns.
 * 
 * Staff Engineer Note: Domain models are the heart of clean architecture.
 * They encapsulate business rules and make the system easier to test and maintain.
 */

import { UserPlan } from '../../entities/user.entity';
import { BUSINESS_CONSTANTS, getGenerationLimit, isPlatformAvailable } from '../../constants/business-rules';

export interface PlatformAccess {
  tiktok: boolean;
  instagram: boolean;
  youtube: boolean;
}

export interface GenerationLimits {
  total?: number; // For trial users
  monthly?: number; // For paid users
  remaining: number;
  resetDate?: Date;
}

export interface PlanFeatures {
  platforms: string[];
  batchGeneration: boolean;
  prioritySupport: boolean;
  advancedAnalytics: boolean;
}

/**
 * User Plan Domain Model
 * 
 * Represents a user's subscription plan with all associated business logic
 */
export class UserPlanModel {
  constructor(
    public readonly plan: UserPlan,
    public readonly isActive: boolean,
    public readonly trialEndsAt?: Date,
    public readonly currentGenerationsUsed: number = 0,
    public readonly trialGenerationsUsed: number = 0,
    public readonly monthlyResetDate?: Date
  ) {}

  /**
   * Check if user has access to a specific platform
   */
  hasAccessToPlatform(platform: string): boolean {
    return isPlatformAvailable(this.plan, platform);
  }

  /**
   * Get platform access configuration
   */
  getPlatformAccess(): PlatformAccess {
    return {
      tiktok: this.hasAccessToPlatform('tiktok'),
      instagram: this.hasAccessToPlatform('instagram'),  
      youtube: this.hasAccessToPlatform('youtube')
    };
  }

  /**
   * Get generation limits for this plan
   */
  getGenerationLimits(): GenerationLimits {
    const now = new Date();
    const currentMonth = now.getMonth();
    const resetMonth = this.monthlyResetDate ? this.monthlyResetDate.getMonth() : -1;
    const needsMonthlyReset = currentMonth !== resetMonth;

    if (this.plan === UserPlan.TRIAL) {
      const trialLimit = BUSINESS_CONSTANTS.GENERATION_LIMITS.TRIAL_TOTAL;
      return {
        total: trialLimit,
        remaining: Math.max(0, trialLimit - this.trialGenerationsUsed)
      };
    } else {
      const monthlyLimit = getGenerationLimit(this.plan);
      const currentCount = needsMonthlyReset ? 0 : this.currentGenerationsUsed;
      
      return {
        monthly: monthlyLimit,
        remaining: Math.max(0, monthlyLimit - currentCount),
        resetDate: needsMonthlyReset ? now : this.monthlyResetDate
      };
    }
  }

  /**
   * Check if user can create another generation
   */
  canCreateGeneration(): boolean {
    // Check if trial has expired
    if (this.plan === UserPlan.TRIAL && this.trialEndsAt && new Date() > this.trialEndsAt) {
      return false;
    }

    // Check generation limits
    const limits = this.getGenerationLimits();
    return limits.remaining > 0;
  }

  /**
   * Get plan features
   */
  getFeatures(): PlanFeatures {
    return {
      platforms: this.getAvailablePlatforms(),
      batchGeneration: this.plan === UserPlan.PRO,
      prioritySupport: this.plan === UserPlan.PRO,
      advancedAnalytics: this.plan === UserPlan.PRO
    };
  }

  /**
   * Get available platforms as array
   */
  private getAvailablePlatforms(): string[] {
    const access = this.getPlatformAccess();
    const platforms: string[] = [];
    
    if (access.tiktok) platforms.push('tiktok');
    if (access.instagram) platforms.push('instagram');
    if (access.youtube) platforms.push('youtube');
    
    return platforms;
  }

  /**
   * Check if plan needs upgrade for specific feature
   */
  needsUpgradeFor(feature: 'youtube' | 'batch' | 'advanced_analytics'): UserPlan | null {
    switch (feature) {
      case 'youtube':
        return this.plan === UserPlan.PRO ? null : UserPlan.PRO;
      case 'batch':
        return this.plan === UserPlan.PRO ? null : UserPlan.PRO;  
      case 'advanced_analytics':
        return this.plan === UserPlan.PRO ? null : UserPlan.PRO;
      default:
        return null;
    }
  }

  /**
   * Get plan display information
   */
  getDisplayInfo() {
    const limits = this.getGenerationLimits();
    const features = this.getFeatures();
    
    return {
      name: this.plan.charAt(0).toUpperCase() + this.plan.slice(1),
      isActive: this.isActive,
      limits,
      features,
      platformAccess: this.getPlatformAccess()
    };
  }

  /**
   * Create UserPlanModel from user entity data
   */
  static fromUserEntity(userData: {
    plan: UserPlan;
    trial_ends_at?: Date;
    monthly_generation_count: number;
    trial_generations_used: number;
    monthly_reset_date?: Date;
  }): UserPlanModel {
    return new UserPlanModel(
      userData.plan,
      true, // Assuming active if user exists
      userData.trial_ends_at,
      userData.monthly_generation_count,
      userData.trial_generations_used,
      userData.monthly_reset_date
    );
  }
}