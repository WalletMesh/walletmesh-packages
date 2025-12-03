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

import type { ModalError } from '../internal/core/errors/types.js';
import { uiActions } from '../state/actions/ui.js';
import { useStore } from '../state/store.js';

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

/**
 * Convert a generic error to a ModalError with session context
 *
 * Transforms JSON-RPC or wallet errors into a standardized ModalError format
 * suitable for storage in the UI state and detection by the useSessionError hook.
 *
 * @param error - The error to convert
 * @param sessionId - Optional session ID for context
 * @returns A ModalError object with session-specific information
 *
 * @example
 * ```typescript
 * try {
 *   await provider.call('eth_accounts');
 * } catch (error) {
 *   if (isSessionError(error)) {
 *     const sessionError = convertToSessionError(error, currentSessionId);
 *     uiActions.setSessionError(store, sessionError);
 *   }
 * }
 * ```
 *
 * @since 3.0.0
 * @category Utilities
 * @public
 */
export function convertToSessionError(error: unknown, sessionId?: string): ModalError {
  // Extract error information
  const err = error as {
    code?: number | string;
    message?: string;
    data?: unknown;
  };

  // Determine the reason from the error message or code
  let reason = 'session_expired';
  const message = err.message?.toLowerCase() || '';

  if (message.includes('terminated')) {
    reason = 'session_terminated';
  } else if (message.includes('not found')) {
    reason = 'session_not_found';
  } else if (message.includes('invalid')) {
    reason = 'session_invalid';
  }

  // Create the ModalError with session context
  return {
    code: 'session_terminated',
    message: err.message || 'Session has expired or been terminated',
    category: 'wallet',
    recoveryStrategy: 'manual_action', // Session errors require user to reconnect
    data: {
      ...(sessionId && { sessionId }),
      reason,
      error,
      originalCode: err.code,
    },
  };
}

/**
 * Handle provider errors and check for session-related issues
 *
 * This utility function intercepts errors from provider/adapter calls and checks
 * if they are session-related errors (e.g., expired sessions, invalid sessions).
 * If a session error is detected, it converts the error to a ModalError and stores
 * it in the UI state for the useSessionError hook to detect.
 *
 * This function can be called from anywhere in the codebase (services, client, etc.)
 * to ensure consistent session error handling.
 *
 * @param error - The error to check and potentially store
 * @param sessionId - Optional session ID for context
 *
 * @example
 * ```typescript
 * import { handleProviderError } from '@walletmesh/modal-core';
 *
 * try {
 *   await provider.request({ method: 'eth_sendTransaction', params: [...] });
 * } catch (error) {
 *   // Check and store session errors before re-throwing
 *   handleProviderError(error, sessionId);
 *   throw error;
 * }
 * ```
 *
 * @since 3.0.0
 * @category Utilities
 * @public
 */
export function handleProviderError(error: unknown, sessionId?: string): void {
  // Check if this is a session-related error
  if (isSessionError(error)) {
    // Convert to ModalError format
    const sessionError = convertToSessionError(error, sessionId);

    // Store in UI state for React hook detection
    uiActions.setSessionError(useStore, sessionError);
  }
}
