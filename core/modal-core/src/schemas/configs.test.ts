/**
 * @fileoverview Tests for configuration schemas
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  baseTransportConfigSchema,
  popupConfigSchema,
  chromeExtensionConfigSchema,
  transportConfigSchema,
  dAppRpcConfigSchema,
  dAppRpcEndpointSchema,
  webSocketConfigSchema,
  iframeConfigSchema,
  extendedTransportConfigSchema,
} from './configs.js';

describe('Configuration Schemas', () => {
  describe('baseTransportConfigSchema', () => {
    it('should validate minimal config', () => {
      expect(() => baseTransportConfigSchema.parse({})).not.toThrow();
    });

    it('should validate complete config', () => {
      const config = {
        url: 'https://wallet.example.com',
        timeout: 30000,
        reconnect: true,
        reconnectInterval: 5000,
      };
      expect(() => baseTransportConfigSchema.parse(config)).not.toThrow();
    });

    it('should reject invalid URL', () => {
      const config = { url: 'not-a-url' };
      expect(() => baseTransportConfigSchema.parse(config)).toThrow();
    });

    it('should reject negative timeout', () => {
      const config = { timeout: -1000 };
      expect(() => baseTransportConfigSchema.parse(config)).toThrow();
    });
  });

  describe('popupConfigSchema', () => {
    it('should validate popup config', () => {
      const config = {
        width: 400,
        height: 600,
        target: '_blank',
        features: 'menubar=no,toolbar=no',
      };
      expect(() => popupConfigSchema.parse(config)).not.toThrow();
    });

    it('should inherit base config properties', () => {
      const config = {
        url: 'https://wallet.example.com',
        width: 450,
        height: 700,
        timeout: 60000,
        reconnect: true,
      };
      expect(() => popupConfigSchema.parse(config)).not.toThrow();
    });

    it('should reject negative dimensions', () => {
      expect(() => popupConfigSchema.parse({ width: -100 })).toThrow();
      expect(() => popupConfigSchema.parse({ height: -200 })).toThrow();
    });
  });

  describe('chromeExtensionConfigSchema', () => {
    it('should validate minimal extension config', () => {
      const config = {
        extensionId: 'nkbihfbeogaeaoehlefnkodbefgpgknn',
      };
      expect(() => chromeExtensionConfigSchema.parse(config)).not.toThrow();
    });

    it('should validate complete extension config', () => {
      const config = {
        extensionId: 'nkbihfbeogaeaoehlefnkodbefgpgknn',
        retries: 3,
        retryDelay: 1000,
        timeout: 10000,
        reconnect: true,
      };
      expect(() => chromeExtensionConfigSchema.parse(config)).not.toThrow();
    });

    it('should reject empty extension ID', () => {
      const config = { extensionId: '' };
      expect(() => chromeExtensionConfigSchema.parse(config)).toThrow();
    });

    it('should reject negative retries', () => {
      const config = {
        extensionId: 'test',
        retries: -1,
      };
      expect(() => chromeExtensionConfigSchema.parse(config)).toThrow();
    });
  });

  describe('transportConfigSchema', () => {
    it('should validate popup transport', () => {
      const transport = {
        type: 'popup' as const,
        config: {
          width: 400,
          height: 600,
        },
      };
      expect(() => transportConfigSchema.parse(transport)).not.toThrow();
    });

    it('should validate chrome extension transport', () => {
      const transport = {
        type: 'chrome-extension' as const,
        config: {
          extensionId: 'abcdefghijklmnopqrstuvwxyz123456',
        },
      };
      expect(() => transportConfigSchema.parse(transport)).not.toThrow();
    });

    it('should reject invalid transport type', () => {
      const transport = {
        type: 'invalid',
        config: {},
      };
      expect(() => transportConfigSchema.parse(transport)).toThrow();
    });

    it('should accept extra properties in config', () => {
      // Zod objects are permissive by default and allow extra properties
      const transport = {
        type: 'popup' as const,
        config: {
          width: 400,
          height: 600,
          extensionId: 'test', // Extra property is allowed
        },
      };
      expect(() => transportConfigSchema.parse(transport)).not.toThrow();
    });
  });

  describe('dAppRpcConfigSchema', () => {
    it('should validate minimal RPC config', () => {
      expect(() => dAppRpcConfigSchema.parse({})).not.toThrow();
    });

    it('should validate complete RPC config', () => {
      const config = {
        timeout: 30000,
        retries: 3,
        loadBalance: true,
        headers: {
          'X-API-Key': 'test-key',
          'X-Custom-Header': 'value',
        },
      };
      expect(() => dAppRpcConfigSchema.parse(config)).not.toThrow();
    });

    it('should validate timeout range', () => {
      expect(() => dAppRpcConfigSchema.parse({ timeout: 0 })).toThrow();
      expect(() => dAppRpcConfigSchema.parse({ timeout: 600001 })).toThrow();
      expect(() => dAppRpcConfigSchema.parse({ timeout: 30000 })).not.toThrow();
    });

    it('should validate retry range', () => {
      expect(() => dAppRpcConfigSchema.parse({ retries: -1 })).toThrow();
      expect(() => dAppRpcConfigSchema.parse({ retries: 11 })).toThrow();
      expect(() => dAppRpcConfigSchema.parse({ retries: 3 })).not.toThrow();
    });

    it('should prevent dangerous headers', () => {
      const dangerousConfigs = [
        { headers: { host: 'malicious.com' } },
        { headers: { origin: 'https://evil.com' } },
        { headers: { referer: 'https://bad.com' } },
        { headers: { authorization: 'Bearer stolen-token' } },
        { headers: { cookie: 'session=hijacked' } },
        { headers: { Host: 'malicious.com' } }, // Case insensitive
      ];

      for (const config of dangerousConfigs) {
        expect(() => dAppRpcConfigSchema.parse(config)).toThrow('Cannot override security-sensitive headers');
      }
    });

    it('should allow safe headers', () => {
      const config = {
        headers: {
          'X-API-Key': 'safe-key',
          'Content-Type': 'application/json',
          'X-Request-ID': 'uuid',
        },
      };
      expect(() => dAppRpcConfigSchema.parse(config)).not.toThrow();
    });
  });

  describe('dAppRpcEndpointSchema', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
      process.env.NODE_ENV = 'test';
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should validate minimal endpoint', () => {
      const endpoint = {
        chainId: '1',
        chainType: 'evm' as const,
        urls: ['https://eth.rpc.com'],
      };
      expect(() => dAppRpcEndpointSchema.parse(endpoint)).not.toThrow();
    });

    it('should validate complete endpoint', () => {
      const endpoint = {
        chainId: '1',
        chainType: 'evm' as const,
        urls: ['https://eth-mainnet.g.alchemy.com/v2/key', 'https://mainnet.infura.io/v3/project'],
        config: {
          timeout: 30000,
          retries: 3,
          loadBalance: true,
        },
      };
      expect(() => dAppRpcEndpointSchema.parse(endpoint)).not.toThrow();
    });

    it('should accept numeric chain ID', () => {
      const endpoint = {
        chainId: 1,
        chainType: 'evm' as const,
        urls: ['https://eth.rpc.com'],
      };
      expect(() => dAppRpcEndpointSchema.parse(endpoint)).not.toThrow();
    });

    it('should validate chain types', () => {
      const validTypes = ['evm', 'solana', 'aztec'];
      for (const chainType of validTypes) {
        const endpoint = {
          chainId: '1',
          chainType,
          urls: ['https://rpc.com'],
        };
        expect(() => dAppRpcEndpointSchema.parse(endpoint)).not.toThrow();
      }
    });

    it('should reject invalid chain type', () => {
      const endpoint = {
        chainId: '1',
        chainType: 'invalid',
        urls: ['https://rpc.com'],
      };
      expect(() => dAppRpcEndpointSchema.parse(endpoint)).toThrow();
    });

    it('should require at least one URL', () => {
      const endpoint = {
        chainId: '1',
        chainType: 'evm' as const,
        urls: [],
      };
      expect(() => dAppRpcEndpointSchema.parse(endpoint)).toThrow();
    });

    it('should validate URL format', () => {
      const endpoint = {
        chainId: '1',
        chainType: 'evm' as const,
        urls: ['not-a-url'],
      };
      expect(() => dAppRpcEndpointSchema.parse(endpoint)).toThrow();
    });

    it('should enforce HTTPS in production', () => {
      process.env.NODE_ENV = 'production';

      const httpEndpoint = {
        chainId: '1',
        chainType: 'evm' as const,
        urls: ['http://rpc.example.com'],
      };
      expect(() => dAppRpcEndpointSchema.parse(httpEndpoint)).toThrow('Production URLs must use HTTPS');

      const httpsEndpoint = {
        chainId: '1',
        chainType: 'evm' as const,
        urls: ['https://rpc.example.com'],
      };
      expect(() => dAppRpcEndpointSchema.parse(httpsEndpoint)).not.toThrow();
    });

    it('should allow HTTP in development', () => {
      process.env.NODE_ENV = 'development';

      const endpoint = {
        chainId: '1',
        chainType: 'evm' as const,
        urls: ['http://localhost:8545'],
      };
      expect(() => dAppRpcEndpointSchema.parse(endpoint)).not.toThrow();
    });
  });

  describe('webSocketConfigSchema', () => {
    it('should validate minimal WebSocket config', () => {
      expect(() => webSocketConfigSchema.parse({})).not.toThrow();
    });

    it('should validate complete WebSocket config', () => {
      const config = {
        url: 'wss://wallet.example.com/connect',
        timeout: 30000,
        reconnect: true,
        reconnectInterval: 5000,
        maxReconnectAttempts: 10,
        pingInterval: 30000,
        pongTimeout: 5000,
        protocols: ['v1', 'v2'],
        binaryType: 'arraybuffer' as const,
      };
      expect(() => webSocketConfigSchema.parse(config)).not.toThrow();
    });

    it('should validate reconnect attempts range', () => {
      expect(() => webSocketConfigSchema.parse({ maxReconnectAttempts: -1 })).toThrow();
      expect(() => webSocketConfigSchema.parse({ maxReconnectAttempts: 101 })).toThrow();
      expect(() => webSocketConfigSchema.parse({ maxReconnectAttempts: 10 })).not.toThrow();
    });

    it('should validate binary type', () => {
      expect(() => webSocketConfigSchema.parse({ binaryType: 'blob' })).not.toThrow();
      expect(() => webSocketConfigSchema.parse({ binaryType: 'arraybuffer' })).not.toThrow();
      expect(() => webSocketConfigSchema.parse({ binaryType: 'invalid' })).toThrow();
    });
  });

  describe('iframeConfigSchema', () => {
    it('should validate minimal iframe config', () => {
      expect(() => iframeConfigSchema.parse({})).not.toThrow();
    });

    it('should validate complete iframe config', () => {
      const config = {
        url: 'https://wallet.example.com/embed',
        width: '100%',
        height: 600,
        sandbox: 'allow-scripts allow-same-origin',
        allowedOrigins: ['https://wallet.example.com'],
        allowFullscreen: true,
        style: {
          border: 'none',
          borderRadius: '8px',
        },
      };
      expect(() => iframeConfigSchema.parse(config)).not.toThrow();
    });

    it('should accept numeric or string dimensions', () => {
      expect(() => iframeConfigSchema.parse({ width: 400 })).not.toThrow();
      expect(() => iframeConfigSchema.parse({ width: '100%' })).not.toThrow();
      expect(() => iframeConfigSchema.parse({ height: 600 })).not.toThrow();
      expect(() => iframeConfigSchema.parse({ height: '50vh' })).not.toThrow();
    });

    it('should validate allowed origins', () => {
      const config = {
        allowedOrigins: ['not-a-url', 'also-not-a-url'],
      };
      expect(() => iframeConfigSchema.parse(config)).toThrow();
    });
  });

  describe('extendedTransportConfigSchema', () => {
    it('should validate all transport types', () => {
      const transports = [
        {
          type: 'popup' as const,
          config: { width: 400, height: 600 },
        },
        {
          type: 'chrome-extension' as const,
          config: { extensionId: 'test123' },
        },
        {
          type: 'websocket' as const,
          config: { url: 'wss://example.com' },
        },
        {
          type: 'iframe' as const,
          config: { url: 'https://example.com' },
        },
      ];

      for (const transport of transports) {
        expect(() => extendedTransportConfigSchema.parse(transport)).not.toThrow();
      }
    });

    it('should reject invalid transport type', () => {
      const transport = {
        type: 'invalid',
        config: {},
      };
      expect(() => extendedTransportConfigSchema.parse(transport)).toThrow();
    });
  });
});
