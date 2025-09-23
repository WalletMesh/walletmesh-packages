/**
 * Unit tests for rate limiting security module
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDebugLogger } from '../../internal/core/logger/logger.js';
import { RATE_LIMIT_CONFIGS, RateLimiter, createRateLimiter } from '../rateLimiting.js';

describe('RateLimiter', () => {
  let limiter: RateLimiter;
  let logger: ReturnType<typeof createDebugLogger>;

  beforeEach(() => {
    vi.useFakeTimers();
    logger = createDebugLogger('RateLimiterTest', true);
  });

  afterEach(() => {
    vi.useRealTimers();
    limiter?.destroy();
  });

  describe('Basic Rate Limiting', () => {
    it('should allow requests within limit', () => {
      limiter = new RateLimiter(
        {
          maxRequests: 5,
          windowMs: 60000, // 1 minute
        },
        logger,
      );

      // Make 5 requests - all should be allowed
      for (let i = 0; i < 5; i++) {
        const result = limiter.check('https://example.com');
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(4 - i);
      }
    });

    it('should block requests exceeding limit', () => {
      limiter = new RateLimiter(
        {
          maxRequests: 3,
          windowMs: 60000,
        },
        logger,
      );

      // Make 3 requests - all allowed
      for (let i = 0; i < 3; i++) {
        expect(limiter.check('https://example.com').allowed).toBe(true);
      }

      // 4th request should be blocked
      const result = limiter.check('https://example.com');
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.reason).toBe('rate_limit');
    });

    it('should reset window after time period', () => {
      limiter = new RateLimiter(
        {
          maxRequests: 2,
          windowMs: 60000, // 1 minute
        },
        logger,
      );

      // Use up all requests
      limiter.check('https://example.com');
      limiter.check('https://example.com');
      expect(limiter.check('https://example.com').allowed).toBe(false);

      // Advance time past window
      vi.advanceTimersByTime(61000);

      // Should be allowed again
      const result = limiter.check('https://example.com');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(1);
    });
  });

  describe('Burst Protection', () => {
    it('should allow burst tokens for immediate requests', () => {
      limiter = new RateLimiter(
        {
          maxRequests: 10,
          windowMs: 60000,
          burstSize: 3,
        },
        logger,
      );

      // First 3 requests should use burst tokens
      for (let i = 0; i < 3; i++) {
        const result = limiter.check('https://example.com');
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(9 - i); // Max - used
      }
    });

    it('should apply burst limit correctly', () => {
      limiter = new RateLimiter(
        {
          maxRequests: 10,
          windowMs: 60000,
          burstSize: 2,
        },
        logger,
      );

      // First request uses burst token
      const result1 = limiter.check('https://example.com');
      expect(result1.allowed).toBe(true);

      // Check remaining burst tokens
      const state = limiter.getState('https://example.com');
      expect(state?.burstTokens).toBe(1);
    });
  });

  describe('Progressive Penalties', () => {
    it('should apply progressive penalties for violations', () => {
      limiter = new RateLimiter(
        {
          maxRequests: 2,
          windowMs: 1000, // 1 second
          penaltyMultiplier: 2,
        },
        logger,
      );

      const origin = 'https://example.com';

      // Use up allowed requests
      limiter.check(origin);
      limiter.check(origin);

      // First violation - 1 second penalty
      const violation1 = limiter.check(origin);
      expect(violation1.allowed).toBe(false);
      expect(violation1.retryAfterMs).toBe(1000);

      // Second violation - 2 seconds penalty (multiplied)
      const violation2 = limiter.check(origin);
      expect(violation2.allowed).toBe(false);
      expect(violation2.retryAfterMs).toBe(2000);

      // Third violation - 4 seconds penalty
      const violation3 = limiter.check(origin);
      expect(violation3.allowed).toBe(false);
      expect(violation3.retryAfterMs).toBe(4000);
    });

    it('should cap penalty at maximum', () => {
      limiter = new RateLimiter(
        {
          maxRequests: 1,
          windowMs: 1000,
          penaltyMultiplier: 10,
          maxPenaltyMs: 5000, // 5 seconds max
          violationsBeforeBlock: 10, // Don't block during this test
        },
        logger,
      );

      const origin = 'https://example.com';
      limiter.check(origin); // Use allowed request

      // Multiple violations
      for (let i = 0; i < 5; i++) {
        limiter.check(origin);
      }

      // Should be capped at max penalty
      const result = limiter.check(origin);
      expect(result.retryAfterMs).toBeLessThanOrEqual(5000);
    });
  });

  describe('Blocking After Violations', () => {
    it('should block origin after repeated violations', () => {
      limiter = new RateLimiter(
        {
          maxRequests: 2,
          windowMs: 1000,
          violationsBeforeBlock: 3,
          blockDurationMs: 3600000, // 1 hour
        },
        logger,
      );

      const origin = 'https://example.com';

      // Use allowed requests
      limiter.check(origin);
      limiter.check(origin);

      // Make violations
      limiter.check(origin); // Violation 1
      limiter.check(origin); // Violation 2

      // 3rd violation should trigger block
      const blocked = limiter.check(origin);
      expect(blocked.allowed).toBe(false);
      expect(blocked.reason).toBe('blocked');
      expect(blocked.retryAfterMs).toBe(3600000);
    });

    it('should maintain block even after window reset', () => {
      limiter = new RateLimiter(
        {
          maxRequests: 1,
          windowMs: 1000,
          violationsBeforeBlock: 2,
          blockDurationMs: 10000,
        },
        logger,
      );

      const origin = 'https://example.com';
      limiter.check(origin); // Use allowed
      limiter.check(origin); // Violation 1
      limiter.check(origin); // Violation 2 - blocked

      // Advance past window but not past block
      vi.advanceTimersByTime(2000);

      // Should still be blocked
      const result = limiter.check(origin);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('blocked');
    });
  });

  describe('Per-Origin Tracking', () => {
    it('should track rate limits per origin', () => {
      limiter = new RateLimiter(
        {
          maxRequests: 2,
          windowMs: 60000,
          perOrigin: true,
        },
        logger,
      );

      // Different origins have separate limits
      expect(limiter.check('https://site1.com').allowed).toBe(true);
      expect(limiter.check('https://site1.com').allowed).toBe(true);
      expect(limiter.check('https://site1.com').allowed).toBe(false);

      // site2 still has requests available
      expect(limiter.check('https://site2.com').allowed).toBe(true);
      expect(limiter.check('https://site2.com').allowed).toBe(true);
      expect(limiter.check('https://site2.com').allowed).toBe(false);
    });

    it('should support global rate limiting', () => {
      limiter = new RateLimiter(
        {
          maxRequests: 3,
          windowMs: 60000,
          perOrigin: false,
        },
        logger,
      );

      // All origins share the same limit
      expect(limiter.check('https://site1.com').allowed).toBe(true);
      expect(limiter.check('https://site2.com').allowed).toBe(true);
      expect(limiter.check('https://site3.com').allowed).toBe(true);
      expect(limiter.check('https://site4.com').allowed).toBe(false);
    });
  });

  describe('Per-Operation Tracking', () => {
    it('should track rate limits per operation', () => {
      limiter = new RateLimiter(
        {
          maxRequests: 2,
          windowMs: 60000,
          perOrigin: true,
          perOperation: true,
        },
        logger,
      );

      const origin = 'https://example.com';

      // Different operations have separate limits
      expect(limiter.check(origin, 'connect').allowed).toBe(true);
      expect(limiter.check(origin, 'connect').allowed).toBe(true);
      expect(limiter.check(origin, 'connect').allowed).toBe(false);

      // Sign operation still has requests
      expect(limiter.check(origin, 'sign').allowed).toBe(true);
      expect(limiter.check(origin, 'sign').allowed).toBe(true);
      expect(limiter.check(origin, 'sign').allowed).toBe(false);
    });

    it('should use custom key generator', () => {
      limiter = new RateLimiter(
        {
          maxRequests: 2,
          windowMs: 60000,
          keyGenerator: (origin, operation) => {
            // Custom key that groups by domain only
            const url = new URL(origin);
            return `${url.hostname}:${operation || 'default'}`;
          },
        },
        logger,
      );

      // Same domain with different protocols/ports share limit
      expect(limiter.check('https://example.com', 'api').allowed).toBe(true);
      expect(limiter.check('http://example.com:8080', 'api').allowed).toBe(true);
      expect(limiter.check('https://example.com:443', 'api').allowed).toBe(false);
    });
  });

  describe('Factory Functions', () => {
    it('should create rate limiter with default config', () => {
      limiter = createRateLimiter(logger, {});

      // Default config allows 100 requests per minute
      for (let i = 0; i < 100; i++) {
        expect(limiter.check('https://example.com').allowed).toBe(true);
      }
      expect(limiter.check('https://example.com').allowed).toBe(false);
    });

    it('should use predefined configs', () => {
      limiter = new RateLimiter(RATE_LIMIT_CONFIGS.discovery, logger);

      // Discovery config: 10 requests per minute
      for (let i = 0; i < 10; i++) {
        expect(limiter.check('https://example.com').allowed).toBe(true);
      }
      expect(limiter.check('https://example.com').allowed).toBe(false);
    });
  });

  describe('State Management', () => {
    it('should reset specific origin', () => {
      limiter = new RateLimiter(
        {
          maxRequests: 2,
          windowMs: 60000,
        },
        logger,
      );

      const origin = 'https://example.com';

      // Use up requests
      limiter.check(origin);
      limiter.check(origin);
      expect(limiter.check(origin).allowed).toBe(false);

      // Reset origin
      limiter.reset(origin);

      // Should be allowed again
      expect(limiter.check(origin).allowed).toBe(true);
    });

    it('should clear all entries', () => {
      limiter = new RateLimiter(
        {
          maxRequests: 1,
          windowMs: 60000,
        },
        logger,
      );

      // Add multiple origins
      limiter.check('https://site1.com');
      limiter.check('https://site2.com');
      limiter.check('https://site3.com');

      // All should be rate limited
      expect(limiter.check('https://site1.com').allowed).toBe(false);
      expect(limiter.check('https://site2.com').allowed).toBe(false);
      expect(limiter.check('https://site3.com').allowed).toBe(false);

      // Clear all
      limiter.clear();

      // All should be allowed again
      expect(limiter.check('https://site1.com').allowed).toBe(true);
      expect(limiter.check('https://site2.com').allowed).toBe(true);
      expect(limiter.check('https://site3.com').allowed).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup old entries automatically', () => {
      limiter = new RateLimiter(
        {
          maxRequests: 10,
          windowMs: 1000, // 1 second
        },
        logger,
      );

      // Create entries
      limiter.check('https://old1.com');
      limiter.check('https://old2.com');
      limiter.check('https://recent.com');

      // Get initial state
      expect(limiter.getAllEntries().size).toBe(3);

      // Advance time to make old entries stale
      vi.advanceTimersByTime(2500); // 2.5 seconds

      // Touch recent entry
      limiter.check('https://recent.com');

      // Advance time to just before cleanup timer triggers
      vi.advanceTimersByTime(59000); // 59 seconds later (1 second before cleanup timer)

      // Touch recent entry again to keep it fresh
      limiter.check('https://recent.com');

      // Trigger cleanup
      vi.advanceTimersByTime(1000); // 1 second to trigger cleanup

      // Old entries should be removed
      const entries = limiter.getAllEntries();
      expect(entries.size).toBe(1);
      expect(entries.has('https://recent.com')).toBe(true);
    });

    it('should stop cleanup timer on destroy', () => {
      limiter = new RateLimiter(
        {
          maxRequests: 10,
          windowMs: 60000,
        },
        logger,
      );

      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

      limiter.destroy();

      expect(clearIntervalSpy).toHaveBeenCalled();
      expect(limiter.getAllEntries().size).toBe(0);
    });
  });
});
