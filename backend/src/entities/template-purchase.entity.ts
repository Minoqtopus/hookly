import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Template } from './template.entity';
import { User } from './user.entity';

export enum PurchaseStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  REFUNDED = 'refunded',
  FAILED = 'failed'
}

/**
 * Template Purchase Entity
 * Tracks all template purchases for revenue sharing and analytics
 */
@Entity('template_purchases')
@Index('idx_template_purchase_user', ['user_id'])
@Index('idx_template_purchase_template', ['template_id'])
@Index('idx_template_purchase_creator', ['creator_id'])
@Index('idx_template_purchase_date', ['created_at'])
export class TemplatePurchase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  template_id: string;

  @Column({ type: 'uuid' })
  user_id: string; // Buyer

  @Column({ type: 'uuid' })
  creator_id: string; // Template creator

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  purchase_price: number; // Price at time of purchase

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  creator_share: number; // Creator's revenue share

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  platform_share: number; // Platform's revenue share

  @Column({
    type: 'enum',
    enum: PurchaseStatus,
    default: PurchaseStatus.PENDING
  })
  status: PurchaseStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  payment_method?: string; // stripe, paypal, etc.

  @Column({ type: 'varchar', length: 100, nullable: true })
  transaction_id?: string; // External payment processor ID

  @Column('jsonb', { default: '{}' })
  purchase_metadata: {
    user_plan?: string;
    discount_applied?: number;
    coupon_code?: string;
    ip_address?: string;
    user_agent?: string;
    referrer?: string;
  };

  @Column({ type: 'timestamp', nullable: true })
  processed_at?: Date; // When payment was processed

  @Column({ type: 'timestamp', nullable: true })
  refunded_at?: Date;

  @Column({ type: 'text', nullable: true })
  refund_reason?: string;

  // Relations
  @ManyToOne(() => Template, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'template_id' })
  template: Template;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  buyer: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @CreateDateColumn()
  created_at: Date;
}