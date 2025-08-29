/**
 * Auth Repository - Real Backend API Calls
 * 
 * Staff Engineer Design: Clean repository pattern
 * Business Logic: Real API integration, no mock data
 * API Endpoints: Matches backend routes exactly
 */

import { apiClient } from '../../../shared/api/api-client';
import {
  ChangePasswordRequest,
  ChangePasswordResponse,
  GetCurrentUserResponse,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  LogoutResponse,
  PasswordResetRequest,
  PasswordResetResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordWithTokenRequest,
  ResetPasswordWithTokenResponse,
  SendVerificationEmailRequest,
  SendVerificationEmailResponse,
  VerifyEmailRequest,
  VerifyEmailResponse
} from '../contracts/auth';

export class AuthRepository {
  /**
   * User Login
   * Endpoint: POST /auth/login
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  }

  /**
   * User Registration
   * Endpoint: POST /auth/register
   */
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>('/auth/register', userData);
    return response.data;
  }

  /**
   * Verify Email with Token
   * Endpoint: POST /auth/verify-email
   */
  async verifyEmail(request: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    const response = await apiClient.post<VerifyEmailResponse>('/auth/verify-email', request);
    return response.data;
  }

  /**
   * Send Verification Email
   * Endpoint: POST /auth/send-verification (requires authentication)
   */
  async sendVerificationEmail(request: SendVerificationEmailRequest): Promise<SendVerificationEmailResponse> {
    const response = await apiClient.post<SendVerificationEmailResponse>('/auth/send-verification', request);
    return response.data;
  }

  /**
   * Refresh Access Token
   * Endpoint: POST /auth/refresh
   */
  async refreshToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', request);
    return response.data;
  }

  /**
   * User Logout
   * Endpoint: POST /auth/logout
   */
  async logout(request: LogoutRequest): Promise<LogoutResponse> {
    const response = await apiClient.post<LogoutResponse>('/auth/logout', request);
    return response.data;
  }

  /**
   * Request Password Reset
   * Endpoint: POST /auth/forgot-password
   */
  async requestPasswordReset(request: PasswordResetRequest): Promise<PasswordResetResponse> {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/forgot-password', request);
      // Backend returns 201 with message only, we need to add success flag
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      // If there's an error, return failure
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send password reset email'
      };
    }
  }

  /**
   * Reset Password with Token
   * Endpoint: POST /auth/reset-password
   */
  async resetPasswordWithToken(request: ResetPasswordWithTokenRequest): Promise<ResetPasswordWithTokenResponse> {
    const response = await apiClient.post<ResetPasswordWithTokenResponse>('/auth/reset-password', request);
    return response.data;
  }

  /**
   * Change Password (authenticated)
   * Endpoint: POST /auth/change-password
   */
  async changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    const response = await apiClient.post<ChangePasswordResponse>('/auth/change-password', request);
    return response.data;
  }

  /**
   * Initiate Google OAuth Flow
   * Endpoint: GET /auth/google (redirect)
   * 
   * Staff Engineer Note: OAuth flow works by redirecting the user to the backend,
   * not by making API calls. The backend handles the entire OAuth flow and
   * redirects back to the frontend with tokens.
   */
  async initiateGoogleOAuth(): Promise<void> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const redirectUrl = `${baseUrl}/auth/google`;
    
    // Redirect to backend OAuth endpoint
    // This will trigger the Google OAuth flow
    window.location.href = redirectUrl;
  }

  /**
   * Get Current User (authenticated)
   * Endpoint: GET /auth/profile
   */
  async getCurrentUser(): Promise<GetCurrentUserResponse> {
    const response = await apiClient.get<GetCurrentUserResponse>('/auth/profile');
    return response.data;
  }
}
