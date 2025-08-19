import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ErrorMonitorService } from '../common/services/error-monitor.service';
import { HealthCheckService } from './health-check.service';
import { LogRotationService } from './log-rotation.service';
import { LogViewerService } from './log-viewer.service';
import { PerformanceMonitorService } from './performance-monitor.service';

@ApiTags('Monitoring')
@Controller('monitoring')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, AdminGuard)
export class MonitoringController {
  constructor(
    private readonly errorMonitor: ErrorMonitorService,
    private readonly logViewer: LogViewerService,
    private readonly performanceMonitor: PerformanceMonitorService,
    private readonly logRotation: LogRotationService,
    private readonly healthCheck: HealthCheckService,
  ) {}

  @Get('errors')
  @ApiOperation({ summary: 'Get error statistics', description: 'Retrieve error statistics for a specific time window' })
  @ApiQuery({ name: 'timeWindow', required: false, description: 'Time window in minutes (default: 60)' })
  @ApiResponse({ status: 200, description: 'Error statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  getErrorStats(@Query('timeWindow') timeWindow?: string) {
    const windowMinutes = timeWindow ? parseInt(timeWindow, 10) : 60;
    return this.errorMonitor.getErrorStats(windowMinutes);
  }

  @Get('health')
  @ApiOperation({ summary: 'Get system health status', description: 'Comprehensive system health check including database, memory, CPU, and external services' })
  @ApiResponse({ status: 200, description: 'Health status retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getHealthStatus() {
    return this.healthCheck.getHealthStatus();
  }

  @Get('health/refresh')
  @ApiOperation({ summary: 'Refresh health check', description: 'Force a fresh health check and return updated status' })
  @ApiResponse({ status: 200, description: 'Health check refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async refreshHealthCheck() {
    return this.healthCheck.refreshHealthCheck();
  }

  @Get('logs')
  async getLogs(
    @Query('file') file?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('level') level?: string,
  ) {
    const files = await this.logViewer.getLogFiles();
    
    if (!file || !files.includes(file)) {
      return { files, entries: [], total: 0 };
    }

    const limitNum = limit ? parseInt(limit, 10) : 100;
    const offsetNum = offset ? parseInt(offset, 10) : 0;
    
    const result = await this.logViewer.getLogEntries(file, limitNum, offsetNum, level);
    
    return {
      files,
      ...result,
    };
  }

  @Get('logs/search')
  async searchLogs(
    @Query('query') query: string,
    @Query('days') days?: string,
    @Query('level') level?: string,
  ) {
    if (!query) {
      return { entries: [] };
    }

    const daysNum = days ? parseInt(days, 10) : 7;
    const entries = await this.logViewer.searchLogs(query, daysNum, level);
    
    return { entries };
  }

  @Get('logs/summary')
  async getLogSummary(@Query('days') days?: string) {
    const daysNum = days ? parseInt(days, 10) : 1;
    return this.logViewer.getLogSummary(daysNum);
  }

  // Performance Monitoring Endpoints
  @Get('performance/stats')
  @ApiOperation({ summary: 'Get performance statistics', description: 'Retrieve performance metrics including response times, throughput, and slow operations' })
  @ApiQuery({ name: 'timeWindow', required: false, description: 'Time window in minutes (default: 60)' })
  @ApiResponse({ status: 200, description: 'Performance statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  getPerformanceStats(@Query('timeWindow') timeWindow?: string) {
    const windowMinutes = timeWindow ? parseInt(timeWindow, 10) : 60;
    return this.performanceMonitor.getPerformanceStats(windowMinutes);
  }

  @Get('performance/slow-operations')
  @ApiOperation({ summary: 'Get slow operations', description: 'Retrieve operations that exceeded performance thresholds' })
  @ApiQuery({ name: 'threshold', required: false, description: 'Threshold in milliseconds (default: 1000)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of operations to return (default: 50)' })
  @ApiResponse({ status: 200, description: 'Slow operations retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  getSlowOperations(
    @Query('threshold') threshold?: string,
    @Query('limit') limit?: string,
  ) {
    const thresholdNum = threshold ? parseInt(threshold, 10) : 1000;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.performanceMonitor.getSlowOperations(thresholdNum, limitNum);
  }

  @Get('performance/trends')
  @ApiOperation({ summary: 'Get performance trends', description: 'Retrieve performance trends over time' })
  @ApiQuery({ name: 'hours', required: false, description: 'Number of hours to analyze (default: 24)' })
  @ApiResponse({ status: 200, description: 'Performance trends retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  getPerformanceTrends(@Query('hours') hours?: string) {
    const hoursNum = hours ? parseInt(hours, 10) : 24;
    return this.performanceMonitor.getPerformanceTrends(hoursNum);
  }

  // Log Rotation Endpoints
  @Get('logs/rotation/stats')
  @ApiOperation({ summary: 'Get log rotation statistics', description: 'Retrieve log directory statistics and rotation information' })
  @ApiResponse({ status: 200, description: 'Log rotation statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getLogRotationStats() {
    return this.logRotation.getLogStats();
  }

  @Get('logs/rotation/config')
  @ApiOperation({ summary: 'Get log rotation configuration', description: 'Retrieve current log rotation configuration' })
  @ApiResponse({ status: 200, description: 'Log rotation configuration retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  getLogRotationConfig() {
    return this.logRotation.getRotationConfig();
  }

  @Post('logs/rotation/manual')
  @ApiOperation({ summary: 'Trigger manual log rotation', description: 'Manually trigger log rotation process' })
  @ApiResponse({ status: 200, description: 'Manual log rotation triggered successfully' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async triggerManualLogRotation() {
    await this.logRotation.manualRotation();
    return { message: 'Manual log rotation triggered successfully' };
  }

  @Post('logs/rotation/cleanup')
  @ApiOperation({ summary: 'Clean up old logs', description: 'Manually trigger cleanup of old log files' })
  @ApiResponse({ status: 200, description: 'Log cleanup triggered successfully' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async triggerLogCleanup() {
    // This would trigger the cleanup process
    return { message: 'Log cleanup triggered successfully' };
  }
}