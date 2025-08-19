import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Generation } from '../entities/generation.entity';
import { User } from '../entities/user.entity';
import { OpenAIModule } from '../openai/openai.module';
import { GenerationController } from './generation.controller';
import { GenerationService } from './generation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Generation]),
    OpenAIModule,
  ],
  controllers: [GenerationController],
  providers: [
    GenerationService,
    PlanLimitPolicy,
    GenerationPolicy,
    {
      provide: 'ContentGeneratorPort',
      useExisting: OpenAIService,
    },
  ],
})
export class GenerationModule {}