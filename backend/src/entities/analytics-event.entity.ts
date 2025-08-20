import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

export enum EventType {
  // User actions
  USER_SIGNUP = 'user_signup',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  EMAIL_VERIFIED = 'email_verified',
  
  // Generation events
  GENERATION_STARTED = 'generation_started',
  GENERATION_COMPLETED = 'generation_completed',
  GENERATION_FAILED = 'generation_failed',
  TEMPLATE_USED = 'template_used',
  
  // Engagement events
  COPY_TO_CLIPBOARD = 'copy_to_clipboard',
  SAVE_TO_FAVORITES = 'save_to_favorites',
  SHARE_GENERATION = 'share_generation',
  EXPORT_GENERATION = 'export_generation',
  
  // Conversion events
  TRIAL_STARTED = 'trial_started',
  UPGRADE_MODAL_SHOWN = 'upgrade_modal_shown',
  UPGRADE_INITIATED = 'upgrade_initiated',
  UPGRADE_COMPLETED = 'upgrade_completed',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
  
  // Team events
  TEAM_CREATED = 'team_created',
  TEAM_MEMBER_INVITED = 'team_member_invited',
  TEAM_GENERATION_SHARED = 'team_generation_shared',
  
  // Enterprise upsell events
  ENTERPRISE_UPSELL_PURCHASED = 'enterprise_upsell_purchased',
  ENTERPRISE_UPSELL_CANCELLED = 'enterprise_upsell_cancelled',
  CUSTOM_INTEGRATION_REQUESTED = 'custom_integration_requested',
  WHITE_LABEL_ENABLED = 'white_label_enabled',
  DEDICATED_SUPPORT_UPGRADED = 'dedicated_support_upgraded',
  
  // Page views
  PAGE_VIEW = 'page_view',
  DEMO_COMPLETED = 'demo_completed',
  PRICING_PAGE_VIEWED = 'pricing_page_viewed'
}

@Entity('analytics_events')
@Index('idx_analytics_user_event', ['user_id', 'event_type'])
@Index('idx_analytics_event_time', ['event_type', 'created_at'])
@Index('idx_analytics_session', ['session_id'])
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

  @Column({ type: 'varchar', length: 100, nullable: true })
  session_id?: string;

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
    template_id?: string;
    team_id?: string;
    plan_type?: string;
    amount?: number;
    currency?: string;
    error_message?: string;
    feature_used?: string;
    time_spent?: number;
    conversion_source?: string;
    [key: string]: any;
  };

  @Column('jsonb', { nullable: true })
  user_context?: {
    plan?: string;
    trial_days_remaining?: number;
    generations_used?: number;
    is_beta_user?: boolean;
    signup_date?: string;
    last_active?: string;
  };

  @CreateDateColumn()
  created_at: Date;
}