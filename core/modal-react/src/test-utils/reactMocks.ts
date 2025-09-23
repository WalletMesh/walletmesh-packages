/**
 * React-specific mock utilities for testing
 *
 * Provides specialized mock factories and utilities for React component
 * and hook testing scenarios.
 */

import { renderHook } from '@testing-library/react';
import { ChainType } from '@walletmesh/modal-core';
import type { ChainConfig, SupportedChain, WalletInfo } from '@walletmesh/modal-core';
import type { WalletMeshState } from '@walletmesh/modal-core';
import type React from 'react';
import type { ReactNode } from 'react';
import { act } from 'react';
import { expect, vi } from 'vitest';

// Workaround for TypeScript treating ConnectionStatus as type-only import
// Import the type and define values locally
import type { ConnectionStatus } from '@walletmesh/modal-core';

const ConnectionStatusValues = {
  Disconnected: 'disconnected' as ConnectionStatus,
  Connecting: 'connecting' as ConnectionStatus,
  Connected: 'connected' as ConnectionStatus,
  Error: 'error' as ConnectionStatus,
  Reconnecting: 'reconnecting' as ConnectionStatus,
} as const;

import type { AccountInfo } from '../hooks/useAccount.js';
// SessionManager functionality has been removed from the simplified architecture
import type { UseConnectReturn } from '../hooks/useConnect.js';
import { createTestWrapper } from './testHelpers.js';

// Define the return type for the store
interface MockStore {
  getState: () => WalletMeshState;
  setState: (updater: ((state: WalletMeshState) => WalletMeshState) | Partial<WalletMeshState>) => void;
  subscribe: (callback: (state: WalletMeshState) => void) => () => void;
  destroy: () => void;
}

// Inline createAutoMockedStore to avoid problematic imports
function createAutoMockedStore(initialState?: Partial<WalletMeshState>): MockStore {
  let state: WalletMeshState = {
    entities: {
      wallets: {
        metamask: {
          id: 'metamask',
          name: 'MetaMask',
          icon: 'metamask-icon.png',
          chains: [ChainType.Evm],
        },
      },
      sessions: {},
      transactions: {},
    },
    ui: {
      modalOpen: false,
      currentView: 'walletSelection' as const,
      viewHistory: [],
      loading: {},
      errors: {},
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
      availableWalletIds: ['metamask'],
      discoveryErrors: [],
      transactionStatus: 'idle' as const,
    },
    ...initialState,
  } as WalletMeshState;

  const listeners = new Set<(state: WalletMeshState) => void>();

  return {
    getState: () => state,
    setState: (updater: ((state: WalletMeshState) => WalletMeshState) | Partial<WalletMeshState>) => {
      if (typeof updater === 'function') {
        state = updater(state);
      } else {
        state = { ...state, ...updater } as WalletMeshState;
      }
      for (const listener of listeners) {
        listener(state);
      }
    },
    subscribe: (callback: (state: WalletMeshState) => void) => {
      listeners.add(callback);
      return () => {
        listeners.delete(callback);
      };
    },
    destroy: () => {
      listeners.clear();
    },
  };
}

/**
 * Create a mock account info object for useAccount hook testing
 */
export function createMockUseAccountReturn(overrides?: Partial<AccountInfo>): AccountInfo {
  return {
    isConnected: false,
    isConnecting: false,
    isReconnecting: false,
    isDisconnected: true,
    address: null,
    addresses: [],
    chain: null,
    chainType: null,
    wallet: null,
    walletId: null,
    status: ConnectionStatusValues.Disconnected,
    provider: null,
    error: null,
    // Wallet selection fields
    availableWallets: [],
    preferredWallet: null,
    isSelecting: false,
    selectWallet: vi.fn().mockResolvedValue(undefined),
    setPreferredWallet: vi.fn(),
    getWalletsByChain: vi.fn().mockReturnValue([]),
    getRecommendedWallet: vi.fn().mockReturnValue(null),
    isWalletAvailable: vi.fn().mockReturnValue(false),
    getInstallUrl: vi.fn().mockReturnValue(null),
    clearSelection: vi.fn(),
    refreshAvailability: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

/**
 * Create a mock connection result for useConnect hook testing
 */
export function createMockUseConnectReturn(overrides?: Partial<UseConnectReturn>): UseConnectReturn {
  return {
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
    disconnectAll: vi.fn().mockResolvedValue(undefined),
    retry: vi.fn().mockResolvedValue(undefined),
    wallets: [],
    connectedWallets: [],
    status: ConnectionStatusValues.Disconnected,
    isConnecting: false,
    isDisconnecting: false,
    isPending: false,
    error: null,
    variables: undefined,
    reset: vi.fn(),
    progress: 0,
    progressInfo: null,
    canDisconnect: false,
    ...overrides,
  };
}

type RenderHookResult<T> = ReturnType<typeof renderHook<T, unknown>>;

/**
 * Create a complete mock hook context for testing
 */
export async function createMockHookContext(): Promise<{
  store: MockStore;
  renderHookWithContext: <T>(hook: () => T) => RenderHookResult<T>;
}> {
  const mockStore = createAutoMockedStore();

  const renderHookWithContext = <T>(hook: () => T) => {
    return renderHook(hook, {
      wrapper: createTestWrapper({
        walletMeshConfig: {
          appName: 'Test App',
          chains: [
            {
              chainId: 'eip155:1',
              chainType: ChainType.Evm,
              name: 'Ethereum',
              required: false,
            } as SupportedChain,
            {
              chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
              chainType: ChainType.Solana,
              name: 'Solana',
              required: false,
            } as SupportedChain,
          ],
        },
      }).wrapper,
    });
  };

  return {
    store: mockStore,
    renderHookWithContext,
  };
}

/**
 * Simulate a complete wallet connection flow
 */
interface WrapperProps {
  children: ReactNode;
}

export async function simulateWalletConnection(
  wrapper: (props: WrapperProps) => React.ReactElement,
  walletId = 'metamask',
  options?: {
    chain?: SupportedChain;
    address?: string;
  },
): Promise<{ current: { connect: () => Promise<void>; client: unknown } }> {
  const { renderHook: testRenderHook } = await import('@testing-library/react');
  const { waitFor } = await import('@testing-library/react');
  const { useConnect } = await import('../hooks/useConnect.js');
  const { useWalletMeshContext } = await import('../WalletMeshContext.js');

  const { result } = testRenderHook(
    () => {
      const connectHook = useConnect();
      const context = useWalletMeshContext();
      return { ...connectHook, client: context.client };
    },
    { wrapper },
  );

  // Wait for client to be available
  await waitFor(
    () => {
      expect(result.current.client).not.toBeNull();
    },
    { timeout: 100, interval: 10 },
  );

  await act(async () => {
    await result.current.connect(
      walletId,
      options?.chain
        ? {
            chain: options.chain as ChainConfig,
          }
        : undefined,
    );
  });

  return result;
}

/**
 * Simulate a chain switch operation
 */
export async function simulateChainSwitch(
  wrapper: (props: WrapperProps) => React.ReactElement,
  chain: SupportedChain,
) {
  const { renderHook: testRenderHook } = await import('@testing-library/react');
  const { useSwitchChain } = await import('../hooks/useSwitchChain.js');

  const { result } = testRenderHook(() => useSwitchChain(), { wrapper });

  await act(async () => {
    await result.current.switchChain(chain);
  });

  return result;
}

/**
 * Test state manager for managing multiple stores across tests
 */
export class TestStateManager {
  private stores = new Map<string, MockStore>();

  /**
   * Create a new store with optional initial state
   */
  async createStore(id: string, initialState?: Partial<WalletMeshState>): Promise<MockStore> {
    const store = createAutoMockedStore(initialState);
    this.stores.set(id, store);
    return store;
  }

  /**
   * Get a store by ID
   */
  getStore(id: string): MockStore | undefined {
    return this.stores.get(id);
  }

  /**
   * Update a store's state
   */
  updateStore(id: string, updater: (state: WalletMeshState) => WalletMeshState) {
    const store = this.stores.get(id);
    if (store) {
      store.setState(updater);
    }
  }

  /**
   * Reset all stores to initial state
   */
  resetAll() {
    for (const store of this.stores.values()) {
      store.destroy?.();
    }
    this.stores.clear();
  }

  /**
   * Get all stores
   */
  getAllStores(): Array<[string, MockStore]> {
    return Array.from(this.stores.entries());
  }
}

/**
 * Mock for wallet health monitoring
 */
export function createMockWalletHealth(
  overrides?: Partial<{
    status: 'healthy' | 'degraded' | 'critical' | 'unknown';
    lastCheck: number;
    issues: string[];
    metrics?: Record<string, unknown>;
  }>,
) {
  return {
    status: 'unknown' as const,
    lastCheck: Date.now(),
    issues: [],
    metrics: undefined,
    ...overrides,
  };
}

/**
 * Mock for connection recovery state
 */
export function createMockRecoveryState(
  overrides?: Partial<{
    isRecovering: boolean;
    attemptCount: number;
    lastAttempt: number | null;
    strategy: string | null;
  }>,
) {
  return {
    isRecovering: false,
    attemptCount: 0,
    lastAttempt: null,
    strategy: null,
    ...overrides,
  };
}

/**
 * Utility to wait for hook state updates
 */
export async function waitForHookUpdate<T>(
  result: { current: T },
  predicate: (value: T) => boolean,
  options?: { timeout?: number },
): Promise<void> {
  const { waitFor } = await import('@testing-library/react');

  await waitFor(
    () => {
      if (!predicate(result.current)) {
        throw new Error('Predicate not satisfied');
      }
    },
    { timeout: options?.timeout || 100, interval: 10 },
  );
}

/**
 * Create a mock wallet list for testing
 */
export function createMockWalletList(count = 3): WalletInfo[] {
  const walletTypes = ['metamask', 'walletconnect', 'phantom', 'coinbase', 'ledger'];
  const chains: ChainType[] = ['evm' as ChainType, 'solana' as ChainType, 'aztec' as ChainType];

  const actualCount = Math.min(count, walletTypes.length);
  const result: WalletInfo[] = [];

  for (let i = 0; i < actualCount; i++) {
    const walletType = walletTypes[i];
    const chain = chains[i % chains.length];
    if (walletType && chain) {
      result.push({
        id: walletType,
        name: `${walletType.charAt(0).toUpperCase()}${walletType.slice(1)}`,
        icon: 'data:image/svg+xml,<svg></svg>',
        chains: [chain],
      });
    }
  }

  return result;
}

/**
 * Mock session analytics data
 */
export function createMockSessionAnalytics() {
  return {
    sessionCount: 0,
    totalTransactions: 0,
    totalGasUsed: '0',
    favoriteChains: [],
    lastActivity: Date.now(),
  };
}

/**
 * Test helper for simulating user interactions
 */
export const userInteractions = {
  /**
   * Simulate clicking connect button
   */
  async clickConnect(container: HTMLElement) {
    const { fireEvent } = await import('@testing-library/react');
    const button = container.querySelector('[data-testid="connect-button"]');
    if (button) {
      fireEvent.click(button);
    }
  },

  /**
   * Simulate selecting a wallet
   */
  async selectWallet(container: HTMLElement, walletId: string) {
    const { fireEvent } = await import('@testing-library/react');
    const walletOption = container.querySelector(`[data-wallet-id="${walletId}"]`);
    if (walletOption) {
      fireEvent.click(walletOption);
    }
  },

  /**
   * Simulate closing modal
   */
  async closeModal(container: HTMLElement) {
    const { fireEvent } = await import('@testing-library/react');
    const closeButton = container.querySelector('[data-testid="modal-close"]');
    if (closeButton) {
      fireEvent.click(closeButton);
    }
  },
};

/**
 * Assert hook state matches expected values
 */
export function assertHookState<T>(actual: T, expected: Partial<T>, message?: string) {
  for (const [key, value] of Object.entries(expected as Record<string, unknown>)) {
    const actualValue = (actual as Record<string, unknown>)[key];
    const keyMessage = `${message ? `${message}: ` : ''}${key} mismatch`;
    if (actualValue !== value && JSON.stringify(actualValue) !== JSON.stringify(value)) {
      throw new Error(
        `${keyMessage}. Expected: ${JSON.stringify(value)}, Actual: ${JSON.stringify(actualValue)}`,
      );
    }
  }
}
