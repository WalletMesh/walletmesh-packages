import type { DiscoveryRequestEvent, CapabilityIntersection, ResponderInfo } from '../core/types.js';

/**
 * Result of capability matching between responder and initiator requirements.
 *
 * Contains the matching result, capability intersection (if qualified),
 * and details about any missing capabilities for debugging.
 *
 * @example Successful match:
 * ```typescript
 * const result: CapabilityMatchResult = {
 *   canFulfill: true,
 *   intersection: {
 *     required: {
 *       chains: ['eip155:1'],
 *       features: ['account-management'],
 *       interfaces: ['eip-1193']
 *     },
 *     optional: {
 *       features: ['hardware-wallet']
 *     }
 *   },
 *   missing: {
 *     chains: [],
 *     features: [],
 *     interfaces: []
 *   }
 * };
 * ```
 *
 * @example Failed match:
 * ```typescript
 * const result: CapabilityMatchResult = {
 *   canFulfill: false,
 *   intersection: null,
 *   missing: {
 *     chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],  // Responder doesn't support Solana
 *     features: [],
 *     interfaces: []
 *   }
 * };
 * ```
 *
 * @category Capability
 * @since 0.1.0
 */
export interface CapabilityMatchResult {
  canFulfill: boolean;
  intersection: CapabilityIntersection | null;
  missing: {
    chains: string[];
    features: string[];
    interfaces: string[];
  };
}

/**
 * Capability matcher implementing privacy-preserving intersection algorithm.
 *
 * The CapabilityMatcher is responsible for determining if a wallet can fulfill
 * a dApp's requirements by comparing the wallet's capabilities against the
 * requested capabilities across all three categories:
 *
 * 1. **Chains**: Blockchain network compatibility
 * 2. **Features**: Wallet functionality matching
 * 3. **Interfaces**: API standard compatibility
 *
 * The matcher implements a privacy-preserving approach that only reveals
 * capabilities that were explicitly requested, preventing enumeration attacks.
 *
 * Key principles:
 * - **All-or-nothing matching**: ALL required capabilities must be supported
 * - **Privacy preservation**: Never reveals unrequested capabilities
 * - **Three-part validation**: Chains, features, and interfaces are all checked
 * - **Intersection calculation**: Returns only the overlap of requested vs supported
 *
 * @example Basic capability matching
 * ```typescript
 * const matcher = new CapabilityMatcher(myWalletInfo);
 *
 * const request = {
 *   required: {
 *     chains: ['eip155:1'],                    // Must support Ethereum
 *     features: ['account-management'],         // Must have account management
 *     interfaces: ['eip-1193']                 // Must implement EIP-1193
 *   }
 * };
 *
 * const result = matcher.matchCapabilities(request);
 *
 * if (result.canFulfill) {
 *   // Wallet supports ALL required capabilities
 *   console.log('Matched capabilities:', result.intersection);
 * } else {
 *   // Wallet missing some requirements
 *   console.log('Missing chains:', result.missing.chains);
 *   console.log('Missing features:', result.missing.features);
 *   console.log('Missing interfaces:', result.missing.interfaces);
 * }
 * ```
 *
 * @example Advanced matching with preferences
 * ```typescript
 * const request = {
 *   required: {
 *     chains: ['eip155:1'],
 *     features: ['account-management', 'transaction-signing'],
 *     interfaces: ['eip-1193']
 *   },
 *   optional: {
 *     features: ['hardware-wallet', 'batch-transactions']
 *   }
 * };
 *
 * const result = matcher.matchCapabilities(request);
 * // Result includes both required matches and any optional matches
 * ```
 *
 * @category Capability
 * @since 0.1.0
 * @see {@link DiscoveryResponder} for integration with announcer
 * @see {@link CapabilityMatchResult} for result structure
 * @see {@link CapabilityRequirements} for requirement structure
 */
export class CapabilityMatcher {
  private responderInfo: ResponderInfo;

  constructor(responderInfo: ResponderInfo) {
    this.responderInfo = responderInfo;
  }

  /**
   * Check if responder can fulfill initiator requirements and generate intersection.
   *
   * Performs comprehensive capability matching to determine if the responder
   * can satisfy ALL required capabilities. If qualified, generates a
   * privacy-preserving intersection response.
   *
   * Algorithm:
   * 1. Validate request structure and required fields
   * 2. Check if ALL required capabilities are supported
   * 3. If qualified, calculate intersection of requested vs. supported
   * 4. Include optional capability intersections if present
   * 5. Return result with qualification status and intersection
   *
   * @param request - Capability request from initiator
   * @returns Matching result with qualification and intersection
   *
   * @example
   * ```typescript
   * const request: DiscoveryRequestEvent = {
   *   type: 'wallet:discovery:capability-request',
   *   version: '0.1.0',
   *   sessionId: 'session-uuid',
   *   timestamp: Date.now(),
   *   required: {
   *     chains: ['eip155:1'],
   *     features: ['account-management'],
   *     interfaces: ['eip-1193']
   *   },
   *   origin: 'https://initiator.com',
   *   initiatorInfo: { } // initiator metadata
   * };
   *
   * const result = matcher.matchCapabilities(request);
   *
   * if (result.canFulfill) {
   *   // Responder qualifies - send response with intersection
   *   const response = {
   *     // ... other response fields
   *     matched: result.intersection
   *   };
   * }
   * ```
   *
   * @category Capability
   * @since 0.1.0
   */
  matchCapabilities(request: DiscoveryRequestEvent): CapabilityMatchResult {
    // Validate request exists and has basic structure
    if (!request || typeof request !== 'object') {
      return {
        canFulfill: false,
        intersection: null,
        missing: {
          chains: [],
          features: [],
          interfaces: [],
        },
      };
    }

    const { required, optional } = request;

    // Validate required capabilities exist
    if (!required || !required.chains || !required.features || !required.interfaces) {
      return {
        canFulfill: false,
        intersection: null,
        missing: {
          chains: [],
          features: [],
          interfaces: [],
        },
      };
    }

    // Check if we can fulfill all required capabilities
    const requiredMatch = this.checkRequiredCapabilities(required);

    if (!requiredMatch.canFulfill) {
      return {
        canFulfill: false,
        intersection: null,
        missing: requiredMatch.missing,
      };
    }

    // Generate intersection response (only what was requested)
    const intersection: CapabilityIntersection = {
      required: {
        chains: this.intersectArrays(required.chains, this.getSupportedChains()),
        features: this.intersectArrays(required.features, this.getSupportedFeatures()),
        interfaces: this.intersectArrays(required.interfaces, this.getSupportedInterfaces()),
      },
    };

    // Add optional capabilities if requested
    if (optional) {
      intersection.optional = {};

      if (optional.chains) {
        intersection.optional.chains = this.intersectArrays(optional.chains, this.getSupportedChains());
      }

      if (optional.features) {
        intersection.optional.features = this.intersectArrays(optional.features, this.getSupportedFeatures());
      }
    }

    return {
      canFulfill: true,
      intersection,
      missing: {
        chains: [],
        features: [],
        interfaces: [],
      },
    };
  }

  /**
   * Update the responder information.
   */
  updateResponderInfo(responderInfo: ResponderInfo): void {
    this.responderInfo = responderInfo;
  }

  /**
   * Get detailed capability information for debugging.
   */
  getCapabilityDetails() {
    return {
      supportedChains: this.getSupportedChains(),
      supportedFeatures: this.getSupportedFeatures(),
      supportedInterfaces: this.getSupportedInterfaces(),
      responderType: this.responderInfo.type,
      chainCount: this.responderInfo.chains.length,
      featureCount: this.responderInfo.features.length,
    };
  }

  /**
   * Check if the responder can fulfill all required capabilities.
   */
  private checkRequiredCapabilities(required: {
    chains: string[];
    features: string[];
    interfaces: string[];
  }) {
    const supportedChains = this.getSupportedChains();
    const supportedFeatures = this.getSupportedFeatures();
    const supportedInterfaces = this.getSupportedInterfaces();

    const missingChains = required.chains.filter((chain) => !supportedChains.includes(chain));
    const missingFeatures = required.features.filter((feature) => !supportedFeatures.includes(feature));
    const missingInterfaces = required.interfaces.filter((iface) => !supportedInterfaces.includes(iface));

    const canFulfill =
      missingChains.length === 0 && missingFeatures.length === 0 && missingInterfaces.length === 0;

    return {
      canFulfill,
      missing: {
        chains: missingChains,
        features: missingFeatures,
        interfaces: missingInterfaces,
      },
    };
  }

  /**
   * Get array intersection (items that exist in both arrays).
   */
  private intersectArrays(requested: string[], supported: string[]): string[] {
    return requested.filter((item) => supported.includes(item));
  }

  /**
   * Get supported chain IDs from responder info.
   */
  private getSupportedChains(): string[] {
    return this.responderInfo.chains.map((chain) => chain.chainId);
  }

  /**
   * Get supported feature IDs from responder info.
   */
  private getSupportedFeatures(): string[] {
    return this.responderInfo.features.map((feature) => feature.id);
  }

  /**
   * Get supported interface IDs from responder info.
   */
  private getSupportedInterfaces(): string[] {
    const interfaces = new Set<string>();

    // Add chain-specific standards as interfaces
    for (const chain of this.responderInfo.chains) {
      for (const standard of chain.standards) {
        interfaces.add(standard);
      }
    }

    // Add any explicitly defined interfaces from features
    for (const feature of this.responderInfo.features) {
      if (feature.configuration?.['interfaces']) {
        const featureInterfaces = feature.configuration['interfaces'] as string[];
        for (const iface of featureInterfaces) {
          interfaces.add(iface);
        }
      }
    }

    // Add common interfaces based on chain types
    for (const chain of this.responderInfo.chains) {
      switch (chain.chainType) {
        case 'evm':
          interfaces.add('eip-1193');
          break;
        case 'account':
          if (chain.chainId.includes('solana')) {
            interfaces.add('solana-wallet-standard');
            interfaces.add('solana-wallet-adapter');
          } else if (chain.chainId.includes('aztec')) {
            interfaces.add('aztec-wallet-api-v1');
          }
          break;
      }
    }

    return Array.from(interfaces);
  }
}
