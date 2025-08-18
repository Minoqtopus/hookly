import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum TemplateStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft'
}

export enum TemplateCategory {
  BEAUTY = 'beauty',
  FITNESS = 'fitness',
  TECH = 'tech',
  FOOD = 'food',
  FASHION = 'fashion',
  EDUCATION = 'education',
  LIFESTYLE = 'lifestyle',
  BUSINESS = 'business'
}

@Entity('templates')
@Index('idx_template_category_status', ['category', 'status'])
@Index('idx_template_popularity', ['is_popular', 'performance_score'])
export class Template {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({
    type: 'enum',
    enum: TemplateCategory
  })
  category: TemplateCategory;

  @Column({ type: 'varchar', length: 200 })
  target_audience: string;

  @Column({ type: 'text' })
  hook: string;

  @Column({ type: 'text' })
  script: string;

  @Column('jsonb')
  visuals: string[];

  @Column('jsonb')
  performance_metrics: {
    estimated_views: number;
    estimated_ctr: number;
    viral_score: number;
  };

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ type: 'boolean', default: false })
  is_popular: boolean;

  @Column({ type: 'boolean', default: true })
  is_featured: boolean;

  @Column({
    type: 'enum',
    enum: TemplateStatus,
    default: TemplateStatus.ACTIVE
  })
  status: TemplateStatus;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  performance_score: number;

  @Column({ type: 'int', default: 0 })
  usage_count: number;

  @Column({ type: 'int', default: 0 })
  conversion_count: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'uuid', nullable: true })
  created_by?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}