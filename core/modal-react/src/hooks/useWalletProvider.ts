/**
 * Wallet provider access hook for WalletMesh
 *
 * Provides access to wallet RPC endpoints for write operations,
 * enabling transaction signing and other privileged operations.
 *
 * @module hooks/useWalletProvider
 */

import type { ChainType, SupportedChain, WalletProvider } from '@walletmesh/modal-core';
import { useRef } from 'react';
import { useWalletMeshContext } from '../WalletMeshContext.js';
import { shallowEqual, useStore } from './internal/useStore.js';

/**
 * Wallet provider information with type safety
 *
 * @public
 */
export interface WalletProviderInfo<T extends WalletProvider = WalletProvider> {
  /** The wallet provider instance */
  provider: T | null;
  /** Whether provider is available */
  isAvailable: boolean;
  /** Whether currently connecting */
  isConnecting: boolean;
  /** Chain this provider is for */
  chain: SupportedChain | null;
  /** Chain type (evm, solana, aztec) */
  chainType: ChainType | null;
  /** Wallet ID providing this provider */
  walletId: string | null;
  /** Connection error if any */
  error: Error | null;
}

/**
 * Hook for accessing wallet providers for write operations
 *
 * Returns a wallet provider that uses the wallet's RPC endpoints
 * for transaction signing and other privileged operations.
 *
 * @typeParam T - Expected provider type for better type inference
 * @param chain - Optional chain to get provider for. If not specified, uses current chain.
 * @returns Wallet provider information
 *
 * @since 1.0.0
 *
 * @remarks
 * Wallet providers are required for:
 * - Sending transactions
 * - Signing messages
 * - Switching chains
 * - Any operation requiring user approval
 *
 * They use the wallet's own RPC endpoints, ensuring proper
 * transaction signing and security.
 *
 * This hook is designed to work with the public/private provider
 * pattern where read operations use public providers and write
 * operations use wallet providers.
 *
 * @example
 * ```tsx
 * import { useWalletProvider, usePublicProvider } from '@walletmesh/modal-react';
 * import { ethers } from 'ethers';
 *
 * function SendTransaction() {
 *   const { provider: walletProvider } = useWalletProvider();
 *   const { provider: publicProvider } = usePublicProvider();
 *
 *   const sendETH = async () => {
 *     if (!walletProvider || !publicProvider) return;
 *
 *     // Use public provider for gas estimation
 *     const gasPrice = await publicProvider.request({
 *       method: 'eth_gasPrice'
 *     });
 *
 *     // Use wallet provider for sending transaction
 *     const txHash = await walletProvider.request({
 *       method: 'eth_sendTransaction',
 *       params: [{
 *         to: '0x...',
 *         value: '0x' + (1e16).toString(16), // 0.01 ETH
 *         gasPrice
 *       }]
 *     });
 *
 *     console.log('Transaction sent:', txHash);
 *   };
 *
 *   return (
 *     <button onClick={sendETH}>
 *       Send 0.01 ETH
 *     </button>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Sign messages
 * function MessageSigner() {
 *   const { provider, walletId } = useWalletProvider();
 *   const [signature, setSignature] = useState<string>('');
 *
 *   const signMessage = async () => {
 *     if (!provider) return;
 *
 *     const accounts = await provider.getAccounts();
 *     if (!accounts[0]) return;
 *
 *     const sig = await provider.request({
 *       method: 'personal_sign',
 *       params: ['Hello Web3!', accounts[0]]
 *     });
 *
 *     setSignature(sig as string);
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={signMessage}>
 *         Sign Message with {walletId}
 *       </button>
 *       {signature && <p>Signature: {signature}</p>}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Multi-chain support
 * function MultiChainOperations() {
 *   const polygonProvider = useWalletProvider({ chainId: '137', chainType: 'evm', name: 'Polygon', required: false, label: 'Polygon', interfaces: [], group: 'mainnet' });
 *   const ethereumProvider = useWalletProvider({ chainId: '1', chainType: 'evm', name: 'Ethereum', required: false, label: 'Ethereum', interfaces: [], group: 'mainnet' });
 *
 *   return (
 *     <div>
 *       <button
 *         disabled={!polygonProvider.isAvailable}
 *         onClick={() => console.log('Polygon operation')}
 *       >
 *         Send on Polygon
 *       </button>
 *       <button
 *         disabled={!ethereumProvider.isAvailable}
 *         onClick={() => console.log('Ethereum operation')}
 *       >
 *         Send on Ethereum
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @public
 */
export function useWalletProvider<T extends WalletProvider = WalletProvider>(
  chain?: SupportedChain,
): WalletProviderInfo<T> {
  const { client } = useWalletMeshContext();
  const prevProviderRef = useRef<T | null>(null);
  const prevWalletIdRef = useRef<string | null>(null);
  const prevChainIdRef = useRef<string | null>(null);

  type ConnectionStateType = {
    currentChain: SupportedChain | null;
    chainType: ChainType | null;
    walletId: string | null;
    isConnected: boolean;
    isConnecting: boolean;
    error: { message: string } | null;
  };

  const prevStateRef = useRef<ConnectionStateType | null>(null);

  // More selective state subscription
  const connectionState = useStore((state) => {
    const activeSessionId = state.active?.sessionId;
    const activeSession = activeSessionId ? state.entities.sessions?.[activeSessionId] : null;

    const newState: ConnectionStateType = {
      currentChain: activeSession?.chain || null,
      chainType: activeSession?.chain?.chainType || null,
      walletId: activeSession?.walletId || null,
      isConnected: activeSession?.status === 'connected',
      isConnecting: state.ui.currentView === 'connecting',
      // Only track first error for simplicity
      error: Object.values(state.ui.errors || {})[0] || null,
    };

    // Use shallow equality to prevent unnecessary re-renders
    if (prevStateRef.current && shallowEqual(prevStateRef.current, newState)) {
      return prevStateRef.current;
    }

    prevStateRef.current = newState;
    return newState;
  });

  const targetChain = chain || connectionState.currentChain;
  const targetChainId = targetChain?.chainId || null;

  // Return cached provider if wallet and chain haven't changed
  if (
    connectionState.walletId === prevWalletIdRef.current &&
    targetChainId === prevChainIdRef.current &&
    prevProviderRef.current &&
    connectionState.isConnected
  ) {
    return {
      provider: prevProviderRef.current,
      isAvailable: true,
      isConnecting: connectionState.isConnecting,
      chain: targetChain,
      chainType: connectionState.chainType,
      walletId: connectionState.walletId,
      error: connectionState.error ? new Error(connectionState.error.message) : null,
    };
  }

  // Only fetch new provider when wallet/chain changes or on initial connection
  let provider: T | null = null;
  if (client && targetChain && connectionState.walletId && connectionState.isConnected) {
    provider = client.getWalletProvider(targetChain.chainId) as T | null;
  }

  // Update cache
  if (
    provider !== prevProviderRef.current ||
    connectionState.walletId !== prevWalletIdRef.current ||
    targetChainId !== prevChainIdRef.current
  ) {
    prevProviderRef.current = provider;
    prevWalletIdRef.current = connectionState.walletId;
    prevChainIdRef.current = targetChainId;
  }

  return {
    provider,
    isAvailable: Boolean(provider && connectionState.isConnected),
    isConnecting: connectionState.isConnecting,
    chain: targetChain,
    chainType: connectionState.chainType,
    walletId: connectionState.walletId,
    error: connectionState.error ? new Error(connectionState.error.message) : null,
  };
}
