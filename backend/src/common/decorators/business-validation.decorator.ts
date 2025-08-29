/**
 * Business Validation Decorators
 * 
 * Custom validation decorators that encapsulate business-specific
 * validation rules. These decorators extend class-validator with
 * domain-specific validation logic.
 */

import { 
  registerDecorator, 
  ValidationOptions, 
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface 
} from 'class-validator';

/**
 * Validates that content doesn't violate company content policy
 */
@ValidatorConstraint({ name: 'isContentPolicyCompliant', async: false })
export class IsContentPolicyCompliantConstraint implements ValidatorConstraintInterface {
  validate(text: string): boolean {
    if (!text) return true; // Let @IsNotEmpty handle empty validation
    
    const restrictedKeywords = [
      'gambling', 'crypto', 'cryptocurrency', 'bitcoin', 'adult', 
      'pharmaceutical', 'medical', 'drug', 'prescription', 'casino', 
      'betting', 'forex'
    ];
    
    const lowerText = text.toLowerCase();
    return !restrictedKeywords.some(keyword => lowerText.includes(keyword));
  }

  defaultMessage(): string {
    return 'Content contains restricted keywords and violates our content policy';
  }
}

export function IsContentPolicyCompliant(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsContentPolicyCompliantConstraint,
    });
  };
}

/**
 * Validates that target audience is specific enough (not generic terms like "everyone")
 */
@ValidatorConstraint({ name: 'isSpecificTargetAudience', async: false })
export class IsSpecificTargetAudienceConstraint implements ValidatorConstraintInterface {
  validate(text: string): boolean {
    if (!text) return true; // Let @IsNotEmpty handle empty validation
    
    const genericTerms = [
      'everyone', 'anybody', 'anyone', 'all people', 'general public',
      'masses', 'whole world', 'entire world'
    ];
    
    const lowerText = text.toLowerCase();
    return !genericTerms.some(term => lowerText.includes(term));
  }

  defaultMessage(): string {
    return 'Target audience should be more specific than generic terms like "everyone" for better results';
  }
}

export function IsSpecificTargetAudience(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsSpecificTargetAudienceConstraint,
    });
  };
}

/**
 * Validates that product name doesn't contain suspicious marketing terms
 */
@ValidatorConstraint({ name: 'isAuthenticProductName', async: false })
export class IsAuthenticProductNameConstraint implements ValidatorConstraintInterface {
  validate(text: string): boolean {
    if (!text) return true; // Let @IsNotEmpty handle empty validation
    
    const suspiciousTerms = [
      'get rich quick', 'make money fast', 'guaranteed results',
      'miracle', 'magic', 'instant', 'overnight success'
    ];
    
    const lowerText = text.toLowerCase();
    return !suspiciousTerms.some(term => lowerText.includes(term));
  }

  defaultMessage(): string {
    return 'Product name should avoid suspicious marketing terms for better authenticity';
  }
}

export function IsAuthenticProductName(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsAuthenticProductNameConstraint,
    });
  };
}

/**
 * Validates platform-specific content requirements
 */
@ValidatorConstraint({ name: 'isPlatformOptimized', async: false })
export class IsPlatformOptimizedConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    // This would be used in combination with platform selection
    // For now, always return true as platform optimization is handled
    // at the AI generation level
    return true;
  }

  defaultMessage(): string {
    return 'Content should be optimized for the selected platform';
  }
}

export function IsPlatformOptimized(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPlatformOptimizedConstraint,
    });
  };
}