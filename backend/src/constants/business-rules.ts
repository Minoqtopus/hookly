/**
 * Business Rules and Constants
 * 
 * This file centralizes all business logic constants to eliminate magic numbers
 * scattered throughout the codebase. This follows the DRY principle and makes
 * business rule changes easier to implement and test.
 * 
 * Staff Engineer Note: Centralizing business constants is critical for maintainability.
 * When business rules change (and they will), we only need to update them in one place.
 */

import { UserPlan } from '../entities/user.entity';
import { UserGenerationLimits, PlatformSpecifications } from '../types/external-apis';

// ================================
// Plan Limits and Features
// ================================

export const PLAN_LIMITS: UserGenerationLimits = {
  trial: {
    total: 15,
    platforms: ['tiktok'],
    durationDays: 7
  },
  starter: {
    monthly: 50,
    platforms: ['tiktok', 'instagram']
  },
  pro: {
    monthly: 200,
    platforms: ['tiktok', 'instagram', 'youtube'],
    batchSize: 10
  }
};

/**
 * Plan pricing in USD cents
 * Using cents to avoid floating point precision issues
 */
export const PLAN_PRICING = {
  [UserPlan.STARTER]: 1900, // $19.00
  [UserPlan.PRO]: 5900      // $59.00
} as const;

/**
 * Platform access matrix by plan
 * Critical for enforcing platform restrictions
 */
export const PLATFORM_ACCESS = {
  [UserPlan.TRIAL]: {
    has_tiktok_access: true,
    has_instagram_access: false,
    has_youtube_access: false
  },
  [UserPlan.STARTER]: {
    has_tiktok_access: true,
    has_instagram_access: true,
    has_youtube_access: false
  },
  [UserPlan.PRO]: {
    has_tiktok_access: true,
    has_instagram_access: true,
    has_youtube_access: true
  }
} as const;

// ================================
// AI Content Generation Specs
// ================================

export const PLATFORM_SPECIFICATIONS: PlatformSpecifications = {
  tiktok: {
    length: '60-90 seconds of content (400-600 words)',
    style: 'Fast-paced, energetic, trend-focused',
    format: 'Quick tips, transformations, before/after',
    specialRequirements: [
      'Use relevant hashtags and trending sounds references',
      'Include hook in first 3 seconds',
      'Optimize for vertical video format',
      'Focus on retention and completion rate'
    ]
  },
  instagram: {
    length: '30-60 seconds (300-500 words)',
    style: 'Visually appealing, lifestyle-focused',
    format: 'Stories, carousels, reels',
    specialRequirements: [
      'Use Instagram-specific language and hashtags',
      'Focus on aesthetics and lifestyle benefits',
      'Optimize for engagement and saves',
      'Include clear call-to-action'
    ]
  },
  youtube: {
    length: '60 seconds to 3 minutes (400-1200 words)',
    style: 'Engaging, educational, entertaining',
    format: 'Hook, story, value, call-to-action',
    specialRequirements: [
      'Use YouTube Shorts format for under 60 seconds',
      'Focus on retention and watch time',
      'Include compelling thumbnail hooks',
      'Optimize for subscriber growth'
    ]
  }
};

// ================================
// Security and Rate Limiting
// ================================

export const SECURITY_CONSTANTS = {
  // Password requirements
  MIN_PASSWORD_LENGTH: 8,
  BCRYPT_ROUNDS: 12,
  
  // Token expiration (in milliseconds)
  JWT_ACCESS_TOKEN_EXPIRE_TIME: 15 * 60 * 1000, // 15 minutes
  JWT_REFRESH_TOKEN_EXPIRE_TIME: 7 * 24 * 60 * 60 * 1000, // 7 days
  EMAIL_VERIFICATION_EXPIRE_TIME: 24 * 60 * 60 * 1000, // 24 hours
  PASSWORD_RESET_EXPIRE_TIME: 60 * 60 * 1000, // 1 hour
  
  // Rate limiting
  GLOBAL_RATE_LIMIT: {
    limit: 100,
    ttl: 60 * 1000 // 1 minute
  },
  AUTH_RATE_LIMIT: {
    limit: 5,
    ttl: 60 * 60 * 1000 // 1 hour
  },
  GENERATION_RATE_LIMIT: {
    limit: 5,
    ttl: 60 * 60 * 1000 // 1 hour
  },
  
  // Trial abuse prevention
  MAX_TRIALS_PER_IP: 3,
  MAX_TRIALS_PER_USER_AGENT: 5,
  TRIAL_ABUSE_WINDOW_HOURS: 24
} as const;

// ================================
// Business Logic Constants
// ================================

export const BUSINESS_CONSTANTS = {
  // Generation limits
  GENERATION_LIMITS: {
    TRIAL_TOTAL: PLAN_LIMITS.trial.total,
    STARTER_MONTHLY: PLAN_LIMITS.starter.monthly,
    PRO_MONTHLY: PLAN_LIMITS.pro.monthly
  },
  
  // Trial settings
  TRIAL_DURATION_DAYS: PLAN_LIMITS.trial.durationDays,
  TRIAL_GRACE_PERIOD_HOURS: 24,
  
  // Performance simulation ranges (for realistic metrics)
  PERFORMANCE_RANGES: {
    VIEWS: {
      MIN: 20000,
      MAX: 100000
    },
    CTR: {
      MIN: 3.0,
      MAX: 7.0
    },
    CONVERSION_RATE: {
      MIN: 0.02,
      MAX: 0.07
    },
    ENGAGEMENT_RATE: {
      MIN: 5.0,
      MAX: 13.0
    }
  },
  
  // Content quality thresholds
  MIN_CONTENT_LENGTH: {
    TITLE: 10,
    HOOK: 20,
    SCRIPT: 100
  },
  
  MAX_CONTENT_LENGTH: {
    TITLE: 100,
    HOOK: 300,
    SCRIPT: 2000
  }
} as const;

// ================================
// Error Messages
// ================================

export const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY_EXISTS: 'Email already registered',
  WEAK_PASSWORD: 'Password does not meet security requirements',
  
  // Authorization
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions for this action',
  PLAN_UPGRADE_REQUIRED: 'This feature requires a plan upgrade',
  
  // Generation limits
  TRIAL_LIMIT_EXCEEDED: `Trial limit reached (${BUSINESS_CONSTANTS.GENERATION_LIMITS.TRIAL_TOTAL} generations). Upgrade to continue.`,
  MONTHLY_LIMIT_EXCEEDED: 'Monthly generation limit reached. Upgrade your plan or wait for next month.',
  TRIAL_EXPIRED: 'Trial period has expired. Upgrade to continue generating content.',
  
  // Platform access
  PLATFORM_NOT_AVAILABLE: 'This platform is not available on your current plan',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
  
  // System errors
  AI_SERVICE_UNAVAILABLE: 'AI service temporarily unavailable. Please try again.',
  PAYMENT_SERVICE_UNAVAILABLE: 'Payment system temporarily unavailable.',
  EMAIL_SERVICE_UNAVAILABLE: 'Email service temporarily unavailable.'
} as const;

// ================================
// Success Messages
// ================================

export const SUCCESS_MESSAGES = {
  USER_REGISTERED: 'Account created successfully',
  USER_LOGGED_IN: 'Logged in successfully',
  EMAIL_VERIFIED: 'Email verified successfully',
  PASSWORD_RESET: 'Password reset successfully',
  GENERATION_CREATED: 'Content generated successfully',
  PLAN_UPGRADED: 'Plan upgraded successfully',
  CHECKOUT_CREATED: 'Checkout session created successfully'
} as const;

/**
 * Helper function to get generation limit by plan
 * @param plan User plan
 * @returns Generation limit for the plan
 */
export function getGenerationLimit(plan: UserPlan): number {
  switch (plan) {
    case UserPlan.TRIAL:
      return BUSINESS_CONSTANTS.GENERATION_LIMITS.TRIAL_TOTAL;
    case UserPlan.STARTER:
      return BUSINESS_CONSTANTS.GENERATION_LIMITS.STARTER_MONTHLY;
    case UserPlan.PRO:
      return BUSINESS_CONSTANTS.GENERATION_LIMITS.PRO_MONTHLY;
    default:
      throw new Error(`Unknown plan: ${plan}`);
  }
}

/**
 * Helper function to check if platform is available for plan
 * @param plan User plan
 * @param platform Platform to check
 * @returns Boolean indicating if platform is available
 */
export function isPlatformAvailable(plan: UserPlan, platform: string): boolean {
  return PLAN_LIMITS[plan]?.platforms.includes(platform) || false;
}