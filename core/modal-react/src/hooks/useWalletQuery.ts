/**
 * Generic wallet query hook for WalletMesh React integration
 *
 * Provides a flexible interface for making queries through wallet providers
 * using TanStack Query. Supports any RPC method across different blockchain types.
 *
 * @module hooks/useWalletQuery
 */

import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { SupportedChain } from '@walletmesh/modal-core';
import {
  ErrorFactory,
  type ProviderQueryOptions,
  createQueryKey,
  executeProviderMethod,
} from '@walletmesh/modal-core';
import { useCallback, useMemo } from 'react';
import { createComponentLogger } from '../utils/logger.js';
import { useStore } from './internal/useStore.js';

/**
 * Options for wallet queries
 *
 * @public
 */
export interface UseWalletQueryOptions<TData = unknown> {
  /** RPC method to call */
  method: string;
  /** Parameters for the RPC method */
  params?: unknown[];
  /** Chain to query on (defaults to current chain) */
  chain?: SupportedChain;
  /** Whether to enable the query (default: true) */
  enabled?: boolean;
  /** Stale time in milliseconds (data considered fresh within this time) */
  staleTime?: number;
  /** Cache time in milliseconds (default: 5 minutes) */
  cacheTime?: number;
  /** Refetch interval in milliseconds */
  refetchInterval?: number | false;
  /** Custom TanStack Query options */
  queryOptions?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn' | 'enabled'>;
}

/**
 * Wallet query return type
 *
 * @public
 */
export interface UseWalletQueryReturn<TData = unknown> {
  /** Query result data */
  data: TData | undefined;
  /** Whether the query is loading */
  isLoading: boolean;
  /** Whether the query is fetching (includes background refetches) */
  isFetching: boolean;
  /** Whether the query is refetching */
  isRefetching: boolean;
  /** Whether the query has errored */
  isError: boolean;
  /** Error if any */
  error: Error | null;
  /** Refetch the query */
  refetch: () => Promise<void>;
}

/**
 * Hook for making generic wallet queries
 *
 * Provides a flexible interface for querying data through wallet providers
 * using TanStack Query. Supports any RPC method across EVM, Solana, and Aztec chains.
 *
 * @param options - Query options including method, params, and cache configuration
 * @returns Query result with loading states and refetch capability
 *
 * @since 1.0.0
 *
 * @see {@link useAccount} - For getting the connected wallet provider
 * @see {@link useBalance} - Example of a specialized query hook
 * @see {@link useTransaction} - For sending transactions
 *
 * @remarks
 * This hook provides a generic interface for making RPC queries through the connected
 * wallet provider. It automatically handles:
 * - Caching with TanStack Query
 * - Loading and error states
 * - Automatic refetching based on configuration
 * - Multi-chain query support
 *
 * Common use cases include:
 * - Fetching contract data
 * - Getting blockchain state
 * - Querying transaction receipts
 * - Custom RPC method calls
 *
 * @example
 * ```tsx
 * // Query current block number
 * import { useWalletQuery } from '@walletmesh/modal-react';
 *
 * function BlockNumber() {
 *   const { data: blockNumber, isLoading } = useWalletQuery<string>({
 *     method: 'eth_blockNumber',
 *     staleTime: 10000 // 10 seconds
 *   });
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return <div>Current block: {parseInt(blockNumber || '0', 16)}</div>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Query ERC20 token balance
 * function TokenBalance({ tokenAddress, userAddress }: Props) {
 *   const { data: balance } = useWalletQuery<string>({
 *     method: 'eth_call',
 *     params: [{
 *       to: tokenAddress,
 *       data: `0x70a08231000000000000000000000000${userAddress.slice(2)}` // balanceOf(address)
 *     }, 'latest'],
 *     enabled: !!tokenAddress && !!userAddress
 *   });
 *
 *   return <div>Token balance: {balance ? BigInt(balance).toString() : '0'}</div>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Query with automatic refetching
 * function GasPrice() {
 *   const { data: gasPrice, isRefetching } = useWalletQuery<string>({
 *     method: 'eth_gasPrice',
 *     refetchInterval: 5000, // Refetch every 5 seconds
 *     staleTime: 4000 // Consider stale after 4 seconds
 *   });
 *
 *   return (
 *     <div>
 *       Gas price: {gasPrice ? BigInt(gasPrice).toString() : 'Loading...'}
 *       {isRefetching && ' (updating...)'}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Query on specific chain
 * function PolygonData() {
 *   const { data, error } = useWalletQuery({
 *     method: 'eth_getBalance',
 *     params: ['0x742d35Cc6634C0532925a3b844Bc9e7595f6E123', 'latest'],
 *     chain: { chainId: '137', chainType: 'evm', name: 'Polygon', required: false, label: 'Polygon', interfaces: [], group: 'mainnet' } // Query on Polygon
 *   });
 *
 *   if (error) return <div>Error: {error.message}</div>;
 *   return <div>Balance on Polygon: {data}</div>;
 * }
 * ```
 */
export function useWalletQuery<TData = unknown>(
  options: UseWalletQueryOptions<TData>,
): UseWalletQueryReturn<TData> {
  const {
    method,
    params = [],
    chain: chainOverride,
    enabled = true,
    staleTime = 30 * 1000, // 30 seconds
    cacheTime = 5 * 60 * 1000, // 5 minutes
    refetchInterval = false,
    queryOptions = {},
  } = options;

  const logger = useMemo(() => createComponentLogger('useWalletQuery'), []);

  // Get connection info from active session
  const currentChain = useStore((state) => {
    if (!state?.active?.sessionId) return null;
    const activeSessionId = state.active?.sessionId;
    const activeSession = activeSessionId ? state.entities.sessions?.[activeSessionId] : undefined;
    return activeSession?.chain || null;
  });

  const currentChainType = useStore((state) => {
    if (!state?.active?.sessionId) return null;
    const activeSessionId = state.active?.sessionId;
    const activeSession = activeSessionId ? state.entities.sessions?.[activeSessionId] : undefined;
    return activeSession?.chain?.chainType || null;
  });

  const provider = useStore((state) => {
    if (!state?.active?.sessionId) return null;
    const activeSessionId = state.active?.sessionId;
    const activeSession = activeSessionId ? state.entities.sessions?.[activeSessionId] : undefined;
    return activeSession?.provider?.instance || null;
  });

  // Use override chain or current chain
  const chain = chainOverride || currentChain;

  // Generate query key
  const queryKey = useMemo(() => {
    if (!chain || !method) return null;

    // Create a hierarchical query key
    return createQueryKey('walletQuery', chain.chainId, method, ...params);
  }, [chain, method, params]);

  // Query function
  const queryFn = useCallback(async (): Promise<TData> => {
    if (!provider || !chain || !method) {
      throw ErrorFactory.invalidParams('Missing required parameters for wallet query');
    }

    logger.debug('Executing wallet query', { method, params, chainId: chain.chainId });

    try {
      // Use the new executeProviderMethod utility from modal-core
      const queryOptions: ProviderQueryOptions = {
        method,
        params,
        chain,
        ...(currentChainType && { chainType: currentChainType }),
      };

      const result = await executeProviderMethod<TData>(provider, queryOptions);
      return result.data;
    } catch (error) {
      logger.error('Wallet query failed:', error);
      throw error instanceof Error ? error : new Error('Wallet query failed');
    }
  }, [provider, chain, currentChainType, method, params, logger]);

  // Use TanStack Query
  const query = useQuery({
    queryKey: queryKey || ['disabled'],
    queryFn,
    enabled: enabled && !!queryKey && !!provider,
    staleTime,
    gcTime: cacheTime,
    refetchInterval,
    refetchIntervalInBackground: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...queryOptions,
  });

  // Refetch wrapper
  const refetch = useCallback(async () => {
    await query.refetch();
  }, [query]);

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isRefetching: query.isRefetching,
    isError: query.isError,
    error: query.error,
    refetch,
  };
}
