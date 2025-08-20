export interface RetryAttempt {
  attemptNumber: number;
  timestamp: Date;
  error: string;
  providerId?: string;
  processingTime: number;
}

export interface RetryContext {
  jobId: string;
  jobType: string;
  originalData: any;
  attempts: RetryAttempt[];
  maxAttempts: number;
  lastError?: string;
}

export interface RetryStrategy {
  shouldRetry(context: RetryContext): boolean;
  calculateDelay(context: RetryContext): number;
  getNextProvider(context: RetryContext, failedProviderId?: string): string | null;
}

export interface CircuitBreakerState {
  providerId: string;
  failures: number;
  lastFailure: Date;
  isOpen: boolean;
  halfOpenAt?: Date;
}

export interface RetryStrategyPort {
  /**
   * Determine if a failed job should be retried
   */
  shouldRetryJob(context: RetryContext): Promise<boolean>;

  /**
   * Calculate the delay before next retry
   */
  calculateRetryDelay(context: RetryContext): Promise<number>;

  /**
   * Get the next provider for retry (if applicable)
   */
  getNextProvider(context: RetryContext, failedProviderId?: string): Promise<string | null>;

  /**
   * Record a failure for circuit breaker logic
   */
  recordFailure(providerId: string, error: string): Promise<void>;

  /**
   * Record a success for circuit breaker logic
   */
  recordSuccess(providerId: string): Promise<void>;

  /**
   * Check if circuit breaker is open for a provider
   */
  isCircuitBreakerOpen(providerId: string): Promise<boolean>;

  /**
   * Get circuit breaker state for all providers
   */
  getCircuitBreakerStates(): Promise<CircuitBreakerState[]>;

  /**
   * Reset circuit breaker for a provider
   */
  resetCircuitBreaker(providerId: string): Promise<void>;
}