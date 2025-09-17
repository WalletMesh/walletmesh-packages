/**
 * Core protocol types for the Generic Cross-Blockchain Discovery Protocol.
 *
 * Contains fundamental protocol message types, state machine types, and
 * basic discovery structures. These types form the backbone of the
 * discovery protocol implementation.
 *
 * @module types/core
 * @category Types
 * @since 0.1.0
 */

import type { DISCOVERY_PROTOCOL_VERSION } from '../core/constants.js';

/**
 * Base interface for all discovery protocol messages.
 *
 * All protocol messages extend this interface to ensure consistent
 * structure and enable protocol version compatibility checks.
 *
 * @category Protocol
 * @since 0.1.0
 */
export interface BaseDiscoveryMessage {
  type: string;
  version: typeof DISCOVERY_PROTOCOL_VERSION;
  sessionId: string;
}

/**
 * Initiator information for identification in discovery requests.
 *
 * Provides responder users with context about the requesting application
 * to make informed connection decisions. The icon should be a data URI
 * for Content Security Policy compliance.
 *
 * @category Protocol
 * @since 0.1.0
 */
export interface InitiatorInfo {
  name: string;
  icon?: string;
  url: string;
  description?: string;
}

/**
 * Discovery request event sent by initiators to find responders.
 *
 * @category Protocol
 * @since 0.1.0
 */
export interface DiscoveryRequestEvent extends BaseDiscoveryMessage {
  type: 'discovery:wallet:request';
  initiatorInfo: InitiatorInfo;
  required: import('./capabilities.js').CapabilityRequirements;
  optional?: import('./capabilities.js').CapabilityPreferences;
  origin: string;
}

/**
 * Discovery response event sent by qualified responders.
 *
 * @category Protocol
 * @since 0.1.0
 */
export interface DiscoveryResponseEvent extends BaseDiscoveryMessage {
  type: 'discovery:wallet:response';
  responderId: string;
  rdns: string;
  name: string;
  icon: string;
  matched: import('./capabilities.js').CapabilityIntersection;
  transportConfig?: TransportConfig;
  description?: string;
  responderVersion?: string;
}

/**
 * Discovery completion event sent when discovery session ends.
 *
 * @category Protocol
 * @since 0.1.0
 */
export interface DiscoveryCompleteEvent extends BaseDiscoveryMessage {
  type: 'discovery:wallet:complete';
  reason: 'timeout' | 'manual-stop' | 'max-responders';
  respondersFound: number;
}

/**
 * Discovery error event sent when discovery session fails.
 *
 * @category Protocol
 * @since 0.1.0
 */
export interface DiscoveryErrorEvent extends BaseDiscoveryMessage {
  type: 'discovery:wallet:error';
  errorCode: number;
  errorMessage: string;
  errorCategory: ErrorCategory;
}

/**
 * Transport configuration for establishing connections.
 *
 * @category Protocol
 * @since 0.1.0
 */
export interface TransportConfig {
  type: 'popup' | 'iframe' | 'extension' | 'websocket' | 'postmessage' | 'injected';
  url?: string;
  origin?: string;
  extensionId?: string;
  targetOrigin?: string;
  windowFeatures?: string;
  popupUrl?: string;
  websocketUrl?: string;
  walletAdapter?: string;
  adapterConfig?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Account information returned by responders.
 *
 * @category Protocol
 * @since 0.1.0
 */
export interface Account {
  address: string;
  chainId: string;
  balance?: string;
  nonce?: number;
  name?: string;
}

/**
 * Discovery error information.
 *
 * @category Protocol
 * @since 0.1.0
 */
export interface DiscoveryErrorInfo {
  code: number;
  message: string;
  category: ErrorCategory;
  details?: Record<string, unknown>;
}

/**
 * Error category classification.
 *
 * @category Protocol
 * @since 0.1.0
 */
export type ErrorCategory = 'protocol' | 'security' | 'capability' | 'connection' | 'internal';

/**
 * Protocol error with context.
 *
 * @category Protocol
 * @since 0.1.0
 */
export interface ProtocolError {
  code: number;
  message: string;
  category: ErrorCategory;
  context?: {
    component?: string;
    operation?: string;
    sessionId?: string;
    origin?: string;
  };
  timestamp: number;
}

/**
 * Union type of all discovery messages.
 *
 * @category Protocol
 * @since 0.1.0
 */
export type DiscoveryMessage =
  | DiscoveryRequestEvent
  | DiscoveryResponseEvent
  | DiscoveryCompleteEvent
  | DiscoveryErrorEvent;

/**
 * Discovery request event handler type.
 *
 * @category Protocol
 * @since 0.1.0
 */
export type DiscoveryRequestEventHandler = (event: CustomEvent<DiscoveryRequestEvent>) => void;

/**
 * Discovery response event handler type.
 *
 * @category Protocol
 * @since 0.1.0
 */
export type DiscoveryResponseEventHandler = (event: CustomEvent<DiscoveryResponseEvent>) => void;

/**
 * Duplicate response detection details.
 *
 * @category Protocol
 * @since 0.1.0
 */
export interface DuplicateResponseDetails {
  rdns: string;
  originalResponderId: string;
  duplicateResponderId: string;
  responseCount: number;
  sessionId: string;
  detectedAt: number;
  originalName: string;
  duplicateName: string;
}

/**
 * Error class for duplicate response detection.
 *
 * @category Protocol
 * @since 0.1.0
 */
export class DuplicateResponseError extends Error {
  /** Error code for duplicate response detection */
  public readonly code = 2008;

  /** Error category */
  public readonly category: ErrorCategory = 'security';

  /** Detailed information about the duplicate response */
  public readonly duplicateDetails: DuplicateResponseDetails;

  /** Whether this error is retryable (false for security violations) */
  public readonly retryable = false;

  constructor(duplicateDetails: DuplicateResponseDetails) {
    const message = `Duplicate response detected from responder '${duplicateDetails.rdns}'. This violates the "first response wins" security model and may indicate malicious activity.`;

    super(message);
    this.name = 'DuplicateResponseError';
    this.duplicateDetails = duplicateDetails;

    // Maintain proper prototype chain
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DuplicateResponseError);
    }
  }
}

/**
 * Base discovery error class.
 *
 * @category Protocol
 * @since 0.1.0
 */
export class DiscoveryError extends Error {
  public code?: number;
  public category?: ErrorCategory;

  constructor(message: string, code?: number, category?: ErrorCategory) {
    super(message);
    this.name = 'DiscoveryError';
    if (code !== undefined) {
      this.code = code;
    }
    if (category !== undefined) {
      this.category = category;
    }
  }
}
