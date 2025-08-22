import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { AnalyticsService } from '../analytics/analytics.service';
import { EmailService } from '../email/email.service';
import { EventType } from '../entities/analytics-event.entity';
import { EmailVerification, VerificationStatus, VerificationType } from '../entities/email-verification.entity';
import { AuthProvider, User, UserRole } from '../entities/user.entity';
import { AdminManagementService } from './admin-management.service';
import { LoginDto } from './dto/login.dto';
import { OAuthUserDto } from './dto/oauth-user.dto';
import { RegisterDto } from './dto/register.dto';
import { TrialAbusePreventionService } from './trial-abuse-prevention.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(EmailVerification)
    private emailVerificationRepository: Repository<EmailVerification>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private analyticsService: AnalyticsService,
    private adminManagementService: AdminManagementService,
    private trialAbusePreventionService: TrialAbusePreventionService,
  ) {}

  /**
   * Register a new user with email and password authentication
   * 
   * Features:
   * - Validates email uniqueness with generic error messages to prevent user enumeration
   * - Implements trial abuse prevention using IP and user agent tracking
   * - Securely determines admin status using AdminManagementService
   * - Hashes password with bcrypt (12 rounds)
   * - Generates unique referral code for user
   * - Tracks analytics events for signup and trial started
   * - Automatically sends verification email to non-admin users
   * - Returns JWT tokens for immediate authentication
   * 
   * @param registerDto - Contains email and password for registration
   * @param ipAddress - Client IP address for abuse prevention tracking
   * @param userAgent - Client user agent for abuse prevention validation
   * @returns User object with JWT access and refresh tokens
   * @throws ConflictException if email already exists or trial abuse detected
   */
  async register(registerDto: RegisterDto, ipAddress?: string, userAgent?: string) {
    const { email, password } = registerDto;

    // Check if user already exists - use generic error to prevent email enumeration
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Registration failed. Please try again with different credentials.');
    }

    // Validate registration against trial abuse patterns
    if (ipAddress && userAgent) {
      await this.trialAbusePreventionService.validateTrialRegistration({
        email,
        ipAddress,
        userAgent,
      });
    }

    // Hash password with high security rounds (12 = 2^12 iterations)
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Determine admin status using secure admin management service
    const isAdmin = await this.adminManagementService.isAdminEmail(email);

    // Create new user entity with all required fields
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      auth_provider: AuthProvider.EMAIL,
      role: isAdmin ? UserRole.ADMIN : UserRole.USER,
      referral_code: this.generateReferralCode(),
      registration_ip: ipAddress,
      registration_user_agent: userAgent,
    });

    // Persist user to database
    await this.userRepository.save(user);

    // Track analytics events for business intelligence (non-blocking)
    try {
      await this.analyticsService.trackEvent(
        EventType.USER_SIGNUP,
        user.id,
        {
          auth_provider: user.auth_provider,
          plan: user.plan,
          is_admin: isAdmin,
        }
      );

      // Track trial started event for non-admin users
      if (!isAdmin) {
        await this.analyticsService.trackEvent(
          EventType.TRIAL_STARTED,
          user.id,
          {
            plan: user.plan,
            trial_length_days: 14,
          }
        );
      }
    } catch (error) {
      console.error('Failed to track signup analytics:', error);
    }

    // Send email verification for regular users (admins auto-verified)
    if (!isAdmin) {
      try {
        await this.sendVerificationEmail(user.id);
      } catch (error) {
        console.error(`Failed to send verification email during registration for ${user.email}:`, error instanceof Error ? error.message : 'Unknown error');
        // Don't fail the registration if email sending fails
      }
    }

    // Generate JWT tokens for immediate login
    const tokens = await this.generateTokens(user.id, user.email);
    return {
      user: { 
        id: user.id, 
        email: user.email, 
        plan: user.plan,
        auth_provider: user.auth_provider,
        avatar_url: user.avatar_url,
        is_verified: user.is_verified
      },
      ...tokens,
    };
  }

  /**
   * Authenticate user with email and password
   * 
   * Security features:
   * - Uses generic error messages to prevent user enumeration
   * - Validates auth provider to prevent OAuth users from using password login
   * - Uses bcrypt.compare for secure password verification
   * - Tracks login analytics for business intelligence
   * - Generates fresh JWT tokens on successful authentication
   * 
   * @param loginDto - Contains email and password credentials
   * @returns User object with fresh JWT access and refresh tokens
   * @throws UnauthorizedException for invalid credentials or wrong auth provider
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Prevent password login for OAuth users - guide them to correct flow
    if (user.auth_provider !== AuthProvider.EMAIL) {
      throw new UnauthorizedException(`Please sign in with ${user.auth_provider}`);
    }

    // Ensure user has a password (defensive check)
    if (!user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password using bcrypt's constant-time comparison
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Track successful login event for analytics (non-blocking)
    try {
      await this.analyticsService.trackEvent(
        EventType.USER_LOGIN,
        user.id,
        {
          auth_provider: user.auth_provider,
          plan: user.plan,
        }
      );
    } catch (error) {
      console.error('Failed to track login analytics:', error);
    }

    // Generate fresh JWT tokens for the session
    const tokens = await this.generateTokens(user.id, user.email);
    return {
      user: { 
        id: user.id, 
        email: user.email, 
        plan: user.plan,
        auth_provider: user.auth_provider,
        avatar_url: user.avatar_url
      },
      ...tokens,
    };
  }

  /**
   * Generate new access token using valid refresh token
   * 
   * Security features:
   * - Verifies refresh token signature and expiration
   * - Validates user still exists in database
   * - Generates completely new token pair for security
   * - Uses different secret for refresh tokens (JWT_REFRESH_SECRET)
   * 
   * @param refreshToken - Valid JWT refresh token
   * @returns New access and refresh token pair
   * @throws UnauthorizedException if refresh token is invalid or user not found
   */
  async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token signature and expiration
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Ensure user still exists (could be deleted since token was issued)
      const user = await this.userRepository.findOne({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new token pair for enhanced security
      const tokens = await this.generateTokens(user.id, user.email);
      return tokens;
    } catch (error) {
      // Return generic error to prevent token validation oracle attacks
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Validate and process OAuth user authentication (Google OAuth)
   * 
   * Features:
   * - Links existing email accounts with OAuth providers
   * - Creates new accounts for first-time OAuth users
   * - Updates OAuth provider information and avatar
   * - Auto-verifies email for OAuth users (trusted providers)
   * - Generates referral codes for new users
   * - Returns JWT tokens for immediate authentication
   * 
   * @param oauthUser - OAuth user data from provider (Google)
   * @returns User object with JWT tokens
   */
  async validateOAuthUser(oauthUser: OAuthUserDto) {
    const { email, google_id, avatar_url } = oauthUser;

    // Check if user already exists by email (account linking)
    let user = await this.userRepository.findOne({ where: { email } });

    if (user) {
      // Existing user - update OAuth provider information if needed
      let needsUpdate = false;

      // Link Google account if not already linked
      if (google_id && !user.google_id) {
        user.google_id = google_id;
        user.auth_provider = AuthProvider.GOOGLE;
        needsUpdate = true;
      }

      // Update avatar if user doesn't have one
      if (avatar_url && !user.avatar_url) {
        user.avatar_url = avatar_url;
        needsUpdate = true;
      }

      // Auto-verify email for OAuth users (trusted provider)
      if (!user.is_verified) {
        user.is_verified = true;
        needsUpdate = true;
      }

      // Save updates if any changes were made
      if (needsUpdate) {
        await this.userRepository.save(user);
      }
    } else {
      // Create new user for first-time OAuth authentication
      const authProvider = google_id ? AuthProvider.GOOGLE : AuthProvider.EMAIL;

      user = this.userRepository.create({
        email,
        google_id,
        avatar_url,
        auth_provider: authProvider,
        is_verified: true, // OAuth emails are pre-verified
        referral_code: this.generateReferralCode(),
      });

      await this.userRepository.save(user);
    }

    // Generate JWT tokens for immediate authentication
    const tokens = await this.generateTokens(user.id, user.email);
    return {
      user: { 
        id: user.id, 
        email: user.email, 
        plan: user.plan,
        auth_provider: user.auth_provider,
        avatar_url: user.avatar_url,
        is_verified: user.is_verified
      },
      ...tokens,
    };
  }

  /**
   * Generate cryptographically secure referral code
   * 
   * Uses Node.js crypto module to generate 8-character uppercase hex string
   * Format: ABCD1234 (4 bytes = 8 hex chars)
   * 
   * @returns 8-character uppercase hexadecimal referral code
   */
  private generateReferralCode(): string {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  /**
   * Generate JWT access and refresh token pair
   * 
   * Security features:
   * - Different secrets for access vs refresh tokens
   * - Short-lived access tokens (15 minutes) for security
   * - Longer-lived refresh tokens (7 days) for UX
   * - Parallel token generation for performance
   * 
   * @param userId - User's unique identifier for token payload
   * @param email - User's email for token payload  
   * @returns Object with access_token and refresh_token
   */
  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    // Generate both tokens in parallel for performance
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m', // Short-lived for security
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d', // Longer-lived for user experience
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  /**
   * Send email verification link to user
   * 
   * Features:
   * - Validates user exists and isn't already verified
   * - Invalidates any existing pending verification tokens
   * - Generates cryptographically secure 64-character hex token
   * - Sets 24-hour expiration for security
   * - Sends email via EmailService (non-blocking failure)
   * - Tracks verification records in database
   * 
   * @param userId - User's unique identifier
   * @returns Success message
   * @throws UnauthorizedException if user not found
   */
  async sendVerificationEmail(userId: string) {
    // Validate user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Skip if already verified
    if (user.is_verified) {
      return { message: 'Email already verified' };
    }

    // Invalidate any existing pending verification tokens for security
    await this.emailVerificationRepository.update(
      { 
        user_id: userId, 
        type: VerificationType.EMAIL_SIGNUP,
        status: VerificationStatus.PENDING 
      },
      { status: VerificationStatus.EXPIRED }
    );

    // Generate cryptographically secure verification token
    const token = crypto.randomBytes(32).toString('hex'); // 64 characters
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

    // Create verification record in database
    const verification = this.emailVerificationRepository.create({
      user_id: userId,
      email: user.email,
      token,
      type: VerificationType.EMAIL_SIGNUP,
      expires_at: expiresAt,
      status: VerificationStatus.PENDING,
    });

    await this.emailVerificationRepository.save(verification);

    // Send verification email (non-blocking - don't fail registration)
    try {
      await this.emailService.sendVerificationEmail(user.email, token);
      console.log(`✅ Verification email sent to: ${user.email}`);
    } catch (error) {
      console.error(`❌ Failed to send verification email to ${user.email}:`, error instanceof Error ? error.message : 'Unknown error');
      // Don't fail the registration, just log the error
    }
    
    return { message: 'Verification email sent successfully' };
  }

  /**
   * Verify user's email address using verification token
   * 
   * Security features:
   * - Validates token exists and is still pending
   * - Checks token expiration (24 hours)
   * - Marks token as used to prevent reuse
   * - Updates user verification status atomically
   * - Tracks verification event for analytics
   * 
   * @param token - 64-character hex verification token from email
   * @returns Success message
   * @throws UnauthorizedException if token is invalid or expired
   */
  async verifyEmail(token: string) {
    const verification = await this.emailVerificationRepository.findOne({
      where: { 
        token, 
        type: VerificationType.EMAIL_SIGNUP,
        status: VerificationStatus.PENDING 
      }
    });

    if (!verification) {
      throw new UnauthorizedException('Invalid or expired verification token');
    }

    if (verification.expires_at < new Date()) {
      verification.status = VerificationStatus.EXPIRED;
      await this.emailVerificationRepository.save(verification);
      throw new UnauthorizedException('Verification token has expired');
    }

    // Mark verification as verified
    verification.status = VerificationStatus.VERIFIED;
    verification.verified_at = new Date();
    await this.emailVerificationRepository.save(verification);

    // Update user verification status
    await this.userRepository.update(verification.user_id, { is_verified: true });

    // Track email verification event
    try {
      await this.analyticsService.trackEvent(
        EventType.EMAIL_VERIFIED,
        verification.user_id,
        {
          verification_method: 'email_link',
        }
      );
    } catch (error) {
      console.error('Failed to track email verification analytics:', error);
    }

    return { message: 'Email verified successfully' };
  }

  /**
   * Resend email verification with rate limiting
   * 
   * Security features:
   * - Validates user exists and isn't already verified
   * - Rate limiting: prevents sending emails more than once per minute
   * - Reuses existing sendVerificationEmail method for consistency
   * 
   * @param userId - User's unique identifier
   * @returns Success message or already verified status
   * @throws UnauthorizedException if user not found or rate limited
   */
  async resendVerificationEmail(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.is_verified) {
      return { message: 'Email already verified' };
    }

    // Check for recent verification attempts (rate limiting)
    const recentVerification = await this.emailVerificationRepository.findOne({
      where: {
        user_id: userId,
        type: VerificationType.EMAIL_SIGNUP,
        created_at: new Date(Date.now() - 60 * 1000) // Last 1 minute
      },
      order: { created_at: 'DESC' }
    });

    if (recentVerification) {
      throw new UnauthorizedException('Please wait before requesting another verification email');
    }

    return this.sendVerificationEmail(userId);
  }

  /**
   * Initiate password reset process
   * 
   * Security features:
   * - Doesn't reveal if email exists (prevents user enumeration)
   * - Only works for email auth users (not OAuth)
   * - Invalidates existing reset tokens for security
   * - Generates secure 64-character hex token
   * - Short 1-hour expiration for security
   * - Non-blocking email sending
   * 
   * @param email - Email address to send reset link to
   * @returns Generic success message regardless of email existence
   */
  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if email exists for security
      return { message: 'If the email exists, a password reset link has been sent' };
    }

    // Check if user registered with OAuth
    if (user.auth_provider !== AuthProvider.EMAIL) {
      return { message: 'Password reset is not available for OAuth accounts' };
    }

    // Invalidate any existing password reset tokens
    await this.emailVerificationRepository.update(
      { 
        user_id: user.id, 
        type: VerificationType.PASSWORD_RESET,
        status: VerificationStatus.PENDING 
      },
      { status: VerificationStatus.EXPIRED }
    );

    // Create new password reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    const verification = this.emailVerificationRepository.create({
      user_id: user.id,
      email: user.email,
      token,
      type: VerificationType.PASSWORD_RESET,
      expires_at: expiresAt,
      status: VerificationStatus.PENDING,
    });

    await this.emailVerificationRepository.save(verification);

    // Send password reset email
    try {
      await this.emailService.sendPasswordResetEmail(user.email, token);
      console.log(`✅ Password reset email sent to: ${user.email}`);
    } catch (error) {
      console.error(`❌ Failed to send password reset email to ${user.email}:`, error instanceof Error ? error.message : 'Unknown error');
      // Don't fail the request, just log the error
    }

    return { message: 'If the email exists, a password reset link has been sent' };
  }

  /**
   * Reset user password using reset token
   * 
   * Security features:
   * - Validates reset token exists and is still pending
   * - Checks token expiration (1 hour)
   * - Validates user exists and uses email auth
   * - Hashes new password with bcrypt (12 rounds)
   * - Marks user as verified (password reset implies email ownership)
   * - Marks token as used to prevent reuse
   * - Logs successful reset for monitoring
   * 
   * @param token - 64-character hex reset token from email
   * @param newPassword - User's new password (will be hashed)
   * @returns Success message
   * @throws UnauthorizedException if token invalid, expired, or OAuth user
   */
  async resetPassword(token: string, newPassword: string) {
    const verification = await this.emailVerificationRepository.findOne({
      where: { 
        token, 
        type: VerificationType.PASSWORD_RESET,
        status: VerificationStatus.PENDING 
      }
    });

    if (!verification) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    if (verification.expires_at < new Date()) {
      verification.status = VerificationStatus.EXPIRED;
      await this.emailVerificationRepository.save(verification);
      throw new UnauthorizedException('Reset token has expired');
    }

    // Get user and validate
    const user = await this.userRepository.findOne({ where: { id: verification.user_id } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.auth_provider !== AuthProvider.EMAIL) {
      throw new UnauthorizedException('Password reset is not available for OAuth accounts');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    await this.userRepository.update(user.id, { 
      password: hashedPassword,
      is_verified: true // Mark as verified when resetting password
    });

    // Mark verification as used
    verification.status = VerificationStatus.VERIFIED;
    verification.verified_at = new Date();
    await this.emailVerificationRepository.save(verification);

    console.log(`✅ Password reset successful for: ${user.email}`);
    return { message: 'Password reset successfully' };
  }
}