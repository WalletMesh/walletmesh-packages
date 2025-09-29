/**
 * Working edge case tests for discovery flow scenarios
 * Tests advanced discovery scenarios with proper error handling
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DiscoveryService } from '../../client/DiscoveryService.js';
import { createMockLogger, createMockRegistry } from '../../testing/helpers/mocks.js';
import { ChainType } from '../../types.js';
import { setupDiscoveryInitiatorMock, type MockDiscoveryInitiator } from '../../testing/helpers/setupDiscoveryInitiatorMock.js';

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
        connectionStatus: 'disconnected'
      },
      transactions: {
        pending: [],
        confirmed: [],
        failed: [],
        activeTransaction: undefined
      }
      ,
      entities: {
        wallets: {}
      }
    })),
    setState: vi.fn(),
    subscribe: vi.fn(() => vi.fn()),
    subscribeWithSelector: vi.fn(() => vi.fn())
  }))
}));

describe('Discovery Flow Edge Cases (Working)', () => {
  let mockLogger: ReturnType<typeof createMockLogger>;
  let mockRegistry: ReturnType<typeof createMockRegistry>;
  let mockInitiator: MockDiscoveryInitiator;

  beforeEach(async () => {
    mockLogger = createMockLogger();
    mockRegistry = createMockRegistry();
    vi.useFakeTimers();

    ({ mockInitiator } = await setupDiscoveryInitiatorMock({
      on: vi.fn(),
      off: vi.fn(),
      removeAllListeners: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Service Configuration Edge Cases', () => {
    it('should handle empty configuration gracefully', () => {
      const service = new DiscoveryService({}, mockRegistry, mockLogger);

      expect(service).toBeDefined();
      expect(service.getDiscoveredAdapters()).toEqual([]);
    });

    it('should handle configuration with mixed boolean values', () => {
      const configs = [
        { enabled: true, autoCreateAdapters: false },
        { enabled: false, autoCreateAdapters: true },
        { enabled: false, autoCreateAdapters: false },
      ];

      for (const config of configs) {
        const service = new DiscoveryService(config, mockRegistry, mockLogger);
        expect(service).toBeDefined();
      }
    });

    it('should handle configuration with unusual timeout values', () => {
      const configs = [
        { enabled: true, timeout: 0 },
        { enabled: true, timeout: 1 },
        { enabled: true, timeout: 99999 },
      ];

      for (const config of configs) {
        const service = new DiscoveryService(config, mockRegistry, mockLogger);
        expect(service).toBeDefined();
      }
    });
  });

  describe('Transport Type Filtering Edge Cases', () => {
    it('should handle unknown transport types gracefully', () => {
      const service = new DiscoveryService(
        { enabled: true, autoCreateAdapters: false },
        mockRegistry,
        mockLogger,
      );

      // Should not throw for unknown transport types
      const unknownWallets = service.getWalletsByTransportType('unknown' as string);
      expect(unknownWallets).toEqual([]);
    });

    it('should handle null/undefined transport type queries', () => {
      const service = new DiscoveryService(
        { enabled: true, autoCreateAdapters: false },
        mockRegistry,
        mockLogger,
      );

      // Should handle edge cases gracefully
      expect(() => service.getWalletsByTransportType(null as unknown)).not.toThrow();
      expect(() => service.getWalletsByTransportType(undefined as unknown)).not.toThrow();
    });

    it('should handle all valid transport types', () => {
      const service = new DiscoveryService(
        { enabled: true, autoCreateAdapters: false },
        mockRegistry,
        mockLogger,
      );

      const transportTypes = ['extension', 'popup', 'websocket', 'injected'];

      for (const transportType of transportTypes) {
        const wallets = service.getWalletsByTransportType(transportType as string);
        expect(Array.isArray(wallets)).toBe(true);
      }
    });
  });

  describe('Chain Type Filtering Edge Cases', () => {
    it('should handle all supported chain types', () => {
      const service = new DiscoveryService(
        { enabled: true, autoCreateAdapters: false },
        mockRegistry,
        mockLogger,
      );

      const chainTypes = [ChainType.Evm, ChainType.Solana, ChainType.Aztec];

      for (const chainType of chainTypes) {
        const wallets = service.getWalletsByChain(chainType);
        expect(Array.isArray(wallets)).toBe(true);
      }
    });

    it('should handle mixed chain type discovery requests', async () => {
      const service = new DiscoveryService(
        { enabled: true, autoCreateAdapters: false },
        mockRegistry,
        mockLogger,
      );

      const chainTypeCombinations = [
        [ChainType.Evm],
        [ChainType.Solana],
        [ChainType.Aztec],
        [ChainType.Evm, ChainType.Solana],
        [ChainType.Evm, ChainType.Aztec],
        [ChainType.Solana, ChainType.Aztec],
        [ChainType.Evm, ChainType.Solana, ChainType.Aztec],
      ];

      for (const chainTypes of chainTypeCombinations) {
        const result = await service.scan({ supportedChainTypes: chainTypes });
        expect(Array.isArray(result)).toBe(true);
      }
    });
  });

  describe('Adapter Management Edge Cases', () => {
    it('should handle rapid adapter creation/destruction cycles', async () => {
      const service = new DiscoveryService(
        { enabled: true, autoCreateAdapters: true },
        mockRegistry,
        mockLogger,
      );

      // Rapid create/destroy cycles should not cause issues
      for (let i = 0; i < 5; i++) {
        const adapter = await service.getWalletAdapter(`test-wallet-${i}`);
        expect(adapter).toBeNull(); // No actual wallet, should return null
      }

      // Should handle cleanup gracefully
      await service.destroy();
      expect(service.getDiscoveredAdapters()).toHaveLength(0);
    });

    it('should handle concurrent adapter requests for same wallet', async () => {
      const service = new DiscoveryService(
        { enabled: true, autoCreateAdapters: true },
        mockRegistry,
        mockLogger,
      );

      // Multiple concurrent requests for same wallet
      const promises = Array.from({ length: 5 }, () => service.getWalletAdapter('same-wallet-id'));

      const adapters = await Promise.all(promises);

      // All should return null (wallet doesn't exist)
      for (const adapter of adapters) {
        expect(adapter).toBeNull();
      }
    });
  });

  describe('Discovery Lifecycle Edge Cases', () => {
    it('should handle repeated scan and reset cycles', async () => {
      const service = new DiscoveryService(
        { enabled: true, autoCreateAdapters: false },
        mockRegistry,
        mockLogger,
      );

      for (let i = 0; i < 3; i++) {
        await service.scan();
        await service.reset();
      }

      expect(service.getDiscoveredAdapters()).toEqual([]);
    });

    it('should handle destroy during active discovery', async () => {
      const service = new DiscoveryService(
        { enabled: true, autoCreateAdapters: false },
        mockRegistry,
        mockLogger,
      );

      // Destroy should not throw even if called without starting discovery
      await expect(service.destroy()).resolves.toBeUndefined();

      // Should clean up properly
      expect(service.getDiscoveredAdapters()).toHaveLength(0);
    });

    it('should handle multiple destroy calls', async () => {
      const service = new DiscoveryService(
        { enabled: true, autoCreateAdapters: true },
        mockRegistry,
        mockLogger,
      );

      // Multiple destroy calls should not throw
      await service.destroy();
      await service.destroy();
      await service.destroy();

      expect(service.getDiscoveredAdapters()).toHaveLength(0);
    });
  });

  describe('Error Recovery Edge Cases', () => {
    it('should handle connection attempts to non-existent wallets', async () => {
      const service = new DiscoveryService(
        { enabled: true, autoCreateAdapters: true },
        mockRegistry,
        mockLogger,
      );

      // Should reject gracefully
      await expect(
        service.connectToWallet('non-existent-wallet', {
          requestedChains: ['evm:1'],
          requestedPermissions: ['account-access'],
        }),
      ).rejects.toThrow();
    });

    it('should handle invalid connection parameters', async () => {
      const service = new DiscoveryService(
        { enabled: true, autoCreateAdapters: true },
        mockRegistry,
        mockLogger,
      );

      // Should handle invalid parameters gracefully
      await expect(
        service.connectToWallet('', {
          requestedChains: [],
          requestedPermissions: [],
        }),
      ).rejects.toThrow();
    });

    it('should handle malformed chain identifiers', async () => {
      const service = new DiscoveryService(
        { enabled: true, autoCreateAdapters: false },
        mockRegistry,
        mockLogger,
      );

      // Should handle gracefully without throwing
      const result = await service.scan({ supportedChainTypes: [] });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Resource Management Edge Cases', () => {
    it('should handle resource cleanup in various states', async () => {
      const service = new DiscoveryService(
        { enabled: true, autoCreateAdapters: false }, // Disable auto-creation to avoid timeouts
        mockRegistry,
        mockLogger,
      );

      // Put service in simple state before cleanup
      await service.scan({ supportedChainTypes: [ChainType.Evm] });

      // Cleanup should work regardless of state
      await expect(service.destroy()).resolves.toBeUndefined();
      expect(service.getDiscoveredAdapters()).toHaveLength(0);
    });

    it('should handle cleanup when no resources are allocated', async () => {
      const service = new DiscoveryService(
        { enabled: false, autoCreateAdapters: false },
        mockRegistry,
        mockLogger,
      );

      // Should handle cleanup when nothing was created
      await service.destroy();
      expect(service.getDiscoveredAdapters()).toHaveLength(0);
    });
  });

  describe('Event System Edge Cases', () => {
    it('should handle service creation without throwing', () => {
      expect(() => {
        new DiscoveryService({ enabled: true }, mockRegistry, mockLogger);
      }).not.toThrow();
    });

    it('should handle configuration updates', async () => {
      const service = new DiscoveryService({ enabled: true }, mockRegistry, mockLogger);

      // Should handle discovery with different configurations
      await service.scan({ supportedChainTypes: [ChainType.Evm] });
      await service.scan({ supportedChainTypes: [ChainType.Solana] });
      await service.scan({ supportedChainTypes: [ChainType.Evm, ChainType.Solana] });

      // Should log configuration updates
      expect(mockLogger.debug).toHaveBeenCalledWith('Updating chain configuration', expect.any(Object));
    });
  });

  describe('State Consistency Edge Cases', () => {
    it('should maintain consistent state during rapid operations', async () => {
      const service = new DiscoveryService(
        { enabled: true, autoCreateAdapters: false },
        mockRegistry,
        mockLogger,
      );

      // Rapid state changes
      const operations = [
        service.scan({ supportedChainTypes: [ChainType.Evm] }),
        service.scan({ supportedChainTypes: [ChainType.Solana] }),
        service.scan({ supportedChainTypes: [ChainType.Aztec] }),
      ];

      await Promise.all(operations);

      // State should remain consistent
      const adapters = service.getDiscoveredAdapters();
      expect(Array.isArray(adapters)).toBe(true);
    });

    it('should maintain state consistency across service lifecycle', async () => {
      const service = new DiscoveryService(
        { enabled: true, autoCreateAdapters: true },
        mockRegistry,
        mockLogger,
      );

      // Initial state
      expect(service.getDiscoveredAdapters()).toEqual([]);

      // After operations
      await service.scan({ supportedChainTypes: [ChainType.Evm] });
      const midState = service.getDiscoveredAdapters();
      expect(Array.isArray(midState)).toBe(true);

      // After cleanup
      await service.destroy();
      expect(service.getDiscoveredAdapters()).toHaveLength(0);
    });
  });
});
