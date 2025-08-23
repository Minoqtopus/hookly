/**
 * Password Reset Contracts
 * POST /auth/forgot-password
 * POST /auth/reset-password
 */

// Forgot Password (POST /auth/forgot-password)
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ForgotPasswordErrorResponse {
  statusCode: 400 | 429;
  message: string | string[];
  error: 'Bad Request' | 'Too Many Requests';
}

// Reset Password (POST /auth/reset-password)
export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ResetPasswordErrorResponse {
  statusCode: 400 | 401;
  message: string | string[];
  error: 'Bad Request' | 'Unauthorized';
}