/**
 * Production-Grade Logging Service
 * 
 * Implements comprehensive logging for $10M+ ARR scale applications
 * 
 * Features:
 * - Environment-aware logging (verbose in dev, errors only in prod)
 * - Structured JSON logging for log aggregation services
 * - Daily rotating log files with automatic cleanup
 * - Performance metrics tracking
 * - Request/Response logging with sanitization
 * - Error tracking with stack traces (dev only)
 * - Integration ready for services like DataDog, New Relic, or ELK stack
 */

import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppLoggerService implements LoggerService {
  private logger: winston.Logger;
  private readonly isDevelopment: boolean;
  private readonly isProduction: boolean;

  constructor(private configService: ConfigService) {
    this.isDevelopment = this.configService.get('NODE_ENV') === 'development';
    this.isProduction = this.configService.get('NODE_ENV') === 'production';
    
    this.logger = this.createLogger();
  }

  private createLogger(): winston.Logger {
    const logLevel = this.isProduction ? 'error' : 'debug';
    
    // Custom format for development - human readable
    const devFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, context, trace, ...meta }) => {
        let log = `${timestamp} [${level}] ${context ? `[${context}]` : ''} ${message}`;
        
        // Add metadata if present
        if (Object.keys(meta).length > 0) {
          log += `\n  Meta: ${JSON.stringify(meta, null, 2)}`;
        }
        
        // Add stack trace in development
        if (trace && this.isDevelopment) {
          log += `\n  Stack: ${trace}`;
        }
        
        return log;
      })
    );

    // Custom format for production - JSON for log aggregation
    const prodFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: false }), // No stack traces in prod
      winston.format.json()
    );

    const transports: winston.transport[] = [];

    // Console transport - always enabled
    transports.push(
      new winston.transports.Console({
        format: this.isDevelopment ? devFormat : prodFormat,
        level: logLevel,
      })
    );

    // File transports for production or when explicitly enabled
    if (this.isProduction || this.configService.get('ENABLE_FILE_LOGGING') === 'true') {
      const logDir = this.configService.get('LOG_DIR') || 'logs';
      
      // Error logs - always kept
      transports.push(
        new DailyRotateFile({
          dirname: logDir,
          filename: 'error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '30d', // Keep 30 days of error logs
          level: 'error',
          format: winston.format.json(),
        })
      );

      // Combined logs - all levels
      transports.push(
        new DailyRotateFile({
          dirname: logDir,
          filename: 'combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '100m',
          maxFiles: '7d', // Keep only 7 days of combined logs
          format: winston.format.json(),
        })
      );

      // Performance logs - for metrics
      transports.push(
        new DailyRotateFile({
          dirname: `${logDir}/performance`,
          filename: 'perf-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '50m',
          maxFiles: '14d',
          level: 'info',
          format: winston.format.json(),
        })
      );
    }

    return winston.createLogger({
      level: logLevel,
      transports,
      // Don't exit on uncaught errors
      exitOnError: false,
    });
  }

  // Standard NestJS LoggerService methods
  log(message: string, context?: string) {
    if (!this.isProduction) {
      this.logger.info(message, { context });
    }
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { context, trace });
  }

  warn(message: string, context?: string) {
    if (!this.isProduction) {
      this.logger.warn(message, { context });
    }
  }

  debug(message: string, context?: string) {
    if (this.isDevelopment) {
      this.logger.debug(message, { context });
    }
  }

  verbose(message: string, context?: string) {
    if (this.isDevelopment) {
      this.logger.verbose(message, { context });
    }
  }

  // Custom methods for business metrics
  logPerformance(operation: string, duration: number, metadata?: any) {
    this.logger.info('Performance Metric', {
      type: 'performance',
      operation,
      duration,
      ...metadata,
    });
  }

  logApiRequest(method: string, url: string, userId?: string, duration?: number) {
    if (this.isDevelopment) {
      this.logger.info('API Request', {
        type: 'api_request',
        method,
        url,
        userId,
        duration,
      });
    }
  }

  logBusinessEvent(event: string, userId?: string, metadata?: any) {
    this.logger.info('Business Event', {
      type: 'business_event',
      event,
      userId,
      ...metadata,
    });
  }

  logSecurityEvent(event: string, userId?: string, ip?: string, metadata?: any) {
    // Security events are always logged
    this.logger.warn('Security Event', {
      type: 'security',
      event,
      userId,
      ip,
      ...metadata,
    });
  }

  // Sanitize sensitive data before logging
  private sanitizeData(data: any): any {
    if (!data) return data;
    
    const sensitiveKeys = ['password', 'token', 'secret', 'authorization', 'cookie', 'credit_card'];
    
    if (typeof data === 'object') {
      const sanitized = { ...data };
      
      for (const key of Object.keys(sanitized)) {
        if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
          sanitized[key] = '[REDACTED]';
        } else if (typeof sanitized[key] === 'object') {
          sanitized[key] = this.sanitizeData(sanitized[key]);
        }
      }
      
      return sanitized;
    }
    
    return data;
  }

  logRequest(request: any) {
    if (this.isDevelopment) {
      const sanitized = this.sanitizeData({
        method: request.method,
        url: request.url,
        headers: request.headers,
        body: request.body,
        query: request.query,
        userId: request.user?.userId,
      });
      
      this.logger.debug('HTTP Request', sanitized);
    }
  }

  logResponse(request: any, response: any, duration: number) {
    if (this.isDevelopment) {
      this.logger.debug('HTTP Response', {
        method: request.method,
        url: request.url,
        statusCode: response.statusCode,
        duration: `${duration}ms`,
        userId: request.user?.userId,
      });
    }
  }
}

/**
 * Logging Best Practices for $10M+ ARR Scale:
 * 
 * 1. **Structured Logging**: Use JSON format in production for easy parsing
 * 2. **Log Aggregation**: Integrate with services like:
 *    - DataDog (recommended for ease of use)
 *    - ELK Stack (Elasticsearch, Logstash, Kibana)
 *    - New Relic or AppDynamics
 * 
 * 3. **Performance Monitoring**: Track key metrics:
 *    - API response times
 *    - Database query duration
 *    - AI generation time
 *    - WebSocket connection metrics
 * 
 * 4. **Error Tracking**: Use services like:
 *    - Sentry (recommended)
 *    - Rollbar
 *    - Bugsnag
 * 
 * 5. **Security**: 
 *    - Never log sensitive data (passwords, tokens, PII)
 *    - Use log sanitization
 *    - Implement audit trails for critical operations
 * 
 * 6. **Retention Policy**:
 *    - Error logs: 30-90 days
 *    - Info logs: 7-14 days
 *    - Debug logs: 1-3 days (dev only)
 * 
 * 7. **Alerting**: Set up alerts for:
 *    - Error rate spikes
 *    - Performance degradation
 *    - Security events
 *    - Business metric anomalies
 */