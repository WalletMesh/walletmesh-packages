/**
 * Consolidated Aztec wallet hook
 *
 * A unified hook that combines account information and Aztec provider
 * functionality into a single, easy-to-use interface. Provides typed access
 * to Aztec blockchain functionality with convenient methods for operations.
 *
 * @module hooks/useAztecWallet
 * @packageDocumentation
 */

import type { SupportedChain, WalletInfo } from '@walletmesh/modal-core';
import { ErrorFactory } from '@walletmesh/modal-core';
import type { AztecDappWallet } from '@walletmesh/modal-core/providers/aztec/lazy';
import { useEffect, useMemo, useState } from 'react';
import { useWalletMeshContext } from '../WalletMeshContext.js';
import { useStore } from './internal/useStore.js';
import { useAccount } from './useAccount.js';
import { useWalletProvider } from './useWalletProvider.js';

// Type imports - these will be loaded dynamically from modal-core
type CreateAztecWalletFunction = (provider: unknown, options?: unknown) => Promise<AztecDappWallet | null>;

/**
 * Categorizes Aztec permissions for React-level logging purposes.
 * @param permissions - Array of permission method names
 * @returns Object mapping categories to arrays of permissions
 */
function categorizeReactPermissions(permissions: string[]): Record<string, string[]> {
  const categories = {
    account: [] as string[],
    chain: [] as string[],
    transaction: [] as string[],
    contract: [] as string[],
    auth: [] as string[],
    event: [] as string[],
    walletmesh: [] as string[],
    other: [] as string[],
  };

  for (const permission of permissions) {
    if (permission.includes('Address') || permission.includes('CompleteAddress')) {
      categories.account.push(permission);
    } else if (
      permission.includes('Chain') ||
      permission.includes('Version') ||
      permission.includes('Block') ||
      permission.includes('Fees') ||
      permission.includes('Node') ||
      permission.includes('PXE')
    ) {
      categories.chain.push(permission);
    } else if (
      permission.includes('Tx') ||
      permission.includes('Transaction') ||
      permission.includes('simulat') ||
      permission.includes('prove')
    ) {
      categories.transaction.push(permission);
    } else if (permission.includes('Contract') || permission.includes('register')) {
      categories.contract.push(permission);
    } else if (permission.includes('Auth') || permission.includes('Wit')) {
      categories.auth.push(permission);
    } else if (permission.includes('Event')) {
      categories.event.push(permission);
    } else if (permission.includes('wm') || permission.includes('Wm')) {
      categories.walletmesh.push(permission);
    } else {
      categories.other.push(permission);
    }
  }

  // Remove empty categories
  return Object.fromEntries(Object.entries(categories).filter(([_, perms]) => perms.length > 0));
}

/**
 * Consolidated Aztec wallet information with both account and provider data
 *
 * @public
 */
export interface AztecWalletInfo {
  // Account information
  /** Whether wallet is connected */
  isConnected: boolean;
  /** Current account address */
  address: string | null;
  /** Current chain information */
  chain: SupportedChain | null;
  /** Current chain ID */
  chainId: string | null;
  /** Wallet information */
  wallet: WalletInfo | null;

  // Provider information
  /** Aztec wallet instance with typed methods */
  aztecWallet: AztecDappWallet | null;
  /** Whether Aztec wallet is ready for use */
  isReady: boolean;
  /** Whether currently initializing Aztec wallet */
  isLoading: boolean;
  /** Combined error from account or provider */
  error: Error | null;

  // Additional provider info
  /** Whether wallet is available */
  isAvailable: boolean;
  /** Wallet ID providing this provider */
  walletId: string | null;

  // Status information
  /** Overall status combining connection and wallet readiness */
  status: 'disconnected' | 'connecting' | 'connected' | 'ready' | 'error';
  /** Whether on an Aztec chain */
  isAztecChain: boolean;
}

/**
 * Hook that combines account and Aztec provider functionality
 *
 * Provides a simplified interface that consolidates connection state,
 * account information, and Aztec wallet functionality into a single hook.
 * This reduces complexity and provides better developer experience compared
 * to using multiple hooks.
 *
 * @param chain - Optional specific chain to get provider for
 * @returns Consolidated Aztec wallet information
 *
 * @since 1.0.0
 *
 * @remarks
 * This hook automatically handles:
 * - Connection state management
 * - Aztec wallet initialization
 * - Error consolidation
 * - Loading states
 * - Chain validation
 *
 * The hook returns a `status` field that provides an overall state:
 * - `disconnected`: No wallet connected
 * - `connecting`: Wallet connection in progress
 * - `connected`: Wallet connected but Aztec wallet not ready
 * - `ready`: Aztec wallet fully initialized and ready for use
 * - `error`: Error occurred during connection or initialization
 *
 * @example
 * ```tsx
 * import { useAztecWallet } from '@walletmesh/modal-react';
 *
 * function MyComponent() {
 *   const { isReady, aztecWallet, address, error, status } = useAztecWallet();
 *
 *   if (status === 'error') {
 *     return <div>Error: {error?.message}</div>;
 *   }
 *
 *   if (status === 'connecting') {
 *     return <div>Initializing Aztec wallet...</div>;
 *   }
 *
 *   if (!isReady) {
 *     return <div>Please connect an Aztec wallet</div>;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Connected: {address}</p>
 *       <button onClick={() => deployContract()}>
 *         Deploy Contract
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Usage with contract interactions
 * function ContractInteraction() {
 *   const { aztecWallet, isReady, status } = useAztecWallet();
 *
 *   const deployContract = async () => {
 *     if (!aztecWallet) return;
 *
 *     const deployment = await aztecWallet.deployContract(
 *       TokenContract,
 *       [ownerAddress, 'MyToken', 'MTK', 18]
 *     );
 *
 *     const contract = await deployment.deployed();
 *     console.log('Contract deployed:', contract.address);
 *   };
 *
 *   const sendTransaction = async () => {
 *     if (!aztecWallet) return;
 *
 *     const contract = await Contract.at(contractAddress, TokenContract, aztecWallet);
 *     const interaction = contract.methods.transfer(recipient, amount);
 *
 *     const tx = await aztecWallet.wmExecuteTx(interaction);
 *     const receipt = await tx.wait();
 *
 *     console.log('Transaction complete:', receipt);
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={deployContract} disabled={!isReady}>
 *         Deploy Contract
 *       </button>
 *       <button onClick={sendTransaction} disabled={!isReady}>
 *         Send Transaction
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @public
 */
export function useAztecWallet(chain?: SupportedChain): AztecWalletInfo {
  // Get account information
  const { isConnected, address, wallet, isReconnecting } = useAccount();

  // Get provider information
  const {
    provider,
    isAvailable,
    isConnecting: providerConnecting,
    error: providerError,
    walletId,
  } = useWalletProvider(chain);
  const { config } = useWalletMeshContext();

  // Local state for the Aztec wallet instance
  const [aztecWallet, setAztecWallet] = useState<AztecDappWallet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);

  // Subscribe to connection state
  const connectionState = useStore((state) => {
    const activeSessionId = state.active?.sessionId;
    const activeSession = activeSessionId ? state.entities.sessions?.[activeSessionId] : null;

    return {
      currentChain: activeSession?.chain || null,
      chainType: activeSession?.chain?.chainType || null,
    };
  });

  const targetChain = chain || connectionState.currentChain;
  const isAztecChain = targetChain?.chainType === 'aztec';

  // Initialize Aztec wallet when provider becomes available
  useEffect(() => {
    let cancelled = false;
    let isInitializing = false;

    async function initializeAztecWallet() {
      // Early return if not an Aztec chain or no provider
      if (!isAztecChain || !provider || !isAvailable) {
        setAztecWallet(null);
        setIsLoading(false);
        if (!isAztecChain && provider) {
          setInitError(new Error('Not connected to an Aztec chain'));
        }
        return;
      }

      // Check if we are already initializing
      if (isInitializing) {
        return;
      }

      isInitializing = true;
      setIsLoading(true);
      setInitError(null);

      try {
        // Dynamically import Aztec utilities from modal-core lazy exports
        console.log('[useAztecProvider] Importing Aztec module...');
        const aztecModule = await import('@walletmesh/modal-core/providers/aztec/lazy');
        const createAztecWallet = aztecModule.createAztecWallet as CreateAztecWalletFunction;

        if (cancelled) return;

        // Get permissions from config for the target chain
        const permissions =
          (config as { permissions?: Record<string, string[]> }).permissions?.[targetChain.chainId] ||
          undefined;

        // 🔗 REACT-LEVEL PERMISSION LOG: Show what permissions React hook is using
        if (permissions && permissions.length > 0) {
          console.log('⚛️ REACT HOOK - Permission Usage', {
            source: 'React useAztecWallet hook',
            chainId: targetChain.chainId,
            hook: 'useAztecWallet',
            permissionsFromConfig: permissions,
            permissionCount: permissions.length,
            message: '✅ React hook is using permissions from provider config',
            dataFlow: 'AztecWalletMeshProvider config.permissions → useAztecWallet → createAztecWallet',
            troubleshooting: {
              location: 'These permissions come from your AztecWalletMeshProvider config',
              validation: 'React hook validates config.permissions exists before using',
              categories: categorizeReactPermissions(permissions),
            },
          });
        } else {
          console.warn('⚠️ REACT HOOK - No Permissions Found in Config', {
            source: 'React useAztecWallet hook',
            chainId: targetChain.chainId,
            hook: 'useAztecWallet',
            issue: 'No permissions found in React provider config',
            configValue: (config as { permissions?: Record<string, string[]> }).permissions,
            impact: 'createAztecWallet will be called without specific permissions',
            solution: 'Add permissions to your AztecWalletMeshProvider config',
            example: "<AztecWalletMeshProvider config={{ permissions: ['aztec_getAddress', ...] }}>",
          });
        }

        // Use the existing provider directly - no new provider creation
        console.log(
          '[useAztecProvider] Creating Aztec wallet wrapper for existing provider',
          'provider type:',
          provider.constructor.name,
          'chainId:',
          targetChain.chainId,
          'isAvailable:',
          isAvailable,
        );

        const wallet = await createAztecWallet(provider, {
          chainId: targetChain.chainId,
          permissions: permissions ? { [targetChain.chainId]: permissions } : undefined,
        });

        if (!cancelled) {
          if (wallet) {
            console.log('[useAztecProvider] Aztec wallet wrapper created successfully');
            setAztecWallet(wallet);
          } else {
            console.error('[useAztecProvider] createAztecWallet returned null');
            setInitError(new Error('Failed to create Aztec wallet wrapper'));
          }
          setIsLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          const errorMessage =
            error instanceof Error ? error : new Error('Failed to initialize Aztec wallet');
          setInitError(errorMessage);
          setIsLoading(false);
          console.error('[useAztecProvider] Failed to initialize Aztec wallet:', error);
        }
      } finally {
        isInitializing = false;
      }
    }

    initializeAztecWallet();

    return () => {
      cancelled = true;
      isInitializing = false;
    };
  }, [provider, isAztecChain, isAvailable, targetChain?.chainId, config]);

  // Cleanup effect when component unmounts or wallet changes
  useEffect(() => {
    return () => {
      if (aztecWallet && provider) {
        try {
          // Clear the cached wallet instance for this provider
          import('@walletmesh/modal-core/providers/aztec/lazy').then((module) => {
            module.clearAztecWalletCache(provider as Parameters<typeof module.clearAztecWalletCache>[0]);
          });

          // If the wallet has a dispose method, call it
          const walletWithDispose = aztecWallet as AztecDappWallet & { dispose?: () => void };
          if (typeof walletWithDispose.dispose === 'function') {
            walletWithDispose.dispose();
          }
        } catch (error) {
          console.warn('[useAztecProvider] Error disposing wallet instance on unmount:', error);
        }
      }
    };
  }, [aztecWallet, provider]);

  // Consolidate information
  const walletInfo = useMemo<AztecWalletInfo>(() => {
    const combinedError = providerError || initError;

    // Determine overall status
    let status: AztecWalletInfo['status'];
    if (combinedError) {
      status = 'error';
    } else if (!isConnected) {
      status = 'disconnected';
    } else if (isReconnecting || providerConnecting || isLoading) {
      status = 'connecting';
    } else if (isConnected && !aztecWallet) {
      status = 'connected';
    } else if (isConnected && aztecWallet && isAvailable) {
      status = 'ready';
    } else {
      status = 'connected';
    }

    return {
      // Account information
      isConnected,
      address: address || null,
      chain: targetChain,
      chainId: targetChain?.chainId || null,
      wallet,

      // Provider information
      aztecWallet,
      isReady: Boolean(aztecWallet && isAvailable && isConnected),
      isLoading: isLoading || isReconnecting,
      error: combinedError,

      // Additional provider info
      isAvailable: Boolean(aztecWallet && isAvailable),
      walletId,

      // Status information
      status,
      isAztecChain,
    };
  }, [
    isConnected,
    address,
    targetChain,
    wallet,
    aztecWallet,
    isAvailable,
    providerConnecting,
    isLoading,
    providerError,
    initError,
    isReconnecting,
    walletId,
    isAztecChain,
  ]);

  return walletInfo;
}

/**
 * Hook that throws an error if Aztec wallet is not ready
 *
 * Convenience hook for components that require an Aztec wallet to function.
 * Will throw an error with helpful message if wallet is not connected or ready.
 *
 * @param chain - Optional specific chain to get provider for
 * @returns Aztec wallet information (guaranteed to be ready)
 * @throws Error if wallet is not ready
 *
 * @example
 * ```tsx
 * function RequiresWallet() {
 *   const { aztecWallet, address } = useAztecWalletRequired();
 *
 *   // aztecWallet is guaranteed to be non-null here
 *   const deployContract = () => aztecWallet.deployContract(...);
 *
 *   return <button onClick={deployContract}>Deploy</button>;
 * }
 * ```
 *
 * @public
 */
export function useAztecWalletRequired(
  chain?: SupportedChain,
): Required<Pick<AztecWalletInfo, 'aztecWallet' | 'address'>> & AztecWalletInfo {
  const walletInfo = useAztecWallet(chain);

  if (!walletInfo.isReady || !walletInfo.aztecWallet || !walletInfo.address) {
    const message = !walletInfo.isConnected
      ? 'Aztec wallet must be connected to use this component'
      : !walletInfo.isAztecChain
        ? 'Must be connected to an Aztec chain to use this component'
        : 'Aztec wallet is still initializing';

    throw ErrorFactory.configurationError(message);
  }

  return {
    ...walletInfo,
    aztecWallet: walletInfo.aztecWallet,
    address: walletInfo.address,
  };
}
