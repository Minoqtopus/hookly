/**
 * Pricing API Client
 * 
 * Fetches pricing configuration from backend API
 * Single source of truth for all pricing data
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

export interface PricingConfiguration {
  tiers: PricingTier[];
  currency: string;
  currencySymbol: string;
  billingCycles: ('monthly' | 'yearly')[];
  
  // Marketing copy
  headline: string;
  subheadline: string;
  ctaText: string;
  
  lastUpdated: string;
  version: string;
}

/**
 * Fetch pricing configuration from backend
 */
export async function fetchPricingConfig(): Promise<PricingConfiguration> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const response = await fetch(`${baseUrl}/pricing/config`, {
    headers: {
      'Accept': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
    cache: 'no-store',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch pricing config: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Format price from cents to display string
 */
export function formatPrice(priceInCents: number, symbol: string = '$'): string {
  return `${symbol}${(priceInCents / 100).toFixed(0)}`;
}

/**
 * Get pricing for specific billing cycle
 */
export function getPricingForBillingCycle(
  tiers: PricingTier[], 
  cycle: 'monthly' | 'yearly'
): (PricingTier & { displayPrice: number })[] {
  return tiers.map(tier => ({
    ...tier,
    displayPrice: cycle === 'yearly' ? tier.yearlyPrice : tier.monthlyPrice
  }));
}