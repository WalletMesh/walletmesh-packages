/**
 * Consolidated testing exports for the discovery package.
 *
 * Provides a clean, organized interface to all testing utilities,
 * reducing the number of exports from 495+ to approximately 50.
 *
 * @module testing
 * @category Testing
 * @since 0.1.0
 */

// ============================================================================
// Import functions needed for TestData and TestMocks objects
// ============================================================================

import {
  createTestInitiatorInfo,
  createTestResponderInfo as createTestResponderInfoBasic,
  createTestCapabilityRequirements,
  createTestSecurityPolicy,
  createEthereumTestData,
  createSolanaTestData,
  createAztecTestData,
  createMultiChainTestData,
  createTestDiscoveryRequestEvent,
  createTestDiscoveryResponseEvent,
  createTestDiscoveryCompleteEvent,
  createTestDiscoveryErrorEvent,
  createBasicDiscoveryScenario,
  createTimeoutScenario,
  createSecurityRejectionScenario,
  createIncompatibleCapabilityScenario,
} from './builders.js';

import {
  mockBrowserEnvironment,
  setupChromeEnvironment,
  setupMockCrypto,
  MockEventTarget,
  createMockWindow,
  createMockLocation,
  createSilentConsoleSpy,
  createCapturingConsoleSpy,
  createConsoleSpy,
} from './mocks.js';

import {
  advanceTimersAndFlush,
  flushPromises,
  waitFor,
  waitForEvent,
  nextTick,
  waitForState,
  getStateHistory,
  setupTestEnvironment,
  setupTestEventTarget,
  simulateDiscoveryRequest,
  createTestDiscoverySession,
  getDispatchedEvents,
  assertEventDispatched,
  assertEventNotDispatched,
  assertDiscoveryResponse,
  assertCapabilityMatch,
  assertState,
  assertThrows,
  assertThrowsAsync,
} from './helpers.js';

// ============================================================================
// Mock Implementations
// ============================================================================

export {
  // Browser Mocks
  type MockWindowConfig,
  createMockLocation,
  createMockWindow,
  mockBrowserEnvironment,
  restoreBrowserEnvironment,
  // Chrome Extension Mocks
  type MockChromeRuntime,
  type MockChromeTabs,
  type MockChromeAPI,
  type MockFunction,
  createMockChromeAPI,
  setupChromeEnvironment,
  // Console Mocks
  type ConsoleSpyOptions,
  type ConsoleSpy,
  createConsoleSpy,
  createSilentConsoleSpy,
  createCapturingConsoleSpy,
  // Crypto and Session Mocks
  type MockCrypto,
  createMockCrypto,
  type TestIdOptions,
  createTestSessionId,
  createTestUUID,
  createTestResponderId,
  resetTestIdCounters,
  setupMockCrypto,
  // Event Target Mock
  MockEventTarget,
} from './mocks.js';

// ============================================================================
// Test Data Builders
// ============================================================================

export {
  // Basic Data Builders
  createTestInitiatorInfo,
  createTestCapabilityRequirements,
  createTestCapabilityPreferences,
  createTestResponderInfo as createTestResponderInfoBasic,
  createTestSecurityPolicy,
  createTestTransportConfig,
  // Discovery Event Builders
  createTestDiscoveryRequestEvent,
  createTestDiscoveryResponseEvent,
  createTestDiscoveryCompleteEvent,
  createTestDiscoveryErrorEvent,
  // Specialized Builders
  createEthereumTestData,
  createSolanaTestData,
  createAztecTestData,
  createMultiChainTestData,
  // Test Scenario Builders
  type TestScenarioConfig,
  createBasicDiscoveryScenario,
  createSecurityRejectionScenario,
  createTimeoutScenario,
  createIncompatibleCapabilityScenario,
} from './builders.js';

// ============================================================================
// Test Helpers and Utilities
// ============================================================================

export {
  // Timing Utilities
  advanceTimersAndFlush,
  flushPromises,
  waitFor,
  waitForEvent,
  nextTick,
  // State Machine Helpers
  waitForState,
  getStateHistory,
  assertState,
  // Event Assertion Helpers
  assertEventDispatched,
  assertEventNotDispatched,
  getDispatchedEvents,
  // Capability Testing Helpers
  assertCapabilityMatch,
  createTestCapabilityIntersection,
  // Test Lifecycle Helpers
  setupTestEnvironment,
  setupTestEventTarget,
  // Discovery Protocol Test Helpers
  simulateDiscoveryRequest,
  assertDiscoveryResponse,
  createTestDiscoverySession,
  // Error Testing Helpers
  assertThrows,
  assertThrowsAsync,
} from './helpers.js';

// ============================================================================
// Convenience Re-exports
// ============================================================================

/**
 * Common test data patterns for quick setup.
 */
export const TestData = {
  // Basic test objects
  initiatorInfo: createTestInitiatorInfo,
  responderInfo: createTestResponderInfoBasic,
  capabilityRequirements: createTestCapabilityRequirements,
  securityPolicy: createTestSecurityPolicy,

  // Chain-specific presets
  ethereum: createEthereumTestData,
  solana: createSolanaTestData,
  aztec: createAztecTestData,
  multiChain: createMultiChainTestData,

  // Discovery events
  request: createTestDiscoveryRequestEvent,
  response: createTestDiscoveryResponseEvent,
  complete: createTestDiscoveryCompleteEvent,
  error: createTestDiscoveryErrorEvent,

  // Common scenarios
  basicScenario: createBasicDiscoveryScenario,
  timeoutScenario: createTimeoutScenario,
  rejectionScenario: createSecurityRejectionScenario,
  incompatibleScenario: createIncompatibleCapabilityScenario,
};

/**
 * Common mock setups for quick test environment initialization.
 */
export const TestMocks = {
  // Environment setup
  browser: mockBrowserEnvironment,
  chrome: setupChromeEnvironment,
  crypto: setupMockCrypto,

  // Component mocks
  eventTarget: () => new MockEventTarget(),
  window: createMockWindow,
  location: createMockLocation,

  // Testing utilities
  console: {
    silent: createSilentConsoleSpy,
    capturing: createCapturingConsoleSpy,
    spy: createConsoleSpy,
  },
};

/**
 * Test assertion helpers for common validation patterns.
 */
export const TestAssertions = {
  // Event assertions
  eventDispatched: assertEventDispatched,
  eventNotDispatched: assertEventNotDispatched,

  // Discovery-specific assertions
  discoveryResponse: assertDiscoveryResponse,
  capabilityMatch: assertCapabilityMatch,

  // State machine assertions
  state: assertState,

  // Error assertions
  throws: assertThrows,
  throwsAsync: assertThrowsAsync,
};

/**
 * Test lifecycle and timing utilities.
 */
export const TestUtils = {
  // Timing
  advanceTime: advanceTimersAndFlush,
  flush: flushPromises,
  waitFor,
  waitForEvent,
  nextTick,

  // State management
  waitForState,
  getStateHistory,

  // Environment
  setupEnvironment: setupTestEnvironment,
  setupEventTarget: setupTestEventTarget,

  // Discovery flow
  simulateRequest: simulateDiscoveryRequest,
  createSession: createTestDiscoverySession,

  // Event inspection
  getEvents: getDispatchedEvents,
};

// ============================================================================
// Additional Exports for Test Compatibility
// ============================================================================

// Re-export from testUtils.ts
export {
  createTestDAppInfo,
  createTestDiscoveryRequest,
  createTestDiscoveryResponse,
  createTestDiscoveryInitiator,
  // Export the object-based createTestResponderInfo with methods like .ethereum()
  createTestResponderInfo,
} from './testUtils.js';

// Re-export from eventHelpers.ts
export {
  createDiscoveryRequestEvent,
  createDiscoveryResponseEvent,
} from './eventHelpers.js';

// Re-export from timingHelpers.ts
export {
  setupFakeTimers,
  cleanupFakeTimers,
  advanceTimeAndWait,
} from './timingHelpers.js';

// Re-export assertions for validation
export {
  expectValidDiscoveryRequestEvent,
  expectValidDiscoveryResponseEvent,
  expectValidResponderInfo,
  expectValidInitiatorInfo,
  expectValidQualifiedResponder,
} from './assertions.js';

// Re-export browser mocks
export { createContentScriptMock } from './browserMocks.js';

// Re-export security helpers
export { testOriginValidation } from './securityHelpers.js';

// Re-export mock classes
export { MockDiscoveryInitiator } from './MockDiscoveryInitiator.js';
export { MockDiscoveryResponder } from './MockDiscoveryResponder.js';
