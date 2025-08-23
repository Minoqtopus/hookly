import { apiClient } from '../client';
import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from '../../contracts/auth/password-reset';

/**
 * Password Reset APIs
 * POST /auth/forgot-password
 * POST /auth/reset-password
 */

export const forgotPassword = async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
  return apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', data);
};

export const resetPassword = async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
  return apiClient.post<ResetPasswordResponse>('/auth/reset-password', data);
};

export const passwordResetAPI = {
  forgotPassword,
  resetPassword,
};