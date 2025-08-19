import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

export interface CacheOptions {
  ttl: number; // Time to live in seconds
  prefix?: string; // Key prefix for namespacing
}

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private redisClient: RedisClientType;
  private readonly defaultTTL = 300; // 5 minutes

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
      
      const options = {
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) return new Error('Redis reconnection failed');
            return Math.min(retries * 100, 3000);
          },
        },
      };

      this.redisClient = createClient(options);
      await this.redisClient.connect();
      await this.redisClient.ping();
      this.logger.log('Redis connection established successfully');
      
    } catch (error) {
      this.logger.error('Failed to connect to Redis', error);
    }
  }

  async onModuleDestroy() {
    if (this.redisClient && this.redisClient.isOpen) {
      await this.redisClient.quit();
    }
  }

  async set(key: string, value: any, options: Partial<CacheOptions> = {}): Promise<void> {
    try {
      if (!this.isConnected()) return;
      const ttl = options.ttl || this.defaultTTL;
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      await this.redisClient.setEx(key, ttl, serializedValue);
    } catch (error) {
      this.logger.error(`Failed to set cache key: ${key}`, error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.isConnected()) return null;
      const value = await this.redisClient.get(key);
      if (value === null) return null;
      
      try {
        return JSON.parse(value);
      } catch {
        return value as T;
      }
    } catch (error) {
      this.logger.error(`Failed to get cache key: ${key}`, error);
      return null;
    }
  }

  async del(key: string): Promise<void> {
    try {
      if (!this.isConnected()) return;
      await this.redisClient.del(key);
    } catch (error) {
      this.logger.error(`Failed to delete cache key: ${key}`, error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (!this.isConnected()) return false;
      const result = await this.redisClient.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to check cache key existence: ${key}`, error);
      return false;
    }
  }

  private isConnected(): boolean {
    return this.redisClient && this.redisClient.isOpen;
  }

  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; message: string }> {
    try {
      if (!this.isConnected()) {
        return { status: 'unhealthy', message: 'Redis client not connected' };
      }
      await this.redisClient.ping();
      return { status: 'healthy', message: 'Redis connection healthy' };
    } catch (error) {
      return { status: 'unhealthy', message: `Redis health check failed: ${(error as any).message}` };
    }
  }
}

