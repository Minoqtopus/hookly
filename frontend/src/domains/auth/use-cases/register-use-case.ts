/**
 * Register Use Case - Business Logic Layer
 * 
 * Staff Engineer Design: Clean use-case pattern
 * Business Logic: Handles registration business rules and state management
 * No Mock Data: Uses real auth service for real data
 */

import { NavigationService } from '../../../shared/services/navigation-service';
import { NotificationService } from '../../../shared/services/notification-service';
import { TokenService } from '../../../shared/services/token-service';
import { RegisterRequest } from '../contracts/auth';
import { AuthService } from '../services/auth-service';

export interface RegisterUseCaseResult {
  success: boolean;
  user?: any;
  remainingGenerations?: number;
  error?: string;
}

export class RegisterUseCase {
  constructor(
    private authService: AuthService,
    private navigationService: NavigationService,
    private notificationService: NotificationService,
    private tokenService: TokenService
  ) {}

  async execute(userData: RegisterRequest): Promise<RegisterUseCaseResult> {
    try {
      // 1. Call auth service for data access
      const response = await this.authService.register(userData);
      
      // 2. Business logic: Handle successful registration
      // Store auth token
      this.tokenService.setAccessToken(response.tokens.access_token);
      this.tokenService.setRefreshToken(response.tokens.refresh_token);
      
      // Show success notification
      this.notificationService.showSuccess('Registration successful! Welcome to Hookly!');
      
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
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      this.notificationService.showError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
