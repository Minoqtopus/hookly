/**
 * Change Password Use Case - Business Logic Layer
 * 
 * Staff Engineer Design: Clean use-case pattern
 * Business Logic: Handles password change business rules
 * No Mock Data: Uses real auth service for real data
 */

import { NotificationService } from '../../../shared/services/notification-service';
import { ChangePasswordRequest } from '../contracts/auth';
import { AuthService } from '../services/auth-service';

export interface ChangePasswordUseCaseResult {
  success: boolean;
  message?: string;
  error?: string;
}

export class ChangePasswordUseCase {
  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  async execute(request: ChangePasswordRequest): Promise<ChangePasswordUseCaseResult> {
    try {
      // 1. Call auth service for data access
      const response = await this.authService.changePassword(request);
      
      // 2. Business logic: Handle password change
      if (response.success) {
        this.notificationService.showSuccess(
          'Password changed successfully! You can now use your new password.'
        );
        
        return {
          success: true,
          message: response.message || 'Password changed successfully',
        };
      } else {
        // Handle failure response
        this.notificationService.showError(response.message || 'Failed to change password');
        
        return {
          success: false,
          error: response.message || 'Failed to change password',
        };
      }
    } catch (error) {
      // Handle unexpected errors
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
      this.notificationService.showError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
