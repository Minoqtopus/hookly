/**
 * OAuth Authentication Service
 * 
 * Handles OAuth user authentication and account linking logic.
 * Extracted from AuthService to separate OAuth concerns from
 * traditional email/password authentication.
 * 
 * Staff Engineer Note: OAuth authentication has different security
 * requirements and user flows, warranting separate service handling.
 * This maintains the exact same business logic as the original AuthService.
 */

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsService } from '../../analytics/analytics.service';
import { SecurityLoggerService } from '../../common/services/security-logger.service';
import { BUSINESS_CONSTANTS } from '../../constants/business-rules';
import { EventType } from '../../entities/analytics-event.entity';
import { AuthProvider, User, UserPlan, UserRole } from '../../entities/user.entity';
import { OAuthUserDto } from '../dto/oauth-user.dto';
import { AdminManagementService } from './supporting/admin-management.service';
import { TrialAbusePreventionService } from './supporting/trial-abuse-prevention.service';

export interface OAuthValidationResult {
  user: User;
  isNewUser: boolean;
  requiresEmailVerification: boolean;
  accountLinked: boolean;
}

@Injectable()
export class OAuthAuthenticationService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private analyticsService: AnalyticsService,
    private adminManagementService: AdminManagementService,
    private trialAbusePreventionService: TrialAbusePreventionService,
    private securityLoggerService: SecurityLoggerService,
  ) {}

  /**
   * Validate OAuth user and handle account creation/linking
   * 
   * Staff Engineer Note: This maintains the exact same logic flow as the original
   * AuthService.validateOAuthUser method, including all security checks and
   * business rules.
   */
  async validateOAuthUser(
    oauthUser: OAuthUserDto, 
    ipAddress?: string, 
    userAgent?: string
  ): Promise<OAuthValidationResult> {
    console.log('[OAUTH_SERVICE] validateOAuthUser called with:', JSON.stringify(oauthUser, null, 2));
    console.log('[OAUTH_SERVICE] IP Address:', ipAddress);
    console.log('[OAUTH_SERVICE] User Agent:', userAgent);
    
    const { email, provider, providerId, firstName, lastName, picture } = oauthUser;
    
    console.log('[OAUTH_SERVICE] Destructured fields:', {
      email,
      provider,
      providerId,
      firstName,
      lastName,
      picture
    });

    if (!email || !provider || !providerId) {
      console.error('[OAUTH_SERVICE] Validation failed - missing required fields:', {
        hasEmail: !!email,
        hasProvider: !!provider,
        hasProviderId: !!providerId,
        emailValue: email,
        providerValue: provider,
        providerIdValue: providerId
      });
      throw new BadRequestException('Invalid OAuth user data');
    }

    console.log('[OAUTH_SERVICE] Basic validation passed, checking if user exists');
    // Check if user already exists by email (account linking - same as original)
    let user = await this.userRepository.findOne({ where: { email } });

    if (user) {
      console.log('[OAUTH_SERVICE] User already exists, updating OAuth provider information');
      // Existing user - update OAuth provider information if needed (same logic as original)
      let needsUpdate = false;

      // Link OAuth provider if not already linked (same as original AuthService)
      if (providerId && provider) {
        const providerIds = user.provider_ids || {};
        const providerKey = provider.toLowerCase() as keyof typeof providerIds;
        
        if (!providerIds[providerKey]) {
          providerIds[providerKey] = providerId;
          user.provider_ids = providerIds;
          
          // Add provider to auth providers if not already present (same as original)
          const authProviders = user.auth_providers || [];
          if (!authProviders.includes(provider)) {
            authProviders.push(provider);
            user.auth_providers = authProviders;
          }
          needsUpdate = true;
        }
        
        // Update profile info if missing (same as original)
        if (!user.first_name && firstName) {
          user.first_name = firstName;
          needsUpdate = true;
        }
        if (!user.last_name && lastName) {
          user.last_name = lastName;
          needsUpdate = true;
        }
        if (!user.profile_picture && picture) {
          user.profile_picture = picture;
          needsUpdate = true;
        }
      }

      // Auto-verify email for OAuth users (trusted provider - same as original)
      if (!user.is_email_verified) {
        user.is_email_verified = true;
        user.email_verified_at = new Date();
        needsUpdate = true;
      }

      // Save updates if any changes were made (same as original)
      if (needsUpdate) {
        await this.userRepository.save(user);
      }

      // Log successful OAuth login (same as original)
      this.securityLoggerService.logSecurityEvent({
        type: 'oauth_success' as any,
        userId: user.id,
        email: user.email,
        success: true,
        timestamp: new Date()
      });

      // Track login analytics (same as original)
      try {
        await this.analyticsService.trackEvent(
          EventType.LOGIN,
          user.id,
          { 
            provider: provider,
            method: 'oauth'
          }
        );
      } catch (error) {
        console.error('Failed to track OAuth login analytics:', error);
      }

      return {
        user,
        isNewUser: false,
        requiresEmailVerification: false,
        accountLinked: needsUpdate
      };
    } else {
      console.log('[OAUTH_SERVICE] User does not exist, creating new user');
      // Create new user for first-time OAuth authentication (same as original AuthService)
      const authProviders = [provider];
      const providerIds: any = {};
      const providerKey = provider.toLowerCase() as keyof typeof providerIds;
      providerIds[providerKey] = providerId;

      // Check trial abuse prevention (same as original)
      if (ipAddress && userAgent) {
        await this.trialAbusePreventionService.validateTrialRegistration({
          email,
          ipAddress,
          userAgent
        });
      }

      // Check if user should be admin (same as original)
      const isAdmin = await this.adminManagementService.isAdminEmail(email);

      user = this.userRepository.create({
        email,
        first_name: firstName,
        last_name: lastName,
        profile_picture: picture,
        provider_ids: providerIds,
        auth_providers: authProviders,
        role: isAdmin ? UserRole.ADMIN : UserRole.USER,
        plan: UserPlan.TRIAL,
        trial_started_at: new Date(), // Fix: Set trial start time for proper tracking
        trial_ends_at: new Date(Date.now() + BUSINESS_CONSTANTS.TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000),
        is_email_verified: true, // OAuth emails are pre-verified (same as original)
        email_verified_at: new Date(),
        trial_generations_used: 0,
        monthly_generation_count: 0,
        total_generations: 0,
        registration_ip: ipAddress, // Fix: Store IP for trial abuse prevention
        registration_user_agent: userAgent // Fix: Store user agent for abuse detection
      });

      const savedUser = await this.userRepository.save(user);

      // Log security event (same as original)
      this.securityLoggerService.logSecurityEvent({
        type: 'oauth_success' as any,
        userId: savedUser.id,
        email: savedUser.email,
        success: true,
        timestamp: new Date()
      });

      // Track registration analytics (same as original)
      try {
        await this.analyticsService.trackEvent(
          EventType.REGISTRATION,
          savedUser.id,
          { 
            provider: provider, 
            method: 'oauth',
            user_role: savedUser.role,
            plan: savedUser.plan
          }
        );
      } catch (error) {
        console.error('Failed to track OAuth registration analytics:', error);
      }

      return {
        user: savedUser,
        isNewUser: true,
        requiresEmailVerification: false,
        accountLinked: false
      };
    }
  }

  /**
   * Check if user has multiple OAuth providers linked
   * 
   * Staff Engineer Note: This is a new method that provides better visibility
   * into user's authentication methods for security and UX purposes.
   */
  async getUserAuthProviders(userId: string): Promise<{
    providers: AuthProvider[];
    providerIds: { [key: string]: string };
    hasPassword: boolean;
  }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['auth_providers', 'provider_ids', 'password']
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return {
      providers: user.auth_providers || [],
      providerIds: user.provider_ids || {},
      hasPassword: !!user.password
    };
  }

  /**
   * Unlink OAuth provider from user account
   * 
   * Staff Engineer Note: Allows users to manage their linked OAuth accounts
   * while maintaining security by requiring password if removing all OAuth providers.
   */
  async unlinkOAuthProvider(userId: string, provider: AuthProvider): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'auth_providers', 'provider_ids', 'password']
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if user would still have authentication method after unlinking
    const remainingProviders = (user.auth_providers || []).filter(p => p !== provider);
    if (remainingProviders.length === 0 && !user.password) {
      throw new BadRequestException('Cannot unlink last authentication method. Set a password first.');
    }

    // Remove provider from auth_providers array
    const updatedAuthProviders = user.auth_providers.filter(p => p !== provider);
    
    // Remove provider ID from provider_ids object
    const updatedProviderIds = { ...user.provider_ids };
    const providerKey = provider.toLowerCase() as keyof typeof updatedProviderIds;
    delete updatedProviderIds[providerKey];

    // Update user
    await this.userRepository.update(userId, {
      auth_providers: updatedAuthProviders,
      provider_ids: updatedProviderIds
    });

    // Log security event
    this.securityLoggerService.logSecurityEvent({
      type: 'oauth_unlink' as any,
      userId: userId,
      email: user.email,
      success: true,
      timestamp: new Date()
    });
  }
}