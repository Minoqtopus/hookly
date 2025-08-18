import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ErrorMonitorService } from '../services/error-monitor.service';
import { AuthRequest } from '../interfaces/auth-request.interface';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly errorMonitor: ErrorMonitorService) {}

  async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest<AuthRequest>();

    let status: number;
    let message: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'object' 
        ? (exceptionResponse as any).message || exception.message
        : exception.message;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
    }

    // Log the error (only for server errors or critical issues)
    if (status >= 500 || this.isCriticalError(exception)) {
      await this.errorMonitor.logError({
        level: status >= 500 ? 'fatal' : 'error',
        message: exception instanceof Error ? exception.message : 'Unknown error',
        stack: exception instanceof Error ? exception.stack : undefined,
        userId: request.user?.userId,
        ip: this.getClientIp(request),
        userAgent: request.headers['user-agent'],
        url: request.url,
        method: request.method,
        metadata: {
          statusCode: status,
          errorType: exception?.constructor?.name || 'Unknown',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Send error response
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: this.getPublicMessage(status, message),
    };

    response.status(status).json(errorResponse);
  }

  private isCriticalError(exception: unknown): boolean {
    if (!(exception instanceof Error)) return false;
    
    const criticalPatterns = [
      /database/i,
      /connection/i,
      /timeout/i,
      /memory/i,
      /filesystem/i,
    ];

    return criticalPatterns.some(pattern => 
      pattern.test(exception.message) || 
      (exception.stack && pattern.test(exception.stack))
    );
  }

  private getClientIp(request: AuthRequest): string {
    const forwarded = request.headers['x-forwarded-for'] as string;
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    return request.connection?.remoteAddress || request.ip || 'unknown';
  }

  private getPublicMessage(status: number, originalMessage: string): string {
    // Don't leak internal error details in production
    if (process.env.NODE_ENV === 'production' && status >= 500) {
      return 'An internal error occurred. Please try again later.';
    }
    return originalMessage;
  }
}