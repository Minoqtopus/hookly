/**
 * API Client - Real Backend Integration
 * 
 * Staff Engineer Design: Clean, scalable API client
 * Business Logic: Connects to real backend endpoints
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

  constructor() {
    // Use environment variable or default to local backend
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get stored access token for authentication
    const accessToken = this.getStoredAccessToken();
    
    const config: RequestInit = {
      headers: {
        ...this.defaultHeaders,
        // Automatically include Authorization header if token exists
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        ...options.headers,
      },
      ...options,
    };

    console.log('[API_CLIENT] Making request to:', endpoint);
    console.log('[API_CLIENT] Request headers:', config.headers);
    console.log('[API_CLIENT] Stored token exists:', !!accessToken);

    try {
      const response = await fetch(url, config);
      
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
      headers,
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
        ...headers,
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
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      headers,
    });
  }

  // Set auth token for authenticated requests
  setAuthToken(token: string): void {
    console.log('[API_CLIENT] Setting auth token:', token.substring(0, 20) + '...');
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    console.log('[API_CLIENT] Authorization header set:', this.defaultHeaders['Authorization']);
  }

  // Clear auth token
  clearAuthToken(): void {
    console.log('[API_CLIENT] Clearing auth token');
    delete this.defaultHeaders['Authorization'];
  }

  // Get stored access token from localStorage
  private getStoredAccessToken(): string | null {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('access_token');
      }
      return null;
    } catch (error) {
      console.error('Failed to get stored access token:', error);
      return null;
    }
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
