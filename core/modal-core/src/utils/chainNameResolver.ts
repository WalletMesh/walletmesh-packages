/**
 * Chain Name Resolution Utility
 *
 * Provides centralized chain ID to human-readable name mapping.
 * This utility consolidates chain name logic previously duplicated
 * across 10+ files in the codebase.
 *
 * @module utils/chainNameResolver
 * @packageDocumentation
 */

import type { ChainType } from '../types.js';

/**
 * Get human-readable chain name from chain ID
 *
 * Resolves chain IDs in CAIP-2 format (e.g., 'eip155:1') or numeric format (e.g., 1)
 * to user-friendly chain names. Accepts both string and number inputs.
 *
 * @param chainId - Chain identifier (CAIP-2 format string, numeric string, or number)
 * @param chainType - Optional chain type for additional context (currently unused but kept for API compatibility)
 * @returns Human-readable chain name, or the stringified chainId if no mapping exists
 *
 * @example
 * ```typescript
 * getChainName('eip155:1'); // Returns 'Ethereum'
 * getChainName(1); // Returns 'Ethereum'
 * getChainName('137'); // Returns 'Polygon'
 * getChainName(137); // Returns 'Polygon'
 * getChainName('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'); // Returns 'Solana'
 * getChainName('unknown:123'); // Returns 'unknown:123' (fallback)
 * ```
 *
 * @public
 */
export function getChainName(chainId: string | number, _chainType?: ChainType): string {
  // Normalize chainId to string
  const chainIdStr = String(chainId);

  // Try to match directly first (CAIP-2 format or exact string match)
  const directMatch = getNameFromSwitch(chainIdStr);
  if (directMatch) {
    return directMatch;
  }

  // For numeric-only strings or numbers, try with eip155 prefix
  // This handles cases like getChainName(1) or getChainName('1')
  if (/^\d+$/.test(chainIdStr)) {
    const evmMatch = getNameFromSwitch(`eip155:${chainIdStr}`);
    if (evmMatch) {
      return evmMatch;
    }
  }

  // Fallback: return chain ID as-is
  return chainIdStr;
}

/**
 * Helper function to match chain ID in switch statement
 * Returns the chain name if found, null otherwise
 */
function getNameFromSwitch(chainId: string): string | null {
  switch (chainId) {
    // EVM chains (eip155 namespace)
    case 'eip155:1':
      return 'Ethereum';
    case 'eip155:137':
      return 'Polygon';
    case 'eip155:56':
      return 'BSC';
    case 'eip155:42161':
      return 'Arbitrum';
    case 'eip155:10':
      return 'Optimism';

    // Solana chains (solana namespace)
    case 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp':
      return 'Solana';
    case 'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z':
      return 'Solana Testnet';
    case 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1':
      return 'Solana Devnet';

    // Aztec chains (aztec namespace)
    case 'aztec:31337':
      return 'Aztec Sandbox';
    case 'aztec:testnet':
      return 'Aztec Testnet';
    case 'aztec:mainnet':
      return 'Aztec Mainnet';

    // No match found
    default:
      return null;
  }
}
