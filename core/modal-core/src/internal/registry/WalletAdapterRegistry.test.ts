/**
 * Tests for WalletAdapterRegistry
 */

import type { QualifiedResponder } from '@walletmesh/discovery';
import type { ConnectionManager } from '@walletmesh/discovery';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockLogger } from '../../testing/helpers/mocks.js';
import type { WalletAdapter } from '../adapters/wallet/WalletAdapter.js';
import { AbstractWalletAdapter } from '../wallets/base/AbstractWalletAdapter.js';
import { WalletAdapterRegistry } from './WalletAdapterRegistry.js';

// Mock wallet adapter for testing
class MockWalletAdapter extends AbstractWalletAdapter {
  constructor(
    public qualifiedResponder: QualifiedResponder,
    public connectionManager: ConnectionManager,
    public config?: Record<string, unknown>,
  ) {
    super();
    // Set required properties
    this.id = `mock-${qualifiedResponder.responderId}`;
    this.metadata = {
      name: qualifiedResponder.name,
      icon: qualifiedResponder.icon,
      description: 'Mock wallet adapter',
      homepage: '',
    };
    this.capabilities = {
      chains: [{ type: 'evm' as const, chainIds: '*' }],
      features: new Set(),
    };
  }

  async detect() {
    return { available: true };
  }

  async connect() {
    return {
      walletId: this.id,
      address: '0x123',
      accounts: ['0x123'],
      chain: {
        chainId: '1',
        chainType: 'evm' as const,
        name: 'Ethereum',
        required: false,
      },
      chainType: 'evm' as const,
      provider: null,
      walletInfo: {
        id: this.id,
        name: this.metadata.name,
        icon: this.metadata.icon,
        chains: ['evm'],
      },
    };
  }

  async disconnect() {
    // Mock disconnect
  }
}

// Another mock adapter for testing multiple registrations
class AnotherMockAdapter extends MockWalletAdapter {
  constructor(
    qualifiedResponder: QualifiedResponder,
    connectionManager: ConnectionManager,
    config?: Record<string, unknown>,
  ) {
    super(qualifiedResponder, connectionManager, config);
    this.metadata.description = 'Another mock wallet adapter';
  }
}

describe('WalletAdapterRegistry', () => {
  let registry: WalletAdapterRegistry;
  let mockLogger: ReturnType<typeof createMockLogger>;

  beforeEach(() => {
    mockLogger = createMockLogger();
    registry = new WalletAdapterRegistry(mockLogger);
  });

  describe('register', () => {
    it('should register a wallet adapter', () => {
      registry.register('MockAdapter', MockWalletAdapter);

      expect(registry.has('MockAdapter')).toBe(true);
      expect(registry.getRegisteredAdapters()).toContain('MockAdapter');
    });

    it('should register adapter with options', () => {
      const validateConfig = vi.fn((config) => true);

      registry.register('MockAdapter', MockWalletAdapter, {
        validateConfig,
        description: 'Test mock adapter',
      });

      expect(registry.has('MockAdapter')).toBe(true);
      expect(mockLogger.debug).toHaveBeenCalledWith('Registering wallet adapter', {
        name: 'MockAdapter',
        description: 'Test mock adapter',
      });
    });

    it('should throw error for invalid adapter name', () => {
      expect(() => registry.register('', MockWalletAdapter)).toThrow(
        'Adapter name must be a non-empty string',
      );
      expect(() => registry.register(null as unknown as string, MockWalletAdapter)).toThrow(
        'Adapter name must be a non-empty string',
      );
    });

    it('should throw error for invalid adapter constructor', () => {
      expect(() => registry.register('Invalid', null as unknown as typeof MockWalletAdapter)).toThrow(
        'Adapter must be a constructor function',
      );
      expect(() => registry.register('Invalid', {} as unknown as typeof MockWalletAdapter)).toThrow(
        'Adapter must be a constructor function',
      );
    });

    it('should allow re-registering an adapter', () => {
      registry.register('MockAdapter', MockWalletAdapter);

      // Re-register with different adapter
      expect(() => registry.register('MockAdapter', AnotherMockAdapter)).not.toThrow();

      const AdapterClass = registry.get('MockAdapter');
      expect(AdapterClass).toBe(AnotherMockAdapter);
    });
  });

  describe('unregister', () => {
    it('should unregister an adapter', () => {
      registry.register('MockAdapter', MockWalletAdapter);

      const result = registry.unregister('MockAdapter');

      expect(result).toBe(true);
      expect(registry.has('MockAdapter')).toBe(false);
      expect(mockLogger.debug).toHaveBeenCalledWith('Unregistered wallet adapter', { name: 'MockAdapter' });
    });

    it('should return false when unregistering non-existent adapter', () => {
      const result = registry.unregister('NonExistent');

      expect(result).toBe(false);
      expect(mockLogger.debug).not.toHaveBeenCalledWith('Unregistered wallet adapter', expect.any(Object));
    });
  });

  describe('get', () => {
    it('should get a registered adapter', () => {
      registry.register('MockAdapter', MockWalletAdapter);

      const AdapterClass = registry.get('MockAdapter');

      expect(AdapterClass).toBe(MockWalletAdapter);
    });

    it('should return undefined for non-existent adapter', () => {
      const AdapterClass = registry.get('NonExistent');

      expect(AdapterClass).toBeUndefined();
    });
  });

  describe('has', () => {
    it('should return true for registered adapter', () => {
      registry.register('MockAdapter', MockWalletAdapter);

      expect(registry.has('MockAdapter')).toBe(true);
    });

    it('should return false for non-existent adapter', () => {
      expect(registry.has('NonExistent')).toBe(false);
    });
  });

  describe('getRegisteredAdapters', () => {
    it('should return empty array when no adapters registered', () => {
      expect(registry.getRegisteredAdapters()).toEqual([]);
    });

    it('should return all registered adapter names', () => {
      registry.register('MockAdapter', MockWalletAdapter);
      registry.register('AnotherAdapter', AnotherMockAdapter);

      const adapters = registry.getRegisteredAdapters();

      expect(adapters).toHaveLength(2);
      expect(adapters).toContain('MockAdapter');
      expect(adapters).toContain('AnotherAdapter');
    });
  });

  describe('validateConfig', () => {
    it('should validate config using validation function', () => {
      const validateConfig = vi.fn((config: unknown) => {
        return config && typeof config === 'object' && 'apiKey' in config;
      });

      registry.register('MockAdapter', MockWalletAdapter, { validateConfig });

      expect(registry.validateConfig('MockAdapter', { apiKey: 'test' })).toBe(true);
      expect(registry.validateConfig('MockAdapter', { wrongKey: 'test' })).toBe(false);
      expect(validateConfig).toHaveBeenCalledTimes(2);
    });

    it('should return true when no validation function exists', () => {
      registry.register('MockAdapter', MockWalletAdapter);

      expect(registry.validateConfig('MockAdapter', null)).toBe(true);
      expect(registry.validateConfig('MockAdapter', { any: 'config' })).toBe(true);
    });

    it('should return true for non-existent adapter', () => {
      expect(registry.validateConfig('NonExistent', null)).toBe(true);
    });
  });

  describe('createAdapter', () => {
    const mockQualifiedResponder: QualifiedResponder = {
      responderId: 'test-responder',
      sessionId: 'test-session',
      rdns: 'com.test.wallet',
      name: 'Test Wallet',
      icon: 'data:image/svg+xml;base64,test',
      type: 'responder:announce',
      version: '0.1.0',
      timestamp: Date.now(),
      matched: {
        required: {
          chains: ['evm:1'],
          features: [],
          interfaces: [],
        },
      },
      transportConfig: {
        type: 'extension',
        extensionId: 'test-extension-id',
      },
    };

    const mockConnectionManager = {
      connect: vi.fn(),
      disconnect: vi.fn(),
    } as unknown as ConnectionManager;

    it('should create an adapter instance', () => {
      registry.register('MockAdapter', MockWalletAdapter);

      const adapter = registry.createAdapter('MockAdapter', mockQualifiedResponder, mockConnectionManager, {
        test: true,
      });

      expect(adapter).toBeInstanceOf(MockWalletAdapter);
      expect((adapter as MockWalletAdapter).qualifiedResponder).toBe(mockQualifiedResponder);
      expect((adapter as MockWalletAdapter).connectionManager).toBe(mockConnectionManager);
      expect((adapter as MockWalletAdapter).config).toEqual({ test: true });
    });

    it('should throw error for non-existent adapter', () => {
      expect(() =>
        registry.createAdapter('NonExistent', mockQualifiedResponder, mockConnectionManager),
      ).toThrow("Wallet adapter 'NonExistent' not found in registry");
    });

    it('should throw error when config validation fails', () => {
      const validateConfig = vi.fn(() => false);
      registry.register('MockAdapter', MockWalletAdapter, { validateConfig });

      expect(() =>
        registry.createAdapter('MockAdapter', mockQualifiedResponder, mockConnectionManager, {
          invalid: true,
        }),
      ).toThrow("Invalid configuration for adapter 'MockAdapter'");
    });

    it('should throw error when adapter construction fails', () => {
      class FailingAdapter extends AbstractWalletAdapter {
        constructor() {
          super();
          throw new Error('Construction failed');
        }
        async detect() {
          return { available: false };
        }
        async connect() {
          throw new Error('Not implemented');
        }
        async disconnect() {}
      }

      registry.register('FailingAdapter', FailingAdapter as unknown as typeof MockWalletAdapter);

      expect(() =>
        registry.createAdapter('FailingAdapter', mockQualifiedResponder, mockConnectionManager),
      ).toThrow("Failed to create adapter 'FailingAdapter'");
    });
  });

  describe('clear', () => {
    it('should clear all registered adapters', () => {
      registry.register('MockAdapter', MockWalletAdapter);
      registry.register('AnotherAdapter', AnotherMockAdapter);

      registry.clear();

      expect(registry.getRegisteredAdapters()).toEqual([]);
      expect(registry.has('MockAdapter')).toBe(false);
      expect(registry.has('AnotherAdapter')).toBe(false);
      expect(mockLogger.debug).toHaveBeenCalledWith('Cleared all registered adapters');
    });
  });

  describe('getStats', () => {
    it('should return registry statistics', () => {
      registry.register('MockAdapter', MockWalletAdapter);
      registry.register('AnotherAdapter', AnotherMockAdapter);

      const stats = registry.getStats();

      expect(stats).toEqual({
        registeredCount: 2,
        adapterNames: ['MockAdapter', 'AnotherAdapter'],
      });
    });

    it('should return empty stats when no adapters registered', () => {
      const stats = registry.getStats();

      expect(stats).toEqual({
        registeredCount: 0,
        adapterNames: [],
      });
    });
  });
});
