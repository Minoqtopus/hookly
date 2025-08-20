import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanLimitPolicy } from '../core/domain/policies/plan-limit.policy';
import { GenerationPolicy } from '../core/domain/policies/generation.policy';
import { Generation } from '../entities/generation.entity';
import { User } from '../entities/user.entity';
import { AIModule } from '../ai/ai.module';
import { GenerationController } from './generation.controller';
import { GenerationService } from './generation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Generation]),
    AIModule,
  ],
  controllers: [GenerationController],
  providers: [
    GenerationService,
    PlanLimitPolicy,
    GenerationPolicy,
  ],
})
export class GenerationModule {}