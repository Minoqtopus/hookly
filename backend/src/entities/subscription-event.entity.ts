import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum SubscriptionEventType {
  // Subscription lifecycle
  SUBSCRIPTION_CREATED = 'subscription_created',
  SUBSCRIPTION_UPDATED = 'subscription_updated',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
  SUBSCRIPTION_RESUMED = 'subscription_resumed',
  SUBSCRIPTION_EXPIRED = 'subscription_expired',
  SUBSCRIPTION_PAUSED = 'subscription_paused',
  
  // Payment events
  SUBSCRIPTION_PAYMENT_SUCCESS = 'subscription_payment_success',
  SUBSCRIPTION_PAYMENT_FAILED = 'subscription_payment_failed',
  SUBSCRIPTION_PAYMENT_RECOVERED = 'subscription_payment_recovered',
  SUBSCRIPTION_PAYMENT_REFUNDED = 'subscription_payment_refunded',
  
  // Plan changes
  SUBSCRIPTION_PLAN_CHANGED = 'subscription_plan_changed',
  SUBSCRIPTION_PLAN_CHANGED_PRORATION = 'subscription_plan_changed_proration',
  
  // Trial events
  TRIAL_STARTED = 'trial_started',
  TRIAL_ENDING_SOON = 'trial_ending_soon',
  TRIAL_ENDED = 'trial_ended',
  TRIAL_CONVERTED = 'trial_converted',
  
  // Other events
  LICENSE_KEY_CREATED = 'license_key_created',
  LICENSE_KEY_UPDATED = 'license_key_updated'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  PAST_DUE = 'past_due',
  PAUSED = 'paused',
  UNPAID = 'unpaid',
  ON_TRIAL = 'on_trial'
}

@Entity('subscription_events')
@Index('idx_subscription_event_user', ['user_id', 'event_type'])
@Index('idx_subscription_event_lemonsqueezy', ['lemonsqueezy_subscription_id', 'created_at'])
@Index('idx_subscription_event_type_date', ['event_type', 'created_at'])
export class SubscriptionEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({
    type: 'enum',
    enum: SubscriptionEventType
  })
  event_type: SubscriptionEventType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lemonsqueezy_subscription_id?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lemonsqueezy_customer_id?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lemonsqueezy_order_id?: string;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    nullable: true
  })
  subscription_status?: SubscriptionStatus;

  @Column({ type: 'varchar', length: 50, nullable: true })
  plan_name?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  previous_plan_name?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amount?: number;

  @Column({ type: 'varchar', length: 3, nullable: true })
  currency?: string;

  @Column({ type: 'timestamp', nullable: true })
  billing_period_start?: Date;

  @Column({ type: 'timestamp', nullable: true })
  billing_period_end?: Date;

  @Column({ type: 'timestamp', nullable: true })
  trial_ends_at?: Date;

  @Column('jsonb', { nullable: true })
  webhook_data?: {
    webhook_id?: string;
    webhook_event_name?: string;
    webhook_signature?: string;
    lemonsqueezy_event_data?: any;
    processing_attempts?: number;
    processed_at?: string;
    error_message?: string;
  };

  @Column('jsonb', { nullable: true })
  subscription_data?: {
    product_id?: string;
    variant_id?: string;
    store_id?: string;
    customer_email?: string;
    customer_name?: string;
    billing_address?: any;
    tax_rate?: number;
    discount_amount?: number;
    subscription_item_id?: string;
  };

  @Column({ type: 'boolean', default: false })
  is_processed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  processed_at?: Date;

  @Column({ type: 'text', nullable: true })
  processing_notes?: string;

  @CreateDateColumn()
  created_at: Date;
}