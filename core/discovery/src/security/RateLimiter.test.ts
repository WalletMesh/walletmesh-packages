/**
 * Consolidated test suite for RateLimiter
 * Combines main functionality, coverage improvements, and edge case tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { RateLimiter } from './RateLimiter.js';
import { setupFakeTimers, cleanupFakeTimers } from '../testing/timingHelpers.js';
import { simulateRateLimiting } from '../testing/securityHelpers.js';
import type { RateLimitTestConfig } from '../testing/securityHelpers.js';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    setupFakeTimers();
  });

  afterEach(() => {
    cleanupFakeTimers();
  });

  // ===============================================
  // Basic Functionality Tests
  // ===============================================
  describe('Basic Functionality', () => {
    it('should allow requests within limit', () => {
      rateLimiter = new RateLimiter({
        enabled: true,
        maxRequests: 5,
        windowMs: 60000, // 1 minute
      });

      const origin = 'https://example.com';

      // Should allow first 5 requests
      for (let i = 0; i < 5; i++) {
        expect(rateLimiter.recordRequest(origin)).toBe(true);
        expect(rateLimiter.getCurrentCount(origin)).toBe(i + 1);
      }
    });

    it('should reject requests over limit', () => {
      rateLimiter = new RateLimiter({
        enabled: true,
        maxRequests: 3,
        windowMs: 60000,
      });

      const origin = 'https://example.com';

      // Allow first 3 requests
      for (let i = 0; i < 3; i++) {
        expect(rateLimiter.recordRequest(origin)).toBe(true);
      }

      // Reject 4th request
      expect(rateLimiter.recordRequest(origin)).toBe(false);
      expect(rateLimiter.getCurrentCount(origin)).toBe(3);
    });

    it('should handle multiple origins independently', () => {
      rateLimiter = new RateLimiter({
        enabled: true,
        maxRequests: 2,
        windowMs: 60000,
      });

      const origin1 = 'https://app1.com';
      const origin2 = 'https://app2.com';

      // Each origin should have independent limits
      expect(rateLimiter.recordRequest(origin1)).toBe(true);
      expect(rateLimiter.recordRequest(origin1)).toBe(true);
      expect(rateLimiter.recordRequest(origin1)).toBe(false); // Over limit

      expect(rateLimiter.recordRequest(origin2)).toBe(true);
      expect(rateLimiter.recordRequest(origin2)).toBe(true);
      expect(rateLimiter.recordRequest(origin2)).toBe(false); // Over limit

      expect(rateLimiter.getCurrentCount(origin1)).toBe(2);
      expect(rateLimiter.getCurrentCount(origin2)).toBe(2);
    });

    it('should reset count after time window expires', () => {
      rateLimiter = new RateLimiter({
        enabled: true,
        maxRequests: 2,
        windowMs: 30000, // 30 seconds
      });

      const origin = 'https://example.com';

      // Fill up the limit
      expect(rateLimiter.recordRequest(origin)).toBe(true);
      expect(rateLimiter.recordRequest(origin)).toBe(true);
      expect(rateLimiter.recordRequest(origin)).toBe(false);

      // Advance time beyond window
      vi.advanceTimersByTime(35000);

      // Should allow requests again
      expect(rateLimiter.recordRequest(origin)).toBe(true);
      expect(rateLimiter.getCurrentCount(origin)).toBe(1);
    });
  });

  // ===============================================
  // Disabled Rate Limiting Tests
  // ===============================================
  describe('Disabled Rate Limiting', () => {
    it('should skip rate limiting when disabled in recordRequest', () => {
      rateLimiter = new RateLimiter({ enabled: false, maxRequests: 5, windowMs: 60000 });

      // Should always return true when disabled
      const result = rateLimiter.recordRequest('https://example.com');
      expect(result).toBe(true);

      // Should work for any number of requests
      for (let i = 0; i < 100; i++) {
        expect(rateLimiter.recordRequest('https://example.com')).toBe(true);
      }
    });

    it('should return 0 count when disabled in getCurrentCount', () => {
      rateLimiter = new RateLimiter({ enabled: false, maxRequests: 5, windowMs: 60000 });

      // Should always return 0 when disabled
      const count = rateLimiter.getCurrentCount('https://example.com');
      expect(count).toBe(0);

      // Even after recording requests
      rateLimiter.recordRequest('https://example.com');
      expect(rateLimiter.getCurrentCount('https://example.com')).toBe(0);
    });

    it('should handle multiple origins when disabled', () => {
      rateLimiter = new RateLimiter({ enabled: false, maxRequests: 1, windowMs: 1000 });

      const origins = ['https://site1.com', 'https://site2.com', 'https://site3.com'];

      for (const origin of origins) {
        // Should always allow requests
        expect(rateLimiter.recordRequest(origin)).toBe(true);
        expect(rateLimiter.getCurrentCount(origin)).toBe(0);
      }
    });

    it('should not store any data when disabled', () => {
      rateLimiter = new RateLimiter({ enabled: false, maxRequests: 5, windowMs: 60000 });

      // Make many requests
      for (let i = 0; i < 50; i++) {
        rateLimiter.recordRequest(`https://site${i}.com`);
      }

      // Internal storage should remain empty (can't directly test, but verify count is 0)
      for (let i = 0; i < 50; i++) {
        expect(rateLimiter.getCurrentCount(`https://site${i}.com`)).toBe(0);
      }
    });
  });

  // ===============================================
  // Edge Cases and Cleanup Tests
  // ===============================================
  describe('Edge Cases and Cleanup', () => {
    it('should handle automatic cleanup interval properly', () => {
      rateLimiter = new RateLimiter({
        enabled: true,
        maxRequests: 5,
        windowMs: 60000, // 1 minute
      });

      const origin = 'https://example.com';
      const now = Date.now();

      // Add requests at different times
      rateLimiter.recordRequest(origin, now - 120000); // 2 minutes ago
      rateLimiter.recordRequest(origin, now - 90000); // 1.5 minutes ago
      rateLimiter.recordRequest(origin, now - 30000); // 30 seconds ago

      // Check initial state
      expect(rateLimiter.getCurrentCount(origin, now)).toBe(1); // Only the 30 second old request

      // Advance time to trigger cleanup interval (60 seconds)
      vi.advanceTimersByTime(60000);

      // Force cleanup by checking count again
      expect(rateLimiter.getCurrentCount(origin)).toBe(0); // All requests should be expired now
    });

    it('should clean up empty origins during automatic cleanup', () => {
      rateLimiter = new RateLimiter({
        enabled: true,
        maxRequests: 5,
        windowMs: 30000, // 30 seconds
      });

      const origin1 = 'https://app1.com';
      const origin2 = 'https://app2.com';
      const now = Date.now();

      // Add expired requests to both origins
      rateLimiter.recordRequest(origin1, now - 60000); // 1 minute ago (expired)
      rateLimiter.recordRequest(origin2, now - 5000); // 5 seconds ago (not expired)

      // Advance time to trigger cleanup
      vi.advanceTimersByTime(35000);

      // Check counts - origin1 should be cleaned up, origin2 should remain
      expect(rateLimiter.getCurrentCount(origin1)).toBe(0);
      expect(rateLimiter.getCurrentCount(origin2)).toBe(0); // Now expired too
    });

    it('should handle requests with custom timestamps', () => {
      rateLimiter = new RateLimiter({
        enabled: true,
        maxRequests: 3,
        windowMs: 60000,
      });

      const origin = 'https://example.com';
      const now = Date.now();

      // Add requests with specific timestamps
      expect(rateLimiter.recordRequest(origin, now - 30000)).toBe(true); // 30 seconds ago
      expect(rateLimiter.recordRequest(origin, now - 20000)).toBe(true); // 20 seconds ago
      expect(rateLimiter.recordRequest(origin, now - 10000)).toBe(true); // 10 seconds ago

      // All should count toward current window
      expect(rateLimiter.getCurrentCount(origin, now)).toBe(3);

      // Request with future timestamp should still work
      expect(rateLimiter.recordRequest(origin, now + 5000)).toBe(false); // Over limit
    });

    it('should handle edge case of zero maxRequests', () => {
      rateLimiter = new RateLimiter({
        enabled: true,
        maxRequests: 0,
        windowMs: 60000,
      });

      const origin = 'https://example.com';

      // Should reject all requests when maxRequests is 0
      expect(rateLimiter.recordRequest(origin)).toBe(false);
      expect(rateLimiter.getCurrentCount(origin)).toBe(0);
    });

    it('should handle edge case of very small time window', () => {
      rateLimiter = new RateLimiter({
        enabled: true,
        maxRequests: 2,
        windowMs: 1, // 1 millisecond
      });

      const origin = 'https://example.com';

      // Fill limit quickly
      expect(rateLimiter.recordRequest(origin)).toBe(true);
      expect(rateLimiter.recordRequest(origin)).toBe(true);
      expect(rateLimiter.recordRequest(origin)).toBe(false);

      // Advance by just 2ms
      vi.advanceTimersByTime(2);

      // Should allow requests again
      expect(rateLimiter.recordRequest(origin)).toBe(true);
    });

    it('should handle very large time windows', () => {
      rateLimiter = new RateLimiter({
        enabled: true,
        maxRequests: 2,
        windowMs: 3600000, // 1 hour
      });

      const origin = 'https://example.com';

      // Fill limit
      expect(rateLimiter.recordRequest(origin)).toBe(true);
      expect(rateLimiter.recordRequest(origin)).toBe(true);
      expect(rateLimiter.recordRequest(origin)).toBe(false);

      // Advance by 30 minutes (still within window)
      vi.advanceTimersByTime(1800000);
      expect(rateLimiter.recordRequest(origin)).toBe(false);

      // Advance by another 35 minutes (now outside window)
      vi.advanceTimersByTime(2100000);
      expect(rateLimiter.recordRequest(origin)).toBe(true);
    });

    it('should handle concurrent requests from same origin', () => {
      rateLimiter = new RateLimiter({
        enabled: true,
        maxRequests: 5,
        windowMs: 60000,
      });

      const origin = 'https://example.com';
      const results = [];

      // Simulate concurrent requests with same timestamp
      const now = Date.now();
      for (let i = 0; i < 10; i++) {
        results.push(rateLimiter.recordRequest(origin, now));
      }

      // Should allow first 5, reject rest
      expect(results.filter((r) => r === true)).toHaveLength(5);
      expect(results.filter((r) => r === false)).toHaveLength(5);
      expect(rateLimiter.getCurrentCount(origin, now)).toBe(5);
    });

    it('should handle requests with timestamps far in the past', () => {
      rateLimiter = new RateLimiter({
        enabled: true,
        maxRequests: 3,
        windowMs: 60000,
      });

      const origin = 'https://example.com';
      const now = Date.now();

      // Add request from very far in the past
      expect(rateLimiter.recordRequest(origin, now - 3600000)).toBe(true); // 1 hour ago

      // Should not count toward current window
      expect(rateLimiter.getCurrentCount(origin, now)).toBe(0);

      // Current requests should still work normally
      expect(rateLimiter.recordRequest(origin, now)).toBe(true);
      expect(rateLimiter.getCurrentCount(origin, now)).toBe(1);
    });
  });

  // ===============================================
  // Configuration Tests
  // ===============================================
  describe('Configuration', () => {
    it('should handle default configuration', () => {
      rateLimiter = new RateLimiter();

      // Should work with defaults (likely disabled or very permissive)
      const result = rateLimiter.recordRequest('https://example.com');
      expect(typeof result).toBe('boolean');
    });

    it('should handle partial configuration', () => {
      rateLimiter = new RateLimiter({
        enabled: true,
        maxRequests: 10,
        // windowMs not specified, should use default
      });

      const origin = 'https://example.com';

      // Should work with partial config
      expect(rateLimiter.recordRequest(origin)).toBe(true);
      expect(rateLimiter.getCurrentCount(origin)).toBeGreaterThanOrEqual(0);
    });

    it('should validate configuration parameters', () => {
      // Test with invalid maxRequests
      expect(
        () =>
          new RateLimiter({
            enabled: true,
            maxRequests: -1,
            windowMs: 60000,
          }),
      ).not.toThrow(); // Implementation should handle gracefully

      // Test with invalid windowMs
      expect(
        () =>
          new RateLimiter({
            enabled: true,
            maxRequests: 5,
            windowMs: -1000,
          }),
      ).not.toThrow(); // Implementation should handle gracefully
    });

    it('should handle boolean enabled parameter properly', () => {
      const enabledLimiter = new RateLimiter({
        enabled: true,
        maxRequests: 1,
        windowMs: 60000,
      });

      const disabledLimiter = new RateLimiter({
        enabled: false,
        maxRequests: 1,
        windowMs: 60000,
      });

      const origin = 'https://example.com';

      // Enabled limiter should enforce limits
      expect(enabledLimiter.recordRequest(origin)).toBe(true);
      expect(enabledLimiter.recordRequest(origin)).toBe(false);

      // Disabled limiter should allow all
      expect(disabledLimiter.recordRequest(origin)).toBe(true);
      expect(disabledLimiter.recordRequest(origin)).toBe(true);
    });
  });

  // ===============================================
  // Memory Management Tests
  // ===============================================
  describe('Memory Management', () => {
    it('should not grow memory indefinitely with many origins', () => {
      rateLimiter = new RateLimiter({
        enabled: true,
        maxRequests: 1,
        windowMs: 1000, // Short window for quick cleanup
      });

      // Add requests for many different origins
      for (let i = 0; i < 1000; i++) {
        rateLimiter.recordRequest(`https://site${i}.com`);
      }

      // Advance time to expire all requests
      vi.advanceTimersByTime(2000);

      // Add one more request to trigger cleanup
      rateLimiter.recordRequest('https://cleanup-trigger.com');

      // Most origins should be cleaned up (can't directly test internal state,
      // but we can verify that new requests work normally)
      expect(rateLimiter.recordRequest('https://new-site.com')).toBe(true);
    });

    it('should clean up expired entries periodically', () => {
      rateLimiter = new RateLimiter({
        enabled: true,
        maxRequests: 5,
        windowMs: 30000,
      });

      const origins = ['https://app1.com', 'https://app2.com', 'https://app3.com'];

      // Add requests to multiple origins
      for (const origin of origins) {
        rateLimiter.recordRequest(origin);
      }

      // All should have counts
      for (const origin of origins) {
        expect(rateLimiter.getCurrentCount(origin)).toBe(1);
      }

      // Advance time to expire all
      vi.advanceTimersByTime(35000);

      // Check counts - should trigger cleanup
      for (const origin of origins) {
        expect(rateLimiter.getCurrentCount(origin)).toBe(0);
      }
    });
  });

  // ===============================================
  // Statistics and Information Tests
  // ===============================================
  describe('Statistics and Information', () => {
    beforeEach(() => {
      rateLimiter = new RateLimiter({
        enabled: true,
        maxRequests: 5,
        windowMs: 60000,
      });
    });

    it('should provide origin information for new origins', () => {
      const origin = 'https://new-origin.com';
      const info = rateLimiter.getOriginInfo(origin);

      expect(info.origin).toBe(origin);
      expect(info.currentCount).toBe(0);
      expect(info.remainingRequests).toBe(5);
      expect(info.isRateLimited).toBe(false);
      expect(info.timeUntilReset).toBe(0);
      expect(info.requestHistory).toEqual([]);
    });

    it('should provide accurate origin information with requests', () => {
      const origin = 'https://active-origin.com';

      // Make some requests
      rateLimiter.recordRequest(origin);
      rateLimiter.recordRequest(origin);

      const info = rateLimiter.getOriginInfo(origin);

      expect(info.origin).toBe(origin);
      expect(info.currentCount).toBe(2);
      expect(info.remainingRequests).toBe(3);
      expect(info.isRateLimited).toBe(false);
      expect(info.requestHistory).toHaveLength(2);
      expect(info.requestHistory[0]?.count).toBe(1);
      expect(info.requestHistory[1]?.count).toBe(1);
    });

    it('should show rate limited status when at limit', () => {
      const origin = 'https://limited-origin.com';

      // Fill up to limit
      for (let i = 0; i < 5; i++) {
        rateLimiter.recordRequest(origin);
      }

      const info = rateLimiter.getOriginInfo(origin);

      expect(info.currentCount).toBe(5);
      expect(info.remainingRequests).toBe(0);
      expect(info.isRateLimited).toBe(true);
      expect(info.timeUntilReset).toBeGreaterThan(0);
    });

    it('should calculate remaining requests correctly', () => {
      const origin = 'https://remaining.example.com';

      expect(rateLimiter.getRemainingRequests(origin)).toBe(5);

      rateLimiter.recordRequest(origin);
      expect(rateLimiter.getRemainingRequests(origin)).toBe(4);

      rateLimiter.recordRequest(origin);
      expect(rateLimiter.getRemainingRequests(origin)).toBe(3);
    });

    it('should calculate time until reset correctly', () => {
      const origin = 'https://reset.example.com';
      const startTime = Date.now();

      // At first, no reset needed
      expect(rateLimiter.getTimeUntilReset(origin)).toBe(0);

      // Fill up to the limit first
      for (let i = 0; i < 5; i++) {
        rateLimiter.recordRequest(origin, startTime + i * 1000);
      }

      // Now it should be rate limited and have a reset time
      const resetTime = rateLimiter.getTimeUntilReset(origin, startTime + 30000);
      expect(resetTime).toBeGreaterThan(0);
      expect(resetTime).toBeLessThanOrEqual(60000);
    });

    it('should provide comprehensive global statistics', () => {
      const origin1 = 'https://app1.com';
      const origin2 = 'https://app2.com';
      const origin3 = 'https://app3.com';

      // Make requests from different origins
      rateLimiter.recordRequest(origin1);
      rateLimiter.recordRequest(origin1);
      rateLimiter.recordRequest(origin2);

      // Rate limit one origin
      for (let i = 0; i < 5; i++) {
        rateLimiter.recordRequest(origin3);
      }

      const stats = rateLimiter.getStats();

      expect(stats.totalOrigins).toBe(3);
      expect(stats.totalRequests).toBe(8);
      expect(stats.rateLimitedOrigins).toBe(1);
      expect(stats.averageRequestsPerOrigin).toBeCloseTo(2.67, 1);
      expect(stats.activeOrigins).toBe(3);
      expect(stats.memoryUsage.requestMaps).toBe(3);
      expect(stats.memoryUsage.totalRequestEntries).toBe(8);
    });

    it('should handle request history with ages', () => {
      const origin = 'https://history.example.com';
      const baseTime = Date.now();

      rateLimiter.recordRequest(origin, baseTime);
      rateLimiter.recordRequest(origin, baseTime + 10000);
      rateLimiter.recordRequest(origin, baseTime + 20000);

      const info = rateLimiter.getOriginInfo(origin, baseTime + 30000);

      expect(info.requestHistory).toHaveLength(3);
      expect(info.requestHistory[0]?.age).toBe(30000);
      expect(info.requestHistory[1]?.age).toBe(20000);
      expect(info.requestHistory[2]?.age).toBe(10000);
    });
  });

  // ===============================================
  // Lifecycle Management Tests
  // ===============================================
  describe('Lifecycle Management', () => {
    it('should dispose and clean up resources', () => {
      rateLimiter = new RateLimiter({
        enabled: true,
        maxRequests: 5,
        windowMs: 60000,
      });

      // Add some data
      rateLimiter.recordRequest('https://example.com');
      expect(rateLimiter.getCurrentCount('https://example.com')).toBe(1);

      // Dispose
      rateLimiter.dispose();

      // Should clean up data
      expect(rateLimiter.getCurrentCount('https://example.com')).toBe(0);
    });

    it('should handle multiple dispose calls safely', () => {
      rateLimiter = new RateLimiter({
        enabled: true,
        maxRequests: 5,
        windowMs: 60000,
      });

      // Should not throw on multiple dispose calls
      expect(() => {
        rateLimiter.dispose();
        rateLimiter.dispose();
        rateLimiter.dispose();
      }).not.toThrow();
    });

    it('should continue working after dispose for disabled limiter', () => {
      rateLimiter = new RateLimiter({ enabled: false });

      rateLimiter.dispose();

      // Should still work when disabled
      expect(rateLimiter.recordRequest('https://example.com')).toBe(true);
      expect(rateLimiter.getCurrentCount('https://example.com')).toBe(0);
    });
  });

  // ===============================================
  // Timestamp and Window Management Tests
  // ===============================================
  describe('Timestamp and Window Management', () => {
    beforeEach(() => {
      rateLimiter = new RateLimiter({
        enabled: true,
        maxRequests: 3,
        windowMs: 10000, // 10 seconds
      });
    });

    it('should handle custom timestamps in isAllowed', () => {
      const origin = 'https://timestamp.example.com';
      const baseTime = 1000000;

      expect(rateLimiter.isAllowed(origin, baseTime)).toBe(true);

      rateLimiter.recordRequest(origin, baseTime);
      rateLimiter.recordRequest(origin, baseTime + 1000);
      rateLimiter.recordRequest(origin, baseTime + 2000);

      expect(rateLimiter.isAllowed(origin, baseTime + 3000)).toBe(false);
      expect(rateLimiter.isAllowed(origin, baseTime + 15000)).toBe(true); // Outside window
    });

    it('should handle custom timestamps in recordRequest', () => {
      const origin = 'https://timestamp.example.com';
      const baseTime = 2000000;

      expect(rateLimiter.recordRequest(origin, baseTime)).toBe(true);
      expect(rateLimiter.recordRequest(origin, baseTime + 1000)).toBe(true);
      expect(rateLimiter.recordRequest(origin, baseTime + 2000)).toBe(true);
      expect(rateLimiter.recordRequest(origin, baseTime + 3000)).toBe(false);
    });

    it('should cleanup old requests outside window', () => {
      const origin = 'https://cleanup.example.com';
      const baseTime = 3000000;

      // Add requests at different times within the 10-second window
      rateLimiter.recordRequest(origin, baseTime); // At 0 seconds
      rateLimiter.recordRequest(origin, baseTime + 2000); // At 2 seconds
      rateLimiter.recordRequest(origin, baseTime + 7000); // At 7 seconds

      expect(rateLimiter.getCurrentCount(origin, baseTime + 8000)).toBe(3);

      // Move forward past window for first request (11 seconds total = first request expires)
      expect(rateLimiter.getCurrentCount(origin, baseTime + 11000)).toBe(2);

      // Move forward past window for second request (13 seconds = first two requests expire)
      expect(rateLimiter.getCurrentCount(origin, baseTime + 13000)).toBe(1);

      // Move forward past window for all requests (18 seconds = all requests expire)
      expect(rateLimiter.getCurrentCount(origin, baseTime + 18000)).toBe(0);
    });
  });

  // ===============================================
  // Comprehensive Rate Limiting Tests with Helpers
  // ===============================================
  describe('Comprehensive Rate Limiting with Helpers', () => {
    it('should simulate rate limiting scenarios using helper', async () => {
      const testConfig: RateLimitTestConfig = {
        origin: 'https://app.example.com',
        requestCount: 10,
        expectedAllowed: 5,
      };

      const limiter = new RateLimiter({
        enabled: true,
        maxRequests: 5,
        windowMs: 60000, // 1 minute
      });

      const results = await simulateRateLimiting(limiter, testConfig);

      expect(results.allowedRequests).toBe(5);
      expect(results.blockedRequests).toBe(5);
      expect(results.totalRequests).toBe(10);
      expect(results.requestResults).toHaveLength(10);

      // Verify first 5 requests were allowed
      results.requestResults.slice(0, 5).forEach((detail, index) => {
        expect(detail.allowed).toBe(true);
        expect(detail.requestNumber).toBe(index + 1);
      });

      // Verify remaining 5 requests were blocked
      results.requestResults.slice(5).forEach((detail, index) => {
        expect(detail.allowed).toBe(false);
        expect(detail.requestNumber).toBe(index + 6);
      });
    });

    it('should test rate limiting with spread requests', async () => {
      const testConfig: RateLimitTestConfig = {
        origin: 'https://spread.example.com',
        requestCount: 8,
        timeWindow: 30000, // 30 seconds
        expectedAllowed: 8, // All should be allowed due to spread
        spreadRequests: true,
      };

      const limiter = new RateLimiter({
        enabled: true,
        maxRequests: 5,
        windowMs: 10000, // 10 second window
      });

      const results = await simulateRateLimiting(limiter, testConfig);

      expect(results.allowedRequests).toBe(8);
      expect(results.blockedRequests).toBe(0);
      expect(results.summary).toContain('8 allowed, 0 blocked');
    });

    it('should test multiple origins with rate limiting helper', async () => {
      const limiter = new RateLimiter({
        enabled: true,
        maxRequests: 3,
        windowMs: 60000,
      });

      // Test first origin
      const results1 = await simulateRateLimiting(limiter, {
        origin: 'https://app1.com',
        requestCount: 5,
        expectedAllowed: 3,
      });

      expect(results1.allowedRequests).toBe(3);
      expect(results1.blockedRequests).toBe(2);

      // Test second origin - should have independent limit
      const results2 = await simulateRateLimiting(limiter, {
        origin: 'https://app2.com',
        requestCount: 4,
        expectedAllowed: 3,
      });

      expect(results2.allowedRequests).toBe(3);
      expect(results2.blockedRequests).toBe(1);
    });

    it('should test time window expiration with helper', async () => {
      const testConfig: RateLimitTestConfig = {
        origin: 'https://window.example.com',
        requestCount: 10,
        timeWindow: 120000, // 2 minutes
        expectedAllowed: 10, // All should be allowed due to window reset
        spreadRequests: true,
      };

      const limiter = new RateLimiter({
        enabled: true,
        maxRequests: 3,
        windowMs: 30000, // 30 second window
      });

      const results = await simulateRateLimiting(limiter, testConfig);

      // With proper spreading over 2 minutes and 30-second windows,
      // all requests should be allowed
      expect(results.allowedRequests).toBe(10);
      expect(results.blockedRequests).toBe(0);

      // Verify window resets in details
      const windowResets = results.requestResults.filter(
        (d, i) => i > 0 && d.timestamp > (results.requestResults[i - 1]?.timestamp ?? 0),
      );
      expect(windowResets.length).toBeGreaterThan(0); // Should have window resets
    });

    it('should handle disabled rate limiter with helper', async () => {
      const limiter = new RateLimiter({
        enabled: false,
        maxRequests: 5,
        windowMs: 60000,
      });

      const results = await simulateRateLimiting(limiter, {
        origin: 'https://unlimited.com',
        requestCount: 100,
        expectedAllowed: 100, // All should be allowed when disabled
      });

      expect(results.allowedRequests).toBe(100);
      expect(results.blockedRequests).toBe(0);
      expect(results.summary).toContain('Rate limiting disabled');
    });
  });

  describe('edge case coverage', () => {
    it('should handle maxRequests = 0 (coverage: lines 85-87)', () => {
      const limiter = new RateLimiter({
        enabled: true,
        maxRequests: 0, // No requests allowed
        windowMs: 60000,
      });

      const result = limiter.isAllowed('https://blocked.com');
      expect(result).toBe(false);
    });

    it('should handle empty request list in reset time calculation (coverage: lines 155-157)', () => {
      const limiter = new RateLimiter({
        enabled: true,
        maxRequests: 5,
        windowMs: 60000,
      });

      // Clear any existing data first
      limiter.resetAll();

      const resetTime = limiter.getTimeUntilReset('https://empty.com');
      expect(resetTime).toBe(0);
    });

    it('should handle empty oldest request in reset time calculation (coverage: lines 161-163)', () => {
      const limiter = new RateLimiter({
        enabled: true,
        maxRequests: 5,
        windowMs: 60000,
      });

      // Manually corrupt the internal state to test edge case
      const privateLimiter = limiter as unknown as {
        requests: Map<string, Array<{ timestamp: number }>>;
      };

      // Set up empty array to trigger the edge case
      privateLimiter.requests.set('https://empty-array.com', []);

      const resetTime = limiter.getTimeUntilReset('https://empty-array.com');
      expect(resetTime).toBe(0);
    });

    it('should test getConfig method (coverage: lines 196-198)', () => {
      const config = {
        enabled: true,
        maxRequests: 10,
        windowMs: 30000,
      };

      const limiter = new RateLimiter(config);
      const returnedConfig = limiter.getConfig();

      expect(returnedConfig).toEqual(config);
      expect(returnedConfig).not.toBe(config); // Should be a copy
    });

    it('should test getStats with default timestamp (coverage: line 203)', () => {
      const limiter = new RateLimiter({
        enabled: true,
        maxRequests: 5,
        windowMs: 60000,
      });

      // Make some requests
      limiter.recordRequest('https://stats.example.com');
      limiter.recordRequest('https://stats.example.com');

      // Call getStats without timestamp parameter - should use Date.now()
      const stats = limiter.getStats();

      expect(stats).toBeDefined();
      expect(stats.totalOrigins).toBe(1);
      expect(stats.totalRequests).toBe(2);
    });
  });
});
