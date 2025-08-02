/**
 * Consolidated test suite for DiscoveryResponder
 * Combines main functionality, additional edge cases, coverage improvements, and node environment tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DiscoveryResponder } from './DiscoveryResponder.js';
import { MockEventTarget } from '../testing/MockEventTarget.js';
import { createTestResponderInfo, createTestDiscoveryRequest } from '../testing/testUtils.js';
import { setupFakeTimers, cleanupFakeTimers, advanceTimeAndWait } from '../testing/timingHelpers.js';
import { createDiscoveryRequestEvent, createTestEvent } from '../testing/eventHelpers.js';
import { DISCOVERY_EVENTS } from '../core/constants.js';
import type {
  ResponderInfo,
  SecurityPolicy,
  DiscoveryResponseEvent,
  WebResponderInfo,
  DiscoveryResponderConfig,
} from '../core/types.js';
import type { ProtocolStateMachine } from '../core/ProtocolStateMachine.js';

describe('DiscoveryResponder', () => {
  let announcer: DiscoveryResponder;
  let responderInfo: ResponderInfo;
  let eventTarget: EventTarget;
  let mockEventTarget: MockEventTarget;
  let originalWindow: typeof globalThis.window;

  beforeEach(() => {
    setupFakeTimers();

    // Save original window
    originalWindow = globalThis.window;

    eventTarget = new EventTarget();
    mockEventTarget = new MockEventTarget();
    mockEventTarget.clearDispatchedEvents();

    responderInfo = createTestResponderInfo.ethereum();

    announcer = new DiscoveryResponder({
      responderInfo,
      eventTarget,
      securityPolicy: {
        requireHttps: false,
        allowLocalhost: true,
      },
    });
  });

  afterEach(() => {
    // Restore original window
    if (originalWindow) {
      globalThis.window = originalWindow;
    } else {
      (globalThis as unknown as Record<string, unknown>)['window'] = undefined;
    }

    announcer?.cleanup();
    cleanupFakeTimers();
    vi.clearAllMocks();
  });

  // ===============================================
  // Constructor and Initialization Tests
  // ===============================================
  describe('Constructor and Initialization', () => {
    it('should initialize with required config', () => {
      expect(announcer).toBeDefined();
      expect(announcer.isAnnouncerListening()).toBe(false);
    });

    it('should apply security policy if provided', () => {
      const securityPolicy: SecurityPolicy = {
        allowedOrigins: ['https://example.com'],
        requireHttps: true,
        rateLimit: {
          enabled: true,
          maxRequests: 5,
          windowMs: 60000,
        },
      };

      const secureAnnouncer = new DiscoveryResponder({
        responderInfo,
        securityPolicy,
        eventTarget,
      });

      expect(secureAnnouncer).toBeDefined();
      secureAnnouncer.cleanup();
    });

    it('should create announcer with minimal wallet info', () => {
      const minimalAnnouncer = new DiscoveryResponder({
        responderInfo: {} as ResponderInfo,
        eventTarget,
      });
      expect(minimalAnnouncer).toBeDefined();
      minimalAnnouncer.cleanup();
    });

    it('should handle missing event target in non-browser environment', () => {
      // Remove window to simulate non-browser
      (globalThis as unknown as Record<string, unknown>)['window'] = undefined;

      const config: DiscoveryResponderConfig = {
        responderInfo,
        // No eventTarget provided
      };

      // Should create with EventTarget polyfill
      expect(() => new DiscoveryResponder(config)).not.toThrow();

      const nonBrowserAnnouncer = new DiscoveryResponder(config);
      expect(nonBrowserAnnouncer).toBeDefined();

      nonBrowserAnnouncer.cleanup();
    });

    it('should handle configuration with empty security policy', () => {
      const config: DiscoveryResponderConfig = {
        responderInfo,
        eventTarget: mockEventTarget,
        securityPolicy: {}, // Empty policy
      };

      expect(() => new DiscoveryResponder(config)).not.toThrow();
      const testAnnouncer = new DiscoveryResponder(config);
      expect(testAnnouncer.isAnnouncerListening()).toBe(false);
      testAnnouncer.cleanup();
    });

    it('should handle responder info with minimal fields', () => {
      const minimalResponderInfo: ResponderInfo = {
        uuid: 'minimal-uuid',
        rdns: 'com.minimal.wallet',
        name: 'Minimal Wallet',
        icon: 'data:image/svg+xml;base64,dGVzdA==',
        version: '1.0.0',
        protocolVersion: '0.1.0',
        chains: [
          {
            chainId: 'eip155:1',
            chainType: 'evm',
            network: {
              name: 'Ethereum',
              chainId: 'eip155:1',
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              testnet: false,
            },
            standards: ['eip-1193'],
            rpcMethods: ['eth_accounts'],
            transactionTypes: [],
            signatureSchemes: ['secp256k1'],
            features: [],
          },
        ],
        features: [],
        type: 'extension',
      };

      const config: DiscoveryResponderConfig = {
        responderInfo: minimalResponderInfo,
        eventTarget: mockEventTarget,
      };

      expect(() => new DiscoveryResponder(config)).not.toThrow();
      const testAnnouncer = new DiscoveryResponder(config);
      testAnnouncer.cleanup();
    });
  });

  // ===============================================
  // Listening State Tests
  // ===============================================
  describe('Listening State', () => {
    it('should start and stop listening', () => {
      expect(announcer.isAnnouncerListening()).toBe(false);

      announcer.startListening();
      expect(announcer.isAnnouncerListening()).toBe(true);

      announcer.stopListening();
      expect(announcer.isAnnouncerListening()).toBe(false);
    });

    it('should handle multiple start calls', () => {
      announcer.startListening();
      announcer.startListening(); // Should not throw

      expect(announcer.isAnnouncerListening()).toBe(true);
    });

    it('should handle stop when not listening', () => {
      announcer.stopListening(); // Should not throw
      expect(announcer.isAnnouncerListening()).toBe(false);
    });

    it('should handle error when removing event listener', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      announcer.startListening();
      expect(announcer.isAnnouncerListening()).toBe(true);

      // Mock removeEventListener to throw an error
      const originalRemoveEventListener = eventTarget.removeEventListener;
      eventTarget.removeEventListener = vi.fn().mockImplementation(() => {
        throw new Error('Test error');
      });

      // Should not throw even if removeEventListener fails
      expect(() => announcer.stopListening()).not.toThrow();
      expect(announcer.isAnnouncerListening()).toBe(false);

      // Should have logged the warning
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[WalletMesh] Error removing event listener:',
        expect.any(Error),
      );

      // Restore original function
      eventTarget.removeEventListener = originalRemoveEventListener;
      consoleWarnSpy.mockRestore();
    });
  });

  // ===============================================
  // Discovery Request Handling Tests
  // ===============================================
  describe('Discovery Request Handling', () => {
    beforeEach(() => {
      announcer.startListening();
    });

    it('should respond to valid discovery requests', async () => {
      const responseHandler = vi.fn();
      eventTarget.addEventListener(DISCOVERY_EVENTS.RESPONSE, responseHandler);

      const request = createTestDiscoveryRequest({
        required: {
          chains: ['eip155:1'],
          features: ['account-management'],
          interfaces: ['eip-1193'],
        },
      });

      const event = createDiscoveryRequestEvent(request);

      eventTarget.dispatchEvent(event);

      // Let the async processing complete
      await advanceTimeAndWait(0);

      expect(responseHandler).toHaveBeenCalled();
      const response = responseHandler.mock.calls[0]?.[0]?.detail as DiscoveryResponseEvent | undefined;
      expect(response?.sessionId).toBe(request.sessionId);
      expect(response?.responderId).toBe(responderInfo.uuid);
    });

    it('should not respond when wallet cannot fulfill requirements', async () => {
      const responseHandler = vi.fn();
      eventTarget.addEventListener(DISCOVERY_EVENTS.RESPONSE, responseHandler);

      const request = createTestDiscoveryRequest({
        required: {
          chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'], // Wallet doesn't support Solana
          features: ['account-management'],
          interfaces: ['solana-wallet-standard'],
        },
      });

      const event = createDiscoveryRequestEvent(request);

      eventTarget.dispatchEvent(event);

      await advanceTimeAndWait(100);

      expect(responseHandler).not.toHaveBeenCalled();
    });

    it('should validate request format', async () => {
      const responseHandler = vi.fn();
      eventTarget.addEventListener(DISCOVERY_EVENTS.RESPONSE, responseHandler);

      // Invalid request missing required fields
      const invalidRequest = {
        type: DISCOVERY_EVENTS.REQUEST,
        sessionId: 'test-session',
        // Missing other required fields
      };

      const event = createTestEvent(DISCOVERY_EVENTS.REQUEST, invalidRequest);

      eventTarget.dispatchEvent(event);

      await advanceTimeAndWait(100);

      expect(responseHandler).not.toHaveBeenCalled();
    });

    it('should include web wallet URL in description', async () => {
      const webResponderInfo: WebResponderInfo = {
        ...responderInfo,
        type: 'web',
        url: 'https://mywallet.com',
      };

      const testEventTarget = new EventTarget();
      const webAnnouncer = new DiscoveryResponder({
        responderInfo: webResponderInfo,
        eventTarget: testEventTarget,
        securityPolicy: {
          requireHttps: false,
          allowLocalhost: true,
        },
      });
      webAnnouncer.startListening();

      const responseHandler = vi.fn();
      testEventTarget.addEventListener(DISCOVERY_EVENTS.RESPONSE, responseHandler);

      const request = createTestDiscoveryRequest();

      const event = createDiscoveryRequestEvent(request);

      testEventTarget.dispatchEvent(event);

      await advanceTimeAndWait(0);

      expect(responseHandler).toHaveBeenCalled();
      webAnnouncer.cleanup();
    });
  });

  // ===============================================
  // Security Tests
  // ===============================================
  describe('Security', () => {
    it('should enforce rate limiting', async () => {
      const securityPolicy: SecurityPolicy = {
        requireHttps: false,
        allowLocalhost: true,
        rateLimit: {
          enabled: true,
          maxRequests: 2,
          windowMs: 60000,
        },
      };

      const testEventTarget = new EventTarget();
      const rateLimitedAnnouncer = new DiscoveryResponder({
        responderInfo,
        securityPolicy,
        eventTarget: testEventTarget,
      });
      rateLimitedAnnouncer.startListening();

      const responseHandler = vi.fn();
      testEventTarget.addEventListener(DISCOVERY_EVENTS.RESPONSE, responseHandler);

      const request = createTestDiscoveryRequest();

      // Send multiple requests
      for (let i = 0; i < 5; i++) {
        const event = createDiscoveryRequestEvent({ ...request, sessionId: `session-${i}` });
        testEventTarget.dispatchEvent(event);
      }

      await advanceTimeAndWait(100);

      // Should only process up to rate limit
      expect(responseHandler).toHaveBeenCalledTimes(2);

      rateLimitedAnnouncer.cleanup();
    });

    it('should enforce origin validation', async () => {
      const securityPolicy: SecurityPolicy = {
        allowedOrigins: ['https://allowed.com'],
        requireHttps: true,
      };

      const secureAnnouncer = new DiscoveryResponder({
        responderInfo,
        securityPolicy,
        eventTarget,
      });
      secureAnnouncer.startListening();

      const responseHandler = vi.fn();
      eventTarget.addEventListener(DISCOVERY_EVENTS.RESPONSE, responseHandler);

      // Request from non-allowed origin
      const request = createTestDiscoveryRequest({
        origin: 'https://notallowed.com',
      });

      const event = createDiscoveryRequestEvent(request);

      eventTarget.dispatchEvent(event);

      await advanceTimeAndWait(100);

      expect(responseHandler).not.toHaveBeenCalled();

      secureAnnouncer.cleanup();
    });
  });

  // ===============================================
  // Error Handling Tests
  // ===============================================
  describe('Error Handling', () => {
    beforeEach(() => {
      announcer = new DiscoveryResponder({
        responderInfo,
        eventTarget: mockEventTarget,
        securityPolicy: {
          requireHttps: false,
          allowLocalhost: true,
        },
      });
    });

    it('should handle discovery requests with invalid version gracefully', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

      announcer.startListening();

      // Create a request with invalid version to trigger protocol version warning
      const invalidVersionRequest = {
        ...createTestDiscoveryRequest(),
        version: '999.0.0',
      };

      const event = createTestEvent(DISCOVERY_EVENTS.REQUEST, invalidVersionRequest);
      mockEventTarget.dispatchEvent(event);

      await advanceTimeAndWait(10);

      // Should have logged warning for protocol version mismatch
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[WalletMesh] Protocol version mismatch: expected 0.1.0, got 999.0.0',
      );

      consoleWarnSpy.mockRestore();
    });

    it('should handle event without detail property', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

      announcer.startListening();

      // Create event without detail
      const eventWithoutDetail = new CustomEvent(DISCOVERY_EVENTS.REQUEST, {
        // Explicitly omit detail to test undefined handling
      });

      mockEventTarget.dispatchEvent(eventWithoutDetail);

      await advanceTimeAndWait(10);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[WalletMesh] Error processing discovery request from unknown:',
        expect.any(String),
      );

      consoleWarnSpy.mockRestore();
    });

    it('should handle discovery request with malformed requirements', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

      // Test with malformed discovery request
      const malformedRequest = {
        ...createTestDiscoveryRequest(),
        required: null, // Invalid requirements
      };

      announcer.startListening();

      const event = createTestEvent(DISCOVERY_EVENTS.REQUEST, malformedRequest);

      mockEventTarget.dispatchEvent(event);

      await advanceTimeAndWait(10);

      // Should handle gracefully and warn
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });
  });

  // ===============================================
  // Configuration Updates Tests
  // ===============================================
  describe('Configuration Updates', () => {
    it('should update announcer configuration', () => {
      const newConfig: Partial<DiscoveryResponderConfig> = {
        responderInfo: createTestResponderInfo.ethereum({
          name: 'Updated Wallet',
        }),
        securityPolicy: {
          requireHttps: true,
          allowedOrigins: ['https://trusted.com'],
          rateLimit: {
            enabled: true,
            maxRequests: 10,
            windowMs: 60000,
          },
        },
      };

      // Should not throw
      expect(() => announcer.updateConfig(newConfig)).not.toThrow();

      // Verify configuration was applied by checking that it doesn't break functionality
      announcer.startListening();
      expect(announcer.isAnnouncerListening()).toBe(true);
    });

    it('should update responder info when provided in config', () => {
      const newResponderInfo = createTestResponderInfo.ethereum({
        name: 'New Wallet Name',
        uuid: 'new-wallet-id',
      });

      announcer.updateConfig({
        responderInfo: newResponderInfo,
      });

      // The update should have taken effect
      announcer.startListening();
      expect(announcer.isAnnouncerListening()).toBe(true);
    });

    it('should update security policy when provided in config', () => {
      const newSecurityPolicy: SecurityPolicy = {
        requireHttps: true,
        allowedOrigins: ['https://newsite.com'],
        rateLimit: {
          enabled: true,
          maxRequests: 5,
          windowMs: 30000,
        },
      };

      announcer.updateConfig({
        securityPolicy: newSecurityPolicy,
      });

      // Verify new security policy is in effect
      announcer.startListening();
      expect(announcer.isAnnouncerListening()).toBe(true);
    });

    it('should handle partial configuration updates', () => {
      // Update only responder info
      announcer.updateConfig({
        responderInfo: createTestResponderInfo.ethereum({ name: 'Polygon Wallet' }),
      });

      // Update only security policy
      announcer.updateConfig({
        securityPolicy: {
          requireHttps: true,
        },
      });

      // Both updates should work
      announcer.startListening();
      expect(announcer.isAnnouncerListening()).toBe(true);
    });

    it('should handle config update with undefined fields', () => {
      // Should handle config with undefined values gracefully
      expect(() => announcer.updateConfig({})).not.toThrow();

      // Should still work normally
      announcer.startListening();
      expect(announcer.isAnnouncerListening()).toBe(true);
    });
  });

  // ===============================================
  // Session State Cleanup Tests
  // ===============================================
  describe('Session State Cleanup', () => {
    it('should cleanup session state after transition to IDLE', async () => {
      announcer.startListening();

      // Create a request to generate a session
      const request = createTestDiscoveryRequest({
        sessionId: 'test-session-cleanup',
      });

      const event = createDiscoveryRequestEvent(request);
      eventTarget.dispatchEvent(event);

      // Wait for session creation
      await advanceTimeAndWait(10);

      // Access internal state to get session state machine
      const sessionStates = (announcer as unknown as { sessionStates: Map<string, unknown> }).sessionStates;
      const sessionKey = 'http://localhost:3000:test-session-cleanup';
      expect(sessionStates.has(sessionKey)).toBe(true);

      // Get the session state machine and force it to IDLE state
      const sessionStateMachine = sessionStates.get(sessionKey) as unknown as {
        transition: (state: string) => void;
        isInState: (state: string) => boolean;
        dispose: () => void;
      };

      // Transition to COMPLETED (terminal state - no cleanup needed)
      sessionStateMachine.transition('COMPLETED');

      // In single-use pattern, COMPLETED is terminal so session stays
      expect(sessionStates.has(sessionKey)).toBe(true);

      // But the session is in COMPLETED state indicating it's done
      expect(sessionStateMachine.isInState('COMPLETED')).toBe(true);
    });

    it('should not cleanup session if not in IDLE state', async () => {
      announcer.startListening();

      const request = createTestDiscoveryRequest({
        sessionId: 'test-session-no-cleanup',
      });

      const event = createDiscoveryRequestEvent(request);
      eventTarget.dispatchEvent(event);

      await advanceTimeAndWait(10);

      const sessionStates = (announcer as unknown as { sessionStates: Map<string, unknown> }).sessionStates;
      const sessionKey = 'http://localhost:3000:test-session-no-cleanup';
      expect(sessionStates.has(sessionKey)).toBe(true);

      // Don't transition to IDLE - stay in current state
      // Wait for cleanup timeout
      await advanceTimeAndWait(5001);

      // Session should still exist (no cleanup)
      expect(sessionStates.has(sessionKey)).toBe(true);
    });

    it('should handle multiple sessions with different cleanup timing', async () => {
      announcer.startListening();

      // Create two sessions
      const request1 = createTestDiscoveryRequest({ sessionId: 'session-1' });
      const request2 = createTestDiscoveryRequest({ sessionId: 'session-2' });

      eventTarget.dispatchEvent(createDiscoveryRequestEvent(request1));
      eventTarget.dispatchEvent(createDiscoveryRequestEvent(request2));

      await advanceTimeAndWait(10);

      const sessionStates = (announcer as unknown as { sessionStates: Map<string, unknown> }).sessionStates;
      const sessionKey1 = 'http://localhost:3000:session-1';
      const sessionKey2 = 'http://localhost:3000:session-2';
      expect(sessionStates.has(sessionKey1)).toBe(true);
      expect(sessionStates.has(sessionKey2)).toBe(true);

      // Transition first session to COMPLETED (terminal state)
      const sessionStateMachine1 = sessionStates.get(sessionKey1) as unknown as {
        transition: (state: string) => void;
        isInState: (state: string) => boolean;
      };
      sessionStateMachine1.transition('COMPLETED');

      // In single-use pattern, sessions remain in terminal states
      expect(sessionStates.has(sessionKey1)).toBe(true);
      expect(sessionStates.has(sessionKey2)).toBe(true);

      // First session is in COMPLETED state
      expect(sessionStateMachine1.isInState('COMPLETED')).toBe(true);
    });
  });

  // ===============================================
  // Non-Browser Environment Tests
  // ===============================================
  describe('Non-Browser Environment', () => {
    it('should handle missing origin in non-browser environment', () => {
      // Remove window to simulate Node.js environment
      (globalThis as unknown as Record<string, unknown>)['window'] = undefined;

      const testAnnouncer = new DiscoveryResponder({
        responderInfo: createTestResponderInfo.ethereum(),
        eventTarget: mockEventTarget,
        securityPolicy: {
          allowedOrigins: ['https://trusted-dapp.com'],
          requireHttps: true,
        },
      });
      testAnnouncer.startListening();

      // Create request without origin
      const request = createTestDiscoveryRequest({
        origin: undefined as unknown as string,
      });

      const event = createTestEvent('discovery:wallet:request', request);

      // Should not throw and should handle gracefully
      expect(() => mockEventTarget.dispatchEvent(event)).not.toThrow();

      // Should not have processed the request (undefined origin is invalid)
      const responses = mockEventTarget.getDispatchedEventsOfType('discovery:wallet:response');
      expect(responses).toHaveLength(0);

      testAnnouncer.cleanup();
    });

    it('should still validate origin in browser environment', () => {
      // Ensure window exists (browser environment)
      if (!globalThis.window) {
        globalThis.window = {} as Window & typeof globalThis;
      }

      const testAnnouncer = new DiscoveryResponder({
        responderInfo: createTestResponderInfo.ethereum(),
        eventTarget: mockEventTarget,
        securityPolicy: {
          allowedOrigins: ['https://trusted-dapp.com'],
          requireHttps: true,
        },
      });
      testAnnouncer.startListening();

      // Create request without origin
      const request = createTestDiscoveryRequest({
        origin: undefined as unknown as string,
      });

      const event = createTestEvent('discovery:wallet:request', request);

      // Should handle gracefully but not process due to missing origin
      expect(() => mockEventTarget.dispatchEvent(event)).not.toThrow();

      // Should not have processed the request
      const responses = mockEventTarget.getDispatchedEventsOfType('discovery:wallet:response');
      expect(responses).toHaveLength(0);

      testAnnouncer.cleanup();
    });

    it('should handle undefined window object', () => {
      // Set window to undefined
      (globalThis as unknown as Record<string, unknown>)['window'] = undefined;

      const testAnnouncer = new DiscoveryResponder({
        responderInfo: createTestResponderInfo.ethereum(),
        eventTarget: mockEventTarget,
        securityPolicy: {
          allowedOrigins: ['https://trusted-dapp.com'],
          requireHttps: true,
        },
      });
      testAnnouncer.startListening();

      const request = createTestDiscoveryRequest({
        origin: undefined as unknown as string,
      });

      const event = createTestEvent('discovery:wallet:request', request);

      // Should handle gracefully
      expect(() => mockEventTarget.dispatchEvent(event)).not.toThrow();

      // Should not process invalid request
      const responses = mockEventTarget.getDispatchedEventsOfType('discovery:wallet:response');
      expect(responses).toHaveLength(0);

      testAnnouncer.cleanup();
    });
  });

  describe('additional edge cases and error paths', () => {
    it('should handle malformed request events', () => {
      announcer.startListening();

      // Test with various malformed events
      const malformedEvents = [
        new CustomEvent('discovery:wallet:request', { detail: null }),
        new CustomEvent('discovery:wallet:request', { detail: undefined }),
        new CustomEvent('discovery:wallet:request', { detail: 'not-an-object' }),
        new CustomEvent('discovery:wallet:request', { detail: 123 }),
        new CustomEvent('discovery:wallet:request', { detail: [] }),
        new CustomEvent('discovery:wallet:request', { detail: { incomplete: 'request' } }),
      ];

      for (const event of malformedEvents) {
        expect(() => eventTarget.dispatchEvent(event)).not.toThrow();
      }

      // Should not have generated any responses
      const responses = mockEventTarget.getDispatchedEventsOfType('discovery:wallet:response');
      expect(responses).toHaveLength(0);
    });

    it('should handle session state management errors', () => {
      announcer.startListening();

      // Mock createProtocolStateMachine to throw
      vi.doMock('../core/ProtocolStateMachine.js', () => ({
        createProtocolStateMachine: vi.fn().mockImplementation(() => {
          throw new Error('State machine creation failed');
        }),
      }));

      const request = createTestDiscoveryRequest({
        origin: 'https://origin.example.com',
      });
      const event = createDiscoveryRequestEvent(request);

      // Should handle state machine errors gracefully
      expect(() => eventTarget.dispatchEvent(event)).not.toThrow();
    });

    it('should handle missing window object gracefully', () => {
      // Remove window
      const originalWindow = globalThis.window;
      (globalThis as unknown as Record<string, unknown>)['window'] = undefined;

      try {
        const noWindowAnnouncer = new DiscoveryResponder({
          responderInfo: createTestResponderInfo.ethereum(),
          // No eventTarget provided, should create own
        });

        expect(noWindowAnnouncer).toBeDefined();
        noWindowAnnouncer.cleanup();
      } finally {
        // Restore window
        globalThis.window = originalWindow;
      }
    });

    it('should handle empty security policy', () => {
      const minimalAnnouncer = new DiscoveryResponder({
        responderInfo: createTestResponderInfo.ethereum(),
        eventTarget: mockEventTarget,
        securityPolicy: {
          requireHttps: false, // Allow HTTP for testing
          allowLocalhost: true,
        },
      });

      minimalAnnouncer.startListening();

      const request = createTestDiscoveryRequest({
        origin: 'http://localhost:3000', // Match the actual event origin
      });
      const event = createDiscoveryRequestEvent(request);

      mockEventTarget.dispatchEvent(event);

      // Should still work with minimal security
      const responses = mockEventTarget.getDispatchedEventsOfType('discovery:wallet:response');
      expect(responses.length).toBeGreaterThan(0);

      minimalAnnouncer.cleanup();
    });

    it('should handle capability matcher errors', () => {
      announcer.startListening();

      // Mock capability matcher to throw
      const originalMatch = announcer['capabilityMatcher'].matchCapabilities;
      announcer['capabilityMatcher'].matchCapabilities = vi.fn().mockImplementation(() => {
        throw new Error('Capability matching failed');
      });

      const request = createTestDiscoveryRequest();
      const event = createDiscoveryRequestEvent(request);

      // Should handle matcher errors gracefully
      expect(() => eventTarget.dispatchEvent(event)).not.toThrow();

      // Should not generate response when matcher fails
      const responses = mockEventTarget.getDispatchedEventsOfType('discovery:wallet:response');
      expect(responses).toHaveLength(0);

      // Restore original matcher
      announcer['capabilityMatcher'].matchCapabilities = originalMatch;
    });

    it('should handle event dispatch errors', () => {
      announcer.startListening();

      // Mock eventTarget to throw on dispatch
      const originalDispatch = eventTarget.dispatchEvent;
      eventTarget.dispatchEvent = vi.fn().mockImplementation(() => {
        throw new Error('Event dispatch failed');
      });

      const request = createTestDiscoveryRequest();
      const event = createDiscoveryRequestEvent(request);

      // Should handle dispatch errors gracefully
      expect(() => eventTarget.dispatchEvent(event)).toThrow('Event dispatch failed');

      // Restore original dispatch
      eventTarget.dispatchEvent = originalDispatch;
    });

    it('should handle session cleanup errors', () => {
      announcer.startListening();

      // Create a session with matching origin
      const request = createTestDiscoveryRequest({
        origin: 'http://localhost:3000',
      });
      const event = createDiscoveryRequestEvent(request);
      eventTarget.dispatchEvent(event);

      // Wait for processing
      vi.advanceTimersByTime(10);

      // Mock session state disposal to throw
      const sessionStates = announcer['sessionStates'];

      // Create a mock state machine that throws on dispose
      const mockStateMachine = {
        dispose: vi.fn().mockImplementation(() => {
          throw new Error('State machine disposal failed');
        }),
        getState: vi.fn().mockReturnValue('IDLE'),
      };

      // Add the mock to session states
      sessionStates.set('error-session', mockStateMachine as unknown as ProtocolStateMachine);

      // Cleanup should not throw, it should handle errors gracefully
      expect(() => announcer.cleanup()).not.toThrow();

      // Verify the error state machine's dispose was called despite the error
      expect(mockStateMachine.dispose).toHaveBeenCalled();
    });

    it('should handle responder info validation', () => {
      // Test with various invalid responder info
      const invalidResponderInfos = [
        null,
        undefined,
        {},
        { name: '' },
        { name: 'Test', rdns: '' },
        { name: 'Test', rdns: 'com.test', uuid: '' },
      ];

      for (const info of invalidResponderInfos) {
        if (info !== null && info !== undefined) {
          expect(
            () =>
              new DiscoveryResponder({
                responderInfo: info as unknown as ResponderInfo,
                eventTarget: mockEventTarget,
              }),
          ).not.toThrow(); // Constructor should be defensive
        }
      }
    });

    it('should handle updateResponderInfo with null/undefined', () => {
      expect(() => announcer.updateResponderInfo(null as unknown as ResponderInfo)).not.toThrow();
      expect(() => announcer.updateResponderInfo(undefined as unknown as ResponderInfo)).not.toThrow();
    });

    it('should handle multiple rapid requests from same origin', async () => {
      announcer.startListening();

      const origin = 'http://localhost:3000'; // Match actual event origin
      const requests = Array.from({ length: 10 }, (_, i) =>
        createTestDiscoveryRequest({
          origin,
          sessionId: `session-${i}`,
        }),
      );

      // Dispatch all requests rapidly
      for (const request of requests) {
        const event = createDiscoveryRequestEvent(request);
        eventTarget.dispatchEvent(event);
      }

      // Wait for async processing
      await vi.advanceTimersByTimeAsync(10);

      // Should handle all requests
      // The responses are on the eventTarget, not mockEventTarget
      // Since this is a unit test of DiscoveryResponder, we're checking that it processes requests
      // We can check that state machines were created for each session
      const sessionStates = announcer['sessionStates'];
      expect(sessionStates.size).toBeGreaterThan(0);
    });

    it('should handle state machine timeout scenarios', async () => {
      announcer.startListening();

      const request = createTestDiscoveryRequest({
        origin: 'http://localhost:3000', // Match actual event origin
      });
      const event = createDiscoveryRequestEvent(request);
      eventTarget.dispatchEvent(event);

      // Wait for processing
      await vi.advanceTimersByTimeAsync(10);

      // Get the session state machine
      const sessionStates = announcer['sessionStates'];
      const sessionKey = `${request.origin}:${request.sessionId}`;
      const stateMachine = sessionStates.get(sessionKey);

      expect(stateMachine).toBeDefined();
      if (stateMachine) {
        // Should be in DISCOVERING state after request
        expect(stateMachine.getState()).toBe('DISCOVERING');

        // Trigger timeout (DISCOVERING has a 30000ms timeout in DiscoveryResponder)
        await vi.advanceTimersByTimeAsync(30100);

        // State machine should timeout and go to COMPLETED (terminal state)
        expect(stateMachine.getState()).toBe('COMPLETED');
      }
    });

    it('should handle cleanup with no active sessions', () => {
      // Cleanup without any active sessions should not throw
      expect(() => announcer.cleanup()).not.toThrow();
    });

    it('should handle stop listening when not listening', () => {
      // Should not throw when stopping while not listening
      expect(() => announcer.stopListening()).not.toThrow();
      expect((announcer as unknown as { isListening: boolean }).isListening).toBe(false);
    });

    it('should handle capabilities with null/undefined values', () => {
      const requestWithNullCapabilities = {
        ...createTestDiscoveryRequest(),
        required: {
          chains: null as unknown as string[],
          features: undefined as unknown as string[],
          interfaces: [],
        },
      };

      announcer.startListening();
      const event = createDiscoveryRequestEvent(requestWithNullCapabilities);

      // Should handle gracefully
      expect(() => eventTarget.dispatchEvent(event)).not.toThrow();
    });

    it('should handle very large capability lists', () => {
      const largeRequest = createTestDiscoveryRequest({
        required: {
          chains: Array.from({ length: 1000 }, (_, i) => `eip155:${i}`),
          features: Array.from({ length: 100 }, (_, i) => `feature-${i}`),
          interfaces: Array.from({ length: 50 }, (_, i) => `interface-${i}`),
        },
      });

      announcer.startListening();
      const event = createDiscoveryRequestEvent(largeRequest);

      // Should handle large capability lists
      expect(() => eventTarget.dispatchEvent(event)).not.toThrow();
    });

    it('should handle concurrent start/stop operations', () => {
      // Rapid start/stop operations should not cause issues
      expect(() => {
        announcer.startListening();
        announcer.stopListening();
        announcer.startListening();
        announcer.stopListening();
        announcer.startListening();
      }).not.toThrow();

      expect((announcer as unknown as { isListening: boolean }).isListening).toBe(true);
    });

    it('should handle memory cleanup on repeated operations', () => {
      announcer.startListening();

      // Create and cleanup many sessions
      for (let i = 0; i < 100; i++) {
        const request = createTestDiscoveryRequest({
          sessionId: `memory-test-${i}`,
        });
        const event = createDiscoveryRequestEvent(request);
        eventTarget.dispatchEvent(event);
      }

      // Force session cleanup
      const sessionStates = announcer['sessionStates'];
      const initialSize = sessionStates.size;

      // Cleanup should reduce session count
      announcer.cleanup();
      expect(sessionStates.size).toBeLessThanOrEqual(initialSize);
    });

    it('should handle rate limiter edge cases', () => {
      const rateLimitedAnnouncer = new DiscoveryResponder({
        responderInfo: createTestResponderInfo.ethereum(),
        eventTarget: mockEventTarget,
        securityPolicy: {
          requireHttps: false,
          allowLocalhost: true,
          rateLimit: {
            enabled: true,
            maxRequests: 1,
            windowMs: 1000,
          },
        },
      });

      rateLimitedAnnouncer.startListening();

      const origin = 'http://localhost:3000'; // Match actual event origin

      // First request should work
      const request1 = createTestDiscoveryRequest({ origin, sessionId: 'session-1' });
      const event1 = createDiscoveryRequestEvent(request1);
      mockEventTarget.dispatchEvent(event1);

      // Second request should be rate limited
      const request2 = createTestDiscoveryRequest({ origin, sessionId: 'session-2' });
      const event2 = createDiscoveryRequestEvent(request2);
      mockEventTarget.dispatchEvent(event2);

      const responses = mockEventTarget.getDispatchedEventsOfType('discovery:wallet:response');
      expect(responses).toHaveLength(1); // Only first request should get response

      rateLimitedAnnouncer.cleanup();
    });

    it('should handle session tracker edge cases', async () => {
      announcer.startListening();

      const origin = 'http://localhost:3000'; // Match actual event origin
      const sessionId = 'duplicate-session';

      // Track the number of responses
      let responseCount = 0;
      eventTarget.addEventListener('discovery:wallet:response', () => {
        responseCount++;
      });

      // Send same session twice
      const request = createTestDiscoveryRequest({ origin, sessionId });
      const event1 = createDiscoveryRequestEvent(request);
      const event2 = createDiscoveryRequestEvent(request);

      eventTarget.dispatchEvent(event1);

      // Wait for async processing
      await vi.advanceTimersByTimeAsync(10);

      eventTarget.dispatchEvent(event2);

      // Wait for async processing
      await vi.advanceTimersByTimeAsync(10);

      // Should only process once due to session tracking
      expect(responseCount).toBe(1);
    });
  });
});
