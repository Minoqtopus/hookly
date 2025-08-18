// Plan configuration - centralized place for all plan-related constants
// This should eventually be fetched from the backend

export interface PlanConfig {
  id: string;
  name: string;
  displayName: string;
  generationsPerMonth: number;
  price: {
    monthly: number;
    annual?: number;
  };
  features: string[];
  isPopular?: boolean;
}

export const PLAN_CONFIGS: Record<string, PlanConfig> = {
  trial: {
    id: 'trial',
    name: 'trial',
    displayName: 'Free Trial',
    generationsPerMonth: 15, // Actually trial total, not monthly
    price: {
      monthly: 0
    },
    features: [
      '15 total generations during trial',
      'Basic templates',
      'Copy to clipboard',
      '7-day trial period'
    ]
  },
  creator: {
    id: 'creator',
    name: 'creator',
    displayName: 'Creator',
    generationsPerMonth: 150,
    price: {
      monthly: 29,
      annual: 290 // ~$24/month when billed annually
    },
    features: [
      '150 generations/month',
      'All viral ad templates',
      'Performance analytics',
      'Script & visual suggestions',
      'Copy to clipboard tools',
      'Priority support'
    ],
    isPopular: true
  },
  agency: {
    id: 'agency',
    name: 'agency',
    displayName: 'Agency',
    generationsPerMonth: 500,
    price: {
      monthly: 79,
      annual: 790 // ~$66/month when billed annually
    },
    features: [
      '500 generations/month',
      'Everything in Creator plan',
      'Team collaboration tools',
      'Batch ad generation',
      'Priority support',
      'White-label options'
    ]
  }
};

// Helper functions
export function getPlanConfig(planId: string): PlanConfig | null {
  return PLAN_CONFIGS[planId] || null;
}

export function getTrialLimit(): number {
  return PLAN_CONFIGS.trial.generationsPerMonth;
}

export function getCreatorLimit(): number {
  return PLAN_CONFIGS.creator.generationsPerMonth;
}

export function getAgencyLimit(): number {
  return PLAN_CONFIGS.agency.generationsPerMonth;
}

// NOTE: These are placeholder values and should be replaced with backend API calls
// TODO: Create API endpoints to fetch plan configurations dynamically
// TODO: Connect to backend pricing and plan management system