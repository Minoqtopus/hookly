export interface GenerationConfig {
  maxRetries: number;
  retryDelay: number; // milliseconds
  timeout: number; // milliseconds
  maxTokens: number;
  temperature: number;
  qualityThreshold: number;
}

export interface RetryStrategy {
  attempt: number;
  delay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export interface QualityValidation {
  uniqueness: number; // 0-100
  relevance: number; // 0-100
  coherence: number; // 0-100
  creativity: number; // 0-100
  overallScore: number; // 0-100
  passesThreshold: boolean;
}

export class GenerationPolicy {
  private readonly DEFAULT_CONFIG: GenerationConfig = {
    maxRetries: 3,
    retryDelay: 1000, // 1 second
    timeout: 30000, // 30 seconds
    maxTokens: 1000,
    temperature: 0.7,
    qualityThreshold: 75,
  };

  private readonly RETRY_STRATEGY: RetryStrategy = {
    attempt: 0,
    delay: 1000,
    maxDelay: 30000, // 30 seconds
    backoffMultiplier: 2,
  };

  /**
   * Get generation configuration
   */
  getGenerationConfig(): GenerationConfig {
    return { ...this.DEFAULT_CONFIG };
  }

  /**
   * Calculate retry delay using exponential backoff
   */
  calculateRetryDelay(attempt: number): number {
    const delay = this.RETRY_STRATEGY.delay * Math.pow(this.RETRY_STRATEGY.backoffMultiplier, attempt);
    return Math.min(delay, this.RETRY_STRATEGY.maxDelay);
  }

  /**
   * Check if retry should be attempted
   */
  shouldRetry(attempt: number, error?: Error): boolean {
    if (attempt >= this.DEFAULT_CONFIG.maxRetries) {
      return false;
    }

    // Don't retry on certain types of errors
    if (error) {
      const nonRetryableErrors = [
        'INVALID_REQUEST',
        'AUTHENTICATION_ERROR',
        'PERMISSION_DENIED',
        'QUOTA_EXCEEDED',
      ];

      if (nonRetryableErrors.some(errType => error.message.includes(errType))) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validate content quality based on policy thresholds
   */
  validateContentQuality(content: string, context: any): QualityValidation {
    const uniqueness = this.calculateUniqueness(content);
    const relevance = this.calculateRelevance(content, context);
    const coherence = this.calculateCoherence(content);
    const creativity = this.calculateCreativity(content);

    const overallScore = Math.round((uniqueness + relevance + coherence + creativity) / 4);
    const passesThreshold = overallScore >= this.DEFAULT_CONFIG.qualityThreshold;

    return {
      uniqueness,
      relevance,
      coherence,
      creativity,
      overallScore,
      passesThreshold,
    };
  }

  /**
   * Calculate content uniqueness score
   */
  private calculateUniqueness(content: string): number {
    // Simple heuristic: check for repetitive patterns
    const words = content.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    const repetitionRatio = uniqueWords.size / words.length;
    
    // Convert to 0-100 scale
    return Math.round(repetitionRatio * 100);
  }

  /**
   * Calculate content relevance score
   */
  private calculateRelevance(content: string, context: any): number {
    // Check if content mentions context elements
    const contextKeywords = [
      context.productName?.toLowerCase(),
      context.niche?.toLowerCase(),
      context.targetAudience?.toLowerCase(),
    ].filter(Boolean);

    if (contextKeywords.length === 0) return 50;

    const contentLower = content.toLowerCase();
    const matches = contextKeywords.filter(keyword => 
      contentLower.includes(keyword)
    ).length;

    return Math.round((matches / contextKeywords.length) * 100);
  }

  /**
   * Calculate content coherence score
   */
  private calculateCoherence(content: string): number {
    // Simple heuristic: check sentence structure and flow
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) return 50;

    // Check if sentences have reasonable length and structure
    const validSentences = sentences.filter(sentence => {
      const words = sentence.trim().split(/\s+/);
      return words.length >= 3 && words.length <= 25;
    });

    return Math.round((validSentences.length / sentences.length) * 100);
  }

  /**
   * Calculate content creativity score
   */
  private calculateCreativity(content: string): number {
    // Simple heuristic: check for creative language patterns
    const creativePatterns = [
      /[!]{2,}/g, // Multiple exclamation marks
      /[?]{2,}/g, // Multiple question marks
      /\b(wow|amazing|incredible|fantastic|brilliant)\b/gi, // Creative adjectives
      /\b(imagine|picture|visualize)\b/gi, // Creative verbs
    ];

    let creativityScore = 50; // Base score

    creativePatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        creativityScore += Math.min(matches.length * 10, 30); // Cap at +30
      }
    });

    return Math.min(creativityScore, 100);
  }

  /**
   * Get timeout configuration for different operation types
   */
  getTimeoutConfig(operationType: 'generation' | 'validation' | 'processing'): number {
    const timeouts = {
      generation: 30000, // 30 seconds
      validation: 10000, // 10 seconds
      processing: 15000, // 15 seconds
    };

    return timeouts[operationType] || this.DEFAULT_CONFIG.timeout;
  }

  /**
   * Get quality threshold for different content types
   */
  getQualityThreshold(contentType: 'hook' | 'script' | 'description' | 'caption'): number {
    const thresholds = {
      hook: 80, // Hooks need to be high quality
      script: 75, // Scripts should be good quality
      description: 70, // Descriptions can be slightly lower
      caption: 65, // Captions can be more flexible
    };

    return thresholds[contentType] || this.DEFAULT_CONFIG.qualityThreshold;
  }

  /**
   * Validate generation request parameters
   */
  validateGenerationRequest(request: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.productName || request.productName.trim().length === 0) {
      errors.push('Product name is required');
    }

    if (!request.niche || request.niche.trim().length === 0) {
      errors.push('Niche is required');
    }

    if (!request.targetAudience || request.targetAudience.trim().length === 0) {
      errors.push('Target audience is required');
    }

    if (request.productName && request.productName.length > 100) {
      errors.push('Product name must be less than 100 characters');
    }

    if (request.niche && request.niche.length > 50) {
      errors.push('Niche must be less than 50 characters');
    }

    if (request.targetAudience && request.targetAudience.length > 200) {
      errors.push('Target audience must be less than 200 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
