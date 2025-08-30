import { Module } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { PricingController } from './pricing.controller';

@Module({
  controllers: [PricingController],
  providers: [PricingService],
  exports: [PricingService], // Export for use in other modules
})
export class PricingModule {}