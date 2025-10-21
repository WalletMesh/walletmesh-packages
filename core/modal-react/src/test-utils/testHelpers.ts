/**
 * Test helpers for modal-react
 *
 * Provides essential utilities that tests use.
 */

import { ChainType } from '@walletmesh/modal-core';
import type { AccountInfo, SessionState, SupportedChain, WalletMeshState } from '@walletmesh/modal-core';
import { createAutoMockedStore as createCoreStore } from '@walletmesh/modal-core/testing';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { vi } from 'vitest';
import { MockWalletMeshProvider } from './MockWalletMeshProvider.js';
import type { WalletMeshReactConfig } from '../types.js';

// Use the actual type from modal-core/testing
type MockStore = ReturnType<typeof createCoreStore>;

// SessionManager functionality has been removed from the simplified architecture

// Helper types to avoid vitest type reference issues
export interface TestWrapperProps {
  children: ReactNode;
}
export type TestWrapper = (props: TestWrapperProps) => React.ReactElement;

// Mock session state
function createMockSessionState(options?: {
  sessionId?: string;
  walletId?: string;
  primaryAddress?: string;
  addresses?: string[];
}): SessionState {
  const address = options?.primaryAddress || '0x1234567890123456789012345678901234567890';
  const addresses = options?.addresses || [address];
  const now = Date.now();

  // Create accounts from addresses
  const accounts: AccountInfo[] = addresses.map((addr, index) => ({
    address: addr,
    name: `Account ${index + 1}`,
    index,
    isDefault: index === 0,
    isActive: addr === address,
  }));

  // We know accounts[0] exists because addresses always has at least one element
  if (accounts.length === 0) {
    throw new Error('No accounts available');
  }

  const activeAccount = accounts.find((acc) => acc.address === address) ?? (accounts[0] as AccountInfo);

  return {
    sessionId: options?.sessionId || 'test-session',
    walletId: options?.walletId || 'metamask',
    status: 'connected' as const,
    accounts: accounts,
    activeAccount: activeAccount,
    chain: {
      chainId: '0x1',
      chainType: ChainType.Evm,
      name: 'Ethereum Mainnet',
      required: true,
    },
    provider: {
      instance: {
        request: vi.fn().mockImplementation(({ method }: { method: string }) => {
          switch (method) {
            case 'eth_accounts':
              return Promise.resolve(addresses);
            case 'eth_chainId':
              return Promise.resolve('0x1');
            default:
              return Promise.resolve(null);
          }
        }),
        getAccounts: vi.fn().mockResolvedValue(addresses),
        getChainId: vi.fn().mockResolvedValue('0x1'),
        disconnect: vi.fn().mockResolvedValue(undefined),
        on: vi.fn(),
        off: vi.fn(),
        removeAllListeners: vi.fn(),
      },
      type: 'eip1193' as const,
      version: '1.0.0',
      multiChainCapable: false,
      supportedMethods: ['eth_accounts', 'eth_sendTransaction'],
    },
    permissions: {
      methods: ['eth_accounts', 'eth_sendTransaction'],
      events: [],
    },
    metadata: {
      wallet: {
        name: 'MetaMask',
        icon: 'metamask-icon.png',
      },
      dapp: {
        name: 'Test App',
        url: 'http://localhost:3000',
      },
      connection: {
        initiatedBy: 'user' as const,
        method: 'extension' as const,
      },
    },
    lifecycle: {
      createdAt: now,
      lastActiveAt: now,
      lastAccessedAt: now,
      operationCount: 0,
      activeTime: 0,
    },
  };
}

// Mock store implementation - now uses modal-core's testing utilities
export function createAutoMockedStore(initialState?: Partial<WalletMeshState>): MockStore {
  // Use the core store from modal-core/testing with React-specific defaults
  const defaultState: Partial<WalletMeshState> = {
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
      currentView: 'walletSelection',
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
      transactionStatus: 'idle',
      backgroundTransactionIds: [],
    },
  };

  // Merge default state with provided initial state
  const mergedState: Partial<WalletMeshState> = {
    ...defaultState,
    ...initialState,
  };

  return createCoreStore(mergedState);
}

/**
 * Create a test wrapper with WalletMeshProvider
 * This is the main utility used in 90% of tests
 */
export function createTestWrapper(config?: {
  walletMeshConfig?: Partial<WalletMeshReactConfig>;
  initialState?: Partial<WalletMeshState>;
}): {
  wrapper: TestWrapper;
  mockStore: MockStore;
} {
  const mockStore = createAutoMockedStore(config?.initialState);

  // Set the store in the mock module to ensure proper integration
  // This maintains backward compatibility while we transition
  if (
    typeof window !== 'undefined' &&
    (window as { __mockWalletMeshStore?: unknown }).__mockWalletMeshStore
  ) {
    (
      window as { __mockWalletMeshStore?: { setStore: (store: MockStore) => void } }
    ).__mockWalletMeshStore?.setStore(mockStore);
  }

  const testConfig: WalletMeshReactConfig = {
    appName: 'Test App',
    appDescription: 'Test Application',
    autoInjectModal: false, // Disable for testing
    chains: [
      { chainId: 'eip155:1', chainType: ChainType.Evm, name: 'Ethereum', required: false } as SupportedChain,
      {
        chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
        chainType: ChainType.Solana,
        name: 'Solana',
        required: false,
      } as SupportedChain,
    ],
    wallets: [], // Tests will provide their own wallets if needed
    debug: false,
    ...config?.walletMeshConfig,
  };

  const wrapper = (props: TestWrapperProps) => {
    // Use MockWalletMeshProvider to avoid heavy initialization and OOM issues
    // This provides the same context interface without calling createWalletMesh
    const providerProps = {
      config: testConfig,
      children: props.children,
    };

    return createElement(MockWalletMeshProvider, providerProps);
  };

  return {
    wrapper,
    mockStore,
  };
}

/**
 * Create test wrapper with connected wallet
 */
export function createConnectedWrapper(
  walletId = 'metamask',
  address = '0x1234567890123456789012345678901234567890',
): {
  wrapper: TestWrapper;
  mockStore: MockStore;
  mockSession: ReturnType<typeof createMockSessionState>;
} {
  const mockSession = createMockSessionState({
    sessionId: 'test-session',
    walletId,
    primaryAddress: address,
    addresses: [address],
  });

  const mockStore = createAutoMockedStore();
  const state = mockStore.getState();

  // Update the connections state with connected wallet
  mockStore.setState({
    ...state,
    connections: {
      ...state.connections,
      activeSessions: [mockSession],
      activeSessionId: 'test-session',
    },
  });

  // Set the store in the mock module to ensure proper integration
  if (
    typeof window !== 'undefined' &&
    (window as { __mockWalletMeshStore?: unknown }).__mockWalletMeshStore
  ) {
    (
      window as { __mockWalletMeshStore?: { setStore: (store: MockStore) => void } }
    ).__mockWalletMeshStore?.setStore(mockStore);
  }

  const testConfig: WalletMeshReactConfig = {
    appName: 'Test App',
    appDescription: 'Test Application',
    autoInjectModal: false,
    chains: [
      { chainId: 'eip155:1', chainType: ChainType.Evm, name: 'Ethereum', required: false } as SupportedChain,
      {
        chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
        chainType: ChainType.Solana,
        name: 'Solana',
        required: false,
      } as SupportedChain,
    ],
    wallets: [], // Tests will provide their own wallets if needed
    debug: false,
  };

  const wrapper = (props: TestWrapperProps) => {
    // Use MockWalletMeshProvider to avoid heavy initialization and OOM issues
    const providerProps = {
      config: testConfig,
      children: props.children,
    };
    return createElement(MockWalletMeshProvider, providerProps);
  };

  return {
    wrapper,
    mockStore,
    mockSession,
  };
}

// Mock store utilities have been removed - use createTestWrapper instead

/**
 * Create a shared test setup to reduce boilerplate
 *
 * This function combines the common setup pattern found in most tests:
 * - Creates test wrapper
 * - Sets up mock store
 * - Returns both wrapper and store for test use
 *
 * Note: Timer setup should be done in beforeEach/afterEach for proper test isolation
 */
export function createSharedTestSetup(config?: {
  walletMeshConfig?: Partial<WalletMeshReactConfig>;
  initialState?: Partial<WalletMeshState>;
  connected?: boolean;
  walletId?: string;
  address?: string;
}): {
  wrapper: TestWrapper;
  mockStore: ReturnType<typeof createAutoMockedStore>;
  mockSession: ReturnType<typeof createMockSessionState> | null;
  cleanup: () => void;
} {
  // If connected state is requested, use createConnectedWrapper
  if (config?.connected) {
    const { wrapper, mockStore, mockSession } = createConnectedWrapper(
      config.walletId || 'metamask',
      config.address || '0x1234567890123456789012345678901234567890',
    );

    return {
      wrapper,
      mockStore,
      mockSession,
      // Common test helpers
      cleanup: () => {
        vi.clearAllMocks();
      },
    };
  }

  // Otherwise use regular createTestWrapper
  const { wrapper, mockStore } = createTestWrapper(config);

  return {
    wrapper,
    mockStore,
    mockSession: null,
    // Common test helpers
    cleanup: () => {
      vi.clearAllMocks();
    },
  };
}

/**
 * Helper to wait for client initialization with fake timers
 *
 * Advances fake timers to allow promises to resolve and effects to run
 */
export async function waitForClientInit() {
  const { act } = await import('react');
  const { vi } = await import('vitest');

  // Advance timers to allow useEffect and promises to run
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
    // Flush promise queue
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(0);
  });
}

/**
 * Helper to wait for services to be available in tests
 * Now uses fake timer advancement instead of waitFor
 */
export async function waitForServices(result: { current: unknown }, _timeout = 100) {
  const { act } = await import('react');
  const { vi } = await import('vitest');

  // Advance timers to allow initialization
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(0);
  });

  // Check if services are available
  const current = result.current as Record<string, unknown>;
  const hasAnalyzeError = 'analyzeError' in current;
  const hasRecoveryAnalyzeError =
    'recovery' in current && (current['recovery'] as Record<string, unknown>)?.['analyzeError'];
  const hasChains = 'chains' in current;
  const hasServices = hasAnalyzeError || hasRecoveryAnalyzeError || hasChains;

  if (!hasServices) {
    // One more attempt
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
  }
}

/**
 * Helper to wait for connection recovery service specifically
 * Now uses fake timer advancement instead of waitFor
 */
export async function waitForRecoveryService(result: { current: unknown }, _timeout = 100) {
  const { act } = await import('react');
  const { vi } = await import('vitest');

  // Advance timers to allow initialization
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(0);
  });

  const current = result.current as Record<string, unknown>;
  const hasAnalyzeError = 'analyzeError' in current;
  const hasRecoveryAnalyzeError =
    'recovery' in current && (current['recovery'] as Record<string, unknown>)?.['analyzeError'];

  if (!hasAnalyzeError && !hasRecoveryAnalyzeError) {
    // One more attempt
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
  }
}
