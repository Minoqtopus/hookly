import type { AuthResponse } from '../base';

/**
 * User Login Contract
 * POST /auth/login
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse extends AuthResponse {}

export interface LoginErrorResponse {
  statusCode: 400 | 401 | 429;
  message: string | string[];
  error: 'Bad Request' | 'Unauthorized' | 'Too Many Requests';
}

// Specific error types for better type safety
export interface LoginValidationError extends LoginErrorResponse {
  statusCode: 400;
  message: string[];
  error: 'Bad Request';
}

export interface LoginAuthError extends LoginErrorResponse {
  statusCode: 401;
  message: string;
  error: 'Unauthorized';
}

export interface LoginRateLimitError extends LoginErrorResponse {
  statusCode: 429;
  message: string;
  error: 'Too Many Requests';
}