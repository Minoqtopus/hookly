import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AIService } from './ai.service';
import { MultiProviderAIService } from './multi-provider-ai.service';

@Module({
  imports: [ConfigModule],
  providers: [
    AIService, // Keep existing for compatibility
    MultiProviderAIService,
    
    // Use MultiProviderAIService for content generation
    {
      provide: 'ContentGeneratorPort',
      useClass: MultiProviderAIService,
    },
  ],
  exports: [
    AIService,
    MultiProviderAIService,
    'ContentGeneratorPort',
  ],
})
export class AIModule {}