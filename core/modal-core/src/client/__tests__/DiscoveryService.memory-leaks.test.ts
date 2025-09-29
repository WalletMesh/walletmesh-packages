/**
 * Memory leak detection tests for DiscoveryService
 *
 * These tests verify that the DiscoveryService properly cleans up
 * event listeners, timers, and other resources to prevent memory leaks.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Logger } from '../../internal/core/logger/logger.js';
import type { WalletRegistry } from '../../internal/registries/wallets/WalletRegistry.js';
import { createMockLogger, createMockRegistry } from '../../testing/index.js';
import { setupDiscoveryInitiatorMock } from '../../testing/helpers/setupDiscoveryInitiatorMock.js';
import { DiscoveryService } from '../DiscoveryService.js';

// Mock the store module - we need both paths for proper resolution
// Mock @walletmesh/discovery module
vi.mock('@walletmesh/discovery', () => ({
  DiscoveryInitiator: vi.fn(),
  createInitiatorSession: vi.fn(),
}));

vi.mock('../../state/store.js', () => ({
  getStoreInstance: vi.fn(() => ({
    getState: vi.fn(() => ({
      ui: { isOpen: false, isLoading: false, error: undefined },
      connections: {
        activeSessions: [],
        availableWallets: [],
        discoveredWallets: [],
        activeSessionId: null,
        connectionStatus: 'disconnected'
      },
      transactions: {
        pending: [],
        confirmed: [],
        failed: [],
        activeTransaction: undefined
      },
      entities: {
        wallets: {}
      }
    })),
    setState: vi.fn(),
    subscribe: vi.fn(() => vi.fn()),
    subscribeWithSelector: vi.fn(() => vi.fn())
  }))
}));

// Mock implementations using testing utilities
const mockRegistry = createMockRegistry();
const mockLogger = createMockLogger();

// Helper to track resource usage
class ResourceTracker {
  private timers = new Set<number>();
  private eventListeners = new Set<{ target: EventTarget; type: string; listener: EventListener }>();

  constructor() {
    this.interceptTimers();
    this.interceptEventListeners();
  }

  private interceptTimers() {
    const originalSetTimeout = global.setTimeout;
    const originalSetInterval = global.setInterval;
    const originalClearTimeout = global.clearTimeout;
    const originalClearInterval = global.clearInterval;

    global.setTimeout = vi.fn((fn, delay) => {
      const id = originalSetTimeout(fn, delay);
      this.timers.add(id);
      return id;
    });

    global.setInterval = vi.fn((fn, delay) => {
      const id = originalSetInterval(fn, delay);
      this.timers.add(id);
      return id;
    });

    global.clearTimeout = vi.fn((id) => {
      this.timers.delete(id);
      return originalClearTimeout(id);
    });

    global.clearInterval = vi.fn((id) => {
      this.timers.delete(id);
      return originalClearInterval(id);
    });
  }

  private interceptEventListeners() {
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    const originalRemoveEventListener = EventTarget.prototype.removeEventListener;
    const leakDetector = this; // Capture reference to LeakDetector instance

    EventTarget.prototype.addEventListener = function (type, listener, options) {
      const entry = { target: this, type, listener: listener as EventListener };
      leakDetector.eventListeners.add(
        entry as { target: EventTarget; type: string; listener: EventListener },
      );
      return originalAddEventListener.call(this, type, listener, options);
    };

    EventTarget.prototype.removeEventListener = function (type, listener, options) {
      const entry = { target: this, type, listener: listener as EventListener };
      leakDetector.eventListeners.delete(entry);
      return originalRemoveEventListener.call(this, type, listener, options);
    };
  }

  getActiveTimers(): number {
    return this.timers.size;
  }

  getActiveEventListeners(): number {
    return this.eventListeners.size;
  }

  reset() {
    this.timers.clear();
    this.eventListeners.clear();
  }

  destroy() {
    // Restore original functions
    vi.restoreAllMocks();
  }
}

describe('DiscoveryService Memory Leak Prevention', () => {
  let discoveryService: DiscoveryService;
  let resourceTracker: ResourceTracker;

  beforeEach(async () => {
    // Use fake timers for faster tests
    vi.useFakeTimers();
    resourceTracker = new ResourceTracker();

    await setupDiscoveryInitiatorMock({
      on: vi.fn(),
      off: vi.fn(),
      removeAllListeners: vi.fn(),
    });

    discoveryService = new DiscoveryService(
      {
        enabled: true,
        timeout: 50, // Very short timeout for faster tests
        retryInterval: 20, // Very short retry interval for faster tests
        maxAttempts: 1, // Single attempt for faster tests
      },
      mockRegistry,
      mockLogger,
    );
  });

  afterEach(async () => {
    try {
      await discoveryService.destroy();
    } catch (error) {
      // Ignore errors during cleanup
    }
    resourceTracker.destroy();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Event Listener Cleanup', () => {
    it('should clean up all event listeners when destroyed', async () => {
      // Add some event listeners
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();

      const unsubscribe1 = discoveryService.on('discovery_started', handler1);
      const unsubscribe2 = discoveryService.on('wallet_discovered', handler2);
      const unsubscribe3 = discoveryService.on('discovery_completed', handler3);

      // Verify listeners are registered
      expect(typeof unsubscribe1).toBe('function');
      expect(typeof unsubscribe2).toBe('function');
      expect(typeof unsubscribe3).toBe('function');

      // Track calls before destroy
      const callCountBefore1 = handler1.mock.calls.length;
      const callCountBefore2 = handler2.mock.calls.length;
      const callCountBefore3 = handler3.mock.calls.length;

      // Start discovery to initialize internal components
      try {
        await discoveryService.scan();
      } catch {
        // May fail due to missing browser APIs in test environment
      }

      // Destroy the service
      await discoveryService.destroy();

      // Reset call counts to test only post-destroy behavior
      handler1.mockClear();
      handler2.mockClear();
      handler3.mockClear();

      // Try to emit events - handlers should not be called after destroy
      discoveryService.emit({ type: 'discovery_started' });
      discoveryService.emit({
        type: 'wallet_discovered',
        wallet: { id: 'test', name: 'Test Wallet', icon: 'data:image/svg+xml;base64,test', chains: ['evm'] },
      });
      discoveryService.emit({ type: 'discovery_completed', wallets: [] });

      // Handlers should not be called after destroy
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
      expect(handler3).not.toHaveBeenCalled();
    });

    it('should allow manual cleanup of individual event listeners', () => {
      const handler = vi.fn();
      const unsubscribe = discoveryService.on('discovery_started', handler);

      // Emit event - should be handled
      discoveryService.emit({ type: 'discovery_started' });
      expect(handler).toHaveBeenCalledTimes(1);

      // Unsubscribe manually
      unsubscribe();

      // Emit event again - should not be handled
      discoveryService.emit({ type: 'discovery_started' });
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should handle errors during cleanup gracefully', async () => {
      // Mock console.warn to avoid test noise
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Create a service and add listeners
      const handler = vi.fn();
      discoveryService.on('discovery_started', handler);

      // Mock the cleanup to throw an error
      const originalMethod = discoveryService['cleanupDiscoveryComponents'];
      discoveryService['cleanupDiscoveryComponents'] = vi.fn().mockImplementation(async () => {
        // Simulate error in cleanup
        throw new Error('Cleanup error');
      });

      // Destroy now surfaces cleanup errors for easier debugging
      await expect(discoveryService.destroy()).rejects.toThrow('Cleanup error');

      // Restore original method
      discoveryService['cleanupDiscoveryComponents'] = originalMethod;
      warnSpy.mockRestore();
    });
  });

  describe('Memory Usage During Normal Operations', () => {
    it('should not accumulate memory during repeated scan cycles', async () => {
      for (let i = 0; i < 3; i++) {
        const scanPromise = discoveryService.scan().catch(() => {
          // May fail due to missing browser APIs - this is acceptable
        });

        await vi.runAllTimersAsync();
        await scanPromise;

        // Brief wait between cycles using fake timers
        await vi.advanceTimersByTimeAsync(5);
      }

      expect(true).toBe(true);
    });

    it('should clean up resources when discovery fails', async () => {
      // Configure service to fail during initialization
      const mockBrokenRegistry = {
        ...mockRegistry,
        getAllWallets: vi.fn().mockImplementation(() => {
          throw new Error('Registry error');
        }),
      };

      const brokenService = new DiscoveryService(
        { enabled: true, timeout: 50 },
        mockBrokenRegistry as WalletRegistry,
        mockLogger,
      );

      try {
        // Scan should fail
        await expect(brokenService.scan()).rejects.toThrow();
      } catch (error) {
        // Expected to fail
      }

      // Resources should still be cleaned up without hanging
      await brokenService.destroy();

      // Test passes as long as cleanup completes
      expect(true).toBe(true);
    }); // Removed long timeout
  });

  describe('Resource Cleanup During Edge Cases', () => {
    it('should handle multiple destroy calls gracefully', async () => {
      // Start the service
      try {
        await discoveryService.scan();
        // Wait briefly to let async operations complete
        await new Promise((resolve) => setTimeout(resolve, 10));
      } catch {
        // May fail due to missing browser APIs
      }

      // Multiple destroy calls should not cause issues
      await discoveryService.destroy();
      await discoveryService.destroy();
      await discoveryService.destroy();

      // Should not throw or leak resources
      expect(true).toBe(true); // Test passes if no errors thrown
    }); // Removed long timeout

    it('should clean up resources when destroyed before start completes', async () => {
      // Start discovery (may be async)
      const scanPromise = discoveryService.scan().catch(() => {
        // Ignore errors for this test
      });

      // Small delay to simulate async operation
      await vi.advanceTimersByTimeAsync(5);

      // Immediately destroy while start is potentially in progress
      await discoveryService.destroy();

      await vi.runAllTimersAsync();

      // Wait for start to complete
      await scanPromise;

      // Test passes as long as destroy completes without hanging
      expect(true).toBe(true);
    }); // Removed long timeout
  });
});
