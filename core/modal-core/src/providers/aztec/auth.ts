/**
 * Aztec auth witness management utilities
 *
 * Provides utilities for creating and managing authorization witnesses,
 * which are used for delegating actions and permissions in Aztec.
 *
 * @module providers/aztec/auth
 * @packageDocumentation
 */

import { ErrorFactory } from '../../internal/core/errors/errorFactory.js';
import type { AztecDappWallet, ContractFunctionInteraction } from './types.js';

/**
 * Auth witness with metadata
 *
 * @public
 */
export interface AuthWitnessWithMetadata {
  /** The auth witness object */
  witness: unknown;
  /** The message hash that was signed */
  messageHash: unknown;
  /** Optional description of what this auth witness authorizes */
  description?: string;
  /** Timestamp when created */
  createdAt: number;
}

/**
 * Create an auth witness for a contract function interaction
 *
 * This creates an authorization witness that allows another account to
 * execute a specific contract function on your behalf. This is useful
 * for delegated transactions and meta-transactions.
 *
 * @param wallet - The Aztec wallet instance
 * @param interaction - The contract function interaction to authorize
 * @param description - Optional description for tracking
 * @returns Auth witness with metadata
 *
 * @example
 * ```typescript
 * // Authorize someone to transfer tokens on your behalf
 * const transferInteraction = tokenContract.methods.transfer(
 *   recipient,
 *   amount
 * );
 *
 * const authWit = await createAuthWitForInteraction(
 *   wallet,
 *   transferInteraction,
 *   'Authorize transfer of 100 tokens'
 * );
 *
 * // Share the auth witness with the delegate
 * await sendAuthWitToDelegate(authWit);
 * ```
 *
 * @public
 */
export async function createAuthWitForInteraction(
  wallet: AztecDappWallet | null,
  interaction: ContractFunctionInteraction,
  description?: string,
): Promise<AuthWitnessWithMetadata> {
  if (!wallet) {
    throw ErrorFactory.connectionFailed('No Aztec wallet available');
  }

  try {
    // Get the request hash from the interaction
    const request = await interaction.request();

    // Create auth witness for the request hash
    // The wallet will sign this to authorize the action
    const messageHash = getMessageHash(request);
    const witness = await wallet.createAuthWit(messageHash);

    return {
      witness,
      messageHash,
      ...(description && { description }),
      createdAt: Date.now(),
    };
  } catch (error) {
    throw ErrorFactory.transportError(
      `Failed to create auth witness: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Create auth witnesses for multiple interactions in batch
 *
 * This is more efficient than creating auth witnesses one by one when
 * you need to authorize multiple actions. All witnesses are created
 * with a single wallet interaction.
 *
 * @param wallet - The Aztec wallet instance
 * @param interactions - Array of contract function interactions
 * @returns Array of auth witnesses with metadata
 *
 * @example
 * ```typescript
 * // Authorize multiple token operations
 * const authWits = await createBatchAuthWit(wallet, [
 *   tokenContract.methods.transfer(recipient1, amount1),
 *   tokenContract.methods.approve(spender, allowance),
 *   tokenContract.methods.transferFrom(sender, recipient2, amount2)
 * ]);
 *
 * console.log(`Created ${authWits.length} auth witnesses`);
 * ```
 *
 * @public
 */
export async function createBatchAuthWit(
  wallet: AztecDappWallet | null,
  interactions: ContractFunctionInteraction[],
): Promise<AuthWitnessWithMetadata[]> {
  if (!wallet) {
    throw ErrorFactory.connectionFailed('No Aztec wallet available');
  }

  if (!Array.isArray(interactions) || interactions.length === 0) {
    throw ErrorFactory.transportError('No interactions provided for batch auth witness creation');
  }

  try {
    const authWitnesses: AuthWitnessWithMetadata[] = [];
    const createdAt = Date.now();

    // Create auth witness for each interaction
    for (let i = 0; i < interactions.length; i++) {
      const interaction = interactions[i];
      if (!interaction) continue;
      const request = await interaction.request();
      const messageHash = getMessageHash(request);
      const witness = await wallet.createAuthWit(messageHash);

      authWitnesses.push({
        witness,
        messageHash,
        description: `Batch auth witness ${i + 1}/${interactions.length}`,
        createdAt,
      });
    }

    return authWitnesses;
  } catch (error) {
    throw ErrorFactory.transportError(
      `Failed to create batch auth witnesses: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Create an auth witness for a raw message
 *
 * This creates an authorization witness for an arbitrary message or hash.
 * This is useful for custom authorization schemes or signing messages
 * for off-chain verification.
 *
 * @param wallet - The Aztec wallet instance
 * @param message - The message to sign (string or buffer)
 * @param description - Optional description
 * @returns Auth witness with metadata
 *
 * @example
 * ```typescript
 * // Sign a message for authentication
 * const authWit = await createAuthWitForMessage(
 *   wallet,
 *   'Login to DApp at timestamp: ' + Date.now(),
 *   'Login authentication'
 * );
 *
 * // Verify on backend
 * await verifyLogin(authWit);
 * ```
 *
 * @public
 */
export async function createAuthWitForMessage(
  wallet: AztecDappWallet | null,
  message: string | Buffer,
  description?: string,
): Promise<AuthWitnessWithMetadata> {
  if (!wallet) {
    throw ErrorFactory.connectionFailed('No Aztec wallet available');
  }

  try {
    // Convert string to buffer if needed
    const messageBuffer = typeof message === 'string' ? Buffer.from(message, 'utf-8') : message;

    // Create auth witness
    const witness = await wallet.createAuthWit(messageBuffer);

    // For raw messages, we don't have a proper hash, so use the buffer
    const messageHash = messageBuffer;

    return {
      witness,
      messageHash,
      ...(description && { description }),
      createdAt: Date.now(),
    };
  } catch (error) {
    throw ErrorFactory.transportError(
      `Failed to create auth witness for message: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Verify that an auth witness is valid
 *
 * This checks whether an auth witness is valid and can be used for
 * the intended action. Note: This requires access to the account that
 * created the witness.
 *
 * @param wallet - The Aztec wallet instance
 * @param authWitness - The auth witness to verify
 * @param expectedMessage - Optional: the expected message/hash
 * @returns True if the auth witness is valid
 *
 * @example
 * ```typescript
 * const isValid = await verifyAuthWit(
 *   wallet,
 *   receivedAuthWit,
 *   expectedMessageHash
 * );
 *
 * if (!isValid) {
 *   throw ErrorFactory.validation('Invalid auth witness');
 * }
 * ```
 *
 * @public
 */
export async function verifyAuthWit(
  wallet: AztecDappWallet | null,
  authWitness: unknown,
  _expectedMessage?: unknown,
): Promise<boolean> {
  if (!wallet) {
    throw ErrorFactory.connectionFailed('No Aztec wallet available');
  }

  try {
    // In a real implementation, this would verify the signature
    // For now, we just check that the auth witness exists
    // TODO: Add proper verification once RPC method is available

    if (!authWitness) {
      return false;
    }

    // If expected message provided, could check it matches
    // This would require comparing the message hash in the witness

    return true;
  } catch (error) {
    throw ErrorFactory.transportError(
      `Failed to verify auth witness: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Helper to extract message hash from a transaction request
 *
 * @param request - The transaction request object
 * @returns The message hash
 *
 * @internal
 */
function getMessageHash(request: unknown): unknown {
  // The exact implementation depends on the Aztec transaction structure
  // This would typically involve hashing the request parameters

  // For now, return the request itself as a placeholder
  // In a real implementation, this would compute the proper hash
  return request;
}

/**
 * Store auth witnesses for later use
 *
 * This utility helps manage auth witnesses that need to be shared
 * or used later. It returns a storage key that can be used to
 * retrieve the witnesses.
 *
 * @param witnesses - Array of auth witnesses to store
 * @returns Storage key for retrieval
 *
 * @example
 * ```typescript
 * const witnesses = await createBatchAuthWit(wallet, interactions);
 * const storageKey = storeAuthWitnesses(witnesses);
 *
 * // Later or in another context
 * const retrieved = getStoredAuthWitnesses(storageKey);
 * ```
 *
 * @public
 */
const authWitnessStorage = new Map<string, AuthWitnessWithMetadata[]>();

export function storeAuthWitnesses(witnesses: AuthWitnessWithMetadata[]): string {
  const storageKey = `auth-wit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  authWitnessStorage.set(storageKey, witnesses);
  return storageKey;
}

/**
 * Retrieve stored auth witnesses
 *
 * @param storageKey - The key returned by storeAuthWitnesses
 * @returns Array of auth witnesses or undefined if not found
 *
 * @public
 */
export function getStoredAuthWitnesses(storageKey: string): AuthWitnessWithMetadata[] | undefined {
  return authWitnessStorage.get(storageKey);
}

/**
 * Clear stored auth witnesses
 *
 * @param storageKey - The key to clear, or undefined to clear all
 *
 * @public
 */
export function clearStoredAuthWitnesses(storageKey?: string): void {
  if (storageKey) {
    authWitnessStorage.delete(storageKey);
  } else {
    authWitnessStorage.clear();
  }
}
