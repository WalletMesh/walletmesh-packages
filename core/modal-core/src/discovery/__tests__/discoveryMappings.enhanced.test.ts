/**
 * Enhanced tests for discovery mappings with transport configuration
 * Tests the new transport config functionality
 */

import type { QualifiedResponder } from '@walletmesh/discovery';
import { describe, expect, it } from 'vitest';
import {
  extractTransportConfig,
  getTransportConfigFromWallet,
  getWalletChainTypes,
  mapDiscoveryChainsToChainTypes,
  validateWalletTransport,
  walletSupportsChainTypes,
} from '../../client/types/discoveryMappings.js';
import { ChainType } from '../../types.js';

describe('Discovery Mappings - Transport Config Enhanced Tests', () => {
  describe('Transport Config Integration', () => {
    it('should handle complete transport config for extension wallets', () => {
      const responder: QualifiedResponder = {
        responderId: 'complete-extension-wallet',
        rdns: 'com.example.complete',
        name: 'Complete Extension Wallet',
        icon: 'data:image/png;base64,complete',
        matched: {
          required: {
            technologies: [{ type: 'evm' as const, interfaces: ['eip-1193', 'eip-1102'] }],
            features: ['account-management', 'transaction-signing', 'message-signing'],
          },
        },
        transportConfig: {
          type: 'extension',
          extensionId: 'complete-extension-id-12345',
          walletAdapter: 'CompleteExtensionAdapter',
          adapterConfig: {
            timeout: 45000,
            retries: 10,
            retryDelay: 2000,
            reconnect: true,
            reconnectInterval: 10000,
            maxReconnectAttempts: 5,
            enableBatchRequests: true,
            preferredRpcUrls: {
              '1': 'https://eth-mainnet.gateway.pokt.network/v1/lb/621b5c7a92a04c0039e7b3f8',
              '137': 'https://polygon-rpc.com',
              '42161': 'https://arb1.arbitrum.io/rpc',
            },
          },
        },
        metadata: {
          version: '2.1.0',
          description: 'A complete multi-chain extension wallet',
          homepage: 'https://completewallet.example.com',
          supportedNetworks: ['ethereum', 'polygon', 'arbitrum'],
        },
      };

      // Test extraction
      const extractedConfig = extractTransportConfig(responder);
      expect(extractedConfig).toEqual(responder.transportConfig);

      // Test validation
      expect(validateWalletTransport(responder)).toBe(true);

      // Test transport config generation
      const generatedConfig = getTransportConfigFromWallet(responder);
      expect(generatedConfig).toEqual({
        timeout: 45000, // From adapterConfig
        retries: 10, // From adapterConfig
        retryDelay: 2000, // From adapterConfig
        reconnect: true,
        reconnectInterval: 10000,
        maxReconnectAttempts: 5,
        enableBatchRequests: true,
        preferredRpcUrls: {
          '1': 'https://eth-mainnet.gateway.pokt.network/v1/lb/621b5c7a92a04c0039e7b3f8',
          '137': 'https://polygon-rpc.com',
          '42161': 'https://arb1.arbitrum.io/rpc',
        },
        extensionId: 'complete-extension-id-12345',
      });
    });

    it('should handle complete transport config for popup wallets', () => {
      const responder: QualifiedResponder = {
        responderId: 'complete-popup-wallet',
        rdns: 'com.example.popup',
        name: 'Complete Popup Wallet',
        icon: 'data:image/svg+xml;base64,popup',
        matched: {
          required: {
            technologies: [
              { type: 'solana' as const, interfaces: ['solana-standard', 'solana-wallet-standard'] },
            ],
            features: ['account-management', 'transaction-signing', 'message-signing'],
          },
        },
        transportConfig: {
          type: 'popup',
          popupUrl: 'https://solana-wallet.example.com/connect',
          walletAdapter: 'SolanaPopupAdapter',
          adapterConfig: {
            timeout: 60000,
            retries: 3,
            popupWidth: 400,
            popupHeight: 600,
            popupFeatures: 'resizable=no,scrollbars=no,status=no',
            closeOnConnect: true,
            theme: 'dark',
            supportedClusters: ['mainnet-beta', 'testnet', 'devnet'],
          },
        },
        metadata: {
          version: '1.5.2',
          description: 'Multi-cluster Solana wallet with popup interface',
          clusterPreferences: ['mainnet-beta', 'devnet'],
        },
      };

      const extractedConfig = extractTransportConfig(responder);
      expect(extractedConfig).toEqual(responder.transportConfig);

      expect(validateWalletTransport(responder)).toBe(true);

      const generatedConfig = getTransportConfigFromWallet(responder);
      expect(generatedConfig).toEqual({
        timeout: 60000, // From adapterConfig
        retries: 3, // From adapterConfig
        retryDelay: 1000, // Default
        popupWidth: 400,
        popupHeight: 600,
        popupFeatures: 'resizable=no,scrollbars=no,status=no',
        closeOnConnect: true,
        theme: 'dark',
        supportedClusters: ['mainnet-beta', 'testnet', 'devnet'],
        url: 'https://solana-wallet.example.com/connect',
      });
    });

    it('should handle complete transport config for websocket wallets', () => {
      const responder: QualifiedResponder = {
        responderId: 'complete-websocket-wallet',
        rdns: 'com.example.websocket',
        name: 'Complete WebSocket Wallet',
        icon: 'data:image/png;base64,websocket',
        matched: {
          required: {
            technologies: [{ type: 'aztec' as const, interfaces: ['aztec-wallet', 'aztec-rpc'] }],
            features: ['private-transactions', 'note-management', 'account-management'],
          },
        },
        transportConfig: {
          type: 'websocket',
          websocketUrl: 'wss://aztec-wallet.example.com/ws',
          walletAdapter: 'AztecWebSocketAdapter',
          adapterConfig: {
            timeout: 30000,
            retries: 5,
            retryDelay: 3000,
            heartbeatInterval: 30000,
            maxReconnectAttempts: 10,
            reconnectBackoffMultiplier: 1.5,
            enableCompression: true,
            protocolVersion: '2.0',
            supportedNetworks: ['mainnet', 'testnet', 'sandbox'],
            encryptionEnabled: true,
          },
        },
        metadata: {
          version: '0.8.1',
          description: 'Privacy-focused Aztec wallet with WebSocket transport',
          privacyFeatures: ['encrypted-notes', 'private-balances', 'anonymous-transactions'],
        },
      };

      const extractedConfig = extractTransportConfig(responder);
      expect(extractedConfig).toEqual(responder.transportConfig);

      expect(validateWalletTransport(responder)).toBe(true);

      const generatedConfig = getTransportConfigFromWallet(responder);
      expect(generatedConfig).toEqual({
        timeout: 30000,
        retries: 5,
        retryDelay: 3000,
        heartbeatInterval: 30000,
        maxReconnectAttempts: 10,
        reconnectBackoffMultiplier: 1.5,
        enableCompression: true,
        protocolVersion: '2.0',
        supportedNetworks: ['mainnet', 'testnet', 'sandbox'],
        encryptionEnabled: true,
        url: 'wss://aztec-wallet.example.com/ws',
      });
    });
  });

  describe('Chain Type Detection and Validation', () => {
    it('should detect multi-chain support correctly', () => {
      const multiChainResponder: QualifiedResponder = {
        responderId: 'multi-chain-wallet',
        rdns: 'com.example.multichain',
        name: 'Multi-Chain Wallet',
        icon: 'data:image/png;base64,multi',
        matched: {
          required: {
            technologies: [
              { type: 'evm' as const, interfaces: ['eip-1193'] },
              { type: 'solana' as const, interfaces: ['solana-standard'] },
              { type: 'aztec' as const, interfaces: ['aztec-wallet'] },
            ],
            features: ['account-management', 'transaction-signing'],
          },
        },
        transportConfig: {
          type: 'extension',
          extensionId: 'multi-chain-extension',
        },
      };

      const chainTypes = getWalletChainTypes(multiChainResponder);
      expect(chainTypes).toContain(ChainType.Evm);
      expect(chainTypes).toContain(ChainType.Solana);
      expect(chainTypes).toContain(ChainType.Aztec);
      expect(chainTypes).toHaveLength(3);

      // Test chain support validation
      expect(walletSupportsChainTypes(multiChainResponder, [ChainType.Evm])).toBe(true);
      expect(walletSupportsChainTypes(multiChainResponder, [ChainType.Solana])).toBe(true);
      expect(walletSupportsChainTypes(multiChainResponder, [ChainType.Aztec])).toBe(true);
      expect(walletSupportsChainTypes(multiChainResponder, [ChainType.Evm, ChainType.Solana])).toBe(true);
    });

    it('should handle chain mapping for different network formats', () => {
      const testCases = [
        { input: ['evm:1', 'evm:137'], expected: [ChainType.Evm] },
        { input: ['eip155:1', 'eip155:137'], expected: [ChainType.Evm] },
        { input: ['solana:mainnet', 'solana:testnet'], expected: [ChainType.Solana] },
        { input: ['aztec:mainnet'], expected: [ChainType.Aztec] },
        {
          input: ['evm:1', 'solana:mainnet', 'aztec:mainnet'],
          expected: [ChainType.Evm, ChainType.Solana, ChainType.Aztec],
        },
        { input: ['unknown:chain'], expected: [] },
      ];

      for (const { input, expected } of testCases) {
        const result = mapDiscoveryChainsToChainTypes(input);
        for (const expectedType of expected) {
          expect(result).toContain(expectedType);
        }
        expect(result).toHaveLength(expected.length);
      }
    });
  });

  describe('Transport Validation Edge Cases', () => {
    it('should handle extension transport with additional metadata', () => {
      const responder: QualifiedResponder = {
        responderId: 'metadata-extension-wallet',
        rdns: 'com.example.metadata',
        name: 'Metadata Extension Wallet',
        icon: 'data:image/png;base64,metadata',
        matched: {
          required: {
            technologies: [{ type: 'evm' as const, interfaces: ['eip-1193'] }],
            features: ['account-management'],
          },
        },
        transportConfig: {
          type: 'extension',
          extensionId: 'metadata-extension-id',
          adapterConfig: {
            manifestVersion: 3,
            permissions: ['storage', 'activeTab', 'scripting'],
            contentSecurityPolicy: "script-src 'self'; object-src 'none';",
            webAccessibleResources: ['/assets/*', '/popup/*'],
          },
        },
        metadata: {
          manifestUrl: 'https://chrome.google.com/webstore/detail/metadata-wallet/id',
          rating: 4.5,
          userCount: 150000,
        },
      };

      expect(validateWalletTransport(responder)).toBe(true);

      const config = getTransportConfigFromWallet(responder);
      expect(config.extensionId).toBe('metadata-extension-id');
      expect(config.manifestVersion).toBe(3);
      expect(config.permissions).toEqual(['storage', 'activeTab', 'scripting']);
    });

    it('should handle popup transport with iframe fallback config', () => {
      const responder: QualifiedResponder = {
        responderId: 'iframe-fallback-wallet',
        rdns: 'com.example.iframe',
        name: 'Iframe Fallback Wallet',
        icon: 'data:image/png;base64,iframe',
        matched: {
          required: {
            technologies: [{ type: 'evm' as const, interfaces: ['eip-1193'] }],
            features: ['account-management'],
          },
        },
        transportConfig: {
          type: 'popup',
          popupUrl: 'https://wallet.example.com/popup',
          adapterConfig: {
            fallbackToIframe: true,
            iframeUrl: 'https://wallet.example.com/iframe',
            iframeSandbox: 'allow-scripts allow-same-origin allow-forms',
            allowPopupBlocking: true,
            popupBlockedFallback: 'iframe',
          },
        },
      };

      expect(validateWalletTransport(responder)).toBe(true);

      const config = getTransportConfigFromWallet(responder);
      expect(config.fallbackToIframe).toBe(true);
      expect(config.iframeUrl).toBe('https://wallet.example.com/iframe');
      expect(config.allowPopupBlocking).toBe(true);
    });

    it('should handle websocket transport with authentication', () => {
      const responder: QualifiedResponder = {
        responderId: 'auth-websocket-wallet',
        rdns: 'com.example.authws',
        name: 'Authenticated WebSocket Wallet',
        icon: 'data:image/png;base64,authws',
        matched: {
          required: {
            technologies: [{ type: 'solana' as const, interfaces: ['solana-standard'] }],
            features: ['account-management'],
          },
        },
        transportConfig: {
          type: 'websocket',
          websocketUrl: 'wss://secure-wallet.example.com/ws',
          adapterConfig: {
            authRequired: true,
            authMethod: 'bearer-token',
            authEndpoint: 'https://secure-wallet.example.com/auth',
            tokenRefreshInterval: 3600000, // 1 hour
            enableTLS: true,
            tlsVersion: '1.3',
            certificatePinning: true,
          },
        },
      };

      expect(validateWalletTransport(responder)).toBe(true);

      const config = getTransportConfigFromWallet(responder);
      expect(config.authRequired).toBe(true);
      expect(config.authMethod).toBe('bearer-token');
      expect(config.enableTLS).toBe(true);
    });

    it('should reject transport configs with security violations', () => {
      const insecureResponders = [
        // Extension with suspicious ID
        {
          responderId: 'suspicious-extension',
          rdns: 'com.example.suspicious',
          name: 'Suspicious Wallet',
          icon: 'data:image/png;base64,suspicious',
          matched: {
            required: {
              technologies: [{ type: 'evm' as const, interfaces: ['eip-1193'] }],
              features: ['account-management'],
            },
          },
          transportConfig: { type: 'extension', extensionId: '' }, // Empty extension ID
        },
        // WebSocket without URL
        {
          responderId: 'invalid-websocket',
          rdns: 'com.example.invalidws',
          name: 'Invalid WebSocket',
          icon: 'data:image/png;base64,invalidws',
          matched: {
            required: {
              chains: ['solana:mainnet'],
              features: ['account-management'],
              interfaces: ['solana-standard'],
            },
          },
          transportConfig: { type: 'websocket' }, // Missing websocketUrl
        },
        // Malformed transport type
        {
          responderId: 'malformed-transport',
          rdns: 'com.example.malformed',
          name: 'Malformed Transport',
          icon: 'data:image/png;base64,malformed',
          matched: {
            required: {
              technologies: [{ type: 'evm' as const, interfaces: ['eip-1193'] }],
              features: ['account-management'],
            },
          },
          transportConfig: { type: 'invalid-transport' as string },
        },
      ];

      for (const responder of insecureResponders) {
        expect(validateWalletTransport(responder as QualifiedResponder)).toBe(false);
      }
    });
  });
});
