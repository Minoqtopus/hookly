import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsModule } from '../analytics/analytics.module';
import { AnalyticsService } from '../analytics/analytics.service';
import { PlanDeterminationPolicy } from '../core/domain/policies/plan-determination.policy';
import { User } from '../entities/user.entity';
import { LemonSqueezyAdapter } from '../infrastructure/adapters/lemon-squeezy.adapter';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AnalyticsModule,
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentsService, 
    {
      provide: 'PaymentProviderPort',
      useClass: LemonSqueezyAdapter,
    },
    {
      provide: 'AnalyticsPort',
      useExisting: AnalyticsService,
    },
    PlanDeterminationPolicy,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}