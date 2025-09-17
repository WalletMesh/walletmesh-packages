/**
 * Simplified Discovery Initiator implementation.
 *
 * Consolidated initiator module with clean constructor pattern and preset support.
 * Replaces factory functions with simple class instantiation.
 *
 * @module initiator
 * @category Core
 * @since 0.1.0
 */

import type {
  DiscoveryResponseEvent,
  DiscoveryResponseEventHandler,
  DuplicateResponseDetails,
  InitiatorInfo,
} from './types/core.js';
import type {
  CapabilityRequirements,
  CapabilityPreferences,
  QualifiedResponder,
} from './types/capabilities.js';
import type { SecurityPolicy } from './types/security.js';
import type { DiscoveryInitiatorConfig } from './types/testing.js';
import { DISCOVERY_EVENTS, DISCOVERY_CONFIG, DISCOVERY_PROTOCOL_VERSION } from './core/constants.js';
import { SECURITY_PRESETS } from './presets/security.js';
import type { StateTransitionEvent } from './core/ProtocolStateMachine.js';
import { type Logger, defaultLogger } from './core/logger.js';
import {
  createInitiatorStateMachine,
  type InitiatorStateMachine,
} from './initiator/InitiatorStateMachine.js';

/**
 * Options for DiscoveryInitiator configuration.
 *
 * @category Configuration
 * @since 0.1.0
 */
export interface DiscoveryInitiatorOptions {
  /** Security policy preset name or custom policy */
  security?: keyof typeof SECURITY_PRESETS | SecurityPolicy;
  /** Discovery timeout in milliseconds */
  timeout?: number;
  /** Custom event target for testing */
  eventTarget?: EventTarget;
  /** Custom logger instance */
  logger?: Logger;
}

/**
 * Discovery initiator for dApps to find qualified wallets.
 *
 * Simplified implementation with clean constructor pattern that uses presets
 * for common configurations. Replaces the complex factory function pattern.
 *
 * @example Basic usage with presets
 * ```typescript
 * import { DiscoveryInitiator, CAPABILITY_PRESETS } from '@walletmesh/discovery';
 *
 * const initiator = new DiscoveryInitiator(
 *   CAPABILITY_PRESETS.ethereum,
 *   { name: 'My App', url: 'https://myapp.com' }
 * );
 *
 * const wallets = await initiator.startDiscovery();
 * ```
 *
 * @example With options and preferences
 * ```typescript
 * const initiator = new DiscoveryInitiator(
 *   CAPABILITY_PRESETS.multiChain,
 *   { name: 'DeFi App', url: 'https://defi.com' },
 *   {
 *     security: 'production',
 *     timeout: 10000
 *   },
 *   { features: ['hardware-wallet'] }
 * );
 * ```
 *
 * @category Core
 * @since 0.1.0
 */
export class DiscoveryInitiator {
  private config: DiscoveryInitiatorConfig;
  private eventTarget: EventTarget;
  private qualifiedWallets = new Map<string, QualifiedResponder>();
  private sessionId: string | null = null;
  private stateMachine: InitiatorStateMachine | null = null;
  private responseHandler: DiscoveryResponseEventHandler;
  private discoveryResolver: ((value: QualifiedResponder[]) => void) | null = null;
  private discoveryRejecter: ((error: Error) => void) | null = null;
  private seenResponders = new Map<string, number>();
  private firstResponses = new Map<string, DiscoveryResponseEvent>();
  private logger: Logger;

  /**
   * Create a new DiscoveryInitiator instance.
   *
   * @param requirements Capability requirements (use CAPABILITY_PRESETS for common scenarios)
   * @param initiatorInfo Information about the requesting application
   * @param options Optional configuration (security, timeout, etc.)
   * @param preferences Optional capability preferences for enhanced matching
   */
  constructor(
    requirements: CapabilityRequirements,
    initiatorInfo: InitiatorInfo,
    options: DiscoveryInitiatorOptions = {},
    preferences?: CapabilityPreferences,
  ) {
    // Resolve security policy
    const securityPolicy = this.resolveSecurityPolicy(options.security);

    this.config = {
      requirements,
      ...(preferences && { preferences }),
      initiatorInfo,
      ...(securityPolicy && { securityPolicy }),
      timeout: options.timeout ?? DISCOVERY_CONFIG.DISCOVERY_TIMEOUT_MS,
      ...(options.eventTarget && { eventTarget: options.eventTarget }),
      ...(options.logger && { logger: options.logger }),
    };

    this.eventTarget =
      this.config.eventTarget ?? (typeof window !== 'undefined' ? window : new EventTarget());
    this.logger = this.config.logger ?? defaultLogger;
    this.responseHandler = this.handleDiscoveryResponse.bind(this);
  }

  /**
   * Resolve security policy from preset name or custom policy.
   */
  private resolveSecurityPolicy(
    security?: keyof typeof SECURITY_PRESETS | SecurityPolicy,
  ): SecurityPolicy | undefined {
    if (!security) {
      return undefined;
    }

    if (typeof security === 'string') {
      return SECURITY_PRESETS[security];
    }

    return security;
  }

  /**
   * Start discovery process to find qualified wallets.
   *
   * @returns Promise that resolves with array of qualified responders
   */
  async startDiscovery(): Promise<QualifiedResponder[]> {
    if (this.sessionId) {
      throw new Error('Discovery already in progress or completed');
    }

    return new Promise((resolve, reject) => {
      try {
        this.discoveryResolver = resolve;
        this.discoveryRejecter = reject;

        // Create new session
        this.sessionId = crypto.randomUUID();
        this.qualifiedWallets.clear();
        this.seenResponders.clear();
        this.firstResponses.clear();

        // Create state machine
        this.stateMachine = createInitiatorStateMachine({
          sessionId: this.sessionId,
          requirements: this.config.requirements,
          ...(this.config.preferences && { preferences: this.config.preferences }),
          initiatorInfo: this.config.initiatorInfo,
          origin: this.getOrigin(),
          eventTarget: this.eventTarget,
          logger: this.logger,
        });

        // Set up state machine event listeners
        this.stateMachine.on('transition', ((...args: unknown[]) => {
          this.handleStateTransition(args[0] as StateTransitionEvent);
        }) as (...args: unknown[]) => void);
        this.stateMachine.on('completed', this.handleDiscoveryComplete.bind(this));
        this.stateMachine.on('error', ((...args: unknown[]) => {
          this.handleDiscoveryError(args[0] as Error);
        }) as (...args: unknown[]) => void);

        // Set up response listener
        this.eventTarget.addEventListener(DISCOVERY_EVENTS.RESPONSE, this.responseHandler as EventListener);

        // Start discovery
        this.stateMachine.transition('DISCOVERING');

        this.logger.info('[DiscoveryInitiator] Discovery started', { sessionId: this.sessionId });
      } catch (error) {
        this.logger.error('[DiscoveryInitiator] Failed to start discovery', { error });
        reject(error);
      }
    });
  }

  /**
   * Stop discovery process and cleanup resources.
   */
  stopDiscovery(): void {
    if (this.stateMachine && !this.stateMachine.isTerminalState()) {
      try {
        this.stateMachine.transition('ERROR', { reason: 'Discovery stopped by user' });
      } catch (error) {
        this.logger.warn('[DiscoveryInitiator] Error during discovery stop', { error });
      }
    }
    this.cleanup();
  }

  /**
   * Get qualified responders found during discovery.
   */
  getQualifiedResponders(): QualifiedResponder[] {
    return Array.from(this.qualifiedWallets.values());
  }

  /**
   * Get a specific qualified responder by ID.
   */
  getQualifiedResponder(responderId: string): QualifiedResponder | undefined {
    return this.qualifiedWallets.get(responderId);
  }

  /**
   * Check if discovery is currently active.
   */
  isDiscovering(): boolean {
    return this.stateMachine?.isInState('DISCOVERING') ?? false;
  }

  /**
   * Handle discovery response events from wallets.
   */
  private handleDiscoveryResponse(event: CustomEvent<DiscoveryResponseEvent>): void {
    const response = event.detail;

    try {
      // Validate session
      if (response.sessionId !== this.sessionId) {
        this.logger.warn('[DiscoveryInitiator] Response session ID mismatch', {
          expected: this.sessionId,
          received: response.sessionId,
        });
        return;
      }

      // Validate protocol version
      if (response.version !== DISCOVERY_PROTOCOL_VERSION) {
        this.logger.warn('[DiscoveryInitiator] Protocol version mismatch', {
          expected: DISCOVERY_PROTOCOL_VERSION,
          received: response.version,
        });
        return;
      }

      // Check for duplicate responses
      const rdns = response.rdns;
      const responseCount = this.seenResponders.get(rdns) ?? 0;

      if (responseCount > 0) {
        this.handleDuplicateResponse(response, rdns);
        return;
      }

      // Record first response
      this.seenResponders.set(rdns, 1);
      this.firstResponses.set(rdns, response);

      // Create qualified responder
      const qualifiedResponder: QualifiedResponder = {
        responderId: response.responderId,
        rdns: response.rdns,
        name: response.name,
        icon: response.icon,
        matched: response.matched,
        ...(response.transportConfig && { transportConfig: response.transportConfig }),
        ...(response.responderVersion || response.description
          ? {
              metadata: {
                ...(response.responderVersion && { version: response.responderVersion }),
                ...(response.description && { description: response.description }),
              },
            }
          : {}),
      };

      // Store qualified responder
      this.qualifiedWallets.set(response.responderId, qualifiedResponder);

      this.logger.info('[DiscoveryInitiator] Qualified responder found', {
        responderId: response.responderId,
        rdns: rdns,
      });
    } catch (error) {
      this.logger.error('[DiscoveryInitiator] Error handling discovery response', { error });
    }
  }

  /**
   * Handle duplicate response detection.
   */
  private handleDuplicateResponse(response: DiscoveryResponseEvent, rdns: string): void {
    const firstResponse = this.firstResponses.get(rdns);
    if (!firstResponse) {
      this.logger.error('[DiscoveryInitiator] Missing first response for duplicate detection', { rdns });
      return;
    }

    const responseCount = this.seenResponders.get(rdns) ?? 1;
    const duplicateDetails: DuplicateResponseDetails = {
      rdns: response.rdns,
      originalResponderId: firstResponse.responderId,
      duplicateResponderId: response.responderId,
      responseCount: responseCount + 1,
      sessionId: response.sessionId,
      detectedAt: Date.now(),
      originalName: firstResponse.name,
      duplicateName: response.name,
    };

    this.logger.warn('[DiscoveryInitiator] Duplicate response detected', duplicateDetails);

    // Increment response count
    this.seenResponders.set(rdns, (this.seenResponders.get(rdns) ?? 0) + 1);
  }

  /**
   * Handle state machine transitions.
   */
  private handleStateTransition(event: StateTransitionEvent): void {
    this.logger.debug('[DiscoveryInitiator] State transition', {
      from: event.fromState,
      to: event.toState,
      sessionId: this.sessionId,
    });
  }

  /**
   * Handle discovery completion.
   */
  private handleDiscoveryComplete(): void {
    const qualifiedResponders = this.getQualifiedResponders();

    this.logger.info('[DiscoveryInitiator] Discovery completed', {
      sessionId: this.sessionId,
      responderCount: qualifiedResponders.length,
    });

    this.cleanup();

    if (this.discoveryResolver) {
      this.discoveryResolver(qualifiedResponders);
      this.discoveryResolver = null;
    }
  }

  /**
   * Handle discovery errors.
   */
  private handleDiscoveryError(error: Error): void {
    this.logger.error('[DiscoveryInitiator] Discovery error', { error, sessionId: this.sessionId });

    this.cleanup();

    if (this.discoveryRejecter) {
      this.discoveryRejecter(error);
      this.discoveryRejecter = null;
    }
  }

  /**
   * Get the current origin.
   */
  private getOrigin(): string {
    try {
      if (this.config.initiatorInfo.url) {
        return new URL(this.config.initiatorInfo.url).origin;
      }
    } catch {
      // Fall through to window check
    }

    if (typeof window !== 'undefined' && window.location) {
      return window.location.origin;
    }

    return 'http://localhost:3000';
  }

  /**
   * Cleanup resources and event listeners.
   */
  private cleanup(): void {
    // Remove event listener
    this.eventTarget.removeEventListener(DISCOVERY_EVENTS.RESPONSE, this.responseHandler as EventListener);

    // Dispose state machine
    if (this.stateMachine) {
      this.stateMachine.dispose();
      this.stateMachine = null;
    }

    // Reset session
    this.sessionId = null;
  }
}
