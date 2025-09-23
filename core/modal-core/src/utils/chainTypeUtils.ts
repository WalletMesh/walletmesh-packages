import { ChainType } from '../types.js';

/**
 * Determines the chain type from a chain ID
 *
 * This utility centralizes the logic for inferring chain type from chain ID,
 * eliminating duplicate implementations across the codebase.
 *
 * @param chainId - The chain ID to analyze (string or number)
 * @returns The determined chain type (Evm, Solana, or Aztec)
 * @remarks This function uses pattern matching to identify chain types:
 * - Aztec: IDs starting with 'aztec-' or matching specific Aztec network names
 * - Solana: IDs containing 'solana-' or matching Solana network names (mainnet-beta, testnet, devnet)
 * - EVM: All other chain IDs default to EVM (including numeric IDs)
 * @example
 * ```typescript
 * // EVM chains
 * getChainTypeFromId(1) // ChainType.Evm (Ethereum mainnet)
 * getChainTypeFromId('0x1') // ChainType.Evm (Ethereum mainnet hex)
 * getChainTypeFromId(137) // ChainType.Evm (Polygon)
 *
 * // Solana chains
 * getChainTypeFromId('solana-mainnet-beta') // ChainType.Solana
 * getChainTypeFromId('devnet') // ChainType.Solana
 *
 * // Aztec chains
 * getChainTypeFromId('aztec-mainnet') // ChainType.Aztec
 * getChainTypeFromId('aztec-custom') // ChainType.Aztec
 * ```
 */
export function getChainTypeFromId(chainId: string | number): ChainType {
  const chainIdStr = chainId.toString();

  // Aztec chain detection
  if (chainIdStr === 'aztec-mainnet' || chainIdStr === 'aztec-testnet' || chainIdStr.startsWith('aztec-')) {
    return ChainType.Aztec;
  }

  // Solana chain detection
  if (
    chainIdStr === 'solana-mainnet-beta' ||
    chainIdStr === 'solana-testnet' ||
    chainIdStr === 'solana-devnet' ||
    chainIdStr === 'mainnet-beta' ||
    chainIdStr === 'testnet' ||
    chainIdStr === 'devnet' ||
    chainIdStr.startsWith('solana-')
  ) {
    return ChainType.Solana;
  }

  // Default to EVM for numeric chains and common EVM identifiers
  return ChainType.Evm;
}
