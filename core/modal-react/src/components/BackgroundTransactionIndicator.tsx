import { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { TransactionStatus } from '@walletmesh/modal-core';
import { useStore } from '../hooks/internal/useStore.js';
import { isBrowser } from '../utils/ssr-walletmesh.js';
import styles from './BackgroundTransactionIndicator.module.css';

export interface BackgroundTransactionIndicatorProps {
  /**
   * Position of the indicator on the screen.
   * @default 'bottom-right'
   */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /**
   * Whether to show the indicator for completed transactions briefly before hiding.
   * @default true
   */
  showCompleted?: boolean;
  /**
   * Duration in ms to show completed transactions before auto-hiding.
   * @default 3000
   */
  completedDuration?: number;
  /**
   * Optional custom container element to render into. Defaults to `document.body`.
   */
  container?: Element | null;
  /**
   * Called when a transaction is clicked.
   */
  onTransactionClick?: (transactionId: string) => void;
}

interface TransactionInfo {
  id: string;
  hash: string;
  status: TransactionStatus;
  startTime: number;
}

const STATUS_ICONS: Record<TransactionStatus, string> = {
  idle: '⏳',
  initiated: '▶️',
  simulating: '🔧',
  proving: '🔐',
  sending: '📡',
  pending: '⏱️',
  confirming: '⏱️',
  confirmed: '✅',
  failed: '❌',
};

const STATUS_LABELS: Record<TransactionStatus, string> = {
  idle: 'Starting',
  initiated: 'Initiated',
  simulating: 'Simulating',
  proving: 'Proving',
  sending: 'Sending',
  pending: 'Pending',
  confirming: 'Confirming',
  confirmed: 'Confirmed',
  failed: 'Failed',
};

function shorten(hash: string): string {
  if (!hash || hash.length <= 12) {
    return hash || 'Processing...';
  }
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}

function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  if (ms < 60000) {
    return `${(ms / 1000).toFixed(0)}s`;
  }
  return `${(ms / 60000).toFixed(1)}m`;
}

/**
 * Floating indicator for background (async) transactions.
 *
 * Shows a badge with the count of active background transactions and provides
 * an expandable drawer to view details of each transaction.
 *
 * @public
 */
export function BackgroundTransactionIndicator({
  position = 'bottom-right',
  showCompleted = true,
  completedDuration = 3000,
  container,
  onTransactionClick,
}: BackgroundTransactionIndicatorProps): React.ReactPortal | null {
  const [target, setTarget] = useState<Element | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [completedTransactionIds, setCompletedTransactionIds] = useState<Set<string>>(new Set());

  // Ref to track cleanup timers
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Get background transactions from store
  const backgroundTransactions = useStore((state) => {
    const backgroundTxIds = state.meta.backgroundTransactionIds || [];
    return backgroundTxIds
      .map((id: string) => {
        const tx = state.entities.transactions[id];
        if (!tx) return null;
        return {
          id: tx.txStatusId,
          hash: tx.txHash || '',
          status: tx.status as TransactionStatus,
          startTime: tx.startTime || Date.now(),
        } as TransactionInfo;
      })
      .filter((tx): tx is TransactionInfo => tx !== null);
  });

  // Track completed transactions for auto-hide
  useEffect(() => {
    const newCompletedIds = new Set<string>();
    backgroundTransactions.forEach((tx) => {
      if (tx.status === 'confirmed' || tx.status === 'failed') {
        newCompletedIds.add(tx.id);
      }
    });

    // Set timers to remove completed transactions from the set
    newCompletedIds.forEach((id) => {
      if (!completedTransactionIds.has(id)) {
        // Clear any existing timer for this id
        const existingTimer = timersRef.current.get(id);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }

        // Set new timer and store reference
        const timer = setTimeout(() => {
          setCompletedTransactionIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
          // Clean up timer reference
          timersRef.current.delete(id);
        }, completedDuration);

        timersRef.current.set(id, timer);
      }
    });

    setCompletedTransactionIds(newCompletedIds);

    // Cleanup function to clear all timers
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, [backgroundTransactions, completedDuration, completedTransactionIds]);

  // Filter transactions based on showCompleted setting
  const visibleTransactions = useMemo(() => {
    if (showCompleted) {
      return backgroundTransactions.filter(
        (tx) => completedTransactionIds.has(tx.id) || (tx.status !== 'confirmed' && tx.status !== 'failed'),
      );
    }
    return backgroundTransactions.filter((tx) => tx.status !== 'confirmed' && tx.status !== 'failed');
  }, [backgroundTransactions, showCompleted, completedTransactionIds]);

  // Count active (non-completed) transactions
  const activeCount = useMemo(() => {
    return visibleTransactions.filter((tx) => tx.status !== 'confirmed' && tx.status !== 'failed').length;
  }, [visibleTransactions]);

  const shouldShow = visibleTransactions.length > 0;

  useEffect(() => {
    if (!isBrowser) return;
    if (container) {
      setTarget(container);
    } else {
      setTarget(document.body);
    }
  }, [container]);

  // Auto-collapse when no transactions
  useEffect(() => {
    if (!shouldShow) {
      setIsExpanded(false);
    }
  }, [shouldShow]);

  if (!shouldShow || !isBrowser || !target) {
    return null;
  }

  const positionClass = styles[`indicator--${position}`] || styles['indicator--bottom-right'];

  return createPortal(
    <div className={`${styles['indicator']} ${positionClass}`}>
      {/* Badge Button */}
      <button
        type="button"
        className={styles['badge']}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={`${activeCount} background transaction${activeCount !== 1 ? 's' : ''}`}
        aria-expanded={isExpanded}
      >
        <div className={styles['badgeIcon']}>{activeCount > 0 ? '⚡' : '✓'}</div>
        <div className={styles['badgeCount']}>
          {activeCount > 0 ? activeCount : visibleTransactions.length}
        </div>
        {activeCount > 0 && <div className={styles['badgeSpinner']} />}
      </button>

      {/* Expandable Drawer */}
      {isExpanded && (
        <div className={styles['drawer']} role="region" aria-label="Background transactions">
          <div className={styles['drawerHeader']}>
            <h3 className={styles['drawerTitle']}>Background Transactions</h3>
            <button
              type="button"
              className={styles['drawerClose']}
              onClick={() => setIsExpanded(false)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className={styles['drawerContent']}>
            {visibleTransactions.length === 0 ? (
              <div className={styles['emptyState']}>No background transactions</div>
            ) : (
              <ul className={styles['transactionList']}>
                {visibleTransactions.map((tx) => {
                  const duration = Date.now() - tx.startTime;
                  const isCompleted = tx.status === 'confirmed' || tx.status === 'failed';
                  const isFailed = tx.status === 'failed';

                  return (
                    <li key={tx.id} className={styles['transactionItem']}>
                      <button
                        type="button"
                        className={`${styles['transaction']} ${isCompleted ? styles['transaction--completed'] : ''} ${isFailed ? styles['transaction--failed'] : ''}`}
                        onClick={() => onTransactionClick?.(tx.id)}
                        disabled={!onTransactionClick}
                      >
                        <div className={styles['transactionIcon']}>{STATUS_ICONS[tx.status]}</div>

                        <div className={styles['transactionDetails']}>
                          <div className={styles['transactionHash']}>{shorten(tx.hash)}</div>
                          <div className={styles['transactionStatus']}>{STATUS_LABELS[tx.status]}</div>
                        </div>

                        <div className={styles['transactionMeta']}>
                          <div className={styles['transactionDuration']}>{formatDuration(duration)}</div>
                          {!isCompleted && <div className={styles['transactionSpinner']} />}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {activeCount > 0 && (
            <div className={styles['drawerFooter']}>
              <div className={styles['drawerFooterText']}>
                {activeCount} transaction{activeCount !== 1 ? 's' : ''} in progress
              </div>
            </div>
          )}
        </div>
      )}
    </div>,
    target,
  );
}
