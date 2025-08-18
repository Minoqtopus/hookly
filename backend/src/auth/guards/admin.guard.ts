import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../entities/user.entity';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;

    if (!userId) {
      throw new ForbiddenException('Authentication required');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'role', 'email'],
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    // Check if user has admin or super admin role
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Admin access required');
    }

    // Add user info to request for logging
    request.adminUser = user;
    
    return true;
  }
}