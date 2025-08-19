// Plan configuration - centralized place for all plan-related constants
// This should eventually be fetched from the backend

export enum UserPlan {
  TRIAL = 'trial',
  STARTER = 'starter',
  PRO = 'pro',
  AGENCY = 'agency'
}

export interface PlanConfig {
  id: UserPlan;
  displayName: string;
  price: {
    monthly: number;
    yearly: number;
  };
  generationsPerMonth: number;
  features: string[];
  isPopular?: boolean;
  icon?: any;
}

export const PLAN_CONFIGS: Record<UserPlan, PlanConfig> = {
  [UserPlan.TRIAL]: {
    id: UserPlan.TRIAL,
    displayName: 'Trial',
    price: { monthly: 0, yearly: 0 },
    generationsPerMonth: 15,
    features: [
      '7-day free trial',
      '15 total generations',
      'TikTok platform support',
      '5 basic templates',
      'Basic analytics'
    ]
  },
  [UserPlan.STARTER]: {
    id: UserPlan.STARTER,
    displayName: 'Starter',
    price: { monthly: 19, yearly: 190 },
    generationsPerMonth: 50,
    features: [
      '50 generations per month',
      'TikTok + X platform support',
      '15+ templates',
      'Basic analytics',
      'Email support'
    ]
  },
  [UserPlan.PRO]: {
    id: UserPlan.PRO,
    displayName: 'Pro',
    price: { monthly: 59, yearly: 590 },
    generationsPerMonth: 200,
    features: [
      '200 generations per month',
      'TikTok + X + Instagram support',
      '50+ templates',
      'Batch generation (up to 10)',
      'Advanced analytics',
      'Team collaboration (up to 3 users)',
      'Priority support'
    ],
    isPopular: true
  },
  [UserPlan.AGENCY]: {
    id: UserPlan.AGENCY,
    displayName: 'Agency',
    price: { monthly: 129, yearly: 1290 },
    generationsPerMonth: 500,
    features: [
      '500 generations per month',
      'All platforms + API access',
      '100+ templates',
      'Batch generation (up to 25)',
      'Advanced analytics + team insights',
      'Team collaboration (up to 10 users)',
      'White-label options',
      'Dedicated support'
    ]
  }
};

export const getPlanConfig = (planId: string): PlanConfig | null => {
  const plan = Object.values(PLAN_CONFIGS).find(p => p.id === planId);
  return plan || null;
};

export const getTrialLimit = (): number => {
  return PLAN_CONFIGS[UserPlan.TRIAL].generationsPerMonth;
};

export const getStarterLimit = (): number => {
  return PLAN_CONFIGS[UserPlan.STARTER].generationsPerMonth;
};

export const getProLimit = (): number => {
  return PLAN_CONFIGS[UserPlan.PRO].generationsPerMonth;
};

export const getAgencyLimit = (): number => {
  return PLAN_CONFIGS[UserPlan.AGENCY].generationsPerMonth;
};

export const getPlanPrice = (planId: UserPlan, isYearly: boolean = false): number => {
  const plan = PLAN_CONFIGS[planId];
  if (!plan) return 0;
  return isYearly ? plan.price.yearly : plan.price.monthly;
};

export const getPlanFeatures = (planId: UserPlan): string[] => {
  const plan = PLAN_CONFIGS[planId];
  return plan ? plan.features : [];
};

export const isPopularPlan = (planId: UserPlan): boolean => {
  const plan = PLAN_CONFIGS[planId];
  return plan ? plan.isPopular || false : false;
};

// NOTE: These are placeholder values and should be replaced with backend API calls
// TODO: Create API endpoints to fetch plan configurations dynamically
// TODO: Connect to backend pricing and plan management system