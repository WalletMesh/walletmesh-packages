import { describe, it, expect } from 'vitest';
import {
  isBaseWalletInfo,
  isWebWalletInfo,
  isExtensionWalletInfo,
  isDiscoveryRequestEvent,
  isDiscoveryResponseEvent,
  isDiscoveryAckEvent,
} from './guards.js';
import { WM_PROTOCOL_VERSION } from './constants.js';
import type { WalletInfo } from './types.js';

// Example data URI for a small test icon (1x1 pixel transparent PNG)
const TEST_ICON =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';

describe('Type Guards', () => {
  describe('isBaseWalletInfo', () => {
    it('should return true for a valid BaseWalletInfo object', () => {
      const validWalletInfo = {
        name: 'Test Wallet',
        icon: TEST_ICON,
        rdns: 'com.test.wallet',
        technologies: ['test-tech'],
      };

      expect(isBaseWalletInfo(validWalletInfo)).toBe(true);
    });

    it('should return false if it is not an object', () => {
      expect(isBaseWalletInfo('not an object')).toBe(false);
    });

    it('should return false if it is null', () => {
      expect(isBaseWalletInfo(null)).toBe(false);
    });

    it('should return true for a valid BaseWalletInfo object without technologies', () => {
      const validWalletInfo = {
        name: 'Test Wallet',
        icon: TEST_ICON,
        rdns: 'com.test.wallet',
      };

      expect(isBaseWalletInfo(validWalletInfo)).toBe(true);
    });

    it('should return false if technologies is not an array of strings', () => {
      const invalidWalletInfo = {
        name: 'Test Wallet',
        icon: TEST_ICON,
        rdns: 'com.test.wallet',
        technologies: [123],
      };

      expect(isBaseWalletInfo(invalidWalletInfo)).toBe(false);
    });

    it('should return false if technologies is an array of blank strings', () => {
      const invalidWalletInfo = {
        name: 'Test Wallet',
        icon: TEST_ICON,
        rdns: 'com.test.wallet',
        technologies: [''],
      };

      expect(isBaseWalletInfo(invalidWalletInfo)).toBe(false);
    });

    it('should return false if technologies is an empty array', () => {
      const invalidWalletInfo = {
        name: 'Test Wallet',
        icon: TEST_ICON,
        rdns: 'com.test.wallet',
        technologies: [],
      };

      expect(isBaseWalletInfo(invalidWalletInfo)).toBe(false);
    });

    it('should return false if name is not a string', () => {
      const invalidWalletInfo = {
        name: 123,
        icon: TEST_ICON,
        rdns: 'com.test.wallet',
      };

      expect(isBaseWalletInfo(invalidWalletInfo)).toBe(false);
    });

    it('should return false if icon is not a string', () => {
      const invalidWalletInfo = {
        name: 'Test Wallet',
        icon: 123,
        rdns: 'com.test.wallet',
      };

      expect(isBaseWalletInfo(invalidWalletInfo)).toBe(false);
    });

    it('should return false if icon is not a data URI', () => {
      const invalidWalletInfo = {
        name: 'Test Wallet',
        icon: 'https://example.com/icon.png',
        rdns: 'com.test.wallet',
      };

      expect(isBaseWalletInfo(invalidWalletInfo)).toBe(false);
    });

    it('should return false if rdns is not a string', () => {
      const invalidWalletInfo = {
        name: 'Test Wallet',
        icon: TEST_ICON,
        rdns: 123,
      };

      expect(isBaseWalletInfo(invalidWalletInfo)).toBe(false);
    });
  });

  describe('isWebWalletInfo', () => {
    it('should return true for a valid WebWalletInfo object', () => {
      const validWebWallet = {
        name: 'Test Wallet',
        icon: TEST_ICON,
        rdns: 'com.test.wallet',
        url: 'https://test.wallet',
        technologies: ['test-tech'],
      };

      expect(isWebWalletInfo(validWebWallet)).toBe(true);
    });

    it('should return true for a valid WebWalletInfo object without technologies', () => {
      const validWebWallet = {
        name: 'Test Wallet',
        icon: TEST_ICON,
        rdns: 'com.test.wallet',
        url: 'https://test.wallet',
      };

      expect(isWebWalletInfo(validWebWallet)).toBe(true);
    });

    it('should return false if name is not a string', () => {
      const invalidWebWallet = {
        name: 123,
        icon: TEST_ICON,
        rdns: 'com.test.wallet',
        url: 'https://test.wallet',
      };

      expect(isWebWalletInfo(invalidWebWallet)).toBe(false);
    });

    it('should return false if icon is not a string', () => {
      const invalidWebWallet = {
        name: 'Test Wallet',
        icon: 123,
        rdns: 'com.test.wallet',
        url: 'https://test.wallet',
      };

      expect(isWebWalletInfo(invalidWebWallet)).toBe(false);
    });

    it('should return false if rdns is not a string', () => {
      const invalidWebWallet = {
        name: 'Test Wallet',
        icon: TEST_ICON,
        rdns: 123,
        url: 'https://test.wallet',
      };

      expect(isWebWalletInfo(invalidWebWallet)).toBe(false);
    });

    it('should return false if url is not a string', () => {
      const invalidWebWallet = {
        name: 'Test Wallet',
        icon: TEST_ICON,
        rdns: 'com.test.wallet',
        url: 123,
      };

      expect(isWebWalletInfo(invalidWebWallet)).toBe(false);
    });

    it('should return false if code is defined', () => {
      const invalidWebWallet = {
        name: 'Test Wallet',
        icon: TEST_ICON,
        rdns: 'com.test.wallet',
        url: 'https://test.wallet',
        code: 'test-code',
      };

      expect(isWebWalletInfo(invalidWebWallet)).toBe(false);
    });

    it('should return false if extensionId is defined', () => {
      const invalidWebWallet = {
        name: 'Test Wallet',
        icon: TEST_ICON,
        rdns: 'com.test.wallet',
        url: 'https://test.wallet',
        extensionId: 'test-extension-id',
      };

      expect(isWebWalletInfo(invalidWebWallet)).toBe(false);
    });
  });

  describe('isExtensionWalletInfo', () => {
    it('should return true for a valid ExtensionWalletInfo object', () => {
      const validExtensionWallet = {
        name: 'Test Wallet',
        icon: TEST_ICON,
        rdns: 'com.test.wallet',
        extensionId: 'test-extension-id',
        code: 'test-code',
        technologies: ['test-tech'],
      };

      expect(isExtensionWalletInfo(validExtensionWallet)).toBe(true);
    });

    it('should return true for a valid ExtensionWalletInfo object without technologies', () => {
      const validExtensionWallet = {
        name: 'Test Wallet',
        icon: TEST_ICON,
        rdns: 'com.test.wallet',
        extensionId: 'test-extension-id',
        code: 'test-code',
      };

      expect(isExtensionWalletInfo(validExtensionWallet)).toBe(true);
    });

    it('should return true for a valid ExtensionWalletInfo object without code', () => {
      const validExtensionWallet = {
        name: 'Test Wallet',
        icon: TEST_ICON,
        rdns: 'com.test.wallet',
        extensionId: 'test-extension-id',
      };

      expect(isExtensionWalletInfo(validExtensionWallet)).toBe(true);
    });

    it('should return false if name is not a string', () => {
      const invalidExtensionWallet = {
        name: 123,
        icon: TEST_ICON,
        rdns: 'com.test.wallet',
        extensionId: 'test-extension-id',
      };

      expect(isExtensionWalletInfo(invalidExtensionWallet)).toBe(false);
    });

    it('should return false if icon is not a string', () => {
      const invalidExtensionWallet = {
        name: 'Test Wallet',
        icon: 123,
        rdns: 'com.test.wallet',
        extensionId: 'test-extension-id',
      };

      expect(isExtensionWalletInfo(invalidExtensionWallet)).toBe(false);
    });

    it('should return false if rdns is not a string', () => {
      const invalidExtensionWallet = {
        name: 'Test Wallet',
        icon: TEST_ICON,
        rdns: 123,
        extensionId: 'test-extension-id',
      };

      expect(isExtensionWalletInfo(invalidExtensionWallet)).toBe(false);
    });

    it('should return false if extensionId is not a string', () => {
      const invalidExtensionWallet = {
        name: 'Test Wallet',
        icon: TEST_ICON,
        rdns: 'com.test.wallet',
        extensionId: 123,
      };

      expect(isExtensionWalletInfo(invalidExtensionWallet)).toBe(false);
    });

    it('should return false if code is not a string or undefined', () => {
      const invalidExtensionWallet = {
        name: 'Test Wallet',
        icon: TEST_ICON,
        rdns: 'com.test.wallet',
        extensionId: 'test-extension-id',
        code: 123,
      };

      expect(isExtensionWalletInfo(invalidExtensionWallet)).toBe(false);
    });

    it('should return false if url is defined', () => {
      const invalidExtensionWallet = {
        name: 'Test Wallet',
        icon: TEST_ICON,
        rdns: 'com.test.wallet',
        extensionId: 'test-extension-id',
        url: 'https://test.wallet',
      };

      expect(isExtensionWalletInfo(invalidExtensionWallet)).toBe(false);
    });
  });

  describe('isDiscoveryRequestEvent', () => {
    it('should return true for a valid DiscoveryRequestEvent object', () => {
      const validEvent = {
        version: WM_PROTOCOL_VERSION,
        discoveryId: 'test-discovery-id',
        technologies: ['test-tech'],
      };

      expect(isDiscoveryRequestEvent(validEvent)).toBe(true);
    });

    it('should return false if it is not an object', () => {
      expect(isDiscoveryRequestEvent('not an object')).toBe(false);
    });

    it('should return false if it is null', () => {
      expect(isDiscoveryRequestEvent(null)).toBe(false);
    });

    it('should return false if version is incorrect', () => {
      const invalidEvent = {
        version: '0.0.0',
        discoveryId: 'test-discovery-id',
      };

      expect(isDiscoveryRequestEvent(invalidEvent)).toBe(false);
    });

    it('should return false if discoveryId is not a string', () => {
      const invalidEvent = {
        version: WM_PROTOCOL_VERSION,
        discoveryId: 123,
      };

      expect(isDiscoveryRequestEvent(invalidEvent)).toBe(false);
    });

    it('should return true if technologies is undefined', () => {
      const validEvent = {
        version: WM_PROTOCOL_VERSION,
        discoveryId: 'test-discovery-id',
      };

      expect(isDiscoveryRequestEvent(validEvent)).toBe(true);
    });

    it('should return false if technologies is not an array', () => {
      const invalidEvent = {
        version: WM_PROTOCOL_VERSION,
        discoveryId: 'test-discovery-id',
        technologies: 'not-an-array',
      };

      expect(isDiscoveryRequestEvent(invalidEvent)).toBe(false);
    });

    it('should return false if technology is not a string', () => {
      const invalidEvent = {
        version: WM_PROTOCOL_VERSION,
        discoveryId: 'test-discovery-id',
        technologies: [123],
      };

      expect(isDiscoveryRequestEvent(invalidEvent)).toBe(false);
    });

    it('should return false if technology is a blank string', () => {
      const invalidEvent = {
        version: WM_PROTOCOL_VERSION,
        discoveryId: 'test-discovery-id',
        technologies: [''],
      };

      expect(isDiscoveryRequestEvent(invalidEvent)).toBe(false);
    });

    it('should return false if technology is an empty array', () => {
      const invalidEvent = {
        version: WM_PROTOCOL_VERSION,
        discoveryId: 'test-discovery-id',
        technologies: [],
      };

      expect(isDiscoveryRequestEvent(invalidEvent)).toBe(false);
    });
  });

  describe('isDiscoveryResponseEvent', () => {
    it('should return true for a valid DiscoveryResponseEvent object', () => {
      const validEvent = {
        version: WM_PROTOCOL_VERSION,
        discoveryId: 'test-discovery-id',
        wallet: {
          name: 'Test Wallet',
          icon: TEST_ICON,
          rdns: 'com.test.wallet',
        } as WalletInfo,
        walletId: 'test-wallet-id',
      };

      expect(isDiscoveryResponseEvent(validEvent)).toBe(true);
    });

    it('should return false if it is not an object', () => {
      expect(isDiscoveryResponseEvent('not an object')).toBe(false);
    });

    it('should return false if it is null', () => {
      expect(isDiscoveryResponseEvent(null)).toBe(false);
    });

    it('should return false if version is incorrect', () => {
      const invalidEvent = {
        version: '0.0.0',
        discoveryId: 'test-discovery-id',
        wallet: {
          name: 'Test Wallet',
          icon: TEST_ICON,
          rdns: 'com.test.wallet',
        } as WalletInfo,
        walletId: 'test-wallet-id',
      };

      expect(isDiscoveryResponseEvent(invalidEvent)).toBe(false);
    });

    it('should return false if discoveryId is not a string', () => {
      const invalidEvent = {
        version: WM_PROTOCOL_VERSION,
        discoveryId: 123,
        wallet: {
          name: 'Test Wallet',
          icon: TEST_ICON,
          rdns: 'com.test.wallet',
        } as WalletInfo,
        walletId: 'test-wallet-id',
      };

      expect(isDiscoveryResponseEvent(invalidEvent)).toBe(false);
    });

    it('should return false if wallet is missing', () => {
      const invalidEvent = {
        version: WM_PROTOCOL_VERSION,
        discoveryId: 'test-discovery-id',
        walletId: 'test-wallet-id',
      };

      expect(isDiscoveryResponseEvent(invalidEvent)).toBe(false);
    });

    it('should return false if wallet is not an object', () => {
      const invalidEvent = {
        version: WM_PROTOCOL_VERSION,
        discoveryId: 'test-discovery-id',
        wallet: 'not an object',
        walletId: 'test-wallet-id',
      };

      expect(isDiscoveryResponseEvent(invalidEvent)).toBe(false);
    });

    it('should return false if walletId is not a string', () => {
      const invalidEvent = {
        version: WM_PROTOCOL_VERSION,
        discoveryId: 'test-discovery-id',
        wallet: {
          name: 'Test Wallet',
          icon: TEST_ICON,
          rdns: 'com.test.wallet',
        } as WalletInfo,
        walletId: 123,
      };

      expect(isDiscoveryResponseEvent(invalidEvent)).toBe(false);
    });
  });

  describe('isDiscoveryAckEvent', () => {
    it('should return true for a valid DiscoveryAckEvent object', () => {
      const validEvent = {
        version: WM_PROTOCOL_VERSION,
        discoveryId: 'test-discovery-id',
        walletId: 'test-wallet-id',
      };

      expect(isDiscoveryAckEvent(validEvent)).toBe(true);
    });

    it('should return false if it is not an object', () => {
      expect(isDiscoveryAckEvent('not an object')).toBe(false);
    });

    it('should return false if it is null', () => {
      expect(isDiscoveryAckEvent(null)).toBe(false);
    });

    it('should return false if version is incorrect', () => {
      const invalidEvent = {
        version: '0.0.0',
        discoveryId: 'test-discovery-id',
        walletId: 'test-wallet-id',
      };

      expect(isDiscoveryAckEvent(invalidEvent)).toBe(false);
    });

    it('should return false if discoveryId is not a string', () => {
      const invalidEvent = {
        version: WM_PROTOCOL_VERSION,
        discoveryId: 123,
        walletId: 'test-wallet-id',
      };

      expect(isDiscoveryAckEvent(invalidEvent)).toBe(false);
    });

    it('should return false if walletId is not a string', () => {
      const invalidEvent = {
        version: WM_PROTOCOL_VERSION,
        discoveryId: 'test-discovery-id',
        walletId: 123,
      };

      expect(isDiscoveryAckEvent(invalidEvent)).toBe(false);
    });
  });
});
