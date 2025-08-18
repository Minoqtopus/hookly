import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonitoringController } from './monitoring.controller';
import { ErrorMonitorService } from '../common/services/error-monitor.service';
import { LogViewerService } from './log-viewer.service';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [MonitoringController],
  providers: [ErrorMonitorService, LogViewerService],
  exports: [ErrorMonitorService, LogViewerService],
})
export class MonitoringModule {}