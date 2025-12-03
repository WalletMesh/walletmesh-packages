/**
 * createWalletMesh Tests
 *
 * Demonstrates functional workflow testing with nested structure:
 * - Core Factory Functionality (validation, modal creation)
 * - Runtime Environment Handling (SSR mode, edge cases)
 * - Wallet Configuration Patterns (direct info, adapter-based)
 *
 * @group unit
 * @group api
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChainType } from '../../types.js';

// Helper to create a properly structured adapter mock
const createMockAdapter = (id: string, name: string, chainType = 'evm') => {
  return {
    id,
    metadata: {
      name,
      icon: 'data:image/svg+xml,...',
      description: `${name} description`,
    },
    capabilities: {
      chains: [{ type: chainType }],
      permissions: {
        methods: ['*'],
        events: ['accountsChanged', 'chainChanged'],
      },
    },
  };
};

// Type for mock adapter
interface MockAdapter {
  id: string;
  metadata: {
    name: string;
    icon: string;
    description: string;
  };
  capabilities: {
    chains: Array<{ type: string }>;
    permissions?: {
      methods: string[];
      events: string[];
    };
  };
}

// Helper to manage registry state
const createMockRegistryHelper = () => {
  const registeredAdapters: MockAdapter[] = [];

  return {
    registeredAdapters,
    instance: {
      register: vi.fn().mockImplementation((adapter: MockAdapter) => {
        registeredAdapters.push(adapter);
      }),
      detectAvailableAdapters: vi.fn().mockResolvedValue([]),
      getAdapter: vi.fn().mockImplementation((id: string) => {
        return registeredAdapters.find((a) => a.id === id);
      }),
      getAllAdapters: vi.fn().mockImplementation(() => registeredAdapters),
      clear: vi.fn().mockImplementation(() => {
        registeredAdapters.length = 0;
      }),
    },
  };
};

// Create a stable mock instance using testing utilities
let mockRegistryInstance: ReturnType<typeof createMockRegistryHelper>['instance'];

// Mock the WalletMeshClient
vi.mock('../../internal/client/WalletMeshClientImpl.js', () => {
  return {
    WalletMeshClient: vi.fn().mockImplementation((config, registry, modal, logger) => {
      return {
        config,
        registry,
        modal,
        logger,
        connect: vi.fn(),
        disconnect: vi.fn(),
        getConnection: vi.fn(),
        getAllConnections: vi.fn(),
        initializeModalHandlers: vi.fn(),
        switchChain: vi.fn(),
        getState: vi.fn().mockReturnValue({
          connection: { state: 'idle' },
          wallets: [],
          selectedWalletId: undefined,
          isOpen: false,
        }),
        subscribe: vi.fn().mockReturnValue(() => {}),
        on: vi.fn().mockReturnValue(() => {}),
        once: vi.fn().mockReturnValue(() => {}),
        off: vi.fn(),
        getActions: vi.fn().mockReturnValue({
          openModal: vi.fn(),
          closeModal: vi.fn(),
          selectWallet: vi.fn(),
          connect: vi.fn(),
          disconnect: vi.fn(),
          retry: vi.fn(),
        }),
        openModal: vi.fn(),
        closeModal: vi.fn(),
        isConnected: false,
        setActiveWallet: vi.fn(),
        getActiveWallet: vi.fn(),
        getMaxConnections: vi.fn(),
        discoverWallets: vi.fn(),
        getWallet: vi.fn(),
        getAllWallets: vi.fn(),
        destroy: vi.fn(),
      };
    }),
  };
});

// Mock the WalletRegistry with a factory function
vi.mock('../../internal/registries/wallets/WalletRegistry.js', () => {
  return {
    WalletRegistry: vi.fn(() => {
      // Return the mock instance that will be set up in beforeEach
      return (
        mockRegistryInstance || {
          register: vi.fn(),
          detectAvailableAdapters: vi.fn().mockResolvedValue([]),
          getAdapter: vi.fn().mockReturnValue(undefined),
          getAllAdapters: vi.fn().mockReturnValue([]),
          clear: vi.fn(),
        }
      );
    }),
  };
});

vi.mock('../core/modal.js', () => ({
  createModal: vi.fn().mockReturnValue({
    open: vi.fn(),
    close: vi.fn(),
    on: vi.fn(),
    once: vi.fn(),
    off: vi.fn(),
    getState: vi.fn(),
    subscribe: vi.fn().mockReturnValue(() => {}),
    getActions: vi.fn(),
    cleanup: vi.fn(),
  }),
}));

// Framework adapters removed from modal-core

vi.mock('../utilities/ssr.js', () => ({
  isServer: vi.fn().mockReturnValue(false),
  createSSRController: vi.fn().mockReturnValue({
    // CoreWalletMeshClient interface
    getState: vi.fn().mockReturnValue({
      connection: { state: 'idle' },
      wallets: [],
      selectedWalletId: undefined,
      isOpen: false,
    }),
    connect: vi.fn().mockResolvedValue(null),
    disconnect: vi.fn().mockResolvedValue(undefined),
    getConnection: vi.fn().mockReturnValue(null),
    switchChain: vi.fn().mockResolvedValue(undefined),
    on: vi.fn().mockReturnValue(() => {}),
    once: vi.fn().mockReturnValue(() => {}),
    off: vi.fn(),
    // Headless modal
    modal: {
      open: vi.fn(),
      close: vi.fn(),
      state: { connection: { state: 'idle' }, wallets: [], selectedWalletId: undefined, isOpen: false },
      actions: {
        openModal: vi.fn(),
        closeModal: vi.fn(),
        selectWallet: vi.fn(),
        setConnectionState: vi.fn(),
        setConnectionData: vi.fn(),
        setWallets: vi.fn(),
      },
      // on and once methods have been removed - use subscribe instead
      off: vi.fn(),
      subscribe: vi.fn().mockReturnValue(() => {}),
      getActions: vi.fn(),
    },
    // Test property to identify SSR
    isSSR: true,
  }),
}));

vi.mock('../../internal/wallets/evm/EvmAdapter.js', () => ({
  EvmAdapter: class {
    constructor() {
      Object.assign(this, createMockAdapter('evm-wallet', 'EVM Wallet', 'evm'));
    }
  },
}));

vi.mock('../../internal/wallets/mock/MockAdapter.js', () => ({
  MockAdapter: class {
    constructor() {
      Object.assign(this, createMockAdapter('mock-wallet', 'Mock Wallet', 'evm'));
    }
  },
}));

// Now import after mocks are set up
import type { WalletConfig, WalletMeshConfig } from '../../internal/client/WalletMeshClient.js';
import { createTestEnvironment, installCustomMatchers } from '../../testing/index.js';
import type { ModalController } from '../../types.js';
import { createWalletMesh } from './createWalletClient.js';

// Install custom matchers
installCustomMatchers();

describe('createWalletMesh', () => {
  const testEnv = createTestEnvironment();
  let mockCreateModal: ReturnType<typeof vi.fn>;
  let mockIsServer: ReturnType<typeof vi.fn>;
  let mockCreateSSRController: ReturnType<typeof vi.fn>;
  let testId = 0; // Counter to make each test config unique

  // Helper to create unique config for each test to avoid cache conflicts
  const createUniqueConfig = (config: Partial<WalletMeshConfig> = {}): WalletMeshConfig => ({
    appName: `Test App ${testId}`,
    ...config,
  });

  // Helper to manage registry state
  const createMockRegistry = () => {
    const registeredAdapters: MockAdapter[] = [];

    return {
      registeredAdapters,
      instance: {
        register: vi.fn().mockImplementation((adapter: MockAdapter) => {
          registeredAdapters.push(adapter);
        }),
        detectAvailableAdapters: vi.fn().mockResolvedValue([]),
        getAdapter: vi.fn().mockImplementation((id: string) => {
          return registeredAdapters.find((a) => a.id === id);
        }),
        getAllAdapters: vi.fn().mockImplementation(() => registeredAdapters),
        clear: vi.fn().mockImplementation(() => {
          registeredAdapters.length = 0;
        }),
      },
    };
  };

  beforeEach(async () => {
    await testEnv.setup();

    // Clear mocks FIRST
    vi.clearAllMocks();

    // Increment test ID to ensure unique configs
    testId++;

    // Create registry mock
    const mockRegistry = createMockRegistry();
    mockRegistryInstance = mockRegistry.instance;

    // Get mocked functions
    const { createModal } = await import('../core/modal.js');
    const { isServer, createSSRController } = await import('../utilities/ssr.js');
    const { WalletMeshClient } = await import('../../internal/client/WalletMeshClientImpl.js');

    mockCreateModal = vi.mocked(createModal);
    mockIsServer = vi.mocked(isServer);
    mockCreateSSRController = vi.mocked(createSSRController);

    // Make sure isServer returns false by default
    mockIsServer.mockReturnValue(false);

    // Setup WalletMeshClient mock implementation
    vi.mocked(WalletMeshClient).mockImplementation((config, registry, modal, logger) => {
      return {
        config,
        registry,
        modal,
        logger,
        connect: vi.fn(),
        disconnect: vi.fn(),
        getConnection: vi.fn(),
        getAllConnections: vi.fn(),
        initializeModalHandlers: vi.fn(),
        switchChain: vi.fn(),
        getState: vi.fn().mockReturnValue({
          connection: { state: 'idle' },
          wallets: [],
          selectedWalletId: undefined,
          isOpen: false,
        }),
        subscribe: vi.fn().mockReturnValue(() => {}),
        on: vi.fn().mockReturnValue(() => {}),
        once: vi.fn().mockReturnValue(() => {}),
        off: vi.fn(),
        getActions: vi.fn().mockReturnValue({
          openModal: vi.fn(),
          closeModal: vi.fn(),
          selectWallet: vi.fn(),
          connect: vi.fn(),
          disconnect: vi.fn(),
          retry: vi.fn(),
        }),
        openModal: vi.fn(),
        closeModal: vi.fn(),
        isConnected: false,
        setActiveWallet: vi.fn(),
        getActiveWallet: vi.fn(),
        getMaxConnections: vi.fn(),
        discoverWallets: vi.fn(),
        getWallet: vi.fn(),
        getAllWallets: vi.fn(),
        destroy: vi.fn(),
      };
    });
  });

  afterEach(async () => {
    await testEnv.teardown();
  });

  describe('Core Factory Functionality', () => {
    describe('Configuration validation', () => {
      it('should throw error when appName is missing', async () => {
        const config = {} as WalletMeshConfig;

        await expect(createWalletMesh(config)).rejects.toThrow(
          'appName is required in WalletMesh configuration',
        );
      });

      it('should create client with minimal valid config', async () => {
        const config: WalletMeshConfig = {
          appName: 'Test App',
        };

        const client = await createWalletMesh(config);

        expect(client).toBeDefined();
        expect(client.connect).toBeDefined();
        expect(client.disconnect).toBeDefined();
      });

      it('should create client with full config', async () => {
        const config: WalletMeshConfig = {
          appName: 'Test App',
          appDescription: 'Test Description',
          appUrl: 'https://test.com',
          appIcon: 'data:image/svg+xml,...',
          chains: [ChainType.Evm, ChainType.Solana],
        };

        const client = await createWalletMesh(config);

        expect(client).toBeDefined();
      });
    });

    describe('Modal creation and proxy behavior', () => {
      it('should create modal with correct configuration', async () => {
        const config = createUniqueConfig();

        const _client = await createWalletMesh(config);

        // Check if mock was called
        expect(mockCreateModal).toHaveBeenCalled();

        // Get the actual call arguments
        const callArgs = mockCreateModal.mock.calls[0]?.[0];

        // Debug: Log what properties are actually in callArgs
        const actualKeys = callArgs ? Object.keys(callArgs) : [];

        // Check each property individually
        expect(callArgs).toBeDefined();
        expect(callArgs).toHaveProperty('wallets');
        expect(callArgs).toHaveProperty('client');
        expect(Array.isArray(callArgs.wallets)).toBe(true);
        expect(callArgs.client).toBeDefined();

        // Check that we have the expected number of properties
        // The actual implementation passes: wallets, client (frameworkAdapter removed)
        expect(actualKeys.length).toBeGreaterThanOrEqual(2);
      });

      it('should initialize modal handlers after creation', async () => {
        const config = createUniqueConfig();

        const client = await createWalletMesh(config);

        // Check that initializeModalHandlers was called on the created client
        expect(client.initializeModalHandlers).toHaveBeenCalled();
      });

      it('should proxy modal methods before modal is created', async () => {
        const config = createUniqueConfig();

        // Access the modal proxy through the client's modal property
        const { WalletMeshClient } = await import('../../internal/client/WalletMeshClientImpl.js');

        // Capture the modal passed to WalletMeshClient
        let capturedModal: ModalController;
        vi.mocked(WalletMeshClient).mockImplementation((config, registry, modal, logger) => {
          capturedModal = modal;
          return {
            config,
            registry,
            modal,
            logger,
            connect: vi.fn(),
            disconnect: vi.fn(),
            getConnection: vi.fn(),
            getAllConnections: vi.fn(),
            initializeModalHandlers: vi.fn(),
            switchChain: vi.fn(),
          };
        });

        const _client = await createWalletMesh(config);

        // The proxy should provide no-op functions for methods before modal is ready
        expect(typeof capturedModal.open).toBe('function');
        expect(typeof capturedModal.close).toBe('function');
        expect(typeof capturedModal.subscribe).toBe('function');

        // These should not throw even if modal is not ready
        expect(() => capturedModal.open()).not.toThrow();
        expect(() => capturedModal.close()).not.toThrow();
        expect(() => capturedModal.subscribe(() => {})).not.toThrow();
      });
    });
  });

  describe('Runtime Environment Handling', () => {
    describe('SSR mode handling', () => {
      it('should use SSR controller when ssr option is true', async () => {
        const config: WalletMeshConfig = {
          appName: 'Test App',
        };

        const client = await createWalletMesh(config, { ssr: true });

        expect(mockCreateSSRController).toHaveBeenCalled();
        // SSR controller should have been called
        expect(mockCreateSSRController).toHaveBeenCalled();
        // The returned client should be the SSR controller
        expect(client).toEqual(mockCreateSSRController.mock.results[0]?.value);
      });

      it('should use SSR controller when running on server', async () => {
        mockIsServer.mockReturnValue(true);

        const config: WalletMeshConfig = {
          appName: 'Test App',
        };

        const client = await createWalletMesh(config);

        expect(mockCreateSSRController).toHaveBeenCalled();
        // SSR controller should have been called
        expect(mockCreateSSRController).toHaveBeenCalled();
        // The returned client should be the SSR controller
        expect(client).toEqual(mockCreateSSRController.mock.results[0]?.value);
      });

      it('should not use SSR controller when ssr is false and not on server', async () => {
        mockIsServer.mockReturnValue(false);

        const config: WalletMeshConfig = {
          appName: 'Test App',
        };

        const client = await createWalletMesh(config, { ssr: false });

        expect(mockCreateSSRController).not.toHaveBeenCalled();
        expect(client).not.toHaveProperty('isSSR');
      });
    });

    describe('Edge cases', () => {
      it('should handle empty wallet array', async () => {
        const config: WalletMeshConfig = {
          appName: 'Test App',
          wallets: [],
        };

        const client = await createWalletMesh(config);

        expect(client).toBeDefined();
        expect(mockCreateModal).toHaveBeenCalledWith(
          expect.objectContaining({
            wallets: [],
          }),
        );
      });

      it('should handle wallet config with all filters empty', async () => {
        const walletConfig: WalletConfig = {
          include: [],
          exclude: [],
        };

        const config: WalletMeshConfig = {
          appName: 'Test App',
          wallets: walletConfig,
        };

        const _client = await createWalletMesh(config);

        // No wallets should be registered when include is empty
        expect(mockRegistryInstance.register).not.toHaveBeenCalled();
      });

      it('should handle filter function that throws', async () => {
        const walletConfig: WalletConfig = {
          filter: () => {
            throw new Error('Filter error');
          },
        };

        const config: WalletMeshConfig = {
          appName: 'Test App',
          wallets: walletConfig,
        };

        // Should throw the filter error
        await expect(createWalletMesh(config)).rejects.toThrow('Filter error');
      });

      it('should handle adapter with missing metadata gracefully', async () => {
        // Set up a specific adapter with missing description
        const mockRegistry = createMockRegistry();
        const incompleteAdapter = {
          id: 'test',
          metadata: {
            name: 'Test Wallet',
            icon: 'icon.png',
            // description is missing
          },
          capabilities: {
            chains: [{ type: 'evm' }],
          },
        };
        mockRegistry.registeredAdapters.push(incompleteAdapter);
        mockRegistryInstance = mockRegistry.instance;

        const config = createUniqueConfig();

        const _client = await createWalletMesh(config);

        // Get the called arguments
        const calledArgs = mockCreateModal.mock.calls[0]?.[0];
        expect(calledArgs).toBeDefined();
        expect(calledArgs.wallets).toBeInstanceOf(Array);
        expect(calledArgs.wallets.length).toBeGreaterThan(0);
        // Check if description is handled correctly
        const walletWithMissingDesc = calledArgs.wallets.find((w: { id: string }) => w.id === 'test');
        if (walletWithMissingDesc) {
          expect(walletWithMissingDesc.description).toBe('');
        }
      });

      it('should handle circular reference in config object', async () => {
        const config = {
          appName: 'Test App',
        } as Record<string, unknown>;
        // Create circular reference
        config.self = config;

        // Should not throw when creating client
        await expect(createWalletMesh(config)).resolves.toBeDefined();
      });

      it('should handle very long app names', async () => {
        const config: WalletMeshConfig = {
          appName: 'A'.repeat(1000), // Very long name
          appDescription: 'B'.repeat(5000), // Very long description
        };

        const client = await createWalletMesh(config);

        expect(client).toBeDefined();
      });

      it('should handle special characters in app metadata', async () => {
        const config: WalletMeshConfig = {
          appName: 'Test <script>alert("XSS")</script> App',
          appDescription: 'Test & Description with "quotes" and \'apostrophes\'',
          appUrl: 'javascript:alert("XSS")', // Malicious URL
        };

        const client = await createWalletMesh(config);

        // Should create client without executing any scripts
        expect(client).toBeDefined();
      });

      it('should handle undefined and null in wallet filters', async () => {
        const walletConfig: WalletConfig = {
          include: undefined,
          exclude: null as string[] | null,
        };

        const config: WalletMeshConfig = {
          appName: 'Test App',
          wallets: walletConfig,
        };

        const _client = await createWalletMesh(config);

        // Should register only EVM adapter (debug wallet not included by default anymore)
        expect(mockRegistryInstance.register).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Wallet Configuration Patterns', () => {
    describe('Direct wallet info configuration', () => {
      it('should use direct wallet info when array is provided', async () => {
        const wallets = [
          {
            id: 'evm-wallet',
            name: 'EVM Wallet',
            icon: 'data:image/svg+xml,...',
            chains: [ChainType.Evm],
          },
          {
            id: 'phantom',
            name: 'Phantom',
            icon: 'data:image/svg+xml,...',
            chains: [ChainType.Solana],
          },
        ];

        const config: WalletMeshConfig = {
          appName: 'Test App',
          wallets,
        };

        const _client = await createWalletMesh(config);

        expect(mockCreateModal).toHaveBeenCalledWith(
          expect.objectContaining({
            wallets: expect.arrayContaining([
              expect.objectContaining({ id: 'evm-wallet' }),
              expect.objectContaining({ id: 'phantom' }),
            ]),
          }),
        );
      });

      it('should register matching adapters for direct wallet info', async () => {
        const wallets = [
          {
            id: 'evm-wallet',
            name: 'EVM Wallet',
            icon: 'data:image/svg+xml,...',
            chains: [ChainType.Evm],
          },
        ];

        const config: WalletMeshConfig = {
          appName: 'Test App',
          wallets,
        };

        const _client = await createWalletMesh(config);

        // When using direct wallet info, adapters for matching wallet IDs should be registered
        expect(mockRegistryInstance.register).toHaveBeenCalled();

        // Check that modal was called with the wallets
        const calledArgs = mockCreateModal.mock.calls[0]?.[0];
        expect(calledArgs?.wallets).toHaveLength(1);
        expect(calledArgs?.wallets[0]).toMatchObject({
          id: 'evm-wallet',
          name: 'EVM Wallet',
        });
      });
    });

    describe('Adapter-based wallet configuration', () => {
      it('should register default adapters when no wallet config provided', async () => {
        const config = createUniqueConfig();

        const _client = await createWalletMesh(config);

        expect(mockRegistryInstance.register).toHaveBeenCalledTimes(1); // Only EVM (debug wallet not included by default)
      });

      it('should filter wallets with filter function', async () => {
        const walletConfig: WalletConfig = {
          filter: (adapter) => adapter.id === 'evm-wallet',
        };

        const config: WalletMeshConfig = {
          appName: 'Test App',
          wallets: walletConfig,
        };

        const _client = await createWalletMesh(config);

        expect(mockRegistryInstance.register).toHaveBeenCalledWith(
          expect.objectContaining({ id: 'evm-wallet' }),
        );
        expect(mockRegistryInstance.register).not.toHaveBeenCalledWith(
          expect.objectContaining({ id: 'mock-wallet' }),
        );
      });

      it('should include only specified wallets', async () => {
        const walletConfig: WalletConfig = {
          include: ['evm-wallet'],
        };

        const config: WalletMeshConfig = {
          appName: 'Test App',
          wallets: walletConfig,
        };

        const _client = await createWalletMesh(config);

        expect(mockRegistryInstance.register).toHaveBeenCalledWith(
          expect.objectContaining({ id: 'evm-wallet' }),
        );
        expect(mockRegistryInstance.register).not.toHaveBeenCalledWith(
          expect.objectContaining({ id: 'mock-wallet' }),
        );
      });

      it('should exclude specified wallets', async () => {
        const walletConfig: WalletConfig = {
          exclude: ['mock-wallet'],
        };

        const config: WalletMeshConfig = {
          appName: 'Test App',
          wallets: walletConfig,
        };

        const _client = await createWalletMesh(config);

        expect(mockRegistryInstance.register).toHaveBeenCalledWith(
          expect.objectContaining({ id: 'evm-wallet' }),
        );
        expect(mockRegistryInstance.register).not.toHaveBeenCalledWith(
          expect.objectContaining({ id: 'mock-wallet' }),
        );
      });

      it('should apply both include and exclude filters', async () => {
        const walletConfig: WalletConfig = {
          include: ['evm-wallet', 'mock-wallet'],
          exclude: ['mock-wallet'],
        };

        const config: WalletMeshConfig = {
          appName: 'Test App',
          wallets: walletConfig,
        };

        const _client = await createWalletMesh(config);

        // Include filter runs first, then exclude
        expect(mockRegistryInstance.register).toHaveBeenCalledWith(
          expect.objectContaining({ id: 'evm-wallet' }),
        );
        expect(mockRegistryInstance.register).not.toHaveBeenCalledWith(
          expect.objectContaining({ id: 'mock-wallet' }),
        );
      });
    });
  });
});
