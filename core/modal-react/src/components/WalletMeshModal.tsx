/**
 * WalletMesh Modal Component
 *
 * This module provides the main modal UI component for wallet selection and connection.
 * It renders a responsive, accessible modal interface using React Portal and CSS modules.
 *
 * ## Features
 *
 * - **Auto-injection**: Automatically rendered by WalletMeshProvider
 * - **Portal rendering**: Renders into document.body for proper z-index layering
 * - **Responsive design**: Adapts to different screen sizes
 * - **Keyboard navigation**: Full keyboard support with Escape to close
 * - **Connection states**: Different views for connecting, connected, and error states
 * - **Accessible**: ARIA attributes and focus management
 *
 * ## State Management
 *
 * The modal derives its state from the WalletMesh store and uses hooks to:
 * - Track connection status via `useAccount`
 * - Handle wallet selection via `useConnect`
 * - Manage disconnection via `useConnect`
 * - Control modal visibility via `useConfig`
 *
 * @module components/WalletMeshModal
 * @packageDocumentation
 */

import { formatError, getRecoveryMessage } from '@walletmesh/modal-core';
import type { ChainType, ChainConfig } from '@walletmesh/modal-core';
// Import built-in chain configs for targetChainType mapping
import { ethereumMainnet, solanaMainnet, aztecSandbox } from '@walletmesh/modal-core/chains';
import { useCallback, useEffect, useId, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../hooks/internal/useStore.js';
import { useAccount } from '../hooks/useAccount.js';
import { useConfig } from '../hooks/useConfig.js';
import { useConnect } from '../hooks/useConnect.js';
import { createComponentLogger } from '../utils/logger.js';
import { isBrowser } from '../utils/ssr-walletmesh.js';
import styles from './WalletMeshModal.module.css';
import { WalletMeshSandboxedWalletIcon } from './WalletMeshSandboxedIcon.js';

/**
 * WalletMesh Modal Component
 *
 * React-owned modal that renders UI based on headless state from modal-core.
 * Uses React Portal to render into document.body and provides a complete
 * wallet selection and connection interface.
 *
 * This component is automatically injected by WalletMeshProvider unless
 * `autoInjectModal` is set to false in the provider configuration.
 *
 * ## Component Architecture
 *
 * The modal component follows a state-driven rendering approach:
 * 1. **Wallet Selection View**: Default view showing available wallets
 * 2. **Connecting View**: Loading state with spinner during connection
 * 3. **Connected View**: Success state with disconnect option
 * 4. **Error View**: Error state with retry options
 *
 * ## Accessibility Features
 *
 * - Keyboard navigation (Tab, Enter, Escape)
 * - ARIA attributes for screen readers
 * - Focus trap within modal
 * - Click-outside and Escape key to close
 *
 * ## Styling
 *
 * Uses CSS modules for scoped styling with customizable CSS variables:
 * - `--wm-modal-bg`: Background overlay color
 * - `--wm-modal-content-bg`: Content background
 * - `--wm-modal-border-radius`: Border radius
 * - `--wm-modal-max-width`: Maximum modal width
 *
 * @returns React component for wallet selection modal
 *
 * @example
 * ```tsx
 * // Usually auto-injected, but can be used manually:
 * import { WalletMeshModal } from '@walletmesh/modal-react';
 *
 * function App() {
 *   return (
 *     <WalletMeshProvider config={{ autoInjectModal: false }}>
 *       <YourApp />
 *       <WalletMeshModal />
 *     </WalletMeshProvider>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With custom styling via CSS variables
 * function ThemedApp() {
 *   return (
 *     <div style={{
 *       '--wm-modal-bg': 'rgba(0, 0, 0, 0.8)',
 *       '--wm-modal-content-bg': '#1a1a1a',
 *       '--wm-modal-border-radius': '16px'
 *     }}>
 *       <WalletMeshProvider>
 *         <App />
 *       </WalletMeshProvider>
 *     </div>
 *   );
 * }
 * ```
 *
 * @public
 */

export function WalletMeshModal(): React.ReactElement | null {
  const titleId = useId();
  const logger = createComponentLogger('WalletMeshModal');
  const { isOpen, close } = useConfig();
  const { isConnected, isConnecting, wallet, walletId, addresses } = useAccount();
  const { connect, wallets, error, reset, disconnect } = useConnect();

  // Memoize connectedWallets to avoid recalculation on every render
  const connectedWallets = useMemo(
    () => (addresses.length > 0 ? [{ id: wallet?.id || '', addresses }] : []),
    [addresses, wallet?.id],
  );

  // Read UI state directly from store (internal component usage)
  const targetChainType = useStore((state) => state.ui.targetChainType);
  const currentView = useStore((state) => state.ui.currentView);
  const switchingChainData = useStore((state) => state.ui.switchingChainData);
  const isDiscovering = useStore((state) => state.ui.loading?.discovery || false);
  const portalRootRef = useRef<HTMLDivElement | null>(null);

  // Memoize filtered wallets to avoid recalculation on every render
  const filteredWallets = useMemo(
    () => (targetChainType ? wallets.filter((wallet) => wallet.chains?.includes(targetChainType)) : wallets),
    [targetChainType, wallets],
  );

  // Debug logging for error state
  logger.debug('Current modal state:', {
    isOpen,
    isConnected,
    isConnecting,
    hasError: !!error,
    error: error,
    errorDetails: error ? formatError(error) : null,
    targetChainType,
  });

  /**
   * Convert targetChainType to a proper ChainConfig object for connection.
   *
   * This ensures the chain pre-selection works correctly by providing
   * a valid chain object with proper CAIP-2 chainId instead of a simple string.
   *
   * @internal
   */
  const targetChainConfig = useMemo((): ChainConfig | undefined => {
    if (!targetChainType) return undefined;

    // Map chain type to built-in config with proper CAIP-2 chainId
    // ChainConfig extends SupportedChain, so built-in configs work as ChainConfig
    switch (targetChainType) {
      case 'evm':
        return ethereumMainnet as ChainConfig; // eip155:1 (Ethereum Mainnet)
      case 'solana':
        return solanaMainnet as ChainConfig; // Solana Mainnet
      case 'aztec':
        return aztecSandbox as ChainConfig; // Aztec Sandbox
      default:
        // Unknown chain type, return best-effort config
        return {
          chainId: `${targetChainType}:1`,
          chainType: targetChainType as ChainType,
          name: targetChainType.charAt(0).toUpperCase() + targetChainType.slice(1),
          required: false,
        } as ChainConfig;
    }
  }, [targetChainType]);

  /**
   * Handle clicks on the modal overlay (outside content)
   * Closes the modal when clicking the dark background
   */
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        close();
      }
    },
    [close],
  );

  /**
   * Handle keyboard events on the modal
   * Provides keyboard accessibility (Escape to close)
   */
  const handleOverlayKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      }
    },
    [close],
  );

  /**
   * Handle wallet selection from the list
   * Initiates connection to the selected wallet
   *
   * @param walletId - ID of the wallet to connect to
   */
  const handleWalletSelect = useCallback(
    async (walletId: string) => {
      try {
        // Build connect options with proper chain object (not string chainId)
        const connectOptions = {
          showModal: false, // We're already in the modal
          // Pass the full chain config if targetChainType is set
          ...(targetChainConfig && { chain: targetChainConfig }),
        };

        // Always use the connect hook method which properly handles error state
        await connect(walletId, connectOptions);
        // Note: Don't close modal here - let modal controller handle the lifecycle
      } catch (error) {
        logger.error('Failed to connect wallet:', {
          error,
          errorType: typeof error,
          errorConstructor: error?.constructor?.name,
          message: error instanceof Error ? error.message : String(error),
          stringified: JSON.stringify(error, null, 2),
        });
        // The error should be displayed by the error state set by useConnect
        // Modal should stay open to show the error
      }
    },
    [connect, logger, targetChainConfig],
  );

  // Create and manage portal root
  useEffect(() => {
    if (!isBrowser) return;

    // Check if portal root already exists (e.g., from previous component instance)
    let portalRoot = document.getElementById('walletmesh-modal-portal') as HTMLDivElement | null;

    if (portalRoot) {
      // Reuse existing portal root
      logger.debug('Reusing existing portal root');
      portalRootRef.current = portalRoot;
    } else {
      // Create a dedicated portal root for the modal
      portalRoot = document.createElement('div');
      portalRoot.id = 'walletmesh-modal-portal';
      portalRoot.style.position = 'fixed';
      portalRoot.style.top = '0';
      portalRoot.style.left = '0';
      portalRoot.style.width = '100%';
      portalRoot.style.height = '100%';
      portalRoot.style.zIndex = '9999';
      portalRoot.style.pointerEvents = 'none'; // Initial state, will be updated by separate effect

      document.body.appendChild(portalRoot);
      portalRootRef.current = portalRoot;
      logger.debug('Created new portal root');
    }

    return () => {
      // Cleanup: remove portal root when component unmounts
      // Only remove if there are no other components using it
      if (portalRootRef.current?.parentNode) {
        // Check if this is the last component using this portal
        // by checking if the portal has any React-rendered content
        if (portalRootRef.current.childNodes.length === 0) {
          portalRootRef.current.parentNode.removeChild(portalRootRef.current);
          logger.debug('Removed portal root (no content)');
        } else {
          logger.debug('Portal root still has content, keeping it');
        }
      }
      portalRootRef.current = null;
    };
  }, [logger.debug]); // Only run once on mount/unmount

  // Update pointer events based on modal state
  useEffect(() => {
    if (portalRootRef.current) {
      portalRootRef.current.style.pointerEvents = isOpen ? 'auto' : 'none';
    }
  }, [isOpen]);

  // Don't render on server
  if (!isBrowser) {
    return null;
  }

  // If portal root is not ready, return null
  if (!portalRootRef.current) {
    return null;
  }

  // If modal is closed, render empty portal to maintain stability
  if (!isOpen) {
    return createPortal(null, portalRootRef.current);
  }

  /**
   * Render modal content based on current connection state
   * Returns different views for each state of the connection flow
   */
  const renderContent = () => {
    // Check for error state first - errors should take precedence
    if (error) {
      // Debug log the raw error
      logger.debug('Showing error view. Raw error object:', {
        error,
        errorType: typeof error,
        errorString: String(error),
        errorJSON: JSON.stringify(error, null, 2),
      });

      // Use the error formatter utility to properly handle all error types
      const formattedError = formatError(error);

      // Debug log the formatted error
      logger.debug('Formatted error:', formattedError);

      const errorMessage = formattedError.message;
      const errorCode = formattedError.code;
      const recoveryHint = formattedError.recoveryHint;
      const friendlyHint = recoveryHint ? getRecoveryMessage(recoveryHint) : null;

      return (
        <div className={styles['errorContainer']}>
          <div className={styles['errorIcon']}>⚠️</div>
          <h3 className={styles['errorTitle']}>Connection Failed</h3>
          <p className={styles['errorMessage']}>{errorMessage}</p>
          {friendlyHint && (
            <div className={styles['errorHint']}>
              <span className={styles['hintIcon']}>💡</span>
              <span>{friendlyHint}</span>
            </div>
          )}
          <div className={styles['errorActions']}>
            {(errorCode === 'USER_REJECTED' ||
              errorCode === 'WALLET_LOCKED' ||
              errorCode === 'CONNECTION_FAILED') && (
              <button
                type="button"
                onClick={() => {
                  logger.debug('Try Again clicked, resetting error');
                  // Clear error and go back to wallet selection
                  // This should be handled by modal controller
                  reset();
                }}
                className={styles['primaryButton']}
              >
                Try Again
              </button>
            )}
            <button type="button" onClick={close} className={styles['secondaryButton']}>
              Close
            </button>
          </div>
        </div>
      );
    }

    // Check for chain switching state
    if (currentView === 'switchingChain') {
      return (
        <div className={styles['switchingChainContainer']}>
          <div className={styles['chainSwitchSpinner']} />
          <h3 className={styles['switchingChainTitle']}>Switching Chain</h3>
          <div className={styles['chainTransition']}>
            {switchingChainData?.fromChain && (
              <div className={styles['chainInfo']}>
                <span className={styles['chainLabel']}>From:</span>
                <span className={styles['chainName']}>
                  {switchingChainData.fromChain.name || switchingChainData.fromChain.chainId}
                </span>
              </div>
            )}
            <div className={styles['chainArrow']}>→</div>
            {switchingChainData?.toChain && (
              <div className={styles['chainInfo']}>
                <span className={styles['chainLabel']}>To:</span>
                <span className={styles['chainName']}>
                  {switchingChainData.toChain.name || switchingChainData.toChain.chainId}
                </span>
              </div>
            )}
          </div>
          <p className={styles['switchingChainMessage']}>Please confirm the chain switch in your wallet...</p>
        </div>
      );
    }

    // Check for proving state (Aztec zero-knowledge proof generation)
    if (currentView === 'proving') {
      return (
        <div className={styles['provingContainer']}>
          <div className={styles['provingSpinner']} />
          <h3 className={styles['provingTitle']}>Generating Proof</h3>
          <p className={styles['provingMessage']}>
            Creating zero-knowledge proof... This may take 30-60 seconds.
          </p>
          <p className={styles['provingHint']}>Please keep this window open and do not refresh the page.</p>
        </div>
      );
    }

    // Show different views based on connection status
    if (isConnecting) {
      return (
        <div className={styles['connectingContainer']}>
          <div className={styles['spinner']} />
          <h3 className={styles['connectingTitle']}>Connecting</h3>
          <p className={styles['connectingMessage']}>Please confirm the connection in your wallet...</p>
        </div>
      );
    }

    if (isConnected) {
      return (
        <div className={styles['connectedContainer']}>
          <h3 className={styles['connectedTitle']}>Connected!</h3>
          {wallet && (
            <div className={styles['accountInfo']}>
              <div className={styles['accountLabel']}>Wallet</div>
              <div className={styles['accountValue']}>{wallet.name}</div>
            </div>
          )}
          <button
            type="button"
            onClick={async () => {
              logger.debug('Disconnect button clicked in modal');
              logger.debug('Current wallet:', wallet);
              logger.debug('Connected wallets:', connectedWallets);

              try {
                // Use multiple sources for wallet ID with priority order:
                // 1. walletId from useAccount (most reliable for rehydrated sessions)
                // 2. wallet?.id from useAccount
                // 3. connectedWallets fallback
                const walletIdToDisconnect = walletId || wallet?.id || connectedWallets[0]?.id;

                logger.debug('Disconnect sources:', {
                  fromUseAccountWalletId: walletId,
                  fromUseAccountWallet: wallet?.id,
                  fromConnectedWallets: connectedWallets[0]?.id,
                  finalWalletId: walletIdToDisconnect,
                });

                if (walletIdToDisconnect) {
                  await disconnect(walletIdToDisconnect);
                  logger.debug('Disconnect completed for wallet:', walletIdToDisconnect);
                  close(); // Close the modal after successful disconnect
                } else {
                  logger.error('No wallet ID found to disconnect from any source');
                  // Close modal anyway to prevent stuck state
                  close();
                }
              } catch (error) {
                logger.error('Disconnect failed in modal:', error);
                // Close modal on error to prevent stuck state
                close();
              }
            }}
            className={styles['disconnectButton']}
          >
            Disconnect
          </button>
        </div>
      );
    }

    // Default: wallet selection
    return (
      <div>
        <div className={styles['modalHeader']}>
          <h2 className={styles['modalTitle']} id={titleId}>
            Connect a wallet
          </h2>
          {isDiscovering && (
            <div className={styles['discoveryStatus']}>
              <span className={styles['discoverySpinner']} />
              <span className={styles['discoveryText']}>Scanning for wallets...</span>
            </div>
          )}
        </div>

        {filteredWallets.length === 0 ? (
          // Empty state when no wallets are found
          <div className={styles['emptyState']}>
            <div className={styles['emptyIcon']}>{isDiscovering ? '🔍' : '📦'}</div>
            <h3 className={styles['emptyTitle']}>
              {isDiscovering ? 'Searching for wallets...' : 'No wallets found'}
            </h3>
            <p className={styles['emptyMessage']}>
              {isDiscovering
                ? 'Please wait while we scan for available wallets...'
                : targetChainType
                  ? `No ${targetChainType.toUpperCase()} wallets detected. Please install a compatible wallet.`
                  : 'No wallets detected. Please install a wallet extension or use a wallet-enabled browser.'}
            </p>
            {!isDiscovering && (
              <div className={styles['emptyHint']}>
                <span className={styles['hintIcon']}>💡</span>
                <span>
                  {targetChainType === 'evm' && 'Try installing MetaMask or another EVM wallet'}
                  {targetChainType === 'solana' && 'Try installing Phantom or another Solana wallet'}
                  {targetChainType === 'aztec' && 'Try using the Aztec Sandbox wallet for development'}
                  {!targetChainType && 'Popular wallets include MetaMask, Phantom, and Coinbase Wallet'}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className={styles['walletList']}>
            {filteredWallets.map((wallet) => (
              <button
                key={wallet.id}
                type="button"
                onClick={() => {
                  console.debug('[WalletMeshModal] Wallet clicked', { walletId: wallet.id });
                  handleWalletSelect(wallet.id);
                }}
                className={styles['walletOption']}
              >
                {/* Use sandboxed icon with a generic fallback to ensure visibility */}
                <WalletMeshSandboxedWalletIcon
                  wallet={{
                    id: wallet.id,
                    name: wallet.name,
                    // Pass the icon as-is if it exists, or the fallback icon if empty
                    icon:
                      wallet.icon && wallet.icon.trim() !== ''
                        ? wallet.icon
                        : 'data:image/svg+xml;utf8,' +
                          encodeURIComponent(
                            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                              '<rect x="2" y="5" width="20" height="14" rx="2" ry="2" fill="#f3f4f6" stroke="#6b7280"/>' +
                              '<path d="M16 12h2" stroke="#6b7280"/>' +
                              '<circle cx="17.5" cy="12" r="1.5" fill="#6b7280"/>' +
                              '</svg>',
                          ),
                  }}
                  size={24}
                  className={styles['walletIcon'] as string}
                  fallbackIcon={
                    // Simple generic wallet glyph as data URI (visible, safe)
                    'data:image/svg+xml;utf8,' +
                    encodeURIComponent(
                      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                        '<rect x="2" y="5" width="20" height="14" rx="2" ry="2" fill="#f3f4f6" stroke="#6b7280"/>' +
                        '<path d="M16 12h2" stroke="#6b7280"/>' +
                        '<circle cx="17.5" cy="12" r="1.5" fill="#6b7280"/>' +
                        '</svg>',
                    )
                  }
                />
                <span className={styles['walletName']}>{wallet.name}</span>
              </button>
            ))}
          </div>
        )}

        <button type="button" onClick={close} className={styles['closeButton']}>
          Close
        </button>
      </div>
    );
  };

  // Create portal to render modal into our stable portal root
  // This ensures proper z-index layering and avoids parent styling conflicts
  return createPortal(
    <dialog
      className={styles['modal']}
      onClick={handleOverlayClick}
      onKeyDown={handleOverlayKeyDown}
      aria-labelledby={titleId}
      open
    >
      <div className={styles['modalContent']}>{renderContent()}</div>
    </dialog>,
    portalRootRef.current,
  );
}

// Add display name for React DevTools
WalletMeshModal.displayName = 'WalletMeshModal';
