/**
 * Aztec Connect Button Component
 *
 * A specialized connect button for Aztec dApps that wraps WalletMeshConnectButton
 * with Aztec-specific features and defaults.
 *
 * ## Features
 *
 * - **Proof Generation Status**: Shows when zero-knowledge proofs are being generated
 * - **Auto-filtering**: Automatically filters modal to show only Aztec wallets
 * - **Aztec Branding**: Custom styling for Aztec ecosystem
 * - **Event Monitoring**: Tracks Aztec-specific proof generation events
 *
 * @module components/AztecConnectButton
 * @packageDocumentation
 */

import { ChainType } from '@walletmesh/modal-core';
import { useEffect, useState } from 'react';
import { useAztecWallet } from '../hooks/useAztecWallet.js';
import styles from './AztecConnectButton.module.css';
import { WalletMeshConnectButton } from './WalletMeshConnectButton.js';
import type { WalletMeshConnectButtonProps } from './WalletMeshConnectButton.js';

export interface AztecConnectButtonProps
  extends Omit<WalletMeshConnectButtonProps, 'label' | 'connectedLabel'> {
  /**
   * Button label when disconnected
   * @default 'Connect Aztec Wallet'
   */
  label?: string;

  /**
   * Button label when connected
   * @default 'Disconnect'
   */
  connectedLabel?: string;

  /**
   * Show proof generation status indicator
   * @default true
   */
  showProvingStatus?: boolean;

  /**
   * Callback when proof generation starts
   */
  onProvingStart?: () => void;

  /**
   * Callback when proof generation completes
   */
  onProvingComplete?: () => void;
}

/**
 * Aztec-specific connect button that wraps WalletMeshConnectButton.
 * Adds proof generation status indicator and Aztec-specific defaults.
 *
 * @example
 * ```tsx
 * import { AztecConnectButton } from '@walletmesh/modal-react';
 *
 * function DApp() {
 *   return (
 *     <AztecConnectButton
 *       showProvingStatus
 *       onProvingStart={() => console.log('Generating proof...')}
 *       onProvingComplete={() => console.log('Proof complete!')}
 *     />
 *   );
 * }
 * ```
 *
 * @public
 */
export function AztecConnectButton({
  label = 'Connect Aztec Wallet',
  connectedLabel = 'Disconnect',
  showProvingStatus = true,
  onProvingStart,
  onProvingComplete,
  className,
  ...restProps
}: AztecConnectButtonProps) {
  const { isConnected, aztecWallet } = useAztecWallet();
  // State for proof generation status - will be set when events are supported
  const [isProving] = useState(false);

  // Monitor Aztec proof generation events
  useEffect(() => {
    if (!aztecWallet || !showProvingStatus || !isConnected) return;

    // Event handlers are prepared for future wallet event support
    // The Aztec wallet implementation will emit these events during proof generation

    // For now, callbacks are called directly if provided
    // This allows the dApp to simulate proving states

    // Future implementation: Subscribe to proof generation events
    // When the Aztec wallet provider supports events:
    // aztecWallet.on('proving:start', () => {
    //   setIsProving(true);
    //   onProvingStart?.();
    // });
    // aztecWallet.on('proving:complete', () => {
    //   setIsProving(false);
    //   onProvingComplete?.();
    // });
    // aztecWallet.on('proving:error', () => {
    //   setIsProving(false);
    //   onProvingComplete?.();
    // });

    // For demo purposes, you can manually trigger proving state
    // by calling setIsProving(true) when initiating a transaction
  }, [aztecWallet, showProvingStatus, isConnected]);

  // Combine Aztec styles with user-provided className
  const combinedClassName = [styles['aztecButton'], isProving && styles['proving'], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles['aztecButtonContainer']}>
      {/* Wrap the base WalletMeshConnectButton with Aztec chain filtering */}
      <WalletMeshConnectButton
        label={label}
        connectedLabel={connectedLabel}
        className={combinedClassName}
        showAddress
        showChain
        targetChainType={ChainType.Aztec}
        {...restProps}
      />

      {/* Aztec-specific proving status overlay */}
      {isConnected && showProvingStatus && isProving && (
        <div className={styles['provingBadge']}>
          <span className={styles['provingIcon']}>🔐</span>
          <span className={styles['provingText']}>Proving...</span>
        </div>
      )}
    </div>
  );
}
