import type {
  DiscoveryInitiatorConfig,
  DiscoveryRequestEvent,
  DiscoveryResponseEvent,
  QualifiedResponder,
} from '../core/types.js';
import { MockEventTarget } from './MockEventTarget.js';
import { createTestDiscoveryRequest } from './testUtils.js';

/**
 * Mock discovery listener for testing dApp-side discovery functionality
 * without requiring actual wallet implementations.
 *
 * This class simulates the behavior of a real discovery listener, allowing
 * tests to verify dApp discovery logic without needing actual wallets to
 * respond to discovery requests.
 *
 * @example
 * ```typescript
 * // Create a mock listener with requirements
 * const listener = new MockDiscoveryInitiator({
 *   requirements: {
 *     chains: ['eip155:1'],
 *     features: ['account-management'],
 *     interfaces: ['eip-1193']
 *   },
 *   initiatorInfo: createTestDAppInfo()
 * });
 *
 * // Start discovery
 * const wallets = await listener.startDiscovery();
 *
 * // Add mock wallet responses
 * listener.addMockWalletResponse(createTestDiscoveryResponse());
 *
 * // Check qualified wallets
 * const qualified = listener.getQualifiedResponders();
 * ```
 * @category Testing
 * @since 1.0.0
 */
export class MockDiscoveryInitiator {
  private config: DiscoveryInitiatorConfig;
  private eventTarget: MockEventTarget;
  private qualifiedWallets: QualifiedResponder[] = [];
  private isDiscovering = false;
  private sessionId: string | null = null;
  private lastRequest?: DiscoveryRequestEvent;

  constructor(config: DiscoveryInitiatorConfig) {
    this.config = config;
    this.eventTarget = new MockEventTarget();
  }

  /**
   * Start mock discovery process.
   *
   * Initiates a new discovery session by generating a session ID and broadcasting
   * a discovery request. Returns the array of qualified wallets (initially empty
   * until responses are added).
   *
   * @returns Promise resolving to array of qualified responders
   * @throws Error if discovery is already in progress
   * @example
   * ```typescript
   * const wallets = await listener.startDiscovery();
   * console.log(`Discovery started, found ${wallets.length} wallets`);
   * ```
   * @category Testing
   * @since 1.0.0
   */
  async startDiscovery(): Promise<QualifiedResponder[]> {
    if (this.isDiscovering) {
      throw new Error('Discovery already in progress');
    }

    this.isDiscovering = true;
    this.qualifiedWallets = [];
    this.sessionId = crypto.randomUUID();

    // Create and dispatch mock discovery request
    const request = createTestDiscoveryRequest({
      sessionId: this.sessionId,
      initiatorInfo: this.config.initiatorInfo,
      required: this.config.requirements,
      ...(this.config.preferences && { optional: this.config.preferences }),
      // Use the origin from window.location if available (set by mockBrowserEnvironment)
      ...(typeof window !== 'undefined' && window.location && { origin: window.location.origin }),
    });

    await this.broadcastDiscoveryRequest(request);

    return this.qualifiedWallets;
  }

  /**
   * Stop the mock discovery process.
   *
   * Ends the current discovery session and clears the session ID.
   * This method is safe to call even if discovery is not in progress.
   *
   * @example
   * ```typescript
   * listener.stopDiscovery();
   * console.log('Discovery stopped');
   * ```
   * @category Testing
   * @since 1.0.0
   */
  stopDiscovery(): void {
    this.isDiscovering = false;
    this.sessionId = null;
  }

  /**
   * Add a mock qualified wallet response.
   *
   * Simulates receiving a discovery response from a wallet. The response
   * must match the current session ID to be processed. Successfully matched
   * responses are converted to QualifiedResponder objects and added to the
   * qualified wallets list.
   *
   * @param response - The discovery response to add
   * @example
   * ```typescript
   * const response = createTestDiscoveryResponse({
   *   sessionId: listener.getCurrentSessionId()
   * });
   * listener.addMockWalletResponse(response);
   * ```
   * @category Testing
   * @since 1.0.0
   */
  addMockWalletResponse(response: DiscoveryResponseEvent): void {
    if (!this.sessionId || response.sessionId !== this.sessionId) {
      return;
    }

    const qualifiedWallet: QualifiedResponder = {
      responderId: response.responderId,
      rdns: response.rdns,
      name: response.name,
      icon: response.icon,
      matched: response.matched,
      metadata: {
        version: response.version,
        description: response.description,
      },
    };

    this.qualifiedWallets.push(qualifiedWallet);
  }

  /**
   * Get qualified wallets.
   *
   * Returns a copy of the array of wallets that have responded and qualified
   * during the current or most recent discovery session.
   *
   * @returns Array of qualified responders
   * @example
   * ```typescript
   * const qualified = listener.getQualifiedResponders();
   * console.log(`Found ${qualified.length} qualified wallets`);
   * qualified.forEach(wallet => {
   *   console.log(`- ${wallet.name} (${wallet.rdns})`);
   * });
   * ```
   * @category Testing
   * @since 1.0.0
   */
  getQualifiedResponders(): QualifiedResponder[] {
    return [...this.qualifiedWallets];
  }

  /**
   * Check if discovery is in progress.
   *
   * Returns true if a discovery session is currently active, false otherwise.
   *
   * @returns Boolean indicating if discovery is active
   * @example
   * ```typescript
   * if (listener.isDiscoveryInProgress()) {
   *   console.log('Discovery is running...');
   * } else {
   *   console.log('Discovery is not active');
   * }
   * ```
   * @category Testing
   * @since 1.0.0
   */
  isDiscoveryInProgress(): boolean {
    return this.isDiscovering;
  }

  /**
   * Get the current session ID.
   *
   * Returns the session ID of the current discovery session, or null if
   * no session is active.
   *
   * @returns The current session ID or null
   * @example
   * ```typescript
   * const sessionId = listener.getCurrentSessionId();
   * if (sessionId) {
   *   console.log(`Current session: ${sessionId}`);
   * }
   * ```
   * @category Testing
   * @since 1.0.0
   */
  getCurrentSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Set the session ID manually (for testing).
   *
   * Allows manual control of the session ID for testing scenarios where
   * you need to simulate specific session behavior. Also marks discovery
   * as in progress.
   *
   * @param sessionId - The session ID to set
   * @example
   * ```typescript
   * const customSessionId = 'test-session-123';
   * listener.setSessionId(customSessionId);
   *
   * // Now responses with this session ID will be accepted
   * const response = createTestDiscoveryResponse({
   *   sessionId: customSessionId
   * });
   * listener.addMockWalletResponse(response);
   * ```
   * @category Testing
   * @since 1.0.0
   */
  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
    this.isDiscovering = true;
  }

  /**
   * Get the mock event target for testing.
   *
   * Provides access to the underlying MockEventTarget for advanced testing
   * scenarios where you need to inspect events or manipulate the event system.
   *
   * @returns The mock event target instance
   * @example
   * ```typescript
   * const eventTarget = listener.getEventTarget();
   * const stats = eventTarget.getStats();
   * console.log(`Dispatched ${stats.dispatchedEventCount} events`);
   * ```
   * @category Testing
   * @since 1.0.0
   */
  getEventTarget(): MockEventTarget {
    return this.eventTarget;
  }

  /**
   * Get discovery statistics.
   *
   * Returns comprehensive statistics about the discovery listener's state
   * and activity, useful for debugging and test assertions.
   *
   * @returns Object containing discovery statistics
   * @example
   * ```typescript
   * const stats = listener.getStats();
   * console.log({
   *   discovering: stats.isDiscovering,
   *   walletCount: stats.qualifiedWalletsCount,
   *   sessionId: stats.sessionId
   * });
   * ```
   * @category Testing
   * @since 1.0.0
   */
  getStats() {
    return {
      isDiscovering: this.isDiscovering,
      sessionId: this.sessionId,
      qualifiedWalletsCount: this.qualifiedWallets.length,
      qualifiedWallets: this.getQualifiedResponders(),
      eventTargetStats: this.eventTarget.getStats(),
    };
  }

  /**
   * Mock broadcast discovery request.
   */
  private async broadcastDiscoveryRequest(request: DiscoveryRequestEvent): Promise<void> {
    // In a real implementation, this would dispatch a CustomEvent
    // Here we just store the request for inspection
    this.lastRequest = request;

    // No need to simulate async delay in tests
  }

  /**
   * Get the last discovery request for testing.
   *
   * Returns the most recently broadcasted discovery request, useful for
   * verifying request construction and content.
   *
   * @returns The last discovery request or undefined if none
   * @example
   * ```typescript
   * await listener.startDiscovery();
   * const request = listener.getLastRequest();
   * if (request) {
   *   console.log(`Request session: ${request.sessionId}`);
   *   console.log(`Required chains: ${request.required.chains.join(', ')}`);
   * }
   * ```
   * @category Testing
   * @since 1.0.0
   */
  getLastRequest(): DiscoveryRequestEvent | undefined {
    return this.lastRequest;
  }

  /**
   * Clear all state for fresh testing.
   *
   * Resets the listener to its initial state, clearing all discovery sessions,
   * qualified wallets, and event history. Use this between tests to ensure
   * clean test isolation.
   *
   * @example
   * ```typescript
   * // After running tests
   * listener.reset();
   *
   * // Now ready for new tests
   * await listener.startDiscovery();
   * ```
   * @category Testing
   * @since 1.0.0
   */
  reset(): void {
    this.stopDiscovery();
    this.qualifiedWallets = [];
    this.eventTarget.clearDispatchedEvents();
    this.eventTarget.clearAllListeners();
    // Use delete to properly remove the property with exactOptionalPropertyTypes
    // biome-ignore lint/performance/noDelete: Required for exactOptionalPropertyTypes compliance
    delete (this as unknown as { lastRequest?: DiscoveryRequestEvent }).lastRequest;
  }
}
