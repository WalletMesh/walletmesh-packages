/**
 * Simplified Testing Utilities for Service Factory Pattern
 *
 * Provides easy-to-use testing utilities that work with the new Service Factory
 * pattern, replacing the complex DI container testing with simple mock injection.
 *
 * @internal
 */

import { expect, vi } from 'vitest';
import type { SessionState } from '../../../api/types/sessionState.js';
import type { ErrorHandler } from '../errors/errorHandler.js';
import { type CoreServices, createTestServices } from '../factories/serviceFactory.js';
import type { Logger } from '../logger/logger.js';

/**
 * Mock service implementations for testing
 * @interface MockServices
 */
export interface MockServices {
  logger: MockLogger;
  errorHandler: MockErrorHandler;
  getStore: ReturnType<typeof vi.fn>;
}

/**
 * Mock Logger implementation
 * @interface MockLogger
 */
export interface MockLogger extends Logger {
  debug: ReturnType<typeof vi.fn>;
  info: ReturnType<typeof vi.fn>;
  warn: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
  dispose: ReturnType<typeof vi.fn>;
}

/**
 * Mock ErrorHandler implementation
 * @interface MockErrorHandler
 */
export interface MockErrorHandler extends ErrorHandler {
  handleError: ReturnType<typeof vi.fn>;
  dispose: ReturnType<typeof vi.fn>;
}

/**
 * Mock store state structure
 * @interface MockStoreState
 */
export interface MockStoreState {
  ui: {
    isOpen: boolean;
    currentView: string;
    isLoading: boolean;
    error?: unknown;
  };
  sessions: {
    activeSessionId: string | null;
    activeSessions: Map<string, SessionState>;
  };
  actions: {
    ui: {
      openModal: ReturnType<typeof vi.fn>;
      closeModal: ReturnType<typeof vi.fn>;
      setView: ReturnType<typeof vi.fn>;
      setLoading: ReturnType<typeof vi.fn>;
      setError: ReturnType<typeof vi.fn>;
    };
    sessions: {
      createSession: ReturnType<typeof vi.fn>;
      endSession: ReturnType<typeof vi.fn>;
      getActiveSession: ReturnType<typeof vi.fn>;
    };
  };
}

/**
 * Configuration for creating test services
 * @interface TestServiceConfig
 */
export interface TestServiceConfig {
  /** Mock configuration for logger */
  logger?: Partial<MockLogger>;
  /** Mock configuration for error handler */
  errorHandler?: Partial<MockErrorHandler>;
  /** Mock configuration for store state */
  storeState?: Partial<MockStoreState>;
  /** Whether to use real implementations instead of mocks */
  useReal?: {
    logger?: boolean;
    errorHandler?: boolean;
    store?: boolean;
  };
}

/**
 * Simple test service factory
 *
 * Creates services optimized for testing with easy mocking capabilities.
 * Much simpler than the DI container approach.
 * @class TestServiceFactory
 */
export class TestServiceFactory {
  private static instance: TestServiceFactory | null = null;

  /**
   * Get singleton instance
   */
  static getInstance(): TestServiceFactory {
    if (!TestServiceFactory.instance) {
      TestServiceFactory.instance = new TestServiceFactory();
    }
    return TestServiceFactory.instance;
  }

  /**
   * Create mock services with optional overrides
   * @param {TestServiceConfig} [config={}] - Configuration for mock services
   * @returns {MockServices} Mock service instances
   */
  createMockServices(config: TestServiceConfig = {}): MockServices {
    return {
      logger: this.createMockLogger(config.logger),
      errorHandler: this.createMockErrorHandler(config.errorHandler),
      getStore: this.createMockStoreGetter(config.storeState),
    };
  }

  /**
   * Create test services with mix of real and mock implementations
   * @param {TestServiceConfig} [config={}] - Configuration for test services
   * @returns {CoreServices} Test service instances
   */
  createTestServices(config: TestServiceConfig = {}): CoreServices {
    const useReal = config.useReal || {};

    // Create real services if requested, otherwise use mocks
    const logger = useReal.logger ? createTestServices().logger : this.createMockLogger(config.logger);

    const errorHandler = useReal.errorHandler
      ? createTestServices().errorHandler
      : this.createMockErrorHandler(config.errorHandler);

    const getStore = useReal.store
      ? createTestServices().getStore
      : this.createMockStoreGetter(config.storeState);

    return { logger, errorHandler, getStore };
  }

  /**
   * Create a mock logger
   * @param {Partial<MockLogger>} [overrides] - Optional method overrides for the mock logger
   */
  private createMockLogger(overrides: Partial<MockLogger> = {}): MockLogger {
    const mock = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      dispose: vi.fn(),
      ...overrides,
    } as MockLogger;

    return mock;
  }

  /**
   * Create a mock error handler
   * @param {Partial<MockErrorHandler>} [overrides] - Optional method overrides for the mock error handler
   */
  private createMockErrorHandler(overrides: Partial<MockErrorHandler> = {}): MockErrorHandler {
    const mock = {
      handleError: vi.fn().mockReturnValue({
        code: 'TEST_ERROR',
        message: 'Test error',
        category: 'test',
        fatal: false,
      }),
      dispose: vi.fn(),
      ...overrides,
    } as MockErrorHandler;

    return mock;
  }

  /**
   * Create mock store getter
   * @param {Partial<MockStoreState>} [storeState] - Optional store state overrides
   */
  private createMockStoreGetter(storeState: Partial<MockStoreState> = {}) {
    const defaultState: MockStoreState = {
      ui: {
        isOpen: false,
        currentView: 'walletSelection',
        isLoading: false,
        ...storeState.ui,
      },
      sessions: {
        activeSessionId: null,
        activeSessions: new Map(),
        ...storeState.sessions,
      },
      actions: {
        ui: {
          openModal: vi.fn(),
          closeModal: vi.fn(),
          setView: vi.fn(),
          setLoading: vi.fn(),
          setError: vi.fn(),
        },
        sessions: {
          createSession: vi.fn(),
          endSession: vi.fn(),
          getActiveSession: vi.fn().mockReturnValue(null),
        },
      },
    };

    return vi.fn().mockReturnValue(defaultState);
  }

  /**
   * Reset all mocks in a service collection
   * @param {MockServices} services - Mock services to reset
   */
  resetMocks(services: MockServices): void {
    // Reset logger mocks
    services.logger.debug.mockReset();
    services.logger.info.mockReset();
    services.logger.warn.mockReset();
    services.logger.error.mockReset();
    services.logger.dispose.mockReset();

    // Reset error handler mocks
    services.errorHandler.handleError.mockReset();
    services.errorHandler.dispose.mockReset();

    // Reset store getter mock
    if (vi.isMockFunction(services.getStore)) {
      services.getStore.mockReset();
      // Also reset the mock store state
      const mockState = services.getStore();
      if (mockState?.actions) {
        // Reset UI actions
        if (mockState.actions.ui) {
          for (const action of Object.values(mockState.actions.ui)) {
            if (vi.isMockFunction(action)) {
              action.mockReset();
            }
          }
        }
        // Reset session actions
        if (mockState.actions.sessions) {
          for (const action of Object.values(mockState.actions.sessions)) {
            if (vi.isMockFunction(action)) {
              action.mockReset();
            }
          }
        }
      }
    }
  }

  /**
   * Clear all mock call history
   * @param {MockServices} services - Mock services to clear
   */
  clearMocks(services: MockServices): void {
    // Similar to resetMocks but uses mockClear instead
    services.logger.debug.mockClear();
    services.logger.info.mockClear();
    services.logger.warn.mockClear();
    services.logger.error.mockClear();
    services.logger.dispose.mockClear();

    services.errorHandler.handleError.mockClear();
    services.errorHandler.dispose.mockClear();

    // Clear store getter mock
    if (vi.isMockFunction(services.getStore)) {
      services.getStore.mockClear();
      // Also clear the mock store state
      const mockState = services.getStore();
      if (mockState?.actions) {
        // Clear UI actions
        if (mockState.actions.ui) {
          for (const action of Object.values(mockState.actions.ui)) {
            if (vi.isMockFunction(action)) {
              action.mockClear();
            }
          }
        }
        // Clear session actions
        if (mockState.actions.sessions) {
          for (const action of Object.values(mockState.actions.sessions)) {
            if (vi.isMockFunction(action)) {
              action.mockClear();
            }
          }
        }
      }
    }
  }

  /**
   * Reset singleton (for test isolation)
   */
  static reset(): void {
    TestServiceFactory.instance = null;
  }
}

/**
 * Convenient factory functions
 */

/**
 * Create mock services for testing
 * @param {TestServiceConfig} [config={}] - Configuration for mock services
 * @returns {MockServices} Mock service instances
 */
export function createMockServices(config: TestServiceConfig = {}): MockServices {
  const factory = TestServiceFactory.getInstance();
  return factory.createMockServices(config);
}

/**
 * Create test services with mix of real and mock implementations
 * @param {TestServiceConfig} [config={}] - Configuration for hybrid test services
 * @returns {CoreServices} Test service instances
 */
export function createHybridTestServices(config: TestServiceConfig = {}): CoreServices {
  const factory = TestServiceFactory.getInstance();
  return factory.createTestServices(config);
}

/**
 * Reset all test service mocks
 * @param {MockServices} services - Mock services to reset
 */
export function resetAllMocks(services: MockServices): void {
  const factory = TestServiceFactory.getInstance();
  factory.resetMocks(services);
}

/**
 * Clear all test service mock history
 * @param {MockServices} services - Mock services to clear
 */
export function clearAllMocks(services: MockServices): void {
  const factory = TestServiceFactory.getInstance();
  factory.clearMocks(services);
}

/**
 * Test assertion helpers
 * @class ServiceAssertions
 */
export class ServiceAssertions {
  constructor(private services: MockServices) {}

  /**
   * Assert that logger was called with specific level and message
   * @param {'debug' | 'info' | 'warn' | 'error'} level - Log level to check
   * @param {string} [message] - Optional message to verify
   * @returns {this} For method chaining
   */
  expectLoggerCalled(level: 'debug' | 'info' | 'warn' | 'error', message?: string): this {
    const loggerMethod = this.services.logger[level];

    if (message) {
      expect(loggerMethod).toHaveBeenCalledWith(expect.stringContaining(message));
    } else {
      expect(loggerMethod).toHaveBeenCalled();
    }

    return this;
  }

  /**
   * Assert that error handler was called
   * @param {Error | string} [error] - Optional error object or message to verify
   * @returns {this} For method chaining
   */
  expectErrorHandled(error?: Error | string): this {
    if (error) {
      if (typeof error === 'string') {
        expect(this.services.errorHandler.handleError).toHaveBeenCalledWith(
          expect.objectContaining({ message: expect.stringContaining(error) }),
        );
      } else {
        expect(this.services.errorHandler.handleError).toHaveBeenCalledWith(error);
      }
    } else {
      expect(this.services.errorHandler.handleError).toHaveBeenCalled();
    }

    return this;
  }

  /**
   * Assert that UI action was called
   * @param {'openModal' | 'closeModal' | 'setView' | 'setLoading'} action - UI action name to check
   * @param {...unknown} args - Expected arguments for the action
   * @returns {this} For method chaining
   */
  expectUIAction(
    action: 'openModal' | 'closeModal' | 'setView' | 'setLoading' | 'setError',
    ...args: unknown[]
  ): this {
    const mockStore = this.services.getStore();
    const uiAction = mockStore?.actions?.ui?.[action];

    if (!uiAction) {
      throw new Error(`UI action '${action}' not found in mock store`);
    }

    if (args.length > 0) {
      expect(uiAction).toHaveBeenCalledWith(...args);
    } else {
      expect(uiAction).toHaveBeenCalled();
    }

    return this;
  }

  /**
   * Assert that connection action was called
   * @param {'setConnecting' | 'setConnected' | 'setDisconnected' | 'updateAccounts' | 'updateChain'} action - Connection action name to check
   * @param {...unknown} args - Expected arguments for the action
   * @returns {this} For method chaining
   */
  expectSessionAction(action: 'createSession' | 'endSession' | 'getActiveSession', ...args: unknown[]): this {
    const mockStore = this.services.getStore();
    const sessionAction = mockStore?.actions?.sessions?.[action];

    if (!sessionAction) {
      throw new Error(`Session action '${action}' not found in mock store`);
    }

    if (args.length > 0) {
      expect(sessionAction).toHaveBeenCalledWith(...args);
    } else {
      expect(sessionAction).toHaveBeenCalled();
    }

    return this;
  }

  /**
   * Assert that store state matches expected values
   * @param {Partial<MockStoreState>} expectedState - Expected state values
   * @returns {this} For method chaining
   */
  expectStoreState(expectedState: Partial<MockStoreState>): this {
    const mockStore = this.services.getStore();

    if (expectedState.ui) {
      expect(mockStore.ui).toMatchObject(expectedState.ui);
    }

    if (expectedState.sessions) {
      expect(mockStore.sessions).toMatchObject(expectedState.sessions);
    }

    return this;
  }

  /**
   * Assert that no interactions occurred with a service
   * @param {'logger' | 'errorHandler' | 'stores'} service - Service name to check for no interactions
   * @returns {this} For method chaining
   */
  expectNoInteractions(service: 'logger' | 'errorHandler' | 'stores'): this {
    switch (service) {
      case 'logger':
        expect(this.services.logger.debug).not.toHaveBeenCalled();
        expect(this.services.logger.info).not.toHaveBeenCalled();
        expect(this.services.logger.warn).not.toHaveBeenCalled();
        expect(this.services.logger.error).not.toHaveBeenCalled();
        break;
      case 'errorHandler':
        expect(this.services.errorHandler.handleError).not.toHaveBeenCalled();
        break;
      case 'stores':
        expect(this.services.getStore).not.toHaveBeenCalled();
        break;
    }

    return this;
  }
}

/**
 * Create assertion helper for test services
 * @param {MockServices} services - Mock services to create assertions for
 * @returns {ServiceAssertions} Assertion helper instance
 */
export function createServiceAssertions(services: MockServices): ServiceAssertions {
  return new ServiceAssertions(services);
}

/**
 * Reset test service factory state (for test isolation)
 */
export function resetTestServices(): void {
  TestServiceFactory.reset();
}
