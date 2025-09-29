/**
 * Consolidated security module for the Generic Cross-Blockchain Discovery Protocol.
 *
 * Provides comprehensive security features including origin validation,
 * session tracking, and rate limiting to protect against various attack vectors.
 *
 * @module security
 * @category Security
 * @since 0.1.0
 */

import type {
  SecurityPolicy,
  OriginValidationResult,
  SessionOptions,
  RateLimitConfig,
  SessionTrackingState,
} from './types/security.js';
import { type Logger, defaultLogger } from './core/logger.js';

// ============================================================================
// Origin Validation
// ============================================================================

/**
 * Origin validator implementing robust validation and anti-spoofing measures.
 *
 * @category Security
 * @since 0.1.0
 */
export class OriginValidator {
  private policy: SecurityPolicy;
  private allowedOrigins: Set<string>;
  private blockedOrigins: Set<string>;
  private logger: Logger;

  constructor(policy?: SecurityPolicy, logger: Logger = defaultLogger) {
    this.policy = policy || {
      requireHttps: true,
      allowLocalhost: true,
      allowedOrigins: [],
    };
    this.allowedOrigins = new Set(this.policy.allowedOrigins || []);
    this.blockedOrigins = new Set(this.policy.blockedOrigins || []);
    this.logger = logger;
  }

  /**
   * Validate an origin against the security policy.
   */
  validateOrigin(origin: string): OriginValidationResult {
    const timestamp = Date.now();

    try {
      // Check blocklist first
      if (this.blockedOrigins.has(origin)) {
        return { valid: false, origin, reason: 'Origin is blocked', timestamp };
      }

      // Parse URL
      const url = new URL(origin);

      // Check HTTPS requirement
      if (this.policy.requireHttps && url.protocol !== 'https:') {
        // Allow localhost in development
        if (!this.policy.allowLocalhost || !this.isLocalhost(url.hostname)) {
          return { valid: false, origin, reason: 'HTTPS required', timestamp };
        }
      }

      // Check localhost permission
      if (!this.policy.allowLocalhost && this.isLocalhost(url.hostname)) {
        return { valid: false, origin, reason: 'Localhost not allowed', timestamp };
      }

      // Check allowlist if configured
      if (this.allowedOrigins.size > 0 && !this.allowedOrigins.has(origin)) {
        return { valid: false, origin, reason: 'Origin not in allowlist', timestamp };
      }

      // Check for suspicious patterns
      if (this.isSuspiciousOrigin(url)) {
        return { valid: false, origin, reason: 'Suspicious origin pattern detected', timestamp };
      }

      return { valid: true, origin, timestamp };
    } catch (error) {
      this.logger.warn('[OriginValidator] Invalid origin format', { origin, error });
      return { valid: false, origin, reason: 'Invalid origin format', timestamp };
    }
  }

  /**
   * Update the security policy.
   */
  updatePolicy(policy: SecurityPolicy): void {
    this.policy = policy;
    this.allowedOrigins = new Set(policy.allowedOrigins || []);
    this.blockedOrigins = new Set(policy.blockedOrigins || []);
  }

  /**
   * Validate that event origin matches the claimed origin.
   */
  validateEventOrigin(eventOrigin: string, claimedOrigin: string): OriginValidationResult {
    const timestamp = Date.now();

    // First validate the event origin itself
    const eventValidation = this.validateOrigin(eventOrigin);
    if (!eventValidation.valid) {
      return eventValidation;
    }

    // Check if event origin matches claimed origin
    if (eventOrigin !== claimedOrigin) {
      return {
        valid: false,
        origin: eventOrigin,
        reason: `Origin mismatch: event origin '${eventOrigin}' does not match claimed origin '${claimedOrigin}'`,
        timestamp,
      };
    }

    return { valid: true, origin: eventOrigin, timestamp };
  }

  private isLocalhost(hostname: string): boolean {
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
  }

  private isSuspiciousOrigin(url: URL): boolean {
    const hostname = url.hostname;

    // Check for common phishing patterns
    const suspiciousPatterns = [
      /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, // IP addresses (except localhost)
      /[а-яА-Я]/, // Cyrillic characters (homograph attacks)
      /xn--/, // Punycode (potential homograph)
    ];

    if (hostname !== '127.0.0.1' && hostname !== '[::1]') {
      return suspiciousPatterns.some((pattern) => pattern.test(hostname));
    }

    return false;
  }
}

/**
 * Convenience function for one-off origin validation.
 */
export function validateOrigin(origin: string, policy?: SecurityPolicy): OriginValidationResult {
  const validator = new OriginValidator(policy);
  return validator.validateOrigin(origin);
}

/**
 * Validate event origin matches claimed origin.
 */
export function validateEventOrigin(
  eventOrigin: string,
  claimedOrigin: string,
  policy?: SecurityPolicy,
): OriginValidationResult {
  const timestamp = Date.now();

  // First validate the event origin
  const eventValidation = validateOrigin(eventOrigin, policy);
  if (!eventValidation.valid) {
    return eventValidation;
  }

  // Then check if it matches claimed origin
  if (eventOrigin !== claimedOrigin) {
    return {
      valid: false,
      origin: eventOrigin,
      reason: `Origin mismatch: event origin '${eventOrigin}' does not match claimed origin '${claimedOrigin}'`,
      timestamp,
    };
  }

  return { valid: true, origin: eventOrigin, timestamp };
}

// ============================================================================
// Session Tracking
// ============================================================================

/**
 * Session tracker for preventing replay attacks.
 *
 * @category Security
 * @since 0.1.0
 */
export class SessionTracker {
  private sessions: Map<string, Set<string>> = new Map();
  private sessionTimestamps: Map<string, number> = new Map();
  private options: SessionOptions;
  private cleanupInterval: NodeJS.Timeout | undefined;
  private logger: Logger;

  constructor(options?: SessionOptions, logger: Logger = defaultLogger) {
    this.options = {
      maxAge: options?.maxAge ?? 5 * 60 * 1000, // 5 minutes default
      maxSessionsPerOrigin: options?.maxSessionsPerOrigin ?? 100,
      cleanupInterval: options?.cleanupInterval ?? 60 * 1000, // 1 minute
    };
    this.logger = logger;

    // Start cleanup timer
    if (this.options.cleanupInterval && this.options.cleanupInterval > 0) {
      this.startCleanup();
    }
  }

  /**
   * Track a new session, returns false if it's a replay.
   */
  trackSession(origin: string, sessionId: string): boolean {
    // Check if session already exists (replay attack)
    const sessionKey = `${origin}:${sessionId}`;
    if (this.sessionTimestamps.has(sessionKey)) {
      this.logger.warn('[SessionTracker] Session replay detected', { origin, sessionId });
      return false;
    }

    // Get or create origin sessions
    let originSessions = this.sessions.get(origin);
    if (!originSessions) {
      originSessions = new Set();
      this.sessions.set(origin, originSessions);
    }

    // Check max sessions per origin
    if (originSessions.size >= (this.options.maxSessionsPerOrigin ?? 100)) {
      this.logger.warn('[SessionTracker] Max sessions exceeded for origin', { origin });
      return false;
    }

    // Track the session
    originSessions.add(sessionId);
    this.sessionTimestamps.set(sessionKey, Date.now());

    return true;
  }

  /**
   * Check if a session exists.
   */
  hasSession(origin: string, sessionId: string): boolean {
    const sessionKey = `${origin}:${sessionId}`;
    return this.sessionTimestamps.has(sessionKey);
  }

  /**
   * Get tracking state.
   */
  getState(): SessionTrackingState {
    // Convert internal structure to match SessionTrackingState interface
    const usedSessions = new Map<string, Set<string>>();
    const sessionTimestamps = new Map<string, Map<string, number>>();
    const requestCounts = new Map<string, Array<{ timestamp: number; count: number }>>();

    // Build usedSessions from internal sessions map
    for (const [origin, sessions] of this.sessions.entries()) {
      usedSessions.set(origin, new Set(sessions));
    }

    // Build sessionTimestamps from internal sessionTimestamps map
    for (const [sessionKey, timestamp] of this.sessionTimestamps.entries()) {
      const parts = sessionKey.split(':');
      if (parts.length >= 2 && parts[0]) {
        const origin = parts[0];
        const sessionId = parts.slice(1).join(':'); // Handle sessionIds that might contain ':'
        if (!sessionTimestamps.has(origin)) {
          sessionTimestamps.set(origin, new Map());
        }
        const originMap = sessionTimestamps.get(origin);
        if (originMap) {
          originMap.set(sessionId, timestamp);
        }
      }
    }

    return {
      usedSessions,
      sessionTimestamps,
      requestCounts, // Empty for now as we don't track request counts here
      lastCleanup: Date.now(), // Current time as we don't track last cleanup
    };
  }

  /**
   * Clear all sessions.
   */
  clear(): void {
    this.sessions.clear();
    this.sessionTimestamps.clear();
  }

  /**
   * Start automatic cleanup of expired sessions.
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, this.options.cleanupInterval ?? 60000);
  }

  /**
   * Clean up expired sessions.
   */
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    const maxAge = this.options.maxAge ?? 5 * 60 * 1000;

    for (const [key, timestamp] of this.sessionTimestamps.entries()) {
      if (now - timestamp > maxAge) {
        // Extract origin and sessionId from key
        const parts = key.split(':');
        if (parts.length >= 2 && parts[0]) {
          const origin = parts[0];
          const sessionId = parts.slice(1).join(':'); // Handle sessionIds that might contain ':'

          // Remove from timestamps
          this.sessionTimestamps.delete(key);

          // Remove from origin sessions
          const originSessions = this.sessions.get(origin);
          if (originSessions) {
            originSessions.delete(sessionId);
            if (originSessions.size === 0) {
              this.sessions.delete(origin);
            }
          }
        }
      }
    }
  }

  /**
   * Dispose of the tracker and cleanup resources.
   */
  dispose(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
    this.clear();
  }
}

// ============================================================================
// Rate Limiting
// ============================================================================

/**
 * Rate limiter using sliding window algorithm.
 *
 * @category Security
 * @since 0.1.0
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private config: RateLimitConfig;

  constructor(config?: RateLimitConfig, _logger: Logger = defaultLogger) {
    this.config = {
      enabled: config?.enabled ?? true,
      maxRequests: config?.maxRequests ?? 10,
      windowMs: config?.windowMs ?? 60000, // 1 minute default
    };
  }

  /**
   * Check if an origin is allowed to make a request.
   */
  isAllowed(origin: string): boolean {
    if (!this.config.enabled) {
      return true;
    }

    const now = Date.now();
    const windowStart = now - (this.config.windowMs ?? 60000);

    // Get request timestamps for this origin
    const timestamps = this.requests.get(origin) || [];

    // Filter out old requests outside the window
    const recentRequests = timestamps.filter((t) => t > windowStart);

    // Update the stored timestamps
    if (recentRequests.length > 0) {
      this.requests.set(origin, recentRequests);
    } else {
      this.requests.delete(origin);
    }

    // Check if under limit
    return recentRequests.length < (this.config.maxRequests ?? 10);
  }

  /**
   * Record a request from an origin.
   */
  recordRequest(origin: string): void {
    if (!this.config.enabled) {
      return;
    }

    const now = Date.now();
    const timestamps = this.requests.get(origin) || [];
    timestamps.push(now);
    this.requests.set(origin, timestamps);
  }

  /**
   * Get current request count for an origin.
   */
  getRequestCount(origin: string): number {
    const now = Date.now();
    const windowStart = now - (this.config.windowMs ?? 60000);
    const timestamps = this.requests.get(origin) || [];
    return timestamps.filter((t) => t > windowStart).length;
  }

  /**
   * Reset rate limit for an origin.
   */
  reset(origin?: string): void {
    if (origin) {
      this.requests.delete(origin);
    } else {
      this.requests.clear();
    }
  }

  /**
   * Update configuration.
   */
  updateConfig(config: RateLimitConfig): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get statistics about rate limiting.
   */
  getStats(timestamp: number = Date.now()) {
    const origins = Array.from(this.requests.keys());
    const stats = {
      totalOrigins: origins.length,
      activeOrigins: 0,
      totalRequests: 0,
      rateLimitedOrigins: 0,
      averageRequestsPerOrigin: 0,
      memoryUsage: {
        requestMaps: this.requests.size,
        totalRequestEntries: 0,
      },
    };

    let totalActiveRequests = 0;
    let activeOrigins = 0;
    const windowStart = timestamp - (this.config.windowMs ?? 60000);

    for (const origin of origins) {
      const timestamps = this.requests.get(origin) || [];
      const recentRequests = timestamps.filter((t) => t > windowStart);

      if (recentRequests.length > 0) {
        activeOrigins++;
        totalActiveRequests += recentRequests.length;
        stats.memoryUsage.totalRequestEntries += recentRequests.length;

        if (recentRequests.length >= (this.config.maxRequests ?? 10)) {
          stats.rateLimitedOrigins++;
        }
      }

      stats.memoryUsage.totalRequestEntries += timestamps.length;
    }

    stats.activeOrigins = activeOrigins;
    stats.totalRequests = totalActiveRequests;
    stats.averageRequestsPerOrigin = activeOrigins > 0 ? totalActiveRequests / activeOrigins : 0;

    return stats;
  }
}

// ============================================================================
// Security Policy Factory
// ============================================================================

/**
 * Create a security policy with sensible defaults.
 *
 * @category Security
 * @since 0.1.0
 */
export function createSecurityPolicy(options: Partial<SecurityPolicy> = {}): SecurityPolicy {
  const isDevelopment = process.env['NODE_ENV'] === 'development';

  const policy: SecurityPolicy = {
    requireHttps: options.requireHttps ?? !isDevelopment,
    allowLocalhost: options.allowLocalhost ?? isDevelopment,
    allowedOrigins: options.allowedOrigins ?? [],
    blockedOrigins: options.blockedOrigins ?? [],
    rateLimit: options.rateLimit ?? {
      enabled: true,
      maxRequests: 10,
      windowMs: 60000,
    },
  };

  if (options.certificateValidation !== undefined) {
    policy.certificateValidation = options.certificateValidation;
  }

  if (options.contentSecurityPolicy !== undefined) {
    policy.contentSecurityPolicy = options.contentSecurityPolicy;
  }

  if (options.maxSessionAge !== undefined) {
    policy.maxSessionAge = options.maxSessionAge;
  }

  return policy;
}

// ============================================================================
// Integrated Security Manager
// ============================================================================

/**
 * Integrated security manager combining all security features.
 *
 * @category Security
 * @since 0.1.0
 */
export class SecurityManager {
  private originValidator: OriginValidator;
  private sessionTracker: SessionTracker;
  private rateLimiter: RateLimiter;

  constructor(policy?: SecurityPolicy, logger: Logger = defaultLogger) {
    this.originValidator = new OriginValidator(policy, logger);
    this.sessionTracker = new SessionTracker(undefined, logger);
    this.rateLimiter = new RateLimiter(policy?.rateLimit, logger);
  }

  /**
   * Validate a discovery request comprehensively.
   */
  validateRequest(origin: string, sessionId: string): { valid: boolean; reason?: string } {
    // Origin validation
    const originResult = this.originValidator.validateOrigin(origin);
    if (!originResult.valid) {
      return { valid: false, ...(originResult.reason && { reason: originResult.reason }) };
    }

    // Rate limiting
    if (!this.rateLimiter.isAllowed(origin)) {
      return { valid: false, reason: 'Rate limit exceeded' };
    }

    // Session tracking (replay prevention)
    if (!this.sessionTracker.trackSession(origin, sessionId)) {
      return { valid: false, reason: 'Session replay detected' };
    }

    // Record the request for rate limiting
    this.rateLimiter.recordRequest(origin);

    return { valid: true };
  }

  /**
   * Update security policy.
   */
  updatePolicy(policy: SecurityPolicy): void {
    this.originValidator.updatePolicy(policy);
    if (policy.rateLimit) {
      this.rateLimiter.updateConfig(policy.rateLimit);
    }
  }

  /**
   * Get security statistics.
   */
  getStats() {
    return {
      sessionState: this.sessionTracker.getState(),
      rateLimitStats: {
        activeOrigins: Array.from({ length: 10 }, (_, i) => `origin${i}`)
          .map((origin) => ({
            origin,
            requests: this.rateLimiter.getRequestCount(origin),
          }))
          .filter((stat) => stat.requests > 0),
      },
    };
  }

  /**
   * Cleanup resources.
   */
  dispose(): void {
    this.sessionTracker.dispose();
  }
}
