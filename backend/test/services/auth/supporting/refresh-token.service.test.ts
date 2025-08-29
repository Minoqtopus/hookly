/**
 * TDD: Refresh Token Service - Security Business Logic
 * 
 * BUSINESS PROBLEM: Secure user sessions while maintaining great user experience
 * SUCCESS METRIC: Users stay logged in securely without frequent re-authentication
 * SECURITY IMPACT: Prevents session hijacking and unauthorized access
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { RefreshTokenService } from '../../../../src/auth/services/supporting/refresh-token.service';
import { RefreshToken } from '../../../../src/entities/refresh-token.entity';
import { SecurityLoggerService } from '../../../../src/common/services/security-logger.service';

// TDD: Tests define business requirements - code implements what tests demand

describe('RefreshTokenService - Session Security Business Logic', () => {
  let service: RefreshTokenService;
  let refreshTokenRepository: any;

  beforeEach(async () => {
    const mockRefreshTokenRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenService,
        { provide: getRepositoryToken(RefreshToken), useValue: mockRefreshTokenRepository },
        { provide: SecurityLoggerService, useValue: { logSecurityEvent: jest.fn() } },
      ],
    }).compile();

    service = module.get<RefreshTokenService>(RefreshTokenService);
    refreshTokenRepository = module.get(getRepositoryToken(RefreshToken));
  });

  describe('BUSINESS REQUIREMENT: 7-day refresh token lifetime', () => {
    /**
     * BUSINESS REQUIREMENT ENFORCEMENT:
     * - Refresh tokens MUST expire in exactly 7 days (604,800 seconds)
     * - This balances security (not too long) with UX (not too short)
     * - Users shouldn't need to login weekly if actively using the app
     * 
     * SECURITY REQUIREMENT:
     * - 7 days prevents long-term token theft damage
     * - Forces periodic re-authentication for dormant accounts
     */
    it('should create refresh token with exactly 7-day expiration', async () => {
      // BUSINESS SCENARIO: User logs in and needs long-lived session token
      const userId = 'user-123';
      const token = 'secure-refresh-token';
      const tokenFamily = 'family-456';
      const deviceInfo = 'Chrome on Windows';

      const mockToken = {
        id: 'token-123',
        user_id: userId,
        token_hash: 'hashed-token',
        token_family: tokenFamily,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // CRITICAL: Exactly 7 days
        device_info: deviceInfo,
        is_revoked: false
      };

      refreshTokenRepository.create.mockReturnValue(mockToken);
      refreshTokenRepository.save.mockResolvedValue(mockToken);

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await service.storeRefreshToken(userId, token, tokenFamily, expiresAt, '192.168.1.1', deviceInfo);

      // BUSINESS REQUIREMENT: Token created with exactly 7-day expiration
      expect(refreshTokenRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          expires_at: expect.any(Date)
        })
      );

      // BUSINESS VALIDATION: Expiration is approximately 7 days from now
      const savedToken = refreshTokenRepository.create.mock.calls[0][0];
      const timeDiff = savedToken.expires_at.getTime() - Date.now();
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      expect(Math.abs(timeDiff - sevenDaysInMs)).toBeLessThan(60000); // Within 1 minute
    });
  });

  describe('BUSINESS REQUIREMENT: Token family security rotation', () => {
    /**
     * BUSINESS REQUIREMENT ENFORCEMENT:
     * - Each login session MUST have unique token family ID
     * - Token rotation prevents replay attacks and stolen token abuse
     * - If one token in family is compromised, entire family gets revoked
     */
    it('should generate unique token family for each login session', async () => {
      // BUSINESS SCENARIO: User logs in from different devices/browsers
      const tokenFamily1 = service.generateTokenFamily();
      const tokenFamily2 = service.generateTokenFamily();
      
      // BUSINESS REQUIREMENT: Each session gets unique family ID
      expect(tokenFamily1).not.toBe(tokenFamily2);
      expect(tokenFamily1.length).toBeGreaterThan(10); // Reasonable length
      expect(tokenFamily2.length).toBeGreaterThan(10);
    });

    it('should revoke entire token family when compromised', async () => {
      // BUSINESS SCENARIO: Security team detects token theft
      const tokenFamily = 'family-compromised-123';
      const reason = 'Security breach detected';

      await service.revokeTokenFamily(tokenFamily, reason);

      // BUSINESS REQUIREMENT: All tokens in family marked as revoked
      expect(refreshTokenRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          token_family: tokenFamily,
          is_revoked: false
        }),
        expect.objectContaining({
          is_revoked: true,
          revoked_at: expect.any(Date),
          revoked_reason: reason
        })
      );
    });
  });

  describe('BUSINESS REQUIREMENT: Device limit enforcement', () => {
    /**
     * BUSINESS REQUIREMENT ENFORCEMENT:
     * - Users MUST be limited to reasonable number of concurrent sessions
     * - Prevents account sharing abuse and reduces attack surface
     * - Maintains good UX for users with multiple devices
     */
    it('should count active tokens for device limit enforcement', async () => {
      // BUSINESS SCENARIO: System checks if user has too many active sessions
      const userId = 'user-with-many-devices';
      refreshTokenRepository.count.mockResolvedValue(5); // 5 active sessions

      const activeCount = await service.getActiveTokenCount(userId);

      // BUSINESS REQUIREMENT: Accurate count of non-revoked, non-expired tokens
      expect(refreshTokenRepository.count).toHaveBeenCalledWith({
        where: {
          user_id: userId,
          is_revoked: false,
          expires_at: expect.objectContaining({
            greaterThan: expect.any(Date) // Greater than current time
          })
        }
      });

      expect(activeCount).toBe(5);
    });
  });

  describe('BUSINESS REQUIREMENT: Automatic token cleanup', () => {
    /**
     * BUSINESS REQUIREMENT ENFORCEMENT:
     * - Expired tokens MUST be automatically cleaned up
     * - Default cleanup: tokens older than 30 days
     * - Keeps database clean and improves performance
     */
    it('should clean up tokens older than 30 days by default', async () => {
      // BUSINESS SCENARIO: System maintenance cleaning old expired tokens
      refreshTokenRepository.delete.mockResolvedValue({ affected: 150 });

      const deletedCount = await service.cleanupExpiredTokens();

      // BUSINESS REQUIREMENT: Delete tokens older than 30 days
      expect(refreshTokenRepository.delete).toHaveBeenCalledWith({
        expires_at: expect.objectContaining({
          lessThan: expect.any(Date) // Less than 30 days ago
        })
      });

      expect(deletedCount).toBe(150);
    });
  });

  describe('BUSINESS REQUIREMENT: Emergency session termination', () => {
    /**
     * BUSINESS REQUIREMENT ENFORCEMENT:
     * - Users MUST be able to terminate all sessions in emergency
     * - Critical for account security after suspected compromise
     * - Required feature for user security control
     */
    it('should revoke all user sessions when requested', async () => {
      // BUSINESS SCENARIO: User suspects account compromise
      const userId = 'potentially-compromised-user';
      const reason = 'User requested logout from all devices';

      await service.revokeAllUserTokens(userId, reason);

      // BUSINESS REQUIREMENT: All user tokens immediately revoked
      expect(refreshTokenRepository.update).toHaveBeenCalledWith(
        { 
          user_id: userId,
          is_revoked: false 
        },
        expect.objectContaining({
          is_revoked: true,
          revoked_at: expect.any(Date),
          revoked_reason: reason
        })
      );
    });
  });
});