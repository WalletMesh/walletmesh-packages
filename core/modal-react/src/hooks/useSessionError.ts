/**
 * Session error detection and handling hook
 *
 * Provides automatic detection of session-related errors from the Zustand store,
 * with optional auto-disconnect and notification callbacks. Handles deduplication
 * to prevent showing the same error multiple times.
 *
 * @module hooks/useSessionError
 */

import { useCallback, useEffect, useRef } from 'react';
import { isSessionError } from '@walletmesh/modal-core';
import { useStoreInstance } from './internal/useStore.js';
import { useConnect } from './useConnect.js';
import { createComponentLogger } from '../utils/logger.js';

const logger = createComponentLogger('useSessionError');

/**
 * Session error data from the store
 * Note: This is a custom error format, not a ModalError
 */
export interface SessionError {
  code: 'session_terminated';
  message: string;
  category?: string;
  fatal?: boolean;
  data?: {
    sessionId?: string;
    reason?: string;
    error?: unknown;
    [key: string]: unknown;
  };
}

/**
 * Type guard to check if an object is a SessionError
 */
function isStoreSessionError(error: unknown): error is SessionError {
  if (!error || typeof error !== 'object') return false;
  const err = error as Record<string, unknown>;
  return err['code'] === 'session_terminated' && typeof err['message'] === 'string';
}

/**
 * Options for the useSessionError hook
 *
 * @public
 */
export interface UseSessionErrorOptions {
  /**
   * Whether to automatically disconnect when a session error is detected
   * @default true
   */
  autoDisconnect?: boolean;

  /**
   * Callback invoked when a session error is detected
   * Use this to show notifications/toasts to the user
   *
   * @example
   * ```typescript
   * const { sessionError } = useSessionError({
   *   onSessionError: (error) => {
   *     toast.error(`Session expired (${error.code}). Please reconnect.`);
   *   }
   * });
   * ```
   */
  onSessionError?: (error: SessionError) => void;

  /**
   * Custom disconnect reason to use when auto-disconnecting
   * @default 'session_expired'
   */
  disconnectReason?: string;
}

/**
 * Return type for the useSessionError hook
 *
 * @public
 */
export interface UseSessionErrorReturn {
  /**
   * Current session error, if any
   */
  sessionError: SessionError | null;

  /**
   * Manually clear the session error from the store
   */
  clearSessionError: () => void;

  /**
   * Check if any error is a session-related error
   * This is a re-export of the utility function for convenience
   */
  isSessionError: typeof isSessionError;
}

/**
 * Hook for detecting and handling session errors
 *
 * Automatically detects when a wallet session has expired or been terminated,
 * with optional auto-disconnect and notification callbacks. Handles deduplication
 * to prevent showing the same error multiple times.
 *
 * @param options - Configuration options for session error handling
 * @returns Session error state and utilities
 *
 * @example
 * ```typescript
 * // Basic usage with auto-disconnect
 * function MyComponent() {
 *   const { sessionError } = useSessionError({
 *     onSessionError: (error) => {
 *       showToast(`Session expired: ${error.message}`);
 *     }
 *   });
 *
 *   return <div>{sessionError ? 'Disconnected' : 'Connected'}</div>;
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Usage without auto-disconnect
 * function MyComponent() {
 *   const { sessionError, clearSessionError } = useSessionError({
 *     autoDisconnect: false,
 *     onSessionError: (error) => {
 *       if (confirm('Session expired. Reconnect?')) {
 *         reconnect();
 *       }
 *       clearSessionError();
 *     }
 *   });
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Check for session errors in operation handlers
 * function MyComponent() {
 *   const { isSessionError } = useSessionError();
 *   const { sendTransaction } = useTransaction();
 *
 *   const handleSend = async () => {
 *     try {
 *       await sendTransaction({ ... });
 *     } catch (error) {
 *       if (isSessionError(error)) {
 *         // Handle session error specifically
 *         showToast('Session expired, please reconnect');
 *       } else {
 *         // Handle other errors
 *         showToast(`Transaction failed: ${error.message}`);
 *       }
 *     }
 *   };
 * }
 * ```
 *
 * @public
 * @since 3.0.0
 */
export function useSessionError(options: UseSessionErrorOptions = {}): UseSessionErrorReturn {
  const { autoDisconnect = true, onSessionError, disconnectReason = 'session_expired' } = options;

  const store = useStoreInstance();
  const { disconnect } = useConnect();

  // Track which errors we've already handled to prevent duplicates
  const handledErrorsRef = useRef<Set<string>>(new Set());

  /**
   * Clear the session error from the store
   */
  const clearSessionError = useCallback(() => {
    logger.debug('Clearing session error from store');
    store.setState((state) => ({
      ui: {
        ...state.ui,
        errors: {
          ...state.ui?.errors,
          ['session']: undefined,
        },
      },
    }));
  }, [store]);

  /**
   * Handle a detected session error
   */
  const handleSessionError = useCallback(
    (error: SessionError) => {
      // Create a unique key for this error to track if we've handled it
      const errorKey = `${error.code}-${error.data?.sessionId || Date.now()}`;

      // Skip if we've already handled this exact error
      if (handledErrorsRef.current.has(errorKey)) {
        logger.debug('Skipping duplicate session error', { errorKey });
        return;
      }

      logger.info('Handling session error', { error, autoDisconnect });

      // Mark this error as handled
      handledErrorsRef.current.add(errorKey);

      // Call the notification callback if provided
      if (onSessionError) {
        try {
          onSessionError(error);
        } catch (callbackError) {
          logger.error('Error in onSessionError callback', callbackError);
        }
      }

      // Auto-disconnect if enabled
      if (autoDisconnect) {
        logger.debug('Auto-disconnecting due to session error');
        disconnect(undefined, { reason: disconnectReason }).catch((disconnectError) => {
          logger.error('Error during auto-disconnect', disconnectError);
        });
      }

      // Clear the error from store after disconnect completes
      // Increased from 100ms to 1000ms to allow disconnect process to finish
      setTimeout(() => {
        clearSessionError();
      }, 1000);
    },
    [autoDisconnect, onSessionError, disconnectReason, disconnect, clearSessionError],
  );

  /**
   * Subscribe to store changes and watch for session errors
   */
  useEffect(() => {
    logger.debug('Setting up session error subscription');

    // Get the initial state
    const currentState = store.getState();
    const sessionError = currentState.ui?.errors?.['session'];

    // Check for existing session error on mount
    if (isStoreSessionError(sessionError)) {
      handleSessionError(sessionError);
    }

    // Subscribe to store changes
    const unsubscribe = store.subscribe((state) => {
      const sessionError = state.ui?.errors?.['session'];

      if (isStoreSessionError(sessionError)) {
        handleSessionError(sessionError);
      }
    });

    return () => {
      logger.debug('Cleaning up session error subscription');
      unsubscribe();

      // Clear handled errors set on unmount
      handledErrorsRef.current.clear();
    };
  }, [store, handleSessionError]);

  /**
   * Get current session error from store
   */
  const sessionError = store.getState().ui?.errors?.['session'];
  const currentSessionError = isStoreSessionError(sessionError) ? sessionError : null;

  return {
    sessionError: currentSessionError,
    clearSessionError,
    isSessionError,
  };
}

/**
 * Simplified hook for automatic session error handling with minimal configuration
 *
 * Provides a convenience wrapper around useSessionError with common defaults.
 * Automatically disconnects on session errors and calls the provided callback.
 *
 * @param onSessionError - Callback to invoke when a session error is detected
 * @returns Session error state and utilities
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   useAutoDisconnectOnSessionError((error) => {
 *     toast.error(`Session expired: ${error.message}`);
 *   });
 *
 *   // Component will automatically disconnect and show notification
 * }
 * ```
 *
 * @public
 * @since 3.0.0
 */
export function useAutoDisconnectOnSessionError(
  onSessionError: (error: SessionError) => void,
): UseSessionErrorReturn {
  return useSessionError({
    autoDisconnect: true,
    onSessionError,
    disconnectReason: 'session_expired',
  });
}
