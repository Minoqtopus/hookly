/**
 * Google OAuth Use Case - Business Logic Layer
 * 
 * Staff Engineer Design: Clean use-case pattern
 * Business Logic: ONLY business rules and OAuth authentication
 * No UI Concerns: No notifications, navigation, or UI state
 */

import { GoogleOAuthRequest } from '../contracts/auth';
import { AuthService } from '../services/auth-service';

export interface GoogleOAuthUseCaseResult {
  success: boolean;
  user?: any;
  remainingGenerations?: number;
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
        remainingGenerations: response.remaining_generations,
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
