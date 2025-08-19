import { Module } from '@nestjs/common';
import { LemonSqueezyAdapter } from './adapters/lemon-squeezy.adapter';

@Module({
  providers: [
    LemonSqueezyAdapter,
  ],
  exports: [
    LemonSqueezyAdapter,
  ],
})
export class InfrastructureModule {}
