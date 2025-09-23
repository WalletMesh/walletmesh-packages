import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorFactory } from '../../core/errors/errorFactory.js';
import { EvmAdapter } from './EvmAdapter.js';

describe('EvmAdapter Caching', () => {
  let adapter: EvmAdapter;
  let mockEthereum: {
    request: ReturnType<typeof vi.fn>;
    on?: ReturnType<typeof vi.fn>;
    removeListener?: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Mock window.ethereum
    mockEthereum = {
      request: vi.fn(),
      on: vi.fn(),
      removeListener: vi.fn(),
    };

    (global as { window?: unknown }).window = {
      ethereum: mockEthereum,
    };

    adapter = new EvmAdapter({
      id: 'test-evm',
      name: 'Test EVM Wallet',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    (global as { window?: unknown }).window = undefined;
  });

  it('should cache provider and transport on successful connection', async () => {
    // Setup mock responses for initial connection
    mockEthereum.request.mockImplementation(({ method }: { method: string }) => {
      switch (method) {
        case 'eth_requestAccounts':
          return Promise.resolve(['0x1234567890123456789012345678901234567890']);
        case 'eth_accounts':
          return Promise.resolve(['0x1234567890123456789012345678901234567890']);
        case 'eth_chainId':
          return Promise.resolve('0x1'); // mainnet
        default:
          return Promise.reject(new Error(`Method ${method} not mocked`));
      }
    });

    // First connection
    const connection1 = await adapter.connect();
    expect(connection1.address).toBe('0x1234567890123456789012345678901234567890');
    expect(connection1.chain.chainId).toBe('eip155:1');

    // Verify that eth_requestAccounts was called for initial connection
    expect(mockEthereum.request).toHaveBeenCalledWith({ method: 'eth_requestAccounts' });
    const requestAccountsCallCount = mockEthereum.request.mock.calls.filter(
      (call) => call[0].method === 'eth_requestAccounts',
    ).length;

    // Second connection should use cached provider
    const connection2 = await adapter.connect();
    expect(connection2.address).toBe('0x1234567890123456789012345678901234567890');
    expect(connection2.chain.chainId).toBe('eip155:1');

    // Verify that eth_requestAccounts was NOT called again (using cached provider)
    const newRequestAccountsCallCount = mockEthereum.request.mock.calls.filter(
      (call) => call[0].method === 'eth_requestAccounts',
    ).length;
    expect(newRequestAccountsCallCount).toBe(requestAccountsCallCount);

    // But eth_accounts should have been called to validate the cached connection
    expect(mockEthereum.request).toHaveBeenCalledWith({ method: 'eth_accounts' });
  });

  it('should create new provider when cached provider is invalid', async () => {
    // Setup mock responses for initial connection
    mockEthereum.request.mockImplementation(({ method }: { method: string }) => {
      switch (method) {
        case 'eth_requestAccounts':
          return Promise.resolve(['0x1234567890123456789012345678901234567890']);
        case 'eth_accounts':
          // First call returns accounts, subsequent calls return empty (disconnected)
          return mockEthereum.request.mock.calls.filter((c) => c[0].method === 'eth_accounts').length === 0
            ? Promise.resolve(['0x1234567890123456789012345678901234567890'])
            : Promise.resolve([]);
        case 'eth_chainId':
          return Promise.resolve('0x1');
        default:
          return Promise.reject(new Error(`Method ${method} not mocked`));
      }
    });

    // First connection
    await adapter.connect();

    // Mock eth_accounts to return empty array (indicating disconnection)
    mockEthereum.request.mockImplementation(({ method }: { method: string }) => {
      switch (method) {
        case 'eth_requestAccounts':
          return Promise.resolve(['0xabcdef0123456789012345678901234567890123']);
        case 'eth_accounts':
          return Promise.resolve([]); // No accounts, provider is disconnected
        case 'eth_chainId':
          return Promise.resolve('0x1');
        default:
          return Promise.reject(new Error(`Method ${method} not mocked`));
      }
    });

    // Second connection should create new provider since cached one is invalid
    const connection2 = await adapter.connect();
    expect(connection2.address).toBe('0xabcdef0123456789012345678901234567890123');

    // Verify that eth_requestAccounts was called again (new connection)
    const requestAccountsCalls = mockEthereum.request.mock.calls.filter(
      (call) => call[0].method === 'eth_requestAccounts',
    );
    expect(requestAccountsCalls.length).toBe(2); // Called twice total
  });

  it('should clear cached provider and transport on disconnect', async () => {
    // Setup mock responses
    mockEthereum.request.mockImplementation(({ method }: { method: string }) => {
      switch (method) {
        case 'eth_requestAccounts':
          return Promise.resolve(['0x1234567890123456789012345678901234567890']);
        case 'eth_accounts':
          return Promise.resolve(['0x1234567890123456789012345678901234567890']);
        case 'eth_chainId':
          return Promise.resolve('0x1');
        default:
          return Promise.reject(new Error(`Method ${method} not mocked`));
      }
    });

    // Connect
    await adapter.connect();

    // Disconnect should clear cache
    await adapter.disconnect();

    // Next connection should create new provider (not use cache)
    await adapter.connect();

    // Verify that eth_requestAccounts was called twice (not using cache)
    const requestAccountsCalls = mockEthereum.request.mock.calls.filter(
      (call) => call[0].method === 'eth_requestAccounts',
    );
    expect(requestAccountsCalls.length).toBe(2);
  });

  it('should handle chain changes with cached provider', async () => {
    // Setup mock responses
    mockEthereum.request.mockImplementation(({ method }: { method: string }) => {
      switch (method) {
        case 'eth_requestAccounts':
          return Promise.resolve(['0x1234567890123456789012345678901234567890']);
        case 'eth_accounts':
          return Promise.resolve(['0x1234567890123456789012345678901234567890']);
        case 'eth_chainId': {
          // Return different chain IDs on subsequent calls
          const callCount = mockEthereum.request.mock.calls.filter(
            (c) => c[0].method === 'eth_chainId',
          ).length;
          return Promise.resolve(callCount <= 1 ? '0x1' : '0x89'); // mainnet then polygon
        }
        default:
          return Promise.reject(new Error(`Method ${method} not mocked`));
      }
    });

    // First connection
    const connection1 = await adapter.connect();
    expect(connection1.chain.chainId).toBe('eip155:1');

    // Second connection with cached provider should get updated chain ID
    const connection2 = await adapter.connect();
    expect(connection2.chain.chainId).toBe('eip155:137'); // 0x89 = 137 (Polygon)

    // Should still be using cached provider (eth_requestAccounts called only once)
    const requestAccountsCalls = mockEthereum.request.mock.calls.filter(
      (call) => call[0].method === 'eth_requestAccounts',
    );
    expect(requestAccountsCalls.length).toBe(1);
  });

  it('should handle errors when validating cached provider', async () => {
    // Setup mock responses for initial connection
    mockEthereum.request.mockImplementation(({ method }: { method: string }) => {
      switch (method) {
        case 'eth_requestAccounts':
          return Promise.resolve(['0x1234567890123456789012345678901234567890']);
        case 'eth_accounts':
          return Promise.resolve(['0x1234567890123456789012345678901234567890']);
        case 'eth_chainId':
          return Promise.resolve('0x1');
        default:
          return Promise.reject(new Error(`Method ${method} not mocked`));
      }
    });

    // First connection
    await adapter.connect();

    // Mock eth_accounts to throw error (provider is broken)
    mockEthereum.request.mockImplementation(({ method }: { method: string }) => {
      switch (method) {
        case 'eth_requestAccounts':
          return Promise.resolve(['0xabcdef0123456789012345678901234567890123']);
        case 'eth_accounts':
          return Promise.reject(new Error('Provider error'));
        case 'eth_chainId':
          return Promise.resolve('0x1');
        default:
          return Promise.reject(new Error(`Method ${method} not mocked`));
      }
    });

    // Second connection should create new provider since cached one throws error
    const connection2 = await adapter.connect();
    expect(connection2.address).toBe('0xabcdef0123456789012345678901234567890123');

    // Verify that eth_requestAccounts was called again (new connection)
    const requestAccountsCalls = mockEthereum.request.mock.calls.filter(
      (call) => call[0].method === 'eth_requestAccounts',
    );
    expect(requestAccountsCalls.length).toBe(2);
  });
});
