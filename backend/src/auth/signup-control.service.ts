import { BadRequestException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SignupControl } from '../entities/signup-control.entity';

export interface SignupAvailability {
  canSignup: boolean;
  canBetaSignup: boolean;
  remainingSignups: number;
  remainingBetaSignups: number;
  isSignupEnabled: boolean;
  isBetaSignupEnabled: boolean;
  signupMessage?: string;
  betaSignupMessage?: string;
  lastUpdated: Date;
}

export interface SignupControlUpdate {
  totalSignupsAllowed?: number;
  betaSignupsAllowed?: number;
  isSignupEnabled?: boolean;
  isBetaSignupEnabled?: boolean;
  signupMessage?: string;
  betaSignupMessage?: string;
}

@Injectable()
export class SignupControlService {
  private readonly logger = new Logger(SignupControlService.name);
  private readonly DEFAULT_SIGNUP_LIMIT = 100;
  private readonly DEFAULT_BETA_LIMIT = 50;

  constructor(
    @InjectRepository(SignupControl)
    private signupControlRepository: Repository<SignupControl>,
    private dataSource: DataSource,
  ) {}

  /**
   * Get current signup availability status
   * This is the main method used by the frontend to check if signups are allowed
   */
  async getSignupAvailability(): Promise<SignupAvailability> {
    try {
      // Get from database
      let signupControl = await this.getOrCreateSignupControl();
      const availability = {
        canSignup: signupControl.canSignup(),
        canBetaSignup: signupControl.canBetaSignup(),
        remainingSignups: signupControl.getRemainingSignups(),
        remainingBetaSignups: signupControl.getRemainingBetaSignups(),
        isSignupEnabled: signupControl.is_signup_enabled,
        isBetaSignupEnabled: signupControl.is_beta_signup_enabled,
        signupMessage: signupControl.signup_message,
        betaSignupMessage: signupControl.beta_signup_message,
        lastUpdated: signupControl.last_updated || signupControl.updated_at,
      };

      this.logger.debug('Signup availability retrieved from database');

      return availability;
    } catch (error) {
      this.logger.error('Failed to get signup availability:', error);
      // Return default availability in case of error
      return {
        canSignup: false,
        canBetaSignup: false,
        remainingSignups: 0,
        remainingBetaSignups: 0,
        isSignupEnabled: false,
        isBetaSignupEnabled: false,
        lastUpdated: new Date(),
      };
    }
  }

  /**
   * Check if a specific user can sign up
   * Used during the signup process for validation
   */
  async canUserSignup(): Promise<boolean> {
    try {
      const signupControl = await this.getOrCreateSignupControl();
      return signupControl.canSignup();
    } catch (error) {
      this.logger.error('Failed to check user signup eligibility:', error);
      return false;
    }
  }

  /**
   * Check if a specific user can join beta
   * Used during beta application process
   */
  async canUserJoinBeta(): Promise<boolean> {
    try {
      const signupControl = await this.getOrCreateSignupControl();
      return signupControl.canBetaSignup();
    } catch (error) {
      this.logger.error('Failed to check beta eligibility:', error);
      return false;
    }
  }

  /**
   * Increment signup count when a user successfully signs up
   * This is called after successful user creation
   * Uses database transaction to prevent race conditions
   */
  async incrementSignupCount(): Promise<void> {
    return this.dataSource.transaction(async manager => {
      // Lock the row for update to prevent race conditions
      const signupControl = await manager
        .createQueryBuilder(SignupControl, 'sc')
        .setLock('pessimistic_write')
        .getOne();
      
      if (!signupControl) {
        throw new BadRequestException('Signup control not found');
      }
      
      if (!signupControl.canSignup()) {
        throw new BadRequestException('Signup limit reached');
      }

      // Increment with database constraint enforcement
      await manager
        .createQueryBuilder()
        .update(SignupControl)
        .set({ 
          total_signups_completed: () => 'total_signups_completed + 1',
          last_updated: new Date()
        })
        .where('id = :id', { id: signupControl.id })
        .execute();
      
      this.logger.log(`Signup count incremented. New total: ${signupControl.total_signups_completed + 1}`);
    });
  }

  /**
   * Increment beta signup count when a user joins beta
   * This is called after successful beta application approval
   * Uses database transaction to prevent race conditions
   */
  async incrementBetaSignupCount(): Promise<void> {
    return this.dataSource.transaction(async manager => {
      // Lock the row for update to prevent race conditions
      const signupControl = await manager
        .createQueryBuilder(SignupControl, 'sc')
        .setLock('pessimistic_write')
        .getOne();
      
      if (!signupControl) {
        throw new BadRequestException('Signup control not found');
      }
      
      if (!signupControl.canBetaSignup()) {
        throw new BadRequestException('Beta signup limit reached');
      }

      // Increment with database constraint enforcement
      await manager
        .createQueryBuilder()
        .update(SignupControl)
        .set({ 
          beta_signups_completed: () => 'beta_signups_completed + 1',
          last_updated: new Date()
        })
        .where('id = :id', { id: signupControl.id })
        .execute();
      
      this.logger.log(`Beta signup count incremented. New total: ${signupControl.beta_signups_completed + 1}`);
    });
  }

  /**
   * Update signup control settings (admin only)
   * This allows admins to adjust limits and messages
   */
  async updateSignupControl(
    updates: SignupControlUpdate,
    isAdmin: boolean = false,
  ): Promise<SignupControl> {
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required to update signup control');
    }

    try {
      const signupControl = await this.getOrCreateSignupControl();

      // Update allowed limits
      if (updates.totalSignupsAllowed !== undefined) {
        if (updates.totalSignupsAllowed < signupControl.total_signups_completed) {
          throw new BadRequestException(
            `Cannot set total signups allowed below current completed count (${signupControl.total_signups_completed})`
          );
        }
        signupControl.total_signups_allowed = updates.totalSignupsAllowed;
      }

      if (updates.betaSignupsAllowed !== undefined) {
        if (updates.betaSignupsAllowed < signupControl.beta_signups_completed) {
          throw new BadRequestException(
            `Cannot set beta signups allowed below current completed count (${signupControl.beta_signups_completed})`
          );
        }
        signupControl.beta_signups_allowed = updates.betaSignupsAllowed;
      }

      // Update flags
      if (updates.isSignupEnabled !== undefined) {
        signupControl.is_signup_enabled = updates.isSignupEnabled;
      }

      if (updates.isBetaSignupEnabled !== undefined) {
        signupControl.is_beta_signup_enabled = updates.isBetaSignupEnabled;
      }

      // Update messages
      if (updates.signupMessage !== undefined) {
        signupControl.signup_message = updates.signupMessage;
      }

      if (updates.betaSignupMessage !== undefined) {
        signupControl.beta_signup_message = updates.betaSignupMessage;
      }

      signupControl.last_updated = new Date();
      const updated = await this.signupControlRepository.save(signupControl);
      
      this.logger.log('Signup control updated successfully', {
        totalAllowed: updated.total_signups_allowed,
        betaAllowed: updated.beta_signups_allowed,
        isEnabled: updated.is_signup_enabled,
        isBetaEnabled: updated.is_beta_signup_enabled,
      });

      return updated;
    } catch (error) {
      this.logger.error('Failed to update signup control:', error);
      throw error;
    }
  }

  /**
   * Clean up inactive users to free up signup slots
   * This is called periodically by a cron job or admin action
   */
  async cleanupInactiveUsers(): Promise<{
    freedSignupSlots: number;
    freedBetaSlots: number;
    totalUsersRemoved: number;
  }> {
    try {
      // This would integrate with UserService to find and remove inactive users
      // For now, return mock data
      this.logger.log('Starting inactive user cleanup...');
      
      // TODO: Implement actual user cleanup logic
      // const inactiveUsers = await this.userService.findInactiveUsers();
      // const removedUsers = await this.userService.removeInactiveUsers(inactiveUsers);
      
      const mockResult = {
        freedSignupSlots: 5,
        freedBetaSlots: 2,
        totalUsersRemoved: 7,
      };

      this.logger.log('Inactive user cleanup completed', mockResult);
      return mockResult;
    } catch (error) {
      this.logger.error('Failed to cleanup inactive users:', error);
      throw error;
    }
  }

  /**
   * Get signup control statistics for admin dashboard
   */
  async getSignupStatistics(): Promise<{
    totalAllowed: number;
    totalCompleted: number;
    totalRemaining: number;
    betaAllowed: number;
    betaCompleted: number;
    betaRemaining: number;
    signupRate: number; // signups per day
    betaSignupRate: number; // beta signups per day
    lastUpdated: Date;
  }> {
    try {
      const signupControl = await this.getOrCreateSignupControl();
      
      // Calculate signup rates (this would be more sophisticated in production)
      const signupRate = this.calculateSignupRate(signupControl.total_signups_completed);
      const betaSignupRate = this.calculateSignupRate(signupControl.beta_signups_completed);

      return {
        totalAllowed: signupControl.total_signups_allowed,
        totalCompleted: signupControl.total_signups_completed,
        totalRemaining: signupControl.getRemainingSignups(),
        betaAllowed: signupControl.beta_signups_allowed,
        betaCompleted: signupControl.beta_signups_completed,
        betaRemaining: signupControl.getRemainingBetaSignups(),
        signupRate,
        betaSignupRate,
        lastUpdated: signupControl.last_updated || signupControl.updated_at,
      };
    } catch (error) {
      this.logger.error('Failed to get signup statistics:', error);
      throw error;
    }
  }

  /**
   * Reset signup counts (admin only, for testing or reset purposes)
   */
  async resetSignupCounts(isAdmin: boolean = false): Promise<void> {
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required to reset signup counts');
    }

    try {
      const signupControl = await this.getOrCreateSignupControl();
      
      signupControl.total_signups_completed = 0;
      signupControl.beta_signups_completed = 0;
      signupControl.last_updated = new Date();
      
      await this.signupControlRepository.save(signupControl);
      
      this.logger.log('Signup counts reset successfully');
    } catch (error) {
      this.logger.error('Failed to reset signup counts:', error);
      throw error;
    }
  }

  /**
   * Get or create the signup control record
   * Ensures there's always a record to work with
   */
  private async getOrCreateSignupControl(): Promise<SignupControl> {
    let signupControl = await this.signupControlRepository.findOne({
      where: {},
      order: { created_at: 'ASC' },
    });

    if (!signupControl) {
      // Create default signup control if none exists
      signupControl = this.signupControlRepository.create({
        total_signups_allowed: this.DEFAULT_SIGNUP_LIMIT,
        beta_signups_allowed: this.DEFAULT_BETA_LIMIT,
        is_signup_enabled: true,
        is_beta_signup_enabled: true,
        signup_message: 'Join the exclusive Hookly community!',
        beta_signup_message: 'Apply for early access to Hookly beta!',
      });

      signupControl = await this.signupControlRepository.save(signupControl);
      this.logger.log('Created default signup control record');
    }

    return signupControl;
  }

  /**
   * Calculate signup rate (signups per day)
   * This is a simplified calculation - in production, you'd track actual signup dates
   */
  private calculateSignupRate(totalSignups: number): number {
    // Mock calculation - in production, this would be based on actual signup dates
    const daysSinceCreation = 30; // Assume 30 days since creation
    return Math.round((totalSignups / daysSinceCreation) * 10) / 10;
  }

  /**
   * Emergency shutdown of all signups
   * Used in case of system issues or overwhelming demand
   */
  async emergencyShutdown(isAdmin: boolean = false): Promise<void> {
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required for emergency shutdown');
    }

    try {
      const signupControl = await this.getOrCreateSignupControl();
      
      signupControl.is_signup_enabled = false;
      signupControl.is_beta_signup_enabled = false;
      signupControl.signup_message = 'Signups temporarily disabled due to high demand. Please check back later.';
      signupControl.beta_signup_message = 'Beta applications temporarily disabled. Please check back later.';
      signupControl.last_updated = new Date();
      
      await this.signupControlRepository.save(signupControl);
      
      this.logger.warn('EMERGENCY SHUTDOWN: All signups disabled');
    } catch (error) {
      this.logger.error('Failed to execute emergency shutdown:', error);
      throw error;
    }
  }

  /**
   * Emergency re-enable of signups
   * Used after resolving system issues
   */
  async emergencyReenable(isAdmin: boolean = false): Promise<void> {
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required for emergency re-enable');
    }

    try {
      const signupControl = await this.getOrCreateSignupControl();
      
      signupControl.is_signup_enabled = true;
      signupControl.is_beta_signup_enabled = true;
      signupControl.signup_message = 'Join the exclusive Hookly community!';
      signupControl.beta_signup_message = 'Apply for early access to Hookly beta!';
      signupControl.last_updated = new Date();
      
      await this.signupControlRepository.save(signupControl);
      
      this.logger.log('EMERGENCY RE-ENABLE: All signups re-enabled');
    } catch (error) {
      this.logger.error('Failed to execute emergency re-enable:', error);
      throw error;
    }
  }
}
