import type { AuthResponse } from '../base';

/**
 * User Registration Contract
 * POST /auth/register
 */

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse extends AuthResponse {}

export interface RegisterErrorResponse {
  statusCode: 400 | 403 | 409 | 429;
  message: string | string[];
  error: 'Bad Request' | 'Forbidden' | 'Conflict' | 'Too Many Requests';
}

// Specific error types for better type safety
export interface ValidationError extends RegisterErrorResponse {
  statusCode: 400;
  message: string[];
  error: 'Bad Request';
}

export interface TrialAbuseError extends RegisterErrorResponse {
  statusCode: 403;
  message: string;
  error: 'Forbidden';
}

export interface EmailConflictError extends RegisterErrorResponse {
  statusCode: 409;
  message: string;
  error: 'Conflict';
}

export interface RateLimitError extends RegisterErrorResponse {
  statusCode: 429;
  message: string;
  error: 'Too Many Requests';
}