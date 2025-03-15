import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WalletClient } from './client.js';
import type { WalletStorage } from '../utils/storage.js';
import { ProviderInterface, ProviderNotSupportedError } from '../types/providers.js';
import { ChainType } from '../types/chains.js';
import { ClientEventType } from '../types/events.js';
import type { WalletClientState } from '../types/client.js';
import type { WalletConnector } from '../connectors/types.js';
import type { BaseProvider } from '../types/providers.js';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock window.localStorage
vi.stubGlobal('localStorage', mockLocalStorage);

describe('WalletClient', () => {
  let client: WalletClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReset();
    mockLocalStorage.setItem.mockReset();

    client = new WalletClient({
      appName: 'Test dApp',
      autoReconnect: false,
      persistConnection: true,
    });
  });

  describe('Storage', () => {
    it('should test custom storage prefix', () => {
      const customPrefix = 'test_prefix_';
      const clientWithCustomPrefix = new WalletClient({
        appName: 'Test',
        storageKeyPrefix: customPrefix,
      });

      // Access private storage to verify prefix
      const storage = clientWithCustomPrefix['storage'] as WalletStorage;
      expect(storage['prefix']).toBe(customPrefix);
    });

    it('should persist and restore state across instances', async () => {
      // First instance - set state
      const client1 = new WalletClient({
        appName: 'Test',
        persistConnection: true,
      });

      // Mock a connected state
      const connectedState: WalletClientState = {
        status: 'connected' as const,
        activeConnector: 'test-wallet',
        activeChain: ChainType.ETHEREUM,
        activeProviderInterface: ProviderInterface.EIP1193,
        accounts: ['0x123'],
        error: null,
      };

      // Set up the mock localStorage to return our state
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key.includes('walletState')) {
          return JSON.stringify(connectedState);
        }
        return null;
      });

      // Set the state on first client
      client1['store'].setState(connectedState);

      // Create second instance - should restore state
      const client2 = new WalletClient({
        appName: 'Test',
        persistConnection: true,
      });
      await client2.initialize();

      const restoredState = client2.getState();
      expect(restoredState.status).toBe('connected');
      expect(restoredState.activeConnector).toBe('test-wallet');
      expect(restoredState.accounts).toEqual(['0x123']);
    });
  });

  describe('Initialization', () => {
    it('should create instance with default config', () => {
      const defaultClient = new WalletClient({ appName: 'Test' });
      expect(defaultClient['config']).toEqual({
        appName: 'Test',
        autoReconnect: true,
        persistConnection: true,
        defaultProviderInterface: ProviderInterface.EIP1193,
        timeout: 5000,
        storageKeyPrefix: 'walletmesh_',
      });
    });

    it('should load saved state only if persistence enabled', async () => {
      const savedState: WalletClientState = {
        status: 'connected',
        activeConnector: 'test-wallet',
        activeChain: ChainType.ETHEREUM,
        activeProviderInterface: ProviderInterface.EIP1193,
        accounts: ['0x123'],
        error: null,
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedState));

      // With persistence disabled
      const nonPersistentClient = new WalletClient({
        appName: 'Test',
        persistConnection: false,
        autoReconnect: false, // Disable auto-reconnect to prevent initialization error
      });
      await nonPersistentClient.initialize();
      expect(nonPersistentClient.getState()).toEqual(
        expect.objectContaining({
          status: 'disconnected',
          activeConnector: null,
          accounts: [],
        }),
      );

      // With persistence enabled but no auto-reconnect
      const client = new WalletClient({
        appName: 'Test dApp',
        persistConnection: true,
        autoReconnect: false,
      });
      await client.initialize();
      const state = client.getState();
      expect(state.accounts).toEqual(savedState.accounts);
      expect(state.activeChain).toBe(savedState.activeChain);
      expect(state.activeConnector).toBe(savedState.activeConnector);
      expect(state.activeProviderInterface).toBe(savedState.activeProviderInterface);
      expect(state.error).toBeNull();
      // Status should remain connected since we're only loading the saved state
      expect(state.status).toBe(savedState.status);
    });

    it('should attempt auto-reconnect if enabled', async () => {
      const savedConnector = 'test-wallet';
      const savedProvider = ProviderInterface.EIP1193;

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key.includes('lastConnector')) return savedConnector;
        if (key.includes('lastProvider')) return savedProvider;
        return null;
      });

      const autoConnectClient = new WalletClient({
        appName: 'Test',
        autoReconnect: true,
      });

      // Mock connect method
      const connectSpy = vi.spyOn(autoConnectClient, 'connect').mockResolvedValue({
        chainType: ChainType.ETHEREUM,
        providerInterface: ProviderInterface.EIP1193,
        accounts: ['0x123'],
        capabilities: {
          interface: ProviderInterface.EIP1193,
          version: '1.0.0',
          methods: ['eth_accounts'],
          events: ['accountsChanged'],
        },
      });

      await autoConnectClient.initialize();

      expect(connectSpy).toHaveBeenCalledWith(savedConnector, {
        preferredInterface: savedProvider,
      });
    });

    describe('Auto-reconnect scenarios', () => {
      it('should handle auto-reconnect failures', async () => {
        // Mock console.error to verify it's called
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        mockLocalStorage.getItem.mockImplementation((key) => {
          if (key.includes('lastConnector')) return 'test-wallet';
          if (key.includes('lastProvider')) return ProviderInterface.EIP1193;
          return null;
        });

        const autoConnectClient = new WalletClient({
          appName: 'Test',
          autoReconnect: true,
        });

        const expectedError = new Error('Connect failed');
        vi.spyOn(autoConnectClient, 'connect').mockRejectedValue(expectedError);

        await autoConnectClient.initialize();

        // Verify console.error was called
        expect(consoleErrorSpy).toHaveBeenCalledWith('Auto-reconnect failed:', expectedError);

        // Verify state was updated correctly
        const state = autoConnectClient.getState();
        expect(state.status).toBe('error');
        expect(state.error).toBe(expectedError);

        // Clean up
        consoleErrorSpy.mockRestore();
      });

      it('should handle persistence with invalid saved state', async () => {
        mockLocalStorage.getItem.mockReturnValue('invalid json');
        const client = new WalletClient({
          appName: 'Test dApp',
          persistConnection: true,
          autoReconnect: false,
        });
        await client.initialize();
        expect(client.getState()).toEqual(
          expect.objectContaining({
            status: 'disconnected',
            activeConnector: null,
            accounts: [],
          }),
        );
      });

      it('should skip auto-reconnect if only connector exists without provider', async () => {
        mockLocalStorage.getItem.mockImplementation((key) => {
          if (key.includes('lastConnector')) return 'test-wallet';
          if (key.includes('lastProvider')) return null;
          return null;
        });

        const autoConnectClient = new WalletClient({
          appName: 'Test',
          autoReconnect: true,
        });

        const connectSpy = vi.spyOn(autoConnectClient, 'connect');

        await autoConnectClient.initialize();

        expect(connectSpy).not.toHaveBeenCalled();
        expect(autoConnectClient.getState().status).toBe('disconnected');
      });
    });

    it('should skip auto-reconnect if no saved connector', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const autoConnectClient = new WalletClient({
        appName: 'Test',
        autoReconnect: true,
      });

      const connectSpy = vi.spyOn(autoConnectClient, 'connect');

      await autoConnectClient.initialize();

      expect(connectSpy).not.toHaveBeenCalled();
      expect(autoConnectClient.getState().status).toBe('disconnected');
    });
  });

  describe('Provider Management', () => {
    it('should handle missing provider interface', () => {
      const result = client.getProvider();
      expect(result).toBeNull();
    });

    it('should throw for unsupported provider interface', () => {
      client['store'].setState({ activeProviderInterface: ProviderInterface.EIP1193 });
      expect(() => client.getProvider()).toThrow(ProviderNotSupportedError);
    });

    describe('chain handling', () => {
      beforeEach(() => {
        // Reset providers map before each test
        client['providers'].clear();
      });

      it('should handle all provider chain scenarios', () => {
        // Test all combinations of setChain property and chain parameters with mocked functions
        const testProviders = [
          {
            type: ProviderInterface.EIP1193,
            request: vi.fn(),
            setChain: undefined,
          },
          {
            type: ProviderInterface.EIP1193,
            request: vi.fn(),
          },
          {
            type: ProviderInterface.EIP1193,
            request: vi.fn(),
            setChain: null,
          },
          {
            type: ProviderInterface.EIP1193,
            request: vi.fn(),
            setChain: vi.fn(),
          },
        ];

        for (const mockProvider of testProviders) {
          // Reset state for each test
          client['store'].setState({ activeChain: null });
          client['providers'].set(ProviderInterface.EIP1193, mockProvider as unknown as BaseProvider);

          if (mockProvider.setChain && typeof mockProvider.setChain === 'function') {
            (mockProvider.setChain as ReturnType<typeof vi.fn>).mockReset();
          }

          // 1. Test with explicit chain parameter
          const withChain = client.getProvider(ProviderInterface.EIP1193, ChainType.ETHEREUM);
          expect(withChain).toBe(mockProvider);
          if (mockProvider.setChain && typeof mockProvider.setChain === 'function') {
            expect(mockProvider.setChain).toHaveBeenCalledWith(ChainType.ETHEREUM);
            (mockProvider.setChain as ReturnType<typeof vi.fn>).mockReset();
          }

          // 2. Test with stored chain state
          client['store'].setState({ activeChain: ChainType.ETHEREUM });
          const withStoredChain = client.getProvider(ProviderInterface.EIP1193);
          expect(withStoredChain).toBe(mockProvider);
          if (mockProvider.setChain && typeof mockProvider.setChain === 'function') {
            expect(mockProvider.setChain).toHaveBeenCalledWith(ChainType.ETHEREUM);
            (mockProvider.setChain as ReturnType<typeof vi.fn>).mockReset();
          }

          // 3. Test without any chain parameter
          client['store'].setState({ activeChain: null });
          const withoutChain = client.getProvider(ProviderInterface.EIP1193);
          expect(withoutChain).toBe(mockProvider);
          if (mockProvider.setChain && typeof mockProvider.setChain === 'function') {
            expect(mockProvider.setChain).not.toHaveBeenCalled();
          }
        }

        // Test provider interface edge cases
        client['store'].setState({ activeProviderInterface: null });
        expect(client.getProvider()).toBeNull();

        client['providers'].clear();
        client['store'].setState({ activeProviderInterface: ProviderInterface.EIP1193 });
        expect(() => client.getProvider()).toThrow(ProviderNotSupportedError);
      });

      it('should handle all chain configurations', () => {
        // Test four scenarios:
        // 1. Provider with setChain and explicit chain
        const mockProvider1 = {
          type: ProviderInterface.EIP1193,
          request: vi.fn(),
          setChain: vi.fn(),
        };

        // 2. Provider with setChain but no explicit chain (uses store chain)
        const mockProvider2 = {
          type: ProviderInterface.EIP6963,
          request: vi.fn(),
          setChain: vi.fn(),
        };

        // 3. Provider without setChain
        const mockProvider3 = {
          type: ProviderInterface.ETHERS,
          request: vi.fn(),
        };

        // 4. Provider with setChain but no store chain
        const mockProvider4 = {
          type: ProviderInterface.NATIVE,
          request: vi.fn(),
          setChain: vi.fn(),
        };

        // Register providers
        client['providers'].set(ProviderInterface.EIP1193, mockProvider1);
        client['providers'].set(ProviderInterface.EIP6963, mockProvider2);
        client['providers'].set(ProviderInterface.ETHERS, mockProvider3);
        client['providers'].set(ProviderInterface.NATIVE, mockProvider4);

        // Set store state with chain
        client['store'].setState({
          activeProviderInterface: ProviderInterface.EIP1193,
          activeChain: ChainType.ETHEREUM,
        });

        // Test scenario 1: Explicit chain with setChain
        const provider1 = client.getProvider(ProviderInterface.EIP1193, ChainType.ETHEREUM);
        expect(provider1).toBe(mockProvider1);
        expect(mockProvider1.setChain).toHaveBeenCalledWith(ChainType.ETHEREUM);

        // Test scenario 2: Store chain with setChain
        const provider2 = client.getProvider(ProviderInterface.EIP6963);
        expect(provider2).toBe(mockProvider2);
        expect(mockProvider2.setChain).toHaveBeenCalledWith(ChainType.ETHEREUM);

        // Test scenario 3: Provider without setChain
        const provider3 = client.getProvider(ProviderInterface.ETHERS, ChainType.ETHEREUM);
        expect(provider3).toBe(mockProvider3);
        // Should not throw even though setChain is missing

        // Test scenario 4: Provider with setChain but no chain in store or parameter
        client['store'].setState({ activeChain: null });
        const provider4 = client.getProvider(ProviderInterface.NATIVE);
        expect(provider4).toBe(mockProvider4);
        // Should not try to call setChain when no chain is available
        expect(mockProvider4.setChain).not.toHaveBeenCalled();
      });
    });
  });

  describe('Connection Management', () => {
    it('should emit events in correct order during connect', async () => {
      const events: string[] = [];
      client.on(ClientEventType.CONNECTING, () => events.push('connecting'));
      client.on(ClientEventType.CONNECTED, () => events.push('connected'));

      try {
        await client.connect('test-wallet');
      } catch (error) {
        // Expected to fail since we don't have a real connector
      }

      expect(events[0]).toBe('connecting');
    });

    it('should handle disconnect cleanup', async () => {
      const mockProvider = {
        type: ProviderInterface.EIP1193,
        request: vi.fn().mockResolvedValue(null),
      };

      client['providers'].set(ProviderInterface.EIP1193, mockProvider);
      client['store'].setState({ activeProviderInterface: ProviderInterface.EIP1193 });

      await client.disconnect();

      expect(mockProvider.request).toHaveBeenCalledWith({ method: 'eth_disconnect' });
      expect(client.getState()).toEqual(
        expect.objectContaining({
          status: 'disconnected',
          activeConnector: null,
          accounts: [],
        }),
      );
    });

    describe('Disconnect scenarios', () => {
      it('should handle disconnect with persistence disabled', async () => {
        // Create client with persistence disabled
        const nonPersistentClient = new WalletClient({
          appName: 'Test',
          persistConnection: false,
        });

        // Mock the storage methods
        const storageSpy = vi.spyOn(nonPersistentClient['storage'], 'clearAll');

        // Add provider and set connected state
        const mockProvider = {
          type: ProviderInterface.EIP1193,
          request: vi.fn().mockResolvedValue(null),
        };

        nonPersistentClient.registerProvider(ProviderInterface.EIP1193, mockProvider);
        nonPersistentClient['store'].setState({
          activeProviderInterface: ProviderInterface.EIP1193,
          status: 'connected',
          accounts: ['0x123'],
        });

        await nonPersistentClient.disconnect();

        // Verify storage wasn't cleared
        expect(storageSpy).not.toHaveBeenCalled();

        // Verify the state was still reset
        const state = nonPersistentClient.getState();
        expect(state).toEqual(
          expect.objectContaining({
            status: 'disconnected',
            activeConnector: null,
            activeChain: null,
            activeProviderInterface: null,
            accounts: [],
            error: null,
          }),
        );

        // Clean up
        storageSpy.mockRestore();
      });

      it('should handle provider errors during disconnect', async () => {
        // Mock console.error to verify it's called
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const mockProvider = {
          type: ProviderInterface.EIP1193,
          request: vi.fn().mockRejectedValue(new Error('Disconnect failed')),
        };

        client['providers'].set(ProviderInterface.EIP1193, mockProvider);
        client['store'].setState({
          activeProviderInterface: ProviderInterface.EIP1193,
          status: 'connected',
          accounts: ['0x123'],
        });

        await client.disconnect();

        // Verify provider.request was called
        expect(mockProvider.request).toHaveBeenCalledWith({ method: 'eth_disconnect' });

        // Verify error was logged
        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error));

        // Verify state was reset despite error
        const state = client.getState();
        expect(state).toEqual(
          expect.objectContaining({
            status: 'disconnected',
            activeConnector: null,
            activeChain: null,
            activeProviderInterface: null,
            accounts: [],
            error: null,
          }),
        );

        // Clean up
        consoleErrorSpy.mockRestore();
      });

      it('should handle disconnect when provider is unavailable', async () => {
        // Mock console.error to verify it's called
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        client['store'].setState({
          activeProviderInterface: ProviderInterface.EIP1193,
          status: 'connected',
          accounts: ['0x123'],
        });

        await client.disconnect();

        // Verify error was logged
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Provider error during disconnect:',
          expect.any(ProviderNotSupportedError),
        );

        // Verify state was reset despite error
        const state = client.getState();
        expect(state).toEqual(
          expect.objectContaining({
            status: 'disconnected',
            activeConnector: null,
            activeChain: null,
            activeProviderInterface: null,
            accounts: [],
            error: null,
          }),
        );

        // Clean up
        consoleErrorSpy.mockRestore();
      });

      it('should handle disconnect without active provider interface', async () => {
        client['store'].setState({
          activeProviderInterface: null,
          status: 'connected',
          accounts: ['0x123'],
        });

        await client.disconnect();

        // Verify state was reset
        const state = client.getState();
        expect(state).toEqual(
          expect.objectContaining({
            status: 'disconnected',
            activeConnector: null,
            activeChain: null,
            activeProviderInterface: null,
            accounts: [],
            error: null,
          }),
        );
      });
    });
  });

  describe('Event System', () => {
    it('should cleanup event listeners', () => {
      const listener = vi.fn();
      client.on(ClientEventType.CONNECTING, listener);
      client.off(ClientEventType.CONNECTING, listener);

      client.emit({
        type: ClientEventType.CONNECTING,
        providerType: ProviderInterface.EIP1193,
      });

      expect(listener).not.toHaveBeenCalled();
      expect(client['eventListeners'].size).toBe(0);
    });

    it('should handle multiple listeners for same event', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      client.on(ClientEventType.CONNECTING, listener1);
      client.on(ClientEventType.CONNECTING, listener2);

      client.emit({
        type: ClientEventType.CONNECTING,
        providerType: ProviderInterface.EIP1193,
      });

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });

  describe('Connector Management', () => {
    const mockConnector: WalletConnector = {
      id: 'test-wallet',
      name: 'Test Wallet',
      icon: 'test-icon.png',
      supportedChains: [ChainType.ETHEREUM],
      supportedProviders: [ProviderInterface.EIP1193],
      detect: vi.fn().mockResolvedValue(true),
      connect: vi.fn(),
      disconnect: vi.fn(),
      initialize: vi.fn(),
      getProviderCapabilities: vi.fn(),
      getProvider: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    };

    it('should register single connector', () => {
      client.registerConnector(mockConnector);
      expect(client['connectors'].get(mockConnector.id)).toBe(mockConnector);
    });

    it('should handle registering a connector with undefined id', () => {
      // Create type omitting the id property
      type WalletConnectorWithoutId = Omit<WalletConnector, 'id'> & { id: undefined };
      const invalidConnector: WalletConnectorWithoutId = { ...mockConnector, id: undefined };
      expect(() => client.registerConnector(invalidConnector as unknown as WalletConnector)).toThrow(
        'Connector ID cannot be undefined',
      );
    });

    it('should handle overwriting existing connector', () => {
      // Register initial connector
      client.registerConnector(mockConnector);
      expect(client['connectors'].get(mockConnector.id)).toBe(mockConnector);

      // Create new connector with same ID but different implementation
      const updatedConnector = {
        ...mockConnector,
        name: 'Updated Test Wallet',
        detect: vi.fn().mockResolvedValue(true),
      };

      // Register the new connector
      client.registerConnector(updatedConnector);

      // Verify the connector was overwritten
      const storedConnector = client['connectors'].get(mockConnector.id);
      expect(storedConnector).toBe(updatedConnector);
      expect(storedConnector?.name).toBe('Updated Test Wallet');
    });

    it('should handle concurrent connector registrations', async () => {
      // Create multiple connectors
      const connectors = Array.from({ length: 5 }, (_, i) => ({
        ...mockConnector,
        id: `test-wallet-${i}`,
        name: `Test Wallet ${i}`,
      }));

      // Register connectors concurrently
      await Promise.all(connectors.map((c) => Promise.resolve(client.registerConnector(c))));

      // Verify all connectors were registered correctly
      for (const c of connectors) {
        expect(client['connectors'].get(c.id)).toBe(c);
      }
    });

    it('should register multiple connectors', () => {
      const mockConnector2 = { ...mockConnector, id: 'test-wallet-2' };
      client.registerConnectors([mockConnector, mockConnector2]);

      expect(client['connectors'].get(mockConnector.id)).toBe(mockConnector);
      expect(client['connectors'].get(mockConnector2.id)).toBe(mockConnector2);
    });

    it('should return undefined for unregistered connector', async () => {
      const connector = await client['getConnector']('non-existent');
      expect(connector).toBeUndefined();
    });
  });

  describe('Provider Management', () => {
    const mockProvider = {
      type: ProviderInterface.EIP1193,
      request: vi.fn().mockImplementation(async () => undefined),
      setChain: vi.fn().mockImplementation((_chain: ChainType) => undefined),
    } as BaseProvider & {
      request: ReturnType<typeof vi.fn>;
      setChain: ReturnType<typeof vi.fn>;
    };

    describe('getChainId implementation', () => {
      it('should concatenate 0x with ChainType enum values', () => {
        expect(client['getChainId'](ChainType.ETHEREUM)).toBe(`0x${ChainType.ETHEREUM}`);
      });

      it('should concatenate 0x with string chain identifiers', () => {
        // Common chain IDs
        expect(client['getChainId']('1' as ChainType)).toBe('0x1');
        expect(client['getChainId']('42161' as ChainType)).toBe('0x42161');

        // Already prefixed values
        expect(client['getChainId']('0x1' as ChainType)).toBe('0x0x1');
        expect(client['getChainId']('0x89' as ChainType)).toBe('0x0x89');
      });

      it('should handle edge cases', () => {
        // Empty string
        expect(client['getChainId']('' as ChainType)).toBe('0x');

        // Just the prefix
        expect(client['getChainId']('0x' as ChainType)).toBe('0x0x');

        // Non-numeric values
        expect(client['getChainId']('test' as ChainType)).toBe('0xtest');
        expect(client['getChainId']('undefined' as ChainType)).toBe('0xundefined');
        expect(client['getChainId']('null' as ChainType)).toBe('0xnull');
      });

      it('should handle provider chain integration', () => {
        // Test through provider integration with plain objects and mocks
        const chainTypeProvider = {
          type: ProviderInterface.EIP6963,
          request: vi.fn(),
          setChain: vi.fn(),
        } as BaseProvider;

        client.registerProvider(ProviderInterface.EIP6963, chainTypeProvider);
        client.getProvider(ProviderInterface.EIP6963, ChainType.ETHEREUM);

        // Verify the chain was set correctly
        expect(chainTypeProvider.setChain).toHaveBeenCalledWith(ChainType.ETHEREUM);

        // Get the chainId that would be used
        const chainId = client['getChainId'](ChainType.ETHEREUM);
        expect(chainId).toBe(`0x${ChainType.ETHEREUM}`);
      });
    });

    it('should directly test provider registration methods', () => {
      // Test registerProvider
      client.registerProvider(ProviderInterface.EIP1193, mockProvider);
      expect(client['providers'].get(ProviderInterface.EIP1193)).toBe(mockProvider);

      // Test registerProviders with direct implementation
      const providersMap: Record<ProviderInterface, BaseProvider> = {
        [ProviderInterface.EIP1193]: mockProvider,
        [ProviderInterface.EIP6963]: mockProvider,
        [ProviderInterface.ETHERS]: mockProvider,
        [ProviderInterface.NATIVE]: mockProvider,
      };
      client.registerProviders(providersMap);
      expect(client['providers'].get(ProviderInterface.EIP6963)).toBe(mockProvider);
    });

    it('should register and remove providers', () => {
      // Register single provider
      client.registerProvider(ProviderInterface.EIP1193, mockProvider);
      expect(client['providers'].get(ProviderInterface.EIP1193)).toBe(mockProvider);

      // Test provider for checking chainId conversion
      const chainTypeProvider = {
        ...mockProvider,
        type: ProviderInterface.EIP6963,
        setChain: vi.fn().mockImplementation((chainType) => {
          expect(client['getChainId'](chainType)).toBe(`0x${chainType}`);
        }),
      } as BaseProvider;

      // Register provider that will test chainId conversion
      client.registerProvider(ProviderInterface.EIP6963, chainTypeProvider);
      client.getProvider(ProviderInterface.EIP6963, ChainType.ETHEREUM);
      expect(chainTypeProvider.setChain).toHaveBeenCalled();

      // Register multiple providers
      const mockProvider2: BaseProvider = {
        ...mockProvider,
        type: ProviderInterface.EIP6963,
      };
      const providers = {
        [ProviderInterface.EIP1193]: mockProvider,
        [ProviderInterface.EIP6963]: mockProvider2,
        [ProviderInterface.ETHERS]: mockProvider,
        [ProviderInterface.NATIVE]: mockProvider,
      };
      client.registerProviders(providers);
      expect(client['providers'].get(ProviderInterface.EIP6963)).toBe(mockProvider2);

      // Remove provider
      client.removeProvider(ProviderInterface.EIP1193);
      expect(client['providers'].has(ProviderInterface.EIP1193)).toBe(false);
    });

    it('should check provider interface support', () => {
      client.registerProvider(ProviderInterface.EIP1193, mockProvider);

      const supported = client.getSupportedProviderInterfaces();
      expect(supported).toContain(ProviderInterface.EIP1193);
      expect(client.supportsInterface(ProviderInterface.EIP1193)).toBe(true);
      expect(client.supportsInterface(ProviderInterface.EIP6963)).toBe(false);
    });
  });

  describe('Chain Management', () => {
    let mockProvider: BaseProvider & {
      request: ReturnType<typeof vi.fn<(args: { method: string; params?: unknown[] }) => Promise<unknown>>>;
      setChain: ReturnType<typeof vi.fn<(chain: ChainType) => void>>;
    };

    beforeEach(() => {
      mockProvider = {
        type: ProviderInterface.EIP1193,
        request: vi.fn().mockImplementation(async () => undefined),
        setChain: vi.fn().mockImplementation((_chain: ChainType) => undefined),
      };
      client.registerProvider(ProviderInterface.EIP1193, mockProvider);
      client['store'].setState({ activeProviderInterface: ProviderInterface.EIP1193 });
      mockProvider.request.mockReset();
      mockProvider.setChain.mockReset();
    });

    it('should switch chains successfully', async () => {
      mockProvider.request.mockResolvedValue(null);

      await client.switchChain(ChainType.ETHEREUM);

      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${ChainType.ETHEREUM}` }],
      });

      // Verify state updates
      expect(client.getState().activeChain).toBe(ChainType.ETHEREUM);
      expect(client.getState().error).toBeNull();

      // Verify provider chain was updated
      expect(mockProvider.setChain).toHaveBeenCalledWith(ChainType.ETHEREUM);
    });

    it('should throw when no active provider is available', async () => {
      client['store'].setState({ activeProviderInterface: null });

      await expect(client.switchChain(ChainType.ETHEREUM)).rejects.toThrow('No active provider available');
    });

    it('should handle provider errors', async () => {
      const expectedError = new Error('Chain switch failed');
      mockProvider.request.mockRejectedValue(expectedError);

      await expect(client.switchChain(ChainType.ETHEREUM)).rejects.toThrow(expectedError);

      // Verify error state
      expect(client.getState().error).toBe(expectedError);
    });

    it('should handle non-Error objects in error case', async () => {
      const nonErrorObject = { code: 4001, message: 'User rejected request' };
      mockProvider.request.mockRejectedValue(nonErrorObject);

      await expect(client.switchChain(ChainType.ETHEREUM)).rejects.toBe(nonErrorObject);

      // Verify error state was wrapped in an Error object
      expect(client.getState().error).toBeInstanceOf(Error);
      expect(client.getState().error?.message).toBe('Chain switch failed');
    });

    it('should emit connecting event', async () => {
      const events: string[] = [];
      client.on(ClientEventType.CONNECTING, () => events.push('connecting'));

      mockProvider.request.mockResolvedValue(null);
      await client.switchChain(ChainType.ETHEREUM);

      expect(events[0]).toBe('connecting');
    });

    it('should handle providers with and without setChain method', async () => {
      const withSetChain = {
        type: ProviderInterface.EIP1193,
        request: vi.fn().mockResolvedValue(null),
        setChain: vi.fn(),
      } as BaseProvider;

      const withoutSetChain = {
        type: ProviderInterface.EIP1193,
        request: vi.fn().mockResolvedValue(null),
      } as BaseProvider;

      for (const testCase of [withSetChain, withoutSetChain]) {
        // Reset state and mocks
        vi.clearAllMocks();
        client['providers'].clear();
        client.registerProvider(ProviderInterface.EIP1193, testCase);
        client['store'].setState({ activeProviderInterface: ProviderInterface.EIP1193 });

        // Should not throw for any provider variant
        await client.switchChain(ChainType.ETHEREUM);
        expect(client.getState().activeChain).toBe(ChainType.ETHEREUM);

        // For provider with setChain, verify it was called
        if ('setChain' in testCase && typeof testCase.setChain === 'function') {
          expect(testCase.setChain).toHaveBeenCalledWith(ChainType.ETHEREUM);
        }
      }
    });

    it('should convert chain types to chain IDs correctly', async () => {
      mockProvider.request.mockResolvedValue(null);

      // Test with different chain types
      await client.switchChain(ChainType.ETHEREUM);
      expect(mockProvider.request).toHaveBeenLastCalledWith({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${ChainType.ETHEREUM}` }],
      });

      await client.switchChain('42161' as ChainType);
      expect(mockProvider.request).toHaveBeenLastCalledWith({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x42161' }],
      });
    });
  });

  describe('Account Management', () => {
    describe('Account Methods', () => {
      it('should return accounts from store state', () => {
        // Setup mock state
        const mockState: WalletClientState = {
          status: 'connected' as const,
          activeConnector: null,
          activeChain: null,
          activeProviderInterface: null,
          accounts: ['0x123', '0x456'],
          error: null,
        };

        // Setup spy before use
        const stateSpy = vi.spyOn(client['store'], 'getState').mockReturnValue(mockState);

        // Test the method
        const result = client.getAccounts();

        // Verify result and spy
        expect(result).toEqual(['0x123', '0x456']);
        expect(stateSpy).toHaveBeenCalled();

        // Cleanup
        stateSpy.mockRestore();
      });

      it('should reflect state updates', () => {
        // Test state changes
        client['store'].setState({ accounts: ['0x789'] });
        expect(client.getAccounts()).toEqual(['0x789']);

        client['store'].setState({ accounts: [] });
        expect(client.getAccounts()).toEqual([]);
      });
    });
  });

  describe('Advanced Connection Scenarios', () => {
    const mockConnector: WalletConnector = {
      id: 'test-wallet',
      name: 'Test Wallet',
      icon: 'test-icon.png',
      supportedChains: [ChainType.ETHEREUM],
      supportedProviders: [ProviderInterface.EIP1193],
      detect: vi.fn().mockResolvedValue(true),
      connect: vi.fn(),
      disconnect: vi.fn(),
      initialize: vi.fn(),
      getProviderCapabilities: vi.fn(),
      getProvider: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    };

    beforeEach(() => {
      client.registerConnector(mockConnector);
      (mockConnector.connect as ReturnType<typeof vi.fn>).mockResolvedValue({
        chain: ChainType.ETHEREUM,
        provider: ProviderInterface.EIP1193,
        accounts: ['0x123'],
      });

      (mockConnector.getProviderCapabilities as ReturnType<typeof vi.fn>).mockReturnValue({
        interface: ProviderInterface.EIP1193,
        version: '1.0.0',
        methods: ['eth_accounts'],
        events: ['accountsChanged'],
      });
    });

    it('should throw error when connector not found', async () => {
      await expect(client.connect('non-existent-wallet')).rejects.toThrow(
        'Connector non-existent-wallet not found',
      );
    });

    it('should handle wallet availability check', async () => {
      (mockConnector.detect as ReturnType<typeof vi.fn>).mockResolvedValue(false);
      await expect(client.connect('test-wallet')).rejects.toThrow('Wallet not available');

      (mockConnector.detect as ReturnType<typeof vi.fn>).mockResolvedValue(true);
      await client.connect('test-wallet');
      expect(client.getState().status).toBe('connected');
    });

    it('should handle capabilities fallback', async () => {
      (mockConnector.getProviderCapabilities as ReturnType<typeof vi.fn>).mockReturnValue(null);
      (mockConnector.connect as ReturnType<typeof vi.fn>).mockResolvedValue({
        chain: ChainType.ETHEREUM,
        provider: ProviderInterface.EIP1193,
        accounts: ['0x123'],
      });

      const result = await client.connect('test-wallet');

      // Verify default capabilities were used
      expect(result.capabilities).toEqual({
        interface: ProviderInterface.EIP1193,
        version: '1.0.0',
        methods: [],
        events: [],
      });
    });

    describe('Connection Options', () => {
      const connectMock = mockConnector.connect as ReturnType<typeof vi.fn>;

      beforeEach(() => {
        connectMock.mockClear();
      });

      it('should handle interface configuration scenarios', async () => {
        // Basic scenario - no default interface
        const basicClient = new WalletClient({
          appName: 'Test',
          timeout: 5000,
        });
        basicClient.registerConnector(mockConnector);

        connectMock.mockClear();
        await basicClient.connect('test-wallet');
        expect(connectMock).toHaveBeenLastCalledWith(undefined, { timeout: 5000 });

        // With default provider interface
        const clientWithDefault = new WalletClient({
          appName: 'Test',
          defaultProviderInterface: ProviderInterface.EIP6963,
          timeout: 5000,
        });
        clientWithDefault.registerConnector(mockConnector);

        connectMock.mockClear();
        await clientWithDefault.connect('test-wallet');
        expect(connectMock).toHaveBeenLastCalledWith(undefined, { timeout: 5000 });

        // With explicit preferred interface
        connectMock.mockClear();
        await clientWithDefault.connect('test-wallet', {
          preferredInterface: ProviderInterface.EIP1193,
        });
        expect(connectMock).toHaveBeenLastCalledWith(undefined, { timeout: 5000 });

        // With chain type
        connectMock.mockClear();
        await clientWithDefault.connect('test-wallet', {
          chainType: ChainType.ETHEREUM,
        });
        expect(connectMock).toHaveBeenLastCalledWith(ChainType.ETHEREUM, { timeout: 5000 });
      });

      it('should prepare connection options correctly', async () => {
        // Test case 1: No options (should use defaults)
        await client.connect('test-wallet');
        expect(connectMock).toHaveBeenCalledWith(undefined, { timeout: 5000 });
        connectMock.mockClear();

        // Test case 2: With chain only
        await client.connect('test-wallet', {
          chainType: ChainType.ETHEREUM,
        });
        expect(connectMock).toHaveBeenCalledWith(ChainType.ETHEREUM, { timeout: 5000 });
        connectMock.mockClear();

        // Test case 3: With preferred interface
        await client.connect('test-wallet', {
          preferredInterface: ProviderInterface.EIP1193,
        });
        expect(connectMock).toHaveBeenCalledWith(undefined, { timeout: 5000 });
        connectMock.mockClear();

        // Test case 4: With custom global timeout
        client['config'].timeout = 10000;
        await client.connect('test-wallet');
        expect(connectMock).toHaveBeenCalledWith(undefined, { timeout: 10000 });
      });

      it('should handle all interface configuration scenarios', async () => {
        // Reset connector mock
        connectMock.mockClear();

        // 1. Without any provider interface configuration
        const clientWithoutDefault = new WalletClient({
          appName: 'Test',
        });
        clientWithoutDefault.registerConnector(mockConnector);

        await clientWithoutDefault.connect('test-wallet');
        expect(connectMock).toHaveBeenCalledWith(undefined, { timeout: 5000 });
        connectMock.mockClear();

        // 2. With only defaultProviderInterface
        const clientWithDefault = new WalletClient({
          appName: 'Test',
          defaultProviderInterface: ProviderInterface.EIP6963,
        });
        clientWithDefault.registerConnector(mockConnector);

        await clientWithDefault.connect('test-wallet');
        expect(connectMock).toHaveBeenCalledWith(undefined, { timeout: 5000 });
        connectMock.mockClear();

        // 3. With explicit preferred interface
        await client.connect('test-wallet', {
          chainType: ChainType.ETHEREUM,
          preferredInterface: ProviderInterface.EIP1193,
        });
        expect(connectMock).toHaveBeenCalledWith(ChainType.ETHEREUM, { timeout: client['config'].timeout });
        connectMock.mockClear();

        // 2. With no interface (triggers default interface path)
        await client.connect('test-wallet', {
          chainType: ChainType.ETHEREUM,
        });
        expect(connectMock).toHaveBeenCalledWith(ChainType.ETHEREUM, { timeout: client['config'].timeout });
        connectMock.mockClear();

        // 3. With client config but no options
        client['config'].defaultProviderInterface = ProviderInterface.EIP6963;
        await client.connect('test-wallet');
        expect(connectMock).toHaveBeenCalledWith(undefined, { timeout: client['config'].timeout });

        // Verify internal state preparation
        expect(connectMock).not.toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({ preferredInterface: expect.anything() }),
        );
      });
    });
  });

  describe('Extended Event Handling', () => {
    it('should handle removing non-existent listeners', () => {
      const listener = vi.fn();
      // Should not throw when removing non-existent listener
      client.off(ClientEventType.CONNECTING, listener);

      // Should not throw when emitting with no listeners
      client.emit({
        type: ClientEventType.CONNECTING,
        providerType: ProviderInterface.EIP1193,
      });
    });

    it('should properly clean up listener sets', () => {
      const listener = vi.fn();
      client.on(ClientEventType.CONNECTING, listener);
      client.off(ClientEventType.CONNECTING, listener);

      // Listener set should be removed when empty
      expect(client['eventListeners'].has(ClientEventType.CONNECTING)).toBe(false);
    });
  });
});
