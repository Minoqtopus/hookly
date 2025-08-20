import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Generation } from './generation.entity';

export enum JobStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
  DELAYED = 'delayed',
  CANCELLED = 'cancelled'
}

export enum JobType {
  AI_GENERATION = 'ai-generation',
  EMAIL_NOTIFICATION = 'email-notification',
  ANALYTICS_PROCESSING = 'analytics-processing',
  CLEANUP_TASK = 'cleanup-task',
  HEALTH_CHECK = 'health-check',
  RETRY_FAILED_GENERATION = 'retry-failed-generation'
}

@Entity('generation_jobs')
@Index('idx_generation_job_status', ['status'])
@Index('idx_generation_job_type', ['job_type'])
@Index('idx_generation_job_user', ['user_id'])
@Index('idx_generation_job_queue', ['queue_name'])
@Index('idx_generation_job_created', ['created_at'])
@Index('idx_generation_job_priority', ['priority'])
export class GenerationJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  bull_job_id: string; // BullMQ job ID

  @Column({
    type: 'enum',
    enum: JobType
  })
  job_type: JobType;

  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.WAITING
  })
  status: JobStatus;

  @Column({ type: 'varchar', length: 100 })
  queue_name: string;

  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column('uuid', { nullable: true })
  user_id?: string;

  @Column('uuid', { nullable: true })
  generation_id?: string;

  // Job payload data
  @Column('jsonb')
  job_data: any;

  // Job result data
  @Column('jsonb', { nullable: true })
  job_result?: any;

  // Processing metadata
  @Column('jsonb', { nullable: true })
  processing_metadata?: {
    started_at?: string;
    completed_at?: string;
    processing_time_ms?: number;
    ai_provider_used?: string;
    token_usage?: {
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
      estimatedCost: number;
    };
    retry_count?: number;
    error_count?: number;
    last_error?: string;
    quality_score?: number;
  };

  // Error tracking
  @Column('text', { nullable: true })
  last_error?: string;

  @Column({ type: 'int', default: 0 })
  attempt_count: number;

  @Column({ type: 'int', default: 3 })
  max_attempts: number;

  // Timing information
  @Column({ type: 'timestamp', nullable: true })
  scheduled_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  started_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at?: Date;

  @Column({ type: 'int', nullable: true })
  processing_time_ms?: number;

  // Retry and backoff configuration
  @Column('jsonb', { nullable: true })
  retry_config?: {
    backoff_type: 'exponential' | 'fixed';
    base_delay: number;
    max_delay: number;
    jitter: boolean;
  };

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(() => Generation, { nullable: true })
  @JoinColumn({ name: 'generation_id' })
  generation?: Generation;
}