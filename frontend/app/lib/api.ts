import { AuthService } from './auth';

export interface ApiErrorInfo {
  message: string;
  status: number;
  code?: string;
}

export interface GenerateRequest {
  productName: string;
  niche: string;
  targetAudience: string;
  additionalContext?: string;
}

export interface GenerateResponse {
  hook: string;
  script: string;
  visuals: string[];
  performance: {
    estimatedViews: number;
    estimatedCTR: number;
    viralScore: number;
  };
  id: string;
  created_at: string;
}

export interface GuestGenerateRequest {
  productName: string;
  niche: string;
  targetAudience: string;
}

export interface UserStats {
  generationsToday: number;
  totalGenerations: number;
  totalViews: number;
  avgCTR: number;
  streak: number;
}

export interface Generation {
  id: string;
  title: string;
  hook: string;
  script: string;
  visuals: string[];
  niche: string;
  target_audience: string;
  performance_data?: {
    views?: number;
    clicks?: number;
    conversions?: number;
    ctr?: number;
  };
  is_favorite: boolean;
  created_at: string;
}

export class ApiClient {
  private static readonly BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const tokens = AuthService.getStoredTokens();
    
    // Check if token is expiring soon and refresh proactively
    if (tokens && AuthService.isTokenExpiringSoon()) {
      try {
        const refreshResult = await AuthService.refreshToken();
        if (refreshResult) {
          // Update tokens for this request
          tokens.accessToken = refreshResult.access_token;
        }
      } catch (error) {
        console.error('Proactive token refresh failed:', error);
        // Continue with current token, will handle 401 if it fails
      }
    }
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(tokens?.accessToken && { Authorization: `Bearer ${tokens.accessToken}` }),
        ...options.headers,
      },
    };

    let response: Response;
    
    try {
      response = await fetch(`${this.BASE_URL}${endpoint}`, config);
    } catch (error) {
      throw new ApiError({
        message: 'Network error - please check your connection',
        status: 0,
        code: 'NETWORK_ERROR'
      });
    }

    // Handle token refresh for 401 errors
    if (response.status === 401 && tokens?.refreshToken) {
      try {
        const refreshResult = await AuthService.refreshToken();
        
        if (refreshResult) {
          // Retry the request with new token
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${refreshResult.access_token}`
          };
          
          try {
            response = await fetch(`${this.BASE_URL}${endpoint}`, config);
          } catch (error) {
            throw new ApiError({
              message: 'Network error - please check your connection',
              status: 0,
              code: 'NETWORK_ERROR'
            });
          }
        } else {
          // Refresh failed, redirect to login
          AuthService.logout();
          throw new ApiError({
            message: 'Session expired - please log in again',
            status: 401,
            code: 'SESSION_EXPIRED'
          });
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        AuthService.logout();
        throw new ApiError({
          message: 'Session expired - please log in again',
          status: 401,
          code: 'SESSION_EXPIRED'
        });
      }
    }

    // Handle non-2xx responses
    if (!response.ok) {
      let errorMessage = 'An error occurred';
      let errorCode = 'UNKNOWN_ERROR';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        errorCode = errorData.code || errorCode;
      } catch {
        // Response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }

      throw new ApiError({
        message: errorMessage,
        status: response.status,
        code: errorCode
      });
    }

    try {
      return await response.json();
    } catch {
      // Handle empty responses
      return {} as T;
    }
  }

  // Authentication endpoints
  static async getCurrentUser() {
    return this.makeRequest<{ user: import('./auth').User }>('/auth/me');
  }

  // Generation endpoints
  static async generateAd(data: GenerateRequest): Promise<GenerateResponse> {
    return this.makeRequest<GenerateResponse>('/generation/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async generateGuestAd(data: GuestGenerateRequest): Promise<GenerateResponse> {
    return this.makeRequest<GenerateResponse>('/generation/generate-guest', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // User data endpoints
  static async getUserStats(): Promise<UserStats> {
    return this.makeRequest<UserStats>('/user/stats');
  }

  static async getUserGenerations(limit = 10, offset = 0): Promise<{ generations: Generation[]; total: number }> {
    return this.makeRequest<{ generations: Generation[]; total: number }>(
      `/user/generations?limit=${limit}&offset=${offset}`
    );
  }

  static async toggleFavorite(generationId: string): Promise<{ is_favorite: boolean }> {
    return this.makeRequest<{ is_favorite: boolean }>(`/generation/${generationId}/favorite`, {
      method: 'POST',
    });
  }

  static async deleteGeneration(generationId: string): Promise<void> {
    return this.makeRequest<void>(`/generation/${generationId}`, {
      method: 'DELETE',
    });
  }

  // User plan endpoints
  static async upgradeToPro(checkoutData: any): Promise<{ checkout_url: string }> {
    return this.makeRequest<{ checkout_url: string }>('/user/upgrade', {
      method: 'POST',
      body: JSON.stringify(checkoutData),
    });
  }

  static async cancelSubscription(): Promise<void> {
    return this.makeRequest<void>('/user/cancel-subscription', {
      method: 'POST',
    });
  }
}

// Custom error class for API errors
class ApiError extends Error {
  constructor(public details: ApiErrorInfo) {
    super(details.message);
    this.name = 'ApiError';
  }
}

// Export the error class for type checking
export { ApiError as ApiErrorClass };
