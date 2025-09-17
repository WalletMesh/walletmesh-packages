/**
 * Additional tests for security testing utilities - covering missing lines
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createConsoleSpy } from './consoleMocks.js';
import {
  testOriginValidation,
  simulateRateLimiting,
  testSessionTracking,
  simulateSecurityAttacks,
  createSecurityTestSuite,
  createMalformedTestData,
  type OriginTestCase,
  type RateLimitTestConfig,
  type SessionTrackingScenario,
  type AttackSimulation,
  type SessionTracker,
} from './securityHelpers.js';
import { createTestSecurityPolicy } from './testUtils.js';
import { RateLimiter as SecurityRateLimiter } from '../security.js';
import { setupFakeTimers, cleanupFakeTimers } from './timingHelpers.js';

describe('securityHelpers - additional coverage', () => {
  beforeEach(() => {
    setupFakeTimers();
  });

  afterEach(() => {
    cleanupFakeTimers();
  });

  describe('createSecurityTestSuite - missing coverage', () => {
    it('should run origin security test with component that supports validation', async () => {
      const mockComponent = {
        validateOrigin: vi.fn().mockResolvedValue({ valid: true, reason: '' }),
      };

      const suite = createSecurityTestSuite(mockComponent, {
        testOrigins: ['https://example.com'],
      });

      await suite.testOriginSecurity();
      expect(mockComponent.validateOrigin).toHaveBeenCalled();
    });

    it('should skip origin security test when component does not support it', async () => {
      const mockComponent = {}; // No validateOrigin method
      const consoleWarnSpy = createConsoleSpy({ methods: ['warn'], mockFn: () => vi.fn() });

      const suite = createSecurityTestSuite(mockComponent);
      await suite.testOriginSecurity();

      expect(consoleWarnSpy.warn).toHaveBeenCalledWith(
        'Component does not support origin validation testing',
      );
      consoleWarnSpy.restore();
    });

    it('should run rate limiting security test with component that supports it', async () => {
      const mockComponent = {
        recordRequest: vi
          .fn()
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)
          .mockResolvedValue(false), // Block after 5 requests
      };

      const suite = createSecurityTestSuite(mockComponent, {
        rateLimitConfig: { maxRequests: 5, windowMs: 1000 },
        testOrigins: ['https://example.com'],
      });

      await suite.testRateLimitingSecurity();
      expect(mockComponent.recordRequest).toHaveBeenCalled();
    });

    it('should skip rate limiting test when component does not support it', async () => {
      const mockComponent = {}; // No recordRequest method
      const consoleWarnSpy = createConsoleSpy({ methods: ['warn'], mockFn: () => vi.fn() });

      const suite = createSecurityTestSuite(mockComponent);
      await suite.testRateLimitingSecurity();

      expect(consoleWarnSpy.warn).toHaveBeenCalledWith('Component does not support rate limiting testing');
      consoleWarnSpy.restore();
    });

    it('should run session tracking security test with component that supports it', async () => {
      const mockComponent = {
        trackSession: vi
          .fn()
          .mockResolvedValueOnce(true) // First track succeeds
          .mockResolvedValueOnce(false) // Duplicate fails
          .mockResolvedValueOnce(true), // Different origin succeeds
      };

      const suite = createSecurityTestSuite(mockComponent, {
        testOrigins: ['https://test1.com', 'https://test2.com'],
      });

      await suite.testSessionTrackingSecurity();
      expect(mockComponent.trackSession).toHaveBeenCalled();
    });

    it('should skip session tracking test when component does not support it', async () => {
      const mockComponent = {}; // No trackSession method
      const consoleWarnSpy = createConsoleSpy({ methods: ['warn'], mockFn: () => vi.fn() });

      const suite = createSecurityTestSuite(mockComponent);
      await suite.testSessionTrackingSecurity();

      expect(consoleWarnSpy.warn).toHaveBeenCalledWith('Component does not support session tracking testing');
      consoleWarnSpy.restore();
    });

    it('should run input validation security test', async () => {
      const mockComponent = {
        simulateDiscoveryRequest: vi.fn().mockImplementation((req) => {
          // Should handle malformed input gracefully, not throw
          if (typeof req !== 'object' || req === null) {
            // Log or ignore but don't throw
            return;
          }
        }),
      };

      const suite = createSecurityTestSuite(mockComponent);
      await suite.testInputValidationSecurity();

      expect(mockComponent.simulateDiscoveryRequest).toHaveBeenCalled();
    });

    it('should run attack simulation test', async () => {
      const mockComponent = {
        trackSession: vi
          .fn()
          .mockResolvedValueOnce(true) // First succeeds
          .mockResolvedValueOnce(false), // Replay fails
        validateOrigin: vi.fn().mockResolvedValue({ valid: false, reason: 'spoofed' }),
      };

      const suite = createSecurityTestSuite(mockComponent, {
        testOrigins: ['https://example.com'],
      });

      await suite.testAttackSimulation();
      // Test should pass as attacks are properly blocked
    });

    it('should run all security tests', async () => {
      const mockComponent = {
        validateOrigin: vi.fn().mockImplementation(async (origin) => {
          // Return invalid for malicious sites and fake origins (for spoofing test)
          if (origin.includes('malicious') || origin.includes('fake')) {
            return { valid: false, reason: 'Blocked origin' };
          }
          return { valid: true };
        }),
        recordRequest: vi
          .fn()
          .mockResolvedValueOnce(true) // Request 1
          .mockResolvedValueOnce(true) // Request 2
          .mockResolvedValueOnce(true) // Request 3
          .mockResolvedValueOnce(true) // Request 4
          .mockResolvedValueOnce(true) // Request 5
          .mockResolvedValue(false), // Requests 6+ are blocked
        trackSession: vi
          .fn()
          .mockResolvedValueOnce(true) // First track succeeds (session tracking test)
          .mockResolvedValueOnce(false) // Duplicate fails (session tracking test)
          .mockResolvedValueOnce(true) // Different origin succeeds (session tracking test)
          .mockResolvedValueOnce(true) // First track for replay attack (attack simulation)
          .mockResolvedValueOnce(false), // Replay fails (attack simulation)
        simulateDiscoveryRequest: vi.fn(),
      };

      const suite = createSecurityTestSuite(mockComponent);

      const testOriginSpy = vi.spyOn(suite, 'testOriginSecurity');
      const testRateLimitSpy = vi.spyOn(suite, 'testRateLimitingSecurity');
      const testSessionSpy = vi.spyOn(suite, 'testSessionTrackingSecurity');
      const testInputSpy = vi.spyOn(suite, 'testInputValidationSecurity');
      const testAttackSpy = vi.spyOn(suite, 'testAttackSimulation');

      await suite.runAll();

      expect(testOriginSpy).toHaveBeenCalled();
      expect(testRateLimitSpy).toHaveBeenCalled();
      expect(testSessionSpy).toHaveBeenCalled();
      expect(testInputSpy).toHaveBeenCalled();
      expect(testAttackSpy).toHaveBeenCalled();
    });
  });

  describe('createMalformedTestData', () => {
    it('should generate malformed discovery request data', () => {
      const malformed = createMalformedTestData('capability-request');

      expect(malformed).toContain(null);
      expect(malformed).toContain(undefined);
      expect(malformed).toContain('');
      expect(malformed).toContain('invalid-string');
      expect(malformed).toContain(123);
      expect(malformed).toContainEqual({ type: 'invalid-type' });
      expect(malformed).toContainEqual({ type: 'discovery:wallet:request' }); // Missing required fields
    });

    it('should generate malformed discovery response data', () => {
      const malformed = createMalformedTestData('capability-response');

      expect(malformed).toContain(null);
      expect(malformed).toContain(undefined);
      expect(malformed).toContainEqual({ type: 'discovery:wallet:response' }); // Missing required fields
      expect(malformed).toContainEqual({ type: 'discovery:wallet:response', sessionId: null });
    });

    it('should generate malformed origin data', () => {
      const malformed = createMalformedTestData('origin');

      expect(malformed).toContain(null);
      expect(malformed).toContain(undefined);
      expect(malformed).toContain('');
      expect(malformed).toContain('not-a-url');
      expect(malformed).toContain('javascript:alert(1)');
      expect(malformed).toContain('https://');
      expect(malformed).toContain('https://example.com:99999');
    });

    it('should generate malformed session ID data', () => {
      const malformed = createMalformedTestData('session-id');

      expect(malformed).toContain(null);
      expect(malformed).toContain(undefined);
      expect(malformed).toContain('');
      expect(malformed).toContain(123);
      expect(malformed).toContain('a'); // Too short
      expect(malformed.some((m) => typeof m === 'string' && m.length > 999)).toBe(true); // Too long
      expect(malformed).toContain('../../etc/passwd');
    });

    it('should generate malformed security policy data', () => {
      const malformed = createMalformedTestData('security-policy');

      expect(malformed).toContain(null);
      expect(malformed).toContain(undefined);
      expect(malformed).toContain('invalid-policy');
      expect(malformed).toContainEqual({ allowedOrigins: 'should-be-array' });
      expect(malformed).toContainEqual({ rateLimit: { enabled: true, maxRequests: -1 } });
    });

    it('should throw for unknown malformed data type', () => {
      expect(() => createMalformedTestData('unknown-type' as 'capability-request')).toThrow(
        'Unknown malformed data type',
      );
    });
  });

  describe('determineExpectedValidity', () => {
    it('should determine validity based on blocked origins', async () => {
      const policy = createTestSecurityPolicy({
        blockedOrigins: ['https://blocked.com'],
      });

      const results = await testOriginValidation(policy, ['https://blocked.com', 'https://allowed.com']);

      // First origin should be correctly identified as invalid (blocked)
      expect(results.results[0]?.actual).toBe(false);
      expect(results.results[0]?.expected).toBe(false);
      expect(results.results[0]?.passed).toBe(true);

      // Second origin should be valid
      expect(results.results[1]?.actual).toBe(true);
      expect(results.results[1]?.expected).toBe(true);
      expect(results.results[1]?.passed).toBe(true);
    });

    it('should determine validity based on allowed origins list', async () => {
      const policy = createTestSecurityPolicy({
        allowedOrigins: ['https://allowed1.com', 'https://allowed2.com'],
      });

      const results = await testOriginValidation(policy, ['https://allowed1.com', 'https://not-allowed.com']);

      expect(results.results[0]?.passed).toBe(true);
      expect(results.results[1]?.passed).toBe(true); // Correctly identified as invalid
    });

    it('should determine validity based on HTTPS requirement', async () => {
      const policy = createTestSecurityPolicy({
        requireHttps: true,
        allowLocalhost: false,
      });

      const results = await testOriginValidation(policy, ['https://secure.com', 'http://insecure.com']);

      expect(results.results[0]?.actual).toBe(true);
      expect(results.results[1]?.actual).toBe(false);
    });

    it('should determine validity for localhost', async () => {
      const policy = createTestSecurityPolicy({
        requireHttps: true,
        allowLocalhost: true,
      });

      const results = await testOriginValidation(policy, ['http://localhost:3000', 'https://localhost:3000']);

      // Both should be valid when localhost is allowed
      expect(results.results[0]?.actual).toBe(true);
      expect(results.results[1]?.actual).toBe(true);
    });

    it('should handle localhost disallowed', async () => {
      const policy = createTestSecurityPolicy({
        requireHttps: false,
        allowLocalhost: false,
      });

      const results = await testOriginValidation(policy, ['http://localhost:3000']);

      expect(results.results[0]?.actual).toBe(false);
      expect(results.results[0]?.expected).toBe(false);
      expect(results.results[0]?.passed).toBe(true); // Correctly identified as invalid
    });
  });

  describe('simulateInjectionAttack', () => {
    it('should return false when component has no simulateDiscoveryRequest method', async () => {
      const component = {}; // No simulateDiscoveryRequest method

      const attack: AttackSimulation = {
        type: 'injection',
        params: {},
        expectedDefense: { blocked: false }, // Expect it not to be blocked
      };

      const results = await simulateSecurityAttacks(component, [attack]);

      expect(results.results[0]?.blocked).toBe(false);
      expect(results.results[0]?.passed).toBe(true); // Matches expected defense
    });

    it('should return true when component blocks malformed inputs', async () => {
      const component = {
        simulateDiscoveryRequest: vi.fn().mockImplementation((req) => {
          if (!req || typeof req !== 'object' || !('type' in req)) {
            throw new Error('Invalid request');
          }
        }),
      };

      const attack: AttackSimulation = {
        type: 'injection',
        params: {},
        expectedDefense: { blocked: true },
      };

      const results = await simulateSecurityAttacks(component, [attack]);

      expect(results.results[0]?.blocked).toBe(true);
      expect(results.successfullyBlocked).toBe(1);
    });
  });

  describe('simulateSpoofingAttack', () => {
    it('should return false when component has no validateOrigin method', async () => {
      const component = {}; // No validateOrigin method

      const attack: AttackSimulation = {
        type: 'spoofing',
        params: { fakeOrigin: 'https://spoofed.com' },
        expectedDefense: { blocked: false }, // Expect it not to be blocked
      };

      const results = await simulateSecurityAttacks(component, [attack]);

      expect(results.results[0]?.blocked).toBe(false);
    });
  });

  describe('simulateFloodAttack - edge cases', () => {
    it('should handle flood attack when component has no recordRequest method', async () => {
      const component = {}; // No recordRequest method

      const attack: AttackSimulation = {
        type: 'flood',
        params: { origin: 'https://example.com', requestCount: 10 },
        expectedDefense: { blocked: false },
      };

      const results = await simulateSecurityAttacks(component, [attack]);

      expect(results.results[0]?.blocked).toBe(false);
      expect(results.results[0]?.response).toBe('No rate limiting available');
    });
  });

  describe('simulateReplayAttack - edge cases', () => {
    it('should handle replay attack when component has no trackSession method', async () => {
      const component = {}; // No trackSession method

      const attack: AttackSimulation = {
        type: 'replay',
        params: { sessionId: 'test', origin: 'https://example.com' },
        expectedDefense: { blocked: false },
      };

      const results = await simulateSecurityAttacks(component, [attack]);

      expect(results.results[0]?.blocked).toBe(false);
    });
  });

  describe('attack simulation unknown type', () => {
    it('should handle unknown attack type', async () => {
      const component = {};

      const attack: AttackSimulation = {
        type: 'unknown-attack' as 'replay',
        params: {},
        expectedDefense: { blocked: true },
      };

      const results = await simulateSecurityAttacks(component, [attack]);

      expect(results.failedToBlock).toBe(1);
      expect(results.results[0]?.response).toContain('Unknown attack type');
    });
  });

  describe('origin validation custom validator error', () => {
    it('should handle custom validator errors', async () => {
      const errorValidator = {
        validateOrigin: vi.fn().mockRejectedValue(new Error('Validator error')),
      };

      const policy = createTestSecurityPolicy();
      const testCases: OriginTestCase[] = [
        {
          origin: 'https://example.com',
          expectedValid: true,
        },
      ];

      const results = await testOriginValidation(policy, testCases, errorValidator);

      expect(results.failed).toBe(1);
      expect(results.results[0]?.passed).toBe(false);
      expect(results.results[0]?.reason).toContain('Validator error');
    });
  });

  describe('session tracking edge cases', () => {
    it('should handle trackSession returning true vs undefined', async () => {
      const mockTracker = {
        trackSession: vi
          .fn()
          .mockResolvedValueOnce(true) // First call returns true
          .mockResolvedValueOnce(false), // Second call returns false
        hasSession: vi.fn().mockResolvedValue(false),
      };

      const scenarios: SessionTrackingScenario[] = [
        {
          name: 'First Track',
          origin: 'https://example.com',
          sessionId: 'session-1',
          expectedTracked: true,
        },
        {
          name: 'Duplicate Track',
          origin: 'https://example.com',
          sessionId: 'session-1',
          expectedTracked: false,
          isDuplicate: true,
        },
      ];

      const results = await testSessionTracking(mockTracker as SessionTracker, scenarios);

      expect(results.passed).toBe(2);
    });
  });

  describe('rate limiting with fake timers', () => {
    it('should handle spread requests with fake timer simulation', async () => {
      const rateLimiter: SecurityRateLimiter = new SecurityRateLimiter({
        enabled: true,
        maxRequests: 3,
        windowMs: 100, // Short window for testing
      });

      const config: RateLimitTestConfig = {
        origin: 'https://spread.example.com',
        requestCount: 4,
        expectedAllowed: 4, // All should be allowed when spread
        spreadRequests: true,
        timeWindow: 150,
      };

      // Create an adapter to match the test interface
      const rateLimiterAdapter = {
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

      const results = await simulateRateLimiting(rateLimiterAdapter, config);

      // With spreading, more requests should be allowed
      expect(results.allowedRequests).toBe(4);
    });
  });
});
