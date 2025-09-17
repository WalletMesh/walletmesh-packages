/**
 * Security types for the Generic Cross-Blockchain Discovery Protocol.
 *
 * Contains all types related to security policies, origin validation,
 * session tracking, rate limiting, and other security features.
 *
 * @module types/security
 * @category Types
 * @since 0.1.0
 */

/**
 * Security policy configuration for origin validation and request filtering.
 *
 * Defines comprehensive security settings including origin allowlists/blocklists,
 * HTTPS enforcement, rate limiting, and other protective measures.
 *
 * @category Security
 * @since 0.1.0
 */
export interface SecurityPolicy {
  allowedOrigins?: string[];
  blockedOrigins?: string[];
  requireHttps?: boolean;
  allowLocalhost?: boolean;
  certificateValidation?: boolean;
  contentSecurityPolicy?: string;
  maxSessionAge?: number;
  rateLimit?: {
    enabled: boolean;
    maxRequests: number;
    windowMs: number;
  };
}

/**
 * Session tracking and management options.
 *
 * Configures how discovery sessions are tracked, validated, and cleaned up.
 * Essential for preventing session replay attacks and managing resource usage.
 *
 * @category Security
 * @since 0.1.0
 */
export interface SessionOptions {
  maxAge: number;
  cleanupInterval: number;
  maxSessionsPerOrigin: number;
}

/**
 * Rate limiting configuration for request throttling.
 *
 * Prevents abuse and denial-of-service attacks by limiting the number
 * of requests from a single origin within a time window.
 *
 * @category Security
 * @since 0.1.0
 */
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  enabled: boolean;
}

/**
 * Origin validation result for security checks.
 *
 * Contains the outcome of origin validation including the validated origin,
 * validation status, and any failure reasons for audit logging.
 *
 * @category Security
 * @since 0.1.0
 */
export interface OriginValidationResult {
  valid: boolean;
  origin: string;
  reason?: string;
  timestamp: number;
}

/**
 * Session tracking state for managing active discovery sessions.
 *
 * Maintains the internal state needed for session validation, rate limiting,
 * and cleanup. Used by responders to prevent session replay attacks and
 * enforce rate limits.
 *
 * @category Security
 * @since 0.1.0
 */
export interface SessionTrackingState {
  usedSessions: Map<string, Set<string>>;
  sessionTimestamps: Map<string, Map<string, number>>;
  requestCounts: Map<string, Array<{ timestamp: number; count: number }>>;
  lastCleanup: number;
}

/**
 * Discovery security error information for error tracking and debugging.
 *
 * Provides structured error information for discovery protocol security failures,
 * including origin tracking for security analysis and detailed context
 * for debugging.
 *
 * @category Security
 * @since 0.1.0
 */
export interface DiscoverySecurityError {
  code: string;
  message: string;
  origin?: string;
  sessionId?: string;
  timestamp: number;
  details?: Record<string, unknown>;
}
