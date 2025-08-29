/**
 * Refresh Token Use Case - Business Logic Layer
 * 
 * Staff Engineer Design: Clean use-case pattern
 * Business Logic: Handles token refresh business rules and state management
 * No Mock Data: Uses real auth service for real data
 */

import { TokenService } from '../../../shared/services/token-service';
import { RefreshTokenRequest } from '../contracts/auth';
import { AuthService } from '../services/auth-service';

export interface RefreshTokenUseCaseResult {
  success: boolean;
  tokens?: any;
  error?: string;
}

export class RefreshTokenUseCase {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService
  ) {}

  async execute(request: RefreshTokenRequest): Promise<RefreshTokenUseCaseResult> {
    try {
      // 1. Call auth service for data access
      const response = await this.authService.refreshToken(request);
      
      // 2. Business logic: Handle token refresh
      // Store new tokens
      this.tokenService.setAccessToken(response.tokens.access_token);
      this.tokenService.setRefreshToken(response.tokens.refresh_token);
      
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
