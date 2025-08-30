import { Injectable, ExecutionContext, Inject } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException, ThrottlerModuleOptions, ThrottlerStorage } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import { AuthRequest } from '../interfaces/auth-request.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  // Trusted proxy IPs (should be configured via environment)
  private readonly TRUSTED_PROXIES = new Set([
    '127.0.0.1',
    '::1',
    '10.0.0.0/8',
    '172.16.0.0/12', 
    '192.168.0.0/16',
    // Add your load balancer/proxy IPs here
  ]);

  constructor(
    @Inject('THROTTLER:MODULE_OPTIONS')
    protected readonly options: ThrottlerModuleOptions,
    @Inject(ThrottlerStorage)
    protected readonly storageService: ThrottlerStorage,
    protected readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {
    super(options, storageService, reflector);
  }

  protected async getTracker(req: AuthRequest): Promise<string> {
    // Use user ID if authenticated, otherwise fall back to IP
    // JWT strategy sets user.userId
    const userId = req.user?.userId;
    if (userId) {
      return `user:${userId}`;
    }
    
    // Get real IP address with secure proxy handling
    const realIp = this.getRealClientIP(req);
    
    return `ip:${realIp}`;
  }

  /**
   * Securely extract real client IP with proxy validation
   */
  private getRealClientIP(req: AuthRequest): string {
    // Get the direct connection IP
    const directIP = req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
    
    // Check if request is from trusted proxy
    if (!this.isTrustedProxy(directIP)) {
      // Request is not from trusted proxy, use direct IP
      return this.sanitizeIP(directIP);
    }

    // Request is from trusted proxy, check forwarded headers
    const forwarded = req.headers['x-forwarded-for'] as string;
    if (forwarded) {
      // Get the first IP in the chain (original client)
      const firstIP = forwarded.split(',')[0].trim();
      return this.sanitizeIP(firstIP);
    }

    // Fallback to direct IP
    return this.sanitizeIP(directIP);
  }

  /**
   * Check if IP is in trusted proxy list
   */
  private isTrustedProxy(ip: string): boolean {
    // In production, this should check against configured trusted proxies
    // For now, only trust localhost
    const trustedIPs = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];
    return trustedIPs.includes(ip);
  }

  /**
   * Sanitize IP address to prevent injection
   */
  private sanitizeIP(ip: string): string {
    // Remove any non-IP characters for security
    const sanitized = ip.replace(/[^0-9a-fA-F:\.]/g, '');
    
    // Validate IP format
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
    
    if (ipv4Regex.test(sanitized) || ipv6Regex.test(sanitized)) {
      return sanitized;
    }
    
    // If IP is invalid, return a safe fallback
    return '0.0.0.0';
  }

  protected throwThrottlingException(context: ExecutionContext): Promise<void> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const userId = request.user?.userId;
    const endpoint = `${request.method} ${request.url}`;
    
    // Log rate limit violations for monitoring with endpoint info
    console.warn(`Rate limit exceeded for ${userId ? `user:${userId}` : `IP:${request.ip}`} on ${endpoint}`);
    
    throw new ThrottlerException('Rate limit exceeded. Please try again later.');
  }

  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    
    // Skip rate limiting for health checks and metrics endpoints
    const skipPaths = ['/health', '/metrics', '/status'];
    return skipPaths.some(path => request.url.startsWith(path));
  }
}