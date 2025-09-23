import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorFactory } from '../../core/errors/errorFactory.js';
import { SolanaAdapter } from './SolanaAdapter.js';

describe('SolanaAdapter Caching', () => {
  let adapter: SolanaAdapter;
  let mockSolanaWallet: {
    publicKey?: { toString: () => string };
    connect: ReturnType<typeof vi.fn>;
    disconnect?: ReturnType<typeof vi.fn>;
    signMessage: ReturnType<typeof vi.fn>;
    signTransaction: ReturnType<typeof vi.fn>;
    signAllTransactions: ReturnType<typeof vi.fn>;
    on?: ReturnType<typeof vi.fn>;
    removeAllListeners?: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.useFakeTimers();
    // Mock window.solana
    mockSolanaWallet = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      signMessage: vi.fn(),
      signTransaction: vi.fn(),
      signAllTransactions: vi.fn(),
      on: vi.fn(),
      removeAllListeners: vi.fn(),
    };

    (global as { window?: unknown }).window = {
      solana: mockSolanaWallet,
    };

    adapter = new SolanaAdapter();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    (global as { window?: unknown }).window = undefined;
  });

  it('should cache provider and transport on successful connection', async () => {
    // Setup mock responses for connection
    const mockPublicKey = {
      toString: () => '11111111111111111111111111111111',
    };

    mockSolanaWallet.connect.mockResolvedValue({ publicKey: mockPublicKey });

    // First connection
    const connection1 = await adapter.connect();
    expect(connection1.address).toBe('11111111111111111111111111111111');
    expect(connection1.chain.chainId).toBe('mainnet-beta');

    // Verify that connect was called
    expect(mockSolanaWallet.connect).toHaveBeenCalledTimes(1);

    // Set publicKey for cached check
    mockSolanaWallet.publicKey = mockPublicKey;

    // Second connection should use cached provider
    const connection2 = await adapter.connect();
    expect(connection2.address).toBe('11111111111111111111111111111111');
    expect(connection2.chain.chainId).toBe('mainnet-beta');

    // Verify that connect was NOT called again (using cached provider)
    expect(mockSolanaWallet.connect).toHaveBeenCalledTimes(1);
  });

  it('should create new provider when cached provider is invalid', async () => {
    // Setup mock responses for initial connection
    const mockPublicKey1 = {
      toString: () => '11111111111111111111111111111111',
    };

    mockSolanaWallet.connect.mockResolvedValue({ publicKey: mockPublicKey1 });

    // First connection
    const connection1 = await adapter.connect();
    expect(connection1.address).toBe('11111111111111111111111111111111');

    // Remove publicKey to simulate disconnection
    mockSolanaWallet.publicKey = undefined;

    // Setup new connection
    const mockPublicKey2 = {
      toString: () => '22222222222222222222222222222222',
    };
    mockSolanaWallet.connect.mockResolvedValue({ publicKey: mockPublicKey2 });

    // Second connection should create new provider since cached one is invalid
    const connection2 = await adapter.connect();
    expect(connection2.address).toBe('22222222222222222222222222222222');

    // Verify that connect was called twice (new connection)
    expect(mockSolanaWallet.connect).toHaveBeenCalledTimes(2);
  });

  it('should clear cached provider and transport on disconnect', async () => {
    // Setup mock responses
    const mockPublicKey = {
      toString: () => '11111111111111111111111111111111',
    };

    mockSolanaWallet.connect.mockResolvedValue({ publicKey: mockPublicKey });
    mockSolanaWallet.disconnect = vi.fn().mockResolvedValue(undefined);

    // Connect
    await adapter.connect();

    // Verify initial connection
    expect(mockSolanaWallet.connect).toHaveBeenCalledTimes(1);

    // Mock the cleanup to avoid timeout issues
    const originalCleanup = adapter['cleanup'].bind(adapter);
    adapter['cleanup'] = vi.fn().mockResolvedValue(undefined);

    // Disconnect should clear cache
    await adapter.disconnect();

    // Restore cleanup for next connection
    adapter['cleanup'] = originalCleanup;

    // Next connection should create new provider (not use cache)
    await adapter.connect();

    // Verify that connect was called twice (not using cache)
    expect(mockSolanaWallet.connect).toHaveBeenCalledTimes(2);
  });

  it('should handle chain changes with cached provider', async () => {
    // Setup mock responses
    const mockPublicKey = {
      toString: () => '11111111111111111111111111111111',
    };

    mockSolanaWallet.connect.mockResolvedValue({ publicKey: mockPublicKey });
    mockSolanaWallet.publicKey = mockPublicKey;

    // First connection with default chain
    const connection1 = await adapter.connect();
    expect(connection1.chain.chainId).toBe('mainnet-beta');

    // Second connection with different chain specified
    const connection2 = await adapter.connect({
      chains: [{ chainId: 'devnet', type: 'solana' as const }],
    });
    expect(connection2.chain.chainId).toBe('devnet');

    // Should still be using cached wallet (connect called only once)
    expect(mockSolanaWallet.connect).toHaveBeenCalledTimes(1);
  });

  it('should handle errors when validating cached provider', async () => {
    // Setup mock responses for initial connection
    const mockPublicKey = {
      toString: () => '11111111111111111111111111111111',
    };

    mockSolanaWallet.connect.mockResolvedValue({ publicKey: mockPublicKey });

    // First connection
    await adapter.connect();

    // Mock publicKey to throw error (provider is broken)
    mockSolanaWallet.publicKey = {
      toString: () => {
        throw new Error('PublicKey error');
      },
    };

    // Setup new connection
    const mockPublicKey2 = {
      toString: () => '22222222222222222222222222222222',
    };
    mockSolanaWallet.connect.mockResolvedValue({ publicKey: mockPublicKey2 });

    // Second connection should create new provider since cached one throws error
    const connection2 = await adapter.connect();
    expect(connection2.address).toBe('22222222222222222222222222222222');

    // Verify that connect was called twice (new connection)
    expect(mockSolanaWallet.connect).toHaveBeenCalledTimes(2);
  });

  it('should reuse cached provider with discovered wallet', async () => {
    // Setup discovered provider
    const mockDiscoveredWallet = {
      publicKey: {
        toString: () => '33333333333333333333333333333333',
      },
      connect: vi.fn(),
      disconnect: vi.fn(),
      signMessage: vi.fn(),
      signTransaction: vi.fn(),
      signAllTransactions: vi.fn(),
      on: vi.fn(),
      removeAllListeners: vi.fn(),
    };

    mockDiscoveredWallet.connect.mockResolvedValue({
      publicKey: mockDiscoveredWallet.publicKey,
    });

    // Set discovered provider
    adapter.setProvider(mockDiscoveredWallet);

    // First connection
    const connection1 = await adapter.connect();
    expect(connection1.address).toBe('33333333333333333333333333333333');
    expect(mockDiscoveredWallet.connect).toHaveBeenCalledTimes(1);

    // Second connection should use cached provider
    const connection2 = await adapter.connect();
    expect(connection2.address).toBe('33333333333333333333333333333333');

    // Verify that connect was NOT called again (using cached provider)
    expect(mockDiscoveredWallet.connect).toHaveBeenCalledTimes(1);
  });
});
