/**
 * @module discovery/wallet/WalletDiscovery
 *
 * Secure wallet discovery implementation that runs in the background context
 * of Chrome extensions. Handles all discovery business logic, capability matching,
 * and security validation away from the page context for maximum security.
 */

import type { DiscoveryRequestEvent, DiscoveryResponseEvent } from '../types/core.js';
import type { ResponderInfo } from '../types/capabilities.js';
import type { SecurityPolicy } from '../types/security.js';
import { DiscoveryResponder } from '../responder.js';
import { CapabilityMatcher } from '../responder/CapabilityMatcher.js';
import { type Logger, defaultLogger } from '../core/logger.js';
import { getExtensionId } from './browserApi.js';

/**
 * Callback to determine if discovery response should be sent to an origin.
 *
 * This callback is invoked after capability matching but before sending the
 * discovery response. It allows the wallet extension to implement custom
 * origin policies such as allowlists, user prompts, and trusted origins.
 *
 * **IMPORTANT**: This callback is synchronous or async (returns boolean or Promise<boolean>).
 * The core library does NOT provide any storage, tracking, or UI - that is the
 * extension's responsibility.
 *
 * @param origin - The origin of the discovery request (e.g., 'https://app.example.com')
 * @returns true to send discovery response, false to silently ignore the request
 *
 * @example Allowlist only
 * ```typescript
 * shouldRespondToDiscovery: (origin) => {
 *   return allowedOrigins.has(origin);
 * }
 * ```
 *
 * @example With user prompt
 * ```typescript
 * shouldRespondToDiscovery: async (origin) => {
 *   // Check trusted origins (no prompt)
 *   if (trustedOrigins.has(origin)) return true;
 *
 *   // Check allowlist (no prompt)
 *   if (allowlist.has(origin)) return true;
 *
 *   // Unknown origin - prompt user
 *   return await showPermissionPrompt(origin);
 * }
 * ```
 */
export type ShouldRespondToDiscoveryCallback = (origin: string) => boolean | Promise<boolean>;

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

  /**
   * Callback for sending discovery responses (REQUIRED for port-based communication).
   *
   * This callback receives the discovery announcement and tab ID, and is responsible
   * for sending the response through the appropriate channel (e.g., via a port connection
   * to the content script).
   *
   * @param announcement - The discovery response to send to the dApp
   * @param tabId - The browser tab ID where the request originated
   *
   * @example Port-based communication
   * ```typescript
   * const portsByTab = new Map<number, Port>();
   *
   * const walletDiscovery = new WalletDiscovery({
   *   responderInfo: myWalletInfo,
   *   onAnnouncement: (announcement, tabId) => {
   *     const port = portsByTab.get(tabId);
   *     if (port) {
   *       port.postMessage({
   *         type: 'discovery:wallet:response',
   *         data: announcement
   *       });
   *     }
   *   }
   * });
   * ```
   */
  onAnnouncement?: (announcement: DiscoveryResponseEvent, tabId: number) => void;

  /** Optional logger instance */
  logger?: Logger;

  /**
   * Optional callback to determine if discovery response should be sent to an origin.
   *
   * If not provided, only the SecurityPolicy validation is performed.
   * If provided, this callback is the final check before sending a response.
   *
   * When this callback returns false, the request is silently ignored (no response
   * sent). This prevents information leakage and protects user privacy.
   *
   * **Security Note**: This callback is called AFTER:
   * - Session replay checks
   * - Rate limiting checks
   * - Capability matching
   *
   * So you can assume the request is well-formed and the wallet CAN fulfill
   * the requirements. This callback is purely for origin-based policy decisions.
   *
   * **Extension Responsibility**: The extension implements this callback to handle:
   * - Allowlist checking
   * - Trusted origin checking
   * - User permission prompts
   * - Storage/persistence (but NOT marking as discovered - see onResponseSent)
   *
   * **IMPORTANT**: Do NOT mark the origin as "discovered" in this callback. Use
   * the `onResponseSent` callback instead, which is called AFTER the response
   * is successfully delivered.
   *
   * @since 0.9.0
   */
  shouldRespondToDiscovery?: ShouldRespondToDiscoveryCallback;

  /**
   * Optional callback invoked after discovery response is successfully sent to an origin.
   *
   * This callback is called ONLY when:
   * - The origin was approved (shouldRespondToDiscovery returned true)
   * - The response was successfully delivered via browser.tabs.sendMessage
   *
   * **Use this callback to mark the origin as "discovered"** for later connection
   * validation. This ensures consistent state - the origin is only marked as
   * discovered if it actually received the response.
   *
   * If the send fails (tab closed, network error, etc.), this callback is NOT
   * called, preventing inconsistent state.
   *
   * **Extension Responsibility**: The extension implements this callback to:
   * - Mark origin as discovered in OriginManager
   * - Track discovery completion for connection phase validation
   *
   * @param origin - The origin that successfully received the discovery response
   * @since 0.9.0
   */
  onResponseSent?: (origin: string) => void;
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
 * Secure wallet discovery implementation for browser extensions.
 *
 * This class handles all discovery protocol business logic in the secure
 * background context, including capability matching, security validation,
 * and announcement generation. The content script acts as a pure message
 * relay, ensuring no sensitive wallet data is exposed to the page context.
 *
 * Works with both Chrome and Firefox extensions by auto-detecting the
 * available browser API namespace (chrome.* or browser.*).
 *
 * Key security features:
 * - All business logic runs in secure background context
 * - Origin validation and security policy enforcement
 * - Capability intersection calculation (only sends what dApp should see)
 * - Privacy-preserving silent rejection for unmatched capabilities
 * - Rate limiting and DOS protection
 *
 * @example Basic usage in browser extension background script:
 * ```typescript
 * import { WalletDiscovery, createResponderInfo, getBrowserAPI } from '@walletmesh/discovery';
 *
 * const api = getBrowserAPI();
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
 * // Handle discovery requests from content script (works with both chrome.* and browser.*)
 * api.runtime.onMessage.addListener((message, sender) => {
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
  private config: WalletDiscoveryConfig;
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
      this.config = configOrResponderInfo as WalletDiscoveryConfig;
      this.securityPolicy = this.config.securityPolicy || { requireHttps: true };
      this.responderInfo = this.config.responderInfo;
      this.logger = this.config.logger ?? defaultLogger;
    } else {
      // Just responder info - use defaults for everything else
      const responderInfo = configOrResponderInfo as ResponderInfo;
      this.config = {
        responderInfo,
        securityPolicy: { requireHttps: true },
        logger: defaultLogger,
      };
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
    this.announcer = new DiscoveryResponder(this.responderInfo, {
      eventTarget,
      security: this.securityPolicy,
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
   * This method performs the following checks in order:
   * 1. Origin validation (SecurityPolicy)
   * 2. Capability matching
   * 3. Custom origin validation (shouldRespondToDiscovery callback) ← NEW
   * 4. Send response if all checks pass
   * 5. Call onResponseSent callback after successful delivery ← NEW
   *
   * @param request - The discovery request from the dApp
   * @param origin - The origin of the requesting dApp
   * @param tabId - The browser tab ID for sending responses
   */
  async handleDiscoveryRequest(request: DiscoveryRequestEvent, origin: string, tabId: number): Promise<void> {
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
      // ═══════════════════════════════════════════════════════════
      // NEW: Origin-based policy callback (extension-provided)
      // ═══════════════════════════════════════════════════════════
      if (this.config.shouldRespondToDiscovery) {
        try {
          const isAllowed = await this.config.shouldRespondToDiscovery(origin);

          if (!isAllowed) {
            this.logger.info(`Extension policy rejected origin (silent): ${origin}`);
            this.stats.requestsRejected++;
            return; // Silent failure - wallet remains hidden
          }

          this.logger.debug(`Extension policy approved origin: ${origin}`);
        } catch (error) {
          this.logger.error('Extension policy callback threw error', {
            origin,
            sessionId: request.sessionId,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          });
          this.stats.requestsRejected++;
          return; // Fail closed - don't send response on error
        }
      }

      // Get extension ID from browser API
      const extensionId = getExtensionId();
      if (!extensionId) {
        this.logger.warn('Unable to get extension ID');
        return;
      }

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
        ...(this.responderInfo.networks &&
          this.responderInfo.networks.length > 0 && {
            networks: this.responderInfo.networks,
          }),
        transportConfig: {
          type: 'extension',
          extensionId,
        },
      };

      // Send response via onAnnouncement callback (port-based communication)
      if (this.config.onAnnouncement) {
        try {
          this.config.onAnnouncement(announcement, tabId);

          // Announcement sent successfully
          this.stats.announcementsSent++;
          this.logger.info(`Discovery announcement sent to ${origin}`);

          // Call onResponseSent callback AFTER successful delivery
          if (this.config.onResponseSent) {
            this.config.onResponseSent(origin);
          }
        } catch (error) {
          this.logger.warn(`Failed to send announcement to tab ${tabId}`, error);
        }
      } else {
        this.logger.warn('No onAnnouncement callback configured - cannot send discovery response');
      }
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
    if (!Array.isArray(responderInfo.technologies)) {
      throw new Error('Invalid responder info: technologies must be an array');
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
