import { apiClient } from '../client';
import type {
  RegisterRequest,
  RegisterResponse,
} from '../../contracts/auth/register';

/**
 * User Registration API
 * POST /auth/register
 */

export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  return apiClient.post<RegisterResponse>('/auth/register', data);
};

export const registerAPI = {
  register,
};