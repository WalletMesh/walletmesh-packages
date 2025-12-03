import { JSONRPCNode, type JSONRPCTransport } from '@walletmesh/jsonrpc';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SolanaTransaction } from '../../../api/types/providers.js';
import {
  createMockJSONRPCNode,
  createMockJSONRPCTransport,
  createTestEnvironment,
  installCustomMatchers,
} from '../../../testing/index.js';
import { ChainType } from '../../../types.js';
import type { WalletProviderContext } from '../base/BaseWalletProvider.js';
import { SolanaProvider } from './SolanaProvider.js';

// Install domain-specific matchers
installCustomMatchers();

// Type for provider with exposed internals for testing
type MockJSONRPCNode = ReturnType<typeof createMockJSONRPCNode>;

// Provider with exposed internals for testing
type TestableSolanaProvider = SolanaProvider & {
  context: WalletProviderContext;
  publicKey: string | null;
};

// Mock the JSONRPCNode to avoid complex initialization
vi.mock('@walletmesh/jsonrpc', () => ({
  JSONRPCNode: vi.fn().mockImplementation(() => ({
    callMethod: vi.fn(),
    publishEvent: vi.fn(),
    setContext: vi.fn(),
    on: vi.fn().mockReturnValue(() => {}), // Return cleanup function
    once: vi.fn(),
    removeListener: vi.fn(),
    destroy: vi.fn(),
    context: {},
  })),
  JSONRPCError: vi.fn().mockImplementation((code, message, data) => {
    const error = new Error(message);
    Object.assign(error, { code, data, name: 'JSONRPCError' });
    return error;
  }),
}));

describe('SolanaProvider', () => {
  let provider: SolanaProvider;
  let mockTransport: JSONRPCTransport;
  let mockJsonrpcNode: MockJSONRPCNode;
  const testEnv = createTestEnvironment();

  beforeEach(async () => {
    await testEnv.setup();

    mockTransport = createMockJSONRPCTransport();
    mockJsonrpcNode = createMockJSONRPCNode();

    vi.mocked(JSONRPCNode).mockImplementation(() => mockJsonrpcNode);

    provider = new SolanaProvider(ChainType.Solana, mockTransport);

    // Update context to set connected state for tests
    const testProvider = provider as TestableSolanaProvider;
    testProvider.context = {
      chainType: ChainType.Solana,
      chainId: '',
      accounts: [],
      isConnected: true, // Set to connected for most tests
      providerData: {},
    };
    Object.assign(mockJsonrpcNode.context, testProvider.context);
  });

  afterEach(async () => {
    await testEnv.teardown();
  });

  describe('constructor', () => {
    it('should initialize with Solana chain type', () => {
      expect((provider as TestableSolanaProvider).context.chainType).toBe(ChainType.Solana);
    });
  });

  describe('Solana-specific methods', () => {
    beforeEach(() => {
      // Clear mock calls
      mockJsonrpcNode.callMethod.mockClear();
    });

    it('should get public key', () => {
      // Set public key
      (provider as TestableSolanaProvider).publicKey = '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d';

      const publicKey = provider.getPublicKey();

      expect(publicKey).toBe('5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d');
    });

    it('should sign transaction', async () => {
      // Set connected state with public key
      (provider as TestableSolanaProvider).publicKey = '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d';

      const mockTransaction: SolanaTransaction = {
        recentBlockhash: 'blockhash',
        feePayer: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d',
        instructions: [],
      };
      const signature = 'mockSignature';
      mockJsonrpcNode.callMethod.mockResolvedValue(signature);

      const result = await provider.signTransaction(mockTransaction);

      expect(mockJsonrpcNode.callMethod).toHaveBeenCalledWith('solana_signTransaction', [mockTransaction]);
      expect(result).toBe(signature);
    });

    it('should connect to wallet', async () => {
      const publicKey = '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d';
      mockJsonrpcNode.callMethod.mockResolvedValue({ publicKey });

      const result = await provider.connect();

      expect(mockJsonrpcNode.callMethod).toHaveBeenCalledWith('solana_connect', undefined);
      expect(result).toEqual({ publicKey });
      expect((provider as TestableSolanaProvider).publicKey).toBe(publicKey);
      expect((provider as TestableSolanaProvider).context.accounts).toEqual([publicKey]);
      expect((provider as TestableSolanaProvider).context.isConnected).toBe(true);
    });

    it('should sign message', async () => {
      // Set connected state with public key
      (provider as TestableSolanaProvider).publicKey = '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d';

      const message = 'Hello, Solana!';
      const signature = 'mockSignature';
      mockJsonrpcNode.callMethod.mockResolvedValue(signature);

      const result = await provider.signMessage(message);

      expect(mockJsonrpcNode.callMethod).toHaveBeenCalledWith('solana_signMessage', [message]);
      expect(result).toBe(signature);
    });
  });

  describe('abstract method implementations', () => {
    it('should handle getAccounts via handleGetAccounts', async () => {
      const publicKey = '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d';
      mockJsonrpcNode.callMethod.mockResolvedValue([publicKey]);

      const accounts = await provider.getAccounts();

      expect(mockJsonrpcNode.callMethod).toHaveBeenCalledWith('solana_getAccounts', undefined);
      expect(accounts).toEqual([publicKey]);
    });

    it('should handle getChainId via handleGetChainId', async () => {
      // Solana doesn't have traditional chain IDs, so it returns the initialized chain ID
      const result = await provider.getChainId();

      // Should return the default chain ID from context
      expect(result).toBe('solana-mainnet');
    });

    it('should handle disconnect', async () => {
      // Mock disconnect
      mockJsonrpcNode.callMethod.mockResolvedValue(undefined);

      await provider.disconnect();

      expect(mockJsonrpcNode.callMethod).toHaveBeenCalledWith('solana_disconnect', undefined);
      // Context should be updated
      expect((provider as TestableSolanaProvider).context.isConnected).toBe(false);
      expect((provider as TestableSolanaProvider).context.accounts).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('should throw error when not connected', async () => {
      (provider as TestableSolanaProvider).context.isConnected = false;
      (provider as TestableSolanaProvider).publicKey = null;

      await expect(provider.signTransaction({} as SolanaTransaction)).rejects.toThrow(
        'Solana provider not connected',
      );
      await expect(provider.signMessage('message')).rejects.toThrow('Solana provider not connected');
    });

    it('should handle disconnect errors gracefully', async () => {
      // Set connected state
      (provider as TestableSolanaProvider).publicKey = '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d';
      (provider as TestableSolanaProvider).context.isConnected = true;
      (provider as TestableSolanaProvider).context.accounts = [
        '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d',
      ];

      // Mock disconnect to throw error
      mockJsonrpcNode.callMethod.mockRejectedValue(new Error('Disconnect failed'));

      // Should still clean up state even if wallet disconnect fails
      await expect(provider.disconnect()).rejects.toThrow('Failed to disconnect from Solana wallet');

      // State should be cleaned up
      expect((provider as TestableSolanaProvider).publicKey).toBe(null);
      expect((provider as TestableSolanaProvider).context.isConnected).toBe(false);
      expect((provider as TestableSolanaProvider).context.accounts).toEqual([]);
    });
  });
});
