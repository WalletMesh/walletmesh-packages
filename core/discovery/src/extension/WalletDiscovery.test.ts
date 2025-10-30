/**
 * @module discovery/wallet/WalletDiscovery.test
 *
 * Tests for the secure WalletDiscovery implementation.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DiscoveryRequestEvent, DiscoveryResponseEvent } from '../types/core.js';
import type { ResponderInfo, TechnologyCapability } from '../types/capabilities.js';
import { createTestResponderInfo } from '../testing/testUtils.js';
import { createConsoleSpy, setupChromeEnvironment } from '../testing/index.js';
import { cleanupFakeTimers, setupFakeTimers } from '../testing/timingHelpers.js';
import { WalletDiscovery, type WalletDiscoveryConfig } from './WalletDiscovery.js';

// Mock Chrome API using standardized utility
let mockChrome: ReturnType<typeof setupChromeEnvironment>['chrome'];
let chromeCleanup: () => void;

// Helper to create WalletDiscovery with onAnnouncement mock
function createTestWalletDiscovery(
  config: (WalletDiscoveryConfig | ResponderInfo) & {
    onAnnouncement?: (announcement: DiscoveryResponseEvent, tabId: number) => void;
  },
): WalletDiscovery {
  // If it's a ResponderInfo (not a config object), wrap it
  if ('responderInfo' in config) {
    // It's a WalletDiscoveryConfig
    return new WalletDiscovery({
      ...config,
      onAnnouncement: config.onAnnouncement ?? vi.fn(),
    } as WalletDiscoveryConfig);
  } else {
    // It's a ResponderInfo, return directly without onAnnouncement
    return new WalletDiscovery(config as ResponderInfo);
  }
}

describe('WalletDiscovery', () => {
  let walletDiscovery: WalletDiscovery;
  let mockResponderInfo: ResponderInfo;

  beforeEach(() => {
    setupFakeTimers();
    vi.clearAllMocks();

    // Set up standardized Chrome environment
    const chromeEnv = setupChromeEnvironment({
      extensionId: 'test-extension-id',
    });
    mockChrome = chromeEnv.chrome;
    chromeCleanup = chromeEnv.cleanup;

    // Ensure tabs.sendMessage works with callback pattern (Chrome API style)
    // biome-ignore lint/suspicious/noExplicitAny: Mock function setup requires any for test utilities
    (mockChrome.tabs.sendMessage as any) = vi.fn(
      (_tabId: number, _message: unknown, callback: (response?: unknown) => void) => {
        // Call callback immediately to simulate successful send
        callback(undefined);
      },
    );

    mockResponderInfo = {
      ...createTestResponderInfo.aztec({
        uuid: 'test-wallet-uuid',
        rdns: 'com.test.wallet',
        name: 'Test Aztec Wallet',
        icon: 'data:image/svg+xml;base64,dGVzdA==',
        type: 'extension',
      }),
      features: [
        { id: 'private-transactions', name: 'Private Transactions' },
        { id: 'contract-deployment', name: 'Contract Deployment' },
      ],
    };

    walletDiscovery = createTestWalletDiscovery({
      responderInfo: mockResponderInfo,
      securityPolicy: {
        requireHttps: true,
        allowedOrigins: ['https://trusted-dapp.com'],
        rateLimit: { enabled: true, maxRequests: 10, windowMs: 60000 },
      },
      // Mock onAnnouncement callback for port-based communication
      onAnnouncement: vi.fn(),
    });
  });

  afterEach(() => {
    cleanupFakeTimers();
    chromeCleanup();
  });

  describe('initialization', () => {
    it('should create WalletDiscovery instance with default settings', () => {
      expect(walletDiscovery).toBeDefined();
      expect(walletDiscovery.getStats().isEnabled).toBe(false);
      expect(walletDiscovery.getStats().requestsProcessed).toBe(0);
    });

    it('should initialize with custom security policy', () => {
      const customWallet = createTestWalletDiscovery({
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
        technologies: [
          {
            type: 'aztec',
            interfaces: ['aztec-wallet-api-v1'],
            features: ['private-transactions'],
          },
        ],
        features: [],
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

    it('should handle valid discovery request', async () => {
      await walletDiscovery.handleDiscoveryRequest(mockRequest, 'https://trusted-dapp.com', 123);

      expect(walletDiscovery.getStats().requestsProcessed).toBe(1);
      expect(walletDiscovery.getStats().announcementsSent).toBe(1);
    });

    it('should reject requests from unauthorized origins', () => {
      walletDiscovery.handleDiscoveryRequest(mockRequest, 'https://malicious-site.com', 123);

      expect(walletDiscovery.getStats().requestsProcessed).toBe(1);
      expect(walletDiscovery.getStats().requestsRejected).toBe(1);
      expect(walletDiscovery.getStats().announcementsSent).toBe(0);
    });

    it('should reject requests for unsupported capabilities', () => {
      const unsupportedRequest = {
        ...mockRequest,
        required: {
          technologies: [
            {
              type: 'evm' as const, // Not supported by Aztec wallet
              interfaces: ['eip-1193'],
            },
          ],
          features: ['private-transactions'],
        },
      };

      walletDiscovery.handleDiscoveryRequest(unsupportedRequest, 'https://trusted-dapp.com', 123);

      expect(walletDiscovery.getStats().requestsProcessed).toBe(1);
      expect(walletDiscovery.getStats().announcementsSent).toBe(0);
    });

    it('should handle onAnnouncement callback failures gracefully', async () => {
      const failingWallet = createTestWalletDiscovery({
        responderInfo: mockResponderInfo,
        securityPolicy: {
          requireHttps: true,
          allowedOrigins: ['https://trusted-dapp.com'],
        },
        onAnnouncement: vi.fn().mockImplementation(() => {
          throw new Error('Port disconnected');
        }),
      });

      await failingWallet.enable();
      await failingWallet.handleDiscoveryRequest(mockRequest, 'https://trusted-dapp.com', 123);

      expect(failingWallet.getStats().requestsProcessed).toBe(1);
      expect(failingWallet.getStats().announcementsSent).toBe(0); // onAnnouncement threw error
      // Should not throw error to caller
    });
  });

  describe('origin validation', () => {
    beforeEach(async () => {
      await walletDiscovery.enable();
    });

    it('should allow HTTPS origins when no allowlist is set', () => {
      const noAllowlistWallet = createTestWalletDiscovery({
        responderInfo: mockResponderInfo,
        securityPolicy: { requireHttps: true },
      });

      const mockRequest: DiscoveryRequestEvent = {
        type: 'discovery:wallet:request',
        version: '0.1.0',
        sessionId: 'test-session',
        required: {
          technologies: [
            {
              type: 'aztec',
              interfaces: ['aztec-wallet-api-v1'],
            },
          ],
          features: [],
        },
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
        required: {
          technologies: [
            {
              type: 'aztec',
              interfaces: ['aztec-wallet-api-v1'],
            },
          ],
          features: [],
        },
        origin: 'http://insecure-site.com',
        initiatorInfo: { name: 'Test', url: 'http://insecure-site.com' },
      };

      walletDiscovery.handleDiscoveryRequest(mockRequest, 'http://insecure-site.com', 123);

      expect(walletDiscovery.getStats().requestsRejected).toBe(1);
    });

    it('should allow localhost when configured', () => {
      const localhostWallet = createTestWalletDiscovery({
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
        required: {
          technologies: [
            {
              type: 'aztec',
              interfaces: ['aztec-wallet-api-v1'],
            },
          ],
          features: [],
        },
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
        required: {
          technologies: [
            {
              type: 'aztec',
              interfaces: ['aztec-wallet-api-v1'],
            },
          ],
          features: [],
        },
        origin: 'https://trusted-dapp.com',
        initiatorInfo: { name: 'Test', url: 'https://trusted-dapp.com' },
      };

      await walletDiscovery.enable();

      // Process some requests
      await walletDiscovery.handleDiscoveryRequest(mockRequest, 'https://trusted-dapp.com', 123);
      await walletDiscovery.handleDiscoveryRequest(mockRequest, 'https://malicious.com', 124);

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

      const updatedInfo: ResponderInfo = {
        ...createTestResponderInfo.aztec({
          uuid: 'updated-uuid',
          rdns: 'com.updated.wallet',
          name: 'Updated Aztec Wallet',
          icon: 'data:image/svg+xml;base64,dXBkYXRlZA==',
          type: 'extension',
        }),
        features: [{ id: 'private-transactions', name: 'Private Transactions' }],
      };

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

      // Test invalid technologies
      expect(() => {
        walletDiscovery.updateResponderInfo({
          ...mockResponderInfo,
          technologies: 'not an array' as unknown as TechnologyCapability[],
        });
      }).toThrow('Invalid responder info: technologies must be an array');

      expect(() => {
        walletDiscovery.updateResponderInfo({
          ...mockResponderInfo,
          technologies: undefined as unknown as TechnologyCapability[],
        });
      }).toThrow('Invalid responder info: technologies must be an array');
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

      const callbackWallet = createTestWalletDiscovery({
        responderInfo: mockResponderInfo,
        onAnnouncement: mockCallback,
      });

      expect(callbackWallet).toBeDefined();
    });
  });

  describe('capability matching error handling', () => {
    it('should handle errors in canFulfillRequest gracefully (coverage: lines 361-364)', () => {
      // Create a WalletDiscovery instance
      const wallet = createTestWalletDiscovery(mockResponderInfo);

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

      const consoleSpy = createConsoleSpy({ silent: false });

      const mockRequest: DiscoveryRequestEvent = {
        type: 'discovery:wallet:request',
        version: '0.1.0',
        sessionId: 'test-session',
        required: {
          technologies: [
            {
              type: 'aztec',
              interfaces: ['aztec-wallet-api-v1'],
            },
          ],
          features: [],
        },
        origin: 'https://example.com',
        initiatorInfo: { name: 'Test', url: 'https://example.com' },
      };

      const result = wallet.canFulfillRequest(mockRequest);

      expect(result).toBe(false);
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        '[WalletMesh] Error checking capability fulfillment:',
        expect.any(Error),
      );

      consoleSpy.restore();
    });

    it('should handle errors in getDiscoveryIntersection gracefully (coverage: lines 380-382)', () => {
      // Create a WalletDiscovery instance
      const wallet = createTestWalletDiscovery(mockResponderInfo);

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

      const consoleSpy = createConsoleSpy({ silent: false });

      const mockRequest: DiscoveryRequestEvent = {
        type: 'discovery:wallet:request',
        version: '0.1.0',
        sessionId: 'test-session',
        required: {
          technologies: [
            {
              type: 'aztec',
              interfaces: ['aztec-wallet-api-v1'],
            },
          ],
          features: [],
        },
        origin: 'https://example.com',
        initiatorInfo: { name: 'Test', url: 'https://example.com' },
      };

      const result = wallet.getDiscoveryIntersection(mockRequest);

      expect(result).toBe(null);
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        '[WalletMesh] Error calculating capability intersection:',
        expect.any(Error),
      );

      consoleSpy.restore();
    });
  });

  describe('origin validation edge cases', () => {
    it('should handle invalid origins gracefully (coverage: lines 425-428)', () => {
      const invalidOriginWallet = createTestWalletDiscovery({
        responderInfo: mockResponderInfo,
        securityPolicy: { requireHttps: true },
      });

      const mockRequest: DiscoveryRequestEvent = {
        type: 'discovery:wallet:request',
        version: '0.1.0',
        sessionId: 'test-session',
        required: {
          technologies: [
            {
              type: 'aztec',
              interfaces: ['aztec-wallet-api-v1'],
            },
          ],
          features: [],
        },
        origin: 'invalid-url-format',
        initiatorInfo: { name: 'Test', url: 'invalid-url-format' },
      };

      invalidOriginWallet.handleDiscoveryRequest(mockRequest, 'invalid-url-format', 123);

      expect(invalidOriginWallet.getStats().requestsRejected).toBe(1);
    });

    it('should handle blocked origins (coverage: lines 407-409)', () => {
      const blockedOriginWallet = createTestWalletDiscovery({
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
        required: {
          technologies: [
            {
              type: 'aztec',
              interfaces: ['aztec-wallet-api-v1'],
            },
          ],
          features: [],
        },
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

      const callbackWallet = createTestWalletDiscovery({
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

      const callbackWallet = createTestWalletDiscovery({
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

  describe('shouldRespondToDiscovery callback', () => {
    const mockRequest: DiscoveryRequestEvent = {
      type: 'discovery:wallet:request',
      version: '0.1.0',
      sessionId: 'test-session-123',
      required: {
        technologies: [
          {
            type: 'aztec',
            interfaces: ['aztec-wallet-api-v1'],
            features: ['private-transactions'],
          },
        ],
        features: [],
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

    it('should send response when callback returns true', async () => {
      const callbackWallet = createTestWalletDiscovery({
        responderInfo: mockResponderInfo,
        securityPolicy: {
          requireHttps: true,
          allowedOrigins: ['https://trusted-dapp.com'],
        },
        shouldRespondToDiscovery: vi.fn().mockReturnValue(true),
      });

      await callbackWallet.enable();
      await callbackWallet.handleDiscoveryRequest(mockRequest, 'https://trusted-dapp.com', 123);

      expect(callbackWallet.getStats().announcementsSent).toBe(1);
      expect(callbackWallet.getStats().requestsRejected).toBe(0);
    });

    it('should not send response when callback returns false (silent rejection)', async () => {
      const callbackWallet = createTestWalletDiscovery({
        responderInfo: mockResponderInfo,
        securityPolicy: {
          requireHttps: true,
          allowedOrigins: ['https://trusted-dapp.com'],
        },
        shouldRespondToDiscovery: vi.fn().mockReturnValue(false),
      });

      await callbackWallet.enable();
      await callbackWallet.handleDiscoveryRequest(mockRequest, 'https://trusted-dapp.com', 123);

      expect(callbackWallet.getStats().announcementsSent).toBe(0);
      expect(callbackWallet.getStats().requestsRejected).toBe(1);
    });

    it('should support async callback', async () => {
      const asyncCallback = vi.fn().mockResolvedValue(true);
      const callbackWallet = createTestWalletDiscovery({
        responderInfo: mockResponderInfo,
        securityPolicy: {
          requireHttps: true,
          allowedOrigins: ['https://trusted-dapp.com'],
        },
        shouldRespondToDiscovery: asyncCallback,
      });

      await callbackWallet.enable();
      await callbackWallet.handleDiscoveryRequest(mockRequest, 'https://trusted-dapp.com', 123);

      expect(asyncCallback).toHaveBeenCalledWith('https://trusted-dapp.com');
      expect(callbackWallet.getStats().announcementsSent).toBe(1);
    });

    it('should handle callback throwing error (fail closed)', async () => {
      const errorCallback = vi.fn().mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const callbackWallet = createTestWalletDiscovery({
        responderInfo: mockResponderInfo,
        securityPolicy: {
          requireHttps: true,
          allowedOrigins: ['https://trusted-dapp.com'],
        },
        shouldRespondToDiscovery: errorCallback,
      });

      await callbackWallet.enable();
      await callbackWallet.handleDiscoveryRequest(mockRequest, 'https://trusted-dapp.com', 123);

      expect(callbackWallet.getStats().announcementsSent).toBe(0);
      expect(callbackWallet.getStats().requestsRejected).toBe(1);
    });

    it('should handle async callback rejecting (fail closed)', async () => {
      const rejectCallback = vi.fn().mockRejectedValue(new Error('Async error'));

      const callbackWallet = createTestWalletDiscovery({
        responderInfo: mockResponderInfo,
        securityPolicy: {
          requireHttps: true,
          allowedOrigins: ['https://trusted-dapp.com'],
        },
        shouldRespondToDiscovery: rejectCallback,
      });

      await callbackWallet.enable();
      await callbackWallet.handleDiscoveryRequest(mockRequest, 'https://trusted-dapp.com', 123);

      expect(callbackWallet.getStats().announcementsSent).toBe(0);
      expect(callbackWallet.getStats().requestsRejected).toBe(1);
    });

    it('should work without callback (backward compatibility)', async () => {
      const noCallbackWallet = createTestWalletDiscovery({
        responderInfo: mockResponderInfo,
        securityPolicy: {
          requireHttps: true,
          allowedOrigins: ['https://trusted-dapp.com'],
        },
        // No shouldRespondToDiscovery callback
      });

      await noCallbackWallet.enable();
      await noCallbackWallet.handleDiscoveryRequest(mockRequest, 'https://trusted-dapp.com', 123);

      // Should send response normally without callback
      expect(noCallbackWallet.getStats().announcementsSent).toBe(1);
    });

    it('should pass correct origin to callback', async () => {
      const callbackSpy = vi.fn().mockReturnValue(true);

      const callbackWallet = createTestWalletDiscovery({
        responderInfo: mockResponderInfo,
        securityPolicy: {
          requireHttps: true,
          allowedOrigins: ['https://test-origin.com'],
        },
        shouldRespondToDiscovery: callbackSpy,
      });

      await callbackWallet.enable();
      await callbackWallet.handleDiscoveryRequest(mockRequest, 'https://test-origin.com', 123);

      expect(callbackSpy).toHaveBeenCalledWith('https://test-origin.com');
      expect(callbackSpy).toHaveBeenCalledTimes(1);
    });

    it('should not call callback if capability matching fails', async () => {
      const callbackSpy = vi.fn().mockReturnValue(true);

      const callbackWallet = createTestWalletDiscovery({
        responderInfo: mockResponderInfo,
        securityPolicy: {
          requireHttps: true,
          allowedOrigins: ['https://trusted-dapp.com'],
        },
        shouldRespondToDiscovery: callbackSpy,
      });

      const unsupportedRequest = {
        ...mockRequest,
        required: {
          technologies: [
            {
              type: 'evm' as const, // Not supported by Aztec wallet
              interfaces: ['eip-1193'],
            },
          ],
          features: [],
        },
      };

      await callbackWallet.enable();
      await callbackWallet.handleDiscoveryRequest(unsupportedRequest, 'https://trusted-dapp.com', 123);

      // Callback should not be called if capability matching fails
      expect(callbackSpy).not.toHaveBeenCalled();
      expect(callbackWallet.getStats().announcementsSent).toBe(0);
    });

    it('should not call callback if origin validation fails', async () => {
      const callbackSpy = vi.fn().mockReturnValue(true);

      const callbackWallet = createTestWalletDiscovery({
        responderInfo: mockResponderInfo,
        securityPolicy: {
          requireHttps: true,
          allowedOrigins: ['https://trusted-dapp.com'],
        },
        shouldRespondToDiscovery: callbackSpy,
      });

      await callbackWallet.enable();
      await callbackWallet.handleDiscoveryRequest(mockRequest, 'https://malicious.com', 123);

      // Callback should not be called if origin validation fails
      expect(callbackSpy).not.toHaveBeenCalled();
      expect(callbackWallet.getStats().requestsRejected).toBe(1);
    });
  });

  describe('onResponseSent callback', () => {
    const mockRequest: DiscoveryRequestEvent = {
      type: 'discovery:wallet:request',
      version: '0.1.0',
      sessionId: 'test-session-123',
      required: {
        technologies: [
          {
            type: 'aztec',
            interfaces: ['aztec-wallet-api-v1'],
            features: ['private-transactions'],
          },
        ],
        features: [],
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

    it('should call onResponseSent after successful message delivery', async () => {
      const onResponseSentSpy = vi.fn();

      const callbackWallet = createTestWalletDiscovery({
        responderInfo: mockResponderInfo,
        securityPolicy: {
          requireHttps: true,
          allowedOrigins: ['https://trusted-dapp.com'],
        },
        onResponseSent: onResponseSentSpy,
      });

      await callbackWallet.enable();
      await callbackWallet.handleDiscoveryRequest(mockRequest, 'https://trusted-dapp.com', 123);

      expect(onResponseSentSpy).toHaveBeenCalledWith('https://trusted-dapp.com');
      expect(onResponseSentSpy).toHaveBeenCalledTimes(1);
    });

    it('should not call onResponseSent if onAnnouncement fails', async () => {
      const onResponseSentSpy = vi.fn();

      const callbackWallet = createTestWalletDiscovery({
        responderInfo: mockResponderInfo,
        securityPolicy: {
          requireHttps: true,
          allowedOrigins: ['https://trusted-dapp.com'],
        },
        onAnnouncement: vi.fn().mockImplementation(() => {
          throw new Error('Port disconnected');
        }),
        onResponseSent: onResponseSentSpy,
      });

      await callbackWallet.enable();
      await callbackWallet.handleDiscoveryRequest(mockRequest, 'https://trusted-dapp.com', 123);

      // onResponseSent should NOT be called when onAnnouncement fails
      expect(onResponseSentSpy).not.toHaveBeenCalled();
      expect(callbackWallet.getStats().announcementsSent).toBe(0);
    });

    it('should not call onResponseSent if shouldRespondToDiscovery returns false', async () => {
      const onResponseSentSpy = vi.fn();

      const callbackWallet = createTestWalletDiscovery({
        responderInfo: mockResponderInfo,
        securityPolicy: {
          requireHttps: true,
          allowedOrigins: ['https://trusted-dapp.com'],
        },
        shouldRespondToDiscovery: vi.fn().mockReturnValue(false),
        onResponseSent: onResponseSentSpy,
      });

      await callbackWallet.enable();
      await callbackWallet.handleDiscoveryRequest(mockRequest, 'https://trusted-dapp.com', 123);

      // onResponseSent should NOT be called if shouldRespondToDiscovery rejects
      expect(onResponseSentSpy).not.toHaveBeenCalled();
    });

    it('should work without onResponseSent callback (backward compatibility)', async () => {
      const noCallbackWallet = createTestWalletDiscovery({
        responderInfo: mockResponderInfo,
        securityPolicy: {
          requireHttps: true,
          allowedOrigins: ['https://trusted-dapp.com'],
        },
        // No onResponseSent callback
      });

      await noCallbackWallet.enable();

      // Should not throw error
      await expect(
        noCallbackWallet.handleDiscoveryRequest(mockRequest, 'https://trusted-dapp.com', 123),
      ).resolves.not.toThrow();

      expect(noCallbackWallet.getStats().announcementsSent).toBe(1);
    });

    it('should call both callbacks in correct order', async () => {
      const callOrder: string[] = [];

      const shouldRespondSpy = vi.fn().mockImplementation(() => {
        callOrder.push('shouldRespond');
        return true;
      });

      const onResponseSentSpy = vi.fn().mockImplementation(() => {
        callOrder.push('onResponseSent');
      });

      const callbackWallet = createTestWalletDiscovery({
        responderInfo: mockResponderInfo,
        securityPolicy: {
          requireHttps: true,
          allowedOrigins: ['https://trusted-dapp.com'],
        },
        shouldRespondToDiscovery: shouldRespondSpy,
        onResponseSent: onResponseSentSpy,
      });

      await callbackWallet.enable();
      await callbackWallet.handleDiscoveryRequest(mockRequest, 'https://trusted-dapp.com', 123);

      expect(callOrder).toEqual(['shouldRespond', 'onResponseSent']);
      expect(shouldRespondSpy).toHaveBeenCalledWith('https://trusted-dapp.com');
      expect(onResponseSentSpy).toHaveBeenCalledWith('https://trusted-dapp.com');
    });

    it('should pass same origin to both callbacks', async () => {
      const shouldRespondSpy = vi.fn().mockReturnValue(true);
      const onResponseSentSpy = vi.fn();

      const callbackWallet = createTestWalletDiscovery({
        responderInfo: mockResponderInfo,
        securityPolicy: {
          requireHttps: true,
          allowedOrigins: ['https://test-origin.com'],
        },
        shouldRespondToDiscovery: shouldRespondSpy,
        onResponseSent: onResponseSentSpy,
      });

      await callbackWallet.enable();
      await callbackWallet.handleDiscoveryRequest(mockRequest, 'https://test-origin.com', 123);

      expect(shouldRespondSpy).toHaveBeenCalledWith('https://test-origin.com');
      expect(onResponseSentSpy).toHaveBeenCalledWith('https://test-origin.com');
    });
  });
});
