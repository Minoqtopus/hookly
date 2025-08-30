/**
 * Centralized Pricing Types
 * 
 * Single source of truth for all pricing-related configurations
 * Used by both backend business logic and frontend display
 */

export interface PricingFeature {
  name: string;
  description?: string;
  included: boolean;
  limit?: number | 'unlimited';
}

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  
  // Pricing
  monthlyPrice: number; // in cents
  yearlyPrice: number;  // in cents
  yearlyDiscount: number; // percentage
  
  // Core limits
  generationsPerMonth: number | 'unlimited';
  
  // Platform access
  platforms: string[];
  
  // Features
  features: PricingFeature[];
  
  // AI model access
  aiModel: 'standard' | 'premium' | 'enterprise';
  
  // Support level
  supportLevel: 'community' | 'email' | 'priority' | 'dedicated';
  
  // Display options
  isRecommended: boolean;
  isPopular: boolean;
  badge?: string;
  
  // Business logic
  isActive: boolean;
  sortOrder: number;
}

export interface TrialConfiguration {
  durationDays: number;
  generationsTotal: number;
  generationsUnverified: number;
  generationsVerified: number;
  platforms: string[];
  aiModel: 'standard' | 'premium';
  requiresEmailVerification: boolean;
}

export interface PricingConfiguration {
  trial: TrialConfiguration;
  tiers: PricingTier[];
  currency: string;
  currencySymbol: string;
  billingCycles: ('monthly' | 'yearly')[];
  
  // Marketing copy
  headline: string;
  subheadline: string;
  ctaText: string;
  
  // Feature comparisons
  allFeatures: string[];
  
  // Last updated (for cache invalidation)
  lastUpdated: string;
  version: string;
}