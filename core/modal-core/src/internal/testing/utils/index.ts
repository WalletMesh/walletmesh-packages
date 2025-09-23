/**
 * Test utilities index - Central export for modal-core testing utilities
 *
 * Provides a single import point for all test utilities, making it easy
 * to import and use standardized testing helpers across the test suite.
 * Eliminates code duplication and ensures consistent testing patterns.
 *
 * @packageDocumentation
 * @internal
 */

// Import all utilities to use in organized exports

import {
  SCHEMA_MOCK_CONFIGS,
  createMockSchema,
  createSchemaErrorScenarios,
  createSchemaTestSuite,
  createTypedSchemaMocks,
  resetSchemaMocks,
  setupAdvancedSchemaMocks,
  setupSchemaMocks,
} from './schemaMocks.js';

import {
  ERROR_TEST_SCENARIOS,
  asyncErrorUtils,
  createErrorTestSuite,
  createTestModalError,
  errorAssertions,
  errorBoundaryUtils,
  errorRecoveryUtils,
  expectModalError,
} from './errorTestUtils.js';

import {
  asyncAssertions,
  performanceUtils,
  promiseUtils,
  retryUtils,
  sequenceUtils,
  timerUtils,
} from './asyncTestUtils.js';

// Import expect for test suite generators
import { expect } from 'vitest';

import {
  autoSetup,
  cleanupTestEnvironment,
  domUtils,
  envUtils,
  networkUtils,
  setupTestEnvironment,
  walletUtils,
} from './environmentUtils.js';

// Re-export all utilities with organized namespaces
export * from './schemaMocks.js';
export * from './errorTestUtils.js';
export * from './asyncTestUtils.js';
export * from './environmentUtils.js';

// Convenience exports for common patterns
// Mock factories have been removed - use the simplified mocks from src/testing/

export {
  // Schema mocking
  createMockSchema,
  setupSchemaMocks,
  setupAdvancedSchemaMocks,
  createSchemaErrorScenarios,
  createTypedSchemaMocks,
  resetSchemaMocks,
  createSchemaTestSuite,
  SCHEMA_MOCK_CONFIGS,
};

export {
  // Error testing
  createTestModalError,
  expectModalError,
  createErrorTestSuite,
  asyncErrorUtils,
  errorBoundaryUtils,
  errorRecoveryUtils,
  errorAssertions,
  ERROR_TEST_SCENARIOS,
};

export {
  // Async testing
  timerUtils,
  promiseUtils,
  sequenceUtils,
  retryUtils,
  performanceUtils,
  asyncAssertions,
};

export {
  // Environment setup
  domUtils,
  networkUtils,
  walletUtils,
  envUtils,
  setupTestEnvironment,
  cleanupTestEnvironment,
  autoSetup,
};

/**
 * Convenience object containing all test utilities organized by category
 *
 * Provides a structured way to access utilities by their domain.
 *
 * @example
 * ```typescript
 * import { testUtils } from './internal/testing/utils/index.js';
 *
 * // Use mock factories
 * const mockTransport = testUtils.mocks.createMockTransport();
 *
 * // Use schema mocks
 * testUtils.schemas.setupSchemaMocks(schemas);
 *
 * // Use error testing
 * testUtils.errors.expectModalError(error, expected);
 *
 * // Use async utilities
 * testUtils.async.timerUtils.setupFakeTimers();
 *
 * // Use environment setup
 * testUtils.environment.setupTestEnvironment();
 * ```
 */
export const testUtils = {
  /** Schema validation mock utilities */
  schemas: {
    createMockSchema,
    setupSchemaMocks,
    setupAdvancedSchemaMocks,
    createSchemaErrorScenarios,
    createTypedSchemaMocks,
    resetSchemaMocks,
    createSchemaTestSuite,
    SCHEMA_MOCK_CONFIGS,
  },

  /** Error testing utilities */
  errors: {
    createTestModalError,
    expectModalError,
    createErrorTestSuite,
    asyncErrorUtils,
    errorBoundaryUtils,
    errorRecoveryUtils,
    errorAssertions,
    ERROR_TEST_SCENARIOS,
  },

  /** Async testing utilities */
  async: {
    timerUtils,
    promiseUtils,
    sequenceUtils,
    retryUtils,
    performanceUtils,
    asyncAssertions,
  },

  /** Environment setup utilities */
  environment: {
    domUtils,
    networkUtils,
    walletUtils,
    envUtils,
    setupTestEnvironment,
    cleanupTestEnvironment,
    autoSetup,
  },
} as const;

/**
 * Quick setup functions for common test scenarios
 *
 * Provides one-line setup for common testing patterns.
 *
 * @example
 * ```typescript
 * import { quickSetup } from './internal/testing/utils/index.js';
 *
 * // Unit test setup
 * beforeEach(quickSetup.unitTest);
 * afterEach(quickSetup.cleanup);
 *
 * // Integration test setup
 * beforeEach(quickSetup.integrationTest);
 * afterEach(quickSetup.cleanup);
 * ```
 */
export const quickSetup = {
  /**
   * Quick setup for unit tests
   *
   * Sets up minimal environment with DOM mocks but no network/wallet mocks.
   */
  unitTest: () => {
    return setupTestEnvironment({
      mockDOM: true,
      mockNetwork: false,
      mockWallet: false,
      env: envUtils.createPreset('test'),
    });
  },

  /**
   * Quick setup for integration tests
   *
   * Sets up comprehensive environment with all mocks enabled.
   */
  integrationTest: () => {
    return setupTestEnvironment({
      mockDOM: true,
      mockNetwork: true,
      mockWallet: {
        mockMetaMask: true,
        mockSolana: true,
        autoConnect: false,
      },
      env: envUtils.createPreset('test'),
    });
  },

  /**
   * Quick setup for error testing
   *
   * Sets up environment optimized for error testing scenarios.
   */
  errorTest: () => {
    return setupTestEnvironment({
      mockDOM: true,
      mockNetwork: true,
      mockWallet: {
        mockMetaMask: true,
        autoConnect: false,
      },
      env: {
        ...envUtils.createPreset('test'),
        WALLETMESH_LOG_LEVEL: 'error', // Reduce log noise in error tests
      },
    });
  },

  /**
   * Quick setup for async testing
   *
   * Sets up environment optimized for async/timer testing.
   */
  asyncTest: () => {
    timerUtils.setupFakeTimers();
    return setupTestEnvironment({
      mockDOM: true,
      mockNetwork: true,
      mockWallet: false,
      env: envUtils.createPreset('test'),
    });
  },

  /**
   * Cleanup function for all test scenarios
   */
  cleanup: () => {
    cleanupTestEnvironment();
    timerUtils.cleanupFakeTimers();
  },
} as const;

/**
 * Test suite generators for common testing patterns
 *
 * Provides generators for complete test suites with standardized patterns.
 *
 * @example
 * ```typescript
 * import { testSuiteGenerators } from './internal/testing/utils/index.js';
 *
 * // Generate error handling test suite
 * const errorSuite = testSuiteGenerators.errorHandling('MyComponent', [
 *   ERROR_TEST_SCENARIOS.CONNECTION_FAILED,
 *   ERROR_TEST_SCENARIOS.TRANSPORT_ERROR
 * ]);
 *
 * describe('Error handling', () => {
 *   errorSuite.forEach(({ name, test }) => {
 *     it(name, test);
 *   });
 * });
 * ```
 */
export const testSuiteGenerators = {
  /**
   * Generates error handling test suite
   */
  errorHandling: createErrorTestSuite,

  /**
   * Generates schema validation test suite
   */
  schemaValidation: createSchemaTestSuite,

  /**
   * Generates async operation test suite
   */
  asyncOperations: (
    operationName: string,
    operations: Array<() => Promise<unknown>>,
    config: { timeout?: number; retries?: number } = {},
  ) => {
    const { timeout = 5000, retries = 3 } = config;

    return operations.map((operation, index) => ({
      name: `should complete ${operationName} operation ${index + 1}`,
      test: async () => {
        let attempt = 0;
        let lastError: unknown;

        while (attempt < retries) {
          try {
            await promiseUtils.withTimeout(operation(), timeout);
            return; // Success
          } catch (error) {
            lastError = error;
            attempt++;
          }
        }

        throw lastError;
      },
    }));
  },

  /**
   * Generates mock validation test suite
   */
  mockValidation: (
    mockName: string,
    mockFactories: Array<() => unknown>,
    validators: Array<(mock: unknown) => boolean>,
  ) => {
    return mockFactories.map((factory, index) => ({
      name: `should create valid ${mockName} mock ${index + 1}`,
      test: () => {
        const mock = factory();
        for (const validator of validators) {
          expect(validator(mock)).toBe(true);
        }
      },
    }));
  },
} as const;

/**
 * Default export for convenience
 */
export default testUtils;
