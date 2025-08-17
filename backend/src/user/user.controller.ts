import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  async getProfile(@Request() req) {
    return this.userService.getUserProfile(req.user.userId);
  }

  @Get('plan')
  async getPlan(@Request() req) {
    const profile = await this.userService.getUserProfile(req.user.userId);
    return {
      plan: profile.plan,
      daily_count: profile.daily_count,
      remaining_generations: profile.remaining_generations,
    };
  }

  @Put('plan')
  async updatePlan(@Request() req, @Body() updatePlanDto: UpdatePlanDto) {
    return this.userService.updateUserPlan(req.user.userId, updatePlanDto);
  }

  @Get('stats')
  async getStats(@Request() req) {
    return this.userService.getUserStats(req.user.userId);
  }
}