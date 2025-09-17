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
import { DISCOVERY_EVENTS, DISCOVERY_PROTOCOL_VERSION } from './core/constants.js';
import { SECURITY_PRESETS } from './presets/security.js';
import { OriginValidator, RateLimiter } from './security.js';
import { CapabilityMatcher } from './responder/CapabilityMatcher.js';
import { type Logger, defaultLogger } from './core/logger.js';
import type { ProtocolStateMachine } from './core/ProtocolStateMachine.js';

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
    // Resolve security policy
    const securityPolicy = this.resolveSecurityPolicy(options.security) ?? SECURITY_PRESETS['development'];

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
   * Resolve security policy from preset name or custom policy.
   */
  private resolveSecurityPolicy(
    security?: keyof typeof SECURITY_PRESETS | SecurityPolicy,
  ): SecurityPolicy | undefined {
    if (!security) {
      return SECURITY_PRESETS['development']; // Default to development for responders
    }

    if (typeof security === 'string') {
      return SECURITY_PRESETS[security];
    }

    return security;
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
      this.logger.warn('[DiscoveryResponder] Error removing event listener', { error });
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
    for (const stateMachine of this.sessionStates.values()) {
      stateMachine.dispose();
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
  private async handleDiscoveryRequest(event: CustomEvent<DiscoveryRequestEvent>): Promise<void> {
    const request = event.detail;

    try {
      // Validate protocol version
      if (request.version !== DISCOVERY_PROTOCOL_VERSION) {
        this.logger.warn('[DiscoveryResponder] Protocol version mismatch', {
          expected: DISCOVERY_PROTOCOL_VERSION,
          received: request.version,
        });
        return;
      }

      // Security validation
      const securityChecks = await this.performSecurityChecks(request);
      if (!securityChecks.valid) {
        this.logger.warn('[DiscoveryResponder] Security check failed', {
          reason: securityChecks.reason,
          origin: request.origin,
        });
        return;
      }

      // Check capability intersection
      const intersection = this.capabilityMatcher.matchCapabilities(request);
      if (!intersection.canFulfill) {
        this.logger.debug('[DiscoveryResponder] Cannot fulfill capability requirements', {
          sessionId: request.sessionId,
          origin: request.origin,
        });
        return;
      }

      // Create and send response
      if (intersection.intersection) {
        await this.sendDiscoveryResponse(
          request,
          intersection.intersection as unknown as import('./types/capabilities.js').CapabilityIntersection,
        );
      }
    } catch (error) {
      this.logger.error('[DiscoveryResponder] Error handling discovery request', {
        error,
        sessionId: request.sessionId,
        origin: request.origin,
      });
    }
  }

  /**
   * Perform comprehensive security checks on discovery request.
   */
  private async performSecurityChecks(
    request: DiscoveryRequestEvent,
  ): Promise<{ valid: boolean; reason?: string }> {
    // Origin validation
    const originResult = this.originValidator.validateOrigin(request.origin);
    if (!originResult.valid) {
      return { valid: false, ...(originResult.reason && { reason: originResult.reason }) };
    }

    // Rate limiting check
    if (!this.rateLimiter.isAllowed(request.origin)) {
      return { valid: false, ...(true && { reason: 'Rate limit exceeded' }) };
    }

    // Session replay check
    if (this.usedSessions.has(request.sessionId)) {
      return { valid: false, ...(true && { reason: 'Session ID already used' }) };
    }

    // Record request for rate limiting
    this.rateLimiter.recordRequest(request.origin);

    // Track session
    this.usedSessions.add(request.sessionId);

    return { valid: true };
  }

  /**
   * Send discovery response to qualified request.
   */
  private async sendDiscoveryResponse(
    request: DiscoveryRequestEvent,
    intersection: CapabilityIntersection,
  ): Promise<void> {
    // Create transport config
    const transportConfig = this.createTransportConfig();

    // Create response event
    const responderId = crypto.randomUUID();
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
    this.eventTarget.dispatchEvent(responseEvent);

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
}
