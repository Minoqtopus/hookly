/**
 * Auth Service - Data Access Layer
 * 
 * Staff Engineer Design: Clean service pattern
 * Business Logic: ONLY data access, no business rules
 * No Mock Data: Uses real repository for real data
 */

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
import { AuthRepository } from '../repositories/auth-repository';

export class AuthService {
  constructor(private authRepository: AuthRepository) {}

  /**
   * User Login - Data Access Only
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.authRepository.login(credentials);
  }

  /**
   * User Registration - Data Access Only
   */
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    return this.authRepository.register(userData);
  }

  /**
   * Email Verification - Data Access Only
   */
  async verifyEmail(request: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    return this.authRepository.verifyEmail(request);
  }

  /**
   * Send Verification Email - Data Access Only
   */
  async sendVerificationEmail(request: SendVerificationEmailRequest): Promise<SendVerificationEmailResponse> {
    return this.authRepository.sendVerificationEmail(request);
  }

  /**
   * Initiate Google OAuth Flow - Data Access Only
   * 
   * Staff Engineer Note: This method redirects the user to the backend OAuth endpoint.
   * The backend handles the entire OAuth flow and redirects back with tokens.
   */
  async initiateGoogleOAuth(): Promise<void> {
    return this.authRepository.initiateGoogleOAuth();
  }

  /**
   * User Logout - Data Access Only
   */
  async logout(request: LogoutRequest): Promise<LogoutResponse> {
    return this.authRepository.logout(request);
  }

  /**
   * Refresh Token - Data Access Only
   */
  async refreshToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    return this.authRepository.refreshToken(request);
  }

  /**
   * Request Password Reset - Data Access Only
   */
  async requestPasswordReset(request: PasswordResetRequest): Promise<PasswordResetResponse> {
    return this.authRepository.requestPasswordReset(request);
  }

  /**
   * Reset Password with Token - Data Access Only
   */
  async resetPasswordWithToken(request: ResetPasswordWithTokenRequest): Promise<ResetPasswordWithTokenResponse> {
    return this.authRepository.resetPasswordWithToken(request);
  }

  /**
   * Change Password - Data Access Only
   */
  async changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    return this.authRepository.changePassword(request);
  }

  /**
   * Get Current User - Data Access Only
   */
  async getCurrentUser(): Promise<GetCurrentUserResponse> {
    return this.authRepository.getCurrentUser();
  }
}
