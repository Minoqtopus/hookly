import { ConfigService } from '@nestjs/config';

export interface QueueConfig {
  name: string;
  priority: number;
  attempts: number;
  backoff: {
    type: 'exponential' | 'fixed';
    delay: number;
  };
  removeOnComplete: number;
  removeOnFail: number;
}

export enum QueuePriority {
  HIGH = 1,    // User-facing operations (AI generation)
  MEDIUM = 5,  // Background processing (analytics, notifications)
  LOW = 10,    // Maintenance tasks (cleanup, monitoring)
}

export enum JobType {
  AI_GENERATION = 'ai-generation',
  EMAIL_NOTIFICATION = 'email-notification',
  ANALYTICS_PROCESSING = 'analytics-processing',
  CLEANUP_TASK = 'cleanup-task',
  HEALTH_CHECK = 'health-check',
  RETRY_FAILED_GENERATION = 'retry-failed-generation',
}

export const getQueueConfiguration = (configService: ConfigService): Record<JobType, QueueConfig> => ({
  [JobType.AI_GENERATION]: {
    name: 'ai-generation',
    priority: QueuePriority.HIGH,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000, // Start with 2 seconds
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 50,      // Keep last 50 failed jobs for analysis
  },
  
  [JobType.EMAIL_NOTIFICATION]: {
    name: 'email-notification',
    priority: QueuePriority.MEDIUM,
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: 50,
    removeOnFail: 25,
  },
  
  [JobType.ANALYTICS_PROCESSING]: {
    name: 'analytics-processing',
    priority: QueuePriority.MEDIUM,
    attempts: 2,
    backoff: {
      type: 'fixed',
      delay: 5000,
    },
    removeOnComplete: 200,
    removeOnFail: 50,
  },
  
  [JobType.CLEANUP_TASK]: {
    name: 'cleanup-task',
    priority: QueuePriority.LOW,
    attempts: 1,
    backoff: {
      type: 'fixed',
      delay: 10000,
    },
    removeOnComplete: 10,
    removeOnFail: 10,
  },
  
  [JobType.HEALTH_CHECK]: {
    name: 'health-check',
    priority: QueuePriority.MEDIUM,
    attempts: 2,
    backoff: {
      type: 'fixed',
      delay: 3000,
    },
    removeOnComplete: 20,
    removeOnFail: 10,
  },
  
  [JobType.RETRY_FAILED_GENERATION]: {
    name: 'retry-failed-generation',
    priority: QueuePriority.HIGH,
    attempts: 2, // Limited retries for already failed jobs
    backoff: {
      type: 'exponential',
      delay: 5000, // Longer initial delay for retries
    },
    removeOnComplete: 50,
    removeOnFail: 25,
  },
});

export const getRedisConfiguration = (configService: ConfigService) => ({
  host: configService.get<string>('REDIS_HOST', 'localhost'),
  port: configService.get<number>('REDIS_PORT', 6379),
  password: configService.get<string>('REDIS_PASSWORD'),
  db: configService.get<number>('REDIS_DB', 0),
  // Connection pool settings for high throughput
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  maxLoadingTimeout: 1000,
  lazyConnect: true,
});