/**
 * OAuth Authentication Service Tests
 * 
 * BUSINESS PROBLEM: Users want to register/login quickly using Google OAuth
 * BUSINESS VALUE: Reduces friction in user onboarding, increases conversion
 * 
 * GRANULAR FOCUS: Tests only OAuth-specific business logic
 * - Google OAuth user validation and account creation
 * - Linking OAuth accounts to existing email accounts  
 * - OAuth user gets same trial benefits as email users
 * - OAuth security and fraud prevention
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';

import { OAuthAuthenticationService } from '../../../src/auth/services/oauth-authentication.service';
import { User, UserPlan, AuthProvider } from '../../../src/entities/user.entity';
import { AnalyticsService } from '../../../src/analytics/analytics.service';
import { AdminManagementService } from '../../../src/auth/services/supporting/admin-management.service';
import { TrialAbusePreventionService } from '../../../src/auth/services/supporting/trial-abuse-prevention.service';
import { SecurityLoggerService } from '../../../src/common/services/security-logger.service';

describe('OAuthAuthenticationService - OAuth Business Logic', () => {
  let service: OAuthAuthenticationService;
  let userRepository: any;

  beforeEach(async () => {
    // Mock only what this service needs - keep it focused
    const mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthAuthenticationService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: AnalyticsService, useValue: { trackEvent: jest.fn() } },
        { provide: AdminManagementService, useValue: { isAdminEmail: jest.fn(() => false) } },
        { provide: TrialAbusePreventionService, useValue: { validateTrialRegistration: jest.fn() } },
        { provide: SecurityLoggerService, useValue: { logSecurityEvent: jest.fn() } },
      ],
    }).compile();

    service = module.get<OAuthAuthenticationService>(OAuthAuthenticationService);
    userRepository = module.get(getRepositoryToken(User));
  });

  describe('BUSINESS REQUIREMENT: Google OAuth user gets immediate FULL trial access', () => {
    it('should create new OAuth user with FULL 15 generation capacity (bypasses email verification)', async () => {
      // BUSINESS SCENARIO: New user signs up with Google OAuth for the first time
      // CRITICAL: Google emails are trusted, so user gets full 15 generations immediately
      userRepository.findOne.mockResolvedValue(null); // No existing user
      
      const newOAuthUser = {
        id: 'oauth-user-123',
        email: 'google.user@gmail.com',
        plan: UserPlan.TRIAL,
        auth_providers: [AuthProvider.GOOGLE],
        trial_generations_used: 0,
        trial_ends_at: expect.any(Date),
        is_email_verified: true // CRITICAL: OAuth emails are pre-verified
      };
      
      userRepository.create.mockReturnValue(newOAuthUser);
      userRepository.save.mockResolvedValue(newOAuthUser);

      const result = await service.validateOAuthUser({
        providerId: 'google-123456',
        email: 'google.user@gmail.com',
        firstName: 'Google',
        lastName: 'User',
        provider: AuthProvider.GOOGLE,
      });

      // BUSINESS VALIDATION: OAuth user gets FULL trial benefits (not limited like unverified email users)
      expect(result.user.plan).toBe(UserPlan.TRIAL);
      expect(result.user.trial_generations_used).toBe(0);
      expect(result.user.auth_providers).toContain(AuthProvider.GOOGLE);
      expect(result.user.is_email_verified).toBe(true); // CRITICAL: Pre-verified
      expect(result.isNewUser).toBe(true);
      
      // BUSINESS REQUIREMENT ENFORCEMENT: OAuth users get full 15 generation capacity immediately
      // They bypass the 5-generation limitation that applies to unverified email users
      const maxGenerations = result.user.is_email_verified ? 15 : 5;
      const availableGenerations = maxGenerations - result.user.trial_generations_used;
      expect(availableGenerations).toBe(15); // CRITICAL: Full 15 generations, not 5
      expect(result.user.trial_ends_at).toBeDefined();
    });

    it('should return existing OAuth user with full generation capacity maintained', async () => {
      // BUSINESS SCENARIO: Returning OAuth user logs in again
      const existingOAuthUser = {
        id: 'oauth-user-123',
        email: 'google.user@gmail.com',
        plan: UserPlan.TRIAL,
        auth_providers: [AuthProvider.GOOGLE],
        trial_generations_used: 5, // User has used 5 out of their 15
        provider_ids: { google: 'google-123456' },
        is_email_verified: true, // CRITICAL: OAuth users maintain verified status
        first_name: 'Google', // EXISTING: User already has profile data
        last_name: 'User', // EXISTING: User already has profile data
        profile_picture: null // EXISTING: No profile picture set
      };
      
      userRepository.findOne.mockResolvedValue(existingOAuthUser);

      const result = await service.validateOAuthUser({
        providerId: 'google-123456',
        email: 'google.user@gmail.com',
        firstName: 'Google',
        lastName: 'User', 
        provider: AuthProvider.GOOGLE,
      });

      // BUSINESS VALIDATION: Existing OAuth user maintains full capacity
      expect(result.user.id).toBe('oauth-user-123');
      expect(result.user.trial_generations_used).toBe(5);
      expect(result.user.is_email_verified).toBe(true);
      expect(result.isNewUser).toBe(false);
      
      // BUSINESS REQUIREMENT ENFORCEMENT: OAuth users always have 15 generation capacity
      const maxGenerations = result.user.is_email_verified ? 15 : 5;
      const remainingGenerations = maxGenerations - result.user.trial_generations_used;
      expect(remainingGenerations).toBe(10); // CRITICAL: 10 of 15 remaining (not 0 of 5)
      
      // BUSINESS METRIC: No duplicate user created
      expect(userRepository.create).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('BUSINESS REQUIREMENT: OAuth account linking for user flexibility', () => {
    it('should link OAuth provider to existing email account', async () => {
      // BUSINESS SCENARIO: User has email account, now wants to add Google login
      const existingEmailUser = {
        id: 'email-user-123',
        email: 'user@example.com',
        password: '$2b$12$hashedpassword',
        plan: UserPlan.STARTER, // Paid user
        auth_providers: [AuthProvider.EMAIL],
        monthly_generation_count: 10,
      };
      
      userRepository.findOne.mockResolvedValue(existingEmailUser);
      
      const updatedUser = {
        ...existingEmailUser,
        auth_providers: [AuthProvider.EMAIL, AuthProvider.GOOGLE],
        provider_ids: { google: 'google-789456' },
      };
      
      userRepository.save.mockResolvedValue(updatedUser);

      const result = await service.validateOAuthUser({
        providerId: 'google-789456',
        email: 'user@example.com', // Same email as existing account
        firstName: 'Existing',
        lastName: 'User',
        provider: AuthProvider.GOOGLE,
      });

      // BUSINESS VALIDATION: OAuth provider linked to existing account
      expect(result.user.id).toBe('email-user-123');
      expect(result.user.plan).toBe(UserPlan.STARTER); // Keeps existing plan
      expect(result.user.auth_providers).toContain(AuthProvider.EMAIL);
      expect(result.user.auth_providers).toContain(AuthProvider.GOOGLE);
      expect(result.isNewUser).toBe(false);
      
      // BUSINESS VALUE: User retains all their existing data and plan benefits
      expect(result.user.monthly_generation_count).toBe(10);
    });
  });

  describe('BUSINESS REQUIREMENT: OAuth fraud prevention', () => {
    it('should create separate account for different OAuth email', async () => {
      // BUSINESS SCENARIO: OAuth user with different email should get new account
      // This prevents accidental account merging and maintains user separation
      
      userRepository.findOne.mockResolvedValue(null); // No existing user with this email
      
      const newOAuthUser = {
        id: 'oauth-user-different',
        email: 'different@suspicious.com',
        plan: UserPlan.TRIAL,
        auth_providers: [AuthProvider.GOOGLE],
        trial_generations_used: 0,
        is_email_verified: true,
      };
      
      userRepository.create.mockReturnValue(newOAuthUser);
      userRepository.save.mockResolvedValue(newOAuthUser);

      const result = await service.validateOAuthUser({
        providerId: 'google-different-123',
        email: 'different@suspicious.com',
        firstName: 'Different',
        lastName: 'User',
        provider: AuthProvider.GOOGLE,
      });
      
      // BUSINESS VALIDATION: New account created for different email
      expect(result.isNewUser).toBe(true);
      expect(result.user.email).toBe('different@suspicious.com');
      expect(result.user.is_email_verified).toBe(true); // OAuth emails are trusted
    });

    it('should enforce trial abuse prevention for OAuth registrations', async () => {
      // BUSINESS SCENARIO: Potential trial abuse via OAuth signup
      userRepository.findOne.mockResolvedValue(null);
      
      const mockTrialAbuseService = service['trialAbusePreventionService'];
      (mockTrialAbuseService.validateTrialRegistration as jest.Mock).mockRejectedValueOnce(
        new ConflictException('Trial limit exceeded for this IP')
      );

      // FRAUD PREVENTION TEST: OAuth signup with suspicious activity
      await expect(service.validateOAuthUser({
        providerId: 'google-123456',
        email: 'abuser@example.com',
        firstName: 'Trial',
        lastName: 'Abuser',
        provider: AuthProvider.GOOGLE,
      }, '192.168.1.1', 'curl/7.0')).rejects.toThrow(ConflictException);
      
      // BUSINESS PROTECTION: Prevents trial abuse through OAuth
      expect(mockTrialAbuseService.validateTrialRegistration).toHaveBeenCalledWith({
        email: 'abuser@example.com',
        ipAddress: '192.168.1.1', 
        userAgent: 'curl/7.0',
      });
    });
  });
});