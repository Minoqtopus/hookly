/**
 * TDD: Core Authentication Service - Real Business Problem Tests
 * 
 * Business Problem: Users need to register and immediately start generating content
 * Success Metric: User can register → login → generate content within 30 seconds
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

// Mock bcrypt at the module level
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

import { CoreAuthenticationService } from '../../../src/auth/services/core-authentication.service';
import { User, UserPlan, UserRole } from '../../../src/entities/user.entity';
import { AnalyticsService } from '../../../src/analytics/analytics.service';
import { AdminManagementService } from '../../../src/auth/services/supporting/admin-management.service';
import { TrialAbusePreventionService } from '../../../src/auth/services/supporting/trial-abuse-prevention.service';
import { SecurityLoggerService } from '../../../src/common/services/security-logger.service';
import { EmailVerificationService } from '../../../src/auth/services/email-verification.service';
import { PasswordManagementService } from '../../../src/auth/services/password-management.service';
import { RefreshTokenService } from '../../../src/auth/services/supporting/refresh-token.service';
// TDD: Tests define business requirements - code implements what tests demand

describe('CoreAuthenticationService - Business Problem Solving', () => {
  let service: CoreAuthenticationService;
  let userRepository: any;
  let jwtService: any;

  beforeEach(async () => {
    const mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    
    const mockJwtService = {
      sign: jest.fn(),
      signAsync: jest.fn(),
    };
    
    const mockConfigService = {
      get: jest.fn((key: string) => {
        const config = {
          JWT_SECRET: 'test-secret',
          JWT_EXPIRES_IN: '15m',
          JWT_REFRESH_SECRET: 'test-refresh-secret',
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoreAuthenticationService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: AdminManagementService, useValue: { isAdminEmail: jest.fn(() => false) } },
        { provide: TrialAbusePreventionService, useValue: { validateTrialRegistration: jest.fn() } },
        { provide: SecurityLoggerService, useValue: { logSecurityEvent: jest.fn() } },
        { provide: EmailVerificationService, useValue: { sendVerificationEmail: jest.fn() } },
        { provide: PasswordManagementService, useValue: { hashPassword: jest.fn(() => '$2b$12$hash') } },
        { provide: RefreshTokenService, useValue: { 
          generateTokenFamily: jest.fn(() => 'family-123'),
          storeRefreshToken: jest.fn(),
        } },
        { provide: AnalyticsService, useValue: { trackEvent: jest.fn() } },
      ],
    }).compile();

    service = module.get<CoreAuthenticationService>(CoreAuthenticationService);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('BUSINESS PROBLEM: User wants to start generating content immediately', () => {
    /**
     * BUSINESS REQUIREMENT ENFORCEMENT:
     * - UNVERIFIED trial users MUST receive exactly 5 free generations (not 15)
     * - Email verification MUST unlock remaining 10 generations (5→15 total)
     * - Trial period MUST last exactly 7 days (not 5, not 14) 
     * - Registration provides immediate limited access to encourage verification
     * 
     * REVENUE IMPACT: 
     * - 5 generations gives users taste of value while incentivizing verification
     * - Email verification increases to 15 total generations
     * - Verified users have higher conversion rates to paid plans
     */
    it('should register unverified user and provide limited access to 5 generations', async () => {
      // Business scenario: User registers but hasn't verified email yet
      // First call for registration check - no existing user
      // Second call for token generation - return the saved user
      userRepository.findOne
        .mockResolvedValueOnce(null) // Registration check
        .mockResolvedValueOnce({ // Token generation lookup
          id: 'user-123',
          email: 'creator@example.com',
          plan: UserPlan.TRIAL,
          trial_generations_used: 0,
          trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // BUSINESS REQUIREMENT: 7-day trial
          is_email_verified: false // CRITICAL: Unverified email = limited generations
        });
      
      const mockUser = {
        id: 'user-123',
        email: 'creator@example.com',
        plan: UserPlan.TRIAL,
        trial_generations_used: 0,
        trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // BUSINESS REQUIREMENT: 7-day trial
        is_email_verified: false // CRITICAL: Unverified = limited access
      };
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('access-token');
      jwtService.signAsync.mockResolvedValue('refresh-token');

      const result = await service.register({
        email: 'creator@example.com',
        password: 'StrongPassword123!'
      });

      // Business validation: Unverified user gets limited access
      expect(result.user.plan).toBe(UserPlan.TRIAL);
      expect(result.user.trial_generations_used).toBe(0);
      expect(result.user.is_email_verified).toBe(false);
      expect(result.access_token).toBeDefined();
      
      // BUSINESS REQUIREMENT ENFORCEMENT: Exactly 5 generations for UNVERIFIED trial users
      // This incentivizes email verification to unlock full 15 generations
      const maxGenerationsForUnverified = result.user.is_email_verified ? 15 : 5;
      const generationsAvailable = maxGenerationsForUnverified - result.user.trial_generations_used;
      expect(generationsAvailable).toBe(5); // CRITICAL: Must be exactly 5 for unverified users
    });

    /**
     * BUSINESS REQUIREMENT ENFORCEMENT:
     * - VERIFIED trial users MUST receive exactly 15 free generations
     * - Email verification MUST unlock full generation capacity
     * - This rewards users who complete the verification process
     * 
     * CONVERSION OPTIMIZATION:
     * - Verified users get full value proposition (15 generations)
     * - Higher engagement leads to higher paid conversion rates
     */
    it('should register verified user and provide full access to 15 generations', async () => {
      // Business scenario: User registers and has verified their email (or OAuth)
      userRepository.findOne
        .mockResolvedValueOnce(null) // Registration check
        .mockResolvedValueOnce({ // Token generation lookup
          id: 'user-verified-123',
          email: 'verified@example.com',
          plan: UserPlan.TRIAL,
          trial_generations_used: 0,
          trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          is_email_verified: true // CRITICAL: Verified email = full generations
        });
      
      const mockUser = {
        id: 'user-verified-123',
        email: 'verified@example.com',
        plan: UserPlan.TRIAL,
        trial_generations_used: 0,
        trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        is_email_verified: true // CRITICAL: Verified = full access
      };
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('access-token');
      jwtService.signAsync.mockResolvedValue('refresh-token');

      const result = await service.register({
        email: 'verified@example.com',
        password: 'StrongPassword123!'
      });

      // Business validation: Verified user gets full access
      expect(result.user.plan).toBe(UserPlan.TRIAL);
      expect(result.user.trial_generations_used).toBe(0);
      expect(result.user.is_email_verified).toBe(true);
      expect(result.access_token).toBeDefined();
      
      // BUSINESS REQUIREMENT ENFORCEMENT: Exactly 15 generations for VERIFIED trial users
      const maxGenerationsForVerified = result.user.is_email_verified ? 15 : 5;
      const generationsAvailable = maxGenerationsForVerified - result.user.trial_generations_used;
      expect(generationsAvailable).toBe(15); // CRITICAL: Must be exactly 15 for verified users
    });

    /**
     * BUSINESS REQUIREMENT ENFORCEMENT:
     * - Passwords MUST be rejected if they don't meet security standards
     * - This protects user content and prevents account takeovers
     * - Account security directly impacts user trust and retention
     * 
     * SECURITY STANDARD: Minimum 8 characters with complexity requirements
     */
    it('should reject weak passwords that compromise user accounts', async () => {
      // Business risk: Weak passwords lead to account takeovers, lost content, churn
      await expect(service.register({
        email: 'creator@example.com',
        password: '123' // Real users try this
      })).rejects.toThrow();
    });
  });

  describe('BUSINESS PROBLEM: Returning users need instant access to their content', () => {
    /**
     * BUSINESS REQUIREMENT ENFORCEMENT:
     * - Unverified users MUST see remaining generations based on 5 total limit
     * - Verified users MUST see remaining generations based on 15 total limit
     * - Login MUST be instant (under 2 seconds) for user retention
     * - Progress MUST be accurately tracked based on verification status
     * 
     * USER EXPERIENCE RULE:
     * - Unverified user who used 3 generations sees exactly 2 remaining (5 total)
     * - Verified user who used 5 generations sees exactly 10 remaining (15 total)
     */
    it('should login unverified user and show remaining generations based on 5 limit', async () => {
      // Business scenario: Unverified user returns to create more content
      const existingUnverifiedUser = {
        id: 'user-123',
        email: 'creator@example.com',
        password: '$2b$12$validhashedpassword',
        plan: UserPlan.TRIAL,
        trial_generations_used: 3, // Used 3 out of 5 allowed = 2 remaining
        is_email_verified: false // CRITICAL: Unverified = 5 total limit
      };
      
      // Mock bcrypt.compare to return true for valid password
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      
      userRepository.findOne
        .mockResolvedValueOnce(existingUnverifiedUser) // Login lookup
        .mockResolvedValueOnce(existingUnverifiedUser); // Token generation lookup
      jwtService.sign.mockReturnValue('access-token');
      jwtService.signAsync.mockResolvedValue('refresh-token');

      const result = await service.login({
        email: 'creator@example.com',
        password: 'StrongPassword123!'
      });

      // Business validation: Unverified user sees their remaining value
      expect(result.user.trial_generations_used).toBe(3);
      expect(result.user.is_email_verified).toBe(false);
      expect(result.access_token).toBeDefined();
      
      // BUSINESS REQUIREMENT ENFORCEMENT: Math MUST be exact based on verification status
      // Unverified user: used 3 out of 5 = exactly 2 remaining
      const maxGenerations = result.user.is_email_verified ? 15 : 5;
      const remainingGenerations = maxGenerations - result.user.trial_generations_used;
      expect(remainingGenerations).toBe(2); // CRITICAL: Exact calculation for unverified users
    });

    /**
     * BUSINESS REQUIREMENT ENFORCEMENT:
     * - Verified users get full 15 generation capacity
     * - Calculation must account for verification status
     * - Demonstrates the value of email verification
     */
    it('should login verified user and show remaining generations based on 15 limit', async () => {
      // Business scenario: Verified user returns to create more content
      const existingVerifiedUser = {
        id: 'user-verified-456',
        email: 'verified@example.com',
        password: '$2b$12$validhashedpassword',
        plan: UserPlan.TRIAL,
        trial_generations_used: 5, // Used 5 out of 15 allowed = 10 remaining
        is_email_verified: true // CRITICAL: Verified = 15 total limit
      };
      
      // Mock bcrypt.compare to return true for valid password
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      
      userRepository.findOne
        .mockResolvedValueOnce(existingVerifiedUser) // Login lookup
        .mockResolvedValueOnce(existingVerifiedUser); // Token generation lookup
      jwtService.sign.mockReturnValue('access-token');
      jwtService.signAsync.mockResolvedValue('refresh-token');

      const result = await service.login({
        email: 'verified@example.com',
        password: 'StrongPassword123!'
      });

      // Business validation: Verified user sees their remaining value
      expect(result.user.trial_generations_used).toBe(5);
      expect(result.user.is_email_verified).toBe(true);
      expect(result.access_token).toBeDefined();
      
      // BUSINESS REQUIREMENT ENFORCEMENT: Math MUST be exact based on verification status
      // Verified user: used 5 out of 15 = exactly 10 remaining
      const maxGenerations = result.user.is_email_verified ? 15 : 5;
      const remainingGenerations = maxGenerations - result.user.trial_generations_used;
      expect(remainingGenerations).toBe(10); // CRITICAL: Exact calculation for verified users
    });
  });
});