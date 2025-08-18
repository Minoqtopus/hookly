import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RATE_LIMIT_KEY, RateLimitOptions } from '../decorators/rate-limit.decorator';

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const rateLimitOptions = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!rateLimitOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Add rate limit headers to response
    response.setHeader('X-RateLimit-Limit', rateLimitOptions.limit);
    response.setHeader('X-RateLimit-Window', rateLimitOptions.ttl);

    return next.handle().pipe(
      tap({
        next: () => {
          // Log successful requests if needed
          if (!rateLimitOptions.skipSuccessfulRequests) {
            this.logRequest(request, 'success');
          }
        },
        error: (error) => {
          // Log failed requests if needed
          if (!rateLimitOptions.skipFailedRequests) {
            this.logRequest(request, 'error', error.message);
          }
        },
      }),
    );
  }

  private logRequest(request: any, status: 'success' | 'error', errorMessage?: string) {
    const userId = request.user?.userId;
    const endpoint = `${request.method} ${request.route?.path || request.url}`;
    
    if (status === 'error') {
      console.log(`Rate limit request failed: ${endpoint} - User: ${userId || 'anonymous'} - Error: ${errorMessage}`);
    }
    // Successful requests are logged at debug level only
  }
}