import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the modal-core createDebugLogger function
vi.mock('@walletmesh/modal-core', () => ({
  createDebugLogger: vi.fn(),
}));

import { createDebugLogger } from '@walletmesh/modal-core';
import { createComponentLogger, getLogger, getReactLogger } from './logger.js';

const mockCreateDebugLogger = vi.mocked(createDebugLogger);

describe('Logger Utilities', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock createDebugLogger to return a unique logger-like object each time
    mockCreateDebugLogger.mockImplementation(
      () =>
        ({
          isDebugEnabled: true,
          dispose: vi.fn(),
          log: vi.fn(),
          sanitizeData: vi.fn(),
          setLevel: vi.fn(),
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        }) as unknown as ReturnType<typeof mockCreateDebugLogger>,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Clean up environment variables
    process.env['NODE_ENV'] = undefined;
    if (typeof window !== 'undefined') {
      (window as { __WALLETMESH_DEBUG__?: unknown }).__WALLETMESH_DEBUG__ = undefined;
    }
  });

  describe('Basic API', () => {
    it('should export getLogger function', () => {
      expect(typeof getLogger).toBe('function');
    });

    it('should export createComponentLogger function', () => {
      expect(typeof createComponentLogger).toBe('function');
    });

    it('should export getReactLogger function', () => {
      expect(typeof getReactLogger).toBe('function');
    });
  });

  describe('getLogger', () => {
    it('should create a logger with default prefix', () => {
      const logger = getLogger();

      expect(mockCreateDebugLogger).toHaveBeenCalledWith('WalletMesh:React', false);
      expect(logger).toBeDefined();
    });

    it('should return the same logger instance on subsequent calls', () => {
      // Call getLogger to ensure singleton is created
      const logger1 = getLogger();

      // Clear mock calls to count only subsequent calls
      mockCreateDebugLogger.mockClear();

      const logger2 = getLogger();

      // Should not be called again due to singleton pattern
      expect(mockCreateDebugLogger).not.toHaveBeenCalled();
      expect(logger1).toBe(logger2);
    });

    it('should update debug level when explicitly provided', () => {
      const logger = getLogger();
      const setLevelSpy = vi.spyOn(logger, 'setLevel');

      getLogger(true);

      expect(setLevelSpy).toHaveBeenCalledWith(0); // Debug level
    });

    it('should return a logger object with expected methods', () => {
      const logger = getLogger();

      expect(logger).toHaveProperty('debug');
      expect(logger).toHaveProperty('info');
      expect(logger).toHaveProperty('warn');
      expect(logger).toHaveProperty('error');
      expect(logger).toHaveProperty('setLevel');
    });
  });

  describe('createComponentLogger', () => {
    it('should create a logger with component-specific prefix', () => {
      const componentName = 'MyComponent';
      const logger = createComponentLogger(componentName);

      expect(mockCreateDebugLogger).toHaveBeenCalledWith(`WalletMesh:React:${componentName}`, false);
      expect(logger).toBeDefined();
    });

    it('should create a logger with debug enabled when specified', () => {
      const componentName = 'MyComponent';
      const logger = createComponentLogger(componentName, true);

      expect(mockCreateDebugLogger).toHaveBeenCalledWith(`WalletMesh:React:${componentName}`, true);
      expect(logger).toBeDefined();
    });

    it('should return a logger object with expected methods', () => {
      const logger = createComponentLogger('TestComponent');

      expect(logger).toHaveProperty('debug');
      expect(logger).toHaveProperty('info');
      expect(logger).toHaveProperty('warn');
      expect(logger).toHaveProperty('error');
    });
  });

  describe('getReactLogger', () => {
    it('should return the same as getLogger', () => {
      const reactLogger = getReactLogger();
      const defaultLogger = getLogger();

      expect(reactLogger).toBe(defaultLogger);
      expect(reactLogger).toBeDefined();
    });

    it('should return a logger object with expected methods', () => {
      const logger = getReactLogger();

      expect(logger).toHaveProperty('debug');
      expect(logger).toHaveProperty('info');
      expect(logger).toHaveProperty('warn');
      expect(logger).toHaveProperty('error');
    });
  });

  describe('Environment Detection', () => {
    it('should detect development environment', () => {
      process.env['NODE_ENV'] = 'development';

      // Use a module that imports and uses the logger fresh
      const componentLogger = createComponentLogger('TestEnvDev');

      expect(componentLogger).toBeDefined();
      expect(mockCreateDebugLogger).toHaveBeenCalledWith('WalletMesh:React:TestEnvDev', true);
    });

    it('should detect production environment', () => {
      process.env['NODE_ENV'] = 'production';

      // Use a module that imports and uses the logger fresh
      const componentLogger = createComponentLogger('TestEnvProd');

      expect(componentLogger).toBeDefined();
      expect(mockCreateDebugLogger).toHaveBeenCalledWith('WalletMesh:React:TestEnvProd', false);
    });

    it('should handle missing process object gracefully', () => {
      const originalProcess = global.process;
      // biome-ignore lint/performance/noDelete: Need to test missing process scenario
      delete (global as { process?: NodeJS.Process }).process;

      expect(() => {
        getLogger();
      }).not.toThrow();

      global.process = originalProcess;
    });
  });

  describe('Integration Scenarios', () => {
    it('should support typical React component usage pattern', () => {
      const componentLogger = createComponentLogger('WalletModal', true);

      expect(componentLogger).toBeDefined();
      expect(mockCreateDebugLogger).toHaveBeenCalledWith('WalletMesh:React:WalletModal', true);
    });

    it('should support typical hook usage pattern', () => {
      const hookLogger = createComponentLogger('useConnect');

      expect(hookLogger).toBeDefined();
      expect(mockCreateDebugLogger).toHaveBeenCalledWith('WalletMesh:React:useConnect', false);
    });

    it('should support different logger instances', () => {
      const hookLogger = createComponentLogger('useAccount');
      const componentLogger = createComponentLogger('ConnectButton');

      expect(hookLogger).toBeDefined();
      expect(componentLogger).toBeDefined();
      expect(hookLogger).not.toBe(componentLogger);
    });
  });

  describe('Error Handling', () => {
    it('should handle createDebugLogger throwing an error', () => {
      mockCreateDebugLogger.mockImplementation(() => {
        throw new Error('Logger creation failed');
      });

      expect(() => {
        createComponentLogger('TestError');
      }).toThrow('Logger creation failed');
    });
  });

  describe('Real-world Usage', () => {
    it('should work in typical development setup', () => {
      process.env['NODE_ENV'] = 'development';

      // Component logger for debugging
      const walletListLogger = createComponentLogger('WalletList', true);

      // Hook logger
      const hookLogger = createComponentLogger('useAccount');

      expect(walletListLogger).toBeDefined();
      expect(hookLogger).toBeDefined();
      expect(mockCreateDebugLogger).toHaveBeenCalledWith('WalletMesh:React:WalletList', true);
      expect(mockCreateDebugLogger).toHaveBeenCalledWith('WalletMesh:React:useAccount', true);
    });

    it('should work in production setup', () => {
      process.env['NODE_ENV'] = 'production';

      // Production logger (debug disabled)
      const prodLogger = createComponentLogger('ProdComponent');
      expect(prodLogger).toBeDefined();
      expect(mockCreateDebugLogger).toHaveBeenCalledWith('WalletMesh:React:ProdComponent', false);
    });
  });
});
