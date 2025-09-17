/**
 * Tests for security testing utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  testOriginValidation,
  simulateRateLimiting,
  testSessionTracking,
  simulateSecurityAttacks,
  createSecurityTestSuite,
  // createMalformedTestData,
  type OriginTestCase,
  type RateLimitTestConfig,
  type SessionTrackingScenario,
  type AttackSimulation,
  type RateLimiter,
  type SessionTracker,
} from './securityHelpers.js';
import { createTestSecurityPolicy } from './testUtils.js';
import { createSecurityPolicy } from '../security.js';
// biome-ignore lint/style/useImportType: MockEventTarget is instantiated with new, not just used as a type
import { MockEventTarget } from './MockEventTarget.js';
import { SessionTracker as SecuritySessionTracker, RateLimiter as SecurityRateLimiter } from '../security.js';
import type { SessionOptions } from '../types/security.js';
import { setupFakeTimers, cleanupFakeTimers } from './timingHelpers.js';

// Create a wrapper to adapt SecuritySessionTracker to the test interface
function createSessionTrackerAdapter(options?: Partial<SessionOptions>): SessionTracker {
  const fullOptions: SessionOptions | undefined = options
    ? {
        maxAge: options.maxAge ?? 5 * 60 * 1000,
        cleanupInterval: options.cleanupInterval ?? 60 * 1000,
        maxSessionsPerOrigin: options.maxSessionsPerOrigin ?? 100,
      }
    : undefined;
  const tracker = new SecuritySessionTracker(fullOptions);
  return {
    trackSession: (origin: string, sessionId: string) => {
      return tracker.trackSession(origin, sessionId);
    },
    hasSession: (origin: string, sessionId: string) => {
      return tracker.hasSession(origin, sessionId);
    },
  };
}

// Create a wrapper to adapt SecurityRateLimiter to the test interface
function createRateLimiterAdapter(config: { maxRequests: number; windowMs: number }): RateLimiter {
  const rateLimiter: SecurityRateLimiter = new SecurityRateLimiter({
    enabled: true,
    maxRequests: config.maxRequests,
    windowMs: config.windowMs,
  });
  return {
    recordRequest: (origin: string) => {
      // biome-ignore lint/suspicious/noExplicitAny: Need to cast due to type conflict
      const allowed = (rateLimiter as any).isAllowed(origin);
      if (allowed) {
        // biome-ignore lint/suspicious/noExplicitAny: Need to cast due to type conflict
        (rateLimiter as any).recordRequest(origin);
      }
      return allowed;
    },
    isRateLimited: (origin: string) => {
      // biome-ignore lint/suspicious/noExplicitAny: Need to cast due to type conflict
      return !(rateLimiter as any).isAllowed(origin);
    },
    reset: (origin?: string) => {
      // biome-ignore lint/suspicious/noExplicitAny: Need to cast due to type conflict
      (rateLimiter as any).reset(origin);
    },
  };
}

describe('securityHelpers', () => {
  beforeEach(() => {
    setupFakeTimers();
  });

  afterEach(() => {
    cleanupFakeTimers();
  });

  describe('testOriginValidation', () => {
    it('should test basic origin validation', async () => {
      const policy = createSecurityPolicy.strict();
      const testCases: OriginTestCase[] = [
        {
          origin: 'https://trusted.com',
          expectedValid: true,
          description: 'Trusted HTTPS origin',
        },
        {
          origin: 'http://insecure.com',
          expectedValid: false,
          expectedReason: 'HTTP not allowed',
          description: 'Insecure HTTP origin',
        },
        {
          origin: 'https://untrusted.com',
          expectedValid: false,
          expectedReason: 'Not in allowlist',
          description: 'HTTPS but not trusted',
        },
      ];

      const results = await testOriginValidation(policy, testCases);

      expect(results).toHaveProperty('passed');
      expect(results).toHaveProperty('failed');
      expect(results).toHaveProperty('summary');
      expect(results.passed + results.failed).toBe(3);
    });

    it('should handle empty test cases', async () => {
      const policy = createTestSecurityPolicy({ requireHttps: false, allowLocalhost: true });
      const results = await testOriginValidation(policy, []);

      expect(results.passed + results.failed).toBe(0);
      expect(results.passed).toBe(0);
      expect(results.failed).toBe(0);
    });

    it('should test localhost origins', async () => {
      const policy = createTestSecurityPolicy({ requireHttps: false, allowLocalhost: true });
      const testCases: OriginTestCase[] = [
        {
          origin: 'http://localhost:3000',
          expectedValid: true,
          description: 'Localhost HTTP allowed in development',
        },
        {
          origin: 'http://127.0.0.1:8080',
          expectedValid: true,
          description: 'Local IP allowed in development',
        },
      ];

      const results = await testOriginValidation(policy, testCases);

      expect(results.passed).toBe(2);
      expect(results.failed).toBe(0);
    });

    it('should test extension origins', async () => {
      const policy = createTestSecurityPolicy({ requireHttps: false, allowLocalhost: true });
      const testCases: OriginTestCase[] = [
        {
          origin: 'chrome-extension://valid-extension-id',
          expectedValid: true,
          description: 'Valid extension origin',
        },
        {
          origin: 'moz-extension://firefox-extension-id',
          expectedValid: true,
          description: 'Firefox extension origin',
        },
      ];

      const results = await testOriginValidation(policy, testCases);

      expect(results.passed).toBe(2);
    });

    it('should provide detailed failure information', async () => {
      const policy = createSecurityPolicy.strict();
      const testCases: OriginTestCase[] = [
        {
          origin: 'ftp://invalid-protocol.com',
          expectedValid: false,
          expectedReason: 'Invalid protocol',
          description: 'FTP protocol not allowed',
        },
      ];

      const results = await testOriginValidation(policy, testCases);

      // The test should pass (correctly identify invalid origin)
      expect(results.passed).toBe(1);
      expect(results.failed).toBe(0);
      expect(results.results[0]?.passed).toBe(true);
      expect(results.results[0]).toHaveProperty('reason');
    });
  });

  describe('simulateRateLimiting', () => {
    it('should simulate basic rate limiting', async () => {
      const rateLimiter = createRateLimiterAdapter({
        maxRequests: 5,
        windowMs: 1000,
      });

      const config: RateLimitTestConfig = {
        origin: 'https://example.com',
        requestCount: 10,
        expectedAllowed: 5,
        timeWindow: 1000,
      };

      const results = await simulateRateLimiting(rateLimiter, config);

      expect(results.totalRequests).toBe(10);
      expect(results.allowedRequests).toBe(5);
      expect(results.blockedRequests).toBe(5);
      expect(results.rateLimitingActive).toBe(true);
    });

    it('should test rate limiting with spread requests', async () => {
      const rateLimiter = createRateLimiterAdapter({
        maxRequests: 3,
        windowMs: 1000,
      });

      const config: RateLimitTestConfig = {
        origin: 'https://spread.example.com',
        requestCount: 6,
        expectedAllowed: 6, // Should all be allowed when spread over time
        spreadRequests: true,
        timeWindow: 2000,
      };

      // Run the simulation with manual timer advancement
      const resultsPromise = simulateRateLimiting(rateLimiter, config);

      // Advance timers for each spread request
      for (let i = 1; i < 6; i++) {
        await vi.advanceTimersByTimeAsync(2000 / 6);
      }

      const results = await resultsPromise;

      expect(results.allowedRequests).toBeGreaterThan(3);
    });

    it('should handle burst requests', async () => {
      const rateLimiter = createRateLimiterAdapter({
        maxRequests: 2,
        windowMs: 1000,
      });

      const config: RateLimitTestConfig = {
        origin: 'https://burst.example.com',
        requestCount: 5,
        expectedAllowed: 2,
        spreadRequests: false, // All at once
      };

      const results = await simulateRateLimiting(rateLimiter, config);

      expect(results.allowedRequests).toBe(2);
      expect(results.blockedRequests).toBe(3);
    });

    it('should test rate limiting reset after window', async () => {
      const rateLimiter = createRateLimiterAdapter({
        maxRequests: 3,
        windowMs: 500,
      });

      // First batch
      const config1: RateLimitTestConfig = {
        origin: 'https://reset.example.com',
        requestCount: 3,
        expectedAllowed: 3,
      };

      const results1 = await simulateRateLimiting(rateLimiter, config1);
      expect(results1.allowedRequests).toBe(3);

      // Advance time past window
      await vi.advanceTimersByTimeAsync(600);

      // Second batch should be allowed
      const config2: RateLimitTestConfig = {
        origin: 'https://reset.example.com',
        requestCount: 2,
        expectedAllowed: 2,
      };

      const results2 = await simulateRateLimiting(rateLimiter, config2);
      expect(results2.allowedRequests).toBe(2);
    });

    it('should handle multiple origins independently', async () => {
      const rateLimiter = createRateLimiterAdapter({
        maxRequests: 2,
        windowMs: 1000,
      });

      const config1: RateLimitTestConfig = {
        origin: 'https://origin1.com',
        requestCount: 3,
        expectedAllowed: 2,
      };

      const config2: RateLimitTestConfig = {
        origin: 'https://origin2.com',
        requestCount: 3,
        expectedAllowed: 2,
      };

      const results1 = await simulateRateLimiting(rateLimiter, config1);
      const results2 = await simulateRateLimiting(rateLimiter, config2);

      expect(results1.allowedRequests).toBe(2);
      expect(results2.allowedRequests).toBe(2);
    });
  });

  describe('testSessionTracking', () => {
    it('should test basic session tracking', async () => {
      const sessionTracker = createSessionTrackerAdapter();
      const scenarios: SessionTrackingScenario[] = [
        {
          name: 'New Session',
          origin: 'https://app.com',
          sessionId: 'session-1',
          expectedTracked: true,
        },
        {
          name: 'Duplicate Session',
          origin: 'https://app.com',
          sessionId: 'session-1',
          expectedTracked: false,
          isDuplicate: true,
        },
        {
          name: 'Different Origin Same Session',
          origin: 'https://other-app.com',
          sessionId: 'session-1',
          expectedTracked: true,
        },
      ];

      const results = await testSessionTracking(sessionTracker, scenarios);

      expect(results.passed).toBe(3);
      expect(results.failed).toBe(0);
    });

    it('should detect session replay attempts', async () => {
      const sessionTracker = createSessionTrackerAdapter();
      const scenarios: SessionTrackingScenario[] = [
        {
          name: 'Original Session',
          origin: 'https://secure.com',
          sessionId: 'replay-test',
          expectedTracked: true,
        },
        {
          name: 'Replay Attempt',
          origin: 'https://secure.com',
          sessionId: 'replay-test',
          expectedTracked: false,
          isDuplicate: true,
        },
      ];

      const results = await testSessionTracking(sessionTracker, scenarios);

      // All tests should pass (correctly identifying original and replay)
      expect(results.passed).toBe(2);
      expect(results.failed).toBe(0);

      // Verify the actual tracking behavior
      expect(results.results[0]?.actual).toBe(true); // Original tracked
      expect(results.results[1]?.actual).toBe(false); // Replay not tracked
    });

    it('should handle session cleanup', async () => {
      const tracker = new SecuritySessionTracker({
        maxAge: 100, // Short max age for testing
        cleanupInterval: 100,
        maxSessionsPerOrigin: 10,
      });

      const sessionTracker = {
        trackSession: (origin: string, sessionId: string) => {
          return tracker.trackSession(origin, sessionId);
        },
        hasSession: (origin: string, sessionId: string) => {
          return tracker.hasSession(origin, sessionId);
        },
      };

      // Track initial session
      const result1 = await sessionTracker.trackSession('https://cleanup.example.com', 'cleanup-session');
      expect(result1).toBe(true);

      // Advance time past max age
      await vi.advanceTimersByTimeAsync(200);

      // Manually trigger cleanup
      // Note: cleanup method was removed, sessions expire based on maxAge
      // tracker.cleanup();

      // Same session should be trackable again after cleanup
      const result2 = await sessionTracker.trackSession('https://cleanup.example.com', 'cleanup-session');
      expect(result2).toBe(true);
    });

    it('should track sessions per origin', async () => {
      const sessionTracker = createSessionTrackerAdapter();
      const scenarios: SessionTrackingScenario[] = [
        {
          name: 'Origin 1 Session',
          origin: 'https://app1.com',
          sessionId: 'shared-session-id',
          expectedTracked: true,
        },
        {
          name: 'Origin 2 Same Session ID',
          origin: 'https://app2.com',
          sessionId: 'shared-session-id',
          expectedTracked: true, // Different origin, should be allowed
        },
      ];

      const results = await testSessionTracking(sessionTracker, scenarios);

      expect(results.passed).toBe(2);
      expect(results.results.every((r) => r.passed)).toBe(true);
    });
  });

  describe('simulateSecurityAttacks', () => {
    it('should simulate replay attack', async () => {
      const sessionTracker = createSessionTrackerAdapter();
      const attack: AttackSimulation = {
        type: 'replay',
        params: {
          sessionId: 'test-session',
          origin: 'https://attacker.com',
          replayCount: 5,
        },
        expectedDefense: {
          blocked: true,
          mechanism: 'session-tracking',
        },
      };

      const results = await simulateSecurityAttacks(sessionTracker, [attack]);

      expect(results.results[0]?.attackType).toBe('replay');
      expect(results.successfullyBlocked).toBe(1);
      expect(results.failedToBlock).toBe(0);
    });

    it('should simulate flood attack', async () => {
      const rateLimiter = createRateLimiterAdapter({
        maxRequests: 10,
        windowMs: 1000,
      });
      const attack: AttackSimulation = {
        type: 'flood',
        params: {
          origin: 'https://flooder.com',
          requestCount: 100,
          timeWindow: 1000,
        },
        expectedDefense: {
          blocked: true,
          mechanism: 'rate-limiting',
        },
      };

      const results = await simulateSecurityAttacks(rateLimiter, [attack]);

      expect(results.results[0]?.attackType).toBe('flood');
      expect(results.successfullyBlocked).toBeGreaterThan(0);
    });

    it('should simulate origin spoofing attack', async () => {
      const originValidator = {
        validateOrigin: async (origin: string) => {
          // Only trust specific origins
          const trusted = ['https://trusted-app.com'];
          return { valid: trusted.includes(origin), reason: 'not in allowlist' };
        },
      };
      const attack: AttackSimulation = {
        type: 'spoofing',
        params: {
          fakeOrigin: 'https://malicious.com',
        },
        expectedDefense: {
          blocked: true,
          mechanism: 'origin-validation',
        },
      };

      const results = await simulateSecurityAttacks(originValidator, [attack]);

      expect(results.results[0]?.attackType).toBe('spoofing');
      expect(results.results[0]?.blocked).toBe(true);
    });

    it('should simulate CSRF attack', async () => {
      const originValidator = {
        validateOrigin: async (origin: string) => {
          // Only trust specific origins
          const trusted = ['https://trusted.com'];
          return { valid: trusted.includes(origin), reason: 'not in allowlist' };
        },
      };
      const attack: AttackSimulation = {
        type: 'csrf',
        params: {
          fakeOrigin: 'https://evil.com',
        },
        expectedDefense: {
          blocked: true,
          mechanism: 'origin-validation',
        },
      };

      const results = await simulateSecurityAttacks(originValidator, [attack]);

      expect(results.results[0]?.attackType).toBe('csrf');
      expect(results.successfullyBlocked).toBe(1);
    });

    it('should simulate injection attack', async () => {
      const mockComponent = {
        simulateDiscoveryRequest: (req: unknown) => {
          // Should throw or reject malformed requests
          if (typeof req !== 'object' || req === null || !('type' in req)) {
            throw new Error('Invalid request');
          }
        },
      };
      const attack: AttackSimulation = {
        type: 'injection',
        params: {
          payloads: ['<script>alert("xss")</script>', '"; DROP TABLE users; --', 'process.env.SECRET'],
        },
        expectedDefense: {
          blocked: true,
          mechanism: 'input-sanitization',
        },
      };

      const results = await simulateSecurityAttacks(mockComponent, [attack]);

      expect(results.results[0]?.attackType).toBe('injection');
      expect(results.successfullyBlocked).toBe(1);
    });
  });

  describe('createSecurityTestSuite', () => {
    it('should create comprehensive security test suite', () => {
      const suite = createSecurityTestSuite({
        name: 'Discovery Protocol Security Tests',
        includeOriginValidation: true,
        includeRateLimiting: true,
        includeSessionTracking: true,
        includeAttackSimulation: true,
      });

      expect(suite).toHaveProperty('testOriginSecurity');
      expect(suite).toHaveProperty('testRateLimitingSecurity');
      expect(suite).toHaveProperty('testSessionTrackingSecurity');
      expect(suite).toHaveProperty('testInputValidationSecurity');
      expect(suite).toHaveProperty('runAll');
    });

    it('should create selective test suite', () => {
      const suite = createSecurityTestSuite({
        name: 'Origin-Only Tests',
        includeOriginValidation: true,
        includeRateLimiting: false,
        includeSessionTracking: false,
        includeAttackSimulation: false,
      });

      expect(suite).toHaveProperty('testOriginSecurity');
      expect(suite).toHaveProperty('testRateLimitingSecurity');
      expect(suite).toHaveProperty('testSessionTrackingSecurity');
      expect(suite).toHaveProperty('testAttackSimulation');
    });

    it('should include custom security tests', () => {
      const customTest = vi.fn().mockResolvedValue({ passed: true });

      const suite = createSecurityTestSuite({
        name: 'Custom Tests',
        customTests: [
          {
            name: 'Custom Security Test',
            test: customTest,
          },
        ],
      });

      expect(suite).toHaveProperty('runAll');
      // Custom tests are integrated into the suite
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle invalid origins gracefully', async () => {
      const policy = createSecurityPolicy.strict();
      const testCases: OriginTestCase[] = [
        {
          origin: 'not-a-url',
          expectedValid: false,
          description: 'Invalid URL format',
        },
        {
          origin: '',
          expectedValid: false,
          description: 'Empty origin',
        },
      ];

      const results = await testOriginValidation(policy, testCases);

      expect(results.passed).toBe(2); // Both tests should pass (correctly identify invalid origins)
      expect(results.failed).toBe(0);
    });

    it('should handle rate limiter errors', async () => {
      const faultyRateLimiter = {
        recordRequest: vi.fn().mockRejectedValue(new Error('Rate limiter error')),
      };

      const config: RateLimitTestConfig = {
        origin: 'https://example.com',
        requestCount: 5,
        expectedAllowed: 0, // Expect errors
      };

      await expect(simulateRateLimiting(faultyRateLimiter as RateLimiter, config)).rejects.toThrow(
        'Rate limiter error',
      );
    });

    it('should handle session tracker failures', async () => {
      const faultyTracker = {
        hasSession: vi.fn().mockRejectedValue(new Error('Tracker error')),
        trackSession: vi.fn().mockRejectedValue(new Error('Tracker error')),
      };

      const scenarios: SessionTrackingScenario[] = [
        {
          name: 'Error Test',
          origin: 'https://error.example.com',
          sessionId: 'error-session',
          expectedTracked: false,
        },
      ];

      const results = await testSessionTracking(faultyTracker as unknown as SessionTracker, scenarios);

      expect(results.failed).toBeGreaterThan(0);
      expect(results.passed).toBe(0);
    });

    it('should handle attack simulation failures', async () => {
      const faultyTarget = {
        dispatchEvent: vi.fn().mockImplementation(() => {
          throw new Error('Event dispatch failed');
        }),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };

      const attack: AttackSimulation = {
        type: 'replay',
        params: { sessionId: 'test' },
        expectedDefense: { blocked: true },
      };

      const results = await simulateSecurityAttacks(faultyTarget as unknown as MockEventTarget, [attack]);

      expect(results.failedToBlock).toBeGreaterThan(0);
      expect(results.results[0]?.blocked).toBe(false);
    });
  });
});
