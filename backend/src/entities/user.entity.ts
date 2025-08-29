import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { RefreshToken } from './refresh-token.entity';
import { Generation } from './generation.entity';

export enum UserPlan {
  TRIAL = 'trial',
  STARTER = 'starter',
  PRO = 'pro'
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google',
  MICROSOFT = 'microsoft',
  APPLE = 'apple'
}

@Entity('users')
@Index('idx_user_email', ['email'])
@Index('idx_user_plan', ['plan'])
@Index('idx_user_provider_ids', ['provider_ids'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true })
  first_name?: string;

  @Column({ nullable: true })
  last_name?: string;

  @Column({ nullable: true })
  profile_picture?: string;

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

  @Column({
    type: 'simple-array',
    default: [AuthProvider.EMAIL]
  })
  auth_providers: AuthProvider[];

  // OAuth provider IDs (JSON field for multiple providers)
  @Column({ type: 'jsonb', nullable: true })
  provider_ids?: {
    google?: string;
    microsoft?: string;
    apple?: string;
  };

  @Column({ type: 'int', default: 0 })
  monthly_generation_count: number;

  @Column({ type: 'date', nullable: true })
  monthly_reset_date: Date;

  // Trial management fields
  @Column({ type: 'timestamp', nullable: true })
  trial_started_at?: Date;

  @Column({ type: 'timestamp', nullable: true })  
  trial_ends_at?: Date;

  @Column({ type: 'int', default: 0 })
  trial_generations_used: number;

  // Email verification fields
  @Column({ default: false })
  is_email_verified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  email_verified_at?: Date;

  // Password management fields
  @Column({ type: 'timestamp', nullable: true })
  password_changed_at?: Date;

  @Column({ type: 'int', default: 0 })
  total_generations: number;

  // Platform access flags (simplified for launch)
  @Column({ default: true })
  has_tiktok_access: boolean;

  @Column({ default: false })
  has_youtube_access: boolean;

  @Column({ default: false })
  has_instagram_access: boolean;

  // Trial abuse prevention fields
  @Column({ nullable: true, length: 45 })
  registration_ip?: string;

  @Column({ nullable: true, length: 500 })
  registration_user_agent?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => RefreshToken, refreshToken => refreshToken.user)
  refresh_tokens: RefreshToken[];

  @OneToMany(() => Generation, generation => generation.user)
  generations: Generation[];
}