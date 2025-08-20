import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

export enum IntegrationComplexity {
  SIMPLE = 'simple',
  MEDIUM = 'medium',
  COMPLEX = 'complex'
}

export enum IntegrationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

@Entity('custom_integration_requests')
@Index('idx_custom_integration_user', ['user_id'])
@Index('idx_custom_integration_status', ['status'])
@Index('idx_custom_integration_complexity', ['complexity'])
@Index('idx_custom_integration_created', ['created_at'])
export class CustomIntegrationRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 100 })
  integration_type: string;

  @Column({ type: 'text' })
  requirements: string;

  @Column({
    type: 'enum',
    enum: IntegrationComplexity
  })
  complexity: IntegrationComplexity;

  @Column({
    type: 'enum',
    enum: IntegrationStatus,
    default: IntegrationStatus.PENDING
  })
  status: IntegrationStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimated_cost: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  estimated_timeline: string;

  @Column({ type: 'text', nullable: true })
  technical_specifications: string;

  @Column({ type: 'jsonb', nullable: true })
  api_requirements: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  security_requirements: Record<string, any>;

  @Column({ type: 'varchar', length: 500, nullable: true })
  business_justification: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  priority: string;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  started_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  rejected_at: Date;

  @Column({ type: 'text', nullable: true })
  rejection_reason: string;

  @Column({ type: 'uuid', nullable: true })
  assigned_developer_id: string;

  @Column({ type: 'jsonb', nullable: true })
  progress_updates: Array<{
    date: string;
    status: string;
    description: string;
    completed_percentage: number;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
