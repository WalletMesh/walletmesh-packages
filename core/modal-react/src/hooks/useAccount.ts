/**
 * Consolidated account, connection state, and wallet selection hook for WalletMesh
 *
 * Merges functionality from:
 * - useAccount: Account and connection state
 * - useSelectedWallet: Wallet selection and management
 * - Thin wrapper hooks: useAddress, useChain, useIsConnected, useWallet
 *
 * Provides access to account information, connection state, chain data,
 * and wallet selection capabilities following wagmi patterns.
 *
 * @module hooks/useAccount
 */

import {
  type ChainType,
  ConnectionStatus,
  ErrorFactory,
  type SupportedChain,
  type WalletInfo,
  type WalletMeshState,
  clearWalletPreference,
  getInstallUrl as coreGetInstallUrl,
  getPreferredWallet as coreGetPreferredWallet,
  // Enhanced wallet selection utilities
  getRecommendedWallet as coreGetRecommendedWallet,
  setPreferredWallet as coreSetPreferredWallet,
  filterWalletsByChain,
  isWalletInstalled,
  // State derivation utilities from modal-core
  deriveConnectionStatus,
  type DerivedConnectionFlags,
} from '@walletmesh/modal-core';
import React, { useCallback, useMemo, useState, useEffect, useDebugValue } from 'react';
import { useWalletMeshContext } from '../WalletMeshContext.js';
import { createComponentLogger } from '../utils/logger.js';
import { useService } from './internal/useService.js';
import { useStore } from './internal/useStore.js';

/**
 * Account information with full wallet details and selection capabilities
 *
 * @public
 */
export interface AccountInfo {
  // Core account state
  /** Primary account address */
  address: string | null;
  /** All connected addresses */
  addresses: string[];
  /** Whether an account is connected */
  isConnected: boolean;
  /** Whether currently connecting */
  isConnecting: boolean;
  /** Whether currently reconnecting to an existing session */
  isReconnecting: boolean;
  /** Whether disconnected */
  isDisconnected: boolean;
  /** Connection status as string */
  status: ConnectionStatus;

  // Chain information
  /** Current chain */
  chain: SupportedChain | null;
  /** Current chain type */
  chainType: ChainType | null;

  // Wallet information
  /** Connected wallet information */
  wallet: WalletInfo | null;
  /** Active wallet ID */
  walletId: string | null;
  /** Chain-specific provider instance */
  provider: unknown;
  /** Connection error if any */
  error: Error | null;

  // Wallet selection (from useSelectedWallet)
  /** All available wallets */
  availableWallets: WalletInfo[];
  /** User's preferred wallet (from localStorage) */
  preferredWallet: WalletInfo | null;
  /** Whether wallet selection is in progress */
  isSelecting: boolean;

  // Wallet selection methods
  /** Select a wallet for connection */
  selectWallet: (wallet: WalletInfo) => Promise<void>;
  /** Set preferred wallet (persisted) */
  setPreferredWallet: (wallet: WalletInfo | null) => void;
  /** Get wallets by chain type */
  getWalletsByChain: (chainType: ChainType) => WalletInfo[];
  /** Get recommended wallet based on current state */
  getRecommendedWallet: () => WalletInfo | null;
  /** Check if a specific wallet is available */
  isWalletAvailable: (walletId: string) => boolean;
  /** Get install URL for a wallet */
  getInstallUrl: (walletId: string) => string | null;
  /** Clear wallet selection and preference */
  clearSelection: () => void;
  /** Refresh wallet availability */
  refreshAvailability: () => Promise<void>;
}

/**
 * Wallet selection options
 *
 * @public
 */
export interface WalletSelectionOptions {
  /** Persist wallet preference to localStorage */
  persistPreference?: boolean;
  /** Storage key for persisted preference */
  storageKey?: string;
  /** Filter wallets by supported chain types */
  filterByChainType?: ChainType[];
  /** Whether to auto-select if only one wallet is available */
  autoSelectSingle?: boolean;
}

/**
 * Wallet availability status
 *
 * @public
 */
export interface WalletAvailability {
  /** Wallet information */
  wallet: WalletInfo;
  /** Whether wallet is installed/available */
  isAvailable: boolean;
  /** Whether wallet supports current chain */
  supportsCurrentChain: boolean;
  /** Whether wallet is currently connected */
  isConnected: boolean;
  /** Install URL if wallet is not available */
  installUrl?: string | null;
}

// Memoized selectors for better performance
const selectActiveSession = (state: WalletMeshState) => {
  const sessionId = state.active?.sessionId;
  return sessionId && state.entities?.sessions ? state.entities.sessions[sessionId] || null : null;
};

const selectUIState = (state: WalletMeshState) => {
  return {
    currentView: state.ui?.currentView || 'walletSelection',
    error: state.ui?.errors?.['connection'] || null,
  };
};

const selectAvailableWallets = (state: WalletMeshState): WalletInfo[] => {
  if (state.meta && state.entities) {
    const wallets =
      state.meta.availableWalletIds
        ?.map((id) => state.entities.wallets?.[id])
        .filter((w): w is WalletInfo => w !== undefined) || [];
    return wallets;
  }
  return [];
};

// Helper to map activeSession status to SessionStatus type for state derivation
const mapSessionStatus = (
  activeSession: ReturnType<typeof selectActiveSession>,
): 'connected' | 'connecting' | 'disconnected' | 'reconnecting' | undefined => {
  if (!activeSession) return undefined;

  // Map each session status to the appropriate SessionStatus for state derivation
  switch (activeSession.status) {
    case 'connected':
      return 'connected';
    case 'connecting':
      return 'connecting';
    case 'switching':
      return 'reconnecting';
    case 'initializing':
      return 'connecting'; // initializing is an in-progress state
    case 'disconnecting':
      return 'disconnected'; // moving toward disconnected
    case 'error':
      return 'disconnected'; // error is a terminal state
    case 'disconnected':
      return 'disconnected';
    default:
      // Handle any unexpected status by treating as disconnected
      return 'disconnected';
  }
};

// Helper to map UI view to UIView type for state derivation
const mapUIView = (
  currentView: string | undefined,
): 'idle' | 'connecting' | 'connected' | 'error' | undefined => {
  if (!currentView) return undefined;
  if (currentView === 'connecting') return 'connecting';
  if (currentView === 'connected') return 'connected';
  if (currentView === 'error') return 'error';
  return 'idle';
};

// Use modal-core's state derivation utility
const deriveConnectionFlagsFromState = (
  activeSession: ReturnType<typeof selectActiveSession>,
  uiState: ReturnType<typeof selectUIState>,
): DerivedConnectionFlags => {
  const sessionStatus = mapSessionStatus(activeSession);
  const currentView = mapUIView(uiState.currentView);
  const isReconnecting = activeSession?.status === 'switching';

  return deriveConnectionStatus(sessionStatus, currentView, isReconnecting);
};

/**
 * Consolidated hook for accessing account state and wallet selection
 *
 * Provides comprehensive account information including addresses,
 * connection status, chain details, wallet metadata, and wallet
 * selection capabilities.
 *
 * @param options - Wallet selection options
 * @returns Account information and wallet selection utilities
 *
 * @since 2.0.0
 *
 * @see {@link useConnect} - For connecting wallets
 * @see {@link useSwitchChain} - For changing chains
 * @see {@link useBalance} - For fetching account balances
 * @see {@link useTransaction} - For sending transactions
 *
 * @remarks
 * This hook consolidates account state and wallet selection functionality.
 * It combines multiple pieces of state into a single interface, making it
 * the primary hook for accessing account-related information and managing
 * wallet selection. The hook uses shallow equality checks for performance.
 *
 * @example
 * ```tsx
 * function Account() {
 *   const {
 *     address,
 *     isConnected,
 *     chainId,
 *     wallet,
 *     availableWallets,
 *     selectWallet,
 *     preferredWallet
 *   } = useAccount();
 *
 *   if (!isConnected) {
 *     return (
 *       <div>
 *         <h3>Select a wallet:</h3>
 *         {availableWallets.map(w => (
 *           <button key={w.id} onClick={() => selectWallet(w)}>
 *             {w.name}
 *           </button>
 *         ))}
 *         {preferredWallet && (
 *           <p>Preferred: {preferredWallet.name}</p>
 *         )}
 *       </div>
 *     );
 *   }
 *
 *   return (
 *     <div>
 *       <p>Address: {address}</p>
 *       <p>Chain ID: {chainId}</p>
 *       <p>Wallet: {wallet?.name}</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Wallet selection with persistence
 * function WalletSelector() {
 *   const {
 *     availableWallets,
 *     preferredWallet,
 *     setPreferredWallet,
 *     isWalletAvailable,
 *     getInstallUrl
 *   } = useAccount({
 *     persistPreference: true,
 *     filterByChainType: [ChainType.Evm]
 *   });
 *
 *   return (
 *     <div>
 *       {availableWallets.map(wallet => {
 *         const isAvailable = isWalletAvailable(wallet.id);
 *         const installUrl = getInstallUrl(wallet.id);
 *         const isPreferred = preferredWallet?.id === wallet.id;
 *
 *         return (
 *           <div key={wallet.id}>
 *             <h4>{wallet.name}</h4>
 *             {isAvailable ? (
 *               <button onClick={() => setPreferredWallet(wallet)}>
 *                 {isPreferred ? '★ Preferred' : 'Set as Preferred'}
 *               </button>
 *             ) : (
 *               <a href={installUrl || '#'} target="_blank">
 *                 Install
 *               </a>
 *             )}
 *           </div>
 *         );
 *       })}
 *     </div>
 *   );
 * }
 * ```
 *
 * @public
 */
export function useAccount(options: WalletSelectionOptions = {}): AccountInfo {
  const {
    persistPreference = false,
    storageKey = 'walletmesh-preferred-wallet',
    filterByChainType = [] as ChainType[],
    autoSelectSingle = false,
  } = options;

  const { client } = useWalletMeshContext();
  const { service: connectionService } = useService('connection', 'useAccount');
  const logger = React.useMemo(() => createComponentLogger('useAccount'), []);

  // Local state for wallet selection
  const [isSelecting, setIsSelecting] = useState(false);
  const [preferredWalletId, setPreferredWalletId] = useState<string | null>(null);

  // Use granular subscriptions to minimize re-renders
  // Each subscription only triggers re-render when its specific value changes
  const activeSession = useStore(selectActiveSession);
  const currentView = useStore((state) => state.ui?.currentView || 'walletSelection');
  const connectionError = useStore((state) => state.ui?.errors?.['connection'] || null);
  const walletId = useStore((state) => state.active?.walletId || null);
  const walletInfo = useStore((state) => {
    if (!walletId || !state.entities?.wallets) return null;
    return state.entities.wallets[walletId] || null;
  });
  const availableWallets = useStore(selectAvailableWallets);

  // Memoize connection flags with granular dependencies
  // Uses modal-core's state derivation utility for consistent state representation
  const connectionFlags = React.useMemo(() => {
    const uiState = { currentView, error: connectionError };
    if (!connectionService || !activeSession) {
      return deriveConnectionFlagsFromState(activeSession, uiState);
    }

    try {
      const status = connectionService.getConnectionStatus();
      return {
        status,
        isConnected: status === ConnectionStatus.Connected,
        isConnecting: status === ConnectionStatus.Connecting,
        isReconnecting: status === ConnectionStatus.Reconnecting,
        isDisconnected: status === ConnectionStatus.Disconnected,
      };
    } catch (error) {
      logger.error('Failed to get connection status from ConnectionService:', error);
      return deriveConnectionFlagsFromState(activeSession, uiState);
    }
  }, [connectionService, activeSession, currentView, connectionError, logger]);

  // Load preferred wallet from localStorage using core utility
  useEffect(() => {
    if (persistPreference) {
      try {
        const stored = coreGetPreferredWallet(storageKey);
        if (stored) {
          setPreferredWalletId(stored);
        }
      } catch (error) {
        logger.warn('Failed to load preferred wallet:', error);
      }
    }
  }, [persistPreference, storageKey, logger]);

  // Filter wallets based on chain type using core utility
  const filteredWallets = useMemo(() => {
    if (filterByChainType.length === 0) {
      return availableWallets;
    }
    return filterWalletsByChain(availableWallets, filterByChainType);
  }, [availableWallets, filterByChainType]);

  // Get preferred wallet object
  const preferredWallet = useMemo(() => {
    if (!preferredWalletId) return null;
    return availableWallets.find((w) => w.id === preferredWalletId) || null;
  }, [preferredWalletId, availableWallets]);

  // Wallet availability check
  const isWalletAvailable = useCallback(
    (walletId: string): boolean => {
      const wallet = availableWallets.find((w) => w.id === walletId);
      if (!wallet) {
        return false;
      }

      // Use the enhanced core utility for wallet installation detection
      try {
        return isWalletInstalled(wallet);
      } catch (error) {
        logger.warn('Failed to check wallet availability:', error);
        return false;
      }
    },
    [availableWallets, logger],
  );

  // Get install URL for wallet
  const getInstallUrl = useCallback(
    (walletId: string): string | null => {
      const wallet = availableWallets.find((w) => w.id === walletId);
      if (!wallet) {
        return null;
      }

      // Check if wallet has an install URL in its metadata first
      if ('installUrl' in wallet && typeof wallet.installUrl === 'string') {
        return wallet.installUrl;
      }

      // Use the enhanced core utility for common wallet install URLs
      return coreGetInstallUrl(walletId);
    },
    [availableWallets],
  );

  // Select wallet function
  const selectWallet = useCallback(
    async (wallet: WalletInfo) => {
      if (!client) {
        throw ErrorFactory.configurationError('WalletMesh client not available');
      }

      setIsSelecting(true);
      try {
        if (!isWalletAvailable(wallet.id)) {
          throw ErrorFactory.walletNotFound(`${wallet.name} is not installed`);
        }

        // Trigger connection through client
        await client.connect(wallet.id);

        // Save preference if enabled using core utility
        if (persistPreference) {
          try {
            coreSetPreferredWallet(wallet.id, storageKey);
            setPreferredWalletId(wallet.id);
          } catch (error) {
            logger.warn('Failed to save preferred wallet:', error);
          }
        }
      } finally {
        setIsSelecting(false);
      }
    },
    [client, persistPreference, storageKey, isWalletAvailable, logger],
  );

  // Set preferred wallet using core utility
  const setPreferredWallet = useCallback(
    (wallet: WalletInfo | null) => {
      const walletId = wallet?.id || null;
      setPreferredWalletId(walletId);

      if (persistPreference) {
        try {
          coreSetPreferredWallet(walletId, storageKey);
        } catch (error) {
          logger.warn('Failed to save preferred wallet:', error);
        }
      }
    },
    [persistPreference, storageKey, logger],
  );

  // Clear selection using core utility
  const clearSelection = useCallback(() => {
    setPreferredWalletId(null);
    if (persistPreference) {
      try {
        clearWalletPreference(storageKey);
      } catch (error) {
        logger.warn('Failed to clear preferred wallet:', error);
      }
    }
  }, [persistPreference, storageKey, logger]);

  // Get wallets by chain type using core utility
  const getWalletsByChain = useCallback(
    (chainType: ChainType): WalletInfo[] => {
      return filterWalletsByChain(availableWallets, [chainType]);
    },
    [availableWallets],
  );

  // Get recommended wallet using enhanced core utility
  const getRecommendedWallet = useCallback((): WalletInfo | null => {
    if (walletInfo) return walletInfo;

    // Use the enhanced core utility for intelligent recommendation
    return coreGetRecommendedWallet(filteredWallets, walletInfo, {
      preferInstalled: true,
      preferRecent: true,
      requiredChains: filterByChainType,
    });
  }, [walletInfo, filteredWallets, filterByChainType]);

  // Refresh availability
  const refreshAvailability = useCallback(async () => {
    if (!client) {
      throw ErrorFactory.configurationError('WalletMesh client not available');
    }
    // Would trigger actual wallet discovery
    logger.info('Refreshing wallet availability...');
  }, [client, logger]);

  // Auto-select single wallet if enabled
  useEffect(() => {
    if (autoSelectSingle && filteredWallets.length === 1 && !walletInfo && !isSelecting) {
      const singleWallet = filteredWallets[0];
      if (singleWallet && isWalletAvailable(singleWallet.id)) {
        // Use AbortController for cleanup
        const abortController = new AbortController();

        selectWallet(singleWallet).catch((error) => {
          if (!abortController.signal.aborted) {
            logger.error('Auto-select failed:', error);
          }
        });

        return () => {
          abortController.abort();
        };
      }
    }
    // Return nothing when conditions are not met
    return undefined;
  }, [autoSelectSingle, filteredWallets, walletInfo, isSelecting, isWalletAvailable, selectWallet, logger]);

  // Memoize addresses array to prevent recreation
  const addresses = React.useMemo(
    () => activeSession?.accounts?.map((a) => a.address) || [],
    [activeSession?.accounts],
  );

  // Memoize error object to prevent recreation
  const errorObject = React.useMemo(
    () => (connectionError ? new Error(String(connectionError)) : null),
    [connectionError],
  );

  // Memoize account data separately from methods for better performance
  const accountData = React.useMemo(
    () => ({
      // Core account state
      address: activeSession?.activeAccount?.address || null,
      addresses,
      isConnected: connectionFlags.isConnected,
      isConnecting: connectionFlags.isConnecting,
      isReconnecting: connectionFlags.isReconnecting,
      isDisconnected: connectionFlags.isDisconnected,
      status: connectionFlags.status,

      // Chain information
      chain: activeSession?.chain || null,
      chainType: activeSession?.chain?.chainType || null,

      // Wallet information
      wallet: walletInfo,
      walletId: activeSession?.walletId || null,
      provider: activeSession?.provider?.instance || null,
      error: errorObject,

      // Wallet selection
      availableWallets: filteredWallets,
      preferredWallet,
      isSelecting,
    }),
    [
      activeSession?.activeAccount?.address,
      addresses,
      activeSession?.chain,
      activeSession?.walletId,
      activeSession?.provider?.instance,
      connectionFlags.isConnected,
      connectionFlags.isConnecting,
      connectionFlags.isReconnecting,
      connectionFlags.isDisconnected,
      connectionFlags.status,
      walletInfo,
      errorObject,
      filteredWallets,
      preferredWallet,
      isSelecting,
    ],
  );

  // Memoize methods separately (they rarely change)
  const accountMethods = React.useMemo(
    () => ({
      selectWallet,
      setPreferredWallet,
      getWalletsByChain,
      getRecommendedWallet,
      isWalletAvailable,
      getInstallUrl,
      clearSelection,
      refreshAvailability,
    }),
    [
      selectWallet,
      setPreferredWallet,
      getWalletsByChain,
      getRecommendedWallet,
      isWalletAvailable,
      getInstallUrl,
      clearSelection,
      refreshAvailability,
    ],
  );

  // Combine data and methods
  const accountInfo = React.useMemo(
    (): AccountInfo => ({
      ...accountData,
      ...accountMethods,
    }),
    [accountData, accountMethods],
  );

  // Add debug value for React DevTools
  useDebugValue(accountInfo, (info) => {
    if (info.isConnected && info.wallet) {
      return `Connected: ${info.wallet.name} (${info.address?.slice(0, 6)}...${info.address?.slice(-4)})`;
    }
    if (info.isConnecting) {
      return 'Connecting...';
    }
    if (info.isReconnecting) {
      return 'Reconnecting...';
    }
    return 'Disconnected';
  });

  return accountInfo;
}
