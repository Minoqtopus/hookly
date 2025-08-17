import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { User } from '../entities/user.entity';
import { Team, TeamMember, SharedGeneration } from '../entities/team.entity';
import { Generation } from '../entities/generation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Team, TeamMember, SharedGeneration, Generation])
  ],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService]
})
export class TeamsModule {}