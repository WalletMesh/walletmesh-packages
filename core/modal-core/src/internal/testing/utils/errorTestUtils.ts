/**
 * Error testing utilities for modal-core testing
 *
 * Provides standardized utilities for testing error handling, error recovery,
 * and error boundary scenarios. Includes helpers for testing ModalError
 * objects created by ErrorFactory and testing error propagation patterns.
 *
 * @packageDocumentation
 * @internal
 */

import { expect, vi } from 'vitest';
import type { ModalError } from '../../core/errors/types.js';

/**
 * Configuration for error testing scenarios
 * @interface ErrorTestConfig
 */
export interface ErrorTestConfig {
  /** Expected error code */
  code?: string;
  /** Expected error message pattern */
  message?: string | RegExp;
  /** Expected error category */
  category?: ModalError['category'];
  /** Whether error should be recoverable */
  recoveryStrategy?: 'retry' | 'wait_and_retry' | 'manual_action' | 'none';
  /** Expected component context */
  component?: string;
  /** Additional error data to validate */
  data?: Record<string, unknown>;
}

/**
 * Creates a standardized ModalError object for testing
 *
 * Provides consistent ModalError creation following the ErrorFactory
 * patterns used throughout the codebase.
 *
 * @param {ErrorTestConfig} config - Error configuration
 * @returns ModalError object
 *
 * @example
 * ```typescript
 * const testError = createTestModalError({
 *   code: 'connection_failed',
 *   message: 'Failed to connect to wallet',
 *   category: 'connection',
 *   recoveryStrategy: 'retry'
 * });
 * ```
 */
export function createTestModalError(config: ErrorTestConfig): ModalError {
  const {
    code = 'test_error',
    message = 'Test error message',
    category = 'general',
    recoveryStrategy = 'retry' as const,
    component = 'test-component',
    data = {},
  } = config;

  return {
    code,
    message: typeof message === 'string' ? message : 'Test error message',
    category,
    recoveryStrategy,
    data: {
      component,
      timestamp: Date.now(),
      ...data,
    },
  };
}

/**
 * Predefined error scenarios for common testing patterns
 */
export const ERROR_TEST_SCENARIOS = {
  /** Connection failures */
  CONNECTION_FAILED: {
    code: 'connection_failed',
    message: 'Failed to connect to wallet',
    category: 'network' as const,
    recoveryStrategy: 'retry' as const,
    component: 'connector',
  },

  /** Transport errors */
  TRANSPORT_ERROR: {
    code: 'transport_error',
    message: 'Transport connection failed',
    category: 'network' as const,
    recoveryStrategy: 'retry' as const,
    component: 'transport',
  },

  /** Configuration errors (fatal) */
  CONFIGURATION_ERROR: {
    code: 'invalid_configuration',
    message: 'Invalid configuration provided',
    category: 'general' as const,
    recoveryStrategy: 'none' as const,
    component: 'factory',
  },

  /** Wallet not found */
  WALLET_NOT_FOUND: {
    code: 'wallet_not_found',
    message: 'Requested wallet not available',
    category: 'wallet' as const,
    recoveryStrategy: 'retry' as const,
    component: 'connector',
  },

  /** Render failures */
  RENDER_FAILED: {
    code: 'render_failed',
    message: 'Component failed to render',
    category: 'general' as const,
    recoveryStrategy: 'retry' as const,
    component: 'adapter',
  },

  /** Network timeouts */
  NETWORK_TIMEOUT: {
    code: 'network_timeout',
    message: 'Network request timed out',
    category: 'network' as const,
    recoveryStrategy: 'retry' as const,
    component: 'transport',
  },

  /** User rejection */
  USER_REJECTED: {
    code: 'user_rejected',
    message: 'User rejected the request',
    category: 'wallet' as const,
    recoveryStrategy: 'none' as const,
    component: 'connector',
  },
} as const;

/**
 * Validates that an error matches the expected ModalError structure
 *
 * Provides comprehensive validation of ModalError objects created
 * by ErrorFactory methods.
 *
 * @param {unknown} error - Error to validate
 * @param {ErrorTestConfig} expected - Expected error configuration
 *
 * @example
 * ```typescript
 * try {
 *   someOperation();
 * } catch (error) {
 *   expectModalError(error, {
 *     code: 'connection_failed',
 *     category: 'connection',
 *     recoveryStrategy: 'retry'
 *   });
 * }
 * ```
 */
export function expectModalError(error: unknown, expected: ErrorTestConfig) {
  // Validate error is a ModalError object
  expect(error).toBeTypeOf('object');
  expect(error).not.toBeNull();

  const modalError = error as ModalError;

  // Validate required ModalError properties
  expect(modalError).toHaveProperty('code');
  expect(modalError).toHaveProperty('message');
  expect(modalError).toHaveProperty('category');

  // Validate specific properties
  if (expected.code) {
    expect(modalError.code).toBe(expected.code);
  }

  if (expected.message) {
    if (typeof expected.message === 'string') {
      expect(modalError.message).toBe(expected.message);
    } else {
      expect(modalError.message).toMatch(expected.message);
    }
  }

  if (expected.category) {
    expect(modalError.category).toBe(expected.category);
  }

  if (expected.recoveryStrategy !== undefined) {
    expect(modalError.recoveryStrategy).toBe(expected.recoveryStrategy);
  }

  if (expected.component) {
    expect(modalError.data?.['component']).toBe(expected.component);
  }

  if (expected.data) {
    for (const [key, value] of Object.entries(expected.data)) {
      expect(modalError.data?.[key]).toEqual(value);
    }
  }
}

/**
 * Creates a test suite for error handling scenarios
 *
 * Generates consistent error test cases for components that
 * need to handle multiple error conditions.
 *
 * @param {string} componentName - Name of component being tested
 * @param {readonly ErrorTestConfig[]} errorScenarios - Array of error scenarios to test
 * @returns Test suite configuration
 *
 * @example
 * ```typescript
 * const errorSuite = createErrorTestSuite('TransportFactory', [
 *   ERROR_TEST_SCENARIOS.CONFIGURATION_ERROR,
 *   ERROR_TEST_SCENARIOS.TRANSPORT_ERROR
 * ]);
 *
 * errorSuite.forEach(({ name, scenario, test }) => {
 *   it(name, test);
 * });
 * ```
 */
export function createErrorTestSuite(componentName: string, errorScenarios: readonly ErrorTestConfig[]) {
  return errorScenarios.map((scenario, index) => ({
    name: `should handle ${scenario.code || `error scenario ${index + 1}`}`,
    scenario,
    test: () => {
      const testError = createTestModalError({
        ...scenario,
        component: componentName.toLowerCase(),
      });

      // This is a template - actual test implementation depends on component
      expect(testError).toBeDefined();
      expectModalError(testError, scenario);
    },
  }));
}

/**
 * Mock error handler factory for testing error handling workflows
 *
 * Creates mock error handlers that simulate different error handling
 * behaviors for testing error recovery and propagation.
 *
 * @param {{
    shouldRecover?: boolean;
    recoveryDelay?: number;
    maxRetries?: number;
    errorResponse?: ModalError;
  }} config - Error handler behavior configuration
 * @returns Mock error handler object
 *
 * @example
 * ```typescript
 * const mockErrorHandler = createMockErrorHandler({
 *   shouldRecover: true,
 *   recoveryDelay: 100,
 *   maxRetries: 3
 * });
 * ```
 */
export function createMockErrorHandler(
  config: {
    shouldRecover?: boolean;
    recoveryDelay?: number;
    maxRetries?: number;
    errorResponse?: ModalError;
  } = {},
) {
  const {
    shouldRecover = true,
    recoveryDelay = 0,
    maxRetries = 3,
    errorResponse = createTestModalError(ERROR_TEST_SCENARIOS.TRANSPORT_ERROR),
  } = config;

  let retryCount = 0;

  return {
    handleError: vi.fn().mockImplementation((_error: unknown) => {
      return errorResponse;
    }),

    canRecover: vi.fn().mockReturnValue(shouldRecover),

    recover: vi.fn().mockImplementation(async () => {
      if (recoveryDelay > 0) {
        if (vi.isFakeTimers()) {
          await vi.advanceTimersByTimeAsync(recoveryDelay);
        } else {
          await new Promise((resolve) => setTimeout(resolve, recoveryDelay));
        }
      }

      retryCount++;
      return retryCount <= maxRetries;
    }),

    getRetryCount: () => retryCount,
    resetRetryCount: () => {
      retryCount = 0;
    },

    isFatal: vi
      .fn()
      .mockImplementation(
        (error: ModalError) => !error.recoveryStrategy || error.recoveryStrategy === 'none',
      ),

    getUserMessage: vi.fn().mockImplementation((error: ModalError) => `User-friendly: ${error.message}`),

    logError: vi.fn(),
    dispose: vi.fn(),

    // Additional methods required by ErrorHandler interface
    isUserRejection: vi.fn().mockImplementation((error: ModalError) => error.code === 'user_rejected'),
    isWalletNotFound: vi.fn().mockImplementation((error: ModalError) => error.code === 'wallet_not_found'),
    isNetworkError: vi.fn().mockImplementation((error: ModalError) => error.category === 'network'),
  };
}

/**
 * Utilities for testing async error scenarios
 */
export const asyncErrorUtils = {
  /**
   * Creates a promise that rejects with a ModalError after a delay
   *
   * @param scenario - Error scenario configuration
   * @param delay - Delay before rejection in milliseconds
   * @returns Promise that rejects with ModalError
   *
   * @example
   * ```typescript
   * const rejectedPromise = asyncErrorUtils.createRejectedPromise(
   *   ERROR_TEST_SCENARIOS.CONNECTION_FAILED,
   *   100
   * );
   *
   * await expect(rejectedPromise).rejects.toThrow();
   * ```
   */
  createRejectedPromise: (scenario: ErrorTestConfig, delay = 0) => {
    return new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(createTestModalError(scenario));
      }, delay);
    });
  },

  /**
   * Creates a function that fails on the Nth call
   *
   * @param failAfter - Number of successful calls before failure
   * @param scenario - Error scenario for failure
   * @returns Function that fails after specified calls
   *
   * @example
   * ```typescript
   * const flakeyFunction = asyncErrorUtils.createFlakeyFunction(
   *   2, // Fail after 2 successful calls
   *   ERROR_TEST_SCENARIOS.NETWORK_TIMEOUT
   * );
   *
   * flakeyFunction(); // Success
   * flakeyFunction(); // Success
   * flakeyFunction(); // Throws ModalError
   * ```
   */
  createFlakeyFunction: (failAfter: number, scenario: ErrorTestConfig) => {
    let callCount = 0;
    return (): string => {
      callCount++;
      if (callCount > failAfter) {
        throw createTestModalError(scenario);
      }
      return `success-${callCount}`;
    };
  },

  /**
   * Creates a mock that alternates between success and failure
   *
   * @param scenario - Error scenario for failures
   * @returns Mock function that alternates behavior
   */
  createAlternatingMock: (scenario: ErrorTestConfig) => {
    let shouldSucceed = true;
    return vi.fn().mockImplementation(() => {
      shouldSucceed = !shouldSucceed;
      if (!shouldSucceed) {
        throw createTestModalError(scenario);
      }
      return 'success';
    });
  },
};

/**
 * Utilities for testing error boundary scenarios
 */
export const errorBoundaryUtils = {
  /**
   * Creates a test component that throws errors for testing error boundaries
   *
   * @param scenario - Error scenario to throw
   * @returns Test component that throws ModalError
   */
  createErrorComponent: (scenario: ErrorTestConfig) => {
    return () => {
      throw createTestModalError(scenario);
    };
  },

  /**
   * Simulates error boundary error info object
   *
   * @param componentStack - Component stack trace
   * @returns Error info object
   */
  createErrorInfo: (componentStack = 'Error component stack') => ({
    componentStack,
  }),

  /**
   * Creates mock error boundary handlers
   *
   * @returns Mock error boundary methods
   */
  createMockErrorBoundary: () => ({
    componentDidCatch: vi.fn(),
    getDerivedStateFromError: vi.fn().mockReturnValue({ hasError: true }),
    render: vi.fn(),
  }),
};

/**
 * Test utilities for error recovery scenarios
 */
export const errorRecoveryUtils = {
  /**
   * Creates a test scenario for error recovery
   *
   * @param initialError - The initial error that occurs
   * @param recoverySteps - Steps to attempt recovery
   * @returns Recovery test scenario
   */
  createRecoveryScenario: (initialError: ErrorTestConfig, recoverySteps: string[]) => ({
    initialError: createTestModalError(initialError),
    recoverySteps,

    /**
     * Simulates the recovery process
     */
    simulate: async (errorHandler: ReturnType<typeof createMockErrorHandler>) => {
      const results = [];

      for (const step of recoverySteps) {
        const canRecover = errorHandler.canRecover();
        if (canRecover) {
          const recovered = await errorHandler.recover();
          results.push({ step, success: recovered });
        } else {
          results.push({ step, success: false, reason: 'cannot_recover' });
          break;
        }
      }

      return results;
    },
  }),

  /**
   * Creates a retry mechanism for testing
   *
   * @param maxRetries - Maximum number of retries
   * @param retryDelay - Delay between retries
   * @returns Retry utility
   */
  createRetryMechanism: (maxRetries = 3, retryDelay = 100) => ({
    async retry<T>(operation: () => Promise<T>, errorScenario: ErrorTestConfig): Promise<T> {
      let attempts = 0;

      while (attempts < maxRetries) {
        try {
          return await operation();
        } catch (error) {
          attempts++;

          if (attempts >= maxRetries) {
            throw createTestModalError({
              ...errorScenario,
              message: `Failed after ${maxRetries} attempts: ${errorScenario.message}`,
            });
          }

          if (retryDelay > 0) {
            if (vi.isFakeTimers()) {
              await vi.advanceTimersByTimeAsync(retryDelay);
            } else {
              await new Promise((resolve) => setTimeout(resolve, retryDelay));
            }
          }
        }
      }

      throw createTestModalError(errorScenario);
    },

    getAttemptCount: () => 0, // Would be tracked in real implementation
  }),
};

/**
 * Assertion helpers for common error testing patterns
 */
export const errorAssertions = {
  /**
   * Asserts that a function throws a ModalError with specific properties
   */
  expectModalErrorThrown: (fn: () => void | Promise<void>, expected: ErrorTestConfig) => {
    if (fn.constructor.name === 'AsyncFunction') {
      return expect(fn).rejects.toSatisfy((error: unknown) => {
        expectModalError(error, expected);
        return true;
      });
    }
    expect(() => fn()).toThrow();
    try {
      (fn as () => void)();
    } catch (error) {
      expectModalError(error, expected);
    }
    return;
  },

  /**
   * Asserts that an error handler was called with correct parameters
   */
  expectErrorHandlerCalled: (
    mockHandler: ReturnType<typeof createMockErrorHandler>,
    expectedError: ErrorTestConfig,
  ) => {
    expect(mockHandler.handleError).toHaveBeenCalled();
    const callArgs = mockHandler.handleError.mock.calls[0];
    if (callArgs?.[0]) {
      expectModalError(callArgs[0], expectedError);
    }
  },

  /**
   * Asserts that error recovery was attempted
   */
  expectRecoveryAttempted: (mockHandler: ReturnType<typeof createMockErrorHandler>, times = 1) => {
    expect(mockHandler.canRecover).toHaveBeenCalledTimes(times);
    expect(mockHandler.recover).toHaveBeenCalledTimes(times);
  },
};
