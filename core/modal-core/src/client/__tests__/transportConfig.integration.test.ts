/**
 * Integration tests for transport configuration extraction and validation
 * in the discovery system
 */

import type { QualifiedResponder } from '@walletmesh/discovery';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DiscoveryAdapter } from '../../internal/wallets/discovery/DiscoveryAdapter.js';
import { createMockLogger, createMockRegistry } from '../../testing/helpers/mocks.js';
import {
  extractTransportConfig,
  getTransportConfigFromWallet,
  validateWalletTransport,
} from '../types/discoveryMappings.js';

describe('Transport Config Integration Tests', () => {
  let _mockLogger: ReturnType<typeof createMockLogger>;
  let _mockRegistry: ReturnType<typeof createMockRegistry>;

  beforeEach(() => {
    _mockLogger = createMockLogger();
    _mockRegistry = createMockRegistry();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Transport Config Extraction', () => {
    it('should extract popup transport config from discovery response', () => {
      const responder: QualifiedResponder = {
        responderId: 'test-popup-wallet',
        rdns: 'com.example.popup',
        name: 'Test Popup Wallet',
        icon: 'data:image/png;base64,test',
        matched: {
          required: {
            chains: ['evm:1'],
            features: ['account-management'],
            interfaces: ['eip-1193'],
          },
        },
        transportConfig: {
          type: 'popup',
          popupUrl: 'https://wallet.example.com/connect',
          walletAdapter: 'ExampleWalletAdapter',
          adapterConfig: {
            timeout: 45000,
            retries: 5,
          },
        },
      };

      const config = extractTransportConfig(responder);

      expect(config).toEqual({
        type: 'popup',
        popupUrl: 'https://wallet.example.com/connect',
        walletAdapter: 'ExampleWalletAdapter',
        adapterConfig: {
          timeout: 45000,
          retries: 5,
        },
      });
    });

    it('should extract extension transport config from discovery response', () => {
      const responder: QualifiedResponder = {
        responderId: 'test-extension-wallet',
        rdns: 'com.example.extension',
        name: 'Test Extension Wallet',
        icon: 'data:image/png;base64,test',
        matched: {
          required: {
            chains: ['evm:1', 'evm:137'],
            features: ['account-management', 'transaction-signing'],
            interfaces: ['eip-1193'],
          },
        },
        transportConfig: {
          type: 'extension',
          extensionId: 'abcdefghijklmnop',
          walletAdapter: 'ExtensionWalletAdapter',
        },
      };

      const config = extractTransportConfig(responder);

      expect(config).toEqual({
        type: 'extension',
        extensionId: 'abcdefghijklmnop',
        walletAdapter: 'ExtensionWalletAdapter',
      });
    });

    it('should extract websocket transport config from discovery response', () => {
      const responder: QualifiedResponder = {
        responderId: 'test-websocket-wallet',
        rdns: 'com.example.websocket',
        name: 'Test WebSocket Wallet',
        icon: 'data:image/png;base64,test',
        matched: {
          required: {
            chains: ['solana:mainnet'],
            features: ['account-management'],
            interfaces: ['solana-standard'],
          },
        },
        transportConfig: {
          type: 'websocket',
          websocketUrl: 'wss://wallet.example.com/ws',
          walletAdapter: 'SolanaWalletAdapter',
          adapterConfig: {
            reconnectInterval: 5000,
            maxReconnectAttempts: 10,
          },
        },
      };

      const config = extractTransportConfig(responder);

      expect(config).toEqual({
        type: 'websocket',
        websocketUrl: 'wss://wallet.example.com/ws',
        walletAdapter: 'SolanaWalletAdapter',
        adapterConfig: {
          reconnectInterval: 5000,
          maxReconnectAttempts: 10,
        },
      });
    });

    it('should handle missing transport config gracefully', () => {
      const responder: QualifiedResponder = {
        responderId: 'test-no-config-wallet',
        rdns: 'com.example.noconfig',
        name: 'Test No Config Wallet',
        icon: 'data:image/png;base64,test',
        matched: {
          required: {
            chains: ['evm:1'],
            features: ['account-management'],
            interfaces: ['eip-1193'],
          },
        },
        // No transportConfig
      };

      const config = extractTransportConfig(responder);

      expect(config).toEqual({});
    });

    it('should handle malformed transport config gracefully', () => {
      const responder: QualifiedResponder = {
        responderId: 'test-malformed-wallet',
        rdns: 'com.example.malformed',
        name: 'Test Malformed Wallet',
        icon: 'data:image/png;base64,test',
        matched: {
          required: {
            chains: ['evm:1'],
            features: ['account-management'],
            interfaces: ['eip-1193'],
          },
        },
        transportConfig: null as unknown, // Malformed config
      };

      const config = extractTransportConfig(responder);

      expect(config).toEqual({});
    });
  });

  describe('Transport Config Validation', () => {
    it('should validate popup transport config correctly', () => {
      const validPopupWallet: QualifiedResponder = {
        responderId: 'test-popup',
        rdns: 'com.example.popup',
        name: 'Valid Popup Wallet',
        icon: 'data:image/png;base64,test',
        matched: {
          required: {
            chains: ['evm:1'],
            features: ['account-management'],
            interfaces: ['eip-1193'],
          },
        },
        transportConfig: {
          type: 'popup',
          popupUrl: 'https://wallet.example.com/connect',
        },
      };

      const isValid = validateWalletTransport(validPopupWallet);
      expect(isValid).toBe(true);
    });

    it('should validate extension transport config correctly', () => {
      const validExtensionWallet: QualifiedResponder = {
        responderId: 'test-extension',
        rdns: 'com.example.extension',
        name: 'Valid Extension Wallet',
        icon: 'data:image/png;base64,test',
        matched: {
          required: {
            chains: ['evm:1'],
            features: ['account-management'],
            interfaces: ['eip-1193'],
          },
        },
        transportConfig: {
          type: 'extension',
          extensionId: 'abcdefghijklmnop',
        },
      };

      const isValid = validateWalletTransport(validExtensionWallet);
      expect(isValid).toBe(true);
    });

    it('should reject extension transport config without extensionId', () => {
      const invalidExtensionWallet: QualifiedResponder = {
        responderId: 'test-invalid-extension',
        rdns: 'com.example.invalidextension',
        name: 'Invalid Extension Wallet',
        icon: 'data:image/png;base64,test',
        matched: {
          required: {
            chains: ['evm:1'],
            features: ['account-management'],
            interfaces: ['eip-1193'],
          },
        },
        transportConfig: {
          type: 'extension',
          // Missing extensionId
        },
      };

      const isValid = validateWalletTransport(invalidExtensionWallet);
      expect(isValid).toBe(false);
    });

    it('should validate websocket transport config correctly', () => {
      const validWebSocketWallet: QualifiedResponder = {
        responderId: 'test-websocket',
        rdns: 'com.example.websocket',
        name: 'Valid WebSocket Wallet',
        icon: 'data:image/png;base64,test',
        matched: {
          required: {
            chains: ['solana:mainnet'],
            features: ['account-management'],
            interfaces: ['solana-standard'],
          },
        },
        transportConfig: {
          type: 'websocket',
          websocketUrl: 'wss://wallet.example.com/ws',
        },
      };

      const isValid = validateWalletTransport(validWebSocketWallet);
      expect(isValid).toBe(true);
    });

    it('should reject websocket transport config without websocketUrl', () => {
      const invalidWebSocketWallet: QualifiedResponder = {
        responderId: 'test-invalid-websocket',
        rdns: 'com.example.invalidwebsocket',
        name: 'Invalid WebSocket Wallet',
        icon: 'data:image/png;base64,test',
        matched: {
          required: {
            chains: ['solana:mainnet'],
            features: ['account-management'],
            interfaces: ['solana-standard'],
          },
        },
        transportConfig: {
          type: 'websocket',
          // Missing websocketUrl
        },
      };

      const isValid = validateWalletTransport(invalidWebSocketWallet);
      expect(isValid).toBe(false);
    });

    it('should validate injected transport config correctly', () => {
      const validInjectedWallet: QualifiedResponder = {
        responderId: 'test-injected',
        rdns: 'com.example.injected',
        name: 'Valid Injected Wallet',
        icon: 'data:image/png;base64,test',
        matched: {
          required: {
            chains: ['evm:1'],
            features: ['account-management'],
            interfaces: ['eip-1193'],
          },
        },
        transportConfig: {
          type: 'injected',
        },
      };

      const isValid = validateWalletTransport(validInjectedWallet);
      expect(isValid).toBe(true);
    });

    it('should reject wallet without transport config', () => {
      const walletWithoutConfig: QualifiedResponder = {
        responderId: 'test-no-config',
        rdns: 'com.example.noconfig',
        name: 'No Config Wallet',
        icon: 'data:image/png;base64,test',
        matched: {
          required: {
            chains: ['evm:1'],
            features: ['account-management'],
            interfaces: ['eip-1193'],
          },
        },
        // No transportConfig
      };

      const isValid = validateWalletTransport(walletWithoutConfig);
      expect(isValid).toBe(false);
    });

    it('should reject wallet with unknown transport type', () => {
      const walletWithUnknownTransport: QualifiedResponder = {
        responderId: 'test-unknown-transport',
        rdns: 'com.example.unknown',
        name: 'Unknown Transport Wallet',
        icon: 'data:image/png;base64,test',
        matched: {
          required: {
            chains: ['evm:1'],
            features: ['account-management'],
            interfaces: ['eip-1193'],
          },
        },
        transportConfig: {
          type: 'unknown-transport' as string,
        },
      };

      const isValid = validateWalletTransport(walletWithUnknownTransport);
      expect(isValid).toBe(false);
    });
  });

  describe('Transport Config Generation for Wallet Creation', () => {
    it('should generate popup transport config for wallet adapter', () => {
      const popupWallet: QualifiedResponder = {
        responderId: 'test-popup',
        rdns: 'com.example.popup',
        name: 'Popup Wallet',
        icon: 'data:image/png;base64,test',
        matched: {
          required: {
            chains: ['evm:1'],
            features: ['account-management'],
            interfaces: ['eip-1193'],
          },
        },
        transportConfig: {
          type: 'popup',
          popupUrl: 'https://wallet.example.com/connect',
          adapterConfig: {
            timeout: 45000,
            retries: 5,
          },
        },
      };

      const config = getTransportConfigFromWallet(popupWallet);

      expect(config).toEqual({
        timeout: 45000, // Overridden from adapterConfig
        retries: 5, // Overridden from adapterConfig
        retryDelay: 1000,
        url: 'https://wallet.example.com/connect',
      });
    });

    it('should generate extension transport config for wallet adapter', () => {
      const extensionWallet: QualifiedResponder = {
        responderId: 'test-extension',
        rdns: 'com.example.extension',
        name: 'Extension Wallet',
        icon: 'data:image/png;base64,test',
        matched: {
          required: {
            chains: ['evm:1'],
            features: ['account-management'],
            interfaces: ['eip-1193'],
          },
        },
        transportConfig: {
          type: 'extension',
          extensionId: 'abcdefghijklmnop',
          adapterConfig: {
            reconnect: true,
            reconnectInterval: 3000,
          },
        },
      };

      const config = getTransportConfigFromWallet(extensionWallet);

      expect(config).toEqual({
        timeout: 30000,
        retries: 3,
        retryDelay: 1000,
        reconnect: true,
        reconnectInterval: 3000,
        extensionId: 'abcdefghijklmnop',
      });
    });

    it('should generate websocket transport config for wallet adapter', () => {
      const websocketWallet: QualifiedResponder = {
        responderId: 'test-websocket',
        rdns: 'com.example.websocket',
        name: 'WebSocket Wallet',
        icon: 'data:image/png;base64,test',
        matched: {
          required: {
            chains: ['solana:mainnet'],
            features: ['account-management'],
            interfaces: ['solana-standard'],
          },
        },
        transportConfig: {
          type: 'websocket',
          websocketUrl: 'wss://wallet.example.com/ws',
          adapterConfig: {
            maxReconnectAttempts: 10,
            heartbeatInterval: 30000,
          },
        },
      };

      const config = getTransportConfigFromWallet(websocketWallet);

      expect(config).toEqual({
        timeout: 30000,
        retries: 3,
        retryDelay: 1000,
        maxReconnectAttempts: 10,
        heartbeatInterval: 30000,
        url: 'wss://wallet.example.com/ws',
      });
    });

    it('should provide default config for wallet without transport config', () => {
      const walletWithoutConfig: QualifiedResponder = {
        responderId: 'test-no-config',
        rdns: 'com.example.noconfig',
        name: 'No Config Wallet',
        icon: 'data:image/png;base64,test',
        matched: {
          required: {
            chains: ['evm:1'],
            features: ['account-management'],
            interfaces: ['eip-1193'],
          },
        },
      };

      const config = getTransportConfigFromWallet(walletWithoutConfig);

      expect(config).toEqual({
        timeout: 30000,
        retries: 3,
        retryDelay: 1000,
      });
    });

    it('should use default popup URL for popup wallet without popupUrl', () => {
      const popupWalletNoUrl: QualifiedResponder = {
        responderId: 'test-popup-no-url',
        rdns: 'com.example.popup',
        name: 'Popup Wallet No URL',
        icon: 'data:image/png;base64,test',
        matched: {
          required: {
            chains: ['evm:1'],
            features: ['account-management'],
            interfaces: ['eip-1193'],
          },
        },
        transportConfig: {
          type: 'popup',
          // No popupUrl
        },
      };

      const config = getTransportConfigFromWallet(popupWalletNoUrl);

      expect(config).toEqual({
        timeout: 30000,
        retries: 3,
        retryDelay: 1000,
        url: '/wallets/com.example.popup/popup', // Default generated URL
      });
    });
  });

  describe('Integration with Discovery Wallet Adapter', () => {
    it('should create adapter successfully with valid transport config', async () => {
      const validWallet: QualifiedResponder = {
        responderId: '550e8400-e29b-41d4-a716-446655440001',
        rdns: 'com.example.valid',
        name: 'Valid Wallet',
        icon: 'data:image/png;base64,test',
        matched: {
          required: {
            chains: ['evm:1'],
            features: ['account-management'],
            interfaces: ['eip-1193'],
          },
        },
        transportConfig: {
          type: 'extension',
          extensionId: 'test-extension-id',
        },
      };

      // Mock connection manager
      const mockConnectionManager = {
        connect: vi.fn().mockResolvedValue({
          accounts: [{ address: '0x1234567890123456789012345678901234567890', chainId: '1' }],
        }),
        disconnect: vi.fn().mockResolvedValue(undefined),
      };

      // This should not throw
      expect(() => {
        new DiscoveryAdapter(validWallet, mockConnectionManager as unknown, { autoConnect: false });
      }).not.toThrow();
    });

    it('should handle transport config validation in adapter creation flow', async () => {
      const invalidWallet: QualifiedResponder = {
        responderId: '550e8400-e29b-41d4-a716-446655440002',
        rdns: 'com.example.invalid',
        name: 'Invalid Wallet',
        icon: 'data:image/png;base64,test',
        matched: {
          required: {
            chains: ['evm:1'],
            features: ['account-management'],
            interfaces: ['eip-1193'],
          },
        },
        // No transportConfig - should cause issues during connect()
      };

      // Mock connection manager
      const mockConnectionManager = {
        connect: vi.fn().mockResolvedValue({
          accounts: [{ address: '0x1234567890123456789012345678901234567890', chainId: '1' }],
        }),
        disconnect: vi.fn().mockResolvedValue(undefined),
      };

      const adapter = new DiscoveryAdapter(invalidWallet, mockConnectionManager as unknown, {
        autoConnect: false,
      });

      // The adapter should be created, but connect should fail due to missing transport config
      await expect(adapter.connect()).rejects.toThrow();
    });
  });

  describe('Integration with Transport Discovery Service', () => {
    it('should properly extract and store transport config during discovery', async () => {
      const mockDiscovery = {
        scan: vi.fn().mockResolvedValue([
          {
            id: 'test-wallet',
            name: 'Test Wallet',
            icon: 'data:image/png;base64,test',
            chains: ['evm:1'],
          },
        ]),
        qualifiedWallets: new Map([
          [
            'test-wallet',
            {
              responderId: 'test-wallet',
              rdns: 'com.example.test',
              name: 'Test Wallet',
              icon: 'data:image/png;base64,test',
              matched: {
                required: {
                  chains: ['evm:1'],
                  features: ['account-management'],
                  interfaces: ['eip-1193'],
                },
              },
              transportConfig: {
                type: 'extension',
                extensionId: 'test-extension-id',
                walletAdapter: 'TestWalletAdapter',
              },
            },
          ],
        ]),
        connectionManager: {
          connect: vi.fn(),
          disconnect: vi.fn(),
        },
      };

      // Create a mock DiscoveryService that extends the mock parent
      class MockUnifiedDiscoveryService {
        private discoveredResponders = new Map<string, QualifiedResponder>();

        async scan() {
          const wallets = await mockDiscovery.scan();
          // Process qualified wallets to store transport configuration
          for (const [walletId, qualifiedWallet] of mockDiscovery.qualifiedWallets) {
            this.discoveredResponders.set(walletId, qualifiedWallet);
          }
          return wallets;
        }

        getWalletsWithTransport() {
          return Array.from(this.discoveredResponders.values());
        }
      }

      const service = new MockUnifiedDiscoveryService();

      await service.scan();

      const walletsWithTransport = service.getWalletsWithTransport();
      expect(walletsWithTransport).toHaveLength(1);

      const wallet = walletsWithTransport[0];
      expect(wallet.transportConfig).toEqual({
        type: 'extension',
        extensionId: 'test-extension-id',
        walletAdapter: 'TestWalletAdapter',
      });
    });
  });
});
