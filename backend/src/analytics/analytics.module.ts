import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { AnalyticsEvent } from '../entities/analytics-event.entity';
import { User } from '../entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AnalyticsEvent, User]),
    forwardRef(() => AuthModule),
  ],
  controllers: [AnalyticsController, OnboardingController],
  providers: [AnalyticsService, OnboardingService],
  exports: [AnalyticsService, OnboardingService],
})
export class AnalyticsModule {}