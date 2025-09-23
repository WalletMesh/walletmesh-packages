/**
 * Comprehensive tests for serviceFactory.ts to achieve 100% coverage
 * @internal
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockErrorHandler,
  createMockLogger,
  createTestEnvironment,
  installCustomMatchers,
} from '../../../testing/index.js';
import { ErrorHandler } from '../errors/errorHandler.js';
import { createLogger } from '../logger/logger.js';
import type { Logger } from '../logger/logger.js';
// Removed imports for storeSlices as they're no longer used
import {
  type CoreServicesConfig,
  ServiceFactory,
  type TestServices,
  createComponentServices,
  createCoreServices,
  createTestServices,
  getCoreServices,
  getErrorHandler,
  getLogger,
  getStore,
  resetServices,
} from './serviceFactory.js';

// Install custom matchers
installCustomMatchers();

// Mock dependencies
vi.mock('../logger/logger.js', () => ({
  createLogger: vi.fn(),
  createDebugLogger: vi.fn(),
}));

vi.mock('../errors/errorHandler.js', () => ({
  ErrorHandler: vi.fn(),
}));

// Removed mock for storeSlices as it's no longer used

describe('ServiceFactory', () => {
  const testEnv = createTestEnvironment();
  let mockLogger: Logger;
  let mockErrorHandler: ErrorHandler;

  beforeEach(async () => {
    await testEnv.setup();

    // Create mock services using testing utilities
    mockLogger = createMockLogger();
    mockErrorHandler = createMockErrorHandler();

    // Setup mocks
    vi.mocked(createLogger).mockImplementation(() => mockLogger);
    vi.mocked(ErrorHandler).mockImplementation(() => mockErrorHandler);

    // Reset the singleton before each test
    resetServices();
  });

  afterEach(async () => {
    vi.clearAllMocks();
    resetServices();
    await testEnv.teardown();
  });

  describe('ServiceFactory class', () => {
    describe('getInstance', () => {
      it('should return singleton instance', () => {
        const factory1 = ServiceFactory.getInstance();
        const factory2 = ServiceFactory.getInstance();

        expect(factory1).toBe(factory2);
        expect(factory1).toBeInstanceOf(ServiceFactory);
      });

      it('should create new instance if none exists', () => {
        const factory = ServiceFactory.getInstance();
        expect(factory).toBeInstanceOf(ServiceFactory);
      });
    });

    describe('createServices', () => {
      it('should create services with default configuration', () => {
        const factory = ServiceFactory.getInstance();
        const services = factory.createServices();

        expect(createLogger).toHaveBeenCalledWith({
          level: 'info',
          prefix: '[WalletMesh]',
        });
        expect(ErrorHandler).toHaveBeenCalledWith(mockLogger);
        expect(services).toEqual({
          logger: mockLogger,
          errorHandler: mockErrorHandler,
          getStore: expect.any(Function),
        });
      });

      it('should create services with custom configuration', () => {
        const factory = ServiceFactory.getInstance();
        const config: CoreServicesConfig = {
          logger: {
            level: 'debug',
            prefix: '[CustomPrefix]',
            enableColors: true,
          },
          errorHandler: {
            enableRecovery: true,
            maxRetryAttempts: 5,
            suppressConsoleErrors: false,
          },
          stores: {
            enableDevtools: true,
            persistState: true,
          },
        };

        const services = factory.createServices(config);

        expect(createLogger).toHaveBeenCalledWith({
          level: 'debug',
          prefix: '[CustomPrefix]',
        });
        expect(services.logger).toBe(mockLogger);
        expect(services.errorHandler).toBe(mockErrorHandler);
        expect(services.getStore).toBeDefined();
        expect(typeof services.getStore).toBe('function');
      });

      it('should create services with partial configuration', () => {
        const factory = ServiceFactory.getInstance();
        const config: CoreServicesConfig = {
          logger: {
            level: 'warn',
          },
        };

        const services = factory.createServices(config);

        expect(createLogger).toHaveBeenCalledWith({
          level: 'warn',
          prefix: '[WalletMesh]',
        });
        expect(services).toBeDefined();
      });

      it('should store created services internally', () => {
        const factory = ServiceFactory.getInstance();
        const services1 = factory.createServices();
        const services2 = factory.getServices();

        expect(services1).toBe(services2);
      });
    });

    describe('getServices', () => {
      it('should return existing services', () => {
        const factory = ServiceFactory.getInstance();
        const createdServices = factory.createServices();
        const retrievedServices = factory.getServices();

        expect(retrievedServices).toBe(createdServices);
      });

      it('should create services with defaults if none exist', () => {
        const factory = ServiceFactory.getInstance();
        const services = factory.getServices();

        expect(services).toBeDefined();
        expect(services.logger).toBe(mockLogger);
        expect(services.errorHandler).toBe(mockErrorHandler);
        expect(services.getStore).toBeDefined();
        expect(typeof services.getStore).toBe('function');
      });
    });

    describe('reset', () => {
      it('should dispose of existing services and reset state', () => {
        const factory = ServiceFactory.getInstance();
        const services = factory.createServices();
        expect(services).toBeDefined();

        factory.reset();

        // After reset, the factory should be cleared
        const newFactory = ServiceFactory.getInstance();
        expect(newFactory).not.toBe(factory);
      });

      it('should handle reset when stores do not have dispose method', () => {
        const factory = ServiceFactory.getInstance();
        factory.createServices();

        // Since stores no longer have dispose, this should just work
        expect(() => factory.reset()).not.toThrow();
      });

      it('should handle reset when no services exist', () => {
        const factory = ServiceFactory.getInstance();

        expect(() => factory.reset()).not.toThrow();
      });

      it('should reset singleton instance', () => {
        const factory1 = ServiceFactory.getInstance();
        factory1.reset();
        const factory2 = ServiceFactory.getInstance();

        // After reset, getInstance should create a new instance
        expect(factory2).toBeInstanceOf(ServiceFactory);
      });
    });

    describe('private methods', () => {
      it('should create logger with custom config', () => {
        const factory = ServiceFactory.getInstance();
        const config: CoreServicesConfig = {
          logger: {
            level: 'error',
            prefix: '[Test]',
            enableColors: false,
          },
        };

        factory.createServices(config);

        expect(createLogger).toHaveBeenCalledWith({
          level: 'error',
          prefix: '[Test]',
        });
      });

      it('should create error handler with logger dependency', () => {
        const factory = ServiceFactory.getInstance();
        factory.createServices();

        expect(ErrorHandler).toHaveBeenCalledWith(mockLogger);
      });

      it('should create store getter function', () => {
        const factory = ServiceFactory.getInstance();
        const services = factory.createServices();

        expect(services.getStore).toBeDefined();
        expect(typeof services.getStore).toBe('function');
      });
    });
  });

  describe('Factory functions', () => {
    describe('createCoreServices', () => {
      it('should create core services with default config', () => {
        const services = createCoreServices();

        expect(services.logger).toBe(mockLogger);
        expect(services.errorHandler).toBe(mockErrorHandler);
        expect(services.getStore).toBeDefined();
        expect(typeof services.getStore).toBe('function');
      });

      it('should create core services with custom config', () => {
        const config: CoreServicesConfig = {
          logger: { level: 'debug' },
          errorHandler: { enableRecovery: true },
        };

        const services = createCoreServices(config);

        expect(createLogger).toHaveBeenCalledWith({
          level: 'debug',
          prefix: '[WalletMesh]',
        });
        expect(services).toBeDefined();
      });
    });

    describe('getCoreServices', () => {
      it('should get existing core services', () => {
        const created = createCoreServices();
        const retrieved = getCoreServices();

        expect(retrieved).toBe(created);
      });

      it('should create services if none exist', () => {
        const services = getCoreServices();

        expect(services).toBeDefined();
        expect(services.logger).toBe(mockLogger);
      });
    });

    describe('resetServices', () => {
      it('should reset the service factory', () => {
        const factory = ServiceFactory.getInstance();
        factory.createServices();
        const hadServices = factory.getServices() !== null;

        resetServices();

        // After reset, getInstance should return a new instance
        const newFactory = ServiceFactory.getInstance();
        expect(newFactory).not.toBe(factory);
        expect(hadServices).toBe(true);
      });
    });

    describe('createComponentServices', () => {
      it('should create component services with default config', () => {
        // First create core services
        createCoreServices();

        const componentServices = createComponentServices('TestComponent');

        expect(createLogger).toHaveBeenCalledWith({
          level: 'info',
          prefix: '[TestComponent]',
        });
        expect(componentServices.logger).toBe(mockLogger);
        expect(componentServices.errorHandler).toBe(mockErrorHandler);
      });

      it('should create component services with custom config', () => {
        createCoreServices();

        const config: CoreServicesConfig = {
          logger: {
            level: 'debug',
            prefix: '[OverriddenPrefix]',
          },
        };

        const componentServices = createComponentServices('MyComponent', config);

        expect(createLogger).toHaveBeenCalledWith({
          level: 'debug',
          prefix: '[MyComponent]',
        });
        expect(componentServices.logger).toBe(mockLogger);
      });

      it('should use core services error handler', () => {
        createCoreServices();

        const componentServices = createComponentServices('TestComponent');

        expect(componentServices.errorHandler).toBe(mockErrorHandler);
      });
    });

    describe('Service locator functions', () => {
      describe('getLogger', () => {
        it('should return the core logger', () => {
          createCoreServices();
          const logger = getLogger();

          expect(logger).toBe(mockLogger);
        });
      });

      describe('getErrorHandler', () => {
        it('should return the core error handler', () => {
          createCoreServices();
          const errorHandler = getErrorHandler();

          expect(errorHandler).toBe(mockErrorHandler);
        });
      });

      describe('getStore', () => {
        it('should return the core stores', () => {
          createCoreServices();
          const getStoreFn = getStore;

          expect(typeof getStoreFn).toBe('function');
        });
      });
    });

    describe('createTestServices', () => {
      it('should create test services with default configuration', () => {
        const testServices = createTestServices();

        // Verify the services were created with correct types
        expect(testServices.logger).toBe(mockLogger);
        expect(testServices.errorHandler).toBe(mockErrorHandler);
        expect(testServices.getStore).toBeDefined();
        expect(typeof testServices.getStore).toBe('function');

        // Verify createLogger was called multiple times (once for test services, once for core)
        expect(createLogger).toHaveBeenCalled();
      });

      it('should create test services with overrides', () => {
        const customLogger = createMockLogger();

        const customErrorHandler = createMockErrorHandler();

        const customGetStore = vi.fn(() => ({
          ui: { isOpen: true },
          connection: { status: 'connected' },
          error: { error: null },
        }));

        const overrides: Partial<TestServices> = {
          logger: customLogger,
          errorHandler: customErrorHandler,
          getStore: customGetStore,
        };

        const testServices = createTestServices(overrides);

        expect(testServices.logger).toBe(customLogger);
        expect(testServices.errorHandler).toBe(customErrorHandler);
        expect(testServices.getStore).toBe(customGetStore);
      });

      it('should create test services with partial overrides', () => {
        const customLogger = createMockLogger();

        const overrides: Partial<TestServices> = {
          logger: customLogger,
        };

        const testServices = createTestServices(overrides);

        expect(testServices.logger).toBe(customLogger);
        expect(testServices.errorHandler).toBe(mockErrorHandler);
        expect(testServices.getStore).toBeDefined();
        expect(typeof testServices.getStore).toBe('function');
      });

      it('should use test-specific configuration', () => {
        const testServices = createTestServices();

        // Verify test services are created with debug level
        expect(testServices).toBeDefined();
        expect(testServices.logger).toBe(mockLogger);
        expect(testServices.errorHandler).toBe(mockErrorHandler);
        expect(testServices.getStore).toBeDefined();
        expect(typeof testServices.getStore).toBe('function');

        // Test services should use debug level and test prefix
        expect(createLogger).toHaveBeenCalledWith(
          expect.objectContaining({
            level: 'debug',
            prefix: '[Test]',
          }),
        );
      });
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle createServices with empty config', () => {
      const factory = ServiceFactory.getInstance();
      const services = factory.createServices({});

      expect(services).toBeDefined();
      expect(services.logger).toBe(mockLogger);
      expect(services.errorHandler).toBe(mockErrorHandler);
      expect(services.getStore).toBeDefined();
      expect(typeof services.getStore).toBe('function');
    });

    it('should handle multiple reset calls', () => {
      const factory = ServiceFactory.getInstance();
      factory.createServices();

      factory.reset();
      factory.reset(); // Second reset should not throw

      expect(() => factory.reset()).not.toThrow();
    });

    it('should handle service creation after reset', () => {
      const factory = ServiceFactory.getInstance();
      factory.createServices();
      factory.reset();

      const newServices = factory.createServices();

      expect(newServices).toBeDefined();
      expect(newServices.logger).toBe(mockLogger);
    });

    it('should handle component services creation with empty component name', () => {
      createCoreServices();

      const componentServices = createComponentServices('');

      expect(createLogger).toHaveBeenCalledWith({
        level: 'info',
        prefix: '[]',
      });
      expect(componentServices).toBeDefined();
    });

    it('should handle stores without dispose method during reset', () => {
      const factory = ServiceFactory.getInstance();
      factory.createServices();

      // The new unified store doesn't have dispose, so reset should work fine
      expect(() => factory.reset()).not.toThrow();
    });
  });

  describe('Type definitions and interfaces', () => {
    it('should have correct CoreServices interface', () => {
      const services = createCoreServices();

      // Verify all required properties exist
      expect(services).toHaveProperty('logger');
      expect(services).toHaveProperty('errorHandler');
      expect(services).toHaveProperty('getStore');

      // Verify types match expected interfaces
      expect(typeof services.logger.debug).toBe('function');
      expect(typeof services.errorHandler.handleError).toBe('function');
      expect(typeof services.getStore).toBe('function');
    });

    it('should have correct ComponentServices interface', () => {
      createCoreServices();
      const componentServices = createComponentServices('Test');

      // Verify only logger and errorHandler are included
      expect(componentServices).toHaveProperty('logger');
      expect(componentServices).toHaveProperty('errorHandler');
      expect(componentServices).not.toHaveProperty('stores');
    });

    it('should have correct TestServices interface', () => {
      const testServices = createTestServices();

      // Verify all properties exist
      expect(testServices).toHaveProperty('logger');
      expect(testServices).toHaveProperty('errorHandler');
      expect(testServices).toHaveProperty('getStore');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete service lifecycle', () => {
      // Create services
      const services1 = createCoreServices({
        logger: { level: 'debug' },
      });

      // Get services
      const services2 = getCoreServices();
      expect(services2).toBe(services1);

      // Create component services
      const componentServices = createComponentServices('TestComponent');
      expect(componentServices.errorHandler).toBe(services1.errorHandler);

      // Use service locators
      const logger = getLogger();
      const errorHandler = getErrorHandler();
      const store = getStore();

      expect(logger).toBe(services1.logger);
      expect(errorHandler).toBe(services1.errorHandler);
      expect(typeof store).toBe('object');

      // Reset services
      resetServices();

      // Verify new services can be created
      const newServices = createCoreServices();
      expect(newServices).toBeDefined();
      expect(newServices).not.toBe(services1);
    });

    it('should maintain service consistency across multiple components', () => {
      const coreServices = createCoreServices();

      const component1Services = createComponentServices('Component1');
      const component2Services = createComponentServices('Component2');

      // Both components should share the same error handler
      expect(component1Services.errorHandler).toBe(coreServices.errorHandler);
      expect(component2Services.errorHandler).toBe(coreServices.errorHandler);

      // But have different loggers with different prefixes
      expect(createLogger).toHaveBeenCalledWith({
        level: 'info',
        prefix: '[Component1]',
      });
      expect(createLogger).toHaveBeenCalledWith({
        level: 'info',
        prefix: '[Component2]',
      });
    });
  });
});
