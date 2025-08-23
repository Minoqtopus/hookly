/**
 * Google OAuth Contracts
 * GET /auth/google
 * GET /auth/google/callback
 */

// Google Auth Initiation (GET /auth/google)
export interface GoogleAuthResponse {
  message: string;
  redirect_url: string;
}

export interface GoogleAuthErrorResponse {
  statusCode: 500;
  message: string;
  error: 'Internal Server Error';
}

// Google Auth Callback (GET /auth/google/callback)
export interface GoogleCallbackResponse {
  message: string;
  redirect_url: string;
  user_data: {
    id: string;
    email: string;
    plan: 'trial' | 'starter' | 'pro' | 'agency';
    auth_providers: string[];
    is_verified: boolean;
  };
}

export interface GoogleCallbackErrorResponse {
  statusCode: 400;
  message: string;
  error: 'Bad Request';
}