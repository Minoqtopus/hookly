import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { AnalyticsEvent } from './entities/analytics-event.entity';
import { ApiKey } from './entities/api-key.entity';
import { EmailVerification } from './entities/email-verification.entity';
import { Generation } from './entities/generation.entity';
import { SubscriptionEvent } from './entities/subscription-event.entity';
import { SharedGeneration, Team, TeamMember } from './entities/team.entity';
import { Template } from './entities/template.entity';
import { UserSettings } from './entities/user-settings.entity';
import { User } from './entities/user.entity';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [
    User,
    Generation,
    Team,
    TeamMember,
    SharedGeneration,
    Template,
    UserSettings,
    AnalyticsEvent,
    EmailVerification,
    ApiKey,
    SubscriptionEvent
  ],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
