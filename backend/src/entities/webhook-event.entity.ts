/**
 * Webhook Event Entity for Idempotency Protection
 * 
 * This entity tracks processed webhook events to prevent duplicate processing.
 * Critical for payment webhooks where duplicate processing could cause billing issues.
 * 
 * Staff Engineer Note: Idempotency is essential for production webhook handling.
 * Payment providers often send duplicate webhooks during network issues or retries.
 */

import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum WebhookProvider {
  LEMONSQUEEZY = 'lemonsqueezy',
  STRIPE = 'stripe', // Future provider support
}

export enum WebhookStatus {
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped' // For events we don't handle
}

@Entity('webhook_events')
@Index('idx_webhook_provider_external_id', ['provider', 'external_id'], { unique: true })
@Index('idx_webhook_event_type', ['event_type'])
@Index('idx_webhook_status', ['status'])
@Index('idx_webhook_created', ['created_at'])
export class WebhookEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * The webhook provider (lemonsqueezy, stripe, etc.)
   */
  @Column({
    type: 'enum',
    enum: WebhookProvider
  })
  provider: WebhookProvider;

  /**
   * The external event ID from the provider
   * This ensures we don't process the same event twice
   */
  @Column({ length: 255 })
  external_id: string;

  /**
   * The event type (order_created, subscription_created, etc.)
   */
  @Column({ length: 100 })
  event_type: string;

  /**
   * Processing status of the webhook
   */
  @Column({
    type: 'enum',
    enum: WebhookStatus,
    default: WebhookStatus.PROCESSING
  })
  status: WebhookStatus;

  /**
   * Full webhook payload for debugging and audit
   * Stored as JSON for flexibility
   */
  @Column({ type: 'jsonb' })
  payload: Record<string, any>;

  /**
   * User ID if this webhook affects a specific user
   * Nullable for system-wide events
   */
  @Column({ nullable: true, length: 36 })
  user_id?: string;

  /**
   * Processing result or error message
   */
  @Column({ type: 'text', nullable: true })
  processing_result?: string;

  /**
   * Error details if processing failed
   */
  @Column({ type: 'text', nullable: true })
  error_details?: string;

  /**
   * How many times we've attempted to process this webhook
   */
  @Column({ type: 'int', default: 0 })
  processing_attempts: number;

  /**
   * When we last attempted to process this webhook
   */
  @Column({ type: 'timestamp', nullable: true })
  last_processed_at?: Date;

  @CreateDateColumn()
  created_at: Date;
}