/**
 * Error Sanitization Utility
 * 
 * Provides secure error handling to prevent information disclosure
 * while maintaining helpful user experience.
 */

export class ErrorSanitizerUtil {
  /**
   * Safe error messages that can be shown to users
   */
  private static readonly SAFE_ERROR_MESSAGES = {
    // Authentication errors
    'Invalid credentials': 'Invalid email or password',
    'User not found': 'Invalid email or password',
    'Account not verified': 'Please verify your email address',
    'Account disabled': 'Account access has been restricted',

    // Generation errors
    'Generation limit exceeded': 'You have reached your generation limit',
    'Platform not available': 'Selected platform is not available for your plan',
    'Content policy violation': 'Content does not meet our community guidelines',
    'Rate limit exceeded': 'Too many requests. Please try again later',

    // Payment errors
    'Payment failed': 'Payment processing failed. Please try again',
    'Subscription not found': 'Subscription information not available',
    'Invalid subscription': 'Subscription status is invalid',

    // General errors
    'Validation failed': 'Please check your input and try again',
    'Network error': 'Connection error. Please try again',
    'Service unavailable': 'Service is temporarily unavailable',
  };

  /**
   * Error types that should show generic messages
   */
  private static readonly GENERIC_ERROR_TYPES = [
    'Database',
    'Connection',
    'Internal',
    'System',
    'Network',
    'Timeout',
    'Config',
    'Environment',
  ];

  /**
   * Sanitize error for client response
   */
  static sanitizeError(error: Error | string | unknown): string {
    // Handle string errors
    if (typeof error === 'string') {
      return this.getSafeMessage(error);
    }

    // Handle Error objects
    if (error instanceof Error) {
      // Check for known safe messages
      const safeMessage = this.getSafeMessage(error.message);
      if (safeMessage !== 'An error occurred. Please try again later.') {
        return safeMessage;
      }

      // Check if error type suggests internal issue
      if (this.isInternalError(error)) {
        return 'Service temporarily unavailable. Please try again later.';
      }

      // For unknown errors, return generic message
      return 'An error occurred. Please try again later.';
    }

    // Handle unknown error types
    return 'An error occurred. Please try again later.';
  }

  /**
   * Get safe message for known error messages
   */
  private static getSafeMessage(message: string): string {
    // Check exact matches first
    if (this.SAFE_ERROR_MESSAGES[message]) {
      return this.SAFE_ERROR_MESSAGES[message];
    }

    // Check for partial matches
    for (const [pattern, safeMessage] of Object.entries(this.SAFE_ERROR_MESSAGES)) {
      if (message.toLowerCase().includes(pattern.toLowerCase())) {
        return safeMessage;
      }
    }

    // No safe message found
    return 'An error occurred. Please try again later.';
  }

  /**
   * Check if error suggests internal system issue
   */
  private static isInternalError(error: Error): boolean {
    const message = error.message.toLowerCase();
    const errorType = error.constructor.name;

    // Check error message for internal indicators
    const internalIndicators = [
      'database',
      'connection',
      'timeout',
      'internal',
      'system',
      'config',
      'environment',
      'null pointer',
      'undefined',
      'cannot read property',
      'cannot read properties',
      'query failed',
      'table',
      'column',
      'constraint',
    ];

    const hasInternalIndicator = internalIndicators.some(indicator => 
      message.includes(indicator)
    );

    // Check error type
    const isGenericErrorType = this.GENERIC_ERROR_TYPES.some(type => 
      errorType.includes(type)
    );

    return hasInternalIndicator || isGenericErrorType;
  }

  /**
   * Log error securely (for internal monitoring)
   */
  static logError(error: Error | string | unknown, context: string): void {
    const timestamp = new Date().toISOString();
    const errorDetails = error instanceof Error ? 
      `${error.name}: ${error.message}\nStack: ${error.stack}` :
      `Error: ${String(error)}`;

    console.error(`[${timestamp}] ${context}: ${errorDetails}`);
  }

  /**
   * Create sanitized error response object
   */
  static createErrorResponse(
    error: Error | string | unknown,
    context: string = 'Unknown'
  ): { success: false; message: string; error: string } {
    // Log the real error for monitoring
    this.logError(error, context);

    // Return sanitized error to client
    const sanitizedMessage = this.sanitizeError(error);

    return {
      success: false,
      message: sanitizedMessage,
      error: sanitizedMessage
    };
  }
}