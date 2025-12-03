/**
 * Aztec transaction lifecycle state types for Wagmi pattern implementation
 *
 * These types extend the base TransactionResult type with additional fields
 * needed for comprehensive lifecycle tracking and sync/async execution modes.
 */

import type { TransactionResult, TransactionStatus } from '../../services/transaction/types.js';

/**
 * Transaction execution mode
 * - sync: Blocking execution with overlay UI
 * - async: Background execution with notification UI
 */
export type TransactionMode = 'sync' | 'async';

/**
 * Timing information for a transaction stage
 */
export interface StageTiming {
  /** Unix timestamp when stage started (milliseconds) */
  start: number;
  /** Unix timestamp when stage ended (milliseconds), undefined if still in progress */
  end?: number;
}

/**
 * Stage timing information for all transaction lifecycle stages
 *
 * Tracks the duration of each stage for performance monitoring and UI display.
 * Each stage records start and optionally end times.
 * Uses Aztec-native terminology aligned with official Aztec.js SDK.
 */
export interface TransactionStages {
  /** Transaction simulation stage (maps to Aztec's simulate()) */
  simulating?: StageTiming;
  /** Zero-knowledge proof generation stage (Aztec only) */
  proving?: StageTiming;
  /** Transaction sending/submission stage (maps to Aztec's send()) */
  sending?: StageTiming;
  /** Pending network inclusion stage */
  pending?: StageTiming;
  /** Awaiting confirmation stage */
  confirming?: StageTiming;
  /** Confirmed stage (includes timestamp of confirmation) */
  confirmed?: { timestamp: number };
}

/**
 * Extended transaction result with Aztec lifecycle tracking
 *
 * Extends the base TransactionResult with additional fields for:
 * - Execution mode (sync vs async)
 * - Detailed stage timing information
 * - Callback functions for lifecycle events
 * - Signing-only operation flag
 */
export interface AztecTransactionResult extends TransactionResult {
  /**
   * Execution mode for this transaction
   * - sync: User waits with overlay, transaction blocks UI
   * - async: Transaction runs in background, user can continue
   */
  mode: TransactionMode;

  /**
   * Detailed timing information for each lifecycle stage
   * Used for performance monitoring and progress display
   */
  stages: TransactionStages;

  /**
   * Flag indicating if this is a signing-only operation (authwit, sign message, etc.)
   * Signing-only operations should never trigger the transaction status overlay
   * as they don't involve blockchain state changes or multi-stage execution
   */
  isSigningOnly?: boolean;

  /**
   * The wallet's internal transaction status ID.
   * When a placeholder transaction is created before the wallet call,
   * the wallet will send notifications with its own txStatusId.
   * This field maps the wallet's ID to our placeholder ID, allowing
   * subsequent notifications to update the correct transaction.
   */
  walletTxStatusId?: string;
}

/**
 * Callback functions for transaction lifecycle events
 *
 * Used with async execution mode to notify application of state changes
 */
export interface TransactionCallbacks {
  /**
   * Called when transaction is successfully confirmed
   * @param result - Final transaction result with receipt
   */
  onSuccess?: (result: AztecTransactionResult) => void;

  /**
   * Called when transaction fails at any stage
   * @param error - Error that caused the failure
   */
  onError?: (error: Error) => void;

  /**
   * Called on every status change during transaction lifecycle
   * @param status - New transaction status
   * @param result - Current transaction state
   */
  onStatusChange?: (status: TransactionStatus, result: AztecTransactionResult) => void;
}

/**
 * Background transaction tracking state
 *
 * Maintains a list of transactions executing in async mode
 */
export interface BackgroundTransactionsState {
  /** Map of transaction ID to transaction result for background transactions */
  transactions: Record<string, AztecTransactionResult>;
  /** Count of active background transactions */
  count: number;
}

/**
 * Helper to calculate stage duration in milliseconds
 * @param stage - Stage timing information
 * @returns Duration in milliseconds, or undefined if stage hasn't completed
 */
export function getStageDuration(stage: StageTiming | undefined): number | undefined {
  if (!stage || !stage.end) return undefined;
  return stage.end - stage.start;
}

/**
 * Helper to get total transaction duration in milliseconds
 * @param result - Transaction result
 * @returns Total duration in milliseconds, or undefined if not completed
 */
export function getTotalDuration(result: AztecTransactionResult): number | undefined {
  if (!result.endTime) return undefined;
  return result.endTime - result.startTime;
}

/**
 * Helper to check if transaction is in a final state
 * @param status - Transaction status
 * @returns true if transaction is confirmed or failed
 */
export function isFinalStatus(status: TransactionStatus): boolean {
  return status === 'confirmed' || status === 'failed';
}

/**
 * Helper to check if transaction is in an active state
 * @param status - Transaction status
 * @returns true if transaction is actively processing
 */
export function isActiveStatus(status: TransactionStatus): boolean {
  return (
    status === 'simulating' ||
    status === 'proving' ||
    status === 'sending' ||
    status === 'pending' ||
    status === 'confirming'
  );
}
