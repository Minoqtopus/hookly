export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: number;
  windowSeconds: number;
}

export class RateLimitManager {
  // Parse rate limit headers from API responses
  static parseHeaders(response: Response): RateLimitInfo | null {
    const limit = response.headers.get('X-RateLimit-Limit');
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const reset = response.headers.get('X-RateLimit-Reset');
    const window = response.headers.get('X-RateLimit-Window');

    if (!limit || !window) {
      return null;
    }

    return {
      limit: parseInt(limit, 10),
      remaining: remaining ? parseInt(remaining, 10) : 0,
      resetTime: reset ? parseInt(reset, 10) : Date.now() + parseInt(window, 10) * 1000,
      windowSeconds: parseInt(window, 10),
    };
  }

  // Check if we should show a rate limit warning
  static shouldShowWarning(rateLimitInfo: RateLimitInfo): boolean {
    if (!rateLimitInfo) return false;
    
    const percentage = (rateLimitInfo.remaining / rateLimitInfo.limit) * 100;
    return percentage <= 20; // Show warning when 20% or less remaining
  }

  // Get friendly time until reset
  static getTimeUntilReset(resetTime: number): string {
    const now = Date.now();
    const diff = Math.max(0, resetTime - now);
    
    if (diff === 0) return 'now';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }

  // Enhanced fetch wrapper that handles rate limits
  static async fetchWithRateLimit(
    url: string,
    options?: RequestInit
  ): Promise<{ response: Response; rateLimitInfo: RateLimitInfo | null }> {
    const response = await fetch(url, options);
    const rateLimitInfo = this.parseHeaders(response);

    // If we hit a rate limit, provide helpful error information
    if (response.status === 429) {
      const resetTime = rateLimitInfo?.resetTime || Date.now() + 60000;
      const timeUntilReset = this.getTimeUntilReset(resetTime);
      
      throw new Error(`Rate limit exceeded. Please try again in ${timeUntilReset}.`);
    }

    return { response, rateLimitInfo };
  }

  // Store rate limit info for tracking across requests
  static storeRateLimitInfo(endpoint: string, info: RateLimitInfo): void {
    if (typeof window === 'undefined') return;
    
    const key = `rate_limit_${endpoint}`;
    localStorage.setItem(key, JSON.stringify({
      ...info,
      timestamp: Date.now(),
    }));
  }

  // Retrieve stored rate limit info
  static getStoredRateLimitInfo(endpoint: string): RateLimitInfo | null {
    if (typeof window === 'undefined') return null;
    
    const key = `rate_limit_${endpoint}`;
    const stored = localStorage.getItem(key);
    
    if (!stored) return null;
    
    try {
      const parsed = JSON.parse(stored);
      
      // Check if the stored info is still valid (within the window)
      const age = Date.now() - parsed.timestamp;
      if (age > parsed.windowSeconds * 1000) {
        localStorage.removeItem(key);
        return null;
      }
      
      return parsed;
    } catch {
      localStorage.removeItem(key);
      return null;
    }
  }

  // Get rate limit status for different endpoint types
  static getEndpointLimits(): Record<string, { limit: number; window: string; description: string }> {
    return {
      generation: {
        limit: 10,
        window: '1 minute',
        description: 'Ad generation requests',
      },
      guestGeneration: {
        limit: 3,
        window: '5 minutes',
        description: 'Guest ad generations',
      },
      auth: {
        limit: 5,
        window: '5 minutes',
        description: 'Login attempts',
      },
      emailVerification: {
        limit: 3,
        window: '5 minutes',
        description: 'Email verification requests',
      },
      analytics: {
        limit: 200,
        window: '1 minute',
        description: 'Analytics events',
      },
      general: {
        limit: 100,
        window: '1 minute',
        description: 'General API requests',
      },
    };
  }
}