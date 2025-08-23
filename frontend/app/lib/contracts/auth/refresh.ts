import type { TokenPair } from '../base';

/**
 * Token Refresh Contract
 * POST /auth/refresh
 */

export interface RefreshRequest {
  refresh_token: string;
}

export interface RefreshResponse extends TokenPair {
  user: {
    id: string;
    email: string;
    plan: 'trial' | 'starter' | 'pro' | 'agency';
  };
}

export interface RefreshErrorResponse {
  statusCode: 400 | 401 | 403 | 429;
  message: string;
  error: 'Bad Request' | 'Unauthorized' | 'Forbidden' | 'Too Many Requests';
}

// Specific error types
export interface RefreshValidationError extends RefreshErrorResponse {
  statusCode: 400;
  message: string;
  error: 'Bad Request';
}

export interface RefreshAuthError extends RefreshErrorResponse {
  statusCode: 401;
  message: string;
  error: 'Unauthorized';
}

export interface RefreshForbiddenError extends RefreshErrorResponse {
  statusCode: 403;
  message: string;
  error: 'Forbidden';
}

export interface RefreshRateLimitError extends RefreshErrorResponse {
  statusCode: 429;
  message: string;
  error: 'Too Many Requests';
}