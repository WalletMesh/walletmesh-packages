import { useMemo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAztecProvingStatus } from '../hooks/useAztecProvingStatus.js';
import { isBrowser } from '../utils/ssr-walletmesh.js';
import styles from './AztecProvingOverlay.module.css';

export interface AztecProvingOverlayProps {
  /** Override the headline text (defaults to "Generating Aztec proof"). */
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
}

const DEFAULT_HEADLINE = 'Generating Aztec proof…';
const DEFAULT_DESCRIPTION = 'Proof generation can take a minute or two. Please keep this tab open until it completes.';

function shorten(hash: string): string {
  if (hash.length <= 12) {
    return hash;
  }
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}

/**
 * Full-screen overlay presented while the Aztec wallet is generating proofs.
 *
 * Automatically attaches a navigation guard (unless opted out) to prevent users from
 * unintentionally closing the tab while proving is underway.
 *
 * @public
 */
export function AztecProvingOverlay({
  headline = DEFAULT_HEADLINE,
  description = DEFAULT_DESCRIPTION,
  disableNavigationGuard = false,
  container,
}: AztecProvingOverlayProps): React.ReactPortal | null {
  const { shouldShowOverlay, activeEntries, activeCount } = useAztecProvingStatus();
  const [target, setTarget] = useState<Element | null>(null);

  useEffect(() => {
    if (!isBrowser) return;
    if (container) {
      setTarget(container);
    } else {
      setTarget(document.body);
    }
  }, [container]);

  useEffect(() => {
    if (!shouldShowOverlay || disableNavigationGuard || !isBrowser) {
      return;
    }

    const message = 'Aztec proof generation is still in progress.';
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

  const statusLabel = useMemo(() => {
    if (activeCount > 1) {
      return `Processing ${activeCount} transactions`;
    }
    const entry = activeEntries[0];
    if (entry?.txHash) {
      return `Transaction ${shorten(entry.txHash)}`;
    }
    return 'Transaction is proving';
  }, [activeCount, activeEntries]);

  if (!shouldShowOverlay || !isBrowser || !target) {
    return null;
  }

  const txHashes = activeEntries
    .map((entry) => entry.txHash)
    .filter((hash): hash is string => Boolean(hash));

  return createPortal(
    <div className={styles['overlay']} role="alert" aria-live="assertive">
      <div className={styles['content']}>
        <div className={styles['spinner']} aria-hidden="true" />
        <h2 className={styles['headline']}>{headline}</h2>
        <p className={styles['description']}>{description}</p>
        <p className={styles['status']}>{statusLabel}</p>
        {txHashes.length > 0 && (
          <ul className={styles['statusList']} aria-label="Transactions currently proving">
            {txHashes.map((hash) => (
              <li key={hash} className={styles['statusItem']}>
                {shorten(hash)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>,
    target,
  );
}
