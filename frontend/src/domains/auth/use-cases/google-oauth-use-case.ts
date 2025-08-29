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
  error?: string;
}

export class GoogleOAuthUseCase {
  constructor(private authService: AuthService) {}

  async execute(request: GoogleOAuthRequest): Promise<GoogleOAuthUseCaseResult> {
    try {
      // 1. Business Logic: Call auth service for data access
      const response = await this.authService.googleOAuth(request);
      
      // 2. Business Logic: Return business result
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
