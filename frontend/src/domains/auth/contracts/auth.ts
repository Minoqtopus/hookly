/**
 * Auth Contracts - Backend API Types
 * 
 * Staff Engineer Design: Domain-specific contracts
 * Business Logic: Matches backend business rules exactly
 * No Mock Data: Real types from real backend
 */

// User Plans (must match backend exactly)
export enum UserPlan {
  TRIAL = 'trial',        // Backend: UserPlan.TRIAL = 'trial'
  STARTER = 'starter',    // Backend: UserPlan.STARTER = 'starter'
  PRO = 'pro'             // Backend: UserPlan.PRO = 'pro'
}

// Auth Providers (must match backend exactly)
export enum AuthProvider {
  EMAIL = 'email',        // Backend: AuthProvider.EMAIL = 'email'
  GOOGLE = 'google',      // Backend: AuthProvider.GOOGLE = 'google'
  MICROSOFT = 'microsoft', // Backend: AuthProvider.MICROSOFT = 'microsoft'
  APPLE = 'apple'         // Backend: AuthProvider.APPLE = 'apple'
}

// User Role (must match backend exactly)
export enum UserRole {
  USER = 'user',          // Backend: UserRole.USER = 'user'
  ADMIN = 'admin'         // Backend: UserRole.ADMIN = 'admin'
}

// User Entity (must match backend User entity exactly)
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  profile_picture?: string;
  plan: UserPlan;
  role: UserRole;
  auth_providers: AuthProvider[];
  provider_ids?: {
    google?: string;
    microsoft?: string;
    apple?: string;
  };
  monthly_generation_count: number;
  monthly_reset_date: string;
  trial_started_at?: string;
  trial_ends_at?: string;
  trial_generations_used: number;
  is_email_verified: boolean;
  email_verified_at?: string;
  password_changed_at?: string;
  created_at: string;
  updated_at: string;
}

// Auth Tokens (must match backend response)
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

// Login Request (must match backend endpoint)
export interface LoginRequest {
  email: string;
  password: string;
}

// Login Response (must match backend response)
export interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  message?: string;
}

// Register Request (must match backend endpoint)
export interface RegisterRequest {
  email: string;
  password: string;
}

// Register Response (must match backend response)
export interface RegisterResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  message?: string;
  isNewUser?: boolean;
}

// Email Verification Request (must match backend endpoint)
export interface VerifyEmailRequest {
  token: string;
}

// Email Verification Response (must match backend response)
export interface VerifyEmailResponse {
  user: User;
  remaining_generations: number;
  message: string;
}

// Send Verification Email Request (must match backend endpoint)
export interface SendVerificationEmailRequest {
  email: string;
}

// Send Verification Email Response (must match backend response)
export interface SendVerificationEmailResponse {
  message: string;
  success: boolean;
}

// Refresh Token Request (must match backend endpoint)
export interface RefreshTokenRequest {
  refresh_token: string;
}

// Refresh Token Response (must match backend response)
export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  user?: {
    id: string;
    email: string;
    plan: UserPlan;
  };
  message?: string;
}

// Logout Request (must match backend endpoint)
export interface LogoutRequest {
  refresh_token: string;
}

// Logout Response (must match backend response)
export interface LogoutResponse {
  message: string;
  success: boolean;
}

// Password Reset Request (must match backend endpoint)
export interface PasswordResetRequest {
  email: string;
}

// Password Reset Response (must match backend response)
export interface PasswordResetResponse {
  message: string;
  success: boolean;
}

// Reset Password with Token Request (must match backend endpoint)
export interface ResetPasswordWithTokenRequest {
  token: string;
  new_password: string;
}

// Reset Password with Token Response (must match backend response)
export interface ResetPasswordWithTokenResponse {
  message: string;
  success: boolean;
}

// Change Password Request (must match backend endpoint)
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

// Change Password Response (must match backend response)
export interface ChangePasswordResponse {
  message: string;
  success: boolean;
}

// Get Current User Response (must match backend endpoint)
export interface GetCurrentUserResponse {
  user: User;
  remaining_generations: number;
}
