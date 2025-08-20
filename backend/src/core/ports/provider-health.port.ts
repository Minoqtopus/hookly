export interface ProviderHealthMetrics {
  providerId: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  errorRate: number;
  uptime: number;
  lastChecked: Date;
  consecutiveFailures: number;
  totalRequests: number;
  successfulRequests: number;
  averageResponseTime: number;
}

export interface CircuitBreakerState {
  providerId: string;
  state: 'closed' | 'open' | 'half-open';
  failureCount: number;
  lastFailure?: Date;
  nextRetryTime?: Date;
}

export interface ProviderHealthPort {
  /**
   * Record a successful request for a provider
   */
  recordSuccess(providerId: string, responseTime: number): Promise<void>;

  /**
   * Record a failed request for a provider
   */
  recordFailure(providerId: string, error: string): Promise<void>;

  /**
   * Get current health metrics for a provider
   */
  getHealthMetrics(providerId: string): Promise<ProviderHealthMetrics>;

  /**
   * Get health metrics for all providers
   */
  getAllHealthMetrics(): Promise<ProviderHealthMetrics[]>;

  /**
   * Get circuit breaker state for a provider
   */
  getCircuitBreakerState(providerId: string): Promise<CircuitBreakerState>;

  /**
   * Update circuit breaker state
   */
  updateCircuitBreakerState(providerId: string, state: Partial<CircuitBreakerState>): Promise<void>;

  /**
   * Check if provider is available based on circuit breaker
   */
  isProviderAvailable(providerId: string): Promise<boolean>;

  /**
   * Reset circuit breaker for a provider (admin function)
   */
  resetCircuitBreaker(providerId: string): Promise<void>;

  /**
   * Get provider ranking based on health and performance
   */
  getProviderRanking(): Promise<string[]>;
}