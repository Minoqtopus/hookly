import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';

export interface LogRotationConfig {
  maxFileSize: number; // in MB
  maxFiles: number; // number of files to keep
  retentionDays: number; // days to keep logs
  compressOldLogs: boolean;
  logDirectory: string;
}

@Injectable()
export class LogRotationService {
  private readonly logger = new Logger(LogRotationService.name);
  private readonly config: LogRotationConfig;

  constructor(private configService: ConfigService) {
    this.config = {
      maxFileSize: this.configService.get<number>('LOG_MAX_FILE_SIZE_MB') || 100, // 100MB
      maxFiles: this.configService.get<number>('LOG_MAX_FILES') || 10,
      retentionDays: this.configService.get<number>('LOG_RETENTION_DAYS') || 30,
      compressOldLogs: this.configService.get<boolean>('LOG_COMPRESS_OLD') || true,
      logDirectory: this.configService.get<string>('LOG_DIRECTORY') || './logs',
    };
  }

  /**
   * Rotate logs daily at midnight
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async rotateLogs(): Promise<void> {
    try {
      this.logger.log('Starting daily log rotation...');
      
      await this.rotateErrorLogs();
      await this.rotatePerformanceLogs();
      await this.rotateAccessLogs();
      await this.cleanupOldLogs();
      
      this.logger.log('Daily log rotation completed successfully');
    } catch (error) {
      this.logger.error('Failed to rotate logs', error);
    }
  }

  /**
   * Rotate error logs
   */
  private async rotateErrorLogs(): Promise<void> {
    const errorLogDir = path.join(this.config.logDirectory, 'errors');
    if (!fs.existsSync(errorLogDir)) return;

    const files = fs.readdirSync(errorLogDir)
      .filter(file => file.startsWith('errors-') && file.endsWith('.json'))
      .sort();

    // Archive current day's log if it exists
    const today = new Date().toISOString().split('T')[0];
    const currentLogFile = path.join(errorLogDir, `errors-${today}.json`);
    
    if (fs.existsSync(currentLogFile)) {
      const stats = fs.statSync(currentLogFile);
      const fileSizeMB = stats.size / (1024 * 1024);
      
      if (fileSizeMB > this.config.maxFileSize) {
        await this.archiveLogFile(currentLogFile, 'errors');
      }
    }

    // Clean up old files
    await this.cleanupOldLogFiles(errorLogDir, 'errors-', this.config.maxFiles);
  }

  /**
   * Rotate performance logs
   */
  private async rotatePerformanceLogs(): Promise<void> {
    const perfLogDir = path.join(this.config.logDirectory, 'performance');
    if (!fs.existsSync(perfLogDir)) return;

    const files = fs.readdirSync(perfLogDir)
      .filter(file => file.startsWith('performance-') && file.endsWith('.json'))
      .sort();

    // Archive current day's log if it exists
    const today = new Date().toISOString().split('T')[0];
    const currentLogFile = path.join(perfLogDir, `performance-${today}.json`);
    
    if (fs.existsSync(currentLogFile)) {
      const stats = fs.statSync(currentLogFile);
      const fileSizeMB = stats.size / (1024 * 1024);
      
      if (fileSizeMB > this.config.maxFileSize) {
        await this.archiveLogFile(currentLogFile, 'performance');
      }
    }

    // Clean up old files
    await this.cleanupOldLogFiles(perfLogDir, 'performance-', this.config.maxFiles);
  }

  /**
   * Rotate access logs
   */
  private async rotateAccessLogs(): Promise<void> {
    const accessLogDir = path.join(this.config.logDirectory, 'access');
    if (!fs.existsSync(accessLogDir)) return;

    const files = fs.readdirSync(accessLogDir)
      .filter(file => file.startsWith('access-') && file.endsWith('.json'))
      .sort();

    // Archive current day's log if it exists
    const today = new Date().toISOString().split('T')[0];
    const currentLogFile = path.join(accessLogDir, `access-${today}.json`);
    
    if (fs.existsSync(currentLogFile)) {
      const stats = fs.statSync(currentLogFile);
      const fileSizeMB = stats.size / (1024 * 1024);
      
      if (fileSizeMB > this.config.maxFileSize) {
        await this.archiveLogFile(currentLogFile, 'access');
      }
    }

    // Clean up old files
    await this.cleanupOldLogFiles(accessLogDir, 'access-', this.config.maxFiles);
  }

  /**
   * Archive a log file
   */
  private async archiveLogFile(filePath: string, logType: string): Promise<void> {
    try {
      const fileName = path.basename(filePath, '.json');
      const archiveDir = path.join(this.config.logDirectory, 'archives', logType);
      
      if (!fs.existsSync(archiveDir)) {
        fs.mkdirSync(archiveDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const archivePath = path.join(archiveDir, `${fileName}-${timestamp}.json`);
      
      // Copy file to archive
      fs.copyFileSync(filePath, archivePath);
      
      // Clear the original file
      fs.writeFileSync(filePath, '');
      
      this.logger.log(`Archived ${logType} log: ${path.basename(filePath)}`);
    } catch (error) {
      this.logger.error(`Failed to archive log file: ${filePath}`, error);
    }
  }

  /**
   * Clean up old log files
   */
  private async cleanupOldLogFiles(logDir: string, prefix: string, maxFiles: number): Promise<void> {
    try {
      const files = fs.readdirSync(logDir)
        .filter(file => file.startsWith(prefix) && file.endsWith('.json'))
        .sort()
        .reverse(); // Most recent first

      if (files.length > maxFiles) {
        const filesToDelete = files.slice(maxFiles);
        
        for (const file of filesToDelete) {
          const filePath = path.join(logDir, file);
          fs.unlinkSync(filePath);
          this.logger.log(`Deleted old log file: ${file}`);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to cleanup old log files in: ${logDir}`, error);
    }
  }

  /**
   * Clean up old logs based on retention policy
   */
  private async cleanupOldLogs(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);
      
      const logTypes = ['errors', 'performance', 'access'];
      
      for (const logType of logTypes) {
        const logDir = path.join(this.config.logDirectory, logType);
        if (!fs.existsSync(logDir)) continue;

        const files = fs.readdirSync(logDir)
          .filter(file => file.startsWith(`${logType}-`) && file.endsWith('.json'));

        for (const file of files) {
          const filePath = path.join(logDir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.mtime < cutoffDate) {
            fs.unlinkSync(filePath);
            this.logger.log(`Deleted expired log file: ${file}`);
          }
        }
      }

      // Clean up archives
      const archivesDir = path.join(this.config.logDirectory, 'archives');
      if (fs.existsSync(archivesDir)) {
        await this.cleanupOldArchives(archivesDir, cutoffDate);
      }
    } catch (error) {
      this.logger.error('Failed to cleanup old logs', error);
    }
  }

  /**
   * Clean up old archived logs
   */
  private async cleanupOldArchives(archivesDir: string, cutoffDate: Date): Promise<void> {
    try {
      const logTypes = fs.readdirSync(archivesDir);
      
      for (const logType of logTypes) {
        const typeDir = path.join(archivesDir, logType);
        if (!fs.statSync(typeDir).isDirectory()) continue;

        const files = fs.readdirSync(typeDir);
        
        for (const file of files) {
          const filePath = path.join(typeDir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.mtime < cutoffDate) {
            fs.unlinkSync(filePath);
            this.logger.log(`Deleted expired archived log: ${logType}/${file}`);
          }
        }
      }
    } catch (error) {
      this.logger.error('Failed to cleanup old archives', error);
    }
  }

  /**
   * Get log directory statistics
   */
  async getLogStats(): Promise<{
    totalSize: number;
    fileCount: number;
    oldestFile: string;
    newestFile: string;
    directories: Array<{ name: string; size: number; fileCount: number }>;
  }> {
    try {
      let totalSize = 0;
      let fileCount = 0;
      let oldestFile = '';
      let newestFile = '';
      let oldestTime = Date.now();
      let newestTime = 0;
      const directories: Array<{ name: string; size: number; fileCount: number }> = [];

      if (!fs.existsSync(this.config.logDirectory)) {
        return {
          totalSize: 0,
          fileCount: 0,
          oldestFile: '',
          newestFile: '',
          directories: [],
        };
      }

      const logTypes = fs.readdirSync(this.config.logDirectory);
      
      for (const logType of logTypes) {
        const typePath = path.join(this.config.logDirectory, logType);
        const stats = fs.statSync(typePath);
        
        if (stats.isDirectory()) {
          let dirSize = 0;
          let dirFileCount = 0;
          
          const files = fs.readdirSync(typePath);
          
          for (const file of files) {
            const filePath = path.join(typePath, file);
            const fileStats = fs.statSync(filePath);
            
            dirSize += fileStats.size;
            dirFileCount++;
            totalSize += fileStats.size;
            fileCount++;
            
            if (fileStats.mtime.getTime() < oldestTime) {
              oldestTime = fileStats.mtime.getTime();
              oldestFile = `${logType}/${file}`;
            }
            
            if (fileStats.mtime.getTime() > newestTime) {
              newestTime = fileStats.mtime.getTime();
              newestFile = `${logType}/${file}`;
            }
          }
          
          directories.push({
            name: logType,
            size: dirSize,
            fileCount: dirFileCount,
          });
        }
      }

      return {
        totalSize,
        fileCount,
        oldestFile,
        newestFile,
        directories,
      };
    } catch (error) {
      this.logger.error('Failed to get log statistics', error);
      return {
        totalSize: 0,
        fileCount: 0,
        oldestFile: '',
        newestFile: '',
        directories: [],
      };
    }
  }

  /**
   * Manual log rotation trigger
   */
  async manualRotation(): Promise<void> {
    this.logger.log('Manual log rotation triggered');
    await this.rotateLogs();
  }

  /**
   * Get rotation configuration
   */
  getRotationConfig(): LogRotationConfig {
    return { ...this.config };
  }

  /**
   * Update rotation configuration
   */
  updateRotationConfig(updates: Partial<LogRotationConfig>): void {
    Object.assign(this.config, updates);
    this.logger.log('Log rotation configuration updated', this.config);
  }
}
