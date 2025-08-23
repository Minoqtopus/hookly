/**
 * Base API response types and interfaces
 * These are used across all API endpoints for consistent response handling
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

export interface User {
  id: string;
  email: string;
  plan: 'trial' | 'starter' | 'pro' | 'agency';
  auth_providers: ('email' | 'google')[];
  is_verified: boolean;
  trial_ends_at?: string;
  monthly_generation_count?: number;
  has_tiktok_access?: boolean;
  has_instagram_access?: boolean;
  has_x_access?: boolean;
}

export interface AuthResponse extends TokenPair {
  user: User;
}