/**
 * Auth Hook - React Integration
 * 
 * Staff Engineer Design: Clean hook pattern
 * Business Logic: Uses real auth service
 * No Mock Data: Real backend integration
 */

import { useCallback, useEffect, useState } from 'react';
import type { LoginRequest, RegisterRequest, VerifyEmailRequest } from '../index';
import { AuthRepository, AuthService } from '../index';

// Create singleton instances
const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);

// Local state interface
interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  remainingGenerations: number;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    remainingGenerations: 0,
    isLoading: false,
    error: null,
  });

  // Login
  const login = useCallback(async (credentials: LoginRequest) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await authService.login(credentials);
      
      // Update local state
      setAuthState({
        user: response.user,
        isAuthenticated: true,
        remainingGenerations: response.remaining_generations,
        isLoading: false,
        error: null,
      });
      
      return { success: true, user: response.user, remainingGenerations: response.remaining_generations };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Register
  const register = useCallback(async (userData: RegisterRequest) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await authService.register(userData);
      
      // Update local state
      setAuthState({
        user: response.user,
        isAuthenticated: true,
        remainingGenerations: response.remaining_generations,
        isLoading: false,
        error: null,
      });
      
      return { success: true, user: response.user, remainingGenerations: response.remaining_generations };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Verify Email
  const verifyEmail = useCallback(async (request: VerifyEmailRequest) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await authService.verifyEmail(request);
      
      // Update local state
      setAuthState(prev => ({
        ...prev,
        user: response.user,
        remainingGenerations: response.remaining_generations,
        isLoading: false,
      }));
      
      return { success: true, user: response.user, remainingGenerations: response.remaining_generations };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Email verification failed';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Send Verification Email
  const sendVerificationEmail = useCallback(async (email: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await authService.sendVerificationEmail({ email });
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: response.success };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send verification email';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Clear local state
      setAuthState({
        user: null,
        isAuthenticated: false,
        remainingGenerations: 0,
        isLoading: false,
        error: null,
      });
      
      return { success: true };
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Logout failed' };
    }
  }, []);

  // Get Current User
  const getCurrentUser = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await authService.getCurrentUser();
      
      // Update local state
      setAuthState({
        user: response.user,
        isAuthenticated: true,
        remainingGenerations: response.remaining_generations,
        isLoading: false,
        error: null,
      });
      
      return { success: true, user: response.user, remainingGenerations: response.remaining_generations };
    } catch (error) {
      // If getCurrentUser fails, user is not authenticated
      setAuthState({
        user: null,
        isAuthenticated: false,
        remainingGenerations: 0,
        isLoading: false,
        error: null,
      });
      
      return { success: false, error: 'Not authenticated' };
    }
  }, []);

  // Check auth status on mount
  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  return {
    // State
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    remainingGenerations: authState.remainingGenerations,
    isLoading: authState.isLoading,
    error: authState.error,
    
    // Actions
    login,
    register,
    verifyEmail,
    sendVerificationEmail,
    logout,
    getCurrentUser,
  };
}
