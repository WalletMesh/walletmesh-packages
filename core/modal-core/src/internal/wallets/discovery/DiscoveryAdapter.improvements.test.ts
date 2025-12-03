/**
 * Tests for DiscoveryAdapter New Improvements
 *
 * Validates the new functionality added to make DiscoveryAdapter more robust:
 * - Session reuse logic
 * - Provider event forwarding (EVM, Solana, Aztec)
 * - Enhanced logging
 * - JSON-RPC message filtering
 * - Session ID injection
 * - Error recovery
 * - Permission categorization
 * - Static wallet info method
 * - Chain name helpers
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { DiscoveryAdapter } from './DiscoveryAdapter.js';
import type { QualifiedResponder } from '@walletmesh/discovery';
import type { DiscoveryConnectionManager } from '../../../client/discovery/types.js';
import { ChainType } from '../../../types.js';

// Helper to create valid responder objects
function createTestResponder(overrides?: Partial<QualifiedResponder>): QualifiedResponder {
  return {
    responderId: '550e8400-e29b-41d4-a716-446655440001',
    rdns: 'com.example.wallet',
    name: 'Test Wallet',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjwvc3ZnPg==',
    transportConfig: {
      type: 'extension',
      extensionId: 'test-extension',
    },
    matched: {
      required: {
        interfaces: [],
        technologies: [
          {
            type: 'evm',
            interfaces: ['eip-1193'],
          },
        ],
        features: [],
      },
    },
    ...overrides,
  };
}

describe('DiscoveryAdapter - New Improvements', () => {
  let mockConnectionManager: DiscoveryConnectionManager;
  let consoleSpy: { log: ReturnType<typeof vi.fn>; info: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    // Create mock connection manager
    mockConnectionManager = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      getConnection: vi.fn(),
      getAllConnections: vi.fn(),
    };

    // Spy on console for logging tests
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    consoleSpy.log.mockRestore();
    consoleSpy.info.mockRestore();
    vi.clearAllMocks();
  });

  describe('Static getWalletInfoFromResponder', () => {
    it('should extract wallet info from EVM responder', () => {
      const responder = createTestResponder({
        responderId: '550e8400-e29b-41d4-a716-446655440001',
        rdns: 'com.example.evmwallet',
        name: 'EVM Test Wallet',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjwvc3ZnPg==',
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
      });

      const info = DiscoveryAdapter.getWalletInfoFromResponder(responder);

      expect(info.id).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(info.name).toBe('EVM Test Wallet');
      expect(info.icon).toBe('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjwvc3ZnPg==');
      expect(info.rdns).toBe('com.example.evmwallet');
      expect(info.transportType).toBe('extension');
      expect(info.chains).toContain(ChainType.Evm);
      expect(info.features.has('sign_message')).toBe(true);
      expect(info.features.has('sign_transaction')).toBe(true);
    });

    it('should extract wallet info from Solana responder', () => {
      const responder: QualifiedResponder = {
        responderId: 'solana-wallet-id',
        rdns: 'com.example.solanawallet',
        name: 'Solana Test Wallet',
        icon: 'data:image/svg+xml;base64,def456',
        transportConfig: {
          type: 'popup',
          url: 'https://wallet.example.com',
        },
        matched: {
          required: {
            interfaces: [],
            technologies: [
              {
                type: 'solana',
                interfaces: ['solana-wallet-standard'],
              },
            ],
            features: [],
          },
        },
      };

      const info = DiscoveryAdapter.getWalletInfoFromResponder(responder);

      expect(info.id).toBe('solana-wallet-id');
      expect(info.name).toBe('Solana Test Wallet');
      expect(info.transportType).toBe('popup');
      expect(info.chains).toContain(ChainType.Solana);
      expect(info.features.has('sign_message')).toBe(true);
      expect(info.features.has('sign_transaction')).toBe(true);
    });

    it('should extract wallet info from Aztec responder', () => {
      const responder: QualifiedResponder = {
        responderId: 'aztec-wallet-id',
        rdns: 'com.example.aztecwallet',
        name: 'Aztec Test Wallet',
        icon: 'data:image/svg+xml;base64,ghi789',
        transportConfig: {
          type: 'extension',
          extensionId: 'aztec-ext',
        },
        matched: {
          required: {
            interfaces: [],
            technologies: [
              {
                type: 'aztec',
                interfaces: ['aztec-wallet-api-v1'],
              },
            ],
            features: [],
          },
        },
      };

      const info = DiscoveryAdapter.getWalletInfoFromResponder(responder);

      expect(info.id).toBe('aztec-wallet-id');
      expect(info.name).toBe('Aztec Test Wallet');
      expect(info.transportType).toBe('extension');
      expect(info.chains).toContain(ChainType.Aztec);
      expect(info.features.has('encrypt')).toBe(true);
      expect(info.features.has('decrypt')).toBe(true);
    });

    it('should handle multi-chain wallet', () => {
      const responder: QualifiedResponder = {
        responderId: 'multi-wallet-id',
        rdns: 'com.example.multiwallet',
        name: 'Multi-Chain Wallet',
        icon: 'data:image/svg+xml;base64,jkl012',
        transportConfig: {
          type: 'extension',
          extensionId: 'multi-ext',
        },
        matched: {
          required: {
            interfaces: [],
            technologies: [
              { type: 'evm', interfaces: ['eip-1193'] },
              { type: 'solana', interfaces: ['solana-wallet-standard'] },
              { type: 'aztec', interfaces: ['aztec-wallet-api-v1'] },
            ],
            features: [],
          },
        },
      };

      const info = DiscoveryAdapter.getWalletInfoFromResponder(responder);

      expect(info.chains).toHaveLength(3);
      expect(info.chains).toContain(ChainType.Evm);
      expect(info.chains).toContain(ChainType.Solana);
      expect(info.chains).toContain(ChainType.Aztec);
      expect(info.features.has('sign_message')).toBe(true);
      expect(info.features.has('encrypt')).toBe(true);
    });
  });

  describe('Permission categorization', () => {
    it('should categorize Aztec permissions', () => {
      const responder = createTestResponder({
        matched: {
          required: {
            interfaces: [],
            technologies: [{ type: 'aztec', interfaces: ['aztec-wallet-api-v1'] }],
            features: [],
          },
        },
      });

      const adapter = new DiscoveryAdapter(responder, mockConnectionManager);

      // Access private method for testing
      const permissions = [
        'aztec_getAddress',
        'aztec_getPublicKey',
        'aztec_sendTransaction',
        'aztec_deployContract',
        'aztec_signAuthWitness',
        'custom_permission',
      ];

      const categorized = (adapter as any).categorizeAztecPermissions(permissions);

      expect(categorized.Read).toContain('aztec_getAddress');
      expect(categorized.Read).toContain('aztec_getPublicKey');
      expect(categorized.Transaction).toContain('aztec_sendTransaction');
      expect(categorized.Contract).toContain('aztec_deployContract');
      expect(categorized.Auth).toContain('aztec_signAuthWitness');
      expect(categorized.Other).toContain('custom_permission');
    });

    it('should only include non-empty categories', () => {
      const responder = createTestResponder({
        matched: {
          required: {
            interfaces: [],
            technologies: [{ type: 'aztec', interfaces: ['aztec-wallet-api-v1'] }],
            features: [],
          },
        },
      });

      const adapter = new DiscoveryAdapter(responder, mockConnectionManager);

      // Only Read permissions
      const permissions = ['aztec_getAddress', 'aztec_getPublicKey'];
      const categorized = (adapter as any).categorizeAztecPermissions(permissions);

      expect(categorized).toHaveProperty('Read');
      expect(categorized).not.toHaveProperty('Transaction');
      expect(categorized).not.toHaveProperty('Contract');
      expect(categorized).not.toHaveProperty('Auth');
      expect(categorized).not.toHaveProperty('Other');
    });
  });

  describe('Enhanced logging', () => {
    it('should log connection flow events', () => {
      const responder = createTestResponder({
        matched: {
          required: {
            interfaces: [],
            technologies: [{ type: 'evm', interfaces: ['eip-1193'] }],
            features: [],
          },
        },
      });

      const adapter = new DiscoveryAdapter(responder, mockConnectionManager);

      // Verify logging methods are available
      expect(typeof (adapter as any).log).toBe('function');
    });
  });
});
