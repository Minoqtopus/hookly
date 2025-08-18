import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorMonitorService } from '../services/error-monitor.service';
import { AuthRequest } from '../interfaces/auth-request.interface';

@Injectable()
export class ErrorLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorLoggingInterceptor.name);

  constructor(private readonly errorMonitor: ErrorMonitorService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        this.logError(error, context);
        return throwError(() => error);
      }),
    );
  }

  private async logError(error: any, context: ExecutionContext): Promise<void> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const response = context.switchToHttp().getResponse();

    // Determine error level
    let level: 'error' | 'warn' | 'fatal' = 'error';
    if (error instanceof HttpException) {
      const status = error.getStatus();
      if (status >= 500) {
        level = 'error';
      } else if (status >= 400) {
        level = 'warn';
      }
    } else {
      level = 'fatal'; // Non-HTTP exceptions are typically fatal
    }

    // Skip logging for certain types of errors
    if (this.shouldSkipLogging(error, request)) {
      return;
    }

    await this.errorMonitor.logError({
      level,
      message: error.message || 'Unknown error',
      stack: error.stack,
      userId: request.user?.userId,
      ip: this.getClientIp(request),
      userAgent: request.headers['user-agent'],
      url: request.url,
      method: request.method,
      metadata: {
        statusCode: error.status || 500,
        errorType: error.constructor.name,
        body: this.sanitizeRequestBody(request.body),
        query: request.query,
        params: request.params,
        timestamp: new Date().toISOString(),
      },
    });
  }

  private shouldSkipLogging(error: any, request: AuthRequest): boolean {
    // Skip 404 errors for static assets
    if (error.status === 404 && request.url?.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
      return true;
    }

    // Skip validation errors (400) for non-critical endpoints
    if (error.status === 400 && request.url?.startsWith('/api/analytics')) {
      return true;
    }

    // Skip rate limit errors (already logged by rate limit guard)
    if (error.status === 429) {
      return true;
    }

    return false;
  }

  private getClientIp(request: AuthRequest): string {
    const forwarded = request.headers['x-forwarded-for'] as string;
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    return request.connection?.remoteAddress || request.ip || 'unknown';
  }

  private sanitizeRequestBody(body: any): any {
    if (!body) return body;

    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
    const sanitized = { ...body };

    const sanitizeObject = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) return obj;
      
      const result = Array.isArray(obj) ? [] : {};
      
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        if (sensitiveFields.some(field => lowerKey.includes(field))) {
          (result as any)[key] = '[REDACTED]';
        } else if (typeof value === 'object') {
          (result as any)[key] = sanitizeObject(value);
        } else {
          (result as any)[key] = value;
        }
      }
      
      return result;
    };

    return sanitizeObject(sanitized);
  }
}