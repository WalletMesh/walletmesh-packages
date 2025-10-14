import { useMemo } from 'react';
import type { TransactionStatus } from '../types/transactionStatus.js';
import { useTransactionStatus } from '../hooks/useTransactionStatus.js';

interface TransactionStatusOverlayProps {
  headline?: string;
  description?: string;
}

// Status display configuration matching TransactionStatus type
const STATUS_CONFIG: Record<TransactionStatus, { emoji: string; label: string; description: string }> = {
  idle: {
    emoji: '⏳',
    label: 'Preparing',
    description: 'Initializing transaction...',
  },
  simulating: {
    emoji: '🔧',
    label: 'Simulating Transaction',
    description: 'Simulating transaction execution...',
  },
  proving: {
    emoji: '🔐',
    label: 'Generating Proof',
    description: 'Creating zero-knowledge proof (1-2 minutes)...',
  },
  sending: {
    emoji: '📡',
    label: 'Sending Transaction',
    description: 'Sending to network...',
  },
  pending: {
    emoji: '⏱️',
    label: 'Pending',
    description: 'Transaction submitted, awaiting inclusion...',
  },
  confirming: {
    emoji: '⏱️',
    label: 'Confirming Transaction',
    description: 'Waiting for blockchain confirmation...',
  },
  confirmed: {
    emoji: '✅',
    label: 'Confirmed',
    description: 'Transaction successful!',
  },
  failed: {
    emoji: '❌',
    label: 'Failed',
    description: 'Transaction failed',
  },
};

/**
 * Displays transaction lifecycle status overlay for SYNC (blocking) transactions.
 * Shows stages: idle → simulating → proving → sending → pending → confirming → confirmed/failed
 *
 * This full-screen blocking overlay appears when using executeSync() from useAztecTransaction.
 * It replaced the legacy ProvingOverlay, providing comprehensive transaction tracking including
 * the proving stage.
 *
 * For ASYNC (background) transactions using execute(), this overlay does NOT appear.
 * Instead, use BackgroundTransactionIndicator which provides a non-intrusive floating badge,
 * allowing users to continue working while transactions process in the background.
 *
 * Uses a high z-index (2147483645) to appear above most page content.
 */
const TransactionStatusOverlay: React.FC<TransactionStatusOverlayProps> = ({ headline, description }) => {
  const { isActive, currentEntry } = useTransactionStatus();

  const statusInfo = useMemo(() => {
    if (!currentEntry) return null;
    return STATUS_CONFIG[currentEntry.status] || STATUS_CONFIG.idle;
  }, [currentEntry]);

  const fallbackSummary = useMemo(() => {
    const hash = currentEntry?.txHash;
    if (hash) {
      return `Transaction: ${hash}`;
    }
    return currentEntry?.txStatusId
      ? `ID: ${currentEntry.txStatusId}`
      : 'Processing transaction';
  }, [currentEntry]);

  if (!isActive || !statusInfo) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483645, // High z-index to appear above page content
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'rgba(15, 23, 42, 0.72)',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          background: 'rgba(9, 14, 26, 0.92)',
          borderRadius: 18,
          padding: '32px 28px',
          width: 'min(480px, 100%)',
          textAlign: 'center',
        }}
      >
        {/* Status emoji */}
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>{statusInfo.emoji}</div>

        {/* Headline */}
        <h2 style={{ margin: '0 0 12px', fontSize: '1.5rem', fontWeight: 600 }}>
          {headline ?? statusInfo.label}
        </h2>

        {/* Description */}
        <p style={{ margin: 0, fontSize: '1rem', lineHeight: 1.55 }}>
          {description ?? statusInfo.description}
        </p>

        {/* Transaction details */}
        <p style={{ marginTop: 18, fontSize: '0.9rem', color: 'rgba(148,163,184,0.88)' }}>
          {fallbackSummary}
        </p>

        {/* Error message if failed */}
        {currentEntry?.status === 'failed' && currentEntry.error && (
          <p
            style={{
              marginTop: 12,
              fontSize: '0.85rem',
              color: '#f87171',
              padding: '8px 12px',
              background: 'rgba(248, 113, 113, 0.1)',
              borderRadius: 8,
            }}
          >
            {currentEntry.error}
          </p>
        )}
      </div>
    </div>
  );
};

export default TransactionStatusOverlay;
