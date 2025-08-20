export interface ContentGenerationRequest {
  productName: string;
  niche: string;
  targetAudience: string;
  userStyle?: UserStyle;
  platform?: string;
  tone?: string;
  length?: 'short' | 'medium' | 'long';
}

export interface UserStyle {
  brandPersonality?: string;
  industry?: string;
  targetAudience?: string;
  tone?: string;
  vocabulary?: string;
  sentenceLength?: 'short' | 'medium' | 'long';
}

export interface ContentGenerationResponse {
  hook: string;
  script: string;
  visuals: string[];
  performance?: {
    estimatedViews: number;
    estimatedCTR: number;
    viralScore: number;
  };
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

export interface GenerationMetrics {
  providerId: string;
  model: string;
  responseTime: number;
  tokenUsage: TokenUsage;
  quality: number;
  success: boolean;
  error?: string;
}

export interface ProviderCapabilities {
  supportsCreativeContent: boolean;
  supportsSpeedOptimization: boolean;
  supportsPremiumQuality: boolean;
  maxTokensPerRequest: number;
  costPer1MInputTokens: number;
  costPer1MOutputTokens: number;
}

export interface ContentGeneratorPort {
  /**
   * Generate UGC content based on the request
   */
  generateUGCContent(request: ContentGenerationRequest): Promise<ContentGenerationResponse>;

  /**
   * Generate multiple variations of content
   */
  generateUGCVariations(request: ContentGenerationRequest, count: number): Promise<ContentGenerationResponse[]>;

  /**
   * Validate content quality and uniqueness
   */
  validateContent(content: string, context: ContentGenerationRequest): Promise<{
    quality: number;
    uniqueness: number;
    relevance: number;
    suggestions: string[];
  }>;

  /**
   * Get provider health and performance metrics
   */
  getProviderHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    errorRate: number;
    uptime: number;
    costPerGeneration: number;
  }>;

  /**
   * Get provider capabilities and pricing
   */
  getCapabilities(): ProviderCapabilities;

  /**
   * Get generation metrics for monitoring
   */
  getLastGenerationMetrics(): GenerationMetrics | null;

  /**
   * Provider identifier
   */
  getProviderId(): string;

  /**
   * Check if provider is available
   */
  isAvailable(): Promise<boolean>;
}
