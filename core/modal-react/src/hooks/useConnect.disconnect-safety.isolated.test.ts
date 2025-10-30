/**
 * Isolated tests for disconnect safety validation in useConnect hook
 *
 * This test file runs in isolation with direct mocks to avoid
 * heavy test setup and async initialization issues.
 */

import { renderHook } from '@testing-library/react';
import type { ChainType, TransactionStatus } from '@walletmesh/modal-core';
import { act } from 'react';
import type React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock client
const mockClient = {
  connect: vi.fn().mockResolvedValue({
    walletId: 'metamask',
    addresses: ['0x1234567890123456789012345678901234567890'],
    chainId: '0x1',
  }),
  disconnect: vi.fn().mockResolvedValue(undefined),
  disconnectAll: vi.fn().mockResolvedValue(undefined),
};

// Mock store state
const mockStoreState = {
  ui: {
    modalOpen: false,
    currentView: 'connected' as const,
    viewHistory: [],
    loading: {
      connection: false,
      discovery: false,
      transaction: false,
    },
    errors: {},
  },
  entities: {
    wallets: {},
    sessions: {
      'session-1': {
        sessionId: 'session-1',
        walletId: 'metamask',
        status: 'connected',
      },
    },
    transactions: {} as Record<string, any>,
  },
  active: {
    sessionId: 'session-1',
    walletId: 'metamask',
    transactionId: null,
    selectedWalletId: null,
  },
  meta: {
    availableWalletIds: ['metamask'],
  },
};

const mockStore = {
  getState: vi.fn(() => mockStoreState),
  subscribe: vi.fn().mockReturnValue(() => {}),
  setState: vi.fn(),
  destroy: vi.fn(),
};

// Mock logger
vi.mock('../utils/logger.js', () => ({
  createComponentLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

// Mock context
vi.mock('../WalletMeshContext.js', () => ({
  useWalletMeshContext: vi.fn(() => ({
    client: mockClient,
    config: { appName: 'Test App', chains: [] },
  })),
  useWalletMeshServices: vi.fn(() => ({
    connection: {},
    transaction: {},
    balance: {},
    chain: {},
  })),
}));

// Mock store
vi.mock('./internal/useStore.js', () => ({
  useStore: vi.fn((selector?: (state: unknown) => unknown) => {
    const state = mockStore.getState();
    return selector ? selector(state) : state;
  }),
  useStoreActions: vi.fn(() => ({
    ui: { setError: vi.fn(), clearError: vi.fn(), setLoading: vi.fn() },
  })),
  useStoreInstance: vi.fn(() => mockStore),
}));

// Minimal wrapper
const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => children as React.ReactElement;
};

describe('useConnect - Disconnect Safety (Isolated)', () => {
  let wrapper: ReturnType<typeof createWrapper>;

  // Helper to create a pending transaction
  const createPendingTransaction = (id: string, walletId: string, status: TransactionStatus = 'proving') => ({
    txStatusId: id,
    txHash: `0x${id}`,
    status,
    walletId,
    chainId: 'eip155:1',
    chainType: 'evm' as ChainType,
  });

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    wrapper = createWrapper();

    // Reset store state
    mockStoreState.entities.transactions = {};
    mockStore.getState.mockReturnValue(mockStoreState);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Disconnect with Pending Transactions', () => {
    it('should prevent disconnect when there are pending transactions', async () => {
      // Add pending transactions
      mockStoreState.entities.transactions = {
        tx1: createPendingTransaction('tx1', 'metamask', 'proving'),
        tx2: createPendingTransaction('tx2', 'metamask', 'sending'),
      };

      const { useConnect } = await import('./useConnect.js');
      const { result } = renderHook(() => useConnect(), { wrapper });

      // Ensure hook rendered successfully
      expect(result.current).toBeTruthy();
      expect(result.current.disconnect).toBeDefined();

      // Try to disconnect
      await expect(async () => {
        await act(async () => {
          await result.current.disconnect('metamask');
        });
      }).rejects.toThrow('Cannot disconnect: 2 pending transaction(s)');

      // Verify disconnect was not called
      expect(mockClient.disconnect).not.toHaveBeenCalled();
    });

    it('should allow disconnect with force option even with pending transactions', async () => {
      // Add pending transactions
      mockStoreState.entities.transactions = {
        tx1: createPendingTransaction('tx1', 'metamask', 'proving'),
        tx2: createPendingTransaction('tx2', 'metamask', 'sending'),
      };

      const { useConnect } = await import('./useConnect.js');
      const { result } = renderHook(() => useConnect(), { wrapper });

      // Disconnect with force
      await act(async () => {
        await result.current.disconnect('metamask', { force: true });
      });

      // Verify disconnect was called
      expect(mockClient.disconnect).toHaveBeenCalledWith('metamask');
    });

    it('should check all pending transaction states', async () => {
      // Add transactions with various pending states
      mockStoreState.entities.transactions = {
        tx1: createPendingTransaction('tx1', 'metamask', 'simulating'),
        tx2: createPendingTransaction('tx2', 'metamask', 'proving'),
        tx3: createPendingTransaction('tx3', 'metamask', 'sending'),
        tx4: createPendingTransaction('tx4', 'metamask', 'confirming'),
        tx5: createPendingTransaction('tx5', 'metamask', 'confirmed'), // Not pending
        tx6: createPendingTransaction('tx6', 'metamask', 'failed'), // Not pending
      };

      const { useConnect } = await import('./useConnect.js');
      const { result } = renderHook(() => useConnect(), { wrapper });

      // Ensure hook rendered successfully
      expect(result.current).toBeTruthy();
      expect(result.current.disconnect).toBeDefined();

      // Try to disconnect
      await expect(async () => {
        await act(async () => {
          await result.current.disconnect('metamask');
        });
      }).rejects.toThrow('Cannot disconnect: 4 pending transaction(s)');
    });

    it('should only check transactions for the specific wallet being disconnected', async () => {
      // Add transactions for multiple wallets
      mockStoreState.entities.transactions = {
        tx1: createPendingTransaction('tx1', 'metamask', 'proving'),
        tx2: createPendingTransaction('tx2', 'walletconnect', 'proving'), // Different wallet
        tx3: createPendingTransaction('tx3', 'metamask', 'sending'),
      };

      const { useConnect } = await import('./useConnect.js');
      const { result } = renderHook(() => useConnect(), { wrapper });

      // Ensure hook rendered successfully
      expect(result.current).toBeTruthy();
      expect(result.current.disconnect).toBeDefined();

      // Try to disconnect metamask
      await expect(async () => {
        await act(async () => {
          await result.current.disconnect('metamask');
        });
      }).rejects.toThrow('Cannot disconnect: 2 pending transaction(s)');
    });
  });

  describe('DisconnectAll with Pending Transactions', () => {
    it('should prevent disconnectAll when there are pending transactions', async () => {
      // Add pending transactions for multiple wallets
      mockStoreState.entities.transactions = {
        tx1: createPendingTransaction('tx1', 'metamask', 'proving'),
        tx2: createPendingTransaction('tx2', 'walletconnect', 'sending'),
        tx3: createPendingTransaction('tx3', 'phantom', 'confirming'),
      };

      const { useConnect } = await import('./useConnect.js');
      const { result } = renderHook(() => useConnect(), { wrapper });

      // Ensure hook rendered successfully
      expect(result.current).toBeTruthy();
      expect(result.current.disconnectAll).toBeDefined();

      // Try to disconnect all
      await expect(async () => {
        await act(async () => {
          await result.current.disconnectAll();
        });
      }).rejects.toThrow('Cannot disconnect all: 3 pending transaction(s) across 3 wallet(s)');

      // Verify disconnectAll was not called
      expect(mockClient.disconnectAll).not.toHaveBeenCalled();
    });

    it('should allow disconnectAll with force option', async () => {
      // Add pending transactions
      mockStoreState.entities.transactions = {
        tx1: createPendingTransaction('tx1', 'metamask', 'proving'),
        tx2: createPendingTransaction('tx2', 'walletconnect', 'sending'),
      };

      const { useConnect } = await import('./useConnect.js');
      const { result } = renderHook(() => useConnect(), { wrapper });

      // Disconnect all with force
      await act(async () => {
        await result.current.disconnectAll({ force: true });
      });

      // Verify disconnectAll was called
      expect(mockClient.disconnectAll).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should allow disconnect when no pending transactions', async () => {
      // Only completed transactions in history
      mockStoreState.entities.transactions = {
        tx1: createPendingTransaction('tx1', 'metamask', 'confirmed'),
        tx2: createPendingTransaction('tx2', 'metamask', 'failed'),
      };

      const { useConnect } = await import('./useConnect.js');
      const { result } = renderHook(() => useConnect(), { wrapper });

      // Should disconnect successfully
      await act(async () => {
        await result.current.disconnect('metamask');
      });

      expect(mockClient.disconnect).toHaveBeenCalledWith('metamask');
    });

    it('should handle empty transaction history', async () => {
      const { useConnect } = await import('./useConnect.js');
      const { result } = renderHook(() => useConnect(), { wrapper });

      // Should disconnect successfully with empty history
      await act(async () => {
        await result.current.disconnect('metamask');
      });

      expect(mockClient.disconnect).toHaveBeenCalledWith('metamask');
    });

    it('should handle transactions without matching walletId', async () => {
      // Add transaction with different walletId
      mockStoreState.entities.transactions = {
        tx1: createPendingTransaction('tx1', 'unknown', 'proving'),
      };

      const { useConnect } = await import('./useConnect.js');
      const { result } = renderHook(() => useConnect(), { wrapper });

      // Should allow disconnect since transaction is from different wallet
      await act(async () => {
        await result.current.disconnect('metamask');
      });

      expect(mockClient.disconnect).toHaveBeenCalledWith('metamask');
    });
  });
});
