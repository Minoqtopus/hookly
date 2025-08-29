/**
 * Reset Password Use Case - Business Logic Layer
 * 
 * Staff Engineer Design: Clean use-case pattern
 * Business Logic: ONLY business rules and password reset
 * No UI Concerns: No notifications, navigation, or UI state
 */

import { ResetPasswordWithTokenRequest } from '../contracts/auth';
import { AuthService } from '../services/auth-service';

export interface ResetPasswordUseCaseResult {
  success: boolean;
  message?: string;
  error?: string;
}

export class ResetPasswordUseCase {
  constructor(private authService: AuthService) {}

  async execute(request: ResetPasswordWithTokenRequest): Promise<ResetPasswordUseCaseResult> {
    try {
      // 1. Business Logic: Call auth service for data access
      const response = await this.authService.resetPasswordWithToken(request);
      
      // 2. Business Logic: Return business result
      return {
        success: response.success,
        message: response.message,
      };
    } catch (error) {
      // Handle unexpected errors
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
