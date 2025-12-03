import type { JSONRPCTransport } from '@walletmesh/jsonrpc';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { WalletProvider } from '../../../api/types/providers.js';
import { createMockLogger } from '../../../testing/index.js';
import { ChainType } from '../../../types.js';
import type { Logger } from '../../core/logger/logger.js';
import { ProviderRegistry } from './ProviderRegistry.js';

// Mock provider class that implements WalletProvider interface
class MockProvider implements WalletProvider {
  chainType: ChainType;
  transport: JSONRPCTransport;
  initialChainId: string;
  logger: Logger;

  constructor(
    chainType: ChainType,
    transport: JSONRPCTransport,
    initialChainId: string | undefined,
    logger: Logger,
  ) {
    this.chainType = chainType;
    this.transport = transport;
    this.initialChainId = initialChainId || '';
    this.logger = logger;
  }

  async getAccounts(): Promise<string[]> {
    return ['0x123'];
  }

  async getChainId(): Promise<string> {
    return this.initialChainId || '0x1';
  }

  on(_event: string, _listener: (...args: unknown[]) => void): void {
    // Mock implementation
  }

  off(_event: string, _listener: (...args: unknown[]) => void): void {
    // Mock implementation
  }

  async disconnect(): Promise<void> {
    // Mock disconnect
  }
}

// Mock provider class for Solana
class MockSolanaProvider implements WalletProvider {
  chainType: ChainType;
  transport: JSONRPCTransport;
  initialChainId: string;
  logger: Logger;

  constructor(
    chainType: ChainType,
    transport: JSONRPCTransport,
    initialChainId: string | undefined,
    logger: Logger,
  ) {
    this.chainType = chainType;
    this.transport = transport;
    this.initialChainId = initialChainId || '';
    this.logger = logger;
  }

  async getAccounts(): Promise<string[]> {
    return ['solana_address'];
  }

  async getChainId(): Promise<string> {
    return this.initialChainId || 'solana-mainnet';
  }

  on(_event: string, _listener: (...args: unknown[]) => void): void {
    // Mock implementation
  }

  off(_event: string, _listener: (...args: unknown[]) => void): void {
    // Mock implementation
  }

  async disconnect(): Promise<void> {
    // Mock disconnect
  }
}

describe('ProviderRegistry', () => {
  let registry: ProviderRegistry;
  let mockTransport: JSONRPCTransport;
  let mockLogger: Logger;

  beforeEach(() => {
    vi.clearAllMocks();
    registry = new ProviderRegistry();
    mockTransport = {
      send: vi.fn(),
      onMessage: vi.fn(), // Add required onMessage method
    };
    mockLogger = createMockLogger();
  });

  describe('registerProvider', () => {
    it('should register a provider class directly', () => {
      registry.registerProvider(ChainType.Evm, MockProvider);

      const hasProvider = registry.hasProvider(ChainType.Evm);
      expect(hasProvider).toBe(true);
    });

    it('should allow overriding built-in providers', async () => {
      // Register built-in
      registry.registerProvider(ChainType.Evm, MockProvider, true);

      // Override with custom
      registry.registerProvider(ChainType.Evm, MockSolanaProvider);

      // Should have the custom provider
      const provider = await registry.createProvider(ChainType.Evm, mockTransport, undefined, mockLogger);
      expect(provider).toBeInstanceOf(MockSolanaProvider);
    });

    it('should allow overriding any provider with the last registered', async () => {
      // Register custom
      registry.registerProvider(ChainType.Evm, MockProvider);

      // Override with built-in
      registry.registerProvider(ChainType.Evm, MockSolanaProvider, true);

      // Should have the new provider (last registered wins)
      const provider = await registry.createProvider(ChainType.Evm, mockTransport, undefined, mockLogger);
      expect(provider).toBeInstanceOf(MockSolanaProvider);
    });
  });

  describe('registerProviderLoader', () => {
    it('should register a provider loader', () => {
      const loader = vi.fn(async () => ({ default: MockProvider }));

      registry.registerProviderLoader(ChainType.Solana, loader);

      expect(registry.hasProvider(ChainType.Solana)).toBe(true);
    });

    it('should lazily load provider when creating', async () => {
      const loader = vi.fn(async () => ({ default: MockProvider }));

      registry.registerProviderLoader(ChainType.Aztec, loader);

      // Loader shouldn't be called yet
      expect(loader).not.toHaveBeenCalled();

      // Create provider - this should trigger loading
      const provider = await registry.createProvider(ChainType.Aztec, mockTransport, undefined, mockLogger);

      expect(loader).toHaveBeenCalledTimes(1);
      expect(provider).toBeInstanceOf(MockProvider);
    });

    it('should cache loaded providers', async () => {
      const loader = vi.fn(async () => ({ default: MockProvider }));

      registry.registerProviderLoader(ChainType.Aztec, loader);

      // Create provider twice
      const provider1 = await registry.createProvider(ChainType.Aztec, mockTransport, undefined, mockLogger);
      const provider2 = await registry.createProvider(ChainType.Aztec, mockTransport, undefined, mockLogger);

      // Both should be instances of MockProvider
      expect(provider1).toBeInstanceOf(MockProvider);
      expect(provider2).toBeInstanceOf(MockProvider);

      // Loader should only be called once
      expect(loader).toHaveBeenCalledTimes(1);
    });
  });

  describe('createProvider', () => {
    it('should create provider instance with transport', async () => {
      registry.registerProvider(ChainType.Evm, MockProvider);

      const provider = await registry.createProvider(ChainType.Evm, mockTransport, undefined, mockLogger);

      expect(provider).toBeInstanceOf(MockProvider);
      expect((provider as MockProvider).chainType).toBe(ChainType.Evm);
    });

    it('should throw error for unregistered chain type', async () => {
      await expect(
        registry.createProvider(ChainType.Aztec, mockTransport, undefined, mockLogger),
      ).rejects.toThrow('No provider registered for chain type: aztec');
    });

    it('should handle async provider creation', async () => {
      const loader = vi.fn(async () => ({ default: MockProvider }));
      registry.registerProviderLoader(ChainType.Aztec, loader);

      const provider = await registry.createProvider(ChainType.Aztec, mockTransport, undefined, mockLogger);

      expect(provider).toBeInstanceOf(MockProvider);
    });
  });

  describe('hasProvider', () => {
    it('should return true for registered providers', () => {
      registry.registerProvider(ChainType.Evm, MockProvider);

      expect(registry.hasProvider(ChainType.Evm)).toBe(true);
    });

    it('should return false for unregistered providers', () => {
      expect(registry.hasProvider(ChainType.Aztec)).toBe(false);
    });

    it('should return true for providers with loaders', () => {
      const loader = async () => ({ default: MockProvider });
      registry.registerProviderLoader(ChainType.Solana, loader);

      expect(registry.hasProvider(ChainType.Solana)).toBe(true);
    });
  });

  describe('getProviderClass', () => {
    it('should return provider class if already loaded', async () => {
      registry.registerProvider(ChainType.Evm, MockProvider);

      const providerClass = await registry.getProviderClass(ChainType.Evm);

      expect(providerClass).toBe(MockProvider);
    });

    it('should load and return provider class from loader', async () => {
      const loader = vi.fn(async () => ({ default: MockProvider }));
      registry.registerProviderLoader(ChainType.Solana, loader);

      const providerClass = await registry.getProviderClass(ChainType.Solana);

      expect(loader).toHaveBeenCalled();
      expect(providerClass).toBe(MockProvider);
    });

    it('should throw error for unregistered provider', async () => {
      await expect(registry.getProviderClass(ChainType.Aztec)).rejects.toThrow(
        'No provider registered for chain type: aztec',
      );
    });
  });

  describe('getRegisteredChainTypes', () => {
    it('should return all registered chain types', () => {
      registry.registerProvider(ChainType.Evm, MockProvider);
      registry.registerProvider(ChainType.Solana, MockSolanaProvider);

      const chainTypes = registry.getRegisteredChainTypes();

      expect(chainTypes).toHaveLength(2);
      expect(chainTypes).toContain(ChainType.Evm);
      expect(chainTypes).toContain(ChainType.Solana);
    });

    it('should return empty array when no providers registered', () => {
      const chainTypes = registry.getRegisteredChainTypes();

      expect(chainTypes).toHaveLength(0);
    });
  });

  describe('clear', () => {
    it('should remove all registered providers', () => {
      registry.registerProvider(ChainType.Evm, MockProvider);
      registry.registerProvider(ChainType.Solana, MockSolanaProvider);

      registry.clear();

      expect(registry.hasProvider(ChainType.Evm)).toBe(false);
      expect(registry.hasProvider(ChainType.Solana)).toBe(false);
      expect(registry.getRegisteredChainTypes()).toHaveLength(0);
    });
  });

  describe('concurrent loading', () => {
    it('should handle concurrent load requests for same provider', async () => {
      const loader = vi.fn().mockResolvedValue({ default: MockProvider });

      registry.registerProviderLoader(ChainType.Aztec, loader);

      // Create multiple providers concurrently
      const promises = [
        registry.createProvider(ChainType.Aztec, mockTransport, undefined, mockLogger),
        registry.createProvider(ChainType.Aztec, mockTransport, undefined, mockLogger),
        registry.createProvider(ChainType.Aztec, mockTransport, undefined, mockLogger),
      ];

      const providers = await Promise.all(promises);

      // Loader should only be called once despite concurrent requests
      expect(loader).toHaveBeenCalledTimes(1);

      // All providers should be instances of the same class
      for (const provider of providers) {
        expect(provider).toBeInstanceOf(MockProvider);
      }
    });
  });
});
