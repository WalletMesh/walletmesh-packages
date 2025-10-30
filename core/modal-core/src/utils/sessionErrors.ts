/**
 * Session error detection utilities
 *
 * Provides utilities for detecting and identifying session-related errors
 * from wallet connections, including session expiration, invalidation, and
 * termination scenarios.
 *
 * @module utils/sessionErrors
 * @packageDocumentation
 */

/**
 * Check if an error is a session-related error
 *
 * Detects errors related to invalid, expired, or terminated wallet sessions.
 * Checks for the standard JSON-RPC error code (-32001) and common session
 * error message patterns.
 *
 * @param error - The error to check (can be any type)
 * @returns True if the error is session-related, false otherwise
 *
 * @example
 * ```typescript
 * try {
 *   await provider.call('eth_accounts');
 * } catch (error) {
 *   if (isSessionError(error)) {
 *     console.log('Session expired, need to reconnect');
 *     await disconnect();
 *   }
 * }
 * ```
 *
 * @since 3.0.0
 * @category Utilities
 * @public
 */
export function isSessionError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const err = error as { code?: number | string; message?: string };

  // Check for JSON-RPC error code -32001 (invalidSession from router)
  if (err.code === -32001 || err.code === '-32001') {
    return true;
  }

  // Check for session-related error messages
  const message = err.message?.toLowerCase();
  if (!message) {
    return false;
  }

  // Common session error patterns
  const sessionErrorPatterns = [
    'invalid or expired session',
    'invalid session',
    'expired session',
    'session terminated',
    'session not found',
    'session expired',
    'no active session',
  ];

  return sessionErrorPatterns.some((pattern) => message.includes(pattern));
}
