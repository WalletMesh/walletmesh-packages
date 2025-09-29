import type { CapabilityRequirements } from '../types/capabilities.js';

/**
 * Helper functions to create common capability requirements for different blockchain ecosystems.
 *
 * Provides pre-configured capability requirements for popular blockchain networks
 * with sensible defaults while allowing customization. Simplifies the setup
 * process for common dApp scenarios.
 *
 * @example Using Ethereum defaults:
 * ```typescript
 * const requirements = createCapabilityRequirements.ethereum();
 * // → {
 * //   technologies: [{ type: 'evm', interfaces: ['eip-1193'] }],
 * //   features: ['account-management', 'transaction-signing']
 * // }
 * ```
 *
 * @example Custom multi-chain requirements:
 * ```typescript
 * const requirements = createCapabilityRequirements.multiChain({
 *   technologies: [
 *     { type: 'evm', interfaces: ['eip-1193', 'eip-6963'] },
 *     { type: 'solana', interfaces: ['solana-wallet-standard'] }
 *   ],
 *   features: ['account-management', 'transaction-signing', 'cross-chain-swaps']
 * });
 * ```
 *
 * @category Helpers
 * @since 0.1.0
 * @see {@link CapabilityRequirements} for the structure
 */
export const createCapabilityRequirements = {
  /**
   * Create capability requirements for Ethereum dApps.
   *
   * Pre-configured for standard Ethereum mainnet interactions with
   * EIP-1193 provider interface and basic account/transaction features.
   *
   * @param options - Optional customization of default requirements
   * @returns Capability requirements for Ethereum dApps
   *
   * @example Default Ethereum requirements:
   * ```typescript
   * const requirements = createCapabilityRequirements.ethereum();
   * // Chains: ['eip155:1']
   * // Features: ['account-management', 'transaction-signing']
   * // Interfaces: ['eip-1193']
   * ```
   *
   * @example Custom Ethereum networks:
   * ```typescript
   * const requirements = createCapabilityRequirements.ethereum({
   *   chains: ['eip155:1', 'eip155:5'], // Mainnet + Goerli
   *   features: ['account-management', 'transaction-signing', 'message-signing']
   * });
   * ```
   *
   * @category Blockchain
   * @since 0.1.0
   */
  ethereum(options: { features?: string[]; interfaces?: string[] } = {}): CapabilityRequirements {
    return {
      technologies: [
        {
          type: 'evm' as const,
          interfaces: options.interfaces ?? ['eip-1193'],
        },
      ],
      features: options.features ?? ['account-management', 'transaction-signing'],
    };
  },

  /**
   * Create capability requirements for Polygon dApps.
   *
   * Pre-configured for Polygon mainnet interactions with
   * EIP-1193 provider interface and basic account/transaction features.
   *
   * @param options - Optional customization of default requirements
   * @returns Capability requirements for Polygon dApps
   *
   * @example Default Polygon requirements:
   * ```typescript
   * const requirements = createCapabilityRequirements.polygon();
   * // Chains: ['eip155:137']
   * // Features: ['account-management', 'transaction-signing']
   * // Interfaces: ['eip-1193']
   * ```
   *
   * @category Blockchain
   * @since 0.1.0
   */
  polygon(options: { features?: string[]; interfaces?: string[] } = {}): CapabilityRequirements {
    return {
      technologies: [
        {
          type: 'evm' as const,
          interfaces: options.interfaces ?? ['eip-1193'],
        },
      ],
      features: options.features ?? ['account-management', 'transaction-signing'],
    };
  },

  /**
   * Create capability requirements for Solana dApps.
   *
   * Pre-configured for Solana mainnet interactions with solana-wallet-standard
   * interface and account-based transaction model.
   *
   * @param options - Optional customization of default requirements
   * @returns Capability requirements for Solana dApps
   *
   * @example Default Solana requirements:
   * ```typescript
   * const requirements = createCapabilityRequirements.solana();
   * // Chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp']
   * // Features: ['account-management', 'transaction-signing']
   * // Interfaces: ['solana-wallet-standard']
   * ```
   *
   * @example Solana with devnet:
   * ```typescript
   * const requirements = createCapabilityRequirements.solana({
   *   chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp', 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1'],
   *   features: ['account-management', 'transaction-signing', 'message-signing']
   * });
   * ```
   *
   * @category Blockchain
   * @since 0.1.0
   */
  solana(options: { features?: string[]; interfaces?: string[] } = {}): CapabilityRequirements {
    return {
      technologies: [
        {
          type: 'solana' as const,
          interfaces: options.interfaces ?? ['solana-wallet-standard'],
        },
      ],
      features: options.features ?? ['account-management', 'transaction-signing'],
    };
  },

  /**
   * Create capability requirements for Aztec dApps.
   *
   * Pre-configured for Aztec private smart contract interactions with
   * support for private transactions and zero-knowledge proofs.
   *
   * @param options - Optional customization of default requirements
   * @returns Capability requirements for Aztec dApps
   *
   * @example Default Aztec requirements:
   * ```typescript
   * const requirements = createCapabilityRequirements.aztec();
   * // Chains: ['aztec:mainnet']
   * // Features: ['private-transactions', 'transaction-signing']
   * // Interfaces: ['aztec-wallet-api-v1']
   * ```
   *
   * @example Aztec with additional privacy features:
   * ```typescript
   * const requirements = createCapabilityRequirements.aztec({
   *   features: ['private-transactions', 'transaction-signing', 'account-management']
   * });
   * ```
   *
   * @category Blockchain
   * @since 0.1.0
   */
  aztec(options: { features?: string[]; interfaces?: string[] } = {}): CapabilityRequirements {
    return {
      technologies: [
        {
          type: 'aztec' as const,
          interfaces: options.interfaces ?? ['aztec-wallet-api-v1'],
        },
      ],
      features: options.features ?? ['private-transactions', 'transaction-signing'],
    };
  },

  /**
   * Create capability requirements for multi-chain dApps.
   *
   * Flexible factory for dApps that operate across multiple blockchain
   * networks. Requires explicit chain specification while providing
   * sensible defaults for features and interfaces.
   *
   * @param options - Multi-chain configuration with required chains
   * @returns Capability requirements for multi-chain dApps
   *
   * @example Cross-chain DeFi dApp:
   * ```typescript
   * const requirements = createCapabilityRequirements.multiChain({
   *   chains: ['eip155:1', 'eip155:137', 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
   *   features: ['account-management', 'transaction-signing', 'cross-chain-swaps'],
   *   interfaces: ['eip-1193', 'solana-wallet-standard']
   * });
   * ```
   *
   * @example EVM-focused multi-chain:
   * ```typescript
   * const requirements = createCapabilityRequirements.multiChain({
   *   chains: ['eip155:1', 'eip155:137', 'eip155:42161'],
   *   features: ['account-management', 'transaction-signing', 'batch-transactions']
   *   // Uses default interfaces: ['eip-1193', 'solana-wallet-standard']
   * });
   * ```
   *
   * @category Blockchain
   * @since 0.1.0
   */
  multiChain(options: { features?: string[]; interfaces?: string[] } = {}): CapabilityRequirements {
    return {
      technologies: [
        {
          type: 'evm' as const,
          interfaces: ['eip-1193'],
        },
        {
          type: 'solana' as const,
          interfaces: ['solana-wallet-standard'],
        },
      ],
      features: options.features ?? ['account-management', 'transaction-signing'],
    };
  },
};
