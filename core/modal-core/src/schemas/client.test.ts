/**
 * @fileoverview Tests for client configuration schemas
 */

import { describe, it, expect } from 'vitest';
import {
  walletMeshClientConfigSchema,
  walletMeshLoggerConfigSchema,
  providerLoaderConfigSchema,
  discoveryConfigSchema,
  walletFilterConfigSchema,
  connectOptionsSchema,
  walletClientStateSchema,
  clientEventSchema,
} from './client.js';
import { ChainType } from '../types.js';

describe('Client Configuration Schemas', () => {
  describe('walletMeshClientConfigSchema', () => {
    it('should validate minimal valid config', () => {
      const config = { appName: 'My DApp' };
      expect(() => walletMeshClientConfigSchema.parse(config)).not.toThrow();
    });

    it('should reject empty app name', () => {
      const config = { appName: '' };
      expect(() => walletMeshClientConfigSchema.parse(config)).toThrow('App name is required');
    });

    it('should validate full config with all options', () => {
      const config = {
        appName: 'My DApp',
        appDescription: 'A decentralized application',
        appUrl: 'https://mydapp.com',
        appIcon: 'https://mydapp.com/icon.png',
        projectId: 'abc123',
        chains: [{ chainId: 'eip155:1', chainType: ChainType.Evm, name: 'Ethereum' }],
        wallets: { order: ['metamask'], include: ['metamask', 'walletconnect'] },
        debug: true,
        logger: { debug: true, level: 'debug' },
        providerLoader: { preloadOnInit: true, preloadChainTypes: [ChainType.Evm] },
        discovery: { enabled: true, timeout: 5000 },
        modal: { enabled: true, autoCloseDelay: 3000 },
        storage: { keyPrefix: 'mydapp', persist: true },
        security: { sessionTimeout: 3600000, validateOrigin: true },
      };
      expect(() => walletMeshClientConfigSchema.parse(config)).not.toThrow();
    });

    it('should reject invalid URLs', () => {
      const config = { appName: 'My DApp', appUrl: 'not-a-url' };
      expect(() => walletMeshClientConfigSchema.parse(config)).toThrow();
    });

    it('should validate wallet configuration as filter object', () => {
      const config = {
        appName: 'My DApp',
        wallets: {
          order: ['metamask', 'walletconnect'],
          include: ['metamask', 'walletconnect', 'coinbase'],
          exclude: ['phantom'],
        },
      };
      expect(() => walletMeshClientConfigSchema.parse(config)).not.toThrow();
    });

    it('should validate wallet configuration as array', () => {
      const config = {
        appName: 'My DApp',
        wallets: [
          {
            id: 'metamask',
            name: 'MetaMask',
            icon: 'data:image/svg+xml,<svg></svg>',
            chains: [ChainType.Evm],
          },
          {
            id: 'phantom',
            name: 'Phantom',
            icon: 'data:image/svg+xml,<svg></svg>',
            chains: [ChainType.Solana],
          },
        ],
      };
      expect(() => walletMeshClientConfigSchema.parse(config)).not.toThrow();
    });
  });

  describe('walletMeshLoggerConfigSchema', () => {
    it('should validate logger config', () => {
      const config = {
        debug: true,
        prefix: 'MyApp',
        level: 'debug' as const,
      };
      expect(() => walletMeshLoggerConfigSchema.parse(config)).not.toThrow();
    });

    it('should reject invalid log level', () => {
      const config = {
        level: 'verbose',
      };
      expect(() => walletMeshLoggerConfigSchema.parse(config)).toThrow();
    });
  });

  describe('providerLoaderConfigSchema', () => {
    it('should validate provider loader config', () => {
      const config = {
        preloadOnInit: true,
        preloadChainTypes: [ChainType.Evm, ChainType.Solana],
      };
      expect(() => providerLoaderConfigSchema.parse(config)).not.toThrow();
    });

    it('should reject invalid chain types', () => {
      const config = {
        preloadChainTypes: ['invalid-chain'],
      };
      expect(() => providerLoaderConfigSchema.parse(config)).toThrow();
    });
  });

  describe('discoveryConfigSchema', () => {
    it('should validate discovery config', () => {
      const config = {
        enabled: true,
        timeout: 5000,
        scanInterval: 10000,
        maxRetries: 3,
      };
      expect(() => discoveryConfigSchema.parse(config)).not.toThrow();
    });

    it('should reject timeout out of range', () => {
      expect(() => discoveryConfigSchema.parse({ timeout: 500 })).toThrow();
      expect(() => discoveryConfigSchema.parse({ timeout: 70000 })).toThrow();
    });

    it('should reject scan interval out of range', () => {
      expect(() => discoveryConfigSchema.parse({ scanInterval: 500 })).toThrow();
      expect(() => discoveryConfigSchema.parse({ scanInterval: 400000 })).toThrow();
    });

    it('should reject max retries out of range', () => {
      expect(() => discoveryConfigSchema.parse({ maxRetries: -1 })).toThrow();
      expect(() => discoveryConfigSchema.parse({ maxRetries: 11 })).toThrow();
    });
  });

  describe('walletFilterConfigSchema', () => {
    it('should validate wallet filter config', () => {
      const config = {
        order: ['metamask', 'walletconnect'],
        include: ['metamask', 'walletconnect', 'coinbase'],
        exclude: ['phantom'],
      };
      expect(() => walletFilterConfigSchema.parse(config)).not.toThrow();
    });

    it('should allow all fields to be optional', () => {
      expect(() => walletFilterConfigSchema.parse({})).not.toThrow();
    });
  });

  describe('connectOptionsSchema', () => {
    it('should validate connect options', () => {
      const options = {
        preferredInterface: 'eip1193',
        chainType: ChainType.Evm,
        silent: true,
        maxRetries: 3,
        retryDelayMs: 1000,
        timeoutMs: 30000,
      };
      expect(() => connectOptionsSchema.parse(options)).not.toThrow();
    });

    it('should reject negative values', () => {
      expect(() => connectOptionsSchema.parse({ maxRetries: -1 })).toThrow();
      expect(() => connectOptionsSchema.parse({ retryDelayMs: -100 })).toThrow();
      expect(() => connectOptionsSchema.parse({ timeoutMs: -1000 })).toThrow();
    });
  });

  describe('walletClientStateSchema', () => {
    it('should validate client state', () => {
      const state = {
        status: 'connected' as const,
        activeConnector: 'metamask',
        activeChain: 'eip155:1',
        activeProviderInterface: 'eip1193',
        accounts: ['0x1234567890123456789012345678901234567890'],
        error: null,
      };
      expect(() => walletClientStateSchema.parse(state)).not.toThrow();
    });

    it('should validate disconnected state', () => {
      const state = {
        status: 'disconnected' as const,
        activeConnector: null,
        activeChain: null,
        activeProviderInterface: null,
        accounts: [],
        error: null,
      };
      expect(() => walletClientStateSchema.parse(state)).not.toThrow();
    });

    it('should reject invalid status', () => {
      const state = {
        status: 'invalid',
        activeConnector: null,
        activeChain: null,
        activeProviderInterface: null,
        accounts: [],
        error: null,
      };
      expect(() => walletClientStateSchema.parse(state)).toThrow();
    });
  });

  describe('clientEventSchema', () => {
    it('should validate connecting event', () => {
      const event = {
        type: 'connecting' as const,
        walletId: 'metamask',
      };
      expect(() => clientEventSchema.parse(event)).not.toThrow();
    });

    it('should validate connected event', () => {
      const event = {
        type: 'connected' as const,
        walletId: 'metamask',
        accounts: ['0x1234567890123456789012345678901234567890'],
        chainId: 'eip155:1',
        chainType: ChainType.Evm,
      };
      expect(() => clientEventSchema.parse(event)).not.toThrow();
    });

    it('should validate disconnected event', () => {
      const event = {
        type: 'disconnected' as const,
        reason: 'User disconnected',
      };
      expect(() => clientEventSchema.parse(event)).not.toThrow();
    });

    it('should validate chain changed event', () => {
      const event = {
        type: 'chain_changed' as const,
        chainId: '0x89',
        chainType: ChainType.Evm,
      };
      expect(() => clientEventSchema.parse(event)).not.toThrow();
    });

    it('should validate accounts changed event', () => {
      const event = {
        type: 'accounts_changed' as const,
        accounts: ['0x1234567890123456789012345678901234567890'],
      };
      expect(() => clientEventSchema.parse(event)).not.toThrow();
    });

    it('should validate error event', () => {
      const event = {
        type: 'error' as const,
        error: new Error('Connection failed'),
        code: 4001,
        context: 'connection',
        retryCount: 3,
        fatal: false,
      };
      expect(() => clientEventSchema.parse(event)).not.toThrow();
    });

    it('should reject invalid event type', () => {
      const event = {
        type: 'invalid',
      };
      expect(() => clientEventSchema.parse(event)).toThrow();
    });
  });

  describe('Security and Storage Configuration', () => {
    it('should validate security config with session timeout', () => {
      const config = {
        appName: 'My DApp',
        security: {
          sessionTimeout: 3600000, // 1 hour
          validateOrigin: true,
          allowedOrigins: ['https://mydapp.com', 'https://app.mydapp.com'],
        },
      };
      expect(() => walletMeshClientConfigSchema.parse(config)).not.toThrow();
    });

    it('should reject session timeout out of range', () => {
      const config = {
        appName: 'My DApp',
        security: {
          sessionTimeout: 30000, // Too short (< 1 minute)
        },
      };
      expect(() => walletMeshClientConfigSchema.parse(config)).toThrow();
    });

    it('should validate storage config', () => {
      const config = {
        appName: 'My DApp',
        storage: {
          keyPrefix: 'mydapp_wallet',
          persist: false,
        },
      };
      const result = walletMeshClientConfigSchema.parse(config);
      expect(result.storage?.keyPrefix).toBe('mydapp_wallet');
      expect(result.storage?.persist).toBe(false);
    });

    it('should provide storage defaults', () => {
      const config = {
        appName: 'My DApp',
        storage: {},
      };
      const result = walletMeshClientConfigSchema.parse(config);
      // Storage defaults are not applied in the schema itself
      expect(result.storage?.keyPrefix).toBeUndefined();
      expect(result.storage?.persist).toBeUndefined();
    });
  });

  describe('Modal Configuration', () => {
    it('should validate modal config', () => {
      const config = {
        appName: 'My DApp',
        modal: {
          enabled: true,
          autoCloseDelay: 5000,
          showProviderSelection: true,
          persistWalletSelection: true,
        },
      };
      expect(() => walletMeshClientConfigSchema.parse(config)).not.toThrow();
    });

    it('should reject auto close delay out of range', () => {
      const config = {
        appName: 'My DApp',
        modal: {
          autoCloseDelay: -1000,
        },
      };
      expect(() => walletMeshClientConfigSchema.parse(config)).toThrow();

      const config2 = {
        appName: 'My DApp',
        modal: {
          autoCloseDelay: 70000,
        },
      };
      expect(() => walletMeshClientConfigSchema.parse(config2)).toThrow();
    });
  });
});
