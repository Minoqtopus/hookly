/**
 * Auth Hook - React Integration
 * 
 * Staff Engineer Design: Clean hook pattern with all use-cases integrated
 * Business Logic: Uses real auth use-cases for business logic
 * No Mock Data: Real backend integration through use-cases
 */

import { useCallback, useEffect, useState } from 'react';
import {
    NavigationService,
    NotificationService,
    TokenService
} from '../../../shared/services';
import type {
    LoginRequest,
    RegisterRequest
} from '../index';
import {
    AuthRepository,
    AuthService,
    ChangePasswordUseCase,
    ForgotPasswordUseCase,
    GoogleOAuthUseCase,
    LoginUseCase,
    LogoutUseCase,
    RefreshTokenUseCase,
    RegisterUseCase,
    ResetPasswordUseCase,
    SendVerificationEmailUseCase,
    VerifyEmailUseCase
} from '../index';

// Create singleton instances
const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);

// Create shared services
const tokenService = new TokenService();
const navigationService = new NavigationService();
const notificationService = new NotificationService();

// Create use cases with dependencies
const loginUseCase = new LoginUseCase(authService, navigationService, notificationService, tokenService);
const registerUseCase = new RegisterUseCase(authService, navigationService, notificationService, tokenService);
const forgotPasswordUseCase = new ForgotPasswordUseCase(authService, notificationService);
const resetPasswordUseCase = new ResetPasswordUseCase(authService, navigationService, notificationService);
const googleOAuthUseCase = new GoogleOAuthUseCase(authService, navigationService, notificationService, tokenService);
const verifyEmailUseCase = new VerifyEmailUseCase(authService, navigationService, notificationService);
const sendVerificationEmailUseCase = new SendVerificationEmailUseCase(authService, notificationService);
const logoutUseCase = new LogoutUseCase(authService, navigationService, notificationService, tokenService);
const changePasswordUseCase = new ChangePasswordUseCase(authService, notificationService);
const refreshTokenUseCase = new RefreshTokenUseCase(authService, tokenService);

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

  // Login - Uses LoginUseCase
  const login = useCallback(async (credentials: LoginRequest) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await loginUseCase.execute(credentials);
      
      if (result.success) {
        // Update local state
        setAuthState({
          user: result.user,
          isAuthenticated: true,
          remainingGenerations: result.remainingGenerations || 0,
          isLoading: false,
          error: null,
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false, error: result.error || 'Login failed' }));
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Register - Uses RegisterUseCase
  const register = useCallback(async (userData: RegisterRequest) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await registerUseCase.execute(userData);
      
      if (result.success) {
        // Update local state
        setAuthState({
          user: result.user,
          isAuthenticated: true,
          remainingGenerations: result.remainingGenerations || 0,
          isLoading: false,
          error: null,
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false, error: result.error || 'Registration failed' }));
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Forgot Password - Uses ForgotPasswordUseCase
  const forgotPassword = useCallback(async (email: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await forgotPasswordUseCase.execute({ email });
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process request';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Reset Password - Uses ResetPasswordUseCase
  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await resetPasswordUseCase.execute({ token, new_password: newPassword });
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Google OAuth - Uses GoogleOAuthUseCase
  const googleOAuth = useCallback(async (code: string, state?: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await googleOAuthUseCase.execute({ code, state });
      
      if (result.success) {
        // Update local state
        setAuthState({
          user: result.user,
          isAuthenticated: true,
          remainingGenerations: result.remainingGenerations || 0,
          isLoading: false,
          error: null,
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false, error: result.error || 'Google login failed' }));
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google login failed';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Verify Email - Uses VerifyEmailUseCase
  const verifyEmail = useCallback(async (token: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await verifyEmailUseCase.execute({ token });
      
      if (result.success) {
        // Update local state
        setAuthState(prev => ({
          ...prev,
          user: result.user,
          remainingGenerations: result.remainingGenerations || 0,
          isLoading: false,
        }));
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false, error: result.error || 'Email verification failed' }));
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Email verification failed';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Send Verification Email - Uses SendVerificationEmailUseCase
  const sendVerificationEmail = useCallback(async (email: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await sendVerificationEmailUseCase.execute({ email });
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send verification email';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Logout - Uses LogoutUseCase
  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const refreshToken = tokenService.getRefreshToken();
      const result = await logoutUseCase.execute({ refresh_token: refreshToken || '' });
      
      // Clear local state regardless of result
      setAuthState({
        user: null,
        isAuthenticated: false,
        remainingGenerations: 0,
        isLoading: false,
        error: null,
      });
      
      return result;
    } catch (error) {
      // Even if logout fails, clear local state
      setAuthState({
        user: null,
        isAuthenticated: false,
        remainingGenerations: 0,
        isLoading: false,
        error: null,
      });
      
      return { success: true, message: 'Logged out successfully' };
    }
  }, []);

  // Change Password - Uses ChangePasswordUseCase
  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await changePasswordUseCase.execute({ current_password: currentPassword, new_password: newPassword });
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Refresh Token - Uses RefreshTokenUseCase
  const refreshToken = useCallback(async () => {
    try {
      const refreshTokenValue = tokenService.getRefreshToken();
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }
      
      const result = await refreshTokenUseCase.execute({ refresh_token: refreshTokenValue });
      
      if (result.success) {
        // Token refreshed successfully
        return result;
      } else {
        // Refresh failed, logout user
        await logout();
        return result;
      }
    } catch (error) {
      // Refresh failed, logout user
      await logout();
      return { success: false, error: 'Token refresh failed' };
    }
  }, [logout]);

  // Get Current User - Direct service call for initial auth check
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
    
    // Actions - All use use-cases for business logic
    login,
    register,
    forgotPassword,
    resetPassword,
    googleOAuth,
    verifyEmail,
    sendVerificationEmail,
    logout,
    changePassword,
    refreshToken,
    getCurrentUser,
  };
}
