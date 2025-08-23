/**
 * Google OAuth APIs
 * GET /auth/google
 * GET /auth/google/callback
 * 
 * Note: These are redirect-based OAuth flows, not typical API calls
 * The frontend redirects to these endpoints rather than making AJAX requests
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const initiateGoogleAuth = (): void => {
  window.location.href = `${API_BASE_URL}/auth/google`;
};

export const getGoogleAuthUrl = (): string => {
  return `${API_BASE_URL}/auth/google`;
};

export const getGoogleCallbackUrl = (): string => {
  return `${API_BASE_URL}/auth/google/callback`;
};

export const googleAPI = {
  initiateGoogleAuth,
  getGoogleAuthUrl,
  getGoogleCallbackUrl,
};