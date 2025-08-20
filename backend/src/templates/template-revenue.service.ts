import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Template, TemplatePricingType } from '../entities/template.entity';
import { TemplatePurchase, PurchaseStatus } from '../entities/template-purchase.entity';
import { User } from '../entities/user.entity';

export interface PurchaseResult {
  success: boolean;
  purchase?: TemplatePurchase;
  error?: string;
}

export interface CreatorEarnings {
  creatorId: string;
  totalEarnings: number;
  monthlyEarnings: Record<string, number>;
  topTemplates: Array<{
    templateId: string;
    title: string;
    earnings: number;
    purchaseCount: number;
  }>;
  pendingPayouts: number;
}

/**
 * Template Revenue Sharing Service
 * Handles premium template purchases and creator revenue distribution
 * 
 * Revenue Model:
 * - Premium templates: $10-25 range
 * - Creator gets 70% of revenue
 * - Platform gets 30% of revenue
 */
@Injectable()
export class TemplateRevenueService {
  private readonly logger = new Logger(TemplateRevenueService.name);
  private readonly PLATFORM_REVENUE_SHARE = 0.30;
  private readonly CREATOR_REVENUE_SHARE = 0.70;
  
  constructor(
    @InjectRepository(Template)
    private templateRepository: Repository<Template>,
    @InjectRepository(TemplatePurchase)
    private purchaseRepository: Repository<TemplatePurchase>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Process template purchase with revenue sharing
   */
  async purchaseTemplate(
    templateId: string, 
    buyerId: string, 
    paymentMetadata: any = {}
  ): Promise<PurchaseResult> {
    try {
      // Validate template exists and is purchasable
      const template = await this.templateRepository.findOne({
        where: { id: templateId }
      });

      if (!template) {
        return { success: false, error: 'Template not found' };
      }

      if (template.pricing_type === TemplatePricingType.FREE) {
        return { success: false, error: 'Template is free, no purchase required' };
      }

      if (template.price_usd <= 0) {
        return { success: false, error: 'Invalid template price' };
      }

      // Check if user already purchased this template
      const existingPurchase = await this.purchaseRepository.findOne({
        where: { 
          template_id: templateId, 
          user_id: buyerId,
          status: PurchaseStatus.COMPLETED
        }
      });

      if (existingPurchase) {
        return { success: false, error: 'Template already purchased' };
      }

      // Calculate revenue shares
      const purchasePrice = template.price_usd;
      const creatorShare = purchasePrice * this.CREATOR_REVENUE_SHARE;
      const platformShare = purchasePrice * this.PLATFORM_REVENUE_SHARE;

      // Create purchase record
      const purchase = this.purchaseRepository.create({
        template_id: templateId,
        user_id: buyerId,
        creator_id: template.created_by!,
        purchase_price: purchasePrice,
        creator_share: creatorShare,
        platform_share: platformShare,
        status: PurchaseStatus.COMPLETED,
        purchase_metadata: {
          ...paymentMetadata,
          processed_at: new Date().toISOString(),
        },
        processed_at: new Date(),
      });

      const savedPurchase = await this.purchaseRepository.save(purchase);

      // Update template metrics
      await this.updateTemplateMetrics(templateId, purchasePrice, creatorShare);

      // Update creator earnings
      await this.updateCreatorEarnings(template.created_by!, creatorShare);

      this.logger.log(`Template purchase completed: ${templateId} by ${buyerId} for $${purchasePrice}`);

      return { success: true, purchase: savedPurchase };

    } catch (error: any) {
      this.logger.error(`Template purchase failed: ${templateId}`, error);
      return { success: false, error: error.message || 'Purchase failed' };
    }
  }

  /**
   * Get creator earnings and analytics
   */
  async getCreatorEarnings(creatorId: string): Promise<CreatorEarnings> {
    try {
      // Get total earnings
      const totalEarningsResult = await this.purchaseRepository
        .createQueryBuilder('purchase')
        .select('SUM(purchase.creator_share)', 'total')
        .where('purchase.creator_id = :creatorId', { creatorId })
        .andWhere('purchase.status = :status', { status: PurchaseStatus.COMPLETED })
        .getRawOne();

      const totalEarnings = parseFloat(totalEarningsResult.total || '0');

      // Get monthly earnings for last 12 months
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      const monthlyEarningsResult = await this.purchaseRepository
        .createQueryBuilder('purchase')
        .select([
          'EXTRACT(YEAR FROM purchase.created_at) as year',
          'EXTRACT(MONTH FROM purchase.created_at) as month',
          'SUM(purchase.creator_share) as earnings'
        ])
        .where('purchase.creator_id = :creatorId', { creatorId })
        .andWhere('purchase.status = :status', { status: PurchaseStatus.COMPLETED })
        .andWhere('purchase.created_at >= :startDate', { startDate: twelveMonthsAgo })
        .groupBy('EXTRACT(YEAR FROM purchase.created_at), EXTRACT(MONTH FROM purchase.created_at)')
        .orderBy('year, month')
        .getRawMany();

      const monthlyEarnings: Record<string, number> = {};
      monthlyEarningsResult.forEach(row => {
        const monthKey = `${row.year}-${String(row.month).padStart(2, '0')}`;
        monthlyEarnings[monthKey] = parseFloat(row.earnings);
      });

      // Get top performing templates
      const topTemplatesResult = await this.purchaseRepository
        .createQueryBuilder('purchase')
        .select([
          'purchase.template_id as templateId',
          'template.title as title',
          'SUM(purchase.creator_share) as earnings',
          'COUNT(purchase.id) as purchaseCount'
        ])
        .innerJoin(Template, 'template', 'template.id = purchase.template_id')
        .where('purchase.creator_id = :creatorId', { creatorId })
        .andWhere('purchase.status = :status', { status: PurchaseStatus.COMPLETED })
        .groupBy('purchase.template_id, template.title')
        .orderBy('earnings', 'DESC')
        .limit(5)
        .getRawMany();

      const topTemplates = topTemplatesResult.map(row => ({
        templateId: row.templateId,
        title: row.title,
        earnings: parseFloat(row.earnings),
        purchaseCount: parseInt(row.purchaseCount),
      }));

      return {
        creatorId,
        totalEarnings,
        monthlyEarnings,
        topTemplates,
        pendingPayouts: 0, // TODO: Implement payout tracking
      };

    } catch (error: any) {
      this.logger.error(`Failed to get creator earnings for ${creatorId}:`, error);
      throw new BadRequestException('Failed to retrieve earnings data');
    }
  }

  /**
   * Get template purchase analytics
   */
  async getTemplatePurchaseAnalytics(templateId: string) {
    try {
      const template = await this.templateRepository.findOne({
        where: { id: templateId }
      });

      if (!template) {
        throw new NotFoundException('Template not found');
      }

      // Get purchase metrics
      const purchaseMetrics = await this.purchaseRepository
        .createQueryBuilder('purchase')
        .select([
          'COUNT(purchase.id) as totalPurchases',
          'SUM(purchase.purchase_price) as totalRevenue',
          'AVG(purchase.purchase_price) as avgPrice',
          'COUNT(DISTINCT purchase.user_id) as uniqueBuyers'
        ])
        .where('purchase.template_id = :templateId', { templateId })
        .andWhere('purchase.status = :status', { status: PurchaseStatus.COMPLETED })
        .getRawOne();

      // Get monthly purchase trends
      const monthlyTrends = await this.purchaseRepository
        .createQueryBuilder('purchase')
        .select([
          'EXTRACT(YEAR FROM purchase.created_at) as year',
          'EXTRACT(MONTH FROM purchase.created_at) as month',
          'COUNT(purchase.id) as purchases',
          'SUM(purchase.purchase_price) as revenue'
        ])
        .where('purchase.template_id = :templateId', { templateId })
        .andWhere('purchase.status = :status', { status: PurchaseStatus.COMPLETED })
        .andWhere('purchase.created_at >= :startDate', { 
          startDate: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) // 6 months
        })
        .groupBy('EXTRACT(YEAR FROM purchase.created_at), EXTRACT(MONTH FROM purchase.created_at)')
        .orderBy('year, month')
        .getRawMany();

      return {
        templateId,
        title: template.title,
        pricing: {
          currentPrice: template.price_usd,
          pricingType: template.pricing_type,
        },
        metrics: {
          totalPurchases: parseInt(purchaseMetrics.totalPurchases || '0'),
          totalRevenue: parseFloat(purchaseMetrics.totalRevenue || '0'),
          avgPrice: parseFloat(purchaseMetrics.avgPrice || '0'),
          uniqueBuyers: parseInt(purchaseMetrics.uniqueBuyers || '0'),
        },
        trends: monthlyTrends.map(row => ({
          period: `${row.year}-${String(row.month).padStart(2, '0')}`,
          purchases: parseInt(row.purchases),
          revenue: parseFloat(row.revenue),
        })),
      };

    } catch (error: any) {
      this.logger.error(`Failed to get template analytics for ${templateId}:`, error);
      throw error;
    }
  }

  /**
   * Get marketplace performance overview
   */
  async getMarketplaceOverview() {
    try {
      // Total marketplace metrics
      const overviewMetrics = await this.purchaseRepository
        .createQueryBuilder('purchase')
        .select([
          'COUNT(purchase.id) as totalTransactions',
          'SUM(purchase.purchase_price) as totalGMV',
          'SUM(purchase.platform_share) as platformRevenue',
          'SUM(purchase.creator_share) as creatorPayouts',
          'COUNT(DISTINCT purchase.creator_id) as activeCreators',
          'COUNT(DISTINCT purchase.user_id) as activeBuyers'
        ])
        .where('purchase.status = :status', { status: PurchaseStatus.COMPLETED })
        .getRawOne();

      // Top performing categories
      const categoryPerformance = await this.purchaseRepository
        .createQueryBuilder('purchase')
        .select([
          'template.category as category',
          'COUNT(purchase.id) as sales',
          'SUM(purchase.purchase_price) as revenue'
        ])
        .innerJoin(Template, 'template', 'template.id = purchase.template_id')
        .where('purchase.status = :status', { status: PurchaseStatus.COMPLETED })
        .groupBy('template.category')
        .orderBy('revenue', 'DESC')
        .getRawMany();

      return {
        overview: {
          totalTransactions: parseInt(overviewMetrics.totalTransactions || '0'),
          totalGMV: parseFloat(overviewMetrics.totalGMV || '0'),
          platformRevenue: parseFloat(overviewMetrics.platformRevenue || '0'),
          creatorPayouts: parseFloat(overviewMetrics.creatorPayouts || '0'),
          activeCreators: parseInt(overviewMetrics.activeCreators || '0'),
          activeBuyers: parseInt(overviewMetrics.activeBuyers || '0'),
        },
        categoryPerformance: categoryPerformance.map(row => ({
          category: row.category,
          sales: parseInt(row.sales),
          revenue: parseFloat(row.revenue),
        })),
      };

    } catch (error: any) {
      this.logger.error('Failed to get marketplace overview:', error);
      throw new BadRequestException('Failed to retrieve marketplace data');
    }
  }

  // Private helper methods
  private async updateTemplateMetrics(templateId: string, purchasePrice: number, creatorShare: number): Promise<void> {
    await this.templateRepository
      .createQueryBuilder()
      .update(Template)
      .set({
        purchase_count: () => 'purchase_count + 1',
        total_revenue_generated: () => `total_revenue_generated + ${purchasePrice}`,
        creator_earnings: () => `creator_earnings + ${creatorShare}`,
      })
      .where('id = :templateId', { templateId })
      .execute();
  }

  private async updateCreatorEarnings(creatorId: string, earnings: number): Promise<void> {
    // This would typically update a creator earnings summary table
    // For now, we'll just log it
    this.logger.log(`Creator ${creatorId} earned $${earnings} from template purchase`);
  }
}