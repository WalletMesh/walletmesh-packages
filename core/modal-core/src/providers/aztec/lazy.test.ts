import type { JSONRPCTransport } from '@walletmesh/jsonrpc';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { vi as VitestMock } from 'vitest';
import { LazyAztecRouterProvider, lazyRegisterAztecSerializers } from './lazy.js';

// Mock the aztec-rpc-wallet module
vi.mock('@walletmesh/aztec-rpc-wallet', () => ({
  AztecRouterProvider: vi.fn().mockImplementation((transport, context) => ({
    transport,
    context,
    connect: vi.fn().mockResolvedValue({ sessionId: 'test-session', permissions: {} }),
    disconnect: vi.fn().mockResolvedValue(undefined),
    getPermissions: vi.fn().mockResolvedValue({}),
    updatePermissions: vi.fn().mockResolvedValue({}),
    call: vi.fn().mockResolvedValue({ result: 'test' }),
    bulkCall: vi.fn().mockResolvedValue([{ result: 'test1' }, { result: 'test2' }]),
    getSupportedMethods: vi.fn().mockResolvedValue({ 'aztec:testnet': ['method1', 'method2'] }),
    reconnect: vi.fn().mockResolvedValue({ sessionId: 'test-session' }),
    createOperationBuilder: vi.fn().mockReturnValue({
      chain: vi.fn(),
      call: vi.fn(),
      execute: vi.fn().mockResolvedValue([]),
    }),
    registerMethodSerializer: vi.fn(),
    on: vi.fn().mockReturnValue(() => {}),
    onNotification: vi.fn().mockReturnValue(() => {}),
    emit: vi.fn(),
    sessionId: 'test-session',
  })),
  registerAztecSerializers: vi.fn(),
}));

describe('LazyAztecRouterProvider', () => {
  let mockTransport: JSONRPCTransport;

  beforeEach(() => {
    vi.clearAllMocks();
    mockTransport = {
      send: vi.fn(),
      onMessage: vi.fn(),
    };
  });

  it('should defer loading until first method call', async () => {
    const { AztecRouterProvider } = await import('@walletmesh/aztec-rpc-wallet');

    // Create instance - should not load yet
    const provider = new LazyAztecRouterProvider(mockTransport);
    expect(AztecRouterProvider).not.toHaveBeenCalled();

    // First method call should trigger loading
    await provider.connect({ 'aztec:testnet': ['method1'] });
    expect(AztecRouterProvider).toHaveBeenCalledWith(mockTransport, undefined);
  });

  it('should proxy all methods to the real provider', async () => {
    const provider = new LazyAztecRouterProvider(mockTransport, { custom: 'context' });

    // Test connect
    const connectResult = await provider.connect({ 'aztec:testnet': ['method1'] });
    expect(connectResult).toEqual({ sessionId: 'test-session', permissions: {} });

    // Test disconnect
    await provider.disconnect();

    // Test getPermissions
    const permissions = await provider.getPermissions(['aztec:testnet']);
    expect(permissions).toEqual({});

    // Test call
    const callResult = await provider.call('aztec:testnet', { method: 'test' });
    expect(callResult).toEqual({ result: 'test' });

    // Test bulkCall
    const bulkResult = await provider.bulkCall('aztec:testnet', [{ method: 'test1' }, { method: 'test2' }]);
    expect(bulkResult).toEqual([{ result: 'test1' }, { result: 'test2' }]);

    // Test getSupportedMethods
    const methods = await provider.getSupportedMethods(['aztec:testnet']);
    expect(methods).toEqual({ 'aztec:testnet': ['method1', 'method2'] });
  });

  it('should handle operation builder correctly', async () => {
    const provider = new LazyAztecRouterProvider(mockTransport);

    const builder = provider.createOperationBuilder('aztec:testnet');
    expect(builder).toBeDefined();
    expect(builder.call).toBeDefined();
    expect(builder.execute).toBeDefined();

    const result = await builder.execute();
    expect(result).toEqual([]);
  });

  it('should handle event methods', async () => {
    const provider = new LazyAztecRouterProvider(mockTransport);
    const handler = vi.fn();

    // Register event handler
    const cleanup = provider.on('test-event', handler);

    // Ensure provider is initialized
    await provider.connect({});

    // Test emit
    provider.emit('test-event', { data: 'test' });

    // Cleanup
    cleanup();
  });

  it('should queue serializer registration until initialized', async () => {
    const provider = new LazyAztecRouterProvider(mockTransport);
    const mockSerializer = { serialize: vi.fn(), deserialize: vi.fn() };

    // Register serializer before initialization
    provider.registerMethodSerializer('test_method', mockSerializer);

    // Initialize by calling a method
    await provider.connect({});

    // Give time for the queued registration to execute
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Get the mocked instance
    const { AztecRouterProvider } = await import('@walletmesh/aztec-rpc-wallet');
    const mockConstructor = AztecRouterProvider as ReturnType<typeof vi.fn>;
    const mockInstance = mockConstructor.mock.results[0]?.value;

    // Now serializer should be registered
    expect(mockInstance?.registerMethodSerializer).toHaveBeenCalledWith('test_method', mockSerializer);
  });

  it('should return undefined for sessionId until initialized', async () => {
    const provider = new LazyAztecRouterProvider(mockTransport);

    // Should be undefined before initialization
    expect(provider.sessionId).toBeUndefined();

    // Initialize
    await provider.connect({});

    // Should now have value
    expect(provider.sessionId).toBe('test-session');
  });
});

describe('lazyRegisterAztecSerializers', () => {
  it('should load module and register serializers', async () => {
    const { registerAztecSerializers } = await import('@walletmesh/aztec-rpc-wallet');
    const mockProvider = {
      registerMethodSerializer: vi.fn() as ReturnType<typeof vi.fn>,
    };

    await lazyRegisterAztecSerializers(mockProvider);

    expect(registerAztecSerializers).toHaveBeenCalledWith(mockProvider);
  });
});
