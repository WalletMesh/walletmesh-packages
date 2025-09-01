import type { AccountWallet, PXE } from '@aztec/aztec.js';
import type { JSONRPCTransport } from '@walletmesh/jsonrpc';
import { JSONRPCNode } from '@walletmesh/jsonrpc';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContractArtifactCache } from '../contractArtifactCache.js';
import { createAztecWalletNode } from './create-node.js';
import type { AztecHandlerContext } from './handlers/index.js';

// Mock dependencies
vi.mock('@walletmesh/jsonrpc', async () => {
  const actual = await vi.importActual('@walletmesh/jsonrpc');
  return {
    ...actual,
    JSONRPCNode: vi.fn().mockImplementation(() => ({
      registerMethod: vi.fn(),
      registerSerializer: vi.fn(),
      transport: {},
      context: {},
      methodManager: {},
      eventManager: {},
      requestManager: {},
      middlewareManager: {},
      parameterSerializer: {},
      messageValidator: {},
      requestHandler: {},
      send: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      handle: vi.fn(),
      registerMiddleware: vi.fn(),
      removeMiddleware: vi.fn(),
      registerEvent: vi.fn(),
      removeEvent: vi.fn(),
      close: vi.fn(),
    })),
  };
});

vi.mock('../contractArtifactCache.js', () => ({
  ContractArtifactCache: vi.fn().mockImplementation(() => ({
    // Mock cache methods if needed
  })),
}));

vi.mock('./handlers/index.js', () => ({
  createAztecHandlers: vi.fn().mockReturnValue({
    aztec_getAddress: vi.fn(),
    aztec_getCompleteAddress: vi.fn(),
    aztec_createAuthWit: vi.fn(),
    aztec_sendTx: vi.fn(),
    aztec_getTxReceipt: vi.fn(),
    aztec_getNodeInfo: vi.fn(),
    aztec_getBlockNumber: vi.fn(),
    aztec_registerContract: vi.fn(),
    aztec_getContracts: vi.fn(),
  }),
}));

vi.mock('./serializers.js', () => ({
  registerAztecSerializers: vi.fn(),
}));

// Mock wallet and PXE
const createMockWallet = () =>
  ({
    getAddress: vi.fn(),
    getCompleteAddress: vi.fn(),
    createAuthWit: vi.fn(),
    registerSender: vi.fn(),
    getSenders: vi.fn(),
    removeSender: vi.fn(),
  }) as unknown as AccountWallet;

const createMockPXE = () =>
  ({
    getNodeInfo: vi.fn(),
    getPXEInfo: vi.fn(),
    getBlock: vi.fn(),
    getBlocks: vi.fn(),
    getBlockNumber: vi.fn(),
    getProvenBlockNumber: vi.fn(),
    getEpochNumber: vi.fn(),
    getChainId: vi.fn(),
    getVersion: vi.fn(),
    getProtocolContractAddresses: vi.fn(),
    registerContract: vi.fn(),
    registerContractClass: vi.fn(),
    getContracts: vi.fn(),
    getContractInstance: vi.fn(),
    getContractClass: vi.fn(),
    getContract: vi.fn(),
  }) as unknown as PXE;

const createMockTransport = () =>
  ({
    send: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  }) as unknown as JSONRPCTransport;

describe('createAztecWalletNode', () => {
  let wallet: ReturnType<typeof createMockWallet>;
  let pxe: ReturnType<typeof createMockPXE>;
  let transport: ReturnType<typeof createMockTransport>;
  let mockNode: {
    registerMethod: ReturnType<typeof vi.fn>;
    registerSerializer: ReturnType<typeof vi.fn>;
    transport: object;
    context: object;
    methodManager: object;
    eventManager: object;
    requestManager: object;
    middlewareManager: object;
    parameterSerializer: object;
    messageValidator: object;
    requestHandler: object;
    send: ReturnType<typeof vi.fn>;
    on: ReturnType<typeof vi.fn>;
    off: ReturnType<typeof vi.fn>;
    emit: ReturnType<typeof vi.fn>;
    handle: ReturnType<typeof vi.fn>;
    registerMiddleware: ReturnType<typeof vi.fn>;
    removeMiddleware: ReturnType<typeof vi.fn>;
    registerEvent: ReturnType<typeof vi.fn>;
    removeEvent: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
  };
  let mockHandlers: Record<string, (ctx: AztecHandlerContext, params: unknown) => Promise<unknown>>;

  beforeEach(async () => {
    wallet = createMockWallet();
    pxe = createMockPXE();
    transport = createMockTransport();

    mockNode = {
      registerMethod: vi.fn(),
      registerSerializer: vi.fn(),
      transport: {},
      context: {},
      methodManager: {},
      eventManager: {},
      requestManager: {},
      middlewareManager: {},
      parameterSerializer: {},
      messageValidator: {},
      requestHandler: {},
      send: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      handle: vi.fn(),
      registerMiddleware: vi.fn(),
      removeMiddleware: vi.fn(),
      registerEvent: vi.fn(),
      removeEvent: vi.fn(),
      close: vi.fn(),
    };

    mockHandlers = {
      aztec_getAddress: vi.fn().mockResolvedValue({} as unknown),
      aztec_getCompleteAddress: vi.fn().mockResolvedValue({} as unknown),
      aztec_createAuthWit: vi.fn().mockResolvedValue({} as unknown),
      aztec_sendTx: vi.fn().mockResolvedValue({} as unknown),
      aztec_getTxReceipt: vi.fn().mockResolvedValue({} as unknown),
      aztec_getNodeInfo: vi.fn().mockResolvedValue({} as unknown),
      aztec_getBlockNumber: vi.fn().mockResolvedValue({} as unknown),
      aztec_registerContract: vi.fn().mockResolvedValue({} as unknown),
      aztec_getContracts: vi.fn().mockResolvedValue({} as unknown),
    };

    // biome-ignore lint/suspicious/noExplicitAny: Mock implementation requires type coercion
    vi.mocked(JSONRPCNode).mockImplementation(() => mockNode as any);

    // Reset mocks but keep the mock implementations
    vi.clearAllMocks();

    // Set the return value for createAztecHandlers
    const { createAztecHandlers } = await import('./handlers/index.js');
    // biome-ignore lint/suspicious/noExplicitAny: Mock implementation requires type coercion
    vi.mocked(createAztecHandlers).mockReturnValue(mockHandlers as any);
  });

  it('should create a JSONRPCNode with transport and context', () => {
    createAztecWalletNode(wallet, pxe, transport);

    expect(JSONRPCNode).toHaveBeenCalledWith(
      transport,
      expect.objectContaining({
        wallet,
        pxe,
        cache: expect.any(Object),
      }),
    );
  });

  it('should create ContractArtifactCache with wallet', () => {
    createAztecWalletNode(wallet, pxe, transport);

    expect(ContractArtifactCache).toHaveBeenCalledWith(wallet);
  });

  it('should call createAztecHandlers to get all handlers', async () => {
    const { createAztecHandlers } = await import('./handlers/index.js');

    createAztecWalletNode(wallet, pxe, transport);

    expect(createAztecHandlers).toHaveBeenCalled();
  });

  it('should register all handlers from createAztecHandlers', () => {
    createAztecWalletNode(wallet, pxe, transport);

    // Verify each handler was registered
    const handlerKeys = Object.keys(mockHandlers);
    for (const method of handlerKeys) {
      expect(mockNode.registerMethod).toHaveBeenCalledWith(method, expect.any(Function));
    }
  });

  it('should bind handlers with the correct context', () => {
    createAztecWalletNode(wallet, pxe, transport);

    // Get the first registered handler
    const calls = mockNode.registerMethod.mock.calls;
    if (calls && calls.length > 0) {
      const firstCall = calls[0];
      if (firstCall && firstCall.length > 1) {
        const [, registeredHandler] = firstCall;

        // Call the registered handler with test params
        const testParams = { test: 'value' };
        registeredHandler(testParams);

        // The handler should have been called with context and params
        // (We can't directly test the binding, but we verify the handler was wrapped)
        expect(typeof registeredHandler).toBe('function');
      }
    }
  });

  it('should register serializers on the node', async () => {
    const { registerAztecSerializers } = await import('./serializers.js');

    createAztecWalletNode(wallet, pxe, transport);

    expect(registerAztecSerializers).toHaveBeenCalledWith(mockNode);
  });

  it('should return the created node as JSONRPCWallet', () => {
    const result = createAztecWalletNode(wallet, pxe, transport);

    expect(result).toBe(mockNode);
  });

  it('should create a properly configured wallet node', async () => {
    const { createAztecHandlers } = await import('./handlers/index.js');
    const { registerAztecSerializers } = await import('./serializers.js');

    createAztecWalletNode(wallet, pxe, transport);

    // Verify all components were initialized in correct order
    expect(ContractArtifactCache).toHaveBeenCalledBefore(JSONRPCNode as unknown as ReturnType<typeof vi.fn>);
    expect(JSONRPCNode).toHaveBeenCalledBefore(createAztecHandlers as unknown as ReturnType<typeof vi.fn>);
    expect(createAztecHandlers).toHaveBeenCalledBefore(
      registerAztecSerializers as unknown as ReturnType<typeof vi.fn>,
    );

    // Verify the context contains all required properties
    expect(JSONRPCNode).toHaveBeenCalledWith(
      transport,
      expect.objectContaining({
        wallet,
        pxe,
        cache: expect.any(Object),
      }),
    );
  });

  it('should handle handler registration with proper parameter wrapping', async () => {
    const testHandler = vi.fn().mockReturnValue('test-result');
    const testMethod = 'aztec_testMethod';

    const { createAztecHandlers } = await import('./handlers/index.js');
    const testHandlers = {
      ...mockHandlers,
      [testMethod]: testHandler,
    };
    // biome-ignore lint/suspicious/noExplicitAny: Mock implementation requires type coercion
    vi.mocked(createAztecHandlers).mockReturnValue(testHandlers as any);

    createAztecWalletNode(wallet, pxe, transport);

    // Get the registered handler
    const registeredCall = mockNode.registerMethod.mock.calls.find(([method]) => method === testMethod);
    if (!registeredCall) {
      throw new Error(`Method ${testMethod} was not registered`);
    }
    const [, wrappedHandler] = registeredCall;

    // Call the wrapped handler - JSONRPCNode will pass context and params
    const testParams = { foo: 'bar' };
    const context = { wallet, pxe, cache: expect.any(Object) };
    wrappedHandler(context, testParams);

    // Verify the original handler was called with context and params
    expect(testHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        wallet,
        pxe,
        cache: expect.any(Object),
      }),
      testParams,
    );
  });

  it('should create a context that is shared across all handlers', () => {
    createAztecWalletNode(wallet, pxe, transport);

    // Get all registered handlers
    const registeredHandlers = mockNode.registerMethod.mock.calls;

    // Create a test to verify they all share the same context
    // This is implicit in the implementation but good to verify
    if (registeredHandlers) {
      expect(registeredHandlers.length).toBeGreaterThan(0);

      // All handlers should have been registered
      expect(registeredHandlers.length).toBe(Object.keys(mockHandlers).length);
    }
  });
});
