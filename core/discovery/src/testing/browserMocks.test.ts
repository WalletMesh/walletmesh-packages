/**
 * Tests for browser environment mocking utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  mockBrowserEnvironment,
  restoreBrowserEnvironment,
  withMockWindow,
  createMockLocation,
  createMockWindow,
  createMultipleMockWindows,
  isMockBrowserEnvironment,
  type MockWindowConfig,
} from './browserMocks.js';
import { setupFakeTimers, cleanupFakeTimers } from './timingHelpers.js';

describe('browserMocks', () => {
  let originalWindow: Window | undefined;

  beforeEach(() => {
    setupFakeTimers();
    // Store original window if it exists
    if (typeof globalThis.window !== 'undefined') {
      originalWindow = globalThis.window;
    }
  });

  afterEach(() => {
    cleanupFakeTimers();
    // Always restore environment
    restoreBrowserEnvironment();
    // Restore original window if it existed
    if (originalWindow) {
      globalThis.window = originalWindow as Window & typeof globalThis;
    }
  });

  describe('mockBrowserEnvironment', () => {
    it('should create mock window with default configuration', () => {
      mockBrowserEnvironment();

      expect(globalThis.window).toBeDefined();
      expect(globalThis.window.location).toBeDefined();
      expect(globalThis.window.location.origin).toBe('https://localhost:3000');
      expect(globalThis.window.location.hostname).toBe('localhost');
      expect(globalThis.window.location.protocol).toBe('https:');
    });

    it('should create mock window with custom origin', () => {
      const config: MockWindowConfig = {
        origin: 'https://dapp.example.com',
      };

      mockBrowserEnvironment(config);

      expect(globalThis.window.location.origin).toBe('https://dapp.example.com');
      expect(globalThis.window.location.hostname).toBe('dapp.example.com');
      expect(globalThis.window.location.protocol).toBe('https:');
    });

    it('should create mock window with custom href', () => {
      const config: MockWindowConfig = {
        origin: 'https://example.com',
        href: 'https://example.com/custom-path',
      };

      mockBrowserEnvironment(config);

      expect(globalThis.window.location.href).toBe('https://example.com/custom-path');
      expect(globalThis.window.location.origin).toBe('https://example.com');
    });

    it('should create mock window with custom hostname', () => {
      const config: MockWindowConfig = {
        origin: 'https://example.com',
        hostname: 'custom-host.com',
      };

      mockBrowserEnvironment(config);

      expect(globalThis.window.location.hostname).toBe('custom-host.com');
    });

    it('should create mock window with custom protocol', () => {
      const config: MockWindowConfig = {
        origin: 'https://example.com',
        protocol: 'http:',
      };

      mockBrowserEnvironment(config);

      expect(globalThis.window.location.protocol).toBe('http:');
    });

    it('should create mock window with custom port', () => {
      const config: MockWindowConfig = {
        origin: 'https://example.com:8080',
        port: '9000',
      };

      mockBrowserEnvironment(config);

      expect(globalThis.window.location.port).toBe('9000');
    });

    it('should create mock window with custom pathname', () => {
      const config: MockWindowConfig = {
        origin: 'https://example.com',
        pathname: '/custom/path',
      };

      mockBrowserEnvironment(config);

      expect(globalThis.window.location.pathname).toBe('/custom/path');
    });

    it('should handle invalid origin URL gracefully', () => {
      const config: MockWindowConfig = {
        origin: 'invalid-url',
      };

      mockBrowserEnvironment(config);

      expect(globalThis.window.location.origin).toBe('invalid-url');
      expect(globalThis.window.location.hostname).toBe('localhost');
      expect(globalThis.window.location.protocol).toBe('https:');
    });

    it('should add custom properties to window', () => {
      const config: MockWindowConfig = {
        origin: 'https://example.com',
        customProperties: {
          ethereum: { request: vi.fn() },
          solana: { connect: vi.fn() },
          customProp: 'test-value',
        },
      };

      mockBrowserEnvironment(config);

      expect(
        (globalThis.window as Window & typeof globalThis & Record<string, unknown>)['ethereum'],
      ).toBeDefined();
      expect(
        (globalThis.window as Window & typeof globalThis & Record<string, unknown>)['solana'],
      ).toBeDefined();
      expect((globalThis.window as Window & typeof globalThis & Record<string, unknown>)['customProp']).toBe(
        'test-value',
      );
    });

    it('should provide crypto.randomUUID when not available', () => {
      // Skip test if crypto is read-only in this environment
      try {
        Object.defineProperty(globalThis, 'crypto', {
          value: undefined,
          writable: true,
          configurable: true,
        });
      } catch {
        // crypto is read-only, test window.crypto instead
        mockBrowserEnvironment();

        expect(globalThis.window.crypto).toBeDefined();
        expect(globalThis.window.crypto.randomUUID).toBeDefined();
        expect(typeof globalThis.window.crypto.randomUUID()).toBe('string');
        return;
      }

      mockBrowserEnvironment();

      expect(globalThis.window.crypto).toBeDefined();
      expect(globalThis.window.crypto.randomUUID).toBeDefined();
      expect(typeof globalThis.window.crypto.randomUUID()).toBe('string');
    });

    it('should use existing crypto when available', () => {
      // Skip test if crypto is read-only
      try {
        const originalCrypto = globalThis.crypto;
        const mockRandomUUID = vi.fn(() => 'test-uuid');
        Object.defineProperty(globalThis, 'crypto', {
          value: {
            randomUUID: mockRandomUUID,
            subtle: {} as SubtleCrypto,
            getRandomValues: vi.fn() as Crypto['getRandomValues'],
          } as Crypto,
          writable: true,
          configurable: true,
        });

        mockBrowserEnvironment();

        expect(globalThis.window.crypto.randomUUID).toBe(mockRandomUUID);

        // Restore crypto
        Object.defineProperty(globalThis, 'crypto', {
          value: originalCrypto,
          writable: true,
          configurable: true,
        });
      } catch {
        // crypto is read-only, just verify window has crypto
        mockBrowserEnvironment();
        expect(globalThis.window.crypto).toBeDefined();
        expect(globalThis.window.crypto.randomUUID).toBeDefined();
      }
    });

    it('should store original window for restoration', () => {
      const testWindow = { test: 'original' } as unknown as Window & typeof globalThis;
      globalThis.window = testWindow;

      mockBrowserEnvironment();

      expect(globalThis.window).not.toBe(testWindow);
      expect(globalThis.window.location).toBeDefined();
    });
  });

  describe('restoreBrowserEnvironment', () => {
    it('should restore original window when it existed', () => {
      const testWindow = { test: 'original' } as unknown as Window & typeof globalThis;
      globalThis.window = testWindow;

      mockBrowserEnvironment();
      expect(globalThis.window).not.toBe(testWindow);

      restoreBrowserEnvironment();
      expect(globalThis.window).toBe(testWindow);
    });

    it('should remove window when it did not exist originally', () => {
      // Ensure no window exists
      (globalThis as unknown as Record<string, unknown>)['window'] = undefined;

      mockBrowserEnvironment();
      expect(globalThis.window).toBeDefined();

      restoreBrowserEnvironment();
      expect((globalThis as unknown as Record<string, unknown>)['window']).toBeUndefined();
    });

    it('should handle multiple calls gracefully', () => {
      mockBrowserEnvironment();
      restoreBrowserEnvironment();
      restoreBrowserEnvironment(); // Should not throw

      expect(() => restoreBrowserEnvironment()).not.toThrow();
    });
  });

  describe('withMockWindow', () => {
    it('should execute function with mocked window', async () => {
      const config: MockWindowConfig = {
        origin: 'https://app.example.com',
      };

      const result = await withMockWindow(config, () => {
        expect(globalThis.window.location.origin).toBe('https://app.example.com');
        return 'test-result';
      });

      expect(result).toBe('test-result');
    });

    it('should execute async function with mocked window', async () => {
      const config: MockWindowConfig = {
        origin: 'https://async-example.com',
      };

      const result = await withMockWindow(config, async () => {
        // Use process.nextTick instead of setTimeout to avoid timer issues
        await new Promise((resolve) => process.nextTick(resolve));
        expect(globalThis.window.location.origin).toBe('https://async-example.com');
        return 'async-result';
      });

      expect(result).toBe('async-result');
    });

    it('should restore environment after successful execution', async () => {
      const originalWindow = globalThis.window;

      await withMockWindow({ origin: 'https://example.com' }, () => {
        expect(globalThis.window.location.origin).toBe('https://example.com');
      });

      // Environment should be restored
      if (originalWindow) {
        expect(globalThis.window).toBe(originalWindow);
      } else {
        expect((globalThis as unknown as Record<string, unknown>)['window']).toBeUndefined();
      }
    });

    it('should restore environment after function throws', async () => {
      const originalWindow = globalThis.window;

      await expect(
        withMockWindow({ origin: 'https://example.com' }, () => {
          throw new Error('Test error');
        }),
      ).rejects.toThrow('Test error');

      // Environment should still be restored
      if (originalWindow) {
        expect(globalThis.window).toBe(originalWindow);
      } else {
        expect((globalThis as unknown as Record<string, unknown>)['window']).toBeUndefined();
      }
    });

    it('should work with custom properties', async () => {
      const config: MockWindowConfig = {
        origin: 'https://custom-example.com',
        customProperties: {
          testProp: 'test-value',
        },
      };

      await withMockWindow(config, () => {
        expect((globalThis.window as Window & typeof globalThis & Record<string, unknown>)['testProp']).toBe(
          'test-value',
        );
      });
    });
  });

  describe('createMockLocation', () => {
    it('should create location with valid URL', () => {
      const location = createMockLocation('https://example.com:8080/path?query=1#hash');

      expect(location.origin).toBe('https://example.com:8080/path?query=1#hash');
      expect(location.href).toBe('https://example.com:8080/path?query=1#hash');
      expect(location.hostname).toBe('example.com');
      expect(location.protocol).toBe('https:');
      expect(location.port).toBe('8080');
      expect(location.pathname).toBe('/path');
      expect(location.search).toBe('?query=1');
      expect(location.hash).toBe('#hash');
      expect(location.host).toBe('example.com:8080');
    });

    it('should create location without port', () => {
      const location = createMockLocation('https://example.com/path');

      expect(location.hostname).toBe('example.com');
      expect(location.port).toBe('');
      expect(location.host).toBe('example.com');
    });

    it('should handle invalid URL gracefully', () => {
      const location = createMockLocation('invalid-url');

      expect(location.origin).toBe('invalid-url');
      expect(location.href).toBe('invalid-url');
      expect(location.hostname).toBe('localhost');
      expect(location.protocol).toBe('https:');
    });

    it('should provide location methods', () => {
      const location = createMockLocation('https://example.com');

      expect(typeof location.assign).toBe('function');
      expect(typeof location.reload).toBe('function');
      expect(typeof location.replace).toBe('function');
      expect(typeof location.toString).toBe('function');

      expect(location.toString()).toBe('https://example.com');
    });

    it('should provide ancestorOrigins property', () => {
      const location = createMockLocation('https://example.com');

      expect(location.ancestorOrigins).toBeDefined();
      expect(Array.isArray(location.ancestorOrigins)).toBe(true);
    });
  });

  describe('createMockWindow', () => {
    it('should create window with default configuration', () => {
      const window = createMockWindow();

      expect(window.location).toBeDefined();
      expect(window.location.origin).toBe('https://localhost:3000');
      expect(window.origin).toBe('https://localhost:3000');
      expect(window.crypto).toBeDefined();
    });

    it('should create window with custom origin', () => {
      const config: MockWindowConfig = {
        origin: 'https://custom-window.com',
      };

      const window = createMockWindow(config);

      expect(window.location.origin).toBe('https://custom-window.com');
      expect(window.origin).toBe('https://custom-window.com');
    });

    it('should include custom properties', () => {
      const config: MockWindowConfig = {
        origin: 'https://example.com',
        customProperties: {
          ethereum: { isMetaMask: true },
          customValue: 42,
        },
      };

      const window = createMockWindow(config);

      expect((window as Window & typeof globalThis & Record<string, unknown>)['ethereum']).toEqual({
        isMetaMask: true,
      });
      expect((window as Window & typeof globalThis & Record<string, unknown>)['customValue']).toBe(42);
    });

    it('should provide event methods', () => {
      const window = createMockWindow();

      expect(typeof window.addEventListener).toBe('function');
      expect(typeof window.removeEventListener).toBe('function');
      expect(typeof window.dispatchEvent).toBe('function');

      expect(window.dispatchEvent({} as unknown as Event)).toBe(true);
    });

    it('should provide console methods', () => {
      const window = createMockWindow() as Window & typeof globalThis;

      expect(window.console).toBeDefined();
      expect(typeof window.console.log).toBe('function');
      expect(typeof window.console.warn).toBe('function');
      expect(typeof window.console.error).toBe('function');
      expect(typeof window.console.info).toBe('function');
      expect(typeof window.console.debug).toBe('function');
    });

    it('should provide crypto with getRandomValues', () => {
      const window = createMockWindow();

      expect(window.crypto.getRandomValues).toBeDefined();

      const array = new Uint8Array(10);
      const result = window.crypto.getRandomValues(array);

      expect(result).toBe(array);
      expect(array.every((val) => val >= 0 && val <= 255)).toBe(true);
    });
  });

  describe('createMultipleMockWindows', () => {
    it('should create multiple windows with different origins', () => {
      const origins = ['https://dapp1.com', 'https://dapp2.com', 'https://wallet.com'];

      const windows = createMultipleMockWindows(origins);

      expect(windows).toHaveLength(3);
      expect(windows[0]?.location.origin).toBe('https://dapp1.com');
      expect(windows[1]?.location.origin).toBe('https://dapp2.com');
      expect(windows[2]?.location.origin).toBe('https://wallet.com');
    });

    it('should create empty array for empty origins', () => {
      const windows = createMultipleMockWindows([]);

      expect(windows).toHaveLength(0);
    });

    it('should handle single origin', () => {
      const windows = createMultipleMockWindows(['https://single.com']);

      expect(windows).toHaveLength(1);
      expect(windows[0]?.location.origin).toBe('https://single.com');
    });
  });

  describe('isMockBrowserEnvironment', () => {
    it('should return false when no window exists', () => {
      (globalThis as unknown as Record<string, unknown>)['window'] = undefined;

      expect(isMockBrowserEnvironment()).toBe(false);
    });

    it('should return false when window has no location', () => {
      globalThis.window = {} as unknown as Window & typeof globalThis;

      expect(isMockBrowserEnvironment()).toBe(false);
    });

    it('should return false when location has no origin', () => {
      globalThis.window = { location: {} } as unknown as Window & typeof globalThis;

      expect(isMockBrowserEnvironment()).toBe(false);
    });

    it('should return true when mock environment is active', () => {
      mockBrowserEnvironment();

      expect(isMockBrowserEnvironment()).toBe(true);
    });

    it('should return true with custom mock window', () => {
      globalThis.window = {
        location: {
          origin: 'https://example.com',
        },
      } as unknown as Window & typeof globalThis;

      expect(isMockBrowserEnvironment()).toBe(true);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle missing globalThis gracefully', () => {
      // This test ensures the code doesn't break in unusual environments
      expect(() => mockBrowserEnvironment()).not.toThrow();
      expect(() => restoreBrowserEnvironment()).not.toThrow();
    });

    it('should handle URL parsing errors', () => {
      const config: MockWindowConfig = {
        origin: ':::invalid:::url:::',
      };

      expect(() => mockBrowserEnvironment(config)).not.toThrow();
      expect(globalThis.window.location.origin).toBe(':::invalid:::url:::');
    });

    it('should handle complex URL structures', () => {
      const complexUrl =
        'https://user:pass@sub.example.com:8080/path/to/resource?query=value&other=123#section';

      const config: MockWindowConfig = {
        origin: complexUrl,
      };

      mockBrowserEnvironment(config);

      expect(globalThis.window.location.origin).toBe(complexUrl);
      expect(globalThis.window.location.hostname).toBe('sub.example.com');
      expect(globalThis.window.location.port).toBe('8080');
    });
  });
});
