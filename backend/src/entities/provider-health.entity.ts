import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum ProviderStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  CIRCUIT_OPEN = 'circuit_open'
}

@Entity('provider_health')
@Index('idx_provider_health_provider', ['provider_id'])
@Index('idx_provider_health_status', ['status'])
@Index('idx_provider_health_updated', ['updated_at'])
@Index('idx_provider_health_failures', ['consecutive_failures'])
export class ProviderHealth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  provider_id: string; // 'gemini', 'groq', 'openai'

  @Column({
    type: 'enum',
    enum: ProviderStatus,
    default: ProviderStatus.HEALTHY
  })
  status: ProviderStatus;

  // Success metrics
  @Column({ type: 'int', default: 0 })
  total_requests: number;

  @Column({ type: 'int', default: 0 })
  successful_requests: number;

  @Column({ type: 'int', default: 0 })
  failed_requests: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  success_rate: number; // Percentage

  // Performance metrics
  @Column({ type: 'int', default: 0 })
  avg_response_time_ms: number;

  @Column({ type: 'int', default: 0 })
  min_response_time_ms: number;

  @Column({ type: 'int', default: 0 })
  max_response_time_ms: number;

  // Circuit breaker state
  @Column({ type: 'int', default: 0 })
  consecutive_failures: number;

  @Column({ type: 'timestamp', nullable: true })
  last_failure_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  circuit_opened_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_success_at?: Date;

  // Cost tracking
  @Column({ type: 'decimal', precision: 10, scale: 6, default: 0 })
  total_cost_usd: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 0 })
  avg_cost_per_request: number;

  @Column({ type: 'int', default: 0 })
  total_tokens_used: number;

  // Error tracking
  @Column('jsonb', { nullable: true })
  recent_errors?: Array<{
    timestamp: string;
    error: string;
    response_time_ms: number;
  }>;

  // Quality metrics
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  avg_quality_score?: number;

  @Column({ type: 'int', default: 0 })
  quality_samples_count: number;

  // Circuit breaker configuration
  @Column({ type: 'int', default: 5 })
  failure_threshold: number; // Open circuit after this many failures

  @Column({ type: 'int', default: 60000 })
  recovery_timeout_ms: number; // Time before attempting recovery

  // Health check metadata
  @Column('jsonb', { nullable: true })
  health_check_metadata?: {
    last_check_at?: string;
    check_interval_ms?: number;
    consecutive_health_checks?: number;
  };

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}