import type {
  InitiatorInfo,
  DiscoveryRequestEvent,
  DiscoveryCompleteEvent,
  DiscoveryErrorEvent,
} from '../types/core.js';
import type { CapabilityRequirements, CapabilityPreferences } from '../types/capabilities.js';
import type { Logger } from '../core/logger.js';
import { DISCOVERY_EVENTS, DISCOVERY_PROTOCOL_VERSION } from '../core/constants.js';
import {
  ProtocolStateMachine,
  type StateTimeouts,
  type StateTransitionEvent,
} from '../core/ProtocolStateMachine.js';
import { defaultLogger } from '../core/logger.js';

/**
 * Configuration for the InitiatorStateMachine.
 *
 * @category State Machine
 * @since 0.2.0
 */
export interface InitiatorStateMachineConfig {
  /**
   * Event target for dispatching discovery messages.
   * Defaults to window in browser environments.
   */
  eventTarget?: EventTarget;

  /**
   * Session ID for the discovery session.
   * Should be generated using crypto.randomUUID().
   */
  sessionId: string;

  /**
   * Origin of the initiator application.
   */
  origin: string;

  /**
   * Information about the initiator application.
   */
  initiatorInfo: InitiatorInfo;

  /**
   * Required capability requirements for discovery.
   */
  requirements: CapabilityRequirements;

  /**
   * Optional capability preferences for discovery.
   */
  preferences?: CapabilityPreferences;

  /**
   * Custom timeouts for state transitions.
   */
  timeouts?: Partial<StateTimeouts>;

  /**
   * Optional logger instance.
   */
  logger?: Logger;

  /**
   * Interval for rebroadcasting discovery requests in milliseconds.
   * Default: 200ms
   */
  rebroadcastInterval?: number;

  /**
   * Whether to enable rebroadcasting of discovery requests.
   * Default: true in browser environments
   */
  rebroadcastEnabled?: boolean;
}

/**
 * Initiator-specific state machine that automatically sends discovery protocol
 * messages on state transitions.
 *
 * This state machine extends the base ProtocolStateMachine to provide automatic
 * message dispatch when transitioning between states. It ensures that the discovery
 * protocol messages are always sent at the correct time and with the correct data.
 *
 * ## State Transitions and Messages
 *
 * - **IDLE → DISCOVERING**: Automatically sends `discovery:wallet:request`
 * - **DISCOVERING → COMPLETED**: Automatically sends `discovery:wallet:complete`
 * - **DISCOVERING → ERROR**: Automatically sends `discovery:wallet:error`
 *
 * ## Single-Use Pattern
 *
 * Each instance is valid for exactly one discovery session. Once the session
 * reaches a terminal state (COMPLETED or ERROR), a new instance must be created
 * for subsequent discovery sessions.
 *
 * @example Basic usage
 * ```typescript
 * const stateMachine = new InitiatorStateMachine({
 *   eventTarget: window,
 *   sessionId: crypto.randomUUID(),
 *   origin: window.location.origin,
 *   initiatorInfo: {
 *     name: 'My DApp',
 *     url: 'https://mydapp.com',
 *     icon: 'data:image/svg+xml;base64,...'
 *   },
 *   requirements: {
 *     chains: ['eip155:1'],
 *     features: ['account-management'],
 *     interfaces: ['eip-1193']
 *   }
 * });
 *
 * // Start discovery - request message sent automatically
 * stateMachine.transition('DISCOVERING');
 *
 * // On timeout or completion - complete message sent automatically
 * stateMachine.transition('COMPLETED', { reason: 'timeout' });
 * ```
 *
 * @category State Machine
 * @since 0.2.0
 * @see {@link ProtocolStateMachine} for base state machine functionality
 * @see {@link DiscoveryInitiator} for usage in discovery implementation
 */
export class InitiatorStateMachine extends ProtocolStateMachine {
  private readonly eventTarget: EventTarget;
  private readonly config: InitiatorStateMachineConfig;
  private readonly logger: Logger;
  private rebroadcastTimer?: number;
  private discoveryRequest?: CustomEvent;

  /**
   * Creates a new InitiatorStateMachine instance.
   *
   * @param config - Configuration for the state machine
   */
  constructor(config: InitiatorStateMachineConfig) {
    super(config.timeouts);
    this.config = config;
    this.eventTarget = config.eventTarget ?? (typeof window !== 'undefined' ? window : new EventTarget());
    this.logger = config.logger ?? defaultLogger;

    // Set up automatic message dispatch on state transitions
    this.setupAutomaticMessaging();
  }

  /**
   * Sets up automatic message dispatch on state transitions.
   * @private
   */
  private setupAutomaticMessaging(): void {
    this.on('stateChange', (event) => {
      const stateEvent = event as StateTransitionEvent;

      try {
        switch (stateEvent.toState) {
          case 'DISCOVERING':
            if (stateEvent.fromState === 'IDLE') {
              this.sendDiscoveryRequest();
            }
            break;

          case 'COMPLETED':
            if (stateEvent.fromState === 'DISCOVERING') {
              this.stopRebroadcasting();
              this.sendDiscoveryComplete(stateEvent.metadata);
            }
            break;

          case 'ERROR':
            if (stateEvent.fromState === 'DISCOVERING') {
              this.stopRebroadcasting();
              this.sendDiscoveryError(stateEvent.metadata);
            }
            break;
        }
      } catch (error) {
        // Log but don't throw - message dispatch failure shouldn't break state transitions
        this.logger.error('Failed to dispatch discovery message:', error);

        // Emit error event for observers (handled gracefully by initiator)
        this.emit('error', error as Error, stateEvent.toState);
      }
    });
  }

  /**
   * Sends the discovery request message.
   * Called automatically when transitioning from IDLE to DISCOVERING.
   * @private
   */
  private sendDiscoveryRequest(): void {
    const request: DiscoveryRequestEvent = {
      type: DISCOVERY_EVENTS.REQUEST,
      version: DISCOVERY_PROTOCOL_VERSION,
      sessionId: this.config.sessionId,
      origin: this.config.origin,
      initiatorInfo: this.config.initiatorInfo,
      required: this.config.requirements,
      ...(this.config.preferences && { optional: this.config.preferences }),
    };

    const event = new CustomEvent(DISCOVERY_EVENTS.REQUEST, {
      detail: request,
    });

    // Store the discovery request for rebroadcasting
    this.discoveryRequest = event;

    // Dispatch the initial request
    try {
      this.eventTarget.dispatchEvent(event);
    } catch (error) {
      this.logger.error('Failed to dispatch discovery message:', error);
      this.emit('error', error as Error, 'DISCOVERING');
    }

    // Start rebroadcasting if enabled and in browser environment
    if (typeof window !== 'undefined') {
      const rebroadcastEnabled = this.config.rebroadcastEnabled !== false;
      if (rebroadcastEnabled) {
        const interval = this.config.rebroadcastInterval ?? 200;
        this.startRebroadcasting(interval);
      }
    }
  }

  /**
   * Start rebroadcasting the discovery request at the specified interval.
   * @private
   */
  private startRebroadcasting(interval: number): void {
    this.stopRebroadcasting(); // Clear any existing timer

    if (!this.discoveryRequest) {
      this.logger.warn('No discovery request to rebroadcast');
      return;
    }

    this.logger.debug(`Starting discovery request rebroadcast with ${interval}ms interval`);

    this.rebroadcastTimer = window.setInterval(() => {
      if (this.discoveryRequest && this.isInState('DISCOVERING')) {
        this.logger.debug('Rebroadcasting discovery request', { sessionId: this.config.sessionId });
        this.eventTarget.dispatchEvent(this.discoveryRequest);
      } else {
        // Stop rebroadcasting if no longer discovering
        this.stopRebroadcasting();
      }
    }, interval);
  }

  /**
   * Stop rebroadcasting the discovery request.
   * @private
   */
  private stopRebroadcasting(): void {
    if (this.rebroadcastTimer !== undefined && typeof window !== 'undefined') {
      window.clearInterval(this.rebroadcastTimer);
      delete this.rebroadcastTimer;
      this.logger.debug('Stopped discovery request rebroadcast');
    }
  }

  /**
   * Sends the discovery complete message.
   * Called automatically when transitioning from DISCOVERING to COMPLETED.
   * @private
   */
  private sendDiscoveryComplete(metadata?: Record<string, unknown>): void {
    // Determine completion reason from metadata
    let reason: DiscoveryCompleteEvent['reason'] = 'timeout';

    if (metadata?.['reason']) {
      switch (metadata['reason']) {
        case 'timeout':
          reason = 'timeout';
          break;
        case 'manual-stop':
        case 'discovery-stopped':
          reason = 'manual-stop';
          break;
        case 'max-responders':
          reason = 'max-responders';
          break;
        default:
          reason = 'timeout';
      }
    }

    // Get responder count from metadata if available
    const respondersFound = (metadata?.['respondersFound'] as number) ?? 0;

    const completeEvent: DiscoveryCompleteEvent = {
      type: DISCOVERY_EVENTS.COMPLETE,
      version: DISCOVERY_PROTOCOL_VERSION,
      sessionId: this.config.sessionId,
      reason,
      respondersFound,
    };

    const event = new CustomEvent(DISCOVERY_EVENTS.COMPLETE, {
      detail: completeEvent,
    });

    try {
      this.eventTarget.dispatchEvent(event);
    } catch (error) {
      this.logger.error('Failed to dispatch discovery message:', error);
      this.emit('error', error as Error, 'COMPLETED');
    }
  }

  /**
   * Sends the discovery error message.
   * Called automatically when transitioning from DISCOVERING to ERROR.
   * @private
   */
  private sendDiscoveryError(metadata?: Record<string, unknown>): void {
    // Extract error details from metadata
    const errorCode = (metadata?.['errorCode'] as number) ?? 5001;
    const errorMessage = (metadata?.['errorMessage'] as string) ?? 'Discovery failed';
    const errorCategory = (metadata?.['errorCategory'] as DiscoveryErrorEvent['errorCategory']) ?? 'internal';

    const errorEvent: DiscoveryErrorEvent = {
      type: DISCOVERY_EVENTS.ERROR,
      version: DISCOVERY_PROTOCOL_VERSION,
      sessionId: this.config.sessionId,
      errorCode,
      errorMessage,
      errorCategory,
    };

    const event = new CustomEvent(DISCOVERY_EVENTS.ERROR, {
      detail: errorEvent,
    });

    try {
      this.eventTarget.dispatchEvent(event);
    } catch (error) {
      this.logger.error('Failed to dispatch discovery message:', error);
      this.emit('error', error as Error, 'ERROR');
    }
  }

  /**
   * Get the current session ID.
   *
   * @returns The session ID for this discovery session
   */
  getSessionId(): string {
    return this.config.sessionId;
  }

  /**
   * Update the configuration for the state machine.
   * Note: This does not affect messages already sent.
   *
   * @param updates - Partial configuration updates
   */
  updateConfig(updates: Partial<Omit<InitiatorStateMachineConfig, 'sessionId'>>): void {
    // Session ID cannot be changed
    Object.assign(this.config, updates);
  }

  /**
   * Dispose of the state machine and clean up resources.
   * Stops rebroadcasting and calls parent dispose.
   */
  override dispose(): void {
    this.stopRebroadcasting();
    delete this.discoveryRequest;
    super.dispose();
  }
}

/**
 * Create an initiator state machine with automatic message dispatch.
 *
 * @param config - Configuration for the state machine
 * @returns Configured InitiatorStateMachine instance
 *
 * @example
 * ```typescript
 * const stateMachine = createInitiatorStateMachine({
 *   sessionId: crypto.randomUUID(),
 *   origin: window.location.origin,
 *   initiatorInfo: { ... },
 *   requirements: { ... },
 *   timeouts: {
 *     DISCOVERING: 5000 // 5 second timeout
 *   }
 * });
 * ```
 *
 * @category State Machine
 * @since 0.2.0
 */
export function createInitiatorStateMachine(config: InitiatorStateMachineConfig): InitiatorStateMachine {
  return new InitiatorStateMachine(config);
}
