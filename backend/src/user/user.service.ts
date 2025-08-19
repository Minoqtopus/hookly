import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, MoreThanOrEqual, Repository } from 'typeorm';
import { Generation } from '../entities/generation.entity';
import { User, UserPlan } from '../entities/user.entity';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Generation)
    private generationRepository: Repository<Generation>,
  ) {}

  async getUserProfile(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if monthly count needs reset
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    // Ensure monthly_reset_date is a Date object
    const resetDate = user.monthly_reset_date instanceof Date ? user.monthly_reset_date : new Date(user.monthly_reset_date);
    const resetMonth = resetDate.toISOString().slice(0, 7);
    
    if (resetMonth !== currentMonth) {
      user.monthly_generation_count = 0;
      user.monthly_reset_date = new Date();
      await this.userRepository.save(user);
    }

    return {
      id: user.id,
      email: user.email,
      plan: user.plan,
      monthly_generation_count: user.monthly_generation_count,
      remaining_generations: this.getRemainingGenerations(user.plan, user.monthly_generation_count),
      monthly_reset_date: user.monthly_reset_date,
    };
  }

  async updateUserPlan(userId: string, updatePlanDto: UpdatePlanDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.plan = updatePlanDto.plan;
    
    // Reset monthly count when upgrading to paid plans
    if (updatePlanDto.plan === UserPlan.STARTER || updatePlanDto.plan === UserPlan.PRO || updatePlanDto.plan === UserPlan.AGENCY) {
      user.monthly_generation_count = 0;
      user.monthly_reset_date = new Date();
    }

    await this.userRepository.save(user);

    return {
      id: user.id,
      email: user.email,
      plan: user.plan,
      monthly_generation_count: user.monthly_generation_count,
      remaining_generations: this.getRemainingGenerations(user.plan, user.monthly_generation_count),
    };
  }

  async getUserStats(userId: string) {
    const user = await this.userRepository.findOne({ 
      where: { id: userId }
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get date ranges for analytics
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    // Get generation counts for different time periods
    const [
      generationsToday,
      generationsThisMonth,
      totalGenerations,
      generationsYesterday
    ] = await Promise.all([
      this.generationRepository.count({
        where: {
          user_id: userId,
          created_at: MoreThanOrEqual(todayStart)
        }
      }),
      this.generationRepository.count({
        where: {
          user_id: userId,
          created_at: MoreThanOrEqual(monthStart)
        }
      }),
      this.generationRepository.count({
        where: { user_id: userId }
      }),
      this.generationRepository.count({
        where: {
          user_id: userId,
          created_at: Between(yesterdayStart, todayStart)
        }
      })
    ]);

    // Get performance data from user generations
    const performanceData = await this.generationRepository
      .createQueryBuilder('generation')
      .select([
        'SUM(CAST(generation.performance_data->>\'views\' AS INTEGER)) as totalViews',
        'AVG(CAST(generation.performance_data->>\'ctr\' AS DECIMAL)) as avgCTR',
        'COUNT(*) as validGenerations'
      ])
      .where('generation.user_id = :userId', { userId })
      .andWhere('generation.performance_data IS NOT NULL')
      .getRawOne();

    // Calculate streak (consecutive days with generations)
    const streak = await this.calculateUserStreak(userId);

    // Calculate total estimated views from generation performance data
    const totalViews = parseInt(performanceData?.totalViews) || 0;
    const avgCTR = parseFloat(performanceData?.avgCTR) || 0;

    return {
      generationsToday,
      generationsThisMonth,
      totalGenerations,
      totalViews,
      avgCTR: Math.round(avgCTR * 100) / 100, // Round to 2 decimal places
      streak,
      // Additional helpful metrics
      plan: user.plan,
      isTrialUser: user.plan === UserPlan.TRIAL,
      trialGenerationsUsed: user.trial_generations_used || 0,
      monthlyLimit: this.getMonthlyLimit(user.plan),
      remainingThisMonth: this.getRemainingGenerations(user.plan, generationsThisMonth)
    };
  }

  private async calculateUserStreak(userId: string): Promise<number> {
    // Get the last 30 days of generation activity
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyActivity = await this.generationRepository
      .createQueryBuilder('generation')
      .select('DATE(generation.created_at) as date')
      .addSelect('COUNT(*) as count')
      .where('generation.user_id = :userId', { userId })
      .andWhere('generation.created_at >= :thirtyDaysAgo', { thirtyDaysAgo })
      .groupBy('DATE(generation.created_at)')
      .orderBy('DATE(generation.created_at)', 'DESC')
      .getRawMany();

    // Calculate streak from most recent day backwards
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let currentDate = new Date();

    for (const activity of dailyActivity) {
      const activityDate = activity.date;
      const expectedDate = currentDate.toISOString().split('T')[0];
      
      if (activityDate === expectedDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        // If we're checking today and there's no activity, start from yesterday
        if (activityDate !== today && streak === 0) {
          currentDate.setDate(currentDate.getDate() - 1);
          continue;
        }
        break;
      }
    }

    return streak;
  }

  private getMonthlyLimit(plan: UserPlan): number | null {
    switch (plan) {
      case UserPlan.TRIAL:
        return 15; // 15 total during 7-day trial period
      case UserPlan.STARTER:
        return 50; // 50 per month
      case UserPlan.PRO:
        return 200; // 200 per month
      case UserPlan.AGENCY:
        return 500; // 500 per month
      default:
        return null; // unlimited
    }
  }

  private getRemainingGenerations(plan: UserPlan, usedThisMonth: number): number | null {
    const limit = this.getMonthlyLimit(plan);
    if (limit === null) return null;
    return Math.max(0, limit - usedThisMonth);
  }

  async upgradeToStarter(userId: string, checkoutData: any) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user plan to STARTER
    user.plan = UserPlan.STARTER;
    
    // Reset monthly generation count for new plan
    user.monthly_count = 0;
    user.reset_date = new Date();
    
    // Enable STARTER plan features
    user.has_batch_generation = false; // STARTER doesn't have batch generation
    
    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Successfully upgraded to Starter plan',
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan,
        monthly_count: user.monthly_count,
        has_batch_generation: user.has_batch_generation
      }
    };
  }

  async upgradeToPro(userId: string, checkoutData: any) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user plan to PRO
    user.plan = UserPlan.PRO;
    
    // Reset monthly generation count for new plan
    user.monthly_count = 0;
    user.reset_date = new Date();
    
    // Enable PRO plan features
    user.has_batch_generation = true;
    user.has_advanced_analytics = true;
    user.has_team_features = true;
    
    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Successfully upgraded to Pro plan',
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan,
        monthly_count: user.monthly_count,
        has_batch_generation: user.has_batch_generation,
        has_advanced_analytics: user.has_advanced_analytics,
        has_team_features: user.has_team_features
      }
    };
  }

  async upgradeToAgency(userId: string, checkoutData: any) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Update user plan and enable team features
    user.plan = UserPlan.AGENCY;
    user.monthly_generation_count = 0;
    user.monthly_reset_date = new Date();
    user.has_batch_generation = true;
    user.has_advanced_analytics = true;
    user.has_team_features = true;
    user.has_api_access = true;
    
    await this.userRepository.save(user);
    
    return {
      success: true,
      message: 'Successfully upgraded to Agency plan',
      user: { id: user.id, plan: user.plan }
    };
  }

  async cancelSubscription(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Downgrade to trial
    user.plan = UserPlan.TRIAL;
    user.trial_generations_used = 0;
    user.trial_started_at = new Date();
    user.trial_ends_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    await this.userRepository.save(user);
    
    return {
      success: true,
      message: 'Subscription cancelled successfully',
      user: { id: user.id, plan: user.plan }
    };
  }

  async getUserGenerations(userId: string, limit: number = 10, offset: number = 0) {
    const user = await this.userRepository.findOne({ 
      where: { id: userId }
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get user's generations with pagination
    const [generations, total] = await this.generationRepository.findAndCount({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
    });

    // Format generations for frontend
    const formattedGenerations = generations.map(generation => ({
      id: generation.id,
      title: generation.title || `${generation.product_name} Ad`,
      hook: generation.hook,
      script: generation.script,
      visuals: generation.visuals || [],
      niche: generation.niche,
      target_audience: generation.target_audience,
      performance_data: generation.performance_data || {
        views: 0,
        clicks: 0,
        conversions: 0,
        ctr: 0
      },
      is_favorite: generation.is_favorite,
      created_at: generation.created_at instanceof Date ? generation.created_at.toISOString() : new Date(generation.created_at).toISOString(),
    }));

    return {
      generations: formattedGenerations,
      total,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}