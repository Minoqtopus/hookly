/**
 * Logout Use Case - Business Logic Layer
 * 
 * Staff Engineer Design: Clean use-case pattern
 * Business Logic: Handles logout business rules and state management
 * No Mock Data: Uses real auth service for real data
 */

import { NavigationService } from '../../../shared/services/navigation-service';
import { NotificationService } from '../../../shared/services/notification-service';
import { TokenService } from '../../../shared/services/token-service';
import { LogoutRequest } from '../contracts/auth';
import { AuthService } from '../services/auth-service';

export interface LogoutUseCaseResult {
  success: boolean;
  message?: string;
  error?: string;
}

export class LogoutUseCase {
  constructor(
    private authService: AuthService,
    private navigationService: NavigationService,
    private notificationService: NotificationService,
    private tokenService: TokenService
  ) {}

  async execute(request: LogoutRequest): Promise<LogoutUseCaseResult> {
    try {
      // 1. Call auth service for data access (if we have refresh token)
      if (request.refresh_token) {
        await this.authService.logout(request);
      }
      
      // 2. Business logic: Handle logout
      // Clear local tokens
      this.tokenService.clearTokens();
      
      // Show success notification
      this.notificationService.showSuccess('Logged out successfully');
      
      // Navigate to login page
      this.navigationService.navigateTo('/login');
      
      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      // Even if logout fails, clear local state
      this.tokenService.clearTokens();
      this.navigationService.navigateTo('/login');
      
      return {
        success: true,
        message: 'Logged out successfully',
      };
    }
  }
}
