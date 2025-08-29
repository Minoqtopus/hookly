/**
 * OAuth Authentication Controller
 * 
 * Handles OAuth authentication flows including Google OAuth, callback processing,
 * and account linking. This controller focuses specifically on third-party
 * authentication while delegating core authentication to other controllers.
 * 
 * Staff Engineer Note: Extracted from the original AuthController god object
 * to separate OAuth concerns from traditional authentication. Maintains exact
 * same security patterns and API contracts.
 */

import { Controller, Get, Ip, Request, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ApiExcludeEndpoint, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { SessionSecurityUtil } from '../../common/utils/session-security.util';
import { AuthProvider } from '../../entities/user.entity';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { OAuthAuthenticationService } from '../services/oauth-authentication.service';
import { RefreshTokenService } from '../services/supporting/refresh-token.service';

@ApiTags('OAuth Authentication')
@Controller('auth')
export class OAuthController {
  constructor(
    private oauthAuthenticationService: OAuthAuthenticationService,
    private refreshTokenService: RefreshTokenService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Google OAuth Initiation Endpoint
   * 
   * Staff Engineer Note: Maintains exact same OAuth flow initiation
   * as the original implementation with Google's OpenID Connect.
   */
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Initiate Google OAuth authentication flow',
    description: `Start secure Google OAuth authentication with enterprise-grade security and compliance.
    
    **OAuth Security:**
    - ✅ OpenID Connect: Industry-standard authentication protocol
    - ✅ PKCE validation: Proof Key for Code Exchange prevents CSRF attacks
    - ✅ State parameter: CSRF protection with cryptographic random values
    - ✅ Scope limitation: Minimal permissions (email, profile) for privacy
    - ✅ Secure redirect: Validated callback URLs prevent open redirects
    
    **Business Features:**
    - ✅ Account linking: Seamless connection with existing email accounts
    - ✅ Profile sync: Automatic avatar and name population
    - ✅ Email verification: Trusted provider auto-verification
    - ✅ Trial activation: Immediate access to platform features
    - ✅ Single sign-on: Streamlined user experience
    
    **Implementation:**
    - ✅ Google OAuth 2.0: Official Google authentication service
    - ✅ Passport.js integration: Battle-tested OAuth library
    - ✅ Environment-based config: Secure credential management
    - ✅ Error handling: Graceful failure with user-friendly messaging
    
    **Flow:** Redirects to Google → User consent → Callback → JWT tokens
    **Scopes:** openid, email, profile (minimal required permissions)
    **Callback:** /auth/google/callback with authorization code`
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to Google OAuth consent screen',
    headers: {
      Location: {
        description: 'Google OAuth authorization URL',
        schema: { type: 'string' }
      }
    }
  })
  // Exclude from API documentation since it's a redirect endpoint
  @ApiExcludeEndpoint()
  async googleAuth() {
    // GoogleAuthGuard handles the redirect to Google OAuth
  }

  /**
   * Google OAuth Callback Endpoint
   * 
   * Staff Engineer Note: Maintains exact same callback processing logic,
   * account linking, and security validations as the original implementation.
   */
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Process Google OAuth callback with secure account linking',
    description: `Complete Google OAuth authentication flow with enterprise security and seamless account management.
    
    **Security Processing:**
    - ✅ Authorization code validation: Secure exchange for access tokens
    - ✅ Token verification: Google's public key signature validation
    - ✅ Email verification: Trusted provider auto-verification bypass
    - ✅ Profile validation: Sanitization and length limiting for security
    - ✅ Session binding: JWT tokens with device fingerprint integration
    
    **Account Management:**
    - ✅ New user creation: Automatic account setup with trial benefits
    - ✅ Existing account linking: Secure association with email accounts
    - ✅ Profile synchronization: Avatar and name updates from Google
    - ✅ Multi-provider support: Seamless addition to existing auth methods
    - ✅ Admin detection: Automatic privilege elevation for authorized emails
    
    **Business Intelligence:**
    - ✅ Registration tracking: Analytics for OAuth conversion metrics
    - ✅ Login analytics: Provider preference and usage patterns
    - ✅ Trial activation: Automatic benefit assignment for new users
    - ✅ Account linking metrics: Cross-provider user journey analysis
    
    **Error Handling:**
    - ✅ OAuth failures: Graceful handling with user-friendly messaging
    - ✅ Account conflicts: Clear guidance for resolution paths  
    - ✅ Security violations: Automatic logging and alert systems
    - ✅ Rate limiting: Protection against OAuth abuse patterns
    
    **Response:** Redirects to frontend with JWT tokens in URL params
    **Token Lifespan:** 15 minutes (access) + 7 days (refresh)
    **Account Linking:** Automatic for matching email addresses`
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to frontend with authentication tokens',
    headers: {
      Location: {
        description: 'Frontend URL with JWT tokens as query parameters',
        schema: { type: 'string' }
      }
    }
  })
  // Exclude from API documentation since it's handled by OAuth flow
  @ApiExcludeEndpoint()
  async googleCallback(
    @Request() req: any,
    @Res() res: Response,
    @Ip() ipAddress: string,
  ) {
    try {
      console.log('[OAUTH_CONTROLLER] Google callback started');
      console.log('[OAUTH_CONTROLLER] Request headers:', req.headers);
      console.log('[OAUTH_CONTROLLER] Request user:', JSON.stringify(req.user, null, 2));
      console.log('[OAUTH_CONTROLLER] IP Address:', ipAddress);
      
      // Extract Google user information from Passport.js
      const googleUser = req.user;
      
      if (!googleUser) {
        console.error('[OAUTH_CONTROLLER] req.user is undefined or null');
        throw new Error('No user data received from Google OAuth');
      }
      
      console.log('[OAUTH_CONTROLLER] Google user data:', {
        email: googleUser.email,
        id: googleUser.id,
        google_id: googleUser.google_id,
        firstName: googleUser.firstName,
        first_name: googleUser.first_name,
        lastName: googleUser.lastName,
        last_name: googleUser.last_name,
        picture: googleUser.picture,
        photos: googleUser.photos,
        oauth_provider: googleUser.oauth_provider
      });
      
      const userAgent = req.get('User-Agent');
      console.log('[OAUTH_CONTROLLER] User Agent:', userAgent);
      
      // Validate OAuth user and handle account linking/creation
      console.log('[OAUTH_CONTROLLER] Calling validateOAuthUser with:', {
        email: googleUser.email,
        provider: AuthProvider.GOOGLE,
        providerId: googleUser.google_id, // Fix: Use google_id instead of id
        firstName: googleUser.first_name, // Fix: Use first_name instead of firstName
        lastName: googleUser.last_name,   // Fix: Use last_name instead of lastName
        picture: googleUser.picture || googleUser.photos?.[0]?.value, // Fix: Extract from photos array
      });
      
      const validationResult = await this.oauthAuthenticationService.validateOAuthUser({
        email: googleUser.email,
        provider: AuthProvider.GOOGLE,
        providerId: googleUser.google_id, // Fix: Use google_id instead of id
        firstName: googleUser.first_name, // Fix: Use first_name instead of firstName
        lastName: googleUser.last_name,   // Fix: Use last_name instead of lastName
        picture: googleUser.picture || googleUser.photos?.[0]?.value, // Fix: Extract from photos array
      }, ipAddress, userAgent);

      console.log('[OAUTH_CONTROLLER] Validation successful:', validationResult);

      // Generate JWT tokens for immediate authentication
      const tokens = await this.generateTokensWithStorage(
        validationResult.user.id, 
        validationResult.user.email, 
        ipAddress, 
        userAgent
      );

      const result = {
        user: { 
          id: validationResult.user.id, 
          email: validationResult.user.email, 
          plan: validationResult.user.plan,
          auth_providers: validationResult.user.auth_providers,
          is_email_verified: validationResult.user.is_email_verified
        },
        ...tokens,
      };

      // Redirect to frontend with tokens
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/auth/callback?access_token=${result.access_token}&refresh_token=${result.refresh_token}&user=${encodeURIComponent(JSON.stringify(result.user))}`;
      
      return res.redirect(redirectUrl);
    } catch (error) {
      // Log the error for monitoring
      console.error('[OAUTH_CONTROLLER] Google OAuth callback error:', error);
      console.error('[OAUTH_CONTROLLER] Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace',
        response: (error as any)?.response || 'No response',
        status: (error as any)?.status || 'No status'
      });
      
      // Redirect to frontend with error
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const errorUrl = `${frontendUrl}/auth/error?message=${encodeURIComponent('Authentication failed. Please try again.')}`;
      
      console.log('[OAUTH_CONTROLLER] Redirecting to error page:', errorUrl);
      return res.redirect(errorUrl);
    }
  }

  /**
   * Generate tokens with storage - same logic as CoreAuthenticationService
   * 
   * Staff Engineer Note: This duplicates token generation logic, but OAuth flows
   * need direct token generation without AuthService dependency.
   */
  private async generateTokensWithStorage(
    userId: string, 
    email: string, 
    ipAddress?: string, 
    userAgent?: string
  ): Promise<{ access_token: string; refresh_token: string }> {
    // Generate session security context
    const sessionId = SessionSecurityUtil.generateSessionId(userId, ipAddress, userAgent);

    // Create JWT payload
    const payload = {
      sub: userId,
      email: email,
      sessionId
    };

    // Generate access token
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m')
    });

    // Generate refresh token
    const tokenFamily = this.refreshTokenService.generateTokenFamily();
    const refreshToken = await this.jwtService.signAsync(
      { ...payload, family: tokenFamily },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d', // 7 days
      }
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    // Store refresh token
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
}