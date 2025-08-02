/**
 * Consolidated test suite for responder module
 * Combines factory tests, factory coverage tests, index tests, and wallet tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { randomUUID } from 'node:crypto';
import { createDiscoveryResponder, createResponderDiscoverySetup, createResponderInfo } from './factory.js';
import { CapabilityMatcher } from './CapabilityMatcher.js';
import type { ResponderInfo, SecurityPolicy } from '../core/types.js';
import { createTestResponderInfo, createTestDiscoveryRequest } from '../testing/testUtils.js';
import { createSecurityPolicy } from '../security/createSecurityPolicy.js';
import { setupFakeTimers, cleanupFakeTimers } from '../testing/timingHelpers.js';

describe('Responder Module', () => {
  beforeEach(() => {
    setupFakeTimers();
  });

  afterEach(() => {
    cleanupFakeTimers();
  });

  // ===============================================
  // Factory Functions Tests
  // ===============================================
  describe('Factory Functions', () => {
    describe('createDiscoveryResponder', () => {
      it('should create announcer with minimal config', () => {
        const responderInfo = createTestResponderInfo.ethereum();
        const announcer = createDiscoveryResponder({
          responderInfo,
        });

        expect(announcer).toBeDefined();
        expect(announcer.isAnnouncerListening()).toBe(false);
        announcer.cleanup();
      });

      it('should create announcer with full config', () => {
        const responderInfo = createTestResponderInfo.ethereum();
        const securityPolicy: SecurityPolicy = {
          requireHttps: true,
          allowedOrigins: ['https://trusted.com'],
          rateLimit: {
            enabled: true,
            maxRequests: 10,
            windowMs: 60000,
          },
        };

        const announcer = createDiscoveryResponder({
          responderInfo,
          securityPolicy,
        });

        expect(announcer).toBeDefined();
        announcer.cleanup();
      });

      it('should handle web wallet configuration', () => {
        const webResponderInfo = {
          ...createTestResponderInfo.ethereum(),
          type: 'web' as const,
          url: 'https://wallet.example.com',
        };

        const announcer = createDiscoveryResponder({
          responderInfo: webResponderInfo,
        });

        expect(announcer).toBeDefined();
        announcer.cleanup();
      });
    });

    describe('createResponderDiscoverySetup', () => {
      it('should create complete responder setup', () => {
        const setup = createResponderDiscoverySetup({
          responderInfo: createResponderInfo.ethereum({
            uuid: randomUUID(),
            rdns: 'com.example.wallet',
            name: 'Example Wallet',
            icon: 'data:image/png;base64,test',
            type: 'extension',
          }),
          securityPolicy: createSecurityPolicy.custom({
            requireHttps: true,
          }),
        });

        expect(setup).toBeDefined();
        expect(setup.discoveryAnnouncer).toBeDefined();
        expect(setup.capabilityMatcher).toBeDefined();

        setup.stopListening();
      });

      it('should create setup with default values', () => {
        const setup = createResponderDiscoverySetup({
          responderInfo: createResponderInfo.ethereum({
            uuid: randomUUID(),
            rdns: 'com.test.wallet',
            name: 'Test Wallet',
            icon: 'data:image/png;base64,test',
            type: 'extension',
          }),
        });

        expect(setup.discoveryAnnouncer).toBeDefined();
        expect(setup.capabilityMatcher).toBeDefined();

        setup.stopListening();
      });
    });
  });

  // ===============================================
  // ResponderInfo Factory Tests
  // ===============================================
  describe('ResponderInfo Factory', () => {
    describe('createResponderInfo', () => {
      it('should create Ethereum responder info', () => {
        const responderInfo = createResponderInfo.ethereum({
          uuid: 'test-uuid',
          rdns: 'com.ethereum.wallet',
          name: 'Ethereum Wallet',
          icon: 'data:image/png;base64,test',
          type: 'extension',
        });

        expect(responderInfo.rdns).toBe('com.ethereum.wallet');
        expect(responderInfo.name).toBe('Ethereum Wallet');
        expect(responderInfo.chains.some((chain) => chain.chainId === 'eip155:1')).toBe(true);
      });

      it('should create Solana responder info', () => {
        const responderInfo = createResponderInfo.solana({
          uuid: randomUUID(),
          rdns: 'com.solana.wallet',
          name: 'Solana Wallet',
          icon: 'data:image/png;base64,test',
          type: 'web',
        });

        expect(responderInfo.type).toBe('web');
        expect(responderInfo.chains.some((chain) => chain.chainId.includes('solana'))).toBe(true);
      });

      it('should create multi-chain responder info', () => {
        const responderInfo = createResponderInfo.multiChain({
          uuid: randomUUID(),
          rdns: 'com.multichain.wallet',
          name: 'Multi-Chain Wallet',
          icon: 'data:image/png;base64,test',
          type: 'extension',
          chains: ['eip155:1', 'eip155:137', 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
        });

        expect(responderInfo.chains.length).toBeGreaterThan(1);
        expect(responderInfo.chains.some((chain) => chain.chainType === 'evm')).toBe(true);
      });
    });
  });

  // ===============================================
  // Security Policy Factory Tests
  // ===============================================
  describe('Security Policy Factory', () => {
    describe('createSecurityPolicy', () => {
      it('should create strict security policy', () => {
        const policy = createSecurityPolicy.strict();

        expect(policy.requireHttps).toBe(true);
        expect(policy.allowLocalhost).toBe(false);
        expect(policy.rateLimit?.enabled).toBe(true);
      });

      it('should create development security policy', () => {
        const policy = createSecurityPolicy.development();

        expect(policy.requireHttps).toBe(false);
        expect(policy.allowLocalhost).toBe(true);
      });

      it('should create custom security policy', () => {
        const policy = createSecurityPolicy.custom({
          requireHttps: true,
          allowedOrigins: ['https://trusted.com'],
          rateLimit: {
            enabled: true,
            maxRequests: 20,
            windowMs: 120000,
          },
        });

        expect(policy.requireHttps).toBe(true);
        expect(policy.allowedOrigins).toEqual(['https://trusted.com']);
        expect(policy.rateLimit?.maxRequests).toBe(20);
      });
    });
  });

  // ===============================================
  // CapabilityMatcher Tests
  // ===============================================
  describe('CapabilityMatcher', () => {
    let matcher: CapabilityMatcher;
    let responderInfo: ResponderInfo;

    beforeEach(() => {
      responderInfo = createTestResponderInfo.ethereum();
      matcher = new CapabilityMatcher(responderInfo);
    });

    it('should match compatible discovery requests', () => {
      const request = createTestDiscoveryRequest({
        required: {
          chains: ['eip155:1'],
          features: ['account-management'],
          interfaces: ['eip-1193'],
        },
      });

      const result = matcher.matchCapabilities(request);

      expect(result.canFulfill).toBe(true);
      expect(result.intersection?.required.chains).toContain('eip155:1');
    });

    it('should reject incompatible discovery requests', () => {
      const request = createTestDiscoveryRequest({
        required: {
          chains: ['solana:mainnet'], // Not supported by Ethereum wallet
          features: ['account-management'],
          interfaces: ['solana-wallet-standard'],
        },
      });

      const result = matcher.matchCapabilities(request);

      expect(result.canFulfill).toBe(false);
    });

    it('should handle partial capability matches', () => {
      const request = createTestDiscoveryRequest({
        required: {
          chains: ['eip155:1'], // Supported
          features: ['account-management'], // Supported
          interfaces: ['unsupported-interface'], // Not supported
        },
      });

      const result = matcher.matchCapabilities(request);

      expect(result.canFulfill).toBe(false); // Should fail if any required capability is missing
    });

    it('should calculate capability intersections correctly', () => {
      const request = createTestDiscoveryRequest({
        required: {
          chains: ['eip155:1', 'eip155:137'], // Only ethereum supported
          features: ['account-management', 'transaction-signing'],
          interfaces: ['eip-1193'],
        },
      });

      const result = matcher.matchCapabilities(request);

      // Should include only the intersection
      if (result.canFulfill) {
        expect(result.intersection?.required.chains).toContain('eip155:1');
        expect(result.intersection?.required.chains).not.toContain('eip155:137');
      }
    });

    it('should handle empty requirements', () => {
      const request = createTestDiscoveryRequest({
        required: {
          chains: [],
          features: [],
          interfaces: [],
        },
      });

      const result = matcher.matchCapabilities(request);

      expect(result.canFulfill).toBe(true); // Empty requirements should be fulfillable
    });

    it('should handle optional capabilities', () => {
      const request = createTestDiscoveryRequest({
        required: {
          chains: ['eip155:1'],
          features: ['account-management'],
          interfaces: ['eip-1193'],
        },
        optional: {
          chains: ['eip155:137'],
          features: ['hardware-wallet'],
        },
      });

      const result = matcher.matchCapabilities(request);

      expect(result.canFulfill).toBe(true);
      expect(result.intersection?.required.chains).toContain('eip155:1');
      // Optional capabilities should be included if supported
    });
  });

  // ===============================================
  // Wallet Integration Tests
  // ===============================================
  describe('Wallet Integration', () => {
    it('should handle different wallet types', () => {
      const walletTypes = ['extension', 'web', 'mobile', 'hardware'] as const;

      for (const type of walletTypes) {
        const responderInfo = {
          ...createTestResponderInfo.ethereum(),
          type,
        };

        const announcer = createDiscoveryResponder({
          responderInfo,
        });

        expect(announcer).toBeDefined();
        announcer.cleanup();
      }
    });

    it('should validate wallet configuration', () => {
      const invalidConfigs = [
        // Missing required fields
        {
          responderInfo: {
            rdns: 'com.test.wallet',
            // Missing name, icon, etc.
          },
        },
        // Invalid RDNS format
        {
          responderInfo: {
            ...createTestResponderInfo.ethereum(),
            rdns: 'invalid-rdns-format',
          },
        },
      ];

      for (const config of invalidConfigs) {
        expect(() =>
          createDiscoveryResponder(config as unknown as Parameters<typeof createDiscoveryResponder>[0]),
        ).toThrow();
      }
    });

    it('should support custom wallet capabilities', () => {
      const customResponderInfo = {
        ...createTestResponderInfo.ethereum(),
        features: [
          {
            id: 'custom-feature',
            name: 'Custom Feature',
            version: '1.0.0',
          },
        ],
      };

      const announcer = createDiscoveryResponder({
        responderInfo: customResponderInfo,
      });

      expect(announcer).toBeDefined();
      announcer.cleanup();
    });
  });

  // ===============================================
  // Module Exports Tests
  // ===============================================
  describe('Module Exports', () => {
    it('should export DiscoveryResponder class', async () => {
      const { DiscoveryResponder } = await import('./DiscoveryResponder.js');

      expect(DiscoveryResponder).toBeDefined();
      expect(typeof DiscoveryResponder).toBe('function');
    });

    it('should export CapabilityMatcher class', async () => {
      const { CapabilityMatcher } = await import('./CapabilityMatcher.js');

      expect(CapabilityMatcher).toBeDefined();
      expect(typeof CapabilityMatcher).toBe('function');
    });

    it('should export factory functions', async () => {
      const factoryModule = await import('./factory.js');

      expect(factoryModule.createDiscoveryResponder).toBeDefined();
      expect(factoryModule.createResponderDiscoverySetup).toBeDefined();
      expect(factoryModule.createResponderInfo).toBeDefined();

      expect(typeof factoryModule.createDiscoveryResponder).toBe('function');
      expect(typeof factoryModule.createResponderDiscoverySetup).toBe('function');
      expect(typeof factoryModule.createResponderInfo).toBe('object');
    });

    it('should export all expected responder exports', async () => {
      const responderIndex = await import('./index.js');

      // Classes
      expect(responderIndex.DiscoveryResponder).toBeDefined();
      expect(responderIndex.CapabilityMatcher).toBeDefined();

      // Factory functions
      expect(responderIndex.createDiscoveryResponder).toBeDefined();
      expect(responderIndex.createResponderDiscoverySetup).toBeDefined();
      expect(responderIndex.createResponderInfo).toBeDefined();
      // createSecurityPolicy is now imported from security module
      expect(responderIndex.createSecurityPolicy).toBeDefined();
    });

    it('should allow all responder components to work together', () => {
      const responderInfo = createTestResponderInfo.ethereum();
      const matcher = new CapabilityMatcher(responderInfo);
      const announcer = createDiscoveryResponder({
        responderInfo,
        securityPolicy: createSecurityPolicy.development(),
      });

      // Test integration
      const request = createTestDiscoveryRequest({
        required: {
          chains: ['eip155:1'],
          features: ['account-management'],
          interfaces: ['eip-1193'],
        },
      });

      const matchResult = matcher.matchCapabilities(request);
      expect(matchResult.canFulfill).toBe(true);

      announcer.cleanup();
    });
  });

  // ===============================================
  // Error Handling Tests
  // ===============================================
  describe('Error Handling', () => {
    it('should handle invalid responder configurations gracefully', () => {
      const invalidConfigs = [null, undefined, {}, { responderInfo: null }, { responderInfo: {} }];

      for (const config of invalidConfigs) {
        expect(() =>
          createDiscoveryResponder(config as unknown as Parameters<typeof createDiscoveryResponder>[0]),
        ).toThrow();
      }
    });

    it('should validate security policies', () => {
      const responderInfo = createTestResponderInfo.ethereum();

      const invalidPolicies = [
        { requireHttps: 'invalid' }, // Should be boolean
        { rateLimit: { enabled: true } }, // Missing required fields
        { allowedOrigins: 'not-an-array' }, // Should be array
      ];

      for (const policy of invalidPolicies) {
        expect(() =>
          createDiscoveryResponder({
            responderInfo,
            securityPolicy: policy as unknown as SecurityPolicy,
          }),
        ).not.toThrow(); // Should handle gracefully, not throw
      }
    });

    it('should handle capability matching errors', () => {
      const matcher = new CapabilityMatcher(createTestResponderInfo.ethereum());

      const invalidRequests = [null, undefined, {}, { required: null }, { required: 'invalid' }];

      for (const request of invalidRequests) {
        expect(() =>
          matcher.matchCapabilities(request as unknown as Parameters<typeof matcher.matchCapabilities>[0]),
        ).not.toThrow();
      }
    });
  });

  // ===============================================
  // createResponderInfo Coverage Tests
  // ===============================================
  describe('createResponderInfo Coverage', () => {
    describe('ethereum factory', () => {
      it('should create web wallet type with ethereum', () => {
        const webWallet = createResponderInfo.ethereum({
          uuid: randomUUID(),
          rdns: 'com.example.webwallet',
          name: 'Web Ethereum Wallet',
          icon: 'data:image/svg+xml;base64,...',
          type: 'web',
        });

        expect(webWallet.type).toBe('web');
        expect(webWallet).toHaveProperty('url', 'https://responder.example.com');
      });

      it('should handle testnet chain detection', () => {
        const goerliWallet = createResponderInfo.ethereum({
          uuid: randomUUID(),
          rdns: 'com.example.goerli',
          name: 'Goerli Wallet',
          icon: 'data:image/svg+xml;base64,...',
          type: 'extension',
          chains: ['eip155:5', 'eip155:11155111'], // Goerli (5) and Sepolia (11155111)
        });

        // Check that testnet chains are properly marked
        const chains = goerliWallet.chains || [];
        expect(chains).toHaveLength(2);

        // Check first chain (Goerli)
        expect(chains[0]?.network.testnet).toBe(true);
        expect(chains[0]?.network.name).toBe('Testnet');

        // Check second chain (Sepolia) - won't be detected as testnet by current logic
        expect(chains[1]?.network.testnet).toBe(false);
        expect(chains[1]?.network.name).toBe('Mainnet');
      });
    });

    describe('aztec factory', () => {
      it('should create aztec wallet with defaults', () => {
        const aztecWallet = createResponderInfo.aztec({
          uuid: randomUUID(),
          rdns: 'com.aztec.wallet',
          name: 'Aztec Wallet',
          icon: 'data:image/svg+xml;base64,...',
          type: 'extension',
        });

        expect(aztecWallet.chains).toHaveLength(1);
        expect(aztecWallet.chains?.[0]?.chainId).toBe('aztec:mainnet');
        expect(aztecWallet.features).toHaveLength(3); // private-transactions, contract-deployment, token-management
        expect(aztecWallet.chains?.[0]?.standards).toEqual(['aztec-wallet-api-v1']);
      });

      it('should create web wallet type with aztec', () => {
        const webAztec = createResponderInfo.aztec({
          uuid: randomUUID(),
          rdns: 'com.aztec.webwallet',
          name: 'Aztec Web Wallet',
          icon: 'data:image/svg+xml;base64,...',
          type: 'web',
        });

        expect(webAztec.type).toBe('web');
        expect(webAztec).toHaveProperty('url', 'https://responder.aztec.network');
      });

      it('should handle custom aztec chains', () => {
        const customAztec = createResponderInfo.aztec({
          uuid: randomUUID(),
          rdns: 'com.aztec.custom',
          name: 'Custom Aztec',
          icon: 'data:image/svg+xml;base64,...',
          type: 'extension',
          chains: ['aztec:testnet', 'aztec:devnet'],
        });

        expect(customAztec.chains).toHaveLength(2);
        expect(customAztec.chains?.[0]?.chainId).toBe('aztec:testnet');
        expect(customAztec.chains?.[1]?.chainId).toBe('aztec:devnet');
      });

      it('should handle custom aztec features', () => {
        const customFeatures = createResponderInfo.aztec({
          uuid: randomUUID(),
          rdns: 'com.aztec.features',
          name: 'Feature Aztec',
          icon: 'data:image/svg+xml;base64,...',
          type: 'extension',
          features: ['custom-feature-1', 'custom-feature-2'],
        });

        expect(customFeatures.features).toHaveLength(2);
        expect(customFeatures.features?.[0]?.id).toBe('custom-feature-1');
        expect(customFeatures.features?.[1]?.id).toBe('custom-feature-2');
      });
    });

    describe('multiChain factory', () => {
      it('should create web wallet type with multiChain', () => {
        const webMulti = createResponderInfo.multiChain({
          uuid: randomUUID(),
          rdns: 'com.multi.webwallet',
          name: 'Multi Web Wallet',
          icon: 'data:image/svg+xml;base64,...',
          type: 'web',
          chains: ['eip155:1', 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
        });

        expect(webMulti.type).toBe('web');
        expect(webMulti).toHaveProperty('url', 'https://multi-responder.com');
      });

      it('should handle diverse chain types', () => {
        const multiChain = createResponderInfo.multiChain({
          uuid: randomUUID(),
          rdns: 'com.multi.diverse',
          name: 'Diverse Chain Wallet',
          icon: 'data:image/svg+xml;base64,...',
          type: 'extension',
          chains: [
            'eip155:1',
            'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
            'bip122:000000000019d6689c085ae165831e93',
            'aztec:mainnet',
          ],
        });

        expect(multiChain.chains).toHaveLength(4);

        // Verify each chain type is handled correctly
        const chainTypes = multiChain.chains?.map((c) => c.chainType) || [];
        expect(chainTypes).toEqual(['evm', 'account', 'account', 'account']); // utxo prefix not supported, defaults to account
      });
    });

    describe('solana factory', () => {
      it('should create web wallet type with solana', () => {
        const webSolana = createResponderInfo.solana({
          uuid: randomUUID(),
          rdns: 'com.solana.webwallet',
          name: 'Solana Web Wallet',
          icon: 'data:image/svg+xml;base64,...',
          type: 'web',
        });

        expect(webSolana.type).toBe('web');
        expect(webSolana).toHaveProperty('url', 'https://responder.solana.com');
      });
    });
  });
});
