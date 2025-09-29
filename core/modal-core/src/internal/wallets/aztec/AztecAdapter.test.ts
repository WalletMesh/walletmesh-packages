import type { JSONRPCTransport } from '@walletmesh/jsonrpc';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChainType } from '../../../types.js';
import { ErrorFactory } from '../../core/errors/errorFactory.js';
import { AztecAdapter } from './AztecAdapter.js';

// Mock the dynamic import of @walletmesh/aztec-rpc-wallet
vi.mock('@walletmesh/aztec-rpc-wallet', () => ({
  AztecRouterProvider: vi.fn().mockImplementation((_transport: JSONRPCTransport) => ({
    connect: vi.fn().mockResolvedValue({ sessionId: 'session-123' }),
    disconnect: vi.fn().mockResolvedValue(undefined),
    call: vi.fn().mockImplementation(async (_network: string, request: { method: string }) => {
      if (request.method === 'aztec_getAddress') {
        return 'aztec1address';
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
    it('should connect successfully with provided transport', async () => {
      adapter = new AztecAdapter({ transport: mockTransport });

      const connection = await adapter.connect();
      const provider = adapter.getProvider(ChainType.Aztec) as unknown as {
        connect: ReturnType<typeof vi.fn>;
        call: ReturnType<typeof vi.fn>;
        disconnect: ReturnType<typeof vi.fn>;
      };

      expect(connection).toBeDefined();
      expect(connection.walletId).toBe('aztec-wallet');
      expect(connection.address).toBe('aztec1address');
      expect(connection.accounts).toEqual(['aztec1address']);
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
      expect(provider.connect).toHaveBeenCalledWith({ 'aztec:mainnet': ['aztec_getAddress'] });
    });

    it('should throw error when no transport is available', async () => {
      adapter = new AztecAdapter();

      // The error gets wrapped by the outer catch, so it becomes connection_failed
      await expect(adapter.connect()).rejects.toMatchObject({
        code: 'connection_failed',
        message: expect.stringContaining('Failed to connect'),
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

      adapter = new AztecAdapter({ transport: failingTransport });

      await expect(adapter.connect()).rejects.toMatchObject({
        code: 'connection_failed',
        message: expect.stringContaining('Failed to connect'),
      });
    });
  });

  describe('disconnect', () => {
    it('should disconnect successfully', async () => {
      adapter = new AztecAdapter({ transport: mockTransport });
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
      adapter = new AztecAdapter({ transport: mockTransport });
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
      expect(() => adapter.getProvider(ChainType.Aztec)).toThrow('Provider not found');
    });

    it('should return provider after connection', async () => {
      adapter = new AztecAdapter({ transport: mockTransport });
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
      adapter = new AztecAdapter({ transport: mockTransport });

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
});
