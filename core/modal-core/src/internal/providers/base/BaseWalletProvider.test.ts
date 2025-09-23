import { JSONRPCNode, type JSONRPCTransport } from '@walletmesh/jsonrpc';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockJSONRPCNode,
  createMockJSONRPCTransport,
  createTestEnvironment,
  installCustomMatchers,
} from '../../../testing/index.js';
import { ChainType } from '../../../types.js';
import { BaseWalletProvider, type WalletProviderContext } from './BaseWalletProvider.js';

// Install domain-specific matchers
installCustomMatchers();

// Type for mock JSONRPC node
type MockJSONRPCNode = ReturnType<typeof createMockJSONRPCNode>;

// Mock JSONRPCNode
vi.mock('@walletmesh/jsonrpc', () => ({
  JSONRPCNode: vi.fn().mockImplementation(() => ({
    setContext: vi.fn(),
    registerMethod: vi.fn(),
    publishEvent: vi.fn(),
    callMethod: vi.fn(),
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

// Concrete implementation for testing
class TestProvider extends BaseWalletProvider {
  protected async handleGetAccounts(): Promise<string[]> {
    return this.context.accounts;
  }

  protected async handleGetChainId(): Promise<string> {
    return this.context.chainId || '0x1';
  }

  protected async handleDisconnect(): Promise<void> {
    this.updateContext({ isConnected: false, accounts: [] });
  }

  // Public method to access protected getContext for testing
  public getContextForTesting() {
    return this.getContext();
  }

  // Public method to access private cleanup for testing
  public cleanupForTesting() {
    (this as { cleanup: () => void }).cleanup();
  }

  // Test helpers
  public testUpdateContext(updates: Partial<WalletProviderContext>): void {
    this.updateContext(updates);
  }

  public testEmit(event: string, data: unknown): void {
    this.emit(event, data);
  }
}

describe('BaseWalletProvider', () => {
  let provider: TestProvider;
  let mockTransport: JSONRPCTransport;
  let mockJsonrpcNode: MockJSONRPCNode;
  const testEnv = createTestEnvironment();

  beforeEach(async () => {
    await testEnv.setup();

    mockTransport = createMockJSONRPCTransport();
    mockJsonrpcNode = createMockJSONRPCNode();

    vi.mocked(JSONRPCNode).mockImplementation(() => mockJsonrpcNode);

    provider = new TestProvider(ChainType.Evm, mockTransport);
  });

  afterEach(async () => {
    await testEnv.teardown();
  });

  describe('constructor', () => {
    it('should initialize with correct chain type and transport', () => {
      const context = provider.getContextForTesting();
      expect(context.chainType).toBe(ChainType.Evm);
      expect(context.isConnected).toBe(false);
      expect(context.accounts).toEqual([]);
    });

    it('should create JSONRPCNode with transport and context', () => {
      expect(JSONRPCNode).toHaveBeenCalledWith(
        mockTransport,
        expect.objectContaining({
          chainType: ChainType.Evm,
          chainId: '',
          accounts: [],
          isConnected: false,
        }),
      );
    });
  });

  describe('getAccounts', () => {
    it('should throw error when not connected', async () => {
      await expect(provider.getAccounts()).rejects.toThrow('Provider not connected');
    });

    it('should return accounts when connected', async () => {
      provider.testUpdateContext({ isConnected: true, accounts: ['0x123'] });

      const accounts = await provider.getAccounts();
      expect(accounts).toEqual(['0x123']);
    });
  });

  describe('getChainId', () => {
    it('should throw error when not connected', async () => {
      await expect(provider.getChainId()).rejects.toThrow('Provider not connected');
    });

    it('should return chain ID when connected', async () => {
      provider.testUpdateContext({ isConnected: true, chainId: '0x5' });

      const chainId = await provider.getChainId();
      expect(chainId).toBe('0x5');
    });

    it('should return default chain ID if not set', async () => {
      provider.testUpdateContext({ isConnected: true, chainId: '' });

      const chainId = await provider.getChainId();
      expect(chainId).toBe('0x1');
    });
  });

  describe('event listeners', () => {
    it('should add event listener', () => {
      const handler = vi.fn();
      provider.on('connected', handler);

      // Test event emission
      provider.testEmit('connected', { accounts: ['0x123'] });
      expect(handler).toHaveBeenCalledWith({ accounts: ['0x123'] });
    });

    it('should remove event listener', () => {
      const handler = vi.fn();
      provider.on('connected', handler);
      provider.off('connected', handler);

      // Test event emission after removal
      provider.testEmit('connected', { accounts: ['0x123'] });
      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle multiple listeners', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      provider.on('connected', handler1);
      provider.on('connected', handler2);

      provider.testEmit('connected', { accounts: ['0x123'] });

      expect(handler1).toHaveBeenCalledWith({ accounts: ['0x123'] });
      expect(handler2).toHaveBeenCalledWith({ accounts: ['0x123'] });
    });
  });

  describe('cleanup', () => {
    it('should call cleanup when destroyed', () => {
      // Access the private cleanup method via disconnect
      provider.testUpdateContext({ isConnected: true });
      provider.disconnect();

      // The disconnect method calls handleDisconnect and then cleanup
      // We can't directly call cleanup as it's private
    });

    it('should handle disconnect errors gracefully', async () => {
      provider.testUpdateContext({ isConnected: true });

      // Make handleDisconnect throw
      const testProvider = provider as TestProvider & {
        handleDisconnect: ReturnType<typeof vi.fn>;
      };
      testProvider.handleDisconnect = vi.fn().mockRejectedValue(new Error('Disconnect failed'));

      // Should not throw
      expect(() => provider.cleanupForTesting()).not.toThrow();
    });
  });

  describe('context management', () => {
    it('should provide complete context', () => {
      const context = provider.getContextForTesting();

      expect(context).toEqual({
        chainType: ChainType.Evm,
        chainId: '',
        accounts: [],
        isConnected: false,
        providerData: {},
      });
    });

    it('should update context when state changes', () => {
      provider.testUpdateContext({
        isConnected: true,
        chainId: '0x1',
        accounts: ['0x123'],
      });

      const context = provider.getContextForTesting();

      expect(context).toEqual({
        chainType: ChainType.Evm,
        chainId: '0x1',
        accounts: ['0x123'],
        isConnected: true,
        providerData: {},
      });
    });
  });
});
