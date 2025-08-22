import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminManagementService {
  private readonly logger = new Logger(AdminManagementService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  /**
   * Check if an email should be granted admin access
   * 
   * Security features:
   * - Database-only admin role validation for production security
   * - Case-insensitive email comparison
   * - Returns true only if user exists and has ADMIN role in database
   * 
   * @param email - Email address to check for admin privileges
   * @returns True if user exists and has admin role in database, false otherwise
   */
  async isAdminEmail(email: string): Promise<boolean> {
    if (!email) return false;

    // Check if user exists and has admin role in database
    const existingUser = await this.userRepository.findOne({ 
      where: { email: email.toLowerCase() } 
    });
    
    return existingUser?.role === UserRole.ADMIN;
  }

  /**
   * Grant admin access to a user (requires existing admin to execute)
   * 
   * Security features:
   * - Validates requesting user is admin
   * - Validates target user exists
   * - Idempotent operation (no error if already admin)
   * - Logs admin action for audit trail
   * 
   * @param requestingUserId - ID of admin user making the request
   * @param targetEmail - Email of user to grant admin access
   * @throws ForbiddenException if requesting user is not admin
   * @throws Error if target user not found
   */
  async grantAdminAccess(requestingUserId: string, targetEmail: string): Promise<void> {
    // Verify requesting user is admin
    const requestingUser = await this.userRepository.findOne({ 
      where: { id: requestingUserId } 
    });
    
    if (!requestingUser || requestingUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can grant admin access');
    }

    // Find target user
    const targetUser = await this.userRepository.findOne({ 
      where: { email: targetEmail.toLowerCase() } 
    });
    
    if (!targetUser) {
      throw new Error('User not found');
    }

    if (targetUser.role === UserRole.ADMIN) {
      return; // Already admin
    }

    // Grant admin access
    await this.userRepository.update(
      { id: targetUser.id },
      { role: UserRole.ADMIN }
    );

    this.logger.log(`Admin access granted to ${targetEmail} by admin ${requestingUser.email}`);
  }

  /**
   * Revoke admin access from a user (requires existing admin to execute)
   * 
   * Security features:
   * - Validates requesting user is admin
   * - Prevents self-revocation (admin cannot remove their own access)
   * - Validates target user exists
   * - Idempotent operation (no error if not admin)
   * - Logs admin action for audit trail
   * 
   * @param requestingUserId - ID of admin user making the request
   * @param targetEmail - Email of user to revoke admin access
   * @throws ForbiddenException if requesting user is not admin or trying to revoke self
   * @throws Error if target user not found
   */
  async revokeAdminAccess(requestingUserId: string, targetEmail: string): Promise<void> {
    // Verify requesting user is admin
    const requestingUser = await this.userRepository.findOne({ 
      where: { id: requestingUserId } 
    });
    
    if (!requestingUser || requestingUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can revoke admin access');
    }

    // Find target user
    const targetUser = await this.userRepository.findOne({ 
      where: { email: targetEmail.toLowerCase() } 
    });
    
    if (!targetUser) {
      throw new Error('User not found');
    }

    // Prevent self-revocation
    if (targetUser.id === requestingUser.id) {
      throw new ForbiddenException('Cannot revoke your own admin access');
    }

    if (targetUser.role !== UserRole.ADMIN) {
      return; // Not admin anyway
    }

    // Revoke admin access
    await this.userRepository.update(
      { id: targetUser.id },
      { role: UserRole.USER }
    );

    this.logger.log(`Admin access revoked from ${targetEmail} by admin ${requestingUser.email}`);
  }

  /**
   * Get list of all admin users
   * 
   * Returns limited user data for security (id, email, created_at, role only)
   * Used for admin management interfaces
   * 
   * @returns Array of admin users with limited fields
   */
  async getAdminUsers(): Promise<User[]> {
    return this.userRepository.find({
      where: { role: UserRole.ADMIN },
      select: ['id', 'email', 'created_at', 'role']
    });
  }

  /**
   * Validate admin action with audit logging
   * 
   * Security features:
   * - Validates user is admin before logging
   * - Structured logging with timestamp
   * - Includes metadata for detailed audit trails
   * 
   * @param adminUserId - ID of admin user performing action
   * @param action - Description of action being performed
   * @param target - Target of the action (user email, resource, etc.)
   * @param metadata - Optional additional data for audit trail
   * @throws ForbiddenException if user is not admin
   */
  async logAdminAction(adminUserId: string, action: string, target: string, metadata?: any): Promise<void> {
    const admin = await this.userRepository.findOne({ 
      where: { id: adminUserId },
      select: ['email', 'role']
    });

    if (!admin || admin.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Invalid admin user');
    }

    this.logger.log(`ADMIN ACTION: ${admin.email} performed ${action} on ${target}`, {
      adminId: adminUserId,
      adminEmail: admin.email,
      action,
      target,
      metadata,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Parse admin emails from environment variable
   * 
   * Parses ADMIN_EMAILS environment variable (comma-separated)
   * Normalizes emails to lowercase and filters empty strings
   * 
   * @returns Array of admin email addresses from environment
   */
  private getAdminEmailsFromEnv(): string[] {
    const adminEmails = this.configService.get<string>('ADMIN_EMAILS', '');
    return adminEmails
      .split(',')
      .map(email => email.trim().toLowerCase())
      .filter(email => email.length > 0);
  }
}