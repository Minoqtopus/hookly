/**
 * Change Password Use Case - Business Logic Layer
 * 
 * Staff Engineer Design: Clean use-case pattern
 * Business Logic: ONLY business rules and password change
 * No UI Concerns: No notifications or UI state
 */

import { ChangePasswordRequest } from '../contracts/auth';
import { AuthService } from '../services/auth-service';

export interface ChangePasswordUseCaseResult {
  success: boolean;
  message?: string;
  error?: string;
}

export class ChangePasswordUseCase {
  constructor(private authService: AuthService) {}

  async execute(request: ChangePasswordRequest): Promise<ChangePasswordUseCaseResult> {
    try {
      // 1. Business Logic: Call auth service for data access
      const response = await this.authService.changePassword(request);
      
      // 2. Business Logic: Return business result
      return {
        success: response.success,
        message: response.message,
      };
    } catch (error) {
      // Handle unexpected errors
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
