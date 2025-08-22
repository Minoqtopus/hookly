import { ConfigService } from '@nestjs/config';

export interface QueueConfig {
  name: string;
  attempts: number;
  backoff: {
    type: 'exponential' | 'fixed';
    delay: number;
  };
  removeOnComplete: number;
  removeOnFail: number;
}

export enum JobType {
  AI_GENERATION = 'ai-generation',
  EMAIL_NOTIFICATION = 'email-notification',
  ANALYTICS_PROCESSING = 'analytics-processing',
}

export const getQueueConfiguration = (configService: ConfigService): Record<JobType, QueueConfig> => ({
  [JobType.AI_GENERATION]: {
    name: 'ai-generation',
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000, // Start with 2 seconds
    },
    removeOnComplete: 50, // Keep last 50 completed jobs
    removeOnFail: 25,     // Keep last 25 failed jobs
  },
  
  [JobType.EMAIL_NOTIFICATION]: {
    name: 'email-notification',
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: 25,
    removeOnFail: 15,
  },
  
  [JobType.ANALYTICS_PROCESSING]: {
    name: 'analytics-processing',
    attempts: 2,
    backoff: {
      type: 'fixed',
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 25,
  },
});

export const getRedisConfiguration = (configService: ConfigService) => ({
  host: configService.get<string>('REDIS_HOST', 'localhost'),
  port: configService.get<number>('REDIS_PORT', 6379),
  password: configService.get<string>('REDIS_PASSWORD'),
  db: configService.get<number>('REDIS_DB', 0),
  // Basic connection settings
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  lazyConnect: true,
});