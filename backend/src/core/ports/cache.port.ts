export interface CacheOptions {
  ttl: number; // Time to live in seconds
  prefix?: string; // Key prefix for namespacing
}

export interface CachePort {
  /**
   * Set a value in cache with TTL
   */
  set(key: string, value: any, options?: Partial<CacheOptions>): Promise<void>;

  /**
   * Get a value from cache
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Delete a key from cache
   */
  del(key: string): Promise<void>;

  /**
   * Check if a key exists
   */
  exists(key: string): Promise<boolean>;

  /**
   * Set multiple key-value pairs
   */
  mset(keyValues: Record<string, any>, options?: Partial<CacheOptions>): Promise<void>;

  /**
   * Get multiple values from cache
   */
  mget<T>(keys: string[]): Promise<(T | null)[]>;

  /**
   * Increment a numeric value
   */
  incr(key: string, options?: Partial<CacheOptions>): Promise<number>;

  /**
   * Set TTL for an existing key
   */
  expire(key: string, ttl: number): Promise<boolean>;

  /**
   * Get TTL for a key
   */
  ttl(key: string): Promise<number>;

  /**
   * Clear all cache keys with a specific prefix
   */
  clearPrefix(prefix: string): Promise<number>;

  /**
   * Get cache statistics
   */
  getStats(): Promise<{
    hits: number;
    misses: number;
    keys: number;
    memory: number;
    hitRate: number;
  }>;

  /**
   * Health check for cache
   */
  healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; message: string }>;
}
