/**
 * Logout Contracts
 * POST /auth/logout
 * POST /auth/logout-all
 */

export interface LogoutRequest {
  refresh_token: string;
}

export interface LogoutResponse {
  message: string;
}

export interface LogoutAllResponse {
  message: string;
}

export interface LogoutErrorResponse {
  statusCode: 400 | 401;
  message: string;
  error: 'Bad Request' | 'Unauthorized';
}

// Specific error types
export interface LogoutValidationError extends LogoutErrorResponse {
  statusCode: 400;
  message: string;
  error: 'Bad Request';
}

export interface LogoutAuthError extends LogoutErrorResponse {
  statusCode: 401;
  message: string;
  error: 'Unauthorized';
}