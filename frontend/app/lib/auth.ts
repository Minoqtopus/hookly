export interface User {
  id: string;
  email: string;
  plan: 'free' | 'starter' | 'pro' | 'agency';
  auth_provider: 'email' | 'google' | 'tiktok';
  avatar_url?: string;
  is_verified: boolean;
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
  }

  static clearTokens() {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
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
}

export const isAuthenticated = () => {
  return AuthService.getStoredTokens() !== null;
};

export const getCurrentUser = () => {
  return AuthService.getStoredUser();
};