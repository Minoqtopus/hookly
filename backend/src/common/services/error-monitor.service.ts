import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export interface ErrorEvent {
  id: string;
  timestamp: Date;
  level: 'error' | 'warn' | 'fatal';
  message: string;
  stack?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  url?: string;
  method?: string;
  metadata?: Record<string, any>;
}

export interface ErrorAlert {
  type: 'email' | 'webhook' | 'log';
  threshold: number;
  timeWindow: number; // minutes
  enabled: boolean;
  config?: Record<string, any>;
}

@Injectable()
export class ErrorMonitorService {
  private readonly logger = new Logger(ErrorMonitorService.name);
  private readonly errorLog: ErrorEvent[] = [];
  private readonly maxErrorsInMemory = 1000;
  private readonly logDirectory: string;

  constructor(private configService: ConfigService) {
    this.logDirectory = this.configService.get<string>('ERROR_LOG_DIR') || './logs';
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDirectory)) {
      fs.mkdirSync(this.logDirectory, { recursive: true });
    }
  }

  async logError(error: Partial<ErrorEvent>): Promise<void> {
    const errorEvent: ErrorEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      level: error.level || 'error',
      message: error.message || 'Unknown error',
      stack: error.stack,
      userId: error.userId,
      ip: error.ip,
      userAgent: error.userAgent,
      url: error.url,
      method: error.method,
      metadata: error.metadata,
    };

    // Add to in-memory log
    this.errorLog.push(errorEvent);
    if (this.errorLog.length > this.maxErrorsInMemory) {
      this.errorLog.shift();
    }

    // Write to file
    await this.writeToFile(errorEvent);

    // Check for alert thresholds
    await this.checkAlertThresholds(errorEvent);

    // Log to console
    this.logger.error(`Error logged: ${errorEvent.message}`, {
      id: errorEvent.id,
      userId: errorEvent.userId,
      url: errorEvent.url,
    });
  }

  private async writeToFile(error: ErrorEvent): Promise<void> {
    try {
      const date = new Date().toISOString().split('T')[0];
      const filename = path.join(this.logDirectory, `errors-${date}.json`);
      
      const logEntry = JSON.stringify(error) + '\n';
      fs.appendFileSync(filename, logEntry);
    } catch (err) {
      this.logger.error('Failed to write error to file', err);
    }
  }

  private async checkAlertThresholds(error: ErrorEvent): Promise<void> {
    const alerts = this.getAlertConfig();
    
    for (const alert of alerts) {
      if (!alert.enabled) continue;

      const recentErrors = this.getRecentErrors(alert.timeWindow);
      
      if (recentErrors.length >= alert.threshold) {
        await this.sendAlert(alert, recentErrors);
      }
    }
  }

  private getRecentErrors(timeWindowMinutes: number): ErrorEvent[] {
    const cutoff = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
    return this.errorLog.filter(error => error.timestamp >= cutoff);
  }

  private async sendAlert(alert: ErrorAlert, errors: ErrorEvent[]): Promise<void> {
    try {
      switch (alert.type) {
        case 'email':
          await this.sendEmailAlert(alert, errors);
          break;
        case 'webhook':
          await this.sendWebhookAlert(alert, errors);
          break;
        case 'log':
          this.sendLogAlert(alert, errors);
          break;
      }
    } catch (err) {
      this.logger.error('Failed to send alert', err);
    }
  }

  private async sendEmailAlert(alert: ErrorAlert, errors: ErrorEvent[]): Promise<void> {
    // Simple email implementation (would need nodemailer or similar)
    this.logger.warn(`EMAIL ALERT: ${errors.length} errors in the last ${alert.timeWindow} minutes`);
    
    // Log error details for manual review
    errors.forEach(error => {
      this.logger.error(`Alert Error: ${error.message}`, {
        id: error.id,
        timestamp: error.timestamp,
        userId: error.userId,
        url: error.url,
      });
    });
  }

  private async sendWebhookAlert(alert: ErrorAlert, errors: ErrorEvent[]): Promise<void> {
    const webhookUrl = alert.config?.url;
    if (!webhookUrl) return;

    const payload = {
      alert: 'Error threshold exceeded',
      count: errors.length,
      timeWindow: alert.timeWindow,
      timestamp: new Date().toISOString(),
      errors: errors.slice(0, 5), // Send only first 5 errors to avoid payload size issues
    };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status}`);
      }
    } catch (err) {
      this.logger.error('Webhook alert failed', err);
    }
  }

  private sendLogAlert(alert: ErrorAlert, errors: ErrorEvent[]): void {
    this.logger.warn(`ALERT: ${errors.length} errors detected in the last ${alert.timeWindow} minutes`);
    
    const errorSummary = errors.reduce((acc, error) => {
      acc[error.message] = (acc[error.message] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    this.logger.warn('Error summary:', errorSummary);
  }

  private getAlertConfig(): ErrorAlert[] {
    return [
      {
        type: 'log',
        threshold: 5,
        timeWindow: 5, // 5 minutes
        enabled: true,
      },
      {
        type: 'log',
        threshold: 10,
        timeWindow: 15, // 15 minutes
        enabled: true,
      },
      {
        type: 'webhook',
        threshold: 20,
        timeWindow: 60, // 1 hour
        enabled: !!this.configService.get<string>('ERROR_WEBHOOK_URL'),
        config: {
          url: this.configService.get<string>('ERROR_WEBHOOK_URL'),
        },
      },
    ];
  }

  getErrorStats(timeWindowMinutes: number = 60): {
    total: number;
    byLevel: Record<string, number>;
    byMessage: Record<string, number>;
    recent: ErrorEvent[];
  } {
    const recentErrors = this.getRecentErrors(timeWindowMinutes);
    
    const byLevel = recentErrors.reduce((acc, error) => {
      acc[error.level] = (acc[error.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byMessage = recentErrors.reduce((acc, error) => {
      const key = error.message.substring(0, 100); // Truncate for grouping
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: recentErrors.length,
      byLevel,
      byMessage,
      recent: recentErrors.slice(-10), // Last 10 errors
    };
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}