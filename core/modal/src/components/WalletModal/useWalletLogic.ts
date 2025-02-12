import { useCallback, useEffect, useReducer, useState } from 'react';
import { ConnectionStatus, type WalletInfo, type ConnectedWallet } from '../../types.js';
import { ConnectionManager } from '../../lib/connection/ConnectionManager.js';
import { handleWalletError } from '../../lib/errors.js';
import { toast } from 'react-hot-toast';

type WalletState = {
  status: ConnectionStatus;
  wallet: ConnectedWallet | null;
  error: Error | null;
};

type WalletAction =
  | { type: 'START_CONNECTING' }
  | { type: 'CONNECTION_SUCCESSFUL'; wallet: ConnectedWallet }
  | { type: 'CONNECTION_FAILED'; error: Error }
  | { type: 'START_DISCONNECTING' }
  | { type: 'DISCONNECTION_SUCCESSFUL' }
  | { type: 'DISCONNECTION_FAILED'; error: Error }
  | { type: 'START_RESUMING' }
  | { type: 'RESUME_SUCCESSFUL'; wallet: ConnectedWallet }
  | { type: 'RESUME_FAILED'; error: Error };

const initialWalletState: WalletState = {
  status: ConnectionStatus.Idle,
  wallet: null,
  error: null,
};

const walletReducer = (state: WalletState, action: WalletAction): WalletState => {
  switch (action.type) {
    case 'START_CONNECTING':
      return {
        ...state,
        status: ConnectionStatus.Connecting,
        error: null,
      };
    case 'CONNECTION_SUCCESSFUL':
      return {
        status: ConnectionStatus.Connected,
        wallet: action.wallet,
        error: null,
      };
    case 'CONNECTION_FAILED':
      return {
        ...state,
        status: ConnectionStatus.Idle,
        error: action.error,
      };
    case 'START_DISCONNECTING':
      return {
        ...state,
        status: ConnectionStatus.Disconnecting,
        error: null,
      };
    case 'DISCONNECTION_SUCCESSFUL':
      return {
        status: ConnectionStatus.Idle,
        wallet: null,
        error: null,
      };
    case 'DISCONNECTION_FAILED':
      return {
        ...state,
        status: ConnectionStatus.Idle,
        error: action.error,
      };
    case 'START_RESUMING':
      return {
        ...state,
        status: ConnectionStatus.Resuming,
        error: null,
      };
    case 'RESUME_SUCCESSFUL':
      return {
        status: ConnectionStatus.Connected,
        wallet: action.wallet,
        error: null,
      };
    case 'RESUME_FAILED':
      return {
        status: ConnectionStatus.Idle,
        wallet: null,
        error: action.error,
      };
    default:
      return state;
  }
};

export const useWalletLogic = () => {
  const [manager] = useState(() => new ConnectionManager());
  const [walletState, dispatch] = useReducer(walletReducer, initialWalletState);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const storedSession = manager.getStoredSession();
    if (storedSession) {
      dispatch({ type: 'START_RESUMING' });
      
      manager.resumeConnection(storedSession)
        .then((wallet) => {
          dispatch({ type: 'RESUME_SUCCESSFUL', wallet });
        })
        .catch((err) => {
          const error = handleWalletError(err, 'resume session');
          toast.error(error.message);
          dispatch({ type: 'RESUME_FAILED', error });
          setIsModalOpen(true);
        });
    }

    return () => {
      manager.cleanup();
    };
  }, [manager]);

  const connectWallet = useCallback(async (wallet: WalletInfo) => {
    dispatch({ type: 'START_CONNECTING' });
    try {
      const connected = await manager.connectWallet(wallet);
      dispatch({ type: 'CONNECTION_SUCCESSFUL', wallet: connected });
      setIsModalOpen(false);
    } catch (err) {
      const error = handleWalletError(err, 'connect wallet');
      toast.error(error.message);
      dispatch({ type: 'CONNECTION_FAILED', error });
    }
  }, [manager]);

  const disconnectWallet = useCallback(async () => {
    if (!walletState.wallet) return;

    dispatch({ type: 'START_DISCONNECTING' });
    try {
      await manager.disconnectWallet(walletState.wallet.info.id);
      dispatch({ type: 'DISCONNECTION_SUCCESSFUL' });
    } catch (err) {
      const error = handleWalletError(err, 'disconnect wallet');
      toast.error(error.message);
      dispatch({ type: 'DISCONNECTION_FAILED', error });
    }
  }, [manager, walletState.wallet]);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  return {
    connectionStatus: walletState.status,
    connectedWallet: walletState.wallet,
    connectWallet,
    disconnectWallet,
    isModalOpen,
    openModal,
    closeModal,
  };
};
