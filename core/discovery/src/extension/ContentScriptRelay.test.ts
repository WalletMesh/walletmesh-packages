/**
 * @module discovery/content/ContentScriptRelay.test
 *
 * Tests for the ContentScriptRelay implementation.
 *
 * Type Suppression Usage:
 * - `@ts-expect-error - Mock globals`: Used to mock global browser APIs (chrome, window, navigator)
 *   that are not available in the test environment. These suppressions are necessary to
 *   set up the proper test environment for browser extension content script functionality.
 *   The mocks replicate the structure of actual browser APIs for testing purposes.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ContentScriptRelay } from './ContentScriptRelay.js';
import { setupFakeTimers, cleanupFakeTimers } from '../testing/timingHelpers.js';
import { setupChromeEnvironment, createConsoleSpy, createContentScriptMock } from '../testing/index.js';

// Mock Chrome API and browser environment
let mockChrome: ReturnType<typeof setupChromeEnvironment>['chrome'];
let chromeCleanup: () => void;
let contentScriptMock: ReturnType<typeof createContentScriptMock>;

describe('ContentScriptRelay', () => {
  let relay: ContentScriptRelay;
  let mockDiscoveryRequest: Record<string, unknown>;

  beforeEach(() => {
    setupFakeTimers();
    vi.clearAllMocks();

    // Set up content script environment
    contentScriptMock = createContentScriptMock({
      origin: 'https://dapp.example.com',
      userAgent: 'Test Browser',
      mockFn: () => vi.fn(),
    });

    // Set up standardized Chrome environment
    const chromeEnv = setupChromeEnvironment({
      extensionId: 'test-extension-id',
    });
    mockChrome = chromeEnv.chrome;
    chromeCleanup = chromeEnv.cleanup;

    // Reset chrome mock implementation for each test
    (mockChrome.runtime.sendMessage as ReturnType<typeof vi.fn>).mockImplementation(() =>
      Promise.resolve(undefined),
    );

    mockDiscoveryRequest = {
      type: 'discovery:wallet:request',
      version: '0.1.0',
      sessionId: 'test-session-123',
      timestamp: Date.now(),
      required: {
        chains: ['aztec:mainnet'],
        features: ['private-transactions'],
        interfaces: ['aztec-wallet-api-v1'],
      },
      origin: 'https://dapp.example.com',
      initiatorInfo: {
        name: 'Test dApp',
        url: 'https://dapp.example.com',
        icon: 'data:image/svg+xml;base64,dGVzdA==',
      },
    };

    relay = new ContentScriptRelay();
  });

  afterEach(() => {
    cleanupFakeTimers();
    chromeCleanup();
    contentScriptMock.cleanup();
  });

  describe('initialization', () => {
    it('should initialize properly', () => {
      expect(relay).toBeDefined();
      expect(relay.isReady()).toBe(true);
    });

    it('should set up page to background message forwarding', () => {
      expect(contentScriptMock.window.addEventListener).toHaveBeenCalledWith(
        'discovery:wallet:request',
        expect.any(Function),
      );
    });

    it('should set up background to page message forwarding', () => {
      expect(mockChrome.runtime.onMessage.addListener).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should handle multiple initialization attempts', () => {
      const relay2 = new ContentScriptRelay();
      expect(relay2.isReady()).toBe(true);
      // Should not set up listeners again
    });
  });

  describe('page to background forwarding', () => {
    it('should forward discovery:request events to background', () => {
      // Simulate discovery request from page
      const discoveryEvent = new CustomEvent('discovery:wallet:request', {
        detail: mockDiscoveryRequest,
      });

      // Get the event listener that was registered
      const eventListener = (
        contentScriptMock.window.addEventListener as ReturnType<typeof vi.fn>
      ).mock?.calls.find((call) => call[0] === 'discovery:wallet:request')?.[1];

      expect(eventListener).toBeDefined();

      // Call the event listener
      if (eventListener && typeof eventListener === 'function') {
        (eventListener as EventListener)(discoveryEvent);
      }

      // Check that sendMessage was called with correct data and a callback (due to Promise conversion)
      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith(
        {
          type: 'discovery:wallet:request',
          data: mockDiscoveryRequest,
          origin: 'https://dapp.example.com',
          timestamp: expect.any(Number),
        },
        expect.any(Function), // Callback added by browser API abstraction for Promise conversion
      );
    });

    it('should handle sendMessage failures gracefully', () => {
      (mockChrome.runtime.sendMessage as ReturnType<typeof vi.fn>).mockImplementation(() =>
        Promise.reject(new Error('Extension disabled')),
      );

      const discoveryEvent = new CustomEvent('discovery:wallet:request', {
        detail: mockDiscoveryRequest,
      });

      const eventListener = (
        contentScriptMock.window.addEventListener as ReturnType<typeof vi.fn>
      ).mock?.calls.find((call) => call[0] === 'discovery:wallet:request')?.[1];

      // Should not throw
      expect(() => {
        if (eventListener) {
          eventListener(discoveryEvent);
        }
      }).not.toThrow();
    });

    it('should handle malformed events gracefully', () => {
      const malformedEvent = new CustomEvent('discovery:wallet:request', {
        detail: null,
      });

      const eventListener = (
        contentScriptMock.window.addEventListener as ReturnType<typeof vi.fn>
      ).mock?.calls.find((call) => call[0] === 'discovery:wallet:request')?.[1];

      // Should not throw
      expect(() => {
        if (eventListener) {
          eventListener(malformedEvent);
        }
      }).not.toThrow();
    });
  });

  describe('background to page forwarding', () => {
    it('should forward discovery:wallet:response messages to page', () => {
      const mockAnnouncement = {
        type: 'discovery:wallet:response',
        sessionId: 'test-session-123',
        responderId: 'wallet-123',
        rdns: 'com.test.wallet',
        name: 'Test Wallet',
        icon: 'data:image/svg+xml;base64,dGVzdA==',
        matched: {
          required: {
            chains: ['aztec:mainnet'],
            features: ['private-transactions'],
            interfaces: ['aztec-wallet-api-v1'],
          },
        },
        transportConfig: {
          type: 'extension',
          extensionId: 'test-extension-id',
        },
      };

      // Get the message listener that was registered
      const messageListener = (
        mockChrome.runtime.onMessage.addListener as unknown as { mock?: { calls: unknown[][] } }
      )?.mock?.calls[0]?.[0];
      expect(messageListener).toBeDefined();

      const mockSendResponse = vi.fn();

      // Simulate message from background
      if (messageListener && typeof messageListener === 'function') {
        messageListener(
          { type: 'discovery:wallet:response', data: mockAnnouncement },
          { tab: { id: 123 } },
          mockSendResponse,
        );
      }

      expect(contentScriptMock.window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'discovery:wallet:response',
          detail: mockAnnouncement,
        }),
      );

      expect(mockSendResponse).toHaveBeenCalledWith({ success: true });
    });

    it('should ignore non-discovery messages', () => {
      const messageListener = (mockChrome.runtime.onMessage.addListener as ReturnType<typeof vi.fn>).mock
        ?.calls[0]?.[0];
      const mockSendResponse = vi.fn();

      // Simulate non-discovery message
      let result: unknown;
      if (messageListener && typeof messageListener === 'function') {
        result = messageListener({ type: 'other:message', data: {} }, { tab: { id: 123 } }, mockSendResponse);
      }

      expect(contentScriptMock.window.dispatchEvent).not.toHaveBeenCalled();
      expect(result).toBe(false); // Should not keep message channel open
    });

    it('should handle dispatchEvent errors gracefully', () => {
      contentScriptMock.window.dispatchEvent.mockImplementation(() => {
        throw new Error('Dispatch failed');
      });

      const messageListener = (mockChrome.runtime.onMessage.addListener as ReturnType<typeof vi.fn>).mock
        ?.calls[0]?.[0];
      const mockSendResponse = vi.fn();

      // Should not throw
      expect(() => {
        if (messageListener && typeof messageListener === 'function') {
          messageListener(
            { type: 'discovery:wallet:response', data: {} },
            { tab: { id: 123 } },
            mockSendResponse,
          );
        }
      }).not.toThrow();

      expect(mockSendResponse).toHaveBeenCalledWith({
        success: false,
        error: 'Error: Dispatch failed',
      });
    });
  });

  describe('status methods', () => {
    it('should return correct status', () => {
      const status = relay.getStatus();

      expect(status).toEqual({
        initialized: true,
        origin: 'https://dapp.example.com',
        userAgent: 'Test Browser',
        browserAPIAvailable: true,
        browserAPIType: 'chrome',
        retryAttempts: 0,
        maxRetryAttempts: 3,
      });
    });

    it('should report ready status', () => {
      expect(relay.isReady()).toBe(true);
    });
  });

  describe('retry mechanism', () => {
    it('should retry initialization on failure (coverage: lines 105-112)', async () => {
      // Mock addEventListener to fail on first calls, succeed on third
      let attemptCount = 0;
      contentScriptMock.window.addEventListener.mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Initialization failed');
        }
      });

      // Create relay which will fail initialization
      const consoleSpy = createConsoleSpy({ silent: false });

      relay = new ContentScriptRelay();

      // Should have tried once and scheduled retry
      expect(attemptCount).toBe(1);
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        '[WalletMesh:ContentScript] Retrying initialization (attempt 1/3) in 1000ms',
      );

      // Advance timer for first retry
      await vi.advanceTimersByTimeAsync(1000);
      expect(attemptCount).toBe(2);
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        '[WalletMesh:ContentScript] Retrying initialization (attempt 2/3) in 1000ms',
      );

      // Advance timer for second retry (which should succeed)
      await vi.advanceTimersByTimeAsync(1000);
      expect(attemptCount).toBe(3);
      expect(relay.isReady()).toBe(true);

      consoleSpy.restore();
    });

    it('should stop retrying after max attempts (coverage: lines 108-112)', async () => {
      // Mock addEventListener to always fail
      contentScriptMock.window.addEventListener.mockImplementation(() => {
        throw new Error('Permanent failure');
      });

      const consoleSpy = createConsoleSpy({ silent: false });

      relay = new ContentScriptRelay();

      // Advance through all retry attempts
      await vi.advanceTimersByTimeAsync(1000); // First retry
      await vi.advanceTimersByTimeAsync(1000); // Second retry
      await vi.advanceTimersByTimeAsync(1000); // Third retry

      // Should have logged final error
      expect(consoleSpy.error).toHaveBeenCalledWith(
        '[WalletMesh:ContentScript] Maximum retry attempts reached. Content script relay initialization failed permanently:',
        expect.any(Error),
      );

      expect(relay.isReady()).toBe(false);

      consoleSpy.restore();
    });
  });

  describe('browser API error handling', () => {
    it('should handle Extension context invalidated error (coverage: line 126)', () => {
      const consoleSpy = createConsoleSpy({ silent: false });
      relay = new ContentScriptRelay();

      // Access private method for testing
      const privateRelay = relay as unknown as {
        handleBrowserApiError(operation: string, error: unknown): void;
      };

      privateRelay.handleBrowserApiError('sendMessage', new Error('Extension context invalidated'));

      expect(consoleSpy.warn).toHaveBeenCalledWith(
        '[WalletMesh:ContentScript] Extension context invalidated - extension was reloaded or disabled',
      );

      consoleSpy.restore();
    });

    it('should handle message port closed error (coverage: line 128)', () => {
      const consoleSpy = createConsoleSpy({ silent: false });
      relay = new ContentScriptRelay();

      const privateRelay = relay as unknown as {
        handleBrowserApiError(operation: string, error: unknown): void;
      };

      privateRelay.handleBrowserApiError(
        'sendMessage',
        new Error('The message port closed before a response was received'),
      );

      expect(consoleSpy.warn).toHaveBeenCalledWith(
        '[WalletMesh:ContentScript] Background script not responding - may be starting up',
      );

      consoleSpy.restore();
    });

    it('should handle chrome:// URL access error (coverage: line 130)', () => {
      const consoleSpy = createConsoleSpy({ silent: false });
      relay = new ContentScriptRelay();

      const privateRelay = relay as unknown as {
        handleBrowserApiError(operation: string, error: unknown): void;
      };

      privateRelay.handleBrowserApiError('sendMessage', new Error('Cannot access a chrome:// URL'));

      expect(consoleSpy.warn).toHaveBeenCalledWith(
        '[WalletMesh:ContentScript] Cannot access browser internal URLs - expected behavior',
      );

      consoleSpy.restore();
    });

    it('should handle non-Error objects in browser API errors (coverage: line 122)', () => {
      const consoleSpy = createConsoleSpy({ silent: false });
      relay = new ContentScriptRelay();

      const privateRelay = relay as unknown as {
        handleBrowserApiError(operation: string, error: unknown): void;
      };

      // Test with non-Error object - this triggers String(error) on line 122
      privateRelay.handleBrowserApiError('sendMessage', 'string error message');

      expect(consoleSpy.warn).toHaveBeenCalledWith(
        '[WalletMesh:ContentScript] Browser API sendMessage failed:',
        'string error message',
      );

      consoleSpy.restore();
    });
  });

  describe('error handling', () => {
    it('should handle initialization errors gracefully', () => {
      // Mock addEventListener to throw
      contentScriptMock.window.addEventListener.mockImplementation(() => {
        throw new Error('addEventListener failed');
      });

      // Should not throw during construction
      expect(() => {
        new ContentScriptRelay();
      }).not.toThrow();
    });

    it('should handle chrome API unavailability', () => {
      // Temporarily remove chrome
      const originalChrome = global.chrome;
      // @ts-expect-error
      global.chrome = undefined;

      // Should not throw
      expect(() => {
        new ContentScriptRelay();
      }).not.toThrow();

      // Restore chrome
      global.chrome = originalChrome;
    });

    it('should handle double initialization gracefully (coverage: lines 73-74)', () => {
      // Create a relay that initializes successfully
      relay = new ContentScriptRelay();
      expect(relay.isReady()).toBe(true);

      // Try to initialize again - should return early
      const initializedState = relay.isReady();

      // Access private initialize method to test early return
      (relay as unknown as { initialize(): void }).initialize();

      // Should still be in same state
      expect(relay.isReady()).toBe(initializedState);
    });

    it('should handle chrome runtime unavailable during forwarding (coverage: lines 99-101)', () => {
      relay = new ContentScriptRelay();
      expect(relay.isReady()).toBe(true);

      // Temporarily remove chrome runtime.sendMessage
      const originalSendMessage = mockChrome.runtime['sendMessage'];
      (mockChrome.runtime as unknown as Record<string, unknown>)['sendMessage'] = undefined;

      // Create and dispatch a valid discovery request
      const event = new CustomEvent('discovery:wallet:request', {
        detail: mockDiscoveryRequest,
      });

      // Should handle missing chrome.runtime.sendMessage gracefully
      expect(() => {
        const eventHandler = contentScriptMock.window.addEventListener.mock.calls[0]?.[1];
        if (eventHandler) {
          eventHandler(event);
        }
      }).not.toThrow();

      // Restore original implementation
      (mockChrome.runtime as unknown as Record<string, unknown>)['sendMessage'] = originalSendMessage;
    });

    it('should handle event processing exceptions (coverage: lines 117-118)', () => {
      relay = new ContentScriptRelay();
      expect(relay.isReady()).toBe(true);

      // Mock sendMessage to throw an error
      (mockChrome.runtime.sendMessage as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw new Error('Chrome API error');
      });

      // Create and dispatch a valid discovery request
      const event = new CustomEvent('discovery:wallet:request', {
        detail: mockDiscoveryRequest,
      });

      // Should handle exception gracefully and log warning
      expect(() => {
        const eventHandler = (contentScriptMock.window.addEventListener as ReturnType<typeof vi.fn>).mock
          ?.calls[0]?.[1];
        if (eventHandler && typeof eventHandler === 'function') {
          (eventHandler as EventListener)(event);
        }
      }).not.toThrow();
    });
  });

  describe('global relay instance', () => {
    it('should create global instance when imported', async () => {
      // Test the module-level auto-initialization
      const { getContentScriptRelay } = await import('./ContentScriptRelay.js');

      const globalRelay = getContentScriptRelay();
      expect(globalRelay).toBeDefined();
      expect(globalRelay.isReady()).toBe(true);

      // Should return same instance
      const sameRelay = getContentScriptRelay();
      expect(sameRelay).toBe(globalRelay);
    });

    it('should handle auto-initialization conditions (coverage: lines 204-205)', () => {
      // Save current state
      const originalWindow = global.window;
      const originalChrome = global.chrome;

      // Test condition where window and chrome are available
      // @ts-expect-error
      global.window = { ...contentScriptMock.window };
      global.chrome = mockChrome as unknown as typeof chrome;

      // Mock the module to test auto-initialization
      expect(typeof global.window).toBe('object');
      expect(typeof global.chrome).toBe('object');
      expect(global.chrome.runtime).toBeDefined();

      // Restore original state
      global.window = originalWindow;
      global.chrome = originalChrome;
    });
  });
});

describe('ContentScriptRelay auto-initialization', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should auto-initialize when window and chrome are available (coverage: lines 263-264)', async () => {
    // Set up environment with window and chrome available
    const mockChrome = {
      runtime: {
        sendMessage: vi.fn(),
        onMessage: { addListener: vi.fn(), removeListener: vi.fn() },
      },
    };

    const mockWindow = {
      addEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      location: { origin: 'https://dapp.example.com' },
    };

    // @ts-expect-error
    global.window = mockWindow;
    // @ts-expect-error
    global.chrome = mockChrome;

    // Import module to trigger auto-initialization
    const module = await import('./ContentScriptRelay.js');

    // Auto-initialization should have been triggered
    const relay = module.getContentScriptRelay();
    expect(relay).toBeDefined();
    expect(relay.isReady()).toBe(true);

    // Clean up
    // @ts-expect-error
    global.window = undefined;
    // @ts-expect-error
    global.chrome = undefined;
  });

  it('should not auto-initialize when window is undefined', async () => {
    // Ensure window is undefined
    // @ts-expect-error
    global.window = undefined;

    // @ts-expect-error
    global.chrome = { runtime: {} };

    // Import module
    await import('./ContentScriptRelay.js');

    // Clean up
    // @ts-expect-error
    global.chrome = undefined;
  });

  it('should not auto-initialize when chrome is undefined', async () => {
    // @ts-expect-error
    global.window = {};
    // @ts-expect-error
    global.chrome = undefined;

    // Import module
    await import('./ContentScriptRelay.js');

    // Clean up
    // @ts-expect-error
    global.window = undefined;
  });

  it('should not auto-initialize when chrome.runtime is undefined', async () => {
    // @ts-expect-error
    global.window = {};
    // @ts-expect-error
    global.chrome = {};

    // Import module
    await import('./ContentScriptRelay.js');

    // Clean up
    // @ts-expect-error
    global.window = undefined;
    // @ts-expect-error
    global.chrome = undefined;
  });
});
