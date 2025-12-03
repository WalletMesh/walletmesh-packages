/**
 * Tests for DiscoveryService custom adapter functionality
 */

import type { QualifiedResponder } from '@walletmesh/discovery';
import type { ConnectionManager } from '@walletmesh/discovery';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WalletAdapter } from '../internal/adapters/wallet/WalletAdapter.js';
import { globalAdapterRegistry } from '../internal/registry/WalletAdapterRegistry.js';
import { AbstractWalletAdapter } from '../internal/wallets/base/AbstractWalletAdapter.js';
import { DiscoveryAdapter } from '../internal/wallets/discovery/DiscoveryAdapter.js';
import { createMockLogger, createMockRegistry } from '../testing/helpers/mocks.js';
import {
  setupDiscoveryInitiatorMock,
  type MockDiscoveryInitiator,
} from '../testing/helpers/setupDiscoveryInitiatorMock.js';
import { DiscoveryService } from './DiscoveryService.js';

// Mock @walletmesh/discovery module
vi.mock('@walletmesh/discovery', () => ({
  DiscoveryInitiator: vi.fn(),
  createInitiatorSession: vi.fn(),
}));

// Mock the store module
vi.mock('../state/store.js', () => ({
  getStoreInstance: vi.fn(() => ({
    getState: vi.fn(() => ({
      ui: { isOpen: false, isLoading: false, error: undefined },
      connections: {
        activeSessions: [],
        availableWallets: [],
        discoveredWallets: [],
        activeSessionId: null,
        connectionStatus: 'disconnected',
      },
      transactions: {
        pending: [],
        confirmed: [],
        failed: [],
        activeTransaction: undefined,
      },
      entities: {
        wallets: {},
      },
    })),
    setState: vi.fn(),
    subscribe: vi.fn(() => vi.fn()),
    subscribeWithSelector: vi.fn(() => vi.fn()),
  })),
}));

// Custom adapter for testing
class CustomAztecAdapter extends AbstractWalletAdapter {
  public customFeature = true; // Custom feature to verify correct adapter is used

  constructor(
    public qualifiedResponder: QualifiedResponder,
    public connectionManager: ConnectionManager,
    public config?: Record<string, unknown>,
  ) {
    super();
    this.id = `custom-${qualifiedResponder.responderId}`;
    this.metadata = {
      name: qualifiedResponder.name,
      icon: qualifiedResponder.icon,
      description: 'Custom Aztec wallet adapter',
      homepage: '',
    };
    this.capabilities = {
      chains: [{ type: 'aztec' as const, chainIds: '*' }],
      features: new Set(['private-transactions', 'shielded-transfers']),
    };
  }

  async detect() {
    return { available: true };
  }

  async connect() {
    return {
      walletId: this.id,
      address: 'aztec:0x123',
      accounts: ['aztec:0x123'],
      chain: {
        chainId: 'aztec:mainnet',
        chainType: 'aztec' as const,
        name: 'Aztec Mainnet',
        required: false,
      },
      chainType: 'aztec' as const,
      provider: null,
      walletInfo: {
        id: this.id,
        name: this.metadata.name,
        icon: this.metadata.icon,
        chains: ['aztec'],
      },
    };
  }

  async disconnect() {
    // Mock disconnect
  }
}

describe('DiscoveryService - Custom Adapter Support', () => {
  let discoveryService: DiscoveryService;
  let mockLogger: ReturnType<typeof createMockLogger>;
  let mockRegistry: ReturnType<typeof createMockRegistry>;
  let mockInitiator: MockDiscoveryInitiator;

  const mockQualifiedResponder: QualifiedResponder = {
    responderId: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID
    rdns: 'com.aztec.wallet',
    name: 'Aztec Privacy Wallet',
    icon: 'data:image/svg+xml;base64,test',
    matched: {
      required: {
        chains: ['aztec:mainnet'],
        features: ['private-transactions'],
        interfaces: ['aztec-wallet-api-v1'],
      },
    },
    transportConfig: {
      type: 'extension',
      extensionId: 'test-extension-id',
      walletAdapter: 'CustomAztecAdapter', // Specifies custom adapter
    },
  };

  const mockConnectionManager = {
    connect: vi.fn().mockResolvedValue({
      accounts: [{ address: 'aztec:0x123', chainId: 'aztec:mainnet' }],
    }),
    disconnect: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    vi.useFakeTimers();
    mockLogger = createMockLogger();
    mockRegistry = createMockRegistry();

    ({ mockInitiator } = await setupDiscoveryInitiatorMock({
      getQualifiedResponders: vi.fn().mockReturnValue([]),
      on: vi.fn(),
      off: vi.fn(),
      removeAllListeners: vi.fn(),
    }));

    // Clear registry before each test
    globalAdapterRegistry.clear();

    // Create discovery service
    discoveryService = new DiscoveryService(
      {
        initiatorInfo: {
          name: 'Test dApp',
          url: 'https://test.com',
          icon: 'data:image/svg+xml;base64,test',
        },
        discoveryTimeoutMs: 3000,
      },
      mockRegistry,
      mockLogger,
    );

    // Mock event wrapper for discovery
    const mockEventWrapper = {
      startDiscovery: vi.fn().mockResolvedValue([mockQualifiedResponder]),
      stopDiscovery: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    };

    // Mock connection manager
    discoveryService['eventWrapper'] =
      mockEventWrapper as unknown as (typeof discoveryService)['eventWrapper'];
    discoveryService['connectionManager'] =
      mockConnectionManager as unknown as (typeof discoveryService)['connectionManager'];

    // Store wallet in qualifiedWallets map for later retrieval
    discoveryService['qualifiedWallets'].set('550e8400-e29b-41d4-a716-446655440000', mockQualifiedResponder);
    discoveryService['discoveredResponders'].set(
      '550e8400-e29b-41d4-a716-446655440000',
      mockQualifiedResponder,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    globalAdapterRegistry.clear();
  });

  describe('Custom adapter creation', () => {
    it('should use custom adapter when specified in transportConfig', async () => {
      // Register the custom adapter
      globalAdapterRegistry.register('CustomAztecAdapter', CustomAztecAdapter);

      // Create adapter
      const adapter = await discoveryService.createWalletAdapter('550e8400-e29b-41d4-a716-446655440000');

      // Verify custom adapter was used
      expect(adapter).toBeInstanceOf(CustomAztecAdapter);
      expect((adapter as CustomAztecAdapter).customFeature).toBe(true);
      expect(adapter.id).toBe('custom-550e8400-e29b-41d4-a716-446655440000');

      // Verify logger was called
      expect(mockLogger.debug).toHaveBeenCalledWith('Using custom wallet adapter', {
        walletId: '550e8400-e29b-41d4-a716-446655440000',
        adapterName: 'CustomAztecAdapter',
      });
    });

    it('should fallback to DiscoveryAdapter when custom adapter not registered', async () => {
      // Don't register the adapter - should fallback
      const adapter = await discoveryService.createWalletAdapter('550e8400-e29b-41d4-a716-446655440000');

      // Verify generic DiscoveryAdapter was used
      expect(adapter).toBeInstanceOf(DiscoveryAdapter);
      expect((adapter as unknown as { customFeature?: unknown }).customFeature).toBeUndefined();
    });

    it('should fallback to DiscoveryAdapter when custom adapter creation fails', async () => {
      // Register a failing adapter
      class FailingAdapter extends AbstractWalletAdapter {
        constructor() {
          super();
          throw new Error('Adapter construction failed');
        }
        async detect() {
          return { available: false };
        }
        async connect() {
          throw new Error('Not implemented');
        }
        async disconnect() {}
      }

      globalAdapterRegistry.register('CustomAztecAdapter', FailingAdapter as unknown as typeof WalletAdapter);

      // Create adapter - should fallback
      const adapter = await discoveryService.createWalletAdapter('550e8400-e29b-41d4-a716-446655440000');

      // Verify fallback to DiscoveryAdapter
      expect(adapter).toBeInstanceOf(DiscoveryAdapter);

      // Verify warning was logged
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Failed to create custom adapter, falling back to DiscoveryAdapter',
        expect.objectContaining({
          walletId: '550e8400-e29b-41d4-a716-446655440000',
          adapterName: 'CustomAztecAdapter',
        }),
      );
    });

    it('should use DiscoveryAdapter when no custom adapter specified', async () => {
      // Create responder without walletAdapter in transportConfig
      const standardResponder: QualifiedResponder = {
        ...mockQualifiedResponder,
        responderId: '550e8400-e29b-41d4-a716-446655440002', // Different UUID
        transportConfig: {
          type: 'extension',
          extensionId: 'test-extension-id',
          // No walletAdapter specified
        },
      };

      discoveryService['discoveredResponders'].set('550e8400-e29b-41d4-a716-446655440002', standardResponder);

      const adapter = await discoveryService.createWalletAdapter('550e8400-e29b-41d4-a716-446655440002');

      // Verify DiscoveryAdapter was used
      expect(adapter).toBeInstanceOf(DiscoveryAdapter);
    });

    it('should cache and reuse adapters', async () => {
      // Register custom adapter
      globalAdapterRegistry.register('CustomAztecAdapter', CustomAztecAdapter);

      // Create adapter first time
      const adapter1 = await discoveryService.createWalletAdapter('550e8400-e29b-41d4-a716-446655440000');

      // Create adapter second time - should return cached
      const adapter2 = await discoveryService.createWalletAdapter('550e8400-e29b-41d4-a716-446655440000');

      // Verify same instance returned
      expect(adapter2).toBe(adapter1);

      // Verify constructor was only called once (through registry)
      expect(mockLogger.debug).toHaveBeenCalledWith('Using custom wallet adapter', expect.any(Object));
      expect(mockLogger.debug).toHaveBeenCalledTimes(2); // Once for creation, not for cache hit
    });
  });

  describe('Adapter configuration', () => {
    it('should pass configuration to custom adapter', async () => {
      // Register custom adapter
      globalAdapterRegistry.register('CustomAztecAdapter', CustomAztecAdapter);

      // Create adapter with config
      const config = { autoConnect: false, customOption: 'test' };
      const adapter = await discoveryService.createWalletAdapter(
        '550e8400-e29b-41d4-a716-446655440000',
        config,
      );

      // Verify config was passed
      expect((adapter as CustomAztecAdapter).config).toEqual(expect.objectContaining(config));
    });

    it('should merge transport config with provided config', async () => {
      // Update discovery service with transport config
      discoveryService['config'].transport.adapterConfig = { defaultOption: 'default' };

      // Register custom adapter
      globalAdapterRegistry.register('CustomAztecAdapter', CustomAztecAdapter);

      // Create adapter with additional config
      const adapter = await discoveryService.createWalletAdapter('550e8400-e29b-41d4-a716-446655440000', {
        autoConnect: true,
      });

      // Verify configs were merged
      expect((adapter as CustomAztecAdapter).config).toEqual({
        defaultOption: 'default',
        autoConnect: true,
      });
    });
  });

  describe('Integration with discovery flow', () => {
    it('should register wallets with custom adapter info during discovery', async () => {
      // Register custom adapter
      globalAdapterRegistry.register('CustomAztecAdapter', CustomAztecAdapter);

      // Configure mock to return the qualified responder
      mockInitiator.startDiscovery.mockResolvedValue([mockQualifiedResponder]);

      // Perform discovery
      const results = await discoveryService.scan();

      // Verify wallet was registered in the registry with updated metadata
      expect(mockRegistry.registerDiscoveredWallet).toHaveBeenCalledTimes(1);
      const registeredWallet = mockRegistry.registerDiscoveredWallet.mock.calls[0][0];
      expect(registeredWallet).toMatchObject({
        id: 'com.aztec.wallet',
        responderId: mockQualifiedResponder.responderId,
        name: 'Aztec Privacy Wallet',
        adapterType: 'discovery',
      });
      expect(registeredWallet.adapterConfig).toEqual(
        expect.objectContaining({
          qualifiedResponder: mockQualifiedResponder,
        }),
      );
      expect(registeredWallet.adapterConfig.transportConfig).toBeDefined();

      // Verify custom adapter info is in the metadata
      expect(registeredWallet.metadata).toEqual(
        expect.objectContaining({
          customAdapter: 'CustomAztecAdapter',
          canonicalId: 'com.aztec.wallet',
          responderId: mockQualifiedResponder.responderId,
        }),
      );

      // Results should contain wallet info
      expect(results).toHaveLength(1);
      expect(results[0].wallet).toStrictEqual(mockQualifiedResponder);
      // Adapter is no longer created during discovery
      expect(results[0].adapter).toBeNull();
    });

    it('should handle mixed custom and generic wallets during discovery', async () => {
      // Register custom adapter
      globalAdapterRegistry.register('CustomAztecAdapter', CustomAztecAdapter);

      // Add another wallet without custom adapter
      const genericResponder: QualifiedResponder = {
        ...mockQualifiedResponder,
        responderId: '550e8400-e29b-41d4-a716-446655440001', // Different UUID
        transportConfig: {
          type: 'extension',
          extensionId: 'generic-extension-id',
          // No walletAdapter specified
        },
      };

      // Configure mock to return both wallets
      mockInitiator.startDiscovery.mockResolvedValue([mockQualifiedResponder, genericResponder]);

      discoveryService['qualifiedWallets'].set('550e8400-e29b-41d4-a716-446655440001', genericResponder);
      discoveryService['discoveredResponders'].set('550e8400-e29b-41d4-a716-446655440001', genericResponder);

      // Perform discovery
      const results = await discoveryService.scan();

      // Verify both wallets were registered with correct metadata
      expect(results).toHaveLength(2);
      expect(mockRegistry.registerDiscoveredWallet).toHaveBeenCalledTimes(2);

      // Check that custom adapter info was stored for the custom wallet
      const customWalletArgs = mockRegistry.registerDiscoveredWallet.mock.calls.find(
        ([wallet]) => wallet.metadata?.customAdapter === 'CustomAztecAdapter',
      );
      const customWallet = customWalletArgs?.[0];
      expect(customWallet?.metadata).toEqual(
        expect.objectContaining({
          customAdapter: 'CustomAztecAdapter',
        }),
      );

      // Check that generic wallet doesn't have custom adapter info
      const genericWalletArgs = mockRegistry.registerDiscoveredWallet.mock.calls.find(
        ([wallet]) => !wallet.metadata?.customAdapter,
      );
      const genericWallet = genericWalletArgs?.[0];
      expect(genericWallet?.metadata?.customAdapter).toBeUndefined();
    });
  });

  describe('Adapter registry validation', () => {
    it('should validate adapter config if validation function provided', async () => {
      const validateConfig = vi.fn((config: unknown) => {
        return config && typeof config === 'object' && 'requiredField' in config;
      });

      // Register adapter with validation
      globalAdapterRegistry.register('CustomAztecAdapter', CustomAztecAdapter, {
        validateConfig,
        description: 'Custom Aztec adapter with validation',
      });

      // Try to create adapter with invalid config
      const invalidConfig = { autoConnect: false }; // Missing requiredField

      // This should fail validation and fallback to DiscoveryAdapter
      const adapter = await discoveryService.createWalletAdapter(
        '550e8400-e29b-41d4-a716-446655440000',
        invalidConfig,
      );

      // Verify fallback occurred
      expect(adapter).toBeInstanceOf(DiscoveryAdapter);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Failed to create custom adapter, falling back to DiscoveryAdapter',
        expect.any(Object),
      );
    });
  });
});
