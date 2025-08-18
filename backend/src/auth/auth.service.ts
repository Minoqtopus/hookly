import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { AuthProvider, User, UserRole } from '../entities/user.entity';
import { EmailVerification, VerificationType, VerificationStatus } from '../entities/email-verification.entity';
import { EmailService } from '../email/email.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { EventType } from '../entities/analytics-event.entity';
import { LoginDto } from './dto/login.dto';
import { OAuthUserDto } from './dto/oauth-user.dto';
import { RegisterDto } from './dto/register.dto';

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
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Check if this should be an admin user based on environment variable
    const adminEmails = this.configService.get<string>('ADMIN_EMAILS', '').split(',').map(e => e.trim());
    const isAdmin = adminEmails.includes(email);

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      auth_provider: AuthProvider.EMAIL,
      role: isAdmin ? UserRole.ADMIN : UserRole.USER,
      referral_code: this.generateReferralCode(),
    });

    await this.userRepository.save(user);

    // Track signup event
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

      // Track trial started for non-admin users
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

    // Send verification email automatically for non-admin users
    if (!isAdmin) {
      try {
        await this.sendVerificationEmail(user.id);
      } catch (error) {
        console.error(`Failed to send verification email during registration for ${user.email}:`, error instanceof Error ? error.message : 'Unknown error');
        // Don't fail the registration if email sending fails
      }
    }

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

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user registered with OAuth but trying to login with password
    if (user.auth_provider !== AuthProvider.EMAIL) {
      throw new UnauthorizedException(`Please sign in with ${user.auth_provider}`);
    }

    if (!user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Track login event
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

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.userRepository.findOne({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user.id, user.email);
      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateOAuthUser(oauthUser: OAuthUserDto) {
    const { email, google_id, avatar_url } = oauthUser;

    // Try to find existing user by email first
    let user = await this.userRepository.findOne({ where: { email } });

    if (user) {
      // User exists - update OAuth info if needed
      let needsUpdate = false;

      if (google_id && !user.google_id) {
        user.google_id = google_id;
        user.auth_provider = AuthProvider.GOOGLE;
        needsUpdate = true;
      }

      if (avatar_url && !user.avatar_url) {
        user.avatar_url = avatar_url;
        needsUpdate = true;
      }

      if (!user.is_verified) {
        user.is_verified = true;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await this.userRepository.save(user);
      }
    } else {
      // Create new user
      const authProvider = google_id ? AuthProvider.GOOGLE : AuthProvider.EMAIL;

      user = this.userRepository.create({
        email,
        google_id,
        avatar_url,
        auth_provider: authProvider,
        is_verified: true,
        referral_code: this.generateReferralCode(),
      });

      await this.userRepository.save(user);
    }

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

  private generateReferralCode(): string {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async sendVerificationEmail(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.is_verified) {
      return { message: 'Email already verified' };
    }

    // Invalidate any existing verification tokens
    await this.emailVerificationRepository.update(
      { 
        user_id: userId, 
        type: VerificationType.EMAIL_SIGNUP,
        status: VerificationStatus.PENDING 
      },
      { status: VerificationStatus.EXPIRED }
    );

    // Create new verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

    const verification = this.emailVerificationRepository.create({
      user_id: userId,
      email: user.email,
      token,
      type: VerificationType.EMAIL_SIGNUP,
      expires_at: expiresAt,
      status: VerificationStatus.PENDING,
    });

    await this.emailVerificationRepository.save(verification);

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(user.email, token);
      console.log(`✅ Verification email sent to: ${user.email}`);
    } catch (error) {
      console.error(`❌ Failed to send verification email to ${user.email}:`, error instanceof Error ? error.message : 'Unknown error');
      // Don't fail the registration, just log the error
    }
    
    return { message: 'Verification email sent successfully' };
  }

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