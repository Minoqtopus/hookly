import { createApiClient } from './client';
import type { User, UserStats } from '../context/AppContext';

/**
 * Authenticated API Client
 * This client integrates with the app context for proper state management
 */

// Global reference to the logout action from context
let globalLogoutAction: (() => Promise<void>) | null = null;

// Configure the authenticated API client
export const authenticatedApiClient = createApiClient({
  onUnauthorized: async () => {
    console.log('🔐 Unauthorized response received, triggering logout...');
    
    // Clear tokens immediately
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    
    // Trigger context logout if available
    if (globalLogoutAction) {
      try {
        await globalLogoutAction();
      } catch (error) {
        console.error('Error during logout:', error);
        // Fallback: redirect to home
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }
    } else {
      // Fallback: redirect to home if no logout action available
      console.warn('No logout action available, redirecting to home');
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  },
  onNetworkError: (error) => {
    console.warn('🌐 Network error occurred:', error.message);
    // Could show toast notification here
  }
});

// Function to register the logout action from context
export function setLogoutAction(logoutAction: () => Promise<void>) {
  globalLogoutAction = logoutAction;
}

// Helper function to validate current session
export async function validateSession(): Promise<{ user: User; userStats: UserStats } | null> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    
    if (!token) {
      return null;
    }

    // For now, return null since we need to know the actual backend endpoint
    // TODO: Replace with actual backend validation endpoint
    console.warn('Session validation not implemented - need actual backend endpoint');
    return null;
  } catch (error) {
    console.error('Session validation failed:', error);
    
    // Clear invalid tokens
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    
    return null;
  }
}