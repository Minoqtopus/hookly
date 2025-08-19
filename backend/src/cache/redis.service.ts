import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      maxRetriesPerRequest: 3,
    });

    this.redis.on('connect', () => {
      this.logger.log('Redis connected successfully');
    });

    this.redis.on('error', (error) => {
      this.logger.error('Redis connection error:', error);
    });
  }

  // Strategic caching methods for high-impact data
  async cacheSignupAvailability(data: any, ttl: number = 300): Promise<void> {
    try {
      await this.redis.setex('signup:availability', ttl, JSON.stringify(data));
      this.logger.debug('Signup availability cached');
    } catch (error) {
      this.logger.error('Failed to cache signup availability:', error);
    }
  }

  async getSignupAvailability(): Promise<any | null> {
    try {
      const data = await this.redis.get('signup:availability');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error('Failed to get signup availability from cache:', error);
      return null;
    }
  }

  async cacheUserFeatures(userId: string, features: any, ttl: number = 1800): Promise<void> {
    try {
      await this.redis.setex(`user:features:${userId}`, ttl, JSON.stringify(features));
      this.logger.debug(`User features cached for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to cache user features for user ${userId}:`, error);
    }
  }

  async getUserFeatures(userId: string): Promise<any | null> {
    try {
      const data = await this.redis.get(`user:features:${userId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error(`Failed to get user features from cache for user ${userId}:`, error);
      return null;
    }
  }

  async cacheTemplateData(templateId: string, data: any, ttl: number = 3600): Promise<void> {
    try {
      await this.redis.setex(`template:${templateId}`, ttl, JSON.stringify(data));
      this.logger.debug(`Template data cached for template ${templateId}`);
    } catch (error) {
      this.logger.error(`Failed to cache template data for template ${templateId}:`, error);
    }
  }

  async getTemplateData(templateId: string): Promise<any | null> {
    try {
      const data = await this.redis.get(`template:${templateId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error(`Failed to get template data from cache for template ${templateId}:`, error);
      return null;
    }
  }

  // Cache invalidation methods
  async invalidateUserFeatures(userId: string): Promise<void> {
    try {
      await this.redis.del(`user:features:${userId}`);
      this.logger.debug(`User features cache invalidated for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to invalidate user features cache for user ${userId}:`, error);
    }
  }

  async invalidateTemplateData(templateId: string): Promise<void> {
    try {
      await this.redis.del(`template:${templateId}`);
      this.logger.debug(`Template data cache invalidated for template ${templateId}`);
    } catch (error) {
      this.logger.error(`Failed to invalidate template data cache for template ${templateId}:`, error);
    }
  }

  // Performance monitoring methods
  async getCacheStats(): Promise<any> {
    try {
      const info = await this.redis.info('stats');
      const keyspace = await this.redis.info('keyspace');
      
      return {
        info: this.parseRedisInfo(info),
        keyspace: this.parseRedisInfo(keyspace),
        memory: await this.redis.memory('STATS'),
      };
    } catch (error) {
      this.logger.error('Failed to get cache stats:', error);
      return null;
    }
  }

  private parseRedisInfo(info: string): any {
    const lines = info.split('\r\n');
    const result: any = {};
    
    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        result[key] = value;
      }
    }
    
    return result;
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return false;
    }
  }

  // Graceful shutdown
  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
      this.logger.log('Redis connection closed');
    }
  }
}
