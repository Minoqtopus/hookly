/**
 * AI CONTENT QUALITY TIER SYSTEM
 * 
 * Aligns content quality with pricing strategy to drive conversions
 * and maintain sustainable costs while maximizing user value perception
 */

import { UserPlan } from '../entities/user.entity';

export interface ContentQualityTier {
  planType: UserPlan | 'demo';
  aiModel: 'basic' | 'standard' | 'premium';
  promptComplexity: 'simple' | 'advanced' | 'world-class';
  psychologicalTriggers: number; // How many triggers to include
  viralElementsCount: number; // Number of viral mechanics
  hookOptimization: 'basic' | 'advanced' | 'expert';
  contentLength: 'short' | 'medium' | 'long';
  personalization: 'generic' | 'targeted' | 'hyper-personalized';
  engagementOptimization: boolean;
  platformSpecificOptimization: boolean;
  competitorAnalysis: boolean;
  trendIntegration: boolean;
  controversyCalibration: 'none' | 'mild' | 'balanced';
}

/**
 * STRATEGIC QUALITY TIERS
 * Each tier is designed to create clear upgrade incentives
 */
export const CONTENT_QUALITY_TIERS: ContentQualityTier[] = [
  // DEMO TIER - Just enough to show value, not enough to replace paid tiers
  {
    planType: 'demo',
    aiModel: 'basic',
    promptComplexity: 'simple',
    psychologicalTriggers: 2, // Limited triggers
    viralElementsCount: 1, // Basic viral mechanics only
    hookOptimization: 'basic',
    contentLength: 'short', // 30-40 word scripts
    personalization: 'generic', // No audience targeting
    engagementOptimization: false, // No engagement hooks
    platformSpecificOptimization: false, // Generic content
    competitorAnalysis: false,
    trendIntegration: false,
    controversyCalibration: 'none' // Play it safe
  },

  // TRIAL TIER - Good enough to be useful, missing key features
  {
    planType: UserPlan.TRIAL,
    aiModel: 'standard',
    promptComplexity: 'simple',
    psychologicalTriggers: 3, // More triggers but basic
    viralElementsCount: 2, // Limited viral mechanics
    hookOptimization: 'basic',
    contentLength: 'medium', // 50-80 word scripts
    personalization: 'targeted', // Basic audience awareness
    engagementOptimization: false, // No engagement optimization
    platformSpecificOptimization: true, // Platform-specific but basic
    competitorAnalysis: false,
    trendIntegration: false,
    controversyCalibration: 'none' // No controversy for trial users
  },

  // STARTER TIER - Solid value, missing advanced features
  {
    planType: UserPlan.STARTER,
    aiModel: 'standard',
    promptComplexity: 'advanced',
    psychologicalTriggers: 5, // More psychological depth
    viralElementsCount: 3, // Multiple viral mechanics
    hookOptimization: 'advanced',
    contentLength: 'medium', // 80-120 word scripts
    personalization: 'targeted', // Good audience targeting
    engagementOptimization: true, // Basic engagement hooks
    platformSpecificOptimization: true, // Platform-optimized
    competitorAnalysis: false, // Missing this key feature
    trendIntegration: false, // No trend integration
    controversyCalibration: 'mild' // Safe controversy
  },

  // PRO TIER - World-class everything, justify premium pricing
  {
    planType: UserPlan.PRO,
    aiModel: 'premium',
    promptComplexity: 'world-class',
    psychologicalTriggers: 8, // Maximum psychological optimization
    viralElementsCount: 6, // All viral mechanics
    hookOptimization: 'expert',
    contentLength: 'long', // 120-200 word scripts with depth
    personalization: 'hyper-personalized', // Deep audience profiling
    engagementOptimization: true, // Advanced engagement optimization
    platformSpecificOptimization: true, // Perfect platform integration
    competitorAnalysis: true, // Competitive intelligence
    trendIntegration: true, // Real-time trend integration
    controversyCalibration: 'balanced' // Strategic controversy
  }
];

/**
 * COST OPTIMIZATION STRATEGIES
 * Keep costs sustainable while maximizing perceived value
 */
export const COST_OPTIMIZATION_RULES = {
  // Demo users get basic prompts - low API costs
  demo: {
    maxTokens: 200, // Short responses
    temperature: 0.7, // Standard creativity
    enableStreaming: false, // No real-time streaming
    useAdvancedPrompts: false
  },

  // Trial users get better content but limited features
  trial: {
    maxTokens: 400, // Medium responses
    temperature: 0.8, // More creativity
    enableStreaming: true, // Real-time experience
    useAdvancedPrompts: false // Standard prompts only
  },

  // Starter users get good value with some limitations
  starter: {
    maxTokens: 600, // Good length responses
    temperature: 0.9, // High creativity
    enableStreaming: true, // Full streaming experience
    useAdvancedPrompts: true // Advanced prompts
  },

  // Pro users get premium everything - justify the price
  pro: {
    maxTokens: 1000, // Long, detailed responses
    temperature: 1.0, // Maximum creativity
    enableStreaming: true, // Full streaming
    useAdvancedPrompts: true, // World-class prompts
    enableRetries: true, // Quality assurance
    multipleVariants: true // Generate multiple options
  }
};

/**
 * VALUE PERCEPTION ENHANCERS
 * Features that create high perceived value at low cost
 */
export const VALUE_ENHANCERS = {
  // Show quality differences clearly
  qualityIndicators: {
    demo: 'Basic AI Content',
    trial: 'Standard AI Content', 
    starter: 'Advanced AI Content',
    pro: 'Premium AI Content + Competitive Analysis'
  },

  // Feature explanations for users
  featureExplanations: {
    psychologicalTriggers: 'Advanced psychology for maximum engagement',
    viralElements: 'Proven viral mechanics that drive shares',
    competitorAnalysis: 'AI analyzes top-performing content in your niche',
    trendIntegration: 'Real-time trend integration for maximum relevance',
    controversyCalibration: 'Strategic controversy for discussion generation'
  },

  // Upgrade prompts based on tier
  upgradePrompts: {
    demo: 'Get 5 free generations with trial signup →',
    trial: 'Unlock advanced viral psychology with Starter →',
    starter: 'Get competitor analysis & trend integration with Pro →'
  }
};

/**
 * Get quality tier configuration for a user plan
 */
export function getContentQualityTier(planType: UserPlan | 'demo'): ContentQualityTier {
  const tier = CONTENT_QUALITY_TIERS.find(t => t.planType === planType);
  if (!tier) {
    console.warn(`No quality tier found for plan: ${planType}, using demo tier`);
    return CONTENT_QUALITY_TIERS[0]; // Fallback to demo tier
  }
  return tier;
}

/**
 * Get cost optimization rules for a user plan  
 */
export function getCostOptimization(planType: UserPlan | 'demo'): any {
  const planKey = planType === UserPlan.TRIAL ? 'trial' 
    : planType === UserPlan.STARTER ? 'starter'
    : planType === UserPlan.PRO ? 'pro' 
    : 'demo';
    
  return COST_OPTIMIZATION_RULES[planKey];
}

/**
 * Check if user should see upgrade prompt
 */
export function getUpgradePrompt(planType: UserPlan | 'demo'): string {
  const planKey = planType === UserPlan.TRIAL ? 'trial' 
    : planType === UserPlan.STARTER ? 'starter'
    : planType === UserPlan.PRO ? 'pro' 
    : 'demo';
    
  return VALUE_ENHANCERS.upgradePrompts[planKey] || '';
}

/**
 * Get quality indicator for UI display
 */
export function getQualityIndicator(planType: UserPlan | 'demo'): string {
  const planKey = planType === UserPlan.TRIAL ? 'trial' 
    : planType === UserPlan.STARTER ? 'starter'
    : planType === UserPlan.PRO ? 'pro' 
    : 'demo';
    
  return VALUE_ENHANCERS.qualityIndicators[planKey] || 'Basic Content';
}