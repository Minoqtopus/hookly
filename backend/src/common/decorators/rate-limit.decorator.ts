import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'rate_limit';

export interface RateLimitOptions {
  limit: number;
  ttl: number; // in seconds
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// Decorator for custom rate limiting per endpoint
export const RateLimit = (options: RateLimitOptions) => SetMetadata(RATE_LIMIT_KEY, options);

// Security-hardened rate limit configurations
export const RateLimits = {
  // Generation endpoints - most resource intensive
  GENERATION: { limit: 5, ttl: 60 }, // Reduced from 10 to 5 requests per minute
  GENERATION_GUEST: { limit: 1, ttl: 3600 }, // Hardened: 1 request per hour for guests
  
  // Auth endpoints - enhanced distributed attack protection
  AUTH_LOGIN: { limit: 5, ttl: 3600, skipSuccessfulRequests: true }, // 5 attempts per hour (enhanced protection)
  AUTH_REGISTER: { limit: 3, ttl: 86400 }, // 3 registrations per day (prevents enumeration)
  AUTH_REFRESH: { limit: 20, ttl: 3600 }, // 20 refresh attempts per hour (better UX while secure)
  AUTH_LOGOUT: { limit: 60, ttl: 3600 }, // 60 logout attempts per hour (high limit for UX)
  AUTH_RESET_PASSWORD: { limit: 2, ttl: 7200 }, // 2 reset attempts per 2 hours (enhanced protection)
  
  // Password management endpoints  
  PASSWORD_RESET: { limit: 2, ttl: 7200 }, // 2 password reset requests per 2 hours
  
  // Email endpoints - prevent spam
  EMAIL_VERIFICATION: { limit: 2, ttl: 600 }, // Reduced from 3 to 2 emails per 10 minutes
  
  // API endpoints
  API_GENERAL: { limit: 60, ttl: 60 }, // Reduced from 100 to 60 requests per minute
  API_HEAVY: { limit: 10, ttl: 60 }, // Reduced from 20 to 10 requests per minute for heavy operations
  GENERAL: { limit: 100, ttl: 60 }, // General purpose rate limit
  
  // Admin endpoints
  ADMIN: { limit: 100, ttl: 60 }, // Reduced from 200 to 100 requests per minute for admins
  
  // Templates and content
  TEMPLATES: { limit: 30, ttl: 60 }, // Reduced from 50 to 30 requests per minute
  
  // Analytics tracking
  ANALYTICS: { limit: 100, ttl: 60 }, // Reduced from 200 to 100 events per minute
};