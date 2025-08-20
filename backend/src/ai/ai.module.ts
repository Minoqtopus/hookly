import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GeminiAdapter } from '../infrastructure/adapters/gemini.adapter';
import { GroqAdapter } from '../infrastructure/adapters/groq.adapter';
import { OpenAIAdapter } from '../infrastructure/adapters/openai.adapter';
import { AIConfigService } from './ai-config.service';
import { AIService } from './ai.service';
import { ProviderOrchestratorService } from './provider-orchestrator.service';
import { TokenManagementService } from './token-management.service';

@Module({
  imports: [ConfigModule],
  providers: [
    AIService,
    
    // AI Strategy and Configuration
    AIConfigService,
    TokenManagementService,
    
    // AI Provider Adapters
    GeminiAdapter,
    GroqAdapter,
    OpenAIAdapter,
    
    // Provider Orchestrator
    ProviderOrchestratorService,
    
    // Provide ContentGeneratorPort implementation
    {
      provide: 'ContentGeneratorPort',
      useClass: ProviderOrchestratorService,
    },
  ],
  exports: [
    AIService,
    AIConfigService,
    TokenManagementService,
    ProviderOrchestratorService,
    'ContentGeneratorPort',
  ],
})
export class AIModule {}