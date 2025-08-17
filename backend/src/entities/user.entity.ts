import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Generation } from './generation.entity';

export enum UserPlan {
  TRIAL = 'trial',
  CREATOR = 'creator', 
  AGENCY = 'agency'
}

export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google'
}

@Entity('users')
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

  @Column({ type: 'int', default: 0 })
  monthly_count: number;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  reset_date: Date;

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

  // Beta user flag for free Agency access
  @Column({ type: 'boolean', default: false })
  is_beta_user: boolean;

  // Plan-specific limits
  @Column({ type: 'int', nullable: true })
  monthly_generation_limit?: number; // null = unlimited

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Generation, generation => generation.user)
  generations: Generation[];
}