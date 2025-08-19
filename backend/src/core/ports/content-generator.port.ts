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
}
