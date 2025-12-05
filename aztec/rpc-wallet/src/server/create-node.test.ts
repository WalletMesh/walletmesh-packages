import type { Wallet } from '@aztec/aztec.js/wallet';
import { JSONRPCNode, type JSONRPCTransport } from '@walletmesh/jsonrpc';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAztecWalletNode } from './create-node.js';
import * as handlersModule from './handlers.js';
import * as serializersModule from './register-serializers.js';

// Mock JSONRPCNode
vi.mock('@walletmesh/jsonrpc', () => ({
  JSONRPCNode: vi.fn().mockImplementation(() => ({
    notify: vi.fn(),
  })),
}));

// Mock handlers and serializers modules
vi.mock('./handlers.js', () => ({
  registerAztecWalletHandlers: vi.fn(),
}));

vi.mock('./register-serializers.js', () => ({
  registerAztecWalletSerializers: vi.fn(),
}));

describe('createAztecWalletNode', () => {
  let mockWallet: Wallet;
  let mockTransport: JSONRPCTransport;
  let mockNode: InstanceType<typeof JSONRPCNode>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock wallet
    mockWallet = {
      getChainInfo: vi.fn(),
      getAccounts: vi.fn(),
    } as unknown as Wallet;

    // Create mock transport
    mockTransport = {
      send: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    } as unknown as JSONRPCTransport;

    // Create mock node instance
    mockNode = {
      notify: vi.fn(),
    } as unknown as InstanceType<typeof JSONRPCNode>;

    // Make JSONRPCNode constructor return our mock
    vi.mocked(JSONRPCNode).mockImplementation(() => mockNode);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a JSONRPCNode with correct transport and context', () => {
    const node = createAztecWalletNode(mockWallet, mockTransport);

    expect(JSONRPCNode).toHaveBeenCalledWith(
      mockTransport,
      expect.objectContaining({
        wallet: mockWallet,
        notify: expect.any(Function),
      }),
    );
    expect(node).toBe(mockNode);
  });

  it('should set up context with wallet instance', () => {
    createAztecWalletNode(mockWallet, mockTransport);

    const callArgs = vi.mocked(JSONRPCNode).mock.calls[0];
    expect(callArgs).toBeDefined();
    // biome-ignore lint/style/noNonNullAssertion: test
    const context = callArgs![1] as {
      wallet: Wallet;
      notify: (method: string, params: unknown) => Promise<void>;
    };

    expect(context['wallet']).toBe(mockWallet);
    expect(context['notify']).toBeInstanceOf(Function);
  });

  it('should wire context notify function to node.notify', async () => {
    createAztecWalletNode(mockWallet, mockTransport);

    // Get the context that was passed to JSONRPCNode
    const callArgs = vi.mocked(JSONRPCNode).mock.calls[0];
    expect(callArgs).toBeDefined();
    // biome-ignore lint/style/noNonNullAssertion: test
    const context = callArgs![1] as {
      wallet: Wallet;
      notify: (method: string, params: unknown) => Promise<void>;
    };

    // Call notify through context
    await context['notify']('aztec_transactionStatus', {
      params: { txStatusId: 'test', status: 'pending', timestamp: 123 },
    });

    // Verify node.notify was called
    expect(mockNode.notify).toHaveBeenCalledWith('aztec_transactionStatus', {
      params: { txStatusId: 'test', status: 'pending', timestamp: 123 },
    });
  });

  it('should register handlers', () => {
    createAztecWalletNode(mockWallet, mockTransport);

    expect(handlersModule.registerAztecWalletHandlers).toHaveBeenCalledWith(mockNode);
    expect(handlersModule.registerAztecWalletHandlers).toHaveBeenCalledTimes(1);
  });

  it('should register serializers', () => {
    createAztecWalletNode(mockWallet, mockTransport);

    expect(serializersModule.registerAztecWalletSerializers).toHaveBeenCalledWith(mockNode);
    expect(serializersModule.registerAztecWalletSerializers).toHaveBeenCalledTimes(1);
  });
});
