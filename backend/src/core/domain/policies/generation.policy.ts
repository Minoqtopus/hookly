export interface GenerationConfig {
  maxRetries: number;
  retryDelay: number;
  timeout: number;
}

export class GenerationPolicy {
  private readonly DEFAULT_CONFIG: GenerationConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 30000,
  };

  getGenerationConfig(): GenerationConfig {
    return { ...this.DEFAULT_CONFIG };
  }

  calculateRetryDelay(attempt: number): number {
    return Math.min(this.DEFAULT_CONFIG.retryDelay * Math.pow(2, attempt), 30000);
  }

  shouldRetry(attempt: number, error?: Error): boolean {
    if (attempt >= this.DEFAULT_CONFIG.maxRetries) {
      return false;
    }

    if (error) {
      const nonRetryableErrors = ['INVALID_REQUEST', 'AUTHENTICATION_ERROR', 'PERMISSION_DENIED', 'QUOTA_EXCEEDED'];
      if (nonRetryableErrors.some(errType => error.message.includes(errType))) {
        return false;
      }
    }

    return true;
  }

  validateGenerationRequest(request: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.productName?.trim()) {
      errors.push('Product name is required');
    }
    if (!request.niche?.trim()) {
      errors.push('Niche is required');
    }
    if (!request.targetAudience?.trim()) {
      errors.push('Target audience is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
