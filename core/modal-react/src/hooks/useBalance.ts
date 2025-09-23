/**
 * Balance query hook for WalletMesh React integration
 *
 * Provides balance queries with automatic caching using TanStack Query.
 * Supports both native currency and token balances across multiple chains.
 *
 * @module hooks/useBalance
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { SupportedChain } from '@walletmesh/modal-core';
import { ErrorFactory, queryKeys } from '@walletmesh/modal-core';
import { useCallback, useMemo } from 'react';
import { createComponentLogger } from '../utils/logger.js';
import { useService } from './internal/useService.js';
import { useStore } from './internal/useStore.js';

/**
 * Balance information interface
 *
 * @public
 */
export interface BalanceInfo {
  /** The balance value in the smallest unit (e.g., wei for ETH) */
  value: string;
  /** The balance as a decimal string */
  formatted: string;
  /** The symbol of the currency/token */
  symbol: string;
  /** The number of decimals for the currency/token */
  decimals: number;
}

/**
 * Token information for balance queries
 *
 * @public
 */
export interface TokenInfo {
  /** Token contract address (checksummed for EVM) */
  address: string;
  /** Token symbol (optional, will be fetched if not provided) */
  symbol?: string;
  /** Token name (optional, for display purposes) */
  name?: string;
  /** Token decimals (optional, will be fetched if not provided) */
  decimals?: number;
}

/**
 * Balance query options
 *
 * @public
 */
export interface UseBalanceOptions {
  /** Address to query balance for (defaults to connected address) */
  address?: string;
  /** Chain to query on (defaults to current chain) */
  chain?: SupportedChain;
  /** Token information for token balance queries (omit for native balance) */
  token?: TokenInfo;
  /** Whether to watch for balance changes (default: false) */
  watch?: boolean;
  /** Polling interval in milliseconds (default: 4000, only used if watch is true) */
  watchInterval?: number;
  /** Whether to enable the query (default: true) */
  enabled?: boolean;
  /** Format units (e.g., 'ether', 'gwei') - chain specific */
  formatUnits?: string;
  /** Cache time in milliseconds (default: 5 minutes) */
  cacheTime?: number;
  /** Stale time in milliseconds (data considered fresh within this time) */
  staleTime?: number;
}

/**
 * Balance query return type
 *
 * @public
 */
export interface UseBalanceReturn {
  /** Balance data */
  data: BalanceInfo | undefined;
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
  /** Refetch the balance */
  refetch: () => Promise<void>;
  /** Invalidate the balance cache */
  invalidate: () => Promise<void>;
}

/**
 * Hook for querying wallet balances
 *
 * Provides balance queries with automatic caching and optional token support.
 * Uses TanStack Query for efficient data fetching and caching.
 *
 * @param options - Balance query options
 * @returns Balance query result
 *
 * @since 1.0.0
 *
 * @see {@link useAccount} - For getting the connected address
 * @see {@link useSwitchChain} - For getting the current chain
 * @see {@link useTransaction} - For sending transactions
 *
 * @remarks
 * This hook automatically handles:
 * - Native and token balance queries
 * - Multi-chain balance fetching
 * - Automatic refetching on address/chain changes
 * - Caching with TanStack Query
 * - Real-time updates via polling
 * - Error handling and retry logic
 *
 * The balance is returned in the smallest unit (wei for ETH, lamports for SOL).
 * Use the formatted property for human-readable values.
 *
 * Performance considerations:
 * - Enable watch only when real-time updates are needed
 * - Adjust watchInterval based on your requirements
 * - TanStack Query handles caching automatically
 *
 * @example
 * ```tsx
 * // Query native balance for connected account
 * function MyComponent() {
 *   const { data: balance, isLoading } = useBalance();
 *
 *   if (isLoading) return <div>Loading balance...</div>;
 *   if (!balance) return <div>No balance data</div>;
 *
 *   return <div>{balance.formatted} {balance.symbol}</div>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Query token balance with watching
 * function TokenBalance() {
 *   const { data: balance } = useBalance({
 *     token: {
 *       address: '0x...',
 *       symbol: 'USDC',
 *       decimals: 6
 *     },
 *     watch: true,
 *     watchInterval: 10000 // 10 seconds
 *   });
 *
 *   return <div>{balance?.formatted || '0'} USDC</div>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Query balance on specific chain
 * function CrossChainBalance() {
 *   // const [address, setAddress] = useState('0x...'); // useState imported from react
 *   const address = '0x...'; // Example address
 *   const { data: balance } = useBalance({
 *     address,
 *     chain: { chainId: '137', chainType: 'evm', name: 'Polygon', required: false, label: 'Polygon', interfaces: [], group: 'mainnet' }, // Polygon
 *     enabled: !!address
 *   });
 *
 *   return <div>Polygon balance: {balance?.formatted}</div>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Handle loading and error states
 * function BalanceWithStates() {
 *   const { data, isLoading, isError, error, refetch, invalidate } = useBalance({
 *     watch: true,
 *     watchInterval: 30000 // 30 seconds
 *   });
 *
 *   if (isLoading) return <div>Loading balance...</div>;
 *   if (isError) return (
 *     <div>
 *       Error: {error?.message}
 *       <button onClick={() => refetch()}>Retry</button>
 *     </div>
 *   );
 *
 *   return (
 *     <div>
 *       <p>{data?.formatted} {data?.symbol}</p>
 *       <p>Raw: {data?.value}</p>
 *       <button onClick={() => invalidate()}>Refresh</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useBalance(options: UseBalanceOptions = {}): UseBalanceReturn {
  const {
    address: addressOverride,
    chain: chainOverride,
    token,
    watch = false,
    watchInterval = 4000,
    enabled = true,
    staleTime = 30 * 1000, // 30 seconds
    cacheTime = 5 * 60 * 1000, // 5 minutes
  } = options;

  const logger = useMemo(() => createComponentLogger('useBalance'), []);
  const queryClient = useQueryClient();
  const { service: balanceService, isAvailable } = useService('balance', 'useBalance');

  // Get connection info from active session
  const connectedAddress = useStore((state) => {
    const activeSessionId = state.active?.sessionId;
    if (!activeSessionId) return null;
    const activeSession = state.entities.sessions?.[activeSessionId];
    return activeSession?.activeAccount?.address || null;
  });

  const currentChain = useStore((state) => {
    const activeSessionId = state.active?.sessionId;
    if (!activeSessionId) return null;
    const activeSession = state.entities.sessions?.[activeSessionId];
    return activeSession?.chain || null;
  });

  const provider = useStore((state) => {
    const activeSessionId = state.active?.sessionId;
    if (!activeSessionId) return null;
    const activeSession = state.entities.sessions?.[activeSessionId];
    return activeSession?.provider?.instance || null;
  });

  // Use override address or connected address
  const address = addressOverride || connectedAddress;
  const chain = chainOverride || currentChain;

  // Generate query key
  const queryKey = useMemo(() => {
    if (!address || !chain) return null;

    const chainId = chain.chainId;
    return token
      ? queryKeys.balance.token(chainId, address, token.address)
      : queryKeys.balance.native(chainId, address);
  }, [address, chain, token]);

  // Query function
  const queryFn = useCallback(async (): Promise<BalanceInfo> => {
    if (!address || !chain || !provider || !balanceService || !isAvailable) {
      throw ErrorFactory.invalidParams('Missing required parameters for balance query');
    }

    logger.debug('Fetching balance', { address, chain: chain.chainId, token });

    try {
      if (token) {
        // Fetch token balance
        return await balanceService.getTokenBalance({
          provider,
          address,
          chain: chain,
          token,
        });
      }
      // Fetch native balance
      return await balanceService.getNativeBalance({
        provider,
        address,
        chain: chain,
      });
    } catch (error) {
      logger.error('Failed to fetch balance:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch balance');
    }
  }, [address, chain, provider, balanceService, isAvailable, token, logger]);

  // Use TanStack Query
  const query = useQuery<BalanceInfo>({
    queryKey: queryKey || ['disabled'],
    queryFn,
    enabled: enabled && !!queryKey && !!provider && isAvailable,
    staleTime,
    gcTime: cacheTime,
    refetchInterval: watch ? watchInterval : false,
    refetchIntervalInBackground: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Invalidate function
  const invalidate = useCallback(async () => {
    if (queryKey) {
      await queryClient.invalidateQueries({ queryKey });
    }
  }, [queryClient, queryKey]);

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
    invalidate,
  };
}

// Note: Balance fetching logic is handled by BalanceService in modal-core
// This hook now uses TanStack Query for efficient caching and data management
