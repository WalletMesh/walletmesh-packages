/**
 * Tests for state transformation utilities
 */

import { ChainType } from '@walletmesh/modal-core';
import type { WalletMeshState as CoreWalletMeshState } from '@walletmesh/modal-core';
import { describe, expect, it, vi } from 'vitest';
import {
  disconnectActiveWallet,
  isAnyWalletConnected,
  isAnyWalletConnecting,
  mapActionToCoreStore,
  transformCoreToReactState,
} from './stateTransform.js';

// Mock the logger to prevent console output during tests
vi.mock('./logger.js', () => ({
  createComponentLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

describe('stateTransform', () => {
  // Helper to create a mock core state
  const createMockCoreState = (overrides: Partial<CoreWalletMeshState> = {}): CoreWalletMeshState => ({
    ui: {
      modalOpen: false,
      currentView: 'walletSelection',
      viewHistory: [],
      loading: {
        connection: false,
        discovery: false,
        transaction: false,
      },
      errors: {},
      ...(overrides.ui || {}),
    },
    entities: {
      wallets: {},
      sessions: {},
      transactions: {},
      ...(overrides.entities || {}),
    },
    active: {
      sessionId: null,
      walletId: null,
      transactionId: null,
      selectedWalletId: null,
      ...(overrides.active || {}),
    },
    meta: {
      lastDiscoveryTime: null,
      connectionTimestamps: {},
      availableWalletIds: [],
      discoveryErrors: [],
      transactionStatus: 'idle' as const,
      ...(overrides.meta || {}),
    },
  });

  const mockWallet = {
    id: 'metamask',
    name: 'MetaMask',
    icon: 'metamask-icon.png',
    chains: [ChainType.Evm],
  };

  const mockSession = {
    sessionId: 'session-123',
    walletId: 'metamask',
    status: 'connected' as const,
    accounts: [
      { address: '0x123', name: 'Account 1', index: 0, isDefault: true, isActive: true },
      { address: '0x456', name: 'Account 2', index: 1, isDefault: false, isActive: false },
    ],
    activeAccount: { address: '0x123', name: 'Account 1', index: 0, isDefault: true, isActive: true },
    chain: {
      chainId: 'eip155:1',
      chainType: ChainType.Evm,
      name: 'Ethereum',
      required: false,
    },
    provider: {
      instance: {
        request: vi.fn(),
        connected: true,
        getAddresses: vi.fn().mockResolvedValue(['0x123']),
        getChainId: vi.fn().mockResolvedValue('eip155:1'),
        disconnect: vi.fn().mockResolvedValue(undefined),
        on: vi.fn(),
        off: vi.fn(),
        removeAllListeners: vi.fn(),
      },
      type: 'eip1193',
      version: '1.0.0',
      multiChainCapable: false,
      supportedMethods: ['eth_accounts', 'eth_sendTransaction'],
    },
    permissions: { methods: [], events: [] },
    metadata: {
      wallet: {
        name: 'MetaMask',
        icon: 'metamask-icon.png',
        version: '10.0.0',
      },
      dapp: {
        name: 'Test DApp',
        url: 'https://test.com',
      },
      connection: {
        initiatedBy: 'user' as const,
        method: 'manual' as const,
      },
    },
    lifecycle: {
      state: 'active' as const,
      connectedAt: Date.now(),
      lastActiveAt: Date.now(),
      reconnectAttempts: 0,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
      operationCount: 0,
      activeTime: 0,
    },
  };

  describe('transformCoreToReactState', () => {
    it('should transform disconnected state correctly', () => {
      const coreState = createMockCoreState();
      const reactState = transformCoreToReactState(coreState);

      expect(reactState.connectionStatus).toBe('disconnected');
      expect(reactState.selectedWallet).toBeNull();
      expect(reactState.connectedWallets).toEqual([]);
      expect(reactState.provider).toBeNull();
      expect(reactState.isModalOpen).toBe(false);
      expect(reactState.currentView).toBe('walletSelection');
      expect(reactState.error).toBeNull();
      expect(reactState.address).toBeUndefined();
      expect(reactState.accounts).toBeUndefined();
    });

    it('should transform connected state correctly', () => {
      const coreState = createMockCoreState({
        entities: {
          wallets: { metamask: mockWallet },
          sessions: { 'session-123': mockSession },
          transactions: {},
        },
        active: {
          sessionId: 'session-123',
          walletId: 'metamask',
          transactionId: null,
          selectedWalletId: 'metamask',
        },
        meta: {
          ...createMockCoreState().meta,
          availableWalletIds: ['metamask'],
        },
      });

      const reactState = transformCoreToReactState(coreState);

      expect(reactState.connectionStatus).toBe('connected');
      expect(reactState.selectedWallet).toEqual({
        id: 'metamask',
        name: 'MetaMask',
        icon: 'metamask-icon.png',
        chains: [ChainType.Evm],
      });
      expect(reactState.connectedWallets).toHaveLength(1);
      expect(reactState.provider).toBe(mockSession.provider.instance);
      expect(reactState.address).toBe('0x123');
      expect(reactState.accounts).toEqual(['0x123', '0x456']);
      expect(reactState.currentChain).toEqual(mockSession.chain);
    });

    it('should transform connecting state correctly', () => {
      const connectingSession = {
        ...mockSession,
        status: 'connecting' as const,
      };

      const coreState = createMockCoreState({
        entities: {
          wallets: { metamask: mockWallet },
          sessions: { 'session-123': connectingSession },
          transactions: {},
        },
        active: {
          sessionId: 'session-123',
          walletId: 'metamask',
          transactionId: null,
          selectedWalletId: 'metamask',
        },
        meta: {
          ...createMockCoreState().meta,
          availableWalletIds: ['metamask'],
        },
      });

      const reactState = transformCoreToReactState(coreState);

      expect(reactState.connectionStatus).toBe('connecting');
      expect(reactState.address).toBeUndefined();
      expect(reactState.accounts).toBeUndefined();
      expect(reactState.provider).toBeNull();
    });

    it('should transform error state correctly', () => {
      const errorSession = {
        ...mockSession,
        status: 'error' as const,
      };

      const coreState = createMockCoreState({
        ui: {
          modalOpen: true,
          currentView: 'error',
          viewHistory: [],
          loading: {
            connection: false,
            discovery: false,
            transaction: false,
          },
          errors: {
            connection: {
              code: 'CONNECTION_FAILED',
              message: 'Failed to connect',
              category: 'wallet',
              data: { reason: 'User rejected' },
            },
          },
        },
        entities: {
          wallets: { metamask: mockWallet },
          sessions: { 'session-123': errorSession },
          transactions: {},
        },
        active: {
          sessionId: 'session-123',
          walletId: 'metamask',
          transactionId: null,
          selectedWalletId: 'metamask',
        },
        meta: {
          ...createMockCoreState().meta,
          availableWalletIds: ['metamask'],
        },
      });

      const reactState = transformCoreToReactState(coreState);

      expect(reactState.connectionStatus).toBe('error');
      expect(reactState.currentView).toBe('error');
      expect(reactState.error).toEqual({
        code: 'CONNECTION_FAILED',
        message: 'Failed to connect',
        category: 'network',
        recoveryStrategy: 'retry',
        data: { reason: 'User rejected' },
      });
    });

    it('should handle string error correctly', () => {
      const coreState = createMockCoreState({
        ui: {
          modalOpen: true,
          currentView: 'error',
          viewHistory: [],
          loading: {},
          errors: {
            connection: {
              code: 'GENERAL_ERROR',
              message: 'Simple error message',
              category: 'general' as const,
            },
          },
        },
      });

      const reactState = transformCoreToReactState(coreState);

      expect(reactState.error).toEqual({
        code: 'ERROR',
        message: 'Simple error message',
        category: 'network',
        recoveryStrategy: 'retry',
        data: {},
      });
    });

    it('should map multiple connected wallets', () => {
      const session2 = {
        ...mockSession,
        sessionId: 'session-456',
        walletId: 'phantom',
      };

      const wallet2 = {
        id: 'phantom',
        name: 'Phantom',
        icon: 'phantom-icon.png',
        chains: [ChainType.Solana],
      };

      const coreState = createMockCoreState({
        entities: {
          wallets: {
            metamask: mockWallet,
            phantom: wallet2,
          },
          sessions: {
            'session-123': mockSession,
            'session-456': session2,
          },
          transactions: {},
        },
        active: {
          sessionId: 'session-123',
          walletId: 'metamask',
          transactionId: null,
          selectedWalletId: null,
        },
        meta: {
          lastDiscoveryTime: null,
          connectionTimestamps: {},
          availableWalletIds: ['metamask', 'phantom'],
          discoveryErrors: [],
          transactionStatus: 'idle',
        },
      });

      const reactState = transformCoreToReactState(coreState);

      expect(reactState.connectedWallets).toHaveLength(2);
      expect(reactState.connectedWallets[0]?.id).toBe('metamask');
      expect(reactState.connectedWallets[1]?.id).toBe('phantom');
    });

    it('should handle loading state with progress', () => {
      const coreState = createMockCoreState({
        ui: {
          modalOpen: true,
          currentView: 'connecting',
          viewHistory: [],
          loading: {
            connection: true,
          },
          errors: {},
        },
      });

      const reactState = transformCoreToReactState(coreState);

      expect(reactState.connectionProgress).toEqual({ message: 'Loading...' });
    });

    it('should map supported chains correctly', () => {
      const coreState = createMockCoreState({
        entities: {
          wallets: {
            wallet1: {
              id: 'wallet1',
              name: 'Wallet 1',
              chains: [ChainType.Evm, ChainType.Solana],
              icon: '',
            },
            wallet2: {
              id: 'wallet2',
              name: 'Wallet 2',
              chains: [ChainType.Aztec],
              icon: '',
            },
            wallet3: {
              id: 'wallet3',
              name: 'Wallet 3',
              chains: [ChainType.Evm],
              icon: '',
            },
          },
          sessions: {},
          transactions: {},
        },
        meta: {
          availableWalletIds: ['wallet1', 'wallet2', 'wallet3'],
          lastDiscoveryTime: null,
          connectionTimestamps: {},
          discoveryErrors: [],
          transactionStatus: 'idle' as const,
        },
      });

      const reactState = transformCoreToReactState(coreState);

      expect(reactState.supportedChains).toHaveLength(3);
      expect(reactState.supportedChains.map((c) => c.chainType)).toContain(ChainType.Evm);
      expect(reactState.supportedChains.map((c) => c.chainType)).toContain(ChainType.Solana);
      expect(reactState.supportedChains.map((c) => c.chainType)).toContain(ChainType.Aztec);
    });

    it('should handle wallets without icons', () => {
      const walletNoIcon = {
        id: 'simple-wallet',
        name: 'Simple Wallet',
        chains: [ChainType.Evm],
      };

      const coreState = createMockCoreState({
        entities: {
          wallets: {
            'simple-wallet': { ...walletNoIcon, icon: '' },
          },
          sessions: {
            'session-123': { ...mockSession, walletId: 'simple-wallet' },
          },
          transactions: {},
        },
        active: {
          walletId: 'simple-wallet',
          sessionId: 'session-123',
          transactionId: null,
          selectedWalletId: 'simple-wallet',
        },
        meta: {
          availableWalletIds: ['simple-wallet'],
          lastDiscoveryTime: null,
          connectionTimestamps: {},
          discoveryErrors: [],
          transactionStatus: 'idle' as const,
        },
      });

      const reactState = transformCoreToReactState(coreState);

      expect(reactState.selectedWallet).toEqual({
        id: 'simple-wallet',
        name: 'Simple Wallet',
        chains: [ChainType.Evm],
      });
      expect(reactState.selectedWallet && 'icon' in reactState.selectedWallet).toBe(false);
    });

    it('should handle disconnected session status', () => {
      const disconnectedSession = {
        ...mockSession,
        status: 'disconnected' as const,
      };

      const coreState = createMockCoreState({
        entities: {
          wallets: {},
          sessions: {
            'session-123': disconnectedSession,
          },
          transactions: {},
        },
        active: {
          walletId: null,
          sessionId: null,
          transactionId: null,
          selectedWalletId: null,
        },
        meta: {
          lastDiscoveryTime: null,
          connectionTimestamps: {},
          availableWalletIds: [],
          discoveryErrors: [],
          transactionStatus: 'idle',
        },
      });

      const reactState = transformCoreToReactState(coreState);

      expect(reactState.connectionStatus).toBe('disconnected');
      expect(reactState.address).toBeUndefined();
      expect(reactState.provider).toBeNull();
    });

    it('should handle unknown chain types with default mapping', () => {
      const coreState = createMockCoreState({
        entities: {
          wallets: {
            'unknown-wallet': {
              id: 'unknown-wallet',
              name: 'Unknown Wallet',
              icon: '',
              chains: ['unknown-chain' as ChainType], // Unknown chain type
            },
          },
          sessions: {},
          transactions: {},
        },
        active: {
          walletId: null,
          sessionId: null,
          transactionId: null,
          selectedWalletId: null,
        },
        meta: {
          lastDiscoveryTime: null,
          connectionTimestamps: {},
          availableWalletIds: ['unknown-wallet'],
          discoveryErrors: [],
          transactionStatus: 'idle',
        },
      });

      const reactState = transformCoreToReactState(coreState);

      expect(reactState.supportedChains).toHaveLength(1);
      expect(reactState.supportedChains[0]).toEqual({
        chainId: 'unknown-chain',
        chainType: ChainType.Evm, // Defaults to EVM
        name: 'unknown-chain',
        required: false,
      });
    });
  });

  describe('isAnyWalletConnected', () => {
    it('should return true when at least one wallet is connected', () => {
      const coreState = createMockCoreState({
        entities: {
          wallets: { metamask: mockWallet },
          sessions: {
            'session-123': {
              ...mockSession,
              status: 'connected' as const,
            },
          },
          transactions: {},
        },
        active: {
          walletId: 'metamask',
          sessionId: 'session-123',
          transactionId: null,
          selectedWalletId: 'metamask',
        },
        meta: {
          lastDiscoveryTime: null,
          connectionTimestamps: {},
          availableWalletIds: ['metamask'],
          discoveryErrors: [],
          transactionStatus: 'idle',
        },
      });

      expect(isAnyWalletConnected(coreState)).toBe(true);
    });

    it('should return false when no wallets are connected', () => {
      const coreState = createMockCoreState({
        entities: {
          wallets: {},
          sessions: {},
          transactions: {},
        },
        active: {
          walletId: null,
          sessionId: null,
          transactionId: null,
          selectedWalletId: null,
        },
        meta: {
          lastDiscoveryTime: null,
          connectionTimestamps: {},
          availableWalletIds: [],
          discoveryErrors: [],
          transactionStatus: 'idle',
        },
      });

      expect(isAnyWalletConnected(coreState)).toBe(false);
    });

    it('should return false when there are no sessions', () => {
      const coreState = createMockCoreState();
      expect(isAnyWalletConnected(coreState)).toBe(false);
    });
  });

  describe('isAnyWalletConnecting', () => {
    it('should return true when at least one wallet is connecting', () => {
      const coreState = createMockCoreState({
        entities: {
          wallets: { metamask: mockWallet },
          sessions: {
            'session-123': {
              ...mockSession,
              status: 'connecting' as const,
            },
          },
          transactions: {},
        },
        active: {
          walletId: 'metamask',
          sessionId: 'session-123',
          transactionId: null,
          selectedWalletId: 'metamask',
        },
        meta: {
          lastDiscoveryTime: null,
          connectionTimestamps: {},
          availableWalletIds: ['metamask'],
          discoveryErrors: [],
          transactionStatus: 'idle',
        },
      });

      expect(isAnyWalletConnecting(coreState)).toBe(true);
    });

    it('should return true when wallet is initializing', () => {
      const coreState = createMockCoreState({
        entities: {
          wallets: { metamask: mockWallet },
          sessions: {
            'session-123': {
              ...mockSession,
              status: 'initializing' as const,
            },
          },
          transactions: {},
        },
        active: {
          walletId: 'metamask',
          sessionId: 'session-123',
          transactionId: null,
          selectedWalletId: 'metamask',
        },
        meta: {
          lastDiscoveryTime: null,
          connectionTimestamps: {},
          availableWalletIds: ['metamask'],
          discoveryErrors: [],
          transactionStatus: 'idle',
        },
      });

      expect(isAnyWalletConnecting(coreState)).toBe(true);
    });

    it('should return false when no wallets are connecting', () => {
      const coreState = createMockCoreState({
        entities: {
          wallets: {},
          sessions: {},
          transactions: {},
        },
        active: {
          walletId: null,
          sessionId: null,
          transactionId: null,
          selectedWalletId: null,
        },
        meta: {
          lastDiscoveryTime: null,
          connectionTimestamps: {},
          availableWalletIds: [],
          discoveryErrors: [],
          transactionStatus: 'idle',
        },
      });

      expect(isAnyWalletConnecting(coreState)).toBe(false);
    });
  });

  describe('disconnectActiveWallet', () => {
    it('should throw error indicating new action system requirement', async () => {
      const coreState = createMockCoreState({
        entities: {
          wallets: { metamask: mockWallet },
          sessions: {
            'session-123': mockSession,
          },
          transactions: {},
        },
        active: {
          walletId: 'metamask',
          sessionId: 'session-123', // Active session present
          transactionId: null,
          selectedWalletId: 'metamask',
        },
        meta: {
          lastDiscoveryTime: null,
          connectionTimestamps: {},
          availableWalletIds: ['metamask'],
          discoveryErrors: [],
          transactionStatus: 'idle',
        },
      });

      await expect(disconnectActiveWallet(coreState, {})).rejects.toThrow(
        'endSession action needs to be implemented with new action system',
      );
    });

    it('should not throw when no active session', async () => {
      const coreState = createMockCoreState();
      // Should complete without throwing
      await disconnectActiveWallet(coreState, {});
    });
  });

  describe('mapActionToCoreStore', () => {
    it('should throw error for OPEN_MODAL action', () => {
      expect(() => {
        mapActionToCoreStore({ type: 'OPEN_MODAL' }, {});
      }).toThrow('openModal action needs to be called with new action system');
    });

    it('should throw error for CLOSE_MODAL action', () => {
      expect(() => {
        mapActionToCoreStore({ type: 'CLOSE_MODAL' }, {});
      }).toThrow('closeModal action needs to be called with new action system');
    });

    it('should handle SELECT_WALLET action', () => {
      // Should not throw, just log warning
      expect(() => {
        mapActionToCoreStore({ type: 'SELECT_WALLET', payload: { id: 'metamask' } }, {});
      }).not.toThrow();
    });

    it('should handle DISCONNECT action with wallet ID', () => {
      const coreState = createMockCoreState({
        entities: {
          wallets: {},
          sessions: {},
          transactions: {},
        },
        active: {
          walletId: null,
          sessionId: null,
          transactionId: null,
          selectedWalletId: null,
        },
        meta: {
          lastDiscoveryTime: null,
          connectionTimestamps: {},
          availableWalletIds: [],
          discoveryErrors: [],
          transactionStatus: 'idle',
        },
      });

      // Should not throw, just log warning
      expect(() => {
        mapActionToCoreStore({ type: 'DISCONNECT', payload: 'metamask' }, {}, coreState);
      }).not.toThrow();
    });

    it('should handle DISCONNECT action without wallet ID', () => {
      const coreState = createMockCoreState({
        entities: {
          wallets: {},
          sessions: {},
          transactions: {},
        },
        active: {
          walletId: null,
          sessionId: null,
          transactionId: null,
          selectedWalletId: null,
        },
        meta: {
          lastDiscoveryTime: null,
          connectionTimestamps: {},
          availableWalletIds: [],
          discoveryErrors: [],
          transactionStatus: 'idle',
        },
      });

      // Should not throw, just log warning
      expect(() => {
        mapActionToCoreStore({ type: 'DISCONNECT' }, {}, coreState);
      }).not.toThrow();
    });

    it('should throw error for SET_VIEW action', () => {
      expect(() => {
        mapActionToCoreStore({ type: 'SET_VIEW', payload: 'connecting' }, {});
      }).toThrow('setView action needs to be called with new action system');
    });

    it('should throw error for SET_ERROR action', () => {
      expect(() => {
        mapActionToCoreStore({ type: 'SET_ERROR', payload: { message: 'Error' } }, {});
      }).toThrow('setError action needs to be called with new action system');
    });

    it('should throw error for CLEAR_ERROR action', () => {
      expect(() => {
        mapActionToCoreStore({ type: 'CLEAR_ERROR' }, {});
      }).toThrow('setError action needs to be called with new action system');
    });

    it('should handle unknown action types', () => {
      // Should not throw for unknown actions
      expect(() => {
        mapActionToCoreStore({ type: 'UNKNOWN_ACTION' }, {});
      }).not.toThrow();
    });

    it('should handle invalid SET_VIEW payload', () => {
      // Should not throw, just ignore invalid view
      expect(() => {
        mapActionToCoreStore({ type: 'SET_VIEW', payload: 'invalid-view' }, {});
      }).not.toThrow();
    });
  });
});
