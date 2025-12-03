/**
 * Consolidated EVM wallet hook
 *
 * A simplified hook that combines account information and EVM provider
 * functionality into a single, easy-to-use interface. Reduces the need
 * to use multiple hooks and provides better developer experience.
 *
 * @module hooks/useEvmWallet
 * @packageDocumentation
 */

import type { EVMProvider, SupportedChain, WalletInfo } from '@walletmesh/modal-core';
import { ErrorFactory } from '@walletmesh/modal-core';
import { useMemo } from 'react';
import { useAccount } from './useAccount.js';
import { useWalletProvider } from './useWalletProvider.js';

/**
 * Consolidated EVM wallet information with both account and provider data
 *
 * @public
 */
export interface EvmWalletInfo {
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
  /** EVM provider instance with typed methods */
  evmProvider: EVMProvider | null;
  /** Whether EVM provider is ready for use */
  isReady: boolean;
  /** Whether currently initializing EVM provider */
  isLoading: boolean;
  /** Combined error from account or provider */
  error: Error | null;

  // Status information
  /** Overall status combining connection and provider readiness */
  status: 'disconnected' | 'connecting' | 'connected' | 'ready' | 'error';
  /** Whether on an EVM chain */
  isEvmChain: boolean;
  /** Whether currently processing a transaction */
  isTransacting: boolean;
}

/**
 * Hook that combines account and EVM provider functionality
 *
 * Provides a simplified interface that consolidates connection state,
 * account information, and EVM provider functionality into a single hook.
 * This reduces complexity and provides better developer experience compared
 * to using multiple hooks.
 *
 * @param chain - Optional specific chain to get provider for
 * @returns Consolidated EVM wallet information
 *
 * @since 1.0.0
 *
 * @remarks
 * This hook automatically handles:
 * - Connection state management
 * - EVM provider initialization
 * - Error consolidation
 * - Loading states
 * - Chain validation
 *
 * The hook returns a `status` field that provides an overall state:
 * - `disconnected`: No wallet connected
 * - `connecting`: Wallet connection in progress
 * - `connected`: Wallet connected but EVM provider not ready
 * - `ready`: EVM provider fully initialized and ready for use
 * - `error`: Error occurred during connection or initialization
 *
 * @example
 * ```tsx
 * import { useEvmWallet } from '@walletmesh/modal-react';
 *
 * function MyComponent() {
 *   const { isReady, evmProvider, address, error, status } = useEvmWallet();
 *
 *   if (status === 'error') {
 *     return <div>Error: {error?.message}</div>;
 *   }
 *
 *   if (status === 'loading') {
 *     return <div>Initializing EVM wallet...</div>;
 *   }
 *
 *   if (!isReady) {
 *     return <div>Please connect an EVM wallet</div>;
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
 *   const { evmProvider, isReady, status } = useEvmWallet();
 *
 *   const sendETH = async () => {
 *     if (!evmProvider) return;
 *
 *     const txHash = await evmProvider.request({
 *       method: 'eth_sendTransaction',
 *       params: [{
 *         to: '0x...',
 *         value: '0x' + (1e16).toString(16), // 0.01 ETH
 *       }]
 *     });
 *
 *     console.log('Transaction sent:', txHash);
 *   };
 *
 *   const signMessage = async () => {
 *     if (!evmProvider) return;
 *
 *     const accounts = await evmProvider.request({ method: 'eth_accounts' });
 *     if (!accounts[0]) return;
 *
 *     const signature = await evmProvider.request({
 *       method: 'personal_sign',
 *       params: ['Hello EVM!', accounts[0]]
 *     });
 *
 *     console.log('Message signed:', signature);
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={sendETH} disabled={!isReady}>
 *         Send 0.01 ETH
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
 * // Usage with contract interactions
 * function ContractInteraction() {
 *   const { evmProvider, isReady, chainId } = useEvmWallet();
 *
 *   const callContract = async () => {
 *     if (!evmProvider) return;
 *
 *     const result = await evmProvider.request({
 *       method: 'eth_call',
 *       params: [{
 *         to: '0x...', // contract address
 *         data: '0x...', // function call data
 *       }, 'latest']
 *     });
 *
 *     console.log('Contract call result:', result);
 *   };
 *
 *   return (
 *     <div>
 *       <p>Chain: {chainId}</p>
 *       <button onClick={callContract} disabled={!isReady}>
 *         Call Contract
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @public
 */
export function useEvmWallet(chain?: SupportedChain): EvmWalletInfo {
  // Get account information
  const { isConnected, address, wallet, isReconnecting } = useAccount();

  // Get EVM provider information
  const {
    provider: evmProvider,
    isAvailable,
    isConnecting: providerConnecting,
    chain: currentChain,
    error: providerError,
  } = useWalletProvider<EVMProvider>(chain);

  // Consolidate information
  const walletInfo = useMemo<EvmWalletInfo>(() => {
    const isEvmChain = currentChain?.chainType === 'evm';
    const combinedError = providerError;

    // Determine overall status
    let status: EvmWalletInfo['status'];
    if (combinedError) {
      status = 'error';
    } else if (!isConnected) {
      status = 'disconnected';
    } else if (isReconnecting || providerConnecting) {
      status = 'connecting';
    } else if (isConnected && !evmProvider) {
      status = 'connected';
    } else if (isConnected && evmProvider && isAvailable) {
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
      evmProvider,
      isReady: Boolean(evmProvider && isAvailable && isConnected),
      isLoading: providerConnecting || isReconnecting,
      error: combinedError,

      // Status information
      status,
      isEvmChain,
      isTransacting: false, // Will be set when transaction events are supported
    };
  }, [
    isConnected,
    address,
    currentChain,
    wallet,
    evmProvider,
    isAvailable,
    providerConnecting,
    providerError,
    isReconnecting,
  ]);

  return walletInfo;
}

/**
 * Hook that throws an error if EVM wallet is not ready
 *
 * Convenience hook for components that require an EVM wallet to function.
 * Will throw an error with helpful message if wallet is not connected or ready.
 *
 * @param chain - Optional specific chain to get provider for
 * @returns EVM wallet information (guaranteed to be ready)
 * @throws Error if wallet is not ready
 *
 * @example
 * ```tsx
 * function RequiresEvmWallet() {
 *   const { evmProvider, address } = useEvmWalletRequired();
 *
 *   // evmProvider is guaranteed to be non-null here
 *   const sendTransaction = () => evmProvider.request({
 *     method: 'eth_sendTransaction',
 *     params: [{ to: '0x...', value: '0x0' }]
 *   });
 *
 *   return <button onClick={sendTransaction}>Send Transaction</button>;
 * }
 * ```
 *
 * @public
 */
export function useEvmWalletRequired(
  chain?: SupportedChain,
): Required<Pick<EvmWalletInfo, 'evmProvider' | 'address'>> & EvmWalletInfo {
  const walletInfo = useEvmWallet(chain);

  if (!walletInfo.isReady || !walletInfo.evmProvider || !walletInfo.address) {
    const message = !walletInfo.isConnected
      ? 'EVM wallet must be connected to use this component'
      : !walletInfo.isEvmChain
        ? 'Must be connected to an EVM chain to use this component'
        : 'EVM wallet is still initializing';

    throw ErrorFactory.configurationError(message);
  }

  return {
    ...walletInfo,
    evmProvider: walletInfo.evmProvider,
    address: walletInfo.address,
  };
}
