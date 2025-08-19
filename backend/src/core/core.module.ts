import { Module } from '@nestjs/common';
import { GenerationPolicy } from './domain/policies/generation.policy';
import { PlanDeterminationPolicy } from './domain/policies/plan-determination.policy';
import { PlanLimitPolicy } from './domain/policies/plan-limit.policy';

@Module({
  providers: [
    PlanDeterminationPolicy,
    PlanLimitPolicy,
    GenerationPolicy,
  ],
  exports: [
    PlanDeterminationPolicy,
    PlanLimitPolicy,
    GenerationPolicy,
  ],
})
export class CoreModule {}
