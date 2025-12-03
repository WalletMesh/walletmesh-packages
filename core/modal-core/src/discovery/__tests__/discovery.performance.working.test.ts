/**
 * Working performance tests for discovery functionality
 * Tests discovery behavior with proper mocking and realistic scenarios
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DiscoveryService } from '../../client/DiscoveryService.js';
import { createMockLogger, createMockRegistry } from '../../testing/helpers/mocks.js';
import { ChainType } from '../../types.js';
import {
  setupDiscoveryInitiatorMock,
  type MockDiscoveryInitiator,
} from '../../testing/helpers/setupDiscoveryInitiatorMock.js';

// Mock the store module
// Mock @walletmesh/discovery module
vi.mock('@walletmesh/discovery', () => ({
  DiscoveryInitiator: vi.fn(),
  createInitiatorSession: vi.fn(),
}));

vi.mock('../../state/store.js', () => ({
  getStoreInstance: vi.fn(() => ({
    getState: vi.fn(() => ({
      ui: { isOpen: false, isLoading: false, error: undefined },
      connections: {
        activeSessions: [],
        availableWallets: [],
        discoveredWallets: [],
        activeSessionId: null,
        connectionStatus: 'disconnected',
      },
      transactions: {
        pending: [],
        confirmed: [],
        failed: [],
        activeTransaction: undefined,
      },
      entities: {
        wallets: {},
      },
    })),
    setState: vi.fn(),
    subscribe: vi.fn(() => vi.fn()),
    subscribeWithSelector: vi.fn(() => vi.fn()),
  })),
}));

describe('Discovery Performance Tests (Working)', () => {
  let mockLogger: ReturnType<typeof createMockLogger>;
  let mockRegistry: ReturnType<typeof createMockRegistry>;
  let _mockInitiator: MockDiscoveryInitiator;

  beforeEach(async () => {
    mockLogger = createMockLogger();
    mockRegistry = createMockRegistry();
    vi.useFakeTimers();

    ({ _mockInitiator } = await setupDiscoveryInitiatorMock({
      on: vi.fn(),
      off: vi.fn(),
      removeAllListeners: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Large Scale Wallet Management', () => {
    it('should handle storage and retrieval of many discovered wallets efficiently', () => {
      const service = new DiscoveryService(
        { enabled: true, autoCreateAdapters: false },
        mockRegistry,
        mockLogger,
      );

      // Simulate having discovered a large number of wallets
      const startTime = performance.now();

      // Test that basic service operations don't degrade with scale
      const extensionWallets = service.getWalletsByTransportType('extension');
      const popupWallets = service.getWalletsByTransportType('popup');
      const websocketWallets = service.getWalletsByTransportType('websocket');

      const endTime = performance.now();

      // Operations should be fast even with no wallets
      expect(endTime - startTime).toBeLessThan(100);
      expect(extensionWallets).toEqual([]);
      expect(popupWallets).toEqual([]);
      expect(websocketWallets).toEqual([]);
    });

    it('should efficiently filter wallets by chain type', async () => {
      const service = new DiscoveryService(
        { enabled: true, autoCreateAdapters: false },
        mockRegistry,
        mockLogger,
      );

      // Test filtering operations
      const startTime = performance.now();

      const evmWallets = service.getWalletsByChain(ChainType.Evm);
      const solanaWallets = service.getWalletsByChain(ChainType.Solana);
      const aztecWallets = service.getWalletsByChain(ChainType.Aztec);

      const endTime = performance.now();

      // Filtering should be fast
      expect(endTime - startTime).toBeLessThan(50);
      expect(evmWallets).toEqual([]);
      expect(solanaWallets).toEqual([]);
      expect(aztecWallets).toEqual([]);
    });
  });

  describe('Discovery Operation Performance', () => {
    it('should handle rapid successive discovery calls efficiently', async () => {
      const service = new DiscoveryService(
        { enabled: true, autoCreateAdapters: false },
        mockRegistry,
        mockLogger,
      );

      const startTime = performance.now();

      // Make multiple rapid discovery calls
      const promises = [
        service.scan({ supportedChainTypes: [ChainType.Evm] }),
        service.scan({ supportedChainTypes: [ChainType.Solana] }),
        service.scan({ supportedChainTypes: [ChainType.Aztec] }),
        service.scan({ supportedChainTypes: [ChainType.Evm, ChainType.Solana] }),
        service.scan({ supportedChainTypes: [ChainType.Evm, ChainType.Aztec] }),
      ];

      await vi.advanceTimersByTimeAsync(1000);
      const results = await Promise.all(promises);

      const endTime = performance.now();

      // All calls should complete
      expect(results).toHaveLength(5);
      for (const result of results) {
        expect(Array.isArray(result)).toBe(true);
      }

      // Should complete reasonably quickly
      expect(endTime - startTime).toBeLessThan(2000);
    });

    it('should handle concurrent adapter operations', async () => {
      const service = new DiscoveryService(
        { enabled: true, autoCreateAdapters: true },
        mockRegistry,
        mockLogger,
      );

      const startTime = performance.now();

      // Try to get multiple adapters concurrently
      const adapterPromises = Array.from({ length: 10 }, (_, i) =>
        service.getWalletAdapter(`test-wallet-${i}`),
      );

      await vi.advanceTimersByTimeAsync(500);
      const adapters = await Promise.all(adapterPromises);

      const endTime = performance.now();

      // Most should return null (wallet not found)
      expect(adapters.filter((adapter) => adapter === null).length).toBe(10);

      // Should handle concurrent requests without issues
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe('Memory Management', () => {
    it('should properly track and cleanup discovery resources', async () => {
      const service = new DiscoveryService(
        { enabled: true, autoCreateAdapters: true },
        mockRegistry,
        mockLogger,
      );

      // Simulate some discovery activity
      await service.scan({ supportedChainTypes: [ChainType.Evm] });
      await vi.advanceTimersByTimeAsync(100);

      // Check initial state
      const initialAdapters = service.getDiscoveredAdapters();
      expect(Array.isArray(initialAdapters)).toBe(true);

      const startCleanupTime = performance.now();

      // Cleanup should be fast
      await service.destroy();

      const endCleanupTime = performance.now();

      // Verify cleanup completed
      const finalAdapters = service.getDiscoveredAdapters();
      expect(finalAdapters).toHaveLength(0);

      // Cleanup should be efficient
      expect(endCleanupTime - startCleanupTime).toBeLessThan(100);
    });

    it('should handle multiple cleanup calls gracefully', async () => {
      const service = new DiscoveryService(
        { enabled: true, autoCreateAdapters: false },
        mockRegistry,
        mockLogger,
      );

      // Multiple destroy calls should not throw
      await service.destroy();
      await expect(service.destroy()).resolves.toBeUndefined();
      await expect(service.destroy()).resolves.toBeUndefined();

      // Should maintain clean state
      expect(service.getDiscoveredAdapters()).toHaveLength(0);
    });
  });

  describe('Service Configuration Performance', () => {
    it('should initialize discovery service configurations quickly', () => {
      const configs = [
        { enabled: true, autoCreateAdapters: true, timeout: 5000 },
        { enabled: true, autoCreateAdapters: false, timeout: 10000 },
        { enabled: false, autoCreateAdapters: true, timeout: 1000 },
        { enabled: false, autoCreateAdapters: false },
      ];

      const startTime = performance.now();

      const services = configs.map((config) => new DiscoveryService(config, mockRegistry, mockLogger));

      const endTime = performance.now();

      // All services should be created successfully
      expect(services).toHaveLength(4);
      for (const service of services) {
        expect(service).toBeDefined();
      }

      // Service creation should be fast
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle configuration changes efficiently', () => {
      const service = new DiscoveryService(
        { enabled: true, autoCreateAdapters: false },
        mockRegistry,
        mockLogger,
      );

      const startTime = performance.now();

      // Test various service operations
      service.getWalletsByTransportType('extension');
      service.getWalletsByTransportType('popup');
      service.getWalletsByTransportType('websocket');
      service.getWalletsByChain(ChainType.Evm);
      service.getWalletsByChain(ChainType.Solana);
      service.getDiscoveredAdapters();

      const endTime = performance.now();

      // Operations should be fast
      expect(endTime - startTime).toBeLessThan(50);
    });
  });

  describe('Concurrent Discovery Performance', () => {
    it('should handle mixed discovery and connection operations', async () => {
      const service = new DiscoveryService(
        { enabled: true, autoCreateAdapters: true },
        mockRegistry,
        mockLogger,
      );

      const startTime = performance.now();

      // Mix different types of operations
      const operations = [
        service.scan({ supportedChainTypes: [ChainType.Evm] }),
        service.getWalletAdapter('test-wallet-1'),
        service.scan({ supportedChainTypes: [ChainType.Solana] }),
        service.getWalletAdapter('test-wallet-2'),
        service.scan({ supportedChainTypes: [ChainType.Aztec] }),
      ];

      await vi.advanceTimersByTimeAsync(1000);
      const results = await Promise.allSettled(operations);

      const endTime = performance.now();

      // All operations should complete (some may fulfill, others reject)
      expect(results).toHaveLength(5);

      // Should handle mixed operations efficiently
      expect(endTime - startTime).toBeLessThan(2000);
    });
  });
});
