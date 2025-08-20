export interface EnterpriseUpsellPort {
  /**
   * Get available upsell options for a user based on their current plan
   */
  getAvailableUpsells(userId: string): Promise<{
    additionalUsers: {
      available: boolean;
      currentCount: number;
      maxAllowed: number;
      pricePerUser: number;
      nextBillingDate?: Date;
    };
    customIntegrations: {
      available: boolean;
      options: Array<{
        type: string;
        description: string;
        monthlyPrice: number;
        setupFee: number;
        features: string[];
      }>;
    };
    whiteLabel: {
      available: boolean;
      monthlyPrice: number;
      setupFee: number;
      features: string[];
      customBranding: boolean;
      customDomain: boolean;
    };
    dedicatedSupport: {
      available: boolean;
      monthlyPrice: number;
      features: string[];
      responseTime: string;
    };
  }>;

  /**
   * Purchase additional users for a team
   */
  purchaseAdditionalUsers(
    userId: string,
    quantity: number,
    billingCycle: 'monthly' | 'yearly'
  ): Promise<{
    success: boolean;
    subscriptionId: string;
    totalMonthlyCost: number;
    nextBillingDate: Date;
    userLimit: number;
  }>;

  /**
   * Request custom integration
   */
  requestCustomIntegration(
    userId: string,
    integrationType: string,
    requirements: string,
    estimatedComplexity: 'simple' | 'medium' | 'complex'
  ): Promise<{
    requestId: string;
    estimatedCost: number;
    estimatedTimeline: string;
    status: string;
  }>;

  /**
   * Enable white-label solution
   */
  enableWhiteLabel(
    userId: string,
    customBranding: boolean,
    customDomain: boolean,
    setupRequirements: string
  ): Promise<{
    success: boolean;
    subscriptionId: string;
    monthlyCost: number;
    setupFee: number;
    features: string[];
    estimatedSetupTime: string;
  }>;

  /**
   * Upgrade to dedicated support
   */
  upgradeToDedicatedSupport(
    userId: string,
    supportLevel: 'basic' | 'premium' | 'enterprise'
  ): Promise<{
    success: boolean;
    subscriptionId: string;
    monthlyCost: number;
    features: string[];
    responseTime: string;
    accountManager: boolean;
  }>;

  /**
   * Get enterprise upsell analytics and revenue metrics
   */
  getEnterpriseAnalytics(userId: string): Promise<{
    totalUpsellRevenue: number;
    monthlyRecurringRevenue: number;
    upsellBreakdown: {
      additionalUsers: number;
      customIntegrations: number;
      whiteLabel: number;
      dedicatedSupport: number;
    };
    conversionRates: {
      additionalUsers: number;
      customIntegrations: number;
      whiteLabel: number;
      dedicatedSupport: number;
    };
    customerLifetimeValue: number;
  }>;

  /**
   * Cancel enterprise upsell subscription
   */
  cancelEnterpriseUpsell(
    userId: string,
    upsellType: string
  ): Promise<{
    cancelled: boolean;
    effectiveDate: Date;
    proratedRefund?: number;
  }>;
}
