import { describe, it, expect, beforeEach } from 'vitest';
import { MockDiscoveryResponder } from './MockDiscoveryResponder.js';
import { createTestResponderInfo, createTestDiscoveryRequest } from './testUtils.js';
import type { DiscoveryResponderConfig, DiscoveryRequestEvent, SecurityPolicy } from '../core/types.js';
import { DISCOVERY_PROTOCOL_VERSION } from '../core/constants.js';

describe('MockDiscoveryResponder - Error Simulation and Edge Cases', () => {
  let announcer: MockDiscoveryResponder;
  let defaultConfig: DiscoveryResponderConfig;

  beforeEach(() => {
    defaultConfig = {
      responderInfo: createTestResponderInfo.ethereum(),
    };
    announcer = new MockDiscoveryResponder(defaultConfig);
  });

  describe('Basic Functionality', () => {
    it('should initialize with correct state', () => {
      const stats = announcer.getStats();
      expect(stats.isListening).toBe(false);
      expect(stats.receivedRequestsCount).toBe(0);
      expect(stats.sentResponsesCount).toBe(0);
      expect(stats.responderInfo.type).toBe('extension');
    });

    it('should start and stop listening correctly', () => {
      expect(announcer.isAnnouncerListening()).toBe(false);

      announcer.startListening();
      expect(announcer.isAnnouncerListening()).toBe(true);

      // Double start should be idempotent
      announcer.startListening();
      expect(announcer.isAnnouncerListening()).toBe(true);

      announcer.stopListening();
      expect(announcer.isAnnouncerListening()).toBe(false);

      // Double stop should be idempotent
      announcer.stopListening();
      expect(announcer.isAnnouncerListening()).toBe(false);
    });
  });

  describe('Discovery Request Simulation', () => {
    it('should not respond when not listening', () => {
      const request = createTestDiscoveryRequest();
      const response = announcer.simulateDiscoveryRequest(request);

      expect(response).toBeNull();
      expect(announcer.getReceivedRequests()).toHaveLength(0);
      expect(announcer.getSentResponses()).toHaveLength(0);
    });

    it('should respond to valid discovery requests when listening', () => {
      announcer.startListening();
      const request = createTestDiscoveryRequest({
        required: {
          chains: ['eip155:1'],
          features: ['account-management'],
          interfaces: ['eip-1193'],
        },
      });

      const response = announcer.simulateDiscoveryRequest(request);

      expect(response).not.toBeNull();
      expect(response?.type).toBe('discovery:wallet:response');
      expect(response?.sessionId).toBe(request.sessionId);
      expect(announcer.getReceivedRequests()).toHaveLength(1);
      expect(announcer.getSentResponses()).toHaveLength(1);
    });

    it('should not respond when capabilities dont match', () => {
      announcer.startListening();
      const request = createTestDiscoveryRequest({
        required: {
          chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'], // Wallet doesn't support Solana
          features: ['account-management'],
          interfaces: ['solana-wallet-standard'],
        },
      });

      const response = announcer.simulateDiscoveryRequest(request);

      expect(response).toBeNull();
      expect(announcer.getReceivedRequests()).toHaveLength(1);
      expect(announcer.getSentResponses()).toHaveLength(0);
    });
  });

  describe('Security Policy Enforcement', () => {
    it('should reject requests from blocked origins', () => {
      const securityPolicy: SecurityPolicy = {
        blockedOrigins: ['https://evil.com'],
      };

      announcer = new MockDiscoveryResponder({
        ...defaultConfig,
        securityPolicy,
      });
      announcer.startListening();

      const request = createTestDiscoveryRequest({
        origin: 'https://evil.com',
      });

      const response = announcer.simulateDiscoveryRequest(request);

      expect(response).toBeNull();
      expect(announcer.getReceivedRequests()).toHaveLength(1);
      expect(announcer.getSentResponses()).toHaveLength(0);
    });

    it('should only accept requests from allowed origins when allowlist is set', () => {
      const securityPolicy: SecurityPolicy = {
        allowedOrigins: ['https://trusted.com'],
      };

      announcer = new MockDiscoveryResponder({
        ...defaultConfig,
        securityPolicy,
      });
      announcer.startListening();

      // Request from non-allowed origin
      const untrustedRequest = createTestDiscoveryRequest({
        origin: 'https://untrusted.com',
      });

      let response = announcer.simulateDiscoveryRequest(untrustedRequest);
      expect(response).toBeNull();

      // Request from allowed origin
      const trustedRequest = createTestDiscoveryRequest({
        origin: 'https://trusted.com',
      });

      response = announcer.simulateDiscoveryRequest(trustedRequest);
      expect(response).not.toBeNull();
    });

    it('should enforce HTTPS requirement', () => {
      const securityPolicy: SecurityPolicy = {
        requireHttps: true,
        allowLocalhost: false,
      };

      announcer = new MockDiscoveryResponder({
        ...defaultConfig,
        securityPolicy,
      });
      announcer.startListening();

      const httpRequest = createTestDiscoveryRequest({
        origin: 'http://example.com',
      });

      const response = announcer.simulateDiscoveryRequest(httpRequest);
      expect(response).toBeNull();
    });

    it('should allow localhost when configured', () => {
      const securityPolicy: SecurityPolicy = {
        requireHttps: true,
        allowLocalhost: true,
      };

      announcer = new MockDiscoveryResponder({
        ...defaultConfig,
        securityPolicy,
      });
      announcer.startListening();

      const localhostRequest = createTestDiscoveryRequest({
        origin: 'http://localhost:3000',
      });

      const response = announcer.simulateDiscoveryRequest(localhostRequest);
      expect(response).not.toBeNull();
    });
  });

  describe('Multiple Request Handling', () => {
    it('should handle multiple requests in sequence', () => {
      announcer.startListening();

      const requests = [
        createTestDiscoveryRequest({ sessionId: 'session-1' }),
        createTestDiscoveryRequest({ sessionId: 'session-2' }),
        createTestDiscoveryRequest({ sessionId: 'session-3' }),
      ];

      const responses = announcer.simulateMultipleRequests(requests);

      expect(responses).toHaveLength(3);
      expect(announcer.getReceivedRequests()).toHaveLength(3);
      expect(announcer.getSentResponses()).toHaveLength(3);

      // Verify each response matches its request
      responses.forEach((response, index) => {
        const request = requests[index];
        expect(request).toBeDefined();
        expect(response.sessionId).toBe(request?.sessionId);
      });
    });

    it('should handle mixed valid and invalid requests', () => {
      announcer.startListening();

      const requests = [
        createTestDiscoveryRequest({ sessionId: 'valid-1' }),
        createTestDiscoveryRequest({
          sessionId: 'invalid-1',
          required: {
            chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'], // Not supported
            features: ['account-management'],
            interfaces: ['solana-wallet-standard'],
          },
        }),
        createTestDiscoveryRequest({ sessionId: 'valid-2' }),
      ];

      const responses = announcer.simulateMultipleRequests(requests);

      expect(responses).toHaveLength(2); // Only valid requests get responses
      const response0 = responses[0];
      const response1 = responses[1];
      expect(response0).toBeDefined();
      expect(response1).toBeDefined();
      expect(response0?.sessionId).toBe('valid-1');
      expect(response1?.sessionId).toBe('valid-2');
    });
  });

  describe('Wallet Info Updates', () => {
    it('should update wallet info and affect capability matching', () => {
      announcer.startListening();

      // Initially supports Ethereum
      const ethRequest = createTestDiscoveryRequest({
        required: {
          chains: ['eip155:1'],
          features: ['account-management'],
          interfaces: ['eip-1193'],
        },
      });

      let response = announcer.simulateDiscoveryRequest(ethRequest);
      expect(response).not.toBeNull();

      // Update to Solana wallet
      const solanaWallet = createTestResponderInfo.solana();
      announcer.updateResponderInfo(solanaWallet);

      // Ethereum request should now fail
      response = announcer.simulateDiscoveryRequest(ethRequest);
      expect(response).toBeNull();

      // Solana request should succeed
      const solanaRequest = createTestDiscoveryRequest({
        required: {
          chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
          features: ['account-management'],
          interfaces: ['solana-wallet-standard'],
        },
      });

      response = announcer.simulateDiscoveryRequest(solanaRequest);
      expect(response).not.toBeNull();
    });
  });

  describe('State Management', () => {
    it('should track last request and response', () => {
      announcer.startListening();

      expect(announcer.getLastRequest()).toBeUndefined();
      expect(announcer.getLastResponse()).toBeUndefined();

      const request1 = createTestDiscoveryRequest({ sessionId: 'session-1' });
      announcer.simulateDiscoveryRequest(request1);

      expect(announcer.getLastRequest()?.sessionId).toBe('session-1');
      expect(announcer.getLastResponse()?.sessionId).toBe('session-1');

      const request2 = createTestDiscoveryRequest({ sessionId: 'session-2' });
      announcer.simulateDiscoveryRequest(request2);

      expect(announcer.getLastRequest()?.sessionId).toBe('session-2');
      expect(announcer.getLastResponse()?.sessionId).toBe('session-2');
    });

    it('should reset state correctly', () => {
      announcer.startListening();

      // Add some state
      const requests = [
        createTestDiscoveryRequest({ sessionId: 'session-1' }),
        createTestDiscoveryRequest({ sessionId: 'session-2' }),
      ];
      announcer.simulateMultipleRequests(requests);

      expect(announcer.getReceivedRequests()).toHaveLength(2);
      expect(announcer.getSentResponses()).toHaveLength(2);
      expect(announcer.isAnnouncerListening()).toBe(true);

      // Reset
      announcer.reset();

      expect(announcer.getReceivedRequests()).toHaveLength(0);
      expect(announcer.getSentResponses()).toHaveLength(0);
      expect(announcer.isAnnouncerListening()).toBe(false);
      expect(announcer.getLastRequest()).toBeUndefined();
      expect(announcer.getLastResponse()).toBeUndefined();
    });

    it('should cleanup resources properly', () => {
      announcer.startListening();

      // Add some state
      announcer.simulateDiscoveryRequest(createTestDiscoveryRequest());

      // Cleanup
      announcer.cleanup();

      expect(announcer.isAnnouncerListening()).toBe(false);
      expect(announcer.getReceivedRequests()).toHaveLength(0);
      expect(announcer.getSentResponses()).toHaveLength(0);
    });
  });

  describe('Statistics and Debugging', () => {
    it('should provide comprehensive statistics', () => {
      announcer.startListening();

      const stats = announcer.getStats();

      expect(stats).toHaveProperty('isListening', true);
      expect(stats).toHaveProperty('config');
      expect(stats).toHaveProperty('responderInfo');
      expect(stats).toHaveProperty('receivedRequestsCount', 0);
      expect(stats).toHaveProperty('sentResponsesCount', 0);
      expect(stats).toHaveProperty('capabilityDetails');
      expect(stats).toHaveProperty('eventTargetStats');

      // Add some activity
      announcer.simulateDiscoveryRequest(createTestDiscoveryRequest());

      const updatedStats = announcer.getStats();
      expect(updatedStats.receivedRequestsCount).toBe(1);
      expect(updatedStats.sentResponsesCount).toBe(1);
    });

    it('should include config in stats for debugging', () => {
      const customConfig: DiscoveryResponderConfig = {
        responderInfo: createTestResponderInfo.ethereum(),
        securityPolicy: {
          requireHttps: true,
          allowedOrigins: ['https://example.com'],
        },
      };

      announcer = new MockDiscoveryResponder(customConfig);
      const stats = announcer.getStats();

      expect(stats.config).toEqual(customConfig);
    });
  });

  describe('Capability Testing Methods', () => {
    it('should allow testing capability matches without responding', () => {
      const request = createTestDiscoveryRequest({
        required: {
          chains: ['eip155:1'],
          features: ['account-management'],
          interfaces: ['eip-1193'],
        },
      });

      const matchResult = announcer.testCapabilityMatch(request);

      expect(matchResult.canFulfill).toBe(true);
      expect(matchResult.intersection).toBeDefined();
      expect(announcer.getReceivedRequests()).toHaveLength(0); // No request recorded
      expect(announcer.getSentResponses()).toHaveLength(0); // No response sent
    });

    it('should preview capability matches', () => {
      const request = createTestDiscoveryRequest({
        required: {
          chains: ['eip155:1'], // Only request chains the wallet supports
          features: ['account-management', 'transaction-signing'],
          interfaces: ['eip-1193'],
        },
      });

      const preview = announcer.previewCapabilityMatch(request);

      expect(preview.canFulfill).toBe(true);
      expect(preview.intersection?.required.chains).toContain('eip155:1');
      expect(preview.missing.chains).toHaveLength(0); // No missing chains
      expect(preview.missing.features).toHaveLength(0); // No missing features
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed requests gracefully', () => {
      announcer.startListening();

      const malformedRequest = {
        type: 'discovery:wallet:request',
        version: DISCOVERY_PROTOCOL_VERSION,
        sessionId: 'test-session',
        timestamp: Date.now(),
        origin: 'https://example.com',
        required: {
          chains: ['eip155:1'],
          features: ['account-management'],
          interfaces: ['eip-1193'],
        },
        initiatorInfo: {
          name: 'Test App',
          url: 'https://example.com',
          icon: 'data:image/svg+xml;base64,PHN2Zz4=',
        },
      } as DiscoveryRequestEvent;

      expect(() => {
        announcer.simulateDiscoveryRequest(malformedRequest);
      }).not.toThrow();
    });

    it('should handle rapid state changes', () => {
      // Rapid start/stop cycles
      for (let i = 0; i < 10; i++) {
        announcer.startListening();
        announcer.stopListening();
      }

      expect(announcer.isAnnouncerListening()).toBe(false);

      // Start and immediately simulate request
      announcer.startListening();
      const response = announcer.simulateDiscoveryRequest(createTestDiscoveryRequest());
      expect(response).not.toBeNull();
    });

    it('should handle wallet info updates during active listening', () => {
      announcer.startListening();

      const request = createTestDiscoveryRequest();

      // Simulate request
      let response = announcer.simulateDiscoveryRequest(request);
      expect(response).not.toBeNull();

      // Update wallet info while listening
      announcer.updateResponderInfo(createTestResponderInfo.solana());

      // Same request should now fail
      response = announcer.simulateDiscoveryRequest(request);
      expect(response).toBeNull();
    });

    it('should handle empty capability requirements', () => {
      announcer.startListening();

      const emptyRequest = createTestDiscoveryRequest({
        required: {
          chains: [],
          features: [],
          interfaces: [],
        },
      });

      const response = announcer.simulateDiscoveryRequest(emptyRequest);
      expect(response).not.toBeNull(); // Should respond even with empty requirements
    });

    it('should handle very large request batches', () => {
      announcer.startListening();

      const largeRequestBatch = Array.from({ length: 100 }, (_, i) =>
        createTestDiscoveryRequest({ sessionId: `session-${i}` }),
      );

      const start = Date.now();
      const responses = announcer.simulateMultipleRequests(largeRequestBatch);
      const duration = Date.now() - start;

      expect(responses).toHaveLength(100);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle concurrent operations safely', () => {
      announcer.startListening();

      // Simulate concurrent operations
      const operations = [
        () => announcer.simulateDiscoveryRequest(createTestDiscoveryRequest()),
        () => announcer.updateResponderInfo(createTestResponderInfo.solana()),
        () => announcer.getStats(),
        () => announcer.reset(),
        () => announcer.startListening(),
      ];

      // Execute all operations without errors
      for (const op of operations) {
        expect(() => op()).not.toThrow();
      }
    });
  });

  describe('Response Content Validation', () => {
    it('should include correct wallet information in response', () => {
      const customWallet = createTestResponderInfo.ethereum({
        uuid: 'custom-wallet', // Use uuid instead of id
        rdns: 'com.custom.wallet',
        name: 'Custom Wallet',
        icon: 'data:image/png;base64,custom',
        version: '2.0.0',
      });

      announcer = new MockDiscoveryResponder({
        responderInfo: customWallet,
      });
      announcer.startListening();

      const request = createTestDiscoveryRequest();
      const response = announcer.simulateDiscoveryRequest(request);

      expect(response?.responderId).toBe('custom-wallet');
      expect(response?.rdns).toBe('com.custom.wallet');
      expect(response?.name).toBe('Custom Wallet');
      expect(response?.icon).toBe('data:image/png;base64,custom');
      expect(response?.responderVersion).toBe('2.0.0');
    });

    it('should include correct capability intersection in response', () => {
      announcer.startListening();

      const request = createTestDiscoveryRequest({
        required: {
          chains: ['eip155:1'],
          features: ['account-management', 'transaction-signing'],
          interfaces: ['eip-1193'],
        },
        optional: {
          features: ['hardware-wallet', 'cross-chain-swaps'],
        },
      });

      const response = announcer.simulateDiscoveryRequest(request);

      expect(response?.matched).toBeDefined();
      expect(response?.matched.required).toBeDefined();
      expect(response?.matched.optional).toBeDefined();

      // Should include all required capabilities
      expect(response?.matched.required.chains).toContain('eip155:1');
      expect(response?.matched.required.features).toContain('account-management');
      expect(response?.matched.required.features).toContain('transaction-signing');
      expect(response?.matched.required.interfaces).toContain('eip-1193');
    });
  });
});
