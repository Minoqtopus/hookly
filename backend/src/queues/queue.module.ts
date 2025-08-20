import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionQueueService } from './production-queue.service';
import { AIGenerationProcessor } from './processors/ai-generation.processor';
import { RetryService } from './retry.service';
import { GenerationJob } from '../entities/generation-job.entity';
import { ProviderHealth } from '../entities/provider-health.entity';
import { RetryAttempt } from '../entities/retry-attempt.entity';
import { CacheModule } from '../cache/cache.module';

/**
 * Production Queue Module
 * 
 * SOLID Principles Applied:
 * - Single Responsibility: Manages queue infrastructure and processors
 * - Open/Closed: Extensible for new processors without modification
 * - Liskov Substitution: ProductionQueueService implements JobQueuePort
 * - Interface Segregation: Clean separation of queue, retry, and processor concerns
 * - Dependency Inversion: All components depend on interfaces/ports
 */
@Module({
  imports: [
    ConfigModule,
    CacheModule,
    TypeOrmModule.forFeature([
      GenerationJob,
      ProviderHealth, 
      RetryAttempt,
    ]),
  ],
  providers: [
    // Core queue infrastructure
    ProductionQueueService,
    
    // Processors
    AIGenerationProcessor,
    
    // Supporting services
    RetryService,
    
    // Port implementations
    {
      provide: 'JobQueuePort',
      useExisting: ProductionQueueService,
    },
    {
      provide: 'RetryStrategyPort',
      useExisting: RetryService,
    },
  ],
  exports: [
    'JobQueuePort',
    'RetryStrategyPort',
    ProductionQueueService,
    RetryService,
  ],
})
export class QueueModule implements OnModuleInit {
  constructor(
    private queueService: ProductionQueueService,
    private aiGenerationProcessor: AIGenerationProcessor,
  ) {}

  async onModuleInit(): Promise<void> {
    // Register AI generation worker with the queue service
    this.queueService.registerWorker(
      'ai-generation',
      this.aiGenerationProcessor.process.bind(this.aiGenerationProcessor)
    );
    
    // Additional workers can be registered here as needed
    // Example:
    // this.queueService.registerWorker(
    //   'email-notification',
    //   this.emailProcessor.process.bind(this.emailProcessor)
    // );
  }
}