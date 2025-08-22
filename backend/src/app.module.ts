import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { RateLimitGuard } from './common/guards/rate-limit.guard';
import { ErrorLoggingInterceptor } from './common/interceptors/error-logging.interceptor';
import { RateLimitInterceptor } from './common/interceptors/rate-limit.interceptor';
import { AnalyticsEvent } from './entities/analytics-event.entity';
import { EmailVerification } from './entities/email-verification.entity';
import { GenerationJob } from './entities/generation-job.entity';
import { Generation } from './entities/generation.entity';
import { SignupControl } from './entities/signup-control.entity';
import { User } from './entities/user.entity';
import { GenerationModule } from './generation/generation.module';
import { HealthModule } from './health/health.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { PaymentsModule } from './payments/payments.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60 * 1000, // 1 minute in milliseconds
        limit: 100, // Default limit of 100 requests per minute
      }
    ]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [
        User, 
        Generation, 
        GenerationJob,
        AnalyticsEvent,
        EmailVerification,
        SignupControl,
      ],
      synchronize: false, // Disabled to avoid enum conflicts - migrations handled separately
    }),
    AuthModule,
    GenerationModule,
    UserModule,
    PaymentsModule,
    AnalyticsModule,
    HealthModule,
    InfrastructureModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RateLimitInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorLoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}