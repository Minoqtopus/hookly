import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';

/**
 * Decorator that applies both JWT authentication and admin authorization
 * Use this decorator on endpoints that require admin access
 * 
 * @example
 * @Get('admin/users')
 * @RequireAdmin()
 * async getUsers() {
 *   // Only authenticated admins can access this
 * }
 */
export const RequireAdmin = () => applyDecorators(
  UseGuards(JwtAuthGuard, AdminGuard),
);