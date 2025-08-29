/**
 * Google OAuth Use Case - Business Logic Layer
 * 
 * Staff Engineer Design: Clean use-case pattern
 * Business Logic: ONLY business rules and OAuth authentication
 * No UI Concerns: No notifications, navigation, or UI state
 */

import { AuthService } from '../services/auth-service';

export interface GoogleOAuthUseCaseResult {
  success: boolean;
  redirect?: string;
  error?: string;
}

export class GoogleOAuthUseCase {
  constructor(private authService: AuthService) {}

  async execute(): Promise<GoogleOAuthUseCaseResult> {
    try {
      // Staff Engineer Note: OAuth flow works by redirects, not API calls
      // The frontend should only initiate the OAuth flow
      // Callbacks are handled by the backend redirecting to the frontend with tokens
      
      // Initiate OAuth flow by redirecting to backend
      await this.authService.initiateGoogleOAuth();
      
      // Construct redirect URL for the use case result
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const redirectUrl = `${baseUrl}/auth/google`;
      
      return {
        success: true,
        redirect: redirectUrl
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
