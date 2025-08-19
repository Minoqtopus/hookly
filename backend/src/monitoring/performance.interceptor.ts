import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { PerformanceMonitorService } from './performance-monitor.service';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);

  constructor(private readonly performanceMonitor: PerformanceMonitorService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    const endpoint = request.route?.path || request.url;
    const method = request.method;
    const userId = request.user?.id;
    const ip = request.ip;
    const userAgent = request.get('User-Agent');

    // Track the request start
    this.logger.debug(`Request started: ${method} ${endpoint}`);

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        
        // Track successful request performance
        this.performanceMonitor.trackRequest(
          endpoint,
          method,
          duration,
          userId,
          ip,
          userAgent,
          {
            statusCode: response.statusCode,
            responseSize: JSON.stringify(data).length,
            userPlan: request.user?.plan,
          }
        );

        this.logger.debug(`Request completed: ${method} ${endpoint} in ${duration}ms`);
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        
        // Track failed request performance
        this.performanceMonitor.trackRequest(
          endpoint,
          method,
          duration,
          userId,
          ip,
          userAgent,
          {
            statusCode: error.status || 500,
            error: error.message,
            userPlan: request.user?.plan,
          }
        );

        this.logger.error(`Request failed: ${method} ${endpoint} in ${duration}ms`, error);
        throw error;
      })
    );
  }
}
