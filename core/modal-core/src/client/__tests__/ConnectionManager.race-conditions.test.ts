/**
 * Integration tests for ConnectionManager race condition fixes
 *
 * These tests verify that the locking mechanisms prevent race conditions
 * during concurrent connection operations.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SessionManager } from '../../api/types/sessionState.js';
import type { Logger } from '../../internal/core/logger/logger.js';
import type { WalletAdapter } from '../../internal/wallets/base/WalletAdapter.js';
import { createMockWalletAdapter } from '../../testing/index.js';
import { ChainType } from '../../types.js';
import { ConnectionManager } from '../ConnectionManager.js';

// Mock implementations
const mockSessionManager: SessionManager = {} as SessionManager;

const mockLogger: Logger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  prefix: 'test',
  isDebugEnabled: () => true,
  setLevel: vi.fn(),
  dispose: vi.fn(),
};

const createMockAdapter = (id: string, shouldFail = false, delay = 0): WalletAdapter => {
  const adapter = createMockWalletAdapter(id, {
    name: id,
  });

  // Override the connect method with custom behavior
  adapter.connect = vi.fn().mockImplementation(async () => {
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    if (shouldFail) {
      throw new Error(`Connection failed for ${id}`);
    }
    return {
      walletId: id,
      address: '0x1234567890123456789012345678901234567890',
      accounts: ['0x1234567890123456789012345678901234567890'],
      chainId: '0x1',
      chainType: ChainType.Evm,
      provider: {},
      walletInfo: {
        id,
        name: id,
        icon: '',
        chains: [ChainType.Evm],
      },
      metadata: { connectedAt: Date.now(), lastActiveAt: Date.now() },
    };
  });

  return adapter;
};

describe('ConnectionManager Race Condition Prevention', () => {
  let connectionManager: ConnectionManager;

  beforeEach(() => {
    // Don't use fake timers for race condition tests as they interfere with Promise.race conditions
    connectionManager = new ConnectionManager(mockSessionManager, mockLogger);
  });

  afterEach(async () => {
    // Disable auto-recovery for all wallets to prevent unhandled promises
    connectionManager.setRecoveryOptions('test-wallet', { autoReconnect: false });
    connectionManager.setRecoveryOptions('unreliable-wallet', { autoReconnect: false });
    connectionManager.setRecoveryOptions('fast-wallet', { autoReconnect: false });
    connectionManager.setRecoveryOptions('slow-wallet', { autoReconnect: false });

    // Wait a moment for any pending recovery attempts to be cancelled
    await new Promise((resolve) => setTimeout(resolve, 10));

    connectionManager.destroy();
    vi.restoreAllMocks();
  });

  describe('Concurrent Connection Attempts', () => {
    it('should prevent race conditions when connecting to the same wallet multiple times', async () => {
      const adapter = createMockAdapter('test-wallet', false, 100);
      const connectSpy = vi.spyOn(adapter, 'connect');

      // Start multiple concurrent connection attempts
      const promise1 = connectionManager.connectWithRecovery(adapter, {});
      const promise2 = connectionManager.connectWithRecovery(adapter, {});
      const promise3 = connectionManager.connectWithRecovery(adapter, {});

      // Wait for all operations to complete naturally
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Wait for all connections to complete
      const results = await Promise.allSettled([promise1, promise2, promise3]);

      // All should succeed (no race condition corruption)
      expect(results.every((r) => r.status === 'fulfilled')).toBe(true);

      // Should have been called 3 times (serialized, not concurrent)
      expect(connectSpy).toHaveBeenCalledTimes(3);

      // Connection state should be consistent
      const state = connectionManager.getConnectionState('test-wallet');
      expect(state?.status).toBe('connected');
    });

    it('should handle mixed success/failure scenarios without state corruption', async () => {
      const adapter = createMockAdapter('flaky-wallet', false, 50);
      let callCount = 0;

      // Make it fail on the second call
      vi.spyOn(adapter, 'connect').mockImplementation(async () => {
        const currentCall = ++callCount;

        // Add delay before checking/throwing
        await new Promise((resolve) => setTimeout(resolve, 50));

        if (currentCall === 2) {
          throw new Error('Simulated failure');
        }

        return {
          walletId: 'flaky-wallet',
          address: '0x1234567890123456789012345678901234567890',
          accounts: ['0x1234567890123456789012345678901234567890'],
          chainId: '0x1',
          chainType: ChainType.Evm,
          provider: {},
          walletInfo: {
            id: 'flaky-wallet',
            name: 'flaky-wallet',
            icon: '',
            chains: [ChainType.Evm],
          },
          metadata: { connectedAt: Date.now(), lastActiveAt: Date.now() },
        };
      });

      // Start concurrent connections
      const promise1 = connectionManager.connectWithRecovery(adapter, {});
      const promise2 = connectionManager.connectWithRecovery(adapter, {});
      const promise3 = connectionManager.connectWithRecovery(adapter, {});

      // Wait for all promises to settle (the operations are serialized by the lock)
      const results = await Promise.allSettled([promise1, promise2, promise3]);

      // Verify the results match expected pattern due to serialized execution

      // Given the serialized nature with locking, we expect:
      // - First call (callCount=1): succeeds
      // - Second call (callCount=2): fails
      // - Third call (callCount=3): succeeds
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
      expect(results[2].status).toBe('fulfilled');

      // State should reflect the last successful connection (third call)
      const state = connectionManager.getConnectionState('flaky-wallet');
      expect(state?.status).toBe('connected');
    });
  });

  describe('Connection and Disconnection Race Conditions', () => {
    it('should handle concurrent connect and disconnect operations', async () => {
      const adapter = createMockAdapter('test-wallet', false, 100);

      // Start connection
      const connectPromise = connectionManager.connectWithRecovery(adapter, {});

      // Start disconnection while connection is in progress
      const disconnectPromise = connectionManager.disconnect('test-wallet', adapter);

      await new Promise((resolve) => setTimeout(resolve, 150));

      const [connectResult, disconnectResult] = await Promise.allSettled([connectPromise, disconnectPromise]);

      // Both operations should complete without corruption
      expect(connectResult.status).toBe('fulfilled');
      expect(disconnectResult.status).toBe('fulfilled');

      // Final state should be disconnected (last operation wins)
      const state = connectionManager.getConnectionState('test-wallet');
      expect(state?.status).toBe('disconnected');
    });
  });

  describe('Recovery Race Conditions', () => {
    it('should prevent multiple recovery attempts from interfering with each other', async () => {
      const adapter = createMockAdapter('unreliable-wallet', true, 50);

      // Enable auto-recovery
      connectionManager.setRecoveryOptions('unreliable-wallet', {
        autoReconnect: true,
        reconnectInterval: 100,
        maxReconnectAttempts: 3,
      });

      // Start initial connection (will fail and trigger recovery)
      const initialPromise = connectionManager.connectWithRecovery(adapter, {});

      await new Promise((resolve) => setTimeout(resolve, 60));

      // Initial connection should fail
      await expect(initialPromise).rejects.toThrow();

      // Start manual recovery while auto-recovery might be running
      const manualRecoveryPromise = connectionManager.startManualRecovery('unreliable-wallet', adapter, {});

      await new Promise((resolve) => setTimeout(resolve, 200));

      // Manual recovery should handle the race condition gracefully
      await expect(manualRecoveryPromise).rejects.toThrow(); // Still fails because adapter always fails

      // State should be consistent (error state)
      const state = connectionManager.getConnectionState('unreliable-wallet');
      expect(state?.status).toBe('error');

      // Stop auto-recovery to prevent unhandled promises
      connectionManager.setRecoveryOptions('unreliable-wallet', {
        autoReconnect: false,
        reconnectInterval: 0,
        maxReconnectAttempts: 0,
      });

      // Wait a bit to ensure any pending recovery attempts are cancelled
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
  });

  describe('State Consistency During Concurrent Operations', () => {
    it('should maintain atomic state updates during concurrent operations', async () => {
      const adapters = [
        createMockAdapter('wallet-1', false, 50),
        createMockAdapter('wallet-2', false, 75),
        createMockAdapter('wallet-3', false, 100),
      ];

      // Start multiple wallet connections concurrently
      const promises = adapters.map((adapter) => connectionManager.connectWithRecovery(adapter, {}));

      await new Promise((resolve) => setTimeout(resolve, 150));

      const results = await Promise.allSettled(promises);

      // All connections should succeed
      expect(results.every((r) => r.status === 'fulfilled')).toBe(true);

      // Each wallet should have consistent state
      for (const adapter of adapters) {
        const state = connectionManager.getConnectionState(adapter.id);
        expect(state?.status).toBe('connected');
        expect(state?.walletId).toBe(adapter.id);
      }

      // Global state should be consistent
      const allStates = connectionManager.getAllConnectionStates();
      expect(allStates.size).toBe(3);
    });

    it('should handle rapid connect/disconnect cycles without corruption', async () => {
      const adapter = createMockAdapter('cycling-wallet', false, 10);

      // Perform rapid connect/disconnect cycles
      for (let i = 0; i < 5; i++) {
        await connectionManager.connectWithRecovery(adapter, {});
        await new Promise((resolve) => setTimeout(resolve, 15));

        await connectionManager.disconnect('cycling-wallet', adapter);
        await new Promise((resolve) => setTimeout(resolve, 5));
      }

      // Final state should be consistent
      const state = connectionManager.getConnectionState('cycling-wallet');
      expect(state?.status).toBe('disconnected');
    });
  });
});
