import { useAztecTransaction } from '@walletmesh/modal-react/aztec';
import { useMemo } from 'react';
import type { TransactionStatus } from '../types/transactionStatus.js';

interface TransactionStatusEntry {
  txStatusId: string;
  status: TransactionStatus;
  txHash?: string;
  error?: string;
  timestamp?: number;
}

interface UseTransactionStatusResult {
  /** Whether there is an active sync transaction in progress */
  isActive: boolean;
  /** The current active transaction entry, or null if none */
  currentEntry: TransactionStatusEntry | null;
  /** Array of all entries (always 0-1 for single-transaction design) */
  allEntries: TransactionStatusEntry[];
}

/**
 * React hook that surfaces transaction lifecycle status for sync (blocking) transactions.
 * Tracks stages: idle → simulating → proving → sending → pending → confirming → confirmed/failed
 *
 * This hook is designed for TransactionStatusOverlay which shows a full-screen blocking overlay.
 * It ONLY tracks sync transactions (from executeSync) to avoid blocking the UI for background transactions.
 * Background transactions (from execute) are displayed via BackgroundTransactionIndicator instead.
 *
 * @returns Reactive transaction status information for sync transactions only
 */
export function useTransactionStatus(): UseTransactionStatusResult {
  const { activeTransaction } = useAztecTransaction();

  return useMemo(() => {
    // ONLY track sync transactions (activeTransaction)
    // Background transactions are handled by BackgroundTransactionIndicator
    const isActive = activeTransaction !== null &&
                     activeTransaction.status !== 'confirmed' &&
                     activeTransaction.status !== 'failed';

    // Convert activeTransaction to TransactionStatusEntry format
    // No type cast needed - TransactionStatus type matches the local definition
    const currentEntry: TransactionStatusEntry | null = activeTransaction ? {
      txStatusId: activeTransaction.txStatusId,
      status: activeTransaction.status,
      txHash: activeTransaction.txHash,
      error: activeTransaction.error?.message,
      timestamp: activeTransaction.startTime,
    } : null;

    return {
      isActive,
      currentEntry,
      allEntries: currentEntry ? [currentEntry] : [],
    };
  }, [activeTransaction]);
}
