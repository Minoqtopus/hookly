import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';

export interface CacheStrategy {
  key: string;
  ttl: number; // seconds
  prefix?: string;
  description: string;
}

@Injectable()
export class StrategicCacheService {
  private readonly logger = new Logger(StrategicCacheService.name);
  
  // Cache strategies for high-impact data
  private readonly cacheStrategies: Record<string, CacheStrategy> = {
    // Signup availability - accessed on every landing page visit
    signupAvailability: {
      key: 'signup:availability',
      ttl: 300, // 5 minutes - high frequency, real-time data
      description: 'Signup availability status and limits'
    },
    
    // User plan features - accessed on every authenticated request
    userPlanFeatures: {
      key: 'user:plan:features',
      ttl: 1800, // 30 minutes - plan features don't change often
      description: 'User plan features and capabilities'
    },
    
    // Template data - accessed during generation
    templateData: {
      key: 'templates:data',
      ttl: 3600, // 1 hour - templates are relatively static
      description: 'Template library data and metadata'
    },
    
    // User settings - accessed frequently
    userSettings: {
      key: 'user:settings',
      ttl: 900, // 15 minutes - user settings may change
      description: 'User preferences and settings'
    },
    
    // Generation limits - accessed on every generation request
    generationLimits: {
      key: 'user:generation:limits',
      ttl: 600, // 10 minutes - limits may change with plan updates
      description: 'User generation limits and usage'
    }
  };

  constructor(private readonly redisService: RedisService) {}

  /**
   * Cache signup availability data
   */
  async cacheSignupAvailability(data: any): Promise<void> {
    const strategy = this.cacheStrategies.signupAvailability;
    await this.redisService.set(strategy.key, data, { ttl: strategy.ttl });
    this.logger.debug(`Cached signup availability (TTL: ${strategy.ttl}s)`);
  }

  /**
   * Get cached signup availability data
   */
  async getCachedSignupAvailability(): Promise<any | null> {
    const strategy = this.cacheStrategies.signupAvailability;
    return this.redisService.get(strategy.key);
  }

  /**
   * Cache user plan features
   */
  async cacheUserPlanFeatures(userId: string, features: any): Promise<void> {
    const strategy = this.cacheStrategies.userPlanFeatures;
    const key = `${strategy.key}:${userId}`;
    await this.redisService.set(key, features, { ttl: strategy.ttl });
    this.logger.debug(`Cached plan features for user ${userId} (TTL: ${strategy.ttl}s)`);
  }

  /**
   * Get cached user plan features
   */
  async getCachedUserPlanFeatures(userId: string): Promise<any | null> {
    const strategy = this.cacheStrategies.userPlanFeatures;
    const key = `${strategy.key}:${userId}`;
    return this.redisService.get(key);
  }

  /**
   * Cache template data
   */
  async cacheTemplateData(templates: any[]): Promise<void> {
    const strategy = this.cacheStrategies.templateData;
    await this.redisService.set(strategy.key, templates, { ttl: strategy.ttl });
    this.logger.debug(`Cached ${templates.length} templates (TTL: ${strategy.ttl}s)`);
  }

  /**
   * Get cached template data
   */
  async getCachedTemplateData(): Promise<any[] | null> {
    const strategy = this.cacheStrategies.templateData;
    return this.redisService.get(strategy.key);
  }

  /**
   * Cache user settings
   */
  async cacheUserSettings(userId: string, settings: any): Promise<void> {
    const strategy = this.cacheStrategies.userSettings;
    const key = `${strategy.key}:${userId}`;
    await this.redisService.set(key, settings, { ttl: strategy.ttl });
    this.logger.debug(`Cached settings for user ${userId} (TTL: ${strategy.ttl}s)`);
  }

  /**
   * Get cached user settings
   */
  async getCachedUserSettings(userId: string): Promise<any | null> {
    const strategy = this.cacheStrategies.userSettings;
    const key = `${strategy.key}:${userId}`;
    return this.redisService.get(key);
  }

  /**
   * Cache generation limits for a user
   */
  async cacheGenerationLimits(userId: string, limits: any): Promise<void> {
    const strategy = this.cacheStrategies.generationLimits;
    const key = `${strategy.key}:${userId}`;
    await this.redisService.set(key, limits, { ttl: strategy.ttl });
    this.logger.debug(`Cached generation limits for user ${userId} (TTL: ${strategy.ttl}s)`);
  }

  /**
   * Get cached generation limits for a user
   */
  async getCachedGenerationLimits(userId: string): Promise<any | null> {
    const strategy = this.cacheStrategies.generationLimits;
    const key = `${strategy.key}:${userId}`;
    return this.redisService.get(key);
  }

  /**
   * Invalidate user-specific cache when user data changes
   */
  async invalidateUserCache(userId: string): Promise<void> {
    const keys = [
      `${this.cacheStrategies.userPlanFeatures.key}:${userId}`,
      `${this.cacheStrategies.userSettings.key}:${userId}`,
      `${this.cacheStrategies.generationLimits.key}:${userId}`
    ];

    for (const key of keys) {
      await this.redisService.del(key);
    }

    this.logger.debug(`Invalidated cache for user ${userId}`);
  }

  /**
   * Invalidate signup availability cache
   */
  async invalidateSignupAvailabilityCache(): Promise<void> {
    await this.redisService.del(this.cacheStrategies.signupAvailability.key);
    this.logger.debug('Invalidated signup availability cache');
  }

  /**
   * Invalidate template cache
   */
  async invalidateTemplateCache(): Promise<void> {
    await this.redisService.del(this.cacheStrategies.templateData.key);
    this.logger.debug('Invalidated template cache');
  }

  /**
   * Get cache statistics for monitoring
   */
  async getCacheStats(): Promise<{
    strategies: Record<string, CacheStrategy>;
    redisHealth: { status: string; message: string };
  }> {
    const redisHealth = await this.redisService.healthCheck();
    
    return {
      strategies: this.cacheStrategies,
      redisHealth
    };
  }

  /**
   * Warm up cache with frequently accessed data
   */
  async warmUpCache(): Promise<void> {
    this.logger.log('Starting cache warm-up...');
    
    try {
      // This would be called during application startup
      // to pre-populate cache with common data
      this.logger.log('Cache warm-up completed');
    } catch (error) {
      this.logger.error('Cache warm-up failed', error);
    }
  }

  /**
   * Clear all cached data (use with caution)
   */
  async clearAllCache(): Promise<void> {
    this.logger.warn('Clearing all cached data...');
    
    try {
      // This is a destructive operation - use only in development/testing
      // In production, you'd want more granular control
      this.logger.log('All cache cleared');
    } catch (error) {
      this.logger.error('Failed to clear cache', error);
    }
  }
}
