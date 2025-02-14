import { useCallback, useEffect, useReducer, useState } from 'react';
import { ConnectionStatus, type WalletInfo, type ConnectedWallet, type DappInfo } from '../types.js';
import type { TimeoutConfig } from '../lib/utils/timeout.js';
import { ConnectionManager } from '../lib/connection/ConnectionManager.js';
import { handleWalletError } from '../lib/errors.js';
import { toast } from 'react-hot-toast';

/**
 * Internal state for wallet connection management.
 *
 * @internal
 * Tracks the current connection status, connected wallet instance,
 * and any errors that occur during wallet operations.
 */
type WalletState = {
  status: ConnectionStatus;
  wallet: ConnectedWallet | null;
  error: Error | null;
};

/**
 * Actions that can be dispatched to update the wallet state.
 *
 * @internal
 * Defines all possible state transitions in the wallet connection lifecycle:
 * - Connection flow: START_CONNECTING → CONNECTION_SUCCESSFUL | CONNECTION_FAILED
 * - Disconnection flow: START_DISCONNECTING → DISCONNECTION_SUCCESSFUL | DISCONNECTION_FAILED
 * - Initialization flow: START_INITIALIZING → INITIALIZATION_SUCCESSFUL | INITIALIZATION_FAILED
 */
type WalletAction =
  | { type: 'START_CONNECTING' }
  | { type: 'CONNECTION_SUCCESSFUL'; wallet: ConnectedWallet }
  | { type: 'CONNECTION_FAILED'; error: Error }
  | { type: 'START_DISCONNECTING' }
  | { type: 'DISCONNECTION_SUCCESSFUL' }
  | { type: 'DISCONNECTION_FAILED'; error: Error }
  | { type: 'START_INITIALIZING' }
  | { type: 'INITIALIZATION_SUCCESSFUL'; wallet: ConnectedWallet | null }
  | { type: 'INITIALIZATION_FAILED'; error: Error };

/**
 * Side effects that can be triggered by state transitions.
 *
 * @internal
 * Represents asynchronous operations that should be performed in response to state changes:
 * - PERSIST_SESSION: Save the current session to storage
 * - RESTORE_SESSION: Load a previously saved session
 * - CLEAR_SESSION: Remove the current session
 */
type ReducerEffect = {
  type: 'PERSIST_SESSION' | 'RESTORE_SESSION' | 'CLEAR_SESSION';
  payload?: ConnectedWallet | string | undefined;
};

/**
 * Initial state for wallet connection management.
 *
 * @internal
 * Default state when no wallet is connected:
 * - status: Idle
 * - wallet: null
 * - error: null
 */
const initialWalletState: WalletState = {
  status: ConnectionStatus.Idle,
  wallet: null,
  error: null,
};

/**
 * Configuration options for wallet disconnection.
 *
 * @property {boolean} [removeSession] - Whether to remove the stored session
 *   after disconnecting. If false, the session can be restored later.
 */
interface DisconnectOptions {
  removeSession?: boolean;
}

/**
 * Reducer for managing wallet connection state transitions.
 *
 * @internal
 * Handles all state transitions and their associated side effects.
 * Returns a tuple of [newState, effects] where effects are operations
 * that need to be performed after the state update.
 *
 * @param state - Current wallet state
 * @param action - Action to process
 * @returns Tuple of [new state, side effects to run]
 */
const walletReducer = (state: WalletState, action: WalletAction): [WalletState, ReducerEffect[]] => {
  switch (action.type) {
    case 'START_CONNECTING':
      return [
        {
          ...state,
          status: ConnectionStatus.Connecting,
          error: null,
        },
        [],
      ];
    case 'CONNECTION_SUCCESSFUL':
      return [
        {
          status: ConnectionStatus.Connected,
          wallet: action.wallet,
          error: null,
        },
        [{ type: 'PERSIST_SESSION', payload: action.wallet }],
      ];
    case 'CONNECTION_FAILED':
      return [
        {
          ...state,
          status: ConnectionStatus.Idle,
          error: action.error,
        },
        [],
      ];
    case 'START_DISCONNECTING':
      return [
        {
          ...state,
          status: ConnectionStatus.Disconnecting,
          error: null,
        },
        [],
      ];
    case 'DISCONNECTION_SUCCESSFUL':
      return [
        {
          status: ConnectionStatus.Idle,
          wallet: null,
          error: null,
        },
        [{ type: 'CLEAR_SESSION' }],
      ];
    case 'DISCONNECTION_FAILED':
      return [
        {
          ...state,
          status: ConnectionStatus.Idle,
          error: action.error,
        },
        [],
      ];
    case 'START_INITIALIZING':
      return [
        {
          ...state,
          status: ConnectionStatus.Resuming,
          error: null,
        },
        [{ type: 'RESTORE_SESSION' }],
      ];
    case 'INITIALIZATION_SUCCESSFUL':
      return [
        {
          status: action.wallet ? ConnectionStatus.Connected : ConnectionStatus.Idle,
          wallet: action.wallet,
          error: null,
        },
        action.wallet ? [{ type: 'PERSIST_SESSION', payload: action.wallet }] : [],
      ];
    case 'INITIALIZATION_FAILED':
      return [
        {
          status: ConnectionStatus.Idle,
          wallet: null,
          error: action.error,
        },
        [],
      ];
    default:
      return [state, []];
  }
};

/**
 * Configuration options for the useWalletLogic hook.
 *
 * @property {DappInfo} dappInfo - Information about the dApp to share with wallets
 * @property {TimeoutConfig} [timeoutConfig] - Optional configuration for operation timeouts
 */
interface UseWalletLogicOptions {
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
 *
 * @param options - Configuration options for the hook
 * @returns Object containing wallet state and control functions
 *
 * @example
 * ```tsx
 * function WalletComponent() {
 *   const {
 *     connectionStatus,
 *     connectedWallet,
 *     connectWallet,
 *     disconnectWallet,
 *     isModalOpen,
 *     openModal,
 *     closeModal
 *   } = useWalletLogic({
 *     dappInfo: {
 *       name: 'My dApp',
 *       icon: 'https://mydapp.com/icon.png'
 *     }
 *   });
 *
 *   if (connectionStatus === ConnectionStatus.Connected) {
 *     return (
 *       <div>
 *         Connected to {connectedWallet?.info.name}
 *         <button onClick={() => disconnectWallet()}>Disconnect</button>
 *       </div>
 *     );
 *   }
 *
 *   return <button onClick={openModal}>Connect Wallet</button>;
 * }
 * ```
 *
 * @remarks
 * This hook manages its own state using useReducer and handles all the complexity
 * of wallet connections, including:
 * - Automatic session restoration
 * - Connection status management
 * - Error handling
 * - Modal state management
 * - Cleanup on unmount
 */
export const useWalletLogic = ({ dappInfo, timeoutConfig }: UseWalletLogicOptions) => {
  const [manager] = useState(() => new ConnectionManager(dappInfo, timeoutConfig));
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [walletState, dispatch] = useReducer<(state: WalletState, action: WalletAction) => WalletState>(
    (state, action) => {
      const [newState] = walletReducer(state, action);
      return newState;
    },
    initialWalletState,
  );

  // Single initialization effect
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    console.log('[WalletLogic] Component mounted, starting initialization');

    // Initialize in an IIFE to avoid useEffect async issues
    (async () => {
      try {
        if (!isMounted) return;
        dispatch({ type: 'START_INITIALIZING' });

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
          dispatch({ type: 'INITIALIZATION_SUCCESSFUL', wallet: restored });
        } else {
          console.log('[WalletLogic] No session to restore');
          dispatch({ type: 'INITIALIZATION_SUCCESSFUL', wallet: null });
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
        dispatch({ type: 'INITIALIZATION_FAILED', error });
      }
    })();

    return () => {
      console.log('[WalletLogic] Component unmounting, cleaning up...');
      isMounted = false;
      abortController.abort();
    };
  }, [manager]); // Only depend on manager

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

  const disconnectWallet = useCallback(
    async (options: DisconnectOptions = { removeSession: true }) => {
      if (!walletState.wallet) return;

      dispatch({ type: 'START_DISCONNECTING' });
      try {
        await manager.disconnectWallet(walletState.wallet.info.id, options);
        if (options.removeSession) {
          dispatch({ type: 'DISCONNECTION_SUCCESSFUL' });
        } else {
          dispatch({ type: 'START_INITIALIZING' });
        }
      } catch (err) {
        const error = handleWalletError(err, 'disconnect wallet');
        toast.error(error.message);
        dispatch({ type: 'DISCONNECTION_FAILED', error });
      }
    },
    [manager, walletState.wallet],
  );

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
