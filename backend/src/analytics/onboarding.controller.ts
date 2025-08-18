import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequireAdmin } from '../auth/decorators/admin.decorator';

@Controller('analytics/onboarding')
export class OnboardingController {
  constructor(private onboardingService: OnboardingService) {}

  @Get('progress')
  @UseGuards(JwtAuthGuard)
  async getUserOnboardingProgress(@Request() req: any) {
    return this.onboardingService.getUserOnboardingProgress(req.user.userId);
  }

  @Get('engagement-score')
  @UseGuards(JwtAuthGuard)
  async getUserEngagementScore(@Request() req: any) {
    return this.onboardingService.calculateUserEngagementScore(req.user.userId);
  }

  @Get('analytics')
  @RequireAdmin()
  async getOnboardingAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    
    return this.onboardingService.getOnboardingAnalytics(start, end);
  }

  @Get('nudge-candidates')
  @RequireAdmin()
  async getUsersNeedingNudge(
    @Query('daysInactive') daysInactive?: string,
    @Query('engagementThreshold') engagementThreshold?: string,
  ) {
    const inactive = daysInactive ? parseInt(daysInactive, 10) : 3;
    const threshold = engagementThreshold ? parseInt(engagementThreshold, 10) : 30;
    
    return this.onboardingService.getUsersNeedingNudge(inactive, threshold);
  }

  @Get('user-progress/:userId')
  @RequireAdmin()
  async getSpecificUserProgress(@Query('userId') userId: string) {
    const [onboarding, engagement] = await Promise.all([
      this.onboardingService.getUserOnboardingProgress(userId),
      this.onboardingService.calculateUserEngagementScore(userId),
    ]);

    return {
      onboarding,
      engagement,
    };
  }
}