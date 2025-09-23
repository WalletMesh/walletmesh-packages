/**
 * Core tests for ModalController
 * Tests the main functionality of the modal controller including:
 * - Modal lifecycle (open/close)
 * - Wallet connection flow
 * - State management
 * - Event handling
 * - Configuration options
 */

import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { BlockchainProvider } from '../../api/types/chainProviders.js';
import { connectionActions } from '../../state/actions/connections.js';
import {
  createMockClient,
  createMockConnectionScenario,
  createMockErrorHandler,
  // createMockFrameworkAdapter, // Framework adapters removed
  createMockLogger,
  createMockModalController,
  createMockRegistry,
  createTestEnvironment,
  createTestStore,
  createTypedMock,
  installCustomMatchers,
  mockValidation,
} from '../../testing/index.js';
import { ChainType, type WalletInfo } from '../../types.js';
import type { ModalController as ModalControllerType } from '../../types.js';
import type { InternalWalletMeshClient, WalletMeshClient } from '../client/WalletMeshClient.js';
import { ErrorFactory } from '../core/errors/errorFactory.js';
import { ERROR_CODES } from '../core/errors/types.js';
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

describe('ModalController - Core Functionality', () => {
  let mockClient: Partial<WalletMeshClient>;
  // let mockFrameworkAdapter: ReturnType<typeof createMockFrameworkAdapter>; // Framework adapters removed
  let mockErrorHandler: ReturnType<typeof createMockErrorHandler>;
  let mockLogger: ReturnType<typeof createMockLogger>;
  let controller: ModalController;
  let useStoreActual: typeof import('../../state/store.js').useStore;
  const testEnv = createTestEnvironment();

  const mockWallets: WalletInfo[] = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: createTestSvgIcon('#f6851b'),
      chains: [ChainType.Evm],
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: createTestSvgIcon('#3b99fc'),
      chains: [ChainType.Evm],
    },
  ];

  beforeAll(async () => {
    // Import actual unified store to avoid mock conflicts and freezing issues
    const storeModule = await vi.importActual('../../state/store.js');
    const typedModule = storeModule as typeof import('../../state/store.js');
    useStoreActual = typedModule.useStore;
  });

  beforeEach(async () => {
    await testEnv.setup();
    vi.clearAllMocks();

    // Clear any existing sessions from the store to prevent test interference
    if (useStoreActual) {
      useStoreActual.setState((state) => ({
        ...state,
        connections: {
          ...state.connections,
          activeSessions: [],
          activeSessionId: null,
        },
      }));
    }

    // Mock client matching InternalWalletMeshClient interface
    mockClient = createTypedMock<InternalWalletMeshClient>({
      connect: vi.fn().mockImplementation(async (walletId: string) => {
        const result = {
          address: '0x123',
          accounts: ['0x123'],
          chainId: '0x1',
          chainType: ChainType.Evm,
          provider: {},
          walletId,
          walletInfo: {
            id: walletId,
            name: 'MetaMask',
            icon: createTestSvgIcon('#f6851b'),
            chains: ['evm' as ChainType],
          },
        };

        // Create the session directly in the store we already have access to
        await connectionActions.createSession(useStoreActual, {
          walletId,
          addresses: [result.address],
          accounts: [{ address: result.address, isDefault: true }],
          activeAccountAddress: result.address,
          chain: {
            chainId: result.chainId,
            chainType: ChainType.Evm,
            name: 'Test Chain',
            required: false,
          },
          provider: result.provider as BlockchainProvider,
          providerMetadata: {
            type: 'injected',
            version: '1.0.0',
            multiChainCapable: false,
            supportedMethods: [],
          },
          permissions: {
            chains: [ChainType.Evm],
            methods: ['eth_accounts', 'eth_chainId'],
            events: [],
          },
          metadata: {
            wallet: {
              name: 'MetaMask',
              icon: createTestSvgIcon('#f6851b'),
            },
          },
        });

        return result;
      }),
      disconnect: vi.fn().mockResolvedValue(undefined),
      disconnectAll: vi.fn().mockResolvedValue(undefined),
      getConnection: vi.fn(),
      getConnections: vi.fn().mockReturnValue([]),
      getAllConnections: vi.fn().mockReturnValue([]),
      discoverWallets: vi.fn().mockResolvedValue([
        {
          adapter: { id: 'metamask' },
          available: true,
        },
      ]),
      getWallet: vi.fn(),
      getAllWallets: vi.fn().mockReturnValue([]),
      on: vi.fn(),
      openModal: vi.fn().mockResolvedValue(undefined),
      closeModal: vi.fn(),
      modal: createMockModalController(),
      registry: createMockRegistry(),
      isConnected: false,
      destroy: vi.fn(),
    });

    // Create mocks using testing utilities
    // mockFrameworkAdapter = createMockFrameworkAdapter(); // Framework adapters removed
    mockErrorHandler = createMockErrorHandler();
    mockLogger = createMockLogger();

    // Create controller instance
    controller = new ModalController({
      wallets: mockWallets,
      client: mockClient as InternalWalletMeshClient,
      // frameworkAdapter: removed
      errorHandler: mockErrorHandler,
      logger: mockLogger,
    });
  });

  afterEach(async () => {
    if (controller) {
      controller.destroy();
    }
    await testEnv.teardown();
    vi.restoreAllMocks();
  });

  describe('Modal Lifecycle', () => {
    it('should open the modal', async () => {
      // Mount the controller first so it can render
      await controller.mount();
      await controller.open();

      // Check that debug was called with Modal opened (may not be the first call)
      expect(mockLogger.debug).toHaveBeenCalledWith('Modal opened');
      // Framework adapter render should be called during mount or subscription updates
      // expect(mockFrameworkAdapter.render).toHaveBeenCalled(); // Framework adapters removed
    });

    it('should close the modal', () => {
      controller.close();

      expect(mockLogger.debug).toHaveBeenCalledWith('Modal closed');
    });

    it('should handle onBeforeOpen hook that returns true', async () => {
      const onBeforeOpen = vi.fn().mockResolvedValue(true);
      const controllerWithHook = new ModalController({
        wallets: mockWallets,
        client: mockClient as InternalWalletMeshClient,
        // frameworkAdapter: removed
        errorHandler: mockErrorHandler,
        logger: mockLogger,
        onBeforeOpen,
      });

      await controllerWithHook.mount();
      await controllerWithHook.open();

      expect(onBeforeOpen).toHaveBeenCalled();
      // expect(mockFrameworkAdapter.render).toHaveBeenCalled(); // Framework adapters removed

      controllerWithHook.destroy();
    });

    it('should cancel opening if onBeforeOpen returns false', async () => {
      const onBeforeOpen = vi.fn().mockResolvedValue(false);
      const controllerWithHook = new ModalController({
        wallets: mockWallets,
        client: mockClient as InternalWalletMeshClient,
        // frameworkAdapter: removed
        errorHandler: mockErrorHandler,
        logger: mockLogger,
        onBeforeOpen,
      });

      await controllerWithHook.open();

      expect(onBeforeOpen).toHaveBeenCalled();
      // expect(mockFrameworkAdapter.render).not.toHaveBeenCalled(); // Framework adapters removed
      expect(mockLogger.debug).toHaveBeenCalledWith('Modal open cancelled by onBeforeOpen hook');

      controllerWithHook.destroy();
    });

    it('should call onAfterOpen hook', async () => {
      const onAfterOpen = vi.fn().mockResolvedValue(undefined);
      const controllerWithHook = new ModalController({
        wallets: mockWallets,
        client: mockClient as InternalWalletMeshClient,
        // frameworkAdapter: removed
        errorHandler: mockErrorHandler,
        logger: mockLogger,
        onAfterOpen,
      });

      await controllerWithHook.open();

      expect(onAfterOpen).toHaveBeenCalled();

      controllerWithHook.destroy();
    });

    it('should handle errors during open', async () => {
      const error = new Error('Open failed');
      const controllerWithError = new ModalController({
        wallets: mockWallets,
        client: mockClient as InternalWalletMeshClient,
        // frameworkAdapter: removed
        errorHandler: mockErrorHandler,
        logger: mockLogger,
        onBeforeOpen: () => {
          throw error;
        },
      });

      await expect(controllerWithError.open()).rejects.toThrow('Open failed');

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Open failed',
        }),
        expect.objectContaining({
          operation: 'ModalController.open',
        }),
      );

      controllerWithError.destroy();
    });
  });

  describe('Wallet Connection', () => {
    it('should connect to a wallet', async () => {
      const result = await controller.connect('metamask');

      expect(mockClient.connect).toHaveBeenCalledWith('metamask');
      // Check individual properties to avoid object freezing issues
      expect(result.address).toBe('0x123');
      expect(result.accounts).toHaveLength(1);
      expect(result.accounts[0]).toBe('0x123');
      expect(result.chain.chainId).toBe('0x1');
      expect(result.walletId).toBe('metamask');
      expect(result.walletInfo?.id).toBe('metamask');
      expect(result.walletInfo?.name).toBe('MetaMask');
    });

    it('should update state when connecting', async () => {
      await controller.connect('metamask');

      const state = controller.getState();
      expect(state.connection.state).toBe('connected');
      expect(state.selectedWalletId).toBe('metamask');
      // accounts are not stored in headless state - they're in the connection result
    });

    it('should handle connection errors', async () => {
      const error = ErrorFactory.connectionFailed('Connection failed');

      // Create a new controller with a mock client that rejects
      const errorMockClient = createTypedMock<InternalWalletMeshClient>({
        ...mockClient,
        connect: vi.fn().mockRejectedValue(error),
      });

      const errorController = new ModalController({
        wallets: mockWallets,
        client: errorMockClient as InternalWalletMeshClient,
        errorHandler: mockErrorHandler,
        logger: mockLogger,
      });

      // Use fake timers to control retry timing
      vi.useFakeTimers();

      // Create and immediately handle the promise to avoid unhandled rejection
      const connectPromise = errorController.connect('metamask', { maxRetries: 0 }).catch((e) => e);

      // Advance timers to handle any internal delays
      await vi.runAllTimersAsync();

      // Now check that it rejected with the expected error
      const result = await connectPromise;
      expect(result).toBe(error);

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          operation: 'general',
          extra: expect.objectContaining({
            context: 'modal-controller',
          }),
        }),
      );

      errorController.destroy();
      vi.useRealTimers();
    });

    it('should handle connection failure without retry (controller delegates to client)', async () => {
      const error = ErrorFactory.connectionFailed('Network error');

      // Create a new controller with a mock client that rejects
      const errorMockClient = createTypedMock<InternalWalletMeshClient>({
        ...mockClient,
        connect: vi.fn().mockRejectedValue(error),
      });

      const errorController = new ModalController({
        wallets: mockWallets,
        client: errorMockClient as InternalWalletMeshClient,
        errorHandler: mockErrorHandler,
        logger: mockLogger,
      });

      await expect(errorController.connect('metamask')).rejects.toThrow();

      // Controller calls client once (no retry logic in controller)
      expect(errorMockClient.connect).toHaveBeenCalledTimes(1);
      expect(errorMockClient.connect).toHaveBeenCalledWith('metamask');

      errorController.destroy();
    });

    it('should not retry on user rejection', async () => {
      const error = ErrorFactory.create(ERROR_CODES.USER_REJECTED, 'User rejected', 'user');

      // Create a new controller with a mock client that rejects
      const errorMockClient = createTypedMock<InternalWalletMeshClient>({
        ...mockClient,
        connect: vi.fn().mockRejectedValue(error),
      });

      const errorController = new ModalController({
        wallets: mockWallets,
        client: errorMockClient as InternalWalletMeshClient,
        errorHandler: mockErrorHandler,
        logger: mockLogger,
      });

      await expect(errorController.connect('metamask', { maxRetries: 3 })).rejects.toThrow();

      expect(errorMockClient.connect).toHaveBeenCalledTimes(1);

      errorController.destroy();
    });

    it('should disconnect from wallet', async () => {
      // First connect to have a walletId in state
      await controller.connect('metamask');

      await controller.disconnect('metamask');

      // Verify the session was ended through unified store, not through client
      const state = controller.getState();
      expect(state.connection.state).toBe('selecting');
    });

    it('should update state when disconnecting', async () => {
      // First connect
      await controller.connect('metamask');

      // Then disconnect
      await controller.disconnect('metamask');

      const state = controller.getState();
      expect(state.connection.state).toBe('selecting');
      expect(state.selectedWalletId).toBeUndefined();
      // accounts are not stored in headless state
    });

    it('should handle disconnect through session manager', async () => {
      // First connect to have a walletId in state
      await controller.connect('metamask');

      await controller.disconnect('metamask');

      // Session should be ended through unified store
      const state = controller.getState();
      expect(state.connection.state).toBe('selecting');
      expect(state.selectedWalletId).toBeUndefined();
    });

    it('should auto-close modal after connection if configured', async () => {
      vi.useFakeTimers();

      const controllerWithAutoClose = new ModalController({
        wallets: mockWallets,
        client: mockClient as InternalWalletMeshClient,
        // frameworkAdapter: removed
        errorHandler: mockErrorHandler,
        logger: mockLogger,
        autoCloseDelay: 1000,
      });

      await controllerWithAutoClose.connect('metamask');

      vi.advanceTimersByTime(1000);

      expect(mockLogger.debug).toHaveBeenCalledWith('Modal closed');

      vi.useRealTimers();
      controllerWithAutoClose.destroy();
    });
  });

  describe('Client Event Handling', () => {
    it('should update state on connection', async () => {
      // Connection state is now updated directly in the connect method
      await controller.connect('metamask');

      const state = controller.getState();
      // accounts are not stored in headless state - they're in the connection result
      expect(state.selectedWalletId).toBe('metamask');
      expect(state.connection.state).toBe('connected');
    });

    it('should update state on disconnection', async () => {
      // First connect
      await controller.connect('metamask');

      // Then disconnect
      await controller.disconnect('metamask');

      const state = controller.getState();
      expect(state.connection.state).toBe('selecting');
      expect(state.selectedWalletId).toBeUndefined();
    });
  });

  describe('State Management', () => {
    it('should get current state', () => {
      const state = controller.getState();

      expect(state.connection).toBeDefined();
      expect(state.wallets).toBeDefined();
      expect('selectedWalletId' in state).toBe(true);
      expect(state.isOpen).toBeDefined();
      // events are not part of HeadlessModalState - they're on the controller itself
    });
  });

  describe('Configuration', () => {
    it('should accept configuration during construction', () => {
      const customController = new ModalController({
        wallets: mockWallets,
        client: mockClient as InternalWalletMeshClient,
        // frameworkAdapter: removed
        errorHandler: mockErrorHandler,
        logger: mockLogger,
        autoCloseDelay: 2000,
        debug: true,
      });

      expect(customController).toBeDefined();
      customController.destroy();
    });

    it('should handle default configuration values', () => {
      // The controller should work with minimal configuration
      expect(controller).toBeDefined();
    });
  });

  describe('View Actions', () => {
    it('should handle connect action', async () => {
      // Modal-core is now headless - test direct connect method instead of UI actions
      const testController = new ModalController({
        wallets: mockWallets,
        client: mockClient as InternalWalletMeshClient,
        // frameworkAdapter: removed
        errorHandler: mockErrorHandler,
        logger: mockLogger,
      });

      await testController.mount();
      await testController.open();

      // Directly call connect instead of UI action
      await testController.connect('metamask');

      expect(mockClient.connect).toHaveBeenCalledWith('metamask');

      testController.destroy();
    });

    it('should handle disconnect action', async () => {
      vi.useFakeTimers();

      // Modal-core is now headless - test direct disconnect method instead of UI actions
      const testController = new ModalController({
        wallets: mockWallets,
        client: mockClient as InternalWalletMeshClient,
        // frameworkAdapter: removed
        errorHandler: mockErrorHandler,
        logger: mockLogger,
      });

      await testController.mount();
      await testController.open();

      // First connect to have something to disconnect
      await testController.connect('metamask');

      // Call disconnect directly instead of UI action
      const disconnectPromise = testController.disconnect('metamask');

      // Process any pending timers
      await vi.runAllTimersAsync();

      // Wait for the disconnect to complete
      await disconnectPromise;

      // Verify session was ended through unified store
      const state = testController.getState();
      expect(state.connection.state).toBe('selecting');

      testController.destroy();
      vi.useRealTimers();
    });

    it('should handle close action', async () => {
      // Modal-core is now headless - test direct close method instead of UI actions
      const testController = new ModalController({
        wallets: mockWallets,
        client: mockClient as InternalWalletMeshClient,
        // frameworkAdapter: removed
        errorHandler: mockErrorHandler,
        logger: mockLogger,
      });

      await testController.mount();
      await testController.open();

      // Directly call close instead of UI action
      testController.close();

      // Modal should be closed through unified store
      const state = testController.getState();
      expect(state.isOpen).toBe(false);

      testController.destroy();
    });

    it('should handle selectWallet action', async () => {
      // Modal-core is now headless - test direct connect method instead of UI actions
      const testController = new ModalController({
        wallets: mockWallets,
        client: mockClient as InternalWalletMeshClient,
        // frameworkAdapter: removed
        errorHandler: mockErrorHandler,
        logger: mockLogger,
      });

      await testController.mount();
      await testController.open();

      // Directly call connect instead of UI action
      await testController.connect('metamask');

      // Verify connect was called on the client
      expect(mockClient.connect).toHaveBeenCalledWith('metamask');

      testController.destroy();
    });

    it('should handle view changes through state', async () => {
      // Modal-core is now headless - views are managed through state, not UI actions
      const testController = new ModalController({
        wallets: mockWallets,
        client: mockClient as InternalWalletMeshClient,
        // frameworkAdapter: removed
        errorHandler: mockErrorHandler,
        logger: mockLogger,
      });

      await testController.mount();
      await testController.open();

      // Views are now handled through state - verify state is accessible
      const state = testController.getState();
      expect(state).toBeDefined();
      // Check for the actual state structure that exists
      expect(state.isOpen).toBe(true);

      testController.destroy();
    });

    it('should handle invalid operations gracefully', async () => {
      // Modal-core is now headless - test invalid method calls instead of UI actions
      const testController = new ModalController({
        wallets: mockWallets,
        client: mockClient as InternalWalletMeshClient,
        // frameworkAdapter: removed
        errorHandler: mockErrorHandler,
        logger: mockLogger,
      });

      await testController.mount();
      await testController.open();

      // Test calling disconnect on non-existent wallet
      await expect(testController.disconnect('nonexistent-wallet')).resolves.not.toThrow();

      testController.destroy();
    });
  });

  describe('Cleanup', () => {
    it('should destroy the controller', async () => {
      // First open the modal to ensure it's mounted
      await controller.open();

      controller.destroy();

      expect(mockLogger.debug).toHaveBeenCalledWith('Modal unmounted successfully');
      // expect(mockFrameworkAdapter.destroy).toHaveBeenCalled(); // Framework adapters removed
    });

    it('should unsubscribe from client events on destroy', () => {
      const unsubscribe = vi.fn();
      mockClient.on = vi.fn().mockReturnValue(unsubscribe);

      const newController = new ModalController({
        wallets: mockWallets,
        client: mockClient as InternalWalletMeshClient,
        // frameworkAdapter: removed
        errorHandler: mockErrorHandler,
        logger: mockLogger,
      });

      newController.destroy();

      // Should clean up subscriptions
      expect(mockLogger.debug).toHaveBeenCalledWith('Modal unmounted successfully');
    });
  });

  describe('Error Handling', () => {
    it('should handle errors with showError option', async () => {
      const error = ErrorFactory.connectionFailed('Test error');

      // Create a new controller with a mock client that rejects
      const errorMockClient = createTypedMock<InternalWalletMeshClient>({
        ...mockClient,
        connect: vi.fn().mockRejectedValue(error),
      });

      const errorController = new ModalController({
        wallets: mockWallets,
        client: errorMockClient as InternalWalletMeshClient,
        errorHandler: mockErrorHandler,
        logger: mockLogger,
      });

      // Use fake timers to control retry timing
      vi.useFakeTimers();

      // Create and immediately handle the promise to avoid unhandled rejection
      const connectPromise = errorController.connect('metamask', { showError: true }).catch((e) => e);

      // Advance timers to handle any internal delays
      await vi.runAllTimersAsync();

      // Check that it rejected with the expected error
      const result = await connectPromise;
      expect(result).toBe(error);

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          operation: 'general',
          extra: expect.objectContaining({
            context: 'modal-controller',
          }),
        }),
      );

      errorController.destroy();
      vi.useRealTimers();
    });

    it('should suppress errors from UI with showError false', async () => {
      const error = ErrorFactory.connectionFailed('Test error');

      // Create a new controller with a mock client that rejects
      const errorMockClient = createTypedMock<InternalWalletMeshClient>({
        ...mockClient,
        connect: vi.fn().mockRejectedValue(error),
      });

      const errorController = new ModalController({
        wallets: mockWallets,
        client: errorMockClient as InternalWalletMeshClient,
        errorHandler: mockErrorHandler,
        logger: mockLogger,
      });

      // Use fake timers to control retry timing
      vi.useFakeTimers();

      // Create and immediately handle the promise to avoid unhandled rejection
      const connectPromise = errorController.connect('metamask', { showError: false }).catch((e) => e);

      // Advance timers to handle any internal delays
      await vi.runAllTimersAsync();

      // Check that it rejected with the expected error
      const result = await connectPromise;
      expect(result).toBe(error);

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          operation: 'general',
          extra: expect.objectContaining({
            context: 'modal-controller',
          }),
        }),
      );

      errorController.destroy();
      vi.useRealTimers();
    });
  });
});
