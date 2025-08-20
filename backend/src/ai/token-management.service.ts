import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserPlan } from '../entities/user.entity';

export interface TokenAllocation {
  inputLimit: number;
  outputLimit: number;
  totalLimit: number;
  costLimit: number; // Maximum cost per generation
}

export interface TokenUsageTracking {
  userId?: string;
  providerId: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  timestamp: Date;
  success: boolean;
}

export interface UserTokenLimits {
  dailyGenerations: number;
  monthlyGenerations: number;
  tokensPerGeneration: TokenAllocation;
  monthlyTokenBudget: number;
  dailyTokenBudget: number;
}

@Injectable()
export class TokenManagementService {
  private readonly logger = new Logger(TokenManagementService.name);
  
  // Token allocation per user plan (configurable via environment)
  private readonly planTokenLimits: Map<UserPlan, UserTokenLimits> = new Map();
  
  // Daily usage tracking (in-memory for now, should use Redis in production)
  private dailyUsage: Map<string, TokenUsageTracking[]> = new Map();
  private monthlyUsage: Map<string, TokenUsageTracking[]> = new Map();

  constructor(private configService: ConfigService) {
    this.initializeTokenLimits();
    this.logger.log('Token Management Service initialized with plan-based limits');
  }

  private initializeTokenLimits(): void {
    // Base token allocation from environment (with sensible defaults)
    const baseInputTokens = this.configService.get<number>('AI_INPUT_TOKENS_PER_GENERATION', 1000);
    const baseOutputTokens = this.configService.get<number>('AI_OUTPUT_TOKENS_PER_GENERATION', 2000);
    const baseCostLimit = this.configService.get<number>('AI_COST_LIMIT_PER_GENERATION', 0.005);

    // TRIAL Plan Limits
    this.planTokenLimits.set(UserPlan.TRIAL, {
      dailyGenerations: 5, // Conservative for trial
      monthlyGenerations: 15,
      tokensPerGeneration: {
        inputLimit: baseInputTokens * 0.8, // 800 tokens
        outputLimit: baseOutputTokens * 0.8, // 1600 tokens
        totalLimit: (baseInputTokens + baseOutputTokens) * 0.8, // 2400 tokens
        costLimit: baseCostLimit * 0.5, // $0.0025 max per generation
      },
      monthlyTokenBudget: 36000, // 15 generations × 2400 tokens
      dailyTokenBudget: 12000, // 5 generations × 2400 tokens
    });

    // STARTER Plan Limits
    this.planTokenLimits.set(UserPlan.STARTER, {
      dailyGenerations: 20, // ~1.67 per day for 50/month
      monthlyGenerations: 50,
      tokensPerGeneration: {
        inputLimit: baseInputTokens, // 1000 tokens
        outputLimit: baseOutputTokens, // 2000 tokens
        totalLimit: baseInputTokens + baseOutputTokens, // 3000 tokens
        costLimit: baseCostLimit * 0.8, // $0.004 max per generation
      },
      monthlyTokenBudget: 150000, // 50 generations × 3000 tokens
      dailyTokenBudget: 60000, // 20 generations × 3000 tokens
    });

    // PRO Plan Limits
    this.planTokenLimits.set(UserPlan.PRO, {
      dailyGenerations: 50, // ~6.67 per day for 200/month
      monthlyGenerations: 200,
      tokensPerGeneration: {
        inputLimit: baseInputTokens * 1.2, // 1200 tokens
        outputLimit: baseOutputTokens * 1.2, // 2400 tokens
        totalLimit: (baseInputTokens + baseOutputTokens) * 1.2, // 3600 tokens
        costLimit: baseCostLimit, // $0.005 max per generation
      },
      monthlyTokenBudget: 720000, // 200 generations × 3600 tokens
      dailyTokenBudget: 180000, // 50 generations × 3600 tokens
    });

    // AGENCY Plan Limits
    this.planTokenLimits.set(UserPlan.AGENCY, {
      dailyGenerations: 100, // ~16.67 per day for 500/month
      monthlyGenerations: 500,
      tokensPerGeneration: {
        inputLimit: baseInputTokens * 1.5, // 1500 tokens
        outputLimit: baseOutputTokens * 1.5, // 3000 tokens
        totalLimit: (baseInputTokens + baseOutputTokens) * 1.5, // 4500 tokens
        costLimit: baseCostLimit * 1.5, // $0.0075 max per generation
      },
      monthlyTokenBudget: 2250000, // 500 generations × 4500 tokens
      dailyTokenBudget: 450000, // 100 generations × 4500 tokens
    });
  }

  /**
   * Get token allocation for a user plan
   */
  getTokenAllocation(userPlan: UserPlan): TokenAllocation {
    const limits = this.planTokenLimits.get(userPlan);
    if (!limits) {
      this.logger.warn(`Unknown user plan: ${userPlan}, using TRIAL limits`);
      return this.planTokenLimits.get(UserPlan.TRIAL)!.tokensPerGeneration;
    }
    return limits.tokensPerGeneration;
  }

  /**
   * Get complete user token limits for a plan
   */
  getUserTokenLimits(userPlan: UserPlan): UserTokenLimits {
    const limits = this.planTokenLimits.get(userPlan);
    if (!limits) {
      this.logger.warn(`Unknown user plan: ${userPlan}, using TRIAL limits`);
      return this.planTokenLimits.get(UserPlan.TRIAL)!;
    }
    return limits;
  }

  /**
   * Check if user can perform a generation based on their plan limits
   */
  async canUserGenerate(userId: string, userPlan: UserPlan): Promise<{
    canGenerate: boolean;
    reason?: string;
    remainingDaily: number;
    remainingMonthly: number;
  }> {
    const limits = this.getUserTokenLimits(userPlan);
    const dailyUsage = this.getDailyUsage(userId);
    const monthlyUsage = this.getMonthlyUsage(userId);

    const dailyGenerations = dailyUsage.length;
    const monthlyGenerations = monthlyUsage.length;

    if (dailyGenerations >= limits.dailyGenerations) {
      return {
        canGenerate: false,
        reason: 'Daily generation limit exceeded',
        remainingDaily: 0,
        remainingMonthly: limits.monthlyGenerations - monthlyGenerations,
      };
    }

    if (monthlyGenerations >= limits.monthlyGenerations) {
      return {
        canGenerate: false,
        reason: 'Monthly generation limit exceeded',
        remainingDaily: limits.dailyGenerations - dailyGenerations,
        remainingMonthly: 0,
      };
    }

    return {
      canGenerate: true,
      remainingDaily: limits.dailyGenerations - dailyGenerations,
      remainingMonthly: limits.monthlyGenerations - monthlyGenerations,
    };
  }

  /**
   * Record token usage for a generation
   */
  async recordTokenUsage(usage: TokenUsageTracking): Promise<void> {
    const today = this.getDateKey(new Date());
    const month = this.getMonthKey(new Date());
    
    // Record daily usage
    if (usage.userId) {
      const dailyKey = `${usage.userId}:${today}`;
      const dailyUsages = this.dailyUsage.get(dailyKey) || [];
      dailyUsages.push(usage);
      this.dailyUsage.set(dailyKey, dailyUsages);

      // Record monthly usage
      const monthlyKey = `${usage.userId}:${month}`;
      const monthlyUsages = this.monthlyUsage.get(monthlyKey) || [];
      monthlyUsages.push(usage);
      this.monthlyUsage.set(monthlyKey, monthlyUsages);
    }

    this.logger.debug(`Recorded token usage: ${usage.totalTokens} tokens, $${usage.estimatedCost.toFixed(6)} cost`);
  }

  /**
   * Get daily token usage for a user
   */
  getDailyUsage(userId: string, date?: Date): TokenUsageTracking[] {
    const dateKey = this.getDateKey(date || new Date());
    const key = `${userId}:${dateKey}`;
    return this.dailyUsage.get(key) || [];
  }

  /**
   * Get monthly token usage for a user
   */
  getMonthlyUsage(userId: string, date?: Date): TokenUsageTracking[] {
    const monthKey = this.getMonthKey(date || new Date());
    const key = `${userId}:${monthKey}`;
    return this.monthlyUsage.get(key) || [];
  }

  /**
   * Get user's current usage statistics
   */
  async getUserUsageStats(userId: string, userPlan: UserPlan): Promise<{
    daily: {
      used: number;
      limit: number;
      tokensUsed: number;
      tokenBudget: number;
      costUsed: number;
    };
    monthly: {
      used: number;
      limit: number;
      tokensUsed: number;
      tokenBudget: number;
      costUsed: number;
    };
  }> {
    const limits = this.getUserTokenLimits(userPlan);
    const dailyUsage = this.getDailyUsage(userId);
    const monthlyUsage = this.getMonthlyUsage(userId);

    const dailyTokensUsed = dailyUsage.reduce((sum, usage) => sum + usage.totalTokens, 0);
    const monthlyTokensUsed = monthlyUsage.reduce((sum, usage) => sum + usage.totalTokens, 0);
    const dailyCostUsed = dailyUsage.reduce((sum, usage) => sum + usage.estimatedCost, 0);
    const monthlyCostUsed = monthlyUsage.reduce((sum, usage) => sum + usage.estimatedCost, 0);

    return {
      daily: {
        used: dailyUsage.length,
        limit: limits.dailyGenerations,
        tokensUsed: dailyTokensUsed,
        tokenBudget: limits.dailyTokenBudget,
        costUsed: dailyCostUsed,
      },
      monthly: {
        used: monthlyUsage.length,
        limit: limits.monthlyGenerations,
        tokensUsed: monthlyTokensUsed,
        tokenBudget: limits.monthlyTokenBudget,
        costUsed: monthlyCostUsed,
      },
    };
  }

  /**
   * Estimate cost for a generation request
   */
  estimateGenerationCost(
    userPlan: UserPlan,
    providerId: string,
    inputTokens?: number,
    outputTokens?: number
  ): number {
    const allocation = this.getTokenAllocation(userPlan);
    const actualInputTokens = inputTokens || allocation.inputLimit;
    const actualOutputTokens = outputTokens || allocation.outputLimit;

    // Provider-specific cost calculation (August 2025 pricing)
    const providerCosts = {
      gemini: { input: 0.10, output: 0.40 }, // per 1M tokens
      groq: { input: 0.11, output: 0.34 },
      openai: { input: 0.15, output: 0.60 },
    };

    const costs = providerCosts[providerId] || providerCosts.gemini;
    const inputCost = (actualInputTokens / 1000000) * costs.input;
    const outputCost = (actualOutputTokens / 1000000) * costs.output;

    return inputCost + outputCost;
  }

  /**
   * Check if generation would exceed cost limits
   */
  async wouldExceedCostLimit(
    userId: string,
    userPlan: UserPlan,
    providerId: string,
    estimatedCost?: number
  ): Promise<boolean> {
    const limits = this.getUserTokenLimits(userPlan);
    const cost = estimatedCost || this.estimateGenerationCost(userPlan, providerId);

    // Check per-generation cost limit
    if (cost > limits.tokensPerGeneration.costLimit) {
      return true;
    }

    // Check daily budget
    const dailyUsage = this.getDailyUsage(userId);
    const dailyCostUsed = dailyUsage.reduce((sum, usage) => sum + usage.estimatedCost, 0);
    const dailyBudget = limits.dailyTokenBudget * 0.0005; // Rough estimate: $0.0005 per token
    
    if (dailyCostUsed + cost > dailyBudget) {
      return true;
    }

    return false;
  }

  /**
   * Clean up old usage data (call this periodically)
   */
  async cleanupOldUsageData(): Promise<void> {
    const now = new Date();
    const cutoffDaily = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    const cutoffMonthly = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); // 90 days ago

    // Clean daily usage older than 7 days
    const dailyKeysToDelete: string[] = [];
    for (const [key] of this.dailyUsage) {
      const dateStr = key.split(':')[1];
      const date = new Date(dateStr);
      if (date < cutoffDaily) {
        dailyKeysToDelete.push(key);
      }
    }
    dailyKeysToDelete.forEach(key => this.dailyUsage.delete(key));

    // Clean monthly usage older than 90 days
    const monthlyKeysToDelete: string[] = [];
    for (const [key] of this.monthlyUsage) {
      const monthStr = key.split(':')[1];
      const date = new Date(monthStr + '-01');
      if (date < cutoffMonthly) {
        monthlyKeysToDelete.push(key);
      }
    }
    monthlyKeysToDelete.forEach(key => this.monthlyUsage.delete(key));

    this.logger.log(`Cleaned up ${dailyKeysToDelete.length} daily and ${monthlyKeysToDelete.length} monthly usage records`);
  }

  private getDateKey(date: Date): string {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  private getMonthKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
  }
}