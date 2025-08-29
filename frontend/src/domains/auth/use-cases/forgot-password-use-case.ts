/**
 * Forgot Password Use Case - Business Logic Layer
 * 
 * Staff Engineer Design: Clean use-case pattern
 * Business Logic: Handles password reset request business rules
 * No Mock Data: Uses real auth service for real data
 */

import { NotificationService } from '../../../shared/services/notification-service';
import { PasswordResetRequest } from '../contracts/auth';
import { AuthService } from '../services/auth-service';

export interface ForgotPasswordUseCaseResult {
  success: boolean;
  message?: string;
  error?: string;
}

export class ForgotPasswordUseCase {
  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  async execute(request: PasswordResetRequest): Promise<ForgotPasswordUseCaseResult> {
    try {
      // 1. Call auth service for data access
      const response = await this.authService.requestPasswordReset(request);
      
      // 2. Business logic: Handle password reset request
      if (response.success) {
        this.notificationService.showSuccess(
          'Password reset email sent! Check your inbox for instructions.'
        );
        
        return {
          success: true,
          message: response.message || 'Password reset email sent successfully',
        };
      } else {
        // Handle failure response
        this.notificationService.showError(response.message || 'Failed to send password reset email');
        
        return {
          success: false,
          error: response.message || 'Failed to send password reset email',
        };
      }
    } catch (error) {
      // Handle unexpected errors
      const errorMessage = error instanceof Error ? error.message : 'Failed to process password reset request';
      this.notificationService.showError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
