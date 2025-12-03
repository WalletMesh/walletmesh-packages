/**
 * Tests for ProviderLoader
 *
 * @module providers/ProviderLoader.test
 */

import type { JSONRPCTransport } from '@walletmesh/jsonrpc';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProviderClass, WalletProvider } from '../api/types/providers.js';
import type { Logger } from '../internal/core/logger/logger.js';
import {
  createMockJSONRPCTransport,
  createMockLogger,
  createTestEnvironment,
  installCustomMatchers,
} from '../testing/index.js';
import { ChainType } from '../types.js';
import { ProviderLoader, createProviderLoader } from './ProviderLoader.js';

// Install domain-specific matchers
installCustomMatchers();

// Mock provider classes
class MockEvmProvider implements WalletProvider {
  constructor(
    public chainType: ChainType,
    public transport: JSONRPCTransport,
    public initialChainId: string | undefined,
    public logger: Logger,
  ) {}

  async getAccounts(): Promise<string[]> {
    return ['0x1234567890123456789012345678901234567890'];
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
    // Mock implementation
  }
}

class MockSolanaProvider implements WalletProvider {
  constructor(
    public chainType: ChainType,
    public transport: JSONRPCTransport,
    public initialChainId: string | undefined,
    public logger: Logger,
  ) {}

  async getAccounts(): Promise<string[]> {
    return ['11111111111111111111111111111111'];
  }

  async getChainId(): Promise<string> {
    return 'mainnet-beta';
  }

  on(_event: string, _listener: (...args: unknown[]) => void): void {
    // Mock implementation
  }

  off(_event: string, _listener: (...args: unknown[]) => void): void {
    // Mock implementation
  }

  async disconnect(): Promise<void> {
    // Mock implementation
  }
}

// Mock modules
vi.mock('./evm/index.js', () => ({
  EvmProvider: MockEvmProvider,
  default: MockEvmProvider,
}));

vi.mock('./solana/index.js', () => ({
  SolanaProvider: MockSolanaProvider,
  default: MockSolanaProvider,
}));

vi.mock('./aztec/index.js', () => ({
  AztecProvider: class MockAztecProvider extends MockEvmProvider {},
  default: class MockAztecProvider extends MockEvmProvider {},
}));

describe('ProviderLoader', () => {
  let loader: ProviderLoader;
  let mockTransport: JSONRPCTransport;
  let mockLogger: Logger;
  const testEnv = createTestEnvironment();

  beforeEach(async () => {
    await testEnv.setup();

    // Create mock transport
    mockTransport = createMockJSONRPCTransport();

    // Create mock logger
    mockLogger = createMockLogger();

    // Create provider loader
    loader = new ProviderLoader({
      logger: mockLogger,
    });
  });

  afterEach(async () => {
    await testEnv.teardown();
  });

  describe('initialization', () => {
    it('should initialize without preloading', async () => {
      await loader.initialize();
      expect(mockLogger.debug).toHaveBeenCalledWith('ProviderLoader: Initializing');
      expect(mockLogger.debug).toHaveBeenCalledWith('ProviderLoader: Initialization complete');
    });

    it('should preload configured providers on initialization', async () => {
      const preloadLoader = new ProviderLoader({
        logger: mockLogger,
        preloadOnInit: true,
        preloadChainTypes: [ChainType.Evm, ChainType.Solana],
      });

      await preloadLoader.initialize();

      expect(mockLogger.debug).toHaveBeenCalledWith('ProviderLoader: Preloading providers', {
        chainTypes: [ChainType.Evm, ChainType.Solana],
      });
      expect(mockLogger.debug).toHaveBeenCalledWith('ProviderLoader: Preloaded provider for evm');
      expect(mockLogger.debug).toHaveBeenCalledWith('ProviderLoader: Preloaded provider for solana');
    });

    it('should handle initialization called multiple times', async () => {
      await loader.initialize();
      await loader.initialize();

      // Should only log initialization once
      expect(mockLogger.debug).toHaveBeenCalledTimes(2); // Init + complete
    });
  });

  describe('provider registration', () => {
    it('should register built-in providers automatically', () => {
      expect(loader.hasProvider(ChainType.Evm)).toBe(true);
      expect(loader.hasProvider(ChainType.Solana)).toBe(true);
      expect(loader.hasProvider(ChainType.Aztec)).toBe(true);
    });

    it('should register custom providers', () => {
      const customLoader = new ProviderLoader({
        customProviders: {
          ['custom' as ChainType]: async () => ({ default: MockEvmProvider as ProviderClass }),
        },
      });

      expect(customLoader.hasProvider('custom' as ChainType)).toBe(true);
    });

    it('should return all registered chain types', () => {
      const chainTypes = loader.getRegisteredChainTypes();
      expect(chainTypes).toContain(ChainType.Evm);
      expect(chainTypes).toContain(ChainType.Solana);
      expect(chainTypes).toContain(ChainType.Aztec);
    });
  });

  describe('provider loading', () => {
    it('should load EVM provider', async () => {
      const ProviderClass = await loader.getProviderClass(ChainType.Evm);
      expect(ProviderClass).toBe(MockEvmProvider);
    });

    it('should load Solana provider', async () => {
      const ProviderClass = await loader.getProviderClass(ChainType.Solana);
      expect(ProviderClass).toBe(MockSolanaProvider);
    });

    it('should cache loaded providers', async () => {
      const firstLoad = await loader.getProviderClass(ChainType.Evm);
      const secondLoad = await loader.getProviderClass(ChainType.Evm);

      expect(firstLoad).toBe(secondLoad);
      expect(mockLogger.debug).toHaveBeenCalledWith('ProviderLoader: Loading provider for evm');
      expect(mockLogger.debug).toHaveBeenCalledTimes(2); // Loading + success
    });

    it('should handle concurrent loading of same provider', async () => {
      const loadPromises = [
        loader.getProviderClass(ChainType.Evm),
        loader.getProviderClass(ChainType.Evm),
        loader.getProviderClass(ChainType.Evm),
      ];

      const results = await Promise.all(loadPromises);

      expect(results[0]).toBe(results[1]);
      expect(results[1]).toBe(results[2]);

      // Should only log loading once
      expect(mockLogger.debug).toHaveBeenCalledWith('ProviderLoader: Loading provider for evm');
    });

    it('should throw error for unregistered provider', async () => {
      await expect(loader.getProviderClass('unknown' as ChainType)).rejects.toThrow(
        'No provider registered for chain type: unknown',
      );
    });

    it('should handle loading errors', async () => {
      const errorLoader = new ProviderLoader({
        logger: mockLogger,
        customProviders: {
          ['error' as ChainType]: async () => {
            throw new Error('Failed to load module');
          },
        },
      });

      await expect(errorLoader.getProviderClass('error' as ChainType)).rejects.toThrow(
        'Failed to load provider module for error: Failed to load module',
      );
    });
  });

  describe('provider creation', () => {
    it('should create EVM provider instance', async () => {
      const provider = await loader.createProvider(ChainType.Evm, mockTransport, '0x1', mockLogger);

      expect(provider).toBeInstanceOf(MockEvmProvider);
      const evmProvider = provider as MockEvmProvider;
      expect(evmProvider.chainType).toBe(ChainType.Evm);
      expect(evmProvider.transport).toBe(mockTransport);
      expect(evmProvider.initialChainId).toBe('0x1');
    });

    it('should create Solana provider instance', async () => {
      const provider = await loader.createProvider(
        ChainType.Solana,
        mockTransport,
        'mainnet-beta',
        mockLogger,
      );

      expect(provider).toBeInstanceOf(MockSolanaProvider);
      const solanaProvider = provider as MockSolanaProvider;
      expect(solanaProvider.chainType).toBe(ChainType.Solana);
    });

    it('should handle provider creation errors', async () => {
      // Mock a provider that throws on construction
      const errorLoader = new ProviderLoader({
        customProviders: {
          ['broken' as ChainType]: async () => ({
            default: class BrokenProvider {
              constructor() {
                throw new Error('Construction failed');
              }
            } as ProviderClass,
          }),
        },
      });

      await expect(
        errorLoader.createProvider('broken' as ChainType, mockTransport, undefined, mockLogger),
      ).rejects.toThrow('Failed to create provider for broken: Construction failed');
    });
  });

  describe('preloading', () => {
    it('should preload multiple providers', async () => {
      await loader.preloadConfiguredProviders([ChainType.Evm, ChainType.Solana]);

      // Check that providers are loaded
      const evmStatus = loader.getProviderStatus(ChainType.Evm);
      const solanaStatus = loader.getProviderStatus(ChainType.Solana);

      expect(evmStatus.isLoaded).toBe(true);
      expect(solanaStatus.isLoaded).toBe(true);
    });

    it('should continue preloading even if one provider fails', async () => {
      const mixedLoader = new ProviderLoader({
        logger: mockLogger,
        customProviders: {
          ['broken' as ChainType]: async () => {
            throw new Error('Load failed');
          },
        },
      });

      await mixedLoader.preloadConfiguredProviders([ChainType.Evm, 'broken' as ChainType, ChainType.Solana]);

      // EVM and Solana should still be loaded
      expect(mixedLoader.getProviderStatus(ChainType.Evm).isLoaded).toBe(true);
      expect(mixedLoader.getProviderStatus(ChainType.Solana).isLoaded).toBe(true);
      expect(mixedLoader.getProviderStatus('broken' as ChainType).isLoaded).toBe(false);
    });
  });

  describe('provider status', () => {
    it('should return correct status for unregistered provider', () => {
      const status = loader.getProviderStatus('unknown' as ChainType);

      expect(status).toEqual({
        isRegistered: false,
        isLoaded: false,
        isLoading: false,
        isBuiltIn: false,
      });
    });

    it('should return correct status for registered but unloaded provider', () => {
      const status = loader.getProviderStatus(ChainType.Evm);

      expect(status).toEqual({
        isRegistered: true,
        isLoaded: false,
        isLoading: false,
        isBuiltIn: true,
      });
    });

    it('should return correct status for loaded provider', async () => {
      await loader.getProviderClass(ChainType.Evm);
      const status = loader.getProviderStatus(ChainType.Evm);

      expect(status).toEqual({
        isRegistered: true,
        isLoaded: true,
        isLoading: false,
        isBuiltIn: true,
      });
    });
  });

  describe('cache management', () => {
    it('should clear provider cache', async () => {
      // Load a provider
      await loader.getProviderClass(ChainType.Evm);
      expect(loader.getProviderStatus(ChainType.Evm).isLoaded).toBe(true);

      // Clear cache
      loader.clearCache();
      expect(loader.getProviderStatus(ChainType.Evm).isLoaded).toBe(false);
      expect(mockLogger.debug).toHaveBeenCalledWith('ProviderLoader: Cleared provider cache');
    });
  });

  describe('provider information', () => {
    it('should return provider information', async () => {
      await loader.getProviderClass(ChainType.Evm);

      const info = loader.getProviderInfo();

      expect(info).toContainEqual({
        chainType: ChainType.Evm,
        isLoaded: true,
        isBuiltIn: true,
      });

      expect(info).toContainEqual({
        chainType: ChainType.Solana,
        isLoaded: false,
        isBuiltIn: true,
      });
    });
  });

  describe('provider factory', () => {
    it('should create a provider factory function', async () => {
      const factory = loader.createProviderFactory();

      const provider = await factory(ChainType.Evm, mockTransport, '0x1', mockLogger);

      expect(provider).toBeInstanceOf(MockEvmProvider);
      const evmProvider = provider as MockEvmProvider;
      expect(evmProvider.chainType).toBe(ChainType.Evm);
    });
  });

  describe('createProviderLoader', () => {
    it('should create a provider loader with config', () => {
      const loader = createProviderLoader({
        preloadOnInit: true,
        preloadChainTypes: [ChainType.Evm],
      });

      expect(loader).toBeInstanceOf(ProviderLoader);
      expect(loader.hasProvider(ChainType.Evm)).toBe(true);
    });
  });
});
