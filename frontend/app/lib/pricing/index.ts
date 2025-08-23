// Centralized pricing data structure for reuse across the app
export type PlanId = 'TRIAL' | 'STARTER' | 'PRO';

export interface PricingPlan {
  id: PlanId;
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  generationLimit: number;
  platforms: string[];
  batchGeneration: boolean;
  analytics: 'basic' | 'advanced';
  popular: boolean;
}

export interface PricingData {
  plans: PricingPlan[];
  trialLimit: number;
  costPerGeneration: {
    starter: string;
    pro: string;
  };
  comparison: {
    freelancer: { cost: string; description: string };
    starter: { cost: string; description: string };
    pro: { cost: string; description: string };
  };
}

// Main pricing configuration
export const pricingConfig: PricingData = {
  plans: [
    {
      id: 'STARTER',
      name: 'STARTER',
      price: '$19',
      period: '/month',
      description: 'Perfect for individual creators, marketers, and small businesses',
      features: [
        '50 generations per month',
        'TikTok + Instagram platform support',
        'Premium AI content generation',
        'Basic analytics'
      ],
      generationLimit: 50,
      platforms: ['TikTok', 'Instagram'],
      batchGeneration: false,
      analytics: 'basic',
      popular: false
    },
    {
      id: 'PRO',
      name: 'PRO',
      price: '$59',
      period: '/month',
      description: 'Ideal for growing businesses and marketing teams',
      features: [
        '200 generations per month',
        'TikTok + Instagram + X support',
        'Enhanced AI models',
        'Batch generation (up to 10)',
        'Advanced analytics'
      ],
      generationLimit: 200,
      platforms: ['TikTok', 'Instagram', 'X'],
      batchGeneration: true,
      analytics: 'advanced',
      popular: true
    }
  ],
  trialLimit: 15,
  costPerGeneration: {
    starter: '$0.38',
    pro: '$0.30'
  },
  comparison: {
    freelancer: { cost: '$50-200', description: 'per ad script' },
    starter: { cost: '$0.38', description: 'per generation' },
    pro: { cost: '$0.30', description: 'per generation' }
  }
};

// Helper functions
export const getPlanById = (planId: PlanId): PricingPlan | undefined => {
  return pricingConfig.plans.find(plan => plan.id === planId);
};

export const getTrialLimit = (): number => {
  return pricingConfig.trialLimit;
};

export const getPlanByName = (name: string): PricingPlan | undefined => {
  return pricingConfig.plans.find(plan => plan.name.toLowerCase() === name.toLowerCase());
};