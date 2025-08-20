import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsModule } from '../analytics/analytics.module';
import { CustomIntegrationRequest } from '../entities/custom-integration-request.entity';
import { EnterpriseUpsell } from '../entities/enterprise-upsell.entity';
import { Team } from '../entities/team.entity';
import { User } from '../entities/user.entity';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { EnterpriseUpsellController } from './enterprise-upsell.controller';
import { EnterpriseUpsellService } from './enterprise-upsell.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EnterpriseUpsell,
      CustomIntegrationRequest,
      User,
      Team,
    ]),
    AnalyticsModule,
    InfrastructureModule,
  ],
  controllers: [EnterpriseUpsellController],
  providers: [
    EnterpriseUpsellService,
    {
      provide: 'EnterpriseUpsellPort',
      useClass: EnterpriseUpsellService,
    },
  ],
  exports: [
    EnterpriseUpsellService,
    'EnterpriseUpsellPort',
  ],
})
export class EnterpriseUpsellModule {}
