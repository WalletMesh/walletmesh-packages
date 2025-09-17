/**
 * Testing utility types for the Generic Cross-Blockchain Discovery Protocol.
 *
 * Contains configuration interfaces and types used by the testing infrastructure.
 * These types support test utilities, mocks, and validation helpers.
 *
 * @module types/testing
 * @category Types
 * @since 0.1.0
 */

import type { SecurityPolicy, SessionOptions } from './security.js';
import type { CapabilityRequirements, CapabilityPreferences, ResponderInfo } from './capabilities.js';
import type { InitiatorInfo } from './core.js';
import type { Logger } from '../core/logger.js';

/**
 * Configuration for initiator-side discovery.
 *
 * @category Configuration
 * @since 0.1.0
 */
export interface DiscoveryInitiatorConfig {
  requirements: CapabilityRequirements;
  preferences?: CapabilityPreferences;
  initiatorInfo: InitiatorInfo;
  securityPolicy?: SecurityPolicy;
  timeout?: number;
  eventTarget?: EventTarget;
  logger?: Logger;
}

/**
 * Configuration for responder-side discovery.
 *
 * @category Configuration
 * @since 0.1.0
 */
export interface DiscoveryResponderConfig {
  responderInfo: ResponderInfo;
  securityPolicy?: SecurityPolicy;
  sessionOptions?: SessionOptions;
  eventTarget?: EventTarget;
  logger?: Logger;
}

/**
 * Configuration for connection lifecycle management.
 *
 * @category Configuration
 * @since 0.1.0
 */
export interface ConnectionManagerConfig {
  maxConnections?: number;
  connectionTimeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}
