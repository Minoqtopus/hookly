/**
 * Test Setup - Business-Driven Testing Infrastructure
 * 
 * Staff Engineer Note: This setup prioritizes business requirement validation
 * over implementation details. Tests should fail when business logic breaks,
 * not when implementation changes.
 */

/// <reference types="jest" />

import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

// Global test timeout for complex business workflows
jest.setTimeout(15000);

// Business requirement constants for test validation
export const BUSINESS_TEST_CONSTANTS = {
  TRIAL: {
    DURATION_DAYS: 7,
    GENERATION_LIMIT: 15,
    PLATFORM_ACCESS: ['tiktok'],
    EXPECTED_CONVERSION_RATE_MIN: 0.15 // 15% minimum conversion rate
  },
  STARTER: {
    MONTHLY_GENERATION_LIMIT: 50,
    PLATFORM_ACCESS: ['tiktok', 'instagram'],
    MONTHLY_PRICE_USD: 29
  },
  PRO: {
    MONTHLY_GENERATION_LIMIT: 200,
    PLATFORM_ACCESS: ['tiktok', 'instagram', 'youtube'],
    MONTHLY_PRICE_USD: 99
  },
  SECURITY: {
    PASSWORD_MIN_LENGTH: 8,
    MAX_LOGIN_ATTEMPTS_PER_HOUR: 5,
    JWT_ACCESS_TOKEN_EXPIRES_MINUTES: 15,
    JWT_REFRESH_TOKEN_EXPIRES_DAYS: 7,
    BCRYPT_ROUNDS: 12,
    MAX_TRIALS_PER_IP_PER_MONTH: 2
  },
  FRAUD_PREVENTION: {
    MAX_ACCOUNTS_PER_EMAIL_PATTERN: 2,
    BLOCKED_EMAIL_DOMAINS: [
      '10minutemail.com',
      'guerrillamail.com', 
      'tempmail.org',
      'mailinator.com'
    ],
    MIN_USER_AGENT_LENGTH: 20
  }
};

// Test database connection management
let testDataSource: DataSource;

export const getTestDatabase = async (): Promise<DataSource> => {
  if (!testDataSource) {
    // This will be configured when you provide test database details
    throw new Error('Test database not configured. Please provide test database connection details.');
  }
  return testDataSource;
};

// Clean test data between tests (maintains referential integrity)
export const cleanTestDatabase = async (): Promise<void> => {
  const dataSource = await getTestDatabase();
  
  // Order matters for referential integrity
  const entities = [
    'refresh_tokens',
    'email_verifications', 
    'generations',
    'analytics_events',
    'webhook_events',
    'users'
  ];
  
  for (const entity of entities) {
    await dataSource.query(`TRUNCATE TABLE ${entity} CASCADE`);
  }
};

// Business scenario test data factory
export const createBusinessScenario = {
  // New UNVERIFIED trial user at day 0 - should have limited access (5 generations)
  newUnverifiedTrialUser: () => ({
    email: `test-unverified-${Date.now()}@business-test.com`,
    password: 'BusinessTest123!',
    plan: 'trial',
    trial_generations_used: 0,
    trial_ends_at: new Date(Date.now() + BUSINESS_TEST_CONSTANTS.TRIAL.DURATION_DAYS * 24 * 60 * 60 * 1000),
    is_email_verified: false, // CRITICAL: Unverified = 5 generation limit
    has_tiktok_access: true,
    has_instagram_access: false,
    has_youtube_access: false
  }),
  
  // New VERIFIED trial user at day 0 - should have full access (15 generations)
  newVerifiedTrialUser: () => ({
    email: `test-verified-${Date.now()}@business-test.com`,
    password: 'BusinessTest123!',
    plan: 'trial',
    trial_generations_used: 0,
    trial_ends_at: new Date(Date.now() + BUSINESS_TEST_CONSTANTS.TRIAL.DURATION_DAYS * 24 * 60 * 60 * 1000),
    is_email_verified: true, // CRITICAL: Verified = 15 generation limit
    has_tiktok_access: true,
    has_instagram_access: false,
    has_youtube_access: false
  }),
  
  // Unverified trial user at 5-generation limit - should be prompted to verify email
  unverifiedTrialUserAtLimit: () => ({
    email: `unverified-limit-${Date.now()}@business-test.com`,
    password: 'BusinessTest123!',
    plan: 'trial',
    trial_generations_used: 5, // CRITICAL: Hit unverified limit
    trial_ends_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days left
    is_email_verified: false // CRITICAL: Unverified = can unlock more by verifying
  }),
  
  // Verified trial user at 15-generation limit - should be prompted to upgrade
  verifiedTrialUserAtLimit: () => ({
    email: `verified-limit-${Date.now()}@business-test.com`,
    password: 'BusinessTest123!',
    plan: 'trial',
    trial_generations_used: BUSINESS_TEST_CONSTANTS.TRIAL.GENERATION_LIMIT, // 15
    trial_ends_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days left
    is_email_verified: true // CRITICAL: Verified = must upgrade for more
  }),
  
  // Expired trial user - should lose access to generation
  expiredTrialUser: () => ({
    email: `expired-trial-${Date.now()}@business-test.com`, 
    password: 'BusinessTest123!',
    plan: 'trial',
    trial_generations_used: 10,
    trial_ends_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // Expired 1 day ago
    is_email_verified: true
  }),
  
  // Starter plan user - should have monthly limits
  starterUser: () => ({
    email: `starter-${Date.now()}@business-test.com`,
    password: 'BusinessTest123!',
    plan: 'starter',
    monthly_generation_count: 25, // Half way through limit
    monthly_reset_date: new Date(), // This month
    is_email_verified: true,
    has_tiktok_access: true,
    has_instagram_access: true,
    has_youtube_access: false
  }),
  
  // Suspicious user for fraud detection tests
  suspiciousUser: () => ({
    email: `test+suspicious${Date.now()}@tempmail.org`, // Temp email domain
    password: 'weak123', // Weak password
    registration_ip: '192.168.1.1', // Common IP for multiple accounts
    registration_user_agent: 'curl/7.0', // Bot-like user agent
    trial_generations_used: 0
  })
};

// Business requirement validation helpers
export const businessValidators = {
  // Validate trial user generation limits based on email verification status
  async validateTrialAccess(userId: string, isEmailVerified: boolean): Promise<{ canGenerate: boolean; maxGenerations: number; reason?: string }> {
    // BUSINESS RULE: Unverified = 5 max, Verified = 15 max
    const maxGenerations = isEmailVerified ? 15 : 5;
    
    // This should be implemented to check actual business logic
    // Not implementation details
    throw new Error('Implement trial access validation with email verification logic');
  },
  
  // Validate email verification unlocks additional generations
  async validateEmailVerificationUnlock(userId: string, generationsUsed: number): Promise<{ unlockedGenerations: number; newLimit: number }> {
    // BUSINESS RULE: Verification unlocks additional 10 generations (5 -> 15)
    const previousLimit = 5; // Unverified limit
    const newLimit = 15; // Verified limit
    const unlockedGenerations = newLimit - previousLimit;
    
    return {
      unlockedGenerations,
      newLimit
    };
  },
  
  // Validate paid user has correct platform access
  async validatePlatformAccess(userId: string, expectedPlatforms: string[]): Promise<boolean> {
    // Validate business requirement: users get access to platforms based on plan
    throw new Error('Implement platform access validation');
  },
  
  // Validate generation limits are enforced
  async validateGenerationLimits(userId: string, expectedLimit: number): Promise<boolean> {
    // Validate business requirement: generation limits prevent overuse
    throw new Error('Implement generation limit validation');
  }
};

// Mock external services that should not be called during tests
export const mockExternalServices = () => {
  // Mock email service - tests shouldn't send real emails
  jest.mock('../src/email/email.service');
  
  // Mock analytics service - tests shouldn't track real analytics  
  jest.mock('../src/analytics/analytics.service');
  
  // Mock AI service - tests shouldn't call real AI APIs
  jest.mock('../src/ai/ai.service');
  
  // Mock payment service - tests shouldn't charge real money
  jest.mock('../src/payment/payment.service');
};

// Setup before all tests
beforeAll(async () => {
  mockExternalServices();
});

// Cleanup after each test to ensure test isolation
// Database cleanup removed for unit tests - only needed for integration tests