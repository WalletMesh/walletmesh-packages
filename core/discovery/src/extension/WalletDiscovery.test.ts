/**
 * @module discovery/wallet/WalletDiscovery.test
 *
 * Tests for the secure WalletDiscovery implementation.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WalletDiscovery } from './WalletDiscovery.js';
import { createResponderInfo } from '../responder/factory.js';
import { setupFakeTimers, cleanupFakeTimers } from '../testing/timingHelpers.js';
import type { DiscoveryRequestEvent, ResponderInfo, ChainCapability } from '../core/types.js';

// Mock Chrome API
const mockChrome = {
  runtime: {
    id: 'test-extension-id',
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  tabs: {
    sendMessage: vi.fn(() => Promise.resolve()),
  },
};

// @ts-ignore - Mock global chrome
global.chrome = mockChrome;

describe('WalletDiscovery', () => {
  let walletDiscovery: WalletDiscovery;
  let mockResponderInfo: ResponderInfo;

  beforeEach(() => {
    setupFakeTimers();
    vi.clearAllMocks();

    mockResponderInfo = createResponderInfo.aztec({
      uuid: 'test-wallet-uuid',
      rdns: 'com.test.wallet',
      name: 'Test Aztec Wallet',
      icon: 'data:image/svg+xml;base64,dGVzdA==',
      type: 'extension',
      chains: ['aztec:mainnet', 'aztec:testnet'],
      features: ['private-transactions', 'contract-deployment'],
    });

    walletDiscovery = new WalletDiscovery({
      responderInfo: mockResponderInfo,
      securityPolicy: {
        requireHttps: true,
        allowedOrigins: ['https://trusted-dapp.com'],
        rateLimit: { enabled: true, maxRequests: 10, windowMs: 60000 },
      },
    });
  });

  afterEach(() => {
    cleanupFakeTimers();
  });

  describe('initialization', () => {
    it('should create WalletDiscovery instance with default settings', () => {
      expect(walletDiscovery).toBeDefined();
      expect(walletDiscovery.getStats().isEnabled).toBe(false);
      expect(walletDiscovery.getStats().requestsProcessed).toBe(0);
    });

    it('should initialize with custom security policy', () => {
      const customWallet = new WalletDiscovery({
        responderInfo: mockResponderInfo,
        securityPolicy: {
          requireHttps: false,
          allowLocalhost: true,
          rateLimit: { enabled: false, maxRequests: 100, windowMs: 60000 },
        },
      });

      expect(customWallet).toBeDefined();
    });
  });

  describe('enable/disable', () => {
    it('should enable discovery', async () => {
      await walletDiscovery.enable();

      expect(walletDiscovery.getStats().isEnabled).toBe(true);
    });

    it('should disable discovery', async () => {
      await walletDiscovery.enable();
      await walletDiscovery.disable();

      expect(walletDiscovery.getStats().isEnabled).toBe(false);
    });

    it('should handle multiple enable calls', async () => {
      await walletDiscovery.enable();
      await walletDiscovery.enable(); // Should not error

      expect(walletDiscovery.getStats().isEnabled).toBe(true);
    });
  });

  describe('handleDiscoveryRequest', () => {
    const mockRequest: DiscoveryRequestEvent = {
      type: 'discovery:wallet:request',
      version: '0.1.0',
      sessionId: 'test-session-123',
      required: {
        chains: ['aztec:mainnet'],
        features: ['private-transactions'],
        interfaces: ['aztec-wallet-api-v1'],
      },
      origin: 'https://trusted-dapp.com',
      initiatorInfo: {
        name: 'Test dApp',
        url: 'https://trusted-dapp.com',
        icon: 'data:image/svg+xml;base64,dGVzdA==',
      },
    };

    beforeEach(async () => {
      await walletDiscovery.enable();
    });

    it('should handle valid discovery request', () => {
      walletDiscovery.handleDiscoveryRequest(mockRequest, 'https://trusted-dapp.com', 123);

      expect(walletDiscovery.getStats().requestsProcessed).toBe(1);
      expect(walletDiscovery.getStats().announcementsSent).toBe(1);
      expect(mockChrome.tabs.sendMessage).toHaveBeenCalledWith(123, {
        type: 'discovery:announce',
        data: expect.objectContaining({
          type: 'discovery:wallet:response',
          sessionId: 'test-session-123',
          rdns: 'com.test.wallet',
          name: 'Test Aztec Wallet',
          transportConfig: {
            type: 'extension',
            extensionId: 'test-extension-id',
          },
        }),
      });
    });

    it('should reject requests from unauthorized origins', () => {
      walletDiscovery.handleDiscoveryRequest(mockRequest, 'https://malicious-site.com', 123);

      expect(walletDiscovery.getStats().requestsProcessed).toBe(1);
      expect(walletDiscovery.getStats().requestsRejected).toBe(1);
      expect(walletDiscovery.getStats().announcementsSent).toBe(0);
      expect(mockChrome.tabs.sendMessage).not.toHaveBeenCalled();
    });

    it('should reject requests for unsupported capabilities', () => {
      const unsupportedRequest = {
        ...mockRequest,
        required: {
          chains: ['ethereum:mainnet'], // Not supported by Aztec wallet
          features: ['private-transactions'],
          interfaces: ['eip-1193'],
        },
      };

      walletDiscovery.handleDiscoveryRequest(unsupportedRequest, 'https://trusted-dapp.com', 123);

      expect(walletDiscovery.getStats().requestsProcessed).toBe(1);
      expect(walletDiscovery.getStats().announcementsSent).toBe(0);
      expect(mockChrome.tabs.sendMessage).not.toHaveBeenCalled();
    });

    it('should handle Chrome tabs.sendMessage failures gracefully', () => {
      mockChrome.tabs.sendMessage.mockImplementation(() => Promise.reject(new Error('Tab closed')));

      walletDiscovery.handleDiscoveryRequest(mockRequest, 'https://trusted-dapp.com', 123);

      expect(walletDiscovery.getStats().requestsProcessed).toBe(1);
      expect(walletDiscovery.getStats().announcementsSent).toBe(1);
      // Should not throw error
    });
  });

  describe('origin validation', () => {
    beforeEach(async () => {
      await walletDiscovery.enable();
    });

    it('should allow HTTPS origins when no allowlist is set', () => {
      const noAllowlistWallet = new WalletDiscovery({
        responderInfo: mockResponderInfo,
        securityPolicy: { requireHttps: true },
      });

      const mockRequest: DiscoveryRequestEvent = {
        type: 'discovery:wallet:request',
        version: '0.1.0',
        sessionId: 'test-session',
        required: { chains: ['aztec:mainnet'], features: [], interfaces: [] },
        origin: 'https://any-https-site.com',
        initiatorInfo: { name: 'Test', url: 'https://any-https-site.com' },
      };

      noAllowlistWallet.handleDiscoveryRequest(mockRequest, 'https://any-https-site.com', 123);

      expect(noAllowlistWallet.getStats().requestsRejected).toBe(0);
    });

    it('should reject HTTP origins when HTTPS is required', () => {
      const mockRequest: DiscoveryRequestEvent = {
        type: 'discovery:wallet:request',
        version: '0.1.0',
        sessionId: 'test-session',
        required: { chains: ['aztec:mainnet'], features: [], interfaces: [] },
        origin: 'http://insecure-site.com',
        initiatorInfo: { name: 'Test', url: 'http://insecure-site.com' },
      };

      walletDiscovery.handleDiscoveryRequest(mockRequest, 'http://insecure-site.com', 123);

      expect(walletDiscovery.getStats().requestsRejected).toBe(1);
    });

    it('should allow localhost when configured', () => {
      const localhostWallet = new WalletDiscovery({
        responderInfo: mockResponderInfo,
        securityPolicy: {
          requireHttps: true,
          allowLocalhost: true,
        },
      });

      const mockRequest: DiscoveryRequestEvent = {
        type: 'discovery:wallet:request',
        version: '0.1.0',
        sessionId: 'test-session',
        required: { chains: ['aztec:mainnet'], features: [], interfaces: [] },
        origin: 'http://localhost:3000',
        initiatorInfo: { name: 'Test', url: 'http://localhost:3000' },
      };

      localhostWallet.handleDiscoveryRequest(mockRequest, 'http://localhost:3000', 123);

      expect(localhostWallet.getStats().requestsRejected).toBe(0);
    });
  });

  describe('statistics', () => {
    it('should track discovery statistics', async () => {
      const mockRequest: DiscoveryRequestEvent = {
        type: 'discovery:wallet:request',
        version: '0.1.0',
        sessionId: 'test-session',
        required: { chains: ['aztec:mainnet'], features: [], interfaces: [] },
        origin: 'https://trusted-dapp.com',
        initiatorInfo: { name: 'Test', url: 'https://trusted-dapp.com' },
      };

      await walletDiscovery.enable();

      // Process some requests
      walletDiscovery.handleDiscoveryRequest(mockRequest, 'https://trusted-dapp.com', 123);
      walletDiscovery.handleDiscoveryRequest(mockRequest, 'https://malicious.com', 124);

      const stats = walletDiscovery.getStats();

      expect(stats.isEnabled).toBe(true);
      expect(stats.requestsProcessed).toBe(2);
      expect(stats.announcementsSent).toBe(1);
      expect(stats.requestsRejected).toBe(1);
      expect(stats.connectedOrigins).toContain('https://trusted-dapp.com');
    });
  });

  describe('updateResponderInfo', () => {
    it('should update responder information', async () => {
      await walletDiscovery.enable();

      const updatedInfo = createResponderInfo.aztec({
        uuid: 'updated-uuid',
        rdns: 'com.updated.wallet',
        name: 'Updated Aztec Wallet',
        icon: 'data:image/svg+xml;base64,dXBkYXRlZA==',
        type: 'extension',
        chains: ['aztec:mainnet'],
        features: ['private-transactions'],
      });

      // Should not throw error
      walletDiscovery.updateResponderInfo(updatedInfo);
    });

    it('should validate responder info and throw on invalid data (coverage: lines 320-334)', () => {
      // Test null/undefined responder info
      expect(() => {
        walletDiscovery.updateResponderInfo(null as unknown as ResponderInfo);
      }).toThrow('Invalid responder info: must be a valid object');

      expect(() => {
        walletDiscovery.updateResponderInfo(undefined as unknown as ResponderInfo);
      }).toThrow('Invalid responder info: must be a valid object');

      // Test non-object responder info
      expect(() => {
        walletDiscovery.updateResponderInfo('not an object' as unknown as ResponderInfo);
      }).toThrow('Invalid responder info: must be a valid object');

      // Test missing rdns
      expect(() => {
        walletDiscovery.updateResponderInfo({
          ...mockResponderInfo,
          rdns: '',
        });
      }).toThrow('Invalid responder info: rdns is required and must be a string');

      expect(() => {
        walletDiscovery.updateResponderInfo({
          ...mockResponderInfo,
          rdns: undefined as unknown as string,
        });
      }).toThrow('Invalid responder info: rdns is required and must be a string');

      expect(() => {
        walletDiscovery.updateResponderInfo({
          ...mockResponderInfo,
          rdns: 123 as unknown as string,
        });
      }).toThrow('Invalid responder info: rdns is required and must be a string');

      // Test missing name
      expect(() => {
        walletDiscovery.updateResponderInfo({
          ...mockResponderInfo,
          name: '',
        });
      }).toThrow('Invalid responder info: name is required and must be a string');

      expect(() => {
        walletDiscovery.updateResponderInfo({
          ...mockResponderInfo,
          name: undefined as unknown as string,
        });
      }).toThrow('Invalid responder info: name is required and must be a string');

      expect(() => {
        walletDiscovery.updateResponderInfo({
          ...mockResponderInfo,
          name: 123 as unknown as string,
        });
      }).toThrow('Invalid responder info: name is required and must be a string');

      // Test missing icon
      expect(() => {
        walletDiscovery.updateResponderInfo({
          ...mockResponderInfo,
          icon: '',
        });
      }).toThrow('Invalid responder info: icon is required and must be a string');

      expect(() => {
        walletDiscovery.updateResponderInfo({
          ...mockResponderInfo,
          icon: undefined as unknown as string,
        });
      }).toThrow('Invalid responder info: icon is required and must be a string');

      expect(() => {
        walletDiscovery.updateResponderInfo({
          ...mockResponderInfo,
          icon: 123 as unknown as string,
        });
      }).toThrow('Invalid responder info: icon is required and must be a string');

      // Test invalid chains
      expect(() => {
        walletDiscovery.updateResponderInfo({
          ...mockResponderInfo,
          chains: 'not an array' as unknown as ChainCapability[],
        });
      }).toThrow('Invalid responder info: chains must be an array');

      expect(() => {
        walletDiscovery.updateResponderInfo({
          ...mockResponderInfo,
          chains: undefined as unknown as ChainCapability[],
        });
      }).toThrow('Invalid responder info: chains must be an array');
    });
  });

  describe('constructor edge cases', () => {
    it('should initialize with ResponderInfo directly (coverage: lines 141-146)', () => {
      // Test constructor with ResponderInfo directly instead of config object
      const directWallet = new WalletDiscovery(mockResponderInfo);

      expect(directWallet).toBeDefined();
      expect(directWallet.getResponderInfo()).toEqual(mockResponderInfo);
      expect(directWallet.getStats().isEnabled).toBe(false);
    });

    it('should use custom callback for announcement handling (coverage: lines 161-165)', () => {
      const mockCallback = vi.fn();

      const callbackWallet = new WalletDiscovery({
        responderInfo: mockResponderInfo,
        onAnnouncement: mockCallback,
      });

      expect(callbackWallet).toBeDefined();
    });
  });

  describe('capability matching error handling', () => {
    it('should handle errors in canFulfillRequest gracefully (coverage: lines 361-364)', () => {
      // Create a WalletDiscovery instance
      const wallet = new WalletDiscovery(mockResponderInfo);

      // Access private capabilityMatcher to mock it
      const privateWallet = wallet as unknown as {
        capabilityMatcher: {
          matchCapabilities: (request: DiscoveryRequestEvent) => {
            canFulfill: boolean;
            intersection?: unknown;
          };
        };
      };

      // Mock capability matcher to throw error
      vi.spyOn(privateWallet.capabilityMatcher, 'matchCapabilities').mockImplementation(() => {
        throw new Error('Capability matching failed');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const mockRequest: DiscoveryRequestEvent = {
        type: 'discovery:wallet:request',
        version: '0.1.0',
        sessionId: 'test-session',
        required: { chains: ['aztec:mainnet'], features: [], interfaces: [] },
        origin: 'https://example.com',
        initiatorInfo: { name: 'Test', url: 'https://example.com' },
      };

      const result = wallet.canFulfillRequest(mockRequest);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        '[WalletMesh] Error checking capability fulfillment:',
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it('should handle errors in getDiscoveryIntersection gracefully (coverage: lines 380-382)', () => {
      // Create a WalletDiscovery instance
      const wallet = new WalletDiscovery(mockResponderInfo);

      // Access private capabilityMatcher to mock it
      const privateWallet = wallet as unknown as {
        capabilityMatcher: {
          matchCapabilities: (request: DiscoveryRequestEvent) => {
            canFulfill: boolean;
            intersection?: unknown;
          };
        };
      };

      // Mock capability matcher to throw error
      vi.spyOn(privateWallet.capabilityMatcher, 'matchCapabilities').mockImplementation(() => {
        throw new Error('Intersection calculation failed');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const mockRequest: DiscoveryRequestEvent = {
        type: 'discovery:wallet:request',
        version: '0.1.0',
        sessionId: 'test-session',
        required: { chains: ['aztec:mainnet'], features: [], interfaces: [] },
        origin: 'https://example.com',
        initiatorInfo: { name: 'Test', url: 'https://example.com' },
      };

      const result = wallet.getDiscoveryIntersection(mockRequest);

      expect(result).toBe(null);
      expect(consoleSpy).toHaveBeenCalledWith(
        '[WalletMesh] Error calculating capability intersection:',
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });

  describe('origin validation edge cases', () => {
    it('should handle invalid origins gracefully (coverage: lines 425-428)', () => {
      const invalidOriginWallet = new WalletDiscovery({
        responderInfo: mockResponderInfo,
        securityPolicy: { requireHttps: true },
      });

      const mockRequest: DiscoveryRequestEvent = {
        type: 'discovery:wallet:request',
        version: '0.1.0',
        sessionId: 'test-session',
        required: { chains: ['aztec:mainnet'], features: [], interfaces: [] },
        origin: 'invalid-url-format',
        initiatorInfo: { name: 'Test', url: 'invalid-url-format' },
      };

      invalidOriginWallet.handleDiscoveryRequest(mockRequest, 'invalid-url-format', 123);

      expect(invalidOriginWallet.getStats().requestsRejected).toBe(1);
    });

    it('should handle blocked origins (coverage: lines 407-409)', () => {
      const blockedOriginWallet = new WalletDiscovery({
        responderInfo: mockResponderInfo,
        securityPolicy: {
          requireHttps: true,
          blockedOrigins: ['https://blocked-site.com'],
        },
      });

      const mockRequest: DiscoveryRequestEvent = {
        type: 'discovery:wallet:request',
        version: '0.1.0',
        sessionId: 'test-session',
        required: { chains: ['aztec:mainnet'], features: [], interfaces: [] },
        origin: 'https://blocked-site.com',
        initiatorInfo: { name: 'Test', url: 'https://blocked-site.com' },
      };

      blockedOriginWallet.handleDiscoveryRequest(mockRequest, 'https://blocked-site.com', 123);

      expect(blockedOriginWallet.getStats().requestsRejected).toBe(1);
    });
  });

  describe('BackgroundEventTarget', () => {
    it('should handle announcement events in background context (coverage: lines 451-454)', () => {
      const mockCallback = vi.fn();

      const callbackWallet = new WalletDiscovery({
        responderInfo: mockResponderInfo,
        onAnnouncement: mockCallback,
      });

      // Access private eventTarget
      const privateWallet = callbackWallet as unknown as {
        announcer: { eventTarget: EventTarget };
      };

      const mockAnnouncement = {
        type: 'discovery:wallet:response',
        sessionId: 'test-session',
        responderId: 'test-responder',
        rdns: 'com.test.wallet',
        name: 'Test Wallet',
        tabId: 123,
      };

      const event = new CustomEvent('discovery:wallet:announce', {
        detail: mockAnnouncement,
      });

      // Dispatch event to test BackgroundEventTarget override
      privateWallet.announcer.eventTarget.dispatchEvent(event);

      expect(mockCallback).toHaveBeenCalledWith(mockAnnouncement, 123);
    });

    it('should handle non-announcement events normally (coverage: line 456)', () => {
      const mockCallback = vi.fn();

      const callbackWallet = new WalletDiscovery({
        responderInfo: mockResponderInfo,
        onAnnouncement: mockCallback,
      });

      // Access private eventTarget
      const privateWallet = callbackWallet as unknown as {
        announcer: { eventTarget: EventTarget };
      };

      const event = new CustomEvent('other:event', {
        detail: { data: 'test' },
      });

      // Should not call the callback for non-announcement events
      const result = privateWallet.announcer.eventTarget.dispatchEvent(event);

      expect(result).toBe(true);
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('additional coverage edge cases', () => {
    it('should handle stats immutability (coverage: line 391)', () => {
      const stats1 = walletDiscovery.getStats();
      const stats2 = walletDiscovery.getStats();

      // Stats should be different objects (spread operator creates new object)
      expect(stats1).not.toBe(stats2);
      expect(stats1).toEqual(stats2);
    });

    it('should return current responder info (coverage: lines 347-349)', () => {
      const responderInfo = walletDiscovery.getResponderInfo();

      expect(responderInfo).toEqual(mockResponderInfo);
      expect(responderInfo).toBe(mockResponderInfo); // Should be same reference
    });
  });
});
