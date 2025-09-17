import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DiscoveryInitiator } from '../initiator/DiscoveryInitiator.js';
import { DISCOVERY_EVENTS } from '../core/constants.js';
import { createConsoleSpy } from './consoleMocks.js';
import type { DiscoveryCompleteEvent, DiscoveryErrorEvent } from '../types/core.js';

describe('Discovery Completion Events', () => {
  let mockEventTarget: EventTarget;
  let completedEvents: CustomEvent<DiscoveryCompleteEvent>[];
  let errorEvents: CustomEvent<DiscoveryErrorEvent>[];

  beforeEach(() => {
    vi.useFakeTimers();
    mockEventTarget = new EventTarget();
    completedEvents = [];
    errorEvents = [];

    // Listen for completion events
    mockEventTarget.addEventListener(DISCOVERY_EVENTS.COMPLETE, (e) => {
      completedEvents.push(e as CustomEvent<DiscoveryCompleteEvent>);
    });

    // Listen for error events
    mockEventTarget.addEventListener(DISCOVERY_EVENTS.ERROR, (e) => {
      errorEvents.push(e as CustomEvent<DiscoveryErrorEvent>);
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Discovery Completed Events', () => {
    it('should broadcast discovery completed event on timeout', async () => {
      const listener = new DiscoveryInitiator({
        requirements: {
          technologies: [
            {
              type: 'evm' as const,
              interfaces: ['eip-1193'],
            },
          ],
          features: ['account-management'],
        },
        initiatorInfo: {
          name: 'Test DApp',
          url: 'https://dapp.example.com',
        },
        timeout: 1000,
        eventTarget: mockEventTarget,
      });

      // Start discovery
      const discoveryPromise = listener.startDiscovery();

      // Advance time to trigger timeout
      await vi.advanceTimersByTimeAsync(1100);

      // Wait for discovery to complete
      const responders = await discoveryPromise;
      expect(responders).toEqual([]);

      // Check that discovery completed event was received
      expect(completedEvents).toHaveLength(1);

      const completedEvent = completedEvents[0];
      if (!completedEvent) throw new Error('Expected completedEvent to be defined');
      expect(completedEvent.detail).toMatchObject({
        type: DISCOVERY_EVENTS.COMPLETE,
        version: '0.1.0',
        reason: 'timeout',
        respondersFound: 0,
      });
      expect(completedEvent.detail.sessionId).toBeTruthy();
    });

    it('should broadcast discovery completed event on manual stop', async () => {
      const listener = new DiscoveryInitiator({
        requirements: {
          technologies: [
            {
              type: 'evm' as const,
              interfaces: ['eip-1193'],
            },
          ],
          features: ['account-management'],
        },
        initiatorInfo: {
          name: 'Test DApp',
          url: 'https://dapp.example.com',
        },
        timeout: 5000,
        eventTarget: mockEventTarget,
      });

      // Start discovery
      const discoveryPromise = listener.startDiscovery();

      // Advance time slightly
      await vi.advanceTimersByTimeAsync(100);

      // Stop discovery manually
      listener.stopDiscovery();

      // Wait for discovery to complete
      const responders = await discoveryPromise;
      expect(responders).toEqual([]);

      // Check that discovery completed event was received
      expect(completedEvents).toHaveLength(1);

      const completedEvent = completedEvents[0];
      if (!completedEvent) throw new Error('Expected completedEvent to be defined');
      expect(completedEvent.detail).toMatchObject({
        type: DISCOVERY_EVENTS.COMPLETE,
        version: '0.1.0',
        reason: 'manual-stop',
        respondersFound: 0,
      });
    });
  });

  describe('Discovery Error Events', () => {
    it('should broadcast discovery error event on duplicate response', async () => {
      const listener = new DiscoveryInitiator({
        requirements: {
          technologies: [
            {
              type: 'evm' as const,
              interfaces: ['eip-1193'],
            },
          ],
          features: ['account-management'],
        },
        initiatorInfo: {
          name: 'Test DApp',
          url: 'https://dapp.example.com',
        },
        timeout: 5000,
        eventTarget: mockEventTarget,
      });

      // Start discovery
      const discoveryPromise = listener.startDiscovery();

      // Advance time to allow discovery to start
      await vi.advanceTimersByTimeAsync(100);

      // Create a discovery response
      const response = {
        type: DISCOVERY_EVENTS.RESPONSE,
        version: '0.1.0',
        sessionId: listener.getCurrentSessionId() ?? 'test-session-id',
        responderId: 'responder-1',
        rdns: 'com.example.wallet',
        name: 'Example Wallet',
        icon: 'data:image/svg+xml;base64,PHN2Zz4=',
        responderVersion: '1.0.0',
        matched: {
          required: {
            technologies: [
              {
                type: 'evm' as const,
                interfaces: ['eip-1193'],
              },
            ],
            features: ['account-management'],
          },
        },
      };

      // Send first response (valid)
      const event1 = new CustomEvent(DISCOVERY_EVENTS.RESPONSE, { detail: response });
      mockEventTarget.dispatchEvent(event1);

      // Send second response from same RDNS (duplicate - should trigger error)
      const duplicateResponse = {
        ...response,
        responderId: 'responder-2', // Different ID but same RDNS
      };
      const event2 = new CustomEvent(DISCOVERY_EVENTS.RESPONSE, {
        detail: duplicateResponse,
      });
      mockEventTarget.dispatchEvent(event2);

      // Discovery should be rejected due to duplicate response
      await expect(discoveryPromise).rejects.toThrow('Duplicate response detected');

      // Check that discovery error event was received
      expect(errorEvents).toHaveLength(1);

      const errorEvent = errorEvents[0];
      if (!errorEvent) throw new Error('Expected errorEvent to be defined');
      expect(errorEvent.detail).toMatchObject({
        type: DISCOVERY_EVENTS.ERROR,
        version: '0.1.0',
        errorCode: 2008,
        errorCategory: 'security',
      });
      expect(errorEvent.detail.errorMessage).toContain('Duplicate response detected');
      expect(errorEvent.detail.sessionId).toBeTruthy();
    });

    it('should not broadcast completion events when session ID is null', async () => {
      const listener = new DiscoveryInitiator({
        requirements: {
          technologies: [
            {
              type: 'evm' as const,
              interfaces: ['eip-1193'],
            },
          ],
          features: ['account-management'],
        },
        initiatorInfo: {
          name: 'Test DApp',
          url: 'https://dapp.example.com',
        },
        timeout: 1000,
        eventTarget: mockEventTarget,
      });

      // Clear event arrays
      completedEvents.length = 0;
      errorEvents.length = 0;

      // Try to stop discovery before starting (no session ID)
      listener.stopDiscovery();

      // Should not have received any events (no session to report)
      expect(completedEvents).toHaveLength(0);
      expect(errorEvents).toHaveLength(0);
    });
  });

  describe('Event Broadcasting Edge Cases', () => {
    it('should handle completion event dispatching errors gracefully', async () => {
      // Mock dispatchEvent to work normally for discovery request but fail for completion events
      let callCount = 0;
      const mockEventTargetWithError = {
        dispatchEvent: vi.fn().mockImplementation((_event) => {
          callCount++;
          // Let the first call (discovery request) succeed
          if (callCount === 1) {
            return true;
          }
          // Fail subsequent calls (completion events)
          throw new Error('Event dispatch failed');
        }),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      } as unknown as EventTarget;

      const listener = new DiscoveryInitiator({
        requirements: {
          technologies: [
            {
              type: 'evm' as const,
              interfaces: ['eip-1193'],
            },
          ],
          features: ['account-management'],
        },
        initiatorInfo: {
          name: 'Test DApp',
          url: 'https://dapp.example.com',
        },
        timeout: 1000,
        eventTarget: mockEventTargetWithError,
      });

      // Console.error should be called for event dispatch error, but discovery should still work
      const consoleSpy = createConsoleSpy({ methods: ['error'], mockFn: () => vi.fn() });

      // Start discovery
      const discoveryPromise = listener.startDiscovery();

      // Advance time to trigger timeout
      await vi.advanceTimersByTimeAsync(1100);

      // Discovery should still complete normally despite event dispatch error
      const responders = await discoveryPromise;
      expect(responders).toEqual([]);

      // Should have logged the event dispatch error
      expect(consoleSpy.error).toHaveBeenCalledWith(
        '[WalletMesh] Failed to dispatch discovery message:',
        expect.any(Error),
      );

      consoleSpy.restore();
    });
  });
});
