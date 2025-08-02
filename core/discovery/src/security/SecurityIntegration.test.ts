/**
 * Integration tests for security components working together.
 * Tests complex scenarios involving multiple security layers and edge cases.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OriginValidator } from './OriginValidator.js';
import { RateLimiter } from './RateLimiter.js';
import { SessionTracker } from './SessionTracker.js';
import { createSecurityPolicy } from './createSecurityPolicy.js';
import { setupFakeTimers, cleanupFakeTimers } from '../testing/timingHelpers.js';
import type { SecurityPolicy } from '../core/types.js';

describe('Security Integration', () => {
  let originValidator: OriginValidator;
  let rateLimiter: RateLimiter;
  let sessionTracker: SessionTracker;

  beforeEach(() => {
    setupFakeTimers();
  });

  afterEach(() => {
    cleanupFakeTimers();
  });

  describe('Multi-Layer Security Validation', () => {
    beforeEach(() => {
      const policy: SecurityPolicy = createSecurityPolicy.production({
        allowedOrigins: ['https://trusted-app.com'],
        blockedOrigins: ['https://malicious-site.com'],
      });

      originValidator = new OriginValidator(policy);
      rateLimiter = new RateLimiter({
        enabled: true,
        maxRequests: 3,
        windowMs: 60000,
      });
      sessionTracker = new SessionTracker();
    });

    it('should pass all security checks for valid requests', () => {
      const origin = 'https://trusted-app.com';
      const sessionId = 'valid-session-123';

      // Check origin validation
      const originResult = originValidator.validateEventOrigin(origin, origin);
      expect(originResult.valid).toBe(true);

      // Check rate limiting
      const rateResult = rateLimiter.recordRequest(origin);
      expect(rateResult).toBe(true);

      // Check session tracking
      const sessionResult = sessionTracker.trackSession(origin, sessionId);
      expect(sessionResult).toBe(true);
    });

    it('should fail at origin validation layer for blocked origins', () => {
      const origin = 'https://malicious-site.com';
      const sessionId = 'attempted-session-456';

      // Should fail at origin validation
      const originResult = originValidator.validateEventOrigin(origin, origin);
      expect(originResult.valid).toBe(false);
      expect(originResult.reason).toContain('blocked');

      // Even if we proceed with other checks, the origin failure should block the request
      const rateResult = rateLimiter.recordRequest(origin);
      expect(rateResult).toBe(true); // Rate limiter doesn't know about origin policy

      const sessionResult = sessionTracker.trackSession(origin, sessionId);
      expect(sessionResult).toBe(true); // Session tracker doesn't know about origin policy
    });

    it('should fail at rate limiting layer when limits exceeded', () => {
      const origin = 'https://trusted-app.com';

      // First, verify origin is valid
      const originResult = originValidator.validateEventOrigin(origin, origin);
      expect(originResult.valid).toBe(true);

      // Exhaust rate limit
      for (let i = 0; i < 3; i++) {
        const result = rateLimiter.recordRequest(origin);
        expect(result).toBe(true);
      }

      // Next request should be rate limited
      const rateLimitedResult = rateLimiter.recordRequest(origin);
      expect(rateLimitedResult).toBe(false);

      // Session tracking should still work independently
      const sessionResult = sessionTracker.trackSession(origin, 'session-123');
      expect(sessionResult).toBe(true);
    });

    it('should fail at session tracking layer for replay attacks', () => {
      const origin = 'https://trusted-app.com';
      const sessionId = 'replay-session-789';

      // First, verify origin is valid
      const originResult = originValidator.validateEventOrigin(origin, origin);
      expect(originResult.valid).toBe(true);

      // First request should pass rate limiting
      const rateResult = rateLimiter.recordRequest(origin);
      expect(rateResult).toBe(true);

      // First session use should succeed
      const firstSessionResult = sessionTracker.trackSession(origin, sessionId);
      expect(firstSessionResult).toBe(true);

      // Replay attempt should fail
      const replayResult = sessionTracker.trackSession(origin, sessionId);
      expect(replayResult).toBe(false);
    });
  });

  describe('Cross-Origin Security Isolation', () => {
    beforeEach(() => {
      const policy: SecurityPolicy = createSecurityPolicy.development();
      originValidator = new OriginValidator(policy);
      rateLimiter = new RateLimiter({
        enabled: true,
        maxRequests: 2,
        windowMs: 60000,
      });
      sessionTracker = new SessionTracker();
    });

    it('should maintain separate rate limits per origin', () => {
      const origin1 = 'https://app1.com';
      const origin2 = 'https://app2.com';

      // Exhaust rate limit for origin1
      expect(rateLimiter.recordRequest(origin1)).toBe(true);
      expect(rateLimiter.recordRequest(origin1)).toBe(true);
      expect(rateLimiter.recordRequest(origin1)).toBe(false); // Rate limited

      // origin2 should still have its own limit
      expect(rateLimiter.recordRequest(origin2)).toBe(true);
      expect(rateLimiter.recordRequest(origin2)).toBe(true);
      expect(rateLimiter.recordRequest(origin2)).toBe(false); // Rate limited
    });

    it('should maintain separate session namespaces per origin', () => {
      const origin1 = 'https://app1.com';
      const origin2 = 'https://app2.com';
      const sessionId = 'shared-session-id';

      // Same session ID should work for both origins
      expect(sessionTracker.trackSession(origin1, sessionId)).toBe(true);
      expect(sessionTracker.trackSession(origin2, sessionId)).toBe(true);

      // But replays within the same origin should fail
      expect(sessionTracker.trackSession(origin1, sessionId)).toBe(false);
      expect(sessionTracker.trackSession(origin2, sessionId)).toBe(false);
    });

    it('should validate origins independently', () => {
      const policy: SecurityPolicy = createSecurityPolicy.strict({
        allowedOrigins: ['https://trusted-app.com'],
        blockedOrigins: ['https://malicious-site.com'],
      });
      const validator = new OriginValidator(policy);

      const trustedOrigin = 'https://trusted-app.com';
      const blockedOrigin = 'https://malicious-site.com';
      const unknownOrigin = 'https://unknown-app.com';

      expect(validator.validateEventOrigin(trustedOrigin, trustedOrigin).valid).toBe(true);
      expect(validator.validateEventOrigin(blockedOrigin, blockedOrigin).valid).toBe(false);
      expect(validator.validateEventOrigin(unknownOrigin, unknownOrigin).valid).toBe(false);
    });
  });

  describe('Security Component Error Handling', () => {
    it('should handle invalid origins gracefully in OriginValidator', () => {
      const policy: SecurityPolicy = createSecurityPolicy.strict();
      const validator = new OriginValidator(policy);

      // Test various invalid origins
      const invalidOrigins = [
        'not-a-url',
        'ftp://invalid-protocol.com',
        'javascript:alert("xss")',
        '',
        'http://127.0.0.1:80/path/../../../etc/passwd',
      ];

      for (const invalidOrigin of invalidOrigins) {
        const result = validator.validateEventOrigin(invalidOrigin, invalidOrigin);
        expect(result.valid).toBe(false);
        expect(result.reason).toBeDefined();
      }
    });

    it('should handle edge cases in RateLimiter', () => {
      const limiter = new RateLimiter({
        enabled: true,
        maxRequests: 1,
        windowMs: 1000,
      });

      const origin = 'https://edge-case.com';

      // Test with very short window and immediate requests
      expect(limiter.recordRequest(origin)).toBe(true);
      expect(limiter.recordRequest(origin)).toBe(false);

      // Advance time to clear window
      vi.advanceTimersByTime(1001);

      // Should allow new requests
      expect(limiter.recordRequest(origin)).toBe(true);
    });

    it('should handle edge cases in SessionTracker', () => {
      const tracker = new SessionTracker({
        maxAge: 1000, // Very short session lifetime
        maxSessionsPerOrigin: 2,
      });

      const origin = 'https://edge-case.com';

      // Test session limit enforcement
      expect(tracker.trackSession(origin, 'session-1')).toBe(true);
      expect(tracker.trackSession(origin, 'session-2')).toBe(true);

      // Should still accept new sessions (LRU eviction)
      expect(tracker.trackSession(origin, 'session-3')).toBe(true);

      // Test session expiration
      vi.advanceTimersByTime(1001);
      tracker.cleanup();

      // Expired sessions should be cleaned up
      const stats = tracker.getMemoryStats();
      expect(stats.totalSessions).toBe(0);
    });
  });

  describe('Security Policy Edge Cases', () => {
    it('should handle permissive policy correctly', () => {
      const policy = createSecurityPolicy.permissive();
      const validator = new OriginValidator(policy);

      // Should allow HTTP and localhost
      expect(validator.validateEventOrigin('http://localhost:3000', 'http://localhost:3000').valid).toBe(
        true,
      );
      expect(
        validator.validateEventOrigin('http://insecure-site.com', 'http://insecure-site.com').valid,
      ).toBe(true);
      expect(validator.validateEventOrigin('https://secure-site.com', 'https://secure-site.com').valid).toBe(
        true,
      );
    });

    it('should handle development policy correctly', () => {
      const policy = createSecurityPolicy.development();
      const validator = new OriginValidator(policy);

      // Should allow localhost but not insecure HTTP
      expect(validator.validateEventOrigin('http://localhost:3000', 'http://localhost:3000').valid).toBe(
        true,
      );
      expect(validator.validateEventOrigin('http://127.0.0.1:8080', 'http://127.0.0.1:8080').valid).toBe(
        true,
      );
      expect(validator.validateEventOrigin('https://secure-site.com', 'https://secure-site.com').valid).toBe(
        true,
      );
    });

    it('should handle custom policy with complex rules', () => {
      const policy = createSecurityPolicy.custom({
        requireHttps: true,
        allowLocalhost: true,
        allowedOrigins: ['https://specific-app.com', 'http://localhost:3000'],
        blockedOrigins: ['https://bad-actor.com'],
        rateLimit: {
          enabled: true,
          maxRequests: 5,
          windowMs: 30000,
        },
      });

      const validator = new OriginValidator(policy);

      // Should allow explicitly allowed origins
      expect(
        validator.validateEventOrigin('https://specific-app.com', 'https://specific-app.com').valid,
      ).toBe(true);
      expect(validator.validateEventOrigin('http://localhost:3000', 'http://localhost:3000').valid).toBe(
        true,
      );

      // Should block explicitly blocked origins
      expect(validator.validateEventOrigin('https://bad-actor.com', 'https://bad-actor.com').valid).toBe(
        false,
      );

      // Should block origins not in allowlist
      expect(validator.validateEventOrigin('https://unknown-app.com', 'https://unknown-app.com').valid).toBe(
        false,
      );
    });
  });

  describe('Memory and Performance Edge Cases', () => {
    it('should handle high-volume session tracking efficiently', () => {
      const tracker = new SessionTracker({
        maxSessionsPerOrigin: 100,
        maxAge: 60000,
      });

      const origin = 'https://high-volume-app.com';

      // Track many sessions
      for (let i = 0; i < 150; i++) {
        const result = tracker.trackSession(origin, `session-${i}`);
        expect(result).toBe(true);
      }

      // Check memory stats
      const stats = tracker.getMemoryStats();
      expect(stats.totalSessions).toBeLessThanOrEqual(100); // Should respect limit
      expect(stats.totalOrigins).toBe(1);
    });

    it('should handle cleanup of expired sessions correctly', () => {
      const tracker = new SessionTracker({
        maxAge: 1000,
        cleanupInterval: 500,
      });

      const origin = 'https://cleanup-test.com';

      // Add sessions at different times
      tracker.trackSession(origin, 'old-session', Date.now() - 2000);
      tracker.trackSession(origin, 'recent-session', Date.now() - 500);
      tracker.trackSession(origin, 'current-session', Date.now());

      // Advance time to trigger expiration
      vi.advanceTimersByTime(1500);
      tracker.cleanup();

      // Check that only recent sessions remain
      const stats = tracker.getOriginStats(origin);
      expect(stats.activeSessions).toBeLessThan(3);
    });

    it('should handle rate limiting cleanup correctly', () => {
      const limiter = new RateLimiter({
        enabled: true,
        maxRequests: 10,
        windowMs: 1000,
      });

      const origin = 'https://rate-limit-test.com';

      // Make many requests
      for (let i = 0; i < 15; i++) {
        limiter.recordRequest(origin);
      }

      // Advance time to clear window
      vi.advanceTimersByTime(1001);

      // Should allow new requests after window expires
      expect(limiter.recordRequest(origin)).toBe(true);
    });
  });

  describe('Concurrent Access Patterns', () => {
    it('should handle concurrent session tracking safely', () => {
      const tracker = new SessionTracker({
        maxSessionsPerOrigin: 20, // Set higher limit to avoid eviction
      });
      const origin = 'https://concurrent-app.com';

      // Simulate concurrent session creation attempts with unique session IDs
      const results = [];
      for (let i = 0; i < 10; i++) {
        results.push(tracker.trackSession(origin, `concurrent-session-${i}`));
      }

      // All initial sessions should succeed
      expect(results.every((result) => result === true)).toBe(true);

      // Replay attempts with the same session IDs should all fail
      const replayResults = [];
      for (let i = 0; i < 10; i++) {
        const replayResult = tracker.trackSession(origin, `concurrent-session-${i}`);
        replayResults.push(replayResult);
      }

      // All replay attempts should fail
      expect(replayResults.every((result) => result === false)).toBe(true);
    });

    it('should handle concurrent rate limiting correctly', () => {
      const limiter = new RateLimiter({
        enabled: true,
        maxRequests: 5,
        windowMs: 60000,
      });

      const origin = 'https://concurrent-rate-test.com';

      // Make concurrent requests
      const results = [];
      for (let i = 0; i < 10; i++) {
        results.push(limiter.recordRequest(origin));
      }

      // Should allow first 5, reject rest
      const allowedCount = results.filter((result) => result === true).length;
      const rejectedCount = results.filter((result) => result === false).length;

      expect(allowedCount).toBe(5);
      expect(rejectedCount).toBe(5);
    });
  });
});
