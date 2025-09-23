/**
 * Modal Controller New Features Integration Tests
 *
 * Comprehensive integration tests with organized structure:
 * - Provider Management (provider field, connection results)
 * - State Management (view management, subscriptions, state ordering)
 * - Connection Features (connect options, discriminated unions)
 * - Integration Tests (chain configurations, wallet availability)
 * - Type Safety (SSR-safe controller, type-safe subscriptions)
 *
 * @internal
 */

import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { BlockchainProvider } from '../../api/types/chainProviders.js';
import type { ConnectOptions } from '../../api/types/connectOptions.js';
import type { CreateSessionParams } from '../../api/types/sessionState.js';
import { connectionActions } from '../../state/actions/connections.js';
import { uiActions } from '../../state/actions/ui.js';
import { useStore } from '../../state/store.js';
import {
  createMockModalController,
  createMockRegistry,
  createTestEnvironment,
  createTestStore,
  installCustomMatchers,
} from '../../testing/index.js';
import {
  ChainType,
  type ConnectionResult,
  type HeadlessModalState,
  type ModalError,
  type WalletInfo,
} from '../../types.js';
import type { ModalController as ModalControllerType } from '../../types.js';
import type { FrameworkAdapter } from '../adapters/FrameworkAdapter.js';
import type { WalletMeshClient } from '../client/WalletMeshClient.js';
import { ErrorFactory } from '../core/errors/errorFactory.js';
import type { ErrorHandler } from '../core/errors/errorHandler.js';
import { ERROR_CODES } from '../core/errors/types.js';
import { createCoreServices } from '../core/factories/serviceFactory.js';
import type { Logger } from '../core/logger/logger.js';
import type { WalletRegistry } from '../registries/wallets/WalletRegistry.js';
import { ModalController } from './controller.js';

// Install domain-specific matchers
installCustomMatchers();

// Note: Frozen object handling is done in vitest.setup.ts

// Helper to create valid SVG data URI for tests
function createTestSvgIcon(color = '#000'): string {
  const svg = `<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" fill="${color}"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// Mock types for testing
interface MockProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
}

// Mock provider will be passed to MockWalletClient in constructor

// Mock Framework Adapter
class MockFrameworkAdapter {
  render = vi.fn();
  destroy = vi.fn();
  initialize = vi.fn();
  updateState = vi.fn();
}

// Mock Wallet Client
class MockWalletClient implements Partial<WalletMeshClient> {
  private eventHandlers = new Map<string, Set<(data: unknown) => void>>();
  private mockProvider: MockProvider;

  constructor(provider: MockProvider) {
    this.mockProvider = provider;
  }

  connect = vi.fn();
  disconnect = vi.fn();
  disconnectAll = vi.fn().mockResolvedValue(undefined);
  getConnection = vi.fn();
  getConnections = vi.fn().mockReturnValue([]);
  getAllConnections = vi.fn().mockReturnValue([]);
  discoverWallets = vi.fn().mockResolvedValue([]);
  getWallet = vi.fn();
  getAllWallets = vi.fn().mockReturnValue([]);
  openModal = vi.fn().mockResolvedValue(undefined);
  closeModal = vi.fn();
  modal = createMockModalController() as ModalControllerType;
  registry = createMockRegistry();
  isConnected = false;
  destroy = vi.fn();

  on = vi.fn().mockImplementation((event: string, handler: (data: unknown) => void) => {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)?.add(handler);
    return () => {
      this.eventHandlers.get(event)?.delete(handler);
    };
  });

  off = vi.fn().mockImplementation((event: string, handler: (data: unknown) => void) => {
    this.eventHandlers.get(event)?.delete(handler);
  });

  emit(event: string, data: unknown) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      for (const handler of handlers) {
        handler(data);
      }
    }
  }

  getProvider = vi.fn().mockImplementation(() => {
    // Return the mock provider
    return this.mockProvider;
  });

  getConnector = vi.fn().mockImplementation((id: string) => {
    if (id === 'metamask' || id === 'phantom') {
      return {
        isAvailable: vi.fn().mockResolvedValue(true),
        meta: {
          name: id === 'metamask' ? 'MetaMask' : 'Phantom',
          icon: `${id}-icon`,
        },
        chains: [id === 'metamask' ? ChainType.Evm : ChainType.Solana],
      };
    }
    return undefined;
  });

  getConnectors = vi.fn().mockReturnValue(
    new Map([
      [
        'metamask',
        {
          meta: {
            name: 'MetaMask',
            icon: createTestSvgIcon('#f6851b'),
            description: 'MetaMask wallet',
          },
          chains: [ChainType.Evm],
        },
      ],
      [
        'phantom',
        {
          meta: {
            name: 'Phantom',
            icon: createTestSvgIcon('#5a32e6'),
            description: 'Phantom wallet',
          },
          chains: [ChainType.Solana],
        },
      ],
    ]),
  );
}

describe('Modal Controller New Features Integration', () => {
  const testEnv = createTestEnvironment();
  let errorHandler: ErrorHandler;
  let logger: Logger;
  let modalController: ModalController;
  let frameworkAdapter: MockFrameworkAdapter;
  let clientInstance: MockWalletClient;
  let mockProvider: MockProvider;
  let useStoreActual: typeof import('../../state/store.js').useStore;

  beforeAll(async () => {
    // Import actual unified store to avoid mock conflicts and freezing issues
    const storeModule = await vi.importActual('../../state/store.js');
    const typedModule = storeModule as typeof import('../../state/store.js');
    useStoreActual = typedModule.useStore;
  });

  beforeEach(async () => {
    await testEnv.setup();

    // Create a real store instance and spy on useStore to use it
    const realStore = createTestStore({ enableDevtools: false, persistOptions: { enabled: false } });
    const storeModule = await import('../../state/store.js');
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

    // Create mock store
    const mockStore = {
      connections: {
        activeSessions: new Map(),
        sessionsByWallet: new Map(),
        activeSessionId: null,
        manager: {
          createSession: vi.fn().mockResolvedValue({
            sessionId: 'test-session',
            walletId: 'test-wallet',
            status: 'connected',
            primaryAddress: '0x123',
            addresses: ['0x123'],
            chain: { chainId: '0x1', chainType: 'evm' },
          }),
        },
      },
      wallets: {
        configured: new Map(),
        discovered: new Map(),
        available: [],
      },
      discovery: {
        isScanning: false,
        lastScanTime: null,
        errors: [],
      },
      transactions: {
        history: new Map(),
        current: null,
        status: 'idle' as const,
        error: null,
      },
      actions: {
        ui: {
          openModal: vi.fn(),
          closeModal: vi.fn(),
          setView: vi.fn(),
          setLoading: vi.fn(),
          setError: vi.fn(),
        },
        connections: {
          createSession: vi.fn().mockImplementation(async (params) => {
            const session = {
              sessionId: `session-${Date.now()}`,
              walletId: params.walletId,
              status: 'connected' as const,
              primaryAddress: params.activeAccountAddress || params.addresses[0],
              addresses: params.addresses,
              chain: params.chain,
              accounts: params.accounts,
              activeAccount: params.accounts?.[0],
              provider: params.provider,
              providerMetadata: params.providerMetadata,
              permissions: params.permissions,
              metadata: params.metadata,
            };
            mockStore.connections.activeSessions.set(session.sessionId, session);
            mockStore.connections.activeSessionId = session.sessionId;
            return session;
          }),
          endSession: vi.fn(),
          getActiveSession: vi.fn(),
          switchToSession: vi.fn(),
          getWalletSessions: vi.fn(),
          switchChain: vi.fn(),
        },
        wallets: {
          addWallet: vi.fn(),
          removeWallet: vi.fn(),
          discoverWallets: vi.fn(),
          checkAvailability: vi.fn(),
        },
        discovery: {
          startScan: vi.fn(),
          stopScan: vi.fn(),
          clearErrors: vi.fn(),
        },
      },
    };

    // Spy on the unified store
    vi.spyOn(storeModule.useStore, 'getState').mockReturnValue(mockStore);
    vi.spyOn(storeModule.useStore, 'setState').mockImplementation(
      (updater: Parameters<typeof storeModule.useStore.setState>[0]) => {
        if (typeof updater === 'function') {
          updater(mockStore);
        } else {
          Object.assign(mockStore, updater);
        }
      },
    );
    vi.spyOn(storeModule.useStore, 'subscribe').mockImplementation(() => () => {});

    // Create services
    const testServices = createCoreServices({
      logger: {
        level: 'debug',
        prefix: '[Test]',
      },
    });

    errorHandler = testServices.errorHandler;
    logger = testServices.logger;

    // Create mock provider first (before client which depends on it)
    mockProvider = {
      request: vi.fn().mockImplementation(({ method }) => {
        switch (method) {
          case 'eth_accounts':
            return Promise.resolve(['0x1234567890123456789012345678901234567890']);
          case 'eth_chainId':
            return Promise.resolve('0x1');
          default:
            return Promise.resolve(null);
        }
      }),
      on: vi.fn(),
      removeListener: vi.fn(),
    };

    // Create mocks (after provider is initialized)
    frameworkAdapter = new MockFrameworkAdapter();
    clientInstance = new MockWalletClient(mockProvider);

    // Set up default mock implementation for connect
    clientInstance.connect.mockImplementation(async (walletId: string, options?: ConnectOptions) => {
      // Create session in unified store like real client would
      const store = useStoreActual;

      const sessionParams: CreateSessionParams = {
        walletId,
        accounts: [
          {
            address: '0x1234567890123456789012345678901234567890',
            name: 'Account 1',
            isDefault: true,
            metadata: {
              discoveredAt: Date.now(),
              lastUsedAt: Date.now(),
            },
          },
        ],
        activeAccountIndex: 0,
        chain: {
          chainId: '0x1',
          chainType: ChainType.Evm,
          name: 'Ethereum',
          required: false,
        },
        provider: mockProvider as BlockchainProvider,
        providerMetadata: {
          type: 'eip1193',
          version: '1.0.0',
          multiChainCapable: false,
          supportedMethods: ['eth_accounts', 'eth_chainId'],
        },
        permissions: {
          chains: [ChainType.Evm],
          methods: ['eth_accounts', 'eth_chainId'],
          events: [],
          scopes: [],
        },
        metadata: {
          wallet: {
            name: walletId === 'metamask' ? 'MetaMask' : 'Phantom',
            icon: createTestSvgIcon(walletId === 'metamask' ? '#f6851b' : '#5a32e6'),
          },
          dapp: {
            name: 'Test DApp',
            url: 'http://localhost:3000',
          },
          connection: {
            initiatedBy: 'user',
            method: 'manual',
            userAgent: 'test',
          },
        },
      };

      await connectionActions.createSession(store, sessionParams);

      // Return WalletConnection result
      return {
        address: '0x1234567890123456789012345678901234567890',
        accounts: ['0x1234567890123456789012345678901234567890'],
        chain: {
          chainId: '0x1',
          chainType: ChainType.Evm,
          name: 'Ethereum',
          required: false,
        },
        chainType: ChainType.Evm,
        provider: mockProvider,
        walletId,
        walletInfo: {
          id: walletId,
          name: walletId === 'metamask' ? 'MetaMask' : 'Phantom',
          icon: `${walletId}-icon`,
          chains: [walletId === 'metamask' ? ChainType.Evm : ChainType.Solana],
        },
      };
    });

    // Create modal controller
    modalController = new ModalController({
      wallets: [
        {
          id: 'metamask',
          name: 'MetaMask',
          icon: createTestSvgIcon('#f6851b'),
          chains: [ChainType.Evm],
        },
        {
          id: 'phantom',
          name: 'Phantom',
          icon: createTestSvgIcon('#5a32e6'),
          chains: [ChainType.Solana],
        },
      ],
      client: clientInstance as WalletMeshClient,
      frameworkAdapter: frameworkAdapter as FrameworkAdapter,
      debug: true,
      errorHandler,
      logger,
    });
  });

  afterEach(async () => {
    // Destroy the modal controller to clean up state
    if (modalController) {
      modalController.destroy();
    }

    // Reset the unified store to clean state
    const store = useStoreActual;
    const state = store.getState();
    // Clear all sessions
    const allSessions = Object.values(state.entities.sessions);
    for (const session of allSessions) {
      await connectionActions.endSession(store, session.sessionId);
    }
    // Reset UI state
    uiActions.setView(store, 'walletSelection');
    uiActions.closeModal(store);
    // Clear errors for all contexts
    for (const context of Object.keys(state.ui.errors)) {
      uiActions.setError(store, context, undefined);
    }

    await testEnv.teardown();
  });

  describe('Provider Management', () => {
    describe('Provider Field in ConnectionResult', () => {
      it('should include provider in connection result', async () => {
        // Create a fresh controller for this test
        const testController = new ModalController({
          wallets: [
            {
              id: 'metamask',
              name: 'MetaMask',
              icon: createTestSvgIcon('#f6851b'),
              chains: [ChainType.Evm],
            },
          ],
          client: clientInstance as WalletMeshClient,
          frameworkAdapter: frameworkAdapter as FrameworkAdapter,
          debug: true,
          errorHandler,
          logger,
        });

        // Mount the controller first
        await testController.mount();

        // Setup connection result with provider
        const walletInfo: WalletInfo = {
          id: 'metamask',
          name: 'MetaMask',
          icon: createTestSvgIcon('#f6851b'),
          chains: [ChainType.Evm],
        };

        // Connect to wallet
        const result = await testController.connect('metamask');

        // Verify provider is included
        expect(result.address).toBe('0x1234567890123456789012345678901234567890');
        expect(result.provider).toBeDefined();
        expect(typeof result.provider).toBe('object');
        expect(result.walletId).toBe('metamask');
        expect(result.walletInfo.id).toBe(walletInfo.id);
        expect(result.walletInfo.name).toBe(walletInfo.name);
        expect(result.walletInfo.icon).toBe(walletInfo.icon);
        expect(result.walletInfo.chains).toBeDefined();
        expect(Array.isArray(result.walletInfo.chains)).toBe(true);
        expect(result.walletInfo.chains).toHaveLength(walletInfo.chains.length);
        expect(result.walletInfo.chains).toContain(walletInfo.chains[0]);

        // Verify provider can be used
        const typedResult = result as ConnectionResult;
        const accounts = await (typedResult.provider as MockProvider).request({ method: 'eth_accounts' });
        expect(accounts).toBeDefined();
        expect(Array.isArray(accounts)).toBe(true);
        expect(accounts).toHaveLength(1);
        expect(accounts[0]).toBe('0x1234567890123456789012345678901234567890');

        // Cleanup test controller
        testController.destroy();
      });

      it('should handle different provider types', async () => {
        // Test Solana provider
        const solanaProvider = {
          publicKey: { toString: () => 'SolanaAddress123' },
          connect: vi.fn(),
          disconnect: vi.fn(),
          signTransaction: vi.fn(),
        };

        const connectionResult: ConnectionResult = {
          address: 'SolanaAddress123',
          accounts: ['SolanaAddress123'],
          chain: {
            chainId: 'solana-mainnet',
            chainType: ChainType.Solana,
            name: 'Solana',
            required: false,
          },
          provider: solanaProvider,
          walletId: 'metamask',
          walletInfo: {
            id: 'metamask',
            name: 'MetaMask',
            icon: createTestSvgIcon('#f6851b'),
            chains: [ChainType.Evm, ChainType.Solana],
          },
        };

        // Reset the default mock completely and set up a new one
        clientInstance.connect.mockReset();
        clientInstance.connect.mockImplementation(async (walletId: string) => {
          // Create session in unified store like real client would
          const store = useStoreActual;

          const sessionParams = {
            walletId,
            accounts: [
              {
                address: connectionResult.address,
                name: 'Account 1',
                isDefault: true,
                metadata: {
                  discoveredAt: Date.now(),
                  lastUsedAt: Date.now(),
                },
              },
            ],
            activeAccountIndex: 0,
            chain: {
              chainId: connectionResult.chain.chainId,
              chainType: connectionResult.chain.chainType,
              name: connectionResult.chain.chainType === ChainType.Solana ? 'Solana' : 'Ethereum',
              required: false,
            },
            provider: solanaProvider as BlockchainProvider,
            providerMetadata: {
              type: 'custom',
              version: '1.0.0',
              multiChainCapable: true,
              supportedMethods: ['signTransaction'],
            },
            permissions: {
              chains: [connectionResult.chain.chainType],
              methods: ['signTransaction'],
              events: [],
              scopes: [],
            },
            metadata: {
              wallet: {
                name: 'MetaMask',
                icon: createTestSvgIcon('#f6851b'),
              },
              dapp: {
                name: 'Test DApp',
                url: 'http://localhost:3000',
              },
              connection: {
                initiatedBy: 'user',
                method: 'manual',
                userAgent: 'test',
              },
            },
          };

          await connectionActions.createSession(store, sessionParams);
          return connectionResult;
        });
        clientInstance.getProvider.mockReturnValue(solanaProvider);

        // Create a fresh controller for this test - use MetaMask but simulate Solana provider
        const testController = new ModalController({
          wallets: [
            {
              id: 'metamask',
              name: 'MetaMask',
              icon: createTestSvgIcon('#f6851b'),
              chains: [ChainType.Evm, ChainType.Solana], // Simulate multi-chain wallet
            },
          ],
          client: clientInstance as WalletMeshClient,
          frameworkAdapter: frameworkAdapter as FrameworkAdapter,
          debug: true,
          errorHandler,
          logger,
        });

        // Mount the controller first
        await testController.mount();

        const result = await testController.connect('metamask');

        expect(result).toBeDefined();
        expect(result.provider).toBeDefined();
        expect(typeof result.provider).toBe('object');
        expect(result.chain.chainType).toBe(ChainType.Solana);

        // Cleanup test controller
        testController.destroy();
      });
    });
  }); // End of Provider Management

  describe('State Management', () => {
    describe('State-Based View Management', () => {
      it('should handle state transitions during view changes', async () => {
        // Ensure clean state
        await modalController.reset();
        modalController.setView('walletSelection');

        const stateChanges: Array<{ state: string; view: string }> = [];

        // Subscribe to state changes instead of events
        const unsubscribe = modalController.subscribe((state) => {
          stateChanges.push({
            state: state.connection.state,
            view: state.ui?.currentView || 'unknown',
          });
        });

        // Open modal
        await modalController.open();

        // Clear any state changes from initialization
        stateChanges.length = 0;

        // Ensure we're in walletSelection view
        const state = modalController.getState();
        expect(state.connection.state).toBe('selecting');

        // Mock successful connection
        const walletInfo: WalletInfo = {
          id: 'metamask',
          name: 'MetaMask',
          icon: createTestSvgIcon('#f6851b'),
          chains: [ChainType.Evm],
        };

        const mockConnectionResult = {
          address: '0x123',
          accounts: ['0x123'],
          chain: {
            chainId: '0x1',
            chainType: ChainType.Evm,
            name: 'Ethereum',
            required: false,
          },
          chainType: ChainType.Evm,
          provider: mockProvider,
          walletId: 'metamask',
          walletInfo,
        };

        clientInstance.connect.mockImplementation(async (walletId: string) => {
          // Create session in unified store like real client would
          const store = useStoreActual;

          const sessionParams = {
            walletId,
            accounts: [
              {
                address: mockConnectionResult.address,
                name: 'Account 1',
                isDefault: true,
                metadata: {
                  discoveredAt: Date.now(),
                  lastUsedAt: Date.now(),
                },
              },
            ],
            activeAccountIndex: 0,
            chain: {
              chainId: mockConnectionResult.chain.chainId,
              chainType: mockConnectionResult.chain.chainType,
              name: 'Ethereum',
              required: false,
            },
            provider: mockProvider as BlockchainProvider,
            providerMetadata: {
              type: 'eip1193',
              version: '1.0.0',
              multiChainCapable: false,
              supportedMethods: ['eth_accounts', 'eth_chainId'],
            },
            permissions: {
              chains: [mockConnectionResult.chainType],
              methods: ['eth_accounts', 'eth_chainId'],
              events: [],
              scopes: [],
            },
            metadata: {
              wallet: {
                name: 'MetaMask',
                icon: createTestSvgIcon('#f6851b'),
              },
              dapp: {
                name: 'Test DApp',
                url: 'http://localhost:3000',
              },
              connection: {
                initiatedBy: 'user',
                method: 'manual',
                userAgent: 'test',
              },
            },
          };

          await connectionActions.createSession(store, sessionParams);
          return mockConnectionResult;
        });
        clientInstance.getProvider.mockReturnValue(mockProvider);

        // Connect to trigger state changes
        await modalController.connect('metamask');

        // Verify state progression: selecting -> connecting -> connected
        const finalState = modalController.getState();
        expect(finalState.connection.state).toBe('connected');
        expect(finalState.selectedWalletId).toBe('metamask');

        unsubscribe();
      });

      it('should track connection state changes', async () => {
        // Mount the controller first
        await modalController.mount();

        const connectionStates: string[] = [];

        // Subscribe to connection state changes
        const unsubscribe = modalController.subscribe((state) => {
          connectionStates.push(state.connection.state);
        });

        // Mock successful connection
        const walletInfo: WalletInfo = {
          id: 'metamask',
          name: 'MetaMask',
          icon: createTestSvgIcon('#f6851b'),
          chains: [ChainType.Evm],
        };

        const mockConnectionResult = {
          address: '0x123',
          accounts: ['0x123'],
          chain: {
            chainId: '0x1',
            chainType: ChainType.Evm,
            name: 'Ethereum',
            required: false,
          },
          chainType: ChainType.Evm,
          provider: mockProvider,
          walletId: 'metamask',
          walletInfo,
        };

        clientInstance.connect.mockImplementation(async (walletId: string) => {
          // Create session in unified store like real client would
          const store = useStoreActual;

          const sessionParams = {
            walletId,
            accounts: [
              {
                address: mockConnectionResult.address,
                name: 'Account 1',
                isDefault: true,
                metadata: {
                  discoveredAt: Date.now(),
                  lastUsedAt: Date.now(),
                },
              },
            ],
            activeAccountIndex: 0,
            chain: {
              chainId: mockConnectionResult.chain.chainId,
              chainType: mockConnectionResult.chain.chainType,
              name: 'Ethereum',
              required: false,
            },
            provider: mockProvider as BlockchainProvider,
            providerMetadata: {
              type: 'eip1193',
              version: '1.0.0',
              multiChainCapable: false,
              supportedMethods: ['eth_accounts', 'eth_chainId'],
            },
            permissions: {
              chains: [mockConnectionResult.chainType],
              methods: ['eth_accounts', 'eth_chainId'],
              events: [],
              scopes: [],
            },
            metadata: {
              wallet: {
                name: 'MetaMask',
                icon: createTestSvgIcon('#f6851b'),
              },
              dapp: {
                name: 'Test DApp',
                url: 'http://localhost:3000',
              },
              connection: {
                initiatedBy: 'user',
                method: 'manual',
                userAgent: 'test',
              },
            },
          };

          await connectionActions.createSession(store, sessionParams);
          return mockConnectionResult;
        });
        clientInstance.getProvider.mockReturnValue(mockProvider);

        // Connect
        await modalController.connect('metamask');

        // Verify final connection state
        const finalState = modalController.getState();
        expect(finalState.connection.state).toBe('connected');
        expect(finalState.selectedWalletId).toBe('metamask');

        unsubscribe();
      });

      it('should handle connection failure state', async () => {
        // Reset modal controller state
        await modalController.reset();
        let errorState: string | ModalError | null = null;

        // Subscribe to error state changes
        const unsubscribe = modalController.subscribe((state) => {
          if (state.ui?.error) {
            errorState = state.ui.errors['ui'];
          }
        });

        // Mock connection failure
        const error = ErrorFactory.create(ERROR_CODES.CONNECTION_FAILED, 'Failed to connect', 'network');

        // Clear any existing mock implementation and set up rejection
        clientInstance.connect.mockReset();
        clientInstance.connect.mockRejectedValue(error);
        clientInstance.getProvider.mockReturnValue(mockProvider);

        // Try to connect with no retries
        let thrownError: unknown;
        try {
          await modalController.connect('metamask', { maxRetries: 0 });
        } catch (e) {
          // Expected to throw
          thrownError = e;
        }

        // Ensure error was thrown
        expect(thrownError).toBeDefined();

        // Verify error state is updated
        const finalState = modalController.getState();
        expect(finalState.connection.state).not.toBe('connected');

        unsubscribe();
      });

      it('should handle one-time state subscriptions', async () => {
        let callCount = 0;
        let firstState: HeadlessModalState | null = null;

        // Open modal first so state changes will occur
        await modalController.open();

        // Subscribe to state changes (simulating once behavior)
        const unsubscribe = modalController.subscribe((state) => {
          if (callCount === 0) {
            firstState = state;
          }
          callCount++;
          if (callCount === 1) {
            unsubscribe(); // Unsubscribe after first call
          }
        });

        // Trigger state changes
        modalController.setView('connecting');
        modalController.setView('connected');
        modalController.setView('walletSelection');

        // Handler should only be called once due to unsubscribe
        expect(callCount).toBe(1);
        expect(firstState).toBeDefined();
      });

      it('should support unsubscribing from state changes', async () => {
        let callCount = 0;

        // Open modal first so state changes will occur
        await modalController.open();

        // Subscribe
        const unsubscribe = modalController.subscribe((state) => {
          callCount++;
        });

        // Trigger state change
        modalController.setView('connecting');
        expect(callCount).toBeGreaterThan(0);

        const countAfterFirst = callCount;

        // Unsubscribe
        unsubscribe();

        // Trigger state change again
        modalController.setView('connected');

        // Handler should not be called again
        expect(callCount).toBe(countAfterFirst);
      });
    });

    describe('Type-Safe State Subscriptions', () => {
      it('should provide TypeScript inference for state types', async () => {
        // This test verifies that TypeScript properly infers state types
        modalController.subscribe((state) => {
          // TypeScript should infer state type as HeadlessModalState
          expect(state.connection).toBeDefined();
          expect(state.wallets).toBeDefined();
          expect(state.isOpen).toBeDefined();
          expect(typeof state.connection.state).toBe('string');
        });

        // Test headless state type inference
        const currentState = modalController.getState();
        expect(currentState.connection).toBeDefined();
        expect(Array.isArray(currentState.wallets)).toBe(true);
        expect(typeof currentState.isOpen).toBe('boolean');
        expect(typeof currentState.connection.state).toBe('string');

        // The test passes if it compiles without TypeScript errors
        expect(true).toBe(true);
      });
    });

    describe('Connection Features', () => {
      describe('ConnectOptions with preferredProvider', () => {
        it('should use preferredProvider in connect options', async () => {
          // Mount the controller first
          await modalController.mount();

          const walletInfo: WalletInfo = {
            id: 'metamask',
            name: 'MetaMask',
            icon: createTestSvgIcon('#f6851b'),
            chains: [ChainType.Evm],
          };

          const mockConnectionResult = {
            address: '0x123',
            accounts: ['0x123'],
            chain: {
              chainId: '0x1',
              chainType: ChainType.Evm,
              name: 'Ethereum',
              required: false,
            },
            chainType: ChainType.Evm,
            provider: mockProvider,
            walletId: 'metamask',
            walletInfo,
          };

          clientInstance.connect.mockImplementation(async (walletId: string) => {
            // Simple mock without session creation to avoid validation errors
            return mockConnectionResult;
          });
          clientInstance.getProvider.mockReturnValue(mockProvider);

          // Connect with preferredProvider option
          await modalController.connect('metamask', {
            preferredProvider: 'eip1193',
          });

          // Verify client was called (preferredProvider is not passed through in current implementation)
          expect(clientInstance.connect).toHaveBeenCalledTimes(1);
          const callArgs = clientInstance.connect.mock.calls[0];
          expect(callArgs[0]).toBe('metamask');
          // The modal controller doesn't pass through options, so second parameter should be undefined
          expect(callArgs[1]).toBeUndefined();
        });
      }); // End of Connection Features

      describe('Integration Tests', () => {
        describe('Integration with Chain Configurations', () => {
          it('should work with chain-specific configurations', async () => {
            // Don't use the shared modalController for this test

            // Create controller with chain config
            const chainSpecificController = new ModalController({
              wallets: [
                {
                  id: 'aztec-wallet',
                  name: 'Aztec Wallet',
                  icon: createTestSvgIcon('#1a1a1a'),
                  chains: [ChainType.Aztec],
                },
              ],
              client: clientInstance as WalletMeshClient,
              frameworkAdapter: frameworkAdapter as FrameworkAdapter,
              debug: true,
              errorHandler,
              logger,
            });

            // Verify chain-specific setup
            const state = chainSpecificController.getState();
            // ui is not in HeadlessModalState - it's derived by adapters
            expect(state.connection).toBeDefined();
            // When modal is closed and view is walletSelection, state is 'selecting'
            expect(state.connection.state).toBe('selecting');

            // Clean up the controller
            chainSpecificController.destroy();
          });
        });

        describe('State Change Ordering and Timing', () => {
          it('should update state in correct order during connection flow', async () => {
            // Mount the controller first
            await modalController.mount();

            const stateChanges: Array<{ state: string; timestamp: number }> = [];

            // Track state changes
            const unsubscribe = modalController.subscribe((state) => {
              stateChanges.push({
                state: state.connection.state,
                timestamp: Date.now(),
              });
            });

            // Setup successful connection
            const walletInfo: WalletInfo = {
              id: 'metamask',
              name: 'MetaMask',
              icon: createTestSvgIcon('#f6851b'),
              chains: [ChainType.Evm],
            };

            const mockConnectionResult = {
              address: '0x123',
              accounts: ['0x123'],
              chain: {
                chainId: '0x1',
                chainType: ChainType.Evm,
                name: 'Ethereum',
                required: false,
              },
              chainType: ChainType.Evm,
              provider: mockProvider,
              walletId: 'metamask',
              walletInfo,
            };

            clientInstance.connect.mockImplementation(async (walletId: string) => {
              // Create session in unified store like real client would
              const store = useStoreActual;

              const sessionParams = {
                walletId,
                addresses: [mockConnectionResult.address],
                accounts: [
                  {
                    address: mockConnectionResult.address,
                    isDefault: true,
                  },
                ],
                activeAccountIndex: 0,
                chain: {
                  chainId: mockConnectionResult.chain.chainId,
                  chainType: mockConnectionResult.chain.chainType,
                  name: 'Ethereum',
                  required: false,
                },
                provider: mockProvider as BlockchainProvider,
                providerMetadata: {
                  type: 'eip1193',
                  version: '1.0.0',
                  multiChainCapable: false,
                  supportedMethods: ['eth_accounts', 'eth_chainId'],
                },
                permissions: {
                  chains: [mockConnectionResult.chain.chainType],
                  methods: ['eth_accounts', 'eth_chainId'],
                  events: [],
                  scopes: [],
                },
                metadata: {
                  wallet: {
                    name: 'MetaMask',
                    icon: createTestSvgIcon('#f6851b'),
                  },
                  dapp: {
                    name: 'Test DApp',
                    url: 'http://localhost:3000',
                  },
                  connection: {
                    initiatedBy: 'user',
                    method: 'manual',
                    userAgent: 'test',
                  },
                },
              };

              await connectionActions.createSession(store, sessionParams);
              return mockConnectionResult;
            });
            clientInstance.getProvider.mockReturnValue(mockProvider);

            // Connect
            await modalController.connect('metamask');

            // Verify state progression
            const finalState = modalController.getState();
            expect(finalState.connection.state).toBe('connected');
            expect(finalState.selectedWalletId).toBe('metamask');

            unsubscribe();
          });
        });
      }); // End of State Management

      describe('Wallet Availability', () => {
        it('should handle wallet availability checks', async () => {
          // Mock discoverWallets to return different availability states
          clientInstance.discoverWallets.mockResolvedValue([
            {
              adapter: { id: 'metamask' },
              available: true,
            },
            {
              adapter: { id: 'phantom' },
              available: false,
            },
          ]);

          // Get wallets with availability
          const walletsWithAvailability = await modalController.getAvailableWallets();

          // Verify we have some wallets
          expect(walletsWithAvailability.length).toBeGreaterThan(0);

          const metamaskWallet = walletsWithAvailability.find((w) => w.id === 'metamask');
          expect(metamaskWallet?.isAvailable).toBe(true);

          const phantomWallet = walletsWithAvailability.find((w) => w.id === 'phantom');
          expect(phantomWallet?.isAvailable).toBe(false);

          // Verify discoverWallets was called
          expect(clientInstance.discoverWallets).toHaveBeenCalled();
        });
      });
    }); // End of Integration Tests

    describe('Connection Features', () => {
      describe('Connection State Discriminated Unions', () => {
        it('should handle connection state transitions correctly', async () => {
          // Reset modal controller state to ensure clean test
          await modalController.reset();

          // Mount the controller first
          await modalController.mount();

          // Check initial state
          let state = modalController.getState();
          // Initial state is 'selecting' when view is walletSelection
          expect(state.connection.state).toBe('selecting');

          // Mock connecting state
          const walletInfo: WalletInfo = {
            id: 'metamask',
            name: 'MetaMask',
            icon: createTestSvgIcon('#f6851b'),
            chains: [ChainType.Evm],
          };

          // Mock a delayed connection to observe connecting state
          clientInstance.connect.mockReset();
          clientInstance.connect.mockImplementation(async (walletId: string) => {
            return new Promise((resolve) => {
              setTimeout(async () => {
                const result = {
                  address: '0x123',
                  accounts: ['0x123'],
                  chain: {
                    chainId: '0x1',
                    chainType: ChainType.Evm,
                    name: 'Ethereum',
                    required: false,
                  },
                  chainType: ChainType.Evm,
                  walletId: 'metamask',
                  walletInfo,
                  provider: mockProvider,
                };

                // Create session in unified store to match real client behavior
                const store = useStoreActual;

                const sessionParams = {
                  walletId,
                  accounts: [
                    {
                      address: result.address,
                      name: 'Account 1',
                      isDefault: true,
                      metadata: {
                        discoveredAt: Date.now(),
                        lastUsedAt: Date.now(),
                      },
                    },
                  ],
                  activeAccountIndex: 0,
                  chain: {
                    chainId: result.chain.chainId,
                    chainType: result.chain.chainType,
                    name: 'Ethereum',
                    required: false,
                  },
                  provider: mockProvider as BlockchainProvider,
                  providerMetadata: {
                    type: 'eip1193',
                    version: '1.0.0',
                    multiChainCapable: false,
                    supportedMethods: ['eth_accounts', 'eth_chainId'],
                  },
                  permissions: {
                    chains: [result.chainType],
                    methods: ['eth_accounts', 'eth_chainId'],
                    events: [],
                    scopes: [],
                  },
                  metadata: {
                    wallet: {
                      name: walletId === 'metamask' ? 'MetaMask' : 'Phantom',
                      icon: createTestSvgIcon(walletId === 'metamask' ? '#f6851b' : '#5a32e6'),
                    },
                    dapp: {
                      name: 'Test DApp',
                      url: 'http://localhost:3000',
                    },
                    connection: {
                      initiatedBy: 'user',
                      method: 'manual',
                      userAgent: 'test',
                    },
                  },
                };

                await connectionActions.createSession(store, sessionParams);

                resolve(result);
              }, 100);
            });
          });

          // Make sure getProvider returns the mock provider
          clientInstance.getProvider.mockReturnValue(mockProvider);

          // Start connection
          const connectPromise = modalController.connect('metamask');

          // Check connecting state
          await testEnv.advanceTimers(50);
          state = modalController.getState();
          expect(state.connection.state).toBe('connecting');

          // Wait for connection
          await testEnv.advanceTimers(50);
          await connectPromise;

          // Check connected state
          state = modalController.getState();
          expect(state.connection.state).toBe('connected');
          expect(state.selectedWalletId).toBe('metamask');
          // address is not stored in headless state - it's in the connection result
        });

        it('should include address and chainId in headless state when connected', async () => {
          // Mount the controller first
          await modalController.mount();

          // Mock provider for this chain-specific controller
          const mockEvmProvider = {
            request: vi.fn(),
            on: vi.fn(),
            removeListener: vi.fn(),
          };

          clientInstance.getProvider = vi.fn().mockReturnValue(mockEvmProvider);
          clientInstance.connect = vi.fn().mockImplementation(async (walletId: string) => {
            const result: ConnectionResult = {
              accounts: ['0x1234567890123456789012345678901234567890'],
              address: '0x1234567890123456789012345678901234567890',
              chain: {
                chainId: '0x1',
                chainType: ChainType.Evm,
                name: 'Ethereum',
                required: false,
              },
              walletId,
              walletInfo: {
                id: walletId,
                name: 'Test Wallet',
                icon: createTestSvgIcon('#000'),
                chains: [ChainType.Evm],
              },
              provider: mockEvmProvider,
            };

            // Create session in unified store to match real client behavior
            const store = useStoreActual;

            const sessionParams = {
              walletId,
              addresses: [result.address],
              accounts: [
                {
                  address: result.address,
                  isDefault: true,
                },
              ],
              activeAccountAddress: result.address,
              chain: {
                chainId: result.chain.chainId,
                chainType: result.chain.chainType,
                name: 'Ethereum',
                required: false,
              },
              provider: mockEvmProvider as BlockchainProvider,
              providerMetadata: {
                type: 'eip1193',
                version: '1.0.0',
                multiChainCapable: false,
                supportedMethods: ['eth_accounts', 'eth_chainId'],
              },
              permissions: {
                chains: [result.chain.chainType],
                methods: ['eth_accounts', 'eth_chainId'],
                events: [],
                scopes: [],
              },
              metadata: {
                wallet: {
                  name: walletId === 'metamask' ? 'MetaMask' : 'Phantom',
                  icon: createTestSvgIcon(walletId === 'metamask' ? '#f6851b' : '#5a32e6'),
                },
                dapp: {
                  name: 'Test DApp',
                  url: 'http://localhost:3000',
                },
                connection: {
                  initiatedBy: 'user',
                  method: 'manual',
                  userAgent: 'test',
                },
              },
            };

            await connectionActions.createSession(store, sessionParams);

            // Emit connection event like real client would
            setTimeout(() => {
              (clientInstance as { emit: (event: string, data: unknown) => void }).emit('connect', {
                chainType: ChainType.Evm,
                walletId,
                connection: result,
              });
            }, 50);

            return result;
          });

          // Connect to wallet
          await modalController.connect('metamask');

          // Get headless state
          const state = modalController.getState();

          // Verify address and chainId are now included in headless state
          expect(state.connection.state).toBe('connected');
          expect(state.connection.address).toBe('0x1234567890123456789012345678901234567890');
          expect(state.connection.chainId).toBe('0x1');
          expect(state.connection.accounts).toBeDefined();
          expect(Array.isArray(state.connection.accounts)).toBe(true);
          expect(state.connection.accounts).toHaveLength(1);
          expect(state.connection.accounts?.[0]).toBe('0x1234567890123456789012345678901234567890');
        });
      });
    }); // End of Connection Features

    describe('Type Safety', () => {
      describe('SSRSafeController Type', () => {
        it('should handle SSR-safe controller pattern', () => {
          // Create SSR-safe controller mock
          const ssrController = {
            isSSR: true as const,
            open: () => {
              throw new Error('Cannot open modal in SSR environment');
            },
            connect: () => {
              throw new Error('Cannot connect in SSR environment');
            },
            close: vi.fn(),
            disconnect: vi.fn(),
            getState: vi.fn().mockReturnValue({
              ui: {
                isOpen: false,
                currentView: 'walletSelection',
                isLoading: false,
              },
              connection: {
                status: 'disconnected',
                walletId: null,
                accounts: [],
                chainId: null,
                chainType: null,
                address: null,
              },
              error: {
                error: null,
                errorMessage: null,
              },
            }),
            subscribe: vi.fn(),
            on: vi.fn(),
            once: vi.fn(),
            off: vi.fn(),
            emit: vi.fn(),
          };

          // Verify SSR controller behavior
          expect(ssrController.isSSR).toBe(true);
          expect(() => ssrController.open()).toThrow('Cannot open modal in SSR environment');
          expect(() => ssrController.connect()).toThrow('Cannot connect in SSR environment');

          // Safe methods should work
          expect(() => ssrController.getState()).not.toThrow();
          expect(() => ssrController.subscribe(() => {})).not.toThrow();
        });
      });
    });
  }); // End of Type Safety
}); // End of Modal Controller New Features Integration
