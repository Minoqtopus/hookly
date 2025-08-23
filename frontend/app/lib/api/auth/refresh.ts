import { apiClient } from '../client';
import type {
  RefreshRequest,
  RefreshResponse,
} from '../../contracts/auth/refresh';

/**
 * Token Refresh API
 * POST /auth/refresh
 */

export const refresh = async (data: RefreshRequest): Promise<RefreshResponse> => {
  return apiClient.post<RefreshResponse>('/auth/refresh', data);
};

export const refreshAPI = {
  refresh,
};