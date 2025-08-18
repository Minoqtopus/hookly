import { Controller, Get, Put, Body, UseGuards, Request, Query } from '@nestjs/common';
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
      monthly_generation_count: profile.monthly_generation_count,
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

  @Get('generations')
  async getUserGenerations(
    @Request() req,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const offsetNum = offset ? parseInt(offset, 10) : 0;
    return this.userService.getUserGenerations(req.user.userId, limitNum, offsetNum);
  }
}