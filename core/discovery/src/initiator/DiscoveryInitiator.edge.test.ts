import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DiscoveryInitiator } from './DiscoveryInitiator.js';
import { MockEventTarget } from '../testing/MockEventTarget.js';
import { createTestDiscoveryResponse, createTestDAppInfo } from '../testing/testUtils.js';
import { setupFakeTimers, cleanupFakeTimers } from '../testing/timingHelpers.js';
import type { ProtocolStateMachine } from '../core/ProtocolStateMachine.js';
import type { InitiatorInfo } from '../core/types.js';

describe('DiscoveryInitiator Edge Cases', () => {
  let listener: DiscoveryInitiator;
  let mockEventTarget: MockEventTarget;

  beforeEach(() => {
    setupFakeTimers();
    mockEventTarget = new MockEventTarget();
  });

  afterEach(() => {
    cleanupFakeTimers();
  });

  describe('session management edge cases', () => {
    it('should handle missing session ID gracefully', async () => {
      listener = new DiscoveryInitiator({
        requirements: {
          chains: ['eip155:1'],
          features: [],
          interfaces: [],
        },
        initiatorInfo: createTestDAppInfo(),
        eventTarget: mockEventTarget,
      });

      // Access private property via type casting
      const privateListener = listener as unknown as {
        sessionId: string | null;
      };

      // Get session ID before starting discovery
      expect(privateListener.sessionId).toBeNull();
      expect(listener.getCurrentSessionId()).toBeNull();
    });
  });

  describe('enhanceError edge cases', () => {
    it('should enhance "No active session" error (coverage: lines 413-416)', () => {
      listener = new DiscoveryInitiator({
        requirements: {
          chains: ['eip155:1'],
          features: [],
          interfaces: [],
        },
        initiatorInfo: createTestDAppInfo(),
        eventTarget: mockEventTarget,
      });

      const privateListener = listener as unknown as {
        enhanceError(error: Error): Error;
      };

      const originalError = new Error('No active session');
      const enhancedError = privateListener.enhanceError(originalError);

      expect(enhancedError.message).toContain('Session management error');
      expect(enhancedError.message).toContain('concurrent discovery attempts');
      expect(enhancedError.message).toContain('No active session');
    });

    it('should enhance "Cannot start discovery from state" error (coverage: lines 419-422)', () => {
      listener = new DiscoveryInitiator({
        requirements: {
          chains: ['eip155:1'],
          features: [],
          interfaces: [],
        },
        initiatorInfo: createTestDAppInfo(),
        eventTarget: mockEventTarget,
      });

      const privateListener = listener as unknown as {
        enhanceError(error: Error): Error;
      };

      const originalError = new Error('Cannot start discovery from state CONNECTING');
      const enhancedError = privateListener.enhanceError(originalError);

      expect(enhancedError.message).toContain('Discovery is already in progress');
      expect(enhancedError.message).toContain('stopDiscovery()');
      expect(enhancedError.message).toContain('Cannot start discovery from state');
    });

    it('should enhance timeout error (coverage: lines 425-428)', () => {
      listener = new DiscoveryInitiator({
        requirements: {
          chains: ['eip155:1'],
          features: [],
          interfaces: [],
        },
        initiatorInfo: createTestDAppInfo(),
        eventTarget: mockEventTarget,
        timeout: 5000,
      });

      const privateListener = listener as unknown as {
        enhanceError(error: Error): Error;
      };

      const originalError = new Error('Discovery timeout exceeded');
      const enhancedError = privateListener.enhanceError(originalError);

      expect(enhancedError.message).toContain('Discovery timed out after 5000ms');
      expect(enhancedError.message).toContain('No qualifying wallets responded');
      expect(enhancedError.message).toContain('Discovery timeout exceeded');
    });

    it('should enhance timeout error with default timeout', () => {
      listener = new DiscoveryInitiator({
        requirements: {
          chains: ['eip155:1'],
          features: [],
          interfaces: [],
        },
        initiatorInfo: createTestDAppInfo(),
        eventTarget: mockEventTarget,
      });

      const privateListener = listener as unknown as {
        enhanceError(error: Error): Error;
        config: { timeout?: number };
      };

      const originalError = new Error('Operation Timeout');
      const enhancedError = privateListener.enhanceError(originalError);

      expect(enhancedError.message).toContain('Discovery timed out after 3000ms');
    });
  });

  describe('getOrigin edge cases', () => {
    it('should handle invalid URL in initiatorInfo (coverage: lines 574-575)', () => {
      const initiatorInfo = createTestDAppInfo();
      initiatorInfo.url = 'not-a-valid-url';

      listener = new DiscoveryInitiator({
        requirements: {
          chains: ['eip155:1'],
          features: [],
          interfaces: [],
        },
        initiatorInfo,
        eventTarget: mockEventTarget,
      });

      const privateListener = listener as unknown as {
        getOrigin(): string;
      };

      // Should fallback to window.location.origin or localhost
      const origin = privateListener.getOrigin();
      expect(origin).toBeDefined();
      expect(origin).toMatch(/^https?:\/\//);
    });

    it('should fallback to localhost in non-browser environment (coverage: line 579)', () => {
      // Mock window to be undefined (non-browser environment)
      const originalWindow = global.window;
      // @ts-ignore
      global.window = undefined;

      const initiatorInfo = createTestDAppInfo();
      // Remove URL to force fallback
      const modifiedInitiatorInfo = { ...initiatorInfo, url: undefined } as unknown as InitiatorInfo;

      listener = new DiscoveryInitiator({
        requirements: {
          chains: ['eip155:1'],
          features: [],
          interfaces: [],
        },
        initiatorInfo: modifiedInitiatorInfo,
        eventTarget: mockEventTarget,
      });

      const privateListener = listener as unknown as {
        getOrigin(): string;
      };

      const origin = privateListener.getOrigin();
      expect(origin).toBe('http://localhost:3000');

      // Restore window
      global.window = originalWindow;
    });

    it('should use window.location.origin when available', () => {
      // Mock window.location.origin
      const originalWindow = global.window;
      global.window = {
        location: {
          origin: 'https://dapp.example.com',
        },
      } as Window & typeof globalThis;

      const initiatorInfo = createTestDAppInfo();
      // Remove URL to test window.location fallback
      const modifiedInitiatorInfo2 = { ...initiatorInfo, url: undefined } as unknown as InitiatorInfo;

      listener = new DiscoveryInitiator({
        requirements: {
          chains: ['eip155:1'],
          features: [],
          interfaces: [],
        },
        initiatorInfo: modifiedInitiatorInfo2,
        eventTarget: mockEventTarget,
      });

      const privateListener = listener as unknown as {
        getOrigin(): string;
      };

      const origin = privateListener.getOrigin();
      expect(origin).toBe('https://dapp.example.com');

      // Restore window
      global.window = originalWindow;
    });
  });

  describe('state machine integration edge cases', () => {
    it('should handle state machine creation successfully', async () => {
      listener = new DiscoveryInitiator({
        requirements: {
          chains: ['eip155:1'],
          features: [],
          interfaces: [],
        },
        initiatorInfo: createTestDAppInfo(),
        eventTarget: mockEventTarget,
      });

      // Should be able to start discovery normally
      const discoveryPromise = listener.startDiscovery();
      expect(listener.getState()).toBe('DISCOVERING');

      // Complete discovery
      await vi.advanceTimersByTimeAsync(3000);
      const result = await discoveryPromise;
      expect(result).toEqual([]);
      expect(listener.getState()).toBe('COMPLETED');
    });

    it('should handle session management correctly', async () => {
      listener = new DiscoveryInitiator({
        requirements: {
          chains: ['eip155:1'],
          features: [],
          interfaces: [],
        },
        initiatorInfo: createTestDAppInfo(),
        eventTarget: mockEventTarget,
      });

      // Start discovery
      const discoveryPromise = listener.startDiscovery();

      // Should have a session ID
      const sessionId = listener.getCurrentSessionId();
      expect(sessionId).toBeTruthy();
      expect(sessionId).toMatch(/^[0-9a-f-]{36}$/);

      // Stop discovery
      listener.stopDiscovery();

      // Wait for promise to resolve
      const result = await discoveryPromise;
      expect(result).toEqual([]);
    });
  });

  describe('concurrent discovery attempts', () => {
    it('should handle concurrent startDiscovery calls gracefully', async () => {
      listener = new DiscoveryInitiator({
        requirements: {
          chains: ['eip155:1'],
          features: [],
          interfaces: [],
        },
        initiatorInfo: createTestDAppInfo(),
        eventTarget: mockEventTarget,
        timeout: 1000,
      });

      // Start first discovery
      const discovery1 = listener.startDiscovery();

      // Try to start another discovery immediately
      await expect(listener.startDiscovery()).rejects.toThrow('Discovery is already in progress');

      // Complete first discovery
      await vi.advanceTimersByTimeAsync(1000);
      await discovery1;

      // Now should NOT be able to start new discovery (terminal state)
      await expect(listener.startDiscovery()).rejects.toThrow(
        'Cannot reuse discovery session in COMPLETED state',
      );
    });
  });

  describe('getQualifiedResponder edge cases', () => {
    it('should return undefined for non-existent responderId (coverage: lines 248-249)', async () => {
      listener = new DiscoveryInitiator({
        requirements: {
          chains: ['eip155:1'],
          features: [],
          interfaces: [],
        },
        initiatorInfo: createTestDAppInfo(),
        eventTarget: mockEventTarget,
      });

      // Try to get a responder that doesn't exist
      const responder = listener.getQualifiedResponder('non-existent-id');
      expect(responder).toBeUndefined();
    });

    it('should return responder after discovery (coverage: lines 248-249)', async () => {
      listener = new DiscoveryInitiator({
        requirements: {
          chains: ['eip155:1'],
          features: [],
          interfaces: [],
        },
        initiatorInfo: createTestDAppInfo(),
        eventTarget: mockEventTarget,
        timeout: 1000,
      });

      // Start discovery
      const discoveryPromise = listener.startDiscovery();

      // Simulate a discovery response
      const response = createTestDiscoveryResponse({
        sessionId: (listener as unknown as { sessionId: string }).sessionId,
        responderId: 'test-responder-id',
        matched: {
          required: {
            chains: ['eip155:1'],
            features: [],
            interfaces: [],
          },
        },
      });

      const responseEvent = new CustomEvent('discovery:wallet:response', {
        detail: response,
      });

      // Advance timer to let discovery start
      await vi.advanceTimersByTimeAsync(100);

      // Dispatch the response
      mockEventTarget.dispatchEvent(responseEvent);

      // Complete discovery
      await vi.advanceTimersByTimeAsync(900);
      await discoveryPromise;

      // Now should be able to get the responder
      const responder = listener.getQualifiedResponder('test-responder-id');
      expect(responder).toBeDefined();
      expect(responder?.responderId).toBe('test-responder-id');
    });
  });

  describe('stateMachine edge cases during cleanup', () => {
    it('should handle state machine already reset during cleanup (coverage: line 170)', async () => {
      listener = new DiscoveryInitiator({
        requirements: {
          chains: ['eip155:1'],
          features: [],
          interfaces: [],
        },
        initiatorInfo: createTestDAppInfo(),
        eventTarget: mockEventTarget,
        timeout: 1000,
      });

      // Start discovery
      const discoveryPromise = listener.startDiscovery();

      // Advance timer to let discovery start
      await vi.advanceTimersByTimeAsync(100);

      // Access internal state machine and force it to reset
      const privateListener = listener as unknown as {
        stateMachine: ProtocolStateMachine;
      };

      // In single-use session pattern, transition to COMPLETED to simulate completion
      privateListener.stateMachine.transition('COMPLETED', { reason: 'forced-completion' });

      // Complete discovery timeout - the cleanup code should handle already completed state
      await vi.advanceTimersByTimeAsync(900);

      // Should resolve without errors even though state was already completed
      await expect(discoveryPromise).resolves.toEqual([]);
    });
  });

  describe('state machine transition error handling', () => {
    it('should handle state machine transition errors during completion (coverage: lines 216-219)', async () => {
      listener = new DiscoveryInitiator({
        requirements: {
          chains: ['eip155:1'],
          features: [],
          interfaces: [],
        },
        initiatorInfo: createTestDAppInfo(),
        eventTarget: mockEventTarget,
        timeout: 1000,
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Start discovery
      const discoveryPromise = listener.startDiscovery();
      await vi.advanceTimersByTimeAsync(100);

      // Access private state machine and mock transition to throw error
      const privateListener = listener as unknown as {
        stateMachine: ProtocolStateMachine;
      };

      const originalTransition = privateListener.stateMachine.transition.bind(privateListener.stateMachine);
      vi.spyOn(privateListener.stateMachine, 'transition').mockImplementation((toState, metadata) => {
        if (toState === 'COMPLETED') {
          throw new Error('State transition failed');
        }
        return originalTransition(toState, metadata);
      });

      // Complete discovery timeout - should handle transition error gracefully
      await vi.advanceTimersByTimeAsync(900);

      // Should log warning but not throw
      expect(consoleSpy).toHaveBeenCalledWith(
        '[WalletMesh] Failed to transition to COMPLETED state:',
        expect.any(Error),
      );

      await expect(discoveryPromise).resolves.toEqual([]);
      consoleSpy.mockRestore();
    });

    it('should handle state machine transition errors during stop (coverage: lines 266-268)', async () => {
      listener = new DiscoveryInitiator({
        requirements: {
          chains: ['eip155:1'],
          features: [],
          interfaces: [],
        },
        initiatorInfo: createTestDAppInfo(),
        eventTarget: mockEventTarget,
        timeout: 2000,
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Start discovery
      const discoveryPromise = listener.startDiscovery();
      await vi.advanceTimersByTimeAsync(100);

      // Ensure we're in DISCOVERING state and mock transition to always throw error
      const privateListener = listener as unknown as {
        stateMachine: ProtocolStateMachine;
      };

      // Verify we're in DISCOVERING state
      expect(privateListener.stateMachine.getState()).toBe('DISCOVERING');

      // Mock transition to throw error when transitioning to COMPLETED
      vi.spyOn(privateListener.stateMachine, 'transition').mockImplementation((toState, _metadata) => {
        if (toState === 'COMPLETED') {
          throw new Error('State transition failed on stop');
        }
        // This shouldn't be called since we're mocking to always throw
        return undefined;
      });

      // Stop discovery - should handle transition error gracefully
      listener.stopDiscovery();

      // Should log warning but not throw
      expect(consoleSpy).toHaveBeenCalledWith(
        '[WalletMesh] Failed to transition to COMPLETED state on stop:',
        expect.any(Error),
      );

      await expect(discoveryPromise).resolves.toEqual([]);
      consoleSpy.mockRestore();
    });
  });

  describe('duplicate response internal error handling', () => {
    it('should handle missing first response during duplicate detection (coverage: lines 542-544)', async () => {
      listener = new DiscoveryInitiator({
        requirements: {
          chains: ['eip155:1'],
          features: [],
          interfaces: [],
        },
        initiatorInfo: createTestDAppInfo(),
        eventTarget: mockEventTarget,
        timeout: 2000,
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Start discovery
      const discoveryPromise = listener.startDiscovery();
      await vi.advanceTimersByTimeAsync(100);

      const sessionId = listener.getCurrentSessionId();
      if (!sessionId) throw new Error('No session ID');

      // Create first response
      const firstResponse = createTestDiscoveryResponse({
        sessionId,
        responderId: 'first-responder',
        rdns: 'com.test.wallet',
      });

      // Create duplicate response with different responder ID
      const duplicateResponse = createTestDiscoveryResponse({
        sessionId,
        responderId: 'duplicate-responder',
        rdns: 'com.test.wallet', // Same RDNS
      });

      // Dispatch first response
      const firstEvent = new CustomEvent('discovery:wallet:response', {
        detail: firstResponse,
      });
      mockEventTarget.dispatchEvent(firstEvent);

      // Manually corrupt the internal first responses map to trigger the error
      const privateListener = listener as unknown as {
        firstResponses: Map<string, { responderId: string; timestamp: number }>;
      };
      privateListener.firstResponses.delete('com.test.wallet');

      // Dispatch duplicate response - should trigger internal error
      const duplicateEvent = new CustomEvent('discovery:wallet:response', {
        detail: duplicateResponse,
      });
      mockEventTarget.dispatchEvent(duplicateEvent);

      // Should log internal error
      expect(consoleSpy).toHaveBeenCalledWith(
        '[WalletMesh] Internal error: First response not tracked for duplicate detection',
      );

      // Stop discovery
      listener.stopDiscovery();
      const result = await discoveryPromise;

      // Should contain the first response (but may have additional fields due to processing)
      expect(result).toHaveLength(1);
      expect(result[0]?.rdns).toBe('com.test.wallet');
      expect(result[0]?.responderId).toBe('first-responder');

      consoleSpy.mockRestore();
    });
  });
});
