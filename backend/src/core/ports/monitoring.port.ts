export interface PerformanceMetric {
  id?: string;
  type: 'request' | 'query' | 'generation' | 'cache' | 'database';
  endpoint?: string;
  method?: string;
  duration: number;
  userId?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  checks: HealthCheck[];
  overallHealth: 'healthy' | 'degraded' | 'unhealthy';
}

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  message: string;
  details?: Record<string, any>;
}

export interface MonitoringPort {
  /**
   * Track performance metrics
   */
  trackMetric(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>): Promise<void>;

  /**
   * Track HTTP request performance
   */
  trackRequest(endpoint: string, method: string, duration: number, userId?: string, ip?: string, userAgent?: string, metadata?: Record<string, any>): Promise<void>;

  /**
   * Track database query performance
   */
  trackQuery(query: string, duration: number, userId?: string, metadata?: Record<string, any>): Promise<void>;

  /**
   * Track AI generation performance
   */
  trackGeneration(duration: number, userId?: string, model?: string, tokensUsed?: number, metadata?: Record<string, any>): Promise<void>;

  /**
   * Get performance statistics
   */
  getPerformanceStats(timeWindowMinutes?: number): Promise<{
    totalRequests: number;
    averageResponseTime: number;
    slowestOperations: PerformanceMetric[];
    throughput: number;
  }>;

  /**
   * Get slow operations above threshold
   */
  getSlowOperations(threshold?: number, limit?: number): PerformanceMetric[];

  /**
   * Get performance trends over time
   */
  getPerformanceTrends(hours?: number): Array<{
    hour: string;
    avgResponseTime: number;
    requestCount: number;
  }>;

  /**
   * Get system health status
   */
  getHealthStatus(): Promise<HealthStatus>;

  /**
   * Refresh health check
   */
  refreshHealthCheck(): Promise<HealthStatus>;

  /**
   * Log error with context
   */
  logError(error: Error, context?: Record<string, any>): Promise<void>;

  /**
   * Log warning with context
   */
  logWarning(message: string, context?: Record<string, any>): Promise<void>;

  /**
   * Log info with context
   */
  logInfo(message: string, context?: Record<string, any>): Promise<void>;
}
