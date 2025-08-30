/**
 * Business Rules and Constants
 * 
 * CRITICAL: These constants implement what the tests demand as business requirements.
 * Tests are the source of truth for business logic - this file ensures code matches tests.
 * 
 * TDD Staff Engineer Approach: Tests define business requirements, code implements them.
 * If tests need different values, update tests first, then update this file to match.
 */

import { UserPlan } from '../entities/user.entity';
import { UserGenerationLimits, PlatformSpecifications } from '../types/external-apis';
// IMPORTANT: Pricing logic now centralized in pricing.config.ts
import { 
  getGenerationLimit as getPricingGenerationLimit, 
  getPlatformAccess as getPricingPlatformAccess 
} from '../pricing/pricing.config';

// ================================
// Plan Limits and Features
// ================================

// DEPRECATED: Legacy plan limits for test compatibility only
// NEW VALUES NOW COME FROM pricing.config.ts - SINGLE SOURCE OF TRUTH
export const PLAN_LIMITS: UserGenerationLimits = {
  trial: {
    total: 5, // UPDATED: Now matches pricing.config.ts (5 generations for trial)
    platforms: ['tiktok', 'instagram'], // UPDATED: Now matches pricing.config.ts
    durationDays: 7 // Kept for test compatibility
  },
  starter: {
    monthly: 50, // UPDATED: Now matches pricing.config.ts
    platforms: ['tiktok', 'instagram'] // UPDATED: Now matches pricing.config.ts
  },
  pro: {
    monthly: 200, // UPDATED: Now matches pricing.config.ts
    platforms: ['tiktok', 'instagram'], // UPDATED: Removed YouTube, now matches pricing.config.ts
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

// REMOVED: Platform access now centralized in pricing.config.ts (SINGLE SOURCE OF TRUTH)

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
  // Password requirements - TEST DRIVEN VALUES
  MIN_PASSWORD_LENGTH: 8,
  BCRYPT_ROUNDS: 12, // TEST REQUIREMENT: password-management.service.test.ts expects 12 rounds
  
  // Token expiration (in milliseconds)
  JWT_ACCESS_TOKEN_EXPIRE_TIME: 15 * 60 * 1000, // 15 minutes
  JWT_REFRESH_TOKEN_EXPIRE_TIME: 7 * 24 * 60 * 60 * 1000, // 7 days
  EMAIL_VERIFICATION_EXPIRE_TIME: 24 * 60 * 60 * 1000, // 24 hours
  PASSWORD_RESET_EXPIRE_TIME: 60 * 60 * 1000, // TEST REQUIREMENT: password-management.service.test.ts expects 1-hour expiry
  
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

// CRITICAL: These constants implement test-defined business requirements
export const BUSINESS_CONSTANTS = {
  // Generation limits - NOW DELEGATES TO PRICING.CONFIG.TS (SINGLE SOURCE OF TRUTH)
  GENERATION_LIMITS: {
    // SIMPLIFIED: No more email verification dependency, matches pricing.config.ts
    TRIAL_UNVERIFIED: 5, // UPDATED: Now matches pricing.config.ts (5 generations total)
    TRIAL_VERIFIED: 5, // UPDATED: Now matches pricing.config.ts (simplified, no email verification complexity)
    TRIAL_TOTAL: 5, // UPDATED: Now matches pricing.config.ts (5 generations total)
    STARTER_MONTHLY: 50, // UPDATED: Confirmed match with pricing.config.ts  
    PRO_MONTHLY: 200 // UPDATED: Confirmed match with pricing.config.ts
  },
  
  // Trial settings - TEST DRIVEN
  TRIAL_DURATION_DAYS: 7, // TEST SOURCE: core-authentication.service.test.ts expects 7-day trial
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
 * Helper function to get generation limit by plan and email verification status
 * 
 * IMPORTANT: This now delegates to centralized pricing configuration
 * Maintains backward compatibility while using single source of truth
 * 
 * @param plan User plan
 * @param isEmailVerified Whether user's email is verified (only affects trial)
 * @returns Generation limit for the plan
 */
export function getGenerationLimit(plan: UserPlan, isEmailVerified: boolean = true): number {
  // Delegate to centralized pricing system (simplified - no email verification dependency)
  return getPricingGenerationLimit(plan);
}

// REMOVED: getGenerationLimitLegacy function to prevent inconsistent limit calculations

/**
 * Helper function to check if platform is available for plan
 * 
 * IMPORTANT: This now delegates to centralized pricing configuration
 * 
 * @param plan User plan
 * @param platform Platform to check
 * @returns Boolean indicating if platform is available
 */
export function isPlatformAvailable(plan: UserPlan, platform: string): boolean {
  // Delegate to centralized pricing system
  const availablePlatforms = getPricingPlatformAccess(plan);
  return availablePlatforms.includes(platform);
}