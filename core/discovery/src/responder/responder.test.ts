/**
 * Consolidated test suite for responder module
 * Combines factory tests, factory coverage tests, index tests, and wallet tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { randomUUID } from 'node:crypto';
import { createResponderDiscoverySetup, createResponderInfo, createDiscoveryResponder } from './factory.js';
import { DiscoveryResponder } from './DiscoveryResponder.js';
import { CapabilityMatcher } from './CapabilityMatcher.js';
import type { ResponderInfo } from '../types/capabilities.js';
import type { SecurityPolicy } from '../types/security.js';
import { createTestResponderInfo, createTestDiscoveryRequest } from '../testing/testUtils.js';
import { createSecurityPolicy } from '../security.js';
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
    describe('DiscoveryResponder constructor', () => {
      it('should create announcer with minimal config', () => {
        const responderInfo = createTestResponderInfo.ethereum();
        const announcer = new DiscoveryResponder({ responderInfo });

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

        const announcer = new DiscoveryResponder({ responderInfo, securityPolicy });

        expect(announcer).toBeDefined();
        announcer.cleanup();
      });

      it('should handle web wallet configuration', () => {
        const webResponderInfo = {
          ...createTestResponderInfo.ethereum(),
          type: 'web' as const,
          url: 'https://wallet.example.com',
        };

        const announcer = new DiscoveryResponder({ responderInfo: webResponderInfo });

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
          securityPolicy: createSecurityPolicy({
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
        expect(responderInfo.technologies.some((tech) => tech.type === 'evm')).toBe(true);
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
        expect(responderInfo.technologies.some((tech) => tech.type === 'solana')).toBe(true);
      });

      it('should create multi-chain responder info', () => {
        const responderInfo = createResponderInfo.multiChain({
          uuid: randomUUID(),
          rdns: 'com.multichain.wallet',
          name: 'Multi-Chain Wallet',
          icon: 'data:image/png;base64,test',
          type: 'extension',
        });

        expect(responderInfo.technologies.length).toBeGreaterThan(0);
        expect(responderInfo.technologies.some((tech) => tech.type === 'evm')).toBe(true);
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
        const policy = createSecurityPolicy({
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
          technologies: [
            {
              type: 'evm' as const,
              interfaces: ['eip-1193'],
            },
          ],
          features: ['account-management'],
        },
      });

      const result = matcher.matchCapabilities(request);

      expect(result.canFulfill).toBe(true);
      expect(result.intersection?.required.technologies).toBeDefined();
    });

    it('should reject incompatible discovery requests', () => {
      const request = createTestDiscoveryRequest({
        required: {
          technologies: [
            {
              type: 'solana' as const,
              interfaces: ['solana-wallet-standard'],
            },
          ], // Not supported by Ethereum wallet
          features: ['account-management'],
        },
      });

      const result = matcher.matchCapabilities(request);

      expect(result.canFulfill).toBe(false);
    });

    it('should handle partial capability matches', () => {
      const request = createTestDiscoveryRequest({
        required: {
          technologies: [
            {
              type: 'evm' as const,
              interfaces: ['unsupported-interface'], // Not supported
            },
          ], // Supported
          features: ['account-management'], // Supported
        },
      });

      const result = matcher.matchCapabilities(request);

      expect(result.canFulfill).toBe(false); // Should fail if any required capability is missing
    });

    it('should calculate capability intersections correctly', () => {
      const request = createTestDiscoveryRequest({
        required: {
          technologies: [
            {
              type: 'evm' as const,
              interfaces: ['eip-1193'],
            },
          ], // Only ethereum supported
          features: ['account-management', 'transaction-signing'],
        },
      });

      const result = matcher.matchCapabilities(request);

      // Should include only the intersection
      if (result.canFulfill) {
        expect(result.intersection?.required.technologies).toBeDefined();
      }
    });

    it('should handle empty requirements', () => {
      const request = createTestDiscoveryRequest({
        required: {
          technologies: [],
          features: [],
        },
      });

      const result = matcher.matchCapabilities(request);

      expect(result.canFulfill).toBe(true); // Empty requirements should be fulfillable
    });

    it('should handle optional capabilities', () => {
      const request = createTestDiscoveryRequest({
        required: {
          technologies: [
            {
              type: 'evm' as const,
              interfaces: ['eip-1193'],
            },
          ],
          features: ['account-management'],
        },
        optional: {
          features: ['hardware-wallet'],
        },
      });

      const result = matcher.matchCapabilities(request);

      expect(result.canFulfill).toBe(true);
      expect(result.intersection?.required.technologies).toBeDefined();
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

        const announcer = new DiscoveryResponder({ responderInfo });

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
        expect(
          () =>
            // @ts-expect-error - Testing invalid input
            new DiscoveryResponder(config),
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

      const announcer = new DiscoveryResponder({ responderInfo: customResponderInfo });

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

      // createDiscoveryResponder is deprecated and no longer exported
      expect(factoryModule.createResponderDiscoverySetup).toBeDefined();
      expect(factoryModule.createResponderInfo).toBeDefined();

      expect(typeof factoryModule.createResponderDiscoverySetup).toBe('function');
      expect(typeof factoryModule.createResponderInfo).toBe('object');
    });

    it('should export all expected responder exports', async () => {
      const responderIndex = await import('./index.js');

      // Classes
      expect(responderIndex.DiscoveryResponder).toBeDefined();
      expect(responderIndex.CapabilityMatcher).toBeDefined();

      // Factory functions (createDiscoveryResponder is deprecated and no longer exported)
      expect(responderIndex.createResponderDiscoverySetup).toBeDefined();
      expect(responderIndex.createResponderInfo).toBeDefined();
      // createSecurityPolicy is now imported from security module
      expect(responderIndex.createSecurityPolicy).toBeDefined();
    });

    it('should allow all responder components to work together', () => {
      const responderInfo = createTestResponderInfo.ethereum();
      const matcher = new CapabilityMatcher(responderInfo);
      const announcer = new DiscoveryResponder({
        responderInfo,
        securityPolicy: createSecurityPolicy.development(),
      });

      // Test integration
      const request = createTestDiscoveryRequest({
        required: {
          technologies: [
            {
              type: 'evm' as const,
              interfaces: ['eip-1193'],
            },
          ],
          features: ['account-management'],
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
        expect(
          () =>
            // @ts-expect-error - Testing invalid input
            new DiscoveryResponder(config),
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

      it('should handle custom chain configuration', () => {
        const customWallet = createResponderInfo.ethereum({
          uuid: randomUUID(),
          rdns: 'com.example.custom',
          name: 'Custom Wallet',
          icon: 'data:image/svg+xml;base64,...',
          type: 'extension',
        });

        // Check that the wallet was created successfully with custom chains
        expect(customWallet.name).toBe('Custom Wallet');
        expect(customWallet.type).toBe('extension');
        const evmTech = customWallet.technologies.find((tech) => tech.type === 'evm');
        expect(evmTech).toBeDefined();
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

        const aztecTech = aztecWallet.technologies.find((tech) => tech.type === 'aztec');
        expect(aztecTech?.interfaces).toHaveLength(1);
        expect(aztecWallet.features).toHaveLength(3); // private-transactions, contract-deployment, token-management
        expect(aztecTech?.interfaces).toContain('aztec-wallet-api-v1');
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
        });

        const customAztecTech = customAztec.technologies.find((tech) => tech.type === 'aztec');
        expect(customAztecTech?.interfaces).toHaveLength(1);
        expect(customAztecTech?.interfaces).toContain('aztec-wallet-api-v1');
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
        });

        expect(multiChain.technologies.length).toBeGreaterThan(0);

        // Verify each technology type is handled correctly
        const techTypes = multiChain.technologies.map((t) => t.type);
        expect(techTypes).toContain('evm');
        expect(techTypes).toContain('solana');
        expect(techTypes).toContain('aztec');
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
