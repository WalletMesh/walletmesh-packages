/**
 * Type guard utilities for Aztec providers
 */

import { AztecError } from '../errors.js';
import type { AztecDappWallet } from '../types.js';

// Re-export for convenience
export { AztecProviderError } from '../errors.js';

/**
 * Checks if a value is an Aztec provider
 * @param provider - The value to check
 * @returns True if the value is an Aztec provider
 */
export function isAztecProvider(provider: unknown): provider is AztecDappWallet {
  if (!provider || typeof provider !== 'object') {
    return false;
  }

  const wallet = provider as Record<string, unknown>;

  // Check for required Aztec wallet methods
  return (
    typeof wallet['deployContract'] === 'function' &&
    typeof wallet['wmExecuteTx'] === 'function' &&
    typeof wallet['wmSimulateTx'] === 'function' &&
    typeof wallet['getTxReceipt'] === 'function' &&
    typeof wallet['getAddress'] === 'function' &&
    typeof wallet['getCompleteAddress'] === 'function' &&
    typeof wallet['createAuthWit'] === 'function' &&
    typeof wallet['getBlockNumber'] === 'function'
  );
}

/**
 * Checks if an error is an Aztec provider error
 * @param error - The error to check
 * @returns True if the error is an Aztec provider error
 */
export function isAztecProviderError(error: unknown): error is AztecError {
  return error instanceof AztecError;
}

/**
 * Checks if a network is a sandbox network
 * @param network - The network to check
 * @returns True if the network is a sandbox network
 */
export function isSandboxNetwork(network: unknown): boolean {
  if (!network || typeof network !== 'object') {
    return false;
  }

  const net = network as { chainId?: number; isSandbox?: boolean; rpcUrl?: string };

  // Check for sandbox indicators
  return (
    net.isSandbox === true ||
    net.chainId === 31337 ||
    (typeof net.rpcUrl === 'string' && net.rpcUrl.includes('localhost'))
  );
}
