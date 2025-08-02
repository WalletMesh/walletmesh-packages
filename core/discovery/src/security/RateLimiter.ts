import type { RateLimitConfig } from '../core/types.js';
import { DISCOVERY_CONFIG } from '../core/constants.js';

/**
 * Request entry for tracking individual requests.
 */
interface RequestEntry {
  timestamp: number;
  count: number;
}

/**
 * Rate limiter implementing sliding window algorithm for abuse prevention.
 *
 * Prevents discovery request abuse by limiting the number of requests per
 * origin within configurable time windows. Uses a sliding window algorithm
 * for accurate rate limiting without burst allowance issues common in
 * fixed window approaches.
 *
 * Features:
 * - Per-origin rate limiting with independent windows
 * - Sliding window algorithm for precise request tracking
 * - Automatic cleanup of expired request records
 * - Configurable limits and time windows
 * - Real-time statistics and monitoring
 * - Memory-efficient with automatic garbage collection
 *
 * @example Basic usage:
 * ```typescript
 * const rateLimiter = new RateLimiter({
 *   maxRequests: 10,        // 10 requests max
 *   windowMs: 60000,        // per 60 seconds
 *   enabled: true           // enforce limits
 * });
 *
 * // Check if request is allowed
 * if (rateLimiter.isAllowed('https://example.com')) {
 *   // Record the request
 *   rateLimiter.recordRequest('https://example.com');
 *   // Process the request...
 * } else {
 *   console.log('Rate limited');
 * }
 * ```
 *
 * @example Development setup:
 * ```typescript
 * const devLimiter = new RateLimiter({
 *   enabled: false    // Disable for development
 * });
 *
 * // All requests allowed in development
 * ```
 *
 * @category Security
 * @since 0.1.0
 * @see {@link RateLimitConfig} for configuration options
 * @see {@link OriginValidator} for origin validation
 */
export class RateLimiter {
  private requests = new Map<string, RequestEntry[]>();
  private config: Required<RateLimitConfig>;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = {
      maxRequests: config.maxRequests ?? DISCOVERY_CONFIG.MAX_REQUESTS_PER_MINUTE,
      windowMs: config.windowMs ?? DISCOVERY_CONFIG.RATE_LIMIT_WINDOW_MS,
      enabled: config.enabled ?? true,
    };

    // Start cleanup interval
    this.startCleanup();
  }

  /**
   * Check if a request is allowed for the given origin.
   */
  isAllowed(origin: string, timestamp: number = Date.now()): boolean {
    if (!this.config.enabled) {
      return true;
    }

    // If maxRequests is 0, no requests are allowed
    if (this.config.maxRequests === 0) {
      return false;
    }

    const requests = this.requests.get(origin);
    if (!requests) {
      return true;
    }

    this.cleanupOldRequests(requests, timestamp);
    const currentCount = this.getCurrentRequestCount(requests, timestamp);
    return currentCount < this.config.maxRequests;
  }

  /**
   * Record a request for the given origin.
   */
  recordRequest(origin: string, timestamp: number = Date.now()): boolean {
    if (!this.config.enabled) {
      return true;
    }

    if (!this.isAllowed(origin, timestamp)) {
      return false; // Rate limited
    }

    let requests = this.requests.get(origin);
    if (!requests) {
      requests = [];
      this.requests.set(origin, requests);
    }

    requests.push({ timestamp, count: 1 });
    return true;
  }

  /**
   * Get the current request count for an origin within the time window.
   */
  getCurrentCount(origin: string, timestamp: number = Date.now()): number {
    if (!this.config.enabled) {
      return 0;
    }

    const requests = this.requests.get(origin);
    if (!requests) {
      return 0;
    }

    this.cleanupOldRequests(requests, timestamp);
    return this.getCurrentRequestCount(requests, timestamp);
  }

  /**
   * Get the remaining requests allowed for an origin.
   */
  getRemainingRequests(origin: string, timestamp: number = Date.now()): number {
    const currentCount = this.getCurrentCount(origin, timestamp);
    return Math.max(0, this.config.maxRequests - currentCount);
  }

  /**
   * Get the time until the next request is allowed (in milliseconds).
   */
  getTimeUntilReset(origin: string, timestamp: number = Date.now()): number {
    if (!this.config.enabled || this.isAllowed(origin, timestamp)) {
      return 0;
    }

    const requests = this.requests.get(origin);
    if (!requests || requests.length === 0) {
      return 0;
    }

    // Find the oldest request in the window
    const oldestRequest = requests[0];
    if (!oldestRequest) {
      return 0;
    }

    const resetTime = oldestRequest.timestamp + this.config.windowMs;
    return Math.max(0, resetTime - timestamp);
  }

  /**
   * Reset rate limit for a specific origin.
   */
  reset(origin: string): void {
    this.requests.delete(origin);
  }

  /**
   * Reset all rate limits.
   */
  resetAll(): void {
    this.requests.clear();
  }

  /**
   * Update the rate limit configuration.
   */
  updateConfig(config: Partial<RateLimitConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  /**
   * Get current configuration.
   */
  getConfig(): RateLimitConfig {
    return { ...this.config };
  }

  /**
   * Get comprehensive statistics about rate limiting activity.
   */
  getStats(timestamp: number = Date.now()) {
    const origins = Array.from(this.requests.keys());
    const stats = {
      totalOrigins: origins.length,
      activeOrigins: 0,
      totalRequests: 0,
      rateLimitedOrigins: 0,
      averageRequestsPerOrigin: 0,
      memoryUsage: {
        requestMaps: this.requests.size,
        totalRequestEntries: 0,
      },
    };

    let totalActiveRequests = 0;
    let activeOrigins = 0;

    for (const origin of origins) {
      const requests = this.requests.get(origin);
      if (!requests) continue;
      this.cleanupOldRequests(requests, timestamp);

      const currentCount = this.getCurrentRequestCount(requests, timestamp);
      stats.totalRequests += currentCount;
      stats.memoryUsage.totalRequestEntries += requests.length;

      if (currentCount > 0) {
        activeOrigins++;
        totalActiveRequests += currentCount;
      }

      if (!this.isAllowed(origin, timestamp)) {
        stats.rateLimitedOrigins++;
      }
    }

    stats.activeOrigins = activeOrigins;
    stats.averageRequestsPerOrigin = activeOrigins > 0 ? totalActiveRequests / activeOrigins : 0;

    return stats;
  }

  /**
   * Get detailed information about a specific origin.
   */
  getOriginInfo(origin: string, timestamp: number = Date.now()) {
    const requests = this.requests.get(origin);

    if (!requests) {
      return {
        origin,
        currentCount: 0,
        remainingRequests: this.config.maxRequests,
        isRateLimited: false,
        timeUntilReset: 0,
        requestHistory: [],
      };
    }

    this.cleanupOldRequests(requests, timestamp);
    const currentCount = this.getCurrentRequestCount(requests, timestamp);

    return {
      origin,
      currentCount,
      remainingRequests: this.getRemainingRequests(origin, timestamp),
      isRateLimited: !this.isAllowed(origin, timestamp),
      timeUntilReset: this.getTimeUntilReset(origin, timestamp),
      requestHistory: requests.map((req) => ({
        timestamp: req.timestamp,
        count: req.count,
        age: timestamp - req.timestamp,
      })),
    };
  }

  /**
   * Dispose of the rate limiter and clean up resources.
   */
  dispose(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.requests.clear();
  }

  /**
   * Start the cleanup interval to remove old requests.
   */
  private startCleanup(): void {
    // Clean up every minute
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, 60 * 1000);
  }

  /**
   * Perform cleanup of old requests.
   */
  private performCleanup(): void {
    const now = Date.now();
    const originsToDelete: string[] = [];

    for (const [origin, requests] of this.requests) {
      this.cleanupOldRequests(requests, now);

      // If no requests remain, remove the origin entirely
      if (requests.length === 0) {
        originsToDelete.push(origin);
      }
    }

    // Remove empty origin entries
    for (const origin of originsToDelete) {
      this.requests.delete(origin);
    }
  }

  /**
   * Clean up old requests that are outside the time window.
   */
  private cleanupOldRequests(requests: RequestEntry[], timestamp: number): void {
    const cutoffTime = timestamp - this.config.windowMs;

    // Remove requests older than the window
    let firstValidIndex = 0;
    for (let i = 0; i < requests.length; i++) {
      const request = requests[i];
      if (request && request.timestamp > cutoffTime) {
        firstValidIndex = i;
        break;
      }
      firstValidIndex = requests.length; // All are old
    }

    if (firstValidIndex > 0) {
      requests.splice(0, firstValidIndex);
    }
  }

  /**
   * Count requests within the current time window.
   */
  private getCurrentRequestCount(requests: RequestEntry[], timestamp: number): number {
    const cutoffTime = timestamp - this.config.windowMs;
    return requests.filter((req) => req.timestamp > cutoffTime).length;
  }
}
