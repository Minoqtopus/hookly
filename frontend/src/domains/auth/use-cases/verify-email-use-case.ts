/**
 * Verify Email Use Case - Business Logic Layer
 * 
 * Staff Engineer Design: Clean use-case pattern
 * Business Logic: ONLY business rules and email verification
 * No UI Concerns: No notifications, navigation, or UI state
 */

import { VerifyEmailRequest } from '../contracts/auth';
import { AuthService } from '../services/auth-service';

export interface VerifyEmailUseCaseResult {
  success: boolean;
  user?: any;
  remainingGenerations?: number;
  error?: string;
}

export class VerifyEmailUseCase {
  constructor(private authService: AuthService) {}

  async execute(request: VerifyEmailRequest): Promise<VerifyEmailUseCaseResult> {
    try {
      // 1. Business Logic: Call auth service for data access
      const response = await this.authService.verifyEmail(request);
      
      // 2. Business Logic: Return business result
      return {
        success: true,
        user: response.user,
        remainingGenerations: response.remaining_generations,
      };
    } catch (error) {
      // Handle unexpected errors
      const errorMessage = error instanceof Error ? error.message : 'Email verification failed';
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
