import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('refresh_tokens')
@Index('idx_refresh_token_hash', ['token_hash'])
@Index('idx_refresh_token_user', ['user_id'])
@Index('idx_refresh_token_expires', ['expires_at'])
@Index('idx_refresh_token_family', ['token_family'])
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  token_hash: string; // SHA-256 hash of the actual token

  @Column({ type: 'uuid' })
  token_family: string; // Family ID for token rotation tracking

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_address?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  user_agent?: string;

  @Column({ type: 'boolean', default: false })
  is_revoked: boolean;

  @Column({ type: 'timestamp', nullable: true })
  revoked_at?: Date;

  @Column({ type: 'varchar', length: 200, nullable: true })
  revoked_reason?: string; // 'user_logout', 'admin_revoke', 'security_breach', 'token_rotation'

  @Column({ type: 'timestamp', nullable: true })
  last_used_at?: Date;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, user => user.refresh_tokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}