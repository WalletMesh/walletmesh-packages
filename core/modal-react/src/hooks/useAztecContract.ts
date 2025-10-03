/**
 * Aztec contract hook for managing contract instances
 *
 * Provides a React hook for getting and caching Aztec contract instances,
 * following the familiar Contract.at() pattern from aztec.js.
 *
 * @module hooks/useAztecContract
 */

import type { AztecAddress } from '@aztec/aztec.js';
import { ErrorFactory } from '@walletmesh/modal-core';
import { getContractAt } from '@walletmesh/modal-core/providers/aztec/lazy';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { AztecDappWallet } from '@walletmesh/modal-core/providers/aztec/types.js';
import type { ContractArtifact } from './useAztecDeploy.js';
import { useAztecWallet } from './useAztecWallet.js';

const registeredContractClasses = new Set<string>();

async function registerArtifactWithWallet(wallet: AztecDappWallet | null, artifact: ContractArtifact) {
  if (!wallet) {
    return;
  }

  const { getContractClassFromArtifact } = await import('@aztec/stdlib/contract');
  const { id } = await getContractClassFromArtifact(artifact as any);
  const key = id.toString();

  if (registeredContractClasses.has(key)) {
    return;
  }

  try {
    await wallet.registerContractClass(artifact as Parameters<typeof wallet.registerContractClass>[0]);
  } catch (error) {
    // If registration fails because the class already exists, we can safely continue.
    const message = error instanceof Error ? error.message : '';
    if (!message.includes('already registered')) {
      throw error;
    }
  }

  registeredContractClasses.add(key);
}

/**
 * Contract hook return type
 *
 * @public
 */
export interface UseAztecContractReturn<T = unknown> {
  /** The contract instance, null if not loaded. Use native Aztec.js methods: contract.methods.methodName(...).send() or .simulate() */
  contract: T | null;
  /** Whether the contract is currently loading */
  isLoading: boolean;
  /** Any error that occurred while loading */
  error: Error | null;
  /** Refetch the contract instance */
  refetch: () => Promise<void>;
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
 *   const { contract, isLoading, error } = useAztecContract(
 *     tokenAddress,
 *     TokenContractArtifact
 *   );
 *
 *   if (isLoading) return <div>Loading contract...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!contract) return <div>No contract loaded</div>;
 *
 *   const handleTransfer = async () => {
 *     // Use native Aztec.js fluent API
 *     const sentTx = await contract.methods.transfer(recipient, amount).send();
 *     const receipt = await sentTx.wait();
 *     console.log('Transfer complete:', receipt);
 *   };
 *
 *   const checkBalance = async () => {
 *     // Use native simulate() method
 *     const balance = await contract.methods.balance_of(userAddress).simulate();
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
 * // With dynamic loading and native Aztec.js patterns
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
 *   const executeMethod = async () => {
 *     if (!contract) return;
 *     // Use native Aztec.js API
 *     const sentTx = await contract.methods.someMethod().send();
 *     await sentTx.wait();
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={loadContract}>Load Contract</button>
 *       <button onClick={refetch} disabled={!address || isLoading}>
 *         Refresh Contract
 *       </button>
 *       <button onClick={executeMethod} disabled={!contract}>
 *         Execute Method
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
      // Ensure artifact has required properties for compatibility
      const compatibleArtifact = {
        ...artifact,
        notes: artifact.notes || {},
      };

      await registerArtifactWithWallet(aztecWallet, compatibleArtifact);

      const contractInstance = await getContractAt(
        aztecWallet,
        address,
        compatibleArtifact as Parameters<typeof getContractAt>[2],
      );
      setContract(contractInstance as T);
      cacheKeyRef.current = newCacheKey;
    } catch (err) {
      const errorMessage = err instanceof Error ? err : ErrorFactory.unknownError('Failed to load contract');
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

  return {
    contract,
    isLoading,
    error,
    refetch,
  };
}
