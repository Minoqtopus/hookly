import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('generations')
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

  @Column('jsonb')
  output: {
    script: string;
    hook: string;
    visuals: string[];
  };

  @Column({ default: false })
  is_favorite: boolean;

  @Column({ default: false })
  is_featured: boolean;

  @Column({ default: false })
  is_guest_generation: boolean;

  @Column('jsonb', { nullable: true })
  performance_data?: {
    views?: number;
    clicks?: number;
    conversions?: number;
    ctr?: number;
  };

  @Column({ type: 'int', default: 0 })
  share_count: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, user => user.generations)
  @JoinColumn({ name: 'user_id' })
  user?: User;
}