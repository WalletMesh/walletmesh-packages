import type { DiscoveryResponseEvent, InitiatorInfo } from '../types/core.js';
import type { ResponderInfo, CapabilityRequirements } from '../types/capabilities.js';
import type { SecurityPolicy } from '../types/security.js';
import { MockDiscoveryInitiator } from './MockDiscoveryInitiator.js';
import { MockDiscoveryResponder } from './MockDiscoveryResponder.js';
import { MockEventTarget } from './MockEventTarget.js';
import {
  createTestResponderInfo,
  createTestDAppInfo,
  createTestDiscoveryRequest,
  createTestSecurityPolicy,
  generateTestSessionId,
} from './testUtils.js';

/**
 * Test scenario utilities for comprehensive discovery protocol testing.
 *
 * This module provides factory functions for creating complete test scenarios
 * that simulate real-world discovery protocol interactions between dApps and wallets.
 *
 * @module testScenarios
 * @category Testing
 * @since 1.0.0
 */

/**
 * Interface for test scenarios.
 */
export interface TestScenario {
  name: string;
  description: string;
  setup(): Promise<TestContext>;
  expectedOutcome: {
    respondersFound?: number;
    timeout?: boolean;
    securityRejection?: boolean;
  };
  cleanup(context: TestContext): Promise<void>;
}

/**
 * Test context interface.
 */
export interface TestContext {
  listener: MockDiscoveryInitiator;
  announcer: MockDiscoveryResponder;
  eventTarget: MockEventTarget;
}

/**
 * Create a basic discovery scenario for testing normal discovery flow.
 */
export function createBasicDiscoveryScenario(
  options: {
    expectedResponders?: number;
    responderInfo?: ResponderInfo;
    securityPolicy?: SecurityPolicy;
  } = {},
): TestScenario {
  return {
    name: 'Basic Discovery Scenario',
    description: 'Test normal discovery flow with wallet response',

    async setup(): Promise<TestContext> {
      const eventTarget = new MockEventTarget();
      const responderInfo = options.responderInfo || createTestResponderInfo.ethereum();
      const securityPolicy = options.securityPolicy || createTestSecurityPolicy();

      const listener = new MockDiscoveryInitiator({
        requirements: {
          technologies: [
            {
              type: 'evm' as const,
              interfaces: ['eip-1193'],
            },
          ],
          features: ['account-management'],
        },
        initiatorInfo: createTestDAppInfo(),
        eventTarget,
      });

      const announcer = new MockDiscoveryResponder({
        responderInfo,
        eventTarget,
        securityPolicy,
      });

      return { listener, announcer, eventTarget };
    },

    expectedOutcome: {
      respondersFound: options.expectedResponders || 1,
    },

    async cleanup(context): Promise<void> {
      context.listener.stopDiscovery();
      context.announcer.stopListening();
    },
  };
}

/**
 * Create a timeout scenario for testing discovery timeouts.
 */
export function createTimeoutScenario(options: { timeout?: number } = {}): TestScenario {
  return {
    name: 'Discovery Timeout Scenario',
    description: 'Test discovery timeout when no wallets respond',

    async setup(): Promise<TestContext> {
      const eventTarget = new MockEventTarget();

      const listener = new MockDiscoveryInitiator({
        requirements: {
          technologies: [
            {
              type: 'evm' as const,
              interfaces: ['eip-1193'],
            },
          ],
          features: ['account-management'],
        },
        initiatorInfo: createTestDAppInfo(),
        eventTarget,
        timeout: options.timeout || 1000,
      });

      const announcer = new MockDiscoveryResponder({
        responderInfo: createTestResponderInfo.ethereum(),
        eventTarget,
        securityPolicy: createTestSecurityPolicy(),
      });

      return { listener, announcer, eventTarget };
    },

    expectedOutcome: {
      timeout: true,
      respondersFound: 0,
    },

    async cleanup(context): Promise<void> {
      context.listener.stopDiscovery();
      context.announcer.stopListening();
    },
  };
}

/**
 * Create a security rejection scenario for testing security validation.
 */
export function createSecurityRejectionScenario(options: { maliciousOrigin?: string } = {}): TestScenario {
  return {
    name: 'Security Rejection Scenario',
    description: 'Test security policy rejection of malicious requests',

    async setup(): Promise<TestContext> {
      const eventTarget = new MockEventTarget();

      const listener = new MockDiscoveryInitiator({
        requirements: {
          technologies: [
            {
              type: 'evm' as const,
              interfaces: ['eip-1193'],
            },
          ],
          features: ['account-management'],
        },
        initiatorInfo: createTestDAppInfo(),
        eventTarget,
      });

      const announcer = new MockDiscoveryResponder({
        responderInfo: createTestResponderInfo.ethereum(),
        eventTarget,
        securityPolicy: createTestSecurityPolicy({
          requireHttps: true,
          blockedOrigins: [options.maliciousOrigin || 'http://malicious-site.com'],
        }),
      });

      return { listener, announcer, eventTarget };
    },

    expectedOutcome: {
      securityRejection: true,
      respondersFound: 0,
    },

    async cleanup(context): Promise<void> {
      context.listener.stopDiscovery();
      context.announcer.stopListening();
    },
  };
}

/**
 * Create a complete discovery test scenario with mock dApp and wallets.
 *
 * This function sets up a comprehensive test environment with a mock dApp (listener)
 * and multiple mock wallets (announcers). It provides methods to run discovery flows,
 * test different requirement variations, and validate security scenarios.
 *
 * @param options - Configuration options for the test scenario
 * @param options.initiatorInfo - Custom dApp information (defaults to test dApp)
 * @param options.wallets - Array of wallet configurations (defaults to Ethereum, Solana, and multi-chain wallets)
 * @param options.requirements - Capability requirements for the dApp
 * @param options.preferences - Optional capability preferences
 * @param options.securityPolicy - Security policy configuration
 * @returns A test scenario object with methods to run various tests
 * @example
 * ```typescript
 * // Create a basic discovery scenario
 * const scenario = createDiscoveryTestScenario();
 *
 * // Run discovery and get qualified wallets
 * const { responses, qualifiedWallets } = await scenario.runDiscovery();
 *
 * // Test different requirement combinations
 * const results = await scenario.testRequirementVariations([
 *   { technologies: [{ type: 'evm', interfaces: ['eip-1193'] }], features: ['account-management'] },
 *   { technologies: [{ type: 'solana', interfaces: ['solana-wallet-standard'] }], features: ['transaction-signing'] }
 * ]);
 *
 * // Clean up when done
 * scenario.cleanup();
 * ```
 * @category Testing
 * @since 1.0.0
 */
export function createDiscoveryTestScenario(
  options: {
    initiatorInfo?: InitiatorInfo;
    wallets?: ResponderInfo[];
    requirements?: {
      technologies: { type: 'evm' | 'solana' | 'aztec'; interfaces: string[] }[];
      features: string[];
    };
    preferences?: {
      features?: string[];
    };
    securityPolicy?: SecurityPolicy;
  } = {},
) {
  const initiatorInfo = options.initiatorInfo ?? createTestDAppInfo();
  const requirements = options.requirements ?? {
    technologies: [
      {
        type: 'evm' as const,
        interfaces: ['eip-1193'],
      },
    ],
    features: ['account-management', 'transaction-signing'],
  };

  const wallets = options.wallets ?? [
    createTestResponderInfo.ethereum(),
    createTestResponderInfo.solana(),
    createTestResponderInfo.multiChain(),
  ];

  const securityPolicy = options.securityPolicy;

  // Create mock components
  const mockListener = new MockDiscoveryInitiator({
    requirements,
    ...(options.preferences && { preferences: options.preferences }),
    initiatorInfo,
    ...(securityPolicy && { securityPolicy }),
  });

  const mockAnnouncers = wallets.map(
    (responderInfo) =>
      new MockDiscoveryResponder({
        responderInfo,
        ...(securityPolicy && { securityPolicy }),
      }),
  );

  return {
    initiatorInfo,
    requirements,
    preferences: options.preferences,
    wallets,
    securityPolicy,
    mockListener,
    mockAnnouncers,

    /**
     * Run a complete discovery scenario.
     */
    async runDiscovery() {
      // Start all wallet announcers
      for (const announcer of mockAnnouncers) {
        announcer.startListening();
      }

      // Create a discovery session manually
      const sessionId = generateTestSessionId();

      // Set up the listener with the session ID
      mockListener.setSessionId(sessionId);

      const request = createTestDiscoveryRequest({
        sessionId,
        initiatorInfo,
        required: requirements,
        ...(options.preferences && { optional: options.preferences }),
      });

      // Simulate discovery request to all wallets
      const responses: DiscoveryResponseEvent[] = [];
      for (const announcer of mockAnnouncers) {
        const response = announcer.simulateDiscoveryRequest(request);
        if (response) {
          responses.push(response);
          mockListener.addMockWalletResponse(response);
        }
      }

      return {
        request,
        responses,
        qualifiedWallets: mockListener.getQualifiedResponders(),
      };
    },

    /**
     * Test different requirement combinations.
     */
    async testRequirementVariations(variations: CapabilityRequirements[]) {
      const results = [];

      for (const variation of variations) {
        const request = createTestDiscoveryRequest({
          sessionId: generateTestSessionId(),
          initiatorInfo,
          required: variation,
        });

        const responses: DiscoveryResponseEvent[] = [];
        for (const announcer of mockAnnouncers) {
          announcer.startListening();
          const response = announcer.simulateDiscoveryRequest(request);
          if (response) {
            responses.push(response);
          }
        }

        results.push({
          requirements: variation,
          responses,
          qualifiedWalletCount: responses.length,
        });
      }

      return results;
    },

    /**
     * Test security scenarios.
     */
    async testSecurityScenarios() {
      // Test with different origins based on the configured security policy
      const scenarios = [];

      // Add allowed origins from security policy
      if (securityPolicy?.allowedOrigins) {
        for (const origin of securityPolicy.allowedOrigins) {
          scenarios.push({ origin, shouldSucceed: true });
        }
      }

      // Add blocked origins from security policy
      if (securityPolicy?.blockedOrigins) {
        for (const origin of securityPolicy.blockedOrigins) {
          scenarios.push({ origin, shouldSucceed: false });
        }
      }

      // Add additional test scenarios for HTTP/HTTPS validation
      if (securityPolicy?.requireHttps) {
        scenarios.push({ origin: 'http://localhost:3000', shouldSucceed: false });
        scenarios.push({ origin: 'http://example.com', shouldSucceed: false });
      }

      // Add some common test scenarios if no specific policy is set
      if (scenarios.length === 0) {
        scenarios.push(
          { origin: 'https://legitimate-dapp.com', shouldSucceed: true },
          { origin: 'https://malicious-site.com', shouldSucceed: false },
          { origin: 'http://localhost:3000', shouldSucceed: true },
          { origin: 'https://phishing-site.com', shouldSucceed: false },
        );
      }

      const results = [];

      for (const scenario of scenarios) {
        const request = createTestDiscoveryRequest({
          sessionId: generateTestSessionId(),
          origin: scenario.origin,
          initiatorInfo: { ...initiatorInfo, url: scenario.origin },
          required: requirements,
        });

        const responses: DiscoveryResponseEvent[] = [];
        for (const announcer of mockAnnouncers) {
          announcer.startListening();
          const response = announcer.simulateDiscoveryRequest(request);
          if (response) {
            responses.push(response);
          }
        }

        results.push({
          scenario: scenario.origin,
          expectedSuccess: scenario.shouldSucceed,
          actualResponses: responses.length,
          succeeded: responses.length > 0,
        });
      }

      return results;
    },

    /**
     * Clean up all mock components.
     */
    cleanup() {
      mockListener.reset();
      for (const announcer of mockAnnouncers) {
        announcer.cleanup();
      }
    },

    /**
     * Get comprehensive test statistics.
     */
    getStats() {
      return {
        dapp: mockListener.getStats(),
        wallets: mockAnnouncers.map((announcer) => announcer.getStats()),
        scenario: {
          initiatorInfo,
          requirements,
          preferences: options.preferences,
          walletCount: wallets.length,
          securityPolicy,
        },
      };
    },
  };
}

/**
 * Create a security test scenario for testing security features.
 *
 * This function sets up a test environment for validating security policies
 * including origin validation, rate limiting, and session tracking. It provides
 * comprehensive test methods for various security scenarios.
 *
 * @param options - Configuration options for the security scenario
 * @param options.securityPolicy - Security policy to test (defaults to permissive test policy)
 * @param options.testOrigins - Array of origins to test (defaults to mix of legitimate and malicious origins)
 * @returns A test scenario object with methods to run security tests
 * @example
 * ```typescript
 * // Create a security scenario with strict policy
 * const scenario = createSecurityTestScenario({
 *   securityPolicy: {
 *     allowedOrigins: ['https://myapp.com'],
 *     blockedOrigins: ['https://malicious.com'],
 *     requireHttps: true,
 *     allowLocalhost: false,
 *     rateLimit: {
 *       enabled: true,
 *       maxRequests: 10,
 *       windowMs: 60000
 *     }
 *   }
 * });
 *
 * // Run all security tests
 * const results = scenario.runAllTests();
 *
 * // Test specific features
 * const originTests = scenario.testOriginValidation();
 * const rateLimitTests = scenario.testRateLimiting();
 * const sessionTests = scenario.testSessionTracking();
 * ```
 * @category Testing
 * @since 1.0.0
 */
export function createSecurityTestScenario(
  options: { securityPolicy?: SecurityPolicy; testOrigins?: string[] } = {},
) {
  const securityPolicy = options.securityPolicy ?? createTestSecurityPolicy();
  const testOrigins =
    options.testOrigins && options.testOrigins.length > 0
      ? options.testOrigins
      : [
          'https://legitimate-dapp.com',
          'https://malicious-site.com',
          'http://localhost:3000',
          'https://phishing-site.com',
        ];

  return {
    securityPolicy,
    testOrigins,

    /**
     * Test origin validation with different origins.
     */
    testOriginValidation() {
      const results = [];

      for (const origin of testOrigins) {
        // Determine expected result based on security policy
        let expectedValid = true;

        if (
          securityPolicy.allowedOrigins &&
          !securityPolicy.allowedOrigins.includes(origin) &&
          !origin.includes('localhost')
        ) {
          expectedValid = false;
        }

        if (securityPolicy.blockedOrigins?.includes(origin)) {
          expectedValid = false;
        }

        if (securityPolicy.requireHttps && !origin.startsWith('https:') && !origin.includes('localhost')) {
          expectedValid = false;
        }

        if (securityPolicy.allowLocalhost === false && origin.includes('localhost')) {
          expectedValid = false;
        }

        results.push({
          origin,
          expectedValid,
          policy: securityPolicy,
        });
      }

      return {
        allowedOrigins: securityPolicy.allowedOrigins || [],
        requireHttps: securityPolicy.requireHttps || false,
        testOrigins,
        results,
      };
    },

    /**
     * Test rate limiting scenarios.
     */
    testRateLimiting() {
      if (!securityPolicy.rateLimit || securityPolicy.rateLimit.enabled === false) {
        return { enabled: false };
      }

      const { maxRequests, windowMs } = securityPolicy.rateLimit;
      const testOrigin = testOrigins[0];

      // Simulate requests over time
      const requests = [];
      const startTime = Date.now();

      for (let i = 0; i < maxRequests + 5; i++) {
        const timestamp = startTime + i * 100; // 100ms between requests
        requests.push({
          origin: testOrigin,
          timestamp,
          expectedAllowed: i < maxRequests,
        });
      }

      return {
        enabled: true,
        maxRequests,
        windowMs,
        testRequests: requests,
      };
    },

    /**
     * Test session tracking scenarios.
     */
    testSessionTracking() {
      // Use allowed origins if available, otherwise use test origins
      const availableOrigins =
        securityPolicy.allowedOrigins && securityPolicy.allowedOrigins.length > 0
          ? securityPolicy.allowedOrigins
          : testOrigins;

      const scenarios = [
        {
          name: 'Normal session',
          sessionId: generateTestSessionId(),
          origin: availableOrigins[0],
          expectedTracked: true,
        },
        {
          name: 'Duplicate session',
          sessionId: 'duplicate-session',
          origin: availableOrigins[0],
          expectedTracked: false,
        },
        {
          name: 'Cross-origin session',
          sessionId: generateTestSessionId(),
          origin: availableOrigins[1] || availableOrigins[0], // Fallback to first origin if only one available
          expectedTracked: true,
        },
      ];

      return scenarios;
    },

    /**
     * Get comprehensive security test results.
     */
    runAllTests() {
      return {
        originValidation: this.testOriginValidation(),
        rateLimiting: this.testRateLimiting(),
        sessionTracking: this.testSessionTracking(),
        securityPolicy,
      };
    },
  };
}
