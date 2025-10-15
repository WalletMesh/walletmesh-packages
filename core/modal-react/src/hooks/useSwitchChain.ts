/**
 * Consolidated chain switching and validation hook for WalletMesh
 *
 * Merges functionality from:
 * - useSwitchChain: Chain switching functionality
 * - useEnsureChain: Chain validation and automatic switching
 *
 * Provides methods and state for switching between blockchain networks
 * with validation, error handling, and automatic chain ensurance.
 *
 * @module hooks/useSwitchChain
 */

import { ChainType, ErrorFactory } from '@walletmesh/modal-core';
import type { SupportedChain } from '@walletmesh/modal-core';
import { useCallback, useMemo, useState } from 'react';
import { useWalletMeshContext, useWalletMeshServices } from '../WalletMeshContext.js';
import { createComponentLogger } from '../utils/logger.js';
import { useStore } from './internal/useStore.js';

/**
 * Chain information
 *
 * @public
 */
export interface ChainInfo {
  /** Chain configuration */
  chain: SupportedChain;
  /** Chain type */
  chainType: ChainType;
  /** Chain name */
  name: string;
  /** Chain icon URL */
  icon?: string;
}

/**
 * Switch chain arguments
 *
 * @public
 */
export interface SwitchChainArgs {
  /** Chain to switch to */
  chain: SupportedChain;
  /** Optional chain addition data for chains not yet added to wallet */
  addChainData?: {
    /** Chain name as displayed in wallet */
    chainName: string;
    /** Native currency info */
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    /** RPC URLs in order of preference */
    rpcUrls: string[];
    /** Block explorer URLs (optional) */
    blockExplorerUrls?: string[];
  };
}

/**
 * Switch chain result
 *
 * @public
 */
export interface SwitchChainResult {
  /** New chain configuration */
  chain: SupportedChain;
  /** New chain type */
  chainType: ChainType;
  /** Previous chain configuration */
  previousChain: SupportedChain;
  /** New provider instance */
  provider: unknown;
}

/**
 * Switch chain variables
 *
 * @public
 */
export interface SwitchChainVariables {
  /** Chain being switched to */
  chain: SupportedChain;
  /** Previous chain */
  fromChain?: SupportedChain;
  /** Target wallet ID */
  walletId?: string;
}

/**
 * Hook options for chain switching
 *
 * @public
 */
export interface UseSwitchChainOptions {
  /** Callback fired before chain switch - return false to cancel */
  onConfirm?: (data: {
    fromChain: SupportedChain;
    toChain: SupportedChain;
    walletId: string;
  }) => Promise<boolean> | boolean;
  /** Callback fired on successful switch */
  onSuccess?: (data: { fromChain: SupportedChain; toChain: SupportedChain; walletId: string }) => void;
  /** Callback fired on switch error */
  onError?: (error: Error) => void;
}

/**
 * Chain validation options (from useEnsureChain)
 *
 * @public
 */
export interface ChainValidationOptions {
  /** Whether to automatically switch to the required chain */
  autoSwitch?: boolean;
  /** Custom error message for chain mismatch */
  errorMessage?: string;
  /** Whether to throw an error if chain switch fails */
  throwOnError?: boolean;
}

/**
 * Chain validation result (from useEnsureChain)
 *
 * @public
 */
export interface ChainValidationResult {
  /** Whether the current chain matches the required chain */
  isCorrectChain: boolean;
  /** The current chain */
  currentChain: SupportedChain | null;
  /** The required chain */
  requiredChain: SupportedChain;
  /** Error if chain validation or switching failed */
  error: Error | null;
  /** Whether a chain switch is currently in progress */
  isSwitching: boolean;
}

/**
 * Consolidated hook return type for chain management
 *
 * @public
 */
export interface UseSwitchChainReturn {
  // Core methods
  /** Switch to a different chain */
  switchChain: (chain: SupportedChain, options?: SwitchChainArgs) => Promise<void>;
  /** Async version that returns result */
  switchChainAsync: (chain: SupportedChain, options?: SwitchChainArgs) => Promise<SwitchChainResult>;
  /** Ensure the user is on the correct chain (from useEnsureChain) */
  ensureChain: (
    requiredChain: SupportedChain,
    options?: ChainValidationOptions,
  ) => Promise<ChainValidationResult>;

  // Validation methods
  /** Validate if the current chain matches the required chain */
  validateChain: (requiredChain: SupportedChain) => ChainValidationResult;
  /** Check if a chain is supported */
  isChainSupported: (chain: SupportedChain) => boolean;
  /** Check if on the correct chain (convenience) */
  isCorrectChain: (requiredChain: SupportedChain) => boolean;
  /** Get human-readable chain mismatch message */
  getChainMismatchMessage: (requiredChain: SupportedChain) => string;

  // State
  /** Current chain */
  chain: SupportedChain | null;
  /** Current chain type */
  chainType: ChainType | null;
  /** Available chains */
  chains: ChainInfo[];
  /** Whether currently switching */
  isSwitching: boolean;
  /** Whether the operation is pending */
  isPending: boolean;
  /** Switch/validation error if any */
  error: Error | null;
  /** Reset error state */
  reset: () => void;
  /** Clear validation error (alias for reset) */
  clearError: () => void;
  /** Variables from current/last switch attempt */
  variables: SwitchChainVariables | undefined;
  /** Last validation error (from ensureChain) */
  lastError: Error | null;
}

/**
 * Consolidated hook for switching blockchain networks and ensuring correct chain
 *
 * Provides methods to switch chains with validation, ensure correct chain
 * before operations, loading states, and error handling.
 *
 * @param options - Hook options for callbacks
 * @returns Chain switching and validation methods and state
 *
 * @since 2.0.0
 *
 * @see {@link useAccount} - For account and chain state
 * @see {@link useConnect} - For initial wallet connection
 * @see {@link useTransaction} - For chain-specific transactions
 *
 * @remarks
 * This hook consolidates chain switching and validation functionality.
 * It handles chain switching across different wallet types and includes
 * validation to ensure the target chain is supported. The ensureChain
 * method provides automatic switching when needed.
 *
 * Chain switching flow:
 * 1. Validate wallet connection
 * 2. Check chain support
 * 3. Call confirmation callback (if provided)
 * 4. Switch chain via wallet
 * 5. Update session state
 * 6. Call success callback (if provided)
 *
 * @example
 * ```tsx
 * function ChainManager() {
 *   const {
 *     switchChain,
 *     ensureChain,
 *     chainId,
 *     chains,
 *     isSwitching,
 *     error
 *   } = useSwitchChain();
 *
 *   const handleEthereumAction = async () => {
 *     // Ensure user is on Ethereum mainnet
 *     await ensureChain('0x1', { autoSwitch: true });
 *     // Proceed with Ethereum-specific action
 *   };
 *
 *   return (
 *     <div>
 *       <p>Current Chain: {chainId}</p>
 *       {error && <p>Error: {error.message}</p>}
 *
 *       <select
 *         value={chainId || ''}
 *         onChange={(e) => switchChain(e.target.value)}
 *         disabled={isSwitching}
 *       >
 *         {chains.map(chain => (
 *           <option key={chain.chainId} value={chain.chainId}>
 *             {chain.name}
 *           </option>
 *         ))}
 *       </select>
 *
 *       <button onClick={handleEthereumAction}>
 *         Ethereum Action
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Validate chain before operation
 * function ChainSpecificFeature() {
 *   const { validateChain, ensureChain } = useSwitchChain();
 *
 *   const handlePolygonTransaction = async () => {
 *     // Check chain without auto-switching
 *     const result = validateChain('0x89');
 *
 *     if (!result.isCorrectChain) {
 *       if (confirm('Switch to Polygon to continue?')) {
 *         await ensureChain('0x89', { autoSwitch: true });
 *       }
 *       return;
 *     }
 *
 *     // Proceed with Polygon transaction
 *   };
 *
 *   return (
 *     <button onClick={handlePolygonTransaction}>
 *       Polygon Transaction
 *     </button>
 *   );
 * }
 * ```
 *
 * @public
 */
export function useSwitchChain(options: UseSwitchChainOptions = {}): UseSwitchChainReturn {
  const { client } = useWalletMeshContext();
  const services = useWalletMeshServices();
  const { onConfirm, onSuccess, onError } = options;
  const logger = useMemo(() => createComponentLogger('useSwitchChain'), []);

  // Local state
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastError, setLastError] = useState<Error | null>(null);
  const [variables, setVariables] = useState<SwitchChainVariables | undefined>();

  // Subscribe to current state
  const state = useStore((state) => {
    const activeSessionId = state.active?.sessionId;
    const activeSession = activeSessionId ? state.entities?.sessions?.[activeSessionId] : null;

    const walletInfo = activeSession?.walletId ? state.entities?.wallets?.[activeSession.walletId] : null;

    return {
      chain: activeSession?.chain || null,
      chainType: activeSession?.chain?.chainType || null,
      activeWallet: activeSession?.walletId || null,
      walletInfo,
      isConnected: activeSession?.status === 'connected',
    };
  });

  // Memoize chain transformation function to avoid recreating it
  const transformChainInfo = useCallback(
    (coreChain: { chainId: string; chainType: ChainType; name: string; icon?: string | undefined }) => ({
      chain: {
        chainId: coreChain.chainId,
        chainType: coreChain.chainType,
        name: coreChain.name,
        required: true, // Default for compatibility
      },
      chainType: coreChain.chainType,
      name: coreChain.name,
      ...(coreChain.icon && { icon: coreChain.icon }),
    }),
    [],
  );

  // Get available chains with better memoization
  const chains = useMemo(() => {
    // During initialization, services might not be available yet
    if (!services?.chain) {
      // This is expected during initial render or SSR
      logger.debug('Chain service not yet available, returning empty chains array');
      return [];
    }
    try {
      const coreChains = !state.walletInfo
        ? services.chain.getAllChains()
        : services.chain.getSupportedChainsForWallet(state.walletInfo);

      // Transform modal-core ChainInfo to local ChainInfo interface
      return coreChains.map(transformChainInfo);
    } catch (error) {
      logger.error('Failed to get supported chains:', error);
      return [];
    }
  }, [services?.chain, state.walletInfo, transformChainInfo, logger]);

  // Check if chain is supported
  const isChainSupported = useCallback(
    (chain: SupportedChain): boolean => {
      if (!services?.chain) {
        logger.debug('Chain service not yet available, cannot check chain support');
        return false;
      }
      try {
        // First check if chain exists
        if (!services.chain.hasChain(chain.chainId)) {
          return false;
        }

        // If we have wallet info, check if wallet supports the chain
        if (state.walletInfo) {
          const supportedChains = services.chain.getSupportedChainsForWallet(state.walletInfo);
          return supportedChains.some((supportedChain) => supportedChain.chainId === chain.chainId);
        }

        // If no wallet info, just check if chain exists
        return true;
      } catch (error) {
        logger.error('Failed to check chain support:', error);
        return false;
      }
    },
    [services?.chain, state.walletInfo, logger],
  );

  // Reset error state
  const reset = useCallback(() => {
    setError(null);
    setLastError(null);
  }, []);

  // Alias for reset (from useEnsureChain)
  const clearError = reset;

  // Switch chain implementation
  const switchChainAsync = useCallback(
    async (chain: SupportedChain, _switchOptions?: SwitchChainArgs): Promise<SwitchChainResult> => {
      setIsSwitching(true);
      setError(null);

      const switchVariables: SwitchChainVariables = {
        chain,
        ...(state.chain && { fromChain: state.chain }),
        ...(state.activeWallet && { walletId: state.activeWallet }),
      };
      setVariables(switchVariables);

      try {
        if (!state.activeWallet) {
          throw ErrorFactory.connectionFailed('No wallet connected');
        }

        if (!services?.chain) {
          throw ErrorFactory.configurationError('Chain service not available');
        }

        // Check if chain is supported
        if (!services.chain.hasChain(chain.chainId)) {
          throw ErrorFactory.notFound(`Chain ${chain.chainId} is not registered`);
        }

        // Get chain info for display
        const fromChainInfo = state.chain ? services.chain.getChain(state.chain.chainId) : null;
        const toChainInfo = services.chain.getChain(chain.chainId);

        // If wallet info available, check wallet support
        if (state.walletInfo) {
          const supportedChains = services.chain.getSupportedChainsForWallet(state.walletInfo);
          if (!supportedChains.some((supportedChain) => supportedChain.chainId === chain.chainId)) {
            throw ErrorFactory.validation(
              `Chain ${chain.chainId} is not supported by wallet ${state.walletInfo.name}`,
            );
          }
        }

        // Check if already on target chain
        if (state.chain && state.chain.chainId === chain.chainId) {
          const result: SwitchChainResult = {
            chain: state.chain,
            chainType: state.chainType || ChainType.Evm,
            previousChain: state.chain,
            provider: null,
          };
          return result;
        }

        // Call confirmation callback if provided
        if (onConfirm && state.chain) {
          const shouldProceed = await onConfirm({
            fromChain: state.chain,
            toChain: chain,
            walletId: state.activeWallet,
          });
          if (!shouldProceed) {
            throw ErrorFactory.userRejected('User cancelled chain switch');
          }
        }

        // Set UI state to switchingChain for animations
        const { getStoreInstance } = await import('@walletmesh/modal-core');
        const storeInstance = getStoreInstance();

        if (storeInstance) {
          // Access the actions from the store
          const { actions } = await import('@walletmesh/modal-core');

          // Set switching chain view and data
          actions.ui.setView(storeInstance, 'switchingChain');
          actions.ui.setSwitchingChainData(storeInstance, {
            ...(fromChainInfo && {
              fromChain: { chainId: String(fromChainInfo.chainId), name: fromChainInfo.name },
            }),
            ...(toChainInfo && { toChain: { chainId: String(toChainInfo.chainId), name: toChainInfo.name } }),
          });
        }

        // Perform the switch
        if (!client) {
          throw ErrorFactory.configurationError(
            'WalletMesh client not available. Make sure you are not in SSR mode.',
          );
        }
        if (!client.switchChain) {
          throw ErrorFactory.configurationError('Chain switching not supported by this client');
        }

        const result = await client.switchChain(chain.chainId.toString(), state.activeWallet);

        // Validate result structure
        if (!result || typeof result !== 'object') {
          throw ErrorFactory.validation('Invalid switch chain result');
        }

        const typedResult = result as Record<string, unknown>;
        const chainType =
          'chainType' in typedResult ? (typedResult['chainType'] as ChainType) : chain.chainType;
        const provider = 'provider' in typedResult ? typedResult['provider'] : null;

        const switchResult: SwitchChainResult = {
          chain: chain,
          chainType: chainType,
          previousChain: state.chain || chain,
          provider: provider,
        };

        // Reset UI state to connected on success
        if (storeInstance) {
          const { actions } = await import('@walletmesh/modal-core');
          actions.ui.setView(storeInstance, 'connected');
          actions.ui.setSwitchingChainData(storeInstance, undefined);
        }

        // Call success callback
        if (onSuccess && state.chain) {
          onSuccess({
            fromChain: state.chain,
            toChain: chain,
            walletId: state.activeWallet,
          });
        }

        return switchResult;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to switch chain');
        logger.error('Chain switch failed:', error);
        setError(error);
        setLastError(error);

        // Set error state on failure
        const { getStoreInstance } = await import('@walletmesh/modal-core');
        const errorStoreInstance = getStoreInstance();

        if (errorStoreInstance) {
          const { actions } = await import('@walletmesh/modal-core');
          actions.ui.setView(errorStoreInstance, 'error');
          actions.ui.setSwitchingChainData(errorStoreInstance, undefined);
        }

        if (onError) {
          onError(error);
        }

        throw error;
      } finally {
        setIsSwitching(false);
        setVariables(undefined);
      }
    },
    [
      client,
      services?.chain,
      state.activeWallet,
      state.chain,
      state.chainType,
      state.walletInfo,
      onConfirm,
      onSuccess,
      onError,
      logger,
    ],
  );

  // Switch chain with void return
  const switchChain = useCallback(
    async (chain: SupportedChain, switchOptions?: SwitchChainArgs): Promise<void> => {
      await switchChainAsync(chain, switchOptions);
    },
    [switchChainAsync],
  );

  // Validate chain (from useEnsureChain)
  const validateChain = useCallback(
    (requiredChain: SupportedChain): ChainValidationResult => {
      const isCorrectChain = state.chain?.chainId === requiredChain.chainId && state.isConnected;
      const validationError = !state.isConnected ? new Error('Wallet not connected') : null;

      return {
        isCorrectChain,
        currentChain: state.chain,
        requiredChain: requiredChain,
        error: validationError || lastError,
        isSwitching,
      };
    },
    [state.chain, state.isConnected, lastError, isSwitching],
  );

  // Ensure chain (from useEnsureChain)
  const ensureChain = useCallback(
    async (
      requiredChain: SupportedChain,
      options: ChainValidationOptions = {},
    ): Promise<ChainValidationResult> => {
      const { autoSwitch = false, throwOnError = false } = options;

      setLastError(null);

      // Validate current chain
      const isCorrectChain = state.chain?.chainId === requiredChain.chainId && state.isConnected;
      const validationError = !state.isConnected ? new Error('Wallet not connected') : null;

      // If validation passes or no auto-switch needed, return result
      if (isCorrectChain || !autoSwitch) {
        if (validationError) {
          setLastError(validationError);
          if (throwOnError) {
            throw validationError;
          }
        }

        return {
          isCorrectChain,
          currentChain: state.chain,
          requiredChain: requiredChain,
          error: validationError,
          isSwitching: false,
        };
      }

      // Check if auto-switch should be attempted
      if (!state.isConnected) {
        const error = new Error('Wallet not connected');
        setLastError(error);
        if (throwOnError) {
          throw error;
        }

        return {
          isCorrectChain: false,
          currentChain: state.chain,
          requiredChain: requiredChain,
          error,
          isSwitching: false,
        };
      }

      // Attempt to switch chain
      try {
        setIsSwitching(true);
        await switchChain(requiredChain);

        // Return success result
        const successResult: ChainValidationResult = {
          isCorrectChain: true,
          currentChain: requiredChain,
          requiredChain: requiredChain,
          error: null,
          isSwitching: false,
        };

        setIsSwitching(false);
        return successResult;
      } catch (error) {
        const switchError =
          error instanceof Error ? error : new Error(`Failed to switch to chain ${requiredChain.chainId}`);

        logger.error('Chain switch failed:', error);
        setLastError(switchError);
        setIsSwitching(false);

        if (throwOnError) {
          throw switchError;
        }

        return {
          isCorrectChain: false,
          currentChain: state.chain,
          requiredChain: requiredChain,
          error: switchError,
          isSwitching: false,
        };
      }
    },
    [state.chain, state.isConnected, switchChain, logger],
  );

  // Check if on correct chain (convenience)
  const isCorrectChain = useCallback(
    (requiredChain: SupportedChain): boolean => {
      return validateChain(requiredChain).isCorrectChain;
    },
    [validateChain],
  );

  // Get chain mismatch message
  const getChainMismatchMessage = useCallback(
    (requiredChain: SupportedChain): string => {
      return `Wrong chain. Expected ${requiredChain.chainId}, got ${state.chain?.chainId || 'unknown'}`;
    },
    [state.chain],
  );

  return {
    // Methods
    switchChain,
    switchChainAsync,
    ensureChain,
    validateChain,
    isChainSupported,
    isCorrectChain,
    getChainMismatchMessage,

    // State
    chain: state.chain,
    chainType: state.chainType,
    chains,
    isSwitching,
    isPending: isSwitching,
    error,
    reset,
    clearError,
    variables,
    lastError,
  };
}

/**
 * Hook to get supported chains
 *
 * Returns list of chains supported by the current wallet.
 *
 * @returns Array of supported chains
 *
 * @since 1.0.0
 *
 * @example
 * ```tsx
 * function SupportedChains() {
 *   const supportedChains = useSupportedChains();
 *
 *   return (
 *     <ul>
 *       {supportedChains.map(chain => (
 *         <li key={chain.chainId}>
 *           {chain.name} ({chain.chainType})
 *         </li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 *
 * @public
 */
export function useSupportedChains(): ChainInfo[] {
  const services = useWalletMeshServices();
  const logger = useMemo(() => createComponentLogger('useSupportedChains'), []);

  return useStore((state) => {
    const activeSessionId = state.active?.sessionId;
    const activeSession = activeSessionId ? state.entities?.sessions?.[activeSessionId] : null;

    if (!activeSession) return [];

    const walletInfo = activeSession.walletId ? state.entities?.wallets?.[activeSession.walletId] : null;
    if (!walletInfo) return [];

    if (!services?.chain) {
      logger.debug('Chain service not yet available');
      return [];
    }
    try {
      const coreChains = services.chain.getSupportedChainsForWallet(walletInfo);

      // Transform modal-core ChainInfo to local ChainInfo interface
      return coreChains.map((coreChain) => ({
        chain: {
          chainId: coreChain.chainId,
          chainType: coreChain.chainType,
          name: coreChain.name,
          required: true, // Default for compatibility
        },
        chainType: coreChain.chainType,
        name: coreChain.name,
        ...(coreChain.icon && { icon: coreChain.icon }),
      }));
    } catch (error) {
      logger.error('Failed to get supported chains:', error);
      return [];
    }
  });
}

/**
 * Hook to check if currently switching chains
 *
 * Simple boolean hook for switch loading state.
 *
 * @returns True if switching, false otherwise
 *
 * @since 1.0.0
 *
 * @public
 */
export function useIsSwitchingChain(): boolean {
  // This would need to be tracked in the store for global state
  return false;
}

/**
 * Hook to validate chain compatibility
 *
 * Checks if a chain is compatible with the current wallet.
 *
 * @param chain - Chain to validate
 * @returns True if compatible, false otherwise
 *
 * @since 1.0.0
 *
 * @public
 */
export function useIsChainCompatible(chain: SupportedChain): boolean {
  const services = useWalletMeshServices();
  const logger = useMemo(() => createComponentLogger('useIsChainCompatible'), []);

  const walletInfo = useStore((state) => {
    const activeSessionId = state.active?.sessionId;
    const activeSession = activeSessionId ? state.entities?.sessions?.[activeSessionId] : null;
    return activeSession?.walletId ? state.entities?.wallets?.[activeSession.walletId] || null : null;
  });

  if (walletInfo && services?.chain) {
    try {
      const compatibility = services.chain.checkChainCompatibility(chain.chainId, { wallet: walletInfo });
      return compatibility.isCompatible;
    } catch (error) {
      logger.error('Failed to check chain compatibility:', error);
      return false;
    }
  }

  return false;
}

/**
 * Hook for requiring a specific chain type
 *
 * Specialized hook for ensuring the user is connected to a specific
 * chain type (e.g., EVM, Solana) rather than a specific chain ID.
 *
 * @param requiredChainType - The required chain type
 * @returns Chain type validation result
 *
 * @example
 * ```tsx
 * function EvmOnlyFeature() {
 *   const { isCorrectChainType, currentChainType, error } = useRequireChainType('evm');
 *
 *   if (!isCorrectChainType) {
 *     return (
 *       <div>
 *         <p>This feature requires an EVM-compatible chain.</p>
 *         <p>Current chain type: {currentChainType || 'Unknown'}</p>
 *         {error && <p style={{ color: 'red' }}>{error.message}</p>}
 *       </div>
 *     );
 *   }
 *
 *   return <div>EVM feature ready!</div>;
 * }
 * ```
 *
 * @public
 */
export function useRequireChainType(requiredChainType: ChainType) {
  const state = useStore((state) => {
    const activeSessionId = state.active?.sessionId;
    const activeSession = activeSessionId ? state.entities?.sessions?.[activeSessionId] : null;

    return {
      chainType: activeSession?.chain?.chainType || null,
      isConnected: activeSession?.status === 'connected',
    };
  });

  const isCorrectChainType = state.isConnected && state.chainType === requiredChainType;

  const error = !state.isConnected
    ? new Error('Wallet not connected')
    : state.chainType !== requiredChainType
      ? new Error(`Wrong chain type. Expected ${requiredChainType}, got ${state.chainType || 'unknown'}`)
      : null;

  return {
    isCorrectChainType,
    currentChainType: state.chainType,
    requiredChainType,
    error,
  };
}
