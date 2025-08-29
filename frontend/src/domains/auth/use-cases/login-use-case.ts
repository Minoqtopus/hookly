/**
 * Login Use Case - Business Logic Layer
 * 
 * Staff Engineer Design: Clean use-case pattern
 * Business Logic: ONLY business rules and authentication
 * No UI Concerns: No notifications, navigation, or UI state
 */

import { LoginRequest } from '../contracts/auth';
import { AuthService } from '../services/auth-service';

export interface LoginUseCaseResult {
  success: boolean;
  user?: any;
  remainingGenerations?: number;
  error?: string;
}

export class LoginUseCase {
  constructor(private authService: AuthService) {}

  async execute(credentials: LoginRequest): Promise<LoginUseCaseResult> {
    try {
      // 1. Business Logic: Call auth service for data access
      const response = await this.authService.login(credentials);
      
      // 2. Business Logic: Return business result
      return {
        success: true,
        user: response.user,
        remainingGenerations: response.remaining_generations,
      };
    } catch (error) {
      // Handle unexpected errors
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
