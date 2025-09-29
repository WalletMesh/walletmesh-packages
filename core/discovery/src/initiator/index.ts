/**
 * Initiator-side module for the Generic Cross-Blockchain Discovery Protocol.
 *
 * Provides comprehensive functionality for initiators (dApps) to discover qualified
 * responders using capability-first discovery. Enables privacy-preserving responder selection
 * where only responders that can fulfill ALL requirements respond to discovery requests.
 *
 * Key components:
 * - {@link DiscoveryInitiator}: Broadcasts capability requirements and collects responses
 * - Capability helpers: {@link createCapabilityRequirements} for common presets
 * - Type-safe interfaces: Complete TypeScript support for all operations
 *
 * @example Basic initiator setup:
 * ```typescript
 * @example Manual discovery:
 * ```typescript
 * import { DiscoveryInitiator, createCapabilityRequirements } from '@walletmesh/discovery/initiator';
 *
 * const requirements = createCapabilityRequirements.ethereum();
 *
 * const initiator = new DiscoveryInitiator(
 *   requirements,
 *   {
 *     name: 'My DApp',
 *     url: 'https://mydapp.com',
 *     icon: 'data:image/svg+xml;base64,...'
 *   },
 *   { timeout: 5000 }
 * );
 *
 * const responders = await initiator.startDiscovery();
 * const selectedResponder = responders[0];
 * ```
 *
 * @module initiator
 * @since 0.1.0
 * @see {@link https://docs.walletmesh.io/discovery} for detailed documentation
 */

// Export initiator-side classes
export { DiscoveryInitiator } from '../initiator.js';
export { createInitiatorSession, runDiscovery } from './api.js';
export type { InitiatorSessionParams } from './api.js';
export { InitiatorStateMachine, createInitiatorStateMachine } from './InitiatorStateMachine.js';

// Export capability helpers
export { createCapabilityRequirements } from './factory.js';

// Re-export core types needed by initiators
export type {
  DiscoveryRequestEvent,
  DiscoveryResponseEvent,
  InitiatorInfo,
} from '../types/core.js';

export type {
  QualifiedResponder,
  CapabilityRequirements,
  CapabilityPreferences,
} from '../types/capabilities.js';

export type { DiscoveryInitiatorConfig } from '../types/testing.js';

// Export InitiatorStateMachine types
export type { InitiatorStateMachineConfig } from './InitiatorStateMachine.js';

// Re-export relevant security utilities
export { validateOrigin, createSecurityPolicy } from '../security.js';
