import { apiClient } from '../api/api-client';

/**
 * Enhanced Token Service - Manages authentication tokens
 * 
 * Staff Engineer Implementation:
 * - Dual storage: localStorage for client-side, cookies for server-side
 * - Secure token management with proper expiration
 * - Cookie security flags for production
 */

export class TokenService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly COOKIE_OPTIONS = {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  };

  // Set access token in both localStorage and cookies
  setAccessToken(token: string): void {
    try {
      console.log('[TOKEN_SERVICE] Setting access token:', token.substring(0, 20) + '...');
      
      // Client-side storage
      localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
      
      // Server-side accessible cookies
      this.setCookie(this.ACCESS_TOKEN_KEY, token, {
        ...this.COOKIE_OPTIONS,
        maxAge: 15 * 60, // 15 minutes (access token lifetime)
      });

      // Immediately update API client with new token
      console.log('[TOKEN_SERVICE] Updating API client with token');
      apiClient.setAuthToken(token);
      console.log('[TOKEN_SERVICE] API client updated successfully');
    } catch (error) {
      console.error('Failed to set access token:', error);
    }
  }

  // Set refresh token in both localStorage and cookies
  setRefreshToken(token: string): void {
    try {
      // Client-side storage
      localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
      
      // Server-side accessible cookies
      this.setCookie(this.REFRESH_TOKEN_KEY, token, this.COOKIE_OPTIONS);
    } catch (error) {
      console.error('Failed to set refresh token:', error);
    }
  }

  // Get access token from localStorage
  getAccessToken(): string | null {
    try {
      return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  // Get refresh token from localStorage
  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  }

  // Check if user has valid tokens
  hasValidToken(): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    return !!(accessToken || refreshToken);
  }

  // Clear all tokens from both storage mechanisms
  clearTokens(): void {
    try {
      // Clear localStorage
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      
      // Clear cookies
      this.deleteCookie(this.ACCESS_TOKEN_KEY);
      this.deleteCookie(this.REFRESH_TOKEN_KEY);

      // Clear API client authorization
      apiClient.clearAuthToken();
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  // Private helper methods for cookie management
  private setCookie(name: string, value: string, options: any = {}): void {
    const cookieValue = `${name}=${encodeURIComponent(value)}`;
    const cookieOptions = Object.entries(options)
      .map(([key, val]) => `${key}=${val}`)
      .join('; ');
    
    document.cookie = `${cookieValue}; ${cookieOptions}`;
  }

  private deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }

  // Get token expiration time (if JWT)
  getTokenExpiration(token: string): Date | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return new Date(payload.exp * 1000);
    } catch (error) {
      return null;
    }
  }

  // Check if token is expired
  isTokenExpired(token: string): boolean {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) return true;
    return new Date() > expiration;
  }

  // Check if access token needs refresh
  shouldRefreshToken(): boolean {
    const accessToken = this.getAccessToken();
    if (!accessToken) return false;
    
    const expiration = this.getTokenExpiration(accessToken);
    if (!expiration) return false;
    
    // Refresh if token expires in next 5 minutes
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    return expiration < fiveMinutesFromNow;
  }
}
