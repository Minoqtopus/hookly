/**
 * Token Service - Auth Token Management
 * 
 * Staff Engineer Design: Clean service for token operations
 * Business Logic: Manages access and refresh tokens
 */

export class TokenService {
  private static readonly ACCESS_TOKEN_KEY = 'access_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';

  setAccessToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TokenService.ACCESS_TOKEN_KEY, token);
    }
  }

  getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TokenService.ACCESS_TOKEN_KEY);
    }
    return null;
  }

  setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TokenService.REFRESH_TOKEN_KEY, token);
    }
  }

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TokenService.REFRESH_TOKEN_KEY);
    }
    return null;
  }

  clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TokenService.ACCESS_TOKEN_KEY);
      localStorage.removeItem(TokenService.REFRESH_TOKEN_KEY);
    }
  }

  hasValidToken(): boolean {
    const token = this.getAccessToken();
    return token !== null && token.length > 0;
  }
}
