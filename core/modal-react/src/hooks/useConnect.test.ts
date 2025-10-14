/**
 * Tests for useConnect hook
 */

import { renderHook } from '@testing-library/react';
import type {
  BlockchainProvider,
  ChainConfig,
  ConnectionService,
  SessionState,
  WalletMeshState,
} from '@walletmesh/modal-core';
import { ChainType } from '@walletmesh/modal-core';
import { act } from 'react';
import type React from 'react';
import { type Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestWrapper } from '../test-utils/testHelpers.js';
import type { WalletMeshConfig } from '../types.js';
import { useConnect, useConnectionProgress, useIsConnecting, useWalletAdapters } from './useConnect.js';

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

// Import mock utilities from modal-core testing

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

// Helper to create proper WalletMeshState structure
const createMockState = (overrides?: Partial<WalletMeshState>): WalletMeshState => ({
  entities: {
    wallets: {},
    sessions: {},
    transactions: {},
  },
  ui: {
    modalOpen: false,
    currentView: 'walletSelection' as const,
    viewHistory: [],
    loading: { connection: false, discovery: false, transaction: false },
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
    transactionStatus: 'idle' as const,
    
      backgroundTransactionIds: [],
  },
  ...overrides,
});

describe('useConnect', () => {
  let wrapper: (props: { children: React.ReactNode }) => React.ReactElement;
  let mockClient: Partial<WalletMeshClient>;
  let mockConnectionService: Partial<ConnectionService>;
  let mockGetState: Mock;
  let mockStore: ReturnType<typeof useStoreInstance>;
  let mockActions: ReturnType<typeof useStoreActions>;

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
      isConnected: false,
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
      connect: vi.fn().mockResolvedValue({ success: true }),
      disconnect: vi.fn().mockResolvedValue({ success: true }),
      reconnect: vi.fn().mockResolvedValue({ success: true }),
      switchAccount: vi.fn().mockResolvedValue({ success: true }),
      getConnectionStatus: vi.fn().mockReturnValue('connected'),
      isConnected: vi.fn().mockReturnValue(true),
      getActiveSession: vi.fn(),
      autoConnect: vi.fn().mockResolvedValue({ success: true }),
    } as unknown as Partial<ConnectionService>;

    // Create mock store with complete state structure
    mockGetState = vi.fn();
    mockGetState.mockReturnValue(createMockState());

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

    // Add mockReturnValue to getState for typed mock access
    mockStore.getState = mockGetState;

    // Create mock actions
    mockActions = {
      ui: {
        openModal: vi.fn(),
        closeModal: vi.fn(),
        setView: vi.fn(),
        setLoading: vi.fn(),
        setError: vi.fn(),
        clearError: vi.fn(),
        setShowQRCode: vi.fn(),
        setWalletDeeplink: vi.fn(),
        setConnectingChainType: vi.fn(),
        resetError: vi.fn(),
        setScanning: vi.fn(),
        updateLastScanTime: vi.fn(),
        setSwitchingChainData: vi.fn(),
      },
      entities: {
        addWallet: vi.fn(),
        updateWallet: vi.fn(),
        removeWallet: vi.fn(),
        addSession: vi.fn(),
        updateSession: vi.fn(),
        removeSession: vi.fn(),
        addTransaction: vi.fn(),
        updateTransaction: vi.fn(),
        removeTransaction: vi.fn(),
      },
      active: {
        setWalletId: vi.fn(),
        setSessionId: vi.fn(),
        setTransactionId: vi.fn(),
        setSelectedWalletId: vi.fn(),
      },
      meta: {
        setLastDiscoveryTime: vi.fn(),
        updateConnectionTimestamp: vi.fn(),
        setAvailableWalletIds: vi.fn(),
        addDiscoveryError: vi.fn(),
        setTransactionStatus: vi.fn(),
      },
      transactions: {
        addTransaction: vi.fn(),
        updateTransactionStatus: vi.fn(),
        updateTransactionHash: vi.fn(),
        clearTransactions: vi.fn(),
        setPendingTransaction: vi.fn(),
        clearPendingTransaction: vi.fn(),
      },
      all: {
        resetState: vi.fn(),
        reset: vi.fn(),
      },
    } as unknown as ReturnType<typeof useStoreActions>;

    // Setup mock implementations
    const mockConfig: WalletMeshConfig = {
      appName: 'Test App',
      chains: [],
    };
    vi.mocked(useWalletMeshContext).mockReturnValue({
      client: mockClient as unknown as WalletMeshClient,
      config: mockConfig,
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

  describe('Initial State', () => {
    it('should return initial disconnected state', () => {
      const { result } = renderHook(() => useConnect(), { wrapper });

      // Check the basic properties we care about
      expect(result.current.isConnecting).toBe(false);
      expect(result.current.isPending).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.variables).toBeUndefined();
      expect(result.current.progress).toBe(0);
      expect(result.current.progressInfo).toBe(null);

      // Check function properties
      expect(typeof result.current.connect).toBe('function');
      expect(typeof result.current.reset).toBe('function');

      // Check wallets array exists - should be empty in clean test environment
      expect(Array.isArray(result.current.wallets)).toBe(true);
      expect(result.current.wallets.length).toBe(0);
    });

    it('should provide available wallets', () => {
      const { result } = renderHook(() => useConnect(), { wrapper });

      // Should return some wallets (could be empty array)
      expect(Array.isArray(result.current.wallets)).toBe(true);

      if (result.current.wallets.length > 0) {
        const firstWallet = result.current.wallets[0];
        expect(firstWallet).toMatchObject({
          id: expect.any(String),
          name: expect.any(String),
          icon: expect.any(String),
          chains: expect.any(Array),
        });
      }
    });
  });

  describe('Connection Process', () => {
    it('should handle successful connection with walletId', async () => {
      const { result } = renderHook(() => useConnect(), { wrapper });

      await act(async () => {
        await result.current.connect('metamask');
      });

      expect(mockClient.connect).toHaveBeenCalledWith('metamask', undefined);
    });

    it('should handle connection with options', async () => {
      const { result } = renderHook(() => useConnect(), { wrapper });
      const mockChain = {
        chainId: 'eip155:1',
        chainType: ChainType.Evm,
        name: 'Ethereum',
        required: false,
      } as ChainConfig;
      const onProgress = vi.fn();

      await act(async () => {
        await result.current.connect('metamask', {
          chain: mockChain,
          showModal: false,
          onProgress,
        });
      });

      expect(mockClient.connect).toHaveBeenCalledWith('metamask', {
        chain: mockChain,
        showModal: false,
      });
      expect(onProgress).toHaveBeenCalledWith(10); // Initial progress
      expect(onProgress).toHaveBeenCalledWith(40); // Connecting progress
      expect(onProgress).toHaveBeenCalledWith(100); // Connected progress
    });

    it('should open modal when walletId not provided', async () => {
      const { result } = renderHook(() => useConnect(), { wrapper });

      await act(async () => {
        await result.current.connect();
      });

      expect(mockClient.connect).toHaveBeenCalledWith(undefined, undefined);
    });

    it('should throw error when walletId not provided and modal disabled', async () => {
      const { result } = renderHook(() => useConnect(), { wrapper });

      await expect(
        act(async () => {
          await result.current.connect(undefined, { showModal: false });
        }),
      ).rejects.toThrow('No wallet specified and modal disabled');
    });

    it('should handle connection validation failure', async () => {
      (mockClient.connect as Mock).mockRejectedValue(new Error('Invalid parameters'));

      const { result } = renderHook(() => useConnect(), { wrapper });

      await expect(
        act(async () => {
          await result.current.connect('metamask');
        }),
      ).rejects.toThrow('Invalid parameters');
    });

    it('should handle connection establishment validation failure', async () => {
      (mockClient.connect as Mock).mockRejectedValue(new Error('Connection validation failed'));

      const { result } = renderHook(() => useConnect(), { wrapper });

      await expect(
        act(async () => {
          await result.current.connect('metamask');
        }),
      ).rejects.toThrow('Connection validation failed');
    });

    it('should handle connection error', async () => {
      const error = new Error('Connection failed');
      (mockClient.connect as Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useConnect(), { wrapper });

      await expect(
        act(async () => {
          await result.current.connect('metamask');
        }),
      ).rejects.toThrow('Connection failed');

      expect(result.current.error).toBeDefined();
    });

    it('should track connection progress', async () => {
      const progressValues: number[] = [];
      const { result } = renderHook(() => useConnect(), { wrapper });

      await act(async () => {
        await result.current.connect('metamask', {
          onProgress: (progress) => progressValues.push(progress),
        });
      });

      expect(progressValues.length).toBeGreaterThan(0);
      expect(progressValues).toContain(10); // Initial progress
      expect(progressValues).toContain(40); // Connecting progress
      expect(progressValues).toContain(100); // Connected progress
    });

    it('should clear progress after connection', async () => {
      const { result } = renderHook(() => useConnect(), { wrapper });

      await act(async () => {
        await result.current.connect('metamask');
      });

      expect(result.current.progressInfo).not.toBeNull();

      // Advance timer to clear progress
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1100);
      });

      expect(result.current.progressInfo).toBeNull();
    });

    it('should handle reset function', () => {
      const { result } = renderHook(() => useConnect(), { wrapper });

      act(() => {
        result.current.reset();
      });

      expect(result.current.error).toBe(null);
    });

    it('should handle retry function', async () => {
      const { result } = renderHook(() => useConnect(), { wrapper });

      // First, simulate a failed connection with active wallet
      mockGetState.mockReturnValue(
        createMockState({
          ui: {
            modalOpen: false,
            currentView: 'walletSelection' as const,
            viewHistory: [],
            loading: { connection: false, discovery: false, transaction: false },
            errors: {},
          },
          active: {
            walletId: 'metamask',
            sessionId: 'session-1',
            transactionId: null,
            selectedWalletId: null,
          },
        }),
      );

      await act(async () => {
        await result.current.retry();
      });

      expect(mockClient.connect).toHaveBeenCalled();
    });

    it('should derive connection variables when connecting', () => {
      mockGetState.mockReturnValue(
        createMockState({
          ui: {
            modalOpen: false,
            currentView: 'connecting' as const,
            viewHistory: [],
            loading: { connection: false, discovery: false, transaction: false },
            errors: {},
          },
          entities: {
            wallets: {},
            sessions: {
              'session-1': {
                sessionId: 'session-1',
                walletId: 'metamask',
                status: 'connecting',
                accounts: [
                  {
                    address: '0x1234567890123456789012345678901234567890',
                    name: 'Account 1',
                    isActive: true,
                  },
                ],
                activeAccount: {
                  address: '0x1234567890123456789012345678901234567890',
                  name: 'Account 1',
                  isActive: true,
                },
                chain: {
                  chainId: 'eip155:1',
                  chainType: ChainType.Evm,
                  name: 'Ethereum',
                  required: false,
                },
                provider: {} as unknown as SessionState['provider'],
                permissions: {} as unknown as SessionState['permissions'],
                metadata: {} as unknown as SessionState['metadata'],
                lifecycle: { connectedAt: Date.now() } as unknown as SessionState['lifecycle'],
              } as unknown as SessionState,
            },
            transactions: {},
          },
          active: {
            walletId: 'metamask',
            sessionId: 'session-1',
            transactionId: null,
            selectedWalletId: null,
          },
        }),
      );

      const { result } = renderHook(() => useConnect(), { wrapper });

      expect(result.current.variables).toEqual({
        walletId: 'metamask',
      });
    });
  });

  describe('Disconnection Process', () => {
    it('should handle disconnect with walletId', async () => {
      const { result } = renderHook(() => useConnect(), { wrapper });

      await act(async () => {
        await result.current.disconnect('metamask');
      });

      expect(mockClient.disconnect).toHaveBeenCalledWith('metamask');
      expect(result.current.isDisconnecting).toBe(false);
    });

    it('should handle disconnect without walletId', async () => {
      mockGetState.mockReturnValue(
        createMockState({
          ui: {
            modalOpen: false,
            currentView: 'walletSelection' as const,
            viewHistory: [],
            loading: { connection: false, discovery: false, transaction: false },
            errors: {},
          },
          entities: {
            wallets: {},
            sessions: {
              'session-1': {
                sessionId: 'session-1',
                walletId: 'metamask',
                status: 'connected',
                accounts: [
                  {
                    address: '0x1234567890123456789012345678901234567890',
                    name: 'Account 1',
                    isActive: true,
                  },
                ],
                activeAccount: {
                  address: '0x1234567890123456789012345678901234567890',
                  name: 'Account 1',
                  isActive: true,
                },
                chain: {
                  chainId: 'eip155:1',
                  chainType: ChainType.Evm,
                  name: 'Ethereum',
                  required: false,
                },
                provider: {} as unknown as SessionState['provider'],
                permissions: {} as unknown as SessionState['permissions'],
                metadata: {} as unknown as SessionState['metadata'],
                lifecycle: { connectedAt: Date.now() } as unknown as SessionState['lifecycle'],
              } as unknown as SessionState,
            },
            transactions: {},
          },
          active: {
            walletId: 'metamask',
            sessionId: 'session-1',
            transactionId: null,
            selectedWalletId: null,
          },
        }),
      );

      const { result } = renderHook(() => useConnect(), { wrapper });

      await act(async () => {
        await result.current.disconnect();
      });

      expect(mockClient.disconnect).toHaveBeenCalledWith('metamask');
    });

    it('should throw error when no wallet to disconnect', async () => {
      const { result } = renderHook(() => useConnect(), { wrapper });

      await expect(
        act(async () => {
          await result.current.disconnect();
        }),
      ).rejects.toThrow('No wallet connected to disconnect');
    });

    it('should handle disconnect error', async () => {
      const error = new Error('Disconnect failed');
      (mockClient.disconnect as Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useConnect(), { wrapper });

      await expect(
        act(async () => {
          await result.current.disconnect('metamask');
        }),
      ).rejects.toThrow('Disconnect failed');
    });

    it('should handle disconnectAll', async () => {
      const { result } = renderHook(() => useConnect(), { wrapper });

      await act(async () => {
        await result.current.disconnectAll();
      });

      expect(mockClient.disconnectAll).toHaveBeenCalled();
      expect(result.current.isDisconnecting).toBe(false);
    });

    it('should handle disconnectAll error', async () => {
      const error = new Error('Disconnect all failed');
      (mockClient.disconnectAll as Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useConnect(), { wrapper });

      await expect(
        act(async () => {
          await result.current.disconnectAll();
        }),
      ).rejects.toThrow('Disconnect all failed');
    });

    describe('Disconnect Safety with Pending Transactions', () => {
      it('should prevent disconnect when transactions are pending', async () => {
        // Mock store state with pending transaction
        mockGetState.mockReturnValue(
          createMockState({
            ui: {
              modalOpen: false,
              currentView: 'connected' as const,
              viewHistory: [],
              loading: { connection: false, discovery: false, transaction: false },
              errors: {},
            },
            entities: {
              wallets: {
                metamask: {
                  id: 'metamask',
                  name: 'MetaMask',
                  icon: 'data:image/svg+xml;base64,...',
                  chains: ['evm' as ChainType],
                },
              },
              sessions: {
                'session-1': {
                  sessionId: 'session-1',
                  walletId: 'metamask',
                  status: 'connected',
                  chain: {
                    chainId: 'eip155:1',
                    chainType: 'evm' as ChainType,
                    name: 'Ethereum',
                    required: true,
                    label: 'Ethereum',
                    interfaces: [],
                    group: 'mainnet',
                  },
                  activeAccount: {
                    address: '0x1234567890123456789012345678901234567890',
                  },
                  accounts: [
                    {
                      address: '0x1234567890123456789012345678901234567890',
                    },
                  ],
                  permissions: { methods: ['eth_accounts', 'eth_sendTransaction'], events: [] },
                  provider: {
                    instance: {} as unknown as BlockchainProvider,
                    type: 'evm',
                    version: '1.0.0',
                    multiChainCapable: false,
                    supportedMethods: ['eth_accounts', 'eth_sendTransaction'],
                  },
                  metadata: {
                    wallet: {
                      name: 'MetaMask',
                      icon: 'metamask.png',
                      version: '1.0.0',
                    },
                    dapp: {
                      name: 'Test App',
                      url: 'https://example.com',
                    },
                    connection: {
                      initiatedBy: 'user',
                      method: 'manual',
                      userAgent: 'test',
                    },
                  },
                  lifecycle: {
                    createdAt: Date.now(),
                    lastActiveAt: Date.now(),
                    lastAccessedAt: Date.now(),
                    expiresAt: Date.now() + 3600000,
                    operationCount: 0,
                    activeTime: 0,
                  },
                },
              },
              transactions: {
                'tx-1': {
                  txStatusId: 'tx-1',
                  txHash: '0xabc',
                  chainId: 'eip155:1',
                  walletId: 'metamask',
                  status: 'proving' as const,
                  from: '0x1234567890123456789012345678901234567890',
                  chainType: ChainType.Evm,
                  request: {
                    to: '0x0000000000000000000000000000000000000000',
                    value: '1000',
                  },
                  startTime: Date.now(),
                  wait: vi.fn(),
                  // data: '1000',
                  // timestamp: Date.now(),
                },
              },
            },
            active: {
              walletId: 'metamask',
              sessionId: 'session-1',
              transactionId: 'tx-1',
              selectedWalletId: null,
            },
            meta: {
              lastDiscoveryTime: null,
              connectionTimestamps: {},
              availableWalletIds: [],
              discoveryErrors: [],
              transactionStatus: 'proving' as const,

      backgroundTransactionIds: [],
            },
          }),
        );

        const { result } = renderHook(() => useConnect(), { wrapper });

        await expect(
          act(async () => {
            await result.current.disconnect('metamask');
          }),
        ).rejects.toThrow('Cannot disconnect: 1 pending transaction(s)');
      });

      it('should prevent disconnect when transaction is in proving state', async () => {
        // Mock store state with transaction in proving state
        mockGetState.mockReturnValue(
          createMockState({
            ui: {
              modalOpen: false,
              currentView: 'connected' as const,
              viewHistory: [],
              loading: { connection: false, discovery: false, transaction: false },
              errors: {},
            },
            entities: {
              wallets: {
                'aztec-wallet': {
                  id: 'aztec-wallet',
                  name: 'Aztec Wallet',
                  icon: 'data:image/svg+xml;base64,...',
                  chains: ['aztec' as ChainType],
                },
              },
              sessions: {
                'session-1': {
                  sessionId: 'session-1',
                  walletId: 'aztec-wallet',
                  status: 'connected',
                  chain: {
                    chainId: 'aztec:mainnet',
                    chainType: 'aztec' as ChainType,
                    name: 'Aztec',
                    required: true,
                    label: 'Aztec',
                    interfaces: [],
                    group: 'mainnet',
                  },
                  activeAccount: {
                    address: '0x1234567890123456789012345678901234567890',
                  },
                  accounts: [
                    {
                      address: '0x1234567890123456789012345678901234567890',
                    },
                  ],
                  permissions: { methods: ['aztec_getAddress', 'aztec_sendTransaction'], events: [] },
                  provider: {
                    instance: {} as unknown as BlockchainProvider,
                    type: 'evm',
                    version: '1.0.0',
                    multiChainCapable: false,
                    supportedMethods: ['eth_accounts', 'eth_sendTransaction'],
                  },
                  metadata: {
                    wallet: {
                      name: 'MetaMask',
                      icon: 'metamask.png',
                      version: '1.0.0',
                    },
                    dapp: {
                      name: 'Test App',
                      url: 'https://example.com',
                    },
                    connection: {
                      initiatedBy: 'user',
                      method: 'manual',
                      userAgent: 'test',
                    },
                  },
                  lifecycle: {
                    createdAt: Date.now(),
                    lastActiveAt: Date.now(),
                    lastAccessedAt: Date.now(),
                    expiresAt: Date.now() + 3600000,
                    operationCount: 0,
                    activeTime: 0,
                  },
                },
              },
              transactions: {
                'tx-1': {
                  txStatusId: 'tx-1',
                  txHash: '',
                  chainId: 'aztec:mainnet',
                  walletId: 'aztec-wallet',
                  status: 'proving' as const,
                  from: '0x1234567890123456789012345678901234567890',
                  chainType: ChainType.Aztec,
                  request: {
                    to: '0x0000000000000000000000000000000000000000',
                    value: '1000',
                  },
                  startTime: Date.now(),
                  wait: vi.fn(),
                  // data: '',
                  // timestamp: Date.now(),
                },
              },
            },
            active: {
              walletId: 'aztec-wallet',
              sessionId: 'session-1',
              transactionId: 'tx-1',
              selectedWalletId: null,
            },
            meta: {
              lastDiscoveryTime: null,
              connectionTimestamps: {},
              availableWalletIds: [],
              discoveryErrors: [],
              transactionStatus: 'proving' as const,
              
      backgroundTransactionIds: [],
            },
          }),
        );

        const { result } = renderHook(() => useConnect(), { wrapper });

        await expect(
          act(async () => {
            await result.current.disconnect('aztec-wallet');
          }),
        ).rejects.toThrow('Cannot disconnect: 1 pending transaction(s)');
      });

      it('should allow forced disconnect even with pending transactions', async () => {
        // Mock store state with pending transaction
        mockGetState.mockReturnValue(
          createMockState({
            ui: {
              modalOpen: false,
              currentView: 'connected' as const,
              viewHistory: [],
              loading: { connection: false, discovery: false, transaction: false },
              errors: {},
            },
            entities: {
              wallets: {
                metamask: {
                  id: 'metamask',
                  name: 'MetaMask',
                  icon: 'data:image/svg+xml;base64,...',
                  chains: ['evm' as ChainType],
                },
              },
              sessions: {
                'session-1': {
                  sessionId: 'session-1',
                  walletId: 'metamask',
                  status: 'connected',
                  chain: {
                    chainId: 'eip155:1',
                    chainType: 'evm' as ChainType,
                    name: 'Ethereum',
                    required: true,
                    label: 'Ethereum',
                    interfaces: [],
                    group: 'mainnet',
                  },
                  activeAccount: {
                    address: '0x1234567890123456789012345678901234567890',
                  },
                  accounts: [
                    {
                      address: '0x1234567890123456789012345678901234567890',
                    },
                  ],
                  permissions: { methods: ['eth_accounts', 'eth_sendTransaction'], events: [] },
                  provider: {
                    instance: {} as unknown as BlockchainProvider,
                    type: 'evm',
                    version: '1.0.0',
                    multiChainCapable: false,
                    supportedMethods: ['eth_accounts', 'eth_sendTransaction'],
                  },
                  metadata: {
                    wallet: {
                      name: 'MetaMask',
                      icon: 'metamask.png',
                      version: '1.0.0',
                    },
                    dapp: {
                      name: 'Test App',
                      url: 'https://example.com',
                    },
                    connection: {
                      initiatedBy: 'user',
                      method: 'manual',
                      userAgent: 'test',
                    },
                  },
                  lifecycle: {
                    createdAt: Date.now(),
                    lastActiveAt: Date.now(),
                    lastAccessedAt: Date.now(),
                    expiresAt: Date.now() + 3600000,
                    operationCount: 0,
                    activeTime: 0,
                  },
                },
              },
              transactions: {
                'tx-1': {
                  txStatusId: 'tx-1',
                  txHash: '0xabc',
                  chainId: 'eip155:1',
                  walletId: 'metamask',
                  status: 'proving' as const,
                  from: '0x1234567890123456789012345678901234567890',
                  chainType: ChainType.Evm,
                  request: {
                    to: '0x0000000000000000000000000000000000000000',
                    value: '1000',
                  },
                  startTime: Date.now(),
                  wait: vi.fn(),
                  // data: '1000',
                  // timestamp: Date.now(),
                },
              },
            },
            active: {
              walletId: 'metamask',
              sessionId: 'session-1',
              transactionId: 'tx-1',
              selectedWalletId: null,
            },
            meta: {
              lastDiscoveryTime: null,
              connectionTimestamps: {},
              availableWalletIds: [],
              discoveryErrors: [],
              transactionStatus: 'proving' as const,
              
      backgroundTransactionIds: [],
            },
          }),
        );

        const { result } = renderHook(() => useConnect(), { wrapper });

        await act(async () => {
          await result.current.disconnect('metamask', { force: true });
        });

        expect(mockClient.disconnect).toHaveBeenCalledWith('metamask');
      });

      it('should check all pending transaction states', async () => {
        // Mock store state with transactions in various pending states
        mockGetState.mockReturnValue(
          createMockState({
            ui: {
              modalOpen: false,
              currentView: 'connected' as const,
              viewHistory: [],
              loading: { connection: false, discovery: false, transaction: false },
              errors: {},
            },
            entities: {
              wallets: {
                metamask: {
                  id: 'metamask',
                  name: 'MetaMask',
                  icon: 'data:image/svg+xml;base64,...',
                  chains: ['evm' as ChainType],
                },
              },
              sessions: {
                'session-1': {
                  sessionId: 'session-1',
                  walletId: 'metamask',
                  status: 'connected',
                  chain: {
                    chainId: 'eip155:1',
                    chainType: 'evm' as ChainType,
                    name: 'Ethereum',
                    required: true,
                    label: 'Ethereum',
                    interfaces: [],
                    group: 'mainnet',
                  },
                  activeAccount: {
                    address: '0x1234567890123456789012345678901234567890',
                  },
                  accounts: [
                    {
                      address: '0x1234567890123456789012345678901234567890',
                    },
                  ],
                  permissions: { methods: ['eth_accounts', 'eth_sendTransaction'], events: [] },
                  provider: {
                    instance: {} as unknown as BlockchainProvider,
                    type: 'evm',
                    version: '1.0.0',
                    multiChainCapable: false,
                    supportedMethods: ['eth_accounts', 'eth_sendTransaction'],
                  },
                  metadata: {
                    wallet: {
                      name: 'MetaMask',
                      icon: 'metamask.png',
                      version: '1.0.0',
                    },
                    dapp: {
                      name: 'Test App',
                      url: 'https://example.com',
                    },
                    connection: {
                      initiatedBy: 'user',
                      method: 'manual',
                      userAgent: 'test',
                    },
                  },
                  lifecycle: {
                    createdAt: Date.now(),
                    lastActiveAt: Date.now(),
                    lastAccessedAt: Date.now(),
                    expiresAt: Date.now() + 3600000,
                    operationCount: 0,
                    activeTime: 0,
                  },
                },
              },
              transactions: {
                'tx-1': {
                  txStatusId: 'tx-1',
                  txHash: '0xabc',
                  chainId: 'eip155:1',
                  walletId: 'metamask',
                  status: 'simulating' as const,
                  from: '0x1234567890123456789012345678901234567890',
                  chainType: ChainType.Evm,
                  request: {
                    to: '0x0000000000000000000000000000000000000000',
                    value: '1000',
                  },
                  startTime: Date.now(),
                  wait: vi.fn(),
                  // data: '1000',
                  // timestamp: Date.now(),
                },
                'tx-2': {
                  txStatusId: 'tx-2',
                  txHash: '',
                  chainId: 'aztec:mainnet',
                  walletId: 'metamask',
                  status: 'proving' as const,
                  from: '0x1234567890123456789012345678901234567890',
                  chainType: ChainType.Evm,
                  request: {
                    to: '0x0000000000000000000000000000000000000000',
                    value: '1000',
                  },
                  startTime: Date.now(),
                  wait: vi.fn(),
                  // data: '',
                  // timestamp: Date.now(),
                },
                'tx-3': {
                  txStatusId: 'tx-3',
                  txHash: '0xdef',
                  chainId: 'eip155:1',
                  walletId: 'metamask',
                  status: 'sending' as const,
                  from: '0x1234567890123456789012345678901234567890',
                  chainType: ChainType.Evm,
                  request: {
                    to: '0x0000000000000000000000000000000000000000',
                    value: '1000',
                  },
                  startTime: Date.now(),
                  wait: vi.fn(),
                  // data: '2000',
                  // timestamp: Date.now(),
                },
                'tx-4': {
                  txStatusId: 'tx-4',
                  txHash: '0xghi',
                  chainId: 'eip155:1',
                  walletId: 'metamask',
                  status: 'confirming' as const,
                  from: '0x1234567890123456789012345678901234567890',
                  chainType: ChainType.Evm,
                  request: {
                    to: '0x0000000000000000000000000000000000000000',
                    value: '1000',
                  },
                  startTime: Date.now(),
                  wait: vi.fn(),
                  // data: '3000',
                  // timestamp: Date.now(),
                },
              },
            },
            active: {
              walletId: 'metamask',
              sessionId: 'session-1',
              transactionId: null,
              selectedWalletId: null,
            },
            meta: {
              lastDiscoveryTime: null,
              connectionTimestamps: {},
              availableWalletIds: [],
              discoveryErrors: [],
              transactionStatus: 'idle' as const,
              
      backgroundTransactionIds: [],
            },
          }),
        );

        const { result } = renderHook(() => useConnect(), { wrapper });

        await expect(
          act(async () => {
            await result.current.disconnect('metamask');
          }),
        ).rejects.toThrow('Cannot disconnect: 4 pending transaction(s)');
      });
    });
  });

  describe('Error Handling', () => {
    it('should throw error when client not available', async () => {
      // Mock client as null
      const mockConfig: WalletMeshConfig = {
        appName: 'Test App',
        chains: [],
      };
      vi.mocked(useWalletMeshContext).mockReturnValueOnce({
        client: null,
        config: mockConfig,
      });

      const { result } = renderHook(() => useConnect(), { wrapper });

      await expect(
        act(async () => {
          await result.current.connect('metamask');
        }),
      ).rejects.toThrow('WalletMesh client not available');
    });

    it('should throw error when connection service not available', async () => {
      // Temporarily mock services to return no connection service
      vi.mocked(useWalletMeshServices).mockReturnValueOnce({
        connection: undefined as never,
        transaction: {} as never,
        balance: {} as never,
        chain: {} as never,
      });

      const { result } = renderHook(() => useConnect(), { wrapper });

      await expect(
        act(async () => {
          await result.current.connect('metamask');
        }),
      ).rejects.toThrow('Connection service not available');
    });
  });
});

describe('useWalletAdapters', () => {
  let wrapper: (props: { children: React.ReactNode }) => React.ReactElement;

  beforeEach(() => {
    vi.clearAllMocks();

    const mockWallets = [
      { id: 'metamask', name: 'MetaMask', icon: 'icon.png', chains: [ChainType.Evm] },
      { id: 'phantom', name: 'Phantom', icon: 'icon.png', chains: [ChainType.Solana] },
    ];

    vi.mocked(useStore).mockImplementation((selector) => {
      const state = createMockState({
        entities: {
          wallets: mockWallets.reduce(
            (acc, w) => {
              acc[w.id] = { ...w, type: 'extension' as const };
              return acc;
            },
            {} as Record<string, (typeof mockWallets)[0] & { type: 'extension' }>,
          ),
          sessions: {},
          transactions: {},
        },
      });
      return selector ? selector(state as unknown as WalletMeshState) : state;
    });

    const testSetup = createTestWrapper();
    wrapper = testSetup.wrapper;
  });

  it('should return available wallets', () => {
    const { result } = renderHook(() => useWalletAdapters(), { wrapper });

    expect(result.current).toEqual([
      { id: 'metamask', name: 'MetaMask', icon: 'icon.png', chains: [ChainType.Evm], type: 'extension' },
      { id: 'phantom', name: 'Phantom', icon: 'icon.png', chains: [ChainType.Solana], type: 'extension' },
    ]);
  });
});

describe('useIsConnecting', () => {
  let wrapper: (props: { children: React.ReactNode }) => React.ReactElement;

  beforeEach(() => {
    vi.clearAllMocks();
    const testSetup = createTestWrapper();
    wrapper = testSetup.wrapper;
  });

  it('should return true when connecting', () => {
    vi.mocked(useStore).mockImplementation((selector) => {
      const state = {
        ui: {
          currentView: 'connecting',
        },
      } as unknown as WalletMeshState;
      return selector ? selector(state) : state;
    });

    const { result } = renderHook(() => useIsConnecting(), { wrapper });
    expect(result.current).toBe(true);
  });

  it('should return false when not connecting', () => {
    vi.mocked(useStore).mockImplementation((selector) => {
      const state = {
        ui: {
          currentView: 'walletSelection',
        },
      } as unknown as WalletMeshState;
      return selector ? selector(state) : state;
    });

    const { result } = renderHook(() => useIsConnecting(), { wrapper });
    expect(result.current).toBe(false);
  });
});

describe('useConnectionProgress', () => {
  let wrapper: (props: { children: React.ReactNode }) => React.ReactElement;

  beforeEach(() => {
    vi.clearAllMocks();
    const testSetup = createTestWrapper();
    wrapper = testSetup.wrapper;
  });

  it('should return progress when connecting', () => {
    vi.mocked(useStore).mockImplementation((selector) => {
      const state = {
        ui: {
          currentView: 'connecting',
        },
      } as unknown as WalletMeshState;
      return selector ? selector(state) : state;
    });

    const { result } = renderHook(() => useConnectionProgress(), { wrapper });
    expect(result.current).toBe(50); // Returns 50 when connecting
  });

  it('should return 0 when not connecting', () => {
    vi.mocked(useStore).mockImplementation((selector) => {
      const state = {
        ui: {
          currentView: 'walletSelection',
        },
      } as unknown as WalletMeshState;
      return selector ? selector(state) : state;
    });

    const { result } = renderHook(() => useConnectionProgress(), { wrapper });
    expect(result.current).toBe(0);
  });

  it('should handle error in progress generation', () => {
    vi.mocked(useStore).mockImplementation((selector) => {
      const state = {
        ui: {
          currentView: 'connecting',
        },
      } as unknown as WalletMeshState;
      return selector ? selector(state) : state;
    });

    vi.mocked(useWalletMeshServices).mockReturnValue({
      connection: {
        generateConnectionProgress: vi.fn().mockImplementation(() => {
          throw new Error('Progress error');
        }),
      } as Partial<ConnectionService> as ConnectionService,
      transaction: {} as never,
      balance: {} as never,
      chain: {} as never,
    });

    const { result } = renderHook(() => useConnectionProgress(), { wrapper });
    expect(result.current).toBe(50); // Default fallback value
  });
});
