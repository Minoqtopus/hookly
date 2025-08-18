import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_settings')
export class UserSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  user_id: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Notification preferences
  @Column({ type: 'boolean', default: true })
  email_notifications: boolean;

  @Column({ type: 'boolean', default: true })
  marketing_emails: boolean;

  @Column({ type: 'boolean', default: true })
  product_updates: boolean;

  @Column({ type: 'boolean', default: false })
  usage_alerts: boolean;

  @Column({ type: 'boolean', default: true })
  trial_reminders: boolean;

  // Privacy settings
  @Column({ type: 'boolean', default: false })
  allow_analytics_tracking: boolean;

  @Column({ type: 'boolean', default: false })
  share_usage_data: boolean;

  @Column({ type: 'boolean', default: true })
  allow_performance_improvements: boolean;

  // Billing preferences
  @Column({ type: 'varchar', length: 10, default: 'USD' })
  preferred_currency: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  billing_name?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  billing_address?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  billing_city?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  billing_country?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  billing_postal_code?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tax_id?: string;

  // Generation preferences
  @Column({ type: 'varchar', length: 50, default: 'balanced' })
  generation_style: string; // 'conservative', 'balanced', 'aggressive'

  @Column({ type: 'varchar', length: 50, default: 'auto' })
  preferred_tone: string; // 'casual', 'professional', 'humorous', 'auto'

  @Column({ type: 'boolean', default: true })
  auto_save_generations: boolean;

  @Column({ type: 'int', default: 30 })
  script_length_preference: number; // in seconds

  // LemonSqueezy integration data
  @Column({ type: 'varchar', length: 100, nullable: true })
  lemonsqueezy_customer_id?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lemonsqueezy_subscription_id?: string;

  @Column('jsonb', { nullable: true })
  subscription_metadata?: {
    plan_name?: string;
    billing_cycle?: string;
    next_billing_date?: string;
    cancel_at_period_end?: boolean;
  };

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}