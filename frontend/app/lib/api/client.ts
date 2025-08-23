import type { ApiError } from '../contracts';
import type { RefreshRequest, RefreshResponse } from '../contracts/auth/refresh';

/**
 * Enhanced API Client with robust error handling
 * Handles authentication, retries, timeouts, network errors, and comprehensive error scenarios
 */

export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryMultiplier: number;
  retryableStatuses: number[];
}

export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  retryConfig?: Partial<RetryConfig>;
  tokenProvider?: () => string | null;
  onUnauthorized?: () => void;
  onForbidden?: () => void;
  onNetworkError?: (error: NetworkError) => void;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  retryMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504]
};

export class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retryConfig: RetryConfig;
  private getAuthToken: () => string | null;
  private onUnauthorized?: () => void;
  private onForbidden?: () => void;
  private onNetworkError?: (error: NetworkError) => void;
  private refreshInProgress: boolean = false;
  private refreshPromise: Promise<string | null> | null = null;
  
  constructor(config: ApiClientConfig = {}) {
    this.baseURL = config.baseURL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    this.timeout = config.timeout || 30000; // 30 seconds default
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config.retryConfig };
    this.onUnauthorized = config.onUnauthorized;
    this.onForbidden = config.onForbidden;
    this.onNetworkError = config.onNetworkError;
    
    this.getAuthToken = config.tokenProvider || (() => {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('access_token');
      }
      return null;
    });
  }

  private getDefaultHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    try {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error);
      // Continue without token rather than failing
    }

    return headers;
  }

  private async refreshAccessToken(): Promise<string | null> {
    // Prevent multiple concurrent refresh attempts
    if (this.refreshInProgress && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshInProgress = true;
    
    this.refreshPromise = (async () => {
      try {
        if (typeof window === 'undefined') {
          return null;
        }

        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          return null;
        }

        // Make refresh request without going through the main request method to avoid recursion
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        let response: Response;
        
        try {
          response = await fetch(`${this.baseURL}/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({ refresh_token: refreshToken } as RefreshRequest),
            signal: controller.signal
          });
          clearTimeout(timeoutId);
        } catch (fetchError) {
          clearTimeout(timeoutId);
          throw fetchError;
        }

        if (!response.ok) {
          // Refresh failed, clear tokens
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
          }
          return null;
        }

        const data: RefreshResponse = await response.json();
        
        // Store new tokens
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', data.access_token);
          if (data.refresh_token) {
            localStorage.setItem('refresh_token', data.refresh_token);
          }
        }

        return data.access_token;
      } catch (error) {
        console.error('Token refresh failed:', error);
        // Clear tokens on refresh failure
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
        return null;
      } finally {
        this.refreshInProgress = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private async handleResponse<T>(response: Response, url: string): Promise<T> {
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    
    if (!response.ok) {
      let errorData: ApiError;
      
      try {
        if (isJson) {
          errorData = await response.json();
        } else {
          // Handle non-JSON error responses (e.g., HTML error pages)
          await response.text(); // Consume the response body
          errorData = {
            statusCode: response.status,
            message: response.statusText || 'Unknown error occurred',
            error: this.getErrorTypeFromStatus(response.status)
          };
        }
      } catch (parseError) {
        // Failed to parse error response
        errorData = {
          statusCode: response.status,
          message: `Failed to parse error response: ${response.statusText}`,
          error: this.getErrorTypeFromStatus(response.status)
        };
      }
      
      const apiError = new ApiClientError(
        errorData.message, 
        errorData.statusCode, 
        errorData,
        url,
        response.headers
      );

      // Handle specific status codes with callbacks
      if (response.status === 401 && this.onUnauthorized) {
        try {
          this.onUnauthorized();
        } catch (callbackError) {
          console.error('Error in unauthorized callback:', callbackError);
        }
      }
      
      if (response.status === 403 && this.onForbidden) {
        try {
          this.onForbidden();
        } catch (callbackError) {
          console.error('Error in forbidden callback:', callbackError);
        }
      }
      
      throw apiError;
    }

    try {
      if (isJson) {
        return await response.json();
      }
      
      // Handle non-JSON success responses
      const textResponse = await response.text();
      return textResponse as unknown as T;
    } catch (parseError) {
      throw new ApiClientError(
        'Failed to parse successful response',
        200,
        { statusCode: 200, message: 'Parse error', error: 'Parse Error' },
        url,
        response.headers
      );
    }
  }

  private getErrorTypeFromStatus(status: number): string {
    switch (status) {
      case 400: return 'Bad Request';
      case 401: return 'Unauthorized';
      case 403: return 'Forbidden';
      case 404: return 'Not Found';
      case 409: return 'Conflict';
      case 422: return 'Unprocessable Entity';
      case 429: return 'Too Many Requests';
      case 500: return 'Internal Server Error';
      case 502: return 'Bad Gateway';
      case 503: return 'Service Unavailable';
      case 504: return 'Gateway Timeout';
      default: return 'Unknown Error';
    }
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private shouldRetry(error: ApiClientError, attempt: number): boolean {
    if (attempt >= this.retryConfig.maxRetries) {
      return false;
    }
    
    // Don't retry client errors (4xx) except for specific cases
    if (error.statusCode >= 400 && error.statusCode < 500) {
      return this.retryConfig.retryableStatuses.includes(error.statusCode);
    }
    
    // Retry server errors (5xx) and network errors
    return error.statusCode >= 500 || error.isNetworkError;
  }

  async request<T>(
    endpoint: string, 
    options: RequestInit = {},
    isRetryAfterRefresh = false
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    let lastError: ApiClientError | NetworkError;
    
    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        const config: RequestInit = {
          ...options,
          signal: controller.signal,
          headers: {
            ...this.getDefaultHeaders(),
            ...options.headers,
          },
        };

        let response: Response;
        
        try {
          response = await fetch(url, config);
          clearTimeout(timeoutId);
        } catch (fetchError) {
          clearTimeout(timeoutId);
          
          if (controller.signal.aborted) {
            lastError = new TimeoutError(`Request timeout after ${this.timeout}ms`, url);
          } else {
            lastError = new NetworkError(
              `Network request failed: ${fetchError instanceof Error ? fetchError.message : 'Unknown network error'}`,
              url,
              fetchError
            );
          }
          
          if (this.onNetworkError && lastError instanceof NetworkError) {
            try {
              this.onNetworkError(lastError);
            } catch (callbackError) {
              console.error('Error in network error callback:', callbackError);
            }
          }
          
          if (attempt < this.retryConfig.maxRetries) {
            const delay = this.retryConfig.retryDelay * Math.pow(this.retryConfig.retryMultiplier, attempt);
            console.warn(`Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${this.retryConfig.maxRetries}):`, lastError.message);
            await this.sleep(delay);
            continue;
          }
          
          throw lastError;
        }

        return await this.handleResponse<T>(response, url);
        
      } catch (error) {
        // Handle 401 with automatic token refresh (only on first attempt and if not already a retry)
        if (error instanceof ApiClientError && 
            error.statusCode === 401 && 
            !isRetryAfterRefresh && 
            attempt === 0 &&
            !endpoint.includes('/auth/refresh')) { // Avoid infinite refresh loops
          
          console.log('Received 401, attempting token refresh...');
          
          try {
            const newToken = await this.refreshAccessToken();
            
            if (newToken) {
              console.log('Token refresh successful, retrying original request...');
              // Retry the original request with new token (pass true to prevent infinite recursion)
              return this.request<T>(endpoint, options, true);
            } else {
              console.log('Token refresh failed, triggering logout...');
              // Refresh failed, trigger logout
              if (this.onUnauthorized) {
                try {
                  this.onUnauthorized();
                } catch (callbackError) {
                  console.error('Error in unauthorized callback:', callbackError);
                }
              }
              throw error; // Re-throw the original 401 error
            }
          } catch (refreshError) {
            console.error('Token refresh attempt failed:', refreshError);
            // If refresh fails, trigger logout and continue with original error handling
            if (this.onUnauthorized) {
              try {
                this.onUnauthorized();
              } catch (callbackError) {
                console.error('Error in unauthorized callback:', callbackError);
              }
            }
            // Continue with original error handling below
          }
        }
        if (error instanceof ApiClientError || error instanceof NetworkError) {
          lastError = error;
          
          if (this.shouldRetry(error instanceof ApiClientError ? error : new ApiClientError('Network Error', 0, { statusCode: 0, message: error.message, error: 'Network Error' }, url), attempt)) {
            const delay = this.retryConfig.retryDelay * Math.pow(this.retryConfig.retryMultiplier, attempt);
            console.warn(`Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${this.retryConfig.maxRetries}):`, error.message);
            await this.sleep(delay);
            continue;
          }
        } else {
          // Unexpected error type
          lastError = new NetworkError(
            `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            url,
            error
          );
        }
        
        throw lastError;
      }
    }
    
    throw lastError!;
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // Utility methods for error handling
  isNetworkAvailable(): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
        resolve(navigator.onLine);
      } else {
        // Fallback: try a lightweight request
        fetch(`${this.baseURL}/health`, { 
          method: 'HEAD', 
          cache: 'no-cache',
          signal: AbortSignal.timeout(5000)
        })
          .then(() => resolve(true))
          .catch(() => resolve(false));
      }
    });
  }
}

export class ApiClientError extends Error {
  public statusCode: number;
  public apiError: ApiError;
  public url: string;
  public headers?: Headers;
  public isNetworkError: boolean = false;

  constructor(
    message: string | string[], 
    statusCode: number, 
    apiError: ApiError, 
    url: string,
    headers?: Headers
  ) {
    const errorMessage = Array.isArray(message) ? message.join(', ') : message;
    super(errorMessage);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.apiError = apiError;
    this.url = url;
    this.headers = headers;
  }

  get isValidationError(): boolean {
    return this.statusCode === 400;
  }

  get isAuthError(): boolean {
    return this.statusCode === 401;
  }

  get isForbiddenError(): boolean {
    return this.statusCode === 403;
  }

  get isNotFoundError(): boolean {
    return this.statusCode === 404;
  }

  get isConflictError(): boolean {
    return this.statusCode === 409;
  }

  get isRateLimitError(): boolean {
    return this.statusCode === 429;
  }

  get isServerError(): boolean {
    return this.statusCode >= 500;
  }

  get isRetryableError(): boolean {
    return this.statusCode === 408 || this.statusCode === 429 || this.isServerError;
  }

  toUserMessage(): string {
    if (this.isValidationError) {
      return 'Please check your input and try again.';
    }
    if (this.isAuthError) {
      return 'Please log in again to continue.';
    }
    if (this.isForbiddenError) {
      return 'You don\'t have permission to perform this action.';
    }
    if (this.isNotFoundError) {
      return 'The requested resource was not found.';
    }
    if (this.isRateLimitError) {
      return 'Too many requests. Please wait a moment and try again.';
    }
    if (this.isServerError) {
      return 'Server error. Please try again later.';
    }
    return 'Something went wrong. Please try again.';
  }
}

export class NetworkError extends Error {
  public url: string;
  public originalError?: any;
  public isNetworkError: boolean = true;

  constructor(message: string, url: string, originalError?: any) {
    super(message);
    this.name = 'NetworkError';
    this.url = url;
    this.originalError = originalError;
  }

  toUserMessage(): string {
    return 'Network connection failed. Please check your internet connection and try again.';
  }
}

export class TimeoutError extends NetworkError {
  constructor(message: string, url: string) {
    super(message, url);
    this.name = 'TimeoutError';
  }

  toUserMessage(): string {
    return 'Request timed out. Please try again.';
  }
}

// Export configured singleton instance
export const apiClient = new ApiClient({
  timeout: 30000,
  retryConfig: {
    maxRetries: 3,
    retryDelay: 1000,
    retryMultiplier: 2,
    retryableStatuses: [408, 429, 500, 502, 503, 504]
  },
  onUnauthorized: () => {
    // Clear auth tokens when unauthorized
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      // Could dispatch logout action here
    }
  },
  onNetworkError: (error) => {
    console.warn('Network error occurred:', error.message);
    // Could show offline indicator here
  }
});