/**
 * Consolidated test suite for security module
 * Combines main security functionality, session tracker tests, and module exports
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { OriginValidator } from './OriginValidator.js';
import { RateLimiter } from './RateLimiter.js';
import { SessionTracker } from './SessionTracker.js';
import { createTestSecurityPolicy } from '../testing/index.js';
import { setupFakeTimers, cleanupFakeTimers } from '../testing/timingHelpers.js';
import { testSessionTracking } from '../testing/securityHelpers.js';
import type { SessionTrackingScenario } from '../testing/securityHelpers.js';

describe('Security Module', () => {
  beforeEach(() => {
    setupFakeTimers();
  });

  afterEach(() => {
    cleanupFakeTimers();
  });

  // ===============================================
  // Integrated Security Tests
  // ===============================================
  describe('Integrated Security', () => {
    it('should validate allowed origins', () => {
      const policy = createTestSecurityPolicy({
        allowedOrigins: ['https://trusted-app.com'],
      });
      const validator = new OriginValidator(policy);

      const result = validator.validateEventOrigin('https://trusted-app.com', 'https://trusted-app.com');

      expect(result.valid).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should reject blocked origins', () => {
      const policy = createTestSecurityPolicy({
        blockedOrigins: ['https://malicious-site.com'],
      });
      const validator = new OriginValidator(policy);

      const result = validator.validateEventOrigin(
        'https://malicious-site.com',
        'https://malicious-site.com',
      );

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('blocked');
    });

    it('should reject HTTP origins when HTTPS is required', () => {
      const policy = {
        requireHttps: true,
        allowLocalhost: false,
        blockedOrigins: [],
        certificateValidation: false,
      };
      const validator = new OriginValidator(policy);

      const result = validator.validateEventOrigin('http://insecure-app.com', 'http://insecure-app.com');

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('HTTPS required');
    });

    it('should allow localhost when configured', () => {
      const policy = {
        requireHttps: false,
        allowLocalhost: true,
        blockedOrigins: [],
        certificateValidation: false,
      };
      const validator = new OriginValidator(policy);

      const result = validator.validateEventOrigin('http://localhost:3000', 'http://localhost:3000');

      expect(result.valid).toBe(true);
    });

    it('should reject localhost when not allowed', () => {
      const policy = {
        requireHttps: false,
        allowLocalhost: false,
        blockedOrigins: [],
        certificateValidation: false,
      };
      const validator = new OriginValidator(policy);

      const result = validator.validateEventOrigin('http://localhost:3000', 'http://localhost:3000');

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Localhost not allowed');
    });

    it('should detect origin mismatch', () => {
      const policy = {
        requireHttps: false,
        allowLocalhost: true,
        blockedOrigins: [],
        certificateValidation: false,
      };
      const validator = new OriginValidator(policy);

      const result = validator.validateEventOrigin('https://app1.com', 'https://app2.com');

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Origin mismatch');
    });
  });

  // ===============================================
  // SessionTracker Tests
  // ===============================================
  describe('SessionTracker', () => {
    let tracker: SessionTracker;

    beforeEach(() => {
      tracker = new SessionTracker();
    });

    describe('Basic Session Management', () => {
      it('should track and check sessions', () => {
        const origin = 'https://example.com';
        const sessionId = 'test-session-123';

        expect(tracker.hasSession(origin, sessionId)).toBe(false);

        tracker.trackSession(origin, sessionId);
        expect(tracker.hasSession(origin, sessionId)).toBe(true);
      });

      it('should prevent duplicate sessions', () => {
        const origin = 'https://example.com';
        const sessionId = 'duplicate-session';

        expect(tracker.trackSession(origin, sessionId)).toBe(true);
        expect(tracker.trackSession(origin, sessionId)).toBe(false); // Should return false for duplicate
        expect(tracker.hasSession(origin, sessionId)).toBe(true);
      });

      it('should remove sessions', () => {
        const origin = 'https://example.com';
        const sessionId = 'removable-session';

        tracker.trackSession(origin, sessionId);
        expect(tracker.hasSession(origin, sessionId)).toBe(true);

        tracker.removeSession(origin, sessionId);
        expect(tracker.hasSession(origin, sessionId)).toBe(false);
      });

      it('should get session count', () => {
        const origin = 'https://example.com';

        expect(tracker.getOriginStats(origin).activeSessions).toBe(0);

        tracker.trackSession(origin, 'session-1');
        tracker.trackSession(origin, 'session-2');
        tracker.trackSession(origin, 'session-3');

        expect(tracker.getOriginStats(origin).activeSessions).toBe(3);
      });
    });

    describe('Multiple Origin Isolation', () => {
      it('should isolate sessions between origins completely', () => {
        const sessionId = 'shared-session-123';
        const origins = ['https://app1.com', 'https://app2.com', 'https://app3.com'];

        // Track same session ID for multiple origins
        for (const origin of origins) {
          expect(tracker.trackSession(origin, sessionId)).toBe(true);
        }

        // Each origin should have its own session
        for (const origin of origins) {
          expect(tracker.hasSession(origin, sessionId)).toBe(true);
        }

        // Removing from one origin shouldn't affect others
        const origin0 = origins[0];
        const origin1 = origins[1];
        const origin2 = origins[2];
        if (!origin0 || !origin1 || !origin2) throw new Error('Test setup error: missing origins');

        tracker.removeSession(origin0, sessionId);
        expect(tracker.hasSession(origin0, sessionId)).toBe(false);
        expect(tracker.hasSession(origin1, sessionId)).toBe(true);
        expect(tracker.hasSession(origin2, sessionId)).toBe(true);
      });

      it('should handle max sessions per origin independently', () => {
        const limitedTracker = new SessionTracker({
          maxSessionsPerOrigin: 2,
        });

        const origin1 = 'https://app1.com';
        const origin2 = 'https://app2.com';

        // Fill up origin1
        limitedTracker.trackSession(origin1, 'session-1');
        limitedTracker.trackSession(origin1, 'session-2');

        // Fill up origin2
        limitedTracker.trackSession(origin2, 'session-a');
        limitedTracker.trackSession(origin2, 'session-b');

        // Adding to origin1 should evict oldest from origin1 only
        limitedTracker.trackSession(origin1, 'session-3');

        expect(limitedTracker.hasSession(origin1, 'session-1')).toBe(false); // Evicted
        expect(limitedTracker.hasSession(origin1, 'session-3')).toBe(true);
        expect(limitedTracker.hasSession(origin2, 'session-a')).toBe(true); // Not affected
        expect(limitedTracker.hasSession(origin2, 'session-b')).toBe(true);
      });
    });

    describe('Session Expiration', () => {
      it('should expire old sessions', () => {
        const expiringTracker = new SessionTracker({
          maxAge: 60000, // 1 minute
        });

        const origin = 'https://example.com';
        const now = Date.now();

        // Add session with old timestamp
        expiringTracker.trackSession(origin, 'old-session', now - 120000); // 2 minutes ago
        expect(expiringTracker.hasSession(origin, 'old-session')).toBe(false); // Should be expired

        // Add session with recent timestamp
        expiringTracker.trackSession(origin, 'recent-session', now - 30000); // 30 seconds ago
        expect(expiringTracker.hasSession(origin, 'recent-session')).toBe(true);
      });

      it('should handle sessions expiring at exact boundary', () => {
        const boundaryTracker = new SessionTracker({
          maxAge: 1000, // 1 second
        });

        const origin = 'https://example.com';
        const now = Date.now();

        // Add session exactly at boundary - should be valid (not exceeding limit)
        boundaryTracker.trackSession(origin, 'boundary-session', now - 1000);
        expect(boundaryTracker.hasSession(origin, 'boundary-session')).toBe(true);

        // Add session just before boundary
        boundaryTracker.trackSession(origin, 'valid-session', now - 999);
        expect(boundaryTracker.hasSession(origin, 'valid-session')).toBe(true);

        // Add session beyond boundary - should be rejected
        expect(boundaryTracker.trackSession(origin, 'expired-session', now - 1001)).toBe(false);
        expect(boundaryTracker.hasSession(origin, 'expired-session')).toBe(false);
      });

      it('should clean up origins independently based on expiration', () => {
        const cleanupTracker = new SessionTracker({
          maxAge: 60000, // 1 minute
          cleanupInterval: 30000, // 30 seconds
        });

        const now = Date.now();
        const origin1 = 'https://app1.com';
        const origin2 = 'https://app2.com';
        const origin3 = 'https://app3.com';

        // Add sessions at different times
        cleanupTracker.trackSession(origin1, 'old-session', now - 120000); // 2 minutes ago (expired)
        cleanupTracker.trackSession(origin2, 'recent-session', now - 30000); // 30 seconds ago
        cleanupTracker.trackSession(origin3, 'current-session', now); // Now

        // Advance time so recent-session becomes expired too
        vi.advanceTimersByTime(35000); // Now recent-session is 65 seconds old

        // Trigger cleanup
        cleanupTracker.cleanup();

        const state = cleanupTracker.getState();
        expect(state.usedSessions.has(origin1)).toBe(false); // Was already expired
        expect(state.usedSessions.has(origin2)).toBe(false); // Now expired too
        expect(state.usedSessions.has(origin3)).toBe(true); // Still valid (only 35 seconds old)
      });
    });

    describe('Memory Management', () => {
      it('should limit sessions per origin', () => {
        const limitedTracker = new SessionTracker({
          maxSessionsPerOrigin: 3,
        });

        const origin = 'https://example.com';

        // Add sessions up to limit
        for (let i = 1; i <= 3; i++) {
          expect(limitedTracker.trackSession(origin, `session-${i}`)).toBe(true);
        }

        expect(limitedTracker.getOriginStats(origin).activeSessions).toBe(3);

        // Add one more - should evict oldest
        expect(limitedTracker.trackSession(origin, 'session-4')).toBe(true);
        expect(limitedTracker.getOriginStats(origin).activeSessions).toBe(3);

        // First session should be evicted
        expect(limitedTracker.hasSession(origin, 'session-1')).toBe(false);
        expect(limitedTracker.hasSession(origin, 'session-4')).toBe(true);
      });

      it('should perform automatic cleanup', () => {
        const autoCleanupTracker = new SessionTracker({
          maxAge: 1000, // 1 second
          cleanupInterval: 500, // 0.5 seconds
        });

        const origin = 'https://example.com';

        autoCleanupTracker.trackSession(origin, 'session-1');
        expect(autoCleanupTracker.hasSession(origin, 'session-1')).toBe(true);

        // Advance time to trigger cleanup
        vi.advanceTimersByTime(1500);

        // Trigger cleanup by attempting another session track (which calls performCleanupIfNeeded)
        autoCleanupTracker.trackSession(origin, 'session-2');

        // Original session should be cleaned up due to time passing
        expect(autoCleanupTracker.hasSession(origin, 'session-1')).toBe(false);
      });

      it('should clean up empty origin maps', () => {
        const tracker = new SessionTracker({
          maxAge: 1000,
        });

        const origin = 'https://example.com';
        const now = Date.now();

        // Add expired session
        tracker.trackSession(origin, 'expired-session', now - 2000);

        // Trigger cleanup
        tracker.cleanup();

        // Origin should be removed from internal maps
        const state = tracker.getState();
        expect(state.usedSessions.has(origin)).toBe(false);
      });
    });

    describe('State Management', () => {
      it('should provide state information', () => {
        const origin = 'https://example.com';

        tracker.trackSession(origin, 'session-1');
        tracker.trackSession(origin, 'session-2');

        const memoryStats = tracker.getMemoryStats();
        expect(memoryStats.totalSessions).toBe(2);

        const state = tracker.getState();
        expect(state.usedSessions.has(origin)).toBe(true);
        expect(state.usedSessions.get(origin)?.size).toBe(2);
      });

      it('should clear all sessions', () => {
        const origins = ['https://app1.com', 'https://app2.com'];

        for (const origin of origins) {
          tracker.trackSession(origin, 'session-1');
          tracker.trackSession(origin, 'session-2');
        }

        expect(tracker.getMemoryStats().totalSessions).toBe(4);

        tracker.clear();

        expect(tracker.getMemoryStats().totalSessions).toBe(0);
        for (const origin of origins) {
          expect(tracker.getOriginStats(origin).activeSessions).toBe(0);
        }
      });

      it('should dispose and clean up resources', () => {
        const disposableTracker = new SessionTracker({
          cleanupInterval: 1000,
        });

        const origin = 'https://example.com';
        disposableTracker.trackSession(origin, 'session-1');

        expect(disposableTracker.getOriginStats(origin).activeSessions).toBe(1);

        disposableTracker.clear();

        // State should be cleared immediately after clear
        expect(disposableTracker.getMemoryStats().totalSessions).toBe(0);

        // After disposal, should still accept new sessions (clear doesn't disable functionality)
        expect(() => disposableTracker.trackSession(origin, 'session-2')).not.toThrow();
        expect(disposableTracker.getMemoryStats().totalSessions).toBe(1); // New session added
      });
    });
  });

  // ===============================================
  // Comprehensive Session Tracking with Helpers
  // ===============================================
  describe('Comprehensive Session Tracking with Helpers', () => {
    it('should test session tracking scenarios using helper', async () => {
      const scenarios: SessionTrackingScenario[] = [
        {
          name: 'First session for origin',
          origin: 'https://app1.com',
          sessionId: 'session-1',
          expectedTracked: true,
        },
        {
          name: 'Duplicate session',
          origin: 'https://app1.com',
          sessionId: 'session-1',
          expectedTracked: false,
          isDuplicate: true,
        },
        {
          name: 'Different session for same origin',
          origin: 'https://app1.com',
          sessionId: 'session-2',
          expectedTracked: true,
        },
        {
          name: 'Session for different origin',
          origin: 'https://app2.com',
          sessionId: 'session-1',
          expectedTracked: true,
        },
      ];

      const sessionTracker = new SessionTracker();
      const results = await testSessionTracking(sessionTracker, scenarios);

      expect(results.passed).toBe(4);
      expect(results.failed).toBe(0);

      // Verify specific results
      const duplicateResult = results.results.find(
        (r) => r.sessionId === 'session-1' && r.origin === 'https://app1.com' && !r.expected,
      );
      expect(duplicateResult?.actual).toBe(false);
      expect(duplicateResult?.passed).toBe(true); // Test passes because it expected false
    });

    it('should test session expiration with helper', async () => {
      const scenarios: SessionTrackingScenario[] = [
        {
          name: 'Active session',
          origin: 'https://example.com',
          sessionId: 'active-session',
          expectedTracked: true,
        },
        {
          name: 'Recently expired session',
          origin: 'https://example.com',
          sessionId: 'old-session',
          expectedTracked: true, // Will be tracked as new since old one expired
        },
      ];

      const sessionTracker = new SessionTracker({
        maxAge: 60000, // 1 minute
      });

      const results = await testSessionTracking(sessionTracker, scenarios);

      expect(results.passed).toBe(2);
      expect(results.failed).toBe(0);
    });

    it('should test session limits with helper', async () => {
      const origin = 'https://limited-app.com';

      // Create scenarios to test limit
      const scenarios: SessionTrackingScenario[] = Array.from({ length: 5 }, (_, i) => ({
        name: `Session ${i + 1}`,
        origin,
        sessionId: `session-${i + 1}`,
        expectedTracked: true,
      }));

      const sessionTracker = new SessionTracker({
        maxSessionsPerOrigin: 3,
      });

      const results = await testSessionTracking(sessionTracker, scenarios);

      expect(results.passed).toBe(5);
      expect(results.failed).toBe(0);
    });

    it('should test cross-origin isolation with helper', async () => {
      const scenarios: SessionTrackingScenario[] = [
        // Origin 1 sessions
        {
          name: 'App1 Session 1',
          origin: 'https://app1.com',
          sessionId: 'shared-id-1',
          expectedTracked: true,
        },
        {
          name: 'App1 Session 2',
          origin: 'https://app1.com',
          sessionId: 'shared-id-2',
          expectedTracked: true,
        },

        // Origin 2 with same session IDs - should be isolated
        {
          name: 'App2 Session 1',
          origin: 'https://app2.com',
          sessionId: 'shared-id-1',
          expectedTracked: true,
        },
        {
          name: 'App2 Session 2',
          origin: 'https://app2.com',
          sessionId: 'shared-id-2',
          expectedTracked: true,
        },

        // Origin 3 with same IDs - also isolated
        {
          name: 'App3 Session 1',
          origin: 'https://app3.com',
          sessionId: 'shared-id-1',
          expectedTracked: true,
        },
      ];

      const sessionTracker = new SessionTracker();
      const results = await testSessionTracking(sessionTracker, scenarios);

      expect(results.passed).toBe(5);
      expect(results.failed).toBe(0);
    });
  });

  // ===============================================
  // Module Exports Tests
  // ===============================================
  describe('Module Exports', () => {
    it('should export SessionTracker class', async () => {
      const { SessionTracker } = await import('./SessionTracker.js');

      expect(SessionTracker).toBeDefined();
      expect(typeof SessionTracker).toBe('function');

      // Verify it can be instantiated
      expect(() => new SessionTracker()).not.toThrow();
      const tracker = new SessionTracker();
      expect(tracker).toBeInstanceOf(SessionTracker);
    });

    it('should export OriginValidator class and utility functions', async () => {
      const originModule = await import('./OriginValidator.js');

      expect(originModule.OriginValidator).toBeDefined();
      expect(originModule.validateOrigin).toBeDefined();
      expect(originModule.validateEventOrigin).toBeDefined();

      expect(typeof originModule.OriginValidator).toBe('function');
      expect(typeof originModule.validateOrigin).toBe('function');
      expect(typeof originModule.validateEventOrigin).toBe('function');

      // Verify OriginValidator can be instantiated
      expect(() => new originModule.OriginValidator()).not.toThrow();
      const validator = new originModule.OriginValidator();
      expect(validator).toBeInstanceOf(originModule.OriginValidator);
    });

    it('should export RateLimiter class', async () => {
      const { RateLimiter } = await import('./RateLimiter.js');

      expect(RateLimiter).toBeDefined();
      expect(typeof RateLimiter).toBe('function');

      // Verify it can be instantiated
      expect(() => new RateLimiter()).not.toThrow();
      const limiter = new RateLimiter();
      expect(limiter).toBeInstanceOf(RateLimiter);
    });

    it('should export all expected security exports', async () => {
      const securityIndex = await import('./index.js');

      // Classes
      expect(securityIndex.SessionTracker).toBeDefined();
      expect(securityIndex.OriginValidator).toBeDefined();
      expect(securityIndex.RateLimiter).toBeDefined();

      // Utility functions
      expect(securityIndex.validateOrigin).toBeDefined();
      expect(securityIndex.validateEventOrigin).toBeDefined();

      // Verify all exports are functions or constructors
      expect(typeof securityIndex.SessionTracker).toBe('function');
      expect(typeof securityIndex.OriginValidator).toBe('function');
      expect(typeof securityIndex.RateLimiter).toBe('function');
      expect(typeof securityIndex.validateOrigin).toBe('function');
      expect(typeof securityIndex.validateEventOrigin).toBe('function');
    });

    it('should allow all security components to work together', () => {
      const validator = new OriginValidator({
        requireHttps: true,
        allowLocalhost: false,
      });

      const limiter = new RateLimiter({
        enabled: true,
        maxRequests: 5,
        windowMs: 60000,
      });

      const tracker = new SessionTracker({
        maxSessionsPerOrigin: 10,
        maxAge: 300000, // 5 minutes
      });

      const origin = 'https://secure-app.com';
      const sessionId = 'integration-test-session';

      // Validate origin
      const originResult = validator.validateOrigin(origin);
      expect(originResult.valid).toBe(true);

      // Check rate limiting
      const rateLimitResult = limiter.recordRequest(origin);
      expect(rateLimitResult).toBe(true);

      // Track session
      const sessionResult = tracker.trackSession(origin, sessionId);
      expect(sessionResult).toBe(true);

      // Verify session exists
      expect(tracker.hasSession(origin, sessionId)).toBe(true);
    });
  });

  // ===============================================
  // Cross-Component Integration Tests
  // ===============================================
  describe('Cross-Component Integration', () => {
    it('should work together for complete security validation', () => {
      const origin = 'https://trusted-app.com';
      const sessionId = 'secure-session-123';

      // Set up security components
      const validator = new OriginValidator({
        allowedOrigins: [origin],
        requireHttps: true,
      });

      const limiter = new RateLimiter({
        enabled: true,
        maxRequests: 3,
        windowMs: 60000,
      });

      const tracker = new SessionTracker();

      // Simulate security validation flow
      const originValid = validator.validateOrigin(origin);
      expect(originValid.valid).toBe(true);

      const rateLimitOk = limiter.recordRequest(origin);
      expect(rateLimitOk).toBe(true);

      const sessionTracked = tracker.trackSession(origin, sessionId);
      expect(sessionTracked).toBe(true);

      // Simulate multiple requests
      for (let i = 0; i < 2; i++) {
        expect(limiter.recordRequest(origin)).toBe(true);
      }

      // Next request should be rate limited
      expect(limiter.recordRequest(origin)).toBe(false);

      // Session should still be tracked
      expect(tracker.hasSession(origin, sessionId)).toBe(true);
    });

    it('should handle security failures appropriately', () => {
      const maliciousOrigin = 'http://malicious-site.com';
      const sessionId = 'malicious-session';

      // Set up strict security
      const validator = new OriginValidator({
        requireHttps: true,
        blockedOrigins: [maliciousOrigin],
      });

      const limiter = new RateLimiter({
        enabled: true,
        maxRequests: 1,
        windowMs: 60000,
      });

      const tracker = new SessionTracker();

      // Origin should be rejected
      const originResult = validator.validateOrigin(maliciousOrigin);
      expect(originResult.valid).toBe(false);

      // Even if rate limiting passes, origin is invalid
      const rateLimitResult = limiter.recordRequest(maliciousOrigin);
      expect(rateLimitResult).toBe(true); // Rate limiter allows it

      // Session tracking should still work (defensive programming)
      const sessionResult = tracker.trackSession(maliciousOrigin, sessionId);
      expect(sessionResult).toBe(true);

      // But overall security check should fail due to origin validation
      expect(originResult.valid).toBe(false);
    });
  });
});
