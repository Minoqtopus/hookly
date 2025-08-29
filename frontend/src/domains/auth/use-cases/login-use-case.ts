/**
 * Login Use Case - Business Logic Layer
 * 
 * Staff Engineer Design: Clean use-case pattern
 * Business Logic: Handles login business rules and state management
 * No Mock Data: Uses real auth service for real data
 */

import { NavigationService } from '../../../shared/services/navigation-service';
import { NotificationService } from '../../../shared/services/notification-service';
import { TokenService } from '../../../shared/services/token-service';
import { LoginRequest } from '../contracts/auth';
import { AuthService } from '../services/auth-service';

export interface LoginUseCaseResult {
  success: boolean;
  user?: any;
  remainingGenerations?: number;
  error?: string;
}

export class LoginUseCase {
  constructor(
    private authService: AuthService,
    private navigationService: NavigationService,
    private notificationService: NotificationService,
    private tokenService: TokenService
  ) {}

  async execute(credentials: LoginRequest): Promise<LoginUseCaseResult> {
    try {
      // 1. Call auth service for data access
      const response = await this.authService.login(credentials);
      
      // 2. Business logic: Handle successful login
      // Store auth token
      this.tokenService.setAccessToken(response.tokens.access_token);
      this.tokenService.setRefreshToken(response.tokens.refresh_token);
      
      // Show success notification
      this.notificationService.showSuccess('Login successful!');
      
      // Check if user needs email verification
      if (!response.user.is_email_verified) {
        this.notificationService.showInfo(
          `You have ${response.remaining_generations} generations remaining. Verify your email to unlock 15 total!`
        );
      }
      
      // Navigate to dashboard
      this.navigationService.navigateTo('/dashboard');
      
      return {
        success: true,
        user: response.user,
        remainingGenerations: response.remaining_generations,
      };
    } catch (error) {
      // Handle unexpected errors
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      this.notificationService.showError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
