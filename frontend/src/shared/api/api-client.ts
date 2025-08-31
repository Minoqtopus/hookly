/**
 * API Client - Real Backend Integration
 * 
 * Staff Engineer Design: Clean, scalable API client with centralized auth
 * Business Logic: Connects to real backend endpoints
 * Authentication: Uses token parameter for consistent token management
 * No Mock Data: All calls go to actual API
 */

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private currentToken: string | null = null;

  constructor() {
    // Use environment variable or default to local backend
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Set the current auth token
  setAuthToken(token: string): void {
    this.currentToken = token;
  }

  // Clear the current auth token
  clearAuthToken(): void {
    this.currentToken = null;
  }

  // Get the current auth token
  getAuthToken(): string | null {
    return this.currentToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryAttempt = 0
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        // Automatically include Authorization header if token exists
        ...(this.currentToken && { 'Authorization': `Bearer ${this.currentToken}` }),
        // Prevent HTTP caching for API calls to ensure fresh data
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...(options.headers || {}),
      },
    };

    try {
      const response = await fetch(url, config);
      
      // Handle 401 with automatic token refresh (only retry once)
      if (response.status === 401 && retryAttempt === 0) {
        // Note: Token refresh logic should be handled by the calling service
        // to avoid circular dependencies. The service can call setAuthToken
        // with the new token after a successful refresh.
        this.currentToken = null; // Clear invalid token
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP error! status: ${response.status}`,
          response.status,
          errorData.errors
        );
      }

      const data = await response.json();
      // Backend returns data directly, not wrapped in ApiResponse format
      return { data, success: true };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network or other errors
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0
      );
    }
  }

  // GET request
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
      ...(headers && { headers }),
    });
  }

  // POST request
  async post<T>(
    endpoint: string, 
    data?: any, 
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(headers || {}),
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(
    endpoint: string, 
    data?: any, 
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      ...(headers && { headers }),
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      ...(headers && { headers }),
    });
  }
}

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Create singleton instance
export const apiClient = new ApiClient();
