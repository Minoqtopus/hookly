import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template, TemplatePricingType, TemplateCategory } from '../entities/template.entity';

export interface PricingRecommendation {
  suggestedPrice: number;
  reasoning: string;
  competitorAnalysis: {
    categoryAverage: number;
    topPerformers: number[];
    marketPosition: 'premium' | 'competitive' | 'value';
  };
  revenueProjection: {
    conservative: number; // Monthly revenue estimate
    optimistic: number;
    breakeven: number; // Sales needed to break even
  };
}

export interface PricingStrategy {
  basePrice: number;
  categoryMultiplier: number;
  qualityBonus: number;
  popularityBonus: number;
  finalPrice: number;
}

/**
 * Template Pricing Service
 * Manages premium template pricing in the $10-25 range
 * Uses data-driven pricing strategies based on:
 * - Template quality and performance
 * - Category demand and competition
 * - Creator reputation and track record
 * - Market positioning strategy
 */
@Injectable()
export class TemplatePricingService {
  private readonly logger = new Logger(TemplatePricingService.name);
  
  // Pricing constraints
  private readonly MIN_PREMIUM_PRICE = 10.00;
  private readonly MAX_PREMIUM_PRICE = 25.00;
  private readonly DEFAULT_BASE_PRICE = 15.00;

  // Category pricing multipliers
  private readonly CATEGORY_MULTIPLIERS: Record<TemplateCategory, number> = {
    [TemplateCategory.BUSINESS]: 1.4, // Highest value - $21 base
    [TemplateCategory.TECH]: 1.3, // High demand - $19.50 base
    // [TemplateCategory.FINANCE]: 1.3, // (if we add this category)
    [TemplateCategory.EDUCATION]: 1.2, // Professional - $18 base
    [TemplateCategory.LIFESTYLE]: 1.0, // Standard - $15 base
    [TemplateCategory.FITNESS]: 1.0, // Standard - $15 base
    [TemplateCategory.BEAUTY]: 0.9, // Competitive market - $13.50 base
    [TemplateCategory.FASHION]: 0.9, // Competitive market - $13.50 base
    [TemplateCategory.FOOD]: 0.8, // Lower pricing - $12 base
  } as Record<TemplateCategory, number>;

  constructor(
    @InjectRepository(Template)
    private templateRepository: Repository<Template>,
  ) {}

  /**
   * Get pricing recommendation for a template
   */
  async getPricingRecommendation(templateId: string): Promise<PricingRecommendation> {
    const template = await this.templateRepository.findOne({
      where: { id: templateId }
    });

    if (!template) {
      throw new BadRequestException('Template not found');
    }

    // Calculate suggested price using our pricing strategy
    const pricingStrategy = await this.calculatePricingStrategy(template);
    const suggestedPrice = this.roundToValidPrice(pricingStrategy.finalPrice);

    // Get competitor analysis
    const competitorAnalysis = await this.getCompetitorAnalysis(template.category);

    // Calculate revenue projections
    const revenueProjection = this.calculateRevenueProjection(template, suggestedPrice);

    // Generate pricing reasoning
    const reasoning = this.generatePricingReasoning(template, pricingStrategy, competitorAnalysis);

    return {
      suggestedPrice,
      reasoning,
      competitorAnalysis,
      revenueProjection,
    };
  }

  /**
   * Set premium pricing for a template
   */
  async setPremiumPricing(
    templateId: string, 
    price: number,
    creatorId?: string
  ): Promise<void> {
    // Validate price range
    if (price < this.MIN_PREMIUM_PRICE || price > this.MAX_PREMIUM_PRICE) {
      throw new BadRequestException(
        `Premium template price must be between $${this.MIN_PREMIUM_PRICE} and $${this.MAX_PREMIUM_PRICE}`
      );
    }

    const template = await this.templateRepository.findOne({
      where: { id: templateId }
    });

    if (!template) {
      throw new BadRequestException('Template not found');
    }

    // Verify creator ownership if provided
    if (creatorId && template.created_by !== creatorId) {
      throw new BadRequestException('Only template creator can set pricing');
    }

    // Update template pricing
    await this.templateRepository.update(templateId, {
      pricing_type: TemplatePricingType.PREMIUM,
      price_usd: price,
    });

    this.logger.log(`Template ${templateId} pricing set to $${price}`);
  }

  /**
   * Get optimal pricing for bulk template pricing
   */
  async getBulkPricingRecommendations(creatorId: string): Promise<Array<{
    templateId: string;
    title: string;
    currentPrice: number;
    recommendedPrice: number;
    potentialIncrease: number;
  }>> {
    const templates = await this.templateRepository.find({
      where: { 
        created_by: creatorId,
        pricing_type: TemplatePricingType.PREMIUM
      }
    });

    const recommendations = [];

    for (const template of templates) {
      const recommendation = await this.getPricingRecommendation(template.id);
      const potentialIncrease = recommendation.suggestedPrice - template.price_usd;

      recommendations.push({
        templateId: template.id,
        title: template.title,
        currentPrice: template.price_usd,
        recommendedPrice: recommendation.suggestedPrice,
        potentialIncrease,
      });
    }

    // Sort by potential revenue increase
    return recommendations.sort((a, b) => b.potentialIncrease - a.potentialIncrease);
  }

  /**
   * Apply dynamic pricing based on performance
   */
  async applyDynamicPricing(templateId: string): Promise<{ oldPrice: number; newPrice: number; reason: string }> {
    const template = await this.templateRepository.findOne({
      where: { id: templateId }
    });

    if (!template) {
      throw new BadRequestException('Template not found');
    }

    const oldPrice = template.price_usd;
    let newPrice = oldPrice;
    let reason = 'No price change needed';

    // Increase price for high-performing templates
    if (template.performance_score >= 9.0 && template.purchase_count >= 50) {
      newPrice = Math.min(oldPrice * 1.15, this.MAX_PREMIUM_PRICE); // 15% increase, capped
      reason = 'High performance and sales volume warrant premium pricing';
    }
    // Decrease price for underperforming templates
    else if (template.performance_score <= 6.0 && template.purchase_count < 5) {
      newPrice = Math.max(oldPrice * 0.9, this.MIN_PREMIUM_PRICE); // 10% decrease, floor
      reason = 'Low performance suggests price reduction to increase sales';
    }
    // Increase price for trending templates
    else if (template.usage_count >= 1000 && template.favorites_count >= 100) {
      newPrice = Math.min(oldPrice * 1.1, this.MAX_PREMIUM_PRICE); // 10% increase
      reason = 'High usage and popularity support price increase';
    }

    if (newPrice !== oldPrice) {
      await this.templateRepository.update(templateId, {
        price_usd: this.roundToValidPrice(newPrice),
      });
    }

    return {
      oldPrice,
      newPrice: this.roundToValidPrice(newPrice),
      reason,
    };
  }

  // Private helper methods
  private async calculatePricingStrategy(template: Template): Promise<PricingStrategy> {
    const basePrice = this.DEFAULT_BASE_PRICE;
    
    // Category multiplier
    const categoryMultiplier = this.CATEGORY_MULTIPLIERS[template.category] || 1.0;
    
    // Quality bonus based on performance score
    const qualityBonus = Math.max(0, (template.performance_score - 5) * 0.5); // +$0.50 per point above 5
    
    // Popularity bonus based on usage and favorites
    const popularityScore = Math.min(10, (template.usage_count / 100) + (template.favorites_count / 50));
    const popularityBonus = popularityScore * 0.3; // Up to $3 bonus
    
    const finalPrice = basePrice * categoryMultiplier + qualityBonus + popularityBonus;

    return {
      basePrice,
      categoryMultiplier,
      qualityBonus,
      popularityBonus,
      finalPrice,
    };
  }

  private async getCompetitorAnalysis(category: TemplateCategory) {
    const competitorTemplates = await this.templateRepository
      .createQueryBuilder('template')
      .select(['AVG(template.price_usd) as avgPrice'])
      .addSelect('array_agg(template.price_usd ORDER BY template.purchase_count DESC LIMIT 5)', 'topPrices')
      .where('template.category = :category', { category })
      .andWhere('template.pricing_type = :pricingType', { pricingType: TemplatePricingType.PREMIUM })
      .andWhere('template.price_usd > 0')
      .getRawOne();

    const categoryAverage = parseFloat(competitorTemplates.avgPrice || '15');
    const topPerformers = competitorTemplates.topPrices || [];
    
    let marketPosition: 'premium' | 'competitive' | 'value' = 'competitive';
    if (categoryAverage > 18) marketPosition = 'premium';
    else if (categoryAverage < 13) marketPosition = 'value';

    return {
      categoryAverage,
      topPerformers,
      marketPosition,
    };
  }

  private calculateRevenueProjection(template: Template, price: number) {
    // Base projections on historical performance and market data
    const baseMonthlyUnits = Math.max(5, template.purchase_count / 12); // Assume 12-month history
    
    const conservative = baseMonthlyUnits * price * 0.8; // 20% lower than current trend
    const optimistic = baseMonthlyUnits * price * 1.5; // 50% improvement
    const breakeven = Math.ceil(100 / price); // Break even at $100 monthly revenue

    return {
      conservative,
      optimistic,
      breakeven,
    };
  }

  private generatePricingReasoning(
    template: Template, 
    strategy: PricingStrategy,
    competitor: any
  ): string {
    let reasoning = `Recommended price of $${this.roundToValidPrice(strategy.finalPrice)} based on:\n`;
    
    reasoning += `• Base price: $${strategy.basePrice}\n`;
    reasoning += `• Category (${template.category}) multiplier: ${strategy.categoryMultiplier}x\n`;
    
    if (strategy.qualityBonus > 0) {
      reasoning += `• Quality bonus: +$${strategy.qualityBonus.toFixed(2)} (performance score: ${template.performance_score}/10)\n`;
    }
    
    if (strategy.popularityBonus > 0) {
      reasoning += `• Popularity bonus: +$${strategy.popularityBonus.toFixed(2)} (${template.usage_count} uses, ${template.favorites_count} favorites)\n`;
    }
    
    reasoning += `• Category average: $${competitor.categoryAverage.toFixed(2)}\n`;
    reasoning += `• Market position: ${competitor.marketPosition}`;

    return reasoning;
  }

  private roundToValidPrice(price: number): number {
    // Round to nearest $0.99 (e.g., $14.99, $19.99)
    const rounded = Math.round(price) - 0.01;
    return Math.max(this.MIN_PREMIUM_PRICE, Math.min(this.MAX_PREMIUM_PRICE, rounded));
  }
}