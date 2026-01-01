import type { TransactionStatus } from '@walletmesh/modal-core';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  shallowEqual,
  useStore,
  useStoreInstance,
  useStoreWithEquality,
} from '../hooks/internal/useStore.js';
import { isBrowser } from '../utils/ssr-walletmesh.js';
import { useFocusTrap } from '../utils/useFocusTrap.js';
import styles from './AztecTransactionStatusOverlay.module.css';

export interface AztecTransactionStatusOverlayProps {
  /** Override the headline text. */
  headline?: string;
  /** Override the supporting description text. */
  description?: string;
  /**
   * Disable the beforeunload navigation guard that warns users before closing the tab.
   * Enabled by default while the overlay is visible.
   */
  disableNavigationGuard?: boolean;
  /**
   * Optional custom container element to render into. Defaults to `document.body`.
   */
  container?: Element | null;
  /**
   * Show progress for async (background) transactions in addition to sync transactions.
   * Defaults to false (only shows sync/active transactions).
   */
  showBackgroundTransactions?: boolean;
  /**
   * Allow ESC key to close overlay when in terminal state (confirmed/failed).
   * Defaults to true.
   */
  allowEscapeKeyClose?: boolean;
  /**
   * Disable focus trapping (for custom focus management).
   * Defaults to false (focus trapping enabled).
   */
  disableFocusTrap?: boolean;
}

interface StageInfo {
  label: string;
  description: string;
  icon: string;
}

const STAGE_INFO: Record<TransactionStatus, StageInfo> = {
  idle: {
    label: 'Starting',
    description: 'Initializing transaction',
    icon: '⏳',
  },
  initiated: {
    label: 'Initiated',
    description: 'Transaction initiated',
    icon: '▶️',
  },
  simulating: {
    label: 'Simulating',
    description: 'Simulating transaction',
    icon: '🔧',
  },
  proving: {
    label: 'Generating Proof',
    description: 'Creating zero-knowledge proof (1-2 minutes)',
    icon: '🔐',
  },
  sending: {
    label: 'Sending',
    description: 'Sending to network',
    icon: '📡',
  },
  pending: {
    label: 'Pending',
    description: 'Transaction submitted, awaiting inclusion',
    icon: '⏱️',
  },
  confirming: {
    label: 'Confirming',
    description: 'Waiting for confirmation',
    icon: '⏱️',
  },
  confirmed: {
    label: 'Confirmed',
    description: 'Transaction successful',
    icon: '✅',
  },
  failed: {
    label: 'Failed',
    description: 'Transaction failed',
    icon: '❌',
  },
};

const STAGE_ORDER: TransactionStatus[] = ['idle', 'proving', 'confirming', 'confirmed'];

function shorten(hash: string): string {
  if (hash.length <= 12) {
    return hash;
  }
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}

function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  return `${(ms / 60000).toFixed(1)}m`;
}

/**
 * Full-screen overlay showing Aztec transaction lifecycle progress.
 *
 * Displays all transaction stages from preparation through confirmation,
 * with special emphasis on proof generation (which takes 1-2 minutes).
 * Automatically attaches a navigation guard to prevent accidental tab closure.
 *
 * @public
 */
export function AztecTransactionStatusOverlay({
  headline,
  description,
  disableNavigationGuard = false,
  container,
  showBackgroundTransactions = false,
  allowEscapeKeyClose = true,
  disableFocusTrap = false,
}: AztecTransactionStatusOverlayProps): React.ReactPortal | null {
  const headlineId = useId();
  const descriptionId = useId();
  const [target, setTarget] = useState<Element | null>(null);
  // Track dismissed transaction IDs to enable graceful closure after success/failure
  const [dismissedTxIds, setDismissedTxIds] = useState<Set<string>>(new Set());
  // Track dismiss timers for cleanup on unmount
  const dismissTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Get store instance for setState calls
  const store = useStoreInstance();

  // Setup focus trap for the overlay content
  const overlayContentRef = useFocusTrap<HTMLDivElement>({
    enabled: !disableFocusTrap,
    autoFocus: true,
    restoreFocus: true,
  });

  // Get active transaction (sync mode)
  // Combined into single selector to avoid closure issues where activeTransaction
  // selector would use stale activeTransactionId from previous render
  const activeTransaction = useStore((state) => {
    const id = state.active?.transactionId;
    return id ? state.entities.transactions[id] : null;
  });

  // Get background transaction IDs (memoized with shallow comparison)
  const backgroundTxIds = useStoreWithEquality(
    (state) => state.meta.backgroundTransactionIds || [],
    shallowEqual,
  );
  const transactions = useStore((state) => state.entities.transactions);

  // Derive background transactions with useMemo to avoid new array each render
  const backgroundTransactions = useMemo(() => {
    return backgroundTxIds.map((id: string) => transactions[id]).filter(Boolean);
  }, [backgroundTxIds, transactions]);

  // Determine which transaction(s) to show
  const transactionsToShow = useMemo(() => {
    const txs = [];

    // Always include active transaction (sync mode)
    if (activeTransaction) {
      txs.push(activeTransaction);
    }

    // Optionally include background transactions
    if (showBackgroundTransactions) {
      txs.push(...backgroundTransactions);
    }

    // Filter to show all transactions including confirmed/failed (for brief success display)
    // Exclude signing-only transactions (authwit, sign message, etc.) and dismissed transactions
    return txs.filter((tx) => {
      const status = tx?.status as TransactionStatus;
      const txId = tx?.txStatusId;
      // Check if this is a signing-only operation (safe access with optional chaining)
      const isSigningOnly = (tx as { isSigningOnly?: boolean })?.isSigningOnly || false;

      // Never show signing-only operations in the overlay
      if (isSigningOnly) {
        return false;
      }

      // Show transaction if it has a valid status and hasn't been dismissed
      return status && txId && !dismissedTxIds.has(txId);
    });
  }, [activeTransaction, backgroundTransactions, showBackgroundTransactions, dismissedTxIds]);

  // Determine if overlay should be visible
  const shouldShowOverlay = transactionsToShow.length > 0;

  // Status-based auto-dismiss for confirmed transactions
  // Show success state for 1 second before dismissing
  // Failed transactions require user dismissal (ESC key or dismiss button)
  useEffect(() => {
    transactionsToShow.forEach((tx) => {
      const status = tx?.status as TransactionStatus;
      const txId = tx?.txStatusId;

      // Only auto-dismiss confirmed transactions (not failed)
      // Show success state for 1 second before dismissing
      if (status === 'confirmed' && txId && !dismissedTxIds.has(txId)) {
        // Don't set another timer if one already exists for this txId
        if (dismissTimersRef.current.has(txId)) {
          return;
        }

        // Set a 1-second timer to show the success state before dismissing
        const timerId = setTimeout(() => {
          // Double-check the transaction is still in terminal state before dismissing
          // This handles race conditions where state might have changed
          const currentTxState = store.getState().entities.transactions[txId];
          const currentStatus = currentTxState?.status as TransactionStatus | undefined;

          // Only dismiss if still in terminal state (confirmed or failed)
          if (currentStatus === 'confirmed' || currentStatus === 'failed') {
            setDismissedTxIds((prev) => {
              const next = new Set(prev);
              next.add(txId);
              return next;
            });

            // Also clear active transaction in store
            store.setState((state) => ({
              ...state,
              active: {
                ...state.active,
                transactionId: null,
              },
            }));
          }
          // If not in terminal state, don't dismiss - something updated the transaction

          // Clean up timer reference (always do this)
          dismissTimersRef.current.delete(txId);
        }, 1000); // 1 second delay to show success state

        dismissTimersRef.current.set(txId, timerId);
      }
      // Failed transactions are NOT auto-dismissed - user must use ESC or dismiss button
    });
  }, [transactionsToShow, dismissedTxIds, store]);

  // Cleanup effect for dismiss timers on unmount
  useEffect(() => {
    return () => {
      // Clear all pending dismiss timers on unmount
      dismissTimersRef.current.forEach((timerId) => {
        clearTimeout(timerId);
      });
      dismissTimersRef.current.clear();
    };
  }, []);

  // Current status for headline
  const currentStatus = useMemo(() => {
    if (transactionsToShow.length === 0) return null;
    // Use the first transaction's status as the primary status
    return transactionsToShow[0]?.status as TransactionStatus;
  }, [transactionsToShow]);

  const defaultHeadline = currentStatus ? STAGE_INFO[currentStatus]?.label : 'Processing Transaction';
  const defaultDescription = currentStatus ? STAGE_INFO[currentStatus]?.description : 'Please wait...';

  useEffect(() => {
    if (!isBrowser()) return;
    if (container) {
      setTarget(container);
    } else {
      setTarget(document.body);
    }

    // Cleanup: reset target if container is removed
    return () => {
      setTarget(null);
    };
  }, [container]);

  // Navigation guard
  useEffect(() => {
    if (!shouldShowOverlay || disableNavigationGuard || !isBrowser()) {
      return;
    }

    const message = 'Transaction is still in progress.';
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [shouldShowOverlay, disableNavigationGuard]);

  // ESC key handler - allow closing when in terminal state
  const handleDismissAll = useCallback(() => {
    // Dismiss all visible transactions in local state
    setDismissedTxIds((prev) => {
      const next = new Set(prev);
      transactionsToShow.forEach((tx) => {
        if (tx?.txStatusId) {
          next.add(tx.txStatusId);
        }
      });
      return next;
    });

    // Also clear active transaction in store to prevent re-showing on state updates
    store.setState((state) => ({
      ...state,
      active: {
        ...state.active,
        transactionId: null,
      },
    }));
  }, [transactionsToShow, store]);

  useEffect(() => {
    if (!shouldShowOverlay || !allowEscapeKeyClose || !isBrowser()) {
      return;
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Only allow ESC to close if all visible transactions are in terminal state
        const allTerminal = transactionsToShow.every((tx) => {
          const status = tx?.status as TransactionStatus;
          return status === 'confirmed' || status === 'failed';
        });

        if (allTerminal) {
          event.preventDefault();
          handleDismissAll();
        }
      }
    };

    window.addEventListener('keydown', handleEscapeKey);
    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [shouldShowOverlay, allowEscapeKeyClose, transactionsToShow, handleDismissAll]);

  if (!shouldShowOverlay || !isBrowser() || !target) {
    return null;
  }

  // Verify target is still in document to prevent portal cleanup errors
  if (!document.body.contains(target as Node)) {
    return null;
  }

  return createPortal(
    <div
      className={styles['overlay']}
      role="dialog"
      aria-modal="true"
      aria-labelledby={headlineId}
      aria-describedby={descriptionId}
    >
      <div ref={overlayContentRef} className={styles['content']} tabIndex={-1}>
        {/* Animated spinner */}
        <div className={styles['spinner']} aria-hidden="true" />

        {/* Main headline and description */}
        <h2 id={headlineId} className={styles['headline']}>
          {headline || defaultHeadline}
        </h2>
        <p id={descriptionId} className={styles['description']}>
          {description || defaultDescription}
        </p>

        {/* Progress indicator for stages */}
        {currentStatus && (
          <div className={styles['stagesContainer']}>
            <div
              className={styles['stages']}
              role="progressbar"
              aria-valuenow={STAGE_ORDER.indexOf(currentStatus)}
              aria-valuemin={0}
              aria-valuemax={STAGE_ORDER.length - 1}
            >
              {STAGE_ORDER.map((stage) => {
                const isCurrentStage = stage === currentStatus;
                const currentIndex = STAGE_ORDER.indexOf(currentStatus);
                const stageIndex = STAGE_ORDER.indexOf(stage);
                const isCompleted = stageIndex < currentIndex;
                const isFailed = currentStatus === 'failed' && stage === currentStatus;

                return (
                  <div
                    key={stage}
                    className={`${styles['stage']} ${isCurrentStage ? styles['stage--active'] : ''} ${isCompleted ? styles['stage--completed'] : ''} ${isFailed ? styles['stage--failed'] : ''}`}
                    data-stage={stage}
                  >
                    <div className={styles['stageIcon']}>{STAGE_INFO[stage].icon}</div>
                    <div className={styles['stageLabel']}>{STAGE_INFO[stage].label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Transaction details */}
        {transactionsToShow.length > 0 && (
          <div className={styles['transactionsList']}>
            {transactionsToShow.map((tx) => {
              const txStatus = tx?.status as TransactionStatus;
              const hash = tx?.txHash;
              // Convert hash to string if it's an object (e.g., Aztec TxHash)
              const hashString = hash ? (typeof hash === 'string' ? hash : String(hash)) : null;
              const duration = tx?.startTime ? Date.now() - tx.startTime : 0;

              return (
                <div key={tx?.txStatusId} className={styles['transaction']}>
                  <div className={styles['transactionHeader']}>
                    <span className={styles['transactionHash']}>
                      {hashString ? shorten(hashString) : 'Processing...'}
                    </span>
                    <span className={styles['transactionDuration']}>{formatDuration(duration)}</span>
                  </div>
                  <div className={styles['transactionStatus']}>
                    {STAGE_INFO[txStatus]?.icon} {STAGE_INFO[txStatus]?.label}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Multiple transactions notice */}
        {transactionsToShow.length > 1 && (
          <p className={styles['multipleNotice']}>Processing {transactionsToShow.length} transactions</p>
        )}

        {/* Dismiss button for failed transactions */}
        {currentStatus === 'failed' && (
          <button className={styles['dismissButton']} onClick={handleDismissAll} type="button">
            Dismiss
          </button>
        )}
      </div>
    </div>,
    target,
  );
}
