/**
 * Core Authentication Service
 * 
 * Handles core authentication operations including user registration,
 * login, logout, and token management. Focuses on email/password authentication
 * while coordinating with other specialized services.
 * 
 * Staff Engineer Note: This service orchestrates the authentication
 * process while delegating specific concerns to specialized services.
 * It maintains the exact same security patterns as the original AuthService.
 */

import { Injectable, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AnalyticsService } from '../../analytics/analytics.service';
import { EventType } from '../../entities/analytics-event.entity';
import { AuthProvider, User, UserPlan, UserRole } from '../../entities/user.entity';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { AdminManagementService } from './supporting/admin-management.service';
import { TrialAbusePreventionService } from './supporting/trial-abuse-prevention.service';
import { SecurityLoggerService } from '../../common/services/security-logger.service';
import { EmailVerificationService } from './email-verification.service';
import { PasswordManagementService } from './password-management.service';
import { RefreshTokenService } from './supporting/refresh-token.service';
import { SessionSecurityUtil } from '../../common/utils/session-security.util';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BUSINESS_CONSTANTS } from '../../constants/business-rules';

export interface AuthenticationResult {
  user: {
    id: string;
    email: string;
    plan: UserPlan;
    auth_providers: AuthProvider[];
    is_email_verified: boolean;
    trial_generations_used: number;
    trial_ends_at?: Date;
    monthly_generation_count?: number;
    monthly_reset_date?: Date;
  };
  access_token: string;
  refresh_token: string;
}

export interface LoginResult extends AuthenticationResult {
  message: string;
}

export interface RegistrationResult extends AuthenticationResult {
  message: string;
  isNewUser: boolean;
}

@Injectable()
export class CoreAuthenticationService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private analyticsService: AnalyticsService,
    private adminManagementService: AdminManagementService,
    private trialAbusePreventionService: TrialAbusePreventionService,
    private securityLoggerService: SecurityLoggerService,
    private emailVerificationService: EmailVerificationService,
    private passwordManagementService: PasswordManagementService,
    private refreshTokenService: RefreshTokenService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Register new user with comprehensive security measures
   * 
   * Staff Engineer Note: This maintains the exact same security flow as the
   * original AuthService.register method, including all validation and security checks.
   */
  async register(
    registerDto: RegisterDto, 
    ipAddress?: string, 
    userAgent?: string
  ): Promise<RegistrationResult> {
    const { email, password } = registerDto;

    // Check if user already exists (same logic as original)
    const existingUser = await this.userRepository.findOne({ where: { email } });

    if (existingUser) {
      // Handle OAuth -> Email account linking (same as original AuthService)
      if (existingUser.auth_providers?.includes(AuthProvider.GOOGLE) && !existingUser.password) {
        return this.linkPasswordToOAuthAccount(existingUser, password, ipAddress, userAgent);
      }

      throw new ConflictException('User with this email already exists');
    }

    // Trial abuse prevention (same as original)
    if (ipAddress && userAgent) {
      await this.trialAbusePreventionService.validateTrialRegistration({
        email,
        ipAddress,
        userAgent
      });
    }

    // Hash password (same settings as original)
    const hashedPassword = await this.passwordManagementService.hashPassword(password);

    // Check if user should be admin (same as original)
    const isAdmin = await this.adminManagementService.isAdminEmail(email);

    // Create user (same structure as original)
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      auth_providers: [AuthProvider.EMAIL],
      role: isAdmin ? UserRole.ADMIN : UserRole.USER,
      plan: UserPlan.TRIAL,
      is_email_verified: false,
      trial_started_at: new Date(), // Fix: Set trial start time for proper tracking
      trial_ends_at: new Date(Date.now() + BUSINESS_CONSTANTS.TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000),
      trial_generations_used: 0,
      monthly_generation_count: 0,
      total_generations: 0,
      registration_ip: ipAddress, // Fix: Store IP for trial abuse prevention
      registration_user_agent: userAgent // Fix: Store user agent for abuse detection
    });

    const savedUser = await this.userRepository.save(user);

    // Generate tokens (same as original AuthService)
    const tokens = await this.generateTokensWithStorage(savedUser.id, savedUser.email, ipAddress, userAgent);

    // Send verification email (same as original)
    try {
      await this.emailVerificationService.sendVerificationEmail(savedUser.id);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't fail registration, just log the error (same as original)
    }

    // Track analytics (same as original)
    try {
      await this.analyticsService.trackEvent(
        EventType.REGISTRATION,
        savedUser.id,
        { 
          auth_provider: AuthProvider.EMAIL,
          is_admin: isAdmin,
          plan: UserPlan.TRIAL,
          ip_address: ipAddress
        }
      );
    } catch (error) {
      console.error('Failed to track registration analytics:', error);
    }

    return {
      user: { 
        id: savedUser.id, 
        email: savedUser.email, 
        plan: savedUser.plan,
        auth_providers: savedUser.auth_providers,
        is_email_verified: savedUser.is_email_verified,
        trial_generations_used: savedUser.trial_generations_used,
        trial_ends_at: savedUser.trial_ends_at,
        monthly_generation_count: savedUser.monthly_generation_count,
        monthly_reset_date: savedUser.monthly_reset_date
      },
      ...tokens,
      message: 'Registration successful. Please check your email for verification.',
      isNewUser: true
    };
  }

  /**
   * Authenticate user login
   * 
   * Staff Engineer Note: Maintains the exact same security validation as the
   * original AuthService.login method.
   */
  async login(
    loginDto: LoginDto, 
    ipAddress?: string, 
    userAgent?: string
  ): Promise<LoginResult> {
    const { email, password } = loginDto;

    // Find user (same query as original)
    const user = await this.userRepository.findOne({ 
      where: { email },
      select: ['id', 'email', 'password', 'role', 'plan', 'is_email_verified', 'auth_providers']
    });

    if (!user) {
      // Log failed attempt (same as original)
      this.securityLoggerService.logSecurityEvent({
        type: 'auth_failure' as any,
        email: email,
        success: false,
        timestamp: new Date()
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check password (same validation as original)
    if (!user.password || !(await bcrypt.compare(password, user.password))) {
      // Log failed attempt (same as original)
      this.securityLoggerService.logSecurityEvent({
        type: 'auth_failure' as any,
        userId: user.id,
        email: email,
        success: false,
        timestamp: new Date()
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate tokens (same as original)
    const tokens = await this.generateTokensWithStorage(user.id, user.email, ipAddress, userAgent);

    // Log successful login (same as original)
    this.securityLoggerService.logSecurityEvent({
      type: 'auth_success' as any,
      userId: user.id,
      email: user.email,
      success: true,
      timestamp: new Date()
    });

    // Track analytics (same as original)
    try {
      await this.analyticsService.trackEvent(
        EventType.LOGIN,
        user.id,
        {
          auth_providers: user.auth_providers,
          plan: user.plan,
          ip_address: ipAddress
        }
      );
    } catch (error) {
      console.error('Failed to track login analytics:', error);
    }

    return {
      user: { 
        id: user.id, 
        email: user.email, 
        plan: user.plan,
        auth_providers: user.auth_providers,
        is_email_verified: user.is_email_verified,
        trial_generations_used: user.trial_generations_used,
        trial_ends_at: user.trial_ends_at,
        monthly_generation_count: user.monthly_generation_count,
        monthly_reset_date: user.monthly_reset_date
      },
      ...tokens,
      message: 'Login successful'
    };
  }

  /**
   * Refresh access token using refresh token
   * 
   * Staff Engineer Note: Maintains the same token refresh logic as the original
   * AuthService with security validation.
   */
  async refreshToken(
    refreshToken: string, 
    ipAddress?: string, 
    userAgent?: string
  ): Promise<AuthenticationResult> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    // Validate refresh token (same as original)
    const tokenData = await this.refreshTokenService.validateRefreshToken(refreshToken);
    if (!tokenData) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Get current user data (same as original)
    const user = await this.userRepository.findOne({ 
      where: { id: tokenData.user_id },
      select: ['id', 'email', 'role', 'plan', 'is_email_verified', 'auth_providers']
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // FIX: Generate new tokens with SAME token family for proper rotation
    const newTokens = await this.generateTokensWithStorage(
      user.id, 
      user.email, 
      ipAddress, 
      userAgent,
      tokenData.token_family // Pass existing family for rotation
    );

    // Revoke the used refresh token (same as original)
    await this.refreshTokenService.revokeToken(tokenData, 'Token refresh');

    return {
      user: { 
        id: user.id, 
        email: user.email, 
        plan: user.plan,
        auth_providers: user.auth_providers,
        is_email_verified: user.is_email_verified,
        trial_generations_used: user.trial_generations_used,
        trial_ends_at: user.trial_ends_at,
        monthly_generation_count: user.monthly_generation_count,
        monthly_reset_date: user.monthly_reset_date
      },
      ...newTokens
    };
  }

  /**
   * Logout user by revoking refresh token
   * 
   * Staff Engineer Note: Same logout logic as original AuthService.
   */
  async logout(refreshToken: string): Promise<{ message: string }> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    try {
      const tokenData = await this.refreshTokenService.validateRefreshToken(refreshToken);
      if (tokenData) {
        await this.refreshTokenService.revokeToken(tokenData, 'User logout');
      }
    } catch (error) {
      // Token might already be revoked or invalid
      // Don't throw error to avoid exposing token state (same as original)
    }

    return { message: 'Logged out successfully' };
  }

  /**
   * Logout all sessions for a user
   * 
   * Staff Engineer Note: Same global logout logic as original AuthService.
   */
  async logoutAll(userId: string): Promise<{ message: string }> {
    await this.refreshTokenService.revokeAllUserTokens(userId, 'Logout all sessions');
    return { message: 'All sessions terminated successfully' };
  }

  /**
   * Get user profile information
   * 
   * Staff Engineer Note: Same user profile retrieval as original AuthService.
   */
  async getUserProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ 
      where: { id: userId },
      select: [
        'id', 'email', 'first_name', 'last_name', 'profile_picture',
        'role', 'plan', 'is_email_verified', 'trial_ends_at',
        'trial_generations_used', 'monthly_generation_count', 
        'total_generations', 'created_at', 'auth_providers'
      ]
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  /**
   * Generate tokens with storage - same as original AuthService
   * 
   * Staff Engineer Note: This maintains the exact same token generation
   * and session security logic as the original implementation.
   */
  private async generateTokensWithStorage(
    userId: string, 
    email: string, 
    ipAddress?: string, 
    userAgent?: string,
    existingTokenFamily?: string // Optional: for token rotation
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.userRepository.findOne({ 
      where: { id: userId },
      select: ['id', 'email', 'role', 'plan']
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate session security context (same as original)
    const sessionId = SessionSecurityUtil.generateSessionId(userId, ipAddress, userAgent);

    // Create JWT payload (same structure as original)
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      plan: user.plan,
      sessionId
    };

    // Generate access token (same settings as original)
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m')
    });

    // Generate refresh token with proper rotation support
    const tokenFamily = existingTokenFamily || this.refreshTokenService.generateTokenFamily();
    const refreshToken = await this.jwtService.signAsync(
      { ...payload, family: tokenFamily },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d', // 7 days (same as original)
      }
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days (same as original)

    // Store refresh token (same as original)
    await this.refreshTokenService.storeRefreshToken(
      userId,
      refreshToken,
      tokenFamily,
      expiresAt,
      ipAddress,
      userAgent
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  /**
   * Link password to OAuth account - same as original AuthService
   * 
   * Staff Engineer Note: Handles the OAuth -> Email account linking scenario
   * with the same security validation as the original.
   */
  private async linkPasswordToOAuthAccount(
    existingUser: User,
    password: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<RegistrationResult> {
    // Hash password (same as original)
    const hashedPassword = await this.passwordManagementService.hashPassword(password);

    // Update user with password (same as original)
    existingUser.password = hashedPassword;
    existingUser.updated_at = new Date();
    await this.userRepository.save(existingUser);

    // Generate tokens (same as original)
    const tokens = await this.generateTokensWithStorage(existingUser.id, existingUser.email, ipAddress, userAgent);

    return {
      user: { 
        id: existingUser.id, 
        email: existingUser.email, 
        plan: existingUser.plan,
        auth_providers: existingUser.auth_providers,
        is_email_verified: existingUser.is_email_verified,
        trial_generations_used: existingUser.trial_generations_used,
        trial_ends_at: existingUser.trial_ends_at,
        monthly_generation_count: existingUser.monthly_generation_count,
        monthly_reset_date: existingUser.monthly_reset_date
      },
      ...tokens,
      message: 'Password set successfully for your existing account.',
      isNewUser: false
    };
  }
}