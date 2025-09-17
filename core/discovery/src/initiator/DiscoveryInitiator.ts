import type {
  DiscoveryResponseEvent,
  DiscoveryResponseEventHandler,
  DuplicateResponseDetails,
} from '../types/core.js';
import { DuplicateResponseError } from '../types/core.js';
import type { QualifiedResponder } from '../types/capabilities.js';
import type { DiscoveryInitiatorConfig } from '../types/testing.js';
import { DISCOVERY_EVENTS, DISCOVERY_CONFIG, DISCOVERY_PROTOCOL_VERSION } from '../core/constants.js';
import { validateOrigin } from '../security.js';
import type { StateTransitionEvent } from '../core/ProtocolStateMachine.js';
import { type Logger, defaultLogger } from '../core/logger.js';
import { createInitiatorStateMachine, type InitiatorStateMachine } from './InitiatorStateMachine.js';

/**
 * Discovery listener for initiators to discover and connect to qualified responders.
 *
 * Implements the capability-first discovery model where initiators broadcast their
 * capability requirements and only responders that can fulfill ALL requirements
 * respond. This preserves responder privacy by avoiding enumeration.
 *
 * Features:
 * - Privacy-preserving: Only qualified responders respond
 * - Secure: Origin validation and session management
 * - Efficient: Timeout-based discovery with configurable limits
 * - Type-safe: Comprehensive TypeScript support
 *
 * @example Basic usage:
 * ```typescript
 * const listener = new DiscoveryInitiator({
 *   requirements: {
 *     chains: ['eip155:1'],
 *     features: ['account-management', 'transaction-signing'],
 *     interfaces: ['eip-1193']
 *   },
 *   initiatorInfo: {
 *     name: 'My DeFi App',
 *     url: 'https://myapp.com',
 *     icon: 'data:image/svg+xml;base64,...'
 *   },
 *   timeout: 5000
 * });
 *
 * const responders = await listener.startDiscovery();
 * console.log(`Found ${responders.length} qualified responders`);
 * ```
 *
 * @example With preferences:
 * ```typescript
 * const listener = new DiscoveryInitiator({
 *   requirements: {
 *     chains: ['eip155:1'],
 *     features: ['account-management'],
 *     interfaces: ['eip-1193']
 *   },
 *   preferences: {
 *     features: ['hardware-wallet', 'batch-transactions']
 *   },
 *   dappInfo: { } // dApp info
 * });
 * ```
 *
 * @category Discovery
 * @since 0.1.0
 * @see {@link DiscoveryResponder} for wallet-side implementation
 * @see Connection handling is done by higher-level libraries (modal-core, modal-react)
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
  private seenResponders = new Map<string, number>(); // Track responder rdns -> response count
  private firstResponses = new Map<string, DiscoveryResponseEvent>(); // Track first response per rdns
  private logger: Logger;

  constructor(config: DiscoveryInitiatorConfig) {
    this.config = config;
    this.eventTarget = config.eventTarget ?? (typeof window !== 'undefined' ? window : new EventTarget());
    this.logger = config.logger ?? defaultLogger;

    // State machine will be created when discovery starts
    // This ensures we have a fresh session ID for each discovery

    // State machine event handlers will be set up when created

    // Bind the response handler
    this.responseHandler = this.handleDiscoveryResponse.bind(this);
  }

  /**
   * Start discovery process by broadcasting capability requirements.
   *
   * Initiates the capability-first discovery process:
   * 1. Generates unique session ID for replay protection
   * 2. Broadcasts discovery request to all listening wallets
   * 3. Collects responses from qualified wallets
   * 4. Returns list of wallets that can fulfill ALL requirements
   *
   * @returns Promise that resolves to array of qualified wallets
   * @throws {Error} If discovery is already in progress
   * @throws {Error} If origin validation fails (in secure environments)
   *
   * @example
   * ```typescript
   * try {
   *   const wallets = await listener.startDiscovery();
   *
   *   if (wallets.length === 0) {
   *     console.log('No qualified wallets found');
   *   } else {
   *     console.log('Available wallets:', wallets.map(w => w.name));
   *   }
   * } catch (error) {
   *   logger.error('Discovery failed:', error.message);
   * }
   * ```
   *
   * @category Discovery
   * @since 0.1.0
   */
  async startDiscovery(): Promise<QualifiedResponder[]> {
    // Check if we already have a state machine (reuse prevention)
    if (this.stateMachine) {
      const currentState = this.stateMachine.getState();
      if (currentState === 'COMPLETED' || currentState === 'ERROR') {
        throw new Error(
          `Cannot reuse discovery session in ${currentState} state. Create a new DiscoveryInitiator instance for each discovery session.`,
        );
      }
      if (currentState === 'DISCOVERING') {
        throw new Error('Discovery is already in progress');
      }
    }

    // Clear previous state
    this.qualifiedWallets.clear();
    this.seenResponders.clear();
    this.firstResponses.clear();
    this.sessionId = crypto.randomUUID();

    // Create new state machine for this discovery session
    this.stateMachine = createInitiatorStateMachine({
      eventTarget: this.eventTarget,
      sessionId: this.sessionId,
      origin: this.getOrigin(),
      initiatorInfo: this.config.initiatorInfo,
      requirements: this.config.requirements,
      ...(this.config.preferences && { preferences: this.config.preferences }),
      timeouts: {
        DISCOVERING: this.config.timeout ?? DISCOVERY_CONFIG.DISCOVERY_TIMEOUT_MS,
      },
    });

    // Set up state machine event handlers
    this.setupStateMachineHandlers();

    // Transition to DISCOVERING state - this will automatically send the discovery request
    this.stateMachine.transition('DISCOVERING');

    try {
      // Start listening for responses
      this.startListening();

      // Wait for responses (discovery request was already sent by state machine)
      return await this.waitForResponses();
    } catch (error) {
      // Categorize and handle different types of errors
      const enhancedError = this.enhanceError(error);

      // In single-use session pattern, transition to ERROR state for non-security errors
      // Security errors (like DuplicateResponseError) are already in ERROR state
      if (!(enhancedError instanceof DuplicateResponseError) && this.stateMachine?.canTransition('ERROR')) {
        try {
          this.stateMachine.transition('ERROR', {
            errorCode: 5001,
            errorMessage: enhancedError.message,
            errorCategory: 'internal',
          });
        } catch (transitionError) {
          // If transition fails, continue with error handling
          this.logger.warn('Failed to transition to ERROR state:', transitionError);
        }
      }
      throw enhancedError;
    } finally {
      this.stopListening();

      // If promise is still pending (e.g., state machine was externally reset), resolve it
      if (this.discoveryResolver) {
        this.discoveryResolver(this.getQualifiedResponders());
        this.discoveryResolver = null;
        this.discoveryRejecter = null;
      }

      // Transition to COMPLETED state if still discovering (single-use session pattern)
      if (this.stateMachine?.isInState('DISCOVERING')) {
        try {
          this.stateMachine.transition('COMPLETED', {
            reason: 'timeout',
            respondersFound: this.qualifiedWallets.size,
          });
        } catch (transitionError) {
          // If transition fails, log but don't throw (we're in finally block)
          this.logger.warn('Failed to transition to COMPLETED state:', transitionError);
        }
      }
      // Note: Both ERROR and COMPLETED states are terminal in single-use session pattern
    }
  }

  /**
   * Stop the current discovery process.
   *
   * Immediately terminates discovery, clears timeouts, and returns
   * any wallets found so far. Safe to call multiple times.
   *
   * @example
   * ```typescript
   * // Start discovery with timeout
   * const discoveryPromise = listener.startDiscovery();
   *
   * // Stop early if needed
   * setTimeout(() => {
   *   listener.stopDiscovery();
   * }, 2000);
   *
   * const wallets = await discoveryPromise;
   * ```
   *
   * @category Discovery
   * @since 0.1.0
   */
  stopDiscovery(): void {
    // Resolve the discovery promise if it's waiting
    if (this.discoveryResolver) {
      this.discoveryResolver(this.getQualifiedResponders());
      this.discoveryResolver = null;
    }
    this.discoveryRejecter = null;

    this.stopListening();

    // In single-use session pattern, we don't reset to IDLE
    // Terminal states (COMPLETED/ERROR) remain as is, indicating session is done
    // Only transition to COMPLETED if we're still discovering
    if (this.stateMachine?.isInState('DISCOVERING')) {
      try {
        this.stateMachine.transition('COMPLETED', {
          reason: 'manual-stop',
          respondersFound: this.qualifiedWallets.size,
        });
      } catch (transitionError) {
        this.logger.warn('Failed to transition to COMPLETED state on stop:', transitionError);
      }
    }

    this.sessionId = null;
    this.seenResponders.clear();
    this.firstResponses.clear();
  }

  /**
   * Get the list of qualified wallets from the last discovery.
   *
   * Returns a defensive copy of the qualified wallets array.
   * Results are preserved until the next discovery starts.
   *
   * @returns Array of qualified wallets (defensive copy)
   *
   * @example
   * ```typescript
   * await listener.startDiscovery();
   *
   * const wallets = listener.getQualifiedResponders();
   * wallets.forEach(wallet => {
   *   logger.info(`${wallet.name}: ${wallet.matched.required.technologies.map(t => t.type).join(', ')}`);
   * });
   * ```
   *
   * @category Discovery
   * @since 0.1.0
   */
  getQualifiedResponders(): QualifiedResponder[] {
    return Array.from(this.qualifiedWallets.values());
  }

  /**
   * Get a specific qualified responder by its ID.
   *
   * Retrieves a responder from the last discovery results using its
   * ephemeral responder ID. Returns undefined if not found.
   *
   * @param responderId - The responder ID to look up
   * @returns The qualified responder if found, undefined otherwise
   */
  getQualifiedResponder(responderId: string): QualifiedResponder | undefined {
    return this.qualifiedWallets.get(responderId);
  }

  /**
   * Check if discovery is currently in progress.
   *
   * Returns true between startDiscovery() call and completion/termination.
   * Useful for UI state management and preventing concurrent discoveries.
   *
   * @returns True if discovery is active, false otherwise
   *
   * @example
   * ```typescript
   * if (!listener.isDiscovering()) {
   *   await listener.startDiscovery();
   * } else {
   *   logger.info('Discovery already in progress...');
   * }
   * ```
   *
   * @category Discovery
   * @since 0.1.0
   */
  isDiscovering(): boolean {
    return this.stateMachine?.isInState('DISCOVERING') ?? false;
  }

  /**
   * Get the current session ID.
   */
  getCurrentSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Update the discovery configuration.
   */
  updateConfig(config: Partial<DiscoveryInitiatorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get discovery statistics.
   */
  getStats() {
    return {
      currentState: this.stateMachine?.getState() ?? 'IDLE',
      sessionId: this.sessionId,
      qualifiedWalletsCount: this.qualifiedWallets.size,
      qualifiedWallets: this.getQualifiedResponders(),
      securityStats: {
        seenRespondersCount: this.seenResponders.size,
        duplicateResponses: Array.from(this.seenResponders.entries())
          .filter(([, count]) => count > 1)
          .map(([rdns, count]) => ({ rdns, count })),
      },
      config: {
        timeout: this.config.timeout ?? DISCOVERY_CONFIG.DISCOVERY_TIMEOUT_MS,
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
   * Get the current protocol state.
   */
  getState() {
    return this.stateMachine?.getState() ?? 'IDLE';
  }

  /**
   * Set up state machine event handlers.
   * @private
   */
  private setupStateMachineHandlers(): void {
    if (!this.stateMachine) {
      throw new Error('State machine not initialized');
    }

    // Handle state machine timeouts
    this.stateMachine.on('timeout', (state) => {
      if (state === 'DISCOVERING' && this.stateMachine?.getState() === 'DISCOVERING') {
        // Only handle timeout if we're still in DISCOVERING state
        this.handleDiscoveryTimeout();
      }
    });

    // Handle state transitions to resolve discovery promise
    this.stateMachine.on('stateChange', (event) => {
      const stateEvent = event as StateTransitionEvent;
      if (stateEvent.fromState === 'DISCOVERING' && stateEvent.toState === 'COMPLETED') {
        // Discovery completed successfully - resolve with results
        this.handleDiscoveryCompletion();
      }
      // Note: ERROR state transitions are handled by the duplicate detection code
      // which rejects the promise directly
    });

    // Handle errors from the state machine
    this.stateMachine.on('error', (error) => {
      this.logger.error('State machine error:', error);
    });
  }

  /**
   * Wait for discovery responses from wallets.
   * Uses state machine timeout instead of manual timeout to avoid race conditions.
   */
  private async waitForResponses(): Promise<QualifiedResponder[]> {
    return new Promise((resolve, reject) => {
      this.discoveryResolver = resolve;
      this.discoveryRejecter = reject;
      // Note: Timeout is handled by the state machine, not manually here
    });
  }

  /**
   * Start listening for discovery responses.
   */
  private startListening(): void {
    this.eventTarget.addEventListener(DISCOVERY_EVENTS.RESPONSE, this.responseHandler as EventListener);
  }

  /**
   * Enhance error with additional context and categorization.
   *
   * @param error - The original error
   * @returns Enhanced error with additional context
   */
  private enhanceError(error: unknown): Error {
    // Don't enhance DuplicateResponseError - it's already properly structured
    if (error instanceof DuplicateResponseError) {
      return error;
    }

    const originalMessage = error instanceof Error ? error.message : String(error);

    // Categorize common discovery errors
    if (originalMessage.includes('Origin validation failed')) {
      return new Error(
        `Discovery failed: Invalid origin. Ensure your application is served from an allowed origin. Original error: ${originalMessage}`,
      );
    }

    if (originalMessage.includes('No active session')) {
      return new Error(
        `Discovery failed: Session management error. This might be due to concurrent discovery attempts. Original error: ${originalMessage}`,
      );
    }

    if (originalMessage.includes('Cannot start discovery from state')) {
      return new Error(
        `Discovery failed: Discovery is already in progress or in an invalid state. Wait for the current discovery to complete or call stopDiscovery() first. Original error: ${originalMessage}`,
      );
    }

    if (originalMessage.includes('timeout') || originalMessage.includes('Timeout')) {
      return new Error(
        `Discovery failed: Discovery timed out after ${this.config.timeout || 3000}ms. No qualifying wallets responded within the timeout period. Original error: ${originalMessage}`,
      );
    }

    // Generic enhancement for other errors
    return new Error(
      `Discovery failed: ${originalMessage}. Check that wallets are installed and enabled, and that your discovery configuration is correct.`,
    );
  }

  /**
   * Stop listening for discovery responses.
   */
  private stopListening(): void {
    this.eventTarget.removeEventListener(DISCOVERY_EVENTS.RESPONSE, this.responseHandler as EventListener);
  }

  /**
   * Handle discovery response from a wallet.
   */
  private handleDiscoveryResponse(event: CustomEvent<DiscoveryResponseEvent> | MessageEvent): void {
    try {
      // Support both CustomEvent (detail) and MessageEvent (data)
      const response = 'detail' in event ? event.detail : event.data;

      // Validate response
      if (!this.isValidResponse(response)) {
        return;
      }

      // Check if this is for our current session
      if (response.sessionId !== this.sessionId) {
        return; // Not for us
      }

      // Validate origin if security policy is configured
      if (this.config.securityPolicy && event instanceof MessageEvent) {
        const validation = validateOrigin(event.origin, this.config.securityPolicy);
        if (!validation.valid) {
          this.logger.warn('Discovery response from invalid origin:', event.origin);
          return;
        }
      }

      // Check for duplicate responses from the same responder
      const responseCount = this.seenResponders.get(response.rdns) || 0;
      if (responseCount > 0) {
        // Duplicate response detected - this is a security violation
        const firstResponse = this.firstResponses.get(response.rdns);
        if (!firstResponse) {
          this.logger.error('Internal error: First response not tracked for duplicate detection');
          return;
        }

        // Create detailed duplicate response information
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

        // Log security violation
        this.logger.warn('SECURITY VIOLATION: Duplicate response detected', duplicateDetails);

        // Create and throw DuplicateResponseError to transition to ERROR state
        const error = new DuplicateResponseError(duplicateDetails);

        // Transition to ERROR state
        if (this.stateMachine) {
          try {
            this.stateMachine.transition('ERROR', {
              errorCode: error.code,
              errorMessage: error.message,
              errorCategory: error.category,
            });
          } catch (transitionError) {
            this.logger.error('Failed to transition to ERROR state:', transitionError);
          }

          // Emit error event for handlers
          this.stateMachine.emit('error', error, 'DISCOVERING');
        }

        // Clear all collected responders (session is now invalid)
        this.qualifiedWallets.clear();

        // Reject discovery with error (discovery has failed)
        if (this.discoveryRejecter) {
          const rejecter = this.discoveryRejecter;
          this.discoveryResolver = null;
          this.discoveryRejecter = null;
          rejecter(error);
        }

        return; // Stop processing this response
      }

      // Track this responder response (first response)
      this.seenResponders.set(response.rdns, responseCount + 1);
      this.firstResponses.set(response.rdns, response);

      // Create qualified wallet entry
      const qualifiedWallet: QualifiedResponder = {
        responderId: response.responderId,
        rdns: response.rdns,
        name: response.name,
        icon: response.icon,
        matched: response.matched,
        // Include transport configuration if provided
        ...(response.transportConfig && {
          transportConfig: response.transportConfig,
        }),
        metadata: {
          version: response.responderVersion,
          description: response.description,
        },
      };

      // Store the qualified wallet
      this.qualifiedWallets.set(response.responderId, qualifiedWallet);
    } catch (error) {
      this.logger.warn('Error processing discovery response:', error);
    }
  }

  /**
   * Validate a discovery response message.
   *
   * Performs comprehensive validation of incoming discovery responses to ensure
   * they meet protocol requirements and security standards. This validation
   * prevents malformed or malicious responses from being processed.
   *
   * @param response - The discovery response to validate
   * @returns `true` if response is valid, `false` otherwise
   *
   * @remarks
   * Validation checks include:
   * - Required field presence (type, version, sessionId, etc.)
   * - Message type correctness
   * - Protocol version compatibility
   * - RDNS format validation
   * - Icon data URI format
   *
   * Invalid responses are silently discarded to prevent protocol pollution.
   *
   * @internal
   * @category Validation
   * @since 0.1.0
   */
  private isValidResponse(response: DiscoveryResponseEvent): boolean {
    // Check required fields
    if (
      !response.type ||
      !response.version ||
      !response.sessionId ||
      !response.responderId ||
      !response.rdns ||
      !response.name ||
      !response.icon ||
      !response.matched
    ) {
      return false;
    }

    // Check message type
    if (response.type !== DISCOVERY_EVENTS.RESPONSE) {
      return false;
    }

    // Check protocol version compatibility
    if (response.version !== DISCOVERY_PROTOCOL_VERSION) {
      this.logger.warn(
        `Protocol version mismatch: expected ${DISCOVERY_PROTOCOL_VERSION}, got ${response.version}`,
      );
      return false;
    }

    // Validate RDNS format
    if (!this.isValidRDNS(response.rdns)) {
      return false;
    }

    // Validate icon format (should be data URI)
    if (!response.icon.startsWith('data:')) {
      return false;
    }

    return true;
  }

  /**
   * Validate RDNS (Reverse Domain Name System) format.
   *
   * Ensures that responder RDNS identifiers follow the correct reverse
   * domain notation format (e.g., 'com.example.wallet'). This validation
   * helps prevent impersonation and ensures consistent identifier format.
   *
   * @param rdns - The RDNS string to validate
   * @returns `true` if RDNS format is valid, `false` otherwise
   *
   * @remarks
   * Validation rules:
   * - Must follow reverse domain notation (letters, numbers, dots, hyphens)
   * - Each component must start and end with alphanumeric characters
   * - Total length must be 1-253 characters
   * - Must contain at least one dot separator
   *
   * @example Valid RDNS formats
   * ```
   * "com.example.wallet"     // ✓ Valid
   * "org.ethereum.metamask"  // ✓ Valid
   * "co.phantom"             // ✓ Valid
   * ```
   *
   * @example Invalid RDNS formats
   * ```
   * "wallet"                 // ✗ No domain
   * "com..example"           // ✗ Double dot
   * "-com.example"           // ✗ Starts with hyphen
   * ```
   *
   * @internal
   * @category Validation
   * @since 0.1.0
   */
  private isValidRDNS(rdns: string): boolean {
    // Basic RDNS validation: should be reverse domain notation
    const rdnsPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;
    return rdnsPattern.test(rdns) && rdns.length > 0 && rdns.length <= 253;
  }

  /**
   * Get the current origin.
   */
  private getOrigin(): string {
    if (typeof window !== 'undefined' && window.location) {
      return window.location.origin;
    }

    // Use configured origin from initiatorInfo if available
    if (this.config.initiatorInfo.url) {
      try {
        return new URL(this.config.initiatorInfo.url).origin;
      } catch {
        // Fallback if URL is invalid
      }
    }

    // Fallback for non-browser environments
    return 'http://localhost:3000';
  }

  /**
   * Handle discovery timeout from state machine.
   */
  private handleDiscoveryTimeout(): void {
    if (this.discoveryResolver) {
      this.discoveryResolver(this.getQualifiedResponders());
      this.discoveryResolver = null;
    }
    this.discoveryRejecter = null;
  }

  /**
   * Handle discovery completion from state transition.
   */
  private handleDiscoveryCompletion(): void {
    // Resolve the discovery promise
    if (this.discoveryResolver) {
      this.discoveryResolver(this.getQualifiedResponders());
      this.discoveryResolver = null;
    }
    this.discoveryRejecter = null;
  }

  /**
   * Cleanup resources on disposal.
   */
  dispose(): void {
    this.stopDiscovery();
    this.stateMachine?.dispose();
    this.seenResponders.clear();
    this.firstResponses.clear();
  }
}
