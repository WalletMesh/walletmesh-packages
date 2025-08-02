/**
 * Generic Cross-Blockchain Discovery Protocol
 *
 * A capability-first discovery protocol that enables initiators (dApps)
 * to discover and connect to responders (wallets) across any blockchain network.
 *
 * Features:
 * - Capability-first discovery: Initiators specify requirements, responders self-qualify
 * - Multi-blockchain support: Works across EVM, Solana, Aztec, and other chains
 * - Enhanced security: Origin validation, session tracking, anti-spoofing
 * - Privacy protection: Dual identifier system prevents tracking
 * - CSP compliance: No Content Security Policy violations
 *
 * @packageDocumentation
 * @module @walletmesh/discovery
 * @version 0.1.0
 */

// Export core protocol types
export type {
  // Protocol messages
  BaseDiscoveryMessage,
  DiscoveryRequestEvent,
  DiscoveryResponseEvent,
  DiscoveryCompleteEvent,
  DiscoveryErrorEvent,
  DiscoveryMessage,
  // Initiator types
  InitiatorInfo,
  CapabilityRequirements,
  CapabilityPreferences,
  DiscoveryInitiatorConfig,
  // Responder types
  ResponderInfo,
  BaseResponderInfo,
  ExtensionResponderInfo,
  WebResponderInfo,
  ResponderType,
  QualifiedResponder,
  DiscoveryResponderConfig,
  // Capability types
  CapabilityIntersection,
  ChainCapability,
  ResponderFeature,
  ChainType,
  ChainFeature,
  // Transport types
  TransportConfig,
  // Security types
  SecurityPolicy,
  OriginValidationResult,
  SessionOptions,
  SessionTrackingState,
  RateLimitConfig,
  // Error types
  DiscoveryError,
  ProtocolError,
  ErrorCategory,
  // Other types
  Account,
  NetworkInfo,
  TransactionType,
  ResponderPlatform,
  VerificationInfo,
  PermissionModel,
  ParameterSpec,
  ValidationRule,
  ConnectionManagerConfig,
  DiscoveryRequestEventHandler,
  DiscoveryResponseEventHandler,
} from './core/types.js';

// Export constants
export * from './core/constants.js';

// Export logger
export { ConsoleLogger, createLogger, defaultLogger } from './core/logger.js';
export type { Logger } from './core/logger.js';

// Export initiator-side functionality
export {
  DiscoveryInitiator,
  InitiatorStateMachine,
  createDiscoveryInitiator,
  createInitiatorStateMachine,
  createInitiatorDiscoverySetup,
  createCapabilityRequirements,
} from './initiator/index.js';

export type { InitiatorStateMachineConfig } from './initiator/index.js';

// Export responder-side functionality
export {
  DiscoveryResponder,
  CapabilityMatcher,
  type CapabilityMatchResult,
  createDiscoveryResponder,
  createCapabilityMatcher,
  createResponderDiscoverySetup,
  createResponderInfo,
} from './responder/index.js';

// Export security functionality
export {
  SessionTracker,
  OriginValidator,
  RateLimiter,
  validateOrigin,
  validateEventOrigin,
  createSecurityPolicy,
} from './security/index.js';
