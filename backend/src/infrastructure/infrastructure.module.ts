import { Module } from '@nestjs/common';
import { LemonSqueezyAdapter } from './adapters/lemon-squeezy.adapter';

@Module({
  providers: [
    LemonSqueezyAdapter,
    {
      provide: 'PaymentProviderPort',
      useClass: LemonSqueezyAdapter,
    },
  ],
  exports: [
    LemonSqueezyAdapter,
    'PaymentProviderPort',
  ],
})
export class InfrastructureModule {}
