import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIModule } from '../ai/ai.module';
import { GenerationJob } from '../entities/generation-job.entity';
import { ProductionQueueService } from './production-queue.service';

/**
 * Production Queue Module
 * 
 * SOLID Principles Applied:
 * - Single Responsibility: Manages queue infrastructure
 * - Open/Closed: Extensible for new processors without modification
 * - Liskov Substitution: ProductionQueueService implements JobQueuePort
 * - Interface Segregation: Clean separation of queue concerns
 * - Dependency Inversion: All components depend on interfaces/ports
 */
@Module({
  imports: [
    ConfigModule,
    AIModule,
    TypeOrmModule.forFeature([
      GenerationJob,
    ]),
  ],
  providers: [
    // Core queue infrastructure
    ProductionQueueService,
    
    // Port implementations
    {
      provide: 'JobQueuePort',
      useExisting: ProductionQueueService,
    },
  ],
  exports: [
    'JobQueuePort',
    ProductionQueueService,
  ],
})
export class QueueModule {}