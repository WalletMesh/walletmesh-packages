/**
 * Unit tests for discovery type mappings
 */

import type { QualifiedResponder } from '@walletmesh/discovery';
import { describe, expect, it } from 'vitest';
import { ChainType, TransportType } from '../../../types.js';
import {
  CHAIN_MAPPINGS,
  chainTypeToDiscoveryChains,
  checkWalletSupportsChainTypes,
  createCapabilityRequirementsFromChainTypes,
  discoveryChainToChainTypes,
  extractTransportConfig,
  getTransportConfigFromWallet,
  getTransportTypeFromDiscovery,
  normalizeChainId,
  validateWalletTransport,
} from '../discoveryMappings.js';

describe('discoveryMappings', () => {
  describe('normalizeChainId', () => {
    it('should normalize common chain ID formats to CAIP-2', () => {
      // Hex format
      expect(normalizeChainId('0x1')).toBe('eip155:1');
      expect(normalizeChainId('0x89')).toBe('eip155:137');
      expect(normalizeChainId('0xa4b1')).toBe('eip155:42161');

      // Numeric format
      expect(normalizeChainId('1')).toBe('eip155:1');
      expect(normalizeChainId('137')).toBe('eip155:137');
      expect(normalizeChainId('42161')).toBe('eip155:42161');

      // Named chains
      expect(normalizeChainId('ethereum')).toBe('eip155:1');
      expect(normalizeChainId('polygon')).toBe('eip155:137');
      expect(normalizeChainId('arbitrum')).toBe('eip155:42161');
      expect(normalizeChainId('optimism')).toBe('eip155:10');

      // Solana chains
      expect(normalizeChainId('solana:mainnet')).toBe('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp');
      expect(normalizeChainId('solana:testnet')).toBe('solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z');
      expect(normalizeChainId('solana:devnet')).toBe('solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1');

      // Already normalized
      expect(normalizeChainId('eip155:1')).toBe('eip155:1');
      expect(normalizeChainId('cosmos:cosmoshub-4')).toBe('cosmos:cosmoshub-4');

      // Unknown chains pass through
      expect(normalizeChainId('unknown:chain')).toBe('unknown:chain');
    });

    it('should handle edge cases', () => {
      expect(normalizeChainId('')).toBe('');
      expect(normalizeChainId('0x')).toBe('0x');
      expect(normalizeChainId('random-string')).toBe('random-string');
    });
  });

  describe('chainTypeToDiscoveryChains', () => {
    it('should convert ChainType.Evm to EVM chain IDs', () => {
      const chains = chainTypeToDiscoveryChains(ChainType.Evm);
      expect(chains).toContain('eip155:1'); // Ethereum
      expect(chains).toContain('eip155:137'); // Polygon
      expect(chains).toContain('eip155:42161'); // Arbitrum
      expect(chains.length).toBeGreaterThan(10); // Should have many EVM chains
    });

    it('should convert ChainType.Solana to Solana chain IDs', () => {
      const chains = chainTypeToDiscoveryChains(ChainType.Solana);
      expect(chains).toEqual([
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp', // mainnet
        'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z', // testnet
        'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1', // devnet
      ]);
    });

    it('should convert ChainType.Aztec to Aztec chain IDs', () => {
      const chains = chainTypeToDiscoveryChains(ChainType.Aztec);
      expect(chains).toEqual(['aztec:mainnet', 'aztec:testnet', 'aztec:sandbox', 'aztec:31337']);
    });
  });

  describe('discoveryChainToChainTypes', () => {
    it('should convert EVM chain IDs to ChainType.Evm', () => {
      expect(discoveryChainToChainTypes('eip155:1')).toEqual([ChainType.Evm]);
      expect(discoveryChainToChainTypes('eip155:137')).toEqual([ChainType.Evm]);
      expect(discoveryChainToChainTypes('eip155:42161')).toEqual([ChainType.Evm]);
    });

    it('should convert Solana chain IDs to ChainType.Solana', () => {
      expect(discoveryChainToChainTypes('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp')).toEqual([
        ChainType.Solana,
      ]);
      expect(discoveryChainToChainTypes('solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z')).toEqual([
        ChainType.Solana,
      ]);
    });

    it('should convert Aztec chain IDs to ChainType.Aztec', () => {
      expect(discoveryChainToChainTypes('aztec:mainnet')).toEqual([ChainType.Aztec]);
      expect(discoveryChainToChainTypes('aztec:testnet')).toEqual([ChainType.Aztec]);
    });

    it('should return empty array for unknown chains', () => {
      expect(discoveryChainToChainTypes('cosmos:cosmoshub-4')).toEqual([]);
      expect(discoveryChainToChainTypes('unknown:chain')).toEqual([]);
    });
  });

  describe('createCapabilityRequirementsFromChainTypes', () => {
    it('should create requirements for single chain type', () => {
      const requirements = createCapabilityRequirementsFromChainTypes([ChainType.Evm]);
      expect(requirements.technologies).toBeDefined();
      expect(requirements.technologies).toHaveLength(1);
      expect(requirements.technologies[0]).toEqual({
        type: 'evm',
        interfaces: ['eip-1193', 'eip-6963'],
      });
      expect(requirements.features).toBeDefined();
      expect(requirements.features).toContain('account-management');
    });

    it('should create requirements for multiple chain types', () => {
      const requirements = createCapabilityRequirementsFromChainTypes([ChainType.Evm, ChainType.Solana]);
      expect(requirements.technologies).toBeDefined();
      expect(requirements.technologies).toHaveLength(2);
      expect(requirements.technologies[0]).toEqual({
        type: 'evm',
        interfaces: ['eip-1193', 'eip-6963'],
      });
      expect(requirements.technologies[1]).toEqual({
        type: 'solana',
        interfaces: ['solana-standard-wallet'],
      });
    });

    it('should merge with existing capabilities', () => {
      const existingCapabilities = {
        technologies: [{ type: 'cosmos' as const, interfaces: ['cosmos-sdk'] }],
        features: ['sign_message'],
      };

      const requirements = createCapabilityRequirementsFromChainTypes([ChainType.Evm], existingCapabilities);

      expect(requirements.technologies).toHaveLength(2);
      expect(requirements.technologies[0]).toEqual({ type: 'cosmos', interfaces: ['cosmos-sdk'] }); // Existing
      expect(requirements.technologies[1]).toEqual({ type: 'evm', interfaces: ['eip-1193', 'eip-6963'] }); // Added
      expect(requirements.features).toEqual(['sign_message']); // Preserved
    });

    it('should handle empty chain types with existing capabilities', () => {
      const existingCapabilities = {
        technologies: [{ type: 'evm' as const, interfaces: ['eip-1193'] }],
        features: ['sign_message'],
      };

      const requirements = createCapabilityRequirementsFromChainTypes([], existingCapabilities);

      expect(requirements.technologies).toHaveLength(1);
      expect(requirements.technologies[0]).toEqual({ type: 'evm', interfaces: ['eip-1193'] });
      expect(requirements.features).toEqual(['sign_message']);
    });
  });

  describe('checkWalletSupportsChainTypes', () => {
    it('should check if wallet supports required chain types', () => {
      const wallet: QualifiedResponder = {
        responderId: 'test-wallet',
        rdns: 'com.test.wallet',
        name: 'Test Wallet',
        icon: '',
        matched: {
          required: {
            technologies: [
              { type: 'evm' as const, interfaces: ['eip-1193'] },
              { type: 'solana' as const, interfaces: ['solana-standard'] },
            ],
            features: [],
          },
        },
      };

      // Supports EVM
      expect(checkWalletSupportsChainTypes(wallet, [ChainType.Evm])).toBe(true);

      // Supports Solana
      expect(checkWalletSupportsChainTypes(wallet, [ChainType.Solana])).toBe(true);

      // Supports both EVM and Solana
      expect(checkWalletSupportsChainTypes(wallet, [ChainType.Evm, ChainType.Solana])).toBe(true);

      // Does not support Aztec
      expect(checkWalletSupportsChainTypes(wallet, [ChainType.Aztec])).toBe(false);

      // No chain types always supported
      expect(checkWalletSupportsChainTypes(wallet, [])).toBe(true);
    });

    it('should handle wallet with no technologies', () => {
      const wallet: QualifiedResponder = {
        responderId: 'no-technologies',
        rdns: 'com.test.empty',
        name: 'No Technologies',
        icon: '',
        matched: {
          required: {
            technologies: [],
            features: [],
          },
        },
      };

      expect(checkWalletSupportsChainTypes(wallet, [ChainType.Evm])).toBe(false);
      expect(checkWalletSupportsChainTypes(wallet, [])).toBe(true);
    });
  });

  describe('getTransportTypeFromDiscovery', () => {
    it('should map discovery transport types to TransportType enum', () => {
      expect(getTransportTypeFromDiscovery('injected')).toBe(TransportType.Injected);
      expect(getTransportTypeFromDiscovery('popup')).toBe(TransportType.Popup);
      expect(getTransportTypeFromDiscovery('iframe')).toBe(TransportType.Iframe);
      expect(getTransportTypeFromDiscovery('websocket')).toBe(TransportType.WebSocket);
      expect(getTransportTypeFromDiscovery('extension')).toBe(TransportType.Extension);
    });

    it('should return Extension for unknown types', () => {
      expect(getTransportTypeFromDiscovery('unknown')).toBe(TransportType.Extension);
      expect(getTransportTypeFromDiscovery('custom')).toBe(TransportType.Extension);
    });
  });

  describe('extractTransportConfig', () => {
    it('should extract injected transport config', () => {
      const responder: QualifiedResponder = {
        responderId: 'metamask',
        rdns: 'io.metamask',
        name: 'MetaMask',
        icon: '',
        transportConfig: {
          type: 'injected',
          windowProperty: 'ethereum',
        },
      };

      const config = extractTransportConfig(responder);
      expect(config).toEqual({
        type: 'injected',
        windowProperty: 'ethereum',
      });
    });

    it('should extract WebSocket transport config', () => {
      const responder: QualifiedResponder = {
        responderId: 'ws-wallet',
        rdns: 'com.wallet.websocket',
        name: 'WebSocket Wallet',
        icon: '',
        transportConfig: {
          type: 'websocket',
          url: 'wss://wallet.com/connect',
          protocols: ['walletmesh-v1'],
          reconnectInterval: 5000,
        },
      };

      const config = extractTransportConfig(responder);
      expect(config).toEqual({
        type: 'websocket',
        url: 'wss://wallet.com/connect',
        protocols: ['walletmesh-v1'],
        reconnectInterval: 5000,
      });
    });

    it('should handle missing transport config', () => {
      const responder: QualifiedResponder = {
        responderId: 'basic',
        rdns: 'com.basic',
        name: 'Basic',
        icon: '',
      };

      const config = extractTransportConfig(responder);
      expect(config).toEqual({});
    });
  });

  describe('validateWalletTransport', () => {
    it('should validate extension transport with extensionId', () => {
      const responder: QualifiedResponder = {
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
        },
      };

      expect(validateWalletTransport(responder)).toBe(true);
    });

    it('should reject extension transport without extensionId', () => {
      const responder: QualifiedResponder = {
        responderId: 'test-invalid-extension',
        rdns: 'com.example.invalid',
        name: 'Invalid Extension',
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

      expect(validateWalletTransport(responder)).toBe(false);
    });

    it('should validate popup transport (no URL required)', () => {
      const responder: QualifiedResponder = {
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
        },
      };

      expect(validateWalletTransport(responder)).toBe(true);
    });

    it('should validate websocket transport with URL', () => {
      const responder: QualifiedResponder = {
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
        },
      };

      expect(validateWalletTransport(responder)).toBe(true);
    });

    it('should reject websocket transport without URL', () => {
      const responder: QualifiedResponder = {
        responderId: 'test-invalid-websocket',
        rdns: 'com.example.invalidws',
        name: 'Invalid WebSocket',
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

      expect(validateWalletTransport(responder)).toBe(false);
    });

    it('should validate injected transport', () => {
      const responder: QualifiedResponder = {
        responderId: 'test-injected',
        rdns: 'com.example.injected',
        name: 'Injected Wallet',
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

      expect(validateWalletTransport(responder)).toBe(true);
    });

    it('should reject wallet without transport config', () => {
      const responder: QualifiedResponder = {
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

      expect(validateWalletTransport(responder)).toBe(false);
    });

    it('should reject unknown transport types', () => {
      const responder: QualifiedResponder = {
        responderId: 'test-unknown',
        rdns: 'com.example.unknown',
        name: 'Unknown Transport',
        icon: 'data:image/png;base64,test',
        matched: {
          required: {
            chains: ['evm:1'],
            features: ['account-management'],
            interfaces: ['eip-1193'],
          },
        },
        transportConfig: {
          type: 'unknown-type' as string,
        },
      };

      expect(validateWalletTransport(responder)).toBe(false);
    });
  });

  describe('getTransportConfigFromWallet', () => {
    it('should generate extension transport config', () => {
      const responder: QualifiedResponder = {
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
          extensionId: 'test-extension-id',
          adapterConfig: {
            reconnect: true,
            reconnectInterval: 5000,
          },
        },
      };

      const config = getTransportConfigFromWallet(responder);

      expect(config).toEqual({
        timeout: 30000,
        retries: 3,
        retryDelay: 1000,
        reconnect: true,
        reconnectInterval: 5000,
        extensionId: 'test-extension-id',
      });
    });

    it('should generate popup transport config with default URL', () => {
      const responder: QualifiedResponder = {
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
          // No popupUrl - should use default
        },
      };

      const config = getTransportConfigFromWallet(responder);

      expect(config).toEqual({
        timeout: 30000,
        retries: 3,
        retryDelay: 1000,
        url: '/wallets/com.example.popup/popup',
      });
    });

    it('should generate popup transport config with custom URL', () => {
      const responder: QualifiedResponder = {
        responderId: 'test-popup-custom',
        rdns: 'com.example.popupcustom',
        name: 'Custom Popup Wallet',
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
            timeout: 60000,
          },
        },
      };

      const config = getTransportConfigFromWallet(responder);

      expect(config).toEqual({
        timeout: 60000, // Overridden by adapterConfig
        retries: 3,
        retryDelay: 1000,
        url: 'https://wallet.example.com/connect',
      });
    });

    it('should generate websocket transport config', () => {
      const responder: QualifiedResponder = {
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

      const config = getTransportConfigFromWallet(responder);

      expect(config).toEqual({
        timeout: 30000,
        retries: 3,
        retryDelay: 1000,
        maxReconnectAttempts: 10,
        heartbeatInterval: 30000,
        url: 'wss://wallet.example.com/ws',
      });
    });

    it('should return default config for wallet without transport config', () => {
      const responder: QualifiedResponder = {
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

      const config = getTransportConfigFromWallet(responder);

      expect(config).toEqual({
        timeout: 30000,
        retries: 3,
        retryDelay: 1000,
      });
    });

    it('should handle unknown transport type with base config', () => {
      const responder: QualifiedResponder = {
        responderId: 'test-unknown',
        rdns: 'com.example.unknown',
        name: 'Unknown Transport',
        icon: 'data:image/png;base64,test',
        matched: {
          required: {
            chains: ['evm:1'],
            features: ['account-management'],
            interfaces: ['eip-1193'],
          },
        },
        transportConfig: {
          type: 'unknown-type' as string,
          adapterConfig: {
            customProperty: 'custom-value',
          },
        },
      };

      const config = getTransportConfigFromWallet(responder);

      expect(config).toEqual({
        timeout: 30000,
        retries: 3,
        retryDelay: 1000,
        customProperty: 'custom-value',
      });
    });

    it('should merge adapter config with base config', () => {
      const responder: QualifiedResponder = {
        responderId: 'test-merge-config',
        rdns: 'com.example.merge',
        name: 'Merge Config Wallet',
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
          adapterConfig: {
            timeout: 45000, // Override default
            retries: 5, // Override default
            customSetting: true, // Add custom
          },
        },
      };

      const config = getTransportConfigFromWallet(responder);

      expect(config).toEqual({
        timeout: 45000, // Overridden by adapterConfig
        retries: 5, // Overridden by adapterConfig
        retryDelay: 1000, // Base default
        customSetting: true, // Added by adapterConfig
      });
    });
  });
});
