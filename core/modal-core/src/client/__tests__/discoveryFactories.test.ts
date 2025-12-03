/**
 * Unit tests for discovery factory functions
 */

import { describe, expect, it } from 'vitest';
import { ChainType } from '../../types.js';
import {
  createCustomDiscoveryConfig,
  createEVMDiscoveryConfig,
  createMultiChainDiscoveryConfig,
  createSolanaDiscoveryConfig,
} from '../index.js';

describe('Discovery Factory Functions', () => {
  describe('createEVMDiscoveryConfig', () => {
    it('should create basic EVM discovery config', () => {
      const config = createEVMDiscoveryConfig();

      expect(config).toMatchObject({
        enabled: true,
        supportedChainTypes: [ChainType.Evm],
        capabilities: {
          chains: expect.arrayContaining([
            'eip155:1', // Ethereum mainnet
            'eip155:137', // Polygon
            'eip155:42161', // Arbitrum
          ]),
        },
      });
    });

    it('should merge with custom options', () => {
      const config = createEVMDiscoveryConfig({
        timeout: 10000,
        maxAttempts: 5,
        dappInfo: {
          name: 'My EVM DApp',
          url: 'https://myapp.com',
        },
      });

      expect(config).toMatchObject({
        enabled: true,
        timeout: 10000,
        maxAttempts: 5,
        supportedChainTypes: [ChainType.Evm],
        dappInfo: {
          name: 'My EVM DApp',
          url: 'https://myapp.com',
        },
      });
    });

    it('should merge custom chains with defaults', () => {
      const config = createEVMDiscoveryConfig({
        capabilities: {
          chains: ['eip155:56'], // BSC
          features: ['sign_message'],
        },
      });

      expect(config.capabilities?.chains).toContain('eip155:1'); // Default
      expect(config.capabilities?.chains).toContain('eip155:56'); // Custom
      expect(config.capabilities?.features).toEqual(['sign_message']);
    });
  });

  describe('createSolanaDiscoveryConfig', () => {
    it('should create basic Solana discovery config', () => {
      const config = createSolanaDiscoveryConfig();

      expect(config).toMatchObject({
        enabled: true,
        supportedChainTypes: [ChainType.Solana],
        capabilities: {
          chains: [
            'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp', // mainnet
            'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z', // testnet
            'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1', // devnet
          ],
        },
      });
    });

    it('should include security configuration by default', () => {
      const config = createSolanaDiscoveryConfig();

      expect(config.security).toMatchObject({
        enableOriginValidation: true,
        enableRateLimiting: true,
      });
    });

    it('should allow disabling security features', () => {
      const config = createSolanaDiscoveryConfig({
        security: {
          enableOriginValidation: false,
          enableRateLimiting: false,
        },
      });

      expect(config.security).toMatchObject({
        enableOriginValidation: false,
        enableRateLimiting: false,
      });
    });
  });

  describe('createMultiChainDiscoveryConfig', () => {
    it('should create config for multiple chain types', () => {
      const config = createMultiChainDiscoveryConfig([ChainType.Evm, ChainType.Solana, ChainType.Aztec]);

      expect(config).toMatchObject({
        enabled: true,
        supportedChainTypes: [ChainType.Evm, ChainType.Solana, ChainType.Aztec],
        capabilities: {
          chains: expect.arrayContaining([
            'eip155:1', // EVM
            'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp', // Solana
            'aztec:mainnet', // Aztec
          ]),
        },
      });
    });

    it('should handle empty chain types array', () => {
      const config = createMultiChainDiscoveryConfig([]);

      expect(config).toMatchObject({
        enabled: true,
        supportedChainTypes: [],
        capabilities: {
          chains: [],
        },
      });
    });

    it('should merge with custom options', () => {
      const config = createMultiChainDiscoveryConfig([ChainType.Evm], {
        retryInterval: 5000,
        announce: true,
        endpoints: ['https://custom.discovery.com'],
      });

      expect(config).toMatchObject({
        enabled: true,
        retryInterval: 5000,
        announce: true,
        endpoints: ['https://custom.discovery.com'],
        supportedChainTypes: [ChainType.Evm],
      });
    });
  });

  describe('createCustomDiscoveryConfig', () => {
    it('should create config with custom requirements', () => {
      const requirements = {
        chains: ['eip155:1', 'cosmos:cosmoshub-4'],
        features: ['sign_message', 'send_transaction'],
        interfaces: ['eip1193', 'cosmos-wallet'],
      };

      const config = createCustomDiscoveryConfig(requirements);

      expect(config).toMatchObject({
        enabled: true,
        capabilities: requirements,
      });
    });

    it('should normalize chain IDs in requirements', () => {
      const requirements = {
        chains: ['ethereum', '0x89', 'polygon'], // Should be normalized
      };

      const config = createCustomDiscoveryConfig(requirements);

      expect(config.capabilities?.chains).toContain('eip155:1'); // ethereum
      expect(config.capabilities?.chains).toContain('eip155:137'); // 0x89 and polygon (deduped)
      expect(config.capabilities?.chains).toHaveLength(2); // Duplicates removed
    });

    it('should merge with custom options', () => {
      const requirements = {
        chains: ['eip155:1'],
        features: ['events'],
      };

      const config = createCustomDiscoveryConfig(requirements, {
        timeout: 15000,
        security: {
          enableSessionSecurity: true,
          sessionSecurity: {
            bindToOrigin: true,
            sessionTimeout: 3600000,
          },
        },
      });

      expect(config).toMatchObject({
        enabled: true,
        timeout: 15000,
        capabilities: requirements,
        security: {
          enableSessionSecurity: true,
          sessionSecurity: {
            bindToOrigin: true,
            sessionTimeout: 3600000,
          },
        },
      });
    });

    it('should handle empty requirements', () => {
      const config = createCustomDiscoveryConfig({});

      expect(config).toMatchObject({
        enabled: true,
        capabilities: {},
      });
    });
  });

  describe('Factory Function Security Defaults', () => {
    it('should include reasonable security defaults in EVM config', () => {
      const config = createEVMDiscoveryConfig();

      expect(config.security).toBeDefined();
      expect(config.security?.enableOriginValidation).toBe(true);
      expect(config.security?.enableRateLimiting).toBe(true);
    });

    it('should include security defaults in Solana config', () => {
      const config = createSolanaDiscoveryConfig();

      expect(config.security).toBeDefined();
      expect(config.security?.enableOriginValidation).toBe(true);
      expect(config.security?.enableRateLimiting).toBe(true);
    });

    it('should include security defaults in multi-chain config', () => {
      const config = createMultiChainDiscoveryConfig([ChainType.Evm]);

      expect(config.security).toBeDefined();
      expect(config.security?.enableOriginValidation).toBe(true);
      expect(config.security?.enableRateLimiting).toBe(true);
    });

    it('should not override custom security settings', () => {
      const config = createEVMDiscoveryConfig({
        security: {
          enableOriginValidation: false,
          enableSessionSecurity: true,
          sessionSecurity: {
            enableRecovery: true,
          },
        },
      });

      expect(config.security).toMatchObject({
        enableOriginValidation: false,
        enableRateLimiting: true, // Default preserved
        enableSessionSecurity: true,
        sessionSecurity: {
          enableRecovery: true,
        },
      });
    });
  });
});
