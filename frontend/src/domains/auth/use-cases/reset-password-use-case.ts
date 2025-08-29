/**
 * Reset Password Use Case - Business Logic Layer
 * 
 * Staff Engineer Design: Clean use-case pattern
 * Business Logic: Handles password reset with token business rules
 * No Mock Data: Uses real auth service for real data
 */

import { NavigationService } from '../../../shared/services/navigation-service';
import { NotificationService } from '../../../shared/services/notification-service';
import { ResetPasswordWithTokenRequest } from '../contracts/auth';
import { AuthService } from '../services/auth-service';

export interface ResetPasswordUseCaseResult {
  success: boolean;
  message?: string;
  error?: string;
}

export class ResetPasswordUseCase {
  constructor(
    private authService: AuthService,
    private navigationService: NavigationService,
    private notificationService: NotificationService
  ) {}

  async execute(request: ResetPasswordWithTokenRequest): Promise<ResetPasswordUseCaseResult> {
    try {
      // 1. Call auth service for data access
      const response = await this.authService.resetPasswordWithToken(request);
      
      // 2. Business logic: Handle password reset
      if (response.success) {
        this.notificationService.showSuccess(
          'Password reset successful! You can now login with your new password.'
        );
        
        // Navigate to login page
        this.navigationService.navigateTo('/login');
        
        return {
          success: true,
          message: response.message || 'Password reset successful',
        };
      } else {
        // Handle failure response
        this.notificationService.showError(response.message || 'Failed to reset password');
        
        return {
          success: false,
          error: response.message || 'Failed to reset password',
        };
      }
    } catch (error) {
      // Handle unexpected errors
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
      this.notificationService.showError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
