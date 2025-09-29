/**
 * Test suite for DiscoveryResponder silent failure behavior
 * Verifies that security-sensitive failures don't leak information
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DiscoveryResponder } from '../responder.js';
import { MockEventTarget } from '../testing/MockEventTarget.js';
import { createTestResponderInfo, createTestDiscoveryRequest } from '../testing/testUtils.js';
import { setupFakeTimers, cleanupFakeTimers } from '../testing/timingHelpers.js';
import { DISCOVERY_EVENTS, ERROR_CODES } from '../core/constants.js';
import type { Logger } from '../core/logger.js';
import type { ResponderInfo } from '../types/capabilities.js';
import type { DiscoveryResponderConfig } from '../types/testing.js';

function createResponder(config: DiscoveryResponderConfig): DiscoveryResponder {
  return new DiscoveryResponder(config.responderInfo, {
    ...(config.securityPolicy && { security: config.securityPolicy }),
    ...(config.sessionOptions && { sessionOptions: config.sessionOptions }),
    ...(config.eventTarget && { eventTarget: config.eventTarget }),
    ...(config.logger && { logger: config.logger }),
  });
}

describe('DiscoveryResponder - Silent Failure Behavior', () => {
  let responder: DiscoveryResponder;
  let responderInfo: ResponderInfo;
  let mockEventTarget: MockEventTarget;
  let mockLogger: Logger;
  let loggedMessages: Array<{ level: string; message: string; data?: unknown }>;

  beforeEach(() => {
    setupFakeTimers();
    mockEventTarget = new MockEventTarget();
    responderInfo = createTestResponderInfo.ethereum();

    // Create a mock logger to capture log messages
    loggedMessages = [];
    mockLogger = {
      debug: (message: string, data?: unknown) => {
        loggedMessages.push({ level: 'debug', message, data });
      },
      info: (message: string, data?: unknown) => {
        loggedMessages.push({ level: 'info', message, data });
      },
      warn: (message: string, data?: unknown) => {
        loggedMessages.push({ level: 'warn', message, data });
      },
      error: (message: string, error?: unknown) => {
        loggedMessages.push({ level: 'error', message, data: error });
      },
    };
  });

  afterEach(() => {
    cleanupFakeTimers();
    vi.clearAllMocks();
  });

  describe('Silent Failure for Security Violations', () => {
    it('should silently fail on rate limit exceeded without sending response', async () => {
      // Create responder with strict rate limiting
      responder = createResponder({
        responderInfo,
        eventTarget: mockEventTarget,
        logger: mockLogger,
        securityPolicy: {
          requireHttps: false,
          // Don't set allowedOrigins to allow all origins
          rateLimit: {
            enabled: true,
            maxRequests: 1,
            windowMs: 60000, // 1 minute window
          },
        },
      });

      responder.startListening();

      const request1 = createTestDiscoveryRequest({
        origin: 'https://test-dapp.com',
        sessionId: 'session-1',
      });

      const request2 = createTestDiscoveryRequest({
        origin: 'https://test-dapp.com',
        sessionId: 'session-2',
      });

      // First request should succeed
      const event1 = new CustomEvent(DISCOVERY_EVENTS.REQUEST, { detail: request1 });
      mockEventTarget.dispatchEvent(event1);

      // Second request should be silently ignored (rate limit exceeded)
      const event2 = new CustomEvent(DISCOVERY_EVENTS.REQUEST, { detail: request2 });
      mockEventTarget.dispatchEvent(event2);

      await vi.advanceTimersByTimeAsync(100);

      // Check that only one response was sent
      const responses = mockEventTarget.getDispatchedEventsOfType(DISCOVERY_EVENTS.RESPONSE);
      expect(responses).toHaveLength(1);
      expect(responses[0]?.detail.sessionId).toBe('session-1');

      // Verify silent failure was logged at debug level only
      const silentFailureLogs = loggedMessages.filter(
        (log) => log.message.includes('[Silent Failure]') && log.message.includes('Rate limit exceeded'),
      );
      expect(silentFailureLogs).toHaveLength(1);
      expect(silentFailureLogs[0]?.level).toBe('debug');
      expect(silentFailureLogs[0]?.data).toMatchObject({
        errorCode: ERROR_CODES.RATE_LIMIT_EXCEEDED,
      });
    });

    it('should silently fail on origin validation failure without sending response', async () => {
      // Create responder with strict origin validation
      responder = createResponder({
        responderInfo,
        eventTarget: mockEventTarget,
        logger: mockLogger,
        securityPolicy: {
          requireHttps: true,
          allowedOrigins: ['https://trusted-dapp.com'],
        },
      });

      responder.startListening();

      // Request from untrusted origin
      const request = createTestDiscoveryRequest({
        origin: 'https://untrusted-dapp.com',
        sessionId: 'session-1',
      });

      const event = new CustomEvent(DISCOVERY_EVENTS.REQUEST, { detail: request });
      mockEventTarget.dispatchEvent(event);

      await vi.advanceTimersByTimeAsync(100);

      // Verify no response was sent
      const responses = mockEventTarget.getDispatchedEventsOfType(DISCOVERY_EVENTS.RESPONSE);
      expect(responses).toHaveLength(0);

      // Verify silent failure was logged at debug level
      const silentFailureLogs = loggedMessages.filter(
        (log) => log.message.includes('[Silent Failure]') && log.message.includes('Origin validation failed'),
      );
      expect(silentFailureLogs).toHaveLength(1);
      expect(silentFailureLogs[0]?.level).toBe('debug');
      expect(silentFailureLogs[0]?.data).toMatchObject({
        errorCode: ERROR_CODES.ORIGIN_VALIDATION_FAILED,
      });
    });

    it('should silently fail on session replay attack without sending response', async () => {
      responder = createResponder({
        responderInfo,
        eventTarget: mockEventTarget,
        logger: mockLogger,
        securityPolicy: {
          requireHttps: false,
          // Don't set allowedOrigins to allow all origins
        },
      });

      responder.startListening();

      const request = createTestDiscoveryRequest({
        origin: 'https://test-dapp.com',
        sessionId: 'duplicate-session',
      });

      // Send first request
      const event1 = new CustomEvent(DISCOVERY_EVENTS.REQUEST, { detail: request });
      mockEventTarget.dispatchEvent(event1);

      await vi.advanceTimersByTimeAsync(100);

      // First request should succeed
      const firstResponses = mockEventTarget.getDispatchedEventsOfType(DISCOVERY_EVENTS.RESPONSE);
      expect(firstResponses).toHaveLength(1);

      // Clear previous events and logged messages
      mockEventTarget.clearDispatchedEvents();
      loggedMessages.length = 0;

      // Send duplicate request with same session ID (replay attack)
      const event2 = new CustomEvent(DISCOVERY_EVENTS.REQUEST, { detail: request });
      mockEventTarget.dispatchEvent(event2);

      await vi.advanceTimersByTimeAsync(100);

      // Verify no response was sent for the replay
      const responses = mockEventTarget.getDispatchedEventsOfType(DISCOVERY_EVENTS.RESPONSE);
      expect(responses).toHaveLength(0);

      // Verify silent failure was logged at debug level
      const silentFailureLogs = loggedMessages.filter(
        (log) => log.message.includes('[Silent Failure]') && log.message.includes('Session replay detected'),
      );
      expect(silentFailureLogs).toHaveLength(1);
      expect(silentFailureLogs[0]?.level).toBe('debug');
      expect(silentFailureLogs[0]?.data).toMatchObject({
        errorCode: ERROR_CODES.SESSION_REPLAY_DETECTED,
      });
    });

    it('should silently fail when capabilities cannot be fulfilled without sending response', async () => {
      // Create responder that only supports Ethereum
      responder = createResponder({
        responderInfo: createTestResponderInfo.ethereum(),
        eventTarget: mockEventTarget,
        logger: mockLogger,
        securityPolicy: {
          requireHttps: false,
          // Don't set allowedOrigins to allow all origins
        },
      });

      responder.startListening();

      // Request for Solana (not supported)
      const request = createTestDiscoveryRequest({
        origin: 'https://test-dapp.com',
        sessionId: 'session-1',
        required: {
          technologies: [
            {
              type: 'solana',
              interfaces: ['solana-wallet-standard'],
            },
          ],
          features: [],
        },
      });

      const event = new CustomEvent(DISCOVERY_EVENTS.REQUEST, { detail: request });
      mockEventTarget.dispatchEvent(event);

      await vi.advanceTimersByTimeAsync(100);

      // Verify no response was sent
      const responses = mockEventTarget.getDispatchedEventsOfType(DISCOVERY_EVENTS.RESPONSE);
      expect(responses).toHaveLength(0);

      // Verify silent failure was logged at debug level
      const silentFailureLogs = loggedMessages.filter(
        (log) =>
          log.message.includes('[Silent Failure]') &&
          log.message.includes('Cannot fulfill capability requirements'),
      );
      expect(silentFailureLogs).toHaveLength(1);
      expect(silentFailureLogs[0]?.level).toBe('debug');
      expect(silentFailureLogs[0]?.data).toMatchObject({
        errorCode: ERROR_CODES.CAPABILITY_NOT_SUPPORTED,
      });
    });

    it('should not log warnings for silent failures', async () => {
      responder = createResponder({
        responderInfo,
        eventTarget: mockEventTarget,
        logger: mockLogger,
        securityPolicy: {
          requireHttps: true,
          allowedOrigins: ['https://trusted-dapp.com'],
          rateLimit: {
            enabled: true,
            maxRequests: 1,
            windowMs: 60000,
          },
        },
      });

      responder.startListening();

      // Send multiple requests that should trigger various silent failures
      const requests = [
        // Untrusted origin
        createTestDiscoveryRequest({
          origin: 'https://untrusted.com',
          sessionId: 'session-1',
        }),
        // Rate limit (after first request succeeds)
        createTestDiscoveryRequest({
          origin: 'https://trusted-dapp.com',
          sessionId: 'session-2',
        }),
        createTestDiscoveryRequest({
          origin: 'https://trusted-dapp.com',
          sessionId: 'session-3',
        }),
      ];

      for (const request of requests) {
        const event = new CustomEvent(DISCOVERY_EVENTS.REQUEST, { detail: request });
        mockEventTarget.dispatchEvent(event);
        await vi.advanceTimersByTimeAsync(10);
      }

      // Check that no warnings were logged (only debug messages)
      const warnLogs = loggedMessages.filter((log) => log.level === 'warn');
      expect(warnLogs).toHaveLength(0);

      // All failures should be logged at debug level only
      const debugLogs = loggedMessages.filter(
        (log) => log.level === 'debug' && log.message.includes('[Silent Failure]'),
      );
      expect(debugLogs.length).toBeGreaterThan(0);
    });

    it('should handle ProtocolError with silent failure codes correctly', async () => {
      // Create a responder with strict origin validation to trigger a silent failure
      responder = createResponder({
        responderInfo,
        eventTarget: mockEventTarget,
        logger: mockLogger,
        securityPolicy: {
          requireHttps: true,
          allowedOrigins: ['https://trusted-dapp.com'], // Only allow specific origin
        },
      });

      responder.startListening();

      // Request from untrusted origin should trigger silent failure
      const request = createTestDiscoveryRequest({
        origin: 'https://untrusted-dapp.com',
        sessionId: 'session-1',
      });

      const event = new CustomEvent(DISCOVERY_EVENTS.REQUEST, { detail: request });
      mockEventTarget.dispatchEvent(event);
      await vi.advanceTimersByTimeAsync(100);

      // Verify no response was sent (silent failure)
      const responses = mockEventTarget.getDispatchedEventsOfType(DISCOVERY_EVENTS.RESPONSE);
      expect(responses).toHaveLength(0);

      // Verify silent failure was logged
      const silentFailureLogs = loggedMessages.filter(
        (log) => log.message.includes('[Silent Failure]') && log.message.includes('Origin validation failed'),
      );
      expect(silentFailureLogs).toHaveLength(1);
      expect(silentFailureLogs[0]?.level).toBe('debug');
    });
  });

  describe('Successful Responses (Non-Silent Failures)', () => {
    it('should send response when all validation passes', async () => {
      responder = createResponder({
        responderInfo,
        eventTarget: mockEventTarget,
        logger: mockLogger,
        securityPolicy: {
          requireHttps: false,
          // Don't set allowedOrigins to allow all origins
        },
      });

      responder.startListening();

      const request = createTestDiscoveryRequest({
        origin: 'https://test-dapp.com',
        sessionId: 'valid-session',
      });

      const event = new CustomEvent(DISCOVERY_EVENTS.REQUEST, { detail: request });
      mockEventTarget.dispatchEvent(event);

      await vi.advanceTimersByTimeAsync(100);

      // Verify response was sent
      const responses = mockEventTarget.getDispatchedEventsOfType(DISCOVERY_EVENTS.RESPONSE);
      expect(responses).toHaveLength(1);
      expect(responses[0]?.detail.sessionId).toBe('valid-session');

      // No silent failure logs should exist
      const silentFailureLogs = loggedMessages.filter((log) => log.message.includes('[Silent Failure]'));
      expect(silentFailureLogs).toHaveLength(0);
    });
  });
});
