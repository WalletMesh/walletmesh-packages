import { useCallback, useEffect, useState } from 'react';
import { ConnectionStatus, type WalletInfo, type DappInfo } from '../types.js';
import type { TimeoutConfig } from '../lib/utils/timeout.js';
import { ConnectionManager } from '../lib/connection/ConnectionManager.js';
import { handleWalletError } from '../lib/errors/errors.js';
import { toast } from 'react-hot-toast';
import { useWalletStore } from '../store/walletStore.js';

/**
 * Configuration options for wallet disconnection.
 *
 * @property {boolean} [removeSession] - Whether to remove the stored session
 *   after disconnecting. If false, the session can be restored later.
 */
export interface DisconnectOptions {
  removeSession?: boolean;
}

/**
 * Configuration options for the useWallet hook.
 *
 * @property {DappInfo} dappInfo - Information about the dApp to share with wallets
 * @property {TimeoutConfig} [timeoutConfig] - Optional configuration for operation timeouts
 */
export interface UseWalletOptions {
  dappInfo: DappInfo;
  timeoutConfig?: TimeoutConfig;
}

/**
 * React hook for managing wallet connections and state.
 *
 * Provides functionality for:
 * - Connecting/disconnecting wallets
 * - Managing connection state
 * - Handling wallet modal visibility
 * - Session persistence and restoration
 */
export const useWallet = ({ dappInfo, timeoutConfig }: UseWalletOptions) => {
  const [manager] = useState(() => new ConnectionManager(dappInfo, timeoutConfig));
  const { status, wallet, connectWallet, disconnectWallet, setStatus, setError } = useWalletStore();
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [isConnectedModalOpen, setIsConnectedModalOpen] = useState(false);

  // Single initialization effect
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    console.log('[WalletLogic] Component mounted, starting initialization');

    // Initialize in an IIFE to avoid useEffect async issues
    (async () => {
      try {
        if (!isMounted) return;
        setStatus(ConnectionStatus.Resuming);

        const restored = await Promise.race([
          manager.initialize(),
          new Promise<null>((_, reject) => {
            abortController.signal.addEventListener('abort', () => {
              reject(new Error('Initialization aborted'));
            });
          }),
        ]);

        if (!isMounted) return;

        if (restored) {
          console.log('[WalletLogic] Session restored:', {
            id: restored.info.id,
            address: restored.state.address,
          });
          connectWallet(restored);
        } else {
          console.log('[WalletLogic] No session to restore');
          setStatus(ConnectionStatus.Idle);
        }
      } catch (err) {
        // Only handle error if not aborted and still mounted
        if (err instanceof Error && err.message === 'Initialization aborted') {
          console.log('[WalletLogic] Initialization aborted');
          return;
        }

        if (!isMounted) return;

        const error = handleWalletError(err, 'initialization');
        console.error('[WalletLogic] Initialization failed:', error);
        setError(error);
      }
    })();

    return () => {
      console.log('[WalletLogic] Component unmounting, cleaning up...');
      isMounted = false;
      abortController.abort();
    };
  }, [manager, connectWallet, setStatus, setError]);

  const handleConnectWallet = useCallback(
    async (walletInfo: WalletInfo) => {
      setStatus(ConnectionStatus.Connecting);
      try {
        const connected = await manager.connectWallet(walletInfo);
        connectWallet(connected);
        setIsSelectModalOpen(false);
      } catch (err) {
        const error = handleWalletError(err, 'connect wallet');
        toast.error(error.message);
        setError(error);
      }
    },
    [manager, connectWallet, setStatus, setError],
  );

  const handleDisconnectWallet = useCallback(
    async (options: DisconnectOptions = { removeSession: true }) => {
      if (!wallet) return;

      setStatus(ConnectionStatus.Disconnecting);
      try {
        await manager.disconnectWallet(wallet.info.id, options);
      } catch (err) {
        const error = handleWalletError(err, 'disconnect wallet');
        toast.error(error.message);
        setError(error);
        return;
      }
      // Always disconnect wallet, even if there was an error
      disconnectWallet();
    },
    [manager, wallet, disconnectWallet, setStatus, setError],
  );

  const openSelectModal = useCallback(() => {
    console.log('[WalletLogic] Opening select modal');
    setIsSelectModalOpen(true);
  }, []);

  const closeSelectModal = useCallback(() => {
    console.log('[WalletLogic] Closing select modal');
    setIsSelectModalOpen(false);
  }, []);

  const openConnectedModal = useCallback(() => {
    console.log('[WalletLogic] Opening connected modal');
    setIsConnectedModalOpen(true);
  }, []);

  const closeConnectedModal = useCallback(() => {
    console.log('[WalletLogic] Closing connected modal');
    setIsConnectedModalOpen(false);
  }, []);

  return {
    connectionStatus: status,
    connectedWallet: wallet,
    connectWallet: handleConnectWallet,
    disconnectWallet: handleDisconnectWallet,
    // Select modal state
    isSelectModalOpen,
    openSelectModal,
    closeSelectModal,
    // Connected modal state
    isConnectedModalOpen,
    openConnectedModal,
    closeConnectedModal,
  };
};
