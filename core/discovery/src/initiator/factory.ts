import type { InitiatorInfo } from '../types/core.js';
import type { CapabilityRequirements, CapabilityPreferences } from '../types/capabilities.js';
import type { SecurityPolicy } from '../types/security.js';
import type { DiscoveryInitiatorConfig } from '../types/testing.js';
import { DiscoveryInitiator } from './DiscoveryInitiator.js';
import { createSecurityPolicy } from '../security.js';

/**
 * Create a discovery listener with comprehensive validation and configuration helpers.
 *
 * Factory function that creates and configures a DiscoveryInitiator instance with
 * built-in validation of all parameters. Provides a simplified interface for
 * common discovery scenarios while maintaining full configuration flexibility.
 *
 * @param config - Configuration object for the discovery listener
 * @returns Configured DiscoveryInitiator instance ready for use
 * @throws {Error} If configuration validation fails
 *
 * @example Basic Ethereum initiator:
 * ```typescript
 * const listener = createDiscoveryInitiator({
 *   requirements: {
 *     chains: ['eip155:1'],
 *     features: ['account-management', 'transaction-signing'],
 *     interfaces: ['eip-1193']
 *   },
 *   initiatorInfo: {
 *     name: 'My DeFi App',
 *     url: 'https://myapp.com',
 *     icon: 'data:image/svg+xml;base64,...'
 *   },
 *   timeout: 5000
 * });
 *
 * const responders = await listener.startDiscovery();
 * ```
 *
 * @example With preferences and security:
 * ```typescript
 * const listener = createDiscoveryInitiator({
 *   requirements: {
 *     chains: ['eip155:1', 'eip155:137'],
 *     features: ['account-management'],
 *     interfaces: ['eip-1193']
 *   },
 *   preferences: {
 *     chains: ['eip155:5'], // Optional testnet support
 *     features: ['hardware-wallet']
 *   },
 *   initiatorInfo: {
 *     name: 'Multi-Chain DApp',
 *     url: 'https://myapp.com',
 *     icon: 'data:image/png;base64,...'
 *   },
 *   securityPolicy: createSecurityPolicy.strict({
 *     allowedOrigins: ['https://trusted-wallet.com']
 *   }),
 *   timeout: 10000
 * });
 * ```
 *
 * @category Factory
 * @since 0.1.0
 * @see {@link DiscoveryInitiator} for the created instance
 * @see {@link createCapabilityRequirements} for requirement helpers
 * @see {@link createSecurityPolicy} for security configuration
 */
export function createDiscoveryInitiator(config: {
  requirements: CapabilityRequirements;
  preferences?: CapabilityPreferences;
  initiatorInfo: InitiatorInfo;
  securityPolicy?: SecurityPolicy;
  timeout?: number;
  eventTarget?: EventTarget;
}): DiscoveryInitiator {
  // Validate configuration
  validateDiscoveryInitiatorConfig(config);

  // Create listener configuration
  const listenerConfig: DiscoveryInitiatorConfig = {
    requirements: config.requirements,
    initiatorInfo: config.initiatorInfo,
    timeout: config.timeout ?? 3000,
    ...(config.preferences && { preferences: config.preferences }),
    ...(config.securityPolicy && { securityPolicy: config.securityPolicy }),
    ...(config.eventTarget && { eventTarget: config.eventTarget }),
  };

  return new DiscoveryInitiator(listenerConfig);
}

/**
 * Create a simplified discovery setup focused only on discovery (no connection management).
 *
 * Streamlined factory function that creates a discovery listener with sensible defaults
 * for common use cases. Connection handling is left to modal-core and modal-react packages.
 *
 * @param config - Configuration object with chains and optional settings
 * @returns Object containing listener, config, requirements, and security policy
 *
 * @example Simple setup:
 * ```typescript
 * const listener = createInitiatorDiscoverySetup(
 *   {
 *     chains: ['eip155:1'],
 *     features: ['account-management'],
 *     interfaces: ['eip-1193']
 *   },
 *   {
 *     name: 'My DApp',
 *     url: 'https://mydapp.com',
 *     icon: 'data:image/svg+xml;base64,...'
 *   }
 * );
 *
 * const responders = await listener.startDiscovery();
 * // Use responder transport config with modal-core/modal-react for connection
 * ```
 *
 * @category Factory
 * @since 0.1.0
 */
export function createInitiatorDiscoverySetup(config: {
  chains: string[];
  timeout?: number;
  requireHttps?: boolean;
  initiatorInfo?: InitiatorInfo;
  preferences?: CapabilityPreferences;
  securityPolicy?: SecurityPolicy;
  eventTarget?: EventTarget;
}): {
  listener: DiscoveryInitiator;
  config: DiscoveryInitiatorConfig;
  requirements: CapabilityRequirements;
  securityPolicy: SecurityPolicy;
} {
  // Create default initiator info if not provided
  const initiatorInfo = config.initiatorInfo || {
    name: 'Test Initiator',
    url: 'https://initiator.example.com',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+PC9zdmc+',
  };

  // Create requirements from chains
  const requirements: CapabilityRequirements = {
    technologies: [
      {
        type: 'evm' as const,
        interfaces: ['eip-1193'],
      },
    ],
    features: ['account-management', 'transaction-signing'],
  };

  // Create security policy
  const securityPolicy =
    config.securityPolicy ||
    (config.requireHttps ? createSecurityPolicy.production() : createSecurityPolicy.development());

  // Create the configuration
  const discoveryConfig: DiscoveryInitiatorConfig = {
    requirements,
    initiatorInfo,
    securityPolicy,
    timeout: config.timeout || 3000, // Default timeout
    ...(config.eventTarget && { eventTarget: config.eventTarget }),
    ...(config.preferences && { preferences: config.preferences }),
  };

  // Create the listener
  const listener = createDiscoveryInitiator(discoveryConfig);

  return {
    listener,
    config: discoveryConfig,
    requirements,
    securityPolicy,
  };
}

/**
 * Validate discovery listener configuration.
 */
function validateDiscoveryInitiatorConfig(config: {
  requirements: CapabilityRequirements;
  preferences?: CapabilityPreferences;
  initiatorInfo: InitiatorInfo;
  securityPolicy?: SecurityPolicy;
  timeout?: number;
  eventTarget?: EventTarget;
}): void {
  // Validate requirements
  if (!config.requirements) {
    throw new Error('Requirements are required');
  }

  if (!Array.isArray(config.requirements.technologies)) {
    throw new Error('Required technologies must be an array');
  }

  // Validate each technology requirement
  for (const tech of config.requirements.technologies) {
    if (!Array.isArray(tech.interfaces)) {
      throw new Error('Technology interfaces must be an array');
    }
  }

  if (!Array.isArray(config.requirements.features)) {
    throw new Error('Required features must be an array');
  }

  // Validate initiator info
  if (!config.initiatorInfo) {
    throw new Error('Initiator info is required');
  }

  if (!config.initiatorInfo.name || typeof config.initiatorInfo.name !== 'string') {
    throw new Error('Initiator name is required and must be a string');
  }

  if (!config.initiatorInfo.url || typeof config.initiatorInfo.url !== 'string') {
    throw new Error('Initiator URL is required and must be a string');
  }

  // Validate URL format
  try {
    new URL(config.initiatorInfo.url);
  } catch {
    throw new Error('Initiator URL must be a valid URL');
  }

  // Validate icon if provided
  if (config.initiatorInfo.icon && !config.initiatorInfo.icon.startsWith('data:')) {
    throw new Error('Initiator icon must be a data URI');
  }

  // Validate timeout if provided
  if (config.timeout !== undefined && (typeof config.timeout !== 'number' || config.timeout <= 0)) {
    throw new Error('Timeout must be a positive number');
  }

  // Validate preferences if provided
  if (config.preferences) {
    if (config.preferences.technologies && !Array.isArray(config.preferences.technologies)) {
      throw new Error('Preference technologies must be an array');
    }
    if (config.preferences.features && !Array.isArray(config.preferences.features)) {
      throw new Error('Preference features must be an array');
    }
  }
}

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
 * //   chains: ['eip155:1'],
 * //   features: ['account-management', 'transaction-signing'],
 * //   interfaces: ['eip-1193']
 * // }
 * ```
 *
 * @example Custom multi-chain requirements:
 * ```typescript
 * const requirements = createCapabilityRequirements.multiChain({
 *   chains: ['eip155:1', 'eip155:137', 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
 *   features: ['account-management', 'transaction-signing', 'cross-chain-swaps'],
 *   interfaces: ['eip-1193', 'solana-wallet-standard']
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
