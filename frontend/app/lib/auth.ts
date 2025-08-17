export interface User {
  id: string;
  email: string;
  plan: 'trial' | 'creator' | 'agency';
  auth_provider: 'email' | 'google';
  avatar_url?: string;
  is_verified: boolean;
  trial_started_at?: string;
  trial_ends_at?: string;
  trial_generations_used?: number;
  // Feature flags
  has_batch_generation?: boolean;
  has_advanced_analytics?: boolean;
  has_api_access?: boolean;
  has_team_features?: boolean;
  has_white_label?: boolean;
  has_custom_integrations?: boolean;
  monthly_generation_limit?: number | null;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export class AuthService {
  private static readonly API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  private static refreshTimer: NodeJS.Timeout | null = null;

  static getStoredTokens() {
    if (typeof window === 'undefined') return null;
    
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    return accessToken && refreshToken ? { accessToken, refreshToken } : null;
  }

  static storeTokens(accessToken: string, refreshToken: string) {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    
    // Also store in cookies for middleware access
    document.cookie = `access_token=${accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=strict`;
    document.cookie = `refresh_token=${refreshToken}; path=/; max-age=${30 * 24 * 60 * 60}; samesite=strict`;
    
    // Schedule proactive token refresh (refresh at 10 minutes, token expires at 15 minutes)
    this.scheduleTokenRefresh();
  }

  static clearTokens() {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    // Also clear cookies
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    // Clear refresh timer
    this.clearRefreshTimer();
  }

  private static scheduleTokenRefresh() {
    // Clear existing timer
    this.clearRefreshTimer();
    
    // Schedule refresh for 10 minutes (600,000 ms) - before the 15-minute expiry
    this.refreshTimer = setTimeout(async () => {
      try {
        await this.refreshToken();
      } catch (error) {
        console.error('Proactive token refresh failed:', error);
        // If proactive refresh fails, clear tokens and redirect to login
        this.clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }
    }, 10 * 60 * 1000); // 10 minutes
  }

  private static clearRefreshTimer() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  static getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  static storeUser(user: User) {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('user', JSON.stringify(user));
  }

  static initiateGoogleAuth() {
    const authUrl = `${this.API_BASE}/auth/google`;
    window.location.href = authUrl;
  }

  static async refreshToken(): Promise<AuthResponse | null> {
    const tokens = this.getStoredTokens();
    if (!tokens) return null;

    try {
      const response = await fetch(`${this.API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: tokens.refreshToken,
        }),
      });

      if (!response.ok) {
        this.clearTokens();
        return null;
      }

      const authData: AuthResponse = await response.json();
      this.storeTokens(authData.access_token, authData.refresh_token);
      this.storeUser(authData.user);
      
      return authData;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      return null;
    }
  }

  static logout() {
    this.clearTokens();
    window.location.href = '/';
  }

  static async loginWithEmail(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${this.API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Login failed');
    }

    const authData: AuthResponse = await response.json();
    this.storeTokens(authData.access_token, authData.refresh_token);
    this.storeUser(authData.user);
    
    return authData;
  }

  static async registerWithEmail(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${this.API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Registration failed');
    }

    const authData: AuthResponse = await response.json();
    this.storeTokens(authData.access_token, authData.refresh_token);
    this.storeUser(authData.user);
    
    return authData;
  }

  // Check if token is about to expire (within 2 minutes)
  static isTokenExpiringSoon(): boolean {
    const tokens = this.getStoredTokens();
    if (!tokens?.accessToken) return false;
    
    try {
      const payload = JSON.parse(atob(tokens.accessToken.split('.')[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiry = expiryTime - currentTime;
      
      // Return true if token expires within 2 minutes
      return timeUntilExpiry < 2 * 60 * 1000;
    } catch (error) {
      console.error('Failed to parse token payload:', error);
      return true; // Assume expired if we can't parse
    }
  }

  // Ensure localStorage and cookies are synchronized
  static syncStorage() {
    if (typeof window === 'undefined') return;
    
    const tokens = this.getStoredTokens();
    if (tokens) {
      // Update cookies to match localStorage
      document.cookie = `access_token=${tokens.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=strict`;
      document.cookie = `refresh_token=${tokens.refreshToken}; path=/; max-age=${30 * 24 * 60 * 60}; samesite=strict`;
    } else {
      // Clear cookies if no tokens in localStorage
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }

  // Validate that both storage methods contain the same data
  static validateStorageSync(): boolean {
    if (typeof window === 'undefined') return true;
    
    const localStorageTokens = this.getStoredTokens();
    const cookieAccessToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('access_token='))
      ?.split('=')[1];
    
    if (!localStorageTokens && !cookieAccessToken) {
      return true; // Both empty
    }
    
    if (!localStorageTokens || !cookieAccessToken) {
      return false; // One empty, one not
    }
    
    return localStorageTokens.accessToken === cookieAccessToken;
  }
}

export const isAuthenticated = () => {
  return AuthService.getStoredTokens() !== null;
};

export const getCurrentUser = () => {
  return AuthService.getStoredUser();
};