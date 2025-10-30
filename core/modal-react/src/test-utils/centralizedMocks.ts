/**
 * Centralized mock definitions for modal-react
 *
 * Extends modal-core testing utilities with React-specific mocks
 * to eliminate duplication in React component tests.
 */

import { ChainType } from '@walletmesh/modal-core';
import type { AccountInfo, SessionManager, SessionState, WalletMeshState } from '@walletmesh/modal-core';
import {
  createAutoMockedStore as coreCreateAutoMockedStore,
  createMockSessionState as coreCreateMockSessionState,
} from '@walletmesh/modal-core/testing';
import React from 'react';
import type { ReactNode } from 'react';
import { vi } from 'vitest';

// Define the return type for the store
// We define our own interface instead of using ReturnType to ensure type compatibility
interface MockStore {
  getState: () => WalletMeshState;
  setState: (updater: ((state: WalletMeshState) => WalletMeshState) | Partial<WalletMeshState>) => void;
  subscribe: (callback: (state: WalletMeshState) => void) => () => void;
  destroy: () => void;
}

// Create mock SessionManager - exported for use across React tests
export function createMockSessionManager(): SessionManager {
  const sessions = new Map<string, SessionState>();

  return {
    createSession: vi
      .fn()
      .mockImplementation(async (params: Parameters<SessionManager['createSession']>[0]) => {
        const session = coreCreateMockSessionState({
          sessionId: `session-${params.walletId}-${Date.now()}`,
          walletId: params.walletId,
        });
        sessions.set(session.sessionId, session);
        return session;
      }),
    getSession: vi.fn().mockImplementation((sessionId: string) => sessions.get(sessionId) || null),
    getActiveSession: vi.fn().mockReturnValue(null),
    getWalletSessions: vi
      .fn()
      .mockImplementation((walletId: string) =>
        Array.from(sessions.values()).filter((s) => s.walletId === walletId),
      ),
    updateSessionStatus: vi.fn(),
    switchChain: vi.fn().mockResolvedValue({} as SessionState),
    switchAccount: vi.fn().mockResolvedValue({} as SessionState),
    discoverAccounts: vi.fn().mockResolvedValue([] as AccountInfo[]),
    addAccount: vi.fn().mockResolvedValue({} as SessionState),
    removeAccount: vi.fn().mockResolvedValue({} as SessionState),
    getSessionAccounts: vi.fn().mockReturnValue([]),
    getActiveAccount: vi.fn().mockReturnValue(null),
    endSession: vi.fn().mockResolvedValue(undefined),
    compareSessions: vi.fn().mockReturnValue(null),
    cleanupExpiredSessions: vi.fn().mockResolvedValue(undefined),
  };
}
import type { WalletMeshReactConfig } from '../types.js';

// React-specific version of createAutoMockedStore that extends the core version
function createAutoMockedStore(initialState?: Partial<WalletMeshState>): MockStore {
  // Use the core testing utility and add React-specific extensions if needed
  return coreCreateAutoMockedStore(initialState) as unknown as MockStore;
}

// React-specific version of createMockSessionState that extends the core version
function createMockSessionState(options?: {
  sessionId?: string;
  walletId?: string;
  primaryAddress?: string;
  addresses?: string[];
}): SessionState {
  // Use the core testing utility
  return coreCreateMockSessionState(options);
}

/**
 * React-specific global mocks
 */
export const ReactGlobalMocks = {
  /**
   * Mock WalletMeshProvider with default configuration
   */
  WalletMeshProvider: () =>
    vi.mock('../WalletMeshProvider.js', () => ({
      WalletMeshProvider: vi
        .fn()
        .mockImplementation((props: { children?: ReactNode }) =>
          React.createElement('div', { 'data-testid': 'wallet-mesh-provider' }, props.children),
        ),
    })),

  /**
   * Mock React hooks - call this function to set up hook mocks
   */
  setupReactHookMocks: () => {
    // These mocks need to be called at the module level, not inside functions
    // This function serves as documentation of what hooks are available to mock
    return {
      useAccount: {
        isConnected: false,
        isConnecting: false,
        isDisconnected: true,
        address: null,
        addresses: [],
        chainId: null,
        chainType: null,
        wallet: null,
        walletId: null,
        provider: null,
        status: 'disconnected',
        error: null,
      },
      useAddress: null,
      useChain: { chainId: null, chainType: null },
      useIsConnected: false,
      useWallet: null,
      useProvider: null,
      useConnect: {
        connect: vi.fn().mockResolvedValue(undefined),
        status: 'idle',
        isConnecting: false,
        error: null,
        reset: vi.fn(),
      },
      useDisconnect: {
        disconnect: vi.fn().mockResolvedValue(undefined),
        isDisconnecting: false,
        error: null,
      },
    };
  },

  /**
   * Mock WalletMesh store for React components
   */
  WalletMeshStore: () =>
    vi.mock('@walletmesh/modal-core', () => {
      const mockStore = createAutoMockedStore();

      // Create a Zustand-style store mock
      const useStore = Object.assign(
        (selector?: (state: WalletMeshState) => unknown) => {
          if (!selector) return mockStore.getState();
          return selector(mockStore.getState());
        },
        {
          getState: mockStore.getState,
          setState: mockStore.setState,
          subscribe: mockStore.subscribe,
          destroy: mockStore.destroy,
        },
      );

      return {
        useStore,
      };
    }),
} as const;

/**
 * React component mock presets
 */
export const ReactMockPresets = {
  /**
   * Connected state preset for React hooks
   */
  connectedState: (walletId = 'metamask', address = '0x1234567890123456789012345678901234567890') => ({
    useAccount: {
      isConnected: true,
      isConnecting: false,
      isDisconnected: false,
      address,
      addresses: [address],
      chainId: 'eip155:1',
      chainType: ChainType.Evm,
      wallet: {
        id: walletId,
        name: 'MetaMask',
        icon: 'metamask.png',
        chains: [ChainType.Evm],
      },
      walletId,
      provider: {},
      status: 'connected' as const,
      error: null,
    },
    useConnect: {
      connect: vi.fn().mockResolvedValue(undefined),
      status: 'success' as const,
      isConnecting: false,
      error: null,
      reset: vi.fn(),
    },
    useDisconnect: {
      disconnect: vi.fn().mockResolvedValue(undefined),
      isDisconnecting: false,
      error: null,
    },
  }),

  /**
   * Connecting state preset
   */
  connectingState: () => ({
    useAccount: {
      isConnected: false,
      isConnecting: true,
      isDisconnected: false,
      address: null,
      addresses: [],
      chainId: null,
      chainType: null,
      wallet: null,
      walletId: null,
      provider: null,
      status: 'connecting' as const,
      error: null,
    },
    useConnect: {
      connect: vi.fn(),
      status: 'loading' as const,
      isConnecting: true,
      error: null,
      reset: vi.fn(),
    },
  }),

  /**
   * Error state preset
   */
  errorState: (error = new Error('Connection failed')) => ({
    useAccount: {
      isConnected: false,
      isConnecting: false,
      isDisconnected: true,
      address: null,
      addresses: [],
      chainId: null,
      chainType: null,
      wallet: null,
      walletId: null,
      provider: null,
      status: 'disconnected' as const,
      error,
    },
    useConnect: {
      connect: vi.fn().mockRejectedValue(error),
      status: 'error' as const,
      isConnecting: false,
      error,
      reset: vi.fn(),
    },
  }),

  /**
   * Modal open preset
   */
  modalOpen: () => ({
    useModal: {
      isOpen: true,
      open: vi.fn(),
      close: vi.fn(),
      toggle: vi.fn(),
    },
  }),

  /**
   * Multi-wallet preset
   */
  multiWallet: () => ({
    wallets: [
      {
        id: 'metamask',
        name: 'MetaMask',
        icon: 'metamask.png',
        chains: [ChainType.Evm],
      },
      {
        id: 'phantom',
        name: 'Phantom',
        icon: 'phantom.png',
        chains: [ChainType.Solana],
      },
      {
        id: 'walletconnect',
        name: 'WalletConnect',
        icon: 'walletconnect.png',
        chains: [ChainType.Evm],
      },
    ],
    useWallets: {
      wallets: 3,
      availableWallets: 3,
      isLoading: false,
    },
  }),
} as const;

/**
 * Provider configuration presets
 */
export const ProviderConfigPresets = {
  /**
   * Default test configuration
   */
  default: () => ({
    appName: 'Test App',
    appDescription: 'Test Application',
    autoInjectModal: false,
    chains: [ChainType.Evm, ChainType.Solana],
    wallets: ['metamask', 'phantom'],
    debug: false,
  }),

  /**
   * Debug configuration
   */
  debug: () => ({
    appName: 'Debug Test App',
    appDescription: 'Debug Test Application',
    autoInjectModal: false,
    chains: [ChainType.Evm],
    wallets: ['metamask'],
    debug: true,
  }),

  /**
   * Minimal configuration
   */
  minimal: () => ({
    appName: 'Minimal App',
    chains: [ChainType.Evm],
    wallets: ['metamask'],
  }),

  /**
   * Multi-chain configuration
   */
  multiChain: () => ({
    appName: 'Multi-chain App',
    chains: [ChainType.Evm, ChainType.Solana, ChainType.Aztec],
    wallets: ['metamask', 'phantom'],
  }),
} as const;

/**
 * Hook mock utilities for specific testing scenarios
 */
export const HookMockUtils = {
  /**
   * Create a mock hook return value with type safety
   */
  createMockHookReturn: <T extends Record<string, unknown>>(defaults: T) => defaults,

  /**
   * Apply preset to mock hooks
   */
  applyPreset: (preset: Record<string, unknown>) => {
    for (const [hookName, returnValue] of Object.entries(preset)) {
      if (hookName.startsWith('use')) {
        vi.mocked(require(`../hooks/${hookName}.js`)[hookName]).mockReturnValue(returnValue);
      }
    }
  },

  /**
   * Reset all hook mocks
   */
  resetHookMocks: () => {
    const hookFiles = [
      'useAccount',
      'useConnect',
      'useDisconnect',
      'useModal',
      'useWallets',
      'useEnsureChain',
      'useSelectedWallet',
      'useWalletSessions',
    ];

    for (const hookName of hookFiles) {
      try {
        const hookModule = require(`../hooks/${hookName}.js`);
        if (hookModule[hookName] && 'mockReset' in hookModule[hookName]) {
          hookModule[hookName].mockReset();
        }
      } catch {
        // Hook file might not exist
      }
    }
  },

  /**
   * Create mock provider wrapper
   */
  createMockProviderWrapper: (config?: Partial<WalletMeshReactConfig>) => {
    const finalConfig = { ...ProviderConfigPresets.default(), ...config };

    return (props: { children: ReactNode }) =>
      React.createElement(
        'div',
        { 'data-testid': 'mock-wallet-mesh-provider', 'data-config': JSON.stringify(finalConfig) },
        props.children,
      );
  },
} as const;

// Define the return type for ReactTestStoreUtils
interface ReactMockStore extends MockStore {
  useStore: ReturnType<typeof vi.fn>;
}

interface ReactTestStoreUtilsType {
  createReactMockStore: (initialState?: Partial<WalletMeshState>) => ReactMockStore;
  updateStore: (store: MockStore, updates: Partial<WalletMeshState>) => void;
  connectWallet: (store: MockStore, walletId: string, address: string, chainId?: string) => void;
  disconnectWallet: (store: MockStore) => void;
  setError: (store: MockStore, error: string) => void;
  clearError: (store: MockStore) => void;
  createConnectedSession: (walletId?: string, address?: string, chainId?: string) => SessionState;
  setConnectedState: (store: MockStore, walletId: string, address: string, chainId?: string) => void;
}

/**
 * Test store utilities for React tests
 */
export const ReactTestStoreUtils: ReactTestStoreUtilsType = {
  /**
   * Create a mock store with React-friendly defaults
   */
  createReactMockStore: (initialState?: Partial<WalletMeshState>) => {
    const store = createAutoMockedStore(initialState);

    // Add React-specific methods if needed
    return {
      ...store,
      useStore: vi.fn().mockImplementation((selector?: (state: WalletMeshState) => unknown) => {
        const state = store.getState();
        return selector ? selector(state) : state;
      }),
    };
  },

  /**
   * Create a connected session for React tests
   */
  createConnectedSession: (walletId = 'metamask', address = '0x1234567890123456789012345678901234567890') => {
    const session = createMockSessionState({
      sessionId: 'react-test-session',
      walletId,
      primaryAddress: address,
      addresses: [address],
    });
    return session;
  },

  /**
   * Update store with connected state
   */
  setConnectedState: (store: MockStore, walletId: string, address: string, chainId = 'eip155:1') => {
    const session = ReactTestStoreUtils.createConnectedSession(walletId, address, chainId);
    store.setState((state: WalletMeshState) => ({
      ...state,
      entities: {
        ...state.entities,
        sessions: {
          ...state.entities.sessions,
          ['react-test-session']: session,
        },
      },
      active: {
        ...state.active,
        sessionId: 'react-test-session',
        walletId: walletId,
      },
    }));
  },

  /**
   * Update store state
   */
  updateStore: (store: MockStore, updates: Partial<WalletMeshState>) => {
    store.setState(updates);
  },

  /**
   * Connect a wallet in the store
   */
  connectWallet: (store: MockStore, walletId: string, address: string, chainId = 'eip155:1') => {
    const session = ReactTestStoreUtils.createConnectedSession(walletId, address, chainId);
    store.setState((state: WalletMeshState) => ({
      ...state,
      ui: {
        ...state.ui,
        currentView: 'connected',
        loading: {},
      },
      entities: {
        ...state.entities,
        sessions: {
          ...state.entities.sessions,
          'session-1': session,
        },
      },
      active: {
        ...state.active,
        sessionId: 'session-1',
        walletId,
      },
    }));
  },

  /**
   * Disconnect wallet
   */
  disconnectWallet: (store: MockStore) => {
    store.setState((state: WalletMeshState) => ({
      ...state,
      ui: {
        ...state.ui,
        currentView: 'walletSelection',
      },
      entities: {
        ...state.entities,
        sessions: {},
      },
      active: {
        ...state.active,
        sessionId: null,
        walletId: null,
      },
    }));
  },

  /**
   * Set error state
   */
  setError: (store: MockStore, error: string) => {
    store.setState((state: WalletMeshState) => ({
      ...state,
      ui: {
        ...state.ui,
        errors: {
          ...state.ui.errors,
          general: {
            code: 'TEST_ERROR',
            message: error,
            category: 'general' as const,
          },
        },
        currentView: 'error' as const,
      },
    }));
  },

  /**
   * Clear error state
   */
  clearError: (store: MockStore) => {
    store.setState((state: WalletMeshState) => ({
      ...state,
      ui: {
        ...state.ui,
        errors: {},
        currentView: 'walletSelection' as const,
      },
    }));
  },
};
