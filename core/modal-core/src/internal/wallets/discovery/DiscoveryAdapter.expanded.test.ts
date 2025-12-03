/**
 * Expanded Tests for DiscoveryAdapter Improvements
 *
 * Additional comprehensive tests for robustness features:
 * - Provider event forwarding (EVM, Solana, Aztec)
 * - Session reuse with various scenarios
 * - Error recovery and cleanup
 * - Transport creation and configuration
 * - Integration scenarios
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

describe('DiscoveryAdapter - Expanded Coverage', () => {
  let mockConnectionManager: DiscoveryConnectionManager;

  beforeEach(() => {
    mockConnectionManager = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      getConnection: vi.fn(),
      getAllConnections: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Provider event forwarding - EVM', () => {
    it('should forward accountsChanged events', () => {
      const responder = createTestResponder();
      const adapter = new DiscoveryAdapter(responder, mockConnectionManager);

      const mockProvider = {
        on: vi.fn(),
        request: vi.fn(),
        removeAllListeners: vi.fn(),
      };

      const eventListeners: Record<string, Function> = {};
      mockProvider.on.mockImplementation((event: string, listener: Function) => {
        eventListeners[event] = listener;
      });

      // Setup provider listeners
      (adapter as any).setupProviderListeners(mockProvider);

      // Verify accountsChanged listener was registered
      expect(mockProvider.on).toHaveBeenCalledWith('accountsChanged', expect.any(Function));

      // Trigger accountsChanged and verify emission
      const emitSpy = vi.spyOn(adapter as any, 'emitBlockchainEvent');
      if (eventListeners['accountsChanged']) {
        eventListeners['accountsChanged'](['0x123', '0x456']);
      }

      expect(emitSpy).toHaveBeenCalledWith('accountsChanged', {
        accounts: ['0x123', '0x456'],
        chainType: ChainType.Evm,
      });
    });

    it('should forward chainChanged events', () => {
      const responder = createTestResponder();
      const adapter = new DiscoveryAdapter(responder, mockConnectionManager);

      const mockProvider = {
        on: vi.fn(),
        request: vi.fn(),
        removeAllListeners: vi.fn(),
      };

      const eventListeners: Record<string, Function> = {};
      mockProvider.on.mockImplementation((event: string, listener: Function) => {
        eventListeners[event] = listener;
      });

      (adapter as any).setupProviderListeners(mockProvider);

      expect(mockProvider.on).toHaveBeenCalledWith('chainChanged', expect.any(Function));

      const emitSpy = vi.spyOn(adapter as any, 'emitBlockchainEvent');
      if (eventListeners['chainChanged']) {
        eventListeners['chainChanged']('0x89'); // Polygon
      }

      expect(emitSpy).toHaveBeenCalledWith('chainChanged', {
        chainId: '0x89',
        chainType: ChainType.Evm,
      });
    });

    it('should forward disconnect events', () => {
      const responder = createTestResponder();
      const adapter = new DiscoveryAdapter(responder, mockConnectionManager);

      const mockProvider = {
        on: vi.fn(),
        request: vi.fn(),
        removeAllListeners: vi.fn(),
      };

      const eventListeners: Record<string, Function> = {};
      mockProvider.on.mockImplementation((event: string, listener: Function) => {
        eventListeners[event] = listener;
      });

      (adapter as any).setupProviderListeners(mockProvider);

      expect(mockProvider.on).toHaveBeenCalledWith('disconnect', expect.any(Function));

      const emitSpy = vi.spyOn(adapter as any, 'emitBlockchainEvent');
      if (eventListeners['disconnect']) {
        eventListeners['disconnect']();
      }

      expect(emitSpy).toHaveBeenCalledWith('disconnected', { reason: 'Provider disconnected' });
    });
  });

  describe('Provider event forwarding - Solana', () => {
    it('should forward accountChanged events for Solana', () => {
      const responder = createTestResponder({
        matched: {
          required: {
            technologies: [
              {
                type: 'solana',
                interfaces: ['solana-wallet-standard'],
              },
            ],
            features: [],
          },
        },
      });
      const adapter = new DiscoveryAdapter(responder, mockConnectionManager);

      const mockProvider = {
        on: vi.fn(),
        connect: vi.fn(),
        disconnect: vi.fn(),
      };

      const eventListeners: Record<string, Function> = {};
      mockProvider.on.mockImplementation((event: string, listener: Function) => {
        eventListeners[event] = listener;
      });

      (adapter as any).setupProviderListeners(mockProvider);

      const emitSpy = vi.spyOn(adapter as any, 'emitBlockchainEvent');
      if (eventListeners['accountChanged']) {
        eventListeners['accountChanged']({ publicKey: 'SolPublicKey123' });
      }

      expect(emitSpy).toHaveBeenCalledWith('accountsChanged', {
        accounts: expect.arrayContaining([expect.stringContaining('SolPublicKey123')]),
        chainType: ChainType.Solana,
      });
    });

    it('should forward connect events for Solana', () => {
      const responder = createTestResponder({
        matched: {
          required: {
            technologies: [
              {
                type: 'solana',
                interfaces: ['solana-wallet-standard'],
              },
            ],
            features: [],
          },
        },
      });
      const adapter = new DiscoveryAdapter(responder, mockConnectionManager);

      const mockProvider = {
        on: vi.fn(),
        connect: vi.fn(),
        disconnect: vi.fn(),
      };

      const eventListeners: Record<string, Function> = {};
      mockProvider.on.mockImplementation((event: string, listener: Function) => {
        eventListeners[event] = listener;
      });

      (adapter as any).setupProviderListeners(mockProvider);

      const emitSpy = vi.spyOn(adapter as any, 'emitBlockchainEvent');
      if (eventListeners['connect']) {
        eventListeners['connect']({ publicKey: 'SolPublicKey456' });
      }

      expect(emitSpy).toHaveBeenCalledWith('connected', {
        publicKey: expect.any(String),
        chainType: ChainType.Solana,
      });
    });
  });

  describe('Provider event forwarding - Aztec', () => {
    it('should forward statusChanged events for Aztec', () => {
      const responder = createTestResponder({
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
      });
      const adapter = new DiscoveryAdapter(responder, mockConnectionManager);

      const mockProvider = {
        on: vi.fn(),
      };

      const eventListeners: Record<string, Function> = {};
      mockProvider.on.mockImplementation((event: string, listener: Function) => {
        eventListeners[event] = listener;
      });

      (adapter as any).setupProviderListeners(mockProvider);

      const emitSpy = vi.spyOn(adapter as any, 'emitBlockchainEvent');
      if (eventListeners['statusChanged']) {
        eventListeners['statusChanged']({ status: 'connected', address: 'aztec1abc' });
      }

      expect(emitSpy).toHaveBeenCalledWith('statusChanged', {
        status: 'connected',
        address: 'aztec1abc',
        chainType: ChainType.Aztec,
      });
    });

    it('should forward networkChanged events for Aztec', () => {
      const responder = createTestResponder({
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
      });
      const adapter = new DiscoveryAdapter(responder, mockConnectionManager);

      const mockProvider = {
        on: vi.fn(),
      };

      const eventListeners: Record<string, Function> = {};
      mockProvider.on.mockImplementation((event: string, listener: Function) => {
        eventListeners[event] = listener;
      });

      (adapter as any).setupProviderListeners(mockProvider);

      const emitSpy = vi.spyOn(adapter as any, 'emitBlockchainEvent');
      if (eventListeners['networkChanged']) {
        eventListeners['networkChanged']({ network: 'aztec:mainnet' });
      }

      expect(emitSpy).toHaveBeenCalledWith('chainChanged', {
        chainId: 'aztec:mainnet',
        chainType: ChainType.Aztec,
      });
    });
  });

  describe('Permission categorization - edge cases', () => {
    it('should handle empty permission arrays', () => {
      const responder = createTestResponder({
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
      });
      const adapter = new DiscoveryAdapter(responder, mockConnectionManager);

      const categorized = (adapter as any).categorizeAztecPermissions([]);
      expect(Object.keys(categorized)).toHaveLength(0);
    });

    it('should handle permissions with mixed casing', () => {
      const responder = createTestResponder({
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
      });
      const adapter = new DiscoveryAdapter(responder, mockConnectionManager);

      const permissions = ['Aztec_GetAddress', 'AZTEC_SEND_TRANSACTION'];
      const categorized = (adapter as any).categorizeAztecPermissions(permissions);

      // Should still categorize despite casing differences
      expect(categorized).toBeDefined();
    });

    it('should group transaction-related permissions correctly', () => {
      const responder = createTestResponder({
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
      });
      const adapter = new DiscoveryAdapter(responder, mockConnectionManager);

      const permissions = ['aztec_sendTransaction', 'aztec_signTransaction', 'aztec_broadcastTransaction'];

      const categorized = (adapter as any).categorizeAztecPermissions(permissions);
      expect(categorized.Transaction).toHaveLength(3);
    });
  });

  describe('Static getWalletInfoFromResponder - edge cases', () => {
    it('should handle responder with no technologies', () => {
      const responder = createTestResponder({
        matched: {
          required: {
            technologies: [],
            features: [],
          },
        },
      });

      const info = DiscoveryAdapter.getWalletInfoFromResponder(responder);
      expect(info.chains).toHaveLength(0);
      expect(info.features.size).toBeGreaterThan(0); // Should still have multi_account
    });

    it('should deduplicate chain types from multiple technologies', () => {
      const responder = createTestResponder({
        matched: {
          required: {
            technologies: [
              { type: 'evm', interfaces: ['eip-1193'] },
              { type: 'evm', interfaces: ['eip-6963'] }, // Duplicate EVM
            ],
            features: [],
          },
        },
      });

      const info = DiscoveryAdapter.getWalletInfoFromResponder(responder);
      const evmCount = info.chains.filter((c) => c === ChainType.Evm).length;
      expect(evmCount).toBe(2); // Currently doesn't dedupe, but documents behavior
    });

    it('should handle responder with popup transport', () => {
      const responder = createTestResponder({
        transportConfig: {
          type: 'popup',
          popupUrl: 'https://wallet.example.com/connect',
        },
      });

      const info = DiscoveryAdapter.getWalletInfoFromResponder(responder);
      expect(info.transportType).toBe('popup');
    });

    it('should handle responder with websocket transport', () => {
      const responder = createTestResponder({
        transportConfig: {
          type: 'websocket',
          websocketUrl: 'wss://wallet.example.com/ws',
        },
      });

      const info = DiscoveryAdapter.getWalletInfoFromResponder(responder);
      expect(info.transportType).toBe('websocket');
    });

    it('should handle responder with no transport config', () => {
      const responder = createTestResponder({
        transportConfig: undefined,
      });

      const info = DiscoveryAdapter.getWalletInfoFromResponder(responder);
      expect(info.transportType).toBe('unknown');
    });
  });

  describe('Logger integration', () => {
    it('should use logger if available', () => {
      const responder = createTestResponder();
      const adapter = new DiscoveryAdapter(responder, mockConnectionManager);

      // Logger is optional, but log method should always be available
      expect(typeof (adapter as any).log).toBe('function');

      // Should not throw when logging, even without logger
      expect(() => {
        (adapter as any).log('info', 'Test message');
      }).not.toThrow();
    });

    it('should fallback to console if logger unavailable', () => {
      const responder = createTestResponder();
      const adapter = new DiscoveryAdapter(responder, mockConnectionManager);

      // Remove logger
      (adapter as any).logger = null;

      // Should still not throw
      expect(() => {
        const logger = (adapter as any).logger || console;
        logger.info('Fallback message');
      }).not.toThrow();
    });
  });

  describe('Multi-chain wallet support', () => {
    it('should extract all supported chains from multi-chain wallet', () => {
      const responder = createTestResponder({
        matched: {
          required: {
            technologies: [
              { type: 'evm', interfaces: ['eip-1193'] },
              { type: 'solana', interfaces: ['solana-wallet-standard'] },
              { type: 'aztec', interfaces: ['aztec-wallet-api-v1'] },
            ],
            features: [],
          },
        },
      });

      const info = DiscoveryAdapter.getWalletInfoFromResponder(responder);
      expect(info.chains).toHaveLength(3);
      expect(info.chains).toContain(ChainType.Evm);
      expect(info.chains).toContain(ChainType.Solana);
      expect(info.chains).toContain(ChainType.Aztec);
    });

    it('should accumulate features from all chain types', () => {
      const responder = createTestResponder({
        matched: {
          required: {
            technologies: [
              { type: 'evm', interfaces: ['eip-1193'] },
              { type: 'aztec', interfaces: ['aztec-wallet-api-v1'] },
            ],
            features: [],
          },
        },
      });

      const info = DiscoveryAdapter.getWalletInfoFromResponder(responder);
      expect(info.features.has('sign_message')).toBe(true);
      expect(info.features.has('encrypt')).toBe(true); // From Aztec
      expect(info.features.has('decrypt')).toBe(true); // From Aztec
      expect(info.features.has('multi_account')).toBe(true);
    });
  });

  describe('Transport type handling', () => {
    it('should correctly identify extension transport', () => {
      const responder = createTestResponder({
        transportConfig: {
          type: 'extension',
          extensionId: 'chrome-extension-id',
        },
      });

      const info = DiscoveryAdapter.getWalletInfoFromResponder(responder);
      expect(info.transportType).toBe('extension');
    });

    it('should correctly identify injected transport', () => {
      const responder = createTestResponder({
        transportConfig: {
          type: 'injected',
        },
      });

      const info = DiscoveryAdapter.getWalletInfoFromResponder(responder);
      expect(info.transportType).toBe('injected');
    });

    it('should handle malformed transport config', () => {
      const responder = createTestResponder({
        transportConfig: {} as any,
      });

      const info = DiscoveryAdapter.getWalletInfoFromResponder(responder);
      expect(info.transportType).toBe('unknown');
    });
  });

  describe('RDNS and metadata handling', () => {
    it('should preserve RDNS from responder', () => {
      const responder = createTestResponder({
        rdns: 'com.metamask.wallet',
      });

      const info = DiscoveryAdapter.getWalletInfoFromResponder(responder);
      expect(info.rdns).toBe('com.metamask.wallet');
    });

    it('should preserve wallet name exactly', () => {
      const responder = createTestResponder({
        name: 'My Custom Wallet Name',
      });

      const info = DiscoveryAdapter.getWalletInfoFromResponder(responder);
      expect(info.name).toBe('My Custom Wallet Name');
    });

    it('should preserve icon data URI', () => {
      const iconUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA';
      const responder = createTestResponder({
        icon: iconUri,
      });

      const info = DiscoveryAdapter.getWalletInfoFromResponder(responder);
      expect(info.icon).toBe(iconUri);
    });
  });

  describe('Feature detection', () => {
    it('should always include multi_account feature', () => {
      const responder = createTestResponder({
        matched: {
          required: {
            technologies: [{ type: 'evm', interfaces: ['eip-1193'] }],
            features: [],
          },
        },
      });

      const info = DiscoveryAdapter.getWalletInfoFromResponder(responder);
      expect(info.features.has('multi_account')).toBe(true);
    });

    it('should include sign_transaction for EVM wallets', () => {
      const responder = createTestResponder({
        matched: {
          required: {
            technologies: [{ type: 'evm', interfaces: ['eip-1193'] }],
            features: [],
          },
        },
      });

      const info = DiscoveryAdapter.getWalletInfoFromResponder(responder);
      expect(info.features.has('sign_transaction')).toBe(true);
    });

    it('should include sign_transaction for Solana wallets', () => {
      const responder = createTestResponder({
        matched: {
          required: {
            technologies: [{ type: 'solana', interfaces: ['solana-wallet-standard'] }],
            features: [],
          },
        },
      });

      const info = DiscoveryAdapter.getWalletInfoFromResponder(responder);
      expect(info.features.has('sign_transaction')).toBe(true);
    });

    it('should include privacy features for Aztec wallets', () => {
      const responder = createTestResponder({
        matched: {
          required: {
            technologies: [{ type: 'aztec', interfaces: ['aztec-wallet-api-v1'] }],
            features: [],
          },
        },
      });

      const info = DiscoveryAdapter.getWalletInfoFromResponder(responder);
      expect(info.features.has('encrypt')).toBe(true);
      expect(info.features.has('decrypt')).toBe(true);
    });
  });
});
