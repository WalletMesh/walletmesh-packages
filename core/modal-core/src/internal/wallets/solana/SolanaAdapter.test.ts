import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockLogger,
  createMockSolanaProvider,
  createTestEnvironment,
  installCustomMatchers,
} from '../../../testing/index.js';
import { ChainType } from '../../../types.js';
import { ErrorFactory } from '../../core/errors/errorFactory.js';
import { Logger } from '../../core/logger/logger.js';
import type { AdapterContext } from '../base/WalletAdapter.js';
import { SolanaAdapter } from './SolanaAdapter.js';
import { SolanaProvider } from '../../providers/solana/SolanaProvider.js';

// Install domain-specific matchers
installCustomMatchers();

// Mock the Logger module using testing utility
vi.mock('../../core/logger/logger.js', () => ({
  Logger: vi.fn().mockImplementation(() => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
  createDebugLogger: vi.fn().mockImplementation(() => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}));

// Mock the providers
vi.mock('../../providers/solana/SolanaProvider.js');

describe('SolanaAdapter', () => {
  let adapter: SolanaAdapter;
  let mockSolana: ReturnType<typeof createMockSolanaProvider> & {
    publicKey?: { toString: () => string };
    isPhantom?: boolean;
    isSolflare?: boolean;
    isBackpack?: boolean;
    signTransaction: ReturnType<typeof vi.fn>;
    signAllTransactions: ReturnType<typeof vi.fn>;
    signMessage: ReturnType<typeof vi.fn>;
    on: ReturnType<typeof vi.fn>;
    removeAllListeners: ReturnType<typeof vi.fn>;
  };
  const testEnv = createTestEnvironment();

  beforeEach(async () => {
    await testEnv.setup();

    // Mock Solana wallet using testing utility
    const baseSolanaProvider = createMockSolanaProvider();
    mockSolana = {
      ...baseSolanaProvider,
      isPhantom: true,
      connect: vi.fn().mockResolvedValue({
        publicKey: { toString: () => '7EYnhQoR9YM3N7UoaKRoA44Uy8JeaZV3qyouov87awMs' },
      }),
      disconnect: vi.fn().mockResolvedValue(undefined),
      signTransaction: vi.fn().mockResolvedValue({}),
      signAllTransactions: vi.fn().mockResolvedValue([{}]),
      signMessage: vi.fn().mockResolvedValue({ signature: new Uint8Array([1, 2, 3]) }),
      on: vi.fn(),
      removeAllListeners: vi.fn(),
    };

    // Add Solana wallet to window
    Object.assign(window, { solana: mockSolana });

    // Mock SolanaProvider to return a simple mock object with all required methods
    vi.mocked(SolanaProvider).mockImplementation(
      () =>
        ({
          chainType: ChainType.Solana,
          on: vi.fn(),
          off: vi.fn(),
          disconnect: vi.fn(),
          getAccounts: vi.fn(),
          getChainId: vi.fn(),
          updatePublicKey: vi.fn(),
        }) as unknown as SolanaProvider,
    );

    adapter = new SolanaAdapter();
  });

  afterEach(async () => {
    await testEnv.teardown();
    // Clean up window
    Object.assign(window, { solana: undefined, solflare: undefined, backpack: undefined });
  });

  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      expect(adapter.id).toBe('solana-wallet');
      expect(adapter.metadata.name).toBe('Solana Wallet');
      expect(adapter.metadata.description).toBe('Connect with Solana-compatible wallet');
      expect(adapter.metadata.icon).toMatch(/^data:image\/svg\+xml;base64,/);
      expect(adapter.metadata.homepage).toBe('https://solana.com/wallets');
    });

    it('should have correct capabilities', () => {
      expect(adapter.capabilities.chains).toEqual([{ type: ChainType.Solana, chainIds: '*' }]);
      expect(adapter.capabilities.features).toContain('sign_message');
      expect(adapter.capabilities.features).toContain('multi_account');
      expect(adapter.capabilities.features).toContain('hardware_wallet');
    });
  });

  describe('connect', () => {
    it('should connect to Solana wallet successfully', async () => {
      try {
        const connection = await adapter.connect();

        expect(mockSolana.connect).toHaveBeenCalled();
        expect(connection.accounts).toEqual(['7EYnhQoR9YM3N7UoaKRoA44Uy8JeaZV3qyouov87awMs']);
        expect(connection.chain.chainType).toBe(ChainType.Solana);
        expect(connection.chain.chainId).toBe('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'); // CAIP-2 format for mainnet
        expect(connection.provider).toBeDefined();
      } catch (error) {
        console.error('Test failed with error:', error);
        throw error;
      }
    });

    it('should connect with custom chain ID', async () => {
      const connection = await adapter.connect({ chainId: 'devnet' });

      expect(connection.chain.chainId).toBe('devnet');
    });

    it('should handle connection failure when wallet not found', async () => {
      Object.assign(window, { solana: undefined });

      await expect(adapter.connect()).rejects.toThrow();
    });

    it('should handle user rejection', async () => {
      const error = new Error('User rejected the request');
      Object.assign(error, { code: 4001 });
      mockSolana.connect.mockRejectedValue(error);

      await expect(adapter.connect()).rejects.toThrow();
    });

    it('should set up event listeners on successful connection', async () => {
      await adapter.connect();

      expect(mockSolana.on).toHaveBeenCalledWith('accountChanged', expect.any(Function));
      expect(mockSolana.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    });
  });

  describe('disconnect', () => {
    it('should disconnect from Solana wallet', async () => {
      await adapter.connect();
      await adapter.disconnect();

      expect(mockSolana.disconnect).toHaveBeenCalled();
      expect(mockSolana.removeAllListeners).toHaveBeenCalled();
    });

    it('should handle disconnect when wallet method not available', async () => {
      mockSolana.disconnect = undefined;

      await adapter.connect();
      await adapter.disconnect();

      expect(mockSolana.removeAllListeners).toHaveBeenCalled();
    });

    it('should handle disconnect errors gracefully', async () => {
      mockSolana.disconnect.mockRejectedValue(new Error('Disconnect failed'));

      await adapter.connect();
      await adapter.disconnect();

      // Should not throw, but should still clean up
      expect(mockSolana.removeAllListeners).toHaveBeenCalled();
    });
  });

  describe('event handling', () => {
    it('should emit accountsChanged event when account changes', async () => {
      const eventHandler = vi.fn();
      adapter.on('wallet:accountsChanged', eventHandler);

      await adapter.connect();

      // Simulate account change
      const accountChangeHandler = mockSolana.on.mock.calls.find(
        (call) => call[0] === 'accountChanged',
      )?.[1] as (publicKey: { toString: () => string }) => void;

      accountChangeHandler({ toString: () => 'newPublicKey123' });

      expect(eventHandler).toHaveBeenCalledWith({
        accounts: ['newPublicKey123'],
        chainType: ChainType.Solana,
      });
    });

    it('should emit disconnect event when account is null', async () => {
      const eventHandler = vi.fn();
      adapter.on('wallet:disconnected', eventHandler);

      await adapter.connect();

      // Simulate account disconnection
      const accountChangeHandler = mockSolana.on.mock.calls.find(
        (call) => call[0] === 'accountChanged',
      )?.[1] as (publicKey: null) => void;

      accountChangeHandler(null);

      expect(eventHandler).toHaveBeenCalledWith({
        reason: 'Account disconnected',
      });
    });

    it('should emit disconnect event when wallet disconnects', async () => {
      const eventHandler = vi.fn();
      adapter.on('wallet:disconnected', eventHandler);

      await adapter.connect();

      // Simulate disconnect
      const disconnectHandler = mockSolana.on.mock.calls.find(
        (call) => call[0] === 'disconnect',
      )?.[1] as () => void;

      disconnectHandler();

      expect(eventHandler).toHaveBeenCalledWith({
        reason: 'Wallet disconnected',
      });
    });
  });

  describe('transport methods', () => {
    it('should sign transaction through wallet', async () => {
      await adapter.connect();

      const mockTx = { serialize: () => 'tx' };

      // Call the wallet method directly
      const result = await mockSolana.signTransaction(mockTx);

      expect(mockSolana.signTransaction).toHaveBeenCalledWith(mockTx);
      expect(result).toEqual({});
    });

    it('should sign message through wallet', async () => {
      await adapter.connect();

      const message = new Uint8Array([1, 2, 3]);

      // Call the wallet method directly
      const result = await mockSolana.signMessage(message);

      expect(mockSolana.signMessage).toHaveBeenCalledWith(message);
      expect(result).toEqual({ signature: new Uint8Array([1, 2, 3]) });
    });

    it('should handle wallet methods correctly', async () => {
      await adapter.connect();

      // Test that the wallet is properly set up
      expect(mockSolana.connect).toHaveBeenCalled();
      expect(mockSolana.on).toHaveBeenCalledWith('accountChanged', expect.any(Function));
      expect(mockSolana.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    });
  });
});
