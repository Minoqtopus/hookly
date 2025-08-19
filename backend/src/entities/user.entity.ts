import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Generation } from './generation.entity';

export enum UserPlan {
  TRIAL = 'trial',
  STARTER = 'starter',
  PRO = 'pro',
  AGENCY = 'agency'
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google'
}

@Entity('users')
@Index('idx_user_email', ['email'])
@Index('idx_user_plan', ['plan'])
@Index('idx_user_google_id', ['google_id'])
@Index('idx_user_referral_code', ['referral_code'])
@Index('idx_user_trial_dates', ['trial_started_at', 'trial_ends_at'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password?: string;

  @Column({
    type: 'enum',
    enum: UserPlan,
    default: UserPlan.TRIAL
  })
  plan: UserPlan;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  role: UserRole;

  @Column({ type: 'int', default: 0 })
  monthly_count: number;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  reset_date: Date;

  @Column({ type: 'int', default: 0 })
  monthly_generation_count: number;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  monthly_reset_date: Date;

  // Trial management fields
  @Column({ type: 'timestamp', nullable: true })
  trial_started_at?: Date;

  @Column({ type: 'timestamp', nullable: true })  
  trial_ends_at?: Date;

  @Column({ type: 'int', default: 0 })
  trial_generations_used: number;

  @Column({ nullable: true })
  google_id?: string;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.EMAIL
  })
  auth_provider: AuthProvider;

  @Column({ nullable: true })
  avatar_url?: string;

  @Column({ default: false })
  is_verified: boolean;

  @Column({ nullable: true, unique: true })
  referral_code?: string;

  @Column({ type: 'int', default: 0 })
  total_generations: number;

  @Column({ type: 'int', default: 0 })
  referral_count: number;

  // Feature flags for different plan tiers
  @Column({ default: false })
  has_batch_generation: boolean;

  @Column({ default: false })
  has_advanced_analytics: boolean;

  @Column({ default: false })
  has_api_access: boolean;

  @Column({ default: false })
  has_team_features: boolean;

  @Column({ default: false })
  has_white_label: boolean;

  @Column({ default: false })
  has_custom_integrations: boolean;

  // Beta user management
  @Column({ type: 'boolean', default: false })
  is_beta_user: boolean;

  @Column({ type: 'timestamp', nullable: true })
  beta_expires_at?: Date; // When beta access expires

  // Conversion tracking
  @Column({ type: 'timestamp', nullable: true })
  first_generation_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  first_paid_at?: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  conversion_source?: string;

  // Plan-specific limits
  @Column({ type: 'int', nullable: true })
  monthly_generation_limit?: number; // null = unlimited

  // Overage tracking and pricing
  @Column({ type: 'int', default: 0 })
  overage_generations: number; // Generations beyond monthly limit

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  overage_charges: number; // Total overage charges in USD

  @Column({ type: 'timestamp', nullable: true })
  last_overage_notification?: Date; // When user was last notified about overage

  @Column({ type: 'boolean', default: false })
  overage_warning_sent: boolean; // Whether 80% usage warning was sent

  // Platform-specific feature flags
  @Column({ default: true })
  has_tiktok_access: boolean;

  @Column({ default: false })
  has_x_access: boolean;

  @Column({ default: false })
  has_instagram_access: boolean;

  @Column({ default: false })
  has_youtube_access: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Generation, generation => generation.user)
  generations: Generation[];
}