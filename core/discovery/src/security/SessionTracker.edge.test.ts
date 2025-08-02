/**
 * Edge case tests for SessionTracker
 * Tests the uncovered lines and edge cases to improve test coverage
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { SessionTracker } from './SessionTracker.js';
import { DISCOVERY_CONFIG } from '../core/constants.js';
import { setupFakeTimers, cleanupFakeTimers } from '../testing/timingHelpers.js';

describe('SessionTracker Edge Cases', () => {
  let tracker: SessionTracker;

  beforeEach(() => {
    setupFakeTimers();
    tracker = new SessionTracker();
  });

  afterEach(() => {
    cleanupFakeTimers();
  });

  describe('Inconsistent State Handling', () => {
    it('should recover from inconsistent state between usedSessions and sessionTimestamps', () => {
      const origin = 'https://inconsistent.com';
      const sessionId = 'test-session';

      // Manually create inconsistent state by manipulating internal maps
      const privateTracker = tracker as unknown as {
        usedSessions: Map<string, Set<string>>;
        sessionTimestamps: Map<string, Map<string, number>>;
      };

      // Add to usedSessions but not sessionTimestamps
      privateTracker.usedSessions.set(origin, new Set([sessionId]));
      // sessionTimestamps doesn't have this origin

      // Should recover from inconsistent state and successfully track new session
      const result = tracker.trackSession(origin, 'new-session');
      expect(result).toBe(true);

      // Verify that the state is now consistent
      expect(privateTracker.usedSessions.has(origin)).toBe(true);
      expect(privateTracker.sessionTimestamps.has(origin)).toBe(true);

      // Original inconsistent session should be gone, new session should be present
      expect(tracker.hasSession(origin, sessionId)).toBe(false);
      expect(tracker.hasSession(origin, 'new-session')).toBe(true);
    });

    it('should handle null checks after initialization', () => {
      const origin = 'https://edgecase.com';
      const sessionId = 'edge-session';

      // This test covers the defensive null check after getting the origin maps
      // We'll manipulate the map to return undefined after the check
      const privateTracker = tracker as unknown as {
        usedSessions: Map<string, Set<string>>;
        sessionTimestamps: Map<string, Map<string, number>>;
      };

      // Initialize proper state first
      privateTracker.usedSessions.set(origin, new Set());
      privateTracker.sessionTimestamps.set(origin, new Map());

      // Mock one of the gets to return undefined to trigger the edge case
      const originalGet = privateTracker.usedSessions.get.bind(privateTracker.usedSessions);
      privateTracker.usedSessions.get = vi.fn().mockReturnValue(undefined);

      // This should return false due to the null check
      const result = tracker.trackSession(origin, sessionId);
      expect(result).toBe(false);

      // Restore
      privateTracker.usedSessions.get = originalGet;
    });
  });

  describe('trackRequest Edge Cases', () => {
    it('should handle missing request array initialization edge case', () => {
      const origin = 'https://requests.com';

      // Track request to initialize the array
      tracker.trackRequest(origin);

      // Manipulate internal state to make get return undefined
      const privateTracker = tracker as unknown as {
        requestCounts: Map<string, number[]>;
      };

      const originalGet = privateTracker.requestCounts.get;
      privateTracker.requestCounts.get = function (key: string) {
        // First call returns array to pass has check
        if (!this.has(key)) return undefined;
        // Second call returns undefined to trigger edge case
        return undefined;
      };

      // This should handle the undefined case gracefully
      expect(() => tracker.trackRequest(origin)).not.toThrow();

      // Restore original method
      privateTracker.requestCounts.get = originalGet;
    });

    it('should clean up old requests from the tracking window', () => {
      const origin = 'https://cleanup.com';
      const now = Date.now();

      // Add requests at different times
      tracker.trackRequest(origin, now - DISCOVERY_CONFIG.RATE_LIMIT_WINDOW_MS - 1000); // Old request
      tracker.trackRequest(origin, now - 1000); // Recent request
      tracker.trackRequest(origin, now); // Current request

      // Check the request count
      const privateTracker = tracker as unknown as {
        requestCounts: Map<string, number[]>;
      };

      const requests = privateTracker.requestCounts.get(origin);
      expect(requests).toBeDefined();
      expect(requests?.length).toBe(2); // Only recent and current should remain
    });
  });

  describe('isRateLimited Edge Cases', () => {
    it('should handle rate limiting at exact boundary', () => {
      const origin = 'https://boundary.com';
      const now = Date.now();

      // Add requests up to the limit
      for (let i = 0; i < DISCOVERY_CONFIG.MAX_REQUESTS_PER_MINUTE; i++) {
        tracker.trackRequest(origin, now);
      }

      // Should be rate limited now
      expect(tracker.isRateLimited(origin, now)).toBe(true);

      // Check with a request just outside the window
      const justOutsideWindow = now - DISCOVERY_CONFIG.RATE_LIMIT_WINDOW_MS - 1;

      // Track one old request
      tracker.trackRequest(origin, justOutsideWindow);

      // Should still be rate limited (old request doesn't count)
      expect(tracker.isRateLimited(origin, now)).toBe(true);
    });

    it('should correctly filter requests within the rate limit window', () => {
      const origin = 'https://window.example.com';
      const now = Date.now();

      // Add requests spread across time
      const requestTimes = [
        now - DISCOVERY_CONFIG.RATE_LIMIT_WINDOW_MS - 1000, // Outside window
        now - DISCOVERY_CONFIG.RATE_LIMIT_WINDOW_MS + 1000, // Inside window
        now - 1000, // Inside window
        now, // Inside window
      ];

      for (const time of requestTimes) {
        tracker.trackRequest(origin, time);
      }

      // Should only count the 3 requests inside the window
      const privateTracker = tracker as unknown as {
        requestCounts: Map<string, number[]>;
      };

      const requests = privateTracker.requestCounts.get(origin);
      expect(requests?.length).toBe(3);
    });
  });

  describe('cleanup Edge Cases', () => {
    it('should handle cleanup when requestCounts becomes empty', () => {
      const origin = 'https://empty-cleanup.com';
      const now = Date.now();

      // Add only old requests
      tracker.trackRequest(origin, now - DISCOVERY_CONFIG.RATE_LIMIT_WINDOW_MS - 1000);
      tracker.trackRequest(origin, now - DISCOVERY_CONFIG.RATE_LIMIT_WINDOW_MS - 2000);

      // Verify requests were tracked
      const privateTracker = tracker as unknown as {
        requestCounts: Map<string, number[]>;
      };

      expect(privateTracker.requestCounts.has(origin)).toBe(true);

      // Advance time and trigger cleanup
      vi.advanceTimersByTime(1000);
      tracker.cleanup();

      // Origin should be removed from requestCounts
      expect(privateTracker.requestCounts.has(origin)).toBe(false);
    });

    it('should update requestCounts with filtered valid requests', () => {
      const origin = 'https://filter-cleanup.com';
      const now = Date.now();

      // Add mix of old and recent requests
      tracker.trackRequest(origin, now - DISCOVERY_CONFIG.RATE_LIMIT_WINDOW_MS - 1000); // Old
      tracker.trackRequest(origin, now - 1000); // Recent
      tracker.trackRequest(origin, now); // Current

      // Trigger cleanup
      tracker.cleanup();

      // Check that only valid requests remain
      const privateTracker = tracker as unknown as {
        requestCounts: Map<string, number[]>;
      };

      const requests = privateTracker.requestCounts.get(origin);
      expect(requests).toBeDefined();
      expect(requests?.length).toBe(2); // Only recent and current
    });
  });

  describe('getMemoryStats Edge Cases', () => {
    it('should correctly calculate memory stats with multiple origins', () => {
      const origins = ['https://app1.com', 'https://app2.com', 'https://app3.com'];

      // Add sessions and requests for each origin
      for (const origin of origins) {
        tracker.trackSession(origin, 'session-1');
        tracker.trackSession(origin, 'session-2');
        tracker.trackRequest(origin);
        tracker.trackRequest(origin);
        tracker.trackRequest(origin);
      }

      const stats = tracker.getMemoryStats();

      expect(stats.totalOrigins).toBe(3);
      expect(stats.totalSessions).toBe(6); // 2 sessions × 3 origins
      expect(stats.totalRequests).toBe(9); // 3 requests × 3 origins
      expect(stats.memoryFootprint.sessionMaps).toBe(6); // 3 origins × 2 maps
      expect(stats.memoryFootprint.sessionEntries).toBe(6);
      expect(stats.memoryFootprint.requestEntries).toBe(9);
    });

    it('should handle empty state correctly', () => {
      const stats = tracker.getMemoryStats();

      expect(stats.totalOrigins).toBe(0);
      expect(stats.totalSessions).toBe(0);
      expect(stats.totalRequests).toBe(0);
      expect(stats.memoryFootprint.sessionMaps).toBe(0);
      expect(stats.memoryFootprint.sessionEntries).toBe(0);
      expect(stats.memoryFootprint.requestEntries).toBe(0);
    });
  });

  describe('Parameter Validation', () => {
    it('should reject invalid parameters in trackSession', () => {
      // Empty origin
      expect(tracker.trackSession('', 'session-id')).toBe(false);

      // Empty sessionId
      expect(tracker.trackSession('https://example.com', '')).toBe(false);

      // Negative timestamp
      expect(tracker.trackSession('https://example.com', 'session-id', -1)).toBe(false);
    });
  });
});
