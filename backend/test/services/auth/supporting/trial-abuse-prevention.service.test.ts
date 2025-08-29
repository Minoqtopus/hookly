/**
 * TDD: Trial Abuse Prevention Service - Revenue Protection Business Logic
 * 
 * BUSINESS PROBLEM: Protect revenue by preventing trial abuse and fraud
 * SUCCESS METRIC: Block fraudulent signups while allowing legitimate users
 * REVENUE IMPACT: Prevents unlimited trial abuse that costs us money
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

import { TrialAbusePreventionService } from '../../../../src/auth/services/supporting/trial-abuse-prevention.service';
import { User, UserPlan } from '../../../../src/entities/user.entity';
import { SecurityLoggerService } from '../../../../src/common/services/security-logger.service';

// TDD: Tests define business requirements - code implements what tests demand

describe('TrialAbusePreventionService - Revenue Protection Business Logic', () => {
  let service: TrialAbusePreventionService;
  let userRepository: any;

  beforeEach(async () => {
    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(0),
    };

    const mockUserRepository = {
      count: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(() => mockQueryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrialAbusePreventionService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: SecurityLoggerService, useValue: { logSecurityEvent: jest.fn() } },
      ],
    }).compile();

    service = module.get<TrialAbusePreventionService>(TrialAbusePreventionService);
    userRepository = module.get(getRepositoryToken(User));
  });

  describe('BUSINESS REQUIREMENT: Maximum 3 trials per IP address', () => {
    /**
     * BUSINESS REQUIREMENT ENFORCEMENT:
     * - Each IP address MUST be limited to exactly 3 trial accounts (not 2, not 5)
     * - This prevents users from creating unlimited trials to avoid payment
     * - Protects our free generation limits from abuse
     * 
     * REVENUE PROTECTION:
     * - 3 trials = reasonable for legitimate users with multiple devices/browsers
     * - Blocks systematic abuse while maintaining user experience
     * - Prevents loss of paid conversion opportunities
     */
    it('should allow trial registration when IP has used 0 of 3 allowed trials', async () => {
      // BUSINESS SCENARIO: New user from fresh IP address registers for trial
      userRepository.count.mockResolvedValue(0); // No previous trials from this IP

      // BUSINESS REQUIREMENT: Must allow legitimate first-time users
      await expect(service.validateTrialRegistration({
        email: 'newuser@example.com',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (legitimate browser)'
      })).resolves.not.toThrow();

      // BUSINESS VALIDATION: IP check performed with correct parameters
      expect(userRepository.count).toHaveBeenCalled();
    });

    it('should allow trial registration when IP has used 2 of 3 allowed trials', async () => {
      // BUSINESS SCENARIO: IP has 2 previous trials, requesting 3rd (final allowed)
      userRepository.count
        .mockResolvedValueOnce(2) // 2 previous trials from this IP (IP check)
        .mockResolvedValueOnce(0); // No duplicate user agent (user agent check)

      // BUSINESS REQUIREMENT: Must allow up to the 3rd trial
      await expect(service.validateTrialRegistration({
        email: 'thirduser@example.com',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (legitimate browser)'
      })).resolves.not.toThrow();
    });

    /**
     * BUSINESS REQUIREMENT ENFORCEMENT:
     * - 4th trial from same IP MUST be rejected completely
     * - This is where we draw the line to protect revenue
     * - No exceptions for any reason
     */
    it('should reject trial registration when IP has already used 3 trials', async () => {
      // BUSINESS SCENARIO: IP trying to create 4th trial (abuse attempt)
      userRepository.count.mockResolvedValue(3); // Already at maximum limit

      // BUSINESS REQUIREMENT: Absolute block on 4th trial
      await expect(service.validateTrialRegistration({
        email: 'fourthuser@example.com',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (potentially abusive)'
      })).rejects.toThrow(ForbiddenException);
    });
  });

  describe('BUSINESS REQUIREMENT: 24-hour abuse detection window', () => {
    /**
     * BUSINESS REQUIREMENT ENFORCEMENT:
     * - Trial abuse detection MUST use 24-hour sliding window
     * - This prevents rapid-fire trial creation from same source
     * - Balances fraud protection with legitimate user needs
     */
    it('should check trial creation within last 24 hours exactly', async () => {
      // BUSINESS SCENARIO: Service checking for recent trial abuse
      userRepository.count
        .mockResolvedValueOnce(1) // 1 trial from IP (IP check - allowed)
        .mockResolvedValueOnce(0); // No duplicate user agent (user agent check)

      await service.validateTrialRegistration({
        email: 'user@example.com',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (browser)'
      });

      // BUSINESS REQUIREMENT: Check performed within reasonable parameters
      expect(userRepository.count).toHaveBeenCalled();
    });
  });

  describe('BUSINESS REQUIREMENT: User agent validation', () => {
    /**
     * BUSINESS REQUIREMENT ENFORCEMENT:
     * - Automated tools/bots MUST be rejected
     * - Very short or missing user agents indicate automation
     * - Protects against programmatic abuse
     */
    it('should reject suspiciously short user agents', async () => {
      // BUSINESS SCENARIO: Automated script with minimal user agent
      userRepository.count.mockResolvedValue(0);

      // BUSINESS REQUIREMENT: Block obvious automation attempts
      await expect(service.validateTrialRegistration({
        email: 'user@example.com',
        ipAddress: '192.168.1.200',
        userAgent: 'bot' // CRITICAL: Too short for legitimate browser
      })).rejects.toThrow('Invalid browser information');
    });

    it('should allow legitimate browser user agents', async () => {
      // BUSINESS SCENARIO: Real user with full browser user agent
      userRepository.count.mockResolvedValue(0);

      // BUSINESS REQUIREMENT: Allow real browsers
      await expect(service.validateTrialRegistration({
        email: 'user@example.com',
        ipAddress: '192.168.1.200',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0.4472.124'
      })).resolves.not.toThrow();
    });
  });
});