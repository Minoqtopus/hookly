import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RefreshTokenService } from '../../auth/services/supporting/refresh-token.service';
import { Repository, LessThan } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailVerification, VerificationStatus } from '../../entities/email-verification.entity';

/**
 * Automated Token Cleanup Service for production maintenance
 */
@Injectable()
export class TokenCleanupService {
  private readonly logger = new Logger(TokenCleanupService.name);

  constructor(
    private refreshTokenService: RefreshTokenService,
    @InjectRepository(EmailVerification)
    private emailVerificationRepository: Repository<EmailVerification>,
  ) {}

  /**
   * Clean up expired refresh tokens (runs daily at 2 AM)
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupExpiredRefreshTokens(): Promise<void> {
    try {
      this.logger.log('🧹 Starting expired refresh token cleanup...');
      
      const deletedCount = await this.refreshTokenService.cleanupExpiredTokens(30); // 30 days
      
      this.logger.log(`✅ Cleaned up ${deletedCount} expired refresh tokens`);
    } catch (error) {
      this.logger.error('❌ Failed to clean up expired refresh tokens:', error);
    }
  }

  /**
   * Clean up old email verification tokens (runs daily at 3 AM)
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupExpiredEmailVerifications(): Promise<void> {
    try {
      this.logger.log('🧹 Starting expired email verification cleanup...');
      
      // Remove email verifications older than 7 days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7);

      const result = await this.emailVerificationRepository.delete({
        created_at: LessThan(cutoffDate),
      });

      const deletedCount = result.affected || 0;
      this.logger.log(`✅ Cleaned up ${deletedCount} old email verification records`);
    } catch (error) {
      this.logger.error('❌ Failed to clean up email verifications:', error);
    }
  }

  /**
   * Clean up orphaned verification tokens (runs weekly)
   */
  @Cron(CronExpression.EVERY_WEEK)
  async cleanupOrphanedVerifications(): Promise<void> {
    try {
      this.logger.log('🧹 Starting orphaned verification cleanup...');
      
      // Find verifications where user no longer exists
      const orphanedVerifications = await this.emailVerificationRepository
        .createQueryBuilder('ev')
        .leftJoin('ev.user', 'user')
        .where('user.id IS NULL')
        .getMany();

      if (orphanedVerifications.length > 0) {
        await this.emailVerificationRepository.remove(orphanedVerifications);
        this.logger.log(`✅ Cleaned up ${orphanedVerifications.length} orphaned verification records`);
      } else {
        this.logger.log('✅ No orphaned verification records found');
      }
    } catch (error) {
      this.logger.error('❌ Failed to clean up orphaned verifications:', error);
    }
  }

  /**
   * Update expired verification statuses (runs every 6 hours)
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  async updateExpiredVerificationStatuses(): Promise<void> {
    try {
      this.logger.log('🧹 Updating expired verification statuses...');
      
      const result = await this.emailVerificationRepository.update(
        {
          status: VerificationStatus.PENDING,
          expires_at: LessThan(new Date()),
        },
        {
          status: VerificationStatus.EXPIRED,
        }
      );

      const updatedCount = result.affected || 0;
      this.logger.log(`✅ Updated ${updatedCount} expired verification statuses`);
    } catch (error) {
      this.logger.error('❌ Failed to update expired verification statuses:', error);
    }
  }

  /**
   * Generate cleanup statistics report (runs weekly on Sunday)
   */
  @Cron('0 0 * * 0') // Every Sunday at midnight
  async generateCleanupReport(): Promise<void> {
    try {
      this.logger.log('📊 Generating token cleanup report...');
      
      // Get token statistics
      const activeTokenCount = await this.refreshTokenService['refreshTokenRepository'].count({
        where: { is_revoked: false }
      });
      
      const revokedTokenCount = await this.refreshTokenService['refreshTokenRepository'].count({
        where: { is_revoked: true }
      });

      const pendingVerifications = await this.emailVerificationRepository.count({
        where: { status: VerificationStatus.PENDING }
      });

      const expiredVerifications = await this.emailVerificationRepository.count({
        where: { status: VerificationStatus.EXPIRED }
      });

      const report = {
        timestamp: new Date().toISOString(),
        refreshTokens: {
          active: activeTokenCount,
          revoked: revokedTokenCount,
          total: activeTokenCount + revokedTokenCount
        },
        emailVerifications: {
          pending: pendingVerifications,
          expired: expiredVerifications
        }
      };

      this.logger.log('📊 Cleanup Report:', JSON.stringify(report, null, 2));
      
      // In production, send this report to monitoring systems
    } catch (error) {
      this.logger.error('❌ Failed to generate cleanup report:', error);
    }
  }

  /**
   * Manual cleanup method for immediate execution
   */
  async performManualCleanup(): Promise<{
    refreshTokensDeleted: number;
    emailVerificationsDeleted: number;
    verificationStatusesUpdated: number;
  }> {
    try {
      this.logger.log('🔧 Performing manual cleanup...');
      
      // Clean up expired refresh tokens
      const refreshTokensDeleted = await this.refreshTokenService.cleanupExpiredTokens(30);
      
      // Clean up old email verifications
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7);
      
      const emailResult = await this.emailVerificationRepository.delete({
        created_at: LessThan(cutoffDate),
      });
      
      // Update expired verification statuses
      const statusResult = await this.emailVerificationRepository.update(
        {
          status: VerificationStatus.PENDING,
          expires_at: LessThan(new Date()),
        },
        {
          status: VerificationStatus.EXPIRED,
        }
      );

      const results = {
        refreshTokensDeleted,
        emailVerificationsDeleted: emailResult.affected || 0,
        verificationStatusesUpdated: statusResult.affected || 0,
      };

      this.logger.log('✅ Manual cleanup completed:', results);
      return results;
    } catch (error) {
      this.logger.error('❌ Manual cleanup failed:', error);
      throw error;
    }
  }
}