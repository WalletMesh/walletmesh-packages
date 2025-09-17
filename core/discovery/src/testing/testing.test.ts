/**
 * Consolidated test suite for testing module
 * Combines MockEventTarget, testUtils, testScenarios, and assertions tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MockEventTarget } from './MockEventTarget.js';
import {
  createTestResponderInfo,
  createTestDiscoveryRequest,
  createTestSecurityPolicy,
  createTestDiscoveryConfig,
} from './testUtils.js';
import {
  createBasicDiscoveryScenario,
  createTimeoutScenario,
  createSecurityRejectionScenario,
} from './testScenarios.js';
import {
  assertValidDiscoveryRequestEvent,
  assertValidResponderAnnouncement,
  assertValidOriginValidation,
} from './assertions.js';
import { setupFakeTimers, cleanupFakeTimers } from './timingHelpers.js';

describe('Testing Module', () => {
  beforeEach(() => {
    setupFakeTimers();
  });

  afterEach(() => {
    cleanupFakeTimers();
  });

  // ===============================================
  // MockEventTarget Tests
  // ===============================================
  describe('MockEventTarget', () => {
    let mockTarget: MockEventTarget;

    beforeEach(() => {
      mockTarget = new MockEventTarget();
    });

    describe('Basic Event Handling', () => {
      it('should add and remove event listeners', () => {
        const listener = vi.fn();
        const eventType = 'test-event';

        mockTarget.addEventListener(eventType, listener);
        mockTarget.dispatchEvent(new CustomEvent(eventType, { detail: 'test-data' }));

        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith(
          expect.objectContaining({
            type: eventType,
            detail: 'test-data',
          }),
        );

        mockTarget.removeEventListener(eventType, listener);
        mockTarget.dispatchEvent(new CustomEvent(eventType, { detail: 'test-data-2' }));

        expect(listener).toHaveBeenCalledTimes(1); // Should not be called again
      });

      it('should support multiple listeners for the same event', () => {
        const listener1 = vi.fn();
        const listener2 = vi.fn();
        const eventType = 'multi-listener-event';

        mockTarget.addEventListener(eventType, listener1);
        mockTarget.addEventListener(eventType, listener2);
        mockTarget.dispatchEvent(new CustomEvent(eventType, { detail: 'shared-data' }));

        expect(listener1).toHaveBeenCalledWith(
          expect.objectContaining({
            detail: 'shared-data',
          }),
        );
        expect(listener2).toHaveBeenCalledWith(
          expect.objectContaining({
            detail: 'shared-data',
          }),
        );
      });

      it('should handle events with no detail', () => {
        const listener = vi.fn();
        const eventType = 'no-detail-event';

        mockTarget.addEventListener(eventType, listener);
        mockTarget.dispatchEvent(new CustomEvent(eventType));

        expect(listener).toHaveBeenCalledWith(
          expect.objectContaining({
            type: eventType,
            detail: null,
          }),
        );
      });
    });

    describe('Event Inspection', () => {
      it('should track dispatched events', () => {
        const event1 = new CustomEvent('event1', { detail: 'data1' });
        const event2 = new CustomEvent('event2', { detail: 'data2' });

        mockTarget.dispatchEvent(event1);
        mockTarget.dispatchEvent(event2);

        const dispatchedEvents = mockTarget.getDispatchedEvents();
        expect(dispatchedEvents).toHaveLength(2);
        expect(dispatchedEvents[0]?.type).toBe('event1');
        expect(dispatchedEvents[1]?.type).toBe('event2');
      });

      it('should filter events by type', () => {
        mockTarget.dispatchEvent(new CustomEvent('discovery:wallet:request', { detail: 'req1' }));
        mockTarget.dispatchEvent(new CustomEvent('discovery:wallet:response', { detail: 'ann1' }));
        mockTarget.dispatchEvent(new CustomEvent('discovery:wallet:request', { detail: 'req2' }));

        const requestEvents = mockTarget.getDispatchedEventsOfType('discovery:wallet:request');
        const announceEvents = mockTarget.getDispatchedEventsOfType('discovery:wallet:response');

        expect(requestEvents).toHaveLength(2);
        expect(announceEvents).toHaveLength(1);
        expect(requestEvents[0]?.detail).toBe('req1');
        expect(requestEvents[1]?.detail).toBe('req2');
        expect(announceEvents[0]?.detail).toBe('ann1');
      });

      it('should clear event history', () => {
        mockTarget.dispatchEvent(new CustomEvent('test', { detail: 'data' }));
        expect(mockTarget.getDispatchedEvents()).toHaveLength(1);

        mockTarget.clearEventHistory();
        expect(mockTarget.getDispatchedEvents()).toHaveLength(0);
      });
    });

    describe('Edge Cases', () => {
      it('should handle removing non-existent listeners gracefully', () => {
        const listener = vi.fn();
        expect(() => mockTarget.removeEventListener('non-existent', listener)).not.toThrow();
      });

      it('should handle dispatching events with no listeners', () => {
        expect(() => mockTarget.dispatchEvent(new CustomEvent('no-listeners'))).not.toThrow();
        expect(mockTarget.getDispatchedEvents()).toHaveLength(1);
      });

      it('should handle listeners that throw errors', () => {
        const throwingListener = vi.fn(() => {
          throw new Error('Listener error');
        });
        const normalListener = vi.fn();

        mockTarget.addEventListener('error-event', throwingListener);
        mockTarget.addEventListener('error-event', normalListener);

        expect(() => mockTarget.dispatchEvent(new CustomEvent('error-event'))).not.toThrow();
        expect(throwingListener).toHaveBeenCalled();
        expect(normalListener).toHaveBeenCalled();
      });

      it('should handle special event properties', () => {
        const customEvent = new CustomEvent('custom', {
          detail: { nested: 'data' },
          bubbles: true,
          cancelable: true,
        });

        const listener = vi.fn();
        mockTarget.addEventListener('custom', listener);
        mockTarget.dispatchEvent(customEvent);

        expect(listener).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'custom',
            detail: { nested: 'data' },
            bubbles: true,
            cancelable: true,
          }),
        );
      });
    });
  });

  // ===============================================
  // Test Utilities Tests
  // ===============================================
  describe('Test Utilities', () => {
    describe('createTestResponderInfo', () => {
      it('should create Ethereum responder info', () => {
        const responderInfo = createTestResponderInfo.ethereum();

        expect(responderInfo.rdns).toContain('ethereum');
        expect(responderInfo.name).toContain('Ethereum');
        expect(responderInfo.technologies.some((tech) => tech.type === 'evm')).toBe(true);
        expect(responderInfo.features.some((feature) => feature.id === 'account-management')).toBe(true);
        // ResponderInfo doesn't have interfaces property - technologies have interfaces instead
        expect(responderInfo.technologies.some((tech) => tech.interfaces.includes('eip-1193'))).toBe(true);
      });

      it('should create Solana responder info', () => {
        const responderInfo = createTestResponderInfo.solana();

        expect(responderInfo.rdns).toContain('solana');
        expect(responderInfo.name).toContain('Solana');
        expect(responderInfo.technologies.some((tech) => tech.type === 'solana')).toBe(true);
        expect(responderInfo.features.some((feature) => feature.id === 'account-management')).toBe(true);
      });

      it('should create Aztec responder info', () => {
        const responderInfo = createTestResponderInfo.aztec();

        expect(responderInfo.rdns).toContain('aztec');
        expect(responderInfo.name).toContain('Aztec');
        expect(responderInfo.technologies.some((tech) => tech.type === 'aztec')).toBe(true);
      });

      it('should create multi-chain responder info', () => {
        const responderInfo = createTestResponderInfo.multiChain();

        expect(responderInfo.technologies.length).toBeGreaterThan(1);
        expect(responderInfo.technologies.some((tech) => tech.type === 'evm')).toBe(true);
        expect(responderInfo.features.length).toBeGreaterThan(1);
      });

      it('should accept custom overrides', () => {
        const customName = 'Custom Test Wallet';
        const responderInfo = createTestResponderInfo.ethereum({
          name: customName,
          rdns: 'com.custom.test',
        });

        expect(responderInfo.name).toBe(customName);
        expect(responderInfo.rdns).toBe('com.custom.test');
        expect(responderInfo.technologies.some((tech) => tech.type === 'evm')).toBe(true);
      });
    });

    describe('createTestDiscoveryRequest', () => {
      it('should create basic discovery request', () => {
        const request = createTestDiscoveryRequest();

        expect(request.type).toBe('discovery:wallet:request');
        expect(request.sessionId).toBeDefined();
        expect(request.required).toBeDefined();
        expect(request.required.technologies).toBeInstanceOf(Array);
        expect(request.required.features).toBeInstanceOf(Array);
        expect(request.origin).toBeDefined();
        expect(request.initiatorInfo).toBeDefined();
      });

      it('should accept custom requirements', () => {
        const customRequirements = {
          technologies: [
            {
              type: 'evm' as const,
              interfaces: ['eip-1193'],
            },
          ],
          features: ['transaction-signing'],
        };

        const request = createTestDiscoveryRequest({
          required: customRequirements,
        });

        expect(request.required.technologies).toEqual(customRequirements.technologies);
        expect(request.required.features).toEqual(customRequirements.features);
      });

      it('should include optional requirements when provided', () => {
        const optionalRequirements = {
          technologies: [
            {
              type: 'evm' as const,
              interfaces: ['eip-1193'],
            },
          ],
          features: ['hardware-wallet'],
        };

        const request = createTestDiscoveryRequest({
          optional: optionalRequirements,
        });

        expect(request.optional).toEqual(optionalRequirements);
      });

      it('should generate unique session IDs', () => {
        const request1 = createTestDiscoveryRequest();
        const request2 = createTestDiscoveryRequest();

        expect(request1.sessionId).not.toBe(request2.sessionId);
        expect(request1.sessionId).toMatch(/^[0-9a-f-]{36}$/); // UUID format
        expect(request2.sessionId).toMatch(/^[0-9a-f-]{36}$/); // UUID format
      });
    });

    describe('createTestSecurityPolicy', () => {
      it('should create basic security policy', () => {
        const policy = createTestSecurityPolicy();

        expect(policy.requireHttps).toBeDefined();
        expect(policy.allowLocalhost).toBeDefined();
        expect(policy.blockedOrigins).toBeInstanceOf(Array);
        expect(policy.certificateValidation).toBeDefined();
      });

      it('should accept custom overrides', () => {
        const customPolicy = createTestSecurityPolicy({
          requireHttps: true,
          allowedOrigins: ['https://trusted.com'],
          rateLimit: {
            enabled: true,
            maxRequests: 10,
            windowMs: 60000,
          },
        });

        expect(customPolicy.requireHttps).toBe(true);
        expect(customPolicy.allowedOrigins).toEqual(['https://trusted.com']);
        expect(customPolicy.rateLimit?.enabled).toBe(true);
        expect(customPolicy.rateLimit?.maxRequests).toBe(10);
      });
    });

    describe('createTestDiscoveryConfig', () => {
      it('should create discovery configuration', () => {
        const config = createTestDiscoveryConfig();

        expect(config.timeout).toBeDefined();
        expect(config.maxResponders).toBeDefined();
        expect(config.eventTarget).toBeDefined();
      });

      it('should accept custom overrides', () => {
        const mockEventTarget = new MockEventTarget();
        const config = createTestDiscoveryConfig({
          timeout: 5000,
          maxResponders: 20,
          eventTarget: mockEventTarget,
        });

        expect(config.timeout).toBe(5000);
        expect(config.maxResponders).toBe(20);
        expect(config.eventTarget).toBe(mockEventTarget);
      });
    });
  });

  // ===============================================
  // Test Scenarios Tests
  // ===============================================
  describe('Test Scenarios', () => {
    describe('createBasicDiscoveryScenario', () => {
      it('should create basic discovery scenario', () => {
        const scenario = createBasicDiscoveryScenario();

        expect(scenario.name).toBeDefined();
        expect(scenario.description).toBeDefined();
        expect(scenario.setup).toBeDefined();
        expect(scenario.expectedOutcome).toBeDefined();
        expect(scenario.cleanup).toBeDefined();
      });

      it('should execute scenario successfully', async () => {
        const scenario = createBasicDiscoveryScenario({
          expectedResponders: 1,
        });

        const context = await scenario.setup();
        expect(context.listener).toBeDefined();
        expect(context.announcer).toBeDefined();

        // Execute the scenario manually since mock components don't auto-communicate
        context.announcer.startListening();

        // Start discovery and get session ID
        const discoveryPromise = context.listener.startDiscovery();
        const sessionId = context.listener.getCurrentSessionId();
        expect(sessionId).toBeTruthy();

        // Simulate announcement response
        const request = createTestDiscoveryRequest({
          sessionId: sessionId ?? 'fallback-session-id',
          required: {
            technologies: [
              {
                type: 'evm' as const,
                interfaces: ['eip-1193'],
              },
            ],
            features: ['account-management'],
          },
        });
        const response = context.announcer.simulateDiscoveryRequest(request);
        if (response) {
          context.listener.addMockWalletResponse(response);
        }

        const responders = await discoveryPromise;
        expect(responders.length).toBe(1);
        expect(scenario.expectedOutcome.respondersFound).toBe(1);

        await scenario.cleanup(context);
      });
    });

    describe('createTimeoutScenario', () => {
      it('should create timeout scenario', () => {
        const scenario = createTimeoutScenario();

        expect(scenario.name).toContain('Timeout');
        expect(scenario.setup).toBeDefined();
        expect(scenario.expectedOutcome.timeout).toBe(true);
      });

      it('should handle timeout correctly', async () => {
        const scenario = createTimeoutScenario({
          timeout: 1000,
        });

        const context = await scenario.setup();

        // Start discovery but don't provide any responders
        const discoveryPromise = context.listener.startDiscovery();

        // Verify discovery started
        expect(context.listener.isDiscovering()).toBe(true);

        // Advance time to trigger timeout and manually stop discovery
        await vi.advanceTimersByTimeAsync(1500);
        context.listener.stopDiscovery(); // Mock doesn't auto-timeout, so stop manually

        const result = await discoveryPromise;
        expect(result.length).toBe(0);
        expect(context.listener.isDiscovering()).toBe(false);

        await scenario.cleanup(context);
      });
    });

    describe('createSecurityRejectionScenario', () => {
      it('should create security rejection scenario', () => {
        const scenario = createSecurityRejectionScenario();

        expect(scenario.name).toContain('Security');
        expect(scenario.setup).toBeDefined();
        expect(scenario.expectedOutcome.securityRejection).toBe(true);
      });

      it('should reject insecure requests', async () => {
        const scenario = createSecurityRejectionScenario({
          maliciousOrigin: 'http://malicious-site.com',
        });

        const context = await scenario.setup();

        // Start announcer with strict security
        context.announcer.startListening();

        // Simulate request from malicious origin
        const maliciousRequest = createTestDiscoveryRequest({
          origin: 'http://malicious-site.com',
        });

        const mockEventTarget = context.eventTarget as MockEventTarget;
        mockEventTarget.dispatchEvent(
          new CustomEvent('discovery:wallet:request', { detail: maliciousRequest }),
        );

        // Should not receive any announcements
        const announcements = mockEventTarget.getDispatchedEventsOfType('discovery:wallet:response');
        expect(announcements.length).toBe(0);

        await scenario.cleanup(context);
      });
    });
  });

  // ===============================================
  // Assertions Tests
  // ===============================================
  describe('Assertions', () => {
    describe('assertValidDiscoveryRequestEvent', () => {
      it('should validate correct discovery request', () => {
        const validRequest = createTestDiscoveryRequest();

        expect(() => assertValidDiscoveryRequestEvent(validRequest)).not.toThrow();
      });

      it('should reject invalid discovery requests', () => {
        const invalidRequests = [
          null,
          undefined,
          {},
          { type: 'invalid' },
          { type: 'discovery:wallet:request' }, // Missing required fields
          {
            type: 'discovery:wallet:request',
            sessionId: 'test',
            required: null, // Invalid required field
          },
        ];

        for (const request of invalidRequests) {
          expect(() => assertValidDiscoveryRequestEvent(request as unknown)).toThrow();
        }
      });

      it('should validate required fields structure', () => {
        const requestWithInvalidRequired = {
          type: 'discovery:wallet:request',
          sessionId: 'test-session',
          required: {
            technologies: 'not-an-array', // Should be array
            features: ['valid-feature'],
          },
          origin: 'https://example.com',
          initiatorInfo: { name: 'Test', url: 'https://example.com', icon: 'icon' },
        };

        expect(() => assertValidDiscoveryRequestEvent(requestWithInvalidRequired as unknown)).toThrow();
      });
    });

    describe('assertValidResponderAnnouncement', () => {
      it('should validate correct responder announcement', () => {
        const validAnnouncement = {
          type: 'discovery:wallet:response',
          version: '0.1.0',
          responderId: 'test-responder-id',
          sessionId: 'test-session-id',
          rdns: 'com.test.wallet',
          name: 'Test Wallet',
          icon: 'data:image/png;base64,test',
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

        expect(() => assertValidResponderAnnouncement(validAnnouncement)).not.toThrow();
      });

      it('should reject invalid responder announcements', () => {
        const invalidAnnouncements = [
          null,
          undefined,
          {},
          { type: 'invalid' },
          { type: 'discovery:wallet:response' }, // Missing required fields
          {
            type: 'discovery:wallet:response',
            responderId: 'test',
            sessionId: 'test',
            rdns: 'com.test',
            name: 'Test',
            icon: 'icon',
            matched: null, // Invalid matched field
          },
        ];

        for (const announcement of invalidAnnouncements) {
          expect(() => assertValidResponderAnnouncement(announcement as unknown)).toThrow();
        }
      });
    });

    describe('assertValidOriginValidation', () => {
      it('should validate correct origin validation result', () => {
        const validResults = [
          { valid: true },
          { valid: false, reason: 'HTTPS required' },
          { valid: false, reason: 'Origin blocked', details: 'Additional info' },
        ];

        for (const result of validResults) {
          expect(() => assertValidOriginValidation(result)).not.toThrow();
        }
      });

      it('should reject invalid origin validation results', () => {
        const invalidResults = [
          null,
          undefined,
          {},
          { valid: 'not-boolean' },
          { valid: false }, // Missing reason when invalid
        ];

        for (const result of invalidResults) {
          expect(() => assertValidOriginValidation(result as unknown)).toThrow();
        }
      });
    });
  });

  // ===============================================
  // Integration Tests
  // ===============================================
  describe('Testing Module Integration', () => {
    it('should work together for complete test scenario', async () => {
      // Create test utilities
      const responderInfo = createTestResponderInfo.ethereum();
      const capabilityRequest = createTestDiscoveryRequest({
        required: {
          technologies: [
            {
              type: 'evm' as const,
              interfaces: ['eip-1193'],
            },
          ],
          features: ['account-management'],
        },
      });
      const securityPolicy = createTestSecurityPolicy({
        requireHttps: false,
        allowLocalhost: true,
      });

      // Validate test data
      assertValidDiscoveryRequestEvent(capabilityRequest);

      // Create test scenario
      const scenario = createBasicDiscoveryScenario({
        responderInfo,
        securityPolicy,
        expectedResponders: 1,
      });

      // Execute scenario
      const context = await scenario.setup();
      const mockEventTarget = context.eventTarget as MockEventTarget;

      // Test the flow - simulate manual request/response since mocks don't auto-communicate
      context.announcer.startListening();
      const response = context.announcer.simulateDiscoveryRequest(capabilityRequest);

      // Verify response was generated
      expect(response).toBeTruthy();

      if (response) {
        // Validate response
        assertValidResponderAnnouncement(response);

        // Simulate the response being dispatched as an event (as would happen in real scenario)
        mockEventTarget.dispatchEvent(new CustomEvent('discovery:wallet:response', { detail: response }));

        // Validate announcements
        const announcements = mockEventTarget.getDispatchedEventsOfType('discovery:wallet:response');
        expect(announcements.length).toBe(1);

        const announcement = announcements[0]?.detail;
        assertValidResponderAnnouncement(announcement);
      }

      await scenario.cleanup(context);
    });

    it('should handle complex multi-component scenarios', async () => {
      // Test multiple responders with different capabilities
      const ethereumResponder = createTestResponderInfo.ethereum();
      const solanaResponder = createTestResponderInfo.solana();

      const multiChainRequest = createTestDiscoveryRequest({
        required: {
          technologies: [
            { type: 'evm' as const, interfaces: ['eip-1193'] },
            { type: 'solana' as const, interfaces: ['solana-wallet-standard'] },
          ],
          features: ['account-management'],
        },
      });

      // Validate complex request
      assertValidDiscoveryRequestEvent(multiChainRequest);

      // Each responder should only respond if they support required capabilities
      expect(ethereumResponder.technologies.some((t) => t.type === 'evm')).toBe(true);
      expect(solanaResponder.technologies.some((t) => t.type === 'solana')).toBe(true);
    });
  });

  // ===============================================
  // Error Handling Tests
  // ===============================================
  describe('Error Handling', () => {
    it('should handle malformed test data gracefully', () => {
      const malformedInputs = [
        null,
        undefined,
        'string-instead-of-object',
        { incomplete: 'data' },
        { technologies: 'not-an-array' },
      ];

      for (const input of malformedInputs) {
        expect(() =>
          createTestDiscoveryRequest(input as unknown as Parameters<typeof createTestDiscoveryRequest>[0]),
        ).not.toThrow();
        expect(() =>
          createTestResponderInfo.ethereum(
            input as unknown as Parameters<typeof createTestResponderInfo.ethereum>[0],
          ),
        ).not.toThrow();
        expect(() =>
          createTestSecurityPolicy(input as unknown as Parameters<typeof createTestSecurityPolicy>[0]),
        ).not.toThrow();
      }
    });

    it('should provide helpful error messages in assertions', () => {
      try {
        assertValidDiscoveryRequestEvent({ invalid: 'request' } as unknown);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error instanceof Error).toBe(true);
        expect((error as Error).message).toContain('type');
      }
    });

    it('should clean up resources properly in scenarios', async () => {
      const scenario = createBasicDiscoveryScenario();
      const context = await scenario.setup();

      // Simulate error during execution
      try {
        throw new Error('Simulated error');
      } catch {
        // Cleanup should still work
        await expect(scenario.cleanup(context)).resolves.not.toThrow();
      }
    });
  });

  // ===============================================
  // Performance Tests
  // ===============================================
  describe('Performance', () => {
    it('should handle large numbers of events efficiently', () => {
      const mockTarget = new MockEventTarget();
      const listener = vi.fn();

      mockTarget.addEventListener('test-event', listener);

      const startTime = performance.now();

      // Dispatch many events
      for (let i = 0; i < 1000; i++) {
        mockTarget.dispatchEvent(new CustomEvent('test-event', { detail: i }));
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(listener).toHaveBeenCalledTimes(1000);
      expect(duration).toBeLessThan(100); // Should complete quickly
    });

    it('should manage memory efficiently with event history', () => {
      const mockTarget = new MockEventTarget();

      // Generate many events
      for (let i = 0; i < 1000; i++) {
        mockTarget.dispatchEvent(new CustomEvent(`event-${i}`, { detail: i }));
      }

      expect(mockTarget.getDispatchedEvents().length).toBe(1000);

      // Clear history to free memory
      mockTarget.clearEventHistory();
      expect(mockTarget.getDispatchedEvents().length).toBe(0);
    });

    it('should create test data efficiently', () => {
      const startTime = performance.now();

      // Create many test objects
      for (let i = 0; i < 100; i++) {
        createTestResponderInfo.ethereum();
        createTestDiscoveryRequest();
        createTestSecurityPolicy();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(50); // Should be very fast
    });
  });
});
