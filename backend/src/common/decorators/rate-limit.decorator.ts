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
  
  // Auth endpoints - prevent brute force attacks
  AUTH_LOGIN: { limit: 3, ttl: 900, skipSuccessfulRequests: true }, // Reduced from 5 to 3 attempts per 15 minutes
  AUTH_REGISTER: { limit: 2, ttl: 3600 }, // Reduced from 3 to 2 registrations per hour
  AUTH_RESET_PASSWORD: { limit: 2, ttl: 3600 }, // Reduced from 3 to 2 reset attempts per hour
  
  // Email endpoints - prevent spam
  EMAIL_VERIFICATION: { limit: 2, ttl: 600 }, // Reduced from 3 to 2 emails per 10 minutes
  
  // API endpoints
  API_GENERAL: { limit: 60, ttl: 60 }, // Reduced from 100 to 60 requests per minute
  API_HEAVY: { limit: 10, ttl: 60 }, // Reduced from 20 to 10 requests per minute for heavy operations
  
  // Admin endpoints
  ADMIN: { limit: 100, ttl: 60 }, // Reduced from 200 to 100 requests per minute for admins
  
  // Templates and content
  TEMPLATES: { limit: 30, ttl: 60 }, // Reduced from 50 to 30 requests per minute
  
  // Analytics tracking
  ANALYTICS: { limit: 100, ttl: 60 }, // Reduced from 200 to 100 events per minute
};