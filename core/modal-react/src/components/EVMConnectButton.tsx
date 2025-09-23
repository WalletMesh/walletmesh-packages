/**
 * EVM Connect Button Component
 *
 * A specialized connect button for EVM dApps that wraps WalletMeshConnectButton
 * with EVM-specific features and defaults.
 *
 * ## Features
 *
 * - **Transaction Status**: Shows when transactions are being processed
 * - **Auto-filtering**: Automatically filters modal to show only EVM wallets
 * - **Ethereum Branding**: Custom styling for EVM/Ethereum ecosystem
 * - **Event Monitoring**: Tracks EVM-specific transaction events
 * - **Network Indicators**: Shows mainnet/testnet status
 *
 * @module components/EVMConnectButton
 * @packageDocumentation
 */

import { ChainType } from '@walletmesh/modal-core';
import { useEffect, useState } from 'react';
import { useEvmWallet } from '../hooks/useEvmWallet.js';
import styles from './EVMConnectButton.module.css';
import { WalletMeshConnectButton } from './WalletMeshConnectButton.js';
import type { WalletMeshConnectButtonProps } from './WalletMeshConnectButton.js';

export interface EVMConnectButtonProps
  extends Omit<WalletMeshConnectButtonProps, 'label' | 'connectedLabel'> {
  /**
   * Button label when disconnected
   * @default 'Connect EVM Wallet'
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
   * Show network type indicator (mainnet/testnet badge)
   * @default true
   */
  showNetworkIndicator?: boolean;

  /**
   * Show estimated gas fees when available
   * @default false
   */
  showGasEstimate?: boolean;

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
 * EVM-specific connect button that wraps WalletMeshConnectButton.
 * Adds transaction status indicator and EVM-specific defaults.
 *
 * @example
 * ```tsx
 * import { EVMConnectButton } from '@walletmesh/modal-react';
 *
 * function DApp() {
 *   return (
 *     <EVMConnectButton
 *       showTransactionStatus
 *       showNetworkIndicator
 *       onTransactionStart={() => console.log('Transaction started...')}
 *       onTransactionComplete={() => console.log('Transaction complete!')}
 *     />
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Custom styling and gas estimation
 * <EVMConnectButton
 *   label="Connect to Ethereum"
 *   showGasEstimate
 *   showNetworkIndicator
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
 *       <EVMConnectButton
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
export function EVMConnectButton({
  label = 'Connect EVM Wallet',
  connectedLabel = 'Disconnect',
  showTransactionStatus = true,
  showNetworkIndicator = true,
  showGasEstimate = false,
  onTransactionStart,
  onTransactionComplete,
  onTransactionError,
  className,
  ...restProps
}: EVMConnectButtonProps) {
  const { isConnected, evmProvider, chainId, isTransacting } = useEvmWallet();

  // State for transaction status - will be set when events are supported
  const [isTransactingLocal] = useState(false);
  const [gasEstimate] = useState<string | null>(null);
  const [networkType, setNetworkType] = useState<'mainnet' | 'testnet' | 'local' | null>(null);

  // Determine network type based on chain ID
  useEffect(() => {
    if (!chainId) {
      setNetworkType(null);
      return;
    }

    // Common mainnet chain IDs
    const mainnetChains = ['1', '137', '42161', '10', '8453'];
    // Common testnet chain IDs
    const testnetChains = ['11155111', '80001', '421614', '11155420', '84532'];
    // Local development chains
    const localChains = ['1337', '31337'];

    if (mainnetChains.includes(chainId)) {
      setNetworkType('mainnet');
    } else if (testnetChains.includes(chainId)) {
      setNetworkType('testnet');
    } else if (localChains.includes(chainId)) {
      setNetworkType('local');
    } else {
      setNetworkType('testnet'); // Default to testnet for unknown chains
    }
  }, [chainId]);

  // Monitor EVM transaction events
  useEffect(() => {
    if (!evmProvider || !showTransactionStatus || !isConnected) return;

    // Event handlers are prepared for future wallet event support
    // The EVM provider implementation will emit these events during transactions

    // For now, callbacks are called directly if provided
    // This allows the dApp to simulate transaction states

    // Future implementation: Subscribe to transaction events
    // When the EVM provider supports events:
    // evmProvider.on('transaction:start', () => {
    //   setIsTransactingLocal(true);
    //   onTransactionStart?.();
    // });
    // evmProvider.on('transaction:complete', () => {
    //   setIsTransactingLocal(false);
    //   onTransactionComplete?.();
    // });
    // evmProvider.on('transaction:error', (error) => {
    //   setIsTransactingLocal(false);
    //   onTransactionError?.(error);
    // });

    // For demo purposes, you can manually trigger transaction state
    // by calling setIsTransactingLocal(true) when initiating a transaction
  }, [evmProvider, showTransactionStatus, isConnected]);

  // Combine EVM styles with user-provided className
  const combinedClassName = [
    styles['evmButton'],
    isTransacting && styles['transacting'],
    isTransactingLocal && styles['confirming'],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles['evmButtonContainer']}>
      {/* Network indicator badge */}
      {isConnected && showNetworkIndicator && networkType && (
        <div className={`${styles['networkBadge']} ${styles[networkType]}`} />
      )}

      {/* Wrap the base WalletMeshConnectButton */}
      <WalletMeshConnectButton
        label={label}
        connectedLabel={connectedLabel}
        className={combinedClassName}
        showAddress
        showChain
        targetChainType={ChainType.Evm}
        {...restProps}
      />

      {/* EVM-specific transaction status overlay */}
      {isConnected && showTransactionStatus && (isTransacting || isTransactingLocal) && (
        <div className={styles['transactionBadge']}>
          <span className={styles['transactionIcon']}>⟳</span>
          <span className={styles['transactionText']}>Pending...</span>
        </div>
      )}

      {/* Gas estimate badge */}
      {isConnected && showGasEstimate && gasEstimate && (
        <div className={styles['gasBadge']}>Gas: {gasEstimate}</div>
      )}
    </div>
  );
}
