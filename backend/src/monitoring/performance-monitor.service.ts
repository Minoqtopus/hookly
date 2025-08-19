import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export interface PerformanceMetric {
  id: string;
  timestamp: Date;
  type: 'request' | 'query' | 'generation' | 'auth' | 'payment';
  endpoint?: string;
  method?: string;
  duration: number; // milliseconds
  userId?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface PerformanceStats {
  totalRequests: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  slowestEndpoints: Array<{ endpoint: string; avgTime: number; count: number }>;
  errorRate: number;
  throughput: number; // requests per minute
}

@Injectable()
export class PerformanceMonitorService {
  private readonly logger = new Logger(PerformanceMonitorService.name);
  private readonly metrics: PerformanceMetric[] = [];
  private readonly maxMetricsInMemory = 1000;
  private readonly logDirectory: string;
  private readonly slowQueryThreshold = 1000; // 1 second
  private readonly performanceLogThreshold = 500; // 500ms

  constructor(private configService: ConfigService) {
    this.logDirectory = this.configService.get<string>('PERFORMANCE_LOG_DIR') || './logs/performance';
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDirectory)) {
      fs.mkdirSync(this.logDirectory, { recursive: true });
    }
  }

  /**
   * Track a performance metric
   */
  async trackMetric(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>): Promise<void> {
    const performanceMetric: PerformanceMetric = {
      id: this.generateId(),
      timestamp: new Date(),
      ...metric,
    };

    // Add to in-memory metrics
    this.metrics.push(performanceMetric);
    if (this.metrics.length > this.maxMetricsInMemory) {
      this.metrics.shift();
    }

    // Log slow operations
    if (metric.duration > this.performanceLogThreshold) {
      await this.logPerformanceMetric(performanceMetric);
    }

    // Log very slow operations as warnings
    if (metric.duration > this.slowQueryThreshold) {
      this.logger.warn(`Slow operation detected: ${metric.type} took ${metric.duration}ms`, {
        endpoint: metric.endpoint,
        userId: metric.userId,
        duration: metric.duration,
      });
    }
  }

  /**
   * Track HTTP request performance
   */
  async trackRequest(
    endpoint: string,
    method: string,
    duration: number,
    userId?: string,
    ip?: string,
    userAgent?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.trackMetric({
      type: 'request',
      endpoint,
      method,
      duration,
      userId,
      ip,
      userAgent,
      metadata,
    });
  }

  /**
   * Track database query performance
   */
  async trackQuery(
    query: string,
    duration: number,
    userId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.trackMetric({
      type: 'query',
      duration,
      userId,
      metadata: {
        ...metadata,
        query: query.substring(0, 100), // Truncate long queries
      },
    });
  }

  /**
   * Track AI generation performance
   */
  async trackGeneration(
    duration: number,
    userId?: string,
    model?: string,
    tokensUsed?: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.trackMetric({
      type: 'generation',
      duration,
      userId,
      metadata: {
        ...metadata,
        model,
        tokensUsed,
      },
    });
  }

  /**
   * Get performance statistics for a time window
   */
  getPerformanceStats(timeWindowMinutes: number = 60): PerformanceStats {
    const cutoffTime = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp > cutoffTime);

    if (recentMetrics.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        slowestEndpoints: [],
        errorRate: 0,
        throughput: 0,
      };
    }

    const requestMetrics = recentMetrics.filter(m => m.type === 'request');
    const durations = requestMetrics.map(m => m.duration).sort((a, b) => a - b);

    // Calculate percentiles
    const p95Index = Math.floor(durations.length * 0.95);
    const p99Index = Math.floor(durations.length * 0.99);

    // Group by endpoint for slowest endpoints analysis
    const endpointStats = new Map<string, { totalTime: number; count: number }>();
    requestMetrics.forEach(metric => {
      if (metric.endpoint) {
        const existing = endpointStats.get(metric.endpoint) || { totalTime: 0, count: 0 };
        existing.totalTime += metric.duration;
        existing.count += 1;
        endpointStats.set(metric.endpoint, existing);
      }
    });

    const slowestEndpoints = Array.from(endpointStats.entries())
      .map(([endpoint, stats]) => ({
        endpoint,
        avgTime: stats.totalTime / stats.count,
        count: stats.count,
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 5);

    return {
      totalRequests: requestMetrics.length,
      averageResponseTime: durations.reduce((a, b) => a + b, 0) / durations.length,
      p95ResponseTime: durations[p95Index] || 0,
      p99ResponseTime: durations[p99Index] || 0,
      slowestEndpoints,
      errorRate: 0, // Would need to integrate with error monitoring
      throughput: requestMetrics.length / (timeWindowMinutes / 60),
    };
  }

  /**
   * Get slow operations (above threshold)
   */
  getSlowOperations(threshold: number = 1000, limit: number = 50): PerformanceMetric[] {
    return this.metrics
      .filter(m => m.duration > threshold)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  /**
   * Get performance trends over time
   */
  getPerformanceTrends(hours: number = 24): Array<{ hour: string; avgResponseTime: number; requestCount: number }> {
    const trends: Array<{ hour: string; avgResponseTime: number; requestCount: number }> = [];
    const now = new Date();

    for (let i = hours - 1; i >= 0; i--) {
      const hourStart = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
      
      const hourMetrics = this.metrics.filter(m => 
        m.timestamp >= hourStart && m.timestamp < hourEnd && m.type === 'request'
      );

      if (hourMetrics.length > 0) {
        const avgResponseTime = hourMetrics.reduce((sum, m) => sum + m.duration, 0) / hourMetrics.length;
        trends.push({
          hour: hourStart.toISOString().substring(0, 13) + ':00:00Z',
          avgResponseTime: Math.round(avgResponseTime),
          requestCount: hourMetrics.length,
        });
      } else {
        trends.push({
          hour: hourStart.toISOString().substring(0, 13) + ':00:00Z',
          avgResponseTime: 0,
          requestCount: 0,
        });
      }
    }

    return trends;
  }

  /**
   * Clean up old metrics (keep last 7 days)
   */
  async cleanupOldMetrics(): Promise<void> {
    const cutoffTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const initialLength = this.metrics.length;
    
    // Remove old in-memory metrics
    this.metrics.splice(0, this.metrics.findIndex(m => m.timestamp > cutoffTime));
    
    this.logger.log(`Cleaned up ${initialLength - this.metrics.length} old performance metrics`);
  }

  /**
   * Export performance data for analysis
   */
  async exportPerformanceData(startDate: Date, endDate: Date): Promise<PerformanceMetric[]> {
    return this.metrics.filter(m => m.timestamp >= startDate && m.timestamp <= endDate);
  }

  private async logPerformanceMetric(metric: PerformanceMetric): Promise<void> {
    try {
      const date = new Date().toISOString().split('T')[0];
      const filename = path.join(this.logDirectory, `performance-${date}.json`);
      
      const logEntry = JSON.stringify(metric) + '\n';
      fs.appendFileSync(filename, logEntry);
    } catch (err) {
      this.logger.error('Failed to write performance metric to file', err);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}
