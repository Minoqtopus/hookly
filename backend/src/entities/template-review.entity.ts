import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Template } from './template.entity';
import { User } from './user.entity';

/**
 * Template Review Entity
 * User reviews and ratings for templates
 */
@Entity('template_reviews')
@Index('idx_template_review_template', ['template_id'])
@Index('idx_template_review_user', ['user_id'])
@Index('idx_template_review_rating', ['rating'])
export class TemplateReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  template_id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'decimal', precision: 2, scale: 1 })
  rating: number; // 1.0 to 5.0

  @Column({ type: 'text', nullable: true })
  review_text?: string;

  @Column({ type: 'boolean', default: false })
  is_verified_purchase: boolean; // Only users who purchased can leave verified reviews

  @Column({ type: 'int', default: 0 })
  helpful_votes: number; // Number of users who found review helpful

  @Column({ type: 'boolean', default: true })
  is_visible: boolean; // Admin can hide inappropriate reviews

  @Column('jsonb', { default: '{}' })
  usage_context: {
    platforms_used?: string[];
    niche?: string;
    performance_achieved?: {
      views?: number;
      engagement_rate?: number;
      conversions?: number;
    };
  };

  // Relations
  @ManyToOne(() => Template, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'template_id' })
  template: Template;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}