/**
 * Google OAuth Use Case - Business Logic Layer
 * 
 * Staff Engineer Design: Clean use-case pattern
 * Business Logic: ONLY business rules and OAuth authentication
 * No UI Concerns: No notifications, navigation, or UI state
 */

import { AuthTokens, GoogleOAuthRequest, User } from '../contracts/auth';
import { AuthService } from '../services/auth-service';

export interface GoogleOAuthUseCaseResult {
  success: boolean;
  user?: User;
  tokens?: AuthTokens;
  redirect?: string;
  error?: string;
}

export class GoogleOAuthUseCase {
  constructor(private authService: AuthService) {}

  async execute(request?: GoogleOAuthRequest): Promise<GoogleOAuthUseCaseResult> {
    try {
      // If no request provided, initiate OAuth flow
      if (!request) {
        // Business Logic: Initiate OAuth flow by redirecting to backend
        const response = await this.authService.initiateGoogleOAuth();
        return {
          success: true,
          redirect: response.redirectUrl
        };
      }

      // Handle OAuth callback with code
      const response = await this.authService.googleOAuth(request);
      
      // Business Logic: Return authentication result
      return {
        success: true,
        user: response.user,
        tokens: {
          access_token: response.access_token,
          refresh_token: response.refresh_token,
          expires_in: 900
        }
      };
    } catch (error) {
      // Handle unexpected errors
      const errorMessage = error instanceof Error ? error.message : 'Google OAuth failed';
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
