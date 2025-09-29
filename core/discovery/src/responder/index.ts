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
 * - Manual capability builders: Provide structured {@link ResponderInfo} objects for real wallets
 * - Security features: Origin validation, rate limiting, and session tracking
 *
 * @example Basic responder setup:
 * ```typescript
 * import { DiscoveryResponder } from '@walletmesh/discovery/responder';
 *
 * const responder = new DiscoveryResponder(
 *   {
 *     uuid: crypto.randomUUID(),
 *     rdns: 'com.mycompany.wallet',
 *     name: 'My Ethereum Wallet',
 *     icon: 'data:image/svg+xml;base64,...',
 *     type: 'extension',
 *     version: '1.0.0',
 *     protocolVersion: '0.1.0',
 *     technologies: [
 *       { type: 'evm', interfaces: ['eip-1193', 'eip-6963'], features: ['personal-sign'] },
 *     ],
 *     features: [
 *       { id: 'account-management', name: 'Account Management' },
 *       { id: 'transaction-signing', name: 'Transaction Signing' },
 *     ],
 *   },
 *   { security: 'development' },
 * );
 *
 * responder.startListening();
 * console.log('Responder is now discoverable');
 * ```
 *
 * @example Multi-chain responder:
 * ```typescript
 * import { DiscoveryResponder } from '@walletmesh/discovery/responder';
 *
 * const responderInfo = {
 *   uuid: crypto.randomUUID(),
 *   rdns: 'com.mycompany.wallet',
 *   name: 'Universal Wallet',
 *   icon: 'data:image/svg+xml;base64,...',
 *   type: 'extension',
 *   version: '1.0.0',
 *   protocolVersion: '0.1.0',
 *   technologies: [
 *     { type: 'evm', interfaces: ['eip-1193'], features: ['eip-712'] },
 *     { type: 'solana', interfaces: ['solana-wallet-standard'] }
 *   ],
 *   features: [
 *     { id: 'account-management', name: 'Account Management' },
 *     { id: 'transaction-signing', name: 'Transaction Signing' }
 *   ],
 * } as const;
 *
 * const responder = new DiscoveryResponder(responderInfo);
 * responder.startListening();
 *
 * // Later when shutting down
 * responder.cleanup();
 * ```
 *
 * @example Manual capability matching:
 * ```typescript
 * import { CapabilityMatcher } from '@walletmesh/discovery/responder';
 *
 * const matcher = new CapabilityMatcher(myResponderInfo);
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
export { DiscoveryResponder, type DiscoveryResponderOptions } from '../responder.js';
export { createResponderServer, startResponder } from './api.js';
export type { ResponderServerHandle, ResponderServerParams } from './api.js';
export { CapabilityMatcher } from './CapabilityMatcher.js';
export type { CapabilityMatchResult } from './CapabilityMatcher.js';

// Re-export core types needed by responders
export type {
  DiscoveryRequestEvent,
  DiscoveryResponseEvent,
} from '../types/core.js';

export type {
  ResponderInfo,
  CapabilityIntersection,
  ResponderFeature,
  ResponderType,
} from '../types/capabilities.js';

export type { SecurityPolicy } from '../types/security.js';

export type { DiscoveryResponderConfig } from '../types/testing.js';

// Re-export relevant security utilities
export { validateOrigin, createSecurityPolicy } from '../security.js';
