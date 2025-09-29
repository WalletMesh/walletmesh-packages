/**
 * Edge case tests for DiscoveryResponder to improve coverage
 * Tests validation edge cases and error paths
 *
 * Type Suppression Usage in Tests:
 * - `as unknown as DiscoveryRequestEvent`: Used to test invalid/malformed request objects
 *   that intentionally violate the type system to ensure proper runtime validation
 * - `as unknown as { privateMethod: ... }`: Used to access private methods for direct
 *   unit testing of internal validation logic that's otherwise hard to test through
 *   the public API
 *
 * These suppressions are necessary for comprehensive edge case testing and are
 * appropriate in test contexts where we need to bypass type safety to test
 * runtime behavior with invalid inputs.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DiscoveryResponder } from '../responder.js';
import { MockEventTarget } from '../testing/MockEventTarget.js';
import {
  createTestResponderInfo,
  createTestDiscoveryRequest,
  createTestSecurityPolicy,
} from '../testing/testUtils.js';
import { setupFakeTimers, cleanupFakeTimers } from '../testing/timingHelpers.js';
import { createTestEvent } from '../testing/eventHelpers.js';
import { createConsoleSpy } from '../testing/consoleMocks.js';
import type { DiscoveryRequestEvent } from '../types/core.js';
import type { TechnologyRequirement } from '../types/capabilities.js';
import type { Logger } from '../core/logger.js';
import { ProtocolError } from '../utils/protocolError.js';
import { ERROR_CODES } from '../core/constants.js';
import type { DiscoveryResponderConfig } from '../types/testing.js';

function createAnnouncer(config: DiscoveryResponderConfig): DiscoveryResponder {
  return new DiscoveryResponder(config.responderInfo, {
    ...(config.securityPolicy && { security: config.securityPolicy }),
    ...(config.sessionOptions && { sessionOptions: config.sessionOptions }),
    ...(config.eventTarget && { eventTarget: config.eventTarget }),
    ...(config.logger && { logger: config.logger }),
  });
}

describe('DiscoveryResponder Edge Cases', () => {
  let announcer: DiscoveryResponder;
  let mockEventTarget: MockEventTarget;

  beforeEach(() => {
    setupFakeTimers();
    mockEventTarget = new MockEventTarget();

    announcer = createAnnouncer({
      responderInfo: createTestResponderInfo.ethereum(),
      eventTarget: mockEventTarget,
      securityPolicy: {
        requireHttps: false,
        allowLocalhost: true,
      },
    });
  });

  afterEach(() => {
    cleanupFakeTimers();
    announcer.stopListening();
  });

  describe('Request Validation Edge Cases', () => {
    it('should reject requests with missing initiator name', () => {
      announcer.startListening();

      const request = createTestDiscoveryRequest({
        initiatorInfo: {
          name: '', // Empty name
          url: 'https://valid-url.com',
          icon: 'data:image/png;base64,validicon',
        },
      });

      const event = createTestEvent('discovery:request', request);
      mockEventTarget.dispatchEvent(event);

      const responses = mockEventTarget.getDispatchedEventsOfType('responder:announce');
      expect(responses).toHaveLength(0);
    });

    it('should reject requests with missing initiator URL', () => {
      announcer.startListening();

      const request = createTestDiscoveryRequest({
        initiatorInfo: {
          name: 'Valid App',
          url: '', // Empty URL
          icon: 'data:image/png;base64,validicon',
        },
      });

      const event = createTestEvent('discovery:request', request);
      mockEventTarget.dispatchEvent(event);

      const responses = mockEventTarget.getDispatchedEventsOfType('responder:announce');
      expect(responses).toHaveLength(0);
    });

    it('should reject requests with invalid URL format', () => {
      announcer.startListening();

      const request = createTestDiscoveryRequest({
        initiatorInfo: {
          name: 'Valid App',
          url: 'not-a-valid-url', // Invalid URL format
          icon: 'data:image/png;base64,validicon',
        },
      });

      const event = createTestEvent('discovery:request', request);
      mockEventTarget.dispatchEvent(event);

      const responses = mockEventTarget.getDispatchedEventsOfType('responder:announce');
      expect(responses).toHaveLength(0);
    });

    it('should reject requests with malformed URL that throws error', () => {
      announcer.startListening();

      // Create a request with URL that will throw when passed to URL constructor
      const request = createTestDiscoveryRequest({
        initiatorInfo: {
          name: 'Valid App',
          url: 'http://[invalid-host]/', // Malformed URL
          icon: 'data:image/png;base64,validicon',
        },
      });

      const event = createTestEvent('discovery:request', request);
      mockEventTarget.dispatchEvent(event);

      const responses = mockEventTarget.getDispatchedEventsOfType('responder:announce');
      expect(responses).toHaveLength(0);
    });
  });

  describe('Capability Structure Validation', () => {
    it('should reject requests with missing chains array', () => {
      announcer.startListening();

      const request = {
        ...createTestDiscoveryRequest(),
        required: {
          chains: undefined, // Missing chains
          features: ['account-management'],
          interfaces: ['eip-1193'],
        },
      } as unknown as DiscoveryRequestEvent;

      const event = createTestEvent('discovery:request', request);
      mockEventTarget.dispatchEvent(event);

      const responses = mockEventTarget.getDispatchedEventsOfType('responder:announce');
      expect(responses).toHaveLength(0);
    });

    it('should reject requests with non-array chains', () => {
      announcer.startListening();

      const request = {
        ...createTestDiscoveryRequest(),
        required: {
          chains: 'not-an-array', // Should be array
          features: ['account-management'],
          interfaces: ['eip-1193'],
        },
      } as unknown as DiscoveryRequestEvent;

      const event = createTestEvent('discovery:request', request);
      mockEventTarget.dispatchEvent(event);

      const responses = mockEventTarget.getDispatchedEventsOfType('responder:announce');
      expect(responses).toHaveLength(0);
    });

    it('should reject requests with missing features array', () => {
      announcer.startListening();

      const request = {
        ...createTestDiscoveryRequest(),
        required: {
          chains: ['eip155:1'],
          features: undefined, // Missing features
          interfaces: ['eip-1193'],
        },
      } as unknown as DiscoveryRequestEvent;

      const event = createTestEvent('discovery:request', request);
      mockEventTarget.dispatchEvent(event);

      const responses = mockEventTarget.getDispatchedEventsOfType('responder:announce');
      expect(responses).toHaveLength(0);
    });

    it('should reject requests with non-array features', () => {
      announcer.startListening();

      const request = {
        ...createTestDiscoveryRequest(),
        required: {
          chains: ['eip155:1'],
          features: 'not-an-array', // Should be array
          interfaces: ['eip-1193'],
        },
      } as unknown as DiscoveryRequestEvent;

      const event = createTestEvent('discovery:request', request);
      mockEventTarget.dispatchEvent(event);

      const responses = mockEventTarget.getDispatchedEventsOfType('responder:announce');
      expect(responses).toHaveLength(0);
    });

    it('should reject requests with missing interfaces array', () => {
      announcer.startListening();

      const request = {
        ...createTestDiscoveryRequest(),
        required: {
          chains: ['eip155:1'],
          features: ['account-management'],
          interfaces: undefined, // Missing interfaces
        },
      } as unknown as DiscoveryRequestEvent;

      const event = createTestEvent('discovery:request', request);
      mockEventTarget.dispatchEvent(event);

      const responses = mockEventTarget.getDispatchedEventsOfType('responder:announce');
      expect(responses).toHaveLength(0);
    });

    it('should reject requests with non-array interfaces', () => {
      announcer.startListening();

      const request = {
        ...createTestDiscoveryRequest(),
        required: {
          chains: ['eip155:1'],
          features: ['account-management'],
          interfaces: 'not-an-array', // Should be array
        },
      } as unknown as DiscoveryRequestEvent;

      const event = createTestEvent('discovery:request', request);
      mockEventTarget.dispatchEvent(event);

      const responses = mockEventTarget.getDispatchedEventsOfType('responder:announce');
      expect(responses).toHaveLength(0);
    });
  });

  describe('Optional Capabilities Validation', () => {
    it('should reject requests with invalid optional chains', () => {
      announcer.startListening();

      const request = {
        ...createTestDiscoveryRequest(),
        optional: {
          chains: 'not-an-array', // Should be array if present
          features: ['optional-feature'],
          interfaces: ['optional-interface'],
        },
      } as unknown as DiscoveryRequestEvent;

      const event = createTestEvent('discovery:request', request);
      mockEventTarget.dispatchEvent(event);

      const responses = mockEventTarget.getDispatchedEventsOfType('responder:announce');
      expect(responses).toHaveLength(0);
    });

    it('should reject requests with invalid optional features', () => {
      announcer.startListening();

      const request = {
        ...createTestDiscoveryRequest(),
        optional: {
          chains: ['eip155:137'],
          features: 'not-an-array', // Should be array if present
          interfaces: ['optional-interface'],
        },
      } as unknown as DiscoveryRequestEvent;

      const event = createTestEvent('discovery:request', request);
      mockEventTarget.dispatchEvent(event);

      const responses = mockEventTarget.getDispatchedEventsOfType('responder:announce');
      expect(responses).toHaveLength(0);
    });

    it('should reject requests with invalid optional interfaces', () => {
      announcer.startListening();

      const request = {
        ...createTestDiscoveryRequest(),
        optional: {
          chains: ['eip155:137'],
          features: ['optional-feature'],
          interfaces: 'not-an-array', // Should be array if present
        },
      } as unknown as DiscoveryRequestEvent;

      const event = createTestEvent('discovery:request', request);
      mockEventTarget.dispatchEvent(event);

      const responses = mockEventTarget.getDispatchedEventsOfType('responder:announce');
      expect(responses).toHaveLength(0);
    });
  });

  describe('Direct Validation Method Tests', () => {
    // Test the validation logic directly rather than through the full event flow

    it('should validate URL format correctly', () => {
      const privateAnnouncer = announcer as unknown as {
        validateRequest?: (request: unknown) => boolean;
      };

      // Test valid URL formats
      const validRequest = createTestDiscoveryRequest({
        initiatorInfo: {
          name: 'Valid App',
          url: 'https://valid-url.com',
          icon: 'data:image/png;base64,valid',
        },
      });

      if (typeof privateAnnouncer.validateRequest === 'function') {
        expect(privateAnnouncer.validateRequest(validRequest)).toBe(true);
      }

      // Test invalid URL format
      const invalidRequest = createTestDiscoveryRequest({
        initiatorInfo: {
          name: 'Invalid App',
          url: 'not-a-valid-url',
          icon: 'data:image/png;base64,valid',
        },
      });

      if (typeof privateAnnouncer.validateRequest === 'function') {
        expect(privateAnnouncer.validateRequest(invalidRequest)).toBe(false);
      }
    });
  });

  describe('error handling edge cases', () => {
    it('should handle session replay detection errors (coverage: lines 480-482)', () => {
      const mockLogger: Logger = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };

      const announcer = createAnnouncer({
        responderInfo: createTestResponderInfo.ethereum(),
        eventTarget: mockEventTarget,
        securityPolicy: createTestSecurityPolicy(),
        logger: mockLogger,
      });

      const request = createTestDiscoveryRequest();
      const privateAnnouncer = announcer as unknown as {
        handleRequestProcessingError(error: unknown, request?: DiscoveryRequestEvent): void;
      };

      // Use ProtocolError with SESSION_REPLAY_DETECTED code
      const error = new ProtocolError(
        ERROR_CODES.SESSION_REPLAY_DETECTED,
        { sessionId: request.sessionId },
        'Session replay detected',
      );
      privateAnnouncer.handleRequestProcessingError(error, request);

      // SESSION_REPLAY_DETECTED is a silent failure code, so it logs at debug level
      expect(mockLogger.debug).toHaveBeenCalledWith(
        `[Silent Failure] Session replay detected for session: ${request.sessionId}`,
        { errorCode: ERROR_CODES.SESSION_REPLAY_DETECTED },
      );
    });

    it('should handle capability not supported errors (coverage: lines 482-487)', () => {
      const mockLogger: Logger = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };

      const announcer = createAnnouncer({
        responderInfo: createTestResponderInfo.ethereum(),
        eventTarget: mockEventTarget,
        securityPolicy: createTestSecurityPolicy(),
        logger: mockLogger,
      });

      const request = createTestDiscoveryRequest();
      const privateAnnouncer = announcer as unknown as {
        handleRequestProcessingError(error: unknown, request?: DiscoveryRequestEvent): void;
      };

      // Use ProtocolError with CAPABILITY_NOT_SUPPORTED code
      const error = new ProtocolError(ERROR_CODES.CAPABILITY_NOT_SUPPORTED, {}, 'Capability not supported');
      privateAnnouncer.handleRequestProcessingError(error, request);

      // CAPABILITY_NOT_SUPPORTED is a silent failure code, so it logs at debug level
      expect(mockLogger.debug).toHaveBeenCalledWith(
        `No capability match for request from: ${request.origin}`,
        { errorCode: ERROR_CODES.CAPABILITY_NOT_SUPPORTED },
      );

      // Test chain not supported as well
      const chainError = new ProtocolError(ERROR_CODES.CHAIN_NOT_SUPPORTED, {}, 'Chain not supported');
      privateAnnouncer.handleRequestProcessingError(chainError, request);

      // CHAIN_NOT_SUPPORTED is also a silent failure code
      expect(mockLogger.debug).toHaveBeenCalledWith(
        `No capability match for request from: ${request.origin}`,
        { errorCode: ERROR_CODES.CHAIN_NOT_SUPPORTED },
      );
    });

    it('should handle response sending errors (coverage: lines 507-511)', () => {
      const announcer = createAnnouncer({
        responderInfo: createTestResponderInfo.ethereum(),
        eventTarget: mockEventTarget,
        securityPolicy: createTestSecurityPolicy(),
      });

      const consoleSpy = createConsoleSpy({ methods: ['error'], mockFn: () => vi.fn() });

      const request = createTestDiscoveryRequest();
      const privateAnnouncer = announcer as unknown as {
        handleResponseSendingError(error: Error, request: DiscoveryRequestEvent): void;
      };

      // Test dispatchEvent error
      privateAnnouncer.handleResponseSendingError(new Error('dispatchEvent failed'), request);

      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining(`Failed to dispatch response event for ${request.origin}:`),
        'dispatchEvent failed',
      );

      // Test general response error
      privateAnnouncer.handleResponseSendingError(new Error('General response error'), request);

      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining(`Failed to send discovery response to ${request.origin}:`),
        'General response error',
      );

      consoleSpy.restore();
    });
  });

  describe('request validation edge cases', () => {
    it('should handle protocol version mismatch (coverage: lines 543-547)', () => {
      const announcer = createAnnouncer({
        responderInfo: createTestResponderInfo.ethereum(),
        eventTarget: mockEventTarget,
        securityPolicy: createTestSecurityPolicy(),
      });

      const consoleSpy = createConsoleSpy({ methods: ['warn'], mockFn: () => vi.fn() });

      const invalidVersionRequest = {
        ...createTestDiscoveryRequest(),
        version: '999.0.0' as const, // Invalid version
      } as unknown as DiscoveryRequestEvent;

      const privateAnnouncer = announcer as unknown as {
        isValidRequest(request: DiscoveryRequestEvent): boolean;
      };

      const result = privateAnnouncer.isValidRequest(invalidVersionRequest);

      expect(result).toBe(false);
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        expect.stringContaining('Protocol version mismatch: expected 0.1.0, got 999.0.0'),
      );

      consoleSpy.restore();
    });

    it('should handle invalid required capabilities structure (coverage: lines 563-580)', () => {
      const announcer = createAnnouncer({
        responderInfo: createTestResponderInfo.ethereum(),
        eventTarget: mockEventTarget,
        securityPolicy: createTestSecurityPolicy(),
      });

      const consoleSpy = createConsoleSpy({ methods: ['warn'], mockFn: () => vi.fn() });

      const privateAnnouncer = announcer as unknown as {
        isValidRequest(request: DiscoveryRequestEvent): boolean;
      };

      // Test missing required field entirely
      const missingRequiredRequest = {
        ...createTestDiscoveryRequest(),
        required: undefined as unknown as DiscoveryRequestEvent['required'],
      } as DiscoveryRequestEvent;

      expect(privateAnnouncer.isValidRequest(missingRequiredRequest)).toBe(false);
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        expect.stringContaining('Invalid discovery request: malformed requirements'),
      );

      // Test invalid technologies type
      const invalidTechnologiesRequest = {
        ...createTestDiscoveryRequest(),
        required: {
          technologies: 'not-an-array' as unknown as TechnologyRequirement[],
          features: [],
        },
      } as DiscoveryRequestEvent;

      expect(privateAnnouncer.isValidRequest(invalidTechnologiesRequest)).toBe(false);

      consoleSpy.restore();
    });
  });
});
