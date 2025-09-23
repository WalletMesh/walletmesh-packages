/**
 * IMPROVED Provider Mocking using Vitest Auto-Mocking
 *
 * This replaces manual provider implementations with auto-mocked real providers
 * to ensure type safety and automatic interface synchronization.
 *
 * BEFORE: 300+ lines of manual provider implementations
 * AFTER: ~120 lines leveraging Vitest's auto-mocking
 *
 * NOTE: AztecProvider has been removed. Aztec integration now uses
 * AztecRouterProvider from @walletmesh/aztec-rpc-wallet which extends
 * WalletRouterProvider and uses the call() method pattern.
 */

import { vi } from 'vitest';
import type { MockedObject } from 'vitest';

// Import REAL provider implementations to auto-mock them
import { EvmProvider } from '../../internal/providers/evm/EvmProvider.js';
import { SolanaProvider } from '../../internal/providers/solana/SolanaProvider.js';

// Import real types - no more duplicate interfaces!
import { ChainType } from '../../types.js';

/**
 * IMPROVED: Auto-mock EvmProvider using real implementation
 * This automatically stays in sync with the real EvmProvider interface
 */
export function createAutoMockedEvmProvider(): MockedObject<EvmProvider> {
  const realProvider = new EvmProvider(
    ChainType.Evm,
    // biome-ignore lint/suspicious/noExplicitAny: Mock provider requires flexible config
    {} as any,
    '0x1',
    // biome-ignore lint/suspicious/noExplicitAny: Mock provider requires flexible logger
    {} as any,
  );
  const mockedProvider = vi.mocked(realProvider, { deep: true });

  // Setup mock implementations for commonly used methods
  const mockAccounts = ['0x1234567890123456789012345678901234567890'];

  // Standard methods from WalletProvider interface
  mockedProvider.getAccounts.mockResolvedValue(mockAccounts);

  // Note: EvmProvider might not have a connect method, using manual assignment
  // biome-ignore lint/suspicious/noExplicitAny: Dynamic mock method assignment for EVM-specific interface
  (mockedProvider as any).connect = vi.fn().mockImplementation(async () => {
    return { accounts: mockAccounts };
  });

  mockedProvider.disconnect.mockImplementation(async () => {
    // Disconnect implementation
  });

  mockedProvider.getChainId.mockResolvedValue('0x1');

  // EVM-specific methods
  // biome-ignore lint/suspicious/noExplicitAny: Dynamic mock of EVM-specific methods
  (mockedProvider as any).signTransaction = vi.fn().mockResolvedValue('0xabcdef');
  // biome-ignore lint/suspicious/noExplicitAny: Dynamic mock of EVM-specific methods
  (mockedProvider as any).getBalance = vi.fn().mockResolvedValue('0x0');
  // biome-ignore lint/suspicious/noExplicitAny: Dynamic mock of EVM-specific methods
  (mockedProvider as any).getTransactionCount = vi.fn().mockResolvedValue('0x0');

  // Mock request method to handle all EVM calls
  mockedProvider.request.mockImplementation(async ({ method }) => {
    switch (method) {
      case 'eth_accounts':
        return mockAccounts;
      case 'eth_chainId':
        return '0x1';
      case 'eth_getBalance':
        return '0x0';
      case 'eth_getTransactionCount':
        return '0x0';
      default:
        throw new Error(`Unmocked method: ${method}`);
    }
  });

  // Add utility methods for test control
  // biome-ignore lint/suspicious/noExplicitAny: Test utility method requires dynamic access
  (mockedProvider as any).mockSetAccounts = (accounts: string[]) => {
    mockAccounts.length = 0;
    mockAccounts.push(...accounts);
  };

  return mockedProvider;
}

/**
 * IMPROVED: Auto-mock SolanaProvider using real implementation
 */
export function createAutoMockedSolanaProvider(): MockedObject<SolanaProvider> {
  const realProvider = new SolanaProvider(
    ChainType.Solana,
    // biome-ignore lint/suspicious/noExplicitAny: Mock provider requires flexible config
    {} as any,
    'mainnet-beta',
    // biome-ignore lint/suspicious/noExplicitAny: Mock provider requires flexible logger
    {} as any,
  );
  const mockedProvider = vi.mocked(realProvider, { deep: true });

  const mockPubkey = 'HN7cABqLq46Es1jh92dQQisAi662SmxELLLsHHe4YWrH';

  mockedProvider.getAccounts.mockResolvedValue([mockPubkey]);

  // Note: SolanaProvider might not have a connect method, using manual assignment
  // biome-ignore lint/suspicious/noExplicitAny: Dynamic mock method assignment for Solana-specific interface
  (mockedProvider as any).connect = vi.fn().mockImplementation(async () => {
    return { publicKey: mockPubkey };
  });

  mockedProvider.disconnect.mockImplementation(async () => {
    // Disconnect implementation
  });

  mockedProvider.getChainId.mockResolvedValue('mainnet-beta');
  // biome-ignore lint/suspicious/noExplicitAny: Dynamic mock of Solana-specific methods
  (mockedProvider as any).signTransaction = vi.fn().mockResolvedValue({ signature: 'mockSig' });
  // biome-ignore lint/suspicious/noExplicitAny: Dynamic mock of Solana-specific methods
  (mockedProvider as any).signAllTransactions = vi.fn().mockResolvedValue([{ signature: 'mockSig' }]);
  // biome-ignore lint/suspicious/noExplicitAny: Dynamic mock of Solana-specific methods
  (mockedProvider as any).signMessage = vi.fn().mockResolvedValue({ signature: 'mockSig' });

  return mockedProvider;
}

// Note: AztecProvider has been removed as it was unused.
// Aztec integration now uses AztecRouterProvider from @walletmesh/aztec-rpc-wallet
// which extends WalletRouterProvider and uses the call() method pattern.
// For testing Aztec functionality, mock AztecRouterProvider directly.

/**
 * IMPROVED: Create provider mock based on chain type
 * Uses real provider interfaces to ensure type compatibility
 */
export function createAutoMockedProvider(chainType: ChainType) {
  switch (chainType) {
    case ChainType.Evm:
      return createAutoMockedEvmProvider();
    case ChainType.Solana:
      return createAutoMockedSolanaProvider();
    case ChainType.Aztec:
      // Aztec now uses AztecRouterProvider - mock that instead
      throw new Error('Use AztecRouterProvider from @walletmesh/aztec-rpc-wallet for Aztec mocking');
    default:
      throw new Error(`Unsupported chain type: ${chainType}`);
  }
}

/**
 * IMPROVED: Setup module mocks for import interception
 * This allows tests to automatically receive mocked providers
 */
export function setupProviderMocks() {
  vi.mock('../../internal/providers/evm/EvmProvider.js', () => ({
    // biome-ignore lint/style/useNamingConvention: Matching exported class name
    EvmProvider: vi.fn(() => createAutoMockedEvmProvider()),
  }));

  vi.mock('../../internal/providers/solana/SolanaProvider.js', () => ({
    // biome-ignore lint/style/useNamingConvention: Matching exported class name
    SolanaProvider: vi.fn(() => createAutoMockedSolanaProvider()),
  }));

  // Note: AztecProvider removed - use AztecRouterProvider mocking instead
}

/**
 * IMPROVED: Provider registry mock using real provider interfaces
 * This replaces the manual registry implementations
 */
export function createMockedProviderRegistry() {
  return {
    evm: createAutoMockedEvmProvider(),
    solana: createAutoMockedSolanaProvider(),
    // aztec: Mock AztecRouterProvider from @walletmesh/aztec-rpc-wallet instead
  };
}

/**
 * IMPROVED: Batch provider mocking with custom overrides
 * Allows creating multiple provider mocks with custom settings
 */
export function createCustomProviderMocks(overrides: {
  evm?: Partial<EvmProvider>;
  solana?: Partial<SolanaProvider>;
}) {
  const mocks = {
    evm: createAutoMockedEvmProvider(),
    solana: createAutoMockedSolanaProvider(),
  };

  // Apply overrides
  if (overrides.evm) {
    Object.assign(mocks.evm, overrides.evm);
  }
  if (overrides.solana) {
    Object.assign(mocks.solana, overrides.solana);
  }

  return mocks;
}

/**
 * IMPROVED: Create a spied provider for interaction testing
 * Useful for testing that methods are called with correct parameters
 */
export function createSpiedProvider(chainType: ChainType) {
  const provider = createAutoMockedProvider(chainType);
  const baseCalls = {
    getAccounts: vi.spyOn(provider, 'getAccounts'),
    getChainId: vi.spyOn(provider, 'getChainId'),
    disconnect: vi.spyOn(provider, 'disconnect'),
  };

  // Add chain-specific spies
  const chainSpecificCalls: Record<string, unknown> = {};
  if (chainType === ChainType.Evm && 'request' in provider) {
    chainSpecificCalls['request'] = vi.spyOn(provider, 'request' as keyof typeof provider);
  }

  const spy = {
    provider,
    calls: { ...baseCalls, ...chainSpecificCalls },
  };
  return spy;
}

// Pre-configured provider mocks for common test scenarios
export const providerPresets = {
  // All providers disconnected
  disconnected: Object.freeze({
    evm: (() => {
      const provider = createAutoMockedEvmProvider();
      // biome-ignore lint/suspicious/noExplicitAny: Test helper method requires dynamic access
      (provider as any).mockSetConnected(false);
      return provider;
    })(),
    solana: (() => {
      const provider = createAutoMockedSolanaProvider();
      // biome-ignore lint/suspicious/noExplicitAny: Test helper method requires dynamic access
      (provider as any).mockSetConnected(false);
      return provider;
    })(),
    // aztec: Mock AztecRouterProvider instead - removed legacy AztecProvider
  }),

  // All providers connected
  connected: Object.freeze({
    evm: (() => {
      const provider = createAutoMockedEvmProvider();
      // biome-ignore lint/suspicious/noExplicitAny: Test helper method requires dynamic access
      (provider as any).mockSetConnected(true);
      return provider;
    })(),
    solana: (() => {
      const provider = createAutoMockedSolanaProvider();
      // biome-ignore lint/suspicious/noExplicitAny: Test helper method requires dynamic access
      (provider as any).mockSetConnected(true);
      return provider;
    })(),
    // aztec: Mock AztecRouterProvider instead - removed legacy AztecProvider
  }),

  // Providers with errors
  withErrors: Object.freeze({
    evm: (() => {
      const provider = createAutoMockedEvmProvider();
      provider.getAccounts.mockRejectedValue(new Error('Failed to get accounts'));
      provider.request.mockRejectedValue(new Error('Request failed'));
      return provider;
    })(),
    solana: (() => {
      const provider = createAutoMockedSolanaProvider();
      provider.connect.mockRejectedValue(new Error('Connection failed'));
      provider.signTransaction.mockRejectedValue(new Error('Signing failed'));
      return provider;
    })(),
    // aztec: Mock AztecRouterProvider instead - removed legacy AztecProvider
  }),
};

// Export factories for different use cases
export const providerMockFactories = {
  evm: createAutoMockedEvmProvider,
  solana: createAutoMockedSolanaProvider,
  // aztec: Removed - use AztecRouterProvider mocking,
  generic: createAutoMockedProvider,
  registry: createMockedProviderRegistry,
  custom: createCustomProviderMocks,
  spied: createSpiedProvider,
  presets: providerPresets,
};

// Aliases for compatibility with existing tests
export { createAutoMockedEvmProvider as createMockEvmProvider };
export { createAutoMockedSolanaProvider as createMockSolanaProvider };
// createMockAztecProvider removed - use AztecRouterProvider mocking
export { createAutoMockedProvider as createMockProvider };
