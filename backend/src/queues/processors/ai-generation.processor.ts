import { Injectable, Logger, Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentGeneratorPort } from '../../core/ports/content-generator.port';
import { RetryStrategyPort } from '../../core/ports/retry-strategy.port';
import { GenerationJob, JobStatus } from '../../entities/generation-job.entity';
import { RetryAttempt, RetryReason } from '../../entities/retry-attempt.entity';

/**
 * AI Generation Job Processor
 * 
 * SOLID Principles Applied:
 * - Single Responsibility: Handles only AI generation job processing
 * - Open/Closed: Extensible for new generation types without modification
 * - Liskov Substitution: Can be substituted with other processors
 * - Interface Segregation: Depends only on required interfaces
 * - Dependency Inversion: Depends on ports, not concrete implementations
 */

interface AIGenerationJobData {
  userId: string;
  productName: string;
  niche: string;
  targetAudience: string;
  userStyle?: any;
  platform?: string;
  tone?: string;
  length?: 'short' | 'medium' | 'long';
  retryAttempt?: number;
  originalJobId?: string;
  failedProvider?: string;
}

@Injectable()
export class AIGenerationProcessor {
  private readonly logger = new Logger(AIGenerationProcessor.name);

  constructor(
    @InjectRepository(GenerationJob)
    private jobRepository: Repository<GenerationJob>,
    @InjectRepository(RetryAttempt)
    private retryAttemptRepository: Repository<RetryAttempt>,
    @Inject('ContentGeneratorPort')
    private contentGenerator: ContentGeneratorPort,
    @Inject('RetryStrategyPort')
    private retryStrategy: RetryStrategyPort,
  ) {}

  /**
   * Process AI generation job
   * This is the main entry point called by BullMQ worker
   */
  async process(job: Job<AIGenerationJobData>): Promise<any> {
    const startTime = Date.now();
    const jobData = job.data;
    
    this.logger.log(`Processing AI generation job ${job.id} for user ${jobData.userId}`);

    try {
      // Determine provider to use (considers circuit breakers and retries)
      const selectedProvider = await this.selectProvider(jobData);
      
      if (!selectedProvider) {
        throw new Error('No available AI providers for generation');
      }

      // Generate content
      const result = await this.generateContent(jobData, selectedProvider);
      const processingTime = Date.now() - startTime;

      // Record success
      await this.recordSuccess(job.id as string, selectedProvider, result, processingTime);

      this.logger.log(`AI generation job ${job.id} completed in ${processingTime}ms`);
      
      return {
        success: true,
        result,
        metadata: {
          processingTime,
          provider: selectedProvider,
          jobId: job.id,
        }
      };

    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      
      this.logger.error(`AI generation job ${job.id} failed after ${processingTime}ms:`, error);
      
      // Record failure and handle potential retry
      await this.handleFailure(job, error, processingTime);
      
      // Re-throw error to let BullMQ handle retry logic
      throw error;
    }
  }

  // Private methods following single responsibility principle
  
  private async selectProvider(jobData: AIGenerationJobData): Promise<string | null> {
    try {
      // If this is a retry, get the next provider using retry strategy
      if (jobData.retryAttempt && jobData.failedProvider) {
        return await this.retryStrategy.getNextProvider(
          {
            jobId: jobData.originalJobId || 'unknown',
            jobType: 'ai-generation',
            originalData: jobData,
            attempts: [], // Would be populated from database in real implementation
            maxAttempts: 3,
            lastError: `Previous provider ${jobData.failedProvider} failed`,
          },
          jobData.failedProvider
        );
      }

      // For new jobs, select first available provider (not circuit-broken)
      const availableProviders = ['gemini', 'groq', 'openai'];
      for (const providerId of availableProviders) {
        const isCircuitOpen = await this.retryStrategy.isCircuitBreakerOpen(providerId);
        if (!isCircuitOpen) {
          return providerId;
        }
      }

      return null; // No providers available
    } catch (error) {
      this.logger.error('Error selecting provider:', error);
      return 'gemini'; // Fallback to default
    }
  }

  private async generateContent(jobData: AIGenerationJobData, providerId: string): Promise<any> {
    // Use the content generator port (which delegates to provider orchestrator)
    return await this.contentGenerator.generateUGCContent({
      productName: jobData.productName,
      niche: jobData.niche,
      targetAudience: jobData.targetAudience,
      userStyle: jobData.userStyle,
      platform: jobData.platform,
      tone: jobData.tone,
      length: jobData.length,
    });
  }

  private async recordSuccess(
    jobId: string,
    providerId: string,
    result: any,
    processingTime: number
  ): Promise<void> {
    // Update job record
    await this.jobRepository.update(
      { bull_job_id: jobId },
      {
        status: JobStatus.COMPLETED,
        processing_time_ms: processingTime,
        processing_metadata: {
          ai_provider_used: providerId,
          processing_time_ms: processingTime,
          completed_at: new Date().toISOString(),
        }
      }
    );

    // Record success for retry strategy (circuit breaker management)
    await this.retryStrategy.recordSuccess(providerId);
  }

  private async handleFailure(
    job: Job<AIGenerationJobData>,
    error: Error,
    processingTime: number
  ): Promise<void> {
    const jobData = job.data;
    const providerId = jobData.failedProvider || await this.selectProvider(jobData) || 'unknown';

    // Update job record
    await this.jobRepository.update(
      { bull_job_id: job.id as string },
      {
        status: JobStatus.FAILED,
        last_error: error.message,
        processing_time_ms: processingTime,
        attempt_count: (job.attemptsMade || 0) + 1,
        processing_metadata: {
          ai_provider_used: providerId,
          processing_time_ms: processingTime,
          last_error: error.message,
        }
      }
    );

    // Record failure for retry strategy (circuit breaker management)
    await this.retryStrategy.recordFailure(providerId, error.message);

    // Record retry attempt for analytics
    await this.recordRetryAttempt(
      job.id as string,
      (job.attemptsMade || 0) + 1,
      providerId,
      this.categorizeError(error.message),
      error.message
    );
  }

  private async recordRetryAttempt(
    jobId: string,
    attemptNumber: number,
    providerId: string,
    retryReason: RetryReason,
    errorMessage: string
  ): Promise<void> {
    try {
      const retryAttempt = this.retryAttemptRepository.create({
        job_id: jobId,
        attempt_number: attemptNumber,
        provider_id: providerId,
        retry_reason: retryReason,
        error_message: errorMessage,
        delay_before_retry_ms: this.calculateRetryDelay(attemptNumber),
        was_successful: false,
      });

      await this.retryAttemptRepository.save(retryAttempt);
    } catch (error) {
      this.logger.error(`Failed to record retry attempt for job ${jobId}:`, error);
    }
  }

  private categorizeError(errorMessage: string): RetryReason {
    const message = errorMessage.toLowerCase();
    
    if (message.includes('timeout')) return RetryReason.TIMEOUT;
    if (message.includes('rate limit')) return RetryReason.RATE_LIMIT;
    if (message.includes('network')) return RetryReason.NETWORK_ERROR;
    if (message.includes('validation')) return RetryReason.VALIDATION_ERROR;
    if (message.includes('circuit')) return RetryReason.CIRCUIT_BREAKER_OPEN;
    
    return RetryReason.PROVIDER_ERROR;
  }

  private calculateRetryDelay(attemptNumber: number): number {
    // Exponential backoff: 2s, 4s, 8s, 16s, capped at 30s
    return Math.min(2000 * Math.pow(2, attemptNumber - 1), 30000);
  }
}