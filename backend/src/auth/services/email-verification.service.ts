/**
 * Email Verification Service
 * 
 * Handles all email verification logic including sending verification emails,
 * verifying tokens, and managing verification status. Extracted from AuthService
 * for better separation of concerns and testability.
 * 
 * Staff Engineer Note: This service encapsulates email verification business
 * logic and reduces the complexity of the main AuthService. It maintains
 * the exact same security patterns as the original implementation.
 */

import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailService } from '../../email/email.service';
import { User } from '../../entities/user.entity';
import { EmailVerification, VerificationStatus, VerificationType } from '../../entities/email-verification.entity';
import { TokenSecurityUtil } from '../../common/utils/token-security.util';

@Injectable()
export class EmailVerificationService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(EmailVerification)
    private emailVerificationRepository: Repository<EmailVerification>,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  /**
   * Send verification email to user
   * 
   * Staff Engineer Note: This method maintains the same security approach as the
   * original AuthService implementation with HMAC-signed tokens and proper expiration.
   */
  async sendVerificationEmail(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.is_email_verified) {
      throw new BadRequestException('Email already verified');
    }

    // Generate secure verification token using the same method as original AuthService
    const verificationToken = this.generateSecureEmailToken(
      this.configService.get('EMAIL_VERIFICATION_SECRET'),
      {
        userId: user.id,
        email: user.email,
        timestamp: Date.now(),
        type: 'verification'
      }
    );

    // Create verification record in database
    const verification = this.emailVerificationRepository.create({
      user_id: user.id,
      user,
      email: user.email,
      token: verificationToken,
      type: VerificationType.EMAIL_VERIFICATION,
      status: VerificationStatus.PENDING,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    await this.emailVerificationRepository.save(verification);

    // Send verification email
    const verificationUrl = `${this.configService.get('FRONTEND_URL')}/auth/verify-email?token=${verificationToken}`;
    
    await this.emailService.sendVerificationEmail(
      user.email,
      verificationUrl,
      user.email.split('@')[0] // Simple first name extraction
    );
  }

  /**
   * Verify email using token
   * 
   * Staff Engineer Note: Maintains the same security validation as the original
   * implementation including token signature verification and expiration checks.
   */
  async verifyEmail(token: string): Promise<{ message: string; user: { id: string; email: string; is_email_verified: boolean } }> {
    if (!token) {
      throw new BadRequestException('Verification token is required');
    }

    // Find verification record using the same pattern as original AuthService
    const verification = await this.emailVerificationRepository.findOne({
      where: { 
        token,
        type: VerificationType.EMAIL_VERIFICATION,
        status: VerificationStatus.PENDING
      },
      relations: ['user']
    });

    if (!verification) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Check if token has expired
    if (verification.expires_at && new Date() > verification.expires_at) {
      verification.status = VerificationStatus.EXPIRED;
      await this.emailVerificationRepository.save(verification);
      throw new BadRequestException('Verification token has expired');
    }

    // Verify the token signature using the same method as original AuthService
    try {
      const tokenData = this.verifySecureEmailToken(
        token,
        this.configService.get('EMAIL_VERIFICATION_SECRET')
      );
      
      if (tokenData.userId !== verification.user.id) {
        throw new BadRequestException('Token validation failed');
      }
    } catch (error) {
      verification.status = VerificationStatus.FAILED;
      await this.emailVerificationRepository.save(verification);
      throw new BadRequestException('Invalid verification token');
    }

    // Update verification status
    verification.status = VerificationStatus.VERIFIED;
    verification.verified_at = new Date();
    await this.emailVerificationRepository.save(verification);

    // Update user email verification status
    await this.userRepository.update(verification.user.id, {
      is_email_verified: true,
      email_verified_at: new Date()
    });

    return {
      message: 'Email verified successfully',
      user: {
        id: verification.user.id,
        email: verification.user.email,
        is_email_verified: true
      }
    };
  }

  /**
   * Resend verification email
   * 
   * Staff Engineer Note: Follows the same security pattern as original -
   * invalidates old tokens before creating new ones.
   */
  async resendVerificationEmail(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.is_email_verified) {
      throw new BadRequestException('Email already verified');
    }

    // Invalidate all pending verification tokens for this user (same as original)
    await this.emailVerificationRepository.update(
      { 
        user_id: userId,
        type: VerificationType.EMAIL_VERIFICATION,
        status: VerificationStatus.PENDING
      },
      { status: VerificationStatus.EXPIRED }
    );

    // Send new verification email
    await this.sendVerificationEmail(userId);
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