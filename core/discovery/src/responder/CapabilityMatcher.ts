import type { DiscoveryRequestEvent } from '../types/core.js';
import type {
  CapabilityIntersection,
  ResponderInfo,
  TechnologyRequirement,
  TechnologyMatch,
} from '../types/capabilities.js';

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
 *       technologies: [{
 *         type: 'evm',
 *         interfaces: ['eip-1193'],
 *         features: ['eip-712']
 *       }],
 *       features: ['account-management']
 *     }
 *   },
 *   missing: {
 *     technologies: [],
 *     features: []
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
 *     technologies: [{
 *       type: 'solana',
 *       reason: 'Technology not supported'
 *     }],
 *     features: []
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
    technologies: Array<{
      type: string;
      reason: string;
    }>;
    features: string[];
  };
}

/**
 * Capability matcher implementing privacy-preserving intersection algorithm.
 *
 * The CapabilityMatcher is responsible for determining if a wallet can fulfill
 * a dApp's requirements by comparing the wallet's capabilities against the
 * requested capabilities using technology-based matching:
 *
 * 1. **Technologies**: Blockchain technology support with interfaces/features
 * 2. **Features**: Global wallet functionality matching
 *
 * The matcher implements a privacy-preserving approach that only reveals
 * capabilities that were explicitly requested, preventing enumeration attacks.
 *
 * Key principles:
 * - **All-or-nothing matching**: ALL required capabilities must be supported
 * - **Privacy preservation**: Never reveals unrequested capabilities
 * - **Technology-based validation**: Technologies with interfaces and features are checked
 * - **Intersection calculation**: Returns only the overlap of requested vs supported
 *
 * @example Basic capability matching
 * ```typescript
 * const matcher = new CapabilityMatcher(myWalletInfo);
 *
 * const request = {
 *   required: {
 *     technologies: [
 *       {
 *         type: 'evm',
 *         interfaces: ['eip-1193'],              // Must implement EIP-1193
 *         features: ['eip-712']                  // Must support EIP-712
 *       }
 *     ],
 *     features: ['account-management']           // Must have account management
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
 *   console.log('Missing technologies:', result.missing.technologies);
 *   console.log('Missing features:', result.missing.features);
 * }
 * ```
 *
 * @example Advanced matching with preferences
 * ```typescript
 * const request = {
 *   required: {
 *     technologies: [
 *       {
 *         type: 'evm',
 *         interfaces: ['eip-6963', 'eip-1193'],  // Prefer EIP-6963
 *         features: ['eip-712', 'personal-sign']
 *       }
 *     ],
 *     features: ['account-management', 'transaction-signing']
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
   * 2. Check if ALL required technologies are supported with matching interfaces
   * 3. Check if ALL required global features are supported
   * 4. If qualified, calculate intersection of requested vs. supported
   * 5. Return result with qualification status and intersection
   *
   * @param request - Capability request from initiator
   * @returns Matching result with qualification and intersection
   *
   * @example
   * ```typescript
   * const request: DiscoveryRequestEvent = {
   *   type: 'discovery:wallet:request',
   *   version: '0.1.0',
   *   sessionId: 'session-uuid',
   *   required: {
   *     technologies: [{
   *       type: 'evm',
   *       interfaces: ['eip-6963', 'eip-1193'],
   *       features: ['eip-712']
   *     }],
   *     features: ['account-management']
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
          technologies: [],
          features: [],
        },
      };
    }

    const { required } = request;

    // Validate required capabilities exist
    if (!required) {
      return {
        canFulfill: false,
        intersection: null,
        missing: {
          technologies: [],
          features: [],
        },
      };
    }

    // Only support technology-based format
    if (!required.technologies) {
      return {
        canFulfill: false,
        intersection: null,
        missing: {
          technologies: [],
          features: [],
        },
      };
    }

    return this.matchTechnologyBasedCapabilities(request);
  }

  /**
   * Match capabilities using the new technology-based format.
   */
  private matchTechnologyBasedCapabilities(request: DiscoveryRequestEvent): CapabilityMatchResult {
    const { required, optional } = request;

    if (!required.technologies || !Array.isArray(required.technologies)) {
      return {
        canFulfill: false,
        intersection: null,
        missing: {
          technologies: [],
          features: [],
        },
      };
    }

    // Check technology support
    const technologyMatches: TechnologyMatch[] = [];
    const missingTechnologies: Array<{ type: string; reason: string }> = [];

    for (const reqTech of required.technologies) {
      const match = this.matchTechnology(reqTech);
      if (match) {
        technologyMatches.push(match);
      } else {
        missingTechnologies.push({
          type: reqTech.type,
          reason: `Technology '${reqTech.type}' not supported or missing required interfaces`,
        });
      }
    }

    // Check global features
    const supportedFeatures = this.getSupportedFeatures();
    const missingFeatures = (required.features || []).filter((f) => !supportedFeatures.includes(f));

    const canFulfill = missingTechnologies.length === 0 && missingFeatures.length === 0;

    if (!canFulfill) {
      return {
        canFulfill: false,
        intersection: null,
        missing: {
          technologies: missingTechnologies,
          features: missingFeatures,
        },
      };
    }

    // Generate intersection
    const intersection: CapabilityIntersection = {
      required: {
        technologies: technologyMatches,
        features: this.intersectArrays(required.features || [], supportedFeatures),
      },
    };

    // Add optional capabilities if requested
    if (optional) {
      intersection.optional = {};
      if (optional.features) {
        intersection.optional.features = this.intersectArrays(optional.features, supportedFeatures);
      }
    }

    return {
      canFulfill: true,
      intersection,
      missing: {
        technologies: [],
        features: [],
      },
    };
  }

  /**
   * Match a single technology requirement against wallet capabilities.
   */
  private matchTechnology(requirement: TechnologyRequirement): TechnologyMatch | null {
    const supportedTech = this.getSupportedTechnology(requirement.type);
    if (!supportedTech) {
      return null;
    }

    // Find matching interfaces
    const matchedInterfaces = requirement.interfaces.filter((iface) =>
      supportedTech.interfaces.includes(iface),
    );

    // If interfaces are specified, at least one must match
    // If no interfaces specified (empty array), technology type match is sufficient
    if (requirement.interfaces.length > 0 && matchedInterfaces.length === 0) {
      return null;
    }

    // Match networks if specified
    let matchedNetworks: string[] | undefined;
    if (requirement.networks && requirement.networks.length > 0) {
      const supportedNetworks = supportedTech.networks || [];
      matchedNetworks = this.intersectArrays(requirement.networks, supportedNetworks);

      // If networks are specified but none match, technology doesn't match
      if (matchedNetworks.length === 0) {
        return null;
      }
    }

    // Match features if specified
    if (requirement.features && requirement.features.length > 0) {
      const supportedFeatures = supportedTech.features || [];
      const matchedFeatures = this.intersectArrays(requirement.features, supportedFeatures);

      // If required features are specified but none match, this technology doesn't match
      if (matchedFeatures.length !== requirement.features.length) {
        return null;
      }

      const result: TechnologyMatch = {
        type: requirement.type,
        interfaces: matchedInterfaces,
        features: matchedFeatures,
      };

      if (matchedNetworks !== undefined && matchedNetworks.length > 0) {
        result.networks = matchedNetworks;
      }

      return result;
    }

    const result: TechnologyMatch = {
      type: requirement.type,
      interfaces: matchedInterfaces,
      features: [],
    };

    if (requirement.features !== undefined && requirement.features.length > 0) {
      result.features = requirement.features.filter(
        (feature) => supportedTech.features?.includes(feature) ?? false,
      );
    }

    if (matchedNetworks !== undefined && matchedNetworks.length > 0) {
      result.networks = matchedNetworks;
    }

    return result;
  }

  /**
   * Get supported technology information from wallet capabilities.
   */
  private getSupportedTechnology(techType: string): { interfaces: string[]; features?: string[]; networks?: string[] } | null {
    // Find the technology directly in the responder's technologies array
    const supportedTechnology = this.responderInfo.technologies.find((tech) => tech.type === techType);

    if (!supportedTechnology) {
      return null;
    }

    const result: { interfaces: string[]; features?: string[]; networks?: string[] } = {
      interfaces: supportedTechnology.interfaces,
    };

    if (supportedTechnology.features !== undefined) {
      result.features = supportedTechnology.features;
    }

    if (supportedTechnology.networks !== undefined) {
      result.networks = supportedTechnology.networks;
    }

    return result;
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
      supportedTechnologies: this.getSupportedTechnologies(),
      supportedFeatures: this.getSupportedFeatures(),
      supportedInterfaces: this.getSupportedInterfaces(),
      responderType: this.responderInfo.type,
      technologyCount: this.responderInfo.technologies.length,
      featureCount: this.responderInfo.features.length,
    };
  }

  /**
   * Get array intersection (items that exist in both arrays).
   */
  private intersectArrays(requested: string[], supported: string[]): string[] {
    return requested.filter((item) => supported.includes(item));
  }

  /**
   * Get supported technology types from responder info.
   */
  private getSupportedTechnologies(): string[] {
    return this.responderInfo.technologies.map((tech) => tech.type);
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

    // Add technology-specific interfaces
    for (const technology of this.responderInfo.technologies) {
      for (const interfaceId of technology.interfaces) {
        interfaces.add(interfaceId);
      }
    }

    // Features don't have configuration property, so no additional interfaces to add

    return Array.from(interfaces);
  }
}
