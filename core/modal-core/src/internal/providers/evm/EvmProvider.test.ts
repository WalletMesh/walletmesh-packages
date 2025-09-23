import { JSONRPCNode, type JSONRPCTransport } from '@walletmesh/jsonrpc';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockJSONRPCNode,
  createMockJSONRPCTransport,
  createTestEnvironment,
  installCustomMatchers,
} from '../../../testing/index.js';
import { ChainType } from '../../../types.js';
import type { WalletProviderContext } from '../base/BaseWalletProvider.js';

import { EvmProvider } from './EvmProvider.js';

// Install domain-specific matchers
installCustomMatchers();

// Type for provider with exposed internals for testing
type MockJSONRPCNode = ReturnType<typeof createMockJSONRPCNode>;

// Provider with exposed internals for testing
type TestableEvmProvider = EvmProvider & {
  context: WalletProviderContext;
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

describe('EvmProvider', () => {
  let provider: EvmProvider;
  let mockTransport: JSONRPCTransport;
  let mockJsonrpcNode: MockJSONRPCNode;
  const testEnv = createTestEnvironment();

  beforeEach(async () => {
    await testEnv.setup();

    mockTransport = createMockJSONRPCTransport();
    mockJsonrpcNode = createMockJSONRPCNode();

    vi.mocked(JSONRPCNode).mockImplementation(() => mockJsonrpcNode);

    provider = new EvmProvider(ChainType.Evm, mockTransport);

    // Update context to set connected state for tests
    const testProvider = provider as TestableEvmProvider;
    testProvider.context = {
      chainType: ChainType.Evm,
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
    it('should initialize with EVM chain type', () => {
      expect((provider as TestableEvmProvider).context.chainType).toBe(ChainType.Evm);
    });
  });

  describe('EVM-specific methods', () => {
    beforeEach(() => {
      // Clear mock calls
      mockJsonrpcNode.callMethod.mockClear();
    });

    it('should request accounts', async () => {
      const accounts = ['0x1234567890123456789012345678901234567890'];
      mockJsonrpcNode.callMethod.mockResolvedValue(accounts);

      const result = await provider.requestAccounts();

      expect(mockJsonrpcNode.callMethod).toHaveBeenCalledWith('eth_requestAccounts', undefined);
      expect(result).toEqual(accounts);
      const testProvider = provider as TestableEvmProvider;
      expect(testProvider.context.accounts).toEqual(accounts);
      expect(testProvider.context.isConnected).toBe(true);
    });

    it('should get balance', async () => {
      const address = '0x1234567890123456789012345678901234567890';
      mockJsonrpcNode.callMethod.mockResolvedValue('0xde0b6b3a7640000');

      const balance = await provider.getBalance(address);

      expect(mockJsonrpcNode.callMethod).toHaveBeenCalledWith('eth_getBalance', [address, 'latest']);
      expect(balance).toBe('0xde0b6b3a7640000');
    });

    it('should get balance with custom block', async () => {
      const address = '0x1234567890123456789012345678901234567890';
      const blockNumber = '0x123';
      mockJsonrpcNode.callMethod.mockResolvedValue('0xde0b6b3a7640000');

      const balance = await provider.getBalance(address, blockNumber);

      expect(mockJsonrpcNode.callMethod).toHaveBeenCalledWith('eth_getBalance', [address, blockNumber]);
      expect(balance).toBe('0xde0b6b3a7640000');
    });

    it('should send transaction', async () => {
      const tx = { from: '0x123', to: '0x456', value: '0x0' };
      const txHash = '0xabcdef1234567890';
      mockJsonrpcNode.callMethod.mockResolvedValue(txHash);

      const hash = await provider.sendTransaction(tx);

      expect(mockJsonrpcNode.callMethod).toHaveBeenCalledWith('eth_sendTransaction', [tx]);
      expect(hash).toBe(txHash);
    });

    it('should sign message', async () => {
      // Add account to context for validation
      (provider as TestableEvmProvider).context.accounts = ['0x1234567890123456789012345678901234567890'];

      const address = '0x1234567890123456789012345678901234567890';
      const message = 'Hello, Ethereum!';
      const signature = '0xsignature';
      mockJsonrpcNode.callMethod.mockResolvedValue(signature);

      const sig = await provider.signMessage(address, message);

      expect(mockJsonrpcNode.callMethod).toHaveBeenCalledWith('eth_signMessage', [address, message]);
      expect(sig).toBe(signature);
    });

    it('should switch chain', async () => {
      const chainId = '0x89'; // Polygon
      mockJsonrpcNode.callMethod.mockResolvedValue(null);

      await provider.switchChain(chainId);

      expect(mockJsonrpcNode.callMethod).toHaveBeenCalledWith('wallet_switchEthereumChain', [{ chainId }]);
      expect((provider as TestableEvmProvider).context.chainId).toBe(chainId);
    });
  });

  describe('abstract method implementations', () => {
    it('should handle getAccounts via handleGetAccounts', async () => {
      mockJsonrpcNode.callMethod.mockResolvedValue(['0x1234567890123456789012345678901234567890']);

      const accounts = await provider.getAccounts();

      expect(mockJsonrpcNode.callMethod).toHaveBeenCalledWith('eth_accounts', undefined);
      expect(accounts).toEqual(['0x1234567890123456789012345678901234567890']);
    });

    it('should handle getChainId via handleGetChainId', async () => {
      mockJsonrpcNode.callMethod.mockResolvedValue('0x1');

      const chainId = await provider.getChainId();

      expect(mockJsonrpcNode.callMethod).toHaveBeenCalledWith('eth_chainId', undefined);
      expect(chainId).toBe('0x1');
    });

    it('should handle disconnect', async () => {
      await provider.disconnect();

      // Context should be updated
      const testProvider = provider as TestableEvmProvider;
      expect(testProvider.context.isConnected).toBe(false);
      expect(testProvider.context.accounts).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('should throw error when not connected', async () => {
      (provider as TestableEvmProvider).context.isConnected = false;

      await expect(provider.sendTransaction({ from: '0x123', to: '0x456' })).rejects.toThrow(
        'EVM provider not connected',
      );
      await expect(provider.signMessage('0x123', 'message')).rejects.toThrow('EVM provider not connected');
      await expect(provider.getBalance('0x123')).rejects.toThrow('EVM provider not connected');
      await expect(provider.switchChain('0x1')).rejects.toThrow('EVM provider not connected');
    });

    it('should throw error when signing with non-connected account', async () => {
      (provider as TestableEvmProvider).context.accounts = ['0x456'];

      await expect(provider.signMessage('0x123', 'message')).rejects.toThrow('Account not connected: 0x123');
    });
  });
});
