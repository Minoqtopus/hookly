export interface PaymentProviderPort {
  /**
   * Verify webhook signature from payment provider
   */
  verifyWebhookSignature(payload: string, signature: string): Promise<boolean>;

  /**
   * Process webhook events from payment provider
   */
  processWebhook(payload: any): Promise<void>;

  /**
   * Create a subscription for a user
   */
  createSubscription(userId: string, planId: string, metadata?: Record<string, any>): Promise<{
    subscriptionId: string;
    status: string;
    nextBillingDate: Date;
  }>;

  /**
   * Cancel a subscription
   */
  cancelSubscription(subscriptionId: string): Promise<{
    cancelled: boolean;
    effectiveDate: Date;
  }>;

  /**
   * Update subscription (plan change, billing cycle, etc.)
   */
  updateSubscription(subscriptionId: string, updates: Record<string, any>): Promise<{
    updated: boolean;
    changes: Record<string, any>;
  }>;

  /**
   * Get subscription details
   */
  getSubscription(subscriptionId: string): Promise<{
    id: string;
    status: string;
    planId: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
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
