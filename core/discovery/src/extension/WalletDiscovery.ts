/**
 * @module discovery/wallet/WalletDiscovery
 *
 * Secure wallet discovery implementation that runs in the background context
 * of Chrome extensions. Handles all discovery business logic, capability matching,
 * and security validation away from the page context for maximum security.
 */

import type {
  DiscoveryRequestEvent,
  DiscoveryResponseEvent,
  ResponderInfo,
  SecurityPolicy,
} from '../core/types.js';
import { DiscoveryResponder } from '../responder/DiscoveryResponder.js';
import { CapabilityMatcher } from '../responder/CapabilityMatcher.js';
import { type Logger, defaultLogger } from '../core/logger.js';

/**
 * Configuration for WalletDiscovery initialization.
 *
 * @example
 * ```typescript
 * const config: WalletDiscoveryConfig = {
 *   responderInfo: createResponderInfo.aztec({
 *     uuid: crypto.randomUUID(),
 *     rdns: 'com.example.wallet',
 *     name: 'My Aztec Wallet',
 *     type: 'extension'
 *   }),
 *   securityPolicy: {
 *     requireHttps: true,
 *     allowedOrigins: ['https://trusted-dapp.com']
 *   }
 * };
 * ```
 */
export interface WalletDiscoveryConfig {
  /** Full wallet capabilities and information (stays secure in background) */
  responderInfo: ResponderInfo;

  /** Security policy for origin validation and rate limiting */
  securityPolicy?: SecurityPolicy;

  /** Optional callback for custom announcement handling */
  onAnnouncement?: (announcement: DiscoveryResponseEvent, tabId: number) => void;

  /** Optional logger instance */
  logger?: Logger;
}

/**
 * Statistics and status information for wallet discovery.
 */
export interface WalletDiscoveryStats {
  /** Whether discovery is currently active */
  isEnabled: boolean;

  /** Number of discovery requests processed */
  requestsProcessed: number;

  /** Number of announcements sent */
  announcementsSent: number;

  /** Number of requests rejected for security reasons */
  requestsRejected: number;

  /** Currently connected origins */
  connectedOrigins: string[];
}

/**
 * Secure wallet discovery implementation for Chrome extensions.
 *
 * This class handles all discovery protocol business logic in the secure
 * background context, including capability matching, security validation,
 * and announcement generation. The content script acts as a pure message
 * relay, ensuring no sensitive wallet data is exposed to the page context.
 *
 * Key security features:
 * - All business logic runs in secure background context
 * - Origin validation and security policy enforcement
 * - Capability intersection calculation (only sends what dApp should see)
 * - Privacy-preserving silent rejection for unmatched capabilities
 * - Rate limiting and DOS protection
 *
 * @example Basic usage in Chrome extension background script:
 * ```typescript
 * import { WalletDiscovery, createResponderInfo } from '@walletmesh/discovery';
 *
 * const walletDiscovery = new WalletDiscovery({
 *   responderInfo: createResponderInfo.aztec({
 *     uuid: crypto.randomUUID(),
 *     rdns: 'com.example.aztecwallet',
 *     name: 'Aztec Privacy Wallet',
 *     type: 'extension',
 *     chains: ['aztec:mainnet', 'aztec:testnet'],
 *     features: ['private-transactions', 'contract-deployment']
 *   }),
 *   securityPolicy: {
 *     requireHttps: true,
 *     allowedOrigins: [],
 *     rateLimit: { enabled: true, maxRequests: 10, windowMs: 60000 }
 *   }
 * });
 *
 * // Handle discovery requests from content script
 * chrome.runtime.onMessage.addListener((message, sender) => {
 *   if (message.type === 'discovery:request' && sender.tab?.id) {
 *     walletDiscovery.handleDiscoveryRequest(
 *       message.data,
 *       message.origin,
 *       sender.tab.id
 *     );
 *   }
 * });
 *
 * await walletDiscovery.enable();
 * ```
 *
 * @category Wallet
 * @since 0.2.0
 */
export class WalletDiscovery {
  private announcer: DiscoveryResponder;
  private capabilityMatcher: CapabilityMatcher;
  private securityPolicy: SecurityPolicy;
  private responderInfo: ResponderInfo;
  private stats: WalletDiscoveryStats;
  private isEnabled = false;
  private connectedOrigins = new Set<string>();
  private logger: Logger;

  /**
   * Creates a new WalletDiscovery instance.
   *
   * @param configOrResponderInfo - Configuration object or just the responder info
   */
  constructor(configOrResponderInfo: WalletDiscoveryConfig | ResponderInfo) {
    // Support both the full config object and just passing responder info directly
    if ('responderInfo' in configOrResponderInfo) {
      // Full config object
      const config = configOrResponderInfo as WalletDiscoveryConfig;
      this.securityPolicy = config.securityPolicy || { requireHttps: true };
      this.responderInfo = config.responderInfo;
      this.logger = config.logger ?? defaultLogger;
    } else {
      // Just responder info - use defaults for everything else
      const responderInfo = configOrResponderInfo as ResponderInfo;
      this.securityPolicy = { requireHttps: true };
      this.responderInfo = responderInfo;
      this.logger = defaultLogger;
    }

    // Initialize statistics
    this.stats = {
      isEnabled: false,
      requestsProcessed: 0,
      announcementsSent: 0,
      requestsRejected: 0,
      connectedOrigins: [],
    };

    // Capability matcher for intersection calculations
    this.capabilityMatcher = new CapabilityMatcher(this.responderInfo);

    // Custom event target for background processing
    const onAnnouncement =
      'responderInfo' in configOrResponderInfo
        ? (configOrResponderInfo as WalletDiscoveryConfig).onAnnouncement
        : undefined;
    const eventTarget = new BackgroundEventTarget(onAnnouncement);

    // Discovery announcer runs in secure background
    this.announcer = new DiscoveryResponder({
      responderInfo: this.responderInfo,
      eventTarget: eventTarget,
      securityPolicy: this.securityPolicy,
      logger: this.logger,
    });
  }

  /**
   * Enable wallet discovery.
   *
   * Starts listening for discovery requests and begins announcing
   * wallet capabilities to qualified dApps.
   *
   * @returns Promise that resolves when discovery is enabled
   */
  async enable(): Promise<void> {
    return this.startAnnouncing();
  }

  /**
   * Disable wallet discovery.
   *
   * Stops listening for discovery requests and cleans up resources.
   *
   * @returns Promise that resolves when discovery is disabled
   */
  async disable(): Promise<void> {
    return this.stopAnnouncing();
  }

  /**
   * Start announcing wallet capabilities to discovery requests.
   *
   * This is the preferred method for starting discovery announcements.
   */
  startAnnouncing(): void {
    if (this.isEnabled) {
      return;
    }

    this.announcer.startListening();
    this.isEnabled = true;
    this.stats.isEnabled = true;

    this.logger.info('WalletDiscovery started announcing');
  }

  /**
   * Stop announcing wallet capabilities and clean up resources.
   *
   * This is the preferred method for stopping discovery announcements.
   */
  stopAnnouncing(): void {
    if (!this.isEnabled) {
      return;
    }

    this.announcer.stopListening();
    this.isEnabled = false;
    this.stats.isEnabled = false;
    this.connectedOrigins.clear();
    this.stats.connectedOrigins = [];

    this.logger.info('WalletDiscovery stopped announcing');
  }

  /**
   * Check if the wallet is currently announcing its capabilities.
   *
   * @returns True if discovery announcements are active
   */
  isAnnouncing(): boolean {
    return this.isEnabled;
  }

  /**
   * Handle a discovery request from the content script.
   *
   * This is the main entry point for processing discovery requests.
   * All security validation, capability matching, and announcement
   * generation happens in this secure background context.
   *
   * @param request - The discovery request from the dApp
   * @param origin - The origin of the requesting dApp
   * @param tabId - The Chrome tab ID for sending responses
   */
  handleDiscoveryRequest(request: DiscoveryRequestEvent, origin: string, tabId: number): void {
    this.stats.requestsProcessed++;

    // Security validation in background
    if (!this.isOriginAllowed(origin)) {
      this.stats.requestsRejected++;
      this.logger.info(`Discovery request rejected for origin: ${origin}`);
      return; // Silent rejection for security
    }

    // Add to connected origins
    this.connectedOrigins.add(origin);
    this.stats.connectedOrigins = Array.from(this.connectedOrigins);

    // Capability intersection calculation
    const matchResult = this.capabilityMatcher.matchCapabilities({
      ...request,
      origin,
    });

    if (matchResult.canFulfill && matchResult.intersection) {
      // Create filtered announcement (only intersection data)
      const announcement: DiscoveryResponseEvent = {
        type: 'discovery:wallet:response',
        version: request.version,
        sessionId: request.sessionId,
        responderId: crypto.randomUUID(),
        rdns: this.responderInfo.rdns,
        name: this.responderInfo.name,
        icon: this.responderInfo.icon,
        matched: matchResult.intersection, // Only what dApp should see
        transportConfig: {
          type: 'extension',
          extensionId: chrome.runtime.id,
        },
      };

      // Send to content script for relay to dApp
      chrome.tabs
        .sendMessage(tabId, {
          type: 'discovery:announce',
          data: announcement,
        })
        .catch(() => {
          // Tab might not have content script or be closed
          this.logger.warn(`Failed to send announcement to tab ${tabId}`);
        });

      this.stats.announcementsSent++;
      this.logger.info(`Discovery announcement sent to ${origin}`);
    } else {
      // Silent rejection if can't fulfill (privacy-preserving)
      this.logger.info(`Discovery request from ${origin} does not match capabilities`);
    }
  }

  /**
   * Update wallet responder information.
   *
   * This allows updating wallet capabilities dynamically, for example
   * when accounts are added/removed or network connections change.
   *
   * @param responderInfo - Updated wallet information and capabilities
   */
  updateResponderInfo(responderInfo: ResponderInfo): void {
    // Validate the responder info
    if (!responderInfo || typeof responderInfo !== 'object') {
      throw new Error('Invalid responder info: must be a valid object');
    }
    if (!responderInfo.rdns || typeof responderInfo.rdns !== 'string') {
      throw new Error('Invalid responder info: rdns is required and must be a string');
    }
    if (!responderInfo.name || typeof responderInfo.name !== 'string') {
      throw new Error('Invalid responder info: name is required and must be a string');
    }
    if (!responderInfo.icon || typeof responderInfo.icon !== 'string') {
      throw new Error('Invalid responder info: icon is required and must be a string');
    }
    if (!Array.isArray(responderInfo.chains)) {
      throw new Error('Invalid responder info: chains must be an array');
    }

    this.responderInfo = responderInfo;
    this.announcer.updateResponderInfo(responderInfo);
    this.capabilityMatcher.updateResponderInfo(responderInfo);
    this.logger.info('Wallet responder info updated');
  }

  /**
   * Get the current responder information for this wallet.
   *
   * @returns Current responder information including capabilities
   */
  getResponderInfo(): ResponderInfo {
    return this.responderInfo;
  }

  /**
   * Check if this wallet can fulfill a discovery request.
   *
   * @param request - The discovery request to check
   * @returns True if the wallet can fulfill all required capabilities
   */
  canFulfillRequest(request: DiscoveryRequestEvent): boolean {
    try {
      const result = this.capabilityMatcher.matchCapabilities(request);
      return result.canFulfill;
    } catch (error) {
      this.logger.warn('Error checking capability fulfillment:', error);
      return false;
    }
  }

  /**
   * Get the capability intersection between this wallet and a request.
   *
   * @param request - The discovery request to intersect with
   * @returns The intersection of capabilities, or null if no intersection
   */
  getDiscoveryIntersection(
    request: DiscoveryRequestEvent,
  ): { required: DiscoveryRequestEvent['required'] } | null {
    try {
      const result = this.capabilityMatcher.matchCapabilities(request);
      return result.intersection || null;
    } catch (error) {
      this.logger.warn('Error calculating capability intersection:', error);
      return null;
    }
  }

  /**
   * Get current discovery statistics.
   *
   * @returns Current statistics and status information
   */
  getStats(): WalletDiscoveryStats {
    return { ...this.stats };
  }

  /**
   * Validate if an origin is allowed based on security policy.
   *
   * @param origin - The origin to validate
   * @returns True if origin is allowed, false otherwise
   */
  private isOriginAllowed(origin: string): boolean {
    // Check explicit allowlist first
    if (this.securityPolicy.allowedOrigins?.length) {
      return this.securityPolicy.allowedOrigins.includes(origin);
    }

    // Check explicit blocklist
    if (this.securityPolicy.blockedOrigins?.includes(origin)) {
      return false;
    }

    try {
      const url = new URL(origin);

      // Allow localhost if configured
      if (url.hostname === 'localhost' && this.securityPolicy.allowLocalhost) {
        return true;
      }

      // Check HTTPS requirement
      if (this.securityPolicy.requireHttps && url.protocol !== 'https:') {
        return false;
      }

      return true;
    } catch {
      // Invalid origin
      return false;
    }
  }
}

/**
 * Custom EventTarget that operates within the background context.
 *
 * This EventTarget doesn't need to cross security boundaries and
 * provides a clean interface for the DiscoveryResponder to operate
 * within the secure background script context.
 */
class BackgroundEventTarget extends EventTarget {
  constructor(private onAnnouncement?: (announcement: DiscoveryResponseEvent, tabId: number) => void) {
    super();
  }

  /**
   * Override dispatchEvent to handle announcements in background context.
   *
   * @param event - The event to dispatch
   * @returns True if event was successfully dispatched
   */
  override dispatchEvent(event: CustomEvent): boolean {
    if (event.type === 'discovery:wallet:announce' && this.onAnnouncement) {
      // Handle announcements in background context
      this.onAnnouncement(event.detail, event.detail.tabId);
    }

    return super.dispatchEvent(event);
  }
}
