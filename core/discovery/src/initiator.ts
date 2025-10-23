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
  ErrorCategory,
} from './types/core.js';
import { DuplicateResponseError, DiscoveryError } from './types/core.js';
import type {
  CapabilityRequirements,
  CapabilityPreferences,
  QualifiedResponder,
} from './types/capabilities.js';
import type { SecurityPolicy } from './types/security.js';
import type { DiscoveryInitiatorConfig } from './types/testing.js';
import { DISCOVERY_EVENTS, DISCOVERY_CONFIG, DISCOVERY_PROTOCOL_VERSION } from './core/constants.js';
import type { SECURITY_PRESETS } from './presets/security.js';
import type { ProtocolState, StateTransitionEvent } from './core/ProtocolStateMachine.js';
import { type Logger, defaultLogger } from './core/logger.js';
import {
  createInitiatorStateMachine,
  type InitiatorStateMachine,
} from './initiator/InitiatorStateMachine.js';
import { resolveSecurityPolicy } from './shared/security.js';
import {
  validateCapabilityPreferences,
  validateCapabilityRequirements,
  validateInitiatorInfo,
} from './utils/validation.js';

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
  protected config: DiscoveryInitiatorConfig;
  protected eventTarget: EventTarget;
  protected qualifiedWallets = new Map<string, QualifiedResponder>();
  protected sessionId: string | null = null;
  protected stateMachine: InitiatorStateMachine | null = null;
  protected responseHandler: DiscoveryResponseEventHandler;
  protected discoveryResolver: ((value: QualifiedResponder[]) => void) | null = null;
  protected discoveryRejecter: ((error: Error) => void) | null = null;
  protected seenResponders = new Map<string, number>();
  protected firstResponses = new Map<string, DiscoveryResponseEvent>();
  protected logger: Logger;
  protected lastKnownState: ProtocolState = 'IDLE';

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
    validateCapabilityRequirements(requirements);
    // Soft validation: URL may be missing/invalid; getOrigin() will supply fallback
    validateInitiatorInfo(initiatorInfo);
    if (preferences) {
      validateCapabilityPreferences(preferences);
    }

    const securityPolicy = resolveSecurityPolicy(options.security);

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
   * Start discovery process to find qualified wallets.
   *
   * @returns Promise that resolves with array of qualified responders
   */
  async startDiscovery(): Promise<QualifiedResponder[]> {
    if (this.sessionId) {
      throw new Error('Discovery is already in progress');
    }

    if (this.lastKnownState === 'COMPLETED' || this.lastKnownState === 'ERROR') {
      throw new Error(`Cannot reuse discovery session in ${this.lastKnownState} state`);
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
          timeouts: { DISCOVERING: this.config.timeout ?? DISCOVERY_CONFIG.DISCOVERY_TIMEOUT_MS },
        });

        // Set up state machine event listeners
        this.stateMachine.on('stateChange', ((...args: unknown[]) => {
          this.handleStateTransition(args[0] as StateTransitionEvent);
        }) as (...args: unknown[]) => void);
        this.stateMachine.on('error', ((...args: unknown[]) => {
          const error = args[0] as Error;
          const state = args[1] as ProtocolState | undefined;
          this.handleStateMachineError(error, state);
        }) as (...args: unknown[]) => void);

        // Set up response listener
        this.eventTarget.addEventListener(DISCOVERY_EVENTS.RESPONSE, this.responseHandler as EventListener);

        // Start discovery
        try {
          this.stateMachine.transition('DISCOVERING');
        } catch (error) {
          this.handleStateMachineError(error as Error, 'DISCOVERING');
        }

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
        this.stateMachine.transition('COMPLETED', {
          reason: 'manual-stop',
          respondersFound: this.qualifiedWallets.size,
        });
        return;
      } catch (error) {
        const normalizedError = error instanceof Error ? error : new Error(String(error));
        this.logger.warn('Failed to transition to COMPLETED state on stop:', normalizedError);

        const responders = this.getQualifiedResponders();
        this.lastKnownState = 'COMPLETED';
        this.cleanup();

        if (this.discoveryResolver) {
          this.discoveryResolver(responders);
          this.discoveryResolver = null;
        }
        this.discoveryRejecter = null;
        return;
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
   * Determine origin with graceful fallbacks.
   * Priority: valid initiatorInfo.url -> window.location.origin -> http://localhost
   */
  protected getOrigin(): string {
    const url = this.config.initiatorInfo?.url;
    if (typeof url === 'string') {
      try {
        const u = new URL(url);
        return u.origin;
      } catch {
        // ignore invalid; fall through
      }
    }
    if (typeof window !== 'undefined' && window?.location?.origin) {
      return window.location.origin;
    }
    return 'http://localhost:3000';
  }

  /**
   * Get a specific qualified responder by ID.
   */
  getQualifiedResponder(responderId: string): QualifiedResponder | undefined {
    return this.qualifiedWallets.get(responderId);
  }

  /**
   * Get the current discovery session ID if discovery has started.
   */
  getCurrentSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Get the current protocol state for the discovery session.
   */
  getState(): string {
    return this.lastKnownState;
  }

  /**
   * Get discovery statistics for diagnostics and testing.
   */
  getStats(): {
    currentState: string;
    sessionId: string | null;
    qualifiedWalletsCount: number;
    qualifiedWallets: QualifiedResponder[];
    securityStats: {
      seenRespondersCount: number;
      duplicateResponses: Array<{ rdns: string; count: number }>;
    };
    config: {
      timeout: number;
      requirementsCount: { technologies: number; features: number };
      preferencesCount: { technologies: number; features: number } | null;
    };
  } {
    const duplicateResponses = Array.from(this.seenResponders.entries())
      .filter(([, count]) => count > 1)
      .map(([rdns, count]) => ({ rdns, count }));

    const timeout = this.config.timeout ?? DISCOVERY_CONFIG.DISCOVERY_TIMEOUT_MS;

    return {
      currentState: this.getState(),
      sessionId: this.sessionId,
      qualifiedWalletsCount: this.qualifiedWallets.size,
      qualifiedWallets: this.getQualifiedResponders(),
      securityStats: {
        seenRespondersCount: this.seenResponders.size,
        duplicateResponses,
      },
      config: {
        timeout,
        requirementsCount: {
          technologies: this.config.requirements.technologies.length,
          features: this.config.requirements.features.length,
        },
        preferencesCount: this.config.preferences
          ? {
              technologies: this.config.preferences.technologies?.length ?? 0,
              features: this.config.preferences.features?.length ?? 0,
            }
          : null,
      },
    };
  }

  /**
   * Reset the discovery initiator for reuse between sessions.
   */
  reset(): void {
    this.stopDiscovery();
    this.qualifiedWallets.clear();
    this.seenResponders.clear();
    this.firstResponses.clear();
    this.discoveryResolver = null;
    this.discoveryRejecter = null;
    this.sessionId = null;
    this.stateMachine = null;
    this.lastKnownState = 'IDLE';
  }

  /**
   * Dispose of the discovery initiator and release resources.
   */
  dispose(): void {
    this.reset();
  }

  /**
   * Update the discovery configuration for future sessions.
   */
  updateConfig(config: Partial<DiscoveryInitiatorConfig>): void {
    this.reset();

    if (config.requirements) {
      this.config.requirements = config.requirements;
    }

    if (config.preferences) {
      this.config.preferences = config.preferences;
    }

    if (config.initiatorInfo) {
      this.config.initiatorInfo = config.initiatorInfo;
    }

    if (config.securityPolicy !== undefined) {
      this.config.securityPolicy = config.securityPolicy;
    }

    if (config.timeout !== undefined) {
      this.config.timeout = config.timeout;
    }

    if (config.logger) {
      this.logger = config.logger;
      this.config.logger = config.logger;
    }

    if (config.eventTarget) {
      this.eventTarget = config.eventTarget;
      this.config.eventTarget = config.eventTarget;
    }
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
  private handleDiscoveryResponse(
    event: CustomEvent<DiscoveryResponseEvent> | MessageEvent<DiscoveryResponseEvent>,
  ): void {
    const response = event instanceof MessageEvent ? (event.data as DiscoveryResponseEvent) : event.detail;

    try {
      if (!response) {
        this.logger.warn('Error processing discovery response:', new Error('Missing response detail'));
        return;
      }

      const eventOrigin = event instanceof MessageEvent ? event.origin : undefined;
      const responseOrigin = response.transportConfig?.origin ?? response.transportConfig?.targetOrigin;

      const allowedOrigins = this.config.securityPolicy?.allowedOrigins;
      if (allowedOrigins && allowedOrigins.length > 0) {
        const originToCheck = eventOrigin ?? responseOrigin;
        if (originToCheck && !allowedOrigins.includes(originToCheck)) {
          this.logger.warn('Discovery response from invalid origin:', originToCheck);
          return;
        }
      }

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
        this.logger.warn(
          `Protocol version mismatch: expected ${DISCOVERY_PROTOCOL_VERSION}, got ${response.version ?? 'unknown'}`,
        );
        return;
      }

      if (response.type !== DISCOVERY_EVENTS.RESPONSE) {
        this.logger.warn('Unexpected discovery response type:', response.type);
        return;
      }

      const rdnsPattern = /^[a-z0-9]+(?:\.[a-z0-9-]+)+$/i;
      if (!rdnsPattern.test(response.rdns) || response.rdns.length > 253) {
        this.logger.warn('[DiscoveryInitiator] Invalid discovery response RDNS:', response.rdns);
        return;
      }

      if (!response.icon || typeof response.icon !== 'string' || !response.icon.startsWith('data:')) {
        this.logger.warn('[DiscoveryInitiator] Invalid discovery response icon:', response.icon);
        return;
      }

      if (response.name && /[\u0000-\u001F\u007F-\u009F]/.test(response.name)) {
        this.logger.warn('[DiscoveryInitiator] Invalid discovery response name:', response.name);
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
        sessionId: response.sessionId,
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
      this.logger.error('Internal error: First response not tracked for duplicate detection');
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

    const duplicateError = new DuplicateResponseError(duplicateDetails);

    this.logger.warn('SECURITY VIOLATION: Duplicate response detected', duplicateDetails);

    // Increment response count
    this.seenResponders.set(rdns, (this.seenResponders.get(rdns) ?? 0) + 1);

    // Attempt to transition state machine to error state with detailed metadata
    if (this.stateMachine && !this.stateMachine.isTerminalState()) {
      try {
        this.stateMachine.transition('ERROR', {
          reason: 'duplicate-response',
          errorCode: duplicateError.code,
          errorMessage: duplicateError.message,
          errorCategory: duplicateError.category,
          duplicateDetails,
          error: duplicateError,
        });
        return;
      } catch (transitionError) {
        this.logger.error(
          '[DiscoveryInitiator] Failed to transition to error state after duplicate response',
          {
            error: transitionError,
            sessionId: this.sessionId,
          },
        );
      }
    }

    // Fallback if transition is not possible
    this.handleDiscoveryError(duplicateError);
  }

  /**
   * Handle state machine transitions.
   */
  private handleStateTransition(event: StateTransitionEvent): void {
    this.lastKnownState = event.toState;
    this.logger.debug('[DiscoveryInitiator] State transition', {
      from: event.fromState,
      to: event.toState,
      sessionId: this.sessionId,
    });

    if (event.toState === 'COMPLETED') {
      this.handleDiscoveryComplete(event.metadata);
    } else if (event.toState === 'ERROR') {
      const error = this.extractErrorFromMetadata(event.metadata);
      this.handleDiscoveryError(error);
    }
  }

  /**
   * Handle discovery completion.
   */
  private handleDiscoveryComplete(metadata?: Record<string, unknown>): void {
    const qualifiedResponders = this.getQualifiedResponders();

    this.logger.info('[DiscoveryInitiator] Discovery completed', {
      sessionId: this.sessionId,
      responderCount: qualifiedResponders.length,
      ...(metadata && { completionMetadata: metadata }),
    });

    this.logger.debug('[DiscoveryInitiator] Preparing to resolve discovery promise', {
      responderCount: qualifiedResponders.length,
      responderIds: qualifiedResponders.map((responder) => responder.responderId),
    });

    this.cleanup();

    if (this.discoveryResolver) {
      this.logger.debug('[DiscoveryInitiator] Resolving discovery promise');
      this.discoveryResolver(qualifiedResponders);
      this.discoveryResolver = null;
    }
    this.discoveryRejecter = null;
  }

  /**
   * Handle discovery errors.
   */
  private handleDiscoveryError(error: Error): void {
    const enhancedError = this.enhanceError(error);

    this.logger.error('[DiscoveryInitiator] Discovery error', {
      error: enhancedError,
      sessionId: this.sessionId,
    });

    this.cleanup();

    if (this.discoveryRejecter) {
      this.discoveryRejecter(enhancedError);
      this.discoveryRejecter = null;
    }
    this.discoveryResolver = null;
  }

  private handleStateMachineError(error: Error, state?: ProtocolState): void {
    if (state === 'DISCOVERING') {
      if (error.message?.toLowerCase().includes('transition')) {
        this.logger.warn('Failed to transition to COMPLETED state:', error);

        const responders = this.getQualifiedResponders();
        this.lastKnownState = 'COMPLETED';
        this.cleanup();

        if (this.discoveryResolver) {
          this.discoveryResolver(responders);
          this.discoveryResolver = null;
        }
        this.discoveryRejecter = null;
      } else {
        this.logger.warn('Discovery message dispatch failed:', error);
      }
      return;
    }

    this.handleDiscoveryError(error);
  }

  protected enhanceError(error: Error): Error {
    const message = error.message ?? '';

    if (message.includes('No active session')) {
      const enhanced = new DiscoveryError(
        `Session management error: No active session. This may indicate concurrent discovery attempts or an unexpected stopDiscovery() call. Original error: ${message}`,
        error instanceof DiscoveryError ? error.code : undefined,
        error instanceof DiscoveryError ? error.category : 'protocol',
      );
      if (error.stack) {
        enhanced.stack = error.stack;
      }
      return enhanced;
    }

    if (message.includes('Cannot start discovery')) {
      const enhanced = new DiscoveryError(
        `Discovery is already in progress. Call stopDiscovery() before starting a new session. Original error: ${message}`,
        error instanceof DiscoveryError ? error.code : undefined,
        error instanceof DiscoveryError ? error.category : 'protocol',
      );
      if (error.stack) {
        enhanced.stack = error.stack;
      }
      return enhanced;
    }

    if (message.toLowerCase().includes('timeout')) {
      const timeout = this.config.timeout ?? DISCOVERY_CONFIG.DISCOVERY_TIMEOUT_MS;
      const enhanced = new DiscoveryError(
        `Discovery timed out after ${timeout}ms. No qualifying wallets responded. Original error: ${message}`,
        error instanceof DiscoveryError ? error.code : undefined,
        error instanceof DiscoveryError ? error.category : 'protocol',
      );
      if (error.stack) {
        enhanced.stack = error.stack;
      }
      return enhanced;
    }

    return error;
  }

  // (removed old duplicate getOrigin; see protected getOrigin above)

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

  private extractErrorFromMetadata(metadata?: Record<string, unknown>): Error {
    if (!metadata) {
      return new DiscoveryError('Discovery error');
    }

    const metadataError = metadata['error'];
    if (metadataError instanceof Error) {
      return metadataError;
    }

    const message =
      typeof metadata['errorMessage'] === 'string' ? metadata['errorMessage'] : 'Discovery error';
    const code = typeof metadata['errorCode'] === 'number' ? metadata['errorCode'] : undefined;
    const category = (metadata['errorCategory'] as ErrorCategory | undefined) ?? undefined;

    return new DiscoveryError(message, code, category);
  }
}
