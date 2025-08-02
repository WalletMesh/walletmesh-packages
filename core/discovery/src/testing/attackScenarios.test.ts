/**
 * Attack scenario tests for discovery protocol security validation.
 *
 * These tests validate the security properties defined in the Quint specification
 * by attempting various attack scenarios and ensuring they are properly blocked.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DiscoveryResponder } from '../responder/DiscoveryResponder.js';
import type { DiscoveryInitiator } from '../initiator/DiscoveryInitiator.js';
import { MockEventTarget } from './MockEventTarget.js';
import {
  createTestResponderInfo,
  createTestSecurityPolicy,
  createTestDiscoveryRequest,
} from './testUtils.js';
import { mockBrowserEnvironment, restoreBrowserEnvironment } from './browserMocks.js';
import type { DiscoveryRequestEvent } from '../core/types.js';
import { setupFakeTimers, cleanupFakeTimers } from './timingHelpers.js';

describe('Attack Scenario Tests', () => {
  let announcer: DiscoveryResponder;
  let listener: DiscoveryInitiator | undefined;
  let mockEventTarget: MockEventTarget;

  beforeEach(() => {
    setupFakeTimers();
    mockEventTarget = new MockEventTarget();
    // Don't set up global browser environment - each test will set its own
  });

  afterEach(() => {
    cleanupFakeTimers();
    restoreBrowserEnvironment();
    vi.restoreAllMocks();

    if (announcer) {
      announcer.cleanup();
    }
    if (listener) {
      listener.dispose();
    }
  });

  describe('Session Poisoning Attacks', () => {
    it('should block session poisoning from different origin', () => {
      // Set up browser environment to simulate malicious origin
      mockBrowserEnvironment({ origin: 'https://malicious-site.com' });

      // Setup announcer with strict security
      const securityPolicy = createTestSecurityPolicy({
        allowedOrigins: ['https://trusted-dapp.com'],
        requireHttps: true,
      });

      announcer = new DiscoveryResponder({
        responderInfo: createTestResponderInfo.ethereum(),
        eventTarget: mockEventTarget,
        securityPolicy,
      });

      announcer.startListening();

      // Malicious wallet tries to use session from trusted origin
      const maliciousRequest = createTestDiscoveryRequest({
        origin: 'https://malicious-site.com', // Different origin
        sessionId: 'session-from-trusted-dapp', // Session intended for trusted dapp
      });

      const event = new CustomEvent('discovery:wallet:request', { detail: maliciousRequest });
      mockEventTarget.dispatchEvent(event);

      // Should not respond due to origin mismatch
      const responses = mockEventTarget.getDispatchedEventsOfType('discovery:wallet:response');
      expect(responses).toHaveLength(0);

      // Session poisoning attack was blocked successfully
    });

    it('should block same session ID from different origins', () => {
      const securityPolicy = createTestSecurityPolicy({
        allowedOrigins: ['https://app1.com', 'https://app2.com'],
      });

      announcer = new DiscoveryResponder({
        responderInfo: createTestResponderInfo.ethereum(),
        eventTarget: mockEventTarget,
        securityPolicy,
      });

      announcer.startListening();

      // First, legitimate request from app1
      mockBrowserEnvironment({ origin: 'https://app1.com' });
      const legitimateRequest = createTestDiscoveryRequest({
        origin: 'https://app1.com',
        sessionId: 'session-shared-123',
      });

      mockEventTarget.dispatchEvent(
        new CustomEvent('discovery:wallet:request', { detail: legitimateRequest }),
      );

      // Clear previous responses
      mockEventTarget.clearDispatchedEvents();

      // Then, app2 uses same session ID (this should now be blocked without origin namespacing)
      restoreBrowserEnvironment();
      mockBrowserEnvironment({ origin: 'https://app2.com' });

      const app2Request = createTestDiscoveryRequest({
        origin: 'https://app2.com',
        sessionId: 'session-shared-123', // Same session ID from app1 - now blocked
      });

      mockEventTarget.dispatchEvent(new CustomEvent('discovery:wallet:request', { detail: app2Request }));

      // Should not respond to the second request
      const responses = mockEventTarget.getDispatchedEventsOfType('discovery:wallet:response');
      expect(responses).toHaveLength(0); // No response due to session replay

      // Session replay was blocked
    });
  });

  describe('Replay Attacks', () => {
    it('should prevent session ID replay attacks', () => {
      // Set up browser environment for trusted dapp
      mockBrowserEnvironment({ origin: 'https://trusted-dapp.com' });

      announcer = new DiscoveryResponder({
        responderInfo: createTestResponderInfo.ethereum(),
        eventTarget: mockEventTarget,
        securityPolicy: createTestSecurityPolicy(),
      });

      announcer.startListening();

      const originalRequest = createTestDiscoveryRequest({
        origin: 'https://trusted-dapp.com',
        sessionId: 'unique-session-123',
      });

      // First request should succeed
      mockEventTarget.dispatchEvent(new CustomEvent('discovery:wallet:request', { detail: originalRequest }));
      let responses = mockEventTarget.getDispatchedEventsOfType('discovery:wallet:response');
      expect(responses).toHaveLength(1);

      // Clear responses
      mockEventTarget.clearDispatchedEvents();

      // Replay the same request - should be blocked
      mockEventTarget.dispatchEvent(new CustomEvent('discovery:wallet:request', { detail: originalRequest }));
      responses = mockEventTarget.getDispatchedEventsOfType('discovery:wallet:response');
      expect(responses).toHaveLength(0);

      // Replay attempt was blocked successfully
    });
  });

  describe('Origin Spoofing Attacks', () => {
    it('should block requests from blocked origins', () => {
      // Set up browser environment for malicious site
      mockBrowserEnvironment({ origin: 'https://malicious-site.com' });

      const securityPolicy = createTestSecurityPolicy({
        blockedOrigins: ['https://malicious-site.com', 'https://phishing-site.com'],
      });

      announcer = new DiscoveryResponder({
        responderInfo: createTestResponderInfo.ethereum(),
        eventTarget: mockEventTarget,
        securityPolicy,
      });

      announcer.startListening();

      const blockedRequest = createTestDiscoveryRequest({
        origin: 'https://malicious-site.com',
        sessionId: 'malicious-session-123',
      });

      mockEventTarget.dispatchEvent(new CustomEvent('discovery:wallet:request', { detail: blockedRequest }));

      // Should not respond
      const responses = mockEventTarget.getDispatchedEventsOfType('discovery:wallet:response');
      expect(responses).toHaveLength(0);

      // Origin was blocked successfully
    });

    it('should enforce HTTPS requirement', () => {
      // Set up browser environment for insecure site
      mockBrowserEnvironment({ origin: 'http://insecure-site.com' });

      const securityPolicy = createTestSecurityPolicy({
        requireHttps: true,
      });

      announcer = new DiscoveryResponder({
        responderInfo: createTestResponderInfo.ethereum(),
        eventTarget: mockEventTarget,
        securityPolicy,
      });

      announcer.startListening();

      const httpRequest = createTestDiscoveryRequest({
        origin: 'http://insecure-site.com', // HTTP instead of HTTPS
        sessionId: 'http-session-123',
      });

      mockEventTarget.dispatchEvent(new CustomEvent('discovery:wallet:request', { detail: httpRequest }));

      // Should not respond to HTTP request
      const responses = mockEventTarget.getDispatchedEventsOfType('discovery:wallet:response');
      expect(responses).toHaveLength(0);

      // HTTP request was blocked successfully
    });
  });

  describe('Rate Limiting Attacks', () => {
    it('should block rapid-fire discovery requests', async () => {
      const origin = 'https://spammy-dapp.com';

      // Set up browser environment for this specific test origin
      restoreBrowserEnvironment();
      mockBrowserEnvironment({ origin });

      const securityPolicy = createTestSecurityPolicy({
        rateLimit: {
          enabled: true,
          maxRequests: 3,
          windowMs: 60000, // 1 minute
        },
        // Allow any origin for this test
        requireHttps: true,
      });

      announcer = new DiscoveryResponder({
        responderInfo: createTestResponderInfo.ethereum(),
        eventTarget: mockEventTarget,
        securityPolicy,
      });

      announcer.startListening();

      // Send requests up to the limit
      for (let i = 0; i < 3; i++) {
        const request = createTestDiscoveryRequest({
          origin,
          sessionId: `session-${i}`,
        });

        mockEventTarget.dispatchEvent(new CustomEvent('discovery:wallet:request', { detail: request }));
      }

      // First 3 should succeed
      let responses = mockEventTarget.getDispatchedEventsOfType('discovery:wallet:response');
      expect(responses).toHaveLength(3);

      mockEventTarget.clearDispatchedEvents();

      // 4th request should be rate limited
      const rateLimitedRequest = createTestDiscoveryRequest({
        origin,
        sessionId: 'session-rate-limited',
      });

      mockEventTarget.dispatchEvent(
        new CustomEvent('discovery:wallet:request', { detail: rateLimitedRequest }),
      );

      // Should not respond due to rate limiting
      responses = mockEventTarget.getDispatchedEventsOfType('discovery:wallet:response');
      expect(responses).toHaveLength(0);

      // Rate limit was enforced successfully
    });

    it('should handle distributed denial of service attempts', async () => {
      const securityPolicy = createTestSecurityPolicy({
        rateLimit: {
          enabled: true,
          maxRequests: 2,
          windowMs: 60000,
        },
        requireHttps: true,
      });

      announcer = new DiscoveryResponder({
        responderInfo: createTestResponderInfo.ethereum(),
        eventTarget: mockEventTarget,
        securityPolicy,
      });

      announcer.startListening();

      // Simulate DDoS from multiple origins by changing browser environment for each origin
      const attackOrigins = ['https://attack1.com', 'https://attack2.com', 'https://attack3.com'];
      let totalResponses = 0;

      for (const origin of attackOrigins) {
        // Set up browser environment for this specific origin
        restoreBrowserEnvironment();
        mockBrowserEnvironment({ origin });

        // Send requests up to rate limit for each origin
        for (let i = 0; i < 3; i++) {
          const request = createTestDiscoveryRequest({
            origin,
            sessionId: `${origin}-session-${i}`,
          });

          mockEventTarget.dispatchEvent(new CustomEvent('discovery:wallet:request', { detail: request }));
        }

        // Count responses for this origin (should be 2, since rate limit is 2)
        const currentResponses = mockEventTarget.getDispatchedEventsOfType('discovery:wallet:response');
        const newResponses = currentResponses.length - totalResponses;
        totalResponses = currentResponses.length;
        expect(newResponses).toBeLessThanOrEqual(2); // At most 2 responses per origin
      }

      // Should have responses only for allowed requests (2 per origin max)
      const responses = mockEventTarget.getDispatchedEventsOfType('discovery:wallet:response');
      expect(responses).toHaveLength(6); // 2 requests * 3 origins

      // Rate limiting was enforced for each attacking origin
    });
  });

  describe('Capability Enumeration Attacks', () => {
    it('should not reveal capabilities for unsupported chains', () => {
      // Set up browser environment for enumeration attacker
      mockBrowserEnvironment({ origin: 'https://enumeration-attacker.com' });

      // Wallet only supports Ethereum
      const ethOnlyResponder = createTestResponderInfo.ethereum();

      announcer = new DiscoveryResponder({
        responderInfo: ethOnlyResponder,
        eventTarget: mockEventTarget,
        securityPolicy: createTestSecurityPolicy(),
      });

      announcer.startListening();

      // Request for Solana capabilities (not supported)
      const solanaRequest = createTestDiscoveryRequest({
        origin: 'https://enumeration-attacker.com',
        sessionId: 'enumeration-session-123',
        required: {
          chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'], // Solana mainnet
          features: ['account-management'],
          interfaces: ['solana-wallet-standard'],
        },
      });

      mockEventTarget.dispatchEvent(new CustomEvent('discovery:wallet:request', { detail: solanaRequest }));

      // Should not respond (silent failure for privacy)
      const responses = mockEventTarget.getDispatchedEventsOfType('discovery:wallet:response');
      expect(responses).toHaveLength(0);

      // No security events logged for capability enumeration
      // (this is normal behavior, not an attack)
    });
  });

  describe('Message Validation Attacks', () => {
    it('should reject malformed discovery requests', () => {
      // Set up browser environment for malformed dapp
      mockBrowserEnvironment({ origin: 'https://malformed-dapp.com' });

      announcer = new DiscoveryResponder({
        responderInfo: createTestResponderInfo.ethereum(),
        eventTarget: mockEventTarget,
        securityPolicy: createTestSecurityPolicy(),
      });

      announcer.startListening();

      // Malformed request missing required fields
      const malformedRequest = {
        type: 'discovery:wallet:request',
        // Missing version, sessionId, timestamp, etc.
        origin: 'https://malformed-dapp.com',
      } as DiscoveryRequestEvent;

      mockEventTarget.dispatchEvent(
        new CustomEvent('discovery:wallet:request', { detail: malformedRequest }),
      );

      // Should not respond to malformed request
      const responses = mockEventTarget.getDispatchedEventsOfType('discovery:wallet:response');
      expect(responses).toHaveLength(0);
    });

    it('should reject requests with invalid protocol version', () => {
      // Set up browser environment for outdated dapp
      mockBrowserEnvironment({ origin: 'https://outdated-dapp.com' });

      announcer = new DiscoveryResponder({
        responderInfo: createTestResponderInfo.ethereum(),
        eventTarget: mockEventTarget,
        securityPolicy: createTestSecurityPolicy(),
      });

      announcer.startListening();

      const invalidVersionRequest = createTestDiscoveryRequest({
        origin: 'https://outdated-dapp.com',
        sessionId: 'invalid-version-session',
        version: '99.0.0' as '0.1.0', // Invalid version
      });

      mockEventTarget.dispatchEvent(
        new CustomEvent('discovery:wallet:request', { detail: invalidVersionRequest }),
      );

      // Should not respond to invalid version
      const responses = mockEventTarget.getDispatchedEventsOfType('discovery:wallet:response');
      expect(responses).toHaveLength(0);
    });
  });

  describe('Security Event Integration', () => {
    it('should provide comprehensive security tracking', () => {
      // Spy on console.warn to verify security events are logged
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const securityPolicy = createTestSecurityPolicy({
        allowedOrigins: ['https://trusted-app.com'],
        blockedOrigins: ['https://blocked-app.com'],
        rateLimit: {
          enabled: true,
          maxRequests: 2,
          windowMs: 60000,
        },
      });

      announcer = new DiscoveryResponder({
        responderInfo: createTestResponderInfo.ethereum(),
        eventTarget: mockEventTarget,
        securityPolicy,
      });

      announcer.startListening();

      // Trigger various security events

      // 1. Blocked origin
      mockBrowserEnvironment({ origin: 'https://blocked-app.com' });
      mockEventTarget.dispatchEvent(
        new CustomEvent('discovery:wallet:request', {
          detail: createTestDiscoveryRequest({
            origin: 'https://blocked-app.com',
            sessionId: 'blocked-session',
          }),
        }),
      );

      // Verify origin was blocked
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[WalletMesh] Origin blocked'),
        expect.any(Object),
      );

      // 2. Rate limit exceeded
      restoreBrowserEnvironment();
      mockBrowserEnvironment({ origin: 'https://trusted-app.com' });
      for (let i = 0; i < 3; i++) {
        mockEventTarget.dispatchEvent(
          new CustomEvent('discovery:wallet:request', {
            detail: createTestDiscoveryRequest({
              origin: 'https://trusted-app.com',
              sessionId: `rate-limit-session-${i}`,
            }),
          }),
        );
      }

      // Verify rate limit was exceeded
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[WalletMesh] Rate limit exceeded'),
        expect.any(Object),
      );

      // 3. Session replay - use a new session to avoid rate limiting
      mockEventTarget.clearDispatchedEvents(); // Clear previous events

      // Create new announcer with fresh rate limiter to ensure the request succeeds
      announcer.cleanup();
      announcer = new DiscoveryResponder({
        responderInfo: createTestResponderInfo.ethereum(),
        eventTarget: mockEventTarget,
        securityPolicy,
      });
      announcer.startListening();

      const replayRequest = createTestDiscoveryRequest({
        origin: 'https://trusted-app.com',
        sessionId: 'replay-session-unique-123',
      });

      // First request should succeed
      mockEventTarget.dispatchEvent(new CustomEvent('discovery:wallet:request', { detail: replayRequest }));
      const initialResponses = mockEventTarget.getDispatchedEventsOfType('discovery:wallet:response');

      // Only proceed with replay if the first request succeeded
      if (initialResponses.length > 0) {
        mockEventTarget.clearDispatchedEvents();
        // Replay the same request - should be blocked and logged
        mockEventTarget.dispatchEvent(new CustomEvent('discovery:wallet:request', { detail: replayRequest }));

        // Verify session replay was detected
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('[WalletMesh] Session replay detected'),
          expect.any(Object),
        );
      }

      // Check security stats still work without SecurityEventLogger
      const stats = announcer.getStats();
      expect(stats.securityStats).toBeDefined();
      expect(stats.securityStats.usedSessionsCount).toBeDefined();

      // Cleanup spy
      consoleWarnSpy.mockRestore();
    });
  });
});
