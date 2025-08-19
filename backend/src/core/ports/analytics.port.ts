export interface AnalyticsEvent {
  userId?: string;
  eventType: string;
  eventData: Record<string, any>;
  timestamp: Date;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface ConversionEvent {
  userId: string;
  fromPlan: string;
  toPlan: string;
  amount: number;
  source: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface UserBehaviorEvent {
  userId: string;
  action: string;
  page?: string;
  feature?: string;
  duration?: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AnalyticsPort {
  /**
   * Track a generic analytics event
   */
  trackEvent(event: Omit<AnalyticsEvent, 'timestamp'>): Promise<void>;

  /**
   * Track conversion events (plan upgrades, purchases)
   */
  trackConversion(event: Omit<ConversionEvent, 'timestamp'>): Promise<void>;

  /**
   * Track user behavior events
   */
  trackUserBehavior(event: Omit<UserBehaviorEvent, 'timestamp'>): Promise<void>;

  /**
   * Track page views
   */
  trackPageView(userId: string, page: string, metadata?: Record<string, any>): Promise<void>;

  /**
   * Track feature usage
   */
  trackFeatureUsage(userId: string, feature: string, metadata?: Record<string, any>): Promise<void>;

  /**
   * Track errors with context
   */
  trackError(error: Error, userId?: string, context?: Record<string, any>): Promise<void>;

  /**
   * Get user analytics summary
   */
  getUserAnalytics(userId: string, timeRange?: { start: Date; end: Date }): Promise<{
    totalEvents: number;
    featureUsage: Record<string, number>;
    pageViews: Record<string, number>;
    conversionRate: number;
    averageSessionDuration: number;
  }>;

  /**
   * Get conversion analytics
   */
  getConversionAnalytics(timeRange?: { start: Date; end: Date }): Promise<{
    totalConversions: number;
    conversionRate: number;
    revenue: number;
    planDistribution: Record<string, number>;
    sourceDistribution: Record<string, number>;
  }>;

  /**
   * Get feature usage analytics
   */
  getFeatureUsageAnalytics(timeRange?: { start: Date; end: Date }): Promise<{
    totalUsage: number;
    featureRanking: Array<{ feature: string; usage: number; users: number }>;
    userEngagement: number;
  }>;

  /**
   * Get provider health and performance metrics
   */
  getProviderHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    errorRate: number;
    uptime: number;
  }>;
}
