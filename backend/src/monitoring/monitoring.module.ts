import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ErrorMonitorService } from '../common/services/error-monitor.service';
import { User } from '../entities/user.entity';
import { HealthCheckService } from './health-check.service';
import { LogRotationService } from './log-rotation.service';
import { LogViewerService } from './log-viewer.service';
import { MonitoringController } from './monitoring.controller';
import { PerformanceMonitorService } from './performance-monitor.service';
import { PerformanceInterceptor } from './performance.interceptor';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [MonitoringController],
  providers: [
    ErrorMonitorService, 
    LogViewerService, 
    PerformanceMonitorService, 
    LogRotationService, 
    HealthCheckService,
    {
      provide: APP_INTERCEPTOR,
      useClass: PerformanceInterceptor,
    },
  ],
  exports: [
    ErrorMonitorService, 
    LogViewerService, 
    PerformanceMonitorService, 
    LogRotationService, 
    HealthCheckService,
    PerformanceInterceptor,
  ],
})
export class MonitoringModule {}