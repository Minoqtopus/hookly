import { Controller, Post, Body, Get, UseGuards, Request, Res, Query } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RateLimit, RateLimits } from '../common/decorators/rate-limit.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @RateLimit(RateLimits.AUTH_REGISTER)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @RateLimit(RateLimits.AUTH_LOGIN)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  async refresh(@Body('refresh_token') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Request() req: any, @Res() res: Response) {
    try {
      const result = await this.authService.validateOAuthUser({
        google_id: req.user.google_id,
        email: req.user.email,
        avatar_url: req.user.avatar_url,
      });

      // Redirect to frontend with tokens
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/auth/callback?access_token=${result.access_token}&refresh_token=${result.refresh_token}`;
      
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/auth/error?message=oauth_failed`);
    }
  }

  @Post('send-verification')
  @UseGuards(JwtAuthGuard)
  @RateLimit(RateLimits.EMAIL_VERIFICATION)
  async sendVerificationEmail(@Request() req: any) {
    return this.authService.sendVerificationEmail(req.user.userId);
  }

  @Post('verify-email')
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto.token);
  }

  @Post('resend-verification')
  @UseGuards(JwtAuthGuard)
  @RateLimit(RateLimits.EMAIL_VERIFICATION)
  async resendVerificationEmail(@Request() req: any) {
    return this.authService.resendVerificationEmail(req.user.userId);
  }

  @Post('forgot-password')
  @RateLimit(RateLimits.AUTH_RESET_PASSWORD)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @RateLimit(RateLimits.AUTH_RESET_PASSWORD)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.password);
  }
}