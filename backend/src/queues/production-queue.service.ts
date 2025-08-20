import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobQueuePort, JobData, JobResult, QueueHealth } from '../core/ports/job-queue.port';
import { GenerationJob, JobStatus, JobType } from '../entities/generation-job.entity';
import { getRedisConfiguration } from './queue.config';

/**
 * Production-grade Queue Service implementing JobQueuePort
 * 
 * SOLID Principles Applied:
 * - Single Responsibility: Manages job queues and their lifecycle
 * - Open/Closed: Extensible for new job types without modification
 * - Liskov Substitution: Implements JobQueuePort interface
 * - Interface Segregation: Implements only JobQueuePort methods
 * - Dependency Inversion: Depends on abstractions (JobQueuePort)
 */
@Injectable()
export class ProductionQueueService implements JobQueuePort, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ProductionQueueService.name);
  private readonly queues = new Map<string, Queue>();
  private readonly queueEvents = new Map<string, QueueEvents>();
  private readonly redisConnection: any;

  constructor(
    private configService: ConfigService,
    @InjectRepository(GenerationJob)
    private jobRepository: Repository<GenerationJob>,
  ) {
    this.redisConnection = getRedisConfiguration(this.configService);
  }

  async onModuleInit(): Promise<void> {
    await this.initializeQueues();
    this.setupGlobalEventListeners();
    this.logger.log('Production queue service initialized');
  }

  async onModuleDestroy(): Promise<void> {
    await this.cleanupQueues();
    this.logger.log('Production queue service destroyed');
  }

  async addJob(jobType: string, data: any, options: JobData = {}): Promise<string> {
    const queueName = this.getQueueNameForJobType(jobType as JobType);
    const queue = this.getQueue(queueName);
    
    // Create database tracking record
    const jobEntity = await this.createJobEntity(jobType as JobType, data, options, queueName);
    
    // Add to BullMQ with proper configuration
    const bullJob = await queue.add(
      jobType,
      data,
      this.buildJobOptions(jobEntity.id, options)
    );

    // Update tracking record with BullMQ job ID
    await this.updateJobWithBullMQId(jobEntity.id, bullJob.id as string);

    this.logger.debug(`Job ${jobType} queued with ID: ${bullJob.id}`);
    return bullJob.id as string;
  }

  async addJobs(jobs: Array<{ jobType: string; data: any; options?: JobData }>): Promise<string[]> {
    const jobsByQueue = await this.groupJobsByQueue(jobs);
    const allJobIds: string[] = [];

    for (const [queueName, queueJobs] of jobsByQueue.entries()) {
      const queue = this.getQueue(queueName);
      const bullJobs = queueJobs.map(job => ({
        name: job.jobType,
        data: job.data,
        opts: this.buildJobOptions(job.entityId, job.options),
      }));

      const addedJobs = await queue.addBulk(bullJobs);
      
      // Update database records with BullMQ job IDs
      for (let i = 0; i < addedJobs.length; i++) {
        await this.updateJobWithBullMQId(queueJobs[i].entityId, addedJobs[i].id as string);
        allJobIds.push(addedJobs[i].id as string);
      }
    }

    this.logger.debug(`Bulk added ${allJobIds.length} jobs across ${jobsByQueue.size} queues`);
    return allJobIds;
  }

  async getJobStatus(jobId: string): Promise<'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | null> {
    const jobEntity = await this.findJobEntity(jobId);
    if (!jobEntity) return null;

    const queue = this.getQueue(jobEntity.queue_name);
    const bullJob = await queue.getJob(jobEntity.bull_job_id);
    
    if (!bullJob) {
      return jobEntity.status as any;
    }

    const state = await bullJob.getState();
    
    // Sync database state with BullMQ state if different
    if (state !== jobEntity.status) {
      await this.syncJobStatus(jobEntity.id, state as JobStatus);
    }

    return state as any;
  }

  async getJobResult(jobId: string): Promise<JobResult | null> {
    const jobEntity = await this.findJobEntity(jobId);
    if (!jobEntity) return null;

    return {
      success: jobEntity.status === JobStatus.COMPLETED,
      data: jobEntity.job_result,
      error: jobEntity.last_error,
      metadata: {
        processingTime: jobEntity.processing_time_ms || 0,
        attempts: jobEntity.attempt_count,
        timestamp: jobEntity.updated_at,
      }
    };
  }

  async retryJob(jobId: string): Promise<void> {
    const jobEntity = await this.findJobEntity(jobId);
    if (!jobEntity) {
      throw new Error(`Job ${jobId} not found`);
    }

    const queue = this.getQueue(jobEntity.queue_name);
    const bullJob = await queue.getJob(jobEntity.bull_job_id);
    
    if (!bullJob) {
      throw new Error(`BullMQ job ${jobEntity.bull_job_id} not found`);
    }

    await bullJob.retry();
    await this.syncJobStatus(jobEntity.id, JobStatus.WAITING);
    
    this.logger.debug(`Job ${jobId} queued for retry`);
  }

  async removeJob(jobId: string): Promise<void> {
    const jobEntity = await this.findJobEntity(jobId);
    if (!jobEntity) {
      throw new Error(`Job ${jobId} not found`);
    }

    const queue = this.getQueue(jobEntity.queue_name);
    const bullJob = await queue.getJob(jobEntity.bull_job_id);
    
    if (bullJob) {
      await bullJob.remove();
    }

    await this.syncJobStatus(jobEntity.id, JobStatus.CANCELLED);
    this.logger.debug(`Job ${jobId} removed`);
  }

  async getQueueHealth(): Promise<QueueHealth> {
    const queueStates = await this.aggregateQueueStates();
    const processingMetrics = await this.calculateProcessingMetrics();

    return {
      name: 'production-queues',
      ...queueStates,
      ...processingMetrics,
    };
  }

  async pauseQueue(): Promise<void> {
    const pausePromises = Array.from(this.queues.values()).map(queue => queue.pause());
    await Promise.all(pausePromises);
    this.logger.log('All queues paused');
  }

  async resumeQueue(): Promise<void> {
    const resumePromises = Array.from(this.queues.values()).map(queue => queue.resume());
    await Promise.all(resumePromises);
    this.logger.log('All queues resumed');
  }

  async cleanQueue(grace: number, type: 'completed' | 'failed' | 'active'): Promise<number> {
    let totalCleaned = 0;

    for (const queue of this.queues.values()) {
      const cleanType = type === 'active' ? 'active' : type === 'completed' ? 'completed' : 'failed';
      const cleanedJobs = await queue.clean(grace, 0, cleanType);
      totalCleaned += cleanedJobs.length;
    }

    this.logger.debug(`Cleaned ${totalCleaned} ${type} jobs older than ${grace}ms`);
    return totalCleaned;
  }

  // Public method for processors to register workers
  registerWorker(queueName: string, processorFunction: (job: Job) => Promise<any>): void {
    const worker = new Worker(queueName, processorFunction, {
      connection: this.redisConnection,
      concurrency: this.getWorkerConcurrency(queueName),
    });

    this.setupWorkerEventListeners(worker, queueName);
    this.logger.log(`Worker registered for queue: ${queueName}`);
  }

  // Private implementation methods
  private async initializeQueues(): Promise<void> {
    const queueConfigs = this.getQueueConfigurations();
    
    for (const config of queueConfigs) {
      // Initialize queue
      const queue = new Queue(config.name, {
        connection: this.redisConnection,
        defaultJobOptions: config.defaultJobOptions,
      });

      // Initialize queue events for monitoring
      const queueEvents = new QueueEvents(config.name, {
        connection: this.redisConnection,
      });

      this.queues.set(config.name, queue);
      this.queueEvents.set(config.name, queueEvents);
      
      this.logger.debug(`Initialized queue: ${config.name}`);
    }
  }

  private setupGlobalEventListeners(): void {
    for (const [queueName, queueEvents] of this.queueEvents.entries()) {
      queueEvents.on('completed', async ({ jobId, returnvalue }) => {
        await this.handleJobCompleted(jobId, returnvalue);
      });

      queueEvents.on('failed', async ({ jobId, failedReason }) => {
        await this.handleJobFailed(jobId, failedReason);
      });

      queueEvents.on('active', async ({ jobId }) => {
        await this.handleJobActive(jobId);
      });

      queueEvents.on('waiting', async ({ jobId }) => {
        await this.handleJobWaiting(jobId);
      });

      queueEvents.on('delayed', async ({ jobId }) => {
        await this.handleJobDelayed(jobId);
      });

      this.logger.debug(`Event listeners setup for queue: ${queueName}`);
    }
  }

  private async createJobEntity(jobType: JobType, data: any, options: JobData, queueName: string): Promise<GenerationJob> {
    const jobEntity = this.jobRepository.create({
      job_type: jobType,
      status: JobStatus.WAITING,
      queue_name: queueName,
      priority: options.priority || 0,
      user_id: data.userId,
      job_data: data,
      max_attempts: options.attempts || 3,
      retry_config: options.backoff ? {
        backoff_type: options.backoff.type,
        base_delay: options.backoff.delay,
        max_delay: Math.min(options.backoff.delay * 10, 60000),
        jitter: true,
      } : undefined,
      scheduled_at: options.delay ? new Date(Date.now() + options.delay) : new Date(),
    });

    return await this.jobRepository.save(jobEntity);
  }

  private buildJobOptions(jobEntityId: string, options: JobData): any {
    return {
      jobId: jobEntityId,
      priority: options.priority ? -options.priority : 0, // BullMQ uses negative priority
      delay: options.delay,
      attempts: options.attempts || 3,
      backoff: options.backoff || {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: options.removeOnComplete || 100,
      removeOnFail: options.removeOnFail || 50,
    };
  }

  private async updateJobWithBullMQId(jobEntityId: string, bullJobId: string): Promise<void> {
    await this.jobRepository.update(jobEntityId, {
      bull_job_id: bullJobId,
    });
  }

  private async groupJobsByQueue(jobs: Array<{ jobType: string; data: any; options?: JobData }>) {
    const jobsByQueue = new Map<string, Array<{ 
      jobType: string; 
      data: any; 
      options?: JobData; 
      entityId: string 
    }>>();
    
    for (const job of jobs) {
      const queueName = this.getQueueNameForJobType(job.jobType as JobType);
      const jobEntity = await this.createJobEntity(job.jobType as JobType, job.data, job.options || {}, queueName);
      
      if (!jobsByQueue.has(queueName)) {
        jobsByQueue.set(queueName, []);
      }
      
      jobsByQueue.get(queueName)!.push({
        ...job,
        entityId: jobEntity.id,
      });
    }
    
    return jobsByQueue;
  }

  private async findJobEntity(jobId: string): Promise<GenerationJob | null> {
    return await this.jobRepository.findOne({
      where: [
        { bull_job_id: jobId },
        { id: jobId }
      ]
    });
  }

  private async syncJobStatus(jobEntityId: string, status: JobStatus): Promise<void> {
    await this.jobRepository.update(jobEntityId, {
      status,
      updated_at: new Date(),
    });
  }

  private getQueue(queueName: string): Queue {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue not initialized: ${queueName}`);
    }
    return queue;
  }

  private getQueueNameForJobType(jobType: JobType): string {
    const mapping: Record<JobType, string> = {
      [JobType.AI_GENERATION]: 'ai-generation',
      [JobType.EMAIL_NOTIFICATION]: 'email-notification',
      [JobType.ANALYTICS_PROCESSING]: 'analytics-processing',
      [JobType.CLEANUP_TASK]: 'cleanup-task',
      [JobType.HEALTH_CHECK]: 'health-check',
      [JobType.RETRY_FAILED_GENERATION]: 'retry-failed-generation',
    };

    const queueName = mapping[jobType];
    if (!queueName) {
      throw new Error(`No queue mapping found for job type: ${jobType}`);
    }
    
    return queueName;
  }

  private getQueueConfigurations() {
    return [
      {
        name: 'ai-generation',
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 3,
          backoff: { type: 'exponential' as const, delay: 2000 },
        },
      },
      {
        name: 'email-notification',
        defaultJobOptions: {
          removeOnComplete: 50,
          removeOnFail: 25,
          attempts: 5,
          backoff: { type: 'exponential' as const, delay: 1000 },
        },
      },
      {
        name: 'analytics-processing',
        defaultJobOptions: {
          removeOnComplete: 200,
          removeOnFail: 50,
          attempts: 2,
          backoff: { type: 'fixed' as const, delay: 5000 },
        },
      },
      {
        name: 'cleanup-task',
        defaultJobOptions: {
          removeOnComplete: 10,
          removeOnFail: 10,
          attempts: 1,
          backoff: { type: 'fixed' as const, delay: 10000 },
        },
      },
      {
        name: 'health-check',
        defaultJobOptions: {
          removeOnComplete: 20,
          removeOnFail: 10,
          attempts: 2,
          backoff: { type: 'fixed' as const, delay: 3000 },
        },
      },
      {
        name: 'retry-failed-generation',
        defaultJobOptions: {
          removeOnComplete: 50,
          removeOnFail: 25,
          attempts: 2,
          backoff: { type: 'exponential' as const, delay: 5000 },
        },
      },
    ];
  }

  private getWorkerConcurrency(queueName: string): number {
    const defaultConcurrency = queueName === 'ai-generation' ? 2 : 1;
    return this.configService.get<number>(`${queueName.toUpperCase().replace('-', '_')}_CONCURRENCY`, defaultConcurrency);
  }

  private setupWorkerEventListeners(worker: Worker, queueName: string): void {
    worker.on('completed', (job: Job) => {
      this.logger.debug(`Worker completed job: ${job.id} in queue: ${queueName}`);
    });

    worker.on('failed', (job: Job | undefined, err: Error) => {
      this.logger.error(`Worker failed job: ${job?.id} in queue: ${queueName}`, err);
    });

    worker.on('error', (err: Error) => {
      this.logger.error(`Worker error in queue: ${queueName}`, err);
    });
  }

  private async handleJobCompleted(jobId: string, returnvalue: any): Promise<void> {
    await this.jobRepository.update(
      { bull_job_id: jobId },
      {
        status: JobStatus.COMPLETED,
        job_result: returnvalue,
        completed_at: new Date(),
        processing_metadata: {
          ...returnvalue.metadata,
          completed_at: new Date().toISOString(),
        }
      }
    );
  }

  private async handleJobFailed(jobId: string, failedReason: string): Promise<void> {
    await this.jobRepository.update(
      { bull_job_id: jobId },
      {
        status: JobStatus.FAILED,
        last_error: failedReason,
        completed_at: new Date(),
      }
    );
  }

  private async handleJobActive(jobId: string): Promise<void> {
    await this.jobRepository.update(
      { bull_job_id: jobId },
      {
        status: JobStatus.ACTIVE,
        started_at: new Date(),
      }
    );
  }

  private async handleJobWaiting(jobId: string): Promise<void> {
    await this.jobRepository.update(
      { bull_job_id: jobId },
      { status: JobStatus.WAITING }
    );
  }

  private async handleJobDelayed(jobId: string): Promise<void> {
    await this.jobRepository.update(
      { bull_job_id: jobId },
      { status: JobStatus.DELAYED }
    );
  }

  private async aggregateQueueStates() {
    let waiting = 0, active = 0, completed = 0, failed = 0, delayed = 0;

    for (const queue of this.queues.values()) {
      const [w, a, c, f, d] = await Promise.all([
        queue.getWaiting(),
        queue.getActive(),
        queue.getCompleted(),
        queue.getFailed(),
        queue.getDelayed(),
      ]);

      waiting += w.length;
      active += a.length;
      completed += c.length;
      failed += f.length;
      delayed += d.length;
    }

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      totalJobs: waiting + active + completed + failed + delayed,
    };
  }

  private async calculateProcessingMetrics() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const [recentCompletions, recentProcessingTimes] = await Promise.all([
      this.jobRepository.count({
        where: { status: JobStatus.COMPLETED, completed_at: oneHourAgo }
      }),
      this.jobRepository.find({
        where: { status: JobStatus.COMPLETED, completed_at: oneHourAgo },
        select: ['processing_time_ms'],
        take: 100,
      })
    ]);

    const avgProcessingTime = recentProcessingTimes.length > 0
      ? recentProcessingTimes.reduce((sum, job) => sum + (job.processing_time_ms || 0), 0) / recentProcessingTimes.length
      : 0;

    return {
      processingRate: recentCompletions,
      avgProcessingTime,
    };
  }

  private async cleanupQueues(): Promise<void> {
    // Close queue events first
    for (const queueEvents of this.queueEvents.values()) {
      await queueEvents.close();
    }

    // Close queues
    for (const queue of this.queues.values()) {
      await queue.close();
    }

    this.queues.clear();
    this.queueEvents.clear();
  }
}