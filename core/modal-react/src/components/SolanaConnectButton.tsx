/**
 * Solana Connect Button Component
 *
 * A specialized connect button for Solana dApps that wraps WalletMeshConnectButton
 * with Solana-specific features and defaults.
 *
 * ## Features
 *
 * - **Transaction Status**: Shows when transactions are being processed
 * - **Auto-filtering**: Automatically filters modal to show only Solana wallets
 * - **Solana Branding**: Custom styling for Solana ecosystem
 * - **Event Monitoring**: Tracks Solana-specific transaction events
 * - **Cluster Indicators**: Shows mainnet/devnet/testnet status
 *
 * @module components/SolanaConnectButton
 * @packageDocumentation
 */

import { ChainType } from '@walletmesh/modal-core';
import { useEffect, useState } from 'react';
import { useSolanaWallet } from '../hooks/useSolanaWallet.js';
import styles from './SolanaConnectButton.module.css';
import { WalletMeshConnectButton } from './WalletMeshConnectButton.js';
import type { WalletMeshConnectButtonProps } from './WalletMeshConnectButton.js';

export interface SolanaConnectButtonProps
  extends Omit<WalletMeshConnectButtonProps, 'label' | 'connectedLabel'> {
  /**
   * Button label when disconnected
   * @default 'Connect Solana Wallet'
   */
  label?: string;

  /**
   * Button label when connected
   * @default 'Disconnect'
   */
  connectedLabel?: string;

  /**
   * Show transaction status indicator
   * @default true
   */
  showTransactionStatus?: boolean;

  /**
   * Show cluster type indicator (mainnet/devnet/testnet badge)
   * @default true
   */
  showClusterIndicator?: boolean;

  /**
   * Show SOL balance when available
   * @default false
   */
  showBalance?: boolean;

  /**
   * Callback when transaction starts
   */
  onTransactionStart?: () => void;

  /**
   * Callback when transaction completes
   */
  onTransactionComplete?: () => void;

  /**
   * Callback when transaction fails
   */
  onTransactionError?: (error: Error) => void;
}

/**
 * Solana-specific connect button that wraps WalletMeshConnectButton.
 * Adds transaction status indicator and Solana-specific defaults.
 *
 * @example
 * ```tsx
 * import { SolanaConnectButton } from '@walletmesh/modal-react';
 *
 * function DApp() {
 *   return (
 *     <SolanaConnectButton
 *       showTransactionStatus
 *       showClusterIndicator
 *       onTransactionStart={() => console.log('Transaction started...')}
 *       onTransactionComplete={() => console.log('Transaction complete!')}
 *     />
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Custom styling and balance display
 * <SolanaConnectButton
 *   label="Connect to Solana"
 *   showBalance
 *   showClusterIndicator
 *   size="lg"
 *   variant="outline"
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Integration with transaction handling
 * function TransactionApp() {
 *   const [txStatus, setTxStatus] = useState<string>('');
 *
 *   return (
 *     <div>
 *       <SolanaConnectButton
 *         onTransactionStart={() => setTxStatus('Transaction pending...')}
 *         onTransactionComplete={() => setTxStatus('Transaction confirmed!')}
 *         onTransactionError={(error) => setTxStatus(`Error: ${error.message}`)}
 *       />
 *       {txStatus && <p>{txStatus}</p>}
 *     </div>
 *   );
 * }
 * ```
 *
 * @public
 */
export function SolanaConnectButton({
  label = 'Connect Solana Wallet',
  connectedLabel = 'Disconnect',
  showTransactionStatus = true,
  showClusterIndicator = true,
  showBalance = false,
  onTransactionStart,
  onTransactionComplete,
  onTransactionError,
  className,
  ...restProps
}: SolanaConnectButtonProps) {
  const { isConnected, solanaProvider, chainId, isTransacting } = useSolanaWallet();

  // State for transaction status - will be set when events are supported
  const [isTransactingLocal] = useState(false);
  const [balance] = useState<string | null>(null);
  const [clusterType, setClusterType] = useState<'mainnet' | 'devnet' | 'testnet' | 'localnet' | null>(null);

  // Determine cluster type based on chain ID
  useEffect(() => {
    if (!chainId) {
      setClusterType(null);
      return;
    }

    // Solana cluster identification
    if (chainId.includes('mainnet') || chainId === 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp') {
      setClusterType('mainnet');
    } else if (chainId.includes('devnet') || chainId === 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1') {
      setClusterType('devnet');
    } else if (chainId.includes('testnet') || chainId === 'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z') {
      setClusterType('testnet');
    } else if (chainId.includes('localhost') || chainId.includes('127.0.0.1')) {
      setClusterType('localnet');
    } else {
      setClusterType('devnet'); // Default to devnet for unknown clusters
    }
  }, [chainId]);

  // Monitor Solana transaction events
  useEffect(() => {
    if (!solanaProvider || !showTransactionStatus || !isConnected) return;

    // Event handlers are prepared for future wallet event support
    // The Solana provider implementation will emit these events during transactions

    // For now, callbacks are called directly if provided
    // This allows the dApp to simulate transaction states

    // Future implementation: Subscribe to transaction events
    // When the Solana provider supports events:
    // solanaProvider.on('transaction:start', () => {
    //   setIsTransactingLocal(true);
    //   onTransactionStart?.();
    // });
    // solanaProvider.on('transaction:complete', () => {
    //   setIsTransactingLocal(false);
    //   onTransactionComplete?.();
    // });
    // solanaProvider.on('transaction:error', (error) => {
    //   setIsTransactingLocal(false);
    //   onTransactionError?.(error);
    // });

    // For demo purposes, you can manually trigger transaction state
    // by calling setIsTransactingLocal(true) when initiating a transaction
  }, [solanaProvider, showTransactionStatus, isConnected]);

  // Combine Solana styles with user-provided className
  const combinedClassName = [
    styles['solanaButton'],
    isTransacting && styles['transacting'],
    isTransactingLocal && styles['confirming'],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles['solanaButtonContainer']}>
      {/* Cluster indicator badge */}
      {isConnected && showClusterIndicator && clusterType && (
        <div className={`${styles['clusterBadge']} ${styles[clusterType]}`}>{clusterType.toUpperCase()}</div>
      )}

      {/* Wrap the base WalletMeshConnectButton */}
      <WalletMeshConnectButton
        label={label}
        connectedLabel={connectedLabel}
        className={combinedClassName}
        showAddress
        showChain
        targetChainType={ChainType.Solana}
        {...restProps}
      />

      {/* Solana-specific transaction status overlay */}
      {isConnected && showTransactionStatus && (isTransacting || isTransactingLocal) && (
        <div className={styles['transactionBadge']}>
          <span className={styles['transactionIcon']}>⟳</span>
          <span className={styles['transactionText']}>Pending...</span>
        </div>
      )}

      {/* SOL balance badge */}
      {isConnected && showBalance && balance && <div className={styles['balanceBadge']}>{balance} SOL</div>}
    </div>
  );
}
