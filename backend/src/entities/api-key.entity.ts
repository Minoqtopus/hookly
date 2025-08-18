import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Team } from './team.entity';

export enum ApiKeyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  REVOKED = 'revoked'
}

export enum ApiKeyScope {
  GENERATION_READ = 'generation:read',
  GENERATION_WRITE = 'generation:write',
  TEMPLATE_READ = 'template:read',
  ANALYTICS_READ = 'analytics:read',
  TEAM_READ = 'team:read',
  TEAM_WRITE = 'team:write'
}

@Entity('api_keys')
@Index('idx_api_key_hash', ['key_hash'])
@Index('idx_api_key_user', ['user_id', 'status'])
@Index('idx_api_key_team', ['team_id', 'status'])
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  key_hash: string; // SHA-256 hash of the actual key

  @Column({ type: 'varchar', length: 20 })
  key_prefix: string; // First 8 characters for identification

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  team_id?: string;

  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({ name: 'team_id' })
  team?: Team;

  @Column({
    type: 'enum',
    enum: ApiKeyStatus,
    default: ApiKeyStatus.ACTIVE
  })
  status: ApiKeyStatus;

  @Column('simple-array')
  scopes: ApiKeyScope[];

  @Column({ type: 'timestamp', nullable: true })
  expires_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_used_at?: Date;

  @Column({ type: 'varchar', length: 45, nullable: true })
  last_used_ip?: string;

  @Column({ type: 'int', default: 0 })
  usage_count: number;

  @Column({ type: 'int', nullable: true })
  rate_limit_per_hour?: number;

  @Column('jsonb', { nullable: true })
  metadata?: {
    description?: string;
    created_by_ip?: string;
    created_by_user_agent?: string;
    usage_notes?: string;
  };

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}