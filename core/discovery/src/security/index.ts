/**
 * Security module for the Generic Cross-Blockchain Discovery Protocol.
 *
 * Comprehensive security framework preventing common attack vectors in cross-origin
 * discovery including session poisoning, replay attacks, origin spoofing,
 * and discovery request abuse. Essential for maintaining protocol integrity and
 * protecting both responders and initiators from malicious actors.
 *
 * Key security components:
 * - {@link OriginValidator}: Origin validation with anti-spoofing protection
 * - {@link SessionTracker}: Origin-bound session tracking for replay prevention
 * - {@link RateLimiter}: Sliding window rate limiting for abuse prevention
 * - Convenience functions: Pre-configured validation for common scenarios
 *
 * @example Origin validation:
 * ```typescript
 * import { validateOrigin, OriginValidator } from '@walletmesh/discovery';
 *
 * // Quick validation
 * const result = validateOrigin('https://initiator.com', {
 *   requireHttps: true,
 *   allowedOrigins: ['https://initiator.com']
 * });
 *
 * // Reusable validator
 * const validator = new OriginValidator({
 *   requireHttps: true,
 *   allowedOrigins: ['https://trusted1.com', 'https://trusted2.com'],
 *   blockedOrigins: ['https://malicious.com']
 * });
 * ```
 *
 * @example Session tracking:
 * ```typescript
 * import { SessionTracker } from '@walletmesh/discovery';
 *
 * const tracker = new SessionTracker({
 *   maxAge: 5 * 60 * 1000,           // 5 minute sessions
 *   maxSessionsPerOrigin: 10,        // Max 10 concurrent sessions per origin
 *   cleanupInterval: 60 * 1000       // Cleanup every minute
 * });
 *
 * // Validate new session (prevents replay attacks)
 * const isValid = tracker.trackSession('https://initiator.com', 'session-uuid');
 * if (!isValid) {
 *   console.warn('Session replay attack detected!');
 * }
 * ```
 *
 * @example Rate limiting:
 * ```typescript
 * import { RateLimiter } from '@walletmesh/discovery';
 *
 * const limiter = new RateLimiter({
 *   maxRequests: 10,        // 10 requests max
 *   windowMs: 60000,        // per 60 seconds
 *   enabled: true           // enforce limits
 * });
 *
 * // Check and record request
 * if (limiter.isAllowed('https://initiator.com')) {
 *   limiter.recordRequest('https://initiator.com');
 *   // Process the discovery request...
 * } else {
 *   console.warn('Rate limited');
 * }
 * ```
 *
 * @example Complete security setup:
 * ```typescript
 * import { OriginValidator, SessionTracker, RateLimiter } from '@walletmesh/discovery';
 *
 * // Production security configuration
 * const validator = new OriginValidator({
 *   requireHttps: true,
 *   allowLocalhost: false,
 *   allowedOrigins: ['https://production-initiator.com']
 * });
 *
 * const tracker = new SessionTracker({ maxAge: 5 * 60 * 1000 });
 * const limiter = new RateLimiter({ maxRequests: 5, windowMs: 60000 });
 *
 * // Validate discovery request
 * function validateRequest(origin: string, sessionId: string) {
 *   const originValid = validator.validateOrigin(origin);
 *   if (!originValid.valid) return false;
 *
 *   if (!limiter.isAllowed(origin)) return false;
 *   if (!tracker.trackSession(origin, sessionId)) return false;
 *
 *   limiter.recordRequest(origin);
 *   return true;
 * }
 * ```
 *
 * @module security
 * @since 0.1.0
 * @see {@link https://docs.discovery.io/security} for security best practices
 */

// Export security classes
export { SessionTracker } from './SessionTracker.js';
export { OriginValidator, validateOrigin, validateEventOrigin } from './OriginValidator.js';
export { RateLimiter } from './RateLimiter.js';
export { createSecurityPolicy } from './createSecurityPolicy.js';

// Re-export security-related types from core
export type {
  SecurityPolicy,
  SessionOptions,
  OriginValidationResult,
  RateLimitConfig,
  SessionTrackingState,
} from '../core/types.js';
