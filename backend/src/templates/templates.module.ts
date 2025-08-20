import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from '../auth/auth.module';
import { Template } from '../entities/template.entity';
import { TemplatePurchase } from '../entities/template-purchase.entity';
import { TemplateReview } from '../entities/template-review.entity';
import { Generation } from '../entities/generation.entity';
import { User } from '../entities/user.entity';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { TemplateRevenueService } from './template-revenue.service';
import { TemplatePricingService } from './template-pricing.service';
import { TemplateAnalyticsService } from './template-analytics.service';
import { TemplateApprovalService } from './template-approval.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Template, 
      TemplatePurchase, 
      TemplateReview, 
      Generation,
      User
    ]),
    AuthModule,
    ScheduleModule.forRoot(), // For scheduled analytics tasks
  ],
  controllers: [TemplatesController],
  providers: [
    TemplatesService,
    TemplateRevenueService,
    TemplatePricingService,
    TemplateAnalyticsService,
    TemplateApprovalService,
  ],
  exports: [
    TemplatesService,
    TemplateRevenueService,
    TemplatePricingService,
    TemplateAnalyticsService,
    TemplateApprovalService,
  ],
})
export class TemplatesModule {}