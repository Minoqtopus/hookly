import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getPlanFeatures } from '../entities/plan-features.util';
import { User } from '../entities/user.entity';

export interface OverageCalculation {
  currentUsage: number;
  monthlyLimit: number;
  overageGenerations: number;
  overageCost: number;
  shouldWarn: boolean;
  shouldCharge: boolean;
}

export interface OverageReport {
  totalUsers: number;
  usersWithOverage: number;
  totalOverageGenerations: number;
  totalOverageRevenue: number;
  averageOveragePerUser: number;
}

@Injectable()
export class OverageService {
  private readonly logger = new Logger(OverageService.name);
  private readonly OVERAGE_RATE = 0.15; // $0.15 per overage generation

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Calculate overage for a specific user
   */
  async calculateUserOverage(userId: string): Promise<OverageCalculation> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error('User not found');
      }

      const planFeatures = getPlanFeatures(user.plan);
      const monthlyLimit = planFeatures.monthly_generation_limit || 0;
      const currentUsage = user.monthly_generation_count;
      
      const overageGenerations = Math.max(0, currentUsage - monthlyLimit);
      const overageCost = overageGenerations * this.OVERAGE_RATE;
      
      const shouldWarn = monthlyLimit > 0 && currentUsage >= monthlyLimit * 0.8;
      const shouldCharge = overageGenerations > 0;

      return {
        currentUsage,
        monthlyLimit,
        overageGenerations,
        overageCost,
        shouldWarn,
        shouldCharge,
      };
    } catch (error) {
      this.logger.error(`Failed to calculate overage for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Process overage charges for a user
   */
  async processOverageCharges(userId: string): Promise<void> {
    try {
      const overage = await this.calculateUserOverage(userId);
      
      if (!overage.shouldCharge) {
        this.logger.debug(`No overage charges for user ${userId}`);
        return;
      }

      // For MVP, we'll just log the overage
      // In production, this would integrate with payment processing
      this.logger.log(`Overage charges for user ${userId}: ${overage.overageGenerations} generations = $${overage.overageCost.toFixed(2)}`);
      
      // Reset monthly count for next month
      await this.userRepository.update(userId, {
        monthly_generation_count: 0,
        monthly_reset_date: new Date(),
      });

      this.logger.log(`Monthly generation count reset for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to process overage charges for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get overage report for all users
   */
  async getOverageReport(): Promise<OverageReport> {
    try {
      const users = await this.userRepository.find();
      let totalOverageGenerations = 0;
      let totalOverageRevenue = 0;
      let usersWithOverage = 0;

      for (const user of users) {
        const planFeatures = getPlanFeatures(user.plan);
        const monthlyLimit = planFeatures.monthly_generation_limit || 0;
        const overageGenerations = Math.max(0, user.monthly_generation_count - monthlyLimit);
        
        if (overageGenerations > 0) {
          usersWithOverage++;
          totalOverageGenerations += overageGenerations;
          totalOverageRevenue += overageGenerations * this.OVERAGE_RATE;
        }
      }

      return {
        totalUsers: users.length,
        usersWithOverage,
        totalOverageGenerations,
        totalOverageRevenue,
        averageOveragePerUser: usersWithOverage > 0 ? totalOverageGenerations / usersWithOverage : 0,
      };
    } catch (error) {
      this.logger.error('Failed to get overage report:', error);
      return {
        totalUsers: 0,
        usersWithOverage: 0,
        totalOverageGenerations: 0,
        totalOverageRevenue: 0,
        averageOveragePerUser: 0,
      };
    }
  }

  /**
   * Reset monthly generation counts for all users
   */
  async resetMonthlyCounts(): Promise<void> {
    try {
      await this.userRepository.update({}, {
        monthly_generation_count: 0,
        monthly_reset_date: new Date(),
      });
      
      this.logger.log('Monthly generation counts reset for all users');
    } catch (error) {
      this.logger.error('Failed to reset monthly generation counts:', error);
      throw error;
    }
  }

  /**
   * Get users approaching their monthly limits
   */
  async getUsersApproachingLimits(warningThreshold: number = 0.8): Promise<Array<{ user: User; usagePercentage: number }>> {
    try {
      const users = await this.userRepository.find();
      const usersApproachingLimits = [];

      for (const user of users) {
        const planFeatures = getPlanFeatures(user.plan);
        const monthlyLimit = planFeatures.monthly_generation_limit || 0;
        
        if (monthlyLimit > 0) {
          const usagePercentage = user.monthly_generation_count / monthlyLimit;
          if (usagePercentage >= warningThreshold) {
            usersApproachingLimits.push({ user, usagePercentage });
          }
        }
      }

      return usersApproachingLimits.sort((a, b) => b.usagePercentage - a.usagePercentage);
    } catch (error) {
      this.logger.error('Failed to get users approaching limits:', error);
      return [];
    }
  }
}
