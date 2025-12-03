import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChainType } from '../../../testing/index.js';
import { ProviderRegistry } from './ProviderRegistry.js';
import { registerBuiltinProviders } from './registerBuiltinProviders.js';

// Mock the ProviderRegistry
vi.mock('./ProviderRegistry.js', () => ({
  ProviderRegistry: {
    getInstance: vi.fn(),
  },
}));

// Mock the provider imports
vi.mock('../../providers/evm/EvmProvider.js', () => ({
  EvmProvider: class MockEvmProvider {},
}));

vi.mock('../../providers/solana/SolanaProvider.js', () => ({
  SolanaProvider: class MockSolanaProvider {},
}));

describe('registerBuiltinProviders', () => {
  let mockRegistry: {
    registerProvider: ReturnType<typeof vi.fn>;
    registerProviderLoader: ReturnType<typeof vi.fn>;
    hasProvider: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock provider registry (not wallet registry)
    mockRegistry = {
      registerProvider: vi.fn(),
      registerProviderLoader: vi.fn(),
      hasProvider: vi.fn(() => false),
    };

    // Make getInstance return our mock
    (ProviderRegistry.getInstance as ReturnType<typeof vi.fn>).mockReturnValue(mockRegistry);
  });

  it('should register EVM provider directly', () => {
    registerBuiltinProviders();

    expect(mockRegistry.registerProvider).toHaveBeenCalledWith(
      ChainType.Evm,
      expect.any(Function), // EvmProvider class
      true, // isBuiltIn
    );
  });

  it('should register Solana provider directly', () => {
    registerBuiltinProviders();

    expect(mockRegistry.registerProvider).toHaveBeenCalledWith(
      ChainType.Solana,
      expect.any(Function), // SolanaProvider class
      true, // isBuiltIn
    );
  });

  it('should not register Aztec provider (now using AztecRouterProvider)', () => {
    registerBuiltinProviders();

    // Aztec is no longer registered as a built-in provider
    // It now uses AztecRouterProvider from @walletmesh/aztec-rpc-wallet
    expect(mockRegistry.registerProviderLoader).not.toHaveBeenCalled();
  });

  it('should get registry instance once', () => {
    registerBuiltinProviders();

    expect(ProviderRegistry.getInstance).toHaveBeenCalledTimes(1);
  });

  it('should register all providers even if already registered', () => {
    mockRegistry.hasProvider.mockReturnValue(true);

    registerBuiltinProviders();

    // The implementation doesn't check hasProvider, it always registers
    expect(mockRegistry.registerProvider).toHaveBeenCalledTimes(2); // EVM and Solana only
    expect(mockRegistry.registerProviderLoader).not.toHaveBeenCalled(); // No Aztec
  });

  it('should register all providers regardless of existing registrations', () => {
    // Only EVM is registered
    mockRegistry.hasProvider.mockImplementation((chainType) => chainType === ChainType.Evm);

    registerBuiltinProviders();

    // The implementation doesn't check hasProvider, so EVM and Solana are registered
    expect(mockRegistry.registerProvider).toHaveBeenCalledWith(ChainType.Evm, expect.any(Function), true);

    expect(mockRegistry.registerProvider).toHaveBeenCalledWith(ChainType.Solana, expect.any(Function), true);

    // Aztec is no longer registered as a built-in provider
    expect(mockRegistry.registerProviderLoader).not.toHaveBeenCalled();
  });

  // Aztec provider loader tests removed - Aztec now uses AztecRouterProvider

  it('should handle all chain types', () => {
    registerBuiltinProviders();

    // Check that EVM and Solana chain types are handled
    const registeredChainTypes = [
      ...mockRegistry.registerProvider.mock.calls.map((call) => call[0]),
      ...mockRegistry.registerProviderLoader.mock.calls.map((call) => call[0]),
    ];

    expect(registeredChainTypes).toContain(ChainType.Evm);
    expect(registeredChainTypes).toContain(ChainType.Solana);
    // Aztec is no longer registered as a built-in provider
    expect(registeredChainTypes).not.toContain(ChainType.Aztec);
    expect(registeredChainTypes).toHaveLength(2);
  });

  it('should mark all providers as built-in', () => {
    registerBuiltinProviders();

    // Check EVM
    const evmCall = mockRegistry.registerProvider.mock.calls.find((call) => call[0] === ChainType.Evm);
    expect(evmCall?.[2]).toBe(true);

    // Check Solana
    const solanaCall = mockRegistry.registerProvider.mock.calls.find((call) => call[0] === ChainType.Solana);
    expect(solanaCall?.[2]).toBe(true);

    // Aztec is no longer registered as a built-in provider
    expect(mockRegistry.registerProviderLoader).not.toHaveBeenCalled();
  });
});
