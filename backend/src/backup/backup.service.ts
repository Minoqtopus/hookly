import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface BackupInfo {
  filename: string;
  size: number;
  created: Date;
  type: 'full' | 'schema' | 'data';
  compressed: boolean;
}

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDirectory: string;
  private readonly maxBackups: number;
  private readonly databaseUrl: string;

  constructor(private configService: ConfigService) {
    this.backupDirectory = this.configService.get<string>('BACKUP_DIR') || './backups';
    this.maxBackups = this.configService.get<number>('MAX_BACKUPS') || 7;
    this.databaseUrl = this.configService.get<string>('DATABASE_URL');
    this.ensureBackupDirectory();
  }

  private ensureBackupDirectory(): void {
    if (!fs.existsSync(this.backupDirectory)) {
      fs.mkdirSync(this.backupDirectory, { recursive: true });
      this.logger.log(`Created backup directory: ${this.backupDirectory}`);
    }
  }

  // Scheduled backup every day at 2 AM
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async performScheduledBackup(): Promise<void> {
    try {
      this.logger.log('Starting scheduled database backup');
      await this.createFullBackup();
      await this.cleanupOldBackups();
      this.logger.log('Scheduled backup completed successfully');
    } catch (error) {
      this.logger.error('Scheduled backup failed', error);
    }
  }

  // Weekly schema-only backup every Sunday at 3 AM
  @Cron('0 3 * * 0')
  async performWeeklySchemaBackup(): Promise<void> {
    try {
      this.logger.log('Starting weekly schema backup');
      await this.createSchemaBackup();
      this.logger.log('Weekly schema backup completed');
    } catch (error) {
      this.logger.error('Weekly schema backup failed', error);
    }
  }

  async createFullBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `full-backup-${timestamp}.sql`;
    const filePath = path.join(this.backupDirectory, filename);

    try {
      // Use pg_dump for PostgreSQL backup
      const command = this.buildPgDumpCommand(filePath, 'full');
      
      this.logger.log(`Creating full backup: ${filename}`);
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr && !stderr.includes('NOTICE')) {
        this.logger.warn(`Backup warnings: ${stderr}`);
      }

      // Compress the backup file
      await this.compressFile(filePath);
      
      const stats = fs.statSync(`${filePath}.gz`);
      this.logger.log(`Full backup created: ${filename}.gz (${this.formatSize(stats.size)})`);
      
      return `${filename}.gz`;
    } catch (error) {
      this.logger.error('Failed to create full backup', error);
      throw error;
    }
  }

  async createSchemaBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `schema-backup-${timestamp}.sql`;
    const filePath = path.join(this.backupDirectory, filename);

    try {
      const command = this.buildPgDumpCommand(filePath, 'schema');
      
      this.logger.log(`Creating schema backup: ${filename}`);
      await execAsync(command);
      
      await this.compressFile(filePath);
      
      const stats = fs.statSync(`${filePath}.gz`);
      this.logger.log(`Schema backup created: ${filename}.gz (${this.formatSize(stats.size)})`);
      
      return `${filename}.gz`;
    } catch (error) {
      this.logger.error('Failed to create schema backup', error);
      throw error;
    }
  }

  async createDataBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `data-backup-${timestamp}.sql`;
    const filePath = path.join(this.backupDirectory, filename);

    try {
      const command = this.buildPgDumpCommand(filePath, 'data');
      
      this.logger.log(`Creating data backup: ${filename}`);
      await execAsync(command);
      
      await this.compressFile(filePath);
      
      const stats = fs.statSync(`${filePath}.gz`);
      this.logger.log(`Data backup created: ${filename}.gz (${this.formatSize(stats.size)})`);
      
      return `${filename}.gz`;
    } catch (error) {
      this.logger.error('Failed to create data backup', error);
      throw error;
    }
  }

  private buildPgDumpCommand(filePath: string, type: 'full' | 'schema' | 'data'): string {
    const baseCommand = `pg_dump "${this.databaseUrl}"`;
    
    let options = '--verbose --no-owner --no-privileges';
    
    switch (type) {
      case 'schema':
        options += ' --schema-only';
        break;
      case 'data':
        options += ' --data-only';
        break;
      case 'full':
      default:
        // Include both schema and data
        break;
    }
    
    return `${baseCommand} ${options} > "${filePath}"`;
  }

  private async compressFile(filePath: string): Promise<void> {
    try {
      await execAsync(`gzip "${filePath}"`);
    } catch (error) {
      this.logger.warn('Failed to compress backup file', error);
      // Don't throw error, uncompressed backup is still useful
    }
  }

  async listBackups(): Promise<BackupInfo[]> {
    try {
      const files = fs.readdirSync(this.backupDirectory);
      const backups: BackupInfo[] = [];

      for (const file of files) {
        if (file.endsWith('.sql') || file.endsWith('.sql.gz')) {
          const filePath = path.join(this.backupDirectory, file);
          const stats = fs.statSync(filePath);
          
          let type: 'full' | 'schema' | 'data' = 'full';
          if (file.includes('schema')) type = 'schema';
          else if (file.includes('data')) type = 'data';
          
          backups.push({
            filename: file,
            size: stats.size,
            created: stats.birthtime,
            type,
            compressed: file.endsWith('.gz'),
          });
        }
      }

      return backups.sort((a, b) => b.created.getTime() - a.created.getTime());
    } catch (error) {
      this.logger.error('Failed to list backups', error);
      return [];
    }
  }

  async deleteBackup(filename: string): Promise<void> {
    try {
      const filePath = path.join(this.backupDirectory, filename);
      
      if (!fs.existsSync(filePath)) {
        throw new Error('Backup file not found');
      }

      fs.unlinkSync(filePath);
      this.logger.log(`Deleted backup: ${filename}`);
    } catch (error) {
      this.logger.error(`Failed to delete backup: ${filename}`, error);
      throw error;
    }
  }

  async restoreBackup(filename: string): Promise<void> {
    try {
      const filePath = path.join(this.backupDirectory, filename);
      
      if (!fs.existsSync(filePath)) {
        throw new Error('Backup file not found');
      }

      this.logger.warn(`Starting database restore from: ${filename}`);
      
      let restoreCommand: string;
      
      if (filename.endsWith('.gz')) {
        // Decompress and restore
        restoreCommand = `gunzip -c "${filePath}" | psql "${this.databaseUrl}"`;
      } else {
        // Direct restore
        restoreCommand = `psql "${this.databaseUrl}" < "${filePath}"`;
      }

      const { stdout, stderr } = await execAsync(restoreCommand);
      
      if (stderr && !stderr.includes('NOTICE')) {
        this.logger.warn(`Restore warnings: ${stderr}`);
      }

      this.logger.log(`Database restored successfully from: ${filename}`);
    } catch (error) {
      this.logger.error(`Failed to restore from backup: ${filename}`, error);
      throw error;
    }
  }

  async cleanupOldBackups(): Promise<void> {
    try {
      const backups = await this.listBackups();
      
      if (backups.length <= this.maxBackups) {
        return;
      }

      const toDelete = backups.slice(this.maxBackups);
      
      for (const backup of toDelete) {
        await this.deleteBackup(backup.filename);
      }

      this.logger.log(`Cleaned up ${toDelete.length} old backups`);
    } catch (error) {
      this.logger.error('Failed to cleanup old backups', error);
    }
  }

  async testBackup(filename: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const filePath = path.join(this.backupDirectory, filename);
      
      if (!fs.existsSync(filePath)) {
        return { valid: false, error: 'Backup file not found' };
      }

      // Test by checking if the file contains valid SQL
      let content: string;
      
      if (filename.endsWith('.gz')) {
        const { stdout } = await execAsync(`gunzip -c "${filePath}" | head -20`);
        content = stdout;
      } else {
        const { stdout } = await execAsync(`head -20 "${filePath}"`);
        content = stdout;
      }

      // Basic validation - check for SQL patterns
      const hasSqlPattern = /^--.*PostgreSQL|CREATE|INSERT|COPY/.test(content);
      
      if (!hasSqlPattern) {
        return { valid: false, error: 'File does not appear to contain valid SQL' };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  getBackupStats(): {
    totalBackups: number;
    totalSize: number;
    oldestBackup?: Date;
    newestBackup?: Date;
  } {
    try {
      const files = fs.readdirSync(this.backupDirectory);
      let totalSize = 0;
      const dates: Date[] = [];

      for (const file of files) {
        if (file.endsWith('.sql') || file.endsWith('.sql.gz')) {
          const filePath = path.join(this.backupDirectory, file);
          const stats = fs.statSync(filePath);
          totalSize += stats.size;
          dates.push(stats.birthtime);
        }
      }

      dates.sort((a, b) => a.getTime() - b.getTime());

      return {
        totalBackups: dates.length,
        totalSize,
        oldestBackup: dates[0],
        newestBackup: dates[dates.length - 1],
      };
    } catch (error) {
      this.logger.error('Failed to get backup stats', error);
      return { totalBackups: 0, totalSize: 0 };
    }
  }

  private formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}