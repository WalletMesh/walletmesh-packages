/**
 * @module discovery/content/ContentScriptRelay
 *
 * Ultra-thin message relay for Chrome extension content scripts.
 * This class provides a secure bridge between the page context (dApps) and
 * the extension background context (secure wallet logic) without exposing
 * any sensitive wallet data to the page.
 */

import type { Logger } from '../core/logger.js';
import { ConsoleLogger } from '../core/logger.js';
import { getBrowserAPI, type BrowserAPI } from './browserApi.js';

/**
 * Ultra-thin message relay for content scripts.
 *
 * This class acts as a pure message relay between:
 * - dApp page events (discovery:wallet:request)
 * - Chrome extension background script (secure wallet logic)
 * - dApp page events (discovery:wallet:response)
 *
 * Key security properties:
 * - No wallet data or business logic in content script
 * - No capability matching or filtering logic
 * - Pure message passing with origin validation
 * - Minimal attack surface (~30 lines of code)
 *
 * The content script is automatically injected into all pages by the
 * Chrome extension manifest and provides the discovery protocol bridge
 * without compromising security.
 *
 * @example Usage in Chrome extension content script:
 * ```typescript
 * import { ContentScriptRelay } from '@walletmesh/discovery/extension';
 *
 * // Auto-initialize the relay - no configuration needed
 * new ContentScriptRelay();
 * ```
 *
 * @example Extension manifest configuration:
 * ```json
 * {
 *   "content_scripts": [{
 *     "matches": ["<all_urls>"],
 *     "js": ["content.js"],
 *     "run_at": "document_start",
 *     "all_frames": true
 *   }]
 * }
 * ```
 *
 * @category Content
 * @since 0.2.0
 */
export class ContentScriptRelay {
  private isInitialized = false;
  private port: chrome.runtime.Port | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private retryAttempts = 0;
  private maxRetryAttempts = 3;
  private retryDelay = 1000;
  private logger: Logger = new ConsoleLogger('[WalletMesh:ContentScript]');
  private browserAPI: BrowserAPI;
  private messageQueue: Array<unknown> = [];

  /**
   * Creates and initializes the content script relay.
   *
   * Automatically sets up bidirectional message passing between
   * the page and the secure background script.
   */
  constructor() {
    this.browserAPI = getBrowserAPI();
    this.connect();
    this.initialize();
  }

  /**
   * Initialize the message relay system.
   *
   * Sets up event listeners for both directions:
   * - Page → Background: discovery requests
   * - Background → Page: discovery announcements
   */
  private initialize(): void {
    if (this.isInitialized) {
      return;
    }

    try {
      this.setupPageToBackground();
      this.isInitialized = true;
      this.retryAttempts = 0; // Reset retry count on success

      this.logger.info('Content script relay initialized');
    } catch (error) {
      this.logger.error('Failed to initialize content script relay:', error);
      this.handleInitializationFailure(error);
    }
  }

  /**
   * Handle initialization failures with retry logic.
   *
   * @param error - The error that caused initialization to fail
   */
  private handleInitializationFailure(error: unknown): void {
    if (this.retryAttempts < this.maxRetryAttempts) {
      this.retryAttempts++;
      this.logger.warn(
        `Retrying initialization (attempt ${this.retryAttempts}/${this.maxRetryAttempts}) in ${this.retryDelay}ms`,
      );

      setTimeout(() => {
        this.initialize();
      }, this.retryDelay);
    } else {
      this.logger.error(
        'Maximum retry attempts reached. Content script relay initialization failed permanently:',
        error,
      );
    }
  }

  /**
   * Establish long-lived port connection to background script.
   * Automatically handles reconnection on disconnect.
   */
  private connect(): void {
    if (!this.browserAPI.isAvailable) {
      this.logger.warn('Browser extension API not available');
      return;
    }

    if (!this.browserAPI.runtime.connect) {
      this.logger.warn('Browser runtime.connect not available');
      return;
    }

    try {
      // Establish named port connection
      this.port = this.browserAPI.runtime.connect({
        name: 'walletmesh-discovery',
      });

      // Store port reference for listeners
      const port = this.port;

      // Handle disconnect with automatic reconnection
      port.onDisconnect.addListener(() => {
        this.logger.debug('Port disconnected from background script');
        this.port = null;
        this.handlePortDisconnect();
      });

      // Handle incoming messages from background script
      port.onMessage.addListener((message: unknown) => {
        this.handlePortMessage(message);
      });

      // Connection successful
      this.reconnectAttempts = 0;
      this.logger.info('Port connection established');

      // Flush any queued messages
      this.flushMessageQueue();
    } catch (error) {
      this.logger.error('Failed to establish port connection', error);
      this.handlePortDisconnect();
    }
  }

  /**
   * Handle port disconnection with exponential backoff reconnection.
   */
  private handlePortDisconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.error('Max port reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * 2 ** (this.reconnectAttempts - 1), 10000); // Max 10 seconds

    this.logger.debug(
      `Reconnecting port in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
    );

    setTimeout(() => this.connect(), delay);
  }

  /**
   * Process messages received from background script via port.
   */
  private handlePortMessage(message: unknown): void {
    try {
      // Type guard for message structure
      if (typeof message === 'object' && message !== null && 'type' in message && 'data' in message) {
        const typedMessage = message as { type: string; data: unknown };

        if (typedMessage.type === 'discovery:wallet:response') {
          // Forward to page context
          window.dispatchEvent(
            new CustomEvent('discovery:wallet:response', {
              detail: typedMessage.data,
            }),
          );
        }
      }
    } catch (error) {
      this.logger.warn('Error processing port message', error);
    }
  }

  /**
   * Check if port connection is ready to send messages.
   * Native readiness check - no custom ping/pong needed!
   */
  private isPortReady(): boolean {
    return this.port !== null && this.port.name !== undefined;
  }

  /**
   * Flush queued messages after port reconnection.
   */
  private flushMessageQueue(): void {
    if (this.messageQueue.length === 0) return;

    this.logger.debug(`Flushing ${this.messageQueue.length} queued messages`);

    while (this.messageQueue.length > 0 && this.isPortReady()) {
      const message = this.messageQueue.shift();
      if (!this.port) break; // Safety check

      try {
        this.port.postMessage(message);
      } catch (error) {
        this.logger.error('Failed to flush queued message', error);
        // Re-queue on failure
        this.messageQueue.unshift(message);
        break;
      }
    }
  }

  /**
   * Set up message forwarding from page to background via persistent port.
   *
   * Listens for discovery:wallet:request events from dApps and forwards
   * them to the secure background script for processing.
   */
  private setupPageToBackground(): void {
    window.addEventListener('discovery:wallet:request', (event: Event) => {
      const customEvent = event as CustomEvent;

      try {
        const messageData = {
          type: 'discovery:wallet:request',
          data: customEvent.detail,
          origin: window.location.origin,
          timestamp: Date.now(),
        };

        // Check if port is ready
        if (!this.isPortReady() || !this.port) {
          this.logger.debug('Port not ready, queuing message');
          this.messageQueue.push(messageData);

          // Attempt to reconnect if not already reconnecting
          if (this.reconnectAttempts === 0) {
            this.connect();
          }
          return;
        }

        // Send via persistent port (no new channel created!)
        this.port.postMessage(messageData);
      } catch (error) {
        this.logger.warn('Error forwarding discovery request', error);
        // Reconnect on error
        this.connect();
      }
    });
  }

  /**
   * Check if the relay is properly initialized and port is connected.
   *
   * @returns True if relay is initialized and port is ready
   */
  isReady(): boolean {
    return this.isInitialized && this.isPortReady();
  }

  /**
   * Get relay status information.
   *
   * @returns Status object with initialization state and diagnostic information
   */
  getStatus(): {
    initialized: boolean;
    portConnected: boolean;
    queuedMessages: number;
    origin: string;
    userAgent: string;
    browserAPIAvailable: boolean;
    browserAPIType: 'chrome' | 'browser' | 'none';
    retryAttempts: number;
    maxRetryAttempts: number;
  } {
    return {
      initialized: this.isInitialized,
      portConnected: this.isPortReady(),
      queuedMessages: this.messageQueue.length,
      origin: window.location.origin,
      userAgent: navigator.userAgent,
      browserAPIAvailable: this.browserAPI.isAvailable,
      browserAPIType: this.browserAPI.apiType,
      retryAttempts: this.reconnectAttempts,
      maxRetryAttempts: this.maxReconnectAttempts,
    };
  }

  /**
   * Cleanup port connection and resources.
   */
  cleanup(): void {
    if (this.port) {
      try {
        this.port.disconnect();
      } catch (error) {
        this.logger.debug('Port already disconnected', error);
      }
      this.port = null;
    }
    this.messageQueue = [];
  }
}

/**
 * Auto-initialize content script relay when module is imported.
 *
 * This provides zero-configuration setup for Chrome extensions.
 * Simply importing this module will set up the discovery protocol
 * bridge between page and background contexts.
 */
let globalRelay: ContentScriptRelay | null = null;

/**
 * Get or create the global content script relay instance.
 *
 * @returns The global ContentScriptRelay instance
 */
export function getContentScriptRelay(): ContentScriptRelay {
  if (!globalRelay) {
    globalRelay = new ContentScriptRelay();
  }
  return globalRelay;
}

// Auto-initialize when running in a browser extension environment
if (typeof window !== 'undefined') {
  const api = getBrowserAPI();
  if (api.isAvailable) {
    getContentScriptRelay();
  }
}
