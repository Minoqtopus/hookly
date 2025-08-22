import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

export enum EventType {
  // Core user actions
  USER_SIGNUP = 'user_signup',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  EMAIL_VERIFIED = 'email_verified',
  
  // Core generation events
  GENERATION_STARTED = 'generation_started',
  GENERATION_COMPLETED = 'generation_completed',
  GENERATION_FAILED = 'generation_failed',
  
  // Core engagement events
  COPY_TO_CLIPBOARD = 'copy_to_clipboard',
  SAVE_TO_FAVORITES = 'save_to_favorites',
  
  // Core conversion events
  TRIAL_STARTED = 'trial_started',
  UPGRADE_MODAL_SHOWN = 'upgrade_modal_shown',
  UPGRADE_INITIATED = 'upgrade_initiated',
  UPGRADE_COMPLETED = 'upgrade_completed',
  
  // Core page views
  PAGE_VIEW = 'page_view',
  DEMO_COMPLETED = 'demo_completed',
  PRICING_PAGE_VIEWED = 'pricing_page_viewed'
}

@Entity('analytics_events')
@Index('idx_analytics_user_event', ['user_id', 'event_type'])
@Index('idx_analytics_event_time', ['event_type', 'created_at'])
export class AnalyticsEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({
    type: 'enum',
    enum: EventType
  })
  event_type: EventType;

  @Column({ type: 'varchar', length: 200, nullable: true })
  page_url?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  referrer?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  user_agent?: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_address?: string;

  @Column('jsonb', { nullable: true })
  event_data?: {
    generation_id?: string;
    plan_type?: string;
    amount?: number;
    currency?: string;
    error_message?: string;
    feature_used?: string;
    conversion_source?: string;
    [key: string]: any;
  };

  @Column('jsonb', { nullable: true })
  user_context?: {
    plan?: string;
    trial_days_remaining?: number;
    generations_used?: number;
    signup_date?: string;
    last_active?: string;
  };

  @CreateDateColumn()
  created_at: Date;
}