/**
 * Consolidated connection management hook for WalletMesh
 *
 * Merges functionality from:
 * - useConnect: Connection management
 * - useDisconnect: Disconnection management
 *
 * Provides methods and state for connecting and disconnecting wallets,
 * following wagmi patterns for familiar developer experience.
 *
 * @module hooks/useConnect
 */

import type {
  ChainConfig,
  ChainType,
  ConnectionStatus,
  TransactionStatus,
  WalletInfo,
} from '@walletmesh/modal-core';
import {
  ErrorFactory,
  type ModalError,
  createProgressTracker,
  type ConnectionProgressInfo,
} from '@walletmesh/modal-core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWalletMeshContext, useWalletMeshServices } from '../WalletMeshContext.js';
import { createComponentLogger } from '../utils/logger.js';
import { useStore, useStoreActions, useStoreInstance } from './internal/useStore.js';

// Helper function to determine if a transaction status is pending
// Pending statuses are all non-terminal statuses (excluding 'confirmed' and 'failed')
const isPendingTransactionStatus = (status: TransactionStatus): boolean => {
  return ['idle', 'simulating', 'proving', 'sending', 'pending', 'confirming'].includes(status);
};

// Helper function to convert React options to service options
function convertToServiceOptions(options?: ReactConnectOptions): Record<string, unknown> | undefined {
  if (!options) return undefined;

  // Simple object conversion that matches expected service API
  const result: Record<string, unknown> = {};

  if (options['chain']) result['chain'] = options['chain'];
  if (options['isReconnection'] !== undefined) result['isReconnection'] = options['isReconnection'];
  if (options['sessionId']) result['sessionId'] = options['sessionId'];
  if (options['showModal'] !== undefined) result['showModal'] = options['showModal'];

  return Object.keys(result).length > 0 ? result : undefined;
}

/**
 * Connection arguments
 *
 * @public
 */
export interface ConnectArgs {
  /** Wallet ID to connect to - if not provided, shows wallet selection modal */
  walletId?: string;
  /** Chain to connect to - defaults to the wallet's default chain */
  chain?: ChainConfig;
}

/**
 * Connection options for the connect method
 *
 * @public
 */
export interface ReactConnectOptions {
  /** Chain to connect to - overrides the wallet's default chain */
  chain?: ChainConfig;
  /** Whether to show modal if wallet not specified (default: true) */
  showModal?: boolean;
  /** Connection progress callback - receives progress percentage (0-100) */
  onProgress?: (progress: number) => void;
  /** Whether this is an auto-reconnection attempt (for internal use) */
  isReconnection?: boolean;
  /** Session ID for reconnection attempts */
  sessionId?: string;
}

/**
 * Disconnect options
 *
 * @public
 */
export interface DisconnectOptions {
  /** Whether to force disconnect even if there are active transactions (default: false) */
  force?: boolean;
  /** Custom disconnect reason for logging or analytics */
  reason?: string;
}

/**
 * Connection progress interface
 *
 * Re-exported from modal-core for convenience.
 * Uses the framework-agnostic progress tracking utilities.
 *
 * @public
 */
export type ConnectionProgress = ConnectionProgressInfo;

/**
 * Connection variables for tracking current connection attempt
 *
 * @public
 */
export interface ConnectVariables {
  /** Wallet being connected to */
  walletId?: string;
  /** Chain being connected to */
  chain?: ChainConfig;
}

/**
 * React-specific connection result interface
 * Extends the core ConnectionResult with React-specific properties like walletId
 *
 * @public
 */
export interface ReactConnectionResult {
  /** Connected wallet ID */
  walletId: string;
  /** Connected chain */
  chain: ChainConfig;
  /** Primary address */
  address: string;
  /** All addresses */
  addresses: string[];
  /** Chain type */
  chainType: ChainType;
}

/**
 * Consolidated hook return type for connection management
 *
 * @public
 */
export interface UseConnectReturn {
  // Connection methods
  /** Connect to a wallet */
  connect: (walletId?: string, options?: ReactConnectOptions) => Promise<void>;
  /** Disconnect wallet(s) */
  disconnect: (walletId?: string, options?: DisconnectOptions) => Promise<void>;
  /** Disconnect all wallets */
  disconnectAll: (options?: DisconnectOptions) => Promise<void>;
  /** Retry a failed connection */
  retry: () => Promise<void>;

  // State
  /** Available wallet adapters */
  wallets: WalletInfo[];
  /** Currently connected wallets */
  connectedWallets: WalletInfo[];
  /** Current connection status */
  status: ConnectionStatus;
  /** Whether currently connecting */
  isConnecting: boolean;
  /** Whether currently disconnecting */
  isDisconnecting: boolean;
  /** Whether connection is pending user interaction */
  isPending: boolean;
  /** Connection/disconnection error if any */
  error: unknown;
  /** Reset error state */
  reset: () => void;

  // Progress tracking
  /** Variables from current/last connection attempt */
  variables: ConnectVariables | undefined;
  /** Connection progress (0-100) */
  progress: number;
  /** Detailed progress information */
  progressInfo: ConnectionProgress | null;

  // Utility flags
  /** Whether there are wallets that can be disconnected */
  canDisconnect: boolean;
}

/**
 * Consolidated hook for managing wallet connections and disconnections
 *
 * Provides methods to connect to wallets with automatic modal handling,
 * disconnect wallets safely, track connection state, and manage errors.
 *
 * @returns Connection and disconnection methods and state
 *
 * @since 2.0.0
 *
 * @see {@link useAccount} - For accessing connection state
 * @see {@link useSwitchChain} - For changing chains after connection
 * @see {@link useTransaction} - For sending transactions
 *
 * @remarks
 * This hook consolidates connection and disconnection functionality.
 * The connect method handles both direct wallet connections (when walletId
 * is provided) and modal-based connections (when walletId is omitted).
 * The disconnect method provides safe disconnection with validation.
 *
 * Connection flow:
 * 1. Validate connection parameters
 * 2. Open modal or connect directly
 * 3. Establish wallet connection
 * 4. Initialize session
 * 5. Return connection result
 *
 * Disconnection flow:
 * 1. Validate disconnection safety
 * 2. Check for active transactions
 * 3. Perform disconnection
 * 4. Clean up session data
 * 5. Update UI state
 *
 * @example
 * ```tsx
 * function WalletButton() {
 *   const {
 *     connect,
 *     disconnect,
 *     isConnecting,
 *     isDisconnecting,
 *     connectedWallets,
 *     error
 *   } = useConnect();
 *
 *   if (error) {
 *     return <div>Error: {error.message}</div>;
 *   }
 *
 *   if (connectedWallets.length > 0) {
 *     return (
 *       <button
 *         onClick={() => disconnect()}
 *         disabled={isDisconnecting}
 *       >
 *         {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
 *       </button>
 *     );
 *   }
 *
 *   return (
 *     <button
 *       onClick={() => connect()}
 *       disabled={isConnecting}
 *     >
 *       {isConnecting ? 'Connecting...' : 'Connect Wallet'}
 *     </button>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Direct wallet connection without modal
 * function QuickConnect() {
 *   const { connect, disconnect, error, reset } = useConnect();
 *
 *   const connectMetaMask = async () => {
 *     try {
 *       await connect('metamask', { showModal: false });
 *     } catch (err) {
 *       // Handle error
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={connectMetaMask}>
 *         Quick Connect MetaMask
 *       </button>
 *       <button onClick={() => disconnect()}>
 *         Disconnect
 *       </button>
 *       {error && (
 *         <div>
 *           {error.message}
 *           <button onClick={reset}>Try Again</button>
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Manage multiple wallets
 * function MultiWalletManager() {
 *   const { connectedWallets, disconnect, disconnectAll } = useConnect();
 *
 *   return (
 *     <div>
 *       <h3>Connected Wallets ({connectedWallets.length})</h3>
 *       {connectedWallets.map(wallet => (
 *         <div key={wallet.id}>
 *           <span>{wallet.name}</span>
 *           <button onClick={() => disconnect(wallet.id)}>
 *             Disconnect
 *           </button>
 *         </div>
 *       ))}
 *       {connectedWallets.length > 1 && (
 *         <button onClick={() => disconnectAll()}>
 *           Disconnect All
 *         </button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 *
 * @public
 */
export function useConnect(): UseConnectReturn {
  const { client } = useWalletMeshContext();
  const services = useWalletMeshServices();
  const actions = useStoreActions();
  const store = useStoreInstance();
  const logger = useMemo(() => createComponentLogger('useConnect'), []);

  // Local state for async operations
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [connectionProgress, setConnectionProgress] = useState<ConnectionProgress | null>(null);

  // Ref to track if component is mounted
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      // Clear progress timer if still running
      if (progressTimerRef.current) {
        clearTimeout(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    };
  }, []);

  // Use separate selectors for better performance
  const activeSession = useStore((state) => {
    const activeSessionId = state.active?.sessionId;
    return activeSessionId ? state.entities.sessions?.[activeSessionId] : null;
  });

  const uiState = useStore((state) => ({
    error: state.ui.errors?.['connection'],
    isLoading: state.ui.loading?.connection,
    currentView: state.ui.currentView,
  }));

  const wallets = useStore((state) => {
    const walletsFromStore = Object.values(state.entities?.wallets || {});
    console.log('[useConnect] Wallets from store:', {
      count: walletsFromStore.length,
      walletIds: walletsFromStore.map((w) => w.id),
      availableWalletIds: state.meta?.availableWalletIds || [],
      entities: Object.keys(state.entities?.wallets || {}),
    });
    return walletsFromStore;
  });
  const activeSessions = useStore((state) => Object.values(state.entities?.sessions || {}));

  // Derive connection status
  const status = useMemo(() => {
    if (activeSession?.status === 'connected') return 'connected' as const;
    if (uiState.currentView === 'connecting') return 'connecting' as const;
    return 'disconnected' as const;
  }, [activeSession?.status, uiState.currentView]);

  // Derive connected wallets more efficiently
  const connectedWallets = useMemo(() => {
    const connectedWalletIds = new Set<string>();
    for (const session of activeSessions) {
      if (session.status === 'connected' && session.walletId) {
        connectedWalletIds.add(session.walletId);
      }
    }

    return Array.from(connectedWalletIds)
      .map((walletId) => wallets.find((w) => w.id === walletId))
      .filter((wallet): wallet is WalletInfo => wallet !== undefined);
  }, [activeSessions, wallets]);

  // Compose connection state
  const connectionState = useMemo(
    () => ({
      status,
      error: uiState.error,
      wallets,
      connectedWallets,
      progress: uiState.isLoading ? 50 : 0,
      isConnecting: uiState.currentView === 'connecting',
      activeWallet: activeSession?.walletId || null,
      activeSessions,
      canDisconnect: activeSession?.status === 'connected',
    }),
    [
      status,
      uiState.error,
      uiState.isLoading,
      uiState.currentView,
      wallets,
      connectedWallets,
      activeSession?.walletId,
      activeSession?.status,
      activeSessions,
    ],
  );

  // Track connection variables
  const variables = useMemo<ConnectVariables | undefined>(() => {
    if (connectionState.isConnecting && connectionState.activeWallet) {
      return {
        walletId: connectionState.activeWallet,
      };
    }
    return undefined;
  }, [connectionState.isConnecting, connectionState.activeWallet]);

  // Ref to track cleanup timers
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Connect method
  const connect = useCallback(
    async (walletId?: string, options?: ReactConnectOptions): Promise<void> => {
      if (!client) {
        throw ErrorFactory.configurationError(
          'WalletMesh client not available. Make sure you are not in SSR mode or within WalletMeshProvider.',
        );
      }

      if (!services?.connection) {
        const error = ErrorFactory.configurationError(
          'Connection service not available. Cannot proceed with connection.',
        );
        logger.error('Connection service unavailable:', error);
        throw error;
      }

      // Create progress tracker using modal-core utilities
      const tracker = createProgressTracker();

      if (isMountedRef.current) {
        setConnectionProgress(tracker.getCurrent());
      }

      try {
        const handleProgress = (stage: 'initializing' | 'connecting' | 'authenticating' | 'connected' | 'failed', details?: string) => {
          if (isMountedRef.current) {
            const progressInfo = tracker.updateStage(stage, details);
            setConnectionProgress(progressInfo);
            options?.onProgress?.(progressInfo.progress);
          }
        };

        // Initial progress
        handleProgress('initializing', 'Initializing connection...');

        // Execute connection
        if (walletId) {
          handleProgress('connecting', `Connecting to ${walletId}...`);

          await client.connect(walletId, convertToServiceOptions(options));

          // Connection validation happens inside client.connect
          // If we get here, connection was successful
          handleProgress('connected', 'Connected successfully');
        } else if (options?.showModal !== false) {
          handleProgress('connecting', 'Opening wallet selection...');

          await client.connect(undefined, convertToServiceOptions(options));

          handleProgress('connected', 'Connected successfully');
        } else {
          throw ErrorFactory.configurationError('No wallet specified and modal disabled');
        }
      } catch (error) {
        if (isMountedRef.current) {
          setConnectionProgress(tracker.updateStage('failed', (error as Error).message));
        }

        actions.ui.setError(store, 'connection', {
          code: 'CONNECTION_FAILED',
          message: (error as Error).message,
          category: 'wallet',
        });
        throw error;
      } finally {
        // Clear any existing progress timer
        if (progressTimerRef.current) {
          clearTimeout(progressTimerRef.current);
        }

        // Clear progress after a delay
        progressTimerRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            setConnectionProgress(null);
          }
          progressTimerRef.current = null;
        }, 1000);
      }
    },
    [client, services?.connection, actions, store, logger],
  );

  // Disconnect method
  const disconnect = useCallback(
    async (walletId?: string, _options?: DisconnectOptions): Promise<void> => {
      if (isMountedRef.current) {
        setIsDisconnecting(true);
      }
      actions.ui.clearError(store, 'connection');

      const targetWalletId = walletId || connectionState.activeWallet;

      try {
        if (!targetWalletId) {
          throw ErrorFactory.connectionFailed('No wallet connected to disconnect');
        }

        if (!client) {
          throw ErrorFactory.configurationError(
            'WalletMesh client not available. Make sure you are not in SSR mode or within WalletMeshProvider.',
          );
        }

        // Validate disconnection safety
        if (!_options?.force) {
          const storeState = store.getState();
          const transactions = storeState.entities?.transactions || {};

          // Count pending transactions for this wallet
          const pendingTransactions = Object.values(transactions).filter(
            (tx) => tx.walletId === targetWalletId && isPendingTransactionStatus(tx.status),
          );

          if (pendingTransactions.length > 0) {
            throw ErrorFactory.connectionFailed(
              `Cannot disconnect: ${pendingTransactions.length} pending transaction(s)`,
              {
                walletId: targetWalletId,
                pendingTransactions: pendingTransactions.length,
              },
            );
          }

          // Check if this wallet has active sessions with pending operations
          const activeSessionId = storeState.active?.sessionId;
          const activeSession = activeSessionId ? storeState.entities?.sessions?.[activeSessionId] : null;

          if (activeSession && activeSession.walletId === targetWalletId) {
            logger.warn('Disconnecting active wallet session');
          }
        }

        await client.disconnect(targetWalletId);
      } catch (err) {
        // Use ErrorFactory to create proper error
        let modalError: ModalError;
        if (err instanceof Error) {
          modalError = ErrorFactory.connectionFailed(err.message, {
            walletId: targetWalletId,
            originalError: err.message,
          });
        } else if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
          modalError = ErrorFactory.connectionFailed(err.message, {
            walletId: targetWalletId,
            originalError: err,
          });
        } else {
          modalError = ErrorFactory.connectionFailed('Disconnection failed', {
            walletId: targetWalletId,
          });
        }

        actions.ui.setError(store, 'connection', modalError);
        throw modalError;
      } finally {
        if (isMountedRef.current) {
          setIsDisconnecting(false);
        }
      }
    },
    [client, connectionState.activeWallet, actions, store, logger],
  );

  // Disconnect all method
  const disconnectAll = useCallback(
    async (_options?: DisconnectOptions): Promise<void> => {
      setIsDisconnecting(true);
      actions.ui.clearError(store, 'connection');

      try {
        if (!client) {
          throw ErrorFactory.configurationError(
            'WalletMesh client not available. Make sure you are not in SSR mode or within WalletMeshProvider.',
          );
        }

        // Validate disconnection safety for all wallets
        if (!_options?.force) {
          const storeState = store.getState();
          const transactions = storeState.entities?.transactions || {};

          // Count all pending transactions across all wallets
          const pendingTransactionsByWallet = new Map<string, number>();
          let totalPendingTransactions = 0;

          for (const tx of Object.values(transactions)) {
            if (isPendingTransactionStatus(tx.status)) {
              const walletId = tx.walletId || 'unknown';
              pendingTransactionsByWallet.set(walletId, (pendingTransactionsByWallet.get(walletId) || 0) + 1);
              totalPendingTransactions++;
            }
          }

          if (totalPendingTransactions > 0) {
            const walletCount = pendingTransactionsByWallet.size;
            throw ErrorFactory.connectionFailed(
              `Cannot disconnect all: ${totalPendingTransactions} pending transaction(s) across ${walletCount} wallet(s)`,
              {
                pendingTransactions: totalPendingTransactions,
                affectedWallets: walletCount,
              },
            );
          }
        }

        await client.disconnectAll();
      } catch (err) {
        // Use ErrorFactory to create proper error
        let modalError: ModalError;
        if (err instanceof Error) {
          modalError = ErrorFactory.connectionFailed(err.message, {
            operation: 'disconnectAll',
            originalError: err.message,
          });
        } else if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
          modalError = ErrorFactory.connectionFailed(err.message, {
            operation: 'disconnectAll',
            originalError: err,
          });
        } else {
          modalError = ErrorFactory.connectionFailed('Failed to disconnect all wallets', {
            operation: 'disconnectAll',
          });
        }

        actions.ui.setError(store, 'connection', modalError);
        throw modalError;
      } finally {
        if (isMountedRef.current) {
          setIsDisconnecting(false);
        }
      }
    },
    [client, actions, store],
  );

  // Retry method
  const retry = useCallback(async () => {
    if (!client) {
      throw ErrorFactory.configurationError(
        'WalletMesh client not available. Make sure you are not in SSR mode.',
      );
    }

    if (!services?.connection) {
      throw ErrorFactory.configurationError('Connection service not available. Cannot retry connection.');
    }

    if (connectionState.activeWallet) {
      await connect(connectionState.activeWallet);
    } else {
      await connect();
    }
  }, [client, services?.connection, connectionState, connect]);

  // Reset error
  const reset = useCallback(() => {
    actions.ui.clearError(store, 'connection');
  }, [actions, store]);

  return {
    // Methods
    connect,
    disconnect,
    disconnectAll,
    retry,

    // State
    wallets: connectionState.wallets,
    connectedWallets: connectionState.connectedWallets,
    status: connectionState.status as ConnectionStatus,
    isConnecting: connectionState.isConnecting,
    isDisconnecting,
    isPending: connectionState.isConnecting,
    error: connectionState.error || null,
    reset,

    // Progress
    variables,
    progress: connectionProgress?.progress || 0,
    progressInfo: connectionProgress,

    // Utility
    canDisconnect: connectionState.canDisconnect,
  };
}

/**
 * Hook to get available wallet adapters
 *
 * Returns the list of available wallets that can be connected to.
 * This is a subset of useConnect focused only on wallet discovery.
 *
 * @returns Array of available wallets
 *
 * @since 1.0.0
 *
 * @example
 * ```tsx
 * function WalletGrid() {
 *   const wallets = useWalletAdapters();
 *
 *   return (
 *     <div className="wallet-grid">
 *       {wallets.map(wallet => (
 *         <WalletCard key={wallet.id} wallet={wallet} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 *
 * @public
 */
export function useWalletAdapters(): WalletInfo[] {
  return useStore((state) => Object.values(state.entities.wallets));
}

/**
 * Hook to check connection loading state
 *
 * Simple boolean hook for checking if currently connecting.
 *
 * @returns True if connecting, false otherwise
 *
 * @since 1.0.0
 *
 * @example
 * ```tsx
 * function App() {
 *   const isConnecting = useIsConnecting();
 *
 *   if (isConnecting) {
 *     return <LoadingSpinner />;
 *   }
 *
 *   return <MainContent />;
 * }
 * ```
 *
 * @public
 */
export function useIsConnecting(): boolean {
  return useStore((state) => state.ui.currentView === 'connecting');
}

/**
 * Hook to get connection progress
 *
 * Returns the current connection progress as a percentage (0-100).
 *
 * @returns Connection progress percentage (0-100)
 *
 * @since 1.0.0
 *
 * @example
 * ```tsx
 * function ConnectionProgress() {
 *   const progress = useConnectionProgress();
 *   const isConnecting = useIsConnecting();
 *
 *   if (!isConnecting) return null;
 *
 *   return (
 *     <div>
 *       <p>Connecting... {progress}%</p>
 *       <progress value={progress} max={100} />
 *     </div>
 *   );
 * }
 * ```
 *
 * @public
 */
export function useConnectionProgress(): number {
  const currentView = useStore((state) => state.ui.currentView);

  // Since we don't have generateConnectionProgress anymore,
  // we'll return a simple progress based on the current view
  if (currentView === 'connecting') {
    return 50; // Mid-progress when connecting
  }
  if (currentView === 'connected') {
    return 100; // Complete when connected
  }

  return 0;
}
