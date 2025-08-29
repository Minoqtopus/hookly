/**
 * Forgot Password Use Case - Business Logic Layer
 * 
 * Staff Engineer Design: Clean use-case pattern
 * Business Logic: ONLY business rules and password reset request
 * No UI Concerns: No notifications or UI state
 */

import { PasswordResetRequest } from '../contracts/auth';
import { AuthService } from '../services/auth-service';

export interface ForgotPasswordUseCaseResult {
  success: boolean;
  message: string;
  error: string;
}

export class ForgotPasswordUseCase {
  constructor(private authService: AuthService) {}

  async execute(request: PasswordResetRequest): Promise<ForgotPasswordUseCaseResult> {
    try {
      // 1. Business Logic: Call auth service for data access
      const response = await this.authService.requestPasswordReset(request);
      
      // 2. Business Logic: Return business result
      return {
        success: response.success,
        message: response.message,
        error: '',
      };
    } catch (error) {
      // Handle unexpected errors
      const errorMessage = error instanceof Error ? error.message : 'Failed to process request';
      
      return {
        success: false,
        message: '',
        error: errorMessage,
      };
    }
  }
}
