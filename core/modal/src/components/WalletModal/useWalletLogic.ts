import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { ConnectionStatus, type WalletInfo, type ConnectedWallet } from '../../types.js';
import { WalletMeshClient } from '../../lib/client/WalletMeshClient.js';
import { createTransport } from '../../lib/transports/index.js';
import { createAdapter } from '../../lib/adapters/createAdapter.js';
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

const LOCAL_STORAGE_KEY = 'walletmesh_wallet_session';

export const useWalletLogic = () => {
  const [client] = useState(() => new WalletMeshClient());
  const [walletState, dispatch] = useReducer(walletReducer, initialWalletState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const connectionLock = useRef<AbortController | null>(null);

  useEffect(() => {
    const storedSession = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedSession) {
      const sessionData = JSON.parse(storedSession) as ConnectedWallet;
      dispatch({ type: 'START_RESUMING' });

      if (connectionLock.current) {
        connectionLock.current.abort();
      }
      connectionLock.current = new AbortController();
      const signal = connectionLock.current.signal;

      const transport = createTransport(sessionData.info.transport);
      const adapter = createAdapter(sessionData.info.adapter);
      const connectPromise = client.connectWallet(sessionData.info, transport, adapter);
      Promise.race([
        connectPromise,
        new Promise((_, reject) => {
          signal.addEventListener('abort', () => reject(new Error('Connection aborted')));
        }),
      ])
        .then((resumed) => {
          if (!signal.aborted) {
            dispatch({ type: 'RESUME_SUCCESSFUL', wallet: resumed as ConnectedWallet });
          }
        })
        .catch((err) => {
          if (!signal.aborted) {
            const error = handleWalletError(err, 'resume session');
            toast.error(error.message);
            dispatch({ type: 'RESUME_FAILED', error });
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            setIsModalOpen(true);
          }
        })
        .finally(() => {
          if (connectionLock.current?.signal === signal) {
            connectionLock.current = null;
          }
        });
    }

    return () => {
      if (connectionLock.current) {
        connectionLock.current.abort();
        connectionLock.current = null;
      }
    };
  }, [client]);

  useEffect(() => {
    if (walletState.wallet) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(walletState.wallet));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [walletState.wallet]);

  const connectWallet = useCallback(
    async (wallet: WalletInfo) => {
      if (connectionLock.current) {
        connectionLock.current.abort();
      }
      connectionLock.current = new AbortController();
      const signal = connectionLock.current.signal;

      dispatch({ type: 'START_CONNECTING' });
      try {
        const transport = createTransport(wallet.transport);
        const adapter = createAdapter(wallet.adapter);
        const connectPromise = client.connectWallet(wallet, transport, adapter);
        const connected = await Promise.race([
          connectPromise,
          new Promise<never>((_, reject) => {
            signal.addEventListener('abort', () => reject(new Error('Connection aborted')));
          }),
        ]);
        if (!signal.aborted) {
          dispatch({ type: 'CONNECTION_SUCCESSFUL', wallet: connected });
          setIsModalOpen(false);
        }
      } catch (err) {
        if (!signal.aborted) {
          const error = handleWalletError(err, 'connect wallet');
          toast.error(error.message);
          dispatch({ type: 'CONNECTION_FAILED', error });
        }
      } finally {
        if (connectionLock.current?.signal === signal) {
          connectionLock.current = null;
        }
      }
    },
    [client],
  );

  const disconnectWallet = useCallback(async () => {
    if (connectionLock.current) {
      connectionLock.current.abort();
      connectionLock.current = null;
    }
    if (!walletState.wallet) return;

    dispatch({ type: 'START_DISCONNECTING' });
    try {
      await client.disconnectWallet(walletState.wallet.info.id);
      dispatch({ type: 'DISCONNECTION_SUCCESSFUL' });
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (err) {
      const error = handleWalletError(err, 'disconnect wallet');
      toast.error(error.message);
      dispatch({ type: 'DISCONNECTION_FAILED', error });
    }
  }, [client, walletState.wallet]);

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
