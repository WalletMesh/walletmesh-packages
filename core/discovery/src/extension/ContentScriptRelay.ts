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
  private retryAttempts = 0;
  private maxRetryAttempts = 3;
  private retryDelay = 1000; // 1 second
  private logger: Logger = new ConsoleLogger('[WalletMesh:ContentScript]');

  /**
   * Creates and initializes the content script relay.
   *
   * Automatically sets up bidirectional message passing between
   * the page and the secure background script.
   */
  constructor() {
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
      this.setupBackgroundToPage();
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
   * Handle Chrome API errors with detailed error analysis.
   *
   * @param operation - The Chrome API operation that failed
   * @param error - The error that occurred
   */
  private handleChromeApiError(operation: string, error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Categorize common Chrome extension errors
    if (errorMessage.includes('Extension context invalidated')) {
      this.logger.warn('Extension context invalidated - extension was reloaded or disabled');
    } else if (errorMessage.includes('The message port closed before a response was received')) {
      this.logger.warn('Background script not responding - may be starting up');
    } else if (errorMessage.includes('Cannot access a chrome://')) {
      this.logger.warn('Cannot access chrome:// URLs - expected behavior');
    } else {
      this.logger.warn(`Chrome API ${operation} failed:`, errorMessage);
    }
  }

  /**
   * Set up message forwarding from page to background.
   *
   * Listens for discovery:wallet:request events from dApps and forwards
   * them to the secure background script for processing.
   */
  private setupPageToBackground(): void {
    window.addEventListener('discovery:wallet:request', (event: Event) => {
      const customEvent = event as CustomEvent;
      try {
        // Check if chrome runtime is available
        if (typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) {
          this.logger.warn('Chrome runtime not available');
          return;
        }

        // Forward discovery request to secure background
        // Include origin for security validation
        chrome.runtime
          .sendMessage({
            type: 'discovery:wallet:request',
            data: customEvent.detail,
            origin: window.location.origin,
            timestamp: Date.now(),
          })
          .catch((error: unknown) => {
            // Extension might be disabled or background script not ready
            this.handleChromeApiError('sendMessage', error);
          });
      } catch (error) {
        this.logger.warn('Error processing discovery request:', error);
      }
    });
  }

  /**
   * Set up message forwarding from background to page.
   *
   * Listens for messages from the background script and forwards
   * discovery announcements to the page as browser events.
   */
  private setupBackgroundToPage(): void {
    // Check if chrome runtime is available
    if (typeof chrome === 'undefined' || !chrome.runtime?.onMessage) {
      this.logger.warn('Chrome runtime not available');
      return;
    }

    chrome.runtime.onMessage.addListener(
      (
        message: unknown,
        _sender: chrome.runtime.MessageSender,
        sendResponse: (response?: unknown) => void,
      ) => {
        try {
          // Type guard for message structure
          if (typeof message === 'object' && message !== null && 'type' in message && 'data' in message) {
            const typedMessage = message as { type: string; data: unknown };

            if (typedMessage.type === 'discovery:wallet:response') {
              // Forward discovery announcement to dApp
              window.dispatchEvent(
                new CustomEvent('discovery:wallet:response', {
                  detail: typedMessage.data,
                }),
              );

              // Acknowledge receipt
              sendResponse({ success: true });
            }
          }
        } catch (error) {
          this.logger.warn('Error forwarding discovery announcement:', error);
          sendResponse({ success: false, error: String(error) });
        }

        // Return false to indicate we don't need to keep the message channel open
        return false;
      },
    );
  }

  /**
   * Check if the relay is properly initialized.
   *
   * @returns True if relay is initialized and ready
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get relay status information.
   *
   * @returns Status object with initialization state and diagnostic information
   */
  getStatus(): {
    initialized: boolean;
    origin: string;
    userAgent: string;
    chromeRuntimeAvailable: boolean;
    retryAttempts: number;
    maxRetryAttempts: number;
  } {
    return {
      initialized: this.isInitialized,
      origin: window.location.origin,
      userAgent: navigator.userAgent,
      chromeRuntimeAvailable: typeof chrome !== 'undefined' && !!chrome.runtime,
      retryAttempts: this.retryAttempts,
      maxRetryAttempts: this.maxRetryAttempts,
    };
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

// Auto-initialize when running in a browser environment
if (typeof window !== 'undefined' && typeof chrome !== 'undefined' && chrome.runtime) {
  getContentScriptRelay();
}
