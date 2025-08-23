/**
 * Email Verification Contracts
 * POST /auth/send-verification
 * POST /auth/verify-email  
 * POST /auth/resend-verification
 */

// Send Verification Email (POST /auth/send-verification)
export interface SendVerificationResponse {
  message: string;
}

export interface SendVerificationErrorResponse {
  statusCode: 401 | 429;
  message: string;
  error: 'Unauthorized' | 'Too Many Requests';
}

// Verify Email (POST /auth/verify-email)
export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyEmailResponse {
  message: string;
}

export interface VerifyEmailErrorResponse {
  statusCode: 400 | 401;
  message: string | string[];
  error: 'Bad Request' | 'Unauthorized';
}

// Resend Verification (POST /auth/resend-verification)
export interface ResendVerificationResponse {
  message: string;
}

export interface ResendVerificationErrorResponse {
  statusCode: 401 | 429;
  message: string;
  error: 'Unauthorized' | 'Too Many Requests';
}