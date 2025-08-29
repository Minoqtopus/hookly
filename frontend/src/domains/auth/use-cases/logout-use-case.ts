/**
 * Logout Use Case - Business Logic Layer
 * 
 * Staff Engineer Design: Clean use-case pattern
 * Business Logic: ONLY business rules and logout
 * No UI Concerns: No notifications, navigation, or UI state
 */

import { LogoutRequest } from '../contracts/auth';
import { AuthService } from '../services/auth-service';

export interface LogoutUseCaseResult {
  success: boolean;
  message: string;
  error: string;
}

export class LogoutUseCase {
  constructor(private authService: AuthService) {}

  async execute(request: LogoutRequest): Promise<LogoutUseCaseResult> {
    try {
      // 1. Business Logic: Call auth service for data access
      const response = await this.authService.logout(request);
      
      // 2. Business Logic: Return business result
      return {
        success: response.success,
        message: response.message,
        error: '',
      };
    } catch (error) {
      // Handle unexpected errors
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      
      return {
        success: false,
        message: '',
        error: errorMessage,
      };
    }
  }
}
