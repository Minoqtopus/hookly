import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum TemplateStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  REJECTED = 'rejected'
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

export enum TemplatePricingType {
  FREE = 'free',
  PREMIUM = 'premium',
  EXCLUSIVE = 'exclusive'
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

  // Marketplace & Revenue Sharing Fields
  @Column({
    type: 'enum',
    enum: TemplatePricingType,
    default: TemplatePricingType.FREE
  })
  pricing_type: TemplatePricingType;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  price_usd: number; // Premium template price ($10-25 range)

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.70 })
  creator_revenue_share: number; // 70% to creator, 30% to platform

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_revenue_generated: number; // Total revenue from sales

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  creator_earnings: number; // Creator's share of revenue

  @Column({ type: 'int', default: 0 })
  purchase_count: number; // Number of times purchased

  @Column({ type: 'int', default: 0 })
  download_count: number; // Number of times downloaded/used

  // Quality Control & Approval
  @Column({ type: 'uuid', nullable: true })
  approved_by?: string; // Admin who approved the template

  @Column({ type: 'timestamp', nullable: true })
  approved_at?: Date;

  @Column({ type: 'text', nullable: true })
  rejection_reason?: string; // Reason for rejection if status is 'rejected'

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  quality_score: number; // Quality score from 0-10

  // Analytics & Tracking
  @Column('jsonb', { default: '{}' })
  usage_analytics: {
    daily_usage?: Record<string, number>; // Date -> usage count
    platform_breakdown?: Record<string, number>; // Platform -> usage count
    conversion_rate?: number;
    avg_performance_score?: number;
  };

  @Column('jsonb', { default: '{}' })
  revenue_analytics: {
    monthly_revenue?: Record<string, number>; // Month -> revenue
    top_performing_niches?: string[];
    buyer_demographics?: {
      plans: Record<string, number>; // Plan type -> count
      regions?: Record<string, number>;
    };
  };

  // SEO & Discoverability
  @Column('simple-array', { nullable: true })
  keywords: string[]; // SEO keywords for discovery

  @Column({ type: 'int', default: 0 })
  favorites_count: number; // Number of users who favorited

  @Column({ type: 'int', default: 0 })
  review_count: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  average_rating: number; // Average user rating (0-5)

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}