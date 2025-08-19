import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsModule } from '../analytics/analytics.module';
import { User } from '../entities/user.entity';
import { BetaManagementService } from './beta-management.service';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AnalyticsModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, BetaManagementService],
  exports: [PaymentsService, BetaManagementService],
})
export class PaymentsModule {}