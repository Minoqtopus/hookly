/**
 * Pricing Service
 * 
 * Provides centralized access to pricing configuration
 * Serves both internal business logic and public API endpoints
 */

import { Injectable } from '@nestjs/common';
import { PRICING_CONFIG, getPricingTier, getGenerationLimit, getPlatformAccess, getTrialConfig } from './pricing.config';
import { PricingConfiguration, PricingTier, TrialConfiguration } from './pricing.types';
import { UserPlan } from '../entities/user.entity';

@Injectable()
export class PricingService {
  
  /**
   * Get complete pricing configuration for frontend
   */
  getPricingConfiguration(): PricingConfiguration {
    return PRICING_CONFIG;
  }

  /**
   * Get specific pricing tier
   */
  getPricingTier(planId: string): PricingTier | null {
    return getPricingTier(planId);
  }

  /**
   * Get generation limit for a plan (used by business logic)
   */
  getGenerationLimit(planId: string, isEmailVerified: boolean = true): number {
    // Handle trial plan with email verification logic
    if (planId === UserPlan.TRIAL) {
      const trialConfig = getTrialConfig();
      return isEmailVerified 
        ? trialConfig.generationsVerified 
        : trialConfig.generationsUnverified;
    }
    
    return getGenerationLimit(planId);
  }

  /**
   * Get platform access for a plan (used by business logic)
   */
  getPlatformAccess(planId: string): string[] {
    if (planId === UserPlan.TRIAL) {
      return getTrialConfig().platforms;
    }
    
    return getPlatformAccess(planId);
  }

  /**
   * Check if platform is available for plan
   */
  isPlatformAvailable(planId: string, platform: string): boolean {
    const availablePlatforms = this.getPlatformAccess(planId);
    return availablePlatforms.includes(platform);
  }

  /**
   * Get trial configuration
   */
  getTrialConfiguration(): TrialConfiguration {
    return getTrialConfig();
  }

  /**
   * Get all active pricing tiers
   */
  getActivePricingTiers(): PricingTier[] {
    return PRICING_CONFIG.tiers.filter(tier => tier.isActive);
  }

  /**
   * Get pricing for specific billing cycle
   */
  getPricingForBillingCycle(billingCycle: 'monthly' | 'yearly'): PricingTier[] {
    return this.getActivePricingTiers().map(tier => ({
      ...tier,
      displayPrice: billingCycle === 'yearly' ? tier.yearlyPrice : tier.monthlyPrice
    }));
  }

  /**
   * Validate if plan upgrade is needed for platform
   */
  validatePlatformAccess(currentPlan: string, requestedPlatform: string): {
    hasAccess: boolean;
    requiredPlan?: string;
  } {
    const hasAccess = this.isPlatformAvailable(currentPlan, requestedPlatform);
    
    if (hasAccess) {
      return { hasAccess: true };
    }

    // Find the minimum plan that has access to this platform
    const availableTiers = this.getActivePricingTiers()
      .filter(tier => tier.platforms.includes(requestedPlatform))
      .sort((a, b) => a.sortOrder - b.sortOrder);

    return {
      hasAccess: false,
      requiredPlan: availableTiers[0]?.id
    };
  }
}