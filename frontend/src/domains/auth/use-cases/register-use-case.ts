/**
 * Register Use Case - Business Logic Layer
 * 
 * Staff Engineer Design: Clean use-case pattern
 * Business Logic: ONLY business rules and validation
 * No UI Concerns: No notifications, navigation, or UI state
 */

import { AuthTokens, RegisterRequest, User } from '../contracts/auth';
import { AuthService } from '../services/auth-service';

export interface RegisterUseCaseResult {
  success: boolean;
  user?: User;
  remainingGenerations?: number;
  tokens?: AuthTokens;
  error?: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
}

export class RegisterUseCase {
  constructor(private authService: AuthService) {}

  async execute(formData: RegisterFormData): Promise<RegisterUseCaseResult> {
    try {
      // 1. Business Logic: Validate form data
      const validationResult = this.validateFormData(formData);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: validationResult.error,
        };
      }

      // 2. Business Logic: Prepare request for backend
      const registerRequest: RegisterRequest = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };

      // 3. Business Logic: Call auth service for data access
      const response = await this.authService.register(registerRequest);
      
      // 4. BUSINESS LOGIC: Calculate remaining generations for new user
      const remainingGenerations = this.calculateRemainingGenerations(response.user);
      
      // 5. Business Logic: Transform backend response to expected format
      return {
        success: true,
        user: response.user,
        remainingGenerations,
        tokens: {
          access_token: response.access_token,
          refresh_token: response.refresh_token,
          expires_in: 900 // 15 minutes in seconds
        }
      };
    } catch (error) {
      // Handle unexpected errors
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  private validateFormData(formData: RegisterFormData): { isValid: boolean; error: string } {
    // Email validation
    if (!formData.email || !formData.email.trim()) {
      return { isValid: false, error: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }

    // Password validation
    if (!formData.password || formData.password.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters long' };
    }

    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumbers = /\d/.test(formData.password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return { 
        isValid: false, 
        error: 'Password must contain uppercase, lowercase, and numbers' 
      };
    }

    return { isValid: true, error: '' };
  }

  // BUSINESS RULE: Calculate remaining generations for new users (premium product - 5 total trial)
  private calculateRemainingGenerations(user: any): number {
    if (!user) return 0;
    
    const maxTrialGenerations = 5; // Premium positioning - same for all trial users
    const used = user.trial_generations_used || 0;
    return Math.max(0, maxTrialGenerations - used);
  }
}
