import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ContentGenerationRequest,
  ContentGenerationResponse,
  ContentGeneratorPort,
  GenerationMetrics,
} from '../core/ports/content-generator.port';
import { GeminiAdapter } from '../infrastructure/adapters/gemini.adapter';
import { GroqAdapter } from '../infrastructure/adapters/groq.adapter';
import { OpenAIAdapter } from '../infrastructure/adapters/openai.adapter';

export interface ProviderConfig {
  id: string;
  priority: number; // 1 = highest priority
  enabled: boolean;
  adapter: ContentGeneratorPort;
}

@Injectable()
export class ProviderOrchestratorService implements ContentGeneratorPort {
  private readonly logger = new Logger(ProviderOrchestratorService.name);
  private providers: Map<string, ProviderConfig> = new Map();
  private lastMetrics: GenerationMetrics | null = null;

  constructor(
    private configService: ConfigService,
    private geminiAdapter: GeminiAdapter,
    private groqAdapter: GroqAdapter,
    private openaiAdapter: OpenAIAdapter,
  ) {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Simple provider setup - cost-optimized by default
    this.providers.set('gemini', {
      id: 'gemini',
      priority: 1, // Primary - most cost-effective
      enabled: this.configService.get<boolean>('GEMINI_ENABLED', true),
      adapter: this.geminiAdapter,
    });

    this.providers.set('groq', {
      id: 'groq',
      priority: 2, // Secondary - speed backup
      enabled: this.configService.get<boolean>('GROQ_ENABLED', true),
      adapter: this.groqAdapter,
    });

    this.providers.set('openai', {
      id: 'openai',
      priority: 3, // Tertiary - premium fallback
      enabled: this.configService.get<boolean>('OPENAI_ENABLED', true),
      adapter: this.openaiAdapter,
    });

    this.logger.log(`Initialized ${this.providers.size} AI providers`);
  }

  getProviderId(): string {
    return 'orchestrator';
  }

  async generateUGCContent(request: ContentGenerationRequest): Promise<ContentGenerationResponse> {
    try {
      const provider = await this.selectProvider();
      if (!provider) {
        throw new Error('No available AI providers');
      }

      this.logger.log(`Using ${provider.id} provider`);
      
      const result = await provider.adapter.generateUGCContent(request);
      
      // Record metrics
      const metrics = provider.adapter.getLastGenerationMetrics();
      this.lastMetrics = metrics;
      
      return result;

    } catch (error) {
      this.logger.error('Primary provider failed, attempting fallback:', error);
      return this.generateWithFallback(request);
    }
  }

  async generateUGCVariations(request: ContentGenerationRequest, count: number): Promise<ContentGenerationResponse[]> {
    const variations: ContentGenerationResponse[] = [];
    
    // Use the fastest provider for generating multiple variations
    const provider = await this.selectProvider();
    if (!provider) {
      throw new Error('No available AI providers for variations');
    }

    try {
      const result = await provider.adapter.generateUGCVariations(request, count);
      variations.push(...result);
    } catch (error) {
      this.logger.warn(`Variation generation failed with ${provider.id}, trying fallback`);
      
      // Simple fallback - generate variations one by one
      for (let i = 0; i < count && variations.length < count; i++) {
        try {
          const fallbackProvider = await this.selectProvider();
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
    // Simple validation - use first available provider
    const provider = await this.selectProvider();
    
    if (provider) {
      try {
        return await provider.adapter.validateContent(content, context);
      } catch (error) {
        this.logger.warn('Content validation failed, using fallback');
      }
    }
    
    // Basic fallback validation
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

  private async selectProvider(): Promise<ProviderConfig | null> {
    const availableProviders = Array.from(this.providers.values())
      .filter(provider => provider.enabled)
      .sort((a, b) => a.priority - b.priority);

    return availableProviders[0] || null;
  }

  private async generateWithFallback(request: ContentGenerationRequest): Promise<ContentGenerationResponse> {
    const availableProviders = Array.from(this.providers.values())
      .filter(provider => provider.enabled)
      .sort((a, b) => a.priority - b.priority);

    for (const provider of availableProviders) {
      try {
        this.logger.log(`Attempting fallback with ${provider.id} provider`);
        const result = await provider.adapter.generateUGCContent(request);
        return result;
      } catch (error: any) {
        this.logger.warn(`Fallback provider ${provider.id} failed:`, error);
      }
    }

    throw new Error('All AI providers failed');
  }
}