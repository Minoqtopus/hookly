import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { RetryStrategyPort, RetryContext, CircuitBreakerState } from '../core/ports/retry-strategy.port';
import { RetryAttempt, RetryReason } from '../entities/retry-attempt.entity';
import { ProviderHealth, ProviderStatus } from '../entities/provider-health.entity';
import { RedisService } from '../cache/redis.service';

@Injectable()
export class RetryService implements RetryStrategyPort {
  private readonly logger = new Logger(RetryService.name);
  
  // Circuit breaker configuration
  private readonly DEFAULT_FAILURE_THRESHOLD = 5;
  private readonly DEFAULT_RECOVERY_TIMEOUT_MS = 60000; // 1 minute
  private readonly HALF_OPEN_MAX_ATTEMPTS = 3;
  
  // Retry configuration
  private readonly MAX_RETRY_DELAY_MS = 60000; // 1 minute max delay
  private readonly BASE_BACKOFF_DELAY_MS = 2000; // 2 seconds base delay
  private readonly EXPONENTIAL_BASE = 2;
  private readonly JITTER_FACTOR = 0.1;

  constructor(
    @InjectRepository(RetryAttempt)
    private retryAttemptRepository: Repository<RetryAttempt>,
    @InjectRepository(ProviderHealth)
    private providerHealthRepository: Repository<ProviderHealth>,
    private redisService: RedisService,
  ) {}

  async shouldRetryJob(context: RetryContext): Promise<boolean> {
    try {
      // Don't retry if max attempts reached
      if (context.attempts.length >= context.maxAttempts) {
        this.logger.warn(`Job ${context.jobId} exceeded max attempts (${context.maxAttempts})`);
        return false;
      }

      // Check if the error is retryable
      if (!this.isRetryableError(context.lastError)) {
        this.logger.warn(`Job ${context.jobId} has non-retryable error: ${context.lastError}`);
        return false;
      }

      // Check rate limiting - don't retry too frequently
      const recentAttempts = context.attempts.filter(
        attempt => Date.now() - attempt.timestamp.getTime() < 300000 // 5 minutes
      );
      
      if (recentAttempts.length >= 3) {
        this.logger.warn(`Job ${context.jobId} has too many recent attempts, delaying retry`);
        return false;
      }

      // Check system capacity before allowing retry
      const systemLoad = await this.getSystemLoad();
      if (systemLoad > 0.9) {
        this.logger.warn(`System load too high (${systemLoad}), delaying retries`);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`Error checking retry eligibility for job ${context.jobId}:`, error);
      return false;
    }
  }

  async calculateRetryDelay(context: RetryContext): Promise<number> {
    try {
      const attemptNumber = context.attempts.length;
      
      // Exponential backoff with jitter
      let delay = Math.min(
        this.BASE_BACKOFF_DELAY_MS * Math.pow(this.EXPONENTIAL_BASE, attemptNumber),
        this.MAX_RETRY_DELAY_MS
      );

      // Add jitter to prevent thundering herd
      const jitter = delay * this.JITTER_FACTOR * Math.random();
      delay += jitter;

      // Increase delay based on recent failures for the same job type
      const recentFailures = await this.getRecentFailureCount(context.jobType);
      if (recentFailures > 10) {
        delay *= 1.5; // 50% increase for high failure rates
      }

      // Consider provider-specific delays
      if (context.attempts.length > 0) {
        const lastAttempt = context.attempts[context.attempts.length - 1];
        if (lastAttempt.providerId) {
          const providerHealth = await this.getProviderHealth(lastAttempt.providerId);
          if (providerHealth?.status === ProviderStatus.DEGRADED) {
            delay *= 2; // Double delay for degraded providers
          } else if (providerHealth?.status === ProviderStatus.UNHEALTHY) {
            delay *= 3; // Triple delay for unhealthy providers
          }
        }
      }

      this.logger.debug(`Calculated retry delay for job ${context.jobId}: ${delay}ms`);
      return Math.floor(delay);
    } catch (error) {
      this.logger.error(`Error calculating retry delay for job ${context.jobId}:`, error);
      return this.BASE_BACKOFF_DELAY_MS;
    }
  }

  async getNextProvider(context: RetryContext, failedProviderId?: string): Promise<string | null> {
    try {
      // Get all available providers
      const availableProviders = ['gemini', 'groq', 'openai'];
      
      // Filter out providers with open circuit breakers
      const healthyProviders = [];
      for (const providerId of availableProviders) {
        const isOpen = await this.isCircuitBreakerOpen(providerId);
        if (!isOpen && providerId !== failedProviderId) {
          healthyProviders.push(providerId);
        }
      }

      if (healthyProviders.length === 0) {
        this.logger.warn('No healthy providers available for retry');
        return null;
      }

      // Get provider health metrics to make intelligent choice
      const providerHealthMap = new Map<string, ProviderHealth>();
      for (const providerId of healthyProviders) {
        const health = await this.getProviderHealth(providerId);
        if (health) {
          providerHealthMap.set(providerId, health);
        }
      }

      // Sort providers by health score (success rate + response time)
      const sortedProviders = healthyProviders.sort((a, b) => {
        const healthA = providerHealthMap.get(a);
        const healthB = providerHealthMap.get(b);
        
        if (!healthA && !healthB) return 0;
        if (!healthA) return 1;
        if (!healthB) return -1;
        
        // Calculate health score (higher is better)
        const scoreA = healthA.success_rate - (healthA.avg_response_time_ms / 1000);
        const scoreB = healthB.success_rate - (healthB.avg_response_time_ms / 1000);
        
        return scoreB - scoreA;
      });

      const selectedProvider = sortedProviders[0];
      this.logger.debug(`Selected provider ${selectedProvider} for retry of job ${context.jobId}`);
      
      return selectedProvider;
    } catch (error) {
      this.logger.error(`Error selecting next provider for job ${context.jobId}:`, error);
      const availableProviders = ['gemini', 'groq', 'openai'];
      return availableProviders.find(p => p !== failedProviderId) || null;
    }
  }

  async recordFailure(providerId: string, error: string): Promise<void> {
    try {
      // Update provider health
      let health = await this.providerHealthRepository.findOne({
        where: { provider_id: providerId }
      });

      if (!health) {
        health = this.providerHealthRepository.create({
          provider_id: providerId,
          failure_threshold: this.DEFAULT_FAILURE_THRESHOLD,
          recovery_timeout_ms: this.DEFAULT_RECOVERY_TIMEOUT_MS,
        });
      }

      health.failed_requests++;
      health.total_requests++;
      health.consecutive_failures++;
      health.last_failure_at = new Date();
      
      // Update success rate
      health.success_rate = (health.successful_requests / health.total_requests) * 100;

      // Add to recent errors (keep last 10)
      const recentErrors = health.recent_errors || [];
      recentErrors.unshift({
        timestamp: new Date().toISOString(),
        error: error.substring(0, 500), // Limit error message length
        response_time_ms: 0,
      });
      health.recent_errors = recentErrors.slice(0, 10);

      // Open circuit breaker if threshold reached
      if (health.consecutive_failures >= health.failure_threshold) {
        health.status = ProviderStatus.CIRCUIT_OPEN;
        health.circuit_opened_at = new Date();
        this.logger.warn(`Circuit breaker opened for provider ${providerId} after ${health.consecutive_failures} failures`);
      } else if (health.success_rate < 50) {
        health.status = ProviderStatus.UNHEALTHY;
      } else if (health.success_rate < 80) {
        health.status = ProviderStatus.DEGRADED;
      }

      await this.providerHealthRepository.save(health);

      // Cache circuit breaker state in Redis for fast access
      await this.cacheCircuitBreakerState(providerId, health);
    } catch (error) {
      this.logger.error(`Failed to record failure for provider ${providerId}:`, error);
    }
  }

  async recordSuccess(providerId: string): Promise<void> {
    try {
      let health = await this.providerHealthRepository.findOne({
        where: { provider_id: providerId }
      });

      if (!health) {
        health = this.providerHealthRepository.create({
          provider_id: providerId,
          failure_threshold: this.DEFAULT_FAILURE_THRESHOLD,
          recovery_timeout_ms: this.DEFAULT_RECOVERY_TIMEOUT_MS,
        });
      }

      health.successful_requests++;
      health.total_requests++;
      health.consecutive_failures = 0; // Reset on success
      health.last_success_at = new Date();
      
      // Update success rate
      health.success_rate = (health.successful_requests / health.total_requests) * 100;

      // Update status based on success rate
      if (health.success_rate >= 95) {
        health.status = ProviderStatus.HEALTHY;
      } else if (health.success_rate >= 80) {
        health.status = ProviderStatus.DEGRADED;
      } else {
        health.status = ProviderStatus.UNHEALTHY;
      }

      // Close circuit breaker on success
      if (health.status !== ProviderStatus.UNHEALTHY) {
        health.circuit_opened_at = null;
      }

      await this.providerHealthRepository.save(health);

      // Update Redis cache
      await this.cacheCircuitBreakerState(providerId, health);
    } catch (error) {
      this.logger.error(`Failed to record success for provider ${providerId}:`, error);
    }
  }

  async isCircuitBreakerOpen(providerId: string): Promise<boolean> {
    try {
      // Check Redis cache first for performance
      const cachedState = await this.redisService.get(`circuit_breaker:${providerId}`);
      if (cachedState) {
        const state: CircuitBreakerState = JSON.parse(cachedState as string);
        
        if (state.isOpen) {
          // Check if enough time has passed for half-open state
          const now = new Date();
          const timeSinceFailure = now.getTime() - state.lastFailure.getTime();
          
          if (timeSinceFailure > this.DEFAULT_RECOVERY_TIMEOUT_MS) {
            // Enter half-open state
            state.isOpen = false;
            state.halfOpenAt = now;
            await this.redisService.set(
              `circuit_breaker:${providerId}`,
              JSON.stringify(state),
              { ttl: 300 } // 5 minutes TTL
            );
            return false;
          }
          
          return true;
        }
        
        return false;
      }

      // Fallback to database
      const health = await this.getProviderHealth(providerId);
      return health?.status === ProviderStatus.CIRCUIT_OPEN || false;
    } catch (error) {
      this.logger.error(`Error checking circuit breaker for provider ${providerId}:`, error);
      return false;
    }
  }

  async getCircuitBreakerStates(): Promise<CircuitBreakerState[]> {
    try {
      const providers = ['gemini', 'groq', 'openai'];
      const states: CircuitBreakerState[] = [];

      for (const providerId of providers) {
        const health = await this.getProviderHealth(providerId);
        if (health) {
          states.push({
            providerId,
            failures: health.consecutive_failures,
            lastFailure: health.last_failure_at || new Date(),
            isOpen: health.status === ProviderStatus.CIRCUIT_OPEN,
            halfOpenAt: health.status === ProviderStatus.DEGRADED ? new Date() : undefined,
          });
        }
      }

      return states;
    } catch (error) {
      this.logger.error('Error getting circuit breaker states:', error);
      return [];
    }
  }

  async resetCircuitBreaker(providerId: string): Promise<void> {
    try {
      const health = await this.providerHealthRepository.findOne({
        where: { provider_id: providerId }
      });

      if (health) {
        health.status = ProviderStatus.HEALTHY;
        health.consecutive_failures = 0;
        health.circuit_opened_at = null;
        health.last_success_at = new Date();
        
        await this.providerHealthRepository.save(health);
        
        // Clear Redis cache
        await this.redisService.del(`circuit_breaker:${providerId}`);
        
        this.logger.log(`Circuit breaker reset for provider ${providerId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to reset circuit breaker for provider ${providerId}:`, error);
    }
  }

  // Private helper methods
  private isRetryableError(error?: string): boolean {
    if (!error) return true;
    
    const nonRetryableErrors = [
      'validation error',
      'authentication failed',
      'insufficient permissions',
      'rate limit exceeded',
      'invalid api key',
      'malformed request',
    ];

    const errorLower = error.toLowerCase();
    return !nonRetryableErrors.some(nonRetryable => errorLower.includes(nonRetryable));
  }

  private async getSystemLoad(): Promise<number> {
    try {
      // Simple system load approximation based on queue metrics
      // In production, you might use actual system metrics
      const queueHealth = await this.getQueueSystemLoad();
      return Math.min(queueHealth, 1.0);
    } catch (error) {
      this.logger.warn('Could not get system load, assuming moderate load');
      return 0.5;
    }
  }

  private async getQueueSystemLoad(): Promise<number> {
    try {
      // Calculate load based on active jobs across all queues
      // This is a simplified metric - in production you might use more sophisticated monitoring
      const activeJobs = await this.retryAttemptRepository.count({
        where: {
          executed_at: MoreThan(new Date(Date.now() - 60000)), // Last minute
        }
      });
      
      // Assume 100 active jobs = 100% load (adjust based on your capacity)
      return Math.min(activeJobs / 100, 1.0);
    } catch (error) {
      this.logger.warn('Could not calculate queue system load');
      return 0.3; // Assume moderate load
    }
  }

  private async getRecentFailureCount(jobType: string): Promise<number> {
    try {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      
      return await this.retryAttemptRepository.count({
        where: {
          created_at: MoreThan(fifteenMinutesAgo),
          was_successful: false,
        }
      });
    } catch (error) {
      this.logger.warn('Could not get recent failure count');
      return 0;
    }
  }

  private async getProviderHealth(providerId: string): Promise<ProviderHealth | null> {
    try {
      return await this.providerHealthRepository.findOne({
        where: { provider_id: providerId }
      });
    } catch (error) {
      this.logger.error(`Failed to get provider health for ${providerId}:`, error);
      return null;
    }
  }

  private async cacheCircuitBreakerState(providerId: string, health: ProviderHealth): Promise<void> {
    try {
      const state: CircuitBreakerState = {
        providerId,
        failures: health.consecutive_failures,
        lastFailure: health.last_failure_at || new Date(),
        isOpen: health.status === ProviderStatus.CIRCUIT_OPEN,
      };

      await this.redisService.set(
        `circuit_breaker:${providerId}`,
        JSON.stringify(state),
        { ttl: 300 } // 5 minutes TTL
      );
    } catch (error) {
      this.logger.warn(`Failed to cache circuit breaker state for ${providerId}:`, error);
    }
  }
}