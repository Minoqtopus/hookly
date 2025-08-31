/**
 * Auth Hook - React Integration
 * 
 * Staff Engineer Design: Clean hook pattern with proper separation
 * Business Logic: Uses use-cases for business logic only
 * UI Concerns: Handles notifications, navigation, and token management
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
  RegisterRequest,
  User
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

// Create use cases with dependencies (only business logic)
const loginUseCase = new LoginUseCase(authService);
const registerUseCase = new RegisterUseCase(authService);
const forgotPasswordUseCase = new ForgotPasswordUseCase(authService);
const resetPasswordUseCase = new ResetPasswordUseCase(authService);
const googleOAuthUseCase = new GoogleOAuthUseCase(authService);
const verifyEmailUseCase = new VerifyEmailUseCase(authService);
const sendVerificationEmailUseCase = new SendVerificationEmailUseCase(authService);
const logoutUseCase = new LogoutUseCase(authService);
const changePasswordUseCase = new ChangePasswordUseCase(authService);
const refreshTokenUseCase = new RefreshTokenUseCase(authService);

// Local state interface
interface AuthState {
  user: User | null;
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

  // Login - Uses LoginUseCase for business logic, Hook handles UI concerns
  const login = useCallback(async (credentials: LoginRequest) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Call use-case for business logic only
      const result = await loginUseCase.execute(credentials);
      
      if (result.success) {
        // Handle UI concerns in hook using use-case result
        if (result.tokens) {
          tokenService.setAccessToken(result.tokens.access_token);
          tokenService.setRefreshToken(result.tokens.refresh_token);
        }
        
        // UI STATE: Show notifications (business logic already handled in Use-Case)
        notificationService.showSuccess('Login successful!');
        
        if (result.user && !result.user.is_email_verified && result.remainingGenerations !== undefined) {
          notificationService.showInfo(
            `You have ${result.remainingGenerations} generations remaining. Subscribe for unlimited access!`
          );
        }
        
        // Navigate
        navigationService.navigateTo('/dashboard');
        
        // Update local state
        setAuthState({
          user: result.user || null,
          isAuthenticated: true,
          remainingGenerations: result.remainingGenerations || 0,
          isLoading: false,
          error: null,
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false, error: result.error || 'Login failed' }));
        notificationService.showError(result.error || 'Login failed');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      notificationService.showError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Register - Uses RegisterUseCase for business logic, Hook handles UI concerns
  const register = useCallback(async (userData: RegisterRequest) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Call use-case for business logic only
      const result = await registerUseCase.execute(userData);
      
      if (result.success) {
        // Handle UI concerns in hook using use-case result
        if (result.tokens) {
          tokenService.setAccessToken(result.tokens.access_token);
          tokenService.setRefreshToken(result.tokens.refresh_token);
        }
        
        // UI STATE: Show notifications (business logic already handled in Use-Case)
        notificationService.showSuccess('Registration successful! Welcome to Hookly!');
        
        if (result.user && !result.user.is_email_verified && result.remainingGenerations !== undefined) {
          notificationService.showInfo(
            `You have ${result.remainingGenerations} generations remaining. Subscribe for unlimited access!`
          );
        }
        
        // Navigate
        navigationService.navigateTo('/dashboard');
        
        // Update local state
        setAuthState({
          user: result.user || null,
          remainingGenerations: result.remainingGenerations || 0,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false, error: result.error || 'Registration failed' }));
        notificationService.showError(result.error || 'Registration failed');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      notificationService.showError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Forgot Password - Uses ForgotPasswordUseCase
  const forgotPassword = useCallback(async (email: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await forgotPasswordUseCase.execute({ email });
      
      if (result.success) {
        notificationService.showSuccess('Password reset email sent! Check your inbox for instructions.');
      } else {
        notificationService.showError(result.error || 'Failed to send password reset email');
      }
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process request';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      notificationService.showError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Reset Password - Uses ResetPasswordUseCase
  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await resetPasswordUseCase.execute({ token, password: newPassword });
      
      if (result.success) {
        notificationService.showSuccess('Password reset successful! You can now login with your new password.');
        navigationService.navigateTo('/login');
      } else {
        notificationService.showError(result.error || 'Failed to reset password');
      }
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      notificationService.showError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Google OAuth - Uses GoogleOAuthUseCase
  const googleOAuth = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Initiate OAuth flow (redirects to backend)
      const result = await googleOAuthUseCase.execute();
      
      if (result.success) {
        // Handle OAuth initiation (redirect)
        if (result.redirect) {
          window.location.href = result.redirect;
          return result;
        }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false, error: result.error || 'Google login failed' }));
        notificationService.showError(result.error || 'Google login failed');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google login failed';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      notificationService.showError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Verify Email - Uses VerifyEmailUseCase
  const verifyEmail = useCallback(async (token: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await verifyEmailUseCase.execute({ token });
      
      if (result.success) {
        // UI STATE: Handle UI concerns in hook (business logic in Use-Case)
        notificationService.showSuccess(
          `Email verified successfully! You now have ${result.remainingGenerations || 0} generations available.`
        );
        
        navigationService.navigateTo('/dashboard');
        
        // Update local state
        setAuthState(prev => ({
          ...prev,
          user: result.user || null,
          remainingGenerations: result.remainingGenerations || 0,
          isLoading: false,
        }));
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false, error: result.error || 'Email verification failed' }));
        notificationService.showError(result.error || 'Email verification failed');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Email verification failed';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      notificationService.showError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Send Verification Email - Uses SendVerificationEmailUseCase
  const sendVerificationEmail = useCallback(async (email: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await sendVerificationEmailUseCase.execute({ email });
      
      if (result.success) {
        notificationService.showSuccess('Verification email sent! Check your inbox and click the verification link.');
      } else {
        notificationService.showError(result.error || 'Failed to send verification email');
      }
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send verification email';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      notificationService.showError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Logout - Uses LogoutUseCase
  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const refreshToken = tokenService.getRefreshToken();
      const result = await logoutUseCase.execute({ refresh_token: refreshToken || '' });
      
      // Always clear local state regardless of backend result
      tokenService.clearTokens();
      setAuthState({
        user: null,
        isAuthenticated: false,
        remainingGenerations: 0,
        isLoading: false,
        error: null,
      });
      
      // UI feedback and navigation
      notificationService.showSuccess('Logged out successfully');
      navigationService.navigateTo('/login');
      
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      // Even if backend logout fails, clear local state
      tokenService.clearTokens();
      setAuthState({
        user: null,
        isAuthenticated: false,
        remainingGenerations: 0,
        isLoading: false,
        error: null,
      });
      
      notificationService.showSuccess('Logged out successfully');
      navigationService.navigateTo('/login');
      
      return { success: true, message: 'Logged out successfully' };
    }
  }, []);

  // Change Password - Uses ChangePasswordUseCase
  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await changePasswordUseCase.execute({ current_password: currentPassword, new_password: newPassword });
      
      if (result.success) {
        notificationService.showSuccess('Password changed successfully! You can now use your new password.');
      } else {
        notificationService.showError(result.error || 'Failed to change password');
      }
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      notificationService.showError(errorMessage);
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
      
      if (result.success && result.tokens) {
        // Store new tokens
        tokenService.setAccessToken(result.tokens.access_token);
        tokenService.setRefreshToken(result.tokens.refresh_token);
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
      const profile = await authService.getCurrentUser();
      
      // Backend returns profile directly with generations_remaining
      const user = {
        id: profile.id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        profile_picture: profile.profile_picture,
        plan: profile.plan,
        role: profile.role,
        auth_providers: profile.auth_providers,
        provider_ids: profile.provider_ids,
        monthly_generation_count: profile.monthly_generation_count,
        monthly_reset_date: profile.monthly_reset_date,
        trial_started_at: profile.trial_started_at,
        trial_ends_at: profile.trial_ends_at,
        trial_generations_used: profile.trial_generations_used,
        is_email_verified: profile.is_email_verified,
        email_verified_at: profile.email_verified_at,
        password_changed_at: profile.password_changed_at,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      };
      
      // Update local state
      setAuthState({
        user,
        isAuthenticated: true,
        remainingGenerations: profile.generations_remaining,
        isLoading: false,
        error: null,
      });
      
      return { success: true, user, remainingGenerations: profile.generations_remaining };
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

  // Check auth status on mount and token expiration
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check if we have valid tokens
        const hasTokens = tokenService.hasValidToken();
        
        if (!hasTokens) {
          setAuthState({
            user: null,
            isAuthenticated: false,
            remainingGenerations: 0,
            isLoading: false,
            error: null,
          });
          return;
        }

        // Check if access token is expired
        const accessToken = tokenService.getAccessToken();
        if (accessToken && tokenService.isTokenExpired(accessToken)) {
          // Try to refresh token
          const refreshResult = await refreshToken();
          if (!refreshResult.success) {
            // Refresh failed, clear tokens and redirect to login
            tokenService.clearTokens();
            setAuthState({
              user: null,
              isAuthenticated: false,
              remainingGenerations: 0,
              isLoading: false,
              error: 'Session expired. Please login again.',
            });
            navigationService.navigateTo('/login');
            return;
          }
        }

        // Get current user if we have valid tokens
        await getCurrentUser();
      } catch (error) {
        console.error('Auth status check failed:', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          remainingGenerations: 0,
          isLoading: false,
          error: 'Authentication check failed',
        });
      }
    };

    checkAuthStatus();
  }, []);

  // Update remaining generations after use
  const updateRemainingGenerations = useCallback((newCount: number) => {
    setAuthState(prev => ({
      ...prev,
      remainingGenerations: newCount
    }));
  }, []);

  // Decrement generation count when used
  const decrementGenerationCount = useCallback(() => {
    setAuthState(prev => ({
      ...prev,
      remainingGenerations: Math.max(0, prev.remainingGenerations - 1)
    }));
  }, []);

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
    updateRemainingGenerations,
    decrementGenerationCount,
  };
}
