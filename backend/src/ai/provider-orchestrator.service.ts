import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ContentGeneratorPort,
  ContentGenerationRequest,
  ContentGenerationResponse,
  GenerationMetrics,
} from '../core/ports/content-generator.port';
import { ProviderHealthPort } from '../core/ports/provider-health.port';
import { CostTrackingPort } from '../core/ports/cost-tracking.port';
import { GeminiAdapter } from '../infrastructure/adapters/gemini.adapter';
import { GroqAdapter } from '../infrastructure/adapters/groq.adapter';
import { OpenAIAdapter } from '../infrastructure/adapters/openai.adapter';

export interface ProviderConfig {
  id: string;
  priority: number; // 1 = highest priority
  enabled: boolean;
  maxCostPerGeneration?: number;
  adapter: ContentGeneratorPort;
}

export interface RoutingStrategy {
  requestType: 'creative' | 'speed' | 'premium' | 'auto';
  costBudget?: number;
  qualityThreshold?: number;
  speedRequirement?: 'fast' | 'normal' | 'best';
}

@Injectable()
export class ProviderOrchestratorService implements ContentGeneratorPort {
  private readonly logger = new Logger(ProviderOrchestratorService.name);
  private providers: Map<string, ProviderConfig> = new Map();
  private lastMetrics: GenerationMetrics | null = null;
  private circuitBreakers: Map<string, { failures: number; lastFailure: Date; isOpen: boolean }> = new Map();

  constructor(
    private configService: ConfigService,
    private geminiAdapter: GeminiAdapter,
    private groqAdapter: GroqAdapter,
    private openaiAdapter: OpenAIAdapter,
    private providerHealthPort?: ProviderHealthPort,
    private costTrackingPort?: CostTrackingPort,
  ) {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Initialize providers based on environment configuration
    const strategy = this.configService.get<string>('AI_STRATEGY_VERSION', 'v1-cost-optimized');
    
    if (strategy === 'v1-cost-optimized') {
      this.setupCostOptimizedStrategy();
    } else if (strategy === 'v2-quality-first') {
      this.setupQualityFirstStrategy();
    } else if (strategy === 'v3-speed-optimized') {
      this.setupSpeedOptimizedStrategy();
    } else {
      this.setupCostOptimizedStrategy(); // default
    }

    this.logger.log(`Initialized ${this.providers.size} AI providers with strategy: ${strategy}`);
  }

  private setupCostOptimizedStrategy(): void {
    this.providers.set('gemini', {
      id: 'gemini',
      priority: 1, // Primary - most cost-effective
      enabled: this.configService.get<boolean>('GEMINI_ENABLED', true),
      maxCostPerGeneration: 0.002,
      adapter: this.geminiAdapter,
    });

    this.providers.set('groq', {
      id: 'groq',
      priority: 2, // Secondary - speed backup
      enabled: this.configService.get<boolean>('GROQ_ENABLED', true),
      maxCostPerGeneration: 0.0015,
      adapter: this.groqAdapter,
    });

    this.providers.set('openai', {
      id: 'openai',
      priority: 3, // Tertiary - premium fallback
      enabled: this.configService.get<boolean>('OPENAI_ENABLED', true),
      maxCostPerGeneration: 0.005,
      adapter: this.openaiAdapter,
    });
  }

  private setupQualityFirstStrategy(): void {
    this.providers.set('openai', {
      id: 'openai',
      priority: 1, // Primary - highest quality
      enabled: this.configService.get<boolean>('OPENAI_ENABLED', true),
      adapter: this.openaiAdapter,
    });

    this.providers.set('gemini', {
      id: 'gemini',
      priority: 2, // Secondary - good quality, lower cost
      enabled: this.configService.get<boolean>('GEMINI_ENABLED', true),
      adapter: this.geminiAdapter,
    });

    this.providers.set('groq', {
      id: 'groq',
      priority: 3, // Tertiary - speed backup
      enabled: this.configService.get<boolean>('GROQ_ENABLED', true),
      adapter: this.groqAdapter,
    });
  }

  private setupSpeedOptimizedStrategy(): void {
    this.providers.set('groq', {
      id: 'groq',
      priority: 1, // Primary - fastest
      enabled: this.configService.get<boolean>('GROQ_ENABLED', true),
      adapter: this.groqAdapter,
    });

    this.providers.set('gemini', {
      id: 'gemini',
      priority: 2, // Secondary - good balance
      enabled: this.configService.get<boolean>('GEMINI_ENABLED', true),
      adapter: this.geminiAdapter,
    });

    this.providers.set('openai', {
      id: 'openai',
      priority: 3, // Tertiary - quality backup
      enabled: this.configService.get<boolean>('OPENAI_ENABLED', true),
      adapter: this.openaiAdapter,
    });
  }

  getProviderId(): string {
    return 'orchestrator';
  }

  async generateUGCContent(request: ContentGenerationRequest, strategy?: RoutingStrategy): Promise<ContentGenerationResponse> {
    const startTime = Date.now();
    const routingStrategy = strategy || { requestType: 'auto' };
    
    try {
      const provider = await this.selectOptimalProvider(routingStrategy, request);
      if (!provider) {
        throw new Error('No available AI providers');
      }

      this.logger.log(`Routing request to ${provider.id} provider`);
      
      // Pre-generation cost check
      if (this.costTrackingPort && provider.maxCostPerGeneration) {
        const wouldExceed = await this.costTrackingPort.wouldExceedBudget(provider.id, provider.maxCostPerGeneration);
        if (wouldExceed) {
          this.logger.warn(`Provider ${provider.id} would exceed budget, trying next provider`);
          return this.generateWithFallback(request, provider.id, routingStrategy);
        }
      }

      const result = await provider.adapter.generateUGCContent(request);
      
      // Record success
      await this.recordProviderSuccess(provider.id);
      
      // Track costs if available
      const metrics = provider.adapter.getLastGenerationMetrics();
      if (this.costTrackingPort && metrics?.tokenUsage) {
        await this.costTrackingPort.recordGenerationCost(
          provider.id,
          metrics.tokenUsage.inputTokens,
          metrics.tokenUsage.outputTokens,
          metrics.tokenUsage.estimatedCost,
        );
      }

      this.lastMetrics = metrics;
      return result;

    } catch (error) {
      this.logger.error('Primary provider failed, attempting fallback:', error);
      return this.generateWithFallback(request, null, routingStrategy);
    }
  }

  async generateUGCVariations(request: ContentGenerationRequest, count: number): Promise<ContentGenerationResponse[]> {
    const strategy: RoutingStrategy = { requestType: 'speed' }; // Use speed-optimized for variations
    const variations: ContentGenerationResponse[] = [];
    
    // Use the fastest provider for generating multiple variations
    const provider = await this.selectOptimalProvider(strategy, request);
    if (!provider) {
      throw new Error('No available AI providers for variations');
    }

    try {
      const result = await provider.adapter.generateUGCVariations(request, count);
      variations.push(...result);
    } catch (error) {
      this.logger.warn(`Variation generation failed with ${provider.id}, trying fallback`);
      
      // Fallback to generating variations one by one with different providers
      for (let i = 0; i < count && variations.length < count; i++) {
        try {
          const fallbackProvider = await this.selectOptimalProvider({ requestType: 'auto' }, request);
          if (fallbackProvider) {
            const variation = await fallbackProvider.adapter.generateUGCContent(request);
            variations.push(variation);
          }
        } catch (err) {
          this.logger.warn(`Failed to generate variation ${i + 1}:`, err);
        }
      }
    }
    
    return variations;
  }

  async validateContent(content: string, context: ContentGenerationRequest): Promise<{
    quality: number;
    uniqueness: number;
    relevance: number;
    suggestions: string[];
  }> {
    // Use the highest quality provider for validation
    const strategy: RoutingStrategy = { requestType: 'premium' };
    const provider = await this.selectOptimalProvider(strategy, context);
    
    if (provider) {
      try {
        return await provider.adapter.validateContent(content, context);
      } catch (error) {
        this.logger.warn('Content validation failed, using fallback');
      }
    }
    
    // Fallback validation
    return {
      quality: 0.85,
      uniqueness: 0.8,
      relevance: 0.87,
      suggestions: ['Consider A/B testing different approaches', 'Optimize for platform best practices'],
    };
  }

  async getProviderHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    errorRate: number;
    uptime: number;
    costPerGeneration: number;
  }> {
    const healthChecks = await Promise.allSettled(
      Array.from(this.providers.values()).map(provider => provider.adapter.getProviderHealth())
    );
    
    const healthyProviders = healthChecks.filter(result => 
      result.status === 'fulfilled' && result.value.status === 'healthy'
    ).length;
    
    const totalProviders = this.providers.size;
    const healthyRatio = healthyProviders / totalProviders;
    
    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (healthyRatio >= 0.8) status = 'healthy';
    else if (healthyRatio >= 0.5) status = 'degraded';
    else status = 'unhealthy';
    
    const avgResponseTime = this.lastMetrics?.responseTime || 0;
    const avgCost = this.lastMetrics?.tokenUsage?.estimatedCost || 0.001;
    
    return {
      status,
      responseTime: avgResponseTime,
      errorRate: healthyRatio < 1 ? (1 - healthyRatio) : 0,
      uptime: healthyRatio * 100,
      costPerGeneration: avgCost,
    };
  }

  getLastGenerationMetrics(): GenerationMetrics | null {
    return this.lastMetrics;
  }

  async isAvailable(): Promise<boolean> {
    const availabilityChecks = await Promise.allSettled(
      Array.from(this.providers.values())
        .filter(provider => provider.enabled)
        .map(provider => provider.adapter.isAvailable())
    );
    
    return availabilityChecks.some(result => result.status === 'fulfilled' && result.value === true);
  }

  getCapabilities() {
    // Return combined capabilities of all providers
    const allCapabilities = Array.from(this.providers.values()).map(p => p.adapter.getCapabilities());
    
    return {
      supportsCreativeContent: allCapabilities.some(c => c.supportsCreativeContent),
      supportsSpeedOptimization: allCapabilities.some(c => c.supportsSpeedOptimization),
      supportsPremiumQuality: allCapabilities.some(c => c.supportsPremiumQuality),
      maxTokensPerRequest: Math.max(...allCapabilities.map(c => c.maxTokensPerRequest)),
      costPer1MInputTokens: Math.min(...allCapabilities.map(c => c.costPer1MInputTokens)),
      costPer1MOutputTokens: Math.min(...allCapabilities.map(c => c.costPer1MOutputTokens)),
    };
  }

  private async selectOptimalProvider(strategy: RoutingStrategy, request: ContentGenerationRequest): Promise<ProviderConfig | null> {
    const availableProviders = Array.from(this.providers.values())
      .filter(provider => provider.enabled && !this.isCircuitBreakerOpen(provider.id))
      .sort((a, b) => a.priority - b.priority);

    if (availableProviders.length === 0) {
      return null;
    }

    // Strategy-based selection
    switch (strategy.requestType) {
      case 'creative':
        return this.selectCreativeProvider(availableProviders);
      case 'speed':
        return this.selectSpeedProvider(availableProviders);
      case 'premium':
        return this.selectPremiumProvider(availableProviders);
      case 'auto':
      default:
        return this.selectAutoProvider(availableProviders, strategy);
    }
  }

  private selectCreativeProvider(providers: ProviderConfig[]): ProviderConfig | null {
    // Prefer Gemini for creative content
    return providers.find(p => p.id === 'gemini') || providers[0] || null;
  }

  private selectSpeedProvider(providers: ProviderConfig[]): ProviderConfig | null {
    // Prefer Groq for speed
    return providers.find(p => p.id === 'groq') || providers[0] || null;
  }

  private selectPremiumProvider(providers: ProviderConfig[]): ProviderConfig | null {
    // Prefer OpenAI for premium quality
    return providers.find(p => p.id === 'openai') || providers[0] || null;
  }

  private async selectAutoProvider(providers: ProviderConfig[], strategy: RoutingStrategy): Promise<ProviderConfig | null> {
    // Auto selection based on current conditions
    if (strategy.costBudget && strategy.costBudget < 0.001) {
      // Very low budget - use cheapest
      return providers.find(p => p.id === 'groq') || providers[0] || null;
    }
    
    if (strategy.speedRequirement === 'fast') {
      return this.selectSpeedProvider(providers);
    }
    
    if (strategy.qualityThreshold && strategy.qualityThreshold > 0.9) {
      return this.selectPremiumProvider(providers);
    }
    
    // Default to cost-optimized priority
    return providers[0] || null;
  }

  private async generateWithFallback(
    request: ContentGenerationRequest, 
    excludeProviderId: string | null, 
    strategy: RoutingStrategy
  ): Promise<ContentGenerationResponse> {
    const availableProviders = Array.from(this.providers.values())
      .filter(provider => 
        provider.enabled && 
        provider.id !== excludeProviderId &&
        !this.isCircuitBreakerOpen(provider.id)
      )
      .sort((a, b) => a.priority - b.priority);

    for (const provider of availableProviders) {
      try {
        this.logger.log(`Attempting fallback with ${provider.id} provider`);
        const result = await provider.adapter.generateUGCContent(request);
        await this.recordProviderSuccess(provider.id);
        return result;
      } catch (error: any) {
        this.logger.warn(`Fallback provider ${provider.id} failed:`, error);
        await this.recordProviderFailure(provider.id, error.message);
      }
    }

    throw new Error('All AI providers failed');
  }

  private isCircuitBreakerOpen(providerId: string): boolean {
    const breaker = this.circuitBreakers.get(providerId);
    if (!breaker) return false;
    
    if (breaker.isOpen) {
      // Check if enough time has passed to attempt recovery
      const timeSinceFailure = Date.now() - breaker.lastFailure.getTime();
      const backoffTime = Math.min(30000, 1000 * Math.pow(2, breaker.failures)); // Exponential backoff, max 30s
      
      if (timeSinceFailure > backoffTime) {
        breaker.isOpen = false;
        this.logger.log(`Circuit breaker for ${providerId} reset after ${timeSinceFailure}ms`);
      }
    }
    
    return breaker.isOpen;
  }

  private async recordProviderSuccess(providerId: string): Promise<void> {
    // Reset circuit breaker on success
    this.circuitBreakers.delete(providerId);
    
    if (this.providerHealthPort) {
      const metrics = this.providers.get(providerId)?.adapter.getLastGenerationMetrics();
      if (metrics) {
        await this.providerHealthPort.recordSuccess(providerId, metrics.responseTime);
      }
    }
  }

  private async recordProviderFailure(providerId: string, error: string): Promise<void> {
    const breaker = this.circuitBreakers.get(providerId) || { failures: 0, lastFailure: new Date(), isOpen: false };
    
    breaker.failures++;
    breaker.lastFailure = new Date();
    
    // Open circuit breaker after 3 consecutive failures
    if (breaker.failures >= 3) {
      breaker.isOpen = true;
      this.logger.warn(`Circuit breaker opened for ${providerId} after ${breaker.failures} failures`);
    }
    
    this.circuitBreakers.set(providerId, breaker);
    
    if (this.providerHealthPort) {
      await this.providerHealthPort.recordFailure(providerId, error);
    }
  }
}