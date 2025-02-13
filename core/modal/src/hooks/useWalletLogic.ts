import { useCallback, useEffect, useReducer, useState } from 'react';
import { ConnectionStatus, type WalletInfo, type ConnectedWallet } from '../types.js';
import { ConnectionManager } from '../lib/connection/ConnectionManager.js';
import { handleWalletError } from '../lib/errors.js';
import { toast } from 'react-hot-toast';

/**
 * Internal state for wallet connection management
 * @interface WalletState
 * @property {ConnectionStatus} status - Current connection status
 * @property {ConnectedWallet | null} wallet - Active wallet connection or null
 * @property {Error | null} error - Last encountered error or null
 */
type WalletState = {
  status: ConnectionStatus;
  wallet: ConnectedWallet | null;
  error: Error | null;
};

/**
 * Actions for wallet state management
 * @type WalletAction
 */
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

/**
 * Initial state for wallet connection
 */
const initialWalletState: WalletState = {
  status: ConnectionStatus.Idle,
  wallet: null,
  error: null,
};

/**
 * Reducer for managing wallet connection state transitions
 * @param {WalletState} state - Current wallet state
 * @param {WalletAction} action - Action to perform
 * @returns {WalletState} New wallet state
 */
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

/**
 * Hook for managing wallet connection state and operations
 * @hook useWalletLogic
 * @description This hook provides the core wallet integration functionality,
 * including connection management, state tracking, and modal controls.
 * It handles connection persistence, error management, and cleanup.
 *
 * @example
 * ```tsx
 * function WalletButton() {
 *   const {
 *     connectionStatus,
 *     connectedWallet,
 *     connectWallet,
 *     disconnectWallet,
 *     openModal
 *   } = useWalletLogic();
 *
 *   if (connectionStatus === ConnectionStatus.Connected) {
 *     return (
 *       <button onClick={disconnectWallet}>
 *         Connected: {connectedWallet?.state.address}
 *       </button>
 *     );
 *   }
 *
 *   return <button onClick={openModal}>Connect Wallet</button>;
 * }
 * ```
 *
 * @returns {Object} Wallet management methods and state
 * @property {ConnectionStatus} connectionStatus - Current wallet connection state
 * @property {ConnectedWallet | null} connectedWallet - Information about connected wallet
 * @property {(wallet: WalletInfo) => Promise<void>} connectWallet - Connect to specified wallet
 * @property {() => Promise<void>} disconnectWallet - Disconnect current wallet
 * @property {boolean} isModalOpen - Whether wallet selection modal is open
 * @property {() => void} openModal - Open wallet selection modal
 * @property {() => void} closeModal - Close wallet selection modal
 */
export const useWalletLogic = () => {
  // Initialize connection manager (persisted across re-renders)
  const [manager] = useState(() => new ConnectionManager());

  // Setup wallet state management
  const [walletState, dispatch] = useReducer(walletReducer, initialWalletState);

  // Control modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Attempt to restore previous session on mount
  useEffect(() => {
    const storedSession = manager.getStoredSession();
    if (storedSession) {
      dispatch({ type: 'START_RESUMING' });

      // Try to resume the stored connection
      manager
        .resumeConnection(storedSession)
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

    // Cleanup connection on unmount
    return () => {
      manager.cleanup();
    };
  }, [manager]);

  /**
   * Connect to a specified wallet
   * @param {WalletInfo} wallet - Configuration for the wallet to connect
   * @throws {WalletConnectionError} If connection fails or is rejected
   */
  const connectWallet = useCallback(
    async (wallet: WalletInfo) => {
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
    },
    [manager],
  );

  /**
   * Disconnect the current wallet
   * @throws {WalletDisconnectionError} If disconnection fails
   */
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
