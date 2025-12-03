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
import { ensureContractClassRegistered, normalizeArtifact } from '@walletmesh/modal-core/providers/aztec';
import { getContractAt } from '@walletmesh/modal-core/providers/aztec/lazy';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from './internal/useStore.js';
import type { ContractArtifact } from './useAztecDeploy.js';
import { useAztecWallet } from './useAztecWallet.js';

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
  /** Whether a deployment for this address is pending confirmation */
  isDeploymentPending: boolean;
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
  const [isDeploymentPending, setIsDeploymentPending] = useState(false);

  // Cache key to detect when we need to re-fetch
  const cacheKeyRef = useRef<string>('');
  // Retry tracking
  const retryCountRef = useRef<number>(0);
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Get pending transactions to check for deployments
  // Check both general transaction state and Aztec-specific transaction tracking
  const hasPendingDeployments = useStore((state) => {
    // Check entities.transactions for any pending transactions
    const transactions = Object.values(state.entities.transactions || {});
    const hasGeneralPendingTx = transactions.some(
      (tx) => tx && (tx.status === 'proving' || tx.status === 'sending' || tx.status === 'pending'),
    );

    // Also check if there are any background transaction IDs (indicates async operations)
    const hasBackgroundTx = (state.meta?.backgroundTransactionIds?.length ?? 0) > 0;

    return hasGeneralPendingTx || hasBackgroundTx;
  });

  const fetchContract = useCallback(
    async (isRetry = false) => {
      // Clear any existing retry timer
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }

      // Can't load without both address and artifact
      if (!address || !artifact || !aztecWallet || !isAvailable) {
        setContract(null);
        setIsLoading(false);
        setError(null);
        setIsDeploymentPending(false);
        retryCountRef.current = 0;
        return;
      }

      const newCacheKey = `${address?.toString()}-${artifact.name}`;

      // Skip if we already have this contract cached
      if (cacheKeyRef.current === newCacheKey && !isRetry) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Ensure artifact has required properties for compatibility
        const compatibleArtifact = normalizeArtifact(artifact);

        await ensureContractClassRegistered(aztecWallet, compatibleArtifact);

        const contractInstance = await getContractAt(
          aztecWallet,
          address,
          compatibleArtifact as Parameters<typeof getContractAt>[2],
        );

        // Success! Reset retry count and cache
        setContract(contractInstance as T);
        cacheKeyRef.current = newCacheKey;
        retryCountRef.current = 0;
        setIsDeploymentPending(false);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err : ErrorFactory.unknownError('Failed to load contract');

        // Check if this looks like a "contract not found" error and there are pending deployments
        // Note: Router wraps errors with "Wallet returned an error" as the message,
        // so we need to check both the message and the data field for the actual error
        const errorData = (errorMessage as Error & { data?: unknown }).data;
        const dataMessage =
          typeof errorData === 'string'
            ? errorData
            : typeof errorData === 'object' && errorData !== null && 'message' in errorData
              ? String((errorData as { message: unknown }).message)
              : '';

        const isContractNotFound =
          errorMessage.message.includes('Failed to get contract at address') ||
          errorMessage.message.includes('Contract not found') ||
          errorMessage.message.includes('Contract metadata not found') ||
          errorMessage.message.includes('has not been registered') ||
          errorMessage.message.includes('Wallet returned an error') ||
          errorMessage.message.includes('getInstance') ||
          dataMessage.includes('Failed to get contract at address') ||
          dataMessage.includes('Contract not found') ||
          dataMessage.includes('Contract metadata not found') ||
          dataMessage.includes('has not been registered') ||
          dataMessage.includes('getInstance');

        if (isContractNotFound) {
          // Contract not found - could be a race condition with deployment
          // Retry with different strategies based on whether we detect pending deployments

          let maxRetries: number;
          let baseDelay: number;

          if (hasPendingDeployments) {
            // We detected pending deployments - be more patient
            maxRetries = 12; // More retries when we know deployment is happening
            baseDelay = 2000; // Start with 2 seconds
          } else {
            // No pending deployments detected - could still be a race condition
            // where the transaction hasn't hit the store yet. Do a few quick retries.
            maxRetries = 5; // Fewer retries without confirmed deployment
            baseDelay = 1000; // Faster initial retry
          }

          if (retryCountRef.current < maxRetries) {
            retryCountRef.current += 1;
            // Exponential backoff, but capped to avoid extremely long waits
            const delay = Math.min(baseDelay * 1.5 ** (retryCountRef.current - 1), 10000);

            console.log(
              `[useAztecContract] Contract not yet available (attempt ${retryCountRef.current}/${maxRetries}), ` +
                `pendingDeployments: ${hasPendingDeployments}, retrying in ${delay}ms...`,
            );

            setIsDeploymentPending(hasPendingDeployments);
            setIsLoading(false);
            setError(
              ErrorFactory.unknownError(
                hasPendingDeployments
                  ? `Contract deployment in progress (attempt ${retryCountRef.current}/${maxRetries})...`
                  : `Contract not yet available (attempt ${retryCountRef.current}/${maxRetries}), checking...`,
              ),
            );

            // Schedule retry
            retryTimerRef.current = setTimeout(() => {
              fetchContract(true);
            }, delay);

            return;
          }

          // Max retries exceeded
          if (hasPendingDeployments) {
            setError(
              ErrorFactory.unknownError(
                'Contract deployment taking longer than expected. Please try refreshing manually.',
              ),
            );
            setIsDeploymentPending(true);
          } else {
            // No pending deployments and retries exhausted - this is a real error
            setError(errorMessage);
            setIsDeploymentPending(false);
          }
        } else {
          // Some other error (not contract not found)
          setError(errorMessage);
          setIsDeploymentPending(false);
        }

        setContract(null);
        console.error('Failed to load contract:', err);
      } finally {
        // Only set loading to false if we're not scheduling a retry
        if (!retryTimerRef.current) {
          setIsLoading(false);
        }
      }
    },
    [address, artifact, aztecWallet, isAvailable, hasPendingDeployments],
  );

  // Fetch contract when dependencies change
  useEffect(() => {
    fetchContract();

    // Cleanup retry timer on unmount or when dependencies change
    return () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };
  }, [fetchContract]);

  // Manual refetch function
  const refetch = useCallback(async () => {
    cacheKeyRef.current = ''; // Clear cache to force refetch
    retryCountRef.current = 0; // Reset retry count
    await fetchContract();
  }, [fetchContract]);

  return {
    contract,
    isLoading,
    error,
    isDeploymentPending,
    refetch,
  };
}
