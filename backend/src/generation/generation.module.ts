import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GenerationController } from './generation.controller';
import { GenerationService } from './generation.service';
import { User } from '../entities/user.entity';
import { Generation } from '../entities/generation.entity';
import { OpenAIModule } from '../openai/openai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Generation]),
    OpenAIModule,
  ],
  controllers: [GenerationController],
  providers: [GenerationService],
})
export class GenerationModule {}