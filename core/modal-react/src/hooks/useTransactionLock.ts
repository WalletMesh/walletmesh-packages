/**
 * Transaction Lock Hook
 *
 * Provides a synchronous lock mechanism to prevent concurrent transaction
 * executions. This is a defense-in-depth measure that complements the
 * router's approval queue system.
 *
 * The lock uses a ref for synchronous checks (to prevent race conditions
 * between rapid clicks) and state for UI updates.
 *
 * @module hooks/useTransactionLock
 * @packageDocumentation
 */

import { useCallback, useRef, useState } from 'react';
import { createComponentLogger } from '../utils/logger.js';

const logger = createComponentLogger('useTransactionLock');

/**
 * Return type for the useTransactionLock hook.
 *
 * @public
 */
export interface UseTransactionLockReturn {
  /** Whether the lock is currently held */
  isLocked: boolean;
  /**
   * Attempt to acquire the lock.
   * @returns true if lock was acquired, false if already locked
   */
  lock: () => boolean;
  /** Release the lock */
  unlock: () => void;
  /**
   * Execute a function with automatic lock management.
   * Acquires lock, executes function, releases lock on completion.
   * @throws Error if lock cannot be acquired
   */
  withLock: <T>(fn: () => Promise<T>) => Promise<T>;
}

/**
 * Hook for managing a transaction execution lock.
 *
 * This hook provides a synchronous lock mechanism to prevent concurrent
 * transaction executions at the dApp level. It works as a defense-in-depth
 * measure alongside the wallet's router-level approval queue.
 *
 * Key features:
 * - Synchronous lock check via ref (prevents race conditions from rapid clicks)
 * - State tracking for UI updates (isLocked)
 * - Automatic lock management with withLock()
 *
 * @returns Lock management utilities
 *
 * @example
 * ```tsx
 * function TransactionButton() {
 *   const { isLocked, withLock } = useTransactionLock();
 *   const { executeSync } = useAztecTransaction();
 *
 *   const handleTransaction = async () => {
 *     try {
 *       await withLock(async () => {
 *         await executeSync(interaction);
 *       });
 *     } catch (error) {
 *       if (error.message.includes('already in progress')) {
 *         console.log('Transaction already running');
 *       }
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleTransaction} disabled={isLocked}>
 *       {isLocked ? 'Processing...' : 'Send Transaction'}
 *     </button>
 *   );
 * }
 * ```
 *
 * @public
 */
export function useTransactionLock(): UseTransactionLockReturn {
  // Ref for synchronous lock checks (prevents race conditions)
  const lockRef = useRef(false);
  // State for UI updates
  const [isLocked, setIsLocked] = useState(false);

  /**
   * Attempt to acquire the lock.
   * Uses synchronous ref check to prevent race conditions.
   */
  const lock = useCallback((): boolean => {
    // Synchronous check - if already locked, return false immediately
    if (lockRef.current) {
      logger.warn('Lock acquisition failed - already locked');
      return false;
    }

    // Acquire lock
    lockRef.current = true;
    setIsLocked(true);
    logger.debug('Lock acquired');
    return true;
  }, []);

  /**
   * Release the lock.
   */
  const unlock = useCallback((): void => {
    lockRef.current = false;
    setIsLocked(false);
    logger.debug('Lock released');
  }, []);

  /**
   * Execute a function with automatic lock management.
   * Acquires lock before execution, releases on completion (success or error).
   */
  const withLock = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T> => {
      if (!lock()) {
        throw new Error('Transaction already in progress');
      }

      try {
        return await fn();
      } finally {
        unlock();
      }
    },
    [lock, unlock],
  );

  return {
    isLocked,
    lock,
    unlock,
    withLock,
  };
}
