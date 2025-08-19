import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

export interface BetaUserCriteria {
  userType: 'content_creator' | 'small_business' | 'agency' | 'influencer' | 'marketing_team';
  industry: string;
  expectedUsage: 'low' | 'medium' | 'high';
  socialMediaPresence: boolean;
  teamSize?: number;
  monthlyBudget?: number;
  referralSource?: string;
}

export interface BetaApplication {
  email: string;
  criteria: BetaUserCriteria;
  applicationDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

export interface BetaUserStats {
  totalBetaUsers: number;
  activeBetaUsers: number;
  expiredBetaUsers: number;
  conversionRate: number;
  averageUsage: number;
  topIndustries: string[];
  upcomingExpirations: Array<{ userId: string; email: string; expiresAt: Date }>;
}

@Injectable()
export class BetaManagementService {
  private readonly logger = new Logger(BetaManagementService.name);
  private readonly MAX_BETA_USERS = 100; // Maximum beta users allowed
  private readonly BETA_DURATION_DAYS = 30; // Beta access duration

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Check if beta signups are currently allowed
   */
  async canAcceptBetaSignup(): Promise<{ allowed: boolean; remaining: number; message?: string }> {
    const activeBetaUsers = await this.getActiveBetaUserCount();
    const remaining = this.MAX_BETA_USERS - activeBetaUsers;

    if (remaining <= 0) {
      return {
        allowed: false,
        remaining: 0,
        message: 'Beta program is currently full. Join our waitlist for early access!',
      };
    }

    if (remaining <= 10) {
      return {
        allowed: true,
        remaining,
        message: `Only ${remaining} beta spots remaining! Apply now for exclusive access.`,
      };
    }

    return {
      allowed: true,
      remaining,
      message: `${remaining} beta spots available. Join our exclusive beta program!`,
    };
  }

  /**
   * Apply for beta access
   */
  async applyForBeta(email: string, criteria: BetaUserCriteria): Promise<{ success: boolean; message: string; waitlistPosition?: number }> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      return { success: false, message: 'Email already registered. Please sign in instead.' };
    }

    // Check if beta signups are allowed
    const signupStatus = await this.canAcceptBetaSignup();
    if (!signupStatus.allowed) {
      // Add to waitlist (implement waitlist logic here)
      const waitlistPosition = await this.addToWaitlist(email, criteria);
      return { 
        success: false, 
        message: signupStatus.message || 'Beta program is full. You have been added to our waitlist.',
        waitlistPosition 
      };
    }

    // Check if user meets beta criteria
    const meetsCriteria = this.evaluateBetaCriteria(criteria);
    if (!meetsCriteria.approved) {
      return { 
        success: false, 
        message: `Beta application not approved: ${meetsCriteria.reason}` 
      };
    }

    // Approve beta access
    await this.approveBetaAccess(email, criteria);
    
    return { 
      success: true, 
      message: 'Beta access approved! Check your email for signup instructions.' 
    };
  }

  /**
   * Get beta user statistics
   */
  async getBetaUserStats(): Promise<BetaUserStats> {
    const totalBetaUsers = await this.userRepository.count({ where: { is_beta_user: true } });
    const activeBetaUsers = await this.getActiveBetaUserCount();
    const expiredBetaUsers = totalBetaUsers - activeBetaUsers;

    // Calculate conversion rate (users who upgraded after beta)
    const convertedUsers = await this.userRepository.count({
      where: [
        { is_beta_user: true, plan: 'starter' as any },
        { is_beta_user: true, plan: 'pro' as any },
        { is_beta_user: true, plan: 'agency' as any },
      ],
    });
    const conversionRate = totalBetaUsers > 0 ? (convertedUsers / totalBetaUsers) * 100 : 0;

    // Get average usage
    const activeUsers = await this.userRepository.find({
      where: { is_beta_user: true },
      select: ['monthly_generation_count'],
    });
    const averageUsage = activeUsers.length > 0 
      ? activeUsers.reduce((sum, user) => sum + user.monthly_generation_count, 0) / activeUsers.length 
      : 0;

    // Get top industries
    const topIndustries = await this.getTopIndustries();

    // Get upcoming expirations
    const upcomingExpirations = await this.getUpcomingExpirations();

    return {
      totalBetaUsers,
      activeBetaUsers,
      expiredBetaUsers,
      conversionRate,
      averageUsage,
      topIndustries,
      upcomingExpirations,
    };
  }

  /**
   * Process expired beta users
   */
  async processExpiredBetaUsers(): Promise<{ processed: number; downgraded: number }> {
    const now = new Date();
    const expiredUsers = await this.userRepository.find({
      where: {
        is_beta_user: true,
        beta_expires_at: { $lt: now } as any, // TypeORM syntax
      },
    });

    let processed = 0;
    let downgraded = 0;

    for (const user of expiredUsers) {
      try {
        await this.expireBetaAccess(user);
        processed++;
        
        if (user.plan === 'pro') {
          await this.downgradeToTrial(user);
          downgraded++;
        }
      } catch (error) {
        this.logger.error(`Failed to process expired beta user ${user.id}:`, error);
      }
    }

    this.logger.log(`Processed ${processed} expired beta users, downgraded ${downgraded} to trial`);
    return { processed, downgraded };
  }

  /**
   * Get active beta user count
   */
  private async getActiveBetaUserCount(): Promise<number> {
    const now = new Date();
    return await this.userRepository.count({
      where: [
        { is_beta_user: true, beta_expires_at: { $gt: now } as any },
        { is_beta_user: true, beta_expires_at: null },
      ],
    });
  }

  /**
   * Evaluate beta application criteria
   */
  private evaluateBetaCriteria(criteria: BetaUserCriteria): { approved: boolean; reason?: string; score: number } {
    let score = 0;
    let reason = '';

    // User type scoring
    switch (criteria.userType) {
      case 'content_creator':
        score += 25;
        break;
      case 'small_business':
        score += 20;
        break;
      case 'agency':
        score += 30;
        break;
      case 'influencer':
        score += 15;
        break;
      case 'marketing_team':
        score += 25;
        break;
    }

    // Industry scoring (prioritize high-value industries)
    const highValueIndustries = ['e-commerce', 'saas', 'health-fitness', 'food-beverage', 'fashion-beauty'];
    if (highValueIndustries.includes(criteria.industry.toLowerCase())) {
      score += 20;
    } else {
      score += 10;
    }

    // Expected usage scoring
    switch (criteria.expectedUsage) {
      case 'high':
        score += 25;
        break;
      case 'medium':
        score += 15;
        break;
      case 'low':
        score += 5;
        break;
    }

    // Social media presence
    if (criteria.socialMediaPresence) {
      score += 15;
    }

    // Team size bonus
    if (criteria.teamSize && criteria.teamSize > 1) {
      score += 10;
    }

    // Budget consideration
    if (criteria.monthlyBudget && criteria.monthlyBudget >= 100) {
      score += 10;
    }

    // Minimum score for approval
    const approved = score >= 60;
    
    if (!approved) {
      reason = `Application score: ${score}/100. Minimum required: 60. Focus on improving your social media presence and demonstrating clear use cases.`;
    }

    return { approved, reason, score };
  }

  /**
   * Approve beta access for a user
   */
  private async approveBetaAccess(email: string, criteria: BetaUserCriteria): Promise<void> {
    // This would typically send an approval email with signup instructions
    // For now, just log the approval
    this.logger.log(`Beta access approved for ${email} with score: ${this.evaluateBetaCriteria(criteria).score}/100`);
    
    // Store application data (could be in a separate table)
    // await this.betaApplicationRepository.save({ email, criteria, status: 'approved' });
  }

  /**
   * Add user to waitlist
   */
  private async addToWaitlist(email: string, criteria: BetaUserCriteria): Promise<number> {
    // This would typically store in a waitlist table
    // For now, return a mock position
    this.logger.log(`User ${email} added to beta waitlist`);
    return Math.floor(Math.random() * 50) + 1; // Mock waitlist position
  }

  /**
   * Get top industries from beta users
   */
  private async getTopIndustries(): Promise<string[]> {
    // This would typically query user profiles or applications
    // For now, return mock data
    return ['e-commerce', 'saas', 'health-fitness', 'food-beverage', 'fashion-beauty'];
  }

  /**
   * Get upcoming beta expirations
   */
  private async getUpcomingExpirations(): Promise<Array<{ userId: string; email: string; expiresAt: Date }>> {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcomingExpirations = await this.userRepository.find({
      where: {
        is_beta_user: true,
        beta_expires_at: { $gte: now, $lte: sevenDaysFromNow } as any,
      },
      select: ['id', 'email', 'beta_expires_at'],
    });

    return upcomingExpirations.map(user => ({
      userId: user.id,
      email: user.email,
      expiresAt: user.beta_expires_at!,
    }));
  }

  /**
   * Expire beta access for a user
   */
  private async expireBetaAccess(user: User): Promise<void> {
    user.is_beta_user = false;
    user.beta_expires_at = null;
    await this.userRepository.save(user);
    
    this.logger.log(`Beta access expired for user ${user.email}`);
  }

  /**
   * Downgrade user to trial plan
   */
  private async downgradeToTrial(user: User): Promise<void> {
    user.plan = 'trial' as any;
    user.monthly_generation_count = 0;
    user.monthly_generation_limit = 15;
    await this.userRepository.save(user);
    
    this.logger.log(`User ${user.email} downgraded to trial after beta expiration`);
  }

  /**
   * Send beta expiration reminders
   */
  async sendExpirationReminders(): Promise<{ sent: number }> {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const usersNeedingReminders = await this.userRepository.find({
      where: {
        is_beta_user: true,
        beta_expires_at: { $gte: now, $lte: threeDaysFromNow } as any,
      },
    });

    let sent = 0;
    for (const user of usersNeedingReminders) {
      try {
        // This would typically send an email reminder
        this.logger.log(`Expiration reminder sent to ${user.email} - beta expires in ${this.getDaysUntilExpiration(user.beta_expires_at!)} days`);
        sent++;
      } catch (error) {
        this.logger.error(`Failed to send expiration reminder to ${user.email}:`, error);
      }
    }

    return { sent };
  }

  /**
   * Get days until beta expiration
   */
  private getDaysUntilExpiration(expiresAt: Date): number {
    const now = new Date();
    const diffTime = expiresAt.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get beta user conversion opportunities
   */
  async getConversionOpportunities(): Promise<Array<{ userId: string; email: string; daysUntilExpiration: number; conversionProbability: number }>> {
    const now = new Date();
    const activeBetaUsers = await this.userRepository.find({
      where: {
        is_beta_user: true,
        beta_expires_at: { $gt: now } as any,
      },
    });

    return activeBetaUsers.map(user => {
      const daysUntilExpiration = this.getDaysUntilExpiration(user.beta_expires_at!);
      const conversionProbability = this.calculateConversionProbability(user, daysUntilExpiration);
      
      return {
        userId: user.id,
        email: user.email,
        daysUntilExpiration,
        conversionProbability,
      };
    }).sort((a, b) => b.conversionProbability - a.conversionProbability);
  }

  /**
   * Calculate conversion probability based on usage and time remaining
   */
  private calculateConversionProbability(user: User, daysUntilExpiration: number): number {
    let probability = 0.3; // Base probability

    // Usage-based probability
    if (user.monthly_generation_limit) {
      const usageRatio = user.monthly_generation_count / user.monthly_generation_limit;
      if (usageRatio >= 0.8) probability += 0.3; // High usage
      else if (usageRatio >= 0.5) probability += 0.2; // Moderate usage
    }

    // Time-based probability (urgency)
    if (daysUntilExpiration <= 3) probability += 0.2; // Very urgent
    else if (daysUntilExpiration <= 7) probability += 0.15; // Urgent
    else if (daysUntilExpiration <= 14) probability += 0.1; // Moderate urgency

    // Activity-based probability
    if (user.total_generations > 10) probability += 0.1; // Active user

    return Math.min(probability, 0.9); // Cap at 90%
  }
}
