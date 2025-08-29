/**
 * Refresh Token Use Case - Business Logic Layer
 * 
 * Staff Engineer Design: Clean use-case pattern
 * Business Logic: ONLY business rules and token refresh
 * No UI Concerns: No notifications or UI state
 */

import { RefreshTokenRequest } from '../contracts/auth';
import { AuthService } from '../services/auth-service';

export interface RefreshTokenUseCaseResult {
  success: boolean;
  tokens?: any;
  error?: string;
}

export class RefreshTokenUseCase {
  constructor(private authService: AuthService) {}

  async execute(request: RefreshTokenRequest): Promise<RefreshTokenUseCaseResult> {
    try {
      // 1. Business Logic: Call auth service for data access
      const response = await this.authService.refreshToken(request);
      
      // 2. Business Logic: Return business result
      return {
        success: true,
        tokens: response.tokens,
      };
    } catch (error) {
      // Handle unexpected errors
      const errorMessage = error instanceof Error ? error.message : 'Token refresh failed';
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
