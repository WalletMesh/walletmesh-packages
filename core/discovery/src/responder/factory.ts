import type {
  ResponderInfo,
  BaseResponderInfo,
  ResponderFeature,
  ResponderType,
} from '../types/capabilities.js';
import type { SecurityPolicy } from '../types/security.js';
import type { DiscoveryResponderConfig } from '../types/testing.js';

import { DiscoveryResponder } from './DiscoveryResponder.js';
import { CapabilityMatcher } from './CapabilityMatcher.js';

/**
 * Create a discovery announcer with comprehensive validation and configuration helpers.
 *
 * Factory function that creates and configures a DiscoveryResponder instance for
 * wallet-side discovery protocol participation. Includes built-in validation of
 * wallet information and security policies.
 *
 * @param config - Configuration object for the discovery announcer
 * @returns Configured DiscoveryResponder instance ready for listening
 * @throws {Error} If configuration validation fails
 *
 * @example Basic responder setup:
 * ```typescript
 * const announcer = createDiscoveryResponder({
 *   responderInfo: {
 *     uuid: crypto.randomUUID(),
 *     rdns: 'com.mycompany.wallet',
 *     name: 'My Wallet',
 *     icon: 'data:image/svg+xml;base64,...',
 *     type: 'extension',
 *     version: '1.0.0',
 *     protocolVersion: '0.1.0',
 *     technologies: [], // technology capabilities
 *     features: [] // wallet features
 *   },
 *   securityPolicy: {
 *     requireHttps: true,
 *     allowedOrigins: ['https://trusted-dapp.com']
 *   }
 * });
 *
 * announcer.startListening();
 * ```
 *
 * @example Development setup:
 * ```typescript
 * const announcer = createDiscoveryResponder({
 *   responderInfo: myResponderInfo,
 *   securityPolicy: {
 *     requireHttps: false,
 *     allowLocalhost: true,
 *     rateLimit: { enabled: false, maxRequests: 100, windowMs: 60000 }
 *   }
 * });
 * ```
 *
 * @category Factory
 * @since 0.1.0
 * @see {@link DiscoveryResponder} for the created instance
 * @see {@link createResponderInfo} for responder info helpers
 */
export function createDiscoveryResponder(config: {
  responderInfo: ResponderInfo;
  securityPolicy?: SecurityPolicy;
  eventTarget?: EventTarget;
}): DiscoveryResponder {
  // Validate and sanitize configuration
  validateDiscoveryResponderConfig(config);

  // Sanitize security policy if provided
  const sanitizedSecurityPolicy = config.securityPolicy
    ? validateSecurityPolicy(config.securityPolicy)
    : undefined;

  const announcerConfig: DiscoveryResponderConfig = {
    responderInfo: config.responderInfo,
    ...(sanitizedSecurityPolicy && { securityPolicy: sanitizedSecurityPolicy }),
    ...(config.eventTarget && { eventTarget: config.eventTarget }),
  };

  return new DiscoveryResponder(announcerConfig);
}

/**
 * Create a capability matcher for evaluating dApp capability requirements.
 *
 * Factory function that creates a CapabilityMatcher instance for determining
 * if the responder can fulfill initiator capability requirements. Essential component
 * for privacy-preserving discovery responses.
 *
 * @param responderInfo - Responder information including supported chains and features
 * @returns Configured CapabilityMatcher instance
 * @throws {Error} If wallet info validation fails
 *
 * @example
 * ```typescript
 * const matcher = createCapabilityMatcher({
 *   uuid: 'wallet-id',
 *   rdns: 'com.mycompany.wallet',
 *   name: 'My Wallet',
 *   // ... other wallet info
 *   technologies: [{ type: 'evm', interfaces: ['eip-1193'] }], // technology config
 *   features: [{ id: 'account-management' }] // feature config
 * });
 *
 * // Check if responder can fulfill a discovery request
 * const result = matcher.matchCapabilities(capabilityRequest);
 * if (result.canFulfill) {
 *   console.log('Responder qualifies for this initiator');
 * }
 * ```
 *
 * @category Factory
 * @since 0.1.0
 * @see {@link CapabilityMatcher} for the created instance
 */
export function createCapabilityMatcher(responderInfo: ResponderInfo): CapabilityMatcher {
  validateResponderInfo(responderInfo);
  return new CapabilityMatcher(responderInfo);
}

/**
 * Create a complete responder discovery setup with integrated announcer and matcher.
 *
 * High-level factory function that creates a full responder-side discovery setup
 * including both announcement and capability matching components. Provides a
 * streamlined interface for responder integration with automatic synchronization.
 *
 * @param config - Configuration for responder discovery components
 * @returns Object with discovery components and convenience methods
 *
 * @example Complete responder setup:
 * ```typescript
 * const setup = createResponderDiscoverySetup({
 *   responderInfo: {
 *     uuid: crypto.randomUUID(),
 *     rdns: 'com.mycompany.wallet',
 *     name: 'My Wallet',
 *     icon: 'data:image/svg+xml;base64,...',
 *     type: 'extension',
 *     version: '1.0.0',
 *     protocolVersion: '0.1.0',
 *     technologies: [], // supported technologies
 *     features: [] // wallet features
 *   },
 *   securityPolicy: {
 *     requireHttps: true,
 *     allowedOrigins: ['https://trusted-dapp.com'],
 *     rateLimit: { enabled: true, maxRequests: 10, windowMs: 60000 }
 *   }
 * });
 *
 * // Start discovery
 * setup.startListening();
 *
 * // Update capabilities dynamically
 * setup.updateResponderInfo(updatedResponderInfo);
 *
 * // Monitor activity
 * const stats = setup.getStats();
 * console.log('Discovery stats:', stats);
 *
 * // Cleanup when done
 * setup.cleanup();
 * ```
 *
 * @category Factory
 * @since 0.1.0
 * @see {@link createDiscoveryResponder} for announcer configuration
 * @see {@link createCapabilityMatcher} for matcher configuration
 */
export function createResponderDiscoverySetup(config: {
  responderInfo: ResponderInfo;
  securityPolicy?: SecurityPolicy;
  eventTarget?: EventTarget;
}) {
  const discoveryAnnouncer = createDiscoveryResponder(config);
  const capabilityMatcher = createCapabilityMatcher(config.responderInfo);

  return {
    discoveryAnnouncer,
    capabilityMatcher,

    /**
     * Start listening for discovery requests.
     */
    startListening(): void {
      discoveryAnnouncer.startListening();
    },

    /**
     * Stop listening for discovery requests.
     */
    stopListening(): void {
      discoveryAnnouncer.stopListening();
    },

    /**
     * Update responder information for both components.
     */
    updateResponderInfo(responderInfo: ResponderInfo): void {
      validateResponderInfo(responderInfo);
      discoveryAnnouncer.updateResponderInfo(responderInfo);
      capabilityMatcher.updateResponderInfo(responderInfo);
    },

    /**
     * Get combined statistics from both components.
     */
    getStats() {
      return {
        announcer: discoveryAnnouncer.getStats(),
        matcher: capabilityMatcher.getCapabilityDetails(),
      };
    },

    /**
     * Clean up resources and stop listening.
     */
    cleanup(): void {
      discoveryAnnouncer.cleanup();
    },
  };
}

/**
 * Validate discovery responder configuration.
 */
function validateDiscoveryResponderConfig(config: {
  responderInfo: ResponderInfo;
  securityPolicy?: SecurityPolicy;
  eventTarget?: EventTarget;
}): void {
  if (!config.responderInfo) {
    throw new Error('Responder info is required');
  }

  validateResponderInfo(config.responderInfo);
}

/**
 * Validate responder information.
 */
function validateResponderInfo(responderInfo: ResponderInfo): void {
  if (!responderInfo.uuid || typeof responderInfo.uuid !== 'string') {
    throw new Error('Responder UUID is required and must be a string');
  }

  if (!responderInfo.rdns || typeof responderInfo.rdns !== 'string') {
    throw new Error('Responder RDNS is required and must be a string');
  }

  // Validate RDNS format (must have at least one dot for reverse domain notation)
  const rdnsPattern =
    /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;
  if (!rdnsPattern.test(responderInfo.rdns)) {
    throw new Error('Responder RDNS must be in reverse domain notation format');
  }

  if (!responderInfo.name || typeof responderInfo.name !== 'string') {
    throw new Error('Responder name is required and must be a string');
  }

  if (!responderInfo.icon || typeof responderInfo.icon !== 'string') {
    throw new Error('Responder icon is required and must be a string');
  }

  // Validate icon format (should be data URI)
  if (!responderInfo.icon.startsWith('data:')) {
    throw new Error('Responder icon must be a data URI');
  }

  if (!responderInfo.type || !['web', 'extension', 'hardware', 'mobile'].includes(responderInfo.type)) {
    throw new Error('Responder type must be one of: web, extension, hardware, mobile');
  }

  if (!Array.isArray(responderInfo.technologies) || responderInfo.technologies.length === 0) {
    throw new Error('Responder must support at least one technology');
  }

  if (!Array.isArray(responderInfo.features)) {
    throw new Error('Responder features must be an array');
  }

  // Validate each technology
  for (const tech of responderInfo.technologies) {
    validateTechnologyCapability(tech);
  }

  // Validate each feature
  for (const feature of responderInfo.features) {
    validateResponderFeature(feature);
  }
}

/**
 * Validate technology capability.
 */
function validateTechnologyCapability(tech: unknown): void {
  if (!tech || typeof tech !== 'object') {
    throw new Error('Technology must be an object');
  }

  const techObj = tech as Record<string, unknown>;

  if (!techObj['type'] || typeof techObj['type'] !== 'string') {
    throw new Error('Technology type is required and must be a string');
  }

  if (!['evm', 'solana', 'aztec'].includes(techObj['type'] as string)) {
    throw new Error('Technology type must be one of: evm, solana, aztec');
  }

  if (!Array.isArray(techObj['interfaces'])) {
    throw new Error('Technology interfaces must be an array');
  }

  if (techObj['features'] && !Array.isArray(techObj['features'])) {
    throw new Error('Technology features must be an array if provided');
  }
}

/**
 * Validate responder feature.
 */
function validateResponderFeature(feature: ResponderFeature): void {
  if (!feature.id || typeof feature.id !== 'string') {
    throw new Error('Feature ID is required and must be a string');
  }

  if (!feature.name || typeof feature.name !== 'string') {
    throw new Error('Feature name is required and must be a string');
  }

  // enabled field is optional in the current interface
}

/**
 * Validate security policy.
 */
function validateSecurityPolicy(policy: SecurityPolicy): SecurityPolicy {
  // Create a sanitized policy with default values for invalid fields
  const sanitized: SecurityPolicy = {};

  // Validate and sanitize allowedOrigins
  if (policy.allowedOrigins) {
    if (Array.isArray(policy.allowedOrigins)) {
      sanitized.allowedOrigins = policy.allowedOrigins.filter((origin) => typeof origin === 'string');
    }
    // Invalid allowedOrigins are ignored (undefined)
  }

  // Validate and sanitize blockedOrigins
  if (policy.blockedOrigins) {
    if (Array.isArray(policy.blockedOrigins)) {
      sanitized.blockedOrigins = policy.blockedOrigins.filter((origin) => typeof origin === 'string');
    } else {
      sanitized.blockedOrigins = []; // Default to empty array for invalid input
    }
  }

  // Validate and sanitize boolean fields with defaults
  sanitized.requireHttps = typeof policy.requireHttps === 'boolean' ? policy.requireHttps : true;
  sanitized.allowLocalhost = typeof policy.allowLocalhost === 'boolean' ? policy.allowLocalhost : false;
  sanitized.certificateValidation =
    typeof policy.certificateValidation === 'boolean' ? policy.certificateValidation : false;

  // Validate and sanitize rate limit
  if (policy.rateLimit && typeof policy.rateLimit === 'object') {
    sanitized.rateLimit = {
      enabled: typeof policy.rateLimit.enabled === 'boolean' ? policy.rateLimit.enabled : true,
      maxRequests:
        typeof policy.rateLimit.maxRequests === 'number' && policy.rateLimit.maxRequests > 0
          ? policy.rateLimit.maxRequests
          : 20,
      windowMs:
        typeof policy.rateLimit.windowMs === 'number' && policy.rateLimit.windowMs > 0
          ? policy.rateLimit.windowMs
          : 60000,
    };
  } else {
    // Default rate limit for invalid input
    sanitized.rateLimit = {
      enabled: true,
      maxRequests: 20,
      windowMs: 60000,
    };
  }

  // Copy valid string fields
  if (typeof policy.contentSecurityPolicy === 'string') {
    sanitized.contentSecurityPolicy = policy.contentSecurityPolicy;
  }

  return sanitized;
}

/**
 * Helper functions to create common responder information for different blockchain ecosystems.
 *
 * Provides pre-configured responder information templates for popular blockchain networks
 * with appropriate defaults for chains, features, and interfaces. Simplifies responder
 * setup while ensuring compatibility with the discovery protocol.
 *
 * @example Using Ethereum template:
 * ```typescript
 * const responderInfo = createResponderInfo.ethereum({
 *   uuid: crypto.randomUUID(),
 *   rdns: 'com.mycompany.responder',
 *   name: 'My Ethereum Responder',
 *   icon: 'data:image/svg+xml;base64,...',
 *   type: 'extension'
 * });
 * // Includes: eip155:1, EIP-1193, account-management, transaction-signing
 * ```
 *
 * @example Multi-chain responder:
 * ```typescript
 * const responderInfo = createResponderInfo.multiChain({
 *   uuid: crypto.randomUUID(),
 *   rdns: 'com.mycompany.responder',
 *   name: 'Multi-Chain Responder',
 *   icon: 'data:image/svg+xml;base64,...',
 *   type: 'extension',
 *   technologies: [
 *     // Custom technology configurations
 *     { type: 'evm', interfaces: ['eip-1193'], features: ['eip-712'] }, // evm config
 *     { type: 'solana', interfaces: ['solana-wallet-standard'] } // solana config
 *   ]
 * });
 * ```
 *
 * @category Helpers
 * @since 0.1.0
 * @see {@link ResponderInfo} for the structure
 */
export const createResponderInfo = {
  /**
   * Create responder information for Ethereum-compatible responders.
   *
   * Pre-configured for EVM-based blockchain interactions with EIP-1193
   * provider interface and standard Ethereum responder features. Supports
   * mainnet and common testnets.
   *
   * @param options - Responder configuration options
   * @returns Complete ResponderInfo for Ethereum responders
   *
   * @example Basic Ethereum responder:
   * ```typescript
   * const responderInfo = createResponderInfo.ethereum({
   *   uuid: crypto.randomUUID(),
   *   rdns: 'com.mycompany.responder',
   *   name: 'My Ethereum Responder',
   *   icon: 'data:image/svg+xml;base64,...',
   *   type: 'extension'
   * });
   * // → Supports eip155:1 with EIP-1193
   * ```
   *
   * @example Multi-network Ethereum responder:
   * ```typescript
   * const responderInfo = createResponderInfo.ethereum({
   *   uuid: crypto.randomUUID(),
   *   rdns: 'com.mycompany.responder',
   *   name: 'Multi-Network Responder',
   *   icon: 'data:image/svg+xml;base64,...',
   *   type: 'extension',
   *   technologies: [{ type: 'evm', interfaces: ['eip-1193'], features: ['eip-712'] }],
   *   features: ['account-management', 'transaction-signing', 'message-signing']
   * });
   * ```
   *
   * @category Blockchain
   * @since 0.1.0
   */
  ethereum(options: {
    uuid: string;
    rdns: string;
    name: string;
    icon: string;
    type: ResponderType;
    description?: string;
    features?: string[];
  }): ResponderInfo {
    const baseResponder: BaseResponderInfo = {
      uuid: options.uuid,
      rdns: options.rdns,
      name: options.name,
      icon: options.icon,
      type: options.type,
      version: '1.0.0',
      protocolVersion: '0.1.0',
      technologies: [
        {
          type: 'evm',
          interfaces: ['eip-1193', 'eip-1102'],
          features: ['eip-712', 'personal-sign'],
        },
      ],
      features: (options.features ?? ['account-management', 'transaction-signing']).map((featureId) => ({
        id: featureId,
        name: featureId.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      })),
    };

    if (options.type === 'web') {
      const webResponder = {
        ...baseResponder,
        type: 'web' as const,
        url: 'https://responder.example.com',
      };
      return webResponder;
    }

    return baseResponder;
  },

  /**
   * Create wallet information for Solana-compatible wallets.
   *
   * Pre-configured for Solana account-based interactions with solana-wallet-standard
   * interface and Solana-specific transaction features. Supports mainnet
   * and devnet environments.
   *
   * @param options - Responder configuration options
   * @returns Complete ResponderInfo for Solana responders
   *
   * @example Basic Solana responder:
   * ```typescript
   * const responderInfo = createResponderInfo.solana({
   *   uuid: crypto.randomUUID(),
   *   rdns: 'com.solana.wallet',
   *   name: 'My Solana Wallet',
   *   icon: 'data:image/svg+xml;base64,...',
   *   type: 'extension'
   * });
   * // → Supports solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp with solana-wallet-standard
   * ```
   *
   * @example Solana with devnet:
   * ```typescript
   * const responderInfo = createResponderInfo.solana({
   *   uuid: crypto.randomUUID(),
   *   rdns: 'com.solana.wallet',
   *   name: 'Solana Dev Wallet',
   *   icon: 'data:image/svg+xml;base64,...',
   *   type: 'extension',
   *   technologies: [{ type: 'solana', interfaces: ['solana-wallet-standard'] }]
   * });
   * ```
   *
   * @category Blockchain
   * @since 0.1.0
   */
  solana(options: {
    uuid: string;
    rdns: string;
    name: string;
    icon: string;
    type: ResponderType;
    description?: string;
    features?: string[];
  }): ResponderInfo {
    const baseResponder: BaseResponderInfo = {
      uuid: options.uuid,
      rdns: options.rdns,
      name: options.name,
      icon: options.icon,
      type: options.type,
      version: '1.0.0',
      protocolVersion: '0.1.0',
      technologies: [
        {
          type: 'solana',
          interfaces: ['solana-wallet-standard'],
          features: ['sign-message', 'sign-transaction'],
        },
      ],
      features: (options.features ?? ['account-management', 'transaction-signing']).map((featureId) => ({
        id: featureId,
        name: featureId.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      })),
    };

    if (options.type === 'web') {
      const webResponder = {
        ...baseResponder,
        type: 'web' as const,
        url: 'https://responder.solana.com',
      };
      return webResponder;
    }

    return baseResponder;
  },

  /**
   * Create responder information for Aztec-compatible responders.
   *
   * Pre-configured for Aztec private smart contract interactions with
   * aztec-wallet-api-v1 interface and privacy-focused features including
   * zero-knowledge proofs and private transactions.
   *
   * @param options - Responder configuration options
   * @returns Complete ResponderInfo for Aztec responders
   *
   * @example Basic Aztec responder:
   * ```typescript
   * const responderInfo = createResponderInfo.aztec({
   *   uuid: crypto.randomUUID(),
   *   rdns: 'com.aztec.responder',
   *   name: 'My Aztec Responder',
   *   icon: 'data:image/svg+xml;base64,...',
   *   type: 'extension'
   * });
   * // → Supports aztec:mainnet with private transactions
   * ```
   *
   * @example Aztec with testnet:
   * ```typescript
   * const responderInfo = createResponderInfo.aztec({
   *   uuid: crypto.randomUUID(),
   *   rdns: 'com.aztec.responder',
   *   name: 'Aztec Testnet Responder',
   *   icon: 'data:image/svg+xml;base64,...',
   *   type: 'extension',
   *   technologies: [{ type: 'aztec', interfaces: ['aztec-wallet-api-v1'] }]
   * });
   * ```
   *
   * @category Blockchain
   * @since 0.1.0
   */
  aztec(options: {
    uuid: string;
    rdns: string;
    name: string;
    icon: string;
    type: ResponderType;
    description?: string;
    features?: string[];
  }): ResponderInfo {
    const baseResponder: BaseResponderInfo = {
      uuid: options.uuid,
      rdns: options.rdns,
      name: options.name,
      icon: options.icon,
      type: options.type,
      version: '1.0.0',
      protocolVersion: '0.1.0',
      technologies: [
        {
          type: 'aztec',
          interfaces: ['aztec-wallet-api-v1'],
          features: ['private-transactions', 'encrypted-notes'],
        },
      ],
      features: (options.features ?? ['private-transactions', 'contract-deployment', 'token-management']).map(
        (featureId) => ({
          id: featureId,
          name: featureId.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        }),
      ),
    };

    if (options.type === 'web') {
      const webResponder = {
        ...baseResponder,
        type: 'web' as const,
        url: 'https://responder.aztec.network',
      };
      return webResponder;
    }

    return baseResponder;
  },

  /**
   * Create responder information for multi-chain responders.
   *
   * Flexible factory for responders that support multiple blockchain networks.
   * Requires explicit chain capability configuration while providing sensible
   * defaults for cross-chain features and interfaces.
   *
   * @param options - Multi-chain responder configuration
   * @returns Complete ResponderInfo for multi-chain responders
   *
   * @example Cross-chain responder:
   * ```typescript
   * const responderInfo = createResponderInfo.multiChain({
   *   uuid: crypto.randomUUID(),
   *   rdns: 'com.mycompany.multiresponder',
   *   name: 'Universal Responder',
   *   icon: 'data:image/svg+xml;base64,...',
   *   type: 'extension',
   *   chains: [
   *     {
   *       chainId: 'eip155:1',
   *       chainType: 'evm',
   *       network: { name: 'Ethereum', chainId: 'eip155:1', nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }, testnet: false },
   *       standards: ['eip-1193'],
   *       rpcMethods: ['eth_accounts', 'eth_sendTransaction'],
   *       transactionTypes: [],
   *       signatureSchemes: ['ecdsa-secp256k1'],
   *       features: []
   *     },
   *     {
   *       chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
   *       chainType: 'account',
   *       network: { name: 'Solana', chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp', nativeCurrency: { name: 'SOL', symbol: 'SOL', decimals: 9 }, testnet: false },
   *       standards: ['solana-wallet-standard'],
   *       rpcMethods: ['getAccounts', 'signTransaction'],
   *       transactionTypes: [],
   *       signatureSchemes: ['ed25519'],
   *       features: []
   *     }
   *   ],
   *   features: ['account-management', 'transaction-signing', 'cross-chain-swaps']
   * });
   * ```
   *
   * @category Blockchain
   * @since 0.1.0
   */
  multiChain(options: {
    uuid: string;
    rdns: string;
    name: string;
    icon: string;
    type: ResponderType;
    description?: string;
    features?: string[];
  }): ResponderInfo {
    const baseResponder: BaseResponderInfo = {
      uuid: options.uuid,
      rdns: options.rdns,
      name: options.name,
      icon: options.icon,
      type: options.type,
      version: '1.0.0',
      protocolVersion: '0.1.0',
      technologies: [
        {
          type: 'evm',
          interfaces: ['eip-1193', 'eip-1102'],
          features: ['eip-712', 'personal-sign'],
        },
        {
          type: 'solana',
          interfaces: ['solana-wallet-standard'],
          features: ['sign-message', 'sign-transaction'],
        },
        {
          type: 'aztec',
          interfaces: ['aztec-wallet-api-v1'],
          features: ['private-transactions', 'encrypted-notes'],
        },
      ],
      features: (options.features ?? ['account-management', 'transaction-signing', 'cross-chain-swaps']).map(
        (featureId) => ({
          id: featureId,
          name: featureId.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        }),
      ),
    };

    if (options.type === 'web') {
      const webResponder = {
        ...baseResponder,
        type: 'web' as const,
        url: 'https://multi-responder.com',
      };
      return webResponder;
    }

    return baseResponder;
  },
};
