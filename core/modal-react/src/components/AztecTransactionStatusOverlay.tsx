import { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { TransactionStatus } from '@walletmesh/modal-core';
import { useStore } from '../hooks/internal/useStore.js';
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

const STAGE_ORDER: TransactionStatus[] = [
  'idle',
  'simulating',
  'proving',
  'sending',
  'pending',
  'confirming',
  'confirmed',
];

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
  const [target, setTarget] = useState<Element | null>(null);
  // Track dismissed transaction IDs to enable graceful closure after success/failure
  const [dismissedTxIds, setDismissedTxIds] = useState<Set<string>>(new Set());

  // Setup focus trap for the overlay content
  const overlayContentRef = useFocusTrap<HTMLDivElement>({
    enabled: !disableFocusTrap,
    autoFocus: true,
    restoreFocus: true,
  });

  // Get active transaction (sync mode)
  const activeTransactionId = useStore((state) => state.active?.transactionId);
  const activeTransaction = useStore((state) => {
    if (!activeTransactionId) return null;
    return state.entities.transactions[activeTransactionId];
  });

  // Get background transactions (async mode)
  const backgroundTransactions = useStore((state) => {
    const backgroundTxIds = state.meta.backgroundTransactionIds || [];
    return backgroundTxIds.map((id: string) => state.entities.transactions[id]).filter(Boolean);
  });

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
    // Only exclude transactions that have been locally dismissed
    return txs.filter((tx) => {
      const status = tx?.status as TransactionStatus;
      const txId = tx?.txStatusId;
      // Show transaction if it has a valid status and hasn't been dismissed
      return status && txId && !dismissedTxIds.has(txId);
    });
  }, [activeTransaction, backgroundTransactions, showBackgroundTransactions, dismissedTxIds]);

  // Determine if overlay should be visible
  const shouldShowOverlay = transactionsToShow.length > 0;

  // Track timers for auto-dismiss
  const dismissTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Auto-dismiss confirmed/failed transactions after a delay to show success/error state
  useEffect(() => {
    const AUTO_DISMISS_DELAY = 2500; // 2.5 seconds to show success/error state

    // Build set of current transaction IDs for efficient lookup
    const currentTxIds = new Set(
      transactionsToShow.filter((tx): tx is NonNullable<typeof tx> => tx?.txStatusId != null).map((tx) => tx.txStatusId),
    );

    // Clean up timers for transactions no longer in view (prevents memory leak)
    dismissTimersRef.current.forEach((timer, txId) => {
      if (!currentTxIds.has(txId)) {
        clearTimeout(timer);
        dismissTimersRef.current.delete(txId);
      }
    });

    // Create timers only for terminal state transactions that aren't already dismissed
    transactionsToShow.forEach((tx) => {
      const status = tx?.status as TransactionStatus;
      const txId = tx?.txStatusId;

      // If transaction reached terminal state (confirmed or failed) and not already dismissed
      if (
        (status === 'confirmed' || status === 'failed') &&
        txId &&
        !dismissedTxIds.has(txId) &&
        !dismissTimersRef.current.has(txId)
      ) {
        // Set up auto-dismiss timer
        const timer = setTimeout(() => {
          setDismissedTxIds((prev) => {
            const next = new Set(prev);
            next.add(txId);
            return next;
          });
          // Clean up timer reference
          dismissTimersRef.current.delete(txId);
        }, AUTO_DISMISS_DELAY);

        dismissTimersRef.current.set(txId, timer);
      }
    });

    // Cleanup all timers on unmount
    return () => {
      dismissTimersRef.current.forEach((timer) => {
        clearTimeout(timer);
      });
      dismissTimersRef.current.clear();
    };
  }, [transactionsToShow, dismissedTxIds]);

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
    // Dismiss all visible transactions
    setDismissedTxIds((prev) => {
      const next = new Set(prev);
      transactionsToShow.forEach((tx) => {
        if (tx?.txStatusId) {
          next.add(tx.txStatusId);
        }
      });
      return next;
    });
  }, [transactionsToShow]);

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
      aria-labelledby="tx-overlay-headline"
      aria-describedby="tx-overlay-description"
    >
      <div ref={overlayContentRef} className={styles['content']} tabIndex={-1}>
        {/* Animated spinner */}
        <div className={styles['spinner']} aria-hidden="true" />

        {/* Main headline and description */}
        <h2 id="tx-overlay-headline" className={styles['headline']}>
          {headline || defaultHeadline}
        </h2>
        <p id="tx-overlay-description" className={styles['description']}>
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
              const duration = tx?.startTime ? Date.now() - tx.startTime : 0;

              return (
                <div key={tx?.txStatusId} className={styles['transaction']}>
                  <div className={styles['transactionHeader']}>
                    <span className={styles['transactionHash']}>
                      {hash ? shorten(hash) : 'Processing...'}
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
      </div>
    </div>,
    target,
  );
}
