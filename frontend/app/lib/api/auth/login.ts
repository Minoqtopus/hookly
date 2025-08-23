import { apiClient } from '../client';
import type {
  LoginRequest,
  LoginResponse,
} from '../../contracts/auth/login';

/**
 * User Login API
 * POST /auth/login
 */

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  return apiClient.post<LoginResponse>('/auth/login', data);
};

export const loginAPI = {
  login,
};