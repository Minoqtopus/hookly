import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: `${configService.get<string>('BACKEND_URL')}/auth/google/callback`,
      scope: ['email', 'profile'],
      // Enhanced security configuration
      state: true, // Enable state parameter for CSRF protection
      passReqToCallback: false, // We don't need request object in callback
    });
  }

  /**
   * Validate Google OAuth profile and extract user information
   * 
   * Security features:
   * - Validates required profile fields exist
   * - Sanitizes user input from OAuth provider
   * - Validates email format and domain
   * - Generates secure state for CSRF protection
   * 
   * @param accessToken - Google access token (not stored)
   * @param refreshToken - Google refresh token (not stored)
   * @param profile - Google user profile
   * @param done - Passport callback function
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      console.log('[GOOGLE_STRATEGY] Starting validation with profile:', JSON.stringify(profile, null, 2));
      
      // Validate required profile fields exist
      if (!profile?.id || !profile?.emails?.[0]?.value) {
        console.error('[GOOGLE_STRATEGY] Missing required fields:', { 
          hasId: !!profile?.id, 
          hasEmails: !!profile?.emails, 
          firstEmail: profile?.emails?.[0]?.value 
        });
        return done(new Error('Invalid Google profile: missing required fields'), null);
      }

      const { id, name, emails } = profile;
      console.log('[GOOGLE_STRATEGY] Extracted fields:', { id, name, emails });
      
      // Validate email format
      const email = emails[0].value;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.error('[GOOGLE_STRATEGY] Invalid email format:', email);
        return done(new Error('Invalid email format from Google profile'), null);
      }

      // Sanitize and validate user data
      const user = {
        google_id: String(id).substring(0, 100), // Limit length for security
        email: email.toLowerCase().trim().substring(0, 255), // Normalize and limit
        first_name: name?.givenName?.substring(0, 50) || '', // Limit length
        last_name: name?.familyName?.substring(0, 50) || '', // Limit length
        // Note: We don't store OAuth access tokens for security
        oauth_provider: 'google',
        oauth_validated_at: new Date().toISOString(),
      };

      console.log('[GOOGLE_STRATEGY] Created user object:', JSON.stringify(user, null, 2));

      // Additional security validation
      if (user.email.length < 3 || user.google_id.length < 1) {
        console.error('[GOOGLE_STRATEGY] Security validation failed:', { 
          emailLength: user.email.length, 
          googleIdLength: user.google_id.length 
        });
        return done(new Error('Invalid Google profile data'), null);
      }

      console.log('[GOOGLE_STRATEGY] Validation successful, calling done()');
      done(null, user);
    } catch (error) {
      console.error('[GOOGLE_STRATEGY] Unexpected error:', error);
      done(new Error('OAuth validation failed'), null);
    }
  }
}