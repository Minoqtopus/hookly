import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('generations')
@Index('idx_generation_user_created', ['user_id', 'created_at'])
@Index('idx_generation_featured', ['is_featured'])
@Index('idx_generation_guest', ['is_guest_generation', 'created_at'])
@Index('idx_generation_guest_ip', ['guest_ip_address', 'created_at'])
@Index('idx_generation_favorite_user', ['user_id', 'is_favorite'])
export class Generation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { nullable: true })
  user_id?: string;

  @Column({ nullable: true })
  title?: string;

  @Column()
  product_name: string;

  @Column()
  niche: string;

  @Column()
  target_audience: string;

  @Column('text')
  hook: string;

  @Column('text') 
  script: string;

  @Column('simple-array')
  visuals: string[];

  @Column({ default: false })
  is_favorite: boolean;

  @Column({ default: false })
  is_featured: boolean;

  @Column({ default: false })
  is_guest_generation: boolean;

  @Column({ nullable: true })
  guest_ip_address?: string;

  @Column('jsonb', { nullable: true })
  performance_data?: {
    views?: number;
    clicks?: number;
    conversions?: number;
    ctr?: number;
  };

  @Column('jsonb', { nullable: true })
  generation_metadata?: {
    processing_time_ms?: number;
    model_version?: string;
    ai_provider?: string;
    tokens_used?: number;
    retry_count?: number;
    error_count?: number;
    generated_at?: string;
    token_usage?: {
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
      estimatedCost: number;
    };
    cost?: number;
    quality_score?: number;
  };

  @Column({ type: 'int', default: 0 })
  share_count: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, user => user.generations)
  @JoinColumn({ name: 'user_id' })
  user?: User;
}