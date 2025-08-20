export interface JobData {
  id?: string;
  priority?: number;
  delay?: number;
  attempts?: number;
  backoff?: {
    type: 'exponential' | 'fixed';
    delay: number;
  };
  removeOnComplete?: number;
  removeOnFail?: number;
}

export interface JobResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    processingTime: number;
    attempts: number;
    timestamp: Date;
  };
}

export interface QueueHealth {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  totalJobs: number;
  processingRate: number; // jobs per minute
  avgProcessingTime: number; // milliseconds
}

export interface JobQueuePort<TJobData = any, TJobResult = any> {
  /**
   * Add a job to the queue
   */
  addJob(jobType: string, data: TJobData, options?: JobData): Promise<string>;

  /**
   * Add multiple jobs to the queue
   */
  addJobs(jobs: Array<{ jobType: string; data: TJobData; options?: JobData }>): Promise<string[]>;

  /**
   * Get job status by ID
   */
  getJobStatus(jobId: string): Promise<'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | null>;

  /**
   * Get job result by ID
   */
  getJobResult(jobId: string): Promise<JobResult<TJobResult> | null>;

  /**
   * Retry a failed job
   */
  retryJob(jobId: string): Promise<void>;

  /**
   * Remove a job from the queue
   */
  removeJob(jobId: string): Promise<void>;

  /**
   * Get queue health metrics
   */
  getQueueHealth(): Promise<QueueHealth>;

  /**
   * Pause queue processing
   */
  pauseQueue(): Promise<void>;

  /**
   * Resume queue processing
   */
  resumeQueue(): Promise<void>;

  /**
   * Clean old completed/failed jobs
   */
  cleanQueue(grace: number, type: 'completed' | 'failed' | 'active'): Promise<number>;
}