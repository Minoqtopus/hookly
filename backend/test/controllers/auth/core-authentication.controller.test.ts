/**
 * TDD: Core Authentication Controller - API Business Problem Tests
 * 
 * Business Problem: Users interact with our product through API endpoints
 * Success Metric: API responses provide clear business value and next steps
 */

import { Test, TestingModule } from '@nestjs/testing';
import { CoreAuthenticationController } from '../../../src/auth/controllers/core-authentication.controller';
import { CoreAuthenticationService } from '../../../src/auth/services/core-authentication.service';
import { UserPlan } from '../../../src/entities/user.entity';
// TDD: Tests define business requirements - code implements what tests demand

describe('CoreAuthenticationController - API Business Value', () => {
  let controller: CoreAuthenticationController;
  let authService: any;

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      getUserProfile: jest.fn(),
      logout: jest.fn(),
      refresh: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoreAuthenticationController],
      providers: [
        { provide: CoreAuthenticationService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<CoreAuthenticationController>(CoreAuthenticationController);
    authService = module.get<CoreAuthenticationService>(CoreAuthenticationService);
  });

  describe('POST /auth/register - BUSINESS VALUE: Instant trial access', () => {
    /**
     * API BUSINESS REQUIREMENT ENFORCEMENT:
     * - Registration API MUST return user with TRIAL plan (not FREE, not BASIC)
     * - Response MUST include access_token for immediate API usage
     * - Frontend MUST receive actionable user data for dashboard setup
     * 
     * INTEGRATION REQUIREMENT:
     * - API response MUST be consistent with service layer business rules
     * - All downstream systems depend on this API contract
     */
    it('should return trial user with clear generation limits for content creation', async () => {
      // API consumer expects clear business information
      const mockUser = {
        id: 'user-123',
        email: 'creator@example.com',
        plan: UserPlan.TRIAL,
        trial_generations_used: 0,
        trial_ends_at: new Date(),
      };
      
      authService.register.mockResolvedValue({
        user: mockUser,
        access_token: 'token',
        refresh_token: 'refresh',
      });

      // Mock Express Request object
      const mockReq = {
        get: jest.fn((header: string) => header === 'User-Agent' ? 'Mozilla/5.0' : null)
      };

      const result = await controller.register({
        email: 'creator@example.com',
        password: 'StrongPassword123!'
      }, '192.168.1.1', mockReq as any);

      // Business API validation: Frontend gets actionable information
      expect(result.user.plan).toBe(UserPlan.TRIAL);
      expect(result.access_token).toBeDefined();
      
      // Critical: API tells frontend exactly what user can do
      expect(authService.register).toHaveBeenCalledWith({
        email: 'creator@example.com',
        password: 'StrongPassword123!'
      }, '192.168.1.1', 'Mozilla/5.0');
    });
  });

  describe('GET /auth/profile - BUSINESS VALUE: Show user their content creation capacity', () => {
    /**
     * API BUSINESS REQUIREMENT ENFORCEMENT:
     * - Profile API MUST calculate remaining generations based on email verification status
     * - UNVERIFIED users: generations_remaining based on 5 total limit
     * - VERIFIED users: generations_remaining based on 15 total limit
     * - monthly_limit MUST reflect verification status (5 or 15)
     * 
     * DASHBOARD INTEGRATION:
     * - Frontend dashboard depends on these exact values for progress bars
     * - User billing decisions based on accurate remaining count
     * - Verification status drives UI messaging about email verification benefits
     */
    it('should return unverified trial user profile with 5-generation limit', async () => {
      // Business requirement: Unverified user sees limited capacity to encourage verification
      const mockUnverifiedUser = {
        id: 'user-123',
        email: 'creator@example.com',
        plan: UserPlan.TRIAL,
        trial_generations_used: 3, // Used 3 out of 5 allowed
        trial_ends_at: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days left
        is_email_verified: false, // CRITICAL: Unverified = 5 generation limit
        has_tiktok_access: true,
        has_instagram_access: false,
        has_youtube_access: false,
      };

      authService.getUserProfile.mockResolvedValue(mockUnverifiedUser);

      // Mock Express Response object to capture business data sent to user
      const mockRes = {
        set: jest.fn(),
        json: jest.fn(),
      };

      await controller.getProfile(
        { user: { sub: 'user-123' } } as any, 
        mockRes as any
      );

      // Business validation: Unverified user gets limited information
      const profileData = mockRes.json.mock.calls[0][0];
      expect(profileData.plan).toBe(UserPlan.TRIAL);
      expect(profileData.is_email_verified).toBe(false);
      
      // BUSINESS REQUIREMENT ENFORCEMENT: Math based on verification status
      const expectedLimit = profileData.is_email_verified ? 15 : 5;
      expect(profileData.generations_remaining).toBe(2); // CRITICAL: 5 - 3 = 2 remaining
      expect(profileData.monthly_limit).toBe(5); // CRITICAL: Unverified users limited to 5
      expect(profileData.has_tiktok_access).toBe(true);
      expect(profileData.has_instagram_access).toBe(false);
      
      // Business metric: User knows trial expiration and verification status
      expect(profileData.trial_ends_at).toBeDefined();
    });

    /**
     * API BUSINESS REQUIREMENT ENFORCEMENT:
     * - Verified trial users MUST see full 15-generation capacity
     * - Profile API MUST reflect the benefits of email verification
     * - Demonstrates value proposition of verification
     */
    it('should return verified trial user profile with 15-generation limit', async () => {
      // Business requirement: Verified user sees full value proposition
      const mockVerifiedUser = {
        id: 'user-verified-456',
        email: 'verified@example.com',
        plan: UserPlan.TRIAL,
        trial_generations_used: 3, // Used 3 out of 15 allowed
        trial_ends_at: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        is_email_verified: true, // CRITICAL: Verified = 15 generation limit
        has_tiktok_access: true,
        has_instagram_access: false,
        has_youtube_access: false,
      };

      authService.getUserProfile.mockResolvedValue(mockVerifiedUser);

      // Mock Express Response object to capture business data
      const mockRes = {
        set: jest.fn(),
        json: jest.fn(),
      };

      await controller.getProfile(
        { user: { sub: 'user-verified-456' } } as any, 
        mockRes as any
      );

      // Business validation: Verified user gets full capacity information
      const profileData = mockRes.json.mock.calls[0][0];
      expect(profileData.plan).toBe(UserPlan.TRIAL);
      expect(profileData.is_email_verified).toBe(true);
      
      // BUSINESS REQUIREMENT ENFORCEMENT: Math based on verified status
      expect(profileData.generations_remaining).toBe(12); // CRITICAL: 15 - 3 = 12 remaining
      expect(profileData.monthly_limit).toBe(15); // CRITICAL: Verified users get full 15
      expect(profileData.has_tiktok_access).toBe(true);
      expect(profileData.has_instagram_access).toBe(false);
      
      // Business metric: Verified user sees full benefits
      expect(profileData.trial_ends_at).toBeDefined();
    });

    /**
     * API BUSINESS REQUIREMENT ENFORCEMENT:
     * - Starter plan users MUST see exactly 50 monthly generations (not 45, not 60)
     * - Platform access MUST show TikTok + Instagram enabled, YouTube disabled
     * - monthly_limit MUST be exactly 50 for Starter plan users
     * 
     * PAID PLAN VALIDATION:
     * - Paid users get more platforms and generations than trial users
     * - API must enforce business plan hierarchy
     */
    it('should return starter user profile with monthly limits for paid features', async () => {
      // Business scenario: Paid user checking their monthly usage
      const mockUser = {
        id: 'user-456',
        email: 'paid@example.com',
        plan: UserPlan.STARTER,
        monthly_generation_count: 20,
        monthly_reset_date: new Date(),
        has_tiktok_access: true,
        has_instagram_access: true,
        has_youtube_access: false,
      };

      authService.getUserProfile.mockResolvedValue(mockUser);

      // Mock Express Response object to capture business data
      const mockRes = {
        set: jest.fn(),
        json: jest.fn(),
      };

      await controller.getProfile(
        { user: { sub: 'user-456' } } as any, 
        mockRes as any
      );

      // Business validation: Paid user sees their paid benefits
      const profileData = mockRes.json.mock.calls[0][0];
      expect(profileData.plan).toBe(UserPlan.STARTER);
      expect(profileData.generations_remaining).toBe(30); // CRITICAL: Exact math required (50 - 20 = 30)
      expect(profileData.monthly_limit).toBe(50); // CRITICAL: Starter users get exactly 50 generations
      expect(profileData.has_tiktok_access).toBe(true);
      expect(profileData.has_instagram_access).toBe(true);
      expect(profileData.has_youtube_access).toBe(false);
      
      // Business value: User understands their paid plan benefits
      expect(profileData.monthly_reset_date).toBeDefined();
    });
  });

  describe('POST /auth/login - BUSINESS VALUE: Immediate access to user content', () => {
    /**
     * API BUSINESS REQUIREMENT ENFORCEMENT:
     * - Login API MUST return user's exact generation usage (7 used in this test)
     * - Response MUST include valid access_token for immediate API calls
     * - User MUST regain instant access to their content and remaining value
     * 
     * USER RETENTION REQUIREMENT:
     * - Login process MUST be under 2 seconds for user experience
     * - Returning users MUST see their progress preserved accurately
     */
    it('should login user and provide immediate access to their generations', async () => {
      // Business scenario: User returns to continue creating content
      const mockResponse = {
        user: {
          id: 'user-123',
          email: 'creator@example.com',
          plan: UserPlan.TRIAL,
          trial_generations_used: 7,
        },
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      };

      authService.login.mockResolvedValue(mockResponse);

      // Mock Express Request object
      const mockReq = {
        get: jest.fn((header: string) => header === 'User-Agent' ? 'Mozilla/5.0' : null)
      };

      const result = await controller.login({
        email: 'creator@example.com',
        password: 'StrongPassword123!'
      }, '192.168.1.1', mockReq as any);

      // Business validation: User gets immediate access to their account
      expect(result.user.plan).toBe(UserPlan.TRIAL);
      expect(result.user.trial_generations_used).toBe(7);
      expect(result.access_token).toBeDefined();
      
      // Business metric: User can immediately continue creating
      expect(authService.login).toHaveBeenCalledWith({
        email: 'creator@example.com',
        password: 'StrongPassword123!'
      }, '192.168.1.1', 'Mozilla/5.0');
    });
  });
});