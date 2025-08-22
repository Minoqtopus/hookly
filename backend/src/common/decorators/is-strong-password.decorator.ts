import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

/**
 * Common passwords that should be rejected regardless of complexity
 * This is a subset - in production, integrate with HaveIBeenPwned API
 */
const COMMON_PASSWORDS = new Set([
  'password', 'password123', 'admin123', 'qwerty123', 'letmein123',
  '12345678', '123456789', 'password1', 'admin1234', 'welcome123',
  'password12', 'qwerty12', 'abc12345', 'password!', 'admin!@#'
]);

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }

          // Must be at least 8 characters
          if (value.length < 8) {
            return false;
          }

          // Check against common passwords (case-insensitive)
          if (COMMON_PASSWORDS.has(value.toLowerCase())) {
            return false;
          }

          // Must contain at least one uppercase letter
          if (!/[A-Z]/.test(value)) {
            return false;
          }

          // Must contain at least one lowercase letter
          if (!/[a-z]/.test(value)) {
            return false;
          }

          // Must contain at least one number
          if (!/\d/.test(value)) {
            return false;
          }

          // Must contain at least one symbol/special character
          if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(value)) {
            return false;
          }

          // Additional security checks
          
          // Reject passwords that are mostly repeated characters
          const uniqueChars = new Set(value).size;
          if (uniqueChars < 4) {
            return false;
          }

          // Reject passwords with obvious patterns (keyboard walks)
          const keyboardPatterns = [
            'qwerty', 'asdf', 'zxcv', '1234', '4321', 'abcd', 'dcba'
          ];
          const lowerValue = value.toLowerCase();
          for (const pattern of keyboardPatterns) {
            if (lowerValue.includes(pattern)) {
              return false;
            }
          }

          // Check for username/email in password (basic check)
          // In production, pass username/email to validator for comprehensive check

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one symbol. Common passwords and patterns are not allowed.';
        },
      },
    });
  };
}