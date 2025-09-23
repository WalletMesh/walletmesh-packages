/**
 * Query invalidation helpers for WalletMesh React integration
 *
 * Provides convenient methods for invalidating TanStack Query caches
 * when wallet state changes occur.
 *
 * @module hooks/useQueryInvalidation
 */

import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@walletmesh/modal-core';
import type { SupportedChain } from '@walletmesh/modal-core';
import { useCallback } from 'react';

/**
 * Query invalidation options
 *
 * @public
 */
export interface InvalidationOptions {
  /** Whether to refetch active queries after invalidation */
  refetch?: boolean;
  /** Whether to cancel in-flight requests */
  cancelRefetch?: boolean;
}

/**
 * Hook return type for query invalidation utilities
 *
 * @public
 */
export interface UseQueryInvalidationReturn {
  /** Invalidate all WalletMesh queries */
  invalidateAll: (options?: InvalidationOptions) => Promise<void>;

  /** Invalidate all balance queries */
  invalidateBalances: (options?: InvalidationOptions) => Promise<void>;

  /** Invalidate balance for specific address and chain */
  invalidateBalance: (chain: SupportedChain, address: string, options?: InvalidationOptions) => Promise<void>;

  /** Invalidate token balance for specific token */
  invalidateTokenBalance: (
    chain: SupportedChain,
    address: string,
    tokenAddress: string,
    options?: InvalidationOptions,
  ) => Promise<void>;

  /** Invalidate all transaction queries */
  invalidateTransactions: (options?: InvalidationOptions) => Promise<void>;

  /** Invalidate specific transaction */
  invalidateTransaction: (
    chain: SupportedChain,
    hash: string,
    options?: InvalidationOptions,
  ) => Promise<void>;

  /** Invalidate all contract queries */
  invalidateContracts: (options?: InvalidationOptions) => Promise<void>;

  /** Invalidate specific contract */
  invalidateContract: (
    chain: SupportedChain,
    address: string,
    options?: InvalidationOptions,
  ) => Promise<void>;

  /** Invalidate contract method calls */
  invalidateContractMethod: (
    chain: SupportedChain,
    address: string,
    methodSig: string,
    params?: readonly unknown[],
    options?: InvalidationOptions,
  ) => Promise<void>;

  /** Invalidate all contracts on a chain */
  invalidateContractsByChain: (chain: SupportedChain, options?: InvalidationOptions) => Promise<void>;

  /** Invalidate all chain queries */
  invalidateChains: (options?: InvalidationOptions) => Promise<void>;

  /** Invalidate specific chain */
  invalidateChain: (chain: SupportedChain, options?: InvalidationOptions) => Promise<void>;

  /** Invalidate custom query pattern */
  invalidateCustom: (queryKey: readonly unknown[], options?: InvalidationOptions) => Promise<void>;
}

/**
 * Hook for invalidating TanStack Query caches
 *
 * Provides convenient methods for invalidating query caches when wallet state changes.
 * Useful for refreshing data after transactions, chain switches, or wallet connections.
 *
 * @returns Object with invalidation methods for different query types
 *
 * @since 1.0.0
 *
 * @see {@link useBalance} - Balance queries that can be invalidated
 * @see {@link useTransaction} - Automatically invalidates balances after transactions
 * @see {@link useWalletQuery} - Generic queries that can be invalidated
 *
 * @remarks
 * This hook provides granular control over query cache invalidation, allowing you to:
 * - Invalidate all queries when wallet state changes significantly
 * - Invalidate specific query types (balances, transactions, etc.)
 * - Invalidate queries for specific addresses or chains
 * - Control refetch behavior after invalidation
 *
 * Query invalidation is useful for:
 * - Refreshing balances after transactions
 * - Updating data after chain switches
 * - Clearing stale data after wallet disconnection
 * - Forcing fresh data fetches
 *
 * @example
 * ```tsx
 * // Invalidate all queries after wallet connection
 * import { useQueryInvalidation, useConnect } from '@walletmesh/modal-react';
 *
 * function ConnectButton() {
 *   const { connect } = useConnect();
 *   const { invalidateAll } = useQueryInvalidation();
 *
 *   const handleConnect = async () => {
 *     await connect();
 *     // Refresh all cached data for the new wallet
 *     await invalidateAll();
 *   };
 *
 *   return <button onClick={handleConnect}>Connect & Refresh</button>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Invalidate balances after transaction
 * import { useQueryInvalidation, useTransaction } from '@walletmesh/modal-react';
 *
 * function SendTransaction() {
 *   const { sendTransaction } = useTransaction();
 *   const { invalidateBalances } = useQueryInvalidation();
 *
 *   const handleSend = async () => {
 *     const tx = await sendTransaction({
 *       to: '0x...',
 *       value: '1000000000000000000'
 *     });
 *
 *     // Wait for confirmation
 *     await tx.wait();
 *
 *     // Refresh all balance queries
 *     await invalidateBalances();
 *   };
 *
 *   return <button onClick={handleSend}>Send & Refresh</button>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Selective invalidation for specific address
 * import { useQueryInvalidation, useAccount } from '@walletmesh/modal-react';
 *
 * function RefreshMyBalance() {
 *   const { address, chain } = useAccount();
 *   const { invalidateBalance } = useQueryInvalidation();
 *
 *   const handleRefresh = async () => {
 *     if (address && chain) {
 *       // Only refresh balance for current address/chain
 *       await invalidateBalance(chain, address);
 *     }
 *   };
 *
 *   return <button onClick={handleRefresh}>Refresh My Balance</button>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Invalidate queries after chain switch
 * import { useQueryInvalidation, useSwitchChain } from '@walletmesh/modal-react';
 *
 * function ChainSwitcher() {
 *   const { switchChain } = useSwitchChain();
 *   const { invalidateChain, invalidateBalances } = useQueryInvalidation();
 *
 *   const handleSwitch = async (newChain: SupportedChain) => {
 *     await switchChain(newChain);
 *
 *     // Invalidate queries for the new chain
 *     await invalidateChain(newChain);
 *     await invalidateBalances();
 *   };
 *
 *   return (
 *     <select onChange={(e) => handleSwitch({ chainId: e.target.value, chainType: 'evm', name: e.target.value === '1' ? 'Ethereum' : 'Polygon', required: false, label: e.target.value === '1' ? 'Ethereum' : 'Polygon', interfaces: [], group: 'mainnet' })}>
 *       <option value="1">Ethereum</option>
 *       <option value="137">Polygon</option>
 *     </select>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Invalidate contract queries after state change
 * import { useQueryInvalidation, useWalletProvider } from '@walletmesh/modal-react';
 *
 * function ContractWriter() {
 *   const { provider } = useWalletProvider();
 *   const { invalidateContract, invalidateContractMethod } = useQueryInvalidation();
 *
 *   const updateContractState = async () => {
 *     // Execute transaction that changes contract state
 *     const tx = await provider.request({
 *       method: 'eth_sendTransaction',
 *       params: [{
 *         to: '0xContractAddress',
 *         data: '0x...' // encoded function call
 *       }]
 *     });
 *
 *     // Wait for confirmation
 *     // ... wait logic ...
 *
 *     // Invalidate all queries for this contract
 *     await invalidateContract({ chainId: '1', chainType: 'evm', name: 'Ethereum', required: false, label: 'Ethereum', interfaces: [], group: 'mainnet' }, '0xContractAddress');
 *
 *     // Or invalidate specific method calls
 *     await invalidateContractMethod(
 *       { chainId: '1', chainType: 'evm', name: 'Ethereum', required: false, label: 'Ethereum', interfaces: [], group: 'mainnet' },
 *       '0xContractAddress',
 *       'balanceOf(address)',
 *       ['0xUserAddress']
 *     );
 *   };
 *
 *   return <button onClick={updateContractState}>Update Contract</button>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Invalidate all contract queries when switching chains
 * import { useQueryInvalidation, useSwitchChain } from '@walletmesh/modal-react';
 *
 * function MultiChainApp() {
 *   const { switchChain } = useSwitchChain();
 *   const { invalidateContractsByChain, invalidateContracts } = useQueryInvalidation();
 *
 *   const handleChainSwitch = async (newChain: SupportedChain) => {
 *     await switchChain(newChain);
 *
 *     // Option 1: Invalidate all contract queries across all chains
 *     await invalidateContracts();
 *
 *     // Option 2: Invalidate only contracts on the new chain
 *     await invalidateContractsByChain(newChain);
 *   };
 *
 *   return (
 *     <button onClick={() => handleChainSwitch({ chainId: '137', chainType: 'evm', name: 'Polygon', required: false, label: 'Polygon', interfaces: [], group: 'mainnet' })}>
 *       Switch to Polygon
 *     </button>
 *   );
 * }
 * ```
 */
export function useQueryInvalidation(): UseQueryInvalidationReturn {
  const queryClient = useQueryClient();

  /**
   * Invalidate all WalletMesh queries
   */
  const invalidateAll = useCallback(
    async (options: InvalidationOptions = {}) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.all,
        ...options,
      });
    },
    [queryClient],
  );

  /**
   * Invalidate all balance queries
   */
  const invalidateBalances = useCallback(
    async (options: InvalidationOptions = {}) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.balance.all(),
        ...options,
      });
    },
    [queryClient],
  );

  /**
   * Invalidate balance for specific address and chain
   */
  const invalidateBalance = useCallback(
    async (chain: SupportedChain, address: string, options: InvalidationOptions = {}) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.balance.native(chain.chainId, address),
        ...options,
      });
    },
    [queryClient],
  );

  /**
   * Invalidate token balance for specific token
   */
  const invalidateTokenBalance = useCallback(
    async (
      chain: SupportedChain,
      address: string,
      tokenAddress: string,
      options: InvalidationOptions = {},
    ) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.balance.token(chain.chainId, address, tokenAddress),
        ...options,
      });
    },
    [queryClient],
  );

  /**
   * Invalidate all transaction queries
   */
  const invalidateTransactions = useCallback(
    async (options: InvalidationOptions = {}) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.transaction.all(),
        ...options,
      });
    },
    [queryClient],
  );

  /**
   * Invalidate specific transaction
   */
  const invalidateTransaction = useCallback(
    async (_chain: SupportedChain, hash: string, options: InvalidationOptions = {}) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.transaction.detail(hash),
        ...options,
      });
    },
    [queryClient],
  );

  /**
   * Invalidate all contract queries
   */
  const invalidateContracts = useCallback(
    async (options: InvalidationOptions = {}) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.contract.all(),
        ...options,
      });
    },
    [queryClient],
  );

  /**
   * Invalidate specific contract
   */
  const invalidateContract = useCallback(
    async (chain: SupportedChain, address: string, options: InvalidationOptions = {}) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.contract.byAddress(chain.chainId, address),
        ...options,
      });
    },
    [queryClient],
  );

  /**
   * Invalidate contract method calls
   */
  const invalidateContractMethod = useCallback(
    async (
      chain: SupportedChain,
      address: string,
      methodSig: string,
      params?: readonly unknown[],
      options: InvalidationOptions = {},
    ) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.contract.read(chain.chainId, address, methodSig, params),
        ...options,
      });
    },
    [queryClient],
  );

  /**
   * Invalidate all contracts on a chain
   */
  const invalidateContractsByChain = useCallback(
    async (chain: SupportedChain, options: InvalidationOptions = {}) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.contract.byChain(chain.chainId),
        ...options,
      });
    },
    [queryClient],
  );

  /**
   * Invalidate all chain queries
   */
  const invalidateChains = useCallback(
    async (options: InvalidationOptions = {}) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.chain.all(),
        ...options,
      });
    },
    [queryClient],
  );

  /**
   * Invalidate specific chain
   */
  const invalidateChain = useCallback(
    async (chain: SupportedChain, options: InvalidationOptions = {}) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.chain.info(chain.chainId),
        ...options,
      });
    },
    [queryClient],
  );

  /**
   * Invalidate custom query pattern
   */
  const invalidateCustom = useCallback(
    async (queryKey: readonly unknown[], options: InvalidationOptions = {}) => {
      await queryClient.invalidateQueries({
        queryKey,
        ...options,
      });
    },
    [queryClient],
  );

  return {
    invalidateAll,
    invalidateBalances,
    invalidateBalance,
    invalidateTokenBalance,
    invalidateTransactions,
    invalidateTransaction,
    invalidateContracts,
    invalidateContract,
    invalidateContractMethod,
    invalidateContractsByChain,
    invalidateChains,
    invalidateChain,
    invalidateCustom,
  };
}
