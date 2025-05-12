import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DiscoveryListener } from './server.js';
import { DiscoveryAnnouncer } from './client.js';
import type { WalletInfo } from './types.js';
import { WmDiscovery, CONFIG } from './constants.js';

// Example data URI for a small test icon (1x1 pixel transparent PNG)
const TEST_ICON =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';

describe('Discovery Integration', () => {
  let mockEventTarget: EventTarget;
  const technologies = ['test-tech'];

  function createTestWallet(
    walletInfo: WalletInfo,
    technologies: string[],
    callback?: (origin: string) => boolean,
  ) {
    return new DiscoveryAnnouncer({
      walletInfo,
      supportedTechnologies: technologies,
      callback,
      eventTarget: mockEventTarget,
    });
  }

  function createTestWebWallet(
    name: string,
    rdns: string,
    url: string,
    technologies: string[],
    callback?: (origin: string) => boolean,
  ) {
    const walletInfo: WalletInfo = { name, icon: TEST_ICON, rdns, url };
    return createTestWallet(walletInfo, technologies, callback);
  }

  function createTestExtensionWallet(
    name: string,
    rdns: string,
    technologies: string[],
    extensionId?: string,
    code?: string,
    callback?: (origin: string) => boolean,
  ) {
    const walletInfo: WalletInfo = { name, icon: TEST_ICON, rdns, extensionId, code };
    return createTestWallet(walletInfo, technologies, callback);
  }

  beforeEach(() => {
    mockEventTarget = new EventTarget();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  it('should complete a full discovery cycle with web wallet', async () => {
    // Setup listener
    const discoveryCallback = vi.fn();
    const listener = new DiscoveryListener({
      technologies,
      callback: discoveryCallback,
      eventTarget: mockEventTarget,
    });

    // Setup web wallet
    const webWallet = createTestWebWallet(
      'Test Web Wallet',
      'com.test.wallet',
      'https://test.wallet',
      technologies,
    );

    // Start performance measurement
    const startTime = performance.now();

    // Start discovery
    listener.start();
    webWallet.start();

    // Let event loop process events
    vi.advanceTimersByTime(100);

    // Verify wallet was discovered
    expect(discoveryCallback).toHaveBeenCalledTimes(1);
    if (discoveryCallback.mock.calls[0]) {
      expect(discoveryCallback.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          name: 'Test Web Wallet',
          icon: TEST_ICON,
          rdns: 'com.test.wallet',
          url: 'https://test.wallet',
          technologies: technologies,
        }),
      );
    }

    // Verify performance
    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1s

    // Verify wallet is in list
    expect(listener.wallets).toHaveLength(1);
    const firstWallet = listener.wallets[0];
    if (firstWallet) {
      expect(firstWallet.name).toBe('Test Web Wallet');
    }

    // Stop discovery
    listener.stop();
    webWallet.stop();
  });

  it('should complete a full discovery cycle with extension wallet', async () => {
    // Setup listener
    const discoveryCallback = vi.fn();
    const listener = new DiscoveryListener({
      technologies,
      callback: discoveryCallback,
      eventTarget: mockEventTarget,
      discoveryId: crypto.randomUUID(),
    });

    // Setup extension wallet
    const extensionWallet = createTestExtensionWallet(
      'Test Extension Wallet',
      'com.test.extension',
      technologies,
      'test-extension-id',
      'test-code',
    );

    // Start discovery
    listener.start();
    extensionWallet.start();

    // Let event loop process events
    vi.advanceTimersByTime(100);

    // Verify callback was called
    expect(discoveryCallback).toHaveBeenCalledTimes(1);
    if (discoveryCallback.mock.calls[0]) {
      expect(discoveryCallback.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          name: 'Test Extension Wallet',
          icon: TEST_ICON,
          rdns: 'com.test.extension',
          extensionId: 'test-extension-id',
          code: 'test-code',
          technologies: technologies,
        }),
      );
    }

    // Verify wallet is in list
    expect(listener.wallets).toHaveLength(1);
    const firstWallet = listener.wallets[0];
    if (firstWallet) {
      expect(firstWallet.name).toBe('Test Extension Wallet');
    }

    // Stop discovery
    listener.stop();
    extensionWallet.stop();
  });

  it('should handle multiple wallets announcing simultaneously', async () => {
    const listener = new DiscoveryListener({
      technologies,
      eventTarget: mockEventTarget,
    });

    // Create multiple wallets
    const webWallet1 = createTestWebWallet(
      'Web Wallet 1',
      'com.test.web1',
      'https://test1.wallet',
      technologies,
    );

    const webWallet2 = createTestWebWallet(
      'Web Wallet 2',
      'com.test.web2',
      'https://test2.wallet',
      technologies,
    );

    const extensionWallet = createTestExtensionWallet(
      'Extension Wallet',
      'com.test.ext',
      technologies,
      'ext-id',
      'test-code',
    );

    // Start discovery
    listener.start();
    webWallet1.start();
    webWallet2.start();
    extensionWallet.start();

    // Let event loop process events
    vi.advanceTimersByTime(100);

    // Verify all wallets were discovered
    expect(listener.wallets).toHaveLength(3);

    const walletNames = listener.wallets.map((w) => w.name).sort();
    expect(walletNames).toEqual(['Extension Wallet', 'Web Wallet 1', 'Web Wallet 2']);

    // Stop discovery
    listener.stop();
    webWallet1.stop();
    webWallet2.stop();
    extensionWallet.stop();
  });

  describe('ready events debouncing', () => {
    let listener: DiscoveryListener;
    let ready: Event;
    let requestEvents: Event[];
    beforeEach(() => {
      // Reset timers and state
      vi.useFakeTimers();
      vi.setSystemTime(0);
      vi.clearAllTimers();

      // Setup test environment
      mockEventTarget = new EventTarget();
      ready = new Event(WmDiscovery.Ready);
      requestEvents = [];

      // Setup request tracking
      mockEventTarget.addEventListener(WmDiscovery.Request, ((event: Event) => {
        requestEvents.push(event);
      }) as EventListener);

      // Create and start listener with fixed ID
      listener = new DiscoveryListener({
        technologies,
        eventTarget: mockEventTarget,
        discoveryId: 'test-id',
      });

      // Start listener and wait for initial request
      listener.start();
      vi.advanceTimersByTime(1);
      requestEvents.length = 0; // Clear initial request
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.clearAllTimers();
      listener.stop();
    });

    it('should send a single request after one ready event', () => {
      // Verify clean initial state
      expect(requestEvents).toHaveLength(0);

      // Send ready event and wait just before timeout
      mockEventTarget.dispatchEvent(ready);
      vi.advanceTimersByTime(CONFIG.readyDebounceMs - 1);
      expect(requestEvents).toHaveLength(0);

      // Complete the timeout
      vi.advanceTimersByTime(1);
      expect(requestEvents).toHaveLength(1);
    });

    it('should coalesce multiple ready events into one request', () => {
      // Verify clean initial state
      expect(requestEvents).toHaveLength(0);

      // Send multiple events in quick succession
      mockEventTarget.dispatchEvent(ready);
      mockEventTarget.dispatchEvent(ready);
      mockEventTarget.dispatchEvent(ready);

      // Nothing should happen immediately
      expect(requestEvents).toHaveLength(0);

      // Run all timers and verify coalesced request
      vi.runAllTimers();
      expect(requestEvents).toHaveLength(1);
    });
  });

  it('should handle origin filtering', () => {
    const allowedOrigin = 'https://allowed.com';
    const blockedOrigin = 'https://blocked.com';

    const originCallback = (origin: string) => origin === allowedOrigin;
    const wallet = createTestWebWallet(
      'Test Wallet',
      'com.test',
      'https://test.wallet',
      technologies,
      originCallback,
    );

    const listener = new DiscoveryListener({
      technologies,
      eventTarget: mockEventTarget,
    });

    // Mock window.origin for test
    const originalOrigin = window.origin;
    Object.defineProperty(window, 'origin', {
      value: allowedOrigin,
      configurable: true,
    });

    // Start discovery
    wallet.start();
    listener.start();

    vi.advanceTimersByTime(100);

    // Should discover wallet for allowed origin
    expect(listener.wallets).toHaveLength(1);

    // Change origin to blocked
    Object.defineProperty(window, 'origin', {
      value: blockedOrigin,
      configurable: true,
    });

    // Should still only have the first wallet
    expect(listener.wallets).toHaveLength(1);

    // Restore original origin
    Object.defineProperty(window, 'origin', {
      value: originalOrigin,
      configurable: true,
    });

    // Clean up
    wallet.stop();
    listener.stop();
  });
});
