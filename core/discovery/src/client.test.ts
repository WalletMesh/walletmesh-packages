import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { DiscoveryAnnouncer, createWebWalletAnnouncer, createExtensionWalletAnnouncer } from './client.js';
import type {
  WalletInfo,
  DiscoveryRequestEvent,
  DiscoveryResponseEvent,
  DiscoveryAckEvent,
} from './types.js';
import { WM_PROTOCOL_VERSION, WmDiscovery } from './constants.js';

// Example data URI for a small test icon (1x1 pixel transparent PNG)
const TEST_ICON =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';

describe('DiscoveryAnnouncer', () => {
  let mockEventTarget: EventTarget;

  beforeEach(() => {
    mockEventTarget = new EventTarget();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  describe('constructor', () => {
    it('should throw an error if walletInfo is falsy', () => {
      expect(() => {
        new DiscoveryAnnouncer({ walletInfo: undefined as unknown as WalletInfo });
      }).toThrow('Invalid walletInfo: icon is required and must be a string');
    });

    it('should throw an error if walletInfo is invalid', () => {
      const invalidWalletInfo = { name: '', icon: '', rdns: '' };
      expect(() => {
        new DiscoveryAnnouncer({ walletInfo: invalidWalletInfo as WalletInfo });
      }).toThrow(/Invalid walletInfo:/);
    });

    it('should throw an error if icon is not a data URI', () => {
      const invalidWalletInfo = {
        name: 'Test Wallet',
        icon: 'https://example.com/icon.png',
        rdns: 'com.example.testwallet',
      };

      expect(() => {
        new DiscoveryAnnouncer({ walletInfo: invalidWalletInfo as WalletInfo });
      }).toThrow(/Invalid walletInfo: icon must be a data URI/);
    });
  });

  describe('event handling', () => {
    it('should handle invalid discovery request event', () => {
      const announcer = createWebWalletAnnouncer(
        'Test Wallet',
        TEST_ICON,
        'com.test.wallet',
        'https://test.wallet',
      );
      announcer['eventTarget'] = mockEventTarget;

      const responseHandler = vi.fn();
      mockEventTarget.addEventListener(WmDiscovery.Response, responseHandler);

      const invalidEvent = new CustomEvent<DiscoveryRequestEvent>(WmDiscovery.Request, {
        detail: {
          version: '0.0.0' as typeof WM_PROTOCOL_VERSION,
          discoveryId: 'test-id',
        },
      });

      announcer['handleDiscoveryRequestEvent'](invalidEvent);

      expect(responseHandler).not.toHaveBeenCalled();
    });

    it('should handle undefined request event detail', () => {
      const announcer = createWebWalletAnnouncer(
        'Test Wallet',
        TEST_ICON,
        'com.test.wallet',
        'https://test.wallet',
      );
      announcer['eventTarget'] = mockEventTarget;

      const responseHandler = vi.fn();
      mockEventTarget.addEventListener(WmDiscovery.Response, responseHandler);

      announcer['handleDiscoveryRequestEvent'](new CustomEvent<DiscoveryRequestEvent>(WmDiscovery.Request));

      expect(responseHandler).not.toHaveBeenCalled();
    });

    it('should return early if callback rejects origin', () => {
      const callback = vi.fn().mockReturnValue(false);
      const announcer = createWebWalletAnnouncer(
        'Test Wallet',
        TEST_ICON,
        'com.test.wallet',
        'https://test.wallet',
        undefined,
        callback,
      );
      announcer['eventTarget'] = mockEventTarget;

      const responseHandler = vi.fn();
      mockEventTarget.addEventListener(WmDiscovery.Response, responseHandler);

      const requestEvent = new CustomEvent<DiscoveryRequestEvent>(WmDiscovery.Request, {
        detail: {
          version: WM_PROTOCOL_VERSION,
          discoveryId: 'test-id',
        },
      });

      announcer['handleDiscoveryRequestEvent'](requestEvent);

      expect(callback).toHaveBeenCalledWith(window.origin);
      expect(responseHandler).not.toHaveBeenCalled();
    });

    it('should handle empty technologies correctly', () => {
      const walletInfo = {
        name: 'Test Wallet',
        icon: TEST_ICON,
        rdns: 'com.test.wallet',
        url: 'https://test.wallet',
      };

      const announcer = new DiscoveryAnnouncer({ walletInfo, eventTarget: mockEventTarget });

      // Add mock implementation to verify event details
      const dispatchSpy = vi.spyOn(mockEventTarget, 'dispatchEvent').mockImplementation((event) => {
        if (event instanceof CustomEvent && event.type === WmDiscovery.Response) {
          const detail = event.detail as DiscoveryResponseEvent;
          expect(detail.wallet.technologies).toBeUndefined();
          expect(detail.discoveryId).toBe('test-id');
          expect(detail.wallet).toEqual(expect.objectContaining(walletInfo));
          return true;
        }
        return true;
      });

      announcer['dispatchDiscoveryResponseEvent']('test-id', []);

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy.mock.calls[0]?.[0]).toBeInstanceOf(CustomEvent);
      expect(dispatchSpy.mock.calls[0]?.[0].type).toBe(WmDiscovery.Response);
    });

    it('should ignore duplicate discovery requests', () => {
      const walletInfo = {
        name: 'Test Wallet',
        icon: TEST_ICON,
        rdns: 'com.test.wallet',
        url: 'https://test.wallet',
      };

      const announcer = new DiscoveryAnnouncer({ walletInfo, eventTarget: mockEventTarget });
      const dispatchSpy = vi.spyOn(mockEventTarget, 'dispatchEvent');

      // First request
      announcer['handleDiscoveryRequestEvent'](
        new CustomEvent<DiscoveryRequestEvent>(WmDiscovery.Request, {
          detail: {
            version: WM_PROTOCOL_VERSION,
            discoveryId: 'test-id',
            technologies: [],
          },
        }),
      );

      // Mark as acknowledged
      announcer['acknowledgedDiscoveryIds'].add('test-id');

      // Clear spy after first request
      dispatchSpy.mockClear();

      // Second request (same ID)
      announcer['handleDiscoveryRequestEvent'](
        new CustomEvent<DiscoveryRequestEvent>(WmDiscovery.Request, {
          detail: {
            version: WM_PROTOCOL_VERSION,
            discoveryId: 'test-id',
            technologies: [],
          },
        }),
      );

      // No new responses should be dispatched
      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('should handle invalid acknowledgment event', () => {
      const walletInfo = {
        name: 'Test Wallet',
        icon: TEST_ICON,
        rdns: 'com.test.wallet',
        url: 'https://test.wallet',
      };

      const announcer = new DiscoveryAnnouncer({ walletInfo, eventTarget: mockEventTarget });

      // Add request to pending set
      announcer['pendingDiscoveryIds'].add('test-id');

      // Send invalid ack event
      const invalidAckEvent = new CustomEvent<DiscoveryAckEvent>(WmDiscovery.Ack, {
        detail: {
          discoveryId: 'test-id',
        } as DiscoveryAckEvent,
      });

      announcer['handleDiscoveryAckEvent'](invalidAckEvent);

      expect(announcer['pendingDiscoveryIds'].has('test-id')).toBe(true);
      expect(announcer['acknowledgedDiscoveryIds'].has('test-id')).toBe(false);
    });

    it('should handle undefined acknowledgment event detail', () => {
      const walletInfo = {
        name: 'Test Wallet',
        icon: TEST_ICON,
        rdns: 'com.test.wallet',
        url: 'https://test.wallet',
      };

      const announcer = new DiscoveryAnnouncer({ walletInfo, eventTarget: mockEventTarget });

      // Add request to pending set
      announcer['pendingDiscoveryIds'].add('test-id');

      announcer['handleDiscoveryAckEvent'](new CustomEvent<DiscoveryAckEvent>(WmDiscovery.Ack));

      expect(announcer['pendingDiscoveryIds'].has('test-id')).toBe(true);
      expect(announcer['acknowledgedDiscoveryIds'].has('test-id')).toBe(false);
    });

    it('should handle non-pending discovery acknowledgments', () => {
      const walletInfo = {
        name: 'Test Wallet',
        icon: TEST_ICON,
        rdns: 'com.test.wallet',
        url: 'https://test.wallet',
      };

      const announcer = new DiscoveryAnnouncer({ walletInfo, eventTarget: mockEventTarget });
      const sessionId = announcer['sessionId'];

      // Send ack event for non-pending discovery
      const ackEvent = new CustomEvent<DiscoveryAckEvent>(WmDiscovery.Ack, {
        detail: {
          version: WM_PROTOCOL_VERSION,
          discoveryId: 'test-id',
          walletId: sessionId,
        },
      });

      announcer['handleDiscoveryAckEvent'](ackEvent);

      expect(announcer['pendingDiscoveryIds'].has('test-id')).toBe(false);
      expect(announcer['acknowledgedDiscoveryIds'].has('test-id')).toBe(false);
    });

    it('should handle mismatched session in acknowledgment', () => {
      const walletInfo = {
        name: 'Test Wallet',
        icon: TEST_ICON,
        rdns: 'com.test.wallet',
        url: 'https://test.wallet',
      };

      const announcer = new DiscoveryAnnouncer({ walletInfo, eventTarget: mockEventTarget });

      // Add request to pending set
      announcer['pendingDiscoveryIds'].add('test-id');

      const ackEvent = new CustomEvent<DiscoveryAckEvent>(WmDiscovery.Ack, {
        detail: {
          version: WM_PROTOCOL_VERSION,
          discoveryId: 'test-id',
          walletId: 'wrong-session-id',
        },
      });

      announcer['handleDiscoveryAckEvent'](ackEvent);

      expect(announcer['pendingDiscoveryIds'].has('test-id')).toBe(true);
      expect(announcer['acknowledgedDiscoveryIds'].has('test-id')).toBe(false);
    });

    it('should handle successful acknowledgment', () => {
      const walletInfo = {
        name: 'Test Wallet',
        icon: TEST_ICON,
        rdns: 'com.test.wallet',
        url: 'https://test.wallet',
      };

      const announcer = new DiscoveryAnnouncer({ walletInfo, eventTarget: mockEventTarget });
      const sessionId = announcer['sessionId'];

      // Add request to pending set
      announcer['pendingDiscoveryIds'].add('test-id');

      const ackEvent = new CustomEvent<DiscoveryAckEvent>(WmDiscovery.Ack, {
        detail: {
          version: WM_PROTOCOL_VERSION,
          discoveryId: 'test-id',
          walletId: sessionId,
        },
      });

      announcer['handleDiscoveryAckEvent'](ackEvent);

      expect(announcer['pendingDiscoveryIds'].has('test-id')).toBe(false);
      expect(announcer['acknowledgedDiscoveryIds'].has('test-id')).toBe(true);
    });

    it('should handle matching technologies correctly', () => {
      const walletInfo = {
        name: 'Test Wallet',
        icon: TEST_ICON,
        rdns: 'com.test.wallet',
        url: 'https://test.wallet',
      };

      const announcer = new DiscoveryAnnouncer({
        walletInfo,
        eventTarget: mockEventTarget,
        supportedTechnologies: ['tech1', 'TECH2'],
      });

      // Set up spy after creating announcer
      const responseHandler = vi.fn();
      mockEventTarget.addEventListener(WmDiscovery.Response, responseHandler);

      // Send request directly
      announcer['handleDiscoveryRequestEvent'](
        new CustomEvent<DiscoveryRequestEvent>(WmDiscovery.Request, {
          detail: {
            version: WM_PROTOCOL_VERSION,
            discoveryId: 'test-id',
            technologies: ['tech1', 'tech2', 'tech3'],
          },
        }),
      );

      // Verify response
      expect(responseHandler).toHaveBeenCalledTimes(1);
      const responseEvent = responseHandler.mock.calls[0]?.[0] as CustomEvent<DiscoveryResponseEvent>;
      expect(responseEvent.detail.wallet.technologies).toEqual(['tech1', 'tech2']);
    });

    it('should handle event dispatch errors gracefully', () => {
      const errorEvent = new Error('Event dispatch failed');
      vi.spyOn(mockEventTarget, 'dispatchEvent').mockImplementation(() => {
        throw errorEvent;
      });

      const announcer = createWebWalletAnnouncer(
        'Test Wallet',
        TEST_ICON,
        'com.test.wallet',
        'https://test.wallet',
      );
      announcer['eventTarget'] = mockEventTarget;

      expect(() => {
        announcer.start();
      }).toThrow(errorEvent);
    });
  });

  describe('createWebWalletAnnouncer', () => {
    it('should create a DiscoveryAnnouncer for web wallets', () => {
      const name = 'Web Wallet';
      const icon = TEST_ICON;
      const rdns = 'com.example.webwallet';
      const url = 'https://example.com';
      const supportedTechnologies = ['tech1', 'tech2'];
      const callback = (origin: string) => origin === 'https://trusted.com';

      const announcer = createWebWalletAnnouncer(name, icon, rdns, url, supportedTechnologies, callback);

      expect(announcer).toBeInstanceOf(DiscoveryAnnouncer);
      expect(announcer['walletInfo']).toEqual({ name, icon, rdns, url });
      expect(announcer['supportedTechnologies']).toEqual(supportedTechnologies);
      expect(announcer['callback']).toBe(callback);
    });
  });

  describe('createExtensionWalletAnnouncer', () => {
    it('should create a DiscoveryAnnouncer for extension wallets', () => {
      const name = 'Extension Wallet';
      const icon = TEST_ICON;
      const rdns = 'com.example.extensionwallet';
      const extensionId = 'extension-id';
      const supportedTechnologies = ['tech1', 'tech2'];
      const code = 'optional-code';
      const callback = (origin: string) => origin === 'https://trusted.com';

      const announcer = createExtensionWalletAnnouncer(
        name,
        icon,
        rdns,
        supportedTechnologies,
        extensionId,
        code,
        callback,
      );

      expect(announcer).toBeInstanceOf(DiscoveryAnnouncer);
      expect(announcer['walletInfo']).toEqual({ name, icon, rdns, extensionId, code });
      expect(announcer['supportedTechnologies']).toEqual(supportedTechnologies);
      expect(announcer['callback']).toBe(callback);
    });

    it('should not create a DiscoveryAnnouncer for extension wallets without an extension id or code', () => {
      const name = 'Extension Wallet';
      const icon = TEST_ICON;
      const rdns = 'com.example.extensionwallet';
      const supportedTechnologies = ['tech1', 'tech2'];

      expect(() => {
        createExtensionWalletAnnouncer(name, icon, rdns, supportedTechnologies);
      }).toThrowError('Extension ID or code is required for extension wallets');
    });
  });
});
