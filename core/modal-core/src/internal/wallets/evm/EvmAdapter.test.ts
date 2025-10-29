import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WalletConnection } from '../../../api/types/connection.js';
import type { ModalError } from '../../../api/types/errors.js';
import {
  createMockErrorHandler,
  createMockEvmProvider,
  createMockLogger,
  createTestEnvironment,
  installCustomMatchers,
} from '../../../testing/index.js';
import { ChainType } from '../../../types.js';
import { ErrorFactory } from '../../core/errors/errorFactory.js';
import { Logger } from '../../core/logger/logger.js';
import { EvmProvider } from '../../providers/evm/EvmProvider.js';
import type { AdapterContext, ConnectOptions, DetectionResult } from '../base/WalletAdapter.js';
import { EvmAdapter } from './EvmAdapter.js';

// Install domain-specific matchers
installCustomMatchers();

// Mock providers
vi.mock('../../providers/evm/EvmProvider.js');
vi.mock('../../core/errors/errorFactory.js');
vi.mock('../../core/logger/logger.js');

describe('EvmAdapter', () => {
  let adapter: EvmAdapter;
  let mockEthereum: ReturnType<typeof createMockEvmProvider> & {
    isEvmWallet: boolean;
    on?: ReturnType<typeof vi.fn>;
    removeListener: ReturnType<typeof vi.fn>;
    version?: string;
    isBraveWallet?: boolean;
    isCoinbaseWallet?: boolean;
  };
  let mockWindow: { ethereum?: unknown; ethereumProviders?: unknown[] };
  const testEnv = createTestEnvironment();

  beforeEach(async () => {
    await testEnv.setup();

    adapter = new EvmAdapter();

    // Mock ethereum provider using testing utility
    const baseProvider = createMockEvmProvider();
    mockEthereum = {
      ...baseProvider,
      isEvmWallet: true,
      on: vi.fn(),
      removeListener: vi.fn(),
    };

    // Mock window
    mockWindow = {
      ethereum: mockEthereum,
    };

    // Setup global window
    (global as { window?: unknown }).window = mockWindow;

    // Mock ErrorFactory
    vi.mocked(ErrorFactory).walletNotFound = vi.fn().mockReturnValue(new Error('Wallet not found'));
    vi.mocked(ErrorFactory).connectionFailed = vi.fn().mockImplementation((message) => new Error(message));
    vi.mocked(ErrorFactory).fromConnectorError = vi.fn().mockImplementation((_, error) => error);

    // Mock Logger constructor using testing utility
    const mockLogger = createMockLogger();
    vi.mocked(Logger).mockImplementation(
      () =>
        ({
          ...mockLogger,
          warn: vi.fn(),
          setLevel: vi.fn(),
          dispose: vi.fn(),
        }) as unknown as Logger,
    );
  });

  afterEach(async () => {
    await testEnv.teardown();
    (global as { window?: unknown }).window = undefined;
  });

  describe('Basic properties', () => {
    it('should have correct id', () => {
      expect(adapter.id).toBe('evm-wallet');
    });

    it('should have correct metadata', () => {
      expect(adapter.metadata.name).toBe('EVM Wallet');
      expect(adapter.metadata.description).toBe('Connect with EVM-compatible wallet');
      expect(adapter.metadata.homepage).toBe('https://ethereum.org/wallets');
      expect(adapter.metadata.icon).toContain('data:image/svg+xml');
    });

    it('should have correct capabilities', () => {
      expect(adapter.capabilities.chains).toEqual([{ type: ChainType.Evm, chainIds: '*' }]);
      expect(adapter.capabilities.features).toContain('sign_message');
      expect(adapter.capabilities.features).toContain('sign_typed_data');
      expect(adapter.capabilities.features).toContain('encrypt');
      expect(adapter.capabilities.features).toContain('decrypt');
      expect(adapter.capabilities.features).toContain('multi_account');
    });

    it('should have EVM provider support', () => {
      expect(adapter.supportedProviders[ChainType.Evm]).toBe(EvmProvider);
    });

    it('should have disconnected initial state', () => {
      expect(adapter.state.status).toBe('disconnected');
      expect(adapter.state.connection).toBeNull();
      expect(adapter.state.error).toBeNull();
      expect(adapter.state.accounts).toEqual([]);
    });
  });

  describe('install/uninstall', () => {
    it('should install adapter with context', async () => {
      const mockLogger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };
      const context: AdapterContext = {
        logger: mockLogger,
        debug: true, // Enable debug mode
      } as AdapterContext;

      await adapter.install(context);

      expect(mockLogger.debug).toHaveBeenCalledWith('[evm-wallet] Installing adapter', { id: 'evm-wallet' });
    });

    it('should uninstall adapter', async () => {
      await adapter.uninstall();
      // Should not throw
    });
  });

  describe('connect', () => {
    beforeEach(async () => {
      // Install adapter first
      await adapter.install({
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
      });
    });

    it('should connect successfully', async () => {
      const mockAccounts = ['0x1234567890123456789012345678901234567890'];
      const mockChainId = '0x1';

      mockEthereum.request
        .mockResolvedValueOnce(mockAccounts) // eth_requestAccounts
        .mockResolvedValueOnce(mockChainId); // eth_chainId

      vi.mocked(EvmProvider).mockImplementation(
        () =>
          ({
            chainType: ChainType.Evm,
          }) as { chainType: ChainType },
      );

      const connection = await adapter.connect();

      expect(connection).toMatchObject({
        address: mockAccounts[0],
        accounts: mockAccounts,
        chain: {
          chainId: 'eip155:1', // Converted to CAIP-2 format
          chainType: ChainType.Evm,
        },
        walletId: 'evm-wallet',
      });

      expect(adapter.state.status).toBe('connected');
      expect(adapter.state.connection).toBe(connection);

      expect(mockEthereum.request).toHaveBeenCalledWith({ method: 'eth_requestAccounts' });
      expect(mockEthereum.request).toHaveBeenCalledWith({ method: 'eth_chainId' });
    });

    it('should throw error when EVM wallet not available', async () => {
      mockWindow.ethereum = undefined;

      await expect(adapter.connect()).rejects.toThrow('No Ethereum provider available');

      expect(adapter.state.status).toBe('disconnected');
    });

    it('should throw error when no accounts returned', async () => {
      mockEthereum.request.mockResolvedValueOnce([]); // Empty accounts

      await expect(adapter.connect()).rejects.toThrow('No accounts returned from wallet');
    });

    it('should handle connection failure without emitting error event', async () => {
      const errorHandler = vi.fn();
      adapter.on('error', errorHandler);

      mockEthereum.request.mockRejectedValue(new Error('User rejected'));

      await expect(adapter.connect()).rejects.toThrow('User rejected');

      // Error events are not emitted for connection failures (only for transport errors)
      expect(errorHandler).not.toHaveBeenCalled();
      expect(adapter.state.status).toBe('disconnected');
    });

    it('should set up event listeners on successful connection', async () => {
      mockEthereum.request.mockResolvedValueOnce(['0x123']).mockResolvedValueOnce('0x1');

      // Mock EvmProvider constructor to verify setupProviderListeners is called
      const mockProviderInstance = {
        isConnected: true,
        chainType: ChainType.Evm,
      };
      vi.mocked(EvmProvider).mockImplementation(() => mockProviderInstance as unknown as EvmProvider);

      await adapter.connect();

      // Since setupProviderListeners is called, verify ethereum.on is used
      // The adapter should have set up listeners through setupProviderListeners
      expect(mockEthereum.on).toHaveBeenCalledWith('accountsChanged', expect.any(Function));
      expect(mockEthereum.on).toHaveBeenCalledWith('chainChanged', expect.any(Function));
      expect(mockEthereum.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    });

    it('should update state to connected after connection', async () => {
      mockEthereum.request.mockResolvedValueOnce(['0x123']).mockResolvedValueOnce('0x1');

      // Mock EvmProvider constructor
      const mockProviderInstance = {
        isConnected: true,
        chainType: ChainType.Evm,
      };
      vi.mocked(EvmProvider).mockImplementation(() => mockProviderInstance as unknown as EvmProvider);

      await adapter.connect();

      expect(adapter.state.status).toBe('connected');
    });
  });

  describe('disconnect', () => {
    beforeEach(async () => {
      await adapter.install({
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
      });
    });

    it('should disconnect successfully', async () => {
      // Connect first
      mockEthereum.request.mockResolvedValueOnce(['0x123']).mockResolvedValueOnce('0x1');

      // Mock EvmProvider constructor
      const mockProviderInstance = {
        isConnected: true,
        chainType: ChainType.Evm,
      };
      vi.mocked(EvmProvider).mockImplementation(() => mockProviderInstance as unknown as EvmProvider);

      await adapter.connect();

      expect(adapter.state.status).toBe('connected');

      await adapter.disconnect();

      expect(adapter.state.status).toBe('disconnected');
      expect(adapter.state.connection).toBeNull();
    });

    it('should transition from connected to disconnected', async () => {
      // Connect first
      mockEthereum.request.mockResolvedValueOnce(['0x123']).mockResolvedValueOnce('0x1');

      // Mock EvmProvider constructor
      const mockProviderInstance = {
        isConnected: true,
        chainType: ChainType.Evm,
      };
      vi.mocked(EvmProvider).mockImplementation(() => mockProviderInstance as unknown as EvmProvider);

      await adapter.connect();

      expect(adapter.state.status).toBe('connected');

      await adapter.disconnect();

      expect(adapter.state.status).toBe('disconnected');
      expect(adapter.state.connection).toBeNull();
    });

    it('should handle disconnect when not connected', async () => {
      // Connect then disconnect first
      mockEthereum.request.mockResolvedValueOnce(['0x123']).mockResolvedValueOnce('0x1');
      await adapter.connect();
      await adapter.disconnect(); // First disconnect

      await adapter.disconnect(); // Second disconnect when already disconnected

      // Should not throw
      expect(adapter.state.status).toBe('disconnected');
    });
  });

  describe('getProvider', () => {
    beforeEach(async () => {
      await adapter.install({
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
      });
    });

    it('should get EVM provider when connected', async () => {
      mockEthereum.request.mockResolvedValueOnce(['0x123']).mockResolvedValueOnce('0x1');

      const mockProvider = { chainType: ChainType.Evm };
      vi.mocked(EvmProvider).mockImplementation(() => mockProvider as { chainType: ChainType });

      await adapter.connect();

      const provider = adapter.getProvider(ChainType.Evm);

      expect(provider).toBe(mockProvider);
    });

    it('should throw error for non-EVM chain type', async () => {
      mockEthereum.request.mockResolvedValueOnce(['0x123']).mockResolvedValueOnce('0x1');

      await adapter.connect();

      expect(() => adapter.getProvider(ChainType.Solana)).toThrow(
        'EVM adapter does not support solana chains',
      );
    });

    it('should throw error when not connected', () => {
      expect(() => adapter.getProvider(ChainType.Evm)).toThrow('Not connected to EVM wallet');
    });
  });

  describe('hasProvider', () => {
    beforeEach(async () => {
      await adapter.install({
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
      });
    });

    it('should return true for EVM when connected', async () => {
      mockEthereum.request.mockResolvedValueOnce(['0x123']).mockResolvedValueOnce('0x1');

      await adapter.connect();

      expect(adapter.hasProvider(ChainType.Evm)).toBe(true);
    });

    it('should return false for non-EVM chains', async () => {
      mockEthereum.request.mockResolvedValueOnce(['0x123']).mockResolvedValueOnce('0x1');

      await adapter.connect();

      expect(adapter.hasProvider(ChainType.Solana)).toBe(false);
      expect(adapter.hasProvider(ChainType.Aztec)).toBe(false);
    });

    it('should return false when not connected', () => {
      expect(adapter.hasProvider(ChainType.Evm)).toBe(false);
    });
  });

  describe('Event listeners', () => {
    beforeEach(async () => {
      await adapter.install({
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
      });

      mockEthereum.request.mockResolvedValueOnce(['0x123', '0x456']).mockResolvedValueOnce('0x1');

      await adapter.connect();
    });

    it('should handle accountsChanged event', () => {
      const eventHandler = vi.fn();
      adapter.on('wallet:accountsChanged', eventHandler);

      // Get the accountsChanged handler
      const accountsChangedHandler = mockEthereum.on.mock.calls.find(
        (call) => call[0] === 'accountsChanged',
      )?.[1];

      // Simulate accounts changed
      accountsChangedHandler(['0x789', '0xabc']);

      expect(eventHandler).toHaveBeenCalledWith({
        accounts: ['0x789', '0xabc'],
        chainType: ChainType.Evm,
      });
    });

    it('should disconnect when all accounts removed', async () => {
      const disconnectSpy = vi.spyOn(adapter, 'disconnect');

      // Get the accountsChanged handler
      const accountsChangedHandler = mockEthereum.on.mock.calls.find(
        (call) => call[0] === 'accountsChanged',
      )?.[1];

      // Simulate all accounts removed
      await accountsChangedHandler([]);

      expect(disconnectSpy).toHaveBeenCalled();
      await vi.waitFor(() => expect(adapter.state.status).toBe('disconnected'));
    });

    it('should handle chainChanged event', () => {
      const eventHandler = vi.fn();
      adapter.on('wallet:chainChanged', eventHandler);

      // Get the chainChanged handler
      const chainChangedHandler = mockEthereum.on.mock.calls.find((call) => call[0] === 'chainChanged')?.[1];

      // Simulate chain changed
      chainChangedHandler('0x89');

      expect(eventHandler).toHaveBeenCalledWith({
        chainId: '0x89',
        chainType: ChainType.Evm,
      });

      // Note: connection chainId is not automatically updated by the event
    });

    it('should handle disconnect event', async () => {
      const eventHandler = vi.fn();
      adapter.on('wallet:disconnected', eventHandler);

      // Get the disconnect handler
      const disconnectHandler = mockEthereum.on.mock.calls.find((call) => call[0] === 'disconnect')?.[1];

      // Simulate disconnect
      disconnectHandler();

      expect(eventHandler).toHaveBeenCalledWith({
        reason: 'Provider disconnected',
      });
    });
  });

  describe('getJSONRPCTransport', () => {
    beforeEach(async () => {
      await adapter.install({
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
      });
    });

    it('should return transport for EVM', () => {
      const transport = adapter.getJSONRPCTransport(ChainType.Evm);

      expect(transport).toBeDefined();
      expect(transport?.send).toBeTypeOf('function');
      expect(transport?.onMessage).toBeTypeOf('function');
    });

    it('should return undefined for non-EVM chains', () => {
      expect(adapter.getJSONRPCTransport(ChainType.Solana)).toBeUndefined();
      expect(adapter.getJSONRPCTransport(ChainType.Aztec)).toBeUndefined();
    });

    it('should return undefined when ethereum not available', () => {
      mockWindow.ethereum = undefined;

      const transport = adapter.getJSONRPCTransport(ChainType.Evm);

      expect(transport).toBeUndefined();
    });

    it('should return undefined in server environment', () => {
      (global as typeof global & { window?: Window }).window = undefined;

      const transport = adapter.getJSONRPCTransport(ChainType.Evm);

      expect(transport).toBeUndefined();
    });

    it('should send messages through ethereum.request', async () => {
      const transport = adapter.getJSONRPCTransport(ChainType.Evm);

      const message = {
        method: 'eth_accounts',
        params: [],
      };

      mockEthereum.request.mockResolvedValue(['0x123']);

      await transport?.send(message);

      expect(mockEthereum.request).toHaveBeenCalledWith({
        method: 'eth_accounts',
        params: [],
      });
    });

    it('should handle provider events through onMessage', () => {
      const transport = adapter.getJSONRPCTransport(ChainType.Evm);
      const messageHandler = vi.fn();

      transport?.onMessage(messageHandler);

      // Get event handlers
      const handlers = mockEthereum.on.mock.calls;

      // Simulate accountsChanged
      const accountsHandler = handlers.find((call) => call[0] === 'accountsChanged')?.[1];
      accountsHandler(['0x123']);

      expect(messageHandler).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        event: 'accountsChanged',
        params: ['0x123'],
      });

      // Simulate chainChanged
      const chainHandler = handlers.find((call) => call[0] === 'chainChanged')?.[1];
      chainHandler('0x1');

      expect(messageHandler).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        event: 'chainChanged',
        params: { chainId: '0x1' },
      });
    });
  });

  describe('Edge cases', () => {
    beforeEach(async () => {
      await adapter.install({
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
      });
    });

    it('should handle missing eth_chainId response', async () => {
      mockEthereum.request.mockResolvedValueOnce(['0x123']).mockResolvedValueOnce(null); // No chain ID

      await adapter.connect();

      expect(adapter.state.connection?.chain.chainId).toBe('eip155:1'); // Default to mainnet in CAIP-2 format
    });

    it('should handle ethereum provider without event methods', async () => {
      mockEthereum.on = undefined;

      mockEthereum.request.mockResolvedValueOnce(['0x123']).mockResolvedValueOnce('0x1');

      // Should not throw
      await adapter.connect();

      expect(adapter.state.status).toBe('connected');
    });

    it('should handle non-array accounts in event', async () => {
      mockEthereum.request.mockResolvedValueOnce(['0x123']).mockResolvedValueOnce('0x1');

      await adapter.connect();

      const accountsChangedHandler = mockEthereum.on.mock.calls.find(
        (call) => call[0] === 'accountsChanged',
      )?.[1];

      // Send non-array accounts
      accountsChangedHandler('not-an-array');

      // Should not update or throw
      expect(adapter.state.connection?.accounts).toEqual(['0x123']);
    });

    it('should handle non-string chainId in event', async () => {
      mockEthereum.request.mockResolvedValueOnce(['0x123']).mockResolvedValueOnce('0x1');

      await adapter.connect();

      const chainChangedHandler = mockEthereum.on.mock.calls.find((call) => call[0] === 'chainChanged')?.[1];

      // Send non-string chainId
      chainChangedHandler(123);

      // Should not update or throw
      expect(adapter.state.connection?.chain.chainId).toBe('eip155:1');
    });
  });

  describe('State management', () => {
    beforeEach(async () => {
      await adapter.install({
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
      });
    });

    it('should emit state:changed events', async () => {
      const stateHandler = vi.fn();
      adapter.on('state:changed', stateHandler);

      mockEthereum.request.mockResolvedValueOnce(['0x123']).mockResolvedValueOnce('0x1');

      await adapter.connect();

      // Should emit connected state
      expect(stateHandler).toHaveBeenCalled();
      const calls = stateHandler.mock.calls;
      const statuses = calls.map((call) => call[0].state.status);
      expect(statuses).toContain('connected');
    });

    it('should compute derived state properties correctly', async () => {
      // Initial state
      expect(adapter.state.status).toBe('disconnected');
      expect(adapter.state.isConnected).toBe(false);
      expect(adapter.state.isConnecting).toBe(false);

      // Test state changes through actual connection flow
      mockEthereum.request.mockResolvedValueOnce(['0x123']).mockResolvedValueOnce('0x1');

      const connectPromise = adapter.connect();

      // State should transition to connecting (this happens synchronously at start of connect)
      // Note: The actual state change might happen asynchronously, so we test the end state

      await connectPromise;

      // After connection, state should be updated
      expect(adapter.state.status).toBe('connected');
      expect(adapter.state.isConnected).toBe(true);
      expect(adapter.state.isConnecting).toBe(false);
      expect(adapter.state.connection).toBeTruthy();
      expect(adapter.state.address).toBe('0x123');
      expect(adapter.state.chain?.chainId).toBe('eip155:1');
      expect(adapter.state.chain?.chainType).toBe(ChainType.Evm);
    });
  });
});
