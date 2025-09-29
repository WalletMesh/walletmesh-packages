/**
 * Simplified Discovery Responder implementation.
 *
 * Consolidated responder module with clean constructor pattern and preset support.
 * Replaces factory functions with simple class instantiation.
 *
 * @module responder
 * @category Core
 * @since 0.1.0
 */

import type {
  DiscoveryRequestEvent,
  DiscoveryResponseEvent,
  DiscoveryRequestEventHandler,
  TransportConfig,
} from './types/core.js';
import type { ResponderInfo, WebResponderInfo, CapabilityIntersection } from './types/capabilities.js';
import type { SecurityPolicy, SessionOptions } from './types/security.js';
import type { DiscoveryResponderConfig } from './types/testing.js';
import { DISCOVERY_EVENTS, DISCOVERY_PROTOCOL_VERSION, ERROR_CODES } from './core/constants.js';
import { SECURITY_PRESETS } from './presets/security.js';
import { resolveSecurityPolicy } from './shared/security.js';
import { validateResponderInfo } from './utils/validation.js';
import { OriginValidator, RateLimiter } from './security.js';
import { ProtocolError } from './utils/protocolError.js';
import { CapabilityMatcher } from './responder/CapabilityMatcher.js';
import { type Logger, defaultLogger } from './core/logger.js';
import { ProtocolStateMachine, type StateTransitionEvent } from './core/ProtocolStateMachine.js';

/**
 * Options for DiscoveryResponder configuration.
 *
 * @category Configuration
 * @since 0.1.0
 */
export interface DiscoveryResponderOptions {
  /** Security policy preset name or custom policy */
  security?: keyof typeof SECURITY_PRESETS | SecurityPolicy;
  /** Session management options */
  sessionOptions?: SessionOptions;
  /** Custom event target for testing */
  eventTarget?: EventTarget;
  /** Custom logger instance */
  logger?: Logger;
}

/**
 * Discovery responder for wallets to participate in discovery protocol.
 *
 * Simplified implementation with clean constructor pattern that uses presets
 * for common configurations. Replaces the complex factory function pattern.
 *
 * @example Basic usage with presets
 * ```typescript
 * import { DiscoveryResponder, RESPONDER_PRESETS, FEATURE_PRESETS } from '@walletmesh/discovery';
 *
 * const responder = new DiscoveryResponder({
 *   uuid: crypto.randomUUID(),
 *   rdns: 'com.mycompany.wallet',
 *   name: 'My Wallet',
 *   icon: 'data:image/svg+xml;base64,...',
 *   type: 'extension',
 *   version: '1.0.0',
 *   protocolVersion: '0.1.0',
 *   technologies: [RESPONDER_PRESETS.ethereum],
 *   features: FEATURE_PRESETS.basic
 * });
 *
 * responder.startListening();
 * ```
 *
 * @example With custom security
 * ```typescript
 * const responder = new DiscoveryResponder(
 *   responderInfo,
 *   { security: 'production' }
 * );
 * ```
 *
 * @category Core
 * @since 0.1.0
 */
export class DiscoveryResponder {
  private config: DiscoveryResponderConfig;
  private eventTarget: EventTarget;
  private responderInfo: ResponderInfo;
  private capabilityMatcher: CapabilityMatcher;
  private originValidator: OriginValidator;
  private rateLimiter: RateLimiter;
  private usedSessions = new Set<string>();
  private isListening = false;
  private requestHandler: DiscoveryRequestEventHandler;
  private sessionStates: Map<string, ProtocolStateMachine> = new Map();
  private logger: Logger;

  /**
   * Create a new DiscoveryResponder instance.
   *
   * @param responderInfo Information about the wallet/responder
   * @param options Optional configuration (security, sessions, etc.)
   */
  constructor(responderInfo: ResponderInfo, options: DiscoveryResponderOptions = {}) {
    validateResponderInfo(responderInfo);

    // Resolve security policy
    const securityPolicy =
      resolveSecurityPolicy(options.security, { fallbackPreset: 'development' }) ??
      SECURITY_PRESETS['development'];

    this.config = {
      responderInfo,
      securityPolicy,
      ...(options.sessionOptions && { sessionOptions: options.sessionOptions }),
      ...(options.eventTarget && { eventTarget: options.eventTarget }),
      ...(options.logger && { logger: options.logger }),
    } as DiscoveryResponderConfig;

    this.responderInfo = responderInfo;
    this.eventTarget =
      this.config.eventTarget ?? (typeof window !== 'undefined' ? window : new EventTarget());
    this.logger = this.config.logger ?? defaultLogger;

    // Initialize security components
    this.originValidator = new OriginValidator(this.config.securityPolicy);
    this.rateLimiter = new RateLimiter(this.config.securityPolicy?.rateLimit);
    this.capabilityMatcher = new CapabilityMatcher(this.responderInfo);

    // Bind request handler
    this.requestHandler = this.handleDiscoveryRequest.bind(this);

    this.logger.info('[DiscoveryResponder] Responder initialized', {
      rdns: this.responderInfo.rdns,
      type: this.responderInfo.type,
      technologies: this.responderInfo.technologies.length,
    });
  }

  /**
   * Start listening for discovery requests.
   *
   * Begins monitoring for discovery requests and automatically responds
   * to requests that match the wallet's capabilities. Safe to call
   * multiple times (idempotent).
   */
  startListening(): void {
    if (this.isListening) {
      this.logger.debug('[DiscoveryResponder] Already listening');
      return;
    }

    this.eventTarget.addEventListener(DISCOVERY_EVENTS.REQUEST, this.requestHandler as EventListener);
    this.isListening = true;

    this.logger.info('[DiscoveryResponder] Started listening for discovery requests', {
      rdns: this.responderInfo.rdns,
    });
  }

  /**
   * Stop listening for discovery requests.
   *
   * Stops monitoring for discovery requests and removes event listeners.
   * The wallet becomes undiscoverable until startListening() is called again.
   * Safe to call multiple times (idempotent).
   */
  stopListening(): void {
    if (!this.isListening) {
      this.logger.debug('[DiscoveryResponder] Not currently listening');
      return;
    }

    try {
      this.eventTarget.removeEventListener(DISCOVERY_EVENTS.REQUEST, this.requestHandler as EventListener);
    } catch (error) {
      this.logger.warn('Error removing event listener:', error instanceof Error ? error : String(error));
    }

    this.isListening = false;

    this.logger.info('[DiscoveryResponder] Stopped listening for discovery requests', {
      rdns: this.responderInfo.rdns,
    });
  }

  /**
   * Check if the responder is currently listening for requests.
   */
  isAnnouncerListening(): boolean {
    return this.isListening;
  }

  /**
   * Update responder information while maintaining discovery state.
   */
  updateResponderInfo(responderInfo: ResponderInfo): void {
    if (!responderInfo) {
      this.logger.warn('[DiscoveryResponder] Ignoring update with invalid responder info');
      return;
    }

    this.responderInfo = responderInfo;
    this.capabilityMatcher.updateResponderInfo(responderInfo);

    this.logger.info('[DiscoveryResponder] Responder info updated', {
      rdns: responderInfo.rdns,
      technologies: responderInfo.technologies.length,
    });
  }

  /**
   * Update responder configuration without restarting.
   */
  updateConfig(updates: Partial<DiscoveryResponderConfig>): void {
    if (updates.securityPolicy) {
      this.config.securityPolicy = updates.securityPolicy;
      this.originValidator.updatePolicy(updates.securityPolicy);
    }

    if (updates.sessionOptions) {
      this.config.sessionOptions = updates.sessionOptions;
    }

    this.logger.info('[DiscoveryResponder] Configuration updated', {
      rdns: this.responderInfo.rdns,
    });
  }

  /**
   * Get responder statistics.
   */
  getStats() {
    return {
      capabilityDetails: this.capabilityMatcher.getCapabilityDetails(),
      isListening: this.isListening,
      usedSessionsCount: this.usedSessions.size,
      activeSessionsCount: this.sessionStates.size,
    };
  }

  /**
   * Cleanup resources and stop listening.
   */
  cleanup(): void {
    this.stopListening();

    // Dispose all session state machines
    for (const [sessionKey, stateMachine] of this.sessionStates.entries()) {
      try {
        stateMachine.dispose();
      } catch (error) {
        this.logger.warn('[DiscoveryResponder] Error disposing session state machine', {
          error,
          sessionKey,
        });
      }
    }
    this.sessionStates.clear();

    // Clear session tracking
    this.usedSessions.clear();

    this.logger.info('[DiscoveryResponder] Cleanup completed', {
      rdns: this.responderInfo.rdns,
    });
  }

  /**
   * Handle discovery request events.
   */
  private handleDiscoveryRequest(event: CustomEvent<DiscoveryRequestEvent>): void {
    const request = event.detail;

    if (!request) {
      this.logger.warn('Unexpected error processing discovery request from unknown:', 'Missing event detail');
      return;
    }

    try {
      // Security validation
      const securityChecks = this.performSecurityChecks(request);
      if (!securityChecks.valid) {
        return;
      }

      // Ensure session state machine exists for active tracking
      this.getOrCreateSessionState(request);

      // Check capability intersection
      if (!this.isValidRequest(request)) {
        return;
      }

      const intersection = this.capabilityMatcher.matchCapabilities(request);
      if (!intersection.canFulfill) {
        this.logger.debug('[Silent Failure] Cannot fulfill capability requirements', {
          sessionId: request.sessionId,
          origin: request.origin,
          errorCode: ERROR_CODES.CAPABILITY_NOT_SUPPORTED,
        });
        return;
      }

      // Create and send response
      if (intersection.intersection) {
        this.sendDiscoveryResponse(
          request,
          intersection.intersection as unknown as import('./types/capabilities.js').CapabilityIntersection,
        );
      }
    } catch (error) {
      if (this.handleRequestProcessingError(error, request)) {
        return;
      }

      const origin = request?.origin ?? 'unknown';
      const sessionId = request?.sessionId ?? 'unknown';
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.warn(`Unexpected error processing discovery request from ${origin}:`, errorMessage);

      this.logger.error('[DiscoveryResponder] Error handling discovery request', {
        error,
        sessionId,
        origin,
      });
    }
  }

  /**
   * Perform comprehensive security checks on discovery request.
   */
  private performSecurityChecks(request: DiscoveryRequestEvent): { valid: boolean; reason?: string } {
    // Origin validation
    const originResult = this.originValidator.validateOrigin(request.origin);
    if (!originResult.valid) {
      this.logger.debug('[Silent Failure] Origin validation failed', {
        origin: request.origin,
        reason: originResult.reason,
        errorCode: ERROR_CODES.ORIGIN_VALIDATION_FAILED,
      });
      return { valid: false, ...(originResult.reason && { reason: originResult.reason }) };
    }

    // Rate limiting check
    if (!this.rateLimiter.isAllowed(request.origin)) {
      this.logger.debug('[Silent Failure] Rate limit exceeded', {
        origin: request.origin,
        sessionId: request.sessionId,
        errorCode: ERROR_CODES.RATE_LIMIT_EXCEEDED,
      });
      return { valid: false, ...(true && { reason: 'Rate limit exceeded' }) };
    }

    // Session replay check
    if (this.usedSessions.has(request.sessionId)) {
      this.logger.debug('[Silent Failure] Session replay detected', {
        origin: request.origin,
        sessionId: request.sessionId,
        errorCode: ERROR_CODES.SESSION_REPLAY_DETECTED,
      });
      return { valid: false, ...(true && { reason: 'Session ID already used' }) };
    }

    // Record request for rate limiting
    this.rateLimiter.recordRequest(request.origin);

    // Track session
    this.usedSessions.add(request.sessionId);

    return { valid: true };
  }

  protected isValidRequest(request: DiscoveryRequestEvent): boolean {
    if (request.version !== DISCOVERY_PROTOCOL_VERSION) {
      this.logger.warn(
        `[WalletMesh] Protocol version mismatch: expected ${DISCOVERY_PROTOCOL_VERSION}, got ${request.version ?? 'unknown'}`,
      );
      return false;
    }

    if (!request.required || typeof request.required !== 'object' || !Array.isArray(request.required.technologies)) {
      this.logger.warn('[WalletMesh] Invalid discovery request: malformed requirements');
      return false;
    }

    return true;
  }

  protected handleRequestProcessingError(
    error: unknown,
    request?: DiscoveryRequestEvent,
  ): boolean {
    if (error instanceof ProtocolError) {
      switch (error.code) {
        case ERROR_CODES.SESSION_REPLAY_DETECTED: {
          const sessionId = request?.sessionId ?? 'unknown';
          this.logger.debug(`[Silent Failure] Session replay detected for session: ${sessionId}`, {
            errorCode: ERROR_CODES.SESSION_REPLAY_DETECTED,
          });
          return true;
        }
        case ERROR_CODES.CAPABILITY_NOT_SUPPORTED:
        case ERROR_CODES.CHAIN_NOT_SUPPORTED: {
          const origin = request?.origin ?? 'unknown';
          this.logger.debug(`No capability match for request from: ${origin}`, {
            errorCode: error.code,
          });
          return true;
        }
        case ERROR_CODES.RATE_LIMIT_EXCEEDED: {
          this.logger.debug('[Silent Failure] Rate limit exceeded', {
            errorCode: ERROR_CODES.RATE_LIMIT_EXCEEDED,
          });
          return true;
        }
        case ERROR_CODES.ORIGIN_VALIDATION_FAILED: {
          this.logger.debug('[Silent Failure] Origin validation failed', {
            errorCode: ERROR_CODES.ORIGIN_VALIDATION_FAILED,
          });
          return true;
        }
        default: {
          this.logger.warn('[DiscoveryResponder] Protocol error processing discovery request', {
            code: error.code,
            origin: request?.origin,
          });
          return false;
        }
      }
    }

    return false;
  }

  protected handleResponseSendingError(error: Error, request: DiscoveryRequestEvent): void {
    const message = error.message ?? String(error);

    if (message.toLowerCase().includes('dispatch')) {
      this.logger.error(
        `[WalletMesh] Failed to dispatch response event for ${request.origin}:`,
        message,
      );
    } else {
      this.logger.error(`[WalletMesh] Failed to send discovery response to ${request.origin}:`, message);
    }
  }

  /**
   * Send discovery response to qualified request.
   */
  private sendDiscoveryResponse(request: DiscoveryRequestEvent, intersection: CapabilityIntersection): void {
    // Create transport config
    const transportConfig = this.createTransportConfig();

    // Create response event
    const responderId = this.responderInfo.uuid;
    const response: DiscoveryResponseEvent = {
      type: 'discovery:wallet:response',
      version: DISCOVERY_PROTOCOL_VERSION,
      sessionId: request.sessionId,
      responderId,
      rdns: this.responderInfo.rdns,
      name: this.responderInfo.name,
      icon: this.responderInfo.icon,
      matched: intersection,
      ...(transportConfig && { transportConfig }),
      ...(this.responderInfo.description && { description: this.responderInfo.description }),
      ...(this.responderInfo.version && { responderVersion: this.responderInfo.version }),
    };

    // Track session
    this.usedSessions.add(request.sessionId);

    // Dispatch response
    const responseEvent = new CustomEvent(DISCOVERY_EVENTS.RESPONSE, { detail: response });
    try {
      this.eventTarget.dispatchEvent(responseEvent);
    } catch (error) {
      this.handleResponseSendingError(error as Error, request);
      return;
    }

    this.logger.info('[DiscoveryResponder] Discovery response sent', {
      sessionId: request.sessionId,
      origin: request.origin,
      responderId,
      rdns: this.responderInfo.rdns,
    });

  }

  /**
   * Create transport configuration for connection.
   */
  private createTransportConfig(): TransportConfig {
    if (this.responderInfo.type === 'web') {
      const webInfo = this.responderInfo as WebResponderInfo;
      return {
        type: 'popup',
        url: webInfo.url,
        ...(webInfo.origin && { origin: webInfo.origin }),
      };
    }

    if (this.responderInfo.type === 'extension') {
      return {
        type: 'extension',
        extensionId: crypto.randomUUID(), // This would be the actual extension ID
        metadata: {
          name: this.responderInfo.name,
          version: this.responderInfo.version,
        },
      };
    }

    // Default to postMessage
    return {
      type: 'postmessage',
      targetOrigin: '*',
      metadata: {
        responderType: this.responderInfo.type,
      },
    };
  }

  private getSessionKey(origin: string, sessionId: string): string {
    return `${origin}:${sessionId}`;
  }

  private getOrCreateSessionState(request: DiscoveryRequestEvent): ProtocolStateMachine {
    const sessionKey = this.getSessionKey(request.origin, request.sessionId);
    let stateMachine = this.sessionStates.get(sessionKey);

    if (!stateMachine) {
      const sessionTimeout = this.config.sessionOptions?.maxAge ?? 30000;
      stateMachine = new ProtocolStateMachine({ DISCOVERING: sessionTimeout });

      stateMachine.on('stateChange', ((event: StateTransitionEvent) => {
        this.logger.debug('[DiscoveryResponder] Session state transition', {
          sessionKey,
          from: event.fromState,
          to: event.toState,
        });
      }) as unknown as (...args: unknown[]) => void);

      stateMachine.on('error', ((error: Error) => {
        this.logger.warn('[DiscoveryResponder] Session state machine error', {
          error,
          sessionId: request.sessionId,
          origin: request.origin,
        });
      }) as unknown as (...args: unknown[]) => void);

      this.sessionStates.set(sessionKey, stateMachine);
    }

    if (stateMachine.getState() === 'IDLE') {
      try {
        stateMachine.transition('DISCOVERING');
      } catch (error) {
        this.logger.warn('[DiscoveryResponder] Failed to start session state machine', {
          error,
          sessionId: request.sessionId,
          origin: request.origin,
        });
      }
    }

    return stateMachine;
  }

}
