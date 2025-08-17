import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserPlan } from '../entities/user.entity';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getUserProfile(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if daily count needs reset
    const today = new Date().toISOString().split('T')[0];
    if (user.reset_date.toISOString().split('T')[0] !== today) {
      user.daily_count = 0;
      user.reset_date = new Date();
      await this.userRepository.save(user);
    }

    return {
      id: user.id,
      email: user.email,
      plan: user.plan,
      daily_count: user.daily_count,
      remaining_generations: user.plan === UserPlan.FREE ? Math.max(0, 3 - user.daily_count) : null,
      reset_date: user.reset_date,
    };
  }

  async updateUserPlan(userId: string, updatePlanDto: UpdatePlanDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.plan = updatePlanDto.plan;
    
    // Reset daily count when upgrading to Pro
    if (updatePlanDto.plan === UserPlan.PRO) {
      user.daily_count = 0;
    }

    await this.userRepository.save(user);

    return {
      id: user.id,
      email: user.email,
      plan: user.plan,
      daily_count: user.daily_count,
      remaining_generations: user.plan === UserPlan.FREE ? Math.max(0, 3 - user.daily_count) : null,
    };
  }

  async getUserStats(userId: string) {
    const user = await this.userRepository.findOne({ 
      where: { id: userId },
      relations: ['generations']
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const totalGenerations = user.generations.length;
    const today = new Date().toISOString().split('T')[0];
    const todayGenerations = user.generations.filter(
      gen => gen.created_at.toISOString().split('T')[0] === today
    ).length;

    return {
      plan: user.plan,
      total_generations: totalGenerations,
      today_generations: todayGenerations,
      daily_limit: user.plan === UserPlan.FREE ? 3 : null,
      remaining_today: user.plan === UserPlan.FREE ? Math.max(0, 3 - todayGenerations) : null,
    };
  }
}