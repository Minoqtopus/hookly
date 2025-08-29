import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from '../ai/ai.module';
import { Generation } from '../entities/generation.entity';
import { User } from '../entities/user.entity';
import { GenerationController } from './generation.controller';
import { GenerationService } from './generation.service';
import { GenerationDomainService } from '../domain/services/generation-domain.service';
import { ValidationService } from '../domain/services/validation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Generation, User]),
    AiModule
  ],
  controllers: [GenerationController],
  providers: [
    GenerationService,
    GenerationDomainService,
    ValidationService
  ],
  exports: [GenerationService]
})
export class GenerationModule {}