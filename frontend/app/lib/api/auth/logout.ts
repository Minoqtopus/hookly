import { apiClient } from '../client';
import { authenticatedApiClient } from '../authenticated-client';
import type {
  LogoutRequest,
  LogoutResponse,
  LogoutAllResponse,
} from '../../contracts/auth/logout';

/**
 * Logout APIs
 * POST /auth/logout - Uses refresh token in body (no auth header needed)
 * POST /auth/logout-all - Requires authorization header (access token)
 */

export const logout = async (data: LogoutRequest): Promise<LogoutResponse> => {
  return apiClient.post<LogoutResponse>('/auth/logout', data);
};

export const logoutAll = async (): Promise<LogoutAllResponse> => {
  return authenticatedApiClient.post<LogoutAllResponse>('/auth/logout-all');
};

export const logoutAPI = {
  logout,
  logoutAll,
};