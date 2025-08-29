/**
 * Verify Email Use Case - Business Logic Layer
 * 
 * Staff Engineer Design: Clean use-case pattern
 * Business Logic: Handles email verification business rules and state management
 * No Mock Data: Uses real auth service for real data
 */

import { NavigationService } from '../../../shared/services/navigation-service';
import { NotificationService } from '../../../shared/services/notification-service';
import { VerifyEmailRequest } from '../contracts/auth';
import { AuthService } from '../services/auth-service';

export interface VerifyEmailUseCaseResult {
  success: boolean;
  user?: any;
  remainingGenerations?: number;
  error?: string;
}

export class VerifyEmailUseCase {
  constructor(
    private authService: AuthService,
    private navigationService: NavigationService,
    private notificationService: NotificationService
  ) {}

  async execute(request: VerifyEmailRequest): Promise<VerifyEmailUseCaseResult> {
    try {
      // 1. Call auth service for data access
      const response = await this.authService.verifyEmail(request);
      
      // 2. Business logic: Handle successful email verification
      this.notificationService.showSuccess(
        `Email verified successfully! You now have ${response.remaining_generations} generations available.`
      );
      
      // Navigate to dashboard
      this.navigationService.navigateTo('/dashboard');
      
      return {
        success: true,
        user: response.user,
        remainingGenerations: response.remaining_generations,
      };
    } catch (error) {
      // Handle unexpected errors
      const errorMessage = error instanceof Error ? error.message : 'Email verification failed';
      this.notificationService.showError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
