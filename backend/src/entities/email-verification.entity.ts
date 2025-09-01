import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  EXPIRED = 'expired',
  FAILED = 'failed',
  RESENT = 'resent'
}

export enum VerificationType {
  EMAIL_VERIFICATION = 'email_verification',
  EMAIL_CHANGE = 'email_change',
  PASSWORD_RESET = 'password_reset'
}

@Entity('email_verifications')
@Index('idx_verification_token', ['token'])
@Index('idx_verification_email', ['email'])
@Index('idx_verification_user_type', ['user_id', 'type'])
export class EmailVerification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 225, unique: true })
  token: string;

  @Column({
    type: 'enum',
    enum: VerificationType,
    default: VerificationType.EMAIL_VERIFICATION
  })
  type: VerificationType;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING
  })
  status: VerificationStatus;

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  verified_at?: Date;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_address?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  user_agent?: string;

  @Column({ type: 'int', default: 0 })
  attempt_count: number;

  @Column({ type: 'timestamp', nullable: true })
  last_attempt_at?: Date;

  @Column('jsonb', { nullable: true })
  metadata?: {
    old_email?: string; // For email change requests
    registration_source?: string;
    resend_count?: number;
    verification_method?: string;
  };

  @CreateDateColumn()
  created_at: Date;
}