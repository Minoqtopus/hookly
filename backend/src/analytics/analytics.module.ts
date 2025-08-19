import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AnalyticsEvent } from '../entities/analytics-event.entity';
import { Generation } from '../entities/generation.entity';
import { User } from '../entities/user.entity';
import { OverageService } from '../payments/overage.service';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { PlanAnalyticsService } from './plan-analytics.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AnalyticsEvent, User, Generation]),
    forwardRef(() => AuthModule),
  ],
  controllers: [AnalyticsController, OnboardingController],
  providers: [AnalyticsService, OnboardingService, PlanAnalyticsService, OverageService],
  exports: [AnalyticsService, OnboardingService, PlanAnalyticsService, OverageService],
})
export class AnalyticsModule {}