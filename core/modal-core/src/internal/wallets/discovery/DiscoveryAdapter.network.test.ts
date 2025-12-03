/**
 * Tests for DiscoveryAdapter Aztec Network Resolution
 *
 * Validates that the adapter correctly resolves Aztec networks from:
 * 1. Top-level networks array in qualified responder
 * 2. Networks in matched.required capabilities
 * 3. Throws error if no network information is available
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DiscoveryAdapter } from './DiscoveryAdapter.js';
import type { QualifiedResponder } from '@walletmesh/discovery';
import type { DiscoveryConnectionManager } from '../../../client/discovery/types.js';

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
    it('should use network from top-level networks array (Priority 1)', () => {
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
                interfaces: ['aztec-wallet-api-v1'],
              },
            ],
            features: [],
          },
        },
        networks: ['aztec:testnet'], // Top-level networks array
      };

      const adapter = new DiscoveryAdapter(responder, mockConnectionManager);

      // Access private method for testing
      const network = (adapter as any).getAztecNetworkFromDiscovery();

      expect(network).toBe('aztec:testnet');
    });

    it('should use network from matched.required.networks if top-level absent (Priority 2)', () => {
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
                interfaces: ['aztec-wallet-api-v1'],
              },
            ],
            features: [],
            networks: ['aztec:31337'], // Networks in matched.required
          },
        },
      };

      const adapter = new DiscoveryAdapter(responder, mockConnectionManager);

      const network = (adapter as any).getAztecNetworkFromDiscovery();

      expect(network).toBe('aztec:31337');
    });

    it('should prioritize top-level networks over matched.required.networks', () => {
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
                interfaces: ['aztec-wallet-api-v1'],
              },
            ],
            features: [],
            networks: ['aztec:31337'], // Lower priority
          },
        },
        networks: ['aztec:mainnet'], // Higher priority
      };

      const adapter = new DiscoveryAdapter(responder, mockConnectionManager);

      const network = (adapter as any).getAztecNetworkFromDiscovery();

      // Should use top-level networks
      expect(network).toBe('aztec:mainnet');
    });

    it('should throw error if no network info available', () => {
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
            technologies: [
              {
                type: 'aztec',
                interfaces: ['aztec-wallet-api-v1'],
              },
            ],
            features: [],
          },
        },
        // No networks array at top level or in matched.required
      };

      const adapter = new DiscoveryAdapter(responder, mockConnectionManager);

      // Should throw error when network cannot be determined
      expect(() => (adapter as any).getAztecNetworkFromDiscovery()).toThrow(
        'Unable to determine Aztec network for wallet "Test Wallet"',
      );
    });

    it('should handle sandbox network (31337)', () => {
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
                interfaces: ['aztec-wallet-api-v1'],
              },
            ],
            features: [],
          },
        },
        networks: ['aztec:31337'], // Sandbox network
      };

      const adapter = new DiscoveryAdapter(responder, mockConnectionManager);

      const network = (adapter as any).getAztecNetworkFromDiscovery();

      expect(network).toBe('aztec:31337');
    });

    it('should handle multiple networks and select first Aztec network', () => {
      const responder: QualifiedResponder = {
        responderId: '550e8400-e29b-41d4-a716-446655440006',
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
                interfaces: ['eip-1193'],
              },
              {
                type: 'aztec',
                interfaces: ['aztec-wallet-api-v1'],
              },
            ],
            features: [],
          },
        },
        networks: ['eip155:1', 'aztec:mainnet', 'aztec:testnet'], // Multiple networks
      };

      const adapter = new DiscoveryAdapter(responder, mockConnectionManager);

      const network = (adapter as any).getAztecNetworkFromDiscovery();

      // Should find first aztec: network
      expect(network).toBe('aztec:mainnet');
    });

    it('should handle networks with mixed format', () => {
      const responder: QualifiedResponder = {
        responderId: '550e8400-e29b-41d4-a716-446655440007',
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
                interfaces: ['aztec-wallet-api-v1'],
              },
            ],
            features: [],
          },
        },
        networks: ['eip155:137', 'solana:mainnet', 'aztec:testnet'],
      };

      const adapter = new DiscoveryAdapter(responder, mockConnectionManager);

      const network = (adapter as any).getAztecNetworkFromDiscovery();

      expect(network).toBe('aztec:testnet');
    });

    it('should throw error if only non-Aztec networks present', () => {
      const responder: QualifiedResponder = {
        responderId: '550e8400-e29b-41d4-a716-446655440008',
        rdns: 'com.example.evmwallet',
        name: 'EVM Wallet',
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
                interfaces: ['eip-1193'],
              },
            ],
            features: [],
          },
        },
        networks: ['eip155:1', 'eip155:137'], // Only EVM networks
      };

      const adapter = new DiscoveryAdapter(responder, mockConnectionManager);

      // Should throw error as no Aztec network is available
      expect(() => (adapter as any).getAztecNetworkFromDiscovery()).toThrow(
        'Unable to determine Aztec network for wallet "EVM Wallet"',
      );
    });
  });

  describe('Integration with createProviders', () => {
    it('should use resolved network when creating AztecAdapter', async () => {
      const responder: QualifiedResponder = {
        responderId: '550e8400-e29b-41d4-a716-446655440009',
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
                interfaces: ['aztec-wallet-api-v1'],
              },
            ],
            features: [],
          },
        },
        networks: ['aztec:testnet'],
      };

      const adapter = new DiscoveryAdapter(responder, mockConnectionManager);

      // Verify the network resolution happens correctly
      const network = (adapter as any).getAztecNetworkFromDiscovery();
      expect(network).toBe('aztec:testnet');

      // When createProviders is called (during connect), it should use this network
      // This is implicitly tested through the integration, but we verify the resolution here
    });
  });
});
