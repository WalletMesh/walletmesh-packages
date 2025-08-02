import type {
  DiscoveryResponderConfig,
  DiscoveryRequestEvent,
  DiscoveryResponseEvent,
  ResponderInfo,
  WebResponderInfo,
  DiscoveryRequestEventHandler,
} from '../core/types.js';
import { DISCOVERY_EVENTS, DISCOVERY_PROTOCOL_VERSION } from '../core/constants.js';
import { OriginValidator } from '../security/OriginValidator.js';
import { RateLimiter } from '../security/RateLimiter.js';
import { CapabilityMatcher } from './CapabilityMatcher.js';
import { type Logger, defaultLogger } from '../core/logger.js';
import {
  type ProtocolStateMachine,
  type StateTransitionEvent,
  createProtocolStateMachine,
} from '../core/ProtocolStateMachine.js';

/**
 * Discovery announcer for responders to listen for discovery requests and respond
 * if they can fulfill the requirements.
 *
 * Implements the responder-side of the capability-first discovery protocol with
 * comprehensive security features including origin validation, rate limiting,
 * and session tracking to prevent abuse and ensure secure discovery.
 *
 * Features:
 * - Privacy-preserving: Only responds to requests it can fulfill
 * - Secure: Multi-layered security with origin validation and rate limiting
 * - Efficient: Capability intersection calculation prevents unnecessary responses
 * - Configurable: Flexible security policies for different deployment scenarios
 *
 * @example Basic responder setup:
 * ```typescript
 * const announcer = new DiscoveryResponder({
 *   responderInfo: {
 *     name: 'My Responder',
 *     rdns: 'com.example.responder',
 *     uuid: crypto.randomUUID(),
 *     version: '1.0.0',
 *     protocolVersion: '0.1.0',
 *     type: 'extension',
 *     icon: 'data:image/svg+xml;base64,...',
 *     chains: [], // supported chains
 *     features: [] // responder features
 *   },
 *   securityPolicy: {
 *     requireHttps: true,
 *     allowedOrigins: ['https://trusted-initiator.com'],
 *     rateLimit: {
 *       enabled: true,
 *       maxRequests: 10,
 *       windowMs: 60000
 *     }
 *   }
 * });
 *
 * announcer.startListening();
 * ```
 *
 * @example Development setup with relaxed security:
 * ```typescript
 * const devAnnouncer = new DiscoveryResponder({
 *   responderInfo: myResponderInfo,
 *   securityPolicy: {
 *     requireHttps: false,
 *     allowLocalhost: true,
 *     rateLimit: { enabled: false, maxRequests: 100, windowMs: 60000 }
 *   }
 * });
 * ```
 *
 * @category Discovery
 * @since 0.1.0
 * @see {@link DiscoveryInitiator} for dApp-side implementation
 * @see {@link CapabilityMatcher} for capability intersection logic
 * @see {@link OriginValidator} for security validation
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

  constructor(config: DiscoveryResponderConfig) {
    this.config = config;
    this.responderInfo = config.responderInfo;
    this.eventTarget = config.eventTarget ?? (typeof window !== 'undefined' ? window : new EventTarget());
    this.logger = config.logger ?? defaultLogger;

    // Initialize security components
    this.originValidator = new OriginValidator(config.securityPolicy);
    this.rateLimiter = new RateLimiter(config.securityPolicy?.rateLimit);

    // Initialize capability matcher
    this.capabilityMatcher = new CapabilityMatcher(this.responderInfo);

    // Bind the request handler
    this.requestHandler = this.handleDiscoveryRequest.bind(this);
  }

  /**
   * Start listening for discovery requests from dApps.
   *
   * Begins monitoring for discovery requests and automatically responds
   * to requests that match the wallet's capabilities. Safe to call
   * multiple times (idempotent).
   *
   * Security checks performed on each request:
   * - Origin validation against security policy
   * - Rate limiting per origin
   * - Session replay prevention
   * - Capability intersection calculation
   *
   * @example
   * ```typescript
   * announcer.startListening();
   * console.log('Wallet is now discoverable');
   *
   * // Wallet will automatically respond to qualified requests
   * // No manual intervention required
   * ```
   *
   * @category Discovery
   * @since 0.1.0
   */
  startListening(): void {
    if (this.isListening) {
      return;
    }

    this.eventTarget.addEventListener(DISCOVERY_EVENTS.REQUEST, this.requestHandler as EventListener);

    this.isListening = true;
  }

  /**
   * Stop listening for discovery requests.
   *
   * Stops monitoring for discovery requests and removes event listeners.
   * The wallet becomes undiscoverable until startListening() is called again.
   * Safe to call multiple times (idempotent).
   *
   * @example
   * ```typescript
   * // Temporarily hide wallet from discovery
   * announcer.stopListening();
   *
   * // Perform maintenance or updates
   * await updateWalletConfiguration();
   *
   * // Resume discovery
   * announcer.startListening();
   * ```
   *
   * @category Discovery
   * @since 0.1.0
   */
  stopListening(): void {
    if (!this.isListening) {
      return;
    }

    try {
      this.eventTarget.removeEventListener(DISCOVERY_EVENTS.REQUEST, this.requestHandler as EventListener);
    } catch (error) {
      // Log but don't throw - cleanup should be robust
      this.logger.warn('Error removing event listener:', error);
    }

    this.isListening = false;
  }

  /**
   * Check if the announcer is currently listening for requests.
   *
   * Returns the current listening state. Useful for UI indicators
   * and ensuring proper state management.
   *
   * @returns True if listening for requests, false otherwise
   *
   * @example
   * ```typescript
   * if (announcer.isAnnouncerListening()) {
   *   console.log('Wallet is discoverable');
   * } else {
   *   announcer.startListening();
   *   console.log('Started wallet discovery');
   * }
   * ```
   *
   * @category Discovery
   * @since 0.1.0
   */
  isAnnouncerListening(): boolean {
    return this.isListening;
  }

  /**
   * Update responder information while maintaining discovery state.
   *
   * Updates the responder's capabilities and information used for
   * capability matching. The announcer continues listening with
   * the updated information.
   *
   * @param responderInfo - New responder information
   *
   * @example
   * ```typescript
   * // Add support for a new blockchain
   * const updatedInfo = {
   *   ...currentResponderInfo,
   *   chains: [
   *     ...currentResponderInfo.chains,
   *     newChainCapability
   *   ]
   * };
   *
   * announcer.updateResponderInfo(updatedInfo);
   * console.log('Responder now supports additional chains');
   * ```
   *
   * @category Configuration
   * @since 0.1.0
   */
  updateResponderInfo(responderInfo: ResponderInfo): void {
    this.responderInfo = responderInfo;
    this.capabilityMatcher.updateResponderInfo(responderInfo);
  }

  /**
   * Update announcer configuration without restarting.
   *
   * Partially updates the configuration while maintaining the current
   * listening state. Useful for adjusting security policies or
   * session settings during runtime.
   *
   * @param config - Partial configuration updates
   *
   * @example
   * ```typescript
   * // Tighten security for production
   * announcer.updateConfig({
   *   securityPolicy: {
   *     requireHttps: true,
   *     allowedOrigins: ['https://production-dapp.com'],
   *     rateLimit: {
   *       enabled: true,
   *       maxRequests: 5,
   *       windowMs: 60000
   *     }
   *   }
   * });
   * ```
   *
   * @category Configuration
   * @since 0.1.0
   */
  updateConfig(config: Partial<DiscoveryResponderConfig>): void {
    this.config = { ...this.config, ...config };

    if (config.responderInfo) {
      this.updateResponderInfo(config.responderInfo);
    }

    if (config.securityPolicy) {
      this.originValidator = new OriginValidator(config.securityPolicy);
      this.rateLimiter = new RateLimiter(config.securityPolicy.rateLimit);
    }
  }

  /**
   * Get announcer statistics.
   */
  getStats() {
    return {
      isListening: this.isListening,
      responderInfo: {
        id: this.responderInfo.uuid,
        rdns: this.responderInfo.rdns,
        name: this.responderInfo.name,
        type: this.responderInfo.type,
        chainCount: this.responderInfo.chains.length,
        featureCount: this.responderInfo.features.length,
      },
      securityStats: {
        ...this.rateLimiter.getStats(),
        usedSessionsCount: this.usedSessions.size,
      },
      capabilityDetails: this.capabilityMatcher.getCapabilityDetails(),
    };
  }

  /**
   * Cleanup resources and stop listening.
   */
  cleanup(): void {
    this.stopListening();

    // Clear used sessions
    this.usedSessions.clear();

    // Dispose all session state machines
    for (const stateMachine of this.sessionStates.values()) {
      try {
        stateMachine.dispose();
      } catch (error) {
        // Log but don't throw - cleanup should be robust
        this.logger.error('Error disposing state machine:', error);
      }
    }
    this.sessionStates.clear();
  }

  /**
   * Get or create state machine for a session.
   */
  private getSessionStateMachine(origin: string, sessionId: string): ProtocolStateMachine {
    const sessionKey = `${origin}:${sessionId}`;
    let stateMachine = this.sessionStates.get(sessionKey);

    if (!stateMachine) {
      stateMachine = createProtocolStateMachine({
        DISCOVERING: 30000, // 30 seconds for discovery
      });

      // Cleanup on timeout or reset
      stateMachine.on('stateChange' as string, (event: unknown) => {
        const stateEvent = event as StateTransitionEvent;
        if (stateEvent.toState === 'IDLE' && stateEvent.fromState !== 'IDLE') {
          // Session ended, cleanup after a delay
          setTimeout(() => {
            const sm = this.sessionStates.get(sessionKey);
            if (sm?.isInState('IDLE')) {
              sm.dispose();
              this.sessionStates.delete(sessionKey);
            }
          }, 5000);
        }
      });

      this.sessionStates.set(sessionKey, stateMachine);
    }

    return stateMachine;
  }

  /**
   * Handle discovery request from a dApp.
   */
  private handleDiscoveryRequest(event: CustomEvent<DiscoveryRequestEvent>): void {
    let request: DiscoveryRequestEvent | undefined;

    try {
      request = event.detail;

      // Validate the request
      if (!this.isValidRequest(request)) {
        return;
      }

      // Get the effective origin (fallback to detected origin if not in request)
      const effectiveOrigin = request.origin || this.getEventOrigin(event);

      // Check rate limiting
      if (!this.rateLimiter.isAllowed(effectiveOrigin)) {
        this.logger.warn(`Rate limit exceeded for origin: ${effectiveOrigin}`, {
          sessionId: request.sessionId,
          stats: this.rateLimiter.getStats(),
        });
        return;
      }

      // Validate origin
      const originValidation = this.originValidator.validateEventOrigin(
        this.getEventOrigin(event),
        effectiveOrigin,
      );

      if (!originValidation.valid) {
        this.logger.warn(`Origin blocked: ${effectiveOrigin}`, {
          reason: originValidation.reason,
          eventOrigin: this.getEventOrigin(event),
          requestOrigin: request.origin,
          sessionId: request.sessionId,
        });
        return;
      }

      // Check for session replay attack
      if (this.usedSessions.has(request.sessionId)) {
        this.logger.warn('Session replay detected', {
          origin: effectiveOrigin,
          sessionId: request.sessionId,
        });
        return;
      }

      // Track this session
      this.usedSessions.add(request.sessionId);

      // Record the request for rate limiting
      this.rateLimiter.recordRequest(effectiveOrigin);

      // Check if we can fulfill the requirements
      const matchResult = this.capabilityMatcher.matchCapabilities(request);

      if (!matchResult.canFulfill || !matchResult.intersection) {
        // We can't fulfill the requirements, so we don't respond
        return;
      }

      // Create state machine for this session and transition to DISCOVERING
      const stateMachine = this.getSessionStateMachine(effectiveOrigin, request.sessionId);
      stateMachine.transition('DISCOVERING');

      // Send discovery response
      this.sendDiscoveryResponse(request, matchResult.intersection);
    } catch (error) {
      this.handleRequestProcessingError(error, request);
    }
  }

  /**
   * Send discovery response to the dApp.
   */
  private sendDiscoveryResponse(
    request: DiscoveryRequestEvent,
    intersection: import('../core/types.js').CapabilityIntersection,
  ): void {
    try {
      const response: DiscoveryResponseEvent = {
        type: DISCOVERY_EVENTS.RESPONSE,
        version: DISCOVERY_PROTOCOL_VERSION,
        sessionId: request.sessionId,
        responderId: this.responderInfo.uuid,
        rdns: this.responderInfo.rdns,
        name: this.responderInfo.name,
        icon: this.responderInfo.icon,
        ...(this.responderInfo.type === 'web' && {
          description: (this.responderInfo as WebResponderInfo).url,
        }),
        responderVersion: this.responderInfo.version,
        matched: intersection,
        // Include transport configuration if available
        ...(this.responderInfo.transportConfig && {
          transportConfig: this.responderInfo.transportConfig,
        }),
      };

      const event = new CustomEvent(DISCOVERY_EVENTS.RESPONSE, {
        detail: response,
      });

      this.eventTarget.dispatchEvent(event);
    } catch (error) {
      this.handleResponseSendingError(error, request);
    }
  }

  /**
   * Handle errors that occur during request processing.
   *
   * @param error - The error that occurred
   * @param request - The request being processed (optional)
   */
  private handleRequestProcessingError(error: unknown, request?: DiscoveryRequestEvent): void {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Categorize the error
    if (errorMessage.includes('Origin validation failed')) {
      this.logger.warn(`Blocked request from unauthorized origin: ${request?.origin || 'unknown'}`);
    } else if (errorMessage.includes('Rate limit exceeded')) {
      this.logger.warn(`Rate limit exceeded for origin: ${request?.origin || 'unknown'}`);
    } else if (errorMessage.includes('Session replay detected')) {
      this.logger.warn(`Blocked replay attempt for session: ${request?.sessionId || 'unknown'}`);
    } else if (
      errorMessage.includes('Capability not supported') ||
      errorMessage.includes('Chain not supported')
    ) {
      // These are normal - wallet just doesn't support what was requested
      this.logger.debug(`No capability match for request from: ${request?.origin || 'unknown'}`);
    } else {
      // Unexpected error - log as warning
      this.logger.warn(
        `Error processing discovery request from ${request?.origin || 'unknown'}:`,
        errorMessage,
      );
    }
  }

  /**
   * Handle errors that occur during response sending.
   *
   * @param error - The error that occurred
   * @param request - The original request
   */
  private handleResponseSendingError(error: unknown, request: DiscoveryRequestEvent): void {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // These are more serious as they prevent successful responses
    if (errorMessage.includes('dispatchEvent')) {
      this.logger.error(`Failed to dispatch response event for ${request.origin}:`, errorMessage);
    } else {
      this.logger.error(`Failed to send discovery response to ${request.origin}:`, errorMessage);
    }
  }

  /**
   * Validate a discovery request.
   */
  private isValidRequest(request: DiscoveryRequestEvent): boolean {
    // Check required fields
    if (
      !request.type ||
      !request.version ||
      !request.sessionId ||
      !request.initiatorInfo ||
      !request.required
    ) {
      if (!request.required) {
        this.logger.warn('Invalid discovery request: malformed requirements');
      }
      return false;
    }

    // Origin is required in browser environments, but optional in non-browser environments
    if (typeof window !== 'undefined' && !request.origin) {
      return false;
    }

    // Check message type
    if (request.type !== DISCOVERY_EVENTS.REQUEST) {
      return false;
    }

    // Check protocol version compatibility
    if (request.version !== DISCOVERY_PROTOCOL_VERSION) {
      this.logger.warn(
        `Protocol version mismatch: expected ${DISCOVERY_PROTOCOL_VERSION}, got ${request.version}`,
      );
      return false;
    }

    // Validate initiator info
    if (!request.initiatorInfo.name || !request.initiatorInfo.url) {
      return false;
    }

    // Validate URL format
    try {
      new URL(request.initiatorInfo.url);
    } catch {
      return false;
    }

    // Validate required capabilities structure
    if (
      !request.required.chains ||
      !Array.isArray(request.required.chains) ||
      !request.required.features ||
      !Array.isArray(request.required.features) ||
      !request.required.interfaces ||
      !Array.isArray(request.required.interfaces)
    ) {
      return false;
    }

    // Validate optional capabilities if present
    if (request.optional) {
      if (
        (request.optional.chains !== undefined && !Array.isArray(request.optional.chains)) ||
        (request.optional.features !== undefined && !Array.isArray(request.optional.features))
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get event origin for validation.
   * Since this is browser-only, we can rely on window.location.origin.
   */
  private getEventOrigin(event: CustomEvent): string {
    // In browser environments, we always have window.location
    if (typeof window !== 'undefined' && window.location) {
      return window.location.origin;
    }

    // For testing environments, use fallback
    if (
      typeof process !== 'undefined' &&
      process.env?.['NODE_ENV'] &&
      (process.env['NODE_ENV'] === 'test' || process.env['NODE_ENV'] === 'development')
    ) {
      return event.detail?.origin || 'http://localhost:3000';
    }

    // Should not reach here in browser-only implementation
    throw new Error('Discovery protocol requires a browser environment');
  }
}
