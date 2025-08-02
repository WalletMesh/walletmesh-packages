/**
 * Initiator-side module for the Generic Cross-Blockchain Discovery Protocol.
 *
 * Provides comprehensive functionality for initiators (dApps) to discover qualified
 * responders using capability-first discovery. Enables privacy-preserving responder selection
 * where only responders that can fulfill ALL requirements respond to discovery requests.
 *
 * Key components:
 * - {@link DiscoveryInitiator}: Broadcasts capability requirements and collects responses
 * - Factory functions: Simplified setup with pre-configured templates
 * - Type-safe interfaces: Complete TypeScript support for all operations
 *
 * @example Basic initiator setup:
 * ```typescript
 * import { createInitiatorDiscoverySetup } from '@walletmesh/discovery/initiator';
 *
 * const setup = createInitiatorDiscoverySetup({
 *   discovery: {
 *     requirements: {
 *       chains: ['eip155:1'],
 *       features: ['account-management', 'transaction-signing'],
 *       interfaces: ['eip-1193']
 *     },
 *     initiatorInfo: {
 *       name: 'My DApp',
 *       url: 'https://mydapp.com',
 *       icon: 'data:image/svg+xml;base64,...'
 *     }
 *   }
 * });
 *
 * const result = await setup.discoverAndConnect({
 *   requestedChains: ['eip155:1'],
 *   requestedPermissions: ['accounts', 'sign-transactions']
 * });
 * ```
 *
 * @example Manual discovery:
 * ```typescript
 * import { createDiscoveryInitiator } from '@walletmesh/discovery/initiator';
 *
 * const listener = createDiscoveryInitiator({
 *   requirements: { chains: ['eip155:1'], features: ['account-management'], interfaces: ['eip-1193'] },
 *   initiatorInfo: { name: 'My DApp', url: 'https://mydapp.com', icon: '...' }
 * });
 *
 * const responders = await listener.startDiscovery();
 * const selectedResponder = responders[0]; // User selection logic here
 *
 * // Connection handling is done by modal-core and modal-react packages
 * // using the transport configuration provided by the responder
 * ```
 *
 * @module initiator
 * @since 0.1.0
 * @see {@link https://docs.walletmesh.io/discovery} for detailed documentation
 */

// Export initiator-side classes
export { DiscoveryInitiator } from './DiscoveryInitiator.js';
export { InitiatorStateMachine, createInitiatorStateMachine } from './InitiatorStateMachine.js';

// Export factory functions and helpers
export {
  createDiscoveryInitiator,
  createInitiatorDiscoverySetup,
  createCapabilityRequirements,
} from './factory.js';

// Re-export core types needed by initiators
export type {
  DiscoveryRequestEvent,
  DiscoveryResponseEvent,
  QualifiedResponder,
  DiscoveryInitiatorConfig,
  CapabilityRequirements,
  CapabilityPreferences,
  InitiatorInfo,
} from '../core/types.js';

// Export InitiatorStateMachine types
export type { InitiatorStateMachineConfig } from './InitiatorStateMachine.js';

// Re-export relevant security utilities
export { validateOrigin, createSecurityPolicy } from '../security/index.js';
