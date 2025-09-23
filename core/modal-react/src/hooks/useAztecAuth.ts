/**
 * Aztec auth witness hook for authorization management
 *
 * Provides a React hook for creating and managing authorization witnesses
 * in Aztec, which are used for delegating actions and permissions.
 *
 * @module hooks/useAztecAuth
 */

import { ErrorFactory } from '@walletmesh/modal-core';
import {
  type AuthWitnessWithMetadata,
  type ContractFunctionInteraction,
  clearStoredAuthWitnesses,
  createAuthWitForInteraction,
  createAuthWitForMessage,
  createBatchAuthWit,
  getStoredAuthWitnesses,
  storeAuthWitnesses,
  verifyAuthWit,
} from '@walletmesh/modal-core/providers/aztec/lazy';
import { useCallback, useRef, useState } from 'react';
import { useAztecWallet } from './useAztecWallet.js';

/**
 * Auth witness storage entry
 *
 * @public
 */
export interface AuthWitnessEntry {
  /** Unique ID for this entry */
  id: string;
  /** Storage key for retrieval */
  storageKey: string;
  /** Array of auth witnesses */
  witnesses: AuthWitnessWithMetadata[];
  /** Optional label for this entry */
  label?: string;
  /** When this entry was created */
  createdAt: number;
}

/**
 * Auth witness hook return type
 *
 * @public
 */
export interface UseAztecAuthReturn {
  /** Create auth witness for a single interaction */
  createAuthWit: (
    interaction: ContractFunctionInteraction,
    description?: string,
  ) => Promise<AuthWitnessWithMetadata>;
  /** Create auth witnesses for multiple interactions */
  createBatchAuthWit: (interactions: ContractFunctionInteraction[]) => Promise<AuthWitnessWithMetadata[]>;
  /** Create auth witness for a message */
  createMessageAuthWit: (message: string, description?: string) => Promise<AuthWitnessWithMetadata>;
  /** Verify an auth witness */
  verifyAuthWit: (authWitness: unknown, expectedMessage?: unknown) => Promise<boolean>;
  /** Store auth witnesses and get storage key */
  storeWitnesses: (witnesses: AuthWitnessWithMetadata[], label?: string) => string;
  /** Retrieve stored auth witnesses */
  getStoredWitnesses: (storageKey: string) => AuthWitnessWithMetadata[] | undefined;
  /** Clear stored auth witnesses */
  clearStoredWitnesses: (storageKey?: string) => void;
  /** List of all stored auth witness entries */
  storedEntries: AuthWitnessEntry[];
  /** Remove a specific stored entry */
  removeStoredEntry: (id: string) => void;
  /** Whether currently creating auth witnesses */
  isCreating: boolean;
  /** Any error that occurred */
  error: Error | null;
}

/**
 * Hook for managing Aztec authorization witnesses
 *
 * This hook provides functionality for creating and managing auth witnesses,
 * which allow delegating actions to other accounts. Auth witnesses can be
 * created for contract interactions, messages, or batches of operations.
 *
 * @returns Auth witness management functions and state
 *
 * @since 1.0.0
 *
 * @remarks
 * The hook provides:
 * - Auth witness creation for interactions and messages
 * - Batch auth witness creation
 * - Auth witness verification
 * - Local storage management for witnesses
 * - Progress tracking and error handling
 *
 * Auth witnesses are used in Aztec for delegated transactions,
 * meta-transactions, and other authorization schemes.
 *
 * @example
 * ```tsx
 * import { useAztecAuth, useAztecContract } from '@walletmesh/modal-react';
 *
 * function DelegatedTransfer({ tokenContract }) {
 *   const {
 *     createAuthWit,
 *     storeWitnesses,
 *     storedEntries
 *   } = useAztecAuth();
 *
 *   const handleCreateDelegation = async () => {
 *     // Create auth witness for transfer
 *     const interaction = tokenContract.methods.transfer(
 *       recipientAddress,
 *       amount
 *     );
 *
 *     const authWit = await createAuthWit(
 *       interaction,
 *       'Delegate transfer of 100 tokens'
 *     );
 *
 *     // Store for later sharing
 *     const storageKey = storeWitnesses([authWit], 'Token Transfer Delegation');
 *
 *     // Share storageKey with delegate
 *     await shareWithDelegate(storageKey);
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleCreateDelegation}>
 *         Create Transfer Delegation
 *       </button>
 *
 *       <h3>Stored Delegations ({storedEntries.length})</h3>
 *       {storedEntries.map((entry) => (
 *         <div key={entry.id}>
 *           {entry.label} - {entry.witnesses.length} witnesses
 *           <button onClick={() => removeStoredEntry(entry.id)}>
 *             Remove
 *           </button>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Message signing for authentication
 * function AuthenticationFlow() {
 *   const { createMessageAuthWit, verifyAuthWit } = useAztecAuth();
 *   const [authToken, setAuthToken] = useState(null);
 *
 *   const handleLogin = async () => {
 *     // Create auth witness for login message
 *     const timestamp = Date.now();
 *     const message = `Login to MyDApp at ${timestamp}`;
 *
 *     const authWit = await createMessageAuthWit(
 *       message,
 *       'Login authentication'
 *     );
 *
 *     // Send to backend for verification
 *     const response = await fetch('/api/auth/login', {
 *       method: 'POST',
 *       body: JSON.stringify({ authWit, timestamp }),
 *     });
 *
 *     const { token } = await response.json();
 *     setAuthToken(token);
 *   };
 *
 *   return (
 *     <button onClick={handleLogin}>
 *       Sign In with Aztec
 *     </button>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Batch delegations for complex operations
 * function BatchDelegation({ contracts }) {
 *   const { createBatchAuthWit, isCreating } = useAztecAuth();
 *
 *   const handleBatchDelegation = async () => {
 *     const interactions = [
 *       contracts.token1.methods.approve(spender, amount1),
 *       contracts.token2.methods.approve(spender, amount2),
 *       contracts.dex.methods.swap(token1, token2, amount1),
 *     ];
 *
 *     const witnesses = await createBatchAuthWit(interactions);
 *     console.log(`Created ${witnesses.length} auth witnesses`);
 *
 *     // Process witnesses...
 *   };
 *
 *   return (
 *     <button onClick={handleBatchDelegation} disabled={isCreating}>
 *       {isCreating ? 'Creating...' : 'Create Batch Delegation'}
 *     </button>
 *   );
 * }
 * ```
 *
 * @public
 */
export function useAztecAuth(): UseAztecAuthReturn {
  const { aztecWallet: wallet, isAvailable } = useAztecWallet();
  const [storedEntries, setStoredEntries] = useState<AuthWitnessEntry[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const entryIdCounter = useRef(0);

  // Create auth witness for interaction
  const createAuthWit = useCallback(
    async (
      interaction: ContractFunctionInteraction,
      description?: string,
    ): Promise<AuthWitnessWithMetadata> => {
      if (!wallet || !isAvailable) {
        throw ErrorFactory.connectionFailed('No Aztec wallet connected');
      }

      setIsCreating(true);
      setError(null);

      try {
        const authWit = await createAuthWitForInteraction(wallet, interaction, description);
        return authWit;
      } catch (err) {
        const authError = err instanceof Error ? err : new Error('Failed to create auth witness');
        setError(authError);
        throw authError;
      } finally {
        setIsCreating(false);
      }
    },
    [wallet, isAvailable],
  );

  // Create batch auth witnesses
  const createBatchAuthWitnesses = useCallback(
    async (interactions: ContractFunctionInteraction[]): Promise<AuthWitnessWithMetadata[]> => {
      if (!wallet || !isAvailable) {
        throw ErrorFactory.connectionFailed('No Aztec wallet connected');
      }

      setIsCreating(true);
      setError(null);

      try {
        const witnesses = await createBatchAuthWit(wallet, interactions);
        return witnesses;
      } catch (err) {
        const authError = err instanceof Error ? err : new Error('Failed to create batch auth witnesses');
        setError(authError);
        throw authError;
      } finally {
        setIsCreating(false);
      }
    },
    [wallet, isAvailable],
  );

  // Create auth witness for message
  const createMessageAuthWit = useCallback(
    async (message: string, description?: string): Promise<AuthWitnessWithMetadata> => {
      if (!wallet || !isAvailable) {
        throw ErrorFactory.connectionFailed('No Aztec wallet connected');
      }

      setIsCreating(true);
      setError(null);

      try {
        const authWit = await createAuthWitForMessage(wallet, message, description);
        return authWit;
      } catch (err) {
        const authError = err instanceof Error ? err : new Error('Failed to create message auth witness');
        setError(authError);
        throw authError;
      } finally {
        setIsCreating(false);
      }
    },
    [wallet, isAvailable],
  );

  // Verify auth witness
  const verifyAuthWitness = useCallback(
    async (authWitness: unknown, expectedMessage?: unknown): Promise<boolean> => {
      if (!wallet || !isAvailable) {
        throw ErrorFactory.connectionFailed('No Aztec wallet connected');
      }

      setError(null);

      try {
        const isValid = await verifyAuthWit(wallet, authWitness, expectedMessage);
        return isValid;
      } catch (err) {
        const verifyError = err instanceof Error ? err : new Error('Failed to verify auth witness');
        setError(verifyError);
        throw verifyError;
      }
    },
    [wallet, isAvailable],
  );

  // Store witnesses with tracking
  const storeWitnesses = useCallback((witnesses: AuthWitnessWithMetadata[], label?: string): string => {
    const storageKey = storeAuthWitnesses(witnesses);

    // Add to tracked entries
    const entry: AuthWitnessEntry = {
      id: `auth-entry-${entryIdCounter.current++}`,
      storageKey,
      witnesses,
      ...(label && { label }),
      createdAt: Date.now(),
    };

    setStoredEntries((prev) => [...prev, entry]);

    return storageKey;
  }, []);

  // Get stored witnesses
  const getStoredWitnesses = useCallback((storageKey: string): AuthWitnessWithMetadata[] | undefined => {
    return getStoredAuthWitnesses(storageKey);
  }, []);

  // Clear stored witnesses
  const clearStoredWitnesses = useCallback((storageKey?: string) => {
    clearStoredAuthWitnesses(storageKey);

    if (storageKey) {
      // Remove from tracked entries
      setStoredEntries((prev) => prev.filter((entry) => entry.storageKey !== storageKey));
    } else {
      // Clear all entries
      setStoredEntries([]);
    }
  }, []);

  // Remove a specific stored entry
  const removeStoredEntry = useCallback(
    (id: string) => {
      const entry = storedEntries.find((e) => e.id === id);
      if (entry) {
        clearStoredAuthWitnesses(entry.storageKey);
        setStoredEntries((prev) => prev.filter((e) => e.id !== id));
      }
    },
    [storedEntries],
  );

  return {
    createAuthWit,
    createBatchAuthWit: createBatchAuthWitnesses,
    createMessageAuthWit,
    verifyAuthWit: verifyAuthWitness,
    storeWitnesses,
    getStoredWitnesses,
    clearStoredWitnesses,
    storedEntries,
    removeStoredEntry,
    isCreating,
    error,
  };
}
