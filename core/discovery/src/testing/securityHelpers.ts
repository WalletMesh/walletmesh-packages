/**
 * Security testing patterns and utilities for discovery protocol security validation.
 *
 * These utilities provide comprehensive testing support for security features in the
 * discovery protocol, including origin validation, rate limiting, session tracking,
 * and attack simulation. Designed to ensure robust security implementations across
 * all discovery protocol components.
 *
 * @example Origin validation testing:
 * ```typescript
 * import { testOriginValidation } from '@walletmesh/discovery/testing';
 *
 * const results = await testOriginValidation(securityPolicy, [
 *   'https://trusted-app.com',
 *   'https://malicious-site.com',
 *   'http://localhost:3000'
 * ]);
 * ```
 *
 * @example Rate limiting simulation:
 * ```typescript
 * import { simulateRateLimiting } from '@walletmesh/discovery/testing';
 *
 * const rateLimitResults = await simulateRateLimiting(
 *   rateLimiter,
 *   'https://origin.example.com',
 *   10 // Number of requests to simulate
 * );
 * ```
 *
 * @module securityHelpers
 * @category Testing
 * @since 1.0.0
 */

import type { SecurityPolicy, OriginValidationResult } from '../core/types.js';
import { createTestSecurityPolicy } from './testUtils.js';
import { expect, vi } from 'vitest';

/**
 * Origin validation test case configuration.
 */
export interface OriginTestCase {
  /** The origin to test */
  origin: string;
  /** Whether this origin should be considered valid */
  expectedValid: boolean;
  /** Expected reason for validation failure (if invalid) */
  expectedReason?: string;
  /** Description of this test case */
  description?: string;
}

/**
 * Rate limiting test configuration.
 */
export interface RateLimitTestConfig {
  /** Origin to test rate limiting for */
  origin: string;
  /** Number of requests to simulate */
  requestCount: number;
  /** Time window for requests in milliseconds */
  timeWindow?: number;
  /** Expected number of allowed requests */
  expectedAllowed: number;
  /** Whether to spread requests over time */
  spreadRequests?: boolean;
}

/**
 * Session tracking test scenario.
 */
export interface SessionTrackingScenario {
  /** Name of the scenario for reporting */
  name: string;
  /** Origin for the session */
  origin: string;
  /** Session ID to test */
  sessionId: string;
  /** Whether this session should be tracked */
  expectedTracked: boolean;
  /** Whether this is a duplicate session test */
  isDuplicate?: boolean;
}

/**
 * Security attack simulation configuration.
 */
export interface AttackSimulation {
  /** Type of attack to simulate */
  type: 'replay' | 'flood' | 'spoofing' | 'csrf' | 'injection';
  /** Attack parameters */
  params: Record<string, unknown>;
  /** Expected defense behavior */
  expectedDefense: {
    /** Whether the attack should be blocked */
    blocked: boolean;
    /** Expected blocking mechanism */
    mechanism?: string;
    /** Expected error or response */
    response?: string;
  };
}

/**
 * Generic interface for components that validate origins.
 */
export interface OriginValidator {
  /** Validate an origin against security policy */
  validateOrigin(origin: string): OriginValidationResult | Promise<OriginValidationResult>;
}

/**
 * Generic interface for rate limiting components.
 */
export interface RateLimiter {
  /** Record a request and return whether it's allowed */
  recordRequest(origin: string): boolean | Promise<boolean>;
  /** Check if an origin is currently rate limited */
  isRateLimited?(origin: string): boolean | Promise<boolean>;
  /** Reset rate limiting for an origin */
  reset?(origin?: string): void | Promise<void>;
}

/**
 * Generic interface for session tracking components.
 */
export interface SessionTracker {
  /** Track a session for an origin - returns true if new session, false if replay */
  trackSession(origin: string, sessionId: string): boolean | Promise<boolean>;
  /** Check if a session is already tracked */
  hasSession(origin: string, sessionId: string): boolean | Promise<boolean>;
  /** Get all tracked sessions for an origin */
  getSessions?(origin: string): string[] | Promise<string[]>;
  /** Clear sessions for an origin */
  clearSessions?(origin?: string): void | Promise<void>;
}

/**
 * Test origin validation with multiple origins and scenarios.
 *
 * This function tests origin validation logic against a variety of origins
 * to ensure proper security policy enforcement. It validates both allowed
 * and blocked origins according to the security policy.
 *
 * @param policy - The security policy to test against
 * @param origins - Array of origins to test, or test cases with expected results
 * @param validator - Optional custom validator (uses built-in validation if not provided)
 * @returns Promise with validation test results
 * @example
 * ```typescript
 * const policy = createTestSecurityPolicy({
 *   allowedOrigins: ['https://trusted.com'],
 *   blockedOrigins: ['https://malicious.com'],
 *   requireHttps: true
 * });
 *
 * const results = await testOriginValidation(policy, [
 *   { origin: 'https://trusted.com', expectedValid: true },
 *   { origin: 'https://malicious.com', expectedValid: false },
 *   { origin: 'http://insecure.com', expectedValid: false, expectedReason: 'HTTP not allowed' }
 * ]);
 *
 * expect(results.passed).toBe(2);
 * expect(results.failed).toBe(1);
 * ```
 * @category Testing
 * @since 1.0.0
 */
export async function testOriginValidation(
  policy: SecurityPolicy,
  origins: string[] | OriginTestCase[],
  validator?: OriginValidator,
): Promise<{
  passed: number;
  failed: number;
  results: Array<{
    origin: string;
    expected: boolean;
    actual: boolean;
    reason?: string;
    passed: boolean;
    description?: string;
  }>;
  summary: string;
}> {
  // Convert string array to test cases if needed
  const testCases: OriginTestCase[] = origins.map((origin) =>
    typeof origin === 'string'
      ? { origin, expectedValid: determineExpectedValidity(origin, policy) }
      : origin,
  );

  const results = [];
  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    try {
      let validationResult: OriginValidationResult;

      if (validator) {
        validationResult = await validator.validateOrigin(testCase.origin);
      } else {
        // Use built-in validation logic
        const { validateOrigin } = await import('../security/OriginValidator.js');
        validationResult = validateOrigin(testCase.origin, policy);
      }

      const actualValid = validationResult.valid;
      const testPassed = actualValid === testCase.expectedValid;

      // Check reason if specified
      let reasonMatches = true;
      if (!testPassed && testCase.expectedReason && validationResult.reason) {
        reasonMatches = validationResult.reason.includes(testCase.expectedReason);
      }

      const finalPassed = testPassed && reasonMatches;

      results.push({
        origin: testCase.origin,
        expected: testCase.expectedValid,
        actual: actualValid,
        ...(validationResult.reason && { reason: validationResult.reason }),
        passed: finalPassed,
        ...(testCase.description && { description: testCase.description }),
      });

      if (finalPassed) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      results.push({
        origin: testCase.origin,
        expected: testCase.expectedValid,
        actual: false,
        reason: error instanceof Error ? error.message : String(error),
        passed: false,
        ...(testCase.description && { description: testCase.description }),
      });
      failed++;
    }
  }

  const summary = `Origin validation: ${passed} passed, ${failed} failed out of ${testCases.length} tests`;

  return { passed, failed, results, summary };
}

/**
 * Simulate rate limiting behavior with multiple requests.
 *
 * This function simulates a series of requests to test rate limiting behavior,
 * including burst requests, sustained load, and recovery after rate limits.
 *
 * @param rateLimiter - The rate limiter to test
 * @param config - Configuration for the rate limiting test
 * @returns Promise with rate limiting test results
 * @example
 * ```typescript
 * const rateLimiter = new RateLimiter({ maxRequests: 5, windowMs: 60000 });
 *
 * const results = await simulateRateLimiting(rateLimiter, {
 *   origin: 'https://app.example.com',
 *   requestCount: 10,
 *   expectedAllowed: 5,
 *   spreadRequests: false // Burst test
 * });
 *
 * expect(results.allowedRequests).toBe(5);
 * expect(results.blockedRequests).toBe(5);
 * ```
 * @category Testing
 * @since 1.0.0
 */
export async function simulateRateLimiting(
  rateLimiter: RateLimiter,
  config: RateLimitTestConfig,
): Promise<{
  totalRequests: number;
  allowedRequests: number;
  blockedRequests: number;
  requestResults: Array<{
    requestNumber: number;
    timestamp: number;
    allowed: boolean;
  }>;
  rateLimitingActive: boolean;
  summary: string;
}> {
  const { origin, requestCount, spreadRequests = false, timeWindow = 1000 } = config;
  const requestResults = [];
  let allowedRequests = 0;
  let blockedRequests = 0;

  const startTime = Date.now();

  for (let i = 1; i <= requestCount; i++) {
    // Add delay between requests if spreading is enabled
    if (spreadRequests && i > 1) {
      const delayMs = timeWindow / requestCount;
      // Use vi.advanceTimersByTimeAsync for fake timers compatibility
      await vi.advanceTimersByTimeAsync(delayMs);
    }

    const timestamp = Date.now();
    const allowed = await rateLimiter.recordRequest(origin);

    requestResults.push({
      requestNumber: i,
      timestamp: timestamp - startTime,
      allowed,
    });

    if (allowed) {
      allowedRequests++;
    } else {
      blockedRequests++;
    }
  }

  const rateLimitingActive = blockedRequests > 0;

  // Check if rate limiter is disabled (all requests allowed and none blocked)
  const isDisabled = allowedRequests === requestCount && blockedRequests === 0 && requestCount > 10;

  const summary = isDisabled
    ? 'Rate limiting disabled'
    : `Rate limiting: ${allowedRequests} allowed, ${blockedRequests} blocked out of ${requestCount} requests`;

  return {
    totalRequests: requestCount,
    allowedRequests,
    blockedRequests,
    requestResults,
    rateLimitingActive,
    summary,
  };
}

/**
 * Test session tracking behavior across multiple scenarios.
 *
 * This function tests session tracking logic including normal sessions,
 * duplicate detection, cross-origin sessions, and session cleanup.
 *
 * @param sessionTracker - The session tracker to test
 * @param scenarios - Array of session tracking scenarios to test
 * @returns Promise with session tracking test results
 * @example
 * ```typescript
 * const tracker = new SessionTracker();
 *
 * const results = await testSessionTracking(tracker, [
 *   {
 *     name: 'Normal session',
 *     origin: 'https://app.com',
 *     sessionId: 'session-1',
 *     expectedTracked: true
 *   },
 *   {
 *     name: 'Duplicate session',
 *     origin: 'https://app.com',
 *     sessionId: 'session-1',
 *     expectedTracked: false,
 *     isDuplicate: true
 *   }
 * ]);
 * ```
 * @category Testing
 * @since 1.0.0
 */
export async function testSessionTracking(
  sessionTracker: SessionTracker,
  scenarios: SessionTrackingScenario[],
): Promise<{
  passed: number;
  failed: number;
  results: Array<{
    scenario: string;
    origin: string;
    sessionId: string;
    expected: boolean;
    actual: boolean;
    passed: boolean;
  }>;
  summary: string;
}> {
  const results = [];
  let passed = 0;
  let failed = 0;

  for (const scenario of scenarios) {
    try {
      // Track the session - returns true if new, false if duplicate
      const trackResult = await sessionTracker.trackSession(scenario.origin, scenario.sessionId);

      // For tracking tests, we want to know if the session was successfully tracked (new)
      // expectedTracked true means we expect it to be a new session
      // expectedTracked false means we expect it to be a duplicate
      const testPassed = trackResult === scenario.expectedTracked;

      results.push({
        scenario: scenario.name,
        origin: scenario.origin,
        sessionId: scenario.sessionId,
        expected: scenario.expectedTracked,
        actual: trackResult,
        passed: testPassed,
      });

      if (testPassed) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      results.push({
        scenario: scenario.name,
        origin: scenario.origin,
        sessionId: scenario.sessionId,
        expected: scenario.expectedTracked,
        actual: false,
        passed: false,
      });
      failed++;
    }
  }

  const summary = `Session tracking: ${passed} passed, ${failed} failed out of ${scenarios.length} tests`;

  const typedResults = results.map((result) => ({
    ...result,
    actual: result.actual === undefined ? false : result.actual,
  }));

  return { passed, failed, results: typedResults, summary };
}

/**
 * Generate malformed test data for security testing.
 *
 * This utility generates various types of malformed data that can be used
 * to test error handling and security validation in discovery protocol
 * components.
 *
 * @param type - The type of malformed data to generate
 * @returns Array of malformed test data objects
 * @example
 * ```typescript
 * const malformedRequests = createMalformedTestData('capability-request');
 * const malformedOrigins = createMalformedTestData('origin');
 *
 * // Test that components handle malformed data gracefully
 * for (const malformed of malformedRequests) {
 *   expect(() => validateRequest(malformed)).not.toThrow();
 * }
 * ```
 * @category Testing
 * @since 1.0.0
 */
export function createMalformedTestData(
  type: 'capability-request' | 'capability-response' | 'origin' | 'session-id' | 'security-policy',
): unknown[] {
  switch (type) {
    case 'capability-request':
      return [
        null,
        undefined,
        '',
        'invalid-string',
        123,
        [],
        { type: 'invalid-type' },
        { type: 'discovery:wallet:request' }, // Missing required fields
        { type: 'discovery:wallet:request', sessionId: null },
        { type: 'discovery:wallet:request', sessionId: 'valid', required: null },
        { type: 'discovery:wallet:request', sessionId: 'valid', required: { chains: 'invalid' } },
        {
          type: 'discovery:wallet:request',
          sessionId: 'valid',
          required: { chains: [], features: [], interfaces: [] },
          // Missing initiatorInfo
        },
      ];

    case 'capability-response':
      return [
        null,
        undefined,
        '',
        'invalid-string',
        123,
        [],
        { type: 'invalid-type' },
        { type: 'discovery:wallet:response' }, // Missing required fields
        { type: 'discovery:wallet:response', sessionId: null },
        { type: 'discovery:wallet:response', sessionId: 'valid', name: null },
        { type: 'discovery:wallet:response', sessionId: 'valid', name: 'Test', matched: null },
        {
          type: 'discovery:wallet:response',
          sessionId: 'valid',
          name: 'Test',
          matched: { required: 'invalid' }, // Should be object
        },
      ];

    case 'origin':
      return [
        null,
        undefined,
        '',
        'not-a-url',
        'ftp://invalid-protocol.com',
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
        'file:///etc/passwd',
        'chrome-extension://',
        'moz-extension://',
        'about:blank',
        'https://',
        'https://.',
        'https://.com',
        'https://com.',
        'https://example..com',
        'https://example.com:99999',
        'https://example.com:-1',
        'https://example.com:abc',
      ];

    case 'session-id':
      return [
        null,
        undefined,
        '',
        123,
        [],
        {},
        'a', // Too short
        'a'.repeat(1000), // Too long
        '../../etc/passwd',
        '<script>alert(1)</script>',
        'session\nid\rwith\twhitespace',
        'session id with spaces',
        'session-id-with-null\x00bytes',
      ];

    case 'security-policy':
      return [
        null,
        undefined,
        'invalid-policy',
        { allowedOrigins: 'should-be-array' },
        { allowedOrigins: [123, 456] }, // Should be strings
        { blockedOrigins: 'should-be-array' },
        { requireHttps: 'should-be-boolean' },
        { allowLocalhost: 'should-be-boolean' },
        { rateLimit: 'should-be-object' },
        { rateLimit: { enabled: 'should-be-boolean' } },
        { rateLimit: { enabled: true, maxRequests: 'should-be-number' } },
        { rateLimit: { enabled: true, maxRequests: -1 } }, // Negative
        { rateLimit: { enabled: true, maxRequests: 10, windowMs: 'should-be-number' } },
      ];

    default:
      throw new Error(`Unknown malformed data type: ${type}`);
  }
}

/**
 * Simulate common security attacks against discovery protocol components.
 *
 * This function simulates various types of attacks to test the security
 * defenses of discovery protocol implementations.
 *
 * @param component - The component to test (must have appropriate interface methods)
 * @param attacks - Array of attack simulations to run
 * @returns Promise with attack simulation results
 * @example
 * ```typescript
 * const attacks = [
 *   {
 *     type: 'replay',
 *     params: { sessionId: 'session-123', origin: 'https://app.com' },
 *     expectedDefense: { blocked: true, mechanism: 'session-tracking' }
 *   },
 *   {
 *     type: 'flood',
 *     params: { origin: 'https://attacker.com', requestCount: 100 },
 *     expectedDefense: { blocked: true, mechanism: 'rate-limiting' }
 *   }
 * ];
 *
 * const results = await simulateSecurityAttacks(announcer, attacks);
 * ```
 * @category Testing
 * @since 1.0.0
 */
export async function simulateSecurityAttacks(
  component: unknown,
  attacks: AttackSimulation[],
): Promise<{
  totalAttacks: number;
  successfullyBlocked: number;
  failedToBlock: number;
  results: Array<{
    attackType: string;
    blocked: boolean;
    expectedBlocked: boolean;
    mechanism?: string;
    response?: string;
    passed: boolean;
  }>;
  summary: string;
}> {
  const results = [];
  let successfullyBlocked = 0;
  let failedToBlock = 0;

  for (const attack of attacks) {
    try {
      let blocked = false;
      let mechanism: string | undefined;
      let response: string | undefined;

      switch (attack.type) {
        case 'replay':
          blocked = await simulateReplayAttack(component, attack.params);
          mechanism = 'session-tracking';
          break;

        case 'flood': {
          const floodResult = await simulateFloodAttack(component, attack.params);
          blocked = floodResult.blocked;
          mechanism = 'rate-limiting';
          response = floodResult.response;
          break;
        }

        case 'spoofing':
          blocked = await simulateSpoofingAttack(component, attack.params);
          mechanism = 'origin-validation';
          break;

        case 'csrf':
          blocked = await simulateCSRFAttack(component, attack.params);
          mechanism = 'origin-validation';
          break;

        case 'injection':
          blocked = await simulateInjectionAttack(component, attack.params);
          mechanism = 'input-validation';
          break;

        default:
          throw new Error(`Unknown attack type: ${attack.type}`);
      }

      const passed = blocked === attack.expectedDefense.blocked;

      results.push({
        attackType: attack.type,
        blocked,
        expectedBlocked: attack.expectedDefense.blocked,
        ...(mechanism && { mechanism }),
        ...(response && { response }),
        passed,
      });

      if (passed) {
        successfullyBlocked++;
      } else {
        failedToBlock++;
      }
    } catch (error) {
      results.push({
        attackType: attack.type,
        blocked: false,
        expectedBlocked: attack.expectedDefense.blocked,
        response: error instanceof Error ? error.message : String(error),
        passed: false,
      });
      failedToBlock++;
    }
  }

  const summary = `Security attacks: ${successfullyBlocked} properly defended, ${failedToBlock} failed defense out of ${attacks.length} attacks`;

  return {
    totalAttacks: attacks.length,
    successfullyBlocked,
    failedToBlock,
    results,
    summary,
  };
}

/**
 * Create a comprehensive security test suite for discovery protocol components.
 *
 * This utility creates a complete security test suite that covers all major
 * security aspects of discovery protocol implementations.
 *
 * @param component - The component to test
 * @param config - Configuration for the security test suite
 * @returns Security test suite object with methods to run different security tests
 * @example
 * ```typescript
 * const securitySuite = createSecurityTestSuite(announcer, {
 *   securityPolicy: createTestSecurityPolicy({ requireHttps: true }),
 *   testOrigins: ['https://trusted.com', 'https://malicious.com'],
 *   rateLimitConfig: { maxRequests: 5, windowMs: 60000 }
 * });
 *
 * await securitySuite.runAll();
 * ```
 * @category Testing
 * @since 1.0.0
 */
export function createSecurityTestSuite(
  component: unknown,
  config: {
    securityPolicy?: SecurityPolicy;
    testOrigins?: string[];
    rateLimitConfig?: { maxRequests: number; windowMs: number };
    sessionTrackingEnabled?: boolean;
  } = {},
) {
  const securityPolicy = config.securityPolicy || createTestSecurityPolicy();
  const testOrigins = config.testOrigins || [
    'https://trusted-app.com',
    'https://malicious-site.com',
    'http://insecure-site.com',
    'chrome-extension://valid-extension',
  ];

  return {
    /**
     * Test origin validation security.
     */
    async testOriginSecurity(): Promise<void> {
      if (!(component as OriginValidator).validateOrigin) {
        console.warn('Component does not support origin validation testing');
        return;
      }

      const results = await testOriginValidation(securityPolicy, testOrigins, component as OriginValidator);

      expect(results.failed).toBe(0);
    },

    /**
     * Test rate limiting security.
     */
    async testRateLimitingSecurity(): Promise<void> {
      if (!(component as RateLimiter).recordRequest) {
        console.warn('Component does not support rate limiting testing');
        return;
      }

      const rateLimitConfig = config.rateLimitConfig || { maxRequests: 5, windowMs: 60000 };

      const results = await simulateRateLimiting(component as RateLimiter, {
        origin: testOrigins[0] || 'https://example.com',
        requestCount: rateLimitConfig.maxRequests + 3,
        expectedAllowed: rateLimitConfig.maxRequests,
        spreadRequests: false,
      });

      expect(results.allowedRequests).toBe(rateLimitConfig.maxRequests);
      expect(results.blockedRequests).toBeGreaterThan(0);
    },

    /**
     * Test session tracking security.
     */
    async testSessionTrackingSecurity(): Promise<void> {
      if (!(component as SessionTracker).trackSession) {
        console.warn('Component does not support session tracking testing');
        return;
      }

      const scenarios: SessionTrackingScenario[] = [
        {
          name: 'Normal session',
          origin: testOrigins[0] || 'https://example.com',
          sessionId: 'session-1',
          expectedTracked: true,
        },
        {
          name: 'Duplicate session',
          origin: testOrigins[0] || 'https://example.com',
          sessionId: 'session-1',
          expectedTracked: false,
          isDuplicate: true,
        },
        {
          name: 'Cross-origin session',
          origin: testOrigins[1] || 'https://test2.com',
          sessionId: 'session-2',
          expectedTracked: true,
        },
      ];

      const results = await testSessionTracking(component as SessionTracker, scenarios);
      expect(results.failed).toBe(0);
    },

    /**
     * Test input validation security.
     */
    async testInputValidationSecurity(): Promise<void> {
      const malformedInputs = [
        ...createMalformedTestData('capability-request'),
        ...createMalformedTestData('origin'),
        ...createMalformedTestData('session-id'),
      ];

      // Test that component handles malformed inputs gracefully
      for (const malformed of malformedInputs) {
        expect(() => {
          // Attempt to process malformed input - should not throw
          if (
            (component as unknown as { simulateDiscoveryRequest?: (req: unknown) => void })
              .simulateDiscoveryRequest
          ) {
            (
              component as unknown as { simulateDiscoveryRequest: (req: unknown) => void }
            ).simulateDiscoveryRequest(malformed);
          }
        }).not.toThrow();
      }
    },

    /**
     * Test attack simulation.
     */
    async testAttackSimulation(): Promise<void> {
      const attacks: AttackSimulation[] = [
        {
          type: 'replay',
          params: { sessionId: 'test-session', origin: testOrigins[0] },
          expectedDefense: { blocked: true, mechanism: 'session-tracking' },
        },
        {
          type: 'spoofing',
          params: { fakeOrigin: 'https://fake-trusted.com', realOrigin: 'https://malicious.com' },
          expectedDefense: { blocked: true, mechanism: 'origin-validation' },
        },
      ];

      const results = await simulateSecurityAttacks(component, attacks);
      expect(results.failedToBlock).toBe(0);
    },

    /**
     * Run all security tests.
     */
    async runAll(): Promise<void> {
      await this.testOriginSecurity();
      await this.testRateLimitingSecurity();
      await this.testSessionTrackingSecurity();
      await this.testInputValidationSecurity();
      await this.testAttackSimulation();
    },
  };
}

// Helper functions for attack simulations

async function simulateReplayAttack(component: unknown, params: Record<string, unknown>): Promise<boolean> {
  // Simulate session replay by using the same session ID multiple times
  const sessionId = params['sessionId'] as string;
  const origin = params['origin'] as string;

  if ((component as SessionTracker).trackSession) {
    // First track should succeed (return true)
    const firstTrack = await (component as SessionTracker).trackSession(origin, sessionId);
    // Replay attempt should fail (return false)
    const replayTrack = await (component as SessionTracker).trackSession(origin, sessionId);

    // Attack is blocked if first succeeds and replay fails
    return firstTrack === true && replayTrack === false;
  }

  return false; // No session tracking, can't test replay
}

async function simulateFloodAttack(
  component: unknown,
  params: Record<string, unknown>,
): Promise<{ blocked: boolean; response?: string }> {
  const origin = params['origin'] as string;
  const requestCount = (params['requestCount'] as number) || 10;

  if ((component as RateLimiter).recordRequest) {
    let blockedCount = 0;

    for (let i = 0; i < requestCount; i++) {
      const allowed = await (component as RateLimiter).recordRequest(origin);
      if (!allowed) {
        blockedCount++;
      }
    }

    return {
      blocked: blockedCount > 0,
      response: `${blockedCount} out of ${requestCount} requests blocked`,
    };
  }

  return { blocked: false, response: 'No rate limiting available' };
}

async function simulateSpoofingAttack(component: unknown, params: Record<string, unknown>): Promise<boolean> {
  const fakeOrigin = params['fakeOrigin'] as string;

  if ((component as OriginValidator).validateOrigin) {
    const result = await (component as OriginValidator).validateOrigin(fakeOrigin);
    return !result.valid; // Blocked if validation failed
  }

  return false; // No origin validation, can't test spoofing
}

async function simulateCSRFAttack(component: unknown, params: Record<string, unknown>): Promise<boolean> {
  // Similar to spoofing attack for discovery protocol context
  return simulateSpoofingAttack(component, params);
}

async function simulateInjectionAttack(
  component: unknown,
  _params: Record<string, unknown>,
): Promise<boolean> {
  // Test with malicious payloads
  const maliciousPayloads = createMalformedTestData('capability-request');

  for (const payload of maliciousPayloads) {
    try {
      if (
        (component as unknown as { simulateDiscoveryRequest?: (req: unknown) => void })
          .simulateDiscoveryRequest
      ) {
        (
          component as unknown as { simulateDiscoveryRequest: (req: unknown) => void }
        ).simulateDiscoveryRequest(payload);
      }
    } catch {
      return true; // Blocked by throwing error
    }
  }

  return false; // Not blocked if we get here
}

function determineExpectedValidity(origin: string, policy: SecurityPolicy): boolean {
  // Helper function to determine expected validity based on security policy
  try {
    const url = new URL(origin);

    // Check blocked origins
    if (policy.blockedOrigins?.includes(origin)) {
      return false;
    }

    // Check allowed origins (if specified, must be in list)
    if (policy.allowedOrigins && policy.allowedOrigins.length > 0) {
      return policy.allowedOrigins.includes(origin);
    }

    // Check HTTPS requirement
    if (policy.requireHttps && url.protocol !== 'https:' && !url.hostname.includes('localhost')) {
      return false;
    }

    // Check localhost allowance
    if (policy.allowLocalhost === false && url.hostname.includes('localhost')) {
      return false;
    }

    return true;
  } catch {
    return false; // Invalid URL
  }
}
