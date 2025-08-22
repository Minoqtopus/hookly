import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Generation } from './generation.entity';
import { RefreshToken } from './refresh-token.entity';

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
  GOOGLE = 'google'
}

@Entity('users')
@Index('idx_user_email', ['email'])
@Index('idx_user_plan', ['plan'])
@Index('idx_user_google_id', ['google_id'])
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
  monthly_generation_count: number;

  @Column({ type: 'date', nullable: true })
  monthly_reset_date: Date;

  // Trial management fields
  @Column({ type: 'timestamp' })
  trial_started_at?: Date;

  @Column({ type: 'timestamp' })  
  trial_ends_at?: Date;

  @Column({ type: 'int', default: 0 })
  trial_generations_used: number;

  @Column({ nullable: true })
  google_id?: string;

  @Column({
    type: 'simple-array',
    default: [AuthProvider.EMAIL]
  })
  auth_providers: AuthProvider[];

  @Column({ nullable: true })
  avatar_url?: string;

  @Column({ default: false })
  is_verified: boolean;

  @Column({ type: 'int', default: 0 })
  total_generations: number;

  // Platform access flags (simplified for launch)
  @Column({ default: true })
  has_tiktok_access: boolean;

  @Column({ default: false })
  has_x_access: boolean;

  @Column({ default: false })
  has_instagram_access: boolean;

  // Beta user fields for promo codes
  @Column({ default: false })
  is_beta_user: boolean;

  @Column({ type: 'timestamp', nullable: true })
  beta_expires_at?: Date;

  // Trial abuse prevention fields
  @Column({ nullable: true, length: 45 })
  registration_ip?: string;

  @Column({ nullable: true, length: 500 })
  registration_user_agent?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Generation, generation => generation.user)
  generations: Generation[];

  @OneToMany(() => RefreshToken, refreshToken => refreshToken.user)
  refresh_tokens: RefreshToken[];
}