/**
 * Consolidated Solana wallet hook
 *
 * A simplified hook that combines account information and Solana provider
 * functionality into a single, easy-to-use interface. Reduces the need
 * to use multiple hooks and provides better developer experience.
 *
 * @module hooks/useSolanaWallet
 * @packageDocumentation
 */

import type { SolanaProvider, SupportedChain, WalletInfo } from '@walletmesh/modal-core';
import { ErrorFactory } from '@walletmesh/modal-core';
import { useMemo } from 'react';
import { useAccount } from './useAccount.js';
import { useWalletProvider } from './useWalletProvider.js';

/**
 * Consolidated Solana wallet information with both account and provider data
 *
 * @public
 */
export interface SolanaWalletInfo {
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
  /** Solana provider instance with typed methods */
  solanaProvider: SolanaProvider | null;
  /** Whether Solana provider is ready for use */
  isReady: boolean;
  /** Whether currently initializing Solana provider */
  isLoading: boolean;
  /** Combined error from account or provider */
  error: Error | null;

  // Status information
  /** Overall status combining connection and provider readiness */
  status: 'disconnected' | 'connecting' | 'connected' | 'ready' | 'error';
  /** Whether on a Solana chain */
  isSolanaChain: boolean;
  /** Whether currently processing a transaction */
  isTransacting: boolean;
}

/**
 * Hook that combines account and Solana provider functionality
 *
 * Provides a simplified interface that consolidates connection state,
 * account information, and Solana provider functionality into a single hook.
 * This reduces complexity and provides better developer experience compared
 * to using multiple hooks.
 *
 * @param chain - Optional specific chain to get provider for
 * @returns Consolidated Solana wallet information
 *
 * @since 1.0.0
 *
 * @remarks
 * This hook automatically handles:
 * - Connection state management
 * - Solana provider initialization
 * - Error consolidation
 * - Loading states
 * - Chain validation
 *
 * The hook returns a `status` field that provides an overall state:
 * - `disconnected`: No wallet connected
 * - `connecting`: Wallet connection in progress
 * - `connected`: Wallet connected but Solana provider not ready
 * - `ready`: Solana provider fully initialized and ready for use
 * - `error`: Error occurred during connection or initialization
 *
 * @example
 * ```tsx
 * import { useSolanaWallet } from '@walletmesh/modal-react';
 *
 * function MyComponent() {
 *   const { isReady, solanaProvider, address, error, status } = useSolanaWallet();
 *
 *   if (status === 'error') {
 *     return <div>Error: {error?.message}</div>;
 *   }
 *
 *   if (status === 'loading') {
 *     return <div>Initializing Solana wallet...</div>;
 *   }
 *
 *   if (!isReady) {
 *     return <div>Please connect a Solana wallet</div>;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Connected: {address}</p>
 *       <button onClick={() => sendTransaction()}>
 *         Send Transaction
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Usage with transaction sending
 * function TransactionSender() {
 *   const { solanaProvider, isReady, status } = useSolanaWallet();
 *
 *   const sendSOL = async () => {
 *     if (!solanaProvider) return;
 *
 *     const txHash = await solanaProvider.request({
 *       method: 'sol_sendTransaction',
 *       params: [{
 *         to: '...',
 *         value: 1000000000, // 1 SOL in lamports
 *       }]
 *     });
 *
 *     console.log('Transaction sent:', txHash);
 *   };
 *
 *   const signMessage = async () => {
 *     if (!solanaProvider) return;
 *
 *     const signature = await solanaProvider.request({
 *       method: 'sol_signMessage',
 *       params: ['Hello Solana!']
 *     });
 *
 *     console.log('Message signed:', signature);
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={sendSOL} disabled={!isReady}>
 *         Send 1 SOL
 *       </button>
 *       <button onClick={signMessage} disabled={!isReady}>
 *         Sign Message
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Usage with program interactions
 * function ProgramInteraction() {
 *   const { solanaProvider, isReady, chainId } = useSolanaWallet();
 *
 *   const callProgram = async () => {
 *     if (!solanaProvider) return;
 *
 *     const result = await solanaProvider.request({
 *       method: 'sol_getAccountInfo',
 *       params: ['...'] // program address
 *     });
 *
 *     console.log('Program call result:', result);
 *   };
 *
 *   return (
 *     <div>
 *       <p>Cluster: {chainId}</p>
 *       <button onClick={callProgram} disabled={!isReady}>
 *         Call Program
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @public
 */
export function useSolanaWallet(chain?: SupportedChain): SolanaWalletInfo {
  // Get account information
  const { isConnected, address, wallet, isReconnecting } = useAccount();

  // Get Solana provider information
  const walletProviderInfo = useWalletProvider(chain);
  const {
    provider,
    isAvailable,
    isConnecting: providerConnecting,
    chain: currentChain,
    error: providerError,
  } = walletProviderInfo;

  // Cast to SolanaProvider when it's a Solana chain
  const solanaProvider =
    currentChain?.chainType === 'solana' && provider ? (provider as unknown as SolanaProvider) : null;

  // Consolidate information
  const walletInfo = useMemo<SolanaWalletInfo>(() => {
    const isSolanaChain = currentChain?.chainType === 'solana';
    const combinedError = providerError;

    // Determine overall status
    let status: SolanaWalletInfo['status'];
    if (combinedError) {
      status = 'error';
    } else if (!isConnected) {
      status = 'disconnected';
    } else if (isReconnecting || providerConnecting) {
      status = 'connecting';
    } else if (isConnected && !solanaProvider) {
      status = 'connected';
    } else if (isConnected && solanaProvider && isAvailable) {
      status = 'ready';
    } else {
      status = 'connected';
    }

    return {
      // Account information
      isConnected,
      address: address || null,
      chain: currentChain,
      chainId: currentChain?.chainId || null,
      wallet,

      // Provider information
      solanaProvider,
      isReady: Boolean(solanaProvider && isAvailable && isConnected),
      isLoading: providerConnecting || isReconnecting,
      error: combinedError,

      // Status information
      status,
      isSolanaChain,
      isTransacting: false, // Will be set when transaction events are supported
    };
  }, [
    isConnected,
    address,
    currentChain,
    wallet,
    solanaProvider,
    isAvailable,
    providerConnecting,
    providerError,
    isReconnecting,
  ]);

  return walletInfo;
}

/**
 * Hook that throws an error if Solana wallet is not ready
 *
 * Convenience hook for components that require a Solana wallet to function.
 * Will throw an error with helpful message if wallet is not connected or ready.
 *
 * @param chain - Optional specific chain to get provider for
 * @returns Solana wallet information (guaranteed to be ready)
 * @throws Error if wallet is not ready
 *
 * @example
 * ```tsx
 * function RequiresSolanaWallet() {
 *   const { solanaProvider, address } = useSolanaWalletRequired();
 *
 *   // solanaProvider is guaranteed to be non-null here
 *   const sendTransaction = () => solanaProvider.request({
 *     method: 'sol_sendTransaction',
 *     params: [{ to: '...', value: 1000000000 }]
 *   });
 *
 *   return <button onClick={sendTransaction}>Send Transaction</button>;
 * }
 * ```
 *
 * @public
 */
export function useSolanaWalletRequired(
  chain?: SupportedChain,
): Required<Pick<SolanaWalletInfo, 'solanaProvider' | 'address'>> & SolanaWalletInfo {
  const walletInfo = useSolanaWallet(chain);

  if (!walletInfo.isReady || !walletInfo.solanaProvider || !walletInfo.address) {
    const message = !walletInfo.isConnected
      ? 'Solana wallet must be connected to use this component'
      : !walletInfo.isSolanaChain
        ? 'Must be connected to a Solana chain to use this component'
        : 'Solana wallet is still initializing';

    throw ErrorFactory.configurationError(message);
  }

  return {
    ...walletInfo,
    solanaProvider: walletInfo.solanaProvider,
    address: walletInfo.address,
  };
}
