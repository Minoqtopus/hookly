import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

export enum UpsellType {
  ADDITIONAL_USERS = 'additional_users',
  CUSTOM_INTEGRATIONS = 'custom_integrations',
  WHITE_LABEL = 'white_label',
  DEDICATED_SUPPORT = 'dedicated_support'
}

export enum UpsellStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

@Entity('enterprise_upsells')
@Index('idx_enterprise_upsell_user', ['user_id'])
@Index('idx_enterprise_upsell_type', ['upsell_type'])
@Index('idx_enterprise_upsell_status', ['status'])
@Index('idx_enterprise_upsell_created', ['created_at'])
export class EnterpriseUpsell {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: UpsellType
  })
  upsell_type: UpsellType;

  @Column({
    type: 'enum',
    enum: UpsellStatus,
    default: UpsellStatus.PENDING
  })
  status: UpsellStatus;

  @Column({
    type: 'enum',
    enum: BillingCycle,
    default: BillingCycle.MONTHLY
  })
  billing_cycle: BillingCycle;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monthly_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  setup_fee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_paid: number;

  @Column({ type: 'jsonb', nullable: true })
  features: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  configuration: Record<string, any>;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string;

  @Column({ type: 'timestamp', nullable: true })
  started_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelled_at: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  subscription_id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  external_reference: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
