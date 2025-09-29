/**
 * Integration test for multiple discovered wallets display
 *
 * This test validates that when multiple wallets respond to the discovery protocol,
 * each discovered wallet appears as a separate option in the modal with its own
 * name, icon, and metadata from the discovery response.
 */

import type { QualifiedResponder } from '@walletmesh/discovery';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createComponentServices } from '../../internal/core/factories/serviceFactory.js';
import { WalletRegistry } from '../../internal/registries/wallets/WalletRegistry.js';
import { DiscoveryAdapter } from '../../internal/wallets/discovery/DiscoveryAdapter.js';

// Mock the store module
vi.mock('../../state/store.js', () => ({
  getStoreInstance: vi.fn(() => ({
    getState: vi.fn(() => ({
      ui: { isOpen: false, isLoading: false, error: undefined },
      connections: {
        activeSessions: [],
        availableWallets: [],
        discoveredWallets: [],
        activeSessionId: null,
        connectionStatus: 'disconnected'
      },
      transactions: {
        pending: [],
        confirmed: [],
        failed: [],
        activeTransaction: undefined
      }
      ,
      entities: {
        wallets: {}
      }
    })),
    setState: vi.fn(),
    subscribe: vi.fn(() => vi.fn()),
    subscribeWithSelector: vi.fn(() => vi.fn())
  }))
}));

// Mock the discovery package imports
vi.mock('@walletmesh/discovery', () => {
  const createMockInitiator = () => ({
    startDiscovery: vi.fn().mockResolvedValue([]),
    stopDiscovery: vi.fn().mockResolvedValue(undefined),
    isDiscovering: vi.fn().mockReturnValue(false),
    on: vi.fn(),
    off: vi.fn(),
    removeAllListeners: vi.fn(),
  });

  return {
    DiscoveryInitiator: vi.fn().mockImplementation(createMockInitiator),
    createInitiatorSession: vi.fn().mockImplementation(createMockInitiator),
  };
});

// Mock transport creation
vi.mock('../../api/transports/transports.js', () => ({
  createTransport: vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    send: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  })),
}));

describe('Multiple Discovered Wallets Integration', () => {
  let registry: WalletRegistry;
  let logger: import('../../internal/core/logger/logger.js').Logger;

  // Mock multiple wallet discovery responses
  const mockWalletResponse1: QualifiedResponder = {
    responderId: '550e8400-e29b-41d4-a716-446655440001',
    name: 'MetaMask',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIi',
    rdns: 'io.metamask',
    matched: {
      required: {
        technologies: [
          {
            type: 'evm',
            interfaces: ['eip1193', 'eip6963'],
          },
        ],
        chains: ['evm:1', 'evm:137'],
        methods: ['eth_sendTransaction', 'eth_signTypedData'],
        events: ['accountsChanged', 'chainChanged'],
      },
      optional: {
        chains: [],
        methods: [],
        events: [],
      },
    },
    transportConfig: {
      type: 'extension',
      extensionId: 'nkbihfbeogaeaoehlefnkodbefgpgknn',
      adapterConfig: {
        timeout: 30000,
        retries: 3,
      },
    },
    metadata: {
      description: 'Popular Ethereum wallet browser extension',
      version: '11.16.1',
    },
  };

  const mockWalletResponse2: QualifiedResponder = {
    responderId: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Phantom',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIi',
    rdns: 'app.phantom',
    matched: {
      required: {
        technologies: [
          {
            type: 'solana',
            interfaces: ['solana-standard'],
          },
        ],
        chains: ['solana:mainnet-beta', 'solana:devnet'],
        methods: ['solana_signTransaction', 'solana_signMessage'],
        events: ['connect', 'disconnect'],
      },
      optional: {
        chains: [],
        methods: [],
        events: [],
      },
    },
    transportConfig: {
      type: 'extension',
      extensionId: 'bfnaelmomeimhlpmgjnjophhpkkoljpa',
      adapterConfig: {
        timeout: 30000,
        retries: 3,
      },
    },
    metadata: {
      description: 'Solana wallet for DeFi & NFTs',
      version: '24.7.0',
    },
  };

  const mockWalletResponse3: QualifiedResponder = {
    responderId: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Aztec Wallet',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIi',
    rdns: 'network.aztec.wallet',
    matched: {
      required: {
        technologies: [
          {
            type: 'aztec',
            interfaces: ['aztec-standard'],
          },
        ],
        chains: ['aztec:mainnet', 'aztec:testnet'],
        methods: ['aztec_sendTransaction', 'aztec_createProof'],
        events: ['accountsChanged', 'chainChanged'],
      },
      optional: {
        chains: [],
        methods: [],
        events: [],
      },
    },
    transportConfig: {
      type: 'popup',
      popupUrl: 'https://wallet.aztec.network/popup',
      adapterConfig: {
        timeout: 45000,
        retries: 2,
      },
    },
    metadata: {
      description: 'Privacy-focused Aztec network wallet',
      version: '1.2.3',
    },
  };

  beforeEach(() => {
    vi.useFakeTimers();

    // Create fresh instances
    registry = new WalletRegistry();
    const services = createComponentServices('DiscoveryTest');
    logger = services.logger;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create unique adapters for each discovered wallet', async () => {
    // Mock connection manager
    const mockConnectionManager = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      destroy: vi.fn(),
    };

    // Create adapters directly to test the core behavior
    const adapters = [
      new DiscoveryAdapter(mockWalletResponse1, mockConnectionManager),
      new DiscoveryAdapter(mockWalletResponse2, mockConnectionManager),
      new DiscoveryAdapter(mockWalletResponse3, mockConnectionManager),
    ];

    // Verify that each adapter has a unique ID
    const adapterIds = adapters.map((adapter) => adapter.id);
    expect(adapterIds).toEqual([
      'discovery-550e8400-e29b-41d4-a716-446655440001',
      'discovery-550e8400-e29b-41d4-a716-446655440002',
      'discovery-550e8400-e29b-41d4-a716-446655440003',
    ]);

    // Verify each adapter has correct metadata from discovery response
    expect(adapters[0].metadata.name).toBe('MetaMask');
    expect(adapters[0].metadata.description).toBe('Popular Ethereum wallet browser extension');
    expect(adapters[0].metadata.icon).toBe('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIi');

    expect(adapters[1].metadata.name).toBe('Phantom');
    expect(adapters[1].metadata.description).toBe('Solana wallet for DeFi & NFTs');

    expect(adapters[2].metadata.name).toBe('Aztec Wallet');
    expect(adapters[2].metadata.description).toBe('Privacy-focused Aztec network wallet');

    // Verify capabilities are correctly mapped
    expect(adapters[0].capabilities.chains[0].type).toBe('evm');
    expect(adapters[1].capabilities.chains[0].type).toBe('solana');
    expect(adapters[2].capabilities.chains[0].type).toBe('aztec');
  });

  it('should register unique adapters with WalletRegistry without conflicts', async () => {
    // Mock connection manager
    const mockConnectionManager = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      destroy: vi.fn(),
    };

    // Create and register adapters
    const adapters = [
      new DiscoveryAdapter(mockWalletResponse1, mockConnectionManager),
      new DiscoveryAdapter(mockWalletResponse2, mockConnectionManager),
      new DiscoveryAdapter(mockWalletResponse3, mockConnectionManager),
    ];

    // Register adapters
    for (const adapter of adapters) {
      registry.register(adapter);
    }

    // Verify registry has all three adapters registered
    const allAdapters = registry.getAllAdapters();
    expect(allAdapters).toHaveLength(3);

    // Verify each adapter can be retrieved by ID
    expect(registry.getAdapter('discovery-550e8400-e29b-41d4-a716-446655440001')).toBeDefined();
    expect(registry.getAdapter('discovery-550e8400-e29b-41d4-a716-446655440002')).toBeDefined();
    expect(registry.getAdapter('discovery-550e8400-e29b-41d4-a716-446655440003')).toBeDefined();

    // Verify no ID conflicts
    const adapterIds = allAdapters.map((adapter) => adapter.id);
    const uniqueIds = new Set(adapterIds);
    expect(uniqueIds.size).toBe(adapterIds.length);
  });

  it('should generate WalletInfo objects with correct metadata for modal display', async () => {
    // Create adapters directly to test WalletInfo generation
    const mockConnectionManager = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      destroy: vi.fn(),
    };

    const adapters = [
      new DiscoveryAdapter(mockWalletResponse1, mockConnectionManager),
      new DiscoveryAdapter(mockWalletResponse2, mockConnectionManager),
      new DiscoveryAdapter(mockWalletResponse3, mockConnectionManager),
    ];

    // Register adapters
    for (const adapter of adapters) {
      registry.register(adapter);
    }

    // Convert adapters to WalletInfo objects (same logic as createWalletClient)
    const walletsForModal = registry.getAllAdapters().map((adapter) => ({
      id: adapter.id,
      name: adapter.metadata.name,
      icon: adapter.metadata.icon,
      description: adapter.metadata.description || '',
      chains: adapter.capabilities.chains.map((c) => c.type),
    }));

    expect(walletsForModal).toHaveLength(3);

    // Verify MetaMask wallet info
    const metamaskWalletInfo = walletsForModal.find(
      (w) => w.id === 'discovery-550e8400-e29b-41d4-a716-446655440001',
    );
    expect(metamaskWalletInfo).toEqual({
      id: 'discovery-550e8400-e29b-41d4-a716-446655440001',
      name: 'MetaMask',
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIi',
      description: 'Popular Ethereum wallet browser extension',
      chains: ['evm'],
    });

    // Verify Phantom wallet info
    const phantomWalletInfo = walletsForModal.find(
      (w) => w.id === 'discovery-550e8400-e29b-41d4-a716-446655440002',
    );
    expect(phantomWalletInfo).toEqual({
      id: 'discovery-550e8400-e29b-41d4-a716-446655440002',
      name: 'Phantom',
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIi',
      description: 'Solana wallet for DeFi & NFTs',
      chains: ['solana'],
    });

    // Verify Aztec wallet info
    const aztecWalletInfo = walletsForModal.find(
      (w) => w.id === 'discovery-550e8400-e29b-41d4-a716-446655440003',
    );
    expect(aztecWalletInfo).toEqual({
      id: 'discovery-550e8400-e29b-41d4-a716-446655440003',
      name: 'Aztec Wallet',
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIi',
      description: 'Privacy-focused Aztec network wallet',
      chains: ['aztec'],
    });
  });

  it('should handle duplicate discovery responses gracefully', async () => {
    const mockConnectionManager = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      destroy: vi.fn(),
    };

    // Create the same adapter twice
    const adapter1 = new DiscoveryAdapter(mockWalletResponse1, mockConnectionManager);
    const adapter2 = new DiscoveryAdapter(mockWalletResponse1, mockConnectionManager);

    // Register first adapter - should succeed
    registry.register(adapter1);

    // Try to register the same adapter ID again - should throw error
    expect(() => {
      registry.register(adapter2);
    }).toThrow();

    // Registry should only have one adapter
    const allAdapters = registry.getAllAdapters();
    expect(allAdapters).toHaveLength(1);
    expect(allAdapters[0].id).toBe('discovery-550e8400-e29b-41d4-a716-446655440001');
  });

  it('should support chain-specific filtering of discovered wallets', async () => {
    const mockConnectionManager = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      destroy: vi.fn(),
    };

    // Create adapters for different chains
    const adapters = [
      new DiscoveryAdapter(mockWalletResponse1, mockConnectionManager), // EVM
      new DiscoveryAdapter(mockWalletResponse2, mockConnectionManager), // Solana
      new DiscoveryAdapter(mockWalletResponse3, mockConnectionManager), // Aztec
    ];

    // Register all adapters
    for (const adapter of adapters) {
      registry.register(adapter);
    }

    // Filter adapters by chain type
    const evmAdapters = registry.getAdaptersForChain('evm');
    const solanaAdapters = registry.getAdaptersForChain('solana');
    const aztecAdapters = registry.getAdaptersForChain('aztec');

    // Verify chain-specific filtering works
    expect(evmAdapters).toHaveLength(1);
    expect(evmAdapters[0].id).toBe('discovery-550e8400-e29b-41d4-a716-446655440001');

    expect(solanaAdapters).toHaveLength(1);
    expect(solanaAdapters[0].id).toBe('discovery-550e8400-e29b-41d4-a716-446655440002');

    expect(aztecAdapters).toHaveLength(1);
    expect(aztecAdapters[0].id).toBe('discovery-550e8400-e29b-41d4-a716-446655440003');
  });
});
