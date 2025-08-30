/**
 * Centralized Pricing Configuration
 * 
 * SINGLE SOURCE OF TRUTH for all pricing across the platform
 * 
 * Staff Engineer Note: This replaces hardcoded values in:
 * - Frontend pricing page
 * - Backend business rules
 * - Generation limits
 * - Platform access controls
 */

import { PricingConfiguration, PricingTier, TrialConfiguration } from './pricing.types';
import { UserPlan } from '../entities/user.entity';

// Trial Configuration - CREATOR FOCUSED: 5 generations for both platforms
const TRIAL_CONFIG: TrialConfiguration = {
  durationDays: 7,
  generationsTotal: 5,
  generationsUnverified: 5,
  generationsVerified: 5, // Same as unverified - keep it simple and conversion-focused
  platforms: ['tiktok', 'instagram'],
  aiModel: 'standard',
  requiresEmailVerification: false // No need to complicate with email verification
};

// Pricing Tiers - HONEST VALUE PROPOSITION (matches what we actually deliver)
const PRICING_TIERS: PricingTier[] = [
  {
    id: UserPlan.STARTER,
    name: 'Creator',
    description: 'Perfect for individual creators building their personal brand and content.',
    
    // Pricing - SIMPLIFIED AND COMPETITIVE
    monthlyPrice: 1500, // $15.00 - much more reasonable for what we deliver
    yearlyPrice: 1200,  // $12.00 (20% discount)
    yearlyDiscount: 20,
    
    // Core limits (HONEST - what we actually deliver)
    generationsPerMonth: 50,
    
    // Platform access (CREATOR FOCUSED - TikTok + Instagram)
    platforms: ['tiktok', 'instagram'],
    
    // Features (HONEST UGC CREATOR FEATURES)
    features: [
      { name: '50 UGC scripts per month', included: true },
      { name: 'TikTok & Instagram scripts', included: true },
      { name: 'AI script generation', included: true },
      { name: 'Real-time typewriter effect', included: true },
      { name: 'Copy & paste scripts', included: true }
    ],
    
    aiModel: 'standard',
    supportLevel: 'email',
    
    isRecommended: false,
    isPopular: true,
    badge: 'Most Popular',
    
    isActive: true,
    sortOrder: 1
  },
  {
    id: UserPlan.PRO,
    name: 'Business',
    description: 'For creators and agencies scaling their UGC content operations.',
    
    // Pricing - REASONABLE FOR BUSINESS USE
    monthlyPrice: 3900, // $39.00 - much more honest pricing
    yearlyPrice: 2900,  // $29.00 (26% discount)
    yearlyDiscount: 26,
    
    // Core limits (HONEST - what we actually deliver)
    generationsPerMonth: 200,
    
    // Platform access (CREATOR FOCUSED - TikTok + Instagram)
    platforms: ['tiktok', 'instagram'],
    
    // Features (HONEST UGC CREATOR FEATURES)
    features: [
      { name: '200 UGC scripts per month', included: true },
      { name: 'TikTok & Instagram scripts', included: true },
      { name: 'AI script generation', included: true },
      { name: 'Real-time typewriter effect', included: true },
      { name: 'Copy & paste scripts', included: true },
      { name: 'Use scripts commercially', included: true }
    ],
    
    aiModel: 'premium',
    supportLevel: 'priority',
    
    isRecommended: true,
    isPopular: false,
    badge: 'Best Value',
    
    isActive: true,
    sortOrder: 2
  }
];

// Complete Pricing Configuration
export const PRICING_CONFIG: PricingConfiguration = {
  trial: TRIAL_CONFIG,
  tiers: PRICING_TIERS,
  currency: 'USD',
  currencySymbol: '$',
  billingCycles: ['monthly', 'yearly'],
  
  // Marketing copy - CREATOR-FOCUSED UGC
  headline: 'Simple Pricing for Viral UGC Content',
  subheadline: 'Generate TikTok & Instagram scripts that actually convert. Perfect for creators building their brand. Start with 5 free scripts, then choose your plan. Cancel anytime.',
  ctaText: 'Start Creating',
  
  // All features for comparison - UGC CREATOR FOCUSED
  allFeatures: [
    'UGC scripts per month',
    'TikTok & Instagram scripts',
    'AI-powered viral hooks',
    'Real-time generation',
    'Product URL analyzer',
    'Support level',
    'Commercial usage rights'
  ],
  
  lastUpdated: new Date().toISOString(),
  version: '1.0.0'
};

// Helper functions for business logic
export function getPricingTier(planId: string): PricingTier | null {
  return PRICING_TIERS.find(tier => tier.id === planId) || null;
}

export function getGenerationLimit(planId: string): number {
  // Handle trial plan with simplified logic (5 generations regardless of email verification)
  if (planId === UserPlan.TRIAL) {
    return TRIAL_CONFIG.generationsTotal;
  }
  
  const tier = getPricingTier(planId);
  if (!tier) return 0;
  
  return typeof tier.generationsPerMonth === 'number' 
    ? tier.generationsPerMonth 
    : 999999; // unlimited
}

export function getPlatformAccess(planId: string): string[] {
  // Handle trial plan specially
  if (planId === UserPlan.TRIAL) {
    return TRIAL_CONFIG.platforms;
  }
  
  // Handle paid plans
  const tier = getPricingTier(planId);
  return tier ? tier.platforms : [];
}

export function getTrialConfig(): TrialConfiguration {
  return TRIAL_CONFIG;
}

export function formatPrice(priceInCents: number): string {
  return `$${(priceInCents / 100).toFixed(0)}`;
}

export function calculateYearlyDiscount(monthly: number, yearly: number): number {
  return Math.round((1 - (yearly * 12) / (monthly * 12)) * 100);
}