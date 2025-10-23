import { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { isBrowser } from '../utils/ssr-walletmesh.js';
import { useFocusTrap } from '../utils/useFocusTrap.js';
import type { BatchTransactionStatus } from '../hooks/useAztecBatch.js';
import styles from './AztecBatchProgressOverlay.module.css';

export interface AztecBatchProgressOverlayProps {
  /** Whether batch execution is active */
  isExecuting: boolean;
  /** Batch execution mode */
  mode: 'atomic' | 'sequential';
  /** Overall progress percentage (0-100) */
  progress: number;
  /** Individual transaction statuses */
  transactions: BatchTransactionStatus[];
  /** Total number of transactions */
  total: number;
  /** Number of completed transactions */
  completed: number;
  /** Number of failed transactions */
  failed: number;
  /** Optional custom headline */
  headline?: string;
  /** Optional custom description */
  description?: string;
  /** Optional custom container element */
  container?: Element | null;
  /**
   * Disable focus trapping (for custom focus management).
   * Defaults to false (focus trapping enabled).
   */
  disableFocusTrap?: boolean;
  /**
   * Allow ESC key to close overlay when execution completes.
   * Defaults to true.
   */
  allowEscapeKeyClose?: boolean;
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

function shorten(hash: string): string {
  if (!hash || hash.length <= 12) {
    return hash || 'Processing...';
  }
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}

const STATUS_ICONS: Record<BatchTransactionStatus['status'], string> = {
  pending: '⏳',
  sending: '📤',
  confirming: '🔐',
  success: '✅',
  error: '❌',
};

const STATUS_LABELS: Record<BatchTransactionStatus['status'], string> = {
  pending: 'Pending',
  sending: 'Sending',
  confirming: 'Generating Proof',
  success: 'Completed',
  error: 'Failed',
};

/**
 * Full-screen overlay showing batch transaction progress.
 *
 * Displays overall batch progress and individual transaction statuses,
 * with different layouts for atomic vs sequential batch modes.
 *
 * @public
 */
export function AztecBatchProgressOverlay({
  isExecuting,
  mode,
  progress,
  transactions,
  total,
  completed,
  failed,
  headline,
  description,
  container,
  disableFocusTrap = false,
}: AztecBatchProgressOverlayProps): React.ReactPortal | null {
  // Debug logging
  console.log('[AztecBatchProgressOverlay] Render:', {
    isExecuting,
    mode,
    progress,
    transactionCount: transactions.length,
    total,
    completed,
    failed,
    isBrowser: isBrowser(),
  });

  // Setup focus trap for the overlay content
  const overlayContentRef = useFocusTrap<HTMLDivElement>({
    enabled: !disableFocusTrap && isExecuting,
    autoFocus: true,
    restoreFocus: true,
  });

  // Don't render if not executing
  if (!isExecuting || !isBrowser()) {
    console.log(
      '[AztecBatchProgressOverlay] Not rendering - isExecuting:',
      isExecuting,
      'isBrowser:',
      isBrowser(),
    );
    return null;
  }

  const isAtomic = mode === 'atomic';

  // Determine headline
  const displayHeadline = useMemo(() => {
    if (headline) return headline;
    if (isAtomic) {
      return progress === 100 ? 'Atomic Batch Complete!' : 'Executing Atomic Batch';
    }
    return progress === 100 ? 'Batch Complete!' : 'Executing Batch Transaction';
  }, [headline, isAtomic, progress]);

  // Determine description
  const displayDescription = useMemo(() => {
    if (description) return description;
    if (isAtomic) {
      if (progress === 100) {
        return failed > 0
          ? 'All operations failed together'
          : `All ${total} operations completed successfully`;
      }
      return `All ${total} operations executing together...`;
    }
    if (progress === 100) {
      return failed > 0
        ? `Completed with ${failed} failure(s)`
        : `All ${total} operations completed successfully`;
    }
    return `Processing ${completed} of ${total} operations`;
  }, [description, isAtomic, progress, total, completed, failed]);

  // Determine current status message
  const statusMessage = useMemo(() => {
    if (progress === 0) return 'Preparing batch...';
    if (progress === 100) return 'Batch completed!';

    if (isAtomic) {
      // For atomic, show unified status
      const activeTx = transactions.find((tx) => tx.status === 'confirming' || tx.status === 'sending');
      if (activeTx) {
        return STATUS_LABELS[activeTx.status];
      }
      return 'Processing...';
    }

    // For sequential, show current transaction
    const activeTx = transactions.find(
      (tx) => tx.status !== 'pending' && tx.status !== 'success' && tx.status !== 'error',
    );
    if (activeTx) {
      return `Transaction ${activeTx.index + 1}: ${STATUS_LABELS[activeTx.status]}`;
    }
    return `${completed} of ${total} operations complete`;
  }, [progress, isAtomic, transactions, completed, total]);

  const targetContainer = container || (isBrowser() ? document.body : null);
  if (!targetContainer) return null;

  return createPortal(
    <div className={styles['overlay']}>
      <div className={styles['content']} ref={overlayContentRef} tabIndex={-1}>
        {/* Spinner */}
        <div className={styles['spinner']} />

        {/* Headline */}
        <h2 className={styles['headline']}>{displayHeadline}</h2>

        {/* Description */}
        <p className={styles['description']}>{displayDescription}</p>

        {/* Progress Bar */}
        <div className={styles['progressContainer']}>
          <div className={styles['progressBar']}>
            <div className={styles['progressFill']} style={{ width: `${progress}%` }} />
          </div>
          <div className={styles['progressText']}>
            <span>{progress}%</span>
            <span className={styles['progressStatus']}>{statusMessage}</span>
          </div>
        </div>

        {/* Atomic Mode: Single unified status */}
        {isAtomic && (
          <div className={styles['atomicInfo']}>
            <p className={styles['atomicMessage']}>ℹ️ All operations will succeed or fail together</p>
            {transactions.length > 0 && transactions[0]?.hash && (
              <p className={styles['transactionHash']}>Transaction: {shorten(transactions[0].hash)}</p>
            )}
          </div>
        )}

        {/* Sequential Mode: Individual transaction cards */}
        {!isAtomic && transactions.length > 0 && (
          <div className={styles['transactionsList']}>
            {transactions.map((tx) => {
              // Use a simple timestamp-based duration since TxReceipt doesn't have blockNumber
              const duration = 0; // Will be calculated based on actual timing if needed
              const isActive = tx.status === 'sending' || tx.status === 'confirming';
              const isCompleted = tx.status === 'success';
              const isFailed = tx.status === 'error';

              return (
                <div
                  key={tx.index}
                  className={`${styles['transaction']} ${isActive ? styles['transactionActive'] : ''} ${
                    isCompleted ? styles['transactionSuccess'] : ''
                  } ${isFailed ? styles['transactionError'] : ''}`}
                >
                  <div className={styles['transactionHeader']}>
                    <span className={styles['transactionIndex']}>
                      {STATUS_ICONS[tx.status]} Transaction {tx.index + 1}
                    </span>
                    <span className={styles['transactionStatusLabel']}>{STATUS_LABELS[tx.status]}</span>
                  </div>

                  {tx.hash && <div className={styles['transactionHash']}>{shorten(tx.hash)}</div>}

                  {duration > 0 && (
                    <div className={styles['transactionDuration']}>{formatDuration(duration)}</div>
                  )}

                  {tx.error && <div className={styles['transactionError']}>{tx.error.message}</div>}
                </div>
              );
            })}
          </div>
        )}

        {/* Summary for completed batch */}
        {progress === 100 && (
          <div className={styles['summary']}>
            {failed === 0 ? (
              <p className={styles['summarySuccess']}>
                ✨ All {total} operation{total > 1 ? 's' : ''} completed successfully
              </p>
            ) : (
              <p className={styles['summaryPartial']}>
                ⚠️ {completed - failed} succeeded, {failed} failed
              </p>
            )}
          </div>
        )}
      </div>
    </div>,
    targetContainer,
  );
}
