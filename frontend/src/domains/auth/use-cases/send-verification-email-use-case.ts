/**
 * Send Verification Email Use Case - Business Logic Layer
 * 
 * Staff Engineer Design: Clean use-case pattern
 * Business Logic: Handles sending verification email business rules
 * No Mock Data: Uses real auth service for real data
 */

import { NotificationService } from '../../../shared/services/notification-service';
import { SendVerificationEmailRequest } from '../contracts/auth';
import { AuthService } from '../services/auth-service';

export interface SendVerificationEmailUseCaseResult {
  success: boolean;
  message?: string;
  error?: string;
}

export class SendVerificationEmailUseCase {
  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  async execute(request: SendVerificationEmailRequest): Promise<SendVerificationEmailUseCaseResult> {
    try {
      // 1. Call auth service for data access
      const response = await this.authService.sendVerificationEmail(request);
      
      // 2. Business logic: Handle verification email sending
      if (response.success) {
        this.notificationService.showSuccess(
          'Verification email sent! Check your inbox and click the verification link.'
        );
        
        return {
          success: true,
          message: response.message || 'Verification email sent successfully',
        };
      } else {
        // Handle failure response
        this.notificationService.showError(response.message || 'Failed to send verification email');
        
        return {
          success: false,
          error: response.message || 'Failed to send verification email',
        };
      }
    } catch (error) {
      // Handle unexpected errors
      const errorMessage = error instanceof Error ? error.message : 'Failed to send verification email';
      this.notificationService.showError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
