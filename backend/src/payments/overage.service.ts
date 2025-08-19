import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

export interface OverageCalculation {
  currentUsage: number;
  monthlyLimit: number;
  overageGenerations: number;
  overageCharges: number;
  usagePercentage: number;
  shouldWarn: boolean;
  shouldUpgrade: boolean;
  recommendedPlan: string;
}

export interface PlanUpgradePrompt {
  showPrompt: boolean;
  message: string;
  recommendedPlan: string;
  currentPlan: string;
  usagePercentage: number;
  overageCharges: number;
}

@Injectable()
export class OverageService {
  private readonly logger = new Logger(OverageService.name);
  private readonly OVERAGE_RATE = 0.15; // $0.15 per generation
  private readonly WARNING_THRESHOLD = 0.8; // 80% usage warning
  private readonly UPGRADE_THRESHOLD = 0.9; // 90% usage upgrade prompt

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Calculate overage charges and usage metrics for a user
   */
  async calculateOverage(userId: string): Promise<OverageCalculation> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const currentUsage = user.monthly_generation_count;
    const monthlyLimit = user.monthly_generation_limit || 0;
    
    let overageGenerations = 0;
    let overageCharges = 0;
    
    if (monthlyLimit > 0 && currentUsage > monthlyLimit) {
      overageGenerations = currentUsage - monthlyLimit;
      overageCharges = overageGenerations * this.OVERAGE_RATE;
    }

    const usagePercentage = monthlyLimit > 0 ? (currentUsage / monthlyLimit) * 100 : 0;
    const shouldWarn = usagePercentage >= this.WARNING_THRESHOLD * 100;
    const shouldUpgrade = usagePercentage >= this.UPGRADE_THRESHOLD * 100;

    // Determine recommended plan based on usage
    const recommendedPlan = this.getRecommendedPlan(currentUsage, monthlyLimit);

    return {
      currentUsage,
      monthlyLimit,
      overageGenerations,
      overageCharges,
      usagePercentage,
      shouldWarn,
      shouldUpgrade,
      recommendedPlan,
    };
  }

  /**
   * Get plan upgrade prompt based on usage
   */
  async getPlanUpgradePrompt(userId: string): Promise<PlanUpgradePrompt> {
    const overage = await this.calculateOverage(userId);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new Error('User not found');
    }

    const showPrompt = overage.shouldUpgrade || overage.overageCharges > 0;
    
    let message = '';
    if (overage.overageCharges > 0) {
      message = `You've exceeded your monthly limit by ${overage.overageGenerations} generations. Current overage charges: $${overage.overageCharges.toFixed(2)}. Consider upgrading to avoid additional charges.`;
    } else if (overage.shouldUpgrade) {
      message = `You're at ${overage.usagePercentage.toFixed(1)}% of your monthly limit. Upgrade now to avoid overage charges and unlock more features.`;
    }

    return {
      showPrompt,
      message,
      recommendedPlan: overage.recommendedPlan,
      currentPlan: user.plan,
      usagePercentage: overage.usagePercentage,
      overageCharges: overage.overageCharges,
    };
  }

  /**
   * Record overage charges for a user
   */
  async recordOverage(userId: string, generationsUsed: number): Promise<void> {
    const overage = await this.calculateOverage(userId);
    
    if (overage.overageGenerations > 0) {
      await this.userRepository.update(userId, {
        overage_generations: overage.overageGenerations,
        overage_charges: overage.overageCharges,
        last_overage_notification: new Date(),
      });

      this.logger.log(`Overage recorded for user ${userId}: ${overage.overageGenerations} generations, $${overage.overageCharges.toFixed(2)} charges`);
    }
  }

  /**
   * Send usage warning if threshold is reached
   */
  async checkAndSendUsageWarning(userId: string): Promise<boolean> {
    const overage = await this.calculateOverage(userId);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      return false;
    }

    if (overage.shouldWarn && !user.overage_warning_sent) {
      // Mark warning as sent
      await this.userRepository.update(userId, {
        overage_warning_sent: true,
      });

      this.logger.log(`Usage warning sent to user ${userId} at ${overage.usagePercentage.toFixed(1)}% usage`);
      return true;
    }

    return false;
  }

  /**
   * Reset monthly overage tracking (called monthly)
   */
  async resetMonthlyOverage(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      overage_generations: 0,
      overage_charges: 0,
      overage_warning_sent: false,
    });

    this.logger.log(`Monthly overage reset for user ${userId}`);
  }

  /**
   * Get recommended plan based on usage patterns
   */
  private getRecommendedPlan(currentUsage: number, monthlyLimit: number): string {
    if (monthlyLimit === 0) return 'AGENCY'; // Unlimited plan
    
    const usageRatio = currentUsage / monthlyLimit;
    
    if (usageRatio >= 1.5) {
      return 'AGENCY'; // Heavy usage
    } else if (usageRatio >= 1.2) {
      return 'PRO'; // Moderate overage
    } else if (usageRatio >= 0.8) {
      return 'PRO'; // Approaching limit
    } else {
      return 'STARTER'; // Within limits
    }
  }

  /**
   * Get overage analytics for business intelligence
   */
  async getOverageAnalytics(): Promise<{
    totalOverageCharges: number;
    usersWithOverage: number;
    averageOveragePerUser: number;
    topOverageUsers: Array<{ userId: string; overageCharges: number; email: string }>;
  }> {
    const usersWithOverage = await this.userRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.email', 'user.overage_charges'])
      .where('user.overage_charges > 0')
      .orderBy('user.overage_charges', 'DESC')
      .limit(10)
      .getMany();

    const totalOverageCharges = usersWithOverage.reduce((sum, user) => sum + Number(user.overage_charges), 0);
    const averageOveragePerUser = usersWithOverage.length > 0 ? totalOverageCharges / usersWithOverage.length : 0;

    return {
      totalOverageCharges,
      usersWithOverage: usersWithOverage.length,
      averageOveragePerUser,
      topOverageUsers: usersWithOverage.map(user => ({
        userId: user.id,
        overageCharges: Number(user.overage_charges),
        email: user.email,
      })),
    };
  }
}
