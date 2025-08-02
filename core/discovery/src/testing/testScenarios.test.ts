import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createSecurityTestScenario } from './testScenarios.js';
import { setupFakeTimers, cleanupFakeTimers } from './timingHelpers.js';

describe('Test Scenarios', () => {
  beforeEach(() => {
    setupFakeTimers();
  });

  afterEach(() => {
    cleanupFakeTimers();
  });

  describe('createSecurityTestScenario', () => {
    it('should test origin validation with various policies', () => {
      const scenario = createSecurityTestScenario({
        securityPolicy: {
          allowedOrigins: ['https://trusted-app.com', 'https://another-app.com'],
          blockedOrigins: ['https://malicious.com'],
          requireHttps: true,
          allowLocalhost: false,
        },
        testOrigins: [
          'https://trusted-app.com',
          'https://untrusted-app.com',
          'https://malicious.com',
          'http://insecure.com',
          'http://localhost:3000',
        ],
      });

      const results = scenario.testOriginValidation();

      expect(results.results).toHaveLength(5);

      // Check expected validation results
      const trustedResult = results.results.find((r) => r.origin === 'https://trusted-app.com');
      expect(trustedResult?.expectedValid).toBe(true);

      const untrustedResult = results.results.find((r) => r.origin === 'https://untrusted-app.com');
      expect(untrustedResult?.expectedValid).toBe(false);

      const maliciousResult = results.results.find((r) => r.origin === 'https://malicious.com');
      expect(maliciousResult?.expectedValid).toBe(false);

      const insecureResult = results.results.find((r) => r.origin === 'http://insecure.com');
      expect(insecureResult?.expectedValid).toBe(false);

      const localhostResult = results.results.find((r) => r.origin === 'http://localhost:3000');
      expect(localhostResult?.expectedValid).toBe(false);
    });

    it('should test rate limiting scenarios', () => {
      const scenario = createSecurityTestScenario({
        securityPolicy: {
          rateLimit: {
            enabled: true,
            maxRequests: 5,
            windowMs: 60000,
          },
        },
      });

      const rateLimitTest = scenario.testRateLimiting();

      expect(rateLimitTest).toBeDefined();
      expect(rateLimitTest.enabled).toBe(true);

      if (rateLimitTest.enabled && 'testRequests' in rateLimitTest) {
        expect(rateLimitTest.maxRequests).toBe(5);
        expect(rateLimitTest.windowMs).toBe(60000);
        expect(rateLimitTest.testRequests).toBeDefined();
        expect(rateLimitTest.testRequests.length).toBeGreaterThan(5);

        // Check that requests are properly marked as allowed/denied
        const allowedRequests = rateLimitTest.testRequests.filter((r) => r.expectedAllowed);
        const deniedRequests = rateLimitTest.testRequests.filter((r) => !r.expectedAllowed);
        expect(allowedRequests.length).toBe(5);
        expect(deniedRequests.length).toBeGreaterThan(0);
      }
    });

    it('should handle disabled rate limiting', () => {
      const scenario = createSecurityTestScenario({
        securityPolicy: {
          rateLimit: {
            enabled: false,
            maxRequests: 10,
            windowMs: 60000,
          },
        },
      });

      const rateLimitTest = scenario.testRateLimiting();

      expect(rateLimitTest).toBeDefined();
      expect(rateLimitTest.enabled).toBe(false);
      expect('maxRequests' in rateLimitTest).toBe(false);
      expect('windowMs' in rateLimitTest).toBe(false);
    });

    it('should test session tracking', () => {
      const scenario = createSecurityTestScenario({
        securityPolicy: {
          allowedOrigins: ['https://app1.com', 'https://app2.com'],
        },
      });

      const sessionTests = scenario.testSessionTracking();

      expect(sessionTests).toHaveLength(3);

      // Check scenario names and properties
      const normalSession = sessionTests.find((s) => s.name === 'Normal session');
      expect(normalSession?.expectedTracked).toBe(true);
      expect(normalSession?.origin).toBe('https://app1.com');

      const duplicateSession = sessionTests.find((s) => s.name === 'Duplicate session');
      expect(duplicateSession?.expectedTracked).toBe(false);
      expect(duplicateSession?.sessionId).toBe('duplicate-session');

      const crossOriginSession = sessionTests.find((s) => s.name === 'Cross-origin session');
      expect(crossOriginSession?.expectedTracked).toBe(true);
    });

    it('should run all security tests', () => {
      const scenario = createSecurityTestScenario({
        securityPolicy: {
          allowedOrigins: ['https://trusted.com'],
          requireHttps: true,
          rateLimit: {
            enabled: true,
            maxRequests: 10,
            windowMs: 60000,
          },
        },
      });

      const allTests = scenario.runAllTests();

      expect(allTests.originValidation).toBeDefined();
      expect(allTests.rateLimiting).toBeDefined();
      expect(allTests.sessionTracking).toBeDefined();
      expect(allTests.securityPolicy).toBeDefined();
    });

    it('should handle edge cases in origin validation', () => {
      // Test with no allowed origins (open policy)
      const openScenario = createSecurityTestScenario({
        securityPolicy: {
          requireHttps: false,
        },
        testOrigins: ['http://any-site.com', 'https://secure-site.com'],
      });

      const openResults = openScenario.testOriginValidation();

      // All origins should be valid when no restrictions
      for (const result of openResults.results) {
        expect(result.expectedValid).toBe(true);
      }

      // Test with localhost handling
      const localhostScenario = createSecurityTestScenario({
        securityPolicy: {
          requireHttps: true,
          allowLocalhost: true,
        },
        testOrigins: ['http://localhost:3000', 'http://external.com'],
      });

      const localhostResults = localhostScenario.testOriginValidation();

      const localhost = localhostResults.results.find((r) => r.origin.includes('localhost'));
      expect(localhost?.expectedValid).toBe(true);

      const external = localhostResults.results.find((r) => r.origin === 'http://external.com');
      expect(external?.expectedValid).toBe(false);
    });

    it('should handle session tracking with single origin', () => {
      const scenario = createSecurityTestScenario({
        securityPolicy: {
          allowedOrigins: ['https://single-app.com'],
        },
      });

      const sessionTests = scenario.testSessionTracking();

      // All sessions should use the same origin when only one is available
      for (const test of sessionTests) {
        expect(test.origin).toBe('https://single-app.com');
      }
    });

    it('should handle session tracking with no allowed origins', () => {
      const scenario = createSecurityTestScenario({
        securityPolicy: {},
        testOrigins: ['https://test1.com', 'https://test2.com'],
      });

      const sessionTests = scenario.testSessionTracking();

      expect(sessionTests).toHaveLength(3);
      // Should use test origins when no allowed origins specified
      expect(sessionTests[0]?.origin).toBe('https://test1.com');
    });
  });
});
