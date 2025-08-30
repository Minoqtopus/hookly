/**
 * Login Use Case - Business Logic Layer
 * 
 * Staff Engineer Design: Clean use-case pattern
 * Business Logic: ONLY business rules and authentication
 * No UI Concerns: No notifications, navigation, or UI state
 */

import { AuthTokens, LoginRequest, User } from '../contracts/auth';
import { AuthService } from '../services/auth-service';

export interface LoginUseCaseResult {
  success: boolean;
  user?: User;
  remainingGenerations?: number;
  tokens?: AuthTokens;
  error?: string;
}

export class LoginUseCase {
  constructor(private authService: AuthService) {}

  async execute(credentials: LoginRequest): Promise<LoginUseCaseResult> {
    try {
      // 1. BUSINESS RULE: Validate email format
      if (!this.isValidEmail(credentials.email)) {
        return {
          success: false,
          error: 'Please enter a valid email address'
        };
      }

      // 2. BUSINESS RULE: Validate password requirements
      if (!credentials.password || credentials.password.length < 1) {
        return {
          success: false,
          error: 'Password is required'
        };
      }

      // 3. BUSINESS LOGIC: Call auth service for data access
      const response = await this.authService.login(credentials);
      
      // 4. BUSINESS LOGIC: Calculate remaining generations based on business rules
      const remainingGenerations = this.calculateRemainingGenerations(response.user);
      
      // 5. BUSINESS LOGIC: Return enriched business result
      return {
        success: true,
        user: response.user,
        remainingGenerations,
        tokens: {
          access_token: response.access_token,
          refresh_token: response.refresh_token,
          expires_in: 900
        }
      };
    } catch (error) {
      // Handle unexpected errors
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // BUSINESS RULE: Email validation
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // BUSINESS RULE: Calculate remaining generations (premium product - 5 total for all trial users)
  private calculateRemainingGenerations(user: any): number {
    if (!user) return 0;
    
    const maxTrialGenerations = 5; // Premium positioning - same for all trial users
    const used = user.trial_generations_used || 0;
    return Math.max(0, maxTrialGenerations - used);
  }
}
