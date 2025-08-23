import { apiClient } from '../client';
import type {
  SendVerificationResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  ResendVerificationResponse,
} from '../../contracts/auth/verification';

/**
 * Email Verification APIs
 * POST /auth/send-verification
 * POST /auth/verify-email
 * POST /auth/resend-verification
 */

export const sendVerification = async (): Promise<SendVerificationResponse> => {
  return apiClient.post<SendVerificationResponse>('/auth/send-verification');
};

export const verifyEmail = async (data: VerifyEmailRequest): Promise<VerifyEmailResponse> => {
  return apiClient.post<VerifyEmailResponse>('/auth/verify-email', data);
};

export const resendVerification = async (): Promise<ResendVerificationResponse> => {
  return apiClient.post<ResendVerificationResponse>('/auth/resend-verification');
};

export const verificationAPI = {
  sendVerification,
  verifyEmail,
  resendVerification,
};