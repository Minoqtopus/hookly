import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { GenerationModule } from './generation/generation.module';
import { UserModule } from './user/user.module';
import { PaymentsModule } from './payments/payments.module';
import { TeamsModule } from './teams/teams.module';
import { User } from './entities/user.entity';
import { Generation } from './entities/generation.entity';
import { Team, TeamMember, SharedGeneration } from './entities/team.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [User, Generation, Team, TeamMember, SharedGeneration],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    AuthModule,
    GenerationModule,
    UserModule,
    PaymentsModule,
    TeamsModule,
  ],
})
export class AppModule {}