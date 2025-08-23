import { apiClient } from '../client';
import type {
  LogoutRequest,
  LogoutResponse,
  LogoutAllResponse,
} from '../../contracts/auth/logout';

/**
 * Logout APIs
 * POST /auth/logout
 * POST /auth/logout-all
 */

export const logout = async (data: LogoutRequest): Promise<LogoutResponse> => {
  return apiClient.post<LogoutResponse>('/auth/logout', data);
};

export const logoutAll = async (): Promise<LogoutAllResponse> => {
  return apiClient.post<LogoutAllResponse>('/auth/logout-all');
};

export const logoutAPI = {
  logout,
  logoutAll,
};