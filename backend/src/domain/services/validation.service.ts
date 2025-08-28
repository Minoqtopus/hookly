/**
 * Centralized Validation Service
 * 
 * Encapsulates all business validation logic in a single, testable service.
 * This service coordinates between domain models and provides consistent
 * validation responses across the application.
 * 
 * Staff Engineer Note: Centralized validation reduces duplication and 
 * ensures consistent business rule enforcement across all modules.
 */

import { Injectable, BadRequestException } from '@nestjs/common';
import { UserPlanModel } from '../models/user-plan.model';
import { GenerationRequestModel } from '../models/generation-request.model';
import { BUSINESS_CONSTANTS } from '../../constants/business-rules';

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface ContentPolicyResult {
  isAllowed: boolean;
  violations: string[];
  severity: 'low' | 'medium' | 'high';
}

/**
 * Validation Service
 * 
 * Provides centralized validation logic for all business operations
 */
@Injectable()
export class ValidationService {

  /**
   * Validate user plan and generation request comprehensively
   */
  validateGenerationRequest(
    userPlan: UserPlanModel, 
    request: GenerationRequestModel
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Validate basic request structure
    const requestValidation = request.validate();
    if (!requestValidation.isValid) {
      requestValidation.errors.forEach(error => {
        errors.push({
          field: 'request',
          message: error,
          code: 'INVALID_REQUEST_FORMAT'
        });
      });
    }

    // Add warnings from request validation
    requestValidation.warnings.forEach(warning => {
      warnings.push({
        field: 'request',
        message: warning,
        code: 'REQUEST_WARNING'
      });
    });

    // Validate user plan access
    try {
      request.validateUserAccess(userPlan);
    } catch (error) {
      errors.push({
        field: 'userPlan',
        message: error instanceof Error ? error.message : 'Access validation failed',
        code: 'ACCESS_DENIED'
      });
    }

    // Validate content policy
    const policyResult = this.validateContentPolicy(request);
    if (!policyResult.isAllowed) {
      policyResult.violations.forEach(violation => {
        errors.push({
          field: 'content',
          message: `Content policy violation: ${violation}`,
          code: 'CONTENT_POLICY_VIOLATION'
        });
      });
    }

    // Rate limiting validation (placeholder for future implementation)
    const rateLimitResult = this.validateRateLimit(request);
    if (!rateLimitResult.isValid) {
      errors.push({
        field: 'rateLimit',
        message: 'Rate limit exceeded. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate user plan features and limits
   */
  validateUserPlan(userPlan: UserPlanModel): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Check if trial has expired
    if (userPlan.plan === 'trial' && userPlan.trialEndsAt && new Date() > userPlan.trialEndsAt) {
      errors.push({
        field: 'trial',
        message: 'Trial period has expired',
        code: 'TRIAL_EXPIRED'
      });
    }

    // Check generation limits
    const limits = userPlan.getGenerationLimits();
    if (limits.remaining <= 0) {
      errors.push({
        field: 'limits',
        message: 'Generation limit reached',
        code: 'LIMIT_EXCEEDED'
      });
    } else if (limits.remaining <= 5) {
      warnings.push({
        field: 'limits',
        message: `Only ${limits.remaining} generations remaining`,
        code: 'LIMIT_WARNING'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate content against company policy
   */
  validateContentPolicy(request: GenerationRequestModel): ContentPolicyResult {
    const violations: string[] = [];
    
    // Restricted keywords check
    const restrictedKeywords = [
      'gambling', 'crypto', 'cryptocurrency', 'bitcoin', 'adult', 'pharmaceutical',
      'medical', 'drug', 'prescription', 'casino', 'betting', 'forex'
    ];
    
    const contentToCheck = [
      request.productName,
      request.niche,
      request.targetAudience
    ].join(' ').toLowerCase();

    // Check for restricted keywords
    restrictedKeywords.forEach(keyword => {
      if (contentToCheck.includes(keyword)) {
        violations.push(`Restricted keyword: ${keyword}`);
      }
    });

    // Check for suspicious patterns
    if (this.containsSuspiciousPatterns(contentToCheck)) {
      violations.push('Suspicious content patterns detected');
    }

    // Determine severity
    let severity: 'low' | 'medium' | 'high' = 'low';
    if (violations.length > 2) severity = 'high';
    else if (violations.length > 0) severity = 'medium';

    return {
      isAllowed: violations.length === 0,
      violations,
      severity
    };
  }

  /**
   * Validate email format and business rules
   */
  validateEmail(email: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Basic email format (additional to class-validator)
    if (!email.includes('@')) {
      errors.push({
        field: 'email',
        message: 'Invalid email format',
        code: 'INVALID_EMAIL_FORMAT'
      });
    }

    // Business email domain preferences
    const businessDomains = ['gmail.com', 'outlook.com', 'company.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (domain && !businessDomains.some(bd => domain.includes(bd.split('.')[0]))) {
      warnings.push({
        field: 'email',
        message: 'Consider using a business email for better deliverability',
        code: 'EMAIL_DOMAIN_WARNING'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate password strength beyond basic requirements
   */
  validatePasswordStrength(password: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Additional business rules for password strength
    const commonPasswords = ['password123', '123456789', 'qwerty123'];
    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
      errors.push({
        field: 'password',
        message: 'Password is too common',
        code: 'COMMON_PASSWORD'
      });
    }

    // Check for sequential characters
    if (this.hasSequentialCharacters(password)) {
      warnings.push({
        field: 'password',
        message: 'Avoid sequential characters for better security',
        code: 'SEQUENTIAL_CHARACTERS'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Throw validation exception with proper error formatting
   */
  throwValidationException(result: ValidationResult, context: string = ''): never {
    const errorMessage = result.errors.map(e => e.message).join('; ');
    const contextMessage = context ? `${context}: ` : '';
    
    throw new BadRequestException({
      message: `${contextMessage}${errorMessage}`,
      errors: result.errors,
      warnings: result.warnings
    });
  }

  /**
   * Private: Rate limit validation (placeholder for Redis implementation)
   */
  private validateRateLimit(request: GenerationRequestModel): ValidationResult {
    // TODO: Implement actual rate limiting logic with Redis
    // For now, return valid to maintain existing functionality
    
    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  }

  /**
   * Private: Check for suspicious content patterns
   */
  private containsSuspiciousPatterns(content: string): boolean {
    const suspiciousPatterns = [
      /get\s+rich\s+quick/i,
      /make\s+money\s+fast/i,
      /guaranteed\s+results/i,
      /lose\s+weight\s+overnight/i,
      /miracle\s+cure/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Private: Check for sequential characters in password
   */
  private hasSequentialCharacters(password: string): boolean {
    const sequences = ['123', 'abc', 'qwe', '456', 'def'];
    return sequences.some(seq => password.toLowerCase().includes(seq));
  }
}