/**
 * ChainServiceRegistry Tests
 *
 * Tests for chain service registry functionality including:
 * - Service Registration and Management
 * - Lazy Loading and Caching
 * - Built-in Service Registration
 * - Service Status Tracking
 * - Cache Management and Cleanup
 * - Configuration Handling
 *
 * @group unit
 * @group services
 * @group chains
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Logger } from '../../internal/core/logger/logger.js';
import { createMockLogger, createTestEnvironment, installCustomMatchers } from '../../testing/index.js';
import { ChainType } from '../../types.js';
import type { BaseChainService, ChainServiceLoader } from './BaseChainService.js';
import type { ChainServiceRegistryConfig, ChainServiceStatus } from './ChainServiceRegistry.js';
import { ChainServiceRegistry } from './ChainServiceRegistry.js';

// Install domain-specific matchers
installCustomMatchers();

// Mock chain service implementation
class MockChainService implements BaseChainService {
  chainType = ChainType.Evm;

  async getNativeBalance(): Promise<{ value: string; formatted: string }> {
    return { value: '1000000000000000000', formatted: '1.0' };
  }

  async getTokenBalance(): Promise<{ value: string; formatted: string }> {
    return { value: '1000000', formatted: '1.0' };
  }

  async sendTransaction(): Promise<{ hash: string; success: boolean }> {
    return { hash: '0x123', success: true };
  }

  formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  isValidAddress(address: string): boolean {
    return address.startsWith('0x') && address.length === 42;
  }

  parseTransaction(): { to: string; value: string } {
    return { to: '0x123', value: '1000000000000000000' };
  }

  estimateGas(): Promise<{ gasLimit: string; gasPrice: string }> {
    return Promise.resolve({ gasLimit: '21000', gasPrice: '20000000000' });
  }
}

// Helper function to create mock chain service loader
function createMockLoader(service: BaseChainService = new MockChainService()): ChainServiceLoader {
  return vi.fn().mockResolvedValue({
    default: vi.fn().mockResolvedValue(service),
  });
}

// Helper function to create failing loader
function createFailingLoader(error: Error = new Error('Load failed')): ChainServiceLoader {
  return vi.fn().mockRejectedValue(error);
}

describe('ChainServiceRegistry', () => {
  let registry: ChainServiceRegistry;
  let mockLogger: Logger;
  const testEnv = createTestEnvironment();

  beforeEach(async () => {
    await testEnv.setup();
    vi.useFakeTimers();

    mockLogger = createMockLogger();
    registry = new ChainServiceRegistry(mockLogger);
  });

  afterEach(async () => {
    registry.destroy();
    await testEnv.teardown();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    describe('Default configuration', () => {
      it('should initialize with default configuration', () => {
        const defaultRegistry = new ChainServiceRegistry(mockLogger);

        // Should not preload by default
        expect(defaultRegistry.getServiceStatus(ChainType.Evm).isLoaded).toBe(false);
        expect(defaultRegistry.getServiceStatus(ChainType.Solana).isLoaded).toBe(false);
        expect(defaultRegistry.getServiceStatus(ChainType.Aztec).isLoaded).toBe(false);

        defaultRegistry.destroy();
      });

      it('should register built-in services', () => {
        const status = registry.getServiceStatus(ChainType.Evm);

        expect(status.isRegistered).toBe(true);
        expect(status.isBuiltIn).toBe(true);
        expect(status.isLoaded).toBe(false);
      });
    });

    describe('Custom configuration', () => {
      it('should initialize with custom configuration', () => {
        const config: ChainServiceRegistryConfig = {
          preloadOnInit: true,
          preloadChainTypes: [ChainType.Evm],
          cacheTimeout: 60000,
          maxCachedServices: 5,
        };

        const customRegistry = new ChainServiceRegistry(mockLogger, config);

        // Verify configuration is applied (preloading tested separately)
        expect(customRegistry).toBeInstanceOf(ChainServiceRegistry);

        customRegistry.destroy();
      });

      it('should handle empty configuration', () => {
        const emptyConfig: ChainServiceRegistryConfig = {};

        expect(() => {
          const emptyRegistry = new ChainServiceRegistry(mockLogger, emptyConfig);
          emptyRegistry.destroy();
        }).not.toThrow();
      });

      it('should handle partial configuration', () => {
        const partialConfig: ChainServiceRegistryConfig = {
          cacheTimeout: 120000,
        };

        const partialRegistry = new ChainServiceRegistry(mockLogger, partialConfig);

        expect(partialRegistry).toBeInstanceOf(ChainServiceRegistry);
        partialRegistry.destroy();
      });
    });
  });

  describe('Service Registration', () => {
    describe('Custom service registration', () => {
      it('should register custom chain service', () => {
        const customLoader = createMockLoader();

        registry.registerChainService('custom' as ChainType, customLoader);

        const status = registry.getServiceStatus('custom' as ChainType);
        expect(status.isRegistered).toBe(true);
        expect(status.isBuiltIn).toBe(false); // Custom service
      });

      it('should not replace built-in service without explicit flag', () => {
        const customLoader = createMockLoader();

        // Should not replace built-in service
        expect(() => {
          registry.registerChainService(ChainType.Evm, customLoader, false);
        }).toThrow('Chain service for evm is already registered');
      });

      it('should replace built-in service with explicit flag', () => {
        const customLoader = createMockLoader();

        registry.registerChainService(ChainType.Evm, customLoader, true);

        const status = registry.getServiceStatus(ChainType.Evm);
        expect(status.isRegistered).toBe(true);
        expect(status.isBuiltIn).toBe(false); // Now custom
      });

      it('should register service for unsupported chain type', () => {
        const customLoader = createMockLoader();

        // This should work for any chain type
        registry.registerChainService('custom' as ChainType, customLoader);

        const status = registry.getServiceStatus('custom' as ChainType);
        expect(status.isRegistered).toBe(true);
        expect(status.isBuiltIn).toBe(false);
      });
    });

    describe('Registration validation', () => {
      it('should validate loader function', () => {
        expect(() => {
          registry.registerChainService(ChainType.Evm, null as unknown);
        }).toThrow();
      });

      it('should validate chain type', () => {
        const customLoader = createMockLoader();

        expect(() => {
          registry.registerChainService(null as unknown, customLoader);
        }).toThrow();
      });
    });
  });

  describe('Service Status and Tracking', () => {
    describe('Status information', () => {
      it('should return correct status for unregistered service', () => {
        const status = registry.getServiceStatus('unknown' as ChainType);

        expect(status.isRegistered).toBe(false);
        expect(status.isLoaded).toBe(false);
        expect(status.isLoading).toBe(false);
        expect(status.isBuiltIn).toBe(false);
        expect(status.lastUsed).toBeUndefined();
      });

      it('should return correct status for registered but unloaded service', () => {
        const status = registry.getServiceStatus(ChainType.Evm);

        expect(status.isRegistered).toBe(true);
        expect(status.isLoaded).toBe(false);
        expect(status.isLoading).toBe(false);
        expect(status.isBuiltIn).toBe(true);
        expect(status.lastUsed).toBeUndefined();
      });

      it('should track last used timestamp', async () => {
        const customLoader = createMockLoader();
        registry.registerChainService('test' as ChainType, customLoader, true);

        // Load the service to track usage
        await registry.getService('test' as ChainType);

        const status = registry.getServiceStatus('test' as ChainType);
        expect(status.lastUsed).toBeTypeOf('number');
        expect(status.lastUsed).toBeGreaterThan(0);
      });
    });

    describe('Loading status tracking', () => {
      it('should track loading status during service load', async () => {
        let resolveLoader: (value: unknown) => void;
        const loadingPromise = new Promise((resolve) => {
          resolveLoader = resolve;
        });

        const slowLoader = vi.fn().mockReturnValue(loadingPromise);
        registry.registerChainService('slow' as ChainType, slowLoader, true);

        // Start loading
        const servicePromise = registry.getService('slow' as ChainType);

        // Check loading status
        const loadingStatus = registry.getServiceStatus('slow' as ChainType);
        expect(loadingStatus.isLoading).toBe(true);
        expect(loadingStatus.isLoaded).toBe(false);

        // Complete loading
        resolveLoader?.({
          default: vi.fn().mockResolvedValue(new MockChainService()),
        });
        await servicePromise;

        // Check final status
        const loadedStatus = registry.getServiceStatus('slow' as ChainType);
        expect(loadedStatus.isLoading).toBe(false);
        expect(loadedStatus.isLoaded).toBe(true);
      });
    });
  });

  describe('Service Loading and Caching', () => {
    describe('Successful loading', () => {
      it('should load and cache service on first access', async () => {
        const mockService = new MockChainService();
        const loader = createMockLoader(mockService);

        registry.registerChainService('test' as ChainType, loader, true);

        const service1 = await registry.getService('test' as ChainType);
        const service2 = await registry.getService('test' as ChainType);

        expect(service1).toBe(mockService);
        expect(service2).toBe(mockService); // Should be cached
        expect(loader).toHaveBeenCalledOnce(); // Only loaded once
      });

      it('should handle concurrent loading requests', async () => {
        const mockService = new MockChainService();
        const loader = createMockLoader(mockService);

        registry.registerChainService('test' as ChainType, loader, true);

        // Start multiple concurrent loads
        const promises = [
          registry.getService('test' as ChainType),
          registry.getService('test' as ChainType),
          registry.getService('test' as ChainType),
        ];

        const results = await Promise.all(promises);

        // All should return the same instance
        expect(results[0]).toBe(mockService);
        expect(results[1]).toBe(mockService);
        expect(results[2]).toBe(mockService);

        // Loader should only be called once
        expect(loader).toHaveBeenCalledOnce();
      });

      it('should load different services for different chain types', async () => {
        const evmService = new MockChainService();
        evmService.chainType = ChainType.Evm;

        const solanaService = new MockChainService();
        solanaService.chainType = ChainType.Solana;

        const evmLoader = createMockLoader(evmService);
        const solanaLoader = createMockLoader(solanaService);

        registry.registerChainService(ChainType.Evm, evmLoader, true);
        registry.registerChainService(ChainType.Solana, solanaLoader, true);

        const loadedEvmService = await registry.getService(ChainType.Evm);
        const loadedSolanaService = await registry.getService(ChainType.Solana);

        expect(loadedEvmService).toBe(evmService);
        expect(loadedSolanaService).toBe(solanaService);
        expect(loadedEvmService).not.toBe(loadedSolanaService);
      });
    });

    describe('Loading failures', () => {
      it('should handle service loading failures', async () => {
        const loadError = new Error('Failed to load service');
        const failingLoader = createFailingLoader(loadError);

        registry.registerChainService('failing' as ChainType, failingLoader, true);

        await expect(registry.getService('failing' as ChainType)).rejects.toThrow('Failed to load service');
      });

      it('should retry loading after failure', async () => {
        const loadError = new Error('Load failed');
        const failingLoader = createFailingLoader(loadError);

        registry.registerChainService('retry' as ChainType, failingLoader, true);

        // First attempt should fail
        await expect(registry.getService('retry' as ChainType)).rejects.toThrow('Load failed');

        // Register a working loader
        const workingService = new MockChainService();
        const workingLoader = createMockLoader(workingService);
        registry.registerChainService('retry' as ChainType, workingLoader, true);

        // Second attempt should succeed
        const service = await registry.getService('retry' as ChainType);
        expect(service).toBe(workingService);
      });

      it('should handle unregistered service access', async () => {
        await expect(registry.getService('unregistered' as ChainType)).rejects.toThrow(
          'No service registered for chain type: unregistered',
        );
      });
    });
  });

  describe('Cache Management', () => {
    describe('Cache clearing', () => {
      it('should clear specific service cache', async () => {
        const mockService = new MockChainService();
        const loader = createMockLoader(mockService);

        registry.registerChainService('test' as ChainType, loader, true);

        // Load and cache service
        await registry.getService('test' as ChainType);
        expect(registry.getServiceStatus('test' as ChainType).isLoaded).toBe(true);

        // Clear specific cache
        registry.clearCache('test' as ChainType);
        expect(registry.getServiceStatus('test' as ChainType).isLoaded).toBe(false);
      });

      it('should clear all service caches', async () => {
        const evmService = new MockChainService();
        const solanaService = new MockChainService();

        const evmLoader = createMockLoader(evmService);
        const solanaLoader = createMockLoader(solanaService);

        registry.registerChainService(ChainType.Evm, evmLoader, true);
        registry.registerChainService(ChainType.Solana, solanaLoader, true);

        // Load both services
        await registry.getService(ChainType.Evm);
        await registry.getService(ChainType.Solana);

        expect(registry.getServiceStatus(ChainType.Evm).isLoaded).toBe(true);
        expect(registry.getServiceStatus(ChainType.Solana).isLoaded).toBe(true);

        // Clear all caches
        registry.clearCache();

        expect(registry.getServiceStatus(ChainType.Evm).isLoaded).toBe(false);
        expect(registry.getServiceStatus(ChainType.Solana).isLoaded).toBe(false);
      });

      it('should handle clearing cache for unregistered service', () => {
        expect(() => {
          registry.clearCache('unregistered' as ChainType);
        }).not.toThrow();
      });
    });

    describe('Automatic cleanup', () => {
      it('should setup cleanup interval', () => {
        const registryWithCleanup = new ChainServiceRegistry(mockLogger, {
          cacheTimeout: 1000,
        });

        // Verify that cleanup is scheduled
        expect(registryWithCleanup).toBeInstanceOf(ChainServiceRegistry);

        registryWithCleanup.destroy();
      });

      it('should clean up expired services', async () => {
        const registryWithShortTimeout = new ChainServiceRegistry(mockLogger, {
          cacheTimeout: 100, // Very short timeout
        });

        const mockService = new MockChainService();
        const loader = createMockLoader(mockService);

        registryWithShortTimeout.registerChainService('expire' as ChainType, loader, true);

        // Load service
        await registryWithShortTimeout.getService('expire' as ChainType);
        expect(registryWithShortTimeout.getServiceStatus('expire' as ChainType).isLoaded).toBe(true);

        // Fast forward time to trigger cleanup
        vi.advanceTimersByTime(150); // Beyond timeout

        // Service should be cleaned up
        expect(registryWithShortTimeout.getServiceStatus('expire' as ChainType).isLoaded).toBe(false);

        registryWithShortTimeout.destroy();
      });
    });
  });

  describe('Service Destruction and Cleanup', () => {
    it('should clean up resources on destroy', () => {
      const registryToDestroy = new ChainServiceRegistry(mockLogger);

      expect(() => {
        registryToDestroy.destroy();
      }).not.toThrow();
    });

    it('should clear cleanup interval on destroy', () => {
      const registryToDestroy = new ChainServiceRegistry(mockLogger, {
        cacheTimeout: 1000,
      });

      registryToDestroy.destroy();

      // Fast forward time - no cleanup should happen
      vi.advanceTimersByTime(2000);

      // Registry should have cleared services
      expect(registryToDestroy.getServiceStatus(ChainType.Evm).isRegistered).toBe(false);
    });

    it('should handle multiple destroy calls', () => {
      const registryToDestroy = new ChainServiceRegistry(mockLogger);

      expect(() => {
        registryToDestroy.destroy();
        registryToDestroy.destroy();
        registryToDestroy.destroy();
      }).not.toThrow();
    });
  });

  describe('Built-in Services', () => {
    it('should register EVM service by default', () => {
      const status = registry.getServiceStatus(ChainType.Evm);

      expect(status.isRegistered).toBe(true);
      expect(status.isBuiltIn).toBe(true);
    });

    it('should register Solana service by default', () => {
      const status = registry.getServiceStatus(ChainType.Solana);

      expect(status.isRegistered).toBe(true);
      expect(status.isBuiltIn).toBe(true);
    });

    it('should register Aztec service by default', () => {
      const status = registry.getServiceStatus(ChainType.Aztec);

      expect(status.isRegistered).toBe(true);
      expect(status.isBuiltIn).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid logger gracefully', () => {
      expect(() => {
        const registryWithInvalidLogger = new ChainServiceRegistry(null as unknown);
        registryWithInvalidLogger.destroy();
      }).toThrow();
    });

    it('should handle service loader errors', async () => {
      const errorLoader = vi.fn().mockRejectedValue(new Error('Loader failed'));

      registry.registerChainService('error' as ChainType, errorLoader, true);

      await expect(registry.getService('error' as ChainType)).rejects.toThrow('Loader failed');

      // Status should reflect the error state
      const status = registry.getServiceStatus('error' as ChainType);
      expect(status.isLoaded).toBe(false);
      expect(status.isLoading).toBe(false);
    });

    it('should handle service instance errors', async () => {
      const faultyService = {
        ...new MockChainService(),
        chainType: null as unknown, // Invalid chain type
      };

      const faultyLoader = createMockLoader(faultyService);
      registry.registerChainService('faulty' as ChainType, faultyLoader, true);

      // Should still return the service even if it's faulty
      const service = await registry.getService('faulty' as ChainType);
      expect(service).toBe(faultyService);
    });
  });
});
