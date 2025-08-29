/**
 * Send Verification Email Use Case - Business Logic Layer
 * 
 * Staff Engineer Design: Clean use-case pattern
 * Business Logic: ONLY business rules and verification email request
 * No UI Concerns: No notifications or UI state
 */

import { SendVerificationEmailRequest } from '../contracts/auth';
import { AuthService } from '../services/auth-service';

export interface SendVerificationEmailUseCaseResult {
  success: boolean;
  message?: string;
  error?: string;
}

export class SendVerificationEmailUseCase {
  constructor(private authService: AuthService) {}

  async execute(request: SendVerificationEmailRequest): Promise<SendVerificationEmailUseCaseResult> {
    try {
      // 1. Business Logic: Call auth service for data access
      const response = await this.authService.sendVerificationEmail(request);
      
      // 2. Business Logic: Return business result
      return {
        success: response.success,
        message: response.message,
      };
    } catch (error) {
      // Handle unexpected errors
      const errorMessage = error instanceof Error ? error.message : 'Failed to send verification email';
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
