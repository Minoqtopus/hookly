import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { GenerationJob } from './generation-job.entity';

export enum RetryReason {
  PROVIDER_ERROR = 'provider_error',
  TIMEOUT = 'timeout',
  RATE_LIMIT = 'rate_limit',
  NETWORK_ERROR = 'network_error',
  VALIDATION_ERROR = 'validation_error',
  CIRCUIT_BREAKER_OPEN = 'circuit_breaker_open',
  UNKNOWN_ERROR = 'unknown_error'
}

@Entity('retry_attempts')
@Index('idx_retry_attempt_job', ['job_id'])
@Index('idx_retry_attempt_provider', ['provider_id'])
@Index('idx_retry_attempt_reason', ['retry_reason'])
@Index('idx_retry_attempt_created', ['created_at'])
@Index('idx_retry_attempt_success', ['was_successful'])
export class RetryAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  job_id: string;

  @Column({ type: 'int' })
  attempt_number: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  provider_id?: string; // Which AI provider was attempted

  @Column({
    type: 'enum',
    enum: RetryReason
  })
  retry_reason: RetryReason;

  @Column({ type: 'text', nullable: true })
  error_message?: string;

  @Column({ type: 'text', nullable: true })
  error_stack?: string;

  @Column({ type: 'int', nullable: true })
  http_status_code?: number;

  @Column({ type: 'int' })
  delay_before_retry_ms: number;

  @Column({ type: 'timestamp', nullable: true })
  scheduled_retry_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  executed_at?: Date;

  @Column({ type: 'int', nullable: true })
  execution_time_ms?: number;

  @Column({ type: 'boolean', default: false })
  was_successful: boolean;

  // Context about the retry attempt
  @Column('jsonb', { nullable: true })
  retry_context?: {
    previous_provider?: string;
    circuit_breaker_states?: Array<{
      provider_id: string;
      is_open: boolean;
      failures: number;
    }>;
    queue_health?: {
      waiting_jobs: number;
      active_jobs: number;
      failed_jobs: number;
    };
    system_load?: {
      cpu_usage?: number;
      memory_usage?: number;
      active_connections?: number;
    };
  };

  // Backoff strategy used
  @Column('jsonb', { nullable: true })
  backoff_strategy?: {
    type: 'exponential' | 'fixed' | 'linear';
    base_delay: number;
    multiplier?: number;
    jitter?: boolean;
    max_delay?: number;
  };

  // Result of the retry attempt
  @Column('jsonb', { nullable: true })
  retry_result?: {
    provider_response_time?: number;
    token_usage?: {
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
      estimatedCost: number;
    };
    quality_score?: number;
    content_generated?: boolean;
  };

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => GenerationJob, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: GenerationJob;
}