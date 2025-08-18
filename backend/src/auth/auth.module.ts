import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';
import { EmailVerification } from '../entities/email-verification.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { AdminGuard } from './guards/admin.guard';
import { EmailModule } from '../email/email.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, EmailVerification]),
    PassportModule,
    JwtModule.register({}),
    EmailModule,
    forwardRef(() => AnalyticsModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy, AdminGuard],
  exports: [AuthService, AdminGuard],
})
export class AuthModule {}