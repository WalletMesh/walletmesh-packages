import { EventEmitter } from '../utils/EventEmitter.js';

/**
 * Protocol states as defined in the specification.
 *
 * Discovery protocol uses a 4-state model with error handling:
 * - IDLE: No active discovery session
 * - DISCOVERING: Collecting responder announcements
 * - COMPLETED: Discovery finished, responders collected
 * - ERROR: Discovery failed due to security violations or protocol errors
 *
 * @category State Machine
 * @since 0.2.0
 */
export type ProtocolState = 'IDLE' | 'DISCOVERING' | 'COMPLETED' | 'ERROR';

/**
 * State transition events.
 *
 * @category State Machine
 * @since 0.2.0
 */
export interface StateTransitionEvent {
  fromState: ProtocolState;
  toState: ProtocolState;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

/**
 * State machine event map.
 *
 * @category State Machine
 * @since 0.2.0
 */
export interface StateMachineEvents {
  stateChange: (event: StateTransitionEvent) => void;
  timeout: (state: ProtocolState) => void;
  error: (error: Error, state: ProtocolState) => void;
}

/**
 * State timeout configuration.
 *
 * @category State Machine
 * @since 0.2.0
 */
export interface StateTimeouts {
  DISCOVERING: number;
}

/**
 * Protocol timeout values (in milliseconds).
 *
 * @category State Machine
 * @since 0.2.0
 */
export const PROTOCOL_TIMEOUTS: StateTimeouts = {
  DISCOVERING: 3000, // 3 seconds for discovery
};

/**
 * Valid state transitions as defined in the protocol specification.
 *
 * Updated for single-use session pattern where COMPLETED and ERROR are terminal states.
 * Each discovery session is valid for only one discovery cycle and cannot be reused.
 *
 * @category State Machine
 * @since 0.2.0
 */
const VALID_TRANSITIONS: Record<ProtocolState, ProtocolState[]> = {
  IDLE: ['DISCOVERING'],
  DISCOVERING: ['COMPLETED', 'ERROR'],
  COMPLETED: [], // Terminal state - no transitions allowed
  ERROR: [], // Terminal state - no transitions allowed
};

/**
 * Formal protocol state machine implementation.
 *
 * Implements the 4-state machine as defined in the WalletMesh discovery protocol specification
 * with single-use session semantics. This state machine ensures proper protocol flow and prevents
 * invalid state transitions, providing a robust foundation for the discovery lifecycle with
 * comprehensive error handling.
 *
 * ## Single-Use Session Pattern
 * Each state machine instance is valid for exactly one discovery session. Once the session
 * reaches a terminal state (COMPLETED or ERROR), it cannot be reused. Applications must
 * create new instances for subsequent discovery sessions.
 *
 * ## States
 * - **IDLE**: Initial state, waiting for discovery to begin
 * - **DISCOVERING**: Active discovery session, responders being collected
 * - **COMPLETED**: Discovery finished, responders collected (TERMINAL)
 * - **ERROR**: Discovery failed due to security violations or protocol errors (TERMINAL)
 *
 * ## Features
 * - **Single-use sessions**: Each instance handles exactly one discovery cycle
 * - **State transition validation**: Prevents invalid state transitions according to protocol rules
 * - **Timeout management**: Configurable timeouts per state with automatic cleanup
 * - **Event emission**: Rich event system for state changes, timeouts, and errors
 * - **Transition guards**: Enforces valid state transitions only
 * - **State metadata**: Stores contextual data for each state
 * - **Resource cleanup**: Proper disposal and cleanup mechanisms
 * - **Error handling**: Transitions to ERROR state for security violations and protocol errors
 *
 * ## State Transitions (Single-Use Pattern)
 * ```
 * IDLE ─────────► DISCOVERING ─────────► COMPLETED (TERMINAL)
 *                      │
 *                      ▼
 *                   ERROR (TERMINAL)
 * ```
 *
 * @example Single-use session pattern
 * ```typescript
 * // Create state machine for first discovery
 * const stateMachine = new ProtocolStateMachine();
 *
 * // Listen for state changes
 * stateMachine.on('stateChange', (event) => {
 *   console.log(`State: ${event.fromState} → ${event.toState}`);
 * });
 *
 * // Listen for timeouts
 * stateMachine.on('timeout', (state) => {
 *   console.log(`State ${state} timed out`);
 * });
 *
 * // Start discovery
 * stateMachine.transition('DISCOVERING');
 *
 * // Discovery completes (terminal state)
 * stateMachine.transition('COMPLETED');
 *
 * // For new discovery, create a new instance
 * const newStateMachine = new ProtocolStateMachine();
 * newStateMachine.transition('DISCOVERING');
 * ```
 *
 * @example With custom timeouts
 * ```typescript
 * const stateMachine = new ProtocolStateMachine({
 *   DISCOVERING: 5000,  // 5 seconds
 * });
 * ```
 *
 * @example Error handling
 * ```typescript
 * try {
 *   // Invalid transition
 *   stateMachine.transition('COMPLETED');
 * } catch (error) {
 *   console.error('Invalid transition:', error.message);
 * }
 * ```
 *
 * @category Protocol
 * @since 0.2.0
 * @see {@link StateTransitionEvent} for event payloads
 * @see {@link StateTimeouts} for timeout configuration
 */
export class ProtocolStateMachine extends EventEmitter {
  private currentState: ProtocolState = 'IDLE';
  private stateTimeout: ReturnType<typeof setTimeout> | undefined;
  private readonly timeouts: StateTimeouts;
  private stateMetadata: Map<ProtocolState, Record<string, unknown>> = new Map();

  /**
   * Creates a new protocol state machine instance.
   *
   * @param timeouts - Custom timeout configuration for each state
   * @param timeouts.DISCOVERING - Timeout for DISCOVERING state in milliseconds
   *
   * @example With default timeouts
   * ```typescript
   * const stateMachine = new ProtocolStateMachine();
   * ```
   *
   * @example With custom timeouts
   * ```typescript
   * const stateMachine = new ProtocolStateMachine({
   *   DISCOVERING: 10000, // 10 seconds
   * });
   * ```
   */
  constructor(timeouts: Partial<StateTimeouts> = {}) {
    super();
    this.timeouts = { ...PROTOCOL_TIMEOUTS, ...timeouts };
  }

  /**
   * Get the current state of the state machine.
   *
   * @returns The current protocol state
   *
   * @example
   * ```typescript
   * const currentState = stateMachine.getState();
   * console.log(`Current state: ${currentState}`);
   * ```
   */
  getState(): ProtocolState {
    return this.currentState;
  }

  /**
   * Check if a transition to the target state is valid from the current state.
   *
   * This method validates transitions according to the protocol state transition rules
   * without actually performing the transition.
   *
   * @param toState - The target state to check
   * @returns `true` if the transition is valid, `false` otherwise
   *
   * @example
   * ```typescript
   * if (stateMachine.canTransition('DISCOVERING')) {
   *   stateMachine.transition('DISCOVERING');
   * } else {
   *   console.log('Cannot start discovery from current state');
   * }
   * ```
   *
   * @see Valid transitions: IDLE→DISCOVERING, DISCOVERING→COMPLETED/ERROR
   */
  canTransition(toState: ProtocolState): boolean {
    // Enhanced validation
    if (!toState || typeof toState !== 'string') {
      return false;
    }

    if (!(['IDLE', 'DISCOVERING', 'COMPLETED', 'ERROR'] as const).includes(toState as ProtocolState)) {
      return false;
    }

    const validTransitions = VALID_TRANSITIONS[this.currentState];
    return validTransitions.includes(toState);
  }

  /**
   * Transition to a new state with optional metadata.
   *
   * Performs a state transition if valid, updating the current state, setting up
   * timeouts, and emitting a state change event. Invalid transitions throw an error.
   *
   * @param toState - The target state to transition to
   * @param metadata - Optional metadata to associate with the new state
   * @throws {Error} If the transition is not valid from the current state
   *
   * @example Basic transition
   * ```typescript
   * // Start discovery
   * stateMachine.transition('DISCOVERING');
   * ```
   *
   * @example Transition with metadata
   * ```typescript
   * // Transition to connecting with responder info
   * stateMachine.transition('CONNECTING', {
   *   responderId: 'wallet-123',
   *   walletName: 'Example Wallet',
   *   timestamp: Date.now()
   * });
   * ```
   *
   * @example Error handling
   * ```typescript
   * try {
   *   stateMachine.transition('CONNECTED');
   * } catch (error) {
   *   console.error('Invalid transition:', error.message);
   *   // Handle invalid transition
   * }
   * ```
   *
   * Emits 'stateChange' event when the transition completes successfully
   * @see {@link canTransition} to check validity before transitioning
   */
  transition(toState: ProtocolState, metadata?: Record<string, unknown>): void {
    // Enhanced validation
    if (!toState || typeof toState !== 'string') {
      throw new Error('Target state must be a valid string');
    }

    if (!(['IDLE', 'DISCOVERING', 'COMPLETED', 'ERROR'] as const).includes(toState as ProtocolState)) {
      throw new Error(`Unknown state: ${toState}. Valid states: IDLE, DISCOVERING, COMPLETED, ERROR`);
    }

    if (!this.canTransition(toState)) {
      throw new Error(
        `Invalid state transition from ${this.currentState} to ${toState}. ` +
          `Valid transitions: ${VALID_TRANSITIONS[this.currentState].join(', ')}`,
      );
    }

    // Validate metadata if provided
    if (
      metadata &&
      (typeof metadata !== 'object' ||
        Array.isArray(metadata) ||
        metadata instanceof Date ||
        metadata.constructor !== Object)
    ) {
      throw new Error('Metadata must be a plain object');
    }

    const fromState = this.currentState;
    const timestamp = Date.now();

    try {
      // Clear existing timeout
      this.clearStateTimeout();

      // Update state
      this.currentState = toState;

      // Store metadata for the new state
      if (metadata) {
        // Create a defensive copy to prevent external mutation
        this.stateMetadata.set(toState, { ...metadata });
      }

      // Set timeout for the new state
      this.setStateTimeout(toState);

      // Emit state change event
      super.emit('stateChange', {
        fromState,
        toState,
        timestamp,
        ...(metadata && { metadata: { ...metadata } }), // Defensive copy in event
      });
    } catch (error) {
      // If transition fails, ensure we're in a consistent state
      this.currentState = fromState;
      this.setStateTimeout(fromState);

      const enhancedError = new Error(
        `State transition failed from ${fromState} to ${toState}: ${error instanceof Error ? error.message : String(error)}`,
      );

      super.emit('error', enhancedError, fromState);
      throw enhancedError;
    }
  }

  /**
   * Get metadata associated with the current state.
   *
   * Retrieves any metadata that was provided during the transition to the current state.
   * Useful for accessing context-specific information like responder IDs or connection details.
   *
   * @returns The metadata object for the current state, or `undefined` if no metadata exists
   *
   * @example
   * ```typescript
   * // After transitioning with metadata
   * stateMachine.transition('CONNECTING', { responderId: 'wallet-123' });
   *
   * // Later, retrieve the metadata
   * const metadata = stateMachine.getStateMetadata();
   * console.log('Connecting to:', metadata?.responderId);
   * ```
   */
  getStateMetadata(): Record<string, unknown> | undefined {
    return this.stateMetadata.get(this.currentState);
  }

  /**
   * Check if the state machine is currently in a specific state.
   *
   * Convenience method for checking the current state without needing to
   * call `getState()` and compare manually.
   *
   * @param state - The state to check against
   * @returns `true` if currently in the specified state, `false` otherwise
   *
   * @example
   * ```typescript
   * if (stateMachine.isInState('DISCOVERING')) {
   *   console.log('Discovery in progress...');
   * }
   *
   * // Check multiple states
   * const isActive = stateMachine.isInState('DISCOVERING') ||
   *                  stateMachine.isInState('CONNECTING');
   * ```
   */
  isInState(state: ProtocolState): boolean {
    return this.currentState === state;
  }

  /**
   * Dispose of the state machine and cleanup all resources.
   *
   * Clears all timeouts, removes all event listeners, and clears state metadata.
   * Should be called when the state machine is no longer needed to prevent
   * memory leaks and ensure proper cleanup.
   *
   * @example
   * ```typescript
   * // In component cleanup
   * componentWillUnmount() {
   *   this.stateMachine.dispose();
   * }
   *
   * // Or in async cleanup
   * async function cleanup() {
   *   stateMachine.dispose();
   *   await otherCleanup();
   * }
   * ```
   */
  dispose(): void {
    this.clearStateTimeout();
    this.removeAllListeners();
    this.stateMetadata.clear();
  }

  /**
   * Set timeout for a state transition.
   *
   * Configures automatic timeout handling for states that have timeout values defined.
   * When a timeout occurs, the state machine automatically transitions to IDLE and
   * emits a timeout event.
   *
   * @param state - The state to set timeout for
   * @private
   */
  private setStateTimeout(state: ProtocolState): void {
    // Only set timeouts for states that have them configured
    const timeout = this.timeouts[state as keyof StateTimeouts];

    if (timeout && state !== 'IDLE') {
      this.stateTimeout = setTimeout(() => {
        // Check if state machine is still in the same state and not disposed
        if (this.currentState === state && this.stateTimeout !== undefined) {
          super.emit('timeout', state);

          // In single-use session pattern, timeout transitions to ERROR state
          try {
            if (state === 'DISCOVERING') {
              // Discovery timeout - transition to COMPLETED instead of ERROR
              // This allows normal completion with whatever responders were found
              this.transition('COMPLETED', { reason: 'timeout' });
            }
          } catch (error) {
            super.emit('error', error as Error, state);
          }
        }
        // If state has changed or timeout was cleared, silently ignore
      }, timeout);
    }
  }

  /**
   * Clear the current state timeout if one exists.
   *
   * Ensures that timeouts are properly cleaned up during state transitions
   * or when the state machine is disposed.
   *
   * @private
   */
  private clearStateTimeout(): void {
    if (this.stateTimeout !== undefined) {
      clearTimeout(this.stateTimeout);
      this.stateTimeout = undefined;
    }
  }
}

/**
 * Create a protocol state machine with custom configuration.
 *
 * @param timeouts - Custom timeout configuration
 * @returns Configured state machine instance
 *
 * @example
 * ```typescript
 * const stateMachine = createProtocolStateMachine({
 *   DISCOVERING: 5000,  // 5 seconds
 *   CONNECTING: 60000,  // 1 minute
 * });
 * ```
 *
 * @category State Machine
 * @since 0.2.0
 */
export function createProtocolStateMachine(timeouts?: Partial<StateTimeouts>): ProtocolStateMachine {
  return new ProtocolStateMachine(timeouts);
}
