/**
 * Auth Coordinator Service - Manages authentication flow coordination
 * 
 * Staff Engineer Design: Breaks circular dependencies between TokenService and ApiClient
 * Business Logic: Coordinates token management and API authentication
 * No Circular Dependencies: Imports both services but doesn't create circular imports
 */

import { apiClient } from '../api/api-client';
import { TokenService } from './token-service';

export class AuthCoordinator {
  private tokenService: TokenService;

  constructor() {
    this.tokenService = new TokenService();
    // Sync existing tokens with API client on initialization
    this.tokenService.syncWithApiClient(apiClient);
  }

  // Set access token and sync with API client
  setAccessToken(token: string): void {
    this.tokenService.setAccessToken(token, apiClient);
  }

  // Set refresh token
  setRefreshToken(token: string): void {
    this.tokenService.setRefreshToken(token);
  }

  // Get access token
  getAccessToken(): string | null {
    return this.tokenService.getAccessToken();
  }

  // Get refresh token
  getRefreshToken(): string | null {
    return this.tokenService.getRefreshToken();
  }

  // Check if user has valid tokens
  hasValidToken(): boolean {
    return this.tokenService.hasValidToken();
  }

  // Clear all tokens and sync with API client
  clearTokens(): void {
    this.tokenService.clearTokens(apiClient);
  }

  // Handle token refresh
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      if (response.ok) {
        const tokenData = await response.json();
        this.setAccessToken(tokenData.access_token);
        this.setRefreshToken(tokenData.refresh_token);
        return true;
      } else {
        // Refresh failed, clear tokens
        this.clearTokens();
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      return false;
    }
  }

  // Get the token service instance (for advanced use cases)
  getTokenService(): TokenService {
    return this.tokenService;
  }

  // Get the API client instance (for advanced use cases)
  getApiClient() {
    return apiClient;
  }

  // Check if token is expired
  isTokenExpired(token: string): boolean {
    return this.tokenService.isTokenExpired(token);
  }

  // Check if access token needs refresh
  shouldRefreshToken(): boolean {
    return this.tokenService.shouldRefreshToken();
  }

  // Get token expiration time (if JWT)
  getTokenExpiration(token: string): Date | null {
    return this.tokenService.getTokenExpiration(token);
  }

  // Simple token format validation
  isValidTokenFormat(token: string): boolean {
    return this.tokenService.isValidTokenFormat(token);
  }
}

// Create singleton instance
export const authCoordinator = new AuthCoordinator();
