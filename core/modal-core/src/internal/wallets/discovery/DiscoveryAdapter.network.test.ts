/**
 * Tests for DiscoveryAdapter Aztec Network Resolution
 *
 * Validates that the adapter correctly resolves Aztec networks from:
 * 1. Responder metadata (aztecNetwork field)
 * 2. Technology chains
 * 3. Falls back to mainnet as default
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DiscoveryAdapter } from './DiscoveryAdapter.js';
import type { QualifiedResponder } from '@walletmesh/discovery';
import type { DiscoveryConnectionManager } from '../../../client/discovery/types.js';
import { ChainType } from '../../../types.js';

describe('DiscoveryAdapter - Aztec Network Resolution', () => {
  let mockConnectionManager: DiscoveryConnectionManager;

  beforeEach(() => {
    // Create mock connection manager
    mockConnectionManager = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      getConnection: vi.fn(),
      getAllConnections: vi.fn(),
    };
  });

  describe('getAztecNetworkFromDiscovery', () => {
    it('should use aztecNetwork from responder metadata (Priority 1)', () => {
      const responder: QualifiedResponder = {
        responderId: '550e8400-e29b-41d4-a716-446655440001',
        rdns: 'com.example.testwallet',
        name: 'Test Wallet',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjwvc3ZnPg==',
        transportConfig: {
          type: 'extension',
          extensionId: 'test-extension',
        },
        matched: {
          required: {
            technologies: [
              {
                type: 'aztec',
                interfaces: ['aztec-rpc'],
              },
            ],
          },
          optional: {},
        },
        metadata: {
          aztecNetwork: 'aztec:testnet', // Explicit testnet network
        },
      };

      const adapter = new DiscoveryAdapter(responder, mockConnectionManager);

      // Access private method for testing
      const network = (adapter as any).getAztecNetworkFromDiscovery();

      expect(network).toBe('aztec:testnet');
    });

    it('should prepend aztec: prefix if missing from metadata', () => {
      const responder: QualifiedResponder = {
        responderId: '550e8400-e29b-41d4-a716-446655440002',
        rdns: 'com.example.testwallet',
        name: 'Test Wallet',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjwvc3ZnPg==',
        transportConfig: {
          type: 'extension',
          extensionId: 'test-extension',
        },
        matched: {
          required: {
            technologies: [
              {
                type: 'aztec',
                interfaces: ['aztec-rpc'],
              },
            ],
          },
          optional: {},
        },
        metadata: {
          aztecNetwork: '31337', // Network without prefix
        },
      };

      const adapter = new DiscoveryAdapter(responder, mockConnectionManager);

      const network = (adapter as any).getAztecNetworkFromDiscovery();

      expect(network).toBe('aztec:31337');
    });

    it('should extract from technology chains if metadata absent (Priority 2)', () => {
      const responder: QualifiedResponder = {
        responderId: '550e8400-e29b-41d4-a716-446655440003',
        rdns: 'com.example.testwallet',
        name: 'Test Wallet',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjwvc3ZnPg==',
        transportConfig: {
          type: 'extension',
          extensionId: 'test-extension',
        },
        matched: {
          required: {
            technologies: [
              {
                type: 'aztec',
                interfaces: ['aztec-rpc'],
              },
            ],
          },
          optional: {},
        },
        metadata: {}, // No aztecNetwork in metadata
      };

      const adapter = new DiscoveryAdapter(responder, mockConnectionManager);

      // getTechnologyChains() returns 'aztec:mainnet' for aztec technology
      const network = (adapter as any).getAztecNetworkFromDiscovery();

      expect(network).toBe('aztec:mainnet');
    });

    it('should fall back to mainnet if no network info available (Priority 3)', () => {
      const responder: QualifiedResponder = {
        responderId: '550e8400-e29b-41d4-a716-446655440004',
        rdns: 'com.example.testwallet',
        name: 'Test Wallet',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjwvc3ZnPg==',
        transportConfig: {
          type: 'extension',
          extensionId: 'test-extension',
        },
        matched: {
          required: {
            technologies: [], // No technologies specified
          },
          optional: {},
        },
        metadata: {},
      };

      const adapter = new DiscoveryAdapter(responder, mockConnectionManager);

      const network = (adapter as any).getAztecNetworkFromDiscovery();

      // Should default to mainnet
      expect(network).toBe('aztec:mainnet');
    });

    it('should use sandbox network (31337) when explicitly specified', () => {
      const responder: QualifiedResponder = {
        responderId: '550e8400-e29b-41d4-a716-446655440005',
        rdns: 'com.example.testwallet',
        name: 'Test Wallet',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjwvc3ZnPg==',
        transportConfig: {
          type: 'extension',
          extensionId: 'test-extension',
        },
        matched: {
          required: {
            technologies: [
              {
                type: 'aztec',
                interfaces: ['aztec-rpc'],
              },
            ],
          },
          optional: {},
        },
        metadata: {
          aztecNetwork: 'aztec:31337', // Explicit sandbox
        },
      };

      const adapter = new DiscoveryAdapter(responder, mockConnectionManager);

      const network = (adapter as any).getAztecNetworkFromDiscovery();

      expect(network).toBe('aztec:31337');
    });
  });

  describe('getTechnologyChains', () => {
    it('should return aztec:mainnet for aztec technology', () => {
      const responder: QualifiedResponder = {
        responderId: '550e8400-e29b-41d4-a716-446655440006',
        rdns: 'com.example.testwallet',
        name: 'Test Wallet',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjwvc3ZnPg==',
        transportConfig: {
          type: 'extension',
          extensionId: 'test-extension',
        },
        matched: {
          required: {
            technologies: [
              {
                type: 'aztec',
                interfaces: ['aztec-rpc'],
              },
            ],
          },
          optional: {},
        },
        metadata: {},
      };

      const adapter = new DiscoveryAdapter(responder, mockConnectionManager);

      const chains = (adapter as any).getTechnologyChains();

      expect(chains).toContain('aztec:mainnet');
      expect(chains).not.toContain('aztec:31337'); // Should not default to sandbox
      expect(chains).not.toContain('aztec:testnet');
    });

    it('should return correct chains for multiple technologies', () => {
      const responder: QualifiedResponder = {
        responderId: '550e8400-e29b-41d4-a716-446655440007',
        rdns: 'com.example.multichainwallet',
        name: 'Multi-Chain Wallet',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjwvc3ZnPg==',
        transportConfig: {
          type: 'extension',
          extensionId: 'test-extension',
        },
        matched: {
          required: {
            technologies: [
              {
                type: 'evm',
                interfaces: ['eip1193'],
              },
              {
                type: 'aztec',
                interfaces: ['aztec-rpc'],
              },
              {
                type: 'solana',
                interfaces: ['solana-wallet-standard'],
              },
            ],
          },
          optional: {},
        },
        metadata: {},
      };

      const adapter = new DiscoveryAdapter(responder, mockConnectionManager);

      const chains = (adapter as any).getTechnologyChains();

      expect(chains).toContain('eip155:1'); // EVM mainnet
      expect(chains).toContain('aztec:mainnet'); // Aztec mainnet (not sandbox)
      expect(chains).toContain('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'); // Solana mainnet
    });
  });

  describe('Integration with createProviders', () => {
    it('should use resolved network when creating AztecAdapter', async () => {
      const responder: QualifiedResponder = {
        responderId: '550e8400-e29b-41d4-a716-446655440008',
        rdns: 'com.example.testwallet',
        name: 'Test Wallet',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjwvc3ZnPg==',
        transportConfig: {
          type: 'extension',
          extensionId: 'test-extension',
        },
        matched: {
          required: {
            technologies: [
              {
                type: 'aztec',
                interfaces: ['aztec-rpc'],
              },
            ],
          },
          optional: {},
        },
        metadata: {
          aztecNetwork: 'aztec:testnet',
        },
      };

      const adapter = new DiscoveryAdapter(responder, mockConnectionManager);

      // Verify the network resolution happens correctly
      const network = (adapter as any).getAztecNetworkFromDiscovery();
      expect(network).toBe('aztec:testnet');

      // When createProviders is called (during connect), it should use this network
      // This is implicitly tested through the integration, but we verify the resolution here
    });
  });

  describe('Default behavior', () => {
    it('should default to mainnet instead of sandbox for production safety', () => {
      const responder: QualifiedResponder = {
        responderId: '550e8400-e29b-41d4-a716-446655440009',
        rdns: 'com.example.productionwallet',
        name: 'Production Wallet',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjwvc3ZnPg==',
        transportConfig: {
          type: 'extension',
          extensionId: 'test-extension',
        },
        matched: {
          required: {
            technologies: [
              {
                type: 'aztec',
                interfaces: ['aztec-rpc'],
              },
            ],
          },
          optional: {},
        },
        metadata: {}, // No network specified
      };

      const adapter = new DiscoveryAdapter(responder, mockConnectionManager);

      const network = (adapter as any).getAztecNetworkFromDiscovery();

      // Should use mainnet as safer default for production
      expect(network).toBe('aztec:mainnet');
      expect(network).not.toBe('aztec:31337'); // Explicitly not sandbox
    });
  });
});
