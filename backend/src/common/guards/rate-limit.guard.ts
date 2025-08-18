import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { AuthRequest } from '../interfaces/auth-request.interface';

@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  protected async getTracker(req: AuthRequest): Promise<string> {
    // Use user ID if authenticated, otherwise fall back to IP
    const userId = req.user?.userId;
    if (userId) {
      return `user:${userId}`;
    }
    
    // Get real IP address (handles proxies)
    const forwarded = req.headers['x-forwarded-for'] as string;
    const realIp = forwarded ? forwarded.split(',')[0].trim() : req.connection.remoteAddress;
    
    return `ip:${realIp}`;
  }

  protected throwThrottlingException(context: ExecutionContext): Promise<void> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const userId = request.user?.userId;
    
    // Log rate limit violations for monitoring
    console.warn(`Rate limit exceeded for ${userId ? `user:${userId}` : `IP:${request.ip}`}`);
    
    throw new ThrottlerException('Rate limit exceeded. Please try again later.');
  }

  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    
    // Skip rate limiting for health checks and metrics endpoints
    const skipPaths = ['/health', '/metrics', '/status'];
    return skipPaths.some(path => request.url.startsWith(path));
  }
}