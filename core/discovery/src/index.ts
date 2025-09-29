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
 */

// ============================================================================
// Core Protocol Types
// ============================================================================

export type {
  // Protocol messages
  BaseDiscoveryMessage,
  DiscoveryRequestEvent,
  DiscoveryResponseEvent,
  DiscoveryCompleteEvent,
  DiscoveryErrorEvent,
  DiscoveryMessage,
  // Core types
  InitiatorInfo,
  TransportConfig,
  DiscoveryRequestEventHandler,
  DiscoveryResponseEventHandler,
  DuplicateResponseDetails,
  ErrorCategory,
  DiscoveryError,
} from './types/core.js';

export type {
  // Capability types
  CapabilityRequirements,
  CapabilityPreferences,
  ResponderInfo,
  BaseResponderInfo,
  ExtensionResponderInfo,
  WebResponderInfo,
  ResponderType,
  ResponderFeature,
  TechnologyCapability,
  TechnologyRequirement,
  TechnologyMatch,
  QualifiedResponder,
  CapabilityIntersection,
  // Additional responder types
  PermissionModel,
  ResponderPlatform,
  VerificationInfo,
} from './types/capabilities.js';

export type {
  // Security types
  SecurityPolicy,
  OriginValidationResult,
  SessionOptions,
  SessionTrackingState,
  RateLimitConfig,
} from './types/security.js';

export type {
  // Testing and config types (for advanced use)
  DiscoveryInitiatorConfig,
  DiscoveryResponderConfig,
} from './types/testing.js';

// ============================================================================
// Constants and Configuration
// ============================================================================

export * from './core/constants.js';

// ============================================================================
// Core Components
// ============================================================================

// Export state machine
export { ProtocolStateMachine, createProtocolStateMachine } from './core/ProtocolStateMachine.js';
export type { ProtocolState, StateTimeouts, StateTransitionEvent } from './core/ProtocolStateMachine.js';

// Export logger
export { ConsoleLogger, createLogger, defaultLogger } from './core/logger.js';
export type { Logger } from './core/logger.js';

// ============================================================================
// Discovery Components (Simplified API)
// ============================================================================

// Export initiator functionality
export { DiscoveryInitiator, type DiscoveryInitiatorOptions } from './initiator.js';
export { createInitiatorSession, runDiscovery } from './initiator/api.js';
export type { InitiatorSessionParams } from './initiator/api.js';
export { InitiatorStateMachine, createInitiatorStateMachine } from './initiator/InitiatorStateMachine.js';
export type { InitiatorStateMachineConfig } from './initiator/InitiatorStateMachine.js';

// Export responder functionality
export { DiscoveryResponder, type DiscoveryResponderOptions } from './responder.js';
export { createResponderServer, startResponder } from './responder/api.js';
export type { ResponderServerHandle, ResponderServerParams } from './responder/api.js';
export { CapabilityMatcher } from './responder/CapabilityMatcher.js';
export type { CapabilityMatchResult } from './responder/CapabilityMatcher.js';

// Export factory functions
export { createCapabilityRequirements } from './initiator/factory.js';

// ============================================================================
// Presets and Helpers
// ============================================================================

// Export presets for simplified configuration
export { CAPABILITY_PRESETS, FEATURE_PRESETS, RESPONDER_PRESETS } from './presets/index.js';
export { SECURITY_PRESETS } from './presets/security.js';

// ============================================================================
// Security Components
// ============================================================================

export {
  // Core security classes
  OriginValidator,
  SessionTracker,
  RateLimiter,
  SecurityManager,
  // Utility functions
  validateOrigin,
  validateEventOrigin,
  createSecurityPolicy,
} from './security.js';

// ============================================================================
// Validation and Utilities
// ============================================================================

export {
  ValidationError,
  ProtocolError,
  validateInitiatorInfo,
  validateCapabilityRequirements,
  validateCapabilityPreferences,
  validateResponderInfo,
  validateSecurityPolicy,
  validateTransportConfig,
  isValidTransportConfig,
  validateTimeout,
  validateSessionId,
} from './utils/validation.js';

export { EventEmitter } from './utils/EventEmitter.js';
