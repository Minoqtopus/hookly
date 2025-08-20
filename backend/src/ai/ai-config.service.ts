import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AIStrategyConfig {
  version: string;
  name: string;
  description: string;
  providers: {
    gemini: {
      enabled: boolean;
      priority: number;
      maxCostPerGeneration: number;
    };
    groq: {
      enabled: boolean;
      priority: number;
      maxCostPerGeneration: number;
    };
    openai: {
      enabled: boolean;
      priority: number;
      maxCostPerGeneration: number;
    };
  };
  tokenLimits: {
    inputTokensPerGeneration: number;
    outputTokensPerGeneration: number;
    totalTokensPerGeneration: number;
  };
  budgetLimits: {
    dailyBudget: number;
    monthlyBudget: number;
    perGenerationMax: number;
    alertThresholds: {
      daily: number; // percentage
      monthly: number; // percentage
    };
  };
}

@Injectable()
export class AIConfigService {
  private readonly logger = new Logger(AIConfigService.name);
  private currentStrategy: AIStrategyConfig;

  constructor(private configService: ConfigService) {
    this.currentStrategy = this.loadStrategy();
    this.logger.log(`AI Strategy loaded: ${this.currentStrategy.name} (${this.currentStrategy.version})`);
  }

  /**
   * Get current AI strategy configuration
   */
  getCurrentStrategy(): AIStrategyConfig {
    return this.currentStrategy;
  }

  /**
   * Get strategy version
   */
  getStrategyVersion(): string {
    return this.currentStrategy.version;
  }

  /**
   * Check if a provider is enabled
   */
  isProviderEnabled(providerId: 'gemini' | 'groq' | 'openai'): boolean {
    return this.currentStrategy.providers[providerId]?.enabled || false;
  }

  /**
   * Get provider priority (lower number = higher priority)
   */
  getProviderPriority(providerId: 'gemini' | 'groq' | 'openai'): number {
    return this.currentStrategy.providers[providerId]?.priority || 999;
  }

  /**
   * Get max cost per generation for a provider
   */
  getProviderMaxCost(providerId: 'gemini' | 'groq' | 'openai'): number {
    return this.currentStrategy.providers[providerId]?.maxCostPerGeneration || 0.005;
  }

  /**
   * Get token limits
   */
  getTokenLimits() {
    return this.currentStrategy.tokenLimits;
  }

  /**
   * Get budget limits
   */
  getBudgetLimits() {
    return this.currentStrategy.budgetLimits;
  }

  /**
   * Reload strategy from environment (hot reload)
   */
  reloadStrategy(): void {
    this.currentStrategy = this.loadStrategy();
    this.logger.log(`AI Strategy reloaded: ${this.currentStrategy.name} (${this.currentStrategy.version})`);
  }

  /**
   * Validate current configuration
   */
  validateConfiguration(): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if at least one provider is enabled
    const enabledProviders = Object.values(this.currentStrategy.providers).filter(p => p.enabled);
    if (enabledProviders.length === 0) {
      errors.push('No AI providers are enabled');
    }

    // Check for API keys
    if (this.currentStrategy.providers.gemini.enabled && !this.configService.get('GEMINI_API_KEY')) {
      errors.push('Gemini is enabled but GEMINI_API_KEY is not configured');
    }
    if (this.currentStrategy.providers.groq.enabled && !this.configService.get('GROQ_API_KEY')) {
      errors.push('Groq is enabled but GROQ_API_KEY is not configured');
    }
    if (this.currentStrategy.providers.openai.enabled && !this.configService.get('OPENAI_API_KEY')) {
      errors.push('OpenAI is enabled but OPENAI_API_KEY is not configured');
    }

    // Check budget configuration
    if (this.currentStrategy.budgetLimits.dailyBudget <= 0) {
      warnings.push('Daily budget is not set or is zero');
    }
    if (this.currentStrategy.budgetLimits.monthlyBudget <= 0) {
      warnings.push('Monthly budget is not set or is zero');
    }

    // Check token limits
    if (this.currentStrategy.tokenLimits.totalTokensPerGeneration > 8192) {
      warnings.push('Total tokens per generation exceeds typical model limits');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private loadStrategy(): AIStrategyConfig {
    const strategyVersion = this.configService.get<string>('AI_STRATEGY_VERSION', 'v1-cost-optimized');
    
    switch (strategyVersion) {
      case 'v1-cost-optimized':
        return this.getCostOptimizedStrategy();
      case 'v2-quality-first':
        return this.getQualityFirstStrategy();
      case 'v3-speed-optimized':
        return this.getSpeedOptimizedStrategy();
      case 'v4-balanced':
        return this.getBalancedStrategy();
      default:
        this.logger.warn(`Unknown strategy version: ${strategyVersion}, using v1-cost-optimized`);
        return this.getCostOptimizedStrategy();
    }
  }

  private getCostOptimizedStrategy(): AIStrategyConfig {
    return {
      version: 'v1-cost-optimized',
      name: 'Cost Optimized Strategy',
      description: 'Prioritizes cost efficiency while maintaining quality. Gemini primary, Groq backup, OpenAI premium fallback.',
      providers: {
        gemini: {
          enabled: this.configService.get<boolean>('GEMINI_ENABLED', true),
          priority: 1, // Primary
          maxCostPerGeneration: 0.002,
        },
        groq: {
          enabled: this.configService.get<boolean>('GROQ_ENABLED', true),
          priority: 2, // Secondary
          maxCostPerGeneration: 0.0015,
        },
        openai: {
          enabled: this.configService.get<boolean>('OPENAI_ENABLED', true),
          priority: 3, // Tertiary
          maxCostPerGeneration: 0.005,
        },
      },
      tokenLimits: {
        inputTokensPerGeneration: this.configService.get<number>('AI_INPUT_TOKENS_PER_GENERATION', 1000),
        outputTokensPerGeneration: this.configService.get<number>('AI_OUTPUT_TOKENS_PER_GENERATION', 2000),
        totalTokensPerGeneration: this.configService.get<number>('AI_TOTAL_TOKENS_PER_GENERATION', 3000),
      },
      budgetLimits: {
        dailyBudget: this.configService.get<number>('AI_DAILY_BUDGET', 50.0),
        monthlyBudget: this.configService.get<number>('AI_MONTHLY_BUDGET', 500.0),
        perGenerationMax: this.configService.get<number>('AI_MAX_COST_PER_GENERATION', 0.005),
        alertThresholds: {
          daily: this.configService.get<number>('AI_DAILY_ALERT_THRESHOLD', 80), // 80%
          monthly: this.configService.get<number>('AI_MONTHLY_ALERT_THRESHOLD', 85), // 85%
        },
      },
    };
  }

  private getQualityFirstStrategy(): AIStrategyConfig {
    return {
      version: 'v2-quality-first',
      name: 'Quality First Strategy',
      description: 'Prioritizes highest quality output. OpenAI primary, Gemini backup, Groq speed fallback.',
      providers: {
        openai: {
          enabled: this.configService.get<boolean>('OPENAI_ENABLED', true),
          priority: 1, // Primary
          maxCostPerGeneration: 0.01,
        },
        gemini: {
          enabled: this.configService.get<boolean>('GEMINI_ENABLED', true),
          priority: 2, // Secondary
          maxCostPerGeneration: 0.005,
        },
        groq: {
          enabled: this.configService.get<boolean>('GROQ_ENABLED', true),
          priority: 3, // Tertiary
          maxCostPerGeneration: 0.003,
        },
      },
      tokenLimits: {
        inputTokensPerGeneration: 1500,
        outputTokensPerGeneration: 3000,
        totalTokensPerGeneration: 4500,
      },
      budgetLimits: {
        dailyBudget: 100.0,
        monthlyBudget: 1000.0,
        perGenerationMax: 0.01,
        alertThresholds: {
          daily: 75,
          monthly: 80,
        },
      },
    };
  }

  private getSpeedOptimizedStrategy(): AIStrategyConfig {
    return {
      version: 'v3-speed-optimized',
      name: 'Speed Optimized Strategy',
      description: 'Prioritizes fast response times. Groq primary, Gemini backup, OpenAI quality fallback.',
      providers: {
        groq: {
          enabled: this.configService.get<boolean>('GROQ_ENABLED', true),
          priority: 1, // Primary
          maxCostPerGeneration: 0.002,
        },
        gemini: {
          enabled: this.configService.get<boolean>('GEMINI_ENABLED', true),
          priority: 2, // Secondary
          maxCostPerGeneration: 0.003,
        },
        openai: {
          enabled: this.configService.get<boolean>('OPENAI_ENABLED', true),
          priority: 3, // Tertiary
          maxCostPerGeneration: 0.008,
        },
      },
      tokenLimits: {
        inputTokensPerGeneration: 800,
        outputTokensPerGeneration: 1600,
        totalTokensPerGeneration: 2400,
      },
      budgetLimits: {
        dailyBudget: 30.0,
        monthlyBudget: 300.0,
        perGenerationMax: 0.003,
        alertThresholds: {
          daily: 85,
          monthly: 90,
        },
      },
    };
  }

  private getBalancedStrategy(): AIStrategyConfig {
    return {
      version: 'v4-balanced',
      name: 'Balanced Strategy',
      description: 'Balances cost, quality, and speed. Smart routing based on request type.',
      providers: {
        gemini: {
          enabled: this.configService.get<boolean>('GEMINI_ENABLED', true),
          priority: 1, // Primary for creative
          maxCostPerGeneration: 0.003,
        },
        openai: {
          enabled: this.configService.get<boolean>('OPENAI_ENABLED', true),
          priority: 1, // Primary for premium
          maxCostPerGeneration: 0.008,
        },
        groq: {
          enabled: this.configService.get<boolean>('GROQ_ENABLED', true),
          priority: 1, // Primary for speed
          maxCostPerGeneration: 0.002,
        },
      },
      tokenLimits: {
        inputTokensPerGeneration: 1200,
        outputTokensPerGeneration: 2400,
        totalTokensPerGeneration: 3600,
      },
      budgetLimits: {
        dailyBudget: 75.0,
        monthlyBudget: 750.0,
        perGenerationMax: 0.008,
        alertThresholds: {
          daily: 80,
          monthly: 85,
        },
      },
    };
  }
}