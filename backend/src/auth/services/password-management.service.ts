/**
 * Password Management Service
 * 
 * Handles password-related operations including password reset and secure hashing.
 * Extracted from AuthService to reduce complexity and improve maintainability
 * of password-related logic.
 * 
 * Staff Engineer Note: Centralizing password logic improves security
 * consistency and makes it easier to implement password policy changes.
 * This maintains the exact same security patterns as the original AuthService.
 */

import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../../email/email.service';
import { User } from '../../entities/user.entity';
import { EmailVerification, VerificationStatus, VerificationType } from '../../entities/email-verification.entity';
import { TokenSecurityUtil } from '../../common/utils/token-security.util';
import { SecurityLoggerService } from '../../common/services/security-logger.service';

export interface PasswordResetResult {
  message: string;
  user: {
    id: string;
    email: string;
  };
}

@Injectable()
export class PasswordManagementService {
  private static readonly PASSWORD_HASH_ROUNDS = 12;
  private static readonly RESET_TOKEN_EXPIRY_HOURS = 1;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(EmailVerification)
    private emailVerificationRepository: Repository<EmailVerification>,
    private emailService: EmailService,
    private configService: ConfigService,
    private securityLoggerService: SecurityLoggerService,
  ) {}

  /**
   * Send password reset email
   * 
   * Staff Engineer Note: Uses the exact same security approach as original
   * AuthService - secure token generation and email enumeration protection.
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      // Security: Don't reveal whether email exists in system (same as original)
      // Still return success to prevent email enumeration
      return;
    }

    // Generate secure reset token using same method as original AuthService
    const resetToken = this.generateSecureEmailToken(
      this.configService.get('PASSWORD_RESET_SECRET'),
      {
        userId: user.id,
        email: user.email,
        timestamp: Date.now(),
        type: 'password_reset'
      }
    );

    // Invalidate any existing password reset tokens (same as original)
    await this.emailVerificationRepository.update(
      { 
        user_id: user.id,
        type: VerificationType.PASSWORD_RESET,
        status: VerificationStatus.PENDING
      },
      { status: VerificationStatus.EXPIRED }
    );

    // Save new reset token
    const verification = this.emailVerificationRepository.create({
      user_id: user.id,
      user,
      email: user.email,
      token: resetToken,
      type: VerificationType.PASSWORD_RESET,
      status: VerificationStatus.PENDING,
      expires_at: new Date(Date.now() + PasswordManagementService.RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000),
    });

    await this.emailVerificationRepository.save(verification);

    // Send reset email
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/auth/reset-password?token=${resetToken}`;
    
    await this.emailService.sendPasswordResetEmail(
      user.email,
      resetUrl,
      user.email.split('@')[0] // Simple first name extraction
    );

    // Log security event (same as original AuthService)
    this.securityLoggerService.logSecurityEvent({
      type: 'password_reset_request' as any,
      userId: user.id,
      email: user.email,
      success: true,
      timestamp: new Date()
    });
  }

  /**
   * Reset password using secure token
   * 
   * Staff Engineer Note: Maintains the same security validation as the original
   * implementation including token signature verification and expiration checks.
   */
  async resetPassword(token: string, newPassword: string): Promise<PasswordResetResult> {
    if (!token || !newPassword) {
      throw new BadRequestException('Token and new password are required');
    }

    // Find reset verification record using same pattern as original AuthService
    const verification = await this.emailVerificationRepository.findOne({
      where: { 
        token,
        type: VerificationType.PASSWORD_RESET,
        status: VerificationStatus.PENDING
      },
      relations: ['user']
    });

    if (!verification) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Check if token has expired
    if (verification.expires_at && new Date() > verification.expires_at) {
      verification.status = VerificationStatus.EXPIRED;
      await this.emailVerificationRepository.save(verification);
      throw new BadRequestException('Reset token has expired');
    }

    // Verify the token signature using same method as original AuthService
    try {
      const tokenData = this.verifySecureEmailToken(
        token,
        this.configService.get('PASSWORD_RESET_SECRET')
      );
      
      if (tokenData.userId !== verification.user.id) {
        throw new BadRequestException('Token validation failed');
      }
    } catch (error) {
      verification.status = VerificationStatus.FAILED;
      await this.emailVerificationRepository.save(verification);
      throw new BadRequestException('Invalid reset token');
    }

    // Hash new password using same settings as original AuthService
    const hashedPassword = await bcrypt.hash(newPassword, PasswordManagementService.PASSWORD_HASH_ROUNDS);

    // Update user password with new timestamp field
    await this.userRepository.update(verification.user.id, {
      password: hashedPassword,
      password_changed_at: new Date()
    });

    // Mark verification as used (same pattern as original)
    verification.status = VerificationStatus.VERIFIED;
    verification.verified_at = new Date();
    await this.emailVerificationRepository.save(verification);

    // Update user email verification status if password reset (same as original)
    await this.userRepository.update(verification.user.id, { is_email_verified: true });

    // Log security event (same as original AuthService)
    this.securityLoggerService.logSecurityEvent({
      type: 'password_reset_success' as any,
      userId: verification.user.id,
      email: verification.user.email,
      success: true,
      timestamp: new Date()
    });

    return {
      message: 'Password reset successfully',
      user: {
        id: verification.user.id,
        email: verification.user.email
      }
    };
  }

  /**
   * Hash password with secure bcrypt settings
   * 
   * Staff Engineer Note: Uses the exact same bcrypt settings (12 rounds)
   * as the original AuthService for consistency.
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, PasswordManagementService.PASSWORD_HASH_ROUNDS);
  }

  /**
   * Generate secure email token with HMAC signature
   * 
   * Staff Engineer Note: Uses the exact same token generation method as the
   * original AuthService to maintain security consistency.
   */
  private generateSecureEmailToken(secret: string, data: any): string {
    return TokenSecurityUtil.generateSecureToken(secret, data);
  }

  /**
   * Verify secure email token signature
   * 
   * Staff Engineer Note: Uses the exact same token verification method as the
   * original AuthService to maintain security consistency.
   */
  private verifySecureEmailToken(signedToken: string, secret: string): any {
    return TokenSecurityUtil.verifySecureToken(signedToken, secret);
  }
}