import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { RefreshToken } from '../../../entities/refresh-token.entity';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
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
   * @param token - The JWT refresh token to validate
   * @returns RefreshToken entity if valid, null if invalid/revoked/expired
   */
  async validateRefreshToken(token: string): Promise<RefreshToken | null> {
    // Find all non-revoked tokens for this user and compare with bcrypt
    // Since bcrypt uses salt, we can't hash the token directly for lookup
    const candidateTokens = await this.refreshTokenRepository.find({
      where: { 
        is_revoked: false,
        expires_at: MoreThan(new Date())
      },
      relations: ['user'],
    });

    // Compare token against all candidate hashes
    let matchedToken: RefreshToken | null = null;
    for (const candidate of candidateTokens) {
      if (await bcrypt.compare(token, candidate.token_hash)) {
        matchedToken = candidate;
        break;
      }
    }

    if (!matchedToken) {
      return null; // Token not found or invalid
    }

    // Update last used timestamp for security tracking
    matchedToken.last_used_at = new Date();
    await this.refreshTokenRepository.save(matchedToken);

    return matchedToken;
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