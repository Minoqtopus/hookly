export interface CostMetrics {
  providerId: string;
  totalCost: number;
  totalGenerations: number;
  averageCostPerGeneration: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  period: {
    start: Date;
    end: Date;
  };
}

export interface CostBudget {
  dailyBudget: number;
  monthlyBudget: number;
  perGenerationMax: number;
  alertThresholds: {
    daily: number; // percentage of daily budget
    monthly: number; // percentage of monthly budget
  };
}

export interface CostAlert {
  id: string;
  type: 'daily_threshold' | 'monthly_threshold' | 'per_generation_exceeded' | 'budget_exceeded';
  providerId?: string;
  message: string;
  currentCost: number;
  threshold: number;
  timestamp: Date;
  acknowledged: boolean;
}

export interface CostTrackingPort {
  /**
   * Record cost for a generation
   */
  recordGenerationCost(
    providerId: string,
    inputTokens: number,
    outputTokens: number,
    cost: number,
    userId?: string
  ): Promise<void>;

  /**
   * Get cost metrics for a provider
   */
  getCostMetrics(providerId: string, period?: { start: Date; end: Date }): Promise<CostMetrics>;

  /**
   * Get cost metrics for all providers
   */
  getAllCostMetrics(period?: { start: Date; end: Date }): Promise<CostMetrics[]>;

  /**
   * Get daily cost for a provider
   */
  getDailyCost(providerId: string, date?: Date): Promise<number>;

  /**
   * Get monthly cost for a provider
   */
  getMonthlyCost(providerId: string, month?: Date): Promise<number>;

  /**
   * Get total cost across all providers
   */
  getTotalCost(period?: { start: Date; end: Date }): Promise<number>;

  /**
   * Check if generation would exceed budget
   */
  wouldExceedBudget(providerId: string, estimatedCost: number): Promise<boolean>;

  /**
   * Get current budget configuration
   */
  getBudget(): Promise<CostBudget>;

  /**
   * Update budget configuration
   */
  updateBudget(budget: Partial<CostBudget>): Promise<void>;

  /**
   * Get cost alerts
   */
  getCostAlerts(acknowledged?: boolean): Promise<CostAlert[]>;

  /**
   * Acknowledge cost alert
   */
  acknowledgeCostAlert(alertId: string): Promise<void>;

  /**
   * Get cost efficiency ranking of providers
   */
  getProviderCostRanking(): Promise<Array<{
    providerId: string;
    averageCostPerGeneration: number;
    qualityTocostRatio: number;
  }>>;

  /**
   * Estimate cost for a generation request
   */
  estimateGenerationCost(providerId: string, inputTokens: number, outputTokens: number): Promise<number>;
}