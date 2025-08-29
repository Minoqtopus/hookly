import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsModule } from '../analytics/analytics.module';
import { EmailModule } from '../email/email.module';
import { EmailVerification } from '../entities/email-verification.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { User } from '../entities/user.entity';
// Legacy imports removed - using specialized controllers and services
import { AdminManagementService } from './services/supporting/admin-management.service';
import { RefreshTokenService } from './services/supporting/refresh-token.service';
import { TrialAbusePreventionService } from './services/supporting/trial-abuse-prevention.service';
import { AdminGuard } from './guards/admin.guard';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SecurityLoggerService } from '../common/services/security-logger.service';
import { EmailVerificationService } from './services/email-verification.service';
import { PasswordManagementService } from './services/password-management.service';
import { OAuthAuthenticationService } from './services/oauth-authentication.service';
import { CoreAuthenticationService } from './services/core-authentication.service';
import {
  CoreAuthenticationController,
  OAuthController,
  EmailVerificationController,
  PasswordManagementController,
} from './controllers';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, EmailVerification, RefreshToken]),
    PassportModule,
    JwtModule.register({}),
    EmailModule,
    forwardRef(() => AnalyticsModule),
  ],
  controllers: [
    // Staff Engineer specialized controllers (clean architecture)
    CoreAuthenticationController,
    OAuthController,
    EmailVerificationController,
    PasswordManagementController,
  ],
  providers: [
    // Specialized authentication services (Staff Engineer clean architecture)
    CoreAuthenticationService,
    OAuthAuthenticationService,
    EmailVerificationService,
    PasswordManagementService,
    // Supporting services
    AdminManagementService,
    RefreshTokenService,
    TrialAbusePreventionService,
    SecurityLoggerService,
    // Passport strategies
    JwtStrategy,
    GoogleStrategy,
    // Guards
    AdminGuard,
  ],
  exports: [
    // Specialized services for other modules
    CoreAuthenticationService,
    OAuthAuthenticationService,
    EmailVerificationService,
    PasswordManagementService,
    // Supporting services
    AdminManagementService, 
    RefreshTokenService, 
    TrialAbusePreventionService, 
    AdminGuard, 
    SecurityLoggerService
  ],
})
export class AuthModule {}