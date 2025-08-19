import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Generation } from '../entities/generation.entity';
import { User } from '../entities/user.entity';

export interface PlanComparisonData {
  currentPlan: string;
  recommendedPlan: string;
  upgradeBenefits: string[];
  costSavings: number;
  featureComparison: {
    feature: string;
    current: boolean;
    recommended: boolean;
    value: string;
  }[];
  usageAnalysis: {
    currentUsage: number;
    currentLimit: number;
    recommendedLimit: number;
    usageEfficiency: number;
  };
  conversionProbability: number;
}

export interface ConversionAnalytics {
  totalUsers: number;
  planDistribution: Record<string, number>;
  upgradeConversionRates: Record<string, number>;
  averageTimeToUpgrade: Record<string, number>;
  churnRiskUsers: string[];
  highValueUsers: string[];
  upgradeOpportunities: Array<{
    userId: string;
    email: string;
    currentPlan: string;
    recommendedPlan: string;
    conversionProbability: number;
    estimatedRevenue: number;
  }>;
}

@Injectable()
export class PlanAnalyticsService {
  private readonly logger = new Logger(PlanAnalyticsService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Generation)
    private generationRepository: Repository<Generation>,
  ) {}

  /**
   * Generate personalized plan comparison for a user
   */
  async generatePlanComparison(userId: string): Promise<PlanComparisonData> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const currentPlan = user.plan;
    const recommendedPlan = this.getRecommendedPlan(user);
    const upgradeBenefits = this.getUpgradeBenefits(currentPlan, recommendedPlan);
    const costSavings = this.calculateCostSavings(currentPlan, recommendedPlan, user);
    const featureComparison = this.getFeatureComparison(currentPlan, recommendedPlan);
    const usageAnalysis = await this.getUsageAnalysis(userId, currentPlan, recommendedPlan);
    const conversionProbability = this.calculateConversionProbability(user, recommendedPlan);

    return {
      currentPlan,
      recommendedPlan,
      upgradeBenefits,
      costSavings,
      featureComparison,
      usageAnalysis,
      conversionProbability,
    };
  }

  /**
   * Get comprehensive conversion analytics for business intelligence
   */
  async getConversionAnalytics(): Promise<ConversionAnalytics> {
    const users = await this.userRepository.find();
    const planDistribution = this.calculatePlanDistribution(users);
    const upgradeConversionRates = await this.calculateUpgradeConversionRates();
    const averageTimeToUpgrade = await this.calculateAverageTimeToUpgrade();
    const churnRiskUsers = await this.identifyChurnRiskUsers();
    const highValueUsers = await this.identifyHighValueUsers();
    const upgradeOpportunities = await this.getUpgradeOpportunities();

    return {
      totalUsers: users.length,
      planDistribution,
      upgradeConversionRates,
      averageTimeToUpgrade,
      churnRiskUsers,
      highValueUsers,
      upgradeOpportunities,
    };
  }

  /**
   * Get upgrade opportunities for sales team
   */
  async getUpgradeOpportunities(limit: number = 50): Promise<Array<{
    userId: string;
    email: string;
    currentPlan: string;
    recommendedPlan: string;
    conversionProbability: number;
    estimatedRevenue: number;
    lastActivity: Date;
    usagePercentage: number;
  }>> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('user.plan IN (:...plans)', { plans: ['trial', 'starter'] })
      .andWhere('user.monthly_generation_count > 0')
      .orderBy('user.monthly_generation_count', 'DESC')
      .limit(limit)
      .getMany();

    const opportunities = await Promise.all(
      users.map(async (user) => {
        const recommendedPlan = this.getRecommendedPlan(user);
        const conversionProbability = this.calculateConversionProbability(user, recommendedPlan);
        const estimatedRevenue = this.calculateEstimatedRevenue(recommendedPlan);
        const usagePercentage = user.monthly_generation_limit 
          ? (user.monthly_generation_count / user.monthly_generation_limit) * 100 
          : 0;

        // Get last generation activity
        const lastGeneration = await this.generationRepository
          .createQueryBuilder('generation')
          .where('generation.user_id = :userId', { userId: user.id })
          .orderBy('generation.created_at', 'DESC')
          .getOne();

        return {
          userId: user.id,
          email: user.email,
          currentPlan: user.plan,
          recommendedPlan,
          conversionProbability,
          estimatedRevenue,
          lastActivity: lastGeneration?.created_at || user.created_at,
          usagePercentage,
        };
      })
    );

    // Sort by conversion probability and usage percentage
    return opportunities.sort((a, b) => {
      const scoreA = a.conversionProbability * 0.7 + Math.min(a.usagePercentage / 100, 1) * 0.3;
      const scoreB = b.conversionProbability * 0.7 + Math.min(b.usagePercentage / 100, 1) * 0.3;
      return scoreB - scoreA;
    });
  }

  /**
   * Get personalized upgrade recommendations for a user
   */
  async getPersonalizedUpgradeRecommendations(userId: string): Promise<{
    showUpgradePrompt: boolean;
    message: string;
    recommendedPlan: string;
    urgency: 'low' | 'medium' | 'high';
    benefits: string[];
    socialProof: string;
  }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const currentPlan = user.plan;
    const recommendedPlan = this.getRecommendedPlan(user);
    
    if (currentPlan === recommendedPlan || currentPlan === 'agency') {
      return {
        showUpgradePrompt: false,
        message: '',
        recommendedPlan: '',
        urgency: 'low',
        benefits: [],
        socialProof: '',
      };
    }

    const usagePercentage = user.monthly_generation_limit 
      ? (user.monthly_generation_count / user.monthly_generation_limit) * 100 
      : 0;

    let urgency: 'low' | 'medium' | 'high' = 'low';
    let message = '';

    if (usagePercentage >= 90) {
      urgency = 'high';
      message = `You're at ${usagePercentage.toFixed(1)}% of your monthly limit! Upgrade now to avoid overage charges.`;
    } else if (usagePercentage >= 70) {
      urgency = 'medium';
      message = `You're using ${usagePercentage.toFixed(1)}% of your monthly limit. Consider upgrading for more capacity.`;
    } else {
      urgency = 'low';
      message = 'Ready to scale up? Upgrade to unlock more features and higher limits.';
    }

    const benefits = this.getUpgradeBenefits(currentPlan, recommendedPlan);
    const socialProof = await this.getSocialProof(recommendedPlan);

    return {
      showUpgradePrompt: true,
      message,
      recommendedPlan,
      urgency,
      benefits,
      socialProof,
    };
  }

  // Private helper methods
  private getRecommendedPlan(user: User): string {
    const usage = user.monthly_generation_count;
    const limit = user.monthly_generation_limit || 0;

    if (limit === 0) return 'AGENCY';
    
    const usageRatio = usage / limit;
    
    if (usageRatio >= 1.5) return 'AGENCY';
    if (usageRatio >= 1.2) return 'PRO';
    if (usageRatio >= 0.8) return 'PRO';
    return 'STARTER';
  }

  private getUpgradeBenefits(currentPlan: string, recommendedPlan: string): string[] {
    const benefits: Record<string, Record<string, string[]>> = {
      'trial': {
        'starter': ['50 generations per month', 'X platform support', '15+ templates', 'Email support'],
        'pro': ['200 generations per month', 'Instagram support', 'Batch generation', 'Team collaboration'],
        'agency': ['500 generations per month', 'All platforms', 'API access', 'White-label options'],
      },
      'starter': {
        'pro': ['4x more generations', 'Instagram support', 'Batch generation', 'Team collaboration', 'Advanced analytics'],
        'agency': ['10x more generations', 'All platforms', 'API access', 'White-label options', 'Dedicated support'],
      },
      'pro': {
        'agency': ['2.5x more generations', 'API access', 'White-label options', 'Dedicated support', 'Enterprise features'],
      },
    };

    return benefits[currentPlan]?.[recommendedPlan] || [];
  }

  private calculateCostSavings(currentPlan: string, recommendedPlan: string, user: User): number {
    const planPrices: Record<string, number> = {
      'trial': 0,
      'starter': 19,
      'pro': 59,
      'agency': 129,
    };

    const currentPrice = planPrices[currentPlan] || 0;
    const recommendedPrice = planPrices[recommendedPlan] || 0;

    // Calculate overage savings if user is exceeding limits
    let overageSavings = 0;
    if (user.monthly_generation_limit && user.monthly_generation_count > user.monthly_generation_limit) {
      const overageGenerations = user.monthly_generation_count - user.monthly_generation_limit;
      overageSavings = overageGenerations * 0.15; // $0.15 per overage generation
    }

    return overageSavings;
  }

  private getFeatureComparison(currentPlan: string, recommendedPlan: string): Array<{
    feature: string;
    current: boolean;
    recommended: boolean;
    value: string;
  }> {
    const features = [
      { name: 'Batch Generation', trial: false, starter: false, pro: true, agency: true },
      { name: 'Team Collaboration', trial: false, starter: false, pro: true, agency: true },
      { name: 'Advanced Analytics', trial: false, starter: false, pro: true, agency: true },
      { name: 'API Access', trial: false, starter: false, pro: false, agency: true },
      { name: 'White-label Options', trial: false, starter: false, pro: false, agency: true },
      { name: 'Priority Support', trial: false, starter: false, pro: true, agency: true },
    ];

    return features.map(feature => ({
      feature: feature.name,
      current: Boolean(feature[currentPlan as keyof typeof feature]),
      recommended: Boolean(feature[recommendedPlan as keyof typeof feature]),
      value: feature[recommendedPlan as keyof typeof feature] ? '✅' : '❌',
    }));
  }

  private async getUsageAnalysis(userId: string, currentPlan: string, recommendedPlan: string): Promise<{
    currentUsage: number;
    currentLimit: number;
    recommendedLimit: number;
    usageEfficiency: number;
  }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const currentUsage = user.monthly_generation_count;
    const currentLimit = user.monthly_generation_limit || 0;
    const recommendedLimit = this.getPlanLimit(recommendedPlan);
    const usageEfficiency = currentLimit > 0 ? (currentUsage / currentLimit) * 100 : 0;

    return {
      currentUsage,
      currentLimit,
      recommendedLimit,
      usageEfficiency,
    };
  }

  private getPlanLimit(plan: string): number {
    const limits: Record<string, number> = {
      'trial': 15,
      'starter': 50,
      'pro': 200,
      'agency': 500,
    };
    return limits[plan] || 0;
  }

  private calculateConversionProbability(user: User, recommendedPlan: string): number {
    let probability = 0.3; // Base probability

    // Usage-based probability
    if (user.monthly_generation_limit) {
      const usageRatio = user.monthly_generation_count / user.monthly_generation_limit;
      if (usageRatio >= 1.0) probability += 0.4; // Exceeding limits
      else if (usageRatio >= 0.8) probability += 0.3; // High usage
      else if (usageRatio >= 0.5) probability += 0.2; // Moderate usage
    }

    // Activity-based probability
    if (user.total_generations > 20) probability += 0.2; // Active user
    if (user.first_generation_at && user.first_paid_at) probability += 0.1; // Converted before

    return Math.min(probability, 0.9); // Cap at 90%
  }

  private calculateEstimatedRevenue(plan: string): number {
    const planPrices: Record<string, number> = {
      'starter': 19,
      'pro': 59,
      'agency': 129,
    };
    return planPrices[plan] || 0;
  }

  private calculatePlanDistribution(users: User[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    users.forEach(user => {
      distribution[user.plan] = (distribution[user.plan] || 0) + 1;
    });
    return distribution;
  }

  private async calculateUpgradeConversionRates(): Promise<Record<string, number>> {
    // This would typically query subscription events or payment history
    // For now, return mock data
    return {
      'trial': 0.15,
      'starter': 0.25,
      'pro': 0.40,
    };
  }

  private async calculateAverageTimeToUpgrade(): Promise<Record<string, number>> {
    // This would calculate average days from signup to upgrade
    // For now, return mock data
    return {
      'trial': 5,
      'starter': 14,
      'pro': 30,
    };
  }

  private async identifyChurnRiskUsers(): Promise<string[]> {
    // Users who haven't generated content in 30+ days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const inactiveUsers = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.generations', 'generation')
      .where('generation.created_at < :date', { date: thirtyDaysAgo })
      .orWhere('generation.id IS NULL')
      .select('user.id')
      .getMany();

    return inactiveUsers.map(user => user.id);
  }

  private async identifyHighValueUsers(): Promise<string[]> {
    // Users with high generation counts and consistent activity
    const highValueUsers = await this.userRepository
      .createQueryBuilder('user')
      .where('user.total_generations > 50')
      .andWhere('user.plan IN (:...plans)', { plans: ['pro', 'agency'] })
      .select('user.id')
      .getMany();

    return highValueUsers.map(user => user.id);
  }

  private async getSocialProof(plan: string): Promise<string> {
    // This would typically query user testimonials or success stories
    const socialProofs: Record<string, string> = {
      'starter': 'Join 500+ businesses using Hookly to create viral content',
      'pro': 'Trusted by 200+ marketing teams and agencies',
      'agency': 'Used by top agencies to scale content creation 10x',
    };
    return socialProofs[plan] || 'Join thousands of successful creators';
  }
}
