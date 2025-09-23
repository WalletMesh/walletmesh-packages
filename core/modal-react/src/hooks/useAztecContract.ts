/**
 * Aztec contract hook for managing contract instances
 *
 * Provides a React hook for getting and caching Aztec contract instances,
 * following the familiar Contract.at() pattern from aztec.js.
 *
 * @module hooks/useAztecContract
 */

import type { AztecAddress, ContractArtifact } from '@aztec/aztec.js';
import { getContractAt } from '@walletmesh/modal-core/providers/aztec/lazy';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAztecWallet } from './useAztecWallet.js';

/**
 * Contract hook return type
 *
 * @public
 */
export interface UseAztecContractReturn<T = unknown> {
  /** The contract instance, null if not loaded */
  contract: T | null;
  /** Whether the contract is currently loading */
  isLoading: boolean;
  /** Any error that occurred while loading */
  error: Error | null;
  /** Refetch the contract instance */
  refetch: () => Promise<void>;
  /** Execute a contract method with automatic wallet handling */
  execute: (interaction: unknown) => Promise<unknown>;
  /** Simulate a contract method call */
  simulate: (method: unknown) => Promise<unknown>;
}

/**
 * Hook for managing Aztec contract instances
 *
 * This hook provides a convenient way to get and cache contract instances,
 * similar to the Contract.at() pattern in aztec.js. The contract instance
 * is cached and only re-fetched when the address or artifact changes.
 *
 * @param address - The contract address (optional)
 * @param artifact - The contract artifact containing ABI (optional)
 * @returns Contract instance and loading state
 *
 * @since 1.0.0
 *
 * @remarks
 * The hook automatically handles:
 * - Loading states while fetching the contract
 * - Error handling if the contract cannot be loaded
 * - Caching to avoid unnecessary re-fetches
 * - Re-fetching when address or artifact changes
 *
 * Both address and artifact must be provided to load a contract.
 * If either is missing, the hook returns null for the contract.
 *
 * @example
 * ```tsx
 * import { useAztecContract } from '@walletmesh/modal-react';
 * import { TokenContractArtifact } from '@aztec/noir-contracts.js/Token';
 *
 * function TokenInteraction({ tokenAddress }) {
 *   const { contract, isLoading, error, execute, simulate } = useAztecContract(
 *     tokenAddress,
 *     TokenContractArtifact
 *   );
 *
 *   if (isLoading) return <div>Loading contract...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!contract) return <div>No contract loaded</div>;
 *
 *   const handleTransfer = async () => {
 *     // No type casting needed - execute handles wallet interaction
 *     const receipt = await execute(
 *       contract.methods.transfer(recipient, amount)
 *     );
 *     console.log('Transfer complete:', receipt);
 *   };
 *
 *   const checkBalance = async () => {
 *     // Simulate read-only calls
 *     const balance = await simulate(
 *       contract.methods.balance_of(userAddress)
 *     );
 *     console.log('Balance:', balance);
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleTransfer}>Transfer</button>
 *       <button onClick={checkBalance}>Check Balance</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With dynamic loading
 * function ContractLoader() {
 *   const [address, setAddress] = useState(null);
 *   const [artifact, setArtifact] = useState(null);
 *
 *   const { contract, isLoading, refetch } = useAztecContract(
 *     address,
 *     artifact
 *   );
 *
 *   const loadContract = async () => {
 *     setAddress(someAddress);
 *     setArtifact(await fetchArtifact());
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={loadContract}>Load Contract</button>
 *       <button onClick={refetch} disabled={!address || isLoading}>
 *         Refresh Contract
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @public
 */
export function useAztecContract<T = unknown>(
  address?: AztecAddress | string | null,
  artifact?: ContractArtifact | null,
): UseAztecContractReturn<T> {
  const { aztecWallet, isAvailable } = useAztecWallet();
  const [contract, setContract] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Cache key to detect when we need to re-fetch
  const cacheKeyRef = useRef<string>('');

  const fetchContract = useCallback(async () => {
    // Can't load without both address and artifact
    if (!address || !artifact || !aztecWallet || !isAvailable) {
      setContract(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const newCacheKey = `${address?.toString()}-${artifact.name}`;

    // Skip if we already have this contract cached
    if (cacheKeyRef.current === newCacheKey) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const contractInstance = await getContractAt(aztecWallet, address, artifact);
      setContract(contractInstance as T);
      cacheKeyRef.current = newCacheKey;
    } catch (err) {
      const errorMessage = err instanceof Error ? err : new Error('Failed to load contract');
      setError(errorMessage);
      setContract(null);
      console.error('Failed to load contract:', err);
    } finally {
      setIsLoading(false);
    }
  }, [address, artifact, aztecWallet, isAvailable]);

  // Fetch contract when dependencies change
  useEffect(() => {
    fetchContract();
  }, [fetchContract]);

  // Manual refetch function
  const refetch = useCallback(async () => {
    cacheKeyRef.current = ''; // Clear cache to force refetch
    await fetchContract();
  }, [fetchContract]);

  // Execute a contract method interaction
  const execute = useCallback(
    async (interaction: unknown): Promise<unknown> => {
      if (!aztecWallet) {
        throw new Error('Aztec wallet is not available');
      }
      if (!contract) {
        throw new Error('Contract is not loaded');
      }

      // Use the wallet's wmExecuteTx method to execute the interaction
      const sentTx = await aztecWallet.wmExecuteTx(
        interaction as { request(): unknown; simulate(): Promise<unknown> },
      );
      const receipt = await sentTx.wait();
      return receipt;
    },
    [aztecWallet, contract],
  );

  // Simulate a contract method call
  const simulate = useCallback(async (method: unknown): Promise<unknown> => {
    if (!method) {
      throw new Error('Method is required for simulation');
    }

    // If the method has a simulate function, call it
    if (typeof method === 'object' && method !== null && 'simulate' in method) {
      const methodWithSimulate = method as { simulate: () => Promise<unknown> };
      return methodWithSimulate.simulate();
    }

    throw new Error('Method does not support simulation');
  }, []);

  return {
    contract,
    isLoading,
    error,
    refetch,
    execute,
    simulate,
  };
}
