import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AiModule } from '../ai/ai.module';
import { ScrapingModule } from '../scraping/scraping.module';
import { Generation } from '../entities/generation.entity';
import { User } from '../entities/user.entity';
import { GenerationController } from './generation.controller';
import { GenerationService } from './generation.service';
import { GenerationGateway } from './generation.gateway';
import { GenerationDomainService } from '../domain/services/generation-domain.service';
import { ValidationService } from '../domain/services/validation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Generation, User]),
    JwtModule.register({}), // For GenerationGateway JWT authentication
    AiModule,
    ScrapingModule
  ],
  controllers: [GenerationController],
  providers: [
    GenerationService,
    GenerationGateway,
    GenerationDomainService,
    ValidationService
  ],
  exports: [GenerationService, GenerationGateway]
})
export class GenerationModule {}