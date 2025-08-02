import type { SessionOptions, SessionTrackingState } from '../core/types.js';
import { DISCOVERY_CONFIG } from '../core/constants.js';

/**
 * Session tracker implementing origin-bound session tracking for replay attack prevention.
 *
 * Maintains separate session namespaces per origin to prevent session poisoning
 * attacks where malicious origins attempt to replay session IDs from legitimate
 * origins. Essential component of the discovery protocol's security model.
 *
 * Key security features:
 * - Origin-isolated session tracking (sessions can't cross origins)
 * - Automatic session expiration based on age
 * - Per-origin session limits with LRU eviction
 * - Request rate tracking for additional abuse prevention
 * - Memory-efficient cleanup of expired sessions
 * - Comprehensive monitoring and statistics
 *
 * @example Basic session validation:
 * ```typescript
 * const tracker = new SessionTracker({
 *   maxAge: 5 * 60 * 1000,           // 5 minute session lifetime
 *   maxSessionsPerOrigin: 10,       // Max 10 concurrent sessions per origin
 *   cleanupInterval: 60 * 1000      // Cleanup every minute
 * });
 *
 * // Validate new session
 * const isValid = tracker.trackSession(
 *   'https://dapp.com',
 *   'session-uuid-123',
 *   Date.now()
 * );
 *
 * if (isValid) {
 *   console.log('Session is new and valid');
 * } else {
 *   console.log('Session replay attack detected!');
 * }
 * ```
 *
 * @example Anti-replay protection:
 * ```typescript
 * const origin = 'https://example.com';
 * const sessionId = 'abc-123';
 *
 * // First use - should succeed
 * const first = tracker.trackSession(origin, sessionId);
 * console.log(first); // true
 *
 * // Replay attempt - should fail
 * const replay = tracker.trackSession(origin, sessionId);
 * console.log(replay); // false - replay attack blocked
 *
 * // Same session from different origin - should succeed
 * const different = tracker.trackSession('https://other.com', sessionId);
 * console.log(different); // true - different origin namespace
 * ```
 *
 * @example Monitoring and cleanup:
 * ```typescript
 * // Monitor session activity
 * const stats = tracker.getOriginStats('https://dapp.com');
 * console.log(`Active sessions: ${stats.activeSessions}`);
 * console.log(`Recent requests: ${stats.recentRequests}`);
 *
 * // Manual cleanup of expired sessions
 * tracker.cleanup();
 *
 * // Memory usage monitoring
 * const memory = tracker.getMemoryStats();
 * console.log(`Tracking ${memory.totalSessions} sessions across ${memory.totalOrigins} origins`);
 * ```
 *
 * @category Security
 * @since 0.1.0
 * @see {@link SessionOptions} for configuration options
 * @see {@link OriginValidator} for origin validation
 * @see {@link RateLimiter} for request rate limiting
 */
export class SessionTracker {
  private usedSessions = new Map<string, Set<string>>();
  private sessionTimestamps = new Map<string, Map<string, number>>();
  private requestCounts = new Map<string, number[]>();
  private lastCleanup = 0;
  private cleanupInterval: number;
  private maxSessionsPerOrigin: number;
  private maxAge: number;

  constructor(options: Partial<SessionOptions> = {}) {
    this.cleanupInterval = options.cleanupInterval ?? DISCOVERY_CONFIG.CLEANUP_INTERVAL_MS;
    this.maxSessionsPerOrigin = options.maxSessionsPerOrigin ?? DISCOVERY_CONFIG.MAX_SESSIONS_PER_ORIGIN;
    this.maxAge = options.maxAge ?? DISCOVERY_CONFIG.SESSION_MAX_AGE_MS;
  }

  /**
   * Track a new session for the given origin.
   *
   * Validates and records a new session for the specified origin.
   * Prevents replay attacks by rejecting sessions that have already
   * been used for the same origin. Maintains origin isolation to
   * prevent cross-origin session poisoning.
   *
   * @param origin - Origin URL requesting session tracking
   * @param sessionId - Unique session identifier to track
   * @param timestamp - Optional request timestamp (defaults to now)
   * @returns True if session is new and valid, false if replay detected
   *
   * @example Successful session tracking:
   * ```typescript
   * const result = tracker.trackSession(
   *   'https://dapp.com',
   *   crypto.randomUUID(),
   *   Date.now()
   * );
   * // → true (new session recorded)
   * ```
   *
   * @example Replay attack detection:
   * ```typescript
   * const sessionId = 'session-123';
   * const origin = 'https://example.com';
   *
   * // First use
   * tracker.trackSession(origin, sessionId); // → true
   *
   * // Replay attempt
   * tracker.trackSession(origin, sessionId); // → false (replay blocked)
   * ```
   *
   * @example Origin isolation:
   * ```typescript
   * const sessionId = 'shared-session-id';
   *
   * tracker.trackSession('https://origin1.com', sessionId); // → true
   * tracker.trackSession('https://origin2.com', sessionId); // → true (different origin)
   * tracker.trackSession('https://origin1.com', sessionId); // → false (replay for origin1)
   * ```
   *
   * @category Session Tracking
   * @since 0.1.0
   */
  trackSession(origin: string, sessionId: string, timestamp: number = Date.now()): boolean {
    // Validate parameters
    if (!origin || !sessionId || timestamp < 0) {
      return false;
    }

    // Perform cleanup if needed
    this.performCleanupIfNeeded();

    // Check for consistent state first - both maps should either have or not have the origin
    const hasUsedSessions = this.usedSessions.has(origin);
    const hasSessionTimestamps = this.sessionTimestamps.has(origin);

    if (hasUsedSessions !== hasSessionTimestamps) {
      // Inconsistent state detected - attempt recovery
      console.warn(
        `[SessionTracker] Inconsistent state detected for origin: ${origin}. Attempting recovery.`,
      );

      // Recovery strategy: remove incomplete entries and force re-initialization
      this.usedSessions.delete(origin);
      this.sessionTimestamps.delete(origin);

      // Log the incident for debugging
      console.debug(`[SessionTracker] State recovery completed for origin: ${origin}`);
    }

    // Initialize origin tracking if needed (after any state recovery)
    if (!this.usedSessions.has(origin)) {
      this.usedSessions.set(origin, new Set());
      this.sessionTimestamps.set(origin, new Map());
    }

    const originSessions = this.usedSessions.get(origin);
    const originTimestamps = this.sessionTimestamps.get(origin);

    if (!originSessions || !originTimestamps) {
      return false; // Should not happen given the initialization above
    }

    // Check for replay attack
    if (originSessions.has(sessionId)) {
      return false; // Session already used for this origin
    }

    // Check session age
    if (Date.now() - timestamp > this.maxAge) {
      return false; // Session too old
    }

    // Enforce session limit per origin
    if (originSessions.size >= this.maxSessionsPerOrigin) {
      // Remove oldest session
      const oldestSessionId = this.findOldestSession(originTimestamps);
      if (oldestSessionId) {
        originSessions.delete(oldestSessionId);
        originTimestamps.delete(oldestSessionId);
      }
    }

    // Track the session
    originSessions.add(sessionId);
    originTimestamps.set(sessionId, timestamp);

    return true;
  }

  /**
   * Check if a session has been used for the given origin.
   *
   * Verifies whether a specific session ID has already been used for
   * the given origin. Useful for pre-validation checks and debugging.
   *
   * @param origin - Origin URL to check
   * @param sessionId - Session identifier to verify
   * @returns True if session exists for origin, false otherwise
   *
   * @example
   * ```typescript
   * const sessionId = 'session-123';
   * const origin = 'https://example.com';
   *
   * if (tracker.hasSession(origin, sessionId)) {
   *   console.log('Session already used - potential replay');
   * } else {
   *   console.log('New session');
   * }
   * ```
   *
   * @category Session Tracking
   * @since 0.1.0
   */
  hasSession(origin: string, sessionId: string): boolean {
    const originSessions = this.usedSessions.get(origin);
    return originSessions?.has(sessionId) ?? false;
  }

  /**
   * Track a request for rate limiting purposes.
   *
   * Records a request from the specified origin for internal rate limiting
   * calculations. This is separate from session tracking and is used to
   * monitor request frequency patterns.
   *
   * @param origin - Origin URL making the request
   * @param timestamp - Optional request timestamp (defaults to now)
   *
   * @example
   * ```typescript
   * // Track each discovery request
   * tracker.trackRequest('https://dapp.com');
   *
   * // Later check if rate limited
   * if (tracker.isRateLimited('https://dapp.com')) {
   *   console.log('Too many requests from this origin');
   * }
   * ```
   *
   * @category Rate Limiting
   * @since 0.1.0
   */
  trackRequest(origin: string, timestamp: number = Date.now()): void {
    if (!this.requestCounts.has(origin)) {
      this.requestCounts.set(origin, []);
    }

    const requests = this.requestCounts.get(origin);
    if (!requests) return; // Should not happen given initialization above
    requests.push(timestamp);

    // Remove old requests outside the rate limit window
    const windowStart = timestamp - DISCOVERY_CONFIG.RATE_LIMIT_WINDOW_MS;
    const validRequests = requests.filter((time) => time >= windowStart);
    this.requestCounts.set(origin, validRequests);
  }

  /**
   * Check if an origin is rate limited.
   *
   * Determines whether the specified origin has exceeded the maximum
   * number of requests allowed within the rate limit window. Uses
   * the default discovery protocol rate limits.
   *
   * @param origin - Origin URL to check rate limit status
   * @param timestamp - Optional timestamp for check (defaults to now)
   * @returns True if origin is rate limited, false otherwise
   *
   * @example
   * ```typescript
   * if (tracker.isRateLimited('https://suspicious.com')) {
   *   console.log('Origin exceeded rate limit');
   *   // Reject discovery request
   *   return { error: 'Rate limit exceeded' };
   * }
   * ```
   *
   * @category Rate Limiting
   * @since 0.1.0
   */
  isRateLimited(origin: string, timestamp: number = Date.now()): boolean {
    const requests = this.requestCounts.get(origin) ?? [];
    const windowStart = timestamp - DISCOVERY_CONFIG.RATE_LIMIT_WINDOW_MS;
    const recentRequests = requests.filter((time) => time >= windowStart);

    return recentRequests.length >= DISCOVERY_CONFIG.MAX_REQUESTS_PER_MINUTE;
  }

  /**
   * Remove a session from tracking.
   *
   * Manually removes a specific session from the tracking system.
   * Useful for explicit session invalidation or cleanup scenarios.
   * Automatically cleans up empty origin entries.
   *
   * @param origin - Origin URL that owns the session
   * @param sessionId - Session identifier to remove
   *
   * @example
   * ```typescript
   * // Invalidate session on logout
   * tracker.removeSession('https://dapp.com', userSessionId);
   *
   * // Cleanup after session expiry
   * const expiredSessions = getExpiredSessions();
   * expiredSessions.forEach(session => {
   *   tracker.removeSession(session.origin, session.id);
   * });
   * ```
   *
   * @category Session Management
   * @since 0.1.0
   */
  removeSession(origin: string, sessionId: string): void {
    const originSessions = this.usedSessions.get(origin);
    const originTimestamps = this.sessionTimestamps.get(origin);

    if (originSessions) {
      originSessions.delete(sessionId);
    }

    if (originTimestamps) {
      originTimestamps.delete(sessionId);
    }

    // Clean up empty origin entries
    if (originSessions?.size === 0) {
      this.usedSessions.delete(origin);
      this.sessionTimestamps.delete(origin);
    }
  }

  /**
   * Get the current state of session tracking for debugging and monitoring.
   *
   * Returns a complete snapshot of the tracker's internal state including
   * all tracked sessions, timestamps, and request counts. Useful for
   * debugging, monitoring, and testing.
   *
   * @returns Complete session tracking state (defensive copy)
   *
   * @example
   * ```typescript
   * const state = tracker.getState();
   *
   * // Inspect tracked sessions by origin
   * for (const [origin, sessions] of state.usedSessions) {
   *   console.log(`${origin}: ${sessions.size} active sessions`);
   * }
   *
   * // Check session timestamps
   * for (const [origin, timestamps] of state.sessionTimestamps) {
   *   for (const [sessionId, timestamp] of timestamps) {
   *     const age = Date.now() - timestamp;
   *     console.log(`Session ${sessionId}: ${age}ms old`);
   *   }
   * }
   * ```
   *
   * @category Monitoring
   * @since 0.1.0
   */
  getState(): SessionTrackingState {
    return {
      usedSessions: new Map(this.usedSessions),
      sessionTimestamps: new Map(this.sessionTimestamps),
      requestCounts: new Map(this.requestCounts),
      lastCleanup: this.lastCleanup,
    };
  }

  /**
   * Get session statistics for an origin.
   *
   * Provides detailed statistics about session activity for a specific
   * origin including active session count, recent requests, and session
   * age information. Useful for monitoring and debugging.
   *
   * @param origin - Origin URL to get statistics for
   * @returns Statistics object with session and request metrics
   *
   * @example
   * ```typescript
   * const stats = tracker.getOriginStats('https://dapp.com');
   *
   * console.log(`Active sessions: ${stats.activeSessions}`);
   * console.log(`Recent requests: ${stats.recentRequests}`);
   *
   * if (stats.oldestSession) {
   *   const age = Date.now() - stats.oldestSession;
   *   console.log(`Oldest session age: ${age}ms`);
   * }
   *
   * // Monitor for suspicious activity
   * if (stats.activeSessions > 50) {
   *   console.warn(`High session count for ${origin}`);
   * }
   * ```
   *
   * @category Statistics
   * @since 0.1.0
   */
  getOriginStats(origin: string) {
    const sessions = this.usedSessions.get(origin)?.size ?? 0;
    const requests = this.requestCounts.get(origin)?.length ?? 0;
    const timestamps = this.sessionTimestamps.get(origin);

    let oldestSession = 0;
    let newestSession = 0;

    if (timestamps && timestamps.size > 0) {
      const times = Array.from(timestamps.values());
      oldestSession = Math.min(...times);
      newestSession = Math.max(...times);
    }

    return {
      origin,
      activeSessions: sessions,
      recentRequests: requests,
      oldestSession,
      newestSession,
    };
  }

  /**
   * Clean up expired sessions and old request tracking data.
   *
   * Removes sessions that have exceeded the maximum age and cleans up
   * old request count data outside the rate limiting window. Helps
   * maintain memory efficiency and prevents unbounded growth.
   *
   * This method is called automatically based on the cleanup interval,
   * but can also be called manually for immediate cleanup.
   *
   * @example
   * ```typescript
   * // Manual cleanup
   * tracker.cleanup();
   *
   * // Check memory usage after cleanup
   * const stats = tracker.getMemoryStats();
   * console.log(`Memory freed, now tracking ${stats.totalSessions} sessions`);
   * ```
   *
   * @category Maintenance
   * @since 0.1.0
   */
  cleanup(): void {
    const now = Date.now();

    // Clean up expired sessions
    for (const [origin, timestamps] of this.sessionTimestamps) {
      const sessions = this.usedSessions.get(origin);
      if (!sessions || !timestamps) continue;

      const expiredSessions = [];
      for (const [sessionId, timestamp] of timestamps) {
        if (now - timestamp > this.maxAge) {
          expiredSessions.push(sessionId);
        }
      }

      // Remove expired sessions
      for (const sessionId of expiredSessions) {
        sessions.delete(sessionId);
        timestamps.delete(sessionId);
      }

      // Clean up empty origin entries
      if (sessions.size === 0) {
        this.usedSessions.delete(origin);
        this.sessionTimestamps.delete(origin);
      }
    }

    // Clean up old request counts
    const windowStart = now - DISCOVERY_CONFIG.RATE_LIMIT_WINDOW_MS;
    for (const [origin, requests] of this.requestCounts) {
      const validRequests = requests.filter((time) => time >= windowStart);
      if (validRequests.length === 0) {
        this.requestCounts.delete(origin);
      } else {
        this.requestCounts.set(origin, validRequests);
      }
    }

    this.lastCleanup = now;
  }

  /**
   * Clear all tracking data.
   *
   * Completely resets the session tracker by removing all tracked
   * sessions, timestamps, and request counts for all origins.
   * Use with caution as this removes all replay protection.
   *
   * @example
   * ```typescript
   * // Emergency reset
   * tracker.clear();
   * console.log('All session tracking data cleared');
   *
   * // Periodic maintenance
   * schedule.daily(() => {
   *   tracker.clear();
   *   console.log('Daily session reset completed');
   * });
   * ```
   *
   * @category Management
   * @since 0.1.0
   */
  clear(): void {
    this.usedSessions.clear();
    this.sessionTimestamps.clear();
    this.requestCounts.clear();
    this.lastCleanup = 0;
  }

  /**
   * Get memory usage statistics.
   *
   * Provides detailed information about memory consumption including
   * the number of tracked origins, sessions, and requests. Useful for
   * monitoring resource usage and detecting memory leaks.
   *
   * @returns Memory statistics with detailed breakdown
   *
   * @example
   * ```typescript
   * const memory = tracker.getMemoryStats();
   *
   * console.log(`Tracking ${memory.totalOrigins} origins`);
   * console.log(`Total sessions: ${memory.totalSessions}`);
   * console.log(`Total requests: ${memory.totalRequests}`);
   *
   * // Monitor memory growth
   * if (memory.totalSessions > 10000) {
   *   console.warn('High memory usage - consider cleanup');
   *   tracker.cleanup();
   * }
   *
   * // Detailed memory breakdown
   * const { memoryFootprint } = memory;
   * console.log(`Maps: ${memoryFootprint.sessionMaps}`);
   * console.log(`Entries: ${memoryFootprint.sessionEntries}`);
   * ```
   *
   * @category Statistics
   * @since 0.1.0
   */
  getMemoryStats() {
    let totalSessions = 0;
    let totalRequests = 0;
    const totalOrigins = this.usedSessions.size;

    for (const sessions of this.usedSessions.values()) {
      totalSessions += sessions.size;
    }

    for (const requests of this.requestCounts.values()) {
      totalRequests += requests.length;
    }

    return {
      totalOrigins,
      totalSessions,
      totalRequests,
      memoryFootprint: {
        sessionMaps: totalOrigins * 2, // usedSessions + sessionTimestamps
        sessionEntries: totalSessions,
        requestEntries: totalRequests,
      },
    };
  }

  /**
   * Perform cleanup if the cleanup interval has elapsed.
   *
   * Internal method that checks if enough time has passed since the
   * last cleanup and triggers cleanup if needed. Called automatically
   * during session tracking operations.
   *
   * @category Internal
   * @since 0.1.0
   */
  private performCleanupIfNeeded(): void {
    const now = Date.now();
    if (now - this.lastCleanup > this.cleanupInterval) {
      this.cleanup();
    }
  }

  /**
   * Find the oldest session for an origin.
   *
   * Identifies the oldest session ID from a collection of session
   * timestamps. Used for LRU eviction when session limits are reached.
   *
   * @param timestamps - Map of session IDs to timestamps
   * @returns Session ID of the oldest session, or null if empty
   *
   * @category Internal
   * @since 0.1.0
   */
  private findOldestSession(timestamps: Map<string, number>): string | null {
    let oldestSessionId: string | null = null;
    let oldestTime = Number.POSITIVE_INFINITY;

    for (const [sessionId, timestamp] of timestamps) {
      if (timestamp < oldestTime) {
        oldestTime = timestamp;
        oldestSessionId = sessionId;
      }
    }

    return oldestSessionId;
  }
}
