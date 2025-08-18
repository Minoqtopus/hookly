import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ErrorMonitorService } from '../common/services/error-monitor.service';
import { LogViewerService } from './log-viewer.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('Monitoring')
@Controller('monitoring')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, AdminGuard)
export class MonitoringController {
  constructor(
    private readonly errorMonitor: ErrorMonitorService,
    private readonly logViewer: LogViewerService,
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
  getHealthStatus() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      errorStats: this.errorMonitor.getErrorStats(60),
    };
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
}