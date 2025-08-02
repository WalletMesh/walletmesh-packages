/**
 * Responder-side module for the Generic Cross-Blockchain Discovery Protocol.
 *
 * Enables responders (wallets) to participate in capability-first discovery by listening for initiator
 * capability requirements and responding only when the responder can fulfill ALL requirements.
 * Implements privacy-preserving discovery where responders never reveal capabilities
 * beyond what initiators specifically request.
 *
 * Key components:
 * - {@link DiscoveryResponder}: Listens for discovery requests and responds if qualified
 * - {@link CapabilityMatcher}: Calculates capability intersections and determines qualification
 * - Factory functions: Simplified setup with pre-configured blockchain templates
 * - Security features: Origin validation, rate limiting, and session tracking
 *
 * @example Basic responder setup:
 * ```typescript
 * import { createResponderDiscoverySetup, createResponderInfo } from '@walletmesh/discovery/responder';
 *
 * const setup = createResponderDiscoverySetup({
 *   responderInfo: createResponderInfo.ethereum({
 *     uuid: crypto.randomUUID(),
 *     rdns: 'com.mycompany.wallet',
 *     name: 'My Ethereum Wallet',
 *     icon: 'data:image/svg+xml;base64,...',
 *     type: 'extension'
 *   }),
 *   securityPolicy: {
 *     requireHttps: true,
 *     allowedOrigins: ['https://trusted-dapp.com'],
 *     rateLimit: { enabled: true, maxRequests: 10, windowMs: 60000 }
 *   }
 * });
 *
 * setup.startListening();
 * console.log('Responder is now discoverable');
 * ```
 *
 * @example Multi-chain responder:
 * ```typescript
 * import { createResponderInfo, createDiscoveryResponder } from '@walletmesh/discovery/responder';
 *
 * const responderInfo = createResponderInfo.multiChain({
 *   uuid: crypto.randomUUID(),
 *   rdns: 'com.mycompany.multiwallet',
 *   name: 'Universal Wallet',
 *   icon: 'data:image/svg+xml;base64,...',
 *   type: 'extension',
 *   chains: [
 *     // Define custom chain capabilities
 *     { chainId: 'eip155:1', chainType: 'evm' }, // evm config
 *     { chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp', chainType: 'account' } // solana config
 *   ],
 *   features: ['account-management', 'transaction-signing', 'cross-chain-swaps']
 * });
 *
 * const announcer = createDiscoveryResponder({ responderInfo });
 * announcer.startListening();
 * ```
 *
 * @example Manual capability matching:
 * ```typescript
 * import { createCapabilityMatcher } from '@walletmesh/discovery/responder';
 *
 * const matcher = createCapabilityMatcher(myResponderInfo);
 *
 * // Check if responder can fulfill a discovery request
 * const result = matcher.matchCapabilities(capabilityRequest);
 * if (result.canFulfill) {
 *   console.log('Responder qualifies for this initiator');
 *   console.log('Capability intersection:', result.intersection);
 * }
 * ```
 *
 * @module responder
 * @since 0.1.0
 * @see {@link https://docs.walletmesh.io/discovery} for detailed documentation
 */

// Export responder-side classes
export { DiscoveryResponder } from './DiscoveryResponder.js';
export { CapabilityMatcher } from './CapabilityMatcher.js';
export type { CapabilityMatchResult } from './CapabilityMatcher.js';

// Export factory functions and helpers
export {
  createDiscoveryResponder,
  createCapabilityMatcher,
  createResponderDiscoverySetup,
  createResponderInfo,
} from './factory.js';

// Re-export core types needed by responders
export type {
  DiscoveryRequestEvent,
  DiscoveryResponseEvent,
  ResponderInfo,
  DiscoveryResponderConfig,
  CapabilityIntersection,
  ChainCapability,
  ResponderFeature,
  ResponderType,
  SecurityPolicy,
} from '../core/types.js';

// Re-export relevant security utilities
export { validateOrigin, createSecurityPolicy } from '../security/index.js';
