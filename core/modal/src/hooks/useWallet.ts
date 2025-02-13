import { useCallback, useEffect, useRef, useState } from 'react';
import type { WalletInfo, ConnectedWallet } from '../types.js';
import { ConnectionManager } from '../lib/connection/ConnectionManager.js';
import { WalletError } from '../lib/client/types.js';
import { toast } from 'react-hot-toast';
import { ConnectionStatus } from '../types.js';

interface UseWalletOptions {
  onError?: ((error: Error) => void) | undefined;
}

interface WalletState {
  status: ConnectionStatus;
  wallet: ConnectedWallet | null;
}

export const useWallet = ({ onError }: UseWalletOptions = {}) => {
  const connectionManager = useRef(new ConnectionManager());
  const [state, setState] = useState<WalletState>(() => connectionManager.current.getState());

  useEffect(() => {
    // Try to restore session on mount
    const storedSession = connectionManager.current.getStoredSession();
    if (storedSession) {
      setState((prev) => ({ ...prev, status: ConnectionStatus.Resuming }));
      connectionManager.current
        .resumeConnection(storedSession)
        .then((_wallet) => {
          setState(connectionManager.current.getState());
        })
        .catch((error) => {
          const walletError =
            error instanceof WalletError
              ? error
              : new WalletError(
                  'Failed to resume session',
                  'client',
                  error instanceof Error ? error : undefined,
                );
          toast.error(walletError.message);
          onError?.(walletError);
          setState({
            status: ConnectionStatus.Idle,
            wallet: null,
          });
        });
    }

    return () => {
      connectionManager.current.cleanup();
    };
  }, [onError]);

  const connectWallet = useCallback(
    async (wallet: WalletInfo) => {
      setState((prev) => ({ ...prev, status: ConnectionStatus.Connecting }));

      try {
        const connected = await connectionManager.current.connectWallet(wallet);
        setState(connectionManager.current.getState());
        return connected;
      } catch (error) {
        const walletError =
          error instanceof WalletError
            ? error
            : new WalletError(
                'Failed to connect wallet',
                'client',
                error instanceof Error ? error : undefined,
              );
        toast.error(walletError.message);
        onError?.(walletError);
        setState({
          status: ConnectionStatus.Idle,
          wallet: null,
        });
        throw walletError;
      }
    },
    [onError],
  );

  const disconnectWallet = useCallback(async () => {
    if (!state.wallet) return;

    setState((prev) => ({ ...prev, status: ConnectionStatus.Disconnecting }));

    try {
      await connectionManager.current.disconnectWallet(state.wallet.info.id);
      setState(connectionManager.current.getState());
    } catch (error) {
      const walletError =
        error instanceof WalletError
          ? error
          : new WalletError(
              'Failed to disconnect wallet',
              'client',
              error instanceof Error ? error : undefined,
            );
      toast.error(walletError.message);
      onError?.(walletError);
      setState((prev) => ({ ...prev, status: ConnectionStatus.Idle }));
      throw walletError;
    }
  }, [state.wallet, onError]);

  const getProvider = useCallback(async (walletId: string) => {
    try {
      return await connectionManager.current.getProvider(walletId);
    } catch (error) {
      const walletError =
        error instanceof WalletError
          ? error
          : new WalletError(
              'Failed to get provider',
              'client',
              error instanceof Error ? error : undefined,
            );
      onError?.(walletError);
      throw walletError;
    }
  }, [onError]);

  return {
    connectionStatus: state.status,
    connectedWallet: state.wallet,
    connectWallet,
    disconnectWallet,
    getProvider,
  };
};
