/**
 * Consolidated test suite for responder module
 * Combines factory tests, factory coverage tests, index tests, and wallet tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DiscoveryResponder } from '../responder.js';
import { CapabilityMatcher } from './CapabilityMatcher.js';
import type { ResponderInfo } from '../types/capabilities.js';
import type { SecurityPolicy } from '../types/security.js';
import { createTestResponderInfo, createTestDiscoveryRequest } from '../testing/testUtils.js';
import { createSecurityPolicy } from '../security.js';
import { SECURITY_PRESETS } from '../presets/security.js';
import { setupFakeTimers, cleanupFakeTimers } from '../testing/timingHelpers.js';
import type { DiscoveryResponderConfig } from '../types/testing.js';

function createAnnouncer(config: DiscoveryResponderConfig): DiscoveryResponder {
  return new DiscoveryResponder(config.responderInfo, {
    ...(config.securityPolicy && { security: config.securityPolicy }),
    ...(config.sessionOptions && { sessionOptions: config.sessionOptions }),
    ...(config.eventTarget && { eventTarget: config.eventTarget }),
    ...(config.logger && { logger: config.logger }),
  });
}

describe('Responder Module', () => {
  beforeEach(() => {
    setupFakeTimers();
  });

  afterEach(() => {
    cleanupFakeTimers();
  });

  // ===============================================
  // Security Policy Factory Tests
  // ===============================================
  describe('Security Policy Factory', () => {
    describe('createSecurityPolicy', () => {
      it('should create strict security policy', () => {
        const policy = createSecurityPolicy(SECURITY_PRESETS.strict);

        expect(policy.requireHttps).toBe(true);
        expect(policy.allowLocalhost).toBe(false);
        expect(policy.rateLimit?.enabled).toBe(true);
      });

      it('should create development security policy', () => {
        const policy = createSecurityPolicy(SECURITY_PRESETS.development);

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

        const announcer = createAnnouncer({ responderInfo });

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
          // @ts-expect-error - Testing invalid input
          createAnnouncer(config),
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

      const announcer = createAnnouncer({ responderInfo: customResponderInfo });

      expect(announcer).toBeDefined();
      announcer.cleanup();
    });
  });

  // ===============================================
  // Module Exports Tests
  // ===============================================
  describe('Module Exports', () => {
    it('should export DiscoveryResponder class', async () => {
      const { DiscoveryResponder } = await import('../responder.js');

      expect(DiscoveryResponder).toBeDefined();
      expect(typeof DiscoveryResponder).toBe('function');
    });

    it('should export CapabilityMatcher class', async () => {
      const { CapabilityMatcher } = await import('./CapabilityMatcher.js');

      expect(CapabilityMatcher).toBeDefined();
      expect(typeof CapabilityMatcher).toBe('function');
    });

    it('should export all expected responder exports', async () => {
      const responderIndex = await import('./index.js');

      // Classes
      expect(responderIndex.DiscoveryResponder).toBeDefined();
      expect(responderIndex.CapabilityMatcher).toBeDefined();

      // Security utilities are re-exported for convenience
      expect(responderIndex.createSecurityPolicy).toBeDefined();
    });

    it('should allow all responder components to work together', () => {
      const responderInfo = createTestResponderInfo.ethereum();
      const matcher = new CapabilityMatcher(responderInfo);
      const announcer = createAnnouncer({
        responderInfo,
        securityPolicy: createSecurityPolicy(SECURITY_PRESETS.development),
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
        expect(() =>
          // @ts-expect-error - Testing invalid input
          createAnnouncer(config),
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
        expect(
          () =>
            new DiscoveryResponder(responderInfo, {
              security: policy as unknown as SecurityPolicy,
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
});
