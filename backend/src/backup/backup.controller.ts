import { Controller, Get, Post, Delete, Param, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { BackupService } from './backup.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('Backup')
@Controller('backup')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, AdminGuard)
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Get()
  @ApiOperation({ summary: 'List all backups', description: 'Get list of all available database backups with statistics' })
  @ApiResponse({ status: 200, description: 'Backup list retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async listBackups() {
    const backups = await this.backupService.listBackups();
    const stats = this.backupService.getBackupStats();
    
    return {
      backups,
      stats,
    };
  }

  @Post('create/full')
  async createFullBackup() {
    try {
      const filename = await this.backupService.createFullBackup();
      return {
        success: true,
        filename,
        message: 'Full backup created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Post('create/schema')
  async createSchemaBackup() {
    try {
      const filename = await this.backupService.createSchemaBackup();
      return {
        success: true,
        filename,
        message: 'Schema backup created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Post('create/data')
  async createDataBackup() {
    try {
      const filename = await this.backupService.createDataBackup();
      return {
        success: true,
        filename,
        message: 'Data backup created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Post('restore/:filename')
  async restoreBackup(@Param('filename') filename: string) {
    try {
      await this.backupService.restoreBackup(filename);
      return {
        success: true,
        message: `Database restored from ${filename}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Post('test/:filename')
  async testBackup(@Param('filename') filename: string) {
    const result = await this.backupService.testBackup(filename);
    return result;
  }

  @Delete(':filename')
  async deleteBackup(@Param('filename') filename: string) {
    try {
      await this.backupService.deleteBackup(filename);
      return {
        success: true,
        message: `Backup ${filename} deleted successfully`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Post('cleanup')
  async cleanupOldBackups() {
    try {
      await this.backupService.cleanupOldBackups();
      return {
        success: true,
        message: 'Old backups cleaned up successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Get('stats')
  getBackupStats() {
    return this.backupService.getBackupStats();
  }
}