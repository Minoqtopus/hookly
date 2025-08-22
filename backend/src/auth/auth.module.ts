import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsModule } from '../analytics/analytics.module';
import { EmailModule } from '../email/email.module';
import { EmailVerification } from '../entities/email-verification.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { User } from '../entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AdminManagementService } from './admin-management.service';
import { RefreshTokenService } from './refresh-token.service';
import { TrialAbusePreventionService } from './trial-abuse-prevention.service';
import { AdminGuard } from './guards/admin.guard';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SecurityLoggerService } from '../common/services/security-logger.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, EmailVerification, RefreshToken]),
    PassportModule,
    JwtModule.register({}),
    EmailModule,
    forwardRef(() => AnalyticsModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, AdminManagementService, RefreshTokenService, TrialAbusePreventionService, JwtStrategy, GoogleStrategy, AdminGuard, SecurityLoggerService],
  exports: [AuthService, AdminManagementService, RefreshTokenService, TrialAbusePreventionService, AdminGuard, SecurityLoggerService],
})
export class AuthModule {}