import type { DiscoveryRequestEvent, DiscoveryResponseEvent } from '../types/core.js';
import type { ResponderInfo } from '../types/capabilities.js';
import type { DiscoveryResponderConfig } from '../types/testing.js';
import { MockEventTarget } from './MockEventTarget.js';
import { CapabilityMatcher } from '../responder/CapabilityMatcher.js';
import { createTestDiscoveryResponse } from './testUtils.js';
import { validateOrigin } from '../security.js';

/**
 * Mock discovery announcer for testing wallet-side discovery functionality
 * without requiring actual dApp implementations.
 *
 * This class simulates the behavior of a real discovery announcer (wallet),
 * allowing tests to verify wallet discovery logic including capability matching,
 * security policy enforcement, and response generation.
 *
 * @example
 * ```typescript
 * // Create a mock wallet announcer
 * const announcer = new MockDiscoveryResponder({
 *   responderInfo: createTestResponderInfo.ethereum(),
 *   securityPolicy: createTestSecurityPolicy()
 * });
 *
 * // Start listening for requests
 * announcer.startListening();
 *
 * // Simulate a discovery request
 * const request = createTestDiscoveryRequest();
 * const response = announcer.simulateDiscoveryRequest(request);
 *
 * if (response) {
 *   console.log(`Wallet ${response.name} can fulfill the request`);
 * }
 *
 * // Check statistics
 * const stats = announcer.getStats();
 * console.log(`Received ${stats.receivedRequestsCount} requests`);
 * ```
 * @category Testing
 * @since 1.0.0
 */
export class MockDiscoveryResponder {
  // config is stored for potential future use
  private _config: DiscoveryResponderConfig;
  private eventTarget: MockEventTarget;
  private responderInfo: ResponderInfo;
  private capabilityMatcher: CapabilityMatcher;
  private isListening = false;
  private receivedRequests: DiscoveryRequestEvent[] = [];
  private sentResponses: DiscoveryResponseEvent[] = [];

  constructor(config: DiscoveryResponderConfig) {
    this._config = config;
    this.responderInfo = config.responderInfo;
    this.eventTarget = new MockEventTarget();
    this.capabilityMatcher = new CapabilityMatcher(this.responderInfo);
  }

  /**
   * Start listening for mock discovery requests.
   *
   * Enables the announcer to respond to discovery requests. This method
   * is idempotent - calling it multiple times has no additional effect
   * if already listening.
   *
   * @example
   * ```typescript
   * announcer.startListening();
   * console.log('Wallet is now listening for discovery requests');
   * ```
   * @category Testing
   * @since 1.0.0
   */
  startListening(): void {
    if (this.isListening) {
      return;
    }

    this.isListening = true;
  }

  /**
   * Stop listening for discovery requests.
   *
   * Disables the announcer from responding to discovery requests. This method
   * is idempotent - calling it multiple times has no additional effect
   * if already stopped.
   *
   * @example
   * ```typescript
   * announcer.stopListening();
   * console.log('Wallet stopped listening for discovery requests');
   * ```
   * @category Testing
   * @since 1.0.0
   */
  stopListening(): void {
    if (!this.isListening) {
      return;
    }

    this.isListening = false;
  }

  /**
   * Simulate receiving a discovery request.
   *
   * Processes a discovery request as if it was received from a dApp. The method
   * performs origin validation (if configured) and capability matching before
   * generating a response. Returns null if the wallet cannot fulfill the request
   * or if the origin is not allowed.
   *
   * @param request - The discovery request to process
   * @returns A discovery response if the wallet can fulfill the request, null otherwise
   * @example
   * ```typescript
   * const request = createTestDiscoveryRequest({
   *   required: {
   *     chains: ['eip155:1'],
   *     features: ['account-management'],
   *     interfaces: ['eip-1193']
   *   }
   * });
   *
   * const response = announcer.simulateDiscoveryRequest(request);
   * if (response) {
   *   console.log('Wallet can fulfill this request');
   * } else {
   *   console.log('Wallet cannot fulfill this request');
   * }
   * ```
   * @category Testing
   * @since 1.0.0
   */
  simulateDiscoveryRequest(request: DiscoveryRequestEvent): DiscoveryResponseEvent | null {
    if (!this.isListening) {
      return null;
    }

    this.receivedRequests.push(request);

    // Validate origin against security policy if configured
    if (this._config.securityPolicy) {
      const validation = validateOrigin(request.origin, this._config.securityPolicy);
      if (!validation.valid) {
        // Origin validation failed, wallet doesn't respond
        return null;
      }
    }

    // Check if we can fulfill the requirements
    const matchResult = this.capabilityMatcher.matchCapabilities(request);

    if (!matchResult.canFulfill) {
      // We can't fulfill the requirements, so we don't respond
      return null;
    }

    // Create mock response
    const response = createTestDiscoveryResponse({
      sessionId: request.sessionId,
      responderId: this.responderInfo.uuid,
      rdns: this.responderInfo.rdns,
      name: this.responderInfo.name,
      icon: this.responderInfo.icon,
      responderVersion: this.responderInfo.version,
      matched: matchResult.intersection || {
        required: { technologies: [], features: [] },
        optional: { features: [] },
      },
    });

    this.sentResponses.push(response);
    return response;
  }

  /**
   * Update wallet information.
   *
   * Updates the wallet's ResponderInfo, which changes its capabilities and
   * metadata. This affects how future discovery requests are matched.
   *
   * @param responderInfo - The new wallet information
   * @example
   * ```typescript
   * // Update to support additional technologies
   * const updatedInfo = {
   *   ...announcer.responderInfo,
   *   technologies: [
   *     ...announcer.responderInfo.technologies,
   *     {
   *       type: 'solana',
   *       interfaces: ['solana-wallet-standard'],
   *       features: ['sign-message', 'sign-transaction']
   *     }
   *   ]
   * };
   * announcer.updateResponderInfo(updatedInfo);
   * ```
   * @category Testing
   * @since 1.0.0
   */
  updateResponderInfo(responderInfo: ResponderInfo): void {
    this.responderInfo = responderInfo;
    this.capabilityMatcher.updateResponderInfo(responderInfo);
  }

  /**
   * Check if the announcer is listening.
   *
   * Returns true if the announcer is currently listening for capability
   * requests, false otherwise.
   *
   * @returns Boolean indicating if the announcer is listening
   * @example
   * ```typescript
   * if (announcer.isAnnouncerListening()) {
   *   console.log('Wallet is ready to receive requests');
   * }
   * ```
   * @category Testing
   * @since 1.0.0
   */
  isAnnouncerListening(): boolean {
    return this.isListening;
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
   * const eventTarget = announcer.getEventTarget();
   * const stats = eventTarget.getStats();
   * console.log(`Event listeners: ${stats.listenerCount}`);
   * ```
   * @category Testing
   * @since 1.0.0
   */
  getEventTarget(): MockEventTarget {
    return this.eventTarget;
  }

  /**
   * Get all received discovery requests.
   *
   * Returns a copy of all discovery requests that have been processed
   * by this announcer, in the order they were received.
   *
   * @returns Array of received discovery requests
   * @example
   * ```typescript
   * const requests = announcer.getReceivedRequests();
   * console.log(`Received ${requests.length} requests`);
   * requests.forEach((req, i) => {
   *   console.log(`Request ${i}: ${req.required.technologies.map(t => t.type).join(', ')}`);
   * });
   * ```
   * @category Testing
   * @since 1.0.0
   */
  getReceivedRequests(): DiscoveryRequestEvent[] {
    return [...this.receivedRequests];
  }

  /**
   * Get all sent discovery responses.
   *
   * Returns a copy of all discovery responses that have been generated
   * by this announcer, in the order they were sent.
   *
   * @returns Array of sent discovery responses
   * @example
   * ```typescript
   * const responses = announcer.getSentResponses();
   * console.log(`Sent ${responses.length} responses`);
   * responses.forEach((resp, i) => {
   *   console.log(`Response ${i}: ${resp.name} can fulfill request`);
   * });
   * ```
   * @category Testing
   * @since 1.0.0
   */
  getSentResponses(): DiscoveryResponseEvent[] {
    return [...this.sentResponses];
  }

  /**
   * Get the last received request.
   *
   * Returns the most recently received discovery request, or undefined
   * if no requests have been received.
   *
   * @returns The last discovery request or undefined
   * @example
   * ```typescript
   * const lastRequest = announcer.getLastRequest();
   * if (lastRequest) {
   *   console.log(`Last request from: ${lastRequest.initiatorInfo.name}`);
   * }
   * ```
   * @category Testing
   * @since 1.0.0
   */
  getLastRequest(): DiscoveryRequestEvent | undefined {
    return this.receivedRequests[this.receivedRequests.length - 1];
  }

  /**
   * Get the last sent response.
   *
   * Returns the most recently sent discovery response, or undefined
   * if no responses have been sent.
   *
   * @returns The last discovery response or undefined
   * @example
   * ```typescript
   * const lastResponse = announcer.getLastResponse();
   * if (lastResponse) {
   *   console.log(`Last response: ${lastResponse.name}`);
   * }
   * ```
   * @category Testing
   * @since 1.0.0
   */
  getLastResponse(): DiscoveryResponseEvent | undefined {
    return this.sentResponses[this.sentResponses.length - 1];
  }

  /**
   * Get announcer statistics.
   *
   * Returns comprehensive statistics about the announcer's state and activity,
   * including configuration, wallet info summary, request/response counts,
   * and capability details.
   *
   * @returns Object containing announcer statistics
   * @example
   * ```typescript
   * const stats = announcer.getStats();
   * console.log({
   *   listening: stats.isListening,
   *   wallet: stats.responderInfo.name,
   *   requests: stats.receivedRequestsCount,
   *   responses: stats.sentResponsesCount
   * });
   * ```
   * @category Testing
   * @since 1.0.0
   */
  getStats() {
    return {
      isListening: this.isListening,
      config: this._config, // Include config for debugging purposes
      responderInfo: {
        uuid: this.responderInfo.uuid,
        rdns: this.responderInfo.rdns,
        name: this.responderInfo.name,
        type: this.responderInfo.type,
        technologyCount: this.responderInfo.technologies.length,
        featureCount: this.responderInfo.features.length,
      },
      receivedRequestsCount: this.receivedRequests.length,
      sentResponsesCount: this.sentResponses.length,
      capabilityDetails: this.capabilityMatcher.getCapabilityDetails(),
      eventTargetStats: this.eventTarget.getStats(),
    };
  }

  /**
   * Test if the wallet can fulfill specific requirements.
   *
   * Checks whether the wallet's capabilities match the given request without
   * actually generating a response. Useful for testing capability matching logic.
   *
   * @param request - The discovery request to test against
   * @returns The capability match result with details
   * @example
   * ```typescript
   * const request = createTestDiscoveryRequest();
   * const matchResult = announcer.testCapabilityMatch(request);
   *
   * if (matchResult.canFulfill) {
   *   console.log('Wallet can fulfill request');
   *   console.log('Matched technologies:', matchResult.intersection.required.technologies);
   * } else {
   *   console.log('Cannot fulfill:', matchResult.missingRequirements);
   * }
   * ```
   * @category Testing
   * @since 1.0.0
   */
  testCapabilityMatch(request: DiscoveryRequestEvent) {
    return this.capabilityMatcher.matchCapabilities(request);
  }

  /**
   * Simulate multiple discovery requests in sequence.
   *
   * Processes multiple discovery requests as if they were received sequentially.
   * Useful for testing scenarios with multiple dApps or repeated discovery attempts.
   *
   * @param requests - Array of discovery requests to process
   * @returns Array of discovery responses (may contain fewer items if some requests don't match)
   * @example
   * ```typescript
   * const requests = [
   *   createTestDiscoveryRequest({ required: ethRequirements }),
   *   createTestDiscoveryRequest({ required: solanaRequirements }),
   *   createTestDiscoveryRequest({ required: multiChainRequirements })
   * ];
   *
   * const responses = announcer.simulateMultipleRequests(requests);
   * console.log(`Fulfilled ${responses.length} out of ${requests.length} requests`);
   * ```
   * @category Testing
   * @since 1.0.0
   */
  simulateMultipleRequests(requests: DiscoveryRequestEvent[]): DiscoveryResponseEvent[] {
    const responses: DiscoveryResponseEvent[] = [];

    for (const request of requests) {
      const response = this.simulateDiscoveryRequest(request);
      if (response) {
        responses.push(response);
      }
    }

    return responses;
  }

  /**
   * Get capability match details for a request without responding.
   *
   * Similar to testCapabilityMatch but emphasizes the "preview" nature -
   * checking compatibility without any side effects or recording the request.
   *
   * @param request - The discovery request to preview
   * @returns The capability match result with details
   * @example
   * ```typescript
   * // Preview before actually processing
   * const preview = announcer.previewCapabilityMatch(request);
   * if (preview.canFulfill) {
   *   // Proceed with actual request
   *   const response = announcer.simulateDiscoveryRequest(request);
   * }
   * ```
   * @category Testing
   * @since 1.0.0
   */
  previewCapabilityMatch(request: DiscoveryRequestEvent) {
    return this.capabilityMatcher.matchCapabilities(request);
  }

  /**
   * Clear all recorded state for fresh testing.
   *
   * Resets the announcer to its initial state, clearing all received requests,
   * sent responses, and event history. Stops listening if active. Use this
   * between tests to ensure clean test isolation.
   *
   * @example
   * ```typescript
   * // After running tests
   * announcer.reset();
   *
   * // Now ready for new tests
   * announcer.startListening();
   * ```
   * @category Testing
   * @since 1.0.0
   */
  reset(): void {
    this.stopListening();
    this.receivedRequests = [];
    this.sentResponses = [];
    this.eventTarget.clearDispatchedEvents();
    this.eventTarget.clearAllListeners();
  }

  /**
   * Clean up resources.
   *
   * Alias for reset() that provides a more semantic name for cleanup operations.
   * Use this when tearing down test environments.
   *
   * @example
   * ```typescript
   * afterEach(() => {
   *   announcer.cleanup();
   * });
   * ```
   * @category Testing
   * @since 1.0.0
   */
  cleanup(): void {
    this.reset();
  }
}
