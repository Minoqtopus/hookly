import { BadRequestException } from '@nestjs/common';

/**
 * JWT Security Utilities for production-grade token management
 */
export class JWTSecurityUtil {
  /**
   * Validates JWT secret entropy and complexity for production security
   * 
   * Requirements:
   * - Minimum 64 characters for production-grade security
   * - Must contain uppercase, lowercase, numbers, and symbols
   * - No repeated character patterns (prevents weak secrets)
   * - High entropy to prevent brute force attacks
   * 
   * @param secret - JWT secret to validate
   * @param secretName - Name of secret for error reporting
   * @throws BadRequestException if secret doesn't meet security requirements
   */
  static validateSecretStrength(secret: string, secretName: string = 'JWT secret'): void {
    if (!secret || typeof secret !== 'string') {
      throw new BadRequestException(`${secretName} is required and must be a string`);
    }

    // Production minimum: 64 characters for high entropy
    if (secret.length < 64) {
      throw new BadRequestException(
        `${secretName} must be at least 64 characters long for production security. Current length: ${secret.length}`
      );
    }

    // Character diversity requirements
    const hasUppercase = /[A-Z]/.test(secret);
    const hasLowercase = /[a-z]/.test(secret);
    const hasNumbers = /\d/.test(secret);
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(secret);

    if (!hasUppercase || !hasLowercase || !hasNumbers || !hasSpecialChars) {
      throw new BadRequestException(
        `${secretName} must contain at least one uppercase letter, lowercase letter, number, and special character`
      );
    }

    // Prevent weak patterns (repeated characters)
    const hasRepeatedChars = /(.)\1{3,}/.test(secret);
    if (hasRepeatedChars) {
      throw new BadRequestException(
        `${secretName} contains repeated character patterns which weakens security`
      );
    }

    // Check for common weak patterns
    const commonPatterns = [
      /123456/,
      /abcdef/,
      /qwerty/,
      /password/i,
      /secret/i,
      /admin/i,
      /test/i
    ];

    for (const pattern of commonPatterns) {
      if (pattern.test(secret)) {
        throw new BadRequestException(
          `${secretName} contains common patterns which compromise security`
        );
      }
    }

    // Calculate basic entropy (simplified)
    const uniqueChars = new Set(secret).size;
    const entropyScore = uniqueChars / secret.length;
    
    if (entropyScore < 0.4) {
      throw new BadRequestException(
        `${secretName} has insufficient entropy. Consider using a more random secret`
      );
    }
  }

  /**
   * Generates a cryptographically secure JWT secret with high entropy
   * 
   * @param length - Desired secret length (minimum 64)
   * @returns Cryptographically secure random secret
   */
  static generateSecureSecret(length: number = 128): string {
    if (length < 64) {
      throw new BadRequestException('Secret length must be at least 64 characters');
    }

    const crypto = require('crypto');
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let result = '';

    // Ensure at least one character from each category
    const categories = [
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      'abcdefghijklmnopqrstuvwxyz', 
      '0123456789',
      '!@#$%^&*()_+-=[]{}|;:,.<>?'
    ];

    // Add one character from each category
    for (const category of categories) {
      const randomIndex = crypto.randomInt(0, category.length);
      result += category[randomIndex];
    }

    // Fill remaining length with random characters
    for (let i = result.length; i < length; i++) {
      const randomIndex = crypto.randomInt(0, charset.length);
      result += charset[randomIndex];
    }

    // Shuffle the result to distribute required characters
    return result.split('').sort(() => crypto.randomInt(0, 3) - 1).join('');
  }

  /**
   * Validates all JWT secrets on application startup
   * 
   * @param config - Configuration service instance
   */
  static validateAllSecrets(config: any): void {
    const secrets = [
      { key: 'JWT_SECRET', name: 'JWT Access Token Secret' },
      { key: 'JWT_REFRESH_SECRET', name: 'JWT Refresh Token Secret' }
    ];

    for (const { key, name } of secrets) {
      const secret = config.get(key) as string;
      this.validateSecretStrength(secret, name);
    }

    // Ensure secrets are different
    const accessSecret = config.get('JWT_SECRET') as string;
    const refreshSecret = config.get('JWT_REFRESH_SECRET') as string;
    
    if (accessSecret === refreshSecret) {
      throw new BadRequestException(
        'JWT_SECRET and JWT_REFRESH_SECRET must be different for security'
      );
    }
  }
}