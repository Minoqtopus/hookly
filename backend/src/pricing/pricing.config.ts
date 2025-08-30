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

// Trial Configuration - PROFIT FOCUSED: 5 generations max
const TRIAL_CONFIG: TrialConfiguration = {
  durationDays: 7,
  generationsTotal: 5,
  generationsUnverified: 5,
  generationsVerified: 5, // Same as unverified - keep it simple and conversion-focused
  platforms: ['tiktok'],
  aiModel: 'standard',
  requiresEmailVerification: false // No need to complicate with email verification
};

// Pricing Tiers (matches your current backend business logic)
const PRICING_TIERS: PricingTier[] = [
  {
    id: UserPlan.STARTER,
    name: 'Starter',
    description: 'Perfect for creators getting started with viral content.',
    
    // Pricing
    monthlyPrice: 2400, // $24.00
    yearlyPrice: 1900,  // $19.00 (20.8% discount)
    yearlyDiscount: 21,
    
    // Core limits (MATCHES BACKEND REALITY)
    generationsPerMonth: 50, // Backend gives 50, not 15!
    
    // Platform access
    platforms: ['tiktok', 'instagram'],
    
    // Features
    features: [
      { name: '50 AI generations per month', included: true },
      { name: 'TikTok & Instagram access', included: true },
      { name: 'Standard AI model', included: true },
      { name: 'Basic performance analytics', included: true },
      { name: 'Email support', included: true },
      { name: 'Content templates library', included: true }
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
    name: 'Pro',
    description: 'For serious creators scaling their content strategy.',
    
    // Pricing
    monthlyPrice: 5900, // $59.00
    yearlyPrice: 4900,  // $49.00 (17% discount)
    yearlyDiscount: 17,
    
    // Core limits (MATCHES BACKEND REALITY)
    generationsPerMonth: 200, // Backend gives 200, not 50!
    
    // Platform access
    platforms: ['tiktok', 'instagram', 'youtube'],
    
    // Features
    features: [
      { name: '200 AI generations per month', included: true },
      { name: 'All platforms (TikTok, Instagram, YouTube)', included: true },
      { name: 'Premium AI model (GPT-4)', included: true },
      { name: 'Advanced performance analytics', included: true },
      { name: 'Priority email support', included: true },
      { name: 'Content templates library', included: true },
      { name: 'Brand voice training', included: true, limit: 3 },
      { name: 'Content calendar', included: true },
      { name: 'Batch generation (up to 10)', included: true },
      { name: 'Early access to new features', included: true }
    ],
    
    aiModel: 'premium',
    supportLevel: 'priority',
    
    isRecommended: true,
    isPopular: false,
    badge: 'Recommended',
    
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
  
  // Marketing copy
  headline: 'Pricing Plans for Every Creator',
  subheadline: 'Choose the plan that fits your content creation needs. Cancel anytime.',
  ctaText: 'Get Started',
  
  // All features for comparison
  allFeatures: [
    'AI generations per month',
    'Platform access',
    'AI model quality',
    'Performance analytics',
    'Support level',
    'Brand voice training',
    'Content calendar',
    'Batch generation',
    'Early access to features'
  ],
  
  lastUpdated: new Date().toISOString(),
  version: '1.0.0'
};

// Helper functions for business logic
export function getPricingTier(planId: string): PricingTier | null {
  return PRICING_TIERS.find(tier => tier.id === planId) || null;
}

export function getGenerationLimit(planId: string, isEmailVerified?: boolean): number {
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