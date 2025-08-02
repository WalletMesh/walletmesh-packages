/**
 * Testing module for the Generic Cross-Blockchain Wallet Discovery Protocol.
 *
 * Comprehensive testing framework providing mock implementations, test utilities,
 * and validation helpers for testing discovery protocol implementations in both
 * dApp and wallet contexts. Enables thorough testing of discovery flows, security
 * scenarios, and edge cases without requiring real wallet implementations.
 *
 * Key testing components:
 * - Mock implementations: Drop-in replacements for testing
 * - Test scenarios: Pre-built test cases for common workflows
 * - Assertion helpers: Validation functions for protocol messages
 * - Test utilities: Data generators and timing helpers
 * - Browser environment mocking: Cross-origin communication testing
 * - Security testing: Origin validation, rate limiting, session tracking
 * - State machine testing: State transitions and timeout validation
 * - Integration testing: End-to-end discovery flows
 *
 * @example Basic discovery testing:
 * ```typescript
 * import {
 *   createDiscoveryTestScenario,
 *   createTestResponderInfo,
 *   createTestDAppInfo
 * } from '@walletmesh/discovery/testing';
 *
 * const scenario = createDiscoveryTestScenario({
 *   responderInfo: createTestResponderInfo.ethereum(),
 *   initiatorInfo: createTestDAppInfo(),
 *   requirements: {
 *     chains: ['eip155:1'],
 *     features: ['account-management'],
 *     interfaces: ['eip-1193']
 *   }
 * });
 *
 * const result = await scenario.runDiscovery();
 * expect(result.qualifiedWallets).toHaveLength(1);
 * ```
 *
 * @example Browser environment testing:
 * ```typescript
 * import { withMockWindow, setupFakeTimers } from '@walletmesh/discovery/testing';
 *
 * beforeEach(() => {
 *   setupFakeTimers();
 * });
 *
 * await withMockWindow({ origin: 'https://my-dapp.com' }, async () => {
 *   // Test discovery protocol with mocked browser environment
 *   const announcer = new DiscoveryResponder(config);
 *   expect(window.location.origin).toBe('https://my-dapp.com');
 * });
 * ```
 *
 * @example Security testing:
 * ```typescript
 * import {
 *   testOriginValidation,
 *   simulateRateLimiting,
 *   createSecurityTestSuite
 * } from '@walletmesh/discovery/testing';
 *
 * // Test origin validation
 * const results = await testOriginValidation(securityPolicy, [
 *   'https://trusted.com',
 *   'https://malicious.com'
 * ]);
 *
 * // Test rate limiting
 * await simulateRateLimiting(rateLimiter, {
 *   origin: 'https://example.com',
 *   requestCount: 10,
 *   expectedAllowed: 5
 * });
 *
 * // Complete security test suite
 * const suite = createSecurityTestSuite(component, { securityPolicy });
 * await suite.runAll();
 * ```
 *
 * @example State machine testing:
 * ```typescript
 * import {
 *   testStateTransitions,
 *   createStateMachineTestSuite
 * } from '@walletmesh/discovery/testing';
 *
 * // Test specific transitions
 * await testStateTransitions(stateMachine, [
 *   { from: 'IDLE', to: 'DISCOVERING', trigger: 'start' },
 *   { from: 'DISCOVERING', to: 'COMPLETED', trigger: 'timeout', delay: 3000 }
 * ]);
 *
 * // Complete state machine test suite
 * const suite = createStateMachineTestSuite(stateMachine, {
 *   states: ['IDLE', 'DISCOVERING', 'COMPLETED'],
 *   transitions: [...],
 *   timeouts: { DISCOVERING: { timeout: 3000, nextState: 'IDLE' } }
 * });
 * await suite.runAll();
 * ```
 *
 * @example Integration testing:
 * ```typescript
 * import {
 *   createFullDiscoveryFlow,
 *   testCrossOriginCommunication
 * } from '@walletmesh/discovery/testing';
 *
 * // Complete discovery flow
 * const flow = createFullDiscoveryFlow({
 *   initiatorOrigin: 'https://my-dapp.com',
 *   responderInfo: createTestResponderInfo.ethereum()
 * });
 * const result = await flow.runComplete();
 *
 * // Cross-origin communication testing
 * const crossOriginResults = await testCrossOriginCommunication([
 *   'https://dapp.com',
 *   'https://wallet.com'
 * ]);
 * ```
 *
 * @module testing
 * @since 0.1.0
 * @see {@link https://docs.walletmesh.io/discovery/testing} for testing best practices
 */

// Export mock implementations
export { MockDiscoveryInitiator } from './MockDiscoveryInitiator.js';
export { MockDiscoveryResponder } from './MockDiscoveryResponder.js';
export { MockEventTarget } from './MockEventTarget.js';

// Export test utilities
export {
  createTestResponderInfo,
  createTestDiscoveryRequest,
  createTestDiscoveryResponse,
  createTestDAppInfo,
  createTestSecurityPolicy,
  generateTestSessionId,
  waitFor,
  waitForCondition,
  generateTestWalletId,
  generateTestOrigin,
  createTestCapabilityRequirements,
  createTestCapabilityPreferences,
  createTestDiscoveryConfig,
} from './testUtils.js';

// Export test scenarios
export {
  createDiscoveryTestScenario,
  createSecurityTestScenario,
  createBasicDiscoveryScenario,
  createTimeoutScenario,
  createSecurityRejectionScenario,
} from './testScenarios.js';

// Export assertion helpers
export {
  expectValidDiscoveryRequestEvent,
  expectValidDiscoveryResponseEvent,
  expectValidResponderInfo,
  expectValidInitiatorInfo,
  expectValidQualifiedResponder,
  assertValidDiscoveryRequestEvent,
  assertValidResponderAnnouncement,
  assertValidOriginValidation,
} from './assertions.js';

// Export browser environment mocking utilities
export {
  mockBrowserEnvironment,
  restoreBrowserEnvironment,
  withMockWindow,
  createMockLocation,
  createMockWindow,
  isMockBrowserEnvironment,
  createMultipleMockWindows,
} from './browserMocks.js';

// Export timing and async testing helpers
export {
  setupFakeTimers,
  cleanupFakeTimers,
  advanceTimeAndWait,
  timeoutTestHelper,
  waitForEventDispatch,
  createTimeoutPromise,
  testTimingScenarios,
  measureAsyncOperation,
  createDebouncedTest,
} from './timingHelpers.js';

// Export event testing utilities
export {
  createTestEvent,
  createDiscoveryRequestEvent,
  createDiscoveryResponseEvent,
  simulateMessageEvent,
  createDiscoveryEventChain,
  captureEventFlow,
  createMockEventListener,
  testEventPropagation,
  createEventBatch,
  validateDiscoveryEvent,
} from './eventHelpers.js';

// Export state machine testing utilities
export {
  testStateTransitions,
  testStateTimeouts,
  assertStateConsistency,
  createStateMachineTestSuite,
  createCommonDiscoveryInvariants,
} from './stateMachineHelpers.js';

// Export security testing utilities
export {
  testOriginValidation,
  simulateRateLimiting,
  testSessionTracking,
  createMalformedTestData,
  simulateSecurityAttacks,
  createSecurityTestSuite,
} from './securityHelpers.js';

// Export integration testing utilities
export {
  createFullDiscoveryFlow,
  testCrossOriginCommunication,
  validateDiscoveryCompliance,
  createEndToEndIntegrationTest,
} from './integrationHelpers.js';

// Re-export types needed for testing
export type {
  DiscoveryRequestEvent,
  DiscoveryResponseEvent,
  ResponderInfo,
  InitiatorInfo,
  QualifiedResponder,
  CapabilityIntersection,
  SecurityPolicy,
} from '../core/types.js';

// Export testing-specific types
export type { MockWindowConfig } from './browserMocks.js';

export type { TimingConfig } from './timingHelpers.js';

export type {
  EventConfig,
  MessageEventConfig,
  EventChainStep,
} from './eventHelpers.js';

export type {
  StateTransitionTest,
  StateTimeoutConfig,
  StateInvariant,
  StateMachine,
} from './stateMachineHelpers.js';

export type {
  OriginTestCase,
  RateLimitTestConfig,
  SessionTrackingScenario,
  AttackSimulation,
  OriginValidator,
  RateLimiter,
  SessionTracker,
} from './securityHelpers.js';

export type {
  DiscoveryFlowConfig,
  DiscoveryFlowResult,
  CrossOriginTestResult,
  ComplianceTestConfig,
} from './integrationHelpers.js';

export type {
  TestScenario,
  TestContext,
} from './testScenarios.js';
