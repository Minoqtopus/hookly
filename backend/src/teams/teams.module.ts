import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Generation } from '../entities/generation.entity';
import { SharedGeneration, Team, TeamActivity, TeamInvitation, TeamMember } from '../entities/team.entity';
import { User } from '../entities/user.entity';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Team, TeamMember, SharedGeneration, TeamInvitation, TeamActivity, Generation])
  ],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService]
})
export class TeamsModule {}