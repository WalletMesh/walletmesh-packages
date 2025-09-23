/**
 * Rate Limiting Security Module
 *
 * This module implements time-window based rate limiting with burst protection,
 * progressive penalties, and per-origin/per-operation tracking.
 *
 * Based on security requirements from Quint specification.
 *
 * @module security/rateLimiting
 */

import type { Logger } from '../internal/core/logger/logger.js';

/**
 * Rate limit configuration
 *
 * @remarks
 * Configures the rate limiting security module with time-window based limiting,
 * burst protection, progressive penalties, and per-origin/per-operation tracking.
 *
 * @public
 * @category Security
 * @example
 * ```typescript
 * const config: RateLimitConfig = {
 *   maxRequests: 100,
 *   windowMs: 60000, // 1 minute
 *   burstSize: 20,
 *   penaltyMultiplier: 2,
 *   perOrigin: true,
 *   perOperation: true
 * };
 * ```
 */
export interface RateLimitConfig {
  /** Maximum requests per time window */
  maxRequests: number;

  /** Time window in milliseconds */
  windowMs: number;

  /** Maximum burst size (requests allowed immediately) */
  burstSize?: number;

  /** Progressive penalty multiplier for violations */
  penaltyMultiplier?: number;

  /** Maximum penalty duration in milliseconds */
  maxPenaltyMs?: number;

  /** Block duration for repeated violations in milliseconds */
  blockDurationMs?: number;

  /** Number of violations before blocking */
  violationsBeforeBlock?: number;

  /** Enable per-origin tracking */
  perOrigin?: boolean;

  /** Enable per-operation tracking */
  perOperation?: boolean;

  /** Custom key generator for tracking */
  keyGenerator?: (origin: string, operation?: string) => string;

  /** Log rate limit events */
  logEvents?: boolean;
}

/**
 * Rate limit entry tracking
 */
export interface RateLimitEntry {
  /** Number of requests in current window */
  requests: number;

  /** Window start time */
  windowStart: number;

  /** Number of violations */
  violations: number;

  /** Current penalty end time */
  penaltyEndTime?: number;

  /** Blocked until time */
  blockedUntil?: number;

  /** Tokens available for burst */
  burstTokens: number;

  /** Last request time */
  lastRequestTime: number;
}

/**
 * Rate limit result
 *
 * @remarks
 * Contains the result of a rate limit check including whether the request
 * is allowed, remaining capacity, and retry information if blocked.
 *
 * @public
 * @category Security
 * @example
 * ```typescript
 * const result = rateLimiter.check('https://example.com', 'connect');
 * if (!result.allowed) {
 *   console.log(`Rate limited. Retry after ${result.retryAfterMs}ms`);
 * }
 * ```
 */
export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;

  /** Remaining requests in window */
  remaining: number;

  /** Time until window reset in milliseconds */
  resetAfterMs: number;

  /** Retry after time in milliseconds (if blocked) */
  retryAfterMs?: number;

  /** Reason if blocked */
  reason?: 'rate_limit' | 'burst_limit' | 'penalty' | 'blocked';
}

/**
 * Rate limiter implementation
 *
 * @remarks
 * Implements time-window based rate limiting with the following features:
 * - Configurable request limits per time window
 * - Burst protection to handle sudden traffic spikes
 * - Progressive penalties for repeated violations
 * - Automatic blocking after threshold violations
 * - Per-origin and per-operation tracking
 * - Automatic cleanup of expired entries
 *
 * @public
 * @category Security
 * @example
 * ```typescript
 * const limiter = new RateLimiter({
 *   maxRequests: 10,
 *   windowMs: 60000,
 *   burstSize: 3
 * }, logger);
 *
 * const result = limiter.check('https://example.com', 'sign');
 * if (!result.allowed) {
 *   throw new Error(`Rate limited: ${result.reason}`);
 * }
 * ```
 */
export class RateLimiter {
  private readonly config: Required<RateLimitConfig>;
  private readonly logger: Logger;
  private readonly entries = new Map<string, RateLimitEntry>();
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: RateLimitConfig, logger: Logger) {
    this.logger = logger;

    // Set config with bound keyGenerator
    this.config = {
      burstSize: Math.ceil(config.maxRequests / 2), // Default burst is half of max
      penaltyMultiplier: 2,
      maxPenaltyMs: 300000, // 5 minutes
      blockDurationMs: 3600000, // 1 hour
      violationsBeforeBlock: 5,
      perOrigin: true,
      perOperation: false,
      keyGenerator: this.generateKey.bind(this),
      logEvents: true,
      ...config,
    };

    // Start cleanup timer
    this.startCleanupTimer();
  }

  /**
   * Check if request is allowed
   *
   * @remarks
   * Checks if a request from the given origin for the specified operation
   * is allowed under the current rate limit policy. Updates internal state
   * and applies penalties or blocks as necessary.
   *
   * @param origin - The origin making the request
   * @param operation - Optional operation identifier for per-operation limiting
   * @returns Rate limit result with allowed status and metadata
   *
   * @example
   * ```typescript
   * const result = limiter.check('https://app.com', 'transaction');
   * if (result.allowed) {
   *   console.log(`${result.remaining} requests remaining`);
   * } else {
   *   console.log(`Blocked: ${result.reason}`);
   * }
   * ```
   */
  check(origin: string, operation?: string): RateLimitResult {
    const key = this.config.keyGenerator?.(origin, operation) ?? `${origin}:${operation ?? 'default'}`;
    const now = Date.now();

    // Get or create entry
    let entry = this.entries.get(key);
    if (!entry) {
      entry = this.createEntry(now);
      this.entries.set(key, entry);
    }

    // Check if blocked
    if (entry.blockedUntil && now < entry.blockedUntil) {
      const retryAfterMs = entry.blockedUntil - now;
      this.logEvent('blocked', key, { retryAfterMs });
      return {
        allowed: false,
        remaining: 0,
        resetAfterMs: retryAfterMs,
        retryAfterMs,
        reason: 'blocked',
      };
    }

    // Check if in penalty period
    if (entry.penaltyEndTime && now < entry.penaltyEndTime) {
      // Allow violations to accumulate even during penalty period
      entry.violations++;
      entry.lastRequestTime = now; // Update for cleanup tracking

      // Check if should block
      if (entry.violations >= this.config.violationsBeforeBlock) {
        entry.blockedUntil = now + this.config.blockDurationMs;
        this.logEvent('blocked_violations', key, { violations: entry.violations });

        return {
          allowed: false,
          remaining: 0,
          resetAfterMs: this.config.blockDurationMs,
          retryAfterMs: this.config.blockDurationMs,
          reason: 'blocked',
        };
      }

      // Apply progressive penalty
      const penaltyMs = Math.min(
        this.config.windowMs * this.config.penaltyMultiplier ** (entry.violations - 1),
        this.config.maxPenaltyMs,
      );
      entry.penaltyEndTime = now + penaltyMs;

      this.logEvent('rate_limited', key, { violations: entry.violations, penaltyMs });

      return {
        allowed: false,
        remaining: 0,
        resetAfterMs: penaltyMs,
        retryAfterMs: penaltyMs,
        reason: 'rate_limit',
      };
    }

    // Check if window expired
    if (now >= entry.windowStart + this.config.windowMs) {
      // Reset window
      entry.windowStart = now;
      entry.requests = 0;

      // Refill burst tokens
      entry.burstTokens = this.config.burstSize;
    }

    // Check burst limit
    if (entry.requests === 0 && entry.burstTokens > 0) {
      // Use burst token
      entry.burstTokens--;
      entry.requests++;
      entry.lastRequestTime = now;

      const remaining = this.config.maxRequests - entry.requests;
      const resetAfterMs = entry.windowStart + this.config.windowMs - now;

      this.logEvent('allowed_burst', key, { remaining, burstTokens: entry.burstTokens });

      return {
        allowed: true,
        remaining,
        resetAfterMs,
      };
    }

    // Check rate limit
    if (entry.requests >= this.config.maxRequests) {
      // Rate limit exceeded - this is a violation
      entry.violations++;
      entry.lastRequestTime = now; // Update for cleanup tracking

      // Check if should block
      if (entry.violations >= this.config.violationsBeforeBlock) {
        entry.blockedUntil = now + this.config.blockDurationMs;
        this.logEvent('blocked_violations', key, { violations: entry.violations });

        return {
          allowed: false,
          remaining: 0,
          resetAfterMs: this.config.blockDurationMs,
          retryAfterMs: this.config.blockDurationMs,
          reason: 'blocked',
        };
      }

      // Apply progressive penalty
      const penaltyMs = Math.min(
        this.config.windowMs * this.config.penaltyMultiplier ** (entry.violations - 1),
        this.config.maxPenaltyMs,
      );
      entry.penaltyEndTime = now + penaltyMs;

      this.logEvent('rate_limited', key, { violations: entry.violations, penaltyMs });

      return {
        allowed: false,
        remaining: 0,
        resetAfterMs: penaltyMs,
        retryAfterMs: penaltyMs,
        reason: 'rate_limit',
      };
    }

    // Allow request
    entry.requests++;
    entry.lastRequestTime = now;

    const remaining = this.config.maxRequests - entry.requests;
    const resetAfterMs = entry.windowStart + this.config.windowMs - now;

    this.logEvent('allowed', key, { remaining, requests: entry.requests });

    return {
      allowed: true,
      remaining,
      resetAfterMs,
    };
  }

  /**
   * Reset rate limit for a key
   *
   * @remarks
   * Clears the rate limit state for a specific origin/operation combination.
   * Useful for administrative actions or after successful authentication.
   *
   * @param origin - The origin to reset
   * @param operation - Optional operation identifier
   *
   * @example
   * ```typescript
   * // Reset after successful authentication
   * limiter.reset('https://app.com', 'auth');
   * ```
   */
  reset(origin: string, operation?: string): void {
    const key = this.config.keyGenerator?.(origin, operation) ?? `${origin}:${operation ?? 'default'}`;
    this.entries.delete(key);
    this.logEvent('reset', key);
  }

  /**
   * Clear all entries
   *
   * @remarks
   * Removes all rate limit tracking data. Use with caution as this
   * effectively resets all rate limits for all origins and operations.
   *
   * @example
   * ```typescript
   * // Clear all rate limits during maintenance
   * limiter.clear();
   * ```
   */
  clear(): void {
    this.entries.clear();
    this.logEvent('cleared', 'all');
  }

  /**
   * Get current state for debugging
   *
   * @remarks
   * Retrieves the internal rate limit entry for a specific origin/operation.
   * Useful for debugging and monitoring rate limit state.
   *
   * @param origin - The origin to query
   * @param operation - Optional operation identifier
   * @returns The rate limit entry or undefined if not found
   *
   * @example
   * ```typescript
   * const state = limiter.getState('https://app.com');
   * if (state) {
   *   console.log(`Requests: ${state.requests}, Violations: ${state.violations}`);
   * }
   * ```
   */
  getState(origin: string, operation?: string): RateLimitEntry | undefined {
    const key = this.config.keyGenerator?.(origin, operation) ?? `${origin}:${operation ?? 'default'}`;
    return this.entries.get(key);
  }

  /**
   * Get all entries for debugging
   *
   * @remarks
   * Returns a copy of all rate limit entries. Useful for monitoring
   * and debugging the overall rate limit state.
   *
   * @returns Map of all rate limit entries keyed by origin/operation
   *
   * @example
   * ```typescript
   * const entries = limiter.getAllEntries();
   * console.log(`Tracking ${entries.size} origins/operations`);
   * ```
   */
  getAllEntries(): Map<string, RateLimitEntry> {
    return new Map(this.entries);
  }

  /**
   * Destroy rate limiter
   *
   * @remarks
   * Cleans up all resources including timers and tracking data.
   * Call this when the rate limiter is no longer needed.
   *
   * @example
   * ```typescript
   * // Clean up on application shutdown
   * limiter.destroy();
   * ```
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.entries.clear();
  }

  /**
   * Default key generator
   */
  private generateKey(origin: string, operation?: string): string {
    const parts: string[] = [];

    if (this.config.perOrigin) {
      parts.push(origin);
    }

    if (this.config.perOperation && operation) {
      parts.push(operation);
    }

    return parts.length > 0 ? parts.join(':') : 'global';
  }

  /**
   * Create new entry
   */
  private createEntry(now: number): RateLimitEntry {
    return {
      requests: 0,
      windowStart: now,
      violations: 0,
      burstTokens: this.config.burstSize,
      lastRequestTime: now,
    };
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    // Clean up old entries every minute
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      const expiredKeys: string[] = [];

      for (const [key, entry] of this.entries) {
        // Remove entries that haven't been used for 2 windows
        if (now - entry.lastRequestTime > this.config.windowMs * 2) {
          expiredKeys.push(key);
        }
      }

      for (const key of expiredKeys) {
        this.entries.delete(key);
      }

      if (expiredKeys.length > 0) {
        this.logEvent('cleanup', 'timer', { removed: expiredKeys.length });
      }
    }, 60000); // Every minute
  }

  /**
   * Log rate limit event
   */
  private logEvent(event: string, key: string, data?: Record<string, unknown>): void {
    if (!this.config.logEvents) return;

    this.logger.debug(`Rate limit ${event}`, {
      key,
      ...data,
    });
  }
}

/**
 * Create a rate limiter with default config
 *
 * @remarks
 * Factory function to create a rate limiter with sensible defaults.
 * Base configuration allows 100 requests per minute.
 *
 * @param logger - Logger instance for rate limit event logging
 * @param config - Optional configuration to override defaults
 * @returns A configured RateLimiter instance
 *
 * @example
 * ```typescript
 * const limiter = createRateLimiter(logger, {
 *   maxRequests: 50,
 *   windowMs: 30000 // 30 seconds
 * });
 * ```
 */
export function createRateLimiter(logger: Logger, config: Partial<RateLimitConfig> = {}): RateLimiter {
  const finalConfig: RateLimitConfig = {
    maxRequests: 100,
    windowMs: 60000, // 1 minute
    ...config,
  };

  return new RateLimiter(finalConfig, logger);
}

/**
 * Rate limit configurations for different operations
 *
 * @remarks
 * Pre-configured rate limit settings for common wallet operations.
 * These provide reasonable defaults for different security-sensitive operations.
 *
 * @public
 * @category Security
 * @example
 * ```typescript
 * // Use pre-configured limits for wallet connection
 * const connectLimiter = createRateLimiter(logger, RATE_LIMIT_CONFIGS.connect);
 *
 * // Or combine with custom settings
 * const customLimiter = createRateLimiter(logger, {
 *   ...RATE_LIMIT_CONFIGS.sign,
 *   maxRequests: 30 // Override default
 * });
 * ```
 */
export const RATE_LIMIT_CONFIGS = {
  // Discovery requests
  discovery: {
    maxRequests: 10,
    windowMs: 60000,
    burstSize: 3,
  },

  // Wallet connection
  connect: {
    maxRequests: 5,
    windowMs: 60000,
    burstSize: 2,
  },

  // Transaction signing
  sign: {
    maxRequests: 20,
    windowMs: 60000,
    burstSize: 5,
  },

  // General API calls
  api: {
    maxRequests: 100,
    windowMs: 60000,
    burstSize: 20,
  },
} as const;
