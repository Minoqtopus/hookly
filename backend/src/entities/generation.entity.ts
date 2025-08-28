import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

export enum GenerationType {
  INSTAGRAM = 'instagram',
  TIKTOK = 'tiktok',
  YOUTUBE = 'youtube'
}

export enum GenerationStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

@Entity('generations')
@Index('idx_generation_user', ['user'])
@Index('idx_generation_status', ['status'])
@Index('idx_generation_created', ['created_at'])
export class Generation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.generations)
  user: User;

  @Column({ length: 500 })
  title: string;

  @Column({ type: 'text' })
  hook: string;

  @Column({ type: 'text' })
  script: string;

  @Column({
    type: 'enum',
    enum: GenerationType,
    default: GenerationType.TIKTOK
  })
  platform: GenerationType;

  @Column({
    type: 'enum',
    enum: GenerationStatus,
    default: GenerationStatus.PENDING
  })
  status: GenerationStatus;

  @Column({ length: 100, nullable: true })
  niche?: string;

  @Column({ length: 200, nullable: true })
  target_audience?: string;

  @Column({ type: 'jsonb', nullable: true })
  performance_data?: {
    views?: number;
    clicks?: number;
    conversions?: number;
    ctr?: number;
    engagement_rate?: number;
  };

  @Column({ default: false })
  is_favorite: boolean;

  @Column({ default: false })
  is_demo: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}