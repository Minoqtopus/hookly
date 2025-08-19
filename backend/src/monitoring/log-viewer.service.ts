import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: string;
  message: string;
  stack?: string;
  userId?: string;
  ip?: string;
  url?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class LogViewerService {
  private readonly logger = new Logger(LogViewerService.name);
  private readonly logDirectory: string;

  constructor(private configService: ConfigService) {
    this.logDirectory = this.configService.get<string>('ERROR_LOG_DIR') || './logs';
  }

  async getLogFiles(): Promise<string[]> {
    try {
      if (!fs.existsSync(this.logDirectory)) {
        return [];
      }

      const files = fs.readdirSync(this.logDirectory);
      return files
        .filter(file => file.startsWith('errors-') && file.endsWith('.json'))
        .sort()
        .reverse(); // Most recent first
    } catch (error) {
      this.logger.error('Failed to read log directory', error);
      return [];
    }
  }

  async getLogEntries(
    filename: string,
    limit: number = 100,
    offset: number = 0,
    level?: string
  ): Promise<{ entries: LogEntry[]; total: number }> {
    try {
      const filePath = path.join(this.logDirectory, filename);
      
      if (!fs.existsSync(filePath)) {
        return { entries: [], total: 0 };
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.trim().split('\n').filter(line => line.trim());
      
      const entries: LogEntry[] = [];
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (!level || parsed.level === level) {
            entries.push(parsed);
          }
        } catch (parseError) {
          // Skip invalid JSON lines
          continue;
        }
      }

      // Sort by timestamp (most recent first)
      entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      const total = entries.length;
      const paginatedEntries = entries.slice(offset, offset + limit);

      return { entries: paginatedEntries, total };
    } catch (error) {
      this.logger.error(`Failed to read log file: ${filename}`, error);
      return { entries: [], total: 0 };
    }
  }

  async searchLogs(
    query: string,
    days: number = 7,
    level?: string
  ): Promise<LogEntry[]> {
    try {
      const files = await this.getLogFiles();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const allEntries: LogEntry[] = [];

      for (const file of files) {
        // Extract date from filename (format: errors-YYYY-MM-DD.json)
        const dateMatch = file.match(/errors-(\d{4}-\d{2}-\d{2})\.json/);
        if (dateMatch) {
          const fileDate = new Date(dateMatch[1]);
          if (fileDate < cutoffDate) {
            break; // Files are sorted by date, so we can stop here
          }
        }

        const { entries } = await this.getLogEntries(file, 1000, 0, level);
        
        const filteredEntries = entries.filter(entry => {
          const searchText = `${entry.message} ${entry.url || ''} ${entry.userId || ''}`.toLowerCase();
          return searchText.includes(query.toLowerCase());
        });

        allEntries.push(...filteredEntries);
      }

      // Sort by timestamp and limit results
      return allEntries
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 100);
    } catch (error) {
      this.logger.error('Failed to search logs', error);
      return [];
    }
  }

  async getLogSummary(days: number = 1): Promise<{
    totalErrors: number;
    errorsByLevel: Record<string, number>;
    errorsByHour: Record<string, number>;
    topErrors: Array<{ message: string; count: number }>;
  }> {
    try {
      const files = await this.getLogFiles();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const errorsByLevel: Record<string, number> = {};
      const errorsByHour: Record<string, number> = {};
      const errorMessages: Record<string, number> = {};
      let totalErrors = 0;

      for (const file of files) {
        const dateMatch = file.match(/errors-(\d{4}-\d{2}-\d{2})\.json/);
        if (dateMatch) {
          const fileDate = new Date(dateMatch[1]);
          if (fileDate < cutoffDate) {
            continue;
          }
        }

        const { entries } = await this.getLogEntries(file, 10000);
        
        for (const entry of entries) {
          const entryDate = new Date(entry.timestamp);
          if (entryDate < cutoffDate) {
            continue;
          }

          totalErrors++;
          
          // Count by level
          errorsByLevel[entry.level] = (errorsByLevel[entry.level] || 0) + 1;
          
          // Count by hour
          const hour = entryDate.getHours().toString().padStart(2, '0');
          const entryDateString = entryDate instanceof Date ? entryDate.toISOString() : new Date(entryDate).toISOString();
          const hourKey = `${entryDateString.split('T')[0]} ${hour}:00`;
          errorsByHour[hourKey] = (errorsByHour[hourKey] || 0) + 1;
          
          // Count error messages
          const messageKey = entry.message.substring(0, 100);
          errorMessages[messageKey] = (errorMessages[messageKey] || 0) + 1;
        }
      }

      const topErrors = Object.entries(errorMessages)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([message, count]) => ({ message, count }));

      return {
        totalErrors,
        errorsByLevel,
        errorsByHour,
        topErrors,
      };
    } catch (error) {
      this.logger.error('Failed to generate log summary', error);
      return {
        totalErrors: 0,
        errorsByLevel: {},
        errorsByHour: {},
        topErrors: [],
      };
    }
  }
}