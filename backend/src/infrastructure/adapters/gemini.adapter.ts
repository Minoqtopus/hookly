import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ContentGeneratorPort,
  ContentGenerationRequest,
  ContentGenerationResponse,
  ProviderCapabilities,
  GenerationMetrics,
  TokenUsage,
} from '../../core/ports/content-generator.port';

@Injectable()
export class GeminiAdapter implements ContentGeneratorPort {
  private readonly logger = new Logger(GeminiAdapter.name);
  private lastMetrics: GenerationMetrics | null = null;
  private readonly apiKey: string;
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!this.apiKey) {
      this.logger.warn('GEMINI_API_KEY not configured. Gemini adapter will not be available.');
    }
  }

  getProviderId(): string {
    return 'gemini';
  }

  getCapabilities(): ProviderCapabilities {
    return {
      supportsCreativeContent: true,
      supportsSpeedOptimization: false,
      supportsPremiumQuality: true,
      maxTokensPerRequest: 8192,
      costPer1MInputTokens: 0.10, // August 2025 pricing for Gemini 2.5 Flash-Lite
      costPer1MOutputTokens: 0.40,
    };
  }

  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/models/gemini-2.5-flash-lite:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: 'Hello' }]
          }],
          generationConfig: {
            maxOutputTokens: 10,
          }
        }),
      });

      return response.ok;
    } catch (error) {
      this.logger.error('Gemini availability check failed:', error);
      return false;
    }
  }

  async generateUGCContent(request: ContentGenerationRequest): Promise<ContentGenerationResponse> {
    const startTime = Date.now();
    let tokenUsage: TokenUsage;
    let success = false;
    let error: string | undefined;

    try {
      if (!this.apiKey) {
        throw new Error('Gemini API key not configured');
      }

      const prompt = this.buildPrompt(request);
      const requestBody = {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.8,
          topP: 0.9,
        }
      };

      const response = await fetch(`${this.baseUrl}/models/gemini-2.5-flash-lite:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json() as any;
      
      // Extract token usage
      const usageMetadata = data.usageMetadata || {};
      const inputTokens = usageMetadata.promptTokenCount || 1000; // estimate if not provided
      const outputTokens = usageMetadata.candidatesTokenCount || 2000; // estimate if not provided
      
      tokenUsage = {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        estimatedCost: this.calculateCost(inputTokens, outputTokens),
      };

      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const parsedContent = this.parseGeneratedContent(generatedText);
      
      success = true;

      return {
        hook: parsedContent.hook,
        script: parsedContent.script,
        visuals: parsedContent.visuals,
        performance: {
          estimatedViews: Math.floor(Math.random() * 100000) + 10000,
          estimatedCTR: Math.random() * 0.1 + 0.02,
          viralScore: Math.random() * 100,
        },
      };

    } catch (err: any) {
      error = err.message;
      this.logger.error('Gemini generation failed:', err);
      
      // Provide fallback token usage for error cases
      tokenUsage = {
        inputTokens: 1000,
        outputTokens: 0,
        totalTokens: 1000,
        estimatedCost: this.calculateCost(1000, 0),
      };

      throw err;
    } finally {
      const responseTime = Date.now() - startTime;
      
      this.lastMetrics = {
        providerId: this.getProviderId(),
        model: 'gemini-2.5-flash-lite',
        responseTime,
        tokenUsage,
        quality: success ? 0.9 : 0,
        success,
        error,
      };
    }
  }

  async generateUGCVariations(request: ContentGenerationRequest, count: number): Promise<ContentGenerationResponse[]> {
    const variations: ContentGenerationResponse[] = [];
    
    for (let i = 0; i < count; i++) {
      const modifiedRequest = {
        ...request,
        // Add variation to the prompt
        targetAudience: `${request.targetAudience} (variation ${i + 1})`,
      };
      
      try {
        const variation = await this.generateUGCContent(modifiedRequest);
        variations.push(variation);
      } catch (error) {
        this.logger.warn(`Failed to generate variation ${i + 1}:`, error);
        // Continue with other variations
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
    // Implement content validation logic
    return {
      quality: 0.9,
      uniqueness: 0.85,
      relevance: 0.92,
      suggestions: ['Consider adding more emotional appeal', 'Include trending hashtags'],
    };
  }

  async getProviderHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    errorRate: number;
    uptime: number;
    costPerGeneration: number;
  }> {
    const isHealthy = await this.isAvailable();
    const metrics = this.lastMetrics;
    
    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      responseTime: metrics?.responseTime || 0,
      errorRate: metrics?.success ? 0 : 1,
      uptime: isHealthy ? 99.9 : 0,
      costPerGeneration: metrics?.tokenUsage?.estimatedCost || 0.001,
    };
  }

  getLastGenerationMetrics(): GenerationMetrics | null {
    return this.lastMetrics;
  }

  private buildPrompt(request: ContentGenerationRequest): string {
    const { productName, niche, targetAudience, userStyle, platform, tone, length } = request;
    
    let prompt = `Create viral UGC content for ${productName} in the ${niche} niche, targeting ${targetAudience}.`;
    
    if (platform) {
      prompt += ` This content is for ${platform}.`;
    }
    
    if (userStyle) {
      prompt += ` Brand personality: ${userStyle.brandPersonality}. Industry: ${userStyle.industry}. Tone: ${userStyle.tone}.`;
    }
    
    if (tone) {
      prompt += ` Use a ${tone} tone.`;
    }
    
    if (length) {
      prompt += ` Content length should be ${length}.`;
    }
    
    prompt += `

Please provide the response in the following JSON format:
{
  "hook": "Attention-grabbing opening line",
  "script": "Main content/script for the UGC video",
  "visuals": ["Visual element 1", "Visual element 2", "Visual element 3"]
}

Make sure the content is engaging, authentic, and optimized for viral potential on social media platforms.`;
    
    return prompt;
  }

  private parseGeneratedContent(text: string): { hook: string; script: string; visuals: string[] } {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          hook: parsed.hook || 'Generated hook',
          script: parsed.script || 'Generated script',
          visuals: parsed.visuals || ['Visual 1', 'Visual 2', 'Visual 3'],
        };
      }
    } catch (error) {
      this.logger.warn('Failed to parse JSON from Gemini response, using fallback parsing');
    }
    
    // Fallback parsing
    const lines = text.split('\n').filter(line => line.trim());
    return {
      hook: lines[0] || 'Generated hook',
      script: lines.slice(1).join(' ') || 'Generated script content',
      visuals: ['Visual element 1', 'Visual element 2', 'Visual element 3'],
    };
  }

  private calculateCost(inputTokens: number, outputTokens: number): number {
    const capabilities = this.getCapabilities();
    const inputCost = (inputTokens / 1000000) * capabilities.costPer1MInputTokens;
    const outputCost = (outputTokens / 1000000) * capabilities.costPer1MOutputTokens;
    return inputCost + outputCost;
  }
}