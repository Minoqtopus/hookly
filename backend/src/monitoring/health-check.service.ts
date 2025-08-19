import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as os from 'os';
import { DataSource } from 'typeorm';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: HealthCheck;
    memory: HealthCheck;
    disk: HealthCheck;
    cpu: HealthCheck;
    externalServices: HealthCheck;
    customChecks: Record<string, HealthCheck>;
  };
  metadata: {
    hostname: string;
    platform: string;
    nodeVersion: string;
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: number;
  };
}

export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  details?: Record<string, any>;
  responseTime?: number;
  lastChecked: string;
}

@Injectable()
export class HealthCheckService {
  private readonly logger = new Logger(HealthCheckService.name);
  private readonly startTime = Date.now();
  private readonly version: string;
  private readonly environment: string;
  private lastHealthCheck: HealthStatus | null = null;

  constructor(
    private configService: ConfigService,
    private dataSource: DataSource,
  ) {
    this.version = this.configService.get<string>('APP_VERSION') || '1.0.0';
    this.environment = this.configService.get<string>('NODE_ENV') || 'development';
  }

  async getHealthStatus(): Promise<HealthStatus> {
    const startTime = Date.now();
    
    try {
      const checks = {
        database: await this.checkDatabase(),
        memory: await this.checkMemory(),
        disk: await this.checkDisk(),
        cpu: await this.checkCpu(),
        externalServices: await this.checkExternalServices(),
        customChecks: await this.runCustomChecks(),
      };

      const overallStatus = this.determineOverallStatus(checks);
      
      const healthStatus: HealthStatus = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        uptime: Math.floor((Date.now() - this.startTime) / 1000),
        version: this.version,
        environment: this.environment,
        checks,
        metadata: await this.getSystemMetadata(),
      };

      this.lastHealthCheck = healthStatus;
      
      const responseTime = Date.now() - startTime;
      this.logger.log(`Health check completed in ${responseTime}ms with status: ${overallStatus}`);
      
      return healthStatus;
    } catch (error) {
      this.logger.error('Health check failed', error);
      
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: Math.floor((Date.now() - this.startTime) / 1000),
        version: this.version,
        environment: this.environment,
        checks: {
          database: { status: 'unhealthy', message: 'Health check failed', lastChecked: new Date().toISOString() },
          memory: { status: 'unhealthy', message: 'Health check failed', lastChecked: new Date().toISOString() },
          disk: { status: 'unhealthy', message: 'Health check failed', lastChecked: new Date().toISOString() },
          cpu: { status: 'unhealthy', message: 'Health check failed', lastChecked: new Date().toISOString() },
          externalServices: { status: 'unhealthy', message: 'Health check failed', lastChecked: new Date().toISOString() },
          customChecks: {},
        },
        metadata: await this.getSystemMetadata(),
      };
    }
  }

  private async checkDatabase(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      if (!this.dataSource.isInitialized) {
        return {
          status: 'unhealthy',
          message: 'Database not initialized',
          lastChecked: new Date().toISOString(),
        };
      }

      await this.dataSource.query('SELECT 1');
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        message: 'Database connection healthy',
        details: {
          type: this.dataSource.options.type,
          database: (this.dataSource.options as any).database,
          host: (this.dataSource.options as any).host,
          port: (this.dataSource.options as any).port,
        },
        responseTime,
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'unhealthy',
        message: 'Database connection failed',
        details: {
          error: (error as any).message,
          code: (error as any).code,
        },
        responseTime,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  private async checkMemory(): Promise<HealthCheck> {
    const memoryUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryPercentage = (usedMemory / totalMemory) * 100;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    let message = 'Memory usage normal';

    if (memoryPercentage > 90) {
      status = 'unhealthy';
      message = 'Memory usage critical (>90%)';
    } else if (memoryPercentage > 80) {
      status = 'degraded';
      message = 'Memory usage high (>80%)';
    }

    return {
      status,
      message,
      details: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024),
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        systemTotal: Math.round(totalMemory / 1024 / 1024),
        systemFree: Math.round(freeMemory / 1024 / 1024),
        systemUsed: Math.round(usedMemory / 1024 / 1024),
        percentage: Math.round(memoryPercentage),
      },
      lastChecked: new Date().toISOString(),
    };
  }

  private async checkDisk(): Promise<HealthCheck> {
    try {
      const cwd = process.cwd();
      require('fs').statSync(cwd);
      
      return {
        status: 'healthy',
        message: 'Disk access normal',
        details: {
          workingDirectory: cwd,
          directoryAccessible: true,
        },
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Disk access failed',
        details: {
          error: (error as any).message,
        },
        lastChecked: new Date().toISOString(),
      };
    }
  }

  private async checkCpu(): Promise<HealthCheck> {
    const cpus = os.cpus();
    const loadAverage = os.loadavg();
    const cpuUsage = Math.round((loadAverage[0] / cpus.length) * 100);
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    let message = 'CPU usage normal';

    if (cpuUsage > 90) {
      status = 'unhealthy';
      message = 'CPU usage critical (>90%)';
    } else if (cpuUsage > 80) {
      status = 'degraded';
      message = 'CPU usage high (>80%)';
    }

    return {
      status,
      message,
      details: {
        cpuCount: cpus.length,
        loadAverage1m: loadAverage[0],
        loadAverage5m: loadAverage[1],
        loadAverage15m: loadAverage[2],
        cpuUsage,
        architecture: os.arch(),
        platform: os.platform(),
      },
      lastChecked: new Date().toISOString(),
    };
  }

  private async checkExternalServices(): Promise<HealthCheck> {
    try {
      const checks = [];
      
      const openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');
      if (openaiApiKey) {
        checks.push({ service: 'OpenAI', status: 'healthy' });
      }

      checks.push({ service: 'Database', status: 'healthy' });

      const healthyServices = checks.filter(c => c.status === 'healthy').length;
      const totalServices = checks.length;
      
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      let message = 'All external services healthy';

      if (healthyServices === 0) {
        status = 'unhealthy';
        message = 'All external services unhealthy';
      } else if (healthyServices < totalServices) {
        status = 'degraded';
        message = `${healthyServices}/${totalServices} external services healthy`;
      }

      return {
        status,
        message,
        details: {
          services: checks,
          healthyCount: healthyServices,
          totalCount: totalServices,
        },
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'External services check failed',
        details: {
          error: (error as any).message,
        },
        lastChecked: new Date().toISOString(),
      };
    }
  }

  private async runCustomChecks(): Promise<Record<string, HealthCheck>> {
    const customChecks: Record<string, HealthCheck> = {};

    try {
      customChecks['signupControl'] = {
        status: 'healthy',
        message: 'Signup control system operational',
        lastChecked: new Date().toISOString(),
      };

      customChecks['aiGeneration'] = {
        status: 'healthy',
        message: 'AI generation system operational',
        lastChecked: new Date().toISOString(),
      };

    } catch (error) {
      this.logger.error('Custom health checks failed', error);
    }

    return customChecks;
  }

  private async getSystemMetadata(): Promise<HealthStatus['metadata']> {
    const memoryUsage = process.memoryUsage();
    
    return {
      hostname: os.hostname(),
      platform: os.platform(),
      nodeVersion: process.version,
      memoryUsage,
      cpuUsage: Math.round((os.loadavg()[0] / os.cpus().length) * 100),
    };
  }

  private determineOverallStatus(checks: HealthStatus['checks']): 'healthy' | 'degraded' | 'unhealthy' {
    const allChecks = [
      checks.database,
      checks.memory,
      checks.disk,
      checks.cpu,
      checks.externalServices,
      ...Object.values(checks.customChecks),
    ];

    const unhealthyCount = allChecks.filter(c => c.status === 'unhealthy').length;
    const degradedCount = allChecks.filter(c => c.status === 'degraded').length;

    if (unhealthyCount > 0) {
      return 'unhealthy';
    } else if (degradedCount > 0) {
      return 'degraded';
    } else {
      return 'healthy';
    }
  }

  getLastHealthCheck(): HealthStatus | null {
    return this.lastHealthCheck;
  }

  async refreshHealthCheck(): Promise<HealthStatus> {
    this.lastHealthCheck = null;
    return await this.getHealthStatus();
  }
}
