import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class HealthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getHealthStatus() {
    const startTime = Date.now();
    
    try {
      // Basic health check
      const dbHealth = await this.checkDatabase();
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        responseTime: `${responseTime}ms`,
        database: dbHealth ? 'connected' : 'disconnected',
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
        },
        version: process.env.npm_package_version || '1.0.0',
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: `${Date.now() - startTime}ms`,
      };
    }
  }

  async getDatabaseHealth() {
    const startTime = Date.now();
    
    try {
      // Test database connection with a simple query
      await this.userRepository.manager.query('SELECT 1');
      const responseTime = Date.now() - startTime;
      
      // Get some basic stats
      const userCount = await this.userRepository.count();
      
      return {
        status: 'healthy',
        responseTime: `${responseTime}ms`,
        connection: 'active',
        stats: {
          totalUsers: userCount,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: `${Date.now() - startTime}ms`,
        connection: 'failed',
        error: error instanceof Error ? error.message : 'Database connection failed',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getDetailedHealthStatus() {
    const startTime = Date.now();
    
    try {
      const [basicHealth, dbHealth] = await Promise.all([
        this.getHealthStatus(),
        this.getDatabaseHealth(),
      ]);
      
      const responseTime = Date.now() - startTime;
      
      // Additional system information
      const systemInfo = {
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        pid: process.pid,
        environment: process.env.NODE_ENV || 'development',
      };

      return {
        status: basicHealth.status === 'healthy' && dbHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        services: {
          api: basicHealth,
          database: dbHealth,
        },
        system: systemInfo,
        rateLimits: {
          enabled: true,
          defaultLimit: '100 requests/minute',
          specialLimits: {
            generation: '10 requests/minute',
            guestGeneration: '3 requests/5minutes',
            auth: '5 attempts/5minutes',
            emailVerification: '3 requests/5minutes',
          },
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime: `${Date.now() - startTime}ms`,
        error: error instanceof Error ? error.message : 'Health check failed',
      };
    }
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await this.userRepository.manager.query('SELECT 1');
      return true;
    } catch (error) {
      return false;
    }
  }
}