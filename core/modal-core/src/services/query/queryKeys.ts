/**
 * Standardized query keys for WalletMesh
 *
 * This module provides a centralized, type-safe system for generating
 * query keys used with TanStack Query. Following a hierarchical pattern,
 * these keys enable efficient cache invalidation and data organization.
 *
 * @module services/query/queryKeys
 * @category Services
 */

// ChainId type has been removed

/**
 * Query key factory for WalletMesh queries
 *
 * Provides a hierarchical system of query keys that enables:
 * - Granular cache invalidation (invalidate all or specific queries)
 * - Type-safe key generation
 * - Consistent key structure across the application
 * - Efficient query matching and filtering
 *
 * @remarks
 * The key structure follows a hierarchical pattern:
 * - Root: ['walletmesh'] - invalidates everything
 * - Domain: ['walletmesh', 'balance'] - invalidates all balance queries
 * - Specific: ['walletmesh', 'balance', 'native', chainId, address] - invalidates specific query
 *
 * @example
 * ```typescript
 * import { queryKeys } from '@walletmesh/modal-core';
 *
 * // Get specific query key
 * const key = queryKeys.balance.native('1', '0x123...');
 * // Returns: ['walletmesh', 'balance', 'native', '1', '0x123...']
 *
 * // Invalidate all balance queries
 * queryClient.invalidateQueries({
 *   queryKey: queryKeys.balance.all()
 * });
 *
 * // Invalidate all queries
 * queryClient.invalidateQueries({
 *   queryKey: queryKeys.all
 * });
 * ```
 */
export const queryKeys = {
  /**
   * Root key for all WalletMesh queries
   * Use this to invalidate the entire cache
   */
  all: ['walletmesh'] as const,

  /**
   * Balance-related query keys
   *
   * Handles both native currency and token balance queries.
   * Organized by chain and address for efficient invalidation.
   */
  balance: {
    /**
     * All balance queries
     * Use to invalidate all balance data
     */
    all: () => [...queryKeys.all, 'balance'] as const,

    /**
     * Native currency balance queries
     *
     * @param chainId - The blockchain identifier
     * @param address - The wallet address
     * @returns Query key for native balance
     *
     * @example
     * ```typescript
     * const key = queryKeys.balance.native('1', '0x123...');
     * // Use in query
     * useQuery({
     *   queryKey: key,
     *   queryFn: () => fetchNativeBalance(...)
     * });
     * ```
     */
    native: (chainId: string, address: string) =>
      [...queryKeys.balance.all(), 'native', String(chainId), address] as const,

    /**
     * Token balance queries
     *
     * @param chainId - The blockchain identifier
     * @param address - The wallet address
     * @param tokenAddress - The token contract address
     * @returns Query key for token balance
     *
     * @example
     * ```typescript
     * const key = queryKeys.balance.token('1', '0x123...', '0xUSDC...');
     * // Use in query
     * useQuery({
     *   queryKey: key,
     *   queryFn: () => fetchTokenBalance(...)
     * });
     * ```
     */
    token: (chainId: string, address: string, tokenAddress: string) =>
      [...queryKeys.balance.all(), 'token', String(chainId), address, tokenAddress] as const,

    /**
     * All balances for a specific address
     * Useful for invalidating all balances when switching accounts
     *
     * @param address - The wallet address
     * @returns Query key for all balances of an address
     */
    byAddress: (address: string) => [...queryKeys.balance.all(), 'address', address] as const,

    /**
     * All balances for a specific chain
     * Useful for invalidating all balances when switching chains
     *
     * @param chainId - The blockchain identifier
     * @returns Query key for all balances on a chain
     */
    byChain: (chainId: string) => [...queryKeys.balance.all(), 'chain', String(chainId)] as const,
  },

  /**
   * Transaction-related query keys
   *
   * Handles transaction details, history, and status queries.
   * Supports filtering by address, chain, and transaction ID.
   */
  transaction: {
    /**
     * All transaction queries
     * Use to invalidate all transaction data
     */
    all: () => [...queryKeys.all, 'transaction'] as const,

    /**
     * Single transaction details
     *
     * @param txId - The transaction hash or ID
     * @returns Query key for transaction details
     *
     * @example
     * ```typescript
     * const key = queryKeys.transaction.detail('0xabc...');
     * // Use for tracking transaction status
     * useQuery({
     *   queryKey: key,
     *   queryFn: () => fetchTransactionStatus(txId)
     * });
     * ```
     */
    detail: (txId: string) => [...queryKeys.transaction.all(), 'detail', txId] as const,

    /**
     * Transaction history queries
     *
     * @param address - The wallet address
     * @param chainId - Optional chain filter
     * @returns Query key for transaction history
     *
     * @example
     * ```typescript
     * // All transactions for an address
     * const key = queryKeys.transaction.history('0x123...');
     *
     * // Transactions on specific chain
     * const key = queryKeys.transaction.history('0x123...', '1');
     * ```
     */
    history: (address: string, chainId?: string) => {
      const key = [...queryKeys.transaction.all(), 'history', address];
      if (chainId) key.push(String(chainId));
      return key as readonly unknown[];
    },

    /**
     * Pending transactions
     *
     * @param address - Optional address filter
     * @returns Query key for pending transactions
     */
    pending: (address?: string) => {
      const key = [...queryKeys.transaction.all(), 'pending'];
      if (address) key.push(address);
      return key as readonly unknown[];
    },
  },

  /**
   * Wallet-related query keys
   *
   * Handles wallet discovery, capabilities, and metadata queries.
   */
  wallet: {
    /**
     * All wallet queries
     */
    all: () => [...queryKeys.all, 'wallet'] as const,

    /**
     * Available wallets discovery
     *
     * @returns Query key for wallet discovery
     */
    available: () => [...queryKeys.wallet.all(), 'available'] as const,

    /**
     * Wallet capabilities and features
     *
     * @param walletId - The wallet identifier
     * @returns Query key for wallet capabilities
     */
    capabilities: (walletId: string) => [...queryKeys.wallet.all(), 'capabilities', walletId] as const,

    /**
     * Wallet metadata
     *
     * @param walletId - The wallet identifier
     * @returns Query key for wallet metadata
     */
    metadata: (walletId: string) => [...queryKeys.wallet.all(), 'metadata', walletId] as const,
  },

  /**
   * Chain-related query keys
   *
   * Handles chain information, gas prices, and network status.
   */
  chain: {
    /**
     * All chain queries
     */
    all: () => [...queryKeys.all, 'chain'] as const,

    /**
     * Chain information
     *
     * @param chainId - The blockchain identifier
     * @returns Query key for chain info
     */
    info: (chainId: string) => [...queryKeys.chain.all(), 'info', String(chainId)] as const,

    /**
     * Gas price queries
     *
     * @param chainId - The blockchain identifier
     * @returns Query key for gas prices
     */
    gasPrice: (chainId: string) => [...queryKeys.chain.all(), 'gasPrice', String(chainId)] as const,

    /**
     * Network status
     *
     * @param chainId - The blockchain identifier
     * @returns Query key for network status
     */
    status: (chainId: string) => [...queryKeys.chain.all(), 'status', String(chainId)] as const,
  },

  /**
   * ENS (Ethereum Name Service) related queries
   */
  ens: {
    /**
     * All ENS queries
     */
    all: () => [...queryKeys.all, 'ens'] as const,

    /**
     * ENS name lookup
     *
     * @param address - The Ethereum address
     * @returns Query key for ENS name
     */
    name: (address: string) => [...queryKeys.ens.all(), 'name', address] as const,

    /**
     * ENS avatar lookup
     *
     * @param nameOrAddress - ENS name or address
     * @returns Query key for ENS avatar
     */
    avatar: (nameOrAddress: string) => [...queryKeys.ens.all(), 'avatar', nameOrAddress] as const,
  },

  /**
   * Contract-related query keys
   *
   * Handles contract reads, ABI queries, and metadata lookups.
   * Supports filtering by chain, address, and method signature.
   */
  contract: {
    /**
     * All contract queries
     * Use to invalidate all contract data
     */
    all: () => [...queryKeys.all, 'contract'] as const,

    /**
     * Contract read operation queries
     *
     * @param chainId - The blockchain identifier
     * @param address - The contract address
     * @param methodSig - The method signature (e.g., 'balanceOf(address)')
     * @param params - Optional method parameters
     * @returns Query key for contract read
     *
     * @example
     * ```typescript
     * const key = queryKeys.contract.read('1', '0xUSDC...', 'balanceOf(address)', ['0x123...']);
     * // Use for caching contract method calls
     * useQuery({
     *   queryKey: key,
     *   queryFn: () => readContractMethod(...)
     * });
     * ```
     */
    read: (chainId: string, address: string, methodSig: string, params?: readonly unknown[]) =>
      [...queryKeys.contract.all(), 'read', String(chainId), address, methodSig, ...(params || [])] as const,

    /**
     * All queries for a specific contract
     * Useful for invalidating all data related to a contract
     *
     * @param chainId - The blockchain identifier
     * @param address - The contract address
     * @returns Query key for all contract queries
     */
    byAddress: (chainId: string, address: string) =>
      [...queryKeys.contract.all(), 'address', String(chainId), address] as const,

    /**
     * All contract queries for a specific chain
     * Useful for invalidating all contracts when switching chains
     *
     * @param chainId - The blockchain identifier
     * @returns Query key for all contracts on a chain
     */
    byChain: (chainId: string) => [...queryKeys.contract.all(), 'chain', String(chainId)] as const,

    /**
     * Contract ABI queries
     *
     * @param chainId - The blockchain identifier
     * @param address - The contract address
     * @returns Query key for contract ABI
     *
     * @example
     * ```typescript
     * const key = queryKeys.contract.abi('1', '0xUSDC...');
     * // Use for caching contract ABIs
     * useQuery({
     *   queryKey: key,
     *   queryFn: () => fetchContractABI(chainId, address)
     * });
     * ```
     */
    abi: (chainId: string, address: string) =>
      [...queryKeys.contract.all(), 'abi', String(chainId), address] as const,

    /**
     * Contract metadata queries
     * For caching token metadata like name, symbol, decimals
     *
     * @param chainId - The blockchain identifier
     * @param address - The contract address
     * @returns Query key for contract metadata
     */
    metadata: (chainId: string, address: string) =>
      [...queryKeys.contract.all(), 'metadata', String(chainId), address] as const,
  },
} as const;

/**
 * Type helper to extract query key types
 *
 * Useful for creating strongly-typed query functions and hooks.
 *
 * @example
 * ```typescript
 * type BalanceKey = QueryKey<typeof queryKeys.balance.native>;
 * // ['walletmesh', 'balance', 'native', string, string]
 * ```
 */
export type QueryKey<T extends (...args: unknown[]) => readonly unknown[]> = ReturnType<T>;

/**
 * Helper function to create custom query keys
 *
 * Use this when you need query keys that don't fit the standard patterns.
 * Ensures all custom keys are still under the WalletMesh namespace.
 *
 * @param domain - The query domain (e.g., 'custom', 'plugin')
 * @param keys - Additional key segments
 * @returns Custom query key
 *
 * @example
 * ```typescript
 * const customKey = createQueryKey('nft', 'collection', collectionId);
 * // Returns: ['walletmesh', 'nft', 'collection', collectionId]
 * ```
 */
export function createQueryKey(domain: string, ...keys: readonly unknown[]): readonly unknown[] {
  return [...queryKeys.all, domain, ...keys] as const;
}
