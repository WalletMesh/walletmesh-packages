/**
 * Tests for disconnect safety validation in useConnect hook
 */

import { renderHook } from '@testing-library/react';
import type {
  ChainType,
  ConnectionService,
  TransactionRequest,
  TransactionResult,
  TransactionStatus,
} from '@walletmesh/modal-core';
import { act } from 'react';
import type React from 'react';
import { type Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestWrapper } from '../test-utils/testHelpers.js';
import { useConnect } from './useConnect.js';

// Use the same WalletMeshClient type derivation as WalletMeshContext.tsx
type WalletMeshClient = Awaited<ReturnType<typeof import('@walletmesh/modal-core').createWalletMesh>>;

// Mock logger
vi.mock('../utils/logger.js', () => ({
  createComponentLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

// Mock WalletMeshContext to provide mocked services
vi.mock('../WalletMeshContext.js', async () => {
  const actual = await vi.importActual('../WalletMeshContext.js');
  return {
    ...actual,
    useWalletMeshContext: vi.fn(),
    useWalletMeshServices: vi.fn(),
  };
});

// Mock useStore hooks
vi.mock('./internal/useStore.js', async () => {
  const actual = await vi.importActual('./internal/useStore.js');
  return {
    ...actual,
    useStore: vi.fn(),
    useStoreActions: vi.fn(),
    useStoreInstance: vi.fn(),
  };
});

import { useWalletMeshContext, useWalletMeshServices } from '../WalletMeshContext.js';
import { useStore, useStoreActions, useStoreInstance } from './internal/useStore.js';

describe('useConnect - Disconnect Safety', () => {
  let wrapper: (props: { children: React.ReactNode }) => React.ReactElement;
  let mockClient: Partial<WalletMeshClient>;
  let mockConnectionService: Partial<ConnectionService>;
  let mockGetState: Mock;
  let mockStore: ReturnType<typeof useStoreInstance>;
  let mockActions: ReturnType<typeof useStoreActions>;

  // Helper to create a pending transaction
  const createPendingTransaction = (
    id: string,
    walletId: string,
    status: TransactionStatus = 'proving',
  ): TransactionResult => ({
    txStatusId: id,
    txHash: `0x${id}`,
    status,
    walletId,
    chainId: 'eip155:1',
    chainType: 'evm' as ChainType,
    from: '0x1234567890123456789012345678901234567890',
    request: {
      to: '0x0987654321098765432109876543210987654321',
      value: '1000000000000000000',
    } as TransactionRequest,
    startTime: Date.now(),
    // Function to wait for confirmation (mock implementation)
    wait: async () => ({
      transactionHash: `0x${id}`,
      blockHash: '0xblockhash',
      blockNumber: 12345,
      from: '0x1234567890123456789012345678901234567890',
      to: '0x0987654321098765432109876543210987654321',
      gasUsed: '21000',
      status: '0x1' as const,
    }),
  });

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    // Create mock client
    mockClient = {
      connect: vi.fn().mockResolvedValue({
        walletId: 'metamask',
        addresses: ['0x1234567890123456789012345678901234567890'],
        chainId: '0x1',
      }),
      disconnect: vi.fn().mockResolvedValue(undefined),
      disconnectAll: vi.fn().mockResolvedValue(undefined),
      getWallet: vi.fn(),
      isConnected: true,
      sessions: [],
      subscribe: vi.fn().mockReturnValue(() => {}),
      getServices: vi.fn(),
      modal: {
        open: vi.fn(),
        close: vi.fn(),
        getState: vi.fn(),
        subscribe: vi.fn(),
        getActions: vi.fn(),
        destroy: vi.fn(),
      } as unknown as WalletMeshClient['modal'],
      getState: vi.fn(),
      openModal: vi.fn(),
      getAllSessions: vi.fn().mockReturnValue([]),
      getActiveSession: vi.fn(),
      getWalletInfo: vi.fn(),
      isReconnecting: false,
      getQueryManager: vi.fn(),
      getPublicProvider: vi.fn(),
      getWalletProvider: vi.fn(),
    } as unknown as WalletMeshClient;

    // Create mock connection service
    mockConnectionService = {
      getConnectionStatus: vi.fn().mockReturnValue('connected'),
      connect: vi.fn().mockResolvedValue({ success: true }),
      disconnect: vi.fn().mockResolvedValue({ success: true }),
    };

    // Create mock store with complete state structure
    mockGetState = vi.fn();
    mockGetState.mockReturnValue({
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
        wallets: {
          metamask: {
            id: 'metamask',
            name: 'MetaMask',
            chains: ['evm' as ChainType],
            features: [],
            icon: 'data:image/svg+xml;base64,',
          },
        },
        sessions: {
          'session-1': {
            sessionId: 'session-1',
            walletId: 'metamask',
            status: 'connected',
            activeAccount: {
              address: '0x1234567890123456789012345678901234567890',
            },
            chain: {
              chainId: 'eip155:1',
              chainType: 'evm' as ChainType,
              name: 'Ethereum',
              required: true,
            },
            accounts: [
              {
                address: '0x1234567890123456789012345678901234567890',
              },
            ],
            provider: {
              instance: {
                getAddresses: vi.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
                getChainId: vi.fn().mockResolvedValue('0x1'),
                disconnect: vi.fn().mockResolvedValue(undefined),
                request: vi.fn(),
                on: vi.fn(),
                off: vi.fn(),
                removeAllListeners: vi.fn(),
              },
              type: 'eip1193',
              version: '1.0.0',
              multiChainCapable: false,
              supportedMethods: ['eth_accounts', 'eth_sendTransaction', 'eth_sign'],
            },
            permissions: {
              methods: ['eth_accounts', 'eth_sendTransaction'],
              events: [],
            },
            metadata: {
              wallet: {
                name: 'MetaMask',
                icon: 'data:image/svg+xml;base64,',
              },
              dapp: {
                name: 'Test App',
              },
              connection: {
                initiatedBy: 'user' as const,
                method: 'manual' as const,
              },
            },
            lifecycle: {
              createdAt: Date.now(),
              lastActiveAt: Date.now(),
              lastAccessedAt: Date.now(),
              expiresAt: Date.now() + 86400000, // 24 hours
              operationCount: 0,
              activeTime: 0,
            },
          },
        },
        transactions: {},
      },
      active: {
        sessionId: 'session-1',
        walletId: 'metamask',
        transactionId: null,
        selectedWalletId: null,
      },
      meta: {
        availableWalletIds: ['metamask'],
        lastDiscoveryTime: null,
        connectionTimestamps: {},
        discoveryErrors: [],
        transactionStatus: 'idle' as TransactionStatus,
      },
    });

    // Create mock store that matches Zustand pattern
    mockStore = Object.assign(
      () => mockGetState(), // Call without selector returns full state
      {
        getState: mockGetState,
        subscribe: vi.fn().mockReturnValue(() => {}),
        setState: vi.fn(),
        destroy: vi.fn(),
      },
    ) as unknown as ReturnType<typeof useStoreInstance>;

    // Create mock actions
    mockActions = {
      ui: {
        setError: vi.fn(),
        clearError: vi.fn(),
      },
      connections: {},
    } as unknown as ReturnType<typeof useStoreActions>;

    // Setup mock implementations
    vi.mocked(useWalletMeshContext).mockReturnValue({
      client: mockClient as unknown as WalletMeshClient,
      config: {
        appName: 'Test App',
        chains: [],
      },
    });
    vi.mocked(useWalletMeshServices).mockReturnValue({
      connection: mockConnectionService as ConnectionService,
      transaction: {} as never,
      balance: {} as never,
      chain: {} as never,
    });
    vi.mocked(useStoreActions).mockReturnValue(mockActions);
    vi.mocked(useStoreInstance).mockReturnValue(mockStore);
    vi.mocked(useStore).mockImplementation((selector) => {
      const state = mockStore.getState();
      return selector ? selector(state) : state;
    });

    const testSetup = createTestWrapper();
    wrapper = testSetup.wrapper;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Disconnect with Pending Transactions', () => {
    it('should prevent disconnect when there are pending transactions', async () => {
      // Add pending transactions to the store
      const currentState = mockGetState();
      mockGetState.mockReturnValue({
        ...currentState,
        entities: {
          ...currentState.entities,
          transactions: {
            tx1: createPendingTransaction('tx1', 'metamask', 'proving'),
            tx2: createPendingTransaction('tx2', 'metamask', 'sending'),
          },
        },
      });

      const { result } = renderHook(() => useConnect(), { wrapper });

      // Try to disconnect
      await expect(
        act(async () => {
          await result.current.disconnect('metamask');
        }),
      ).rejects.toThrow('Cannot disconnect: 2 pending transaction(s)');

      // Verify disconnect was not called
      expect(mockClient.disconnect).not.toHaveBeenCalled();
    });

    it('should allow disconnect with force option even with pending transactions', async () => {
      // Add pending transactions to the store
      const currentState = mockGetState();
      mockGetState.mockReturnValue({
        ...currentState,
        entities: {
          ...currentState.entities,
          transactions: {
            tx1: createPendingTransaction('tx1', 'metamask', 'proving'),
            tx2: createPendingTransaction('tx2', 'metamask', 'sending'),
          },
        },
      });

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
      const currentState = mockGetState();
      mockGetState.mockReturnValue({
        ...currentState,
        entities: {
          ...currentState.entities,
          transactions: {
            tx1: createPendingTransaction('tx1', 'metamask', 'simulating'),
            tx2: createPendingTransaction('tx2', 'metamask', 'proving'),
            tx3: createPendingTransaction('tx3', 'metamask', 'sending'),
            tx4: createPendingTransaction('tx4', 'metamask', 'confirming'),
            tx5: createPendingTransaction('tx5', 'metamask', 'confirmed'), // Not pending
            tx6: createPendingTransaction('tx6', 'metamask', 'failed'), // Not pending
          },
        },
      });

      const { result } = renderHook(() => useConnect(), { wrapper });

      // Try to disconnect
      await expect(
        act(async () => {
          await result.current.disconnect('metamask');
        }),
      ).rejects.toThrow('Cannot disconnect: 4 pending transaction(s)');
    });

    it('should only check transactions for the specific wallet being disconnected', async () => {
      // Add transactions for multiple wallets
      const currentState = mockGetState();
      mockGetState.mockReturnValue({
        ...currentState,
        entities: {
          ...currentState.entities,
          transactions: {
            tx1: createPendingTransaction('tx1', 'metamask', 'proving'),
            tx2: createPendingTransaction('tx2', 'walletconnect', 'proving'), // Different wallet
            tx3: createPendingTransaction('tx3', 'metamask', 'sending'),
          },
        },
      });

      const { result } = renderHook(() => useConnect(), { wrapper });

      // Try to disconnect metamask
      await expect(
        act(async () => {
          await result.current.disconnect('metamask');
        }),
      ).rejects.toThrow('Cannot disconnect: 2 pending transaction(s)');
    });
  });

  describe('DisconnectAll with Pending Transactions', () => {
    it('should prevent disconnectAll when there are pending transactions', async () => {
      // Add pending transactions for multiple wallets
      const currentState = mockGetState();
      mockGetState.mockReturnValue({
        ...currentState,
        entities: {
          ...currentState.entities,
          transactions: {
            tx1: createPendingTransaction('tx1', 'metamask', 'proving'),
            tx2: createPendingTransaction('tx2', 'walletconnect', 'sending'),
            tx3: createPendingTransaction('tx3', 'phantom', 'confirming'),
          },
        },
      });

      const { result } = renderHook(() => useConnect(), { wrapper });

      // Try to disconnect all
      await expect(
        act(async () => {
          await result.current.disconnectAll();
        }),
      ).rejects.toThrow('Cannot disconnect all: 3 pending transaction(s) across 3 wallet(s)');

      // Verify disconnectAll was not called
      expect(mockClient.disconnectAll).not.toHaveBeenCalled();
    });

    it('should allow disconnectAll with force option', async () => {
      // Add pending transactions
      const currentState = mockGetState();
      mockGetState.mockReturnValue({
        ...currentState,
        entities: {
          ...currentState.entities,
          transactions: {
            tx1: createPendingTransaction('tx1', 'metamask', 'proving'),
            tx2: createPendingTransaction('tx2', 'walletconnect', 'sending'),
          },
        },
      });

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
      const currentState = mockGetState();
      mockGetState.mockReturnValue({
        ...currentState,
        entities: {
          ...currentState.entities,
          transactions: {
            tx1: createPendingTransaction('tx1', 'metamask', 'confirmed'),
            tx2: createPendingTransaction('tx2', 'metamask', 'failed'),
          },
        },
      });

      const { result } = renderHook(() => useConnect(), { wrapper });

      // Should disconnect successfully
      await act(async () => {
        await result.current.disconnect('metamask');
      });

      expect(mockClient.disconnect).toHaveBeenCalledWith('metamask');
    });

    it('should handle empty transaction history', async () => {
      const { result } = renderHook(() => useConnect(), { wrapper });

      // Should disconnect successfully with empty history
      await act(async () => {
        await result.current.disconnect('metamask');
      });

      expect(mockClient.disconnect).toHaveBeenCalledWith('metamask');
    });

    it('should handle transactions without walletId', async () => {
      // Add transaction with different walletId
      const currentState = mockGetState();
      mockGetState.mockReturnValue({
        ...currentState,
        entities: {
          ...currentState.entities,
          transactions: {
            tx1: {
              ...createPendingTransaction('tx1', 'unknown', 'proving'),
              walletId: 'unknown',
            },
          },
        },
      });

      const { result } = renderHook(() => useConnect(), { wrapper });

      // Should allow disconnect since transaction is from different wallet
      await act(async () => {
        await result.current.disconnect('metamask');
      });

      expect(mockClient.disconnect).toHaveBeenCalledWith('metamask');
    });
  });
});
