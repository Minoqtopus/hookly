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

// Predefined rate limit configurations
export const RateLimits = {
  // Generation endpoints - most resource intensive
  GENERATION: { limit: 10, ttl: 60 }, // 10 requests per minute
  GENERATION_GUEST: { limit: 3, ttl: 300 }, // 3 requests per 5 minutes for guests
  
  // Auth endpoints
  AUTH_LOGIN: { limit: 5, ttl: 300, skipSuccessfulRequests: true }, // 5 attempts per 5 minutes
  AUTH_REGISTER: { limit: 3, ttl: 3600 }, // 3 registrations per hour
  AUTH_RESET_PASSWORD: { limit: 3, ttl: 3600 }, // 3 reset attempts per hour
  
  // Email endpoints
  EMAIL_VERIFICATION: { limit: 3, ttl: 300 }, // 3 emails per 5 minutes
  
  // API endpoints
  API_GENERAL: { limit: 100, ttl: 60 }, // 100 requests per minute
  API_HEAVY: { limit: 20, ttl: 60 }, // 20 requests per minute for heavy operations
  
  // Admin endpoints
  ADMIN: { limit: 200, ttl: 60 }, // 200 requests per minute for admins
  
  // Templates and content
  TEMPLATES: { limit: 50, ttl: 60 }, // 50 requests per minute
  
  // Analytics tracking
  ANALYTICS: { limit: 200, ttl: 60 }, // 200 events per minute
};