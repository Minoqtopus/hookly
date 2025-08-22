import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { AnalyticsEvent } from './entities/analytics-event.entity';
import { EmailVerification } from './entities/email-verification.entity';
import { GenerationJob } from './entities/generation-job.entity';
import { Generation } from './entities/generation.entity';
import { SignupControl } from './entities/signup-control.entity';
import { User } from './entities/user.entity';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [
    User,
    Generation,
    GenerationJob,
    AnalyticsEvent,
    EmailVerification,
    SignupControl
  ],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
