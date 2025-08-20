import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanLimitPolicy } from '../core/domain/policies/plan-limit.policy';
import { GenerationPolicy } from '../core/domain/policies/generation.policy';
import { Generation } from '../entities/generation.entity';
import { User } from '../entities/user.entity';
import { AIModule } from '../ai/ai.module';
import { QueueModule } from '../queues/queue.module';
import { GenerationController } from './generation.controller';
import { GenerationService } from './generation.service';
import { GenerationQueueService } from './generation-queue.service';
import { GenerationJob } from '../entities/generation-job.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Generation, GenerationJob]),
    AIModule,
    QueueModule, // Production queue infrastructure
  ],
  controllers: [GenerationController],
  providers: [
    GenerationService, // Keep for backward compatibility if needed
    GenerationQueueService, // Production queue-based service
    PlanLimitPolicy,
    GenerationPolicy,
  ],
})
export class GenerationModule {}