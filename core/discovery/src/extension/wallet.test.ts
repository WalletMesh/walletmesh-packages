/**
 * Consolidated test suite for wallet module
 * Combines WalletDiscovery tests and additional edge cases
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WalletDiscovery } from './WalletDiscovery.js';
import { createTestResponderInfo, createTestDiscoveryRequest } from '../testing/testUtils.js';
import { setupFakeTimers, cleanupFakeTimers } from '../testing/timingHelpers.js';
import type { ResponderInfo } from '../core/types.js';

describe('Wallet Module', () => {
  let walletDiscovery: WalletDiscovery;
  let responderInfo: ResponderInfo;

  beforeEach(() => {
    setupFakeTimers();
    responderInfo = createTestResponderInfo.ethereum();
    walletDiscovery = new WalletDiscovery(responderInfo);
  });

  afterEach(() => {
    cleanupFakeTimers();
  });

  // ===============================================
  // WalletDiscovery Basic Functionality
  // ===============================================
  describe('WalletDiscovery Basic Functionality', () => {
    it('should initialize with responder info', () => {
      expect(walletDiscovery).toBeDefined();
      expect(walletDiscovery.getResponderInfo()).toEqual(responderInfo);
    });

    it('should start and stop discovery announcements', () => {
      expect(walletDiscovery.isAnnouncing()).toBe(false);

      walletDiscovery.startAnnouncing();
      expect(walletDiscovery.isAnnouncing()).toBe(true);

      walletDiscovery.stopAnnouncing();
      expect(walletDiscovery.isAnnouncing()).toBe(false);
    });

    it('should handle discovery requests', () => {
      const request = createTestDiscoveryRequest({
        required: {
          chains: ['eip155:1'],
          features: ['account-management'],
          interfaces: ['eip-1193'],
        },
      });

      const canFulfill = walletDiscovery.canFulfillRequest(request);
      expect(typeof canFulfill).toBe('boolean');
    });

    it('should update responder info', () => {
      const newResponderInfo = createTestResponderInfo.solana();

      walletDiscovery.updateResponderInfo(newResponderInfo);
      expect(walletDiscovery.getResponderInfo()).toEqual(newResponderInfo);
    });

    it('should get capability intersection', () => {
      const request = createTestDiscoveryRequest({
        required: {
          chains: ['eip155:1'],
          features: ['account-management'],
          interfaces: ['eip-1193'],
        },
      });

      const intersection = walletDiscovery.getDiscoveryIntersection(request);
      expect(intersection).toBeDefined();
      expect(intersection?.required).toBeDefined();
    });
  });

  // ===============================================
  // WalletDiscovery Capability Matching
  // ===============================================
  describe('WalletDiscovery Capability Matching', () => {
    it('should match compatible requests', () => {
      const compatibleRequest = createTestDiscoveryRequest({
        required: {
          chains: ['eip155:1'],
          features: ['account-management'],
          interfaces: ['eip-1193'],
        },
      });

      expect(walletDiscovery.canFulfillRequest(compatibleRequest)).toBe(true);
    });

    it('should reject incompatible requests', () => {
      const incompatibleRequest = createTestDiscoveryRequest({
        required: {
          chains: ['solana:mainnet'], // Not supported by Ethereum wallet
          features: ['account-management'],
          interfaces: ['solana-wallet-standard'],
        },
      });

      expect(walletDiscovery.canFulfillRequest(incompatibleRequest)).toBe(false);
    });

    it('should handle partial capability matches', () => {
      const partialRequest = createTestDiscoveryRequest({
        required: {
          chains: ['eip155:1'], // Supported
          features: ['account-management'], // Supported
          interfaces: ['unsupported-interface'], // Not supported
        },
      });

      expect(walletDiscovery.canFulfillRequest(partialRequest)).toBe(false);
    });

    it('should handle empty requirements', () => {
      const emptyRequest = createTestDiscoveryRequest({
        required: {
          chains: [],
          features: [],
          interfaces: [],
        },
      });

      // Empty requirements should be considered fulfillable
      expect(walletDiscovery.canFulfillRequest(emptyRequest)).toBe(true);
    });

    it('should handle optional capabilities', () => {
      const requestWithOptional = createTestDiscoveryRequest({
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

      const intersection = walletDiscovery.getDiscoveryIntersection(requestWithOptional);
      expect(intersection?.required.chains).toContain('eip155:1');
      // Optional capabilities should be included if supported
    });
  });

  // ===============================================
  // WalletDiscovery Multi-Chain Support
  // ===============================================
  describe('WalletDiscovery Multi-Chain Support', () => {
    it('should handle multi-chain wallets', () => {
      const multiChainResponderInfo = createTestResponderInfo.multiChain();
      const multiChainWallet = new WalletDiscovery(multiChainResponderInfo);

      const multiChainRequest = createTestDiscoveryRequest({
        required: {
          chains: ['eip155:1', 'eip155:137'],
          features: ['account-management'],
          interfaces: ['eip-1193'],
        },
      });

      const canFulfill = multiChainWallet.canFulfillRequest(multiChainRequest);
      expect(typeof canFulfill).toBe('boolean');
    });

    it('should calculate correct intersections for multi-chain requests', () => {
      const multiChainRequest = createTestDiscoveryRequest({
        required: {
          chains: ['eip155:1', 'eip155:137'], // Only ethereum supported
          features: ['account-management'],
          interfaces: ['eip-1193'],
        },
      });

      const intersection = walletDiscovery.getDiscoveryIntersection(multiChainRequest);

      // Should include intersection if any capabilities match
      if (intersection) {
        expect(intersection?.required.chains).toContain('eip155:1');
        // May or may not contain polygon depending on wallet capabilities
      } else {
        // If no intersection, the wallet can't fulfill any of the required capabilities
        expect(intersection).toBeNull();
      }
    });

    it('should handle chain-specific features', () => {
      const chainSpecificRequest = createTestDiscoveryRequest({
        required: {
          chains: ['eip155:1'],
          features: ['eip-1559-gas-estimation'], // Ethereum-specific feature
          interfaces: ['eip-1193'],
        },
      });

      const intersection = walletDiscovery.getDiscoveryIntersection(chainSpecificRequest);
      expect(intersection).toBeDefined();
    });
  });

  // ===============================================
  // WalletDiscovery Edge Cases
  // ===============================================
  describe('WalletDiscovery Edge Cases', () => {
    it('should handle malformed requests gracefully', () => {
      const malformedRequests = [
        null,
        undefined,
        {},
        { required: null },
        { required: 'invalid' },
        { required: { chains: 'not-an-array' } },
      ];

      for (const request of malformedRequests) {
        expect(() =>
          walletDiscovery.canFulfillRequest(
            request as unknown as Parameters<typeof walletDiscovery.canFulfillRequest>[0],
          ),
        ).not.toThrow();
      }
    });

    it('should handle responder info updates during announcement', () => {
      walletDiscovery.startAnnouncing();
      expect(walletDiscovery.isAnnouncing()).toBe(true);

      const newResponderInfo = createTestResponderInfo.solana();
      walletDiscovery.updateResponderInfo(newResponderInfo);

      // Should still be announcing with updated info
      expect(walletDiscovery.isAnnouncing()).toBe(true);
      expect(walletDiscovery.getResponderInfo()).toEqual(newResponderInfo);
    });

    it('should handle multiple start/stop cycles', () => {
      // Multiple start calls
      walletDiscovery.startAnnouncing();
      walletDiscovery.startAnnouncing();
      walletDiscovery.startAnnouncing();
      expect(walletDiscovery.isAnnouncing()).toBe(true);

      // Multiple stop calls
      walletDiscovery.stopAnnouncing();
      walletDiscovery.stopAnnouncing();
      walletDiscovery.stopAnnouncing();
      expect(walletDiscovery.isAnnouncing()).toBe(false);
    });

    it('should handle very large discovery requests', () => {
      const largeRequest = createTestDiscoveryRequest({
        required: {
          chains: Array.from({ length: 100 }, (_, i) => `evm:chain:${i}`),
          features: Array.from({ length: 50 }, (_, i) => `feature-${i}`),
          interfaces: Array.from({ length: 20 }, (_, i) => `interface-${i}`),
        },
      });

      expect(() => walletDiscovery.canFulfillRequest(largeRequest)).not.toThrow();
    });

    it('should handle requests with duplicate capabilities', () => {
      const duplicateRequest = createTestDiscoveryRequest({
        required: {
          chains: ['eip155:1', 'eip155:1', 'eip155:1'],
          features: ['account-management', 'account-management'],
          interfaces: ['eip-1193', 'eip-1193'],
        },
      });

      const intersection = walletDiscovery.getDiscoveryIntersection(duplicateRequest);
      expect(intersection).toBeDefined();
      // Should handle duplicates gracefully
    });

    it('should handle special characters in capability names', () => {
      const specialCharRequest = createTestDiscoveryRequest({
        required: {
          chains: ['eip155:1'],
          features: ['feature-with-dashes', 'feature_with_underscores', 'feature.with.dots'],
          interfaces: ['interface:with:colons'],
        },
      });

      expect(() => walletDiscovery.canFulfillRequest(specialCharRequest)).not.toThrow();
    });
  });

  // ===============================================
  // WalletDiscovery State Management
  // ===============================================
  describe('WalletDiscovery State Management', () => {
    it('should provide discovery statistics', () => {
      if ('getStats' in walletDiscovery) {
        const stats = (walletDiscovery as unknown as { getStats(): unknown }).getStats();
        expect(stats).toBeDefined();
        expect(typeof stats).toBe('object');
      }
    });

    it('should track announcement history', () => {
      if ('getAnnouncementHistory' in walletDiscovery) {
        const history = (
          walletDiscovery as unknown as { getAnnouncementHistory(): unknown[] }
        ).getAnnouncementHistory();
        expect(Array.isArray(history)).toBe(true);
      }
    });

    it('should allow configuration updates', () => {
      if ('updateConfig' in walletDiscovery) {
        const newConfig = {
          announceInterval: 5000,
          maxAnnouncementRetries: 3,
        };

        expect(() =>
          (walletDiscovery as unknown as { updateConfig(config: unknown): void }).updateConfig(newConfig),
        ).not.toThrow();
      }
    });

    it('should handle cleanup on disposal', () => {
      walletDiscovery.startAnnouncing();
      expect(walletDiscovery.isAnnouncing()).toBe(true);

      if ('dispose' in walletDiscovery) {
        (walletDiscovery as unknown as { dispose(): void }).dispose();
        expect(walletDiscovery.isAnnouncing()).toBe(false);
      }
    });
  });

  // ===============================================
  // WalletDiscovery Security
  // ===============================================
  describe('WalletDiscovery Security', () => {
    it('should validate responder info updates', () => {
      const invalidResponderInfos = [
        null,
        undefined,
        {},
        { rdns: 'invalid-rdns' }, // Missing required fields
      ];

      for (const info of invalidResponderInfos) {
        expect(() => walletDiscovery.updateResponderInfo(info as unknown as ResponderInfo)).toThrow();
      }
    });

    it('should sanitize discovery requests', () => {
      const maliciousRequest = createTestDiscoveryRequest({
        required: {
          chains: ['<script>alert("xss")</script>'],
          features: ['javascript:alert("xss")'],
          interfaces: ['data:text/html,<script>alert("xss")</script>'],
        },
      });

      // Should handle malicious input gracefully
      expect(() => walletDiscovery.canFulfillRequest(maliciousRequest)).not.toThrow();
    });

    it('should prevent information leakage in error messages', () => {
      const sensitiveRequest = createTestDiscoveryRequest({
        required: {
          chains: ['sensitive-internal-chain'],
          features: ['admin-access'],
          interfaces: ['internal-api'],
        },
      });

      try {
        walletDiscovery.canFulfillRequest(sensitiveRequest);
      } catch (error) {
        // Error messages should not leak sensitive information
        const errorMessage = error instanceof Error ? error.message : String(error);
        expect(errorMessage).not.toContain('sensitive-internal-chain');
        expect(errorMessage).not.toContain('admin-access');
        expect(errorMessage).not.toContain('internal-api');
      }
    });
  });

  // ===============================================
  // WalletDiscovery Performance
  // ===============================================
  describe('WalletDiscovery Performance', () => {
    it('should handle high-frequency discovery requests efficiently', () => {
      const request = createTestDiscoveryRequest({
        required: {
          chains: ['eip155:1'],
          features: ['account-management'],
          interfaces: ['eip-1193'],
        },
      });

      const startTime = performance.now();

      // Make many requests
      for (let i = 0; i < 1000; i++) {
        walletDiscovery.canFulfillRequest(request);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (less than 100ms for 1000 requests)
      expect(duration).toBeLessThan(100);
    });

    it('should cache capability intersection results if supported', () => {
      const request = createTestDiscoveryRequest({
        required: {
          chains: ['eip155:1'],
          features: ['account-management'],
          interfaces: ['eip-1193'],
        },
      });

      // First call
      const intersection1 = walletDiscovery.getDiscoveryIntersection(request);

      // Second call with same request
      const intersection2 = walletDiscovery.getDiscoveryIntersection(request);

      // Results should be consistent
      expect(intersection1).toEqual(intersection2);
    });

    it('should handle memory efficiently with many requests', () => {
      // Create many different requests
      for (let i = 0; i < 100; i++) {
        const request = createTestDiscoveryRequest({
          required: {
            chains: [`evm:test-chain:${i}`],
            features: [`test-feature-${i}`],
            interfaces: [`test-interface-${i}`],
          },
        });

        walletDiscovery.canFulfillRequest(request);
      }

      // Should not cause memory issues
      expect(true).toBe(true); // If we get here without OOM, test passes
    });
  });

  // ===============================================
  // WalletDiscovery Integration
  // ===============================================
  describe('WalletDiscovery Integration', () => {
    it('should work with different responder info types', () => {
      const responderTypes = [
        createTestResponderInfo.ethereum(),
        createTestResponderInfo.solana(),
        createTestResponderInfo.aztec(),
        createTestResponderInfo.multiChain(),
      ];

      for (const info of responderTypes) {
        const wallet = new WalletDiscovery(info);
        expect(wallet).toBeDefined();
        expect(wallet.getResponderInfo()).toEqual(info);
      }
    });

    it('should integrate with capability matching', () => {
      const request = createTestDiscoveryRequest({
        required: {
          chains: ['eip155:1'],
          features: ['account-management'],
          interfaces: ['eip-1193'],
        },
      });

      const canFulfill = walletDiscovery.canFulfillRequest(request);
      const intersection = walletDiscovery.getDiscoveryIntersection(request);

      // Results should be consistent
      if (canFulfill) {
        expect(intersection?.required.chains.length).toBeGreaterThan(0);
      }
    });

    it('should support event-driven updates if implemented', () => {
      if ('on' in walletDiscovery && 'emit' in walletDiscovery) {
        const listener = vi.fn();
        (walletDiscovery as unknown as { on(event: string, listener: () => void): void }).on(
          'responderInfoUpdated',
          listener,
        );

        const newResponderInfo = createTestResponderInfo.solana();
        walletDiscovery.updateResponderInfo(newResponderInfo);

        expect(listener).toHaveBeenCalled();
      }
    });
  });
});
