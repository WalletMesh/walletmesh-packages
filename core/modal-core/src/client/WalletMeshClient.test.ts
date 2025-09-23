/**
 * Tests for WalletMeshClient
 */

import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SessionState } from '../api/types/sessionState.js';
import type { WalletAdapter } from '../internal/wallets/base/WalletAdapter.js';
import { createProviderLoader } from '../providers/ProviderLoader.js';
import type { ProviderLoader } from '../providers/ProviderLoader.js';
import {
  createMockLogger,
  createMockModal,
  createMockRegistry,
  createTestEnvironment,
  createTestStore,
  createTypedMock,
  installCustomMatchers,
} from '../testing/index.js';
import { ChainType, type SupportedChain } from '../types.js';
import { WalletMeshClient } from './WalletMeshClient.js';
import type { WalletMeshClientConfig } from './WalletMeshClient.js';

// Install domain-specific matchers
installCustomMatchers();

// Mock the modules that WalletMeshClient imports
vi.mock('../providers/ProviderLoader.js', () => ({
  createProviderLoader: vi.fn(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    hasProvider: vi.fn().mockReturnValue(true),
    getProviderStatus: vi.fn().mockReturnValue({ isLoaded: true }),
    getProviderClass: vi.fn().mockResolvedValue({}),
    clearCache: vi.fn(),
  })),
}));

vi.mock('../internal/state/multiWalletStore.js', () => ({
  getMultiWalletStore: vi.fn(() => ({
    getState: vi.fn(() => ({
      setActiveWallet: vi.fn(),
      addConnection: vi.fn(),
      removeConnection: vi.fn(),
    })),
  })),
}));

vi.mock('../internal/state/providerCache.js', () => ({
  getProviderCache: vi.fn(() => ({
    clearWallet: vi.fn(),
  })),
}));

vi.mock('../internal/registries/ServiceRegistry.js', () => ({
  ServiceRegistry: class MockServiceRegistry {
    initialize = vi.fn().mockResolvedValue(undefined);
    dispose = vi.fn().mockResolvedValue(undefined);
    getServices = vi.fn().mockReturnValue({
      connectionService: {
        connect: vi.fn().mockResolvedValue({ provider: {}, chainId: '1' }),
        disconnect: vi.fn().mockResolvedValue(undefined),
        getActiveConnection: vi.fn().mockReturnValue(null),
      },
      chainService: {
        switchChain: vi.fn().mockResolvedValue(undefined),
        getChainInfo: vi.fn().mockReturnValue({ chainId: '1', name: 'Ethereum' }),
      },
      transactionService: {
        sendTransaction: vi.fn().mockResolvedValue({ hash: '0x123' }),
        getTransactionStatus: vi.fn().mockReturnValue('pending'),
      },
      balanceService: {
        getBalance: vi.fn().mockResolvedValue('1000000000000000000'),
      },
      connection: {
        connect: vi.fn().mockResolvedValue({ provider: {}, chainId: '1' }),
        disconnect: vi.fn().mockResolvedValue(undefined),
        getActiveConnection: vi.fn().mockReturnValue(null),
      },
      chain: {
        switchChain: vi.fn().mockResolvedValue(undefined),
        getChainInfo: vi.fn().mockReturnValue({ chainId: '1', name: 'Ethereum' }),
      },
      transaction: {
        sendTransaction: vi.fn().mockResolvedValue({ hash: '0x123' }),
        getTransactionStatus: vi.fn().mockReturnValue('pending'),
      },
      balance: {
        getBalance: vi.fn().mockResolvedValue('1000000000000000000'),
      },
    });
  },
}));

vi.mock('../internal/core/errors/errorFactory.js', () => ({
  ErrorFactory: {
    configurationError: vi.fn((msg, details) => ({
      code: 'configuration_error',
      message: msg,
      category: 'general',
      recoveryStrategy: 'none',
      data: details,
      name: 'ModalError',
      stack: new Error().stack,
    })),
    connectionFailed: vi.fn((msg, details) => ({
      code: 'connection_failed',
      message: msg,
      category: 'network',
      recoveryStrategy: 'wait_and_retry',
      data: details,
      name: 'ModalError',
      stack: new Error().stack,
    })),
    connectorError: vi.fn((id, msg, code, options) => ({
      code: code || 'connector_error',
      message: msg,
      category: 'wallet',
      recoveryStrategy: 'retry',
      data: { walletId: id, ...options },
      name: 'ModalError',
      stack: new Error().stack,
    })),
    walletNotFound: vi.fn((id) => ({
      code: 'wallet_not_found',
      message: `Wallet ${id} not found`,
      category: 'wallet',
      recoveryStrategy: 'manual_action',
      data: { walletId: id },
      name: 'ModalError',
      stack: new Error().stack,
    })),
    validation: vi.fn((msg, details) => ({
      code: 'validation_error',
      message: msg,
      category: 'general',
      recoveryStrategy: 'none',
      data: details,
      name: 'ModalError',
      stack: new Error().stack,
    })),
    notFound: vi.fn((msg, details) => ({
      code: 'not_found',
      message: msg,
      category: 'general',
      recoveryStrategy: 'none',
      data: details,
      name: 'ModalError',
      stack: new Error().stack,
    })),
    transactionFailed: vi.fn((msg, details) => ({
      code: 'transaction_failed',
      message: msg,
      category: 'general',
      recoveryStrategy: 'retry',
      data: details,
      name: 'ModalError',
      stack: new Error().stack,
    })),
    timeoutError: vi.fn((msg) => ({
      code: 'request_timeout',
      message: msg,
      category: 'network',
      recoveryStrategy: 'retry',
      retryDelay: 1000,
      maxRetries: 3,
      name: 'ModalError',
      stack: new Error().stack,
    })),
    transactionReverted: vi.fn((msg) => ({
      code: 'transaction_reverted',
      message: msg,
      category: 'general',
      recoveryStrategy: 'none',
      name: 'ModalError',
      stack: new Error().stack,
    })),
    invalidParams: vi.fn((msg) => ({
      code: 'invalid_params',
      message: msg,
      category: 'general',
      recoveryStrategy: 'none',
      name: 'ModalError',
      stack: new Error().stack,
    })),
    gasEstimationFailed: vi.fn((msg) => ({
      code: 'gas_estimation_failed',
      message: msg,
      category: 'general',
      recoveryStrategy: 'retry',
      name: 'ModalError',
      stack: new Error().stack,
    })),
    simulationFailed: vi.fn((msg) => ({
      code: 'simulation_failed',
      message: msg,
      category: 'general',
      recoveryStrategy: 'retry',
      name: 'ModalError',
      stack: new Error().stack,
    })),
    cleanupFailed: vi.fn((msg, operation) => ({
      code: 'cleanup_failed',
      message: msg,
      category: 'general',
      recoveryStrategy: 'none',
      data: { operation },
      name: 'ModalError',
      stack: new Error().stack,
    })),
    fromError: vi.fn((error) => ({
      code: 'unknown_error',
      message: error instanceof Error ? error.message : String(error),
      category: 'general',
      recoveryStrategy: 'none',
      name: 'ModalError',
      stack: new Error().stack,
    })),
    isModalError: vi.fn((error) => {
      return (
        error != null &&
        typeof error === 'object' &&
        'code' in error &&
        'message' in error &&
        'category' in error
      );
    }),
  },
}));

// Mock for direct imports from WalletMeshClient
vi.mock('../state/store.js', () => ({
  useStore: vi.fn(() => ({
    getState: vi.fn(() => ({
      ui: { isOpen: false, isLoading: false },
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
        failed: []
      }
    })),
    setState: vi.fn(),
    subscribe: vi.fn(),
  })),
  getWalletMeshStore: vi.fn(() => ({
    getState: vi.fn(() => ({
      ui: { isOpen: false, isLoading: false },
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
        failed: []
      }
    })),
    setState: vi.fn(),
    subscribe: vi.fn(),
  })),
  getStoreInstance: vi.fn(() => ({
    getState: vi.fn(() => ({
      ui: { isOpen: false, isLoading: false },
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
        failed: []
      }
    })),
    setState: vi.fn(),
    subscribe: vi.fn(),
  })),
}));

// Mock for imports from ServiceRegistry (../../state/store.js)
vi.mock('../../state/store.js', () => ({
  useStore: vi.fn(() => ({
    getState: vi.fn(() => ({
      ui: { isOpen: false, isLoading: false },
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
        failed: []
      }
    })),
    setState: vi.fn(),
    subscribe: vi.fn(),
  })),
  getWalletMeshStore: vi.fn(() => ({
    getState: vi.fn(() => ({
      ui: { isOpen: false, isLoading: false },
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
        failed: []
      }
    })),
    setState: vi.fn(),
    subscribe: vi.fn(),
  })),
  getStoreInstance: vi.fn(() => ({
    getState: vi.fn(() => ({
      ui: { isOpen: false, isLoading: false },
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
        failed: []
      }
    })),
    setState: vi.fn(),
    subscribe: vi.fn(),
  })),
}));

// Mock dependencies
const mockStore = {
  getState: vi.fn(),
  setState: vi.fn(),
  subscribe: vi.fn(),
};

const mockDiscoveryService = {
  initialize: vi.fn(),
  startDiscovery: vi.fn(),
  stopDiscovery: vi.fn(),
  getWallets: vi.fn(),
  dispose: vi.fn(),
};

const mockConnectionManager = {
  initialize: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
  switchChain: vi.fn(),
  getActiveConnection: vi.fn(),
  dispose: vi.fn(),
};

const mockEventSystem = {
  initialize: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  dispose: vi.fn(),
};

const mockRegistry = createMockRegistry();
const mockModal = createMockModal();
const mockLogger = createMockLogger();

describe('WalletMeshClient', () => {
  let client: WalletMeshClient;
  let config: WalletMeshClientConfig;
  let useStoreActual: typeof import('../state/store.js').useStore;
  const testEnv = createTestEnvironment();

  beforeAll(async () => {
    // Import actual unified store to avoid mock conflicts and freezing issues
    const storeModule = await vi.importActual('../state/store.js');
    const typedModule = storeModule as typeof import('../state/store.js');
    useStoreActual = typedModule.useStore;
  });

  beforeEach(async () => {
    vi.useFakeTimers();
    await testEnv.setup();

    // Create a real store instance and spy on useStore to use it
    const realStore = createTestStore({ enableDevtools: false, persistOptions: { enabled: false } });
    const storeModule = await import('../state/store.js');
    vi.spyOn(storeModule.useStore, 'getState').mockReturnValue(realStore.getState());
    vi.spyOn(storeModule.useStore, 'setState').mockImplementation(
      (updater: Parameters<typeof realStore.setState>[0]) => {
        realStore.setState(updater);
      },
    );
    vi.spyOn(storeModule.useStore, 'subscribe').mockImplementation(
      (listener: Parameters<typeof realStore.subscribe>[0]) => {
        return realStore.subscribe(listener);
      },
    );

    // Create the config for WalletMeshClient
    config = {
      appName: 'Test App',
      chains: [
        { chainId: 1, chainType: ChainType.Evm, name: 'Ethereum' },
        { chainId: 137, chainType: ChainType.Evm, name: 'Polygon' },
      ],
      wallets: [
        {
          id: 'metamask',
          name: 'MetaMask',
          icon: 'metamask.svg',
          chains: [ChainType.Evm],
        },
      ],
    };

    // Mock registry setup - mocks will be created fresh in each test
    // Default behavior already set in createMockRegistry()
  });

  afterEach(async () => {
    await testEnv.teardown();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with required config', () => {
      client = new WalletMeshClient(config, createMockRegistry(), createMockModal(), createMockLogger());

      expect(client).toBeDefined();
    });

    it('should initialize services on init', async () => {
      client = new WalletMeshClient(config, createMockRegistry(), createMockModal(), createMockLogger());

      await client.initialize();

      // Check that the provider loader was created and initialized
      expect(createProviderLoader).toHaveBeenCalled();
      const mockProviderLoader = vi.mocked(createProviderLoader).mock.results[0].value;
      expect(mockProviderLoader.initialize).toHaveBeenCalled();
    });

    it('should handle initialization errors gracefully', async () => {
      // Update the mock to throw an error
      vi.mocked(createProviderLoader).mockReturnValueOnce({
        initialize: vi.fn().mockRejectedValue(new Error('Init failed')),
        hasProvider: vi.fn().mockReturnValue(true),
        getProviderStatus: vi.fn().mockReturnValue({ isLoaded: true }),
        getProviderClass: vi.fn().mockResolvedValue({}),
        clearCache: vi.fn(),
      });

      client = new WalletMeshClient(config, createMockRegistry(), createMockModal(), createMockLogger());

      await expect(client.initialize()).rejects.toThrow('Client initialization failed');
    });
  });

  describe('wallet discovery', () => {
    let mockRegistry: ReturnType<typeof createMockRegistry>;

    beforeEach(() => {
      mockRegistry = createMockRegistry();
      // Set up detection result for this test suite
      mockRegistry.detectAvailableAdapters.mockResolvedValue([
        {
          adapter: {
            id: 'metamask',
            metadata: {
              name: 'MetaMask',
              icon: 'metamask.svg',
              description: 'MetaMask Wallet',
            },
            capabilities: {
              chains: [{ type: ChainType.Evm }],
              permissions: { methods: ['*'], events: ['accountsChanged', 'chainChanged'] },
            },
          },
          available: true,
        },
      ]);

      client = new WalletMeshClient(config, mockRegistry, createMockModal(), createMockLogger());
    });

    it('should detect available wallets', async () => {
      const detected = await client.discoverWallets();

      expect(mockRegistry.detectAvailableAdapters).toHaveBeenCalled();
      expect(detected).toHaveLength(1);
      expect(detected[0]).toMatchObject({
        available: true,
        adapter: {
          id: 'metamask',
          metadata: {
            name: 'MetaMask',
          },
        },
      });
    });

    it('should get all wallets', () => {
      const mockAdapter = {
        id: 'metamask',
        metadata: { name: 'MetaMask' },
      };
      mockRegistry.getAllAdapters.mockReturnValue([mockAdapter]);

      const wallets = client.getAllWallets();

      expect(wallets).toEqual([mockAdapter]);
    });

    it('should get specific wallet', () => {
      const mockAdapter = {
        id: 'metamask',
        metadata: { name: 'MetaMask' },
      };
      mockRegistry.getAdapter.mockReturnValue(mockAdapter);

      const wallet = client.getWallet('metamask');

      expect(mockRegistry.getAdapter).toHaveBeenCalledWith('metamask');
      expect(wallet).toEqual(mockAdapter);
    });
  });

  describe('connection management', () => {
    let mockRegistry: ReturnType<typeof createMockRegistry>;
    let mockModal: ReturnType<typeof createMockModal>;

    beforeEach(async () => {
      mockRegistry = createMockRegistry();
      mockModal = createMockModal();

      client = new WalletMeshClient(config, mockRegistry, mockModal, createMockLogger());
    });

    it('should connect to a wallet', async () => {
      const mockAdapter = {
        id: 'metamask',
        metadata: {
          name: 'MetaMask',
          icon: 'metamask.svg',
        },
        capabilities: {
          chains: [{ type: ChainType.Evm }],
          permissions: { methods: ['*'] },
        },
        connect: vi.fn().mockResolvedValue({
          walletId: 'metamask',
          address: '0x123',
          accounts: ['0x123'],
          chain: {
            chainId: 'eip155:1',
            chainType: ChainType.Evm,
            name: 'Ethereum Mainnet',
            required: true,
            interfaces: ['eip1193'],
          },
          chainType: ChainType.Evm,
          provider: {},
        }),
        on: vi.fn(),
        connection: null,
      };

      mockRegistry.getAdapter.mockReturnValue(mockAdapter);

      // Use the same unified store spy setup from beforeEach

      const result = await client.connect('metamask', {
        chain: {
          chainId: 'eip155:1',
          chainType: ChainType.Evm,
          name: 'Ethereum Mainnet',
          required: true,
          interfaces: ['eip1193'],
        },
      });

      expect(mockAdapter.connect).toHaveBeenCalled();
      expect(result).toMatchObject({
        walletId: 'metamask',
        address: '0x123',
      });
    });

    it('should handle connection without wallet ID', async () => {
      // Mock initial modal state - closed
      mockModal.getState.mockReturnValue({
        isOpen: false,
        connection: { state: 'idle' },
        selectedWalletId: undefined,
      });

      // Mock modal subscription behavior
      let subscribeCallback:
        | ((state: { isOpen: boolean; selectedWalletId?: string; connection: { state: string } }) => void)
        | undefined;

      mockModal.subscribe.mockImplementation((callback) => {
        subscribeCallback = callback;
        return () => {}; // Return unsubscribe function
      });

      // Mock modal.open to simulate opening and wallet selection
      mockModal.open.mockImplementation(async () => {
        // Update mock state to show modal is open
        mockModal.getState.mockReturnValue({
          isOpen: true,
          connection: { state: 'idle' },
          selectedWalletId: undefined,
        });

        // Simulate wallet selection after modal opens
        setTimeout(() => {
          if (subscribeCallback) {
            // Simulate user selecting a wallet - trigger the state change
            subscribeCallback({
              isOpen: true,
              selectedWalletId: 'metamask',
              connection: { state: 'connecting' },
            });
          }
        }, 5);
      });

      const mockAdapter = {
        id: 'metamask',
        metadata: { name: 'MetaMask', icon: 'metamask.svg' },
        capabilities: { chains: [{ type: ChainType.Evm }] },
        connect: vi.fn().mockResolvedValue({
          walletId: 'metamask',
          address: '0x123',
          accounts: ['0x123'],
          chain: {
            chainId: 'eip155:1',
            chainType: ChainType.Evm,
            name: 'Ethereum Mainnet',
            required: true,
            interfaces: ['eip1193'],
          },
          chainType: ChainType.Evm,
          provider: {},
        }),
        on: vi.fn(),
      };

      mockRegistry.getAdapter.mockReturnValue(mockAdapter);

      const connectPromise = client.connect();

      // Advance timers to trigger the setTimeout in modal.open
      await vi.advanceTimersByTimeAsync(10);

      const result = await connectPromise;

      expect(mockModal.open).toHaveBeenCalled();
      expect(mockAdapter.connect).toHaveBeenCalled();
      expect(result).toMatchObject({
        walletId: 'metamask',
        address: '0x123',
      });
    });

    it('should disconnect from wallet', async () => {
      const mockAdapter = createTypedMock<WalletAdapter>({
        disconnect: vi.fn().mockResolvedValue(undefined),
        connection: { address: '0x123' },
      });

      // Add wallet to active connections
      client['adapters'].set('metamask', mockAdapter);
      client['activeConnections'].add('metamask');

      await client.disconnect('metamask');

      expect(mockAdapter.disconnect).toHaveBeenCalled();
    });
  });

  describe('modal control', () => {
    let mockModal: ReturnType<typeof createMockModal>;

    beforeEach(async () => {
      mockModal = createMockModal();

      client = new WalletMeshClient(config, createMockRegistry(), mockModal, createMockLogger());
    });

    it('should open modal', async () => {
      await client.openModal();

      expect(mockModal.open).toHaveBeenCalled();
    });

    it('should close modal', () => {
      client.closeModal();

      expect(mockModal.close).toHaveBeenCalled();
    });

    it('should get modal state', () => {
      const mockState = {
        connection: { state: 'connected' },
        wallets: ['metamask'],
        isOpen: true,
      };
      mockModal.getState.mockReturnValue(mockState);

      const state = client.getState();

      expect(state).toEqual(mockState);
    });
  });

  describe('state subscriptions', () => {
    beforeEach(async () => {
      client = new WalletMeshClient(config, createMockRegistry(), createMockModal(), createMockLogger());
    });

    it('should subscribe to state changes', () => {
      const callback = vi.fn();
      const mockModal = createMockModal();

      // Make subscribe call the callback immediately with initial state
      mockModal.subscribe.mockImplementation((cb) => {
        cb(mockModal.getState());
        return () => {};
      });

      client = new WalletMeshClient(config, createMockRegistry(), mockModal, createMockLogger());

      const unsubscribe = client.subscribe(callback);

      expect(typeof unsubscribe).toBe('function');
      // Initial state should be called
      expect(callback).toHaveBeenCalledWith(client.getState());
    });

    it('should receive state updates on connection changes', async () => {
      const callback = vi.fn();
      const mockModal = createMockModal();
      client = new WalletMeshClient(config, createMockRegistry(), mockModal, createMockLogger());

      client.subscribe(callback);
      callback.mockClear(); // Clear initial call

      // Simulate state change in modal
      const newState = {
        ...mockModal.getState(),
        connection: {
          state: 'connected' as const,
          address: '0x123',
          chain: {
            chainId: 'eip155:1',
            chainType: ChainType.Evm,
            name: 'Ethereum Mainnet',
            required: true,
            interfaces: ['eip1193'],
          },
          accounts: ['0x123'],
        },
      };

      // Trigger state change
      mockModal.getState = vi.fn().mockReturnValue(newState);
      const subscribers = mockModal.subscribe.mock.calls.map((call) => call[0]);
      for (const sub of subscribers) {
        sub(newState);
      }

      expect(callback).toHaveBeenCalledWith(newState);
    });

    it('should handle on() method for event subscriptions', () => {
      const callback = vi.fn();

      const unsubscribe = client.on('connect', callback);

      // The WalletMeshClient.on() method is not deprecated - it's a different implementation
      // from WalletMeshClientCore.on(). This one uses EventTarget internally.
      expect(typeof unsubscribe).toBe('function');

      // Simulate an event
      const event = new CustomEvent('connect', { detail: { walletId: 'metamask' } });
      client['eventTarget'].dispatchEvent(event);

      expect(callback).toHaveBeenCalledWith({ walletId: 'metamask' });
    });

    it('should handle once() method for one-time event subscriptions', () => {
      const callback = vi.fn();

      const unsubscribe = client.once('connect', callback);

      // The WalletMeshClient.once() method is not deprecated
      expect(typeof unsubscribe).toBe('function');

      // Emit event twice
      const event1 = new CustomEvent('connect', { detail: { walletId: 'metamask' } });
      const event2 = new CustomEvent('connect', { detail: { walletId: 'walletconnect' } });

      client['eventTarget'].dispatchEvent(event1);
      client['eventTarget'].dispatchEvent(event2);

      // Should only be called once
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith({ walletId: 'metamask' });
    });
  });

  describe('chain management', () => {
    beforeEach(async () => {
      client = new WalletMeshClient(config, createMockRegistry(), createMockModal(), createMockLogger());
    });

    it('should return early if already on requested chain', async () => {
      // Create a proper mock session
      const mockSession = {
        sessionId: 'test-session',
        walletId: 'metamask',
        status: 'connected' as const,
        chain: {
          chainId: 'eip155:1',
          chainType: ChainType.Evm,
          name: 'Ethereum Mainnet',
          required: true,
          interfaces: ['eip1193'],
        },
        provider: {
          instance: { test: 'provider' },
          type: 'injected',
          version: '1.0.0',
          multiChainCapable: false,
          supportedMethods: [],
        },
        activeAccount: {
          address: '0x123',
          index: 0,
          derivationPath: "m/44'/60'/0'/0/0",
        },
        accounts: [
          {
            address: '0x123',
            index: 0,
            derivationPath: "m/44'/60'/0'/0/0",
            isActive: true,
          },
        ],
        lifecycle: {
          createdAt: Date.now(),
          lastActiveAt: Date.now(),
          lastAccessedAt: Date.now(),
        },
      };

      // Set up the mock before creating the client
      const mockSwitchChain = vi.fn();

      // Mock the connectionActions methods
      const connectionActionsModule = await import('../state/actions/connections.js');
      vi.spyOn(connectionActionsModule.connectionActions, 'getWalletSessions').mockReturnValue([
        mockSession as SessionState,
      ]);
      vi.spyOn(connectionActionsModule.connectionActions, 'switchChain').mockImplementation(mockSwitchChain);

      // Use the actual store that was set up in beforeEach
      const storeModule = await import('../state/store.js');
      const currentGetState = vi.mocked(storeModule.useStore.getState);
      const originalState = currentGetState();

      // Mock the connections state to include our test session
      currentGetState.mockReturnValue({
        ...originalState,
        connections: {
          ...originalState.connections,
          activeSessions: [mockSession as SessionState],
          activeSessionId: mockSession.sessionId,
          wallets: [
            {
              id: 'metamask',
              name: 'MetaMask',
              icon: 'metamask.svg',
              chains: [ChainType.Evm],
            },
          ],
          availableWalletIds: ['metamask'],
        },
      });

      const mockAdapter = {
        id: 'metamask',
        connection: {
          walletId: 'metamask',
          address: '0x123',
          chain: {
            chainId: 'eip155:1',
            chainType: ChainType.Evm,
            name: 'Ethereum Mainnet',
            required: true,
            interfaces: ['eip1193'],
          },
          chainType: ChainType.Evm,
          provider: {
            request: vi.fn().mockResolvedValue(null),
          },
        },
      };

      client['adapters'].set('metamask', mockAdapter);
      client['activeWalletId'] = 'metamask';
      client['activeConnections'].add('metamask');

      // Since we already mocked the store state above with the session,
      // we don't need to create another one

      const targetChain: SupportedChain = {
        chainId: 'eip155:1',
        chainType: ChainType.Evm,
        name: 'Ethereum Mainnet',
        required: true,
        interfaces: ['eip1193'],
      };

      const result = await client.switchChain(targetChain); // Same chain

      expect(result).toMatchObject({
        chain: targetChain,
        chainType: ChainType.Evm,
        previousChain: targetChain,
        provider: { test: 'provider' },
      });

      // Verify that switchChain was not called on the session manager since we're already on the chain
      expect(mockSwitchChain).not.toHaveBeenCalled();
    });

    it('should throw error if no wallet connected', async () => {
      const targetChain: SupportedChain = {
        chainId: 'eip155:137',
        chainType: ChainType.Evm,
        name: 'Polygon',
        required: true,
        interfaces: ['eip1193'],
      };
      await expect(client.switchChain(targetChain)).rejects.toThrow('No wallet connected');
    });
  });

  describe('state management', () => {
    beforeEach(async () => {
      client = new WalletMeshClient(config, createMockRegistry(), createMockModal(), createMockLogger());
    });

    it('should check if connected', () => {
      expect(client.isConnected).toBe(false);

      client['activeConnections'].add('metamask');

      expect(client.isConnected).toBe(true);
    });

    it('should manage active wallet', () => {
      client['activeConnections'].add('metamask');

      client.setActiveWallet('metamask');

      expect(client.getActiveWallet()).toBe('metamask');
    });

    it('should throw when setting non-connected wallet as active', () => {
      expect(() => client.setActiveWallet('phantom')).toThrow('Wallet phantom is not connected');
    });
  });

  describe('cleanup', () => {
    let mockModal: ReturnType<typeof createMockModal>;
    let mockRegistry: ReturnType<typeof createMockRegistry>;

    beforeEach(async () => {
      mockModal = createMockModal();
      mockRegistry = createMockRegistry();

      client = new WalletMeshClient(config, mockRegistry, mockModal, createMockLogger());
    });

    it('should destroy client and clean up resources', () => {
      const mockAdapter = {
        disconnect: vi.fn().mockResolvedValue(undefined),
      };

      client['adapters'].set('metamask', mockAdapter);
      client['activeConnections'].add('metamask');

      client.destroy();

      expect(mockModal.cleanup).toHaveBeenCalled();
      expect(mockRegistry.clear).toHaveBeenCalled();
    });

    it('should handle cleanup errors gracefully', () => {
      mockModal.cleanup = vi.fn(() => {
        // Don't throw, just log the error like the actual implementation does
      });

      // Mock the disconnectAll to not throw
      client.disconnectAll = vi.fn().mockRejectedValue(new Error('Disconnect failed'));

      // Should not throw
      expect(() => client.destroy()).not.toThrow();
    });
  });

  describe('error scenarios', () => {
    let mockRegistry: ReturnType<typeof createMockRegistry>;

    beforeEach(() => {
      mockRegistry = createMockRegistry();

      client = new WalletMeshClient(config, mockRegistry, createMockModal(), createMockLogger());
    });

    it('should handle connection errors', async () => {
      const mockAdapter = {
        connect: vi.fn().mockRejectedValue(new Error('Connection failed')),
        on: vi.fn(),
      };

      mockRegistry.getAdapter.mockReturnValue(mockAdapter);

      await expect(client.connect('metamask')).rejects.toThrow('Connection failed');
    });

    it('should handle wallet not found errors', async () => {
      mockRegistry.getAdapter.mockReturnValue(undefined);

      await expect(client.connect('unknown')).rejects.toThrow();
    });

    it('should handle detection errors', async () => {
      mockRegistry.detectAvailableAdapters.mockRejectedValue(new Error('Detection failed'));

      await expect(client.discoverWallets()).rejects.toThrow('Wallet detection failed');
    });
  });

  describe('connection helpers', () => {
    beforeEach(() => {
      client = new WalletMeshClient(config, createMockRegistry(), createMockModal(), createMockLogger());
    });

    it('should get connection by wallet id', () => {
      const mockAdapter = {
        id: 'metamask',
        connection: { address: '0x123' },
      };

      client['adapters'].set('metamask', mockAdapter);

      const connection = client.getConnection('metamask');

      expect(connection).toEqual(mockAdapter);
    });

    it('should get all connections', () => {
      const mockAdapter1 = {
        id: 'metamask',
        connection: { address: '0x123' },
      };
      const mockAdapter2 = {
        id: 'phantom',
        connection: { address: 'abc123' },
      };

      client['adapters'].set('metamask', mockAdapter1);
      client['adapters'].set('phantom', mockAdapter2);

      const connections = client.getConnections();

      expect(connections).toHaveLength(2);
      expect(connections).toContain(mockAdapter1);
      expect(connections).toContain(mockAdapter2);
    });

    it('should get all connection details', () => {
      const mockAdapter = {
        id: 'metamask',
        connection: {
          walletId: 'metamask',
          address: '0x123',
          chain: {
            chainId: 'eip155:1',
            chainType: ChainType.Evm,
            name: 'Ethereum Mainnet',
            required: true,
            interfaces: ['eip1193'],
          },
          chainType: ChainType.Evm,
        },
      };

      client['adapters'].set('metamask', mockAdapter);

      const connections = client.getAllConnections();

      expect(connections).toHaveLength(1);
      expect(connections[0]).toEqual(mockAdapter.connection);
    });
  });
});
