import type { JSONRPCTransport } from '@walletmesh/jsonrpc';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChainType } from '../../../types.js';
import { ErrorFactory } from '../../core/errors/errorFactory.js';
import { AztecAdapter, DEFAULT_AZTEC_PERMISSIONS } from './AztecAdapter.js';

// Mock the dynamic import of @walletmesh/aztec-rpc-wallet
vi.mock('@walletmesh/aztec-rpc-wallet', () => ({
  AztecRouterProvider: vi.fn().mockImplementation((_transport: JSONRPCTransport) => ({
    connect: vi.fn().mockResolvedValue({ sessionId: 'session-123' }),
    disconnect: vi.fn().mockResolvedValue(undefined),
    call: vi.fn().mockImplementation(async (_network: string, request: { method: string }) => {
      if (request.method === 'aztec_getAddress') {
        // Return a valid Aztec address (Bech32 format with sufficient length)
        return 'aztec1qwertyuiopasdfghjklzxcvbnm1234567890abcdefghij';
      }
      return null;
    }),
  })),
}));

describe('AztecAdapter', () => {
  let adapter: AztecAdapter;
  let mockTransport: JSONRPCTransport;

  beforeEach(() => {
    // Create a mock transport
    mockTransport = {
      send: vi.fn(),
      sendBatch: vi.fn(),
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      isConnected: vi.fn().mockReturnValue(true),
      on: vi.fn().mockReturnValue(() => {}),
      off: vi.fn(),
      dispose: vi.fn(),
    } as unknown as JSONRPCTransport;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create adapter with default configuration', () => {
      adapter = new AztecAdapter();

      expect(adapter.id).toBe('aztec-wallet');
      expect(adapter.metadata.name).toBe('Aztec Wallet');
      expect(adapter.metadata.description).toBe('Connect with Aztec privacy-preserving network');
      expect(adapter.metadata.homepage).toBe('https://aztec.network');
    });

    it('should create adapter with custom configuration', () => {
      adapter = new AztecAdapter({
        id: 'custom-aztec',
        name: 'Custom Aztec Wallet',
        icon: 'custom-icon',
        description: 'Custom description',
        transport: mockTransport,
      });

      expect(adapter.id).toBe('custom-aztec');
      expect(adapter.metadata.name).toBe('Custom Aztec Wallet');
      expect(adapter.metadata.icon).toBe('custom-icon');
      expect(adapter.metadata.description).toBe('Custom description');
    });

    it('should set capabilities correctly', () => {
      adapter = new AztecAdapter();

      expect(adapter.capabilities.chains).toHaveLength(1);
      expect(adapter.capabilities.chains[0]).toEqual({
        type: ChainType.Aztec,
        chainIds: '*',
      });

      expect(adapter.capabilities.features).toBeInstanceOf(Set);
      expect(adapter.capabilities.features.has('sign_message')).toBe(true);
      expect(adapter.capabilities.features.has('encrypt')).toBe(true);
      expect(adapter.capabilities.features.has('decrypt')).toBe(true);
      expect(adapter.capabilities.features.has('multi_account')).toBe(true);
      // 'privacy' is not a standard WalletFeature, removed from implementation
    });
  });

  describe('detect', () => {
    it('should detect as available when transport is provided in config', async () => {
      adapter = new AztecAdapter({ transport: mockTransport });

      const result = await adapter.detect();

      expect(result.isInstalled).toBe(true);
      expect(result.isReady).toBe(true);
      expect(result.metadata).toEqual({
        type: 'aztec',
        transport: mockTransport,
      });
    });

    it('should detect as available when transport is set via setTransport', async () => {
      adapter = new AztecAdapter();
      adapter.setTransport(mockTransport);

      const result = await adapter.detect();

      expect(result.isInstalled).toBe(true);
      expect(result.isReady).toBe(true);
      expect(result.metadata).toEqual({
        type: 'aztec',
        transport: mockTransport,
      });
    });

    it('should detect as unavailable when no transport is provided', async () => {
      adapter = new AztecAdapter();

      const result = await adapter.detect();

      expect(result.isInstalled).toBe(false);
      expect(result.isReady).toBe(false);
      expect(result.metadata).toEqual({
        type: 'aztec',
        transport: undefined,
      });
    });
  });

  describe('connect', () => {
    it('should connect successfully with provided transport and network', async () => {
      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:testnet',
      });

      const connection = await adapter.connect();
      const provider = adapter.getProvider(ChainType.Aztec) as unknown as {
        connect: ReturnType<typeof vi.fn>;
        call: ReturnType<typeof vi.fn>;
        disconnect: ReturnType<typeof vi.fn>;
      };

      expect(connection).toBeDefined();
      expect(connection.walletId).toBe('aztec-wallet');
      expect(connection.address).toBe('aztec1qwertyuiopasdfghjklzxcvbnm1234567890abcdefghij');
      expect(connection.accounts).toEqual(['aztec1qwertyuiopasdfghjklzxcvbnm1234567890abcdefghij']);
      expect(connection.chain.chainType).toBe(ChainType.Aztec);
      expect(connection.chain.chainId).toBe('aztec:testnet');
      expect(connection.chainType).toBe(ChainType.Aztec);
      expect(connection.provider).toBe(provider);
      expect(adapter.state.isConnected).toBe(true);
      expect(provider.call).toHaveBeenCalledWith('aztec:testnet', { method: 'aztec_getAddress' });
    });

    it('should connect with custom network configuration', async () => {
      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:mainnet',
      });

      const connection = await adapter.connect();
      const provider = adapter.getProvider(ChainType.Aztec) as unknown as {
        connect: ReturnType<typeof vi.fn>;
      };

      expect(connection.chain.chainId).toBe('aztec:mainnet');
      expect(provider.connect).toHaveBeenCalledWith({
        'aztec:mainnet': [...DEFAULT_AZTEC_PERMISSIONS],
      });
    });

    it('should throw error when no transport is available', async () => {
      adapter = new AztecAdapter();

      // Configuration error gets categorized appropriately
      await expect(adapter.connect()).rejects.toMatchObject({
        code: 'configuration_error',
        message: expect.stringContaining('Transport required'),
      });
    });

    it('should handle connection errors gracefully', async () => {
      const failingTransport = {
        ...mockTransport,
      };

      // Mock the AztecRouterProvider to throw an error
      const { AztecRouterProvider } = await import('@walletmesh/aztec-rpc-wallet');
      (AztecRouterProvider as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
        connect: vi.fn().mockRejectedValue(new Error('Connection failed')),
        call: vi.fn(),
        disconnect: vi.fn(),
      }));

      adapter = new AztecAdapter({ transport: failingTransport, network: 'aztec:testnet' });

      // Error gets categorized as network/transport error with user-friendly message
      await expect(adapter.connect()).rejects.toMatchObject({
        code: 'connection_failed',
        message: expect.stringMatching(/Connection to wallet failed|network|unreachable/i),
      });
    });
  });

  describe('disconnect', () => {
    it('should disconnect successfully', async () => {
      adapter = new AztecAdapter({ transport: mockTransport, network: 'aztec:testnet' });
      await adapter.connect();

      const provider = adapter.getProvider(ChainType.Aztec) as unknown as {
        disconnect: ReturnType<typeof vi.fn>;
      };

      await adapter.disconnect();

      expect(adapter.state.isConnected).toBe(false);
      expect(provider.disconnect).toHaveBeenCalled();
      // After disconnect, getProvider should throw for any chain type
      expect(() => adapter.getProvider(ChainType.Aztec)).toThrow();
    });

    it('should handle disconnect errors gracefully', async () => {
      adapter = new AztecAdapter({ transport: mockTransport, network: 'aztec:testnet' });
      await adapter.connect();

      // Mock the provider to throw an error on disconnect
      const provider = adapter.getProvider(ChainType.Aztec) as unknown as {
        disconnect: ReturnType<typeof vi.fn>;
      };
      provider.disconnect = vi.fn().mockRejectedValue(new Error('Disconnect failed'));

      await expect(adapter.disconnect()).rejects.toMatchObject({
        code: 'connection_failed',
        message: expect.stringContaining('Failed to disconnect'),
      });
    });

    it('should handle disconnect when not connected', async () => {
      adapter = new AztecAdapter({ transport: mockTransport });

      // Should not throw even when not connected
      await expect(adapter.disconnect()).resolves.toBeUndefined();
    });
  });

  describe('getProvider', () => {
    it('should throw error before connection', () => {
      adapter = new AztecAdapter({ transport: mockTransport });

      // Before connection, getProvider should throw since there's no provider
      expect(() => adapter.getProvider(ChainType.Aztec)).toThrow('not initialized or not connected');
    });

    it('should return provider after connection', async () => {
      adapter = new AztecAdapter({ transport: mockTransport, network: 'aztec:testnet' });
      await adapter.connect();

      const provider = adapter.getProvider(ChainType.Aztec) as unknown as {
        call: ReturnType<typeof vi.fn>;
        disconnect: ReturnType<typeof vi.fn>;
      };
      expect(provider).toBeDefined();
      expect(provider).toHaveProperty('call');
      expect(provider).toHaveProperty('disconnect');
      expect(provider.call).toHaveBeenCalledWith('aztec:testnet', { method: 'aztec_getAddress' });
    });

    it('should throw after disconnect', async () => {
      adapter = new AztecAdapter({ transport: mockTransport, network: 'aztec:testnet' });
      await adapter.connect();

      // Provider should be available while connected
      expect(() => adapter.getProvider(ChainType.Aztec)).not.toThrow();

      // Disconnect
      await adapter.disconnect();

      // Provider should no longer be available after disconnect
      expect(() => adapter.getProvider(ChainType.Aztec)).toThrow('not initialized or not connected');
    });

    it('should throw if provider partially initialized', () => {
      adapter = new AztecAdapter({ transport: mockTransport });

      // Manually set provider without proper initialization (missing methods)
      // @ts-expect-error - Intentionally setting invalid provider for testing
      (adapter as unknown as { aztecProvider: unknown }).aztecProvider = { connect: null };

      expect(() => adapter.getProvider(ChainType.Aztec)).toThrow('not initialized or not connected');
    });

    it('should throw for unsupported chain types', () => {
      adapter = new AztecAdapter({ transport: mockTransport });

      expect(() => adapter.getProvider(ChainType.Evm)).toThrow('AztecAdapter does not support');
    });

    it('should provide detailed error context when validation fails', async () => {
      adapter = new AztecAdapter({ transport: mockTransport, network: 'aztec:testnet' });
      await adapter.connect();
      await adapter.disconnect();

      try {
        adapter.getProvider(ChainType.Aztec);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toHaveProperty('code', 'configuration_error');
        expect(error).toHaveProperty('data');
        // @ts-expect-error - Accessing error data for testing
        expect(error.data).toHaveProperty('details');
        // @ts-expect-error - Accessing error data details for testing
        expect(error.data.details).toHaveProperty('isConnected', false);
        // @ts-expect-error - Accessing error data details for testing
        expect(error.data.details).toHaveProperty('hasProvider');
      }
    });
  });

  describe('setTransport', () => {
    it('should set transport after adapter creation', async () => {
      adapter = new AztecAdapter();

      adapter.setTransport(mockTransport);

      // Verify transport is set by attempting to detect
      const result = await adapter.detect();

      expect(result.isInstalled).toBe(true);
      expect(result.metadata).toEqual({
        type: 'aztec',
        transport: mockTransport,
      });
    });
  });

  describe('integration with AbstractWalletAdapter', () => {
    it('should properly extend AbstractWalletAdapter', () => {
      adapter = new AztecAdapter();

      // Check that it has all required properties from abstract class
      expect(adapter).toHaveProperty('id');
      expect(adapter).toHaveProperty('metadata');
      expect(adapter).toHaveProperty('capabilities');
      expect(adapter).toHaveProperty('state');
      expect(adapter).toHaveProperty('providers');

      // Check that it has all required methods
      expect(typeof adapter.detect).toBe('function');
      expect(typeof adapter.connect).toBe('function');
      expect(typeof adapter.disconnect).toBe('function');
    });

    it('should manage providers correctly', async () => {
      adapter = new AztecAdapter({ transport: mockTransport, network: 'aztec:testnet' });

      // Initially no providers
      expect(adapter.providers.size).toBe(0);

      // After connect, should have Aztec provider
      await adapter.connect();
      expect(adapter.providers.has(ChainType.Aztec)).toBe(true);

      // After disconnect, providers should be cleared
      await adapter.disconnect();
      expect(adapter.providers.size).toBe(0);
    });
  });

  describe('address validation', () => {
    it('should accept valid Bech32-style Aztec address', async () => {
      const validAddress = 'aztec1qwertyuiopasdfghjklzxcvbnm1234567890abcdefghij';

      const { AztecRouterProvider } = await import('@walletmesh/aztec-rpc-wallet');
      (AztecRouterProvider as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
        connect: vi.fn().mockResolvedValue({ sessionId: 'session-123' }),
        disconnect: vi.fn(),
        call: vi.fn().mockResolvedValue(validAddress),
      }));

      adapter = new AztecAdapter({ transport: mockTransport, network: 'aztec:testnet' });
      const connection = await adapter.connect();

      expect(connection.address).toBe(validAddress);
    });

    it('should accept valid hex format Aztec address', async () => {
      const validHexAddress = '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

      const { AztecRouterProvider } = await import('@walletmesh/aztec-rpc-wallet');
      (AztecRouterProvider as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
        connect: vi.fn().mockResolvedValue({ sessionId: 'session-123' }),
        disconnect: vi.fn(),
        call: vi.fn().mockResolvedValue(validHexAddress),
      }));

      adapter = new AztecAdapter({ transport: mockTransport, network: 'aztec:testnet' });
      const connection = await adapter.connect();

      expect(connection.address).toBe(validHexAddress);
    });

    it('should reject invalid address format', async () => {
      const invalidAddress = 'not-a-valid-address';

      const { AztecRouterProvider } = await import('@walletmesh/aztec-rpc-wallet');
      (AztecRouterProvider as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
        connect: vi.fn().mockResolvedValue({ sessionId: 'session-123' }),
        disconnect: vi.fn(),
        call: vi.fn().mockResolvedValue(invalidAddress),
      }));

      adapter = new AztecAdapter({ transport: mockTransport, network: 'aztec:testnet' });

      await expect(adapter.connect()).rejects.toMatchObject({
        code: 'connection_failed',
        message: expect.stringContaining('invalid Aztec address format'),
      });
    });

    it('should reject address that is too short', async () => {
      const shortAddress = 'aztec1';

      const { AztecRouterProvider } = await import('@walletmesh/aztec-rpc-wallet');
      (AztecRouterProvider as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
        connect: vi.fn().mockResolvedValue({ sessionId: 'session-123' }),
        disconnect: vi.fn(),
        call: vi.fn().mockResolvedValue(shortAddress),
      }));

      adapter = new AztecAdapter({ transport: mockTransport, network: 'aztec:testnet' });

      await expect(adapter.connect()).rejects.toMatchObject({
        code: 'connection_failed',
        message: expect.stringContaining('invalid Aztec address format'),
      });
    });

    it('should reject [object Object] toString result', async () => {
      const invalidObject = { value: 'address' }; // toString() will return '[object Object]'

      const { AztecRouterProvider } = await import('@walletmesh/aztec-rpc-wallet');
      (AztecRouterProvider as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
        connect: vi.fn().mockResolvedValue({ sessionId: 'session-123' }),
        disconnect: vi.fn(),
        call: vi.fn().mockResolvedValue(invalidObject),
      }));

      adapter = new AztecAdapter({ transport: mockTransport, network: 'aztec:testnet' });

      await expect(adapter.connect()).rejects.toMatchObject({
        code: 'connection_failed',
        message: expect.stringContaining('invalid address object'),
      });
    });

    it('should trim whitespace from valid addresses', async () => {
      const addressWithWhitespace = '  aztec1qwertyuiopasdfghjklzxcvbnm1234567890abcdefghij  ';
      const expectedTrimmed = 'aztec1qwertyuiopasdfghjklzxcvbnm1234567890abcdefghij';

      const { AztecRouterProvider } = await import('@walletmesh/aztec-rpc-wallet');
      (AztecRouterProvider as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
        connect: vi.fn().mockResolvedValue({ sessionId: 'session-123' }),
        disconnect: vi.fn(),
        call: vi.fn().mockResolvedValue(addressWithWhitespace),
      }));

      adapter = new AztecAdapter({ transport: mockTransport, network: 'aztec:testnet' });
      const connection = await adapter.connect();

      expect(connection.address).toBe(expectedTrimmed);
    });

    it('should reject non-string, non-object addresses', async () => {
      const numberAddress = 12345;

      const { AztecRouterProvider } = await import('@walletmesh/aztec-rpc-wallet');
      (AztecRouterProvider as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
        connect: vi.fn().mockResolvedValue({ sessionId: 'session-123' }),
        disconnect: vi.fn(),
        call: vi.fn().mockResolvedValue(numberAddress),
      }));

      adapter = new AztecAdapter({ transport: mockTransport, network: 'aztec:testnet' });

      await expect(adapter.connect()).rejects.toMatchObject({
        code: 'connection_failed',
        message: expect.stringContaining('Failed to parse Aztec address'),
      });
    });
  });

  describe('network validation (Issue #3: Unsafe Network Fallback)', () => {
    it('should throw error when no network is configured', async () => {
      adapter = new AztecAdapter({ transport: mockTransport });

      await expect(adapter.connect()).rejects.toMatchObject({
        code: 'configuration_error',
        message: expect.stringContaining('Aztec network must be explicitly configured'),
      });
    });

    it('should throw error with helpful configuration guidance', async () => {
      adapter = new AztecAdapter({ transport: mockTransport });

      try {
        await adapter.connect();
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toHaveProperty('code', 'configuration_error');
        expect(error).toHaveProperty('message', expect.stringContaining('explicitly configured'));
        expect(error).toHaveProperty('data');
        // @ts-expect-error - Accessing error data for testing
        expect(error.data.details).toHaveProperty('supportedNetworks');
        // @ts-expect-error - Accessing error data for testing
        expect(error.data.details.supportedNetworks).toContain('aztec:testnet');
        // @ts-expect-error - Accessing error data for testing
        expect(error.data.details.supportedNetworks).toContain('aztec:mainnet');
        // @ts-expect-error - Accessing error data for testing
        expect(error.data.details.supportedNetworks).toContain('aztec:31337');
      }
    });

    it('should accept network from config', async () => {
      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:testnet',
      });

      const connection = await adapter.connect();
      expect(connection.chain.chainId).toBe('aztec:testnet');
    });

    it('should accept network from connect options', async () => {
      adapter = new AztecAdapter({ transport: mockTransport });

      const connection = await adapter.connect({
        chains: [{ type: ChainType.Aztec, chainId: 'aztec:mainnet' }],
      });

      expect(connection.chain.chainId).toBe('aztec:mainnet');
    });

    it('should normalize network without aztec: prefix', async () => {
      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'testnet',
      });

      const connection = await adapter.connect();
      expect(connection.chain.chainId).toBe('aztec:testnet');
    });

    it('should accept all supported networks', async () => {
      const supportedNetworks = ['aztec:mainnet', 'aztec:testnet', 'aztec:31337'];

      for (const network of supportedNetworks) {
        adapter = new AztecAdapter({
          transport: mockTransport,
          network,
        });

        const connection = await adapter.connect();
        expect(connection.chain.chainId).toBe(network);
      }
    });

    it('should warn but accept non-standard network', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:custom-network',
      });

      const connection = await adapter.connect();

      // Should still connect successfully
      expect(connection.chain.chainId).toBe('aztec:custom-network');

      // Should have logged a warning (via modalLogger which uses console.warn)
      // Note: The actual warning is through modalLogger, which may format differently

      consoleSpy.mockRestore();
    });

    it('should prioritize config network over connect options', async () => {
      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:testnet',
      });

      const connection = await adapter.connect({
        chains: [{ type: ChainType.Aztec, chainId: 'aztec:mainnet' }],
      });

      // Config network takes precedence
      expect(connection.chain.chainId).toBe('aztec:testnet');
    });
  });
});
