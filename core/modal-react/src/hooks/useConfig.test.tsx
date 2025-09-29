/**
 * Tests for useConfig hook
 *
 * @module hooks/useConfig.test
 */

import { act, renderHook } from '@testing-library/react';
import type { WalletInfo, WalletMeshState, ChainType } from '@walletmesh/modal-core';

// Use the same type as WalletMeshContext for consistency
type WalletMeshClient = Awaited<ReturnType<typeof import('@walletmesh/modal-core').createWalletMesh>>;
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useWalletMeshContext } from '../WalletMeshContext.js';
import { createWrapper } from '../test/utils.js';
import { useStore, useStoreActions, useStoreInstance } from './internal/useStore.js';
import { useConfig } from './useConfig.js';

// Mock the store hooks
vi.mock('./internal/useStore.js', () => ({
  useStore: vi.fn(),
  useStoreActions: vi.fn(),
  useStoreInstance: vi.fn(),
}));

// Mock the context
vi.mock('../WalletMeshContext.js', async () => {
  const actual = await vi.importActual('../WalletMeshContext.js');
  return {
    ...actual,
    useWalletMeshContext: vi.fn(),
  };
});

// Type for mock client with modal methods
type MockClientWithModal = WalletMeshClient & {
  openModal: ReturnType<typeof vi.fn>;
  closeModal: ReturnType<typeof vi.fn>;
  getQueryManager: ReturnType<typeof vi.fn>;
  getPublicProvider: ReturnType<typeof vi.fn>;
  getWalletProvider: ReturnType<typeof vi.fn>;
  getWalletAdapter: ReturnType<typeof vi.fn>;
  discoverWallets: ReturnType<typeof vi.fn>;
};

describe('useConfig', () => {
  let mockState: WalletMeshState;
  let mockStore: {
    getState: ReturnType<typeof vi.fn>;
    setState: ReturnType<typeof vi.fn>;
    subscribe: ReturnType<typeof vi.fn>;
  };
  let mockActions: {
    ui: {
      startDiscovery: ReturnType<typeof vi.fn>;
      stopDiscovery: ReturnType<typeof vi.fn>;
      setWalletFilter: ReturnType<typeof vi.fn>;
      clearWalletFilter: ReturnType<typeof vi.fn>;
      addDiscoveryError: ReturnType<typeof vi.fn>;
    };
    connections: {
      addDiscoveredWallet: ReturnType<typeof vi.fn>;
    };
  };
  let currentMockClient: MockClientWithModal | null;

  beforeEach(() => {
    vi.clearAllMocks();

    // Initialize mock state
    mockState = {
      entities: {
        wallets: {},
        sessions: {},
        transactions: {},
      },
      ui: {
        modalOpen: false,
        currentView: 'walletSelection',
        viewHistory: [],
        loading: {
          discovery: false,
          connection: false,
          transaction: false,
        },
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
        availableWalletIds: [],
        discoveryErrors: [],
        transactionStatus: 'idle',
      },
    };

    // Create mock store
    mockStore = {
      getState: vi.fn(() => mockState) as unknown as ReturnType<typeof vi.fn>,
      setState: vi.fn((updater) => {
        if (typeof updater === 'function') {
          updater(mockState);
        } else {
          Object.assign(mockState, updater);
        }
      }) as unknown as ReturnType<typeof vi.fn>,
      subscribe: vi.fn(() => vi.fn()) as unknown as ReturnType<typeof vi.fn>,
    };

    // Create mock actions with all required properties
    mockActions = {
      ui: {
        startDiscovery: vi.fn(),
        stopDiscovery: vi.fn(),
        setWalletFilter: vi.fn((_store: unknown, filter: (wallet: WalletInfo) => boolean) => {
          mockState.ui.walletFilter = filter;
          // biome-ignore lint/suspicious/noExplicitAny: Mock functions need flexible typing for tests
        }) as any,
        clearWalletFilter: vi.fn((_store: unknown) => {
          // biome-ignore lint/suspicious/noExplicitAny: Need to bypass type checking for test mock
          (mockState.ui as any).walletFilter = undefined;
          // biome-ignore lint/suspicious/noExplicitAny: Mock functions need flexible typing for tests
        }) as any,
        addDiscoveryError: vi.fn(),
      } as any,
      connections: {
        addDiscoveredWallet: vi.fn(),
      } as any,
    } as any;

    // Get the global mock client (if it exists) and ensure it has all required properties
    const globalClient = (global as { __TEST_WALLET_MESH_CLIENT__?: unknown }).__TEST_WALLET_MESH_CLIENT__;
    const mockClient = globalClient
      ? {
          // biome-ignore lint/suspicious/noExplicitAny: Global test client needs flexible typing
          ...(globalClient as any),
          getQueryManager: vi.fn().mockReturnValue(null),
          getPublicProvider: vi.fn().mockReturnValue(null),
          getWalletProvider: vi.fn().mockReturnValue(null),
          getWalletAdapter: vi.fn().mockReturnValue(null),
        }
      : null;

    if (mockClient) {
      (mockClient as MockClientWithModal).discoverWallets = vi.fn().mockResolvedValue([]);
    }

    currentMockClient = (mockClient as MockClientWithModal) || null;

    // Setup context mock with client and config
    vi.mocked(useWalletMeshContext).mockReturnValue({
      // biome-ignore lint/suspicious/noExplicitAny: Mock client requires flexible typing
      client: mockClient as any,
      config: mockClient
        ? {
            appName: 'Test App',
            appDescription: 'Test Description',
            appUrl: 'https://test.com',
            appIcon: 'https://test.com/icon.png',
            chains: [],
            debug: true,
          }
        : {
            appName: 'Test App',
            chains: [],
          },
    });

    // Setup mocks - need to handle multiple calls to useStore
    let useStoreCallCount = 0;
    vi.mocked(useStore).mockImplementation((selector) => {
      useStoreCallCount++;
      const state = mockState;
      if (!selector) return state as unknown;

      // The hook calls useStore twice - once for general state, once for walletFilter
      const result = selector(state);
      return result;
    });
    // biome-ignore lint/suspicious/noExplicitAny: Test mocks require flexible typing
    vi.mocked(useStoreActions).mockReturnValue(mockActions as any);
    // biome-ignore lint/suspicious/noExplicitAny: Test mocks require flexible typing
    vi.mocked(useStoreInstance).mockReturnValue(mockStore as any);
  });

  afterEach(() => {
    currentMockClient = null;
    vi.restoreAllMocks();
  });

  it('should provide config values from context', () => {
    const wrapper = createWrapper({
      appName: 'Test App',
      appDescription: 'Test Description',
      appUrl: 'https://test.com',
      appIcon: 'https://test.com/icon.png',
      chains: [],
      debug: true,
    });

    const { result } = renderHook(() => useConfig(), { wrapper });

    expect(result.current.appName).toBe('Test App');
    expect(result.current.appDescription).toBe('Test Description');
    expect(result.current.appUrl).toBe('https://test.com');
    expect(result.current.appIcon).toBe('https://test.com/icon.png');
    expect(result.current.debug).toBe(true);
  });

  it('should provide wallet filtering functionality', () => {
    const wrapper = createWrapper();
    const { result, rerender } = renderHook(() => useConfig(), { wrapper });

    // Initially no filter
    expect(result.current.walletFilter).toBeNull();
    expect(result.current.filteredWallets).toEqual(result.current.wallets);

    // Set a filter for EVM wallets
    const filterFn = (wallet: WalletInfo) => wallet.chains.includes('evm' as ChainType);
    act(() => {
      result.current.setWalletFilter(filterFn);
    });

    // Force re-render to pick up the new state
    rerender();

    // Check that the filter is set
    expect(result.current.walletFilter).toBeTruthy();
    expect(typeof result.current.walletFilter).toBe('function');

    // Test that the filter function works correctly
    if (result.current.walletFilter) {
      const evmWallet: WalletInfo = {
        id: 'test-evm',
        name: 'Test EVM',
        icon: 'test.png',
        chains: ['evm' as ChainType],
      };
      const solanaWallet: WalletInfo = {
        id: 'test-solana',
        name: 'Test Solana',
        icon: 'test.png',
        chains: ['solana' as ChainType],
      };
      expect(result.current.walletFilter(evmWallet)).toBe(true);
      expect(result.current.walletFilter(solanaWallet)).toBe(false);
    }

    // Clear the filter
    act(() => {
      result.current.clearWalletFilter();
    });

    rerender();

    expect(result.current.walletFilter).toBeNull();
    expect(result.current.filteredWallets).toEqual(result.current.wallets);
  });

  it('should filter wallets when filter is set', () => {
    const wrapper = createWrapper();
    const { result, rerender } = renderHook(() => useConfig(), { wrapper });

    // Create test wallets
    const aztecWallet: WalletInfo = {
      id: 'aztec-wallet',
      name: 'Aztec Wallet',
      icon: 'aztec.png',
      chains: [],
    };
    const evmWallet: WalletInfo = {
      id: 'metamask',
      name: 'MetaMask',
      icon: 'metamask.png',
      chains: ['evm' as ChainType],
    };
    const aztecChainWallet: WalletInfo = {
      id: 'other-wallet',
      name: 'Other Wallet',
      icon: 'other.png',
      chains: ['aztec' as ChainType],
    };

    // Set filter for Aztec wallets only
    act(() => {
      result.current.setWalletFilter(
        (wallet: WalletInfo) => wallet.chains?.includes('aztec' as ChainType) || wallet.id === 'aztec-wallet',
      );
    });

    rerender();

    expect(result.current.walletFilter).toBeDefined();
    expect(typeof result.current.walletFilter).toBe('function');

    // Test the filter function behavior
    const filter = result.current.walletFilter;
    if (filter) {
      // Test with wallets that have the 'aztec' chain
      const hasAztecChain = filter(aztecChainWallet);
      expect(hasAztecChain).toBe(true);

      // Test with wallet that has 'aztec-wallet' id
      const hasAztecId = filter(aztecWallet);
      expect(hasAztecId).toBe(true);

      // Test with EVM wallet that should be filtered out
      const isEvmWallet = filter(evmWallet);
      expect(isEvmWallet).toBe(false);
    }
  });

  it('should handle modal open and close', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useConfig(), { wrapper });

    // Get the global mock client
    const mockClient = (global as { __TEST_WALLET_MESH_CLIENT__?: unknown }).__TEST_WALLET_MESH_CLIENT__;
    expect(mockClient).toBeDefined();

    // Reset mock calls
    (mockClient as MockClientWithModal).openModal.mockClear();
    (mockClient as MockClientWithModal).closeModal.mockClear();

    // Open modal
    act(() => {
      result.current.open();
    });
    expect((mockClient as MockClientWithModal).openModal).toHaveBeenCalledTimes(1);

    // Open modal with chain type
    act(() => {
      result.current.open({ targetChainType: 'evm' as ChainType });
    });
    expect((mockClient as MockClientWithModal).openModal).toHaveBeenCalledWith({
      targetChainType: 'evm' as ChainType,
    });

    // Close modal
    act(() => {
      result.current.close();
    });
    expect((mockClient as MockClientWithModal).closeModal).toHaveBeenCalledTimes(1);
  });

  it('should handle refreshWallets', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useConfig(), { wrapper });

    expect(result.current.isDiscovering).toBe(false);

    const mockAdapter = {
      id: 'test-wallet',
      metadata: {
        name: 'Test Wallet',
        icon: 'data:image/svg+xml;base64,test',
        description: 'A wallet for testing',
      },
      capabilities: {
        chains: [{ type: 'evm', chainIds: '*' }],
        features: new Set(['sign_message']),
      },
    } as any;

    currentMockClient?.discoverWallets.mockResolvedValueOnce([
      {
        adapter: mockAdapter,
        available: true,
        version: '1.0.0',
      },
    ] as any);

    await result.current.refreshWallets();

    expect(mockActions.ui.startDiscovery).toHaveBeenCalledWith(mockStore);
    expect(currentMockClient?.discoverWallets).toHaveBeenCalledTimes(1);
    expect(mockActions.connections.addDiscoveredWallet).toHaveBeenCalledWith(
      mockStore,
      expect.objectContaining({ id: 'test-wallet', name: 'Test Wallet' }),
    );
    expect(mockActions.ui.stopDiscovery).toHaveBeenCalledWith(mockStore);
  });
});
