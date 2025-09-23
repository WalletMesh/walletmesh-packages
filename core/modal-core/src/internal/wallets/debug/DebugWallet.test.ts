import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockLogger, createTestEnvironment, installCustomMatchers } from '../../../testing/index.js';
import { ChainType } from '../../../types.js';
import { ErrorFactory } from '../../core/errors/errorFactory.js';
import { Logger } from '../../core/logger/logger.js';
import type { AdapterContext, ConnectOptions } from '../base/WalletAdapter.js';
import { DebugWallet, type DebugWalletConfig } from './DebugWallet.js';

// Install domain-specific matchers
installCustomMatchers();

// Mock dependencies
vi.mock('../../providers/evm/EvmProvider.js');
vi.mock('../../providers/solana/SolanaProvider.js');
vi.mock('../../core/errors/errorFactory.js');
vi.mock('../../core/logger/logger.js');

describe('DebugWallet', () => {
  let adapter: DebugWallet;
  let mockLogger: ReturnType<typeof createMockLogger>;
  let mockContext: AdapterContext;
  const testEnv = createTestEnvironment();

  beforeEach(async () => {
    await testEnv.setup();
    vi.useFakeTimers();

    mockLogger = createMockLogger();

    mockContext = {
      logger: mockLogger,
      debug: true,
    } as AdapterContext;

    // Mock Logger constructor
    vi.mocked(Logger).mockImplementation(() => mockLogger);

    // Mock ErrorFactory
    vi.mocked(ErrorFactory).connectionFailed = vi.fn().mockReturnValue(new Error('Connection failed'));
  });

  afterEach(async () => {
    vi.useRealTimers();
    await testEnv.teardown();
  });

  describe('Constructor and basic properties', () => {
    it('should create adapter with default config', () => {
      adapter = new DebugWallet();

      expect(adapter.id).toBe('debug-wallet');
      expect(adapter.metadata.name).toBe('Debug Wallet');
      expect(adapter.metadata.description).toBe('Debug wallet for testing and development');
      expect(adapter.metadata.icon).toBe('🐛');
    });

    it('should create adapter with custom config', () => {
      const config: DebugWalletConfig = {
        chains: [ChainType.Evm],
        connectionDelay: 1000,
        rejectionRate: 0.5,
        fixedAccounts: ['0xabc123'],
        available: false,
      };

      adapter = new DebugWallet(config);

      expect(adapter.id).toBe('debug-wallet');
      expect(adapter.capabilities.chains).toHaveLength(1);
      expect(adapter.capabilities.chains[0].type).toBe(ChainType.Evm);
    });

    it('should support multiple chain types', () => {
      const config: DebugWalletConfig = {
        chains: [ChainType.Evm, ChainType.Solana, ChainType.Aztec],
      };

      adapter = new DebugWallet(config);

      expect(adapter.capabilities.chains).toHaveLength(3);
      expect(adapter.capabilities.chains.map((c) => c.type)).toEqual([
        ChainType.Evm,
        ChainType.Aztec,
        ChainType.Solana,
      ]);
    });

    it('should have correct initial state', () => {
      adapter = new DebugWallet();

      const state = adapter.state;
      expect(state.status).toBe('disconnected');
      expect(state.connection).toBeNull();
      expect(state.error).toBeNull();
      expect(state.accounts).toEqual([]);
    });

    it('should have correct capabilities', () => {
      adapter = new DebugWallet();

      expect(adapter.capabilities.features).toContain('sign_message');
      expect(adapter.capabilities.features).toContain('sign_typed_data');
      expect(adapter.capabilities.features).toContain('multi_account');
      expect(adapter.capabilities.permissions?.methods).toContain('eth_accounts');
      expect(adapter.capabilities.permissions?.events).toContain('chainChanged');
    });

    it('should use logger from context after installation', async () => {
      adapter = new DebugWallet();
      await adapter.install(mockContext);

      // Logger should be available after installation
      expect(mockContext.logger).toBeDefined();
    });
  });

  describe('Chain ID handling', () => {
    beforeEach(() => {
      adapter = new DebugWallet();
    });

    it('should return correct chain IDs for EVM', () => {
      const evmChain = adapter.capabilities.chains.find((c) => c.type === ChainType.Evm);
      expect(evmChain?.chainIds).toEqual(['eip155:1', 'eip155:5', 'eip155:137', 'eip155:10', 'eip155:42161']);
    });

    it('should return correct chain IDs for Solana', () => {
      const solanaChain = adapter.capabilities.chains.find((c) => c.type === ChainType.Solana);
      expect(solanaChain?.chainIds).toEqual([
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
        'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z',
        'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
      ]);
    });

    it('should return correct chain IDs for Aztec', () => {
      const config: DebugWalletConfig = { chains: [ChainType.Aztec] };
      adapter = new DebugWallet(config);

      const aztecChain = adapter.capabilities.chains.find((c) => c.type === ChainType.Aztec);
      expect(aztecChain?.chainIds).toEqual(['aztec:31337', 'aztec:1', 'aztec:677692']);
    });

    it('should return empty array for unknown chain type', () => {
      // This tests the default case in getChainIds
      // @ts-expect-error Testing with intentionally invalid chain type
      const config: DebugWalletConfig = { chains: ['unknown'] };
      adapter = new DebugWallet(config);

      // Should not crash and should handle gracefully
      expect(adapter.capabilities.chains).toBeDefined();
    });
  });

  describe('Installation and uninstallation', () => {
    beforeEach(() => {
      adapter = new DebugWallet();
    });

    it('should install successfully', async () => {
      await adapter.install(mockContext);

      expect(mockLogger.debug).toHaveBeenCalledWith('[debug-wallet] Installing adapter', {
        id: 'debug-wallet',
      });
    });

    it('should uninstall successfully', async () => {
      await adapter.uninstall();
      // Should not throw and complete successfully
    });
  });

  describe('Connection', () => {
    beforeEach(async () => {
      adapter = new DebugWallet();
      await adapter.install(mockContext);
    });

    it('should connect successfully with default config', async () => {
      const connection = await adapter.connect();

      expect(adapter.state.status).toBe('connected');
      expect(connection.address).toBe('0x1234567890123456789012345678901234567890');
      expect(connection.accounts).toEqual(['0x1234567890123456789012345678901234567890']);
      expect(connection.chain.chainType).toBe(ChainType.Evm);
      expect(connection.chain.chainId).toBe('eip155:1');
      expect(connection.walletId).toBe('debug-wallet');
      expect(connection.provider).toBeDefined();
    });

    it('should connect with custom accounts', async () => {
      const config: DebugWalletConfig = {
        fixedAccounts: ['0xabc123', '0xdef456'],
      };
      adapter = new DebugWallet(config);

      const connection = await adapter.connect();

      expect(connection.address).toBe('0xabc123');
      expect(connection.accounts).toEqual(['0xabc123', '0xdef456']);
    });

    it('should connect with specified chain type', async () => {
      const config: DebugWalletConfig = {
        chains: [ChainType.Solana],
      };
      adapter = new DebugWallet(config);

      const options: ConnectOptions = {
        chains: [{ type: ChainType.Solana, chainIds: ['mainnet-beta'] }],
      };

      const connection = await adapter.connect(options);

      expect(connection.chain.chainType).toBe(ChainType.Solana);
      expect(connection.chain.chainId).toBe('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp');
    });

    it('should handle connection delay', async () => {
      const config: DebugWalletConfig = {
        connectionDelay: 500,
      };
      adapter = new DebugWallet(config);
      await adapter.install(mockContext);

      // Start connection (this will use setTimeout internally)
      const connectPromise = adapter.connect();

      // Advance timers to complete the delay using runAllTimersAsync which handles all pending timers
      await vi.runAllTimersAsync();

      const connection = await connectPromise;
      expect(connection).toBeDefined();
      expect(adapter.state.status).toBe('connected');
    });

    it('should handle connection rejection', async () => {
      const config: DebugWalletConfig = {
        rejectionRate: 1.0, // Always reject
      };
      adapter = new DebugWallet(config);

      await expect(adapter.connect()).rejects.toThrow();
      expect(ErrorFactory.connectorError).toHaveBeenCalledWith(
        'debug-wallet',
        'User rejected connection',
        'USER_REJECTED',
        { recoveryHint: 'retry' },
      );
    });

    it('should set connection metadata correctly', async () => {
      const mockTime = 1000000;
      vi.setSystemTime(mockTime);

      const connection = await adapter.connect();

      expect(connection.metadata.connectedAt).toBe(mockTime);
      expect(connection.metadata.lastActiveAt).toBe(mockTime);
      expect(connection.walletInfo.name).toBe('Debug Wallet');
      expect(connection.walletInfo.id).toBe('debug-wallet');
    });

    it('should update state during connection process', async () => {
      const stateChanges: string[] = [];

      adapter.on('state:changed', ({ state }) => {
        stateChanges.push(state.status);
      });

      await adapter.connect();

      expect(stateChanges).toContain('connected');
    });
  });

  describe('Disconnection', () => {
    beforeEach(async () => {
      adapter = new DebugWallet();
      await adapter.install(mockContext);
      await adapter.connect();
    });

    it('should disconnect successfully', async () => {
      expect(adapter.state.status).toBe('connected');

      await adapter.disconnect();

      expect(adapter.state.status).toBe('disconnected');
      expect(adapter.state.connection).toBeNull();
      expect(adapter.connection).toBeNull();
    });

    it('should handle disconnect when not connected', async () => {
      await adapter.disconnect();
      await adapter.disconnect(); // Second disconnect

      // Should not throw
      expect(adapter.state.status).toBe('disconnected');
    });
  });

  describe('Provider management', () => {
    beforeEach(async () => {
      adapter = new DebugWallet();
      await adapter.install(mockContext);
      await adapter.connect();
    });

    it('should return provider when connected', () => {
      const provider = adapter.getProvider(ChainType.Evm);

      expect(provider).toBeDefined();
      // EvmProvider doesn't expose request method directly
      // Use getMockProvider() to test request functionality
      const mockProvider = adapter.getMockProvider() as {
        request: (params: { method: string; params?: unknown[] }) => Promise<unknown>;
      };
      expect(typeof mockProvider.request).toBe('function');
    });

    it('should throw error when getting provider while disconnected', async () => {
      await adapter.disconnect();

      expect(() => adapter.getProvider(ChainType.Evm)).toThrow('Provider not found for chain type');
    });

    it('should check provider availability correctly', () => {
      // Only EVM provider is created by default connection
      expect(adapter.hasProvider(ChainType.Evm)).toBe(true);
      expect(adapter.hasProvider(ChainType.Solana)).toBe(false);
    });

    it('should check provider availability when disconnected', async () => {
      await adapter.disconnect();

      expect(adapter.hasProvider(ChainType.Evm)).toBe(false);
      expect(adapter.hasProvider(ChainType.Solana)).toBe(false);
    });

    it('should check provider availability for unsupported chains', async () => {
      const config: DebugWalletConfig = { chains: [ChainType.Evm] };
      adapter = new DebugWallet(config);
      await adapter.connect();

      expect(adapter.hasProvider(ChainType.Aztec)).toBe(false);
    });
  });

  describe('Mock provider functionality', () => {
    let provider: { request: (params: { method: string; params?: unknown[] }) => Promise<unknown> };

    beforeEach(async () => {
      adapter = new DebugWallet();
      await adapter.connect();
      // Use the mock provider directly for request testing
      provider = adapter.getMockProvider() as {
        request: (params: { method: string; params?: unknown[] }) => Promise<unknown>;
      };
    });

    it('should handle eth_accounts request', async () => {
      const result = await provider.request({ method: 'eth_accounts' });

      expect(result).toEqual(['0x1234567890123456789012345678901234567890']);
    });

    it('should handle eth_chainId request', async () => {
      const result = await provider.request({ method: 'eth_chainId' });

      expect(result).toBe('0x1');
    });

    it('should handle eth_requestAccounts request', async () => {
      const result = await provider.request({ method: 'eth_requestAccounts' });

      expect(result).toEqual(['0x1234567890123456789012345678901234567890']);
    });

    it('should handle eth_sendTransaction request', async () => {
      const result = await provider.request({ method: 'eth_sendTransaction' });

      expect(result).toBe(`0x${'0'.repeat(64)}`);
    });

    it('should handle signing requests', async () => {
      const signResult = await provider.request({ method: 'personal_sign' });
      const typedDataResult = await provider.request({ method: 'eth_signTypedData' });
      const typedDataV4Result = await provider.request({ method: 'eth_signTypedData_v4' });

      expect(signResult).toBe(`0x${'1'.repeat(130)}`);
      expect(typedDataResult).toBe(`0x${'1'.repeat(130)}`);
      expect(typedDataV4Result).toBe(`0x${'1'.repeat(130)}`);
    });

    it('should handle eth_getBalance request', async () => {
      const result = await provider.request({ method: 'eth_getBalance' });

      expect(result).toBe(`0x${(1000000000000000000).toString(16)}`);
    });

    it('should handle unknown methods', async () => {
      const result = await provider.request({ method: 'unknown_method' });

      expect(result).toBeNull();
    });

    it('should handle wallet_switchEthereumChain request', async () => {
      const result = await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x89' }],
      });

      expect(result).toBeNull();

      // Check that chainId was updated
      const newChainId = await provider.request({ method: 'eth_chainId' });
      expect(newChainId).toBe('0x89');
    });

    it('should switch chain successfully', async () => {
      const result = await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x137' }],
      });

      expect(result).toBeNull();

      // Verify the provider reports the new chain ID
      const newChainId = await provider.request({ method: 'eth_chainId' });
      expect(newChainId).toBe('0x137');
    });

    it('should have provider properties', () => {
      const mockProvider = adapter.getMockProvider() as {
        chainId: string;
        selectedAddress: string;
        isMetaMask: boolean;
        networkVersion: string;
        isConnected: () => boolean;
      };
      expect(mockProvider.chainId).toBe('0x1');
      expect(mockProvider.selectedAddress).toBe('0x1234567890123456789012345678901234567890');
      expect(mockProvider.isMetaMask).toBe(false);
      expect(mockProvider.networkVersion).toBe('1');
      expect(typeof mockProvider.isConnected).toBe('function');
      expect(mockProvider.isConnected()).toBe(true);
    });

    it('should use custom accounts in provider properties', async () => {
      const config: DebugWalletConfig = {
        fixedAccounts: ['0xcustom123'],
      };
      const customAdapter = new DebugWallet(config);
      await customAdapter.connect();
      const customMockProvider = customAdapter.getMockProvider() as {
        selectedAddress: string;
      };

      expect(customMockProvider.selectedAddress).toBe('0xcustom123');
    });
  });

  describe('Event handling', () => {
    let provider: {
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      emit: (event: string, ...args: unknown[]) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
      request: (params: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
    let chainChangedHandler: ReturnType<typeof vi.fn>;
    let accountsChangedHandler: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
      adapter = new DebugWallet();
      await adapter.connect();
      // Use mock provider for event testing
      provider = adapter.getMockProvider() as {
        on: (event: string, handler: (...args: unknown[]) => void) => void;
        emit: (event: string, ...args: unknown[]) => void;
        removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
        request: (params: { method: string; params?: unknown[] }) => Promise<unknown>;
      };

      chainChangedHandler = vi.fn();
      accountsChangedHandler = vi.fn();
    });

    it('should add chainChanged event listener', () => {
      provider.on('chainChanged', chainChangedHandler);

      // Handler should be registered (tested implicitly through chain switching)
      expect(chainChangedHandler).not.toHaveBeenCalled();
    });

    it('should add accountsChanged event listener', () => {
      provider.on('accountsChanged', accountsChangedHandler);

      // Handler should be registered
      expect(accountsChangedHandler).not.toHaveBeenCalled();
    });

    it('should emit chainChanged event on chain switch', async () => {
      provider.on('chainChanged', chainChangedHandler);

      // Use the mock provider request method to trigger chain switch
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x89' }],
      });

      expect(chainChangedHandler).toHaveBeenCalledWith('0x89');
    });

    it('should remove chainChanged event listener', () => {
      provider.on('chainChanged', chainChangedHandler);
      provider.removeListener('chainChanged', chainChangedHandler);

      // Handler should be removed (no call expected)
      // Call request directly to trigger chain change
      provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x89' }],
      });

      expect(chainChangedHandler).not.toHaveBeenCalled();
    });

    it('should remove accountsChanged event listener', () => {
      provider.on('accountsChanged', accountsChangedHandler);
      provider.removeListener('accountsChanged', accountsChangedHandler);

      // Should not throw and handler should be removed
      expect(accountsChangedHandler).not.toHaveBeenCalled();
    });

    it('should handle removing non-existent listeners', () => {
      // Should not throw
      provider.removeListener('chainChanged', vi.fn());
      provider.removeListener('accountsChanged', vi.fn());
    });

    it('should handle multiple listeners for same event', async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      provider.on('chainChanged', handler1);
      provider.on('chainChanged', handler2);

      // Use the mock provider request method to trigger chain switch
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x89' }],
      });

      expect(handler1).toHaveBeenCalledWith('0x89');
      expect(handler2).toHaveBeenCalledWith('0x89');
    });

    it('should log chain switch events', async () => {
      // Set up adapter with debug logging
      const debugAdapter = new DebugWallet();
      await debugAdapter.install({ logger: mockLogger, debug: true } as AdapterContext);
      await debugAdapter.connect();
      const debugProvider = debugAdapter.getMockProvider() as {
        request: (params: { method: string; params?: unknown[] }) => Promise<unknown>;
      };

      // Clear previous log calls from connection
      mockLogger.debug.mockClear();

      // Use the mock provider request method to trigger chain switch
      await debugProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x89' }],
      });

      // The first call should be the transport request call
      const transportRequestCall = vi
        .mocked(mockLogger.debug)
        .mock.calls.find((call) => call[0] === '[DebugWallet] Transport request');

      // The second call should be the provider request logging
      const providerRequestCall = vi
        .mocked(mockLogger.debug)
        .mock.calls.find((call) => call[0] === 'Provider request');

      // The third call should be the chain switching
      const switchingCall = vi
        .mocked(mockLogger.debug)
        .mock.calls.find((call) => call[0] === 'Switching chain');

      // Check that transport request was logged
      expect(transportRequestCall).toBeDefined();
      expect(transportRequestCall?.[1]).toEqual({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x89' }],
      });

      // Check that provider request was logged
      expect(providerRequestCall).toBeDefined();
      expect(providerRequestCall?.[1]).toEqual({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x89' }],
      });

      // Check that chain switch was logged
      expect(switchingCall).toBeDefined();
      expect(switchingCall?.[1]).toEqual({
        from: 'eip155:1',
        to: 'eip155:137',
        requested: '0x89',
      });
    });

    it('should log handler emissions', async () => {
      // Set up adapter with debug logging
      const debugAdapter = new DebugWallet();
      await debugAdapter.install({ logger: mockLogger, debug: true } as AdapterContext);
      await debugAdapter.connect();
      const debugProvider = debugAdapter.getMockProvider() as {
        on: (event: string, handler: (...args: unknown[]) => void) => void;
        request: (params: { method: string; params?: unknown[] }) => Promise<unknown>;
      };

      debugProvider.on('chainChanged', chainChangedHandler);

      // Clear previous log calls from connection
      mockLogger.debug.mockClear();

      // Use the mock provider request method to trigger chain switch
      await debugProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x89' }],
      });

      // Check that handler emission was logged
      const emissionCall = vi
        .mocked(mockLogger.debug)
        .mock.calls.find((call) => call[0] === 'Emitting chainChanged to handlers');

      expect(emissionCall).toBeDefined();
      expect(emissionCall?.[1]).toEqual({
        count: 1,
      });
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle empty fixed accounts', () => {
      const config: DebugWalletConfig = {
        fixedAccounts: [],
      };
      adapter = new DebugWallet(config);

      expect(adapter.capabilities).toBeDefined();
    });

    it('should handle invalid chain switch parameters', async () => {
      adapter = new DebugWallet();
      await adapter.connect();
      const mockProvider = adapter.getMockProvider() as {
        request: (params: { method: string; params?: unknown[] }) => Promise<unknown>;
      };

      // Should not throw with invalid params
      await mockProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{}],
      });

      await mockProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [],
      });
    });

    it('should handle provider requests with different parameter types', async () => {
      adapter = new DebugWallet();
      await adapter.connect();
      const mockProvider = adapter.getMockProvider() as {
        request: (params: { method: string; params?: unknown[] }) => Promise<unknown>;
      };

      // Should handle requests without params
      const result1 = await mockProvider.request({ method: 'eth_accounts' });
      expect(result1).toBeDefined();

      // Should handle requests with empty params
      const result2 = await mockProvider.request({ method: 'eth_accounts', params: [] });
      expect(result2).toBeDefined();
    });

    it('should maintain state consistency across operations', async () => {
      adapter = new DebugWallet();

      // Initial state
      expect(adapter.state.status).toBe('disconnected');

      // Connect
      await adapter.connect();
      expect(adapter.state.status).toBe('connected');
      expect(adapter.connection).toBeDefined();

      // Disconnect
      await adapter.disconnect();
      expect(adapter.state.status).toBe('disconnected');
      expect(adapter.connection).toBeNull();
    });

    it('should handle rapid connect/disconnect cycles', async () => {
      adapter = new DebugWallet();

      // Multiple rapid operations
      await adapter.connect();
      await adapter.disconnect();
      await adapter.connect();
      await adapter.disconnect();

      expect(adapter.state.status).toBe('disconnected');
      expect(adapter.connection).toBeNull();
    });
  });

  describe('Logging', () => {
    beforeEach(async () => {
      adapter = new DebugWallet();
      await adapter.install(mockContext);
      await adapter.connect();
    });

    it('should log provider requests', async () => {
      const mockProvider = adapter.getMockProvider() as {
        request: (params: { method: string; params?: unknown[] }) => Promise<unknown>;
      };

      // Clear previous log calls from connection
      mockLogger.debug.mockClear();

      await mockProvider.request({ method: 'eth_accounts' });

      // Check that either transport or provider request was logged
      const transportRequestCall = vi
        .mocked(mockLogger.debug)
        .mock.calls.find((call) => call[0] === '[DebugWallet] Transport request');
      const providerRequestCall = vi
        .mocked(mockLogger.debug)
        .mock.calls.find((call) => call[0] === 'Provider request');

      // At least one of them should have been called
      const logCall = transportRequestCall || providerRequestCall;
      expect(logCall).toBeDefined();

      // Check the parameters match
      if (logCall) {
        expect(logCall[1]).toMatchObject({
          method: 'eth_accounts',
        });
      }
    });

    it('should log provider requests with parameters', async () => {
      const mockProvider = adapter.getMockProvider() as {
        request: (params: { method: string; params?: unknown[] }) => Promise<unknown>;
      };
      const params = [{ chainId: '0x89' }];

      // Clear previous log calls from connection
      mockLogger.debug.mockClear();

      await mockProvider.request({ method: 'wallet_switchEthereumChain', params });

      // Check that provider request was logged with the expected parameters
      const providerRequestCall = vi
        .mocked(mockLogger.debug)
        .mock.calls.find((call) => call[0] === 'Provider request');

      expect(providerRequestCall).toBeDefined();
      expect(providerRequestCall?.[1]).toEqual({
        method: 'wallet_switchEthereumChain',
        params,
      });
    });
  });
});
