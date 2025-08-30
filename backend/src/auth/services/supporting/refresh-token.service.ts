import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { RefreshToken } from '../../../entities/refresh-token.entity';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Store a new refresh token with security tracking
   * 
   * @param userId - User ID who owns the token
   * @param token - The actual JWT refresh token
   * @param tokenFamily - Family ID for token rotation tracking
   * @param expiresAt - Token expiration date
   * @param ipAddress - Client IP address for security tracking
   * @param userAgent - Client user agent for security tracking
   * @returns Stored RefreshToken entity
   */
  async storeRefreshToken(
    userId: string,
    token: string,
    tokenFamily: string,
    expiresAt: Date,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<RefreshToken> {
    // Hash the token with bcrypt for secure storage (salted + high iterations)
    // This prevents rainbow table attacks if database is compromised
    const tokenHash = await bcrypt.hash(token, 12);

    const refreshToken = this.refreshTokenRepository.create({
      user_id: userId,
      token_hash: tokenHash,
      token_family: tokenFamily,
      expires_at: expiresAt,
      ip_address: ipAddress?.substring(0, 45), // Truncate to fit column
      user_agent: userAgent?.substring(0, 500), // Truncate to fit column
    });

    return await this.refreshTokenRepository.save(refreshToken);
  }

  /**
   * Validate refresh token and check if it's valid/not revoked
   * 
   * Staff Engineer Design: Proper token validation with O(1) database lookup
   * - Extracts user ID from JWT before database query (avoids O(n) token loading)
   * - Uses targeted query instead of loading all tokens
   * - Separates concerns: JWT validation, database lookup, and locking
   * - Minimizes transaction time by doing bcrypt outside transaction when possible
   * 
   * @param token - The JWT refresh token to validate
   * @returns RefreshToken entity if valid, null if invalid/revoked/expired
   */
  async validateRefreshToken(token: string): Promise<RefreshToken | null> {
    try {
      // Step 1: Extract user ID from JWT payload without full validation
      // This allows us to query only relevant tokens (O(1) vs O(n))
      let userId: string;
      try {
        const decoded = this.jwtService.decode(token) as any;
        userId = decoded?.sub;
        if (!userId) {
          return null; // Invalid JWT structure
        }
      } catch (error) {
        return null; // Malformed JWT
      }

      // Step 2: Get candidate tokens for this specific user only
      const candidateTokens = await this.refreshTokenRepository.find({
        where: { 
          user_id: userId,
          is_revoked: false,
          expires_at: MoreThan(new Date())
        },
        // Note: No relations here - we'll load user separately if needed
        // No locking here - we'll lock only the specific token we find
      });

      if (candidateTokens.length === 0) {
        return null; // No valid tokens for this user
      }

      // Step 3: Find matching token through bcrypt comparison (outside transaction)
      let matchedToken: RefreshToken | null = null;
      for (const candidate of candidateTokens) {
        try {
          if (await bcrypt.compare(token, candidate.token_hash)) {
            matchedToken = candidate;
            break;
          }
        } catch (error) {
          // Bcrypt comparison failed - continue to next token
          continue;
        }
      }

      if (!matchedToken) {
        return null; // Token hash doesn't match any stored tokens
      }

      // Step 4: Verify JWT signature and expiration with proper secret
      try {
        await this.jwtService.verifyAsync(token, {
          secret: this.configService.get('JWT_REFRESH_SECRET')
        });
      } catch (error) {
        // JWT signature invalid or expired - revoke this token for security
        await this.revokeToken(matchedToken, 'Invalid JWT signature detected');
        return null;
      }

      // Step 5: Update last used timestamp in a minimal transaction
      // Lock only the specific token we're updating (not all tokens)
      const updatedToken = await this.refreshTokenRepository.manager.transaction(async manager => {
        const refreshTokenRepository = manager.getRepository(RefreshToken);
        
        // Lock and re-fetch this specific token to prevent race conditions
        const lockedToken = await refreshTokenRepository.findOne({
          where: { 
            id: matchedToken.id,
            is_revoked: false,
            expires_at: MoreThan(new Date())
          },
          lock: { mode: 'pessimistic_write' }
        });

        if (!lockedToken) {
          return null; // Token was revoked or expired between our checks
        }

        // Update last used timestamp for security auditing
        lockedToken.last_used_at = new Date();
        await refreshTokenRepository.save(lockedToken);

        return lockedToken;
      });

      return updatedToken;

    } catch (error) {
      // Log error but don't expose internal details
      console.error('RefreshTokenService.validateRefreshToken error:', error);
      return null;
    }
  }

  /**
   * Revoke a specific refresh token
   * 
   * @param refreshToken - RefreshToken entity to revoke
   * @param reason - Reason for revocation
   */
  async revokeToken(refreshToken: RefreshToken, reason: string): Promise<void> {
    refreshToken.is_revoked = true;
    refreshToken.revoked_at = new Date();
    refreshToken.revoked_reason = reason.substring(0, 100); // Truncate to fit column
    await this.refreshTokenRepository.save(refreshToken);
  }

  /**
   * Revoke all refresh tokens for a user (logout all devices)
   * 
   * @param userId - User ID whose tokens to revoke
   * @param reason - Reason for revocation
   */
  async revokeAllUserTokens(userId: string, reason: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { 
        user_id: userId, 
        is_revoked: false 
      },
      {
        is_revoked: true,
        revoked_at: new Date(),
        revoked_reason: reason.substring(0, 100),
      }
    );
  }

  /**
   * Revoke all tokens in a token family (for token rotation security)
   * Used when a token family is compromised
   * 
   * @param tokenFamily - Token family ID to revoke
   * @param reason - Reason for revocation
   */
  async revokeTokenFamily(tokenFamily: string, reason: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { 
        token_family: tokenFamily, 
        is_revoked: false 
      },
      {
        is_revoked: true,
        revoked_at: new Date(),
        revoked_reason: reason.substring(0, 100),
      }
    );
  }

  /**
   * Clean up expired and old revoked tokens (maintenance task)
   * Should be run periodically to keep database clean
   * 
   * @param olderThanDays - Remove tokens older than this many days (default: 30)
   */
  async cleanupExpiredTokens(olderThanDays: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await this.refreshTokenRepository.delete({
      expires_at: LessThan(cutoffDate),
    });

    return result.affected || 0;
  }

  /**
   * Get active token count for a user (for security monitoring)
   * 
   * @param userId - User ID to check
   * @returns Number of active (non-revoked, non-expired) tokens
   */
  async getActiveTokenCount(userId: string): Promise<number> {
    return await this.refreshTokenRepository.count({
      where: {
        user_id: userId,
        is_revoked: false,
        expires_at: MoreThan(new Date()),
      },
    });
  }

  /**
   * Generate a new token family ID for token rotation
   * 
   * @returns UUID v4 string
   */
  generateTokenFamily(): string {
    return crypto.randomUUID();
  }
}