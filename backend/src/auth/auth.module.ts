import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsModule } from '../analytics/analytics.module';
import { EmailModule } from '../email/email.module';
import { EmailVerification } from '../entities/email-verification.entity';
import { SignupControl } from '../entities/signup-control.entity';
import { User } from '../entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AdminGuard } from './guards/admin.guard';
import { SignupControlService } from './signup-control.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, EmailVerification, SignupControl]),
    PassportModule,
    JwtModule.register({}),
    EmailModule,

    forwardRef(() => AnalyticsModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, SignupControlService, JwtStrategy, GoogleStrategy, AdminGuard],
  exports: [AuthService, SignupControlService, AdminGuard],
})
export class AuthModule {}