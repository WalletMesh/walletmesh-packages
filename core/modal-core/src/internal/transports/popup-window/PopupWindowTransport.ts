/**
 * Popup window transport implementation
 *
 * Implements a transport using a popup window for cross-origin communication.
 * This transport opens a new browser window and establishes bidirectional
 * message passing using the postMessage API.
 *
 * ## Features
 *
 * - **Cross-Origin Communication**: Secure message passing between origins
 * - **Popup Management**: Automatic centering and size configuration
 * - **Close Detection**: Monitors popup state and handles unexpected closures
 * - **Origin Validation**: Validates message origins for security
 * - **Connection Handshake**: Waits for 'ready' message before considering connected
 *
 * ## Security Considerations
 *
 * - Always specify target origin when possible (extracted from URL)
 * - Validate message sources to prevent XSS attacks
 * - Use structured data formats (JSON) for messages
 * - Handle popup blockers gracefully
 *
 * ## Browser Compatibility
 *
 * - Requires popup permissions (may be blocked)
 * - Works across all modern browsers
 * - Mobile browsers may open tabs instead of popups
 *
 * @internal
 */

import type { TransportContext } from '@walletmesh/jsonrpc';
import type {
  PopupConfig,
  TransportConnectedEvent,
  TransportDisconnectedEvent,
  TransportErrorEvent,
  TransportMessageEvent,
} from '../../../types.js';
import { ErrorFactory } from '../../core/errors/errorFactory.js';
import type { ErrorHandler } from '../../core/errors/errorHandler.js';
import type { Logger } from '../../core/logger/logger.js';
import { AbstractTransport } from '../AbstractTransport.js';

/**
 * Implementation of a popup window transport
 *
 * Opens a popup window and establishes message communication with it.
 * Extends AbstractTransport to inherit retry logic and event management.
 *
 * @extends AbstractTransport
 *
 * ## Usage Example
 *
 * ```typescript
 * // Create a popup transport to a wallet URL
 * const transport = new PopupWindowTransport({
 *   url: 'https://my-wallet.com/connect',
 *   width: 400,
 *   height: 600,
 *   target: 'WalletConnect',  // Window name
 *   features: 'menubar=no'    // Additional window features
 * }, logger, errorHandler);
 *
 * // Connect and listen for messages
 * await transport.connect();
 *
 * transport.on('message', (event) => {
 *   console.log('Received message:', event.data);
 * });
 *
 * transport.on('disconnected', (event) => {
 *   console.log('Popup closed:', event.reason);
 * });
 *
 * // Send messages
 * await transport.send({
 *   method: 'eth_requestAccounts',
 *   params: []
 * });
 *
 * // Cleanup when done
 * await transport.destroy();
 * ```
 *
 * ## Connection Flow
 *
 * 1. Open popup window with specified URL
 * 2. Set up message listener for postMessage events
 * 3. Wait for 'ready' or 'wallet_ready' message
 * 4. Mark as connected and resolve connect promise
 * 5. Begin normal message exchange
 *
 * @class PopupWindowTransport
 */
export class PopupWindowTransport extends AbstractTransport {
  /**
   * The popup window instance
   */
  private popup: Window | null = null;

  /**
   * Interval for checking if the popup is closed
   */
  private checkClosedInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Whether the transport is connected
   */
  protected override connected = false;

  /**
   * Configuration for the transport
   */
  protected override config: PopupConfig = {};

  /**
   * Target origin for postMessage
   */
  private targetOrigin = '*';

  /**
   * Popup configuration
   */
  private popupConfig: PopupConfig;

  /**
   * Whether this transport is running in a popup context (has window.opener)
   */
  private isPopupContext = false;

  /**
   * Reference to the opener window (when in popup context)
   */
  private openerWindow: Window | null = null;

  /**
   * Last message origin from MessageEvent (browser-validated)
   * Used for getMessageContext() to provide trusted origin information
   */
  private lastMessageOrigin?: string;

  /**
   * Create a new popup transport
   *
   * @param config - Transport configuration
   * @param logger - Logger instance for this transport
   * @param errorHandler - Error handler instance for this transport
   */
  constructor(config: PopupConfig, logger: Logger, errorHandler: ErrorHandler) {
    super(config, logger, errorHandler);

    // Detect if we're running in a popup context (has window.opener)
    if (typeof window !== 'undefined' && window?.opener && window.opener !== window) {
      this.isPopupContext = true;
      this.openerWindow = window.opener;
      this.log('debug', 'PopupWindowTransport running in popup context');
    } else {
      this.log('debug', 'PopupWindowTransport running in opener context');
    }

    // Create a deep copy of the config to avoid mutation
    this.popupConfig = {
      // Default empty string if url is undefined
      url: config.url ?? '',
      target: config.target ?? '_blank',
      features: config.features ?? this.createFeatures(config),
    };

    // Extract origin from URL for security
    if (config.url) {
      try {
        const url = new URL(config.url);
        this.targetOrigin = url.origin;
      } catch (e) {
        // If URL parsing fails, we'll keep the default '*'
        this.log('warn', 'Invalid URL provided to popup transport, using wildcard origin', {
          url: config.url,
          error: e,
        });
      }
    }

    // In popup context, override targetOrigin to be the opener's origin if available
    if (this.isPopupContext && this.openerWindow) {
      try {
        // Try to get opener's origin (may fail due to cross-origin restrictions)
        // Fall back to config URL or wildcard if not accessible
        if (config.url) {
          // If URL is provided, use it as the expected opener origin
          this.targetOrigin = new URL(config.url).origin;
        } else {
          // Try to access opener's location (might be blocked by CORS)
          try {
            this.targetOrigin = this.openerWindow.location.origin;
          } catch {
            // Can't access opener's origin due to CORS, use wildcard
            this.targetOrigin = '*';
            this.log('debug', 'Cannot access opener origin due to CORS, using wildcard');
          }
        }
      } catch (_e) {
        this.targetOrigin = '*';
      }
    }
  }

  /**
   * Create default window features string for the popup
   *
   * Calculates position to center the popup on screen and formats
   * window features for the window.open() API.
   *
   * @param {PopupConfig} config - Configuration object with optional width and height
   * @returns Window features string formatted for window.open()
   *
   * @example
   * ```typescript
   * // Returns: "width=500,height=600,left=460,top=90,resizable=yes,scrollbars=yes"
   * createFeatures({ width: 500, height: 600 })
   * ```
   */
  private createFeatures(config: PopupConfig): string {
    const width = config.width ?? 500;
    const height = config.height ?? 600;
    const left = typeof window !== 'undefined' ? (window.innerWidth - width) / 2 : 0;
    const top = typeof window !== 'undefined' ? (window.innerHeight - height) / 2 : 0;

    return `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`;
  }

  /**
   * Get typed config
   */
  private get typedConfig(): PopupConfig {
    return this.config;
  }

  /**
   * Emit a transport event
   *
   * @param event - Event to emit
   */
  // biome-ignore lint/suspicious/noExplicitAny: Event type is defined by base class
  protected override emit(event: any): void {
    // Call the parent emit method which uses EventTarget
    super.emit(event);
  }

  /**
   * Internal implementation of connect method
   */
  protected async connectInternal(): Promise<void> {
    // Don't reconnect if already connected
    if (this.connected) {
      return;
    }

    return new Promise((resolve, reject) => {
      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      let firstMessageHandler: ((event: MessageEvent) => void) | null = null;

      // Helper to clean up resources on failure or timeout
      const cleanupOnFailure = async () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        if (firstMessageHandler) {
          window.removeEventListener('message', firstMessageHandler);
          firstMessageHandler = null;
        }

        // Use centralized cleanup for the rest of the resources
        await this.cleanupResources();
      };

      try {
        // In popup context, we don't open a new window - we're already in the popup
        if (this.isPopupContext) {
          this.log('debug', 'Popup context: Skipping window.open, using opener reference');
          // We don't open a window - we use the opener reference
          // No need to set this.popup as we'll use this.openerWindow for communication
        } else {
          // Opener context: Open the popup window as usual
          const url = this.popupConfig.url;

          if (!url) {
            throw ErrorFactory.configurationError('Popup URL is required', {
              transport: 'popup',
            });
          }

          // Calculate dimensions and position
          const width = this.typedConfig.width || 400;
          const height = this.typedConfig.height || 600;
          const left = typeof window !== 'undefined' ? (window.innerWidth - width) / 2 : 0;
          const top = typeof window !== 'undefined' ? (window.innerHeight - height) / 2 : 0;

          // Open the popup
          this.popup = window.open(
            url,
            this.popupConfig.target || '_blank',
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`,
          );

          if (!this.popup) {
            throw ErrorFactory.transportError(
              'Failed to open popup. It may have been blocked by the browser.',
              'popup',
            );
          }
        }

        // Set up message listener
        this.setupMessageListener();

        // Set up close detection
        this.setupCloseDetection();

        // In popup context, we're immediately connected (no need to wait for ready message)
        if (this.isPopupContext) {
          this.log('debug', 'Popup context: Immediately marking as connected');
          this.connected = true;

          // Emit connected event
          this.emit({
            type: 'connected',
          } as TransportConnectedEvent);

          // Send a ready message to the opener to let it know we're ready
          if (this.openerWindow) {
            try {
              this.openerWindow.postMessage({ type: 'wallet_ready' }, this.targetOrigin);
              this.log('debug', 'Sent wallet_ready message to opener');
            } catch (error) {
              this.log('warn', 'Failed to send wallet_ready to opener', { error });
            }
          }

          resolve();
          return;
        }

        // For opener context, set connection timeout as before
        timeoutId = setTimeout(async () => {
          await cleanupOnFailure();
          reject(
            ErrorFactory.connectionFailed('Popup connection timeout', {
              transport: 'popup',
              timeout: this.typedConfig.timeout || 30000,
            }),
          );
        }, this.typedConfig.timeout || 30000);

        // Function to be called when connected
        const handleConnected = () => {
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }

          if (firstMessageHandler) {
            window.removeEventListener('message', firstMessageHandler);
            firstMessageHandler = null;
          }

          this.connected = true;

          // Emit connected event
          this.emit({
            type: 'connected',
          } as TransportConnectedEvent);

          resolve();
        };

        // Listen for the first message to consider connected
        firstMessageHandler = (event: MessageEvent) => {
          // Log all incoming messages during connection phase for debugging
          this.log('debug', 'Connection phase message received', {
            origin: event.origin,
            source: event.source === this.popup ? 'popup' : 'other',
            data: event.data,
            targetOrigin: this.targetOrigin,
          });

          try {
            // Only process messages from our popup window
            if (event.source !== this.popup) {
              // Don't log - many messages from other sources during connection
              return;
            }

            // Check origin for security - only for messages from our popup
            if (this.targetOrigin !== '*' && event.origin !== this.targetOrigin) {
              this.log('debug', 'Popup message from unexpected origin during connection', {
                origin: event.origin,
                expectedOrigin: this.targetOrigin,
              });
              return;
            }

            // Parse the data if it's a string
            let data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

            // Check if this is a wrapped wallet message from CrossWindowTransport
            // The wallet uses CrossWindowTransport which wraps messages in this format
            if (data && typeof data === 'object' && data.type === 'walletmesh_message') {
              this.log('debug', 'Unwrapping walletmesh_message during connection', {
                wrappedMessage: data,
                actualData: data.data,
              });
              // Unwrap the actual message from the wrapper
              data = data.data;
            }

            // If this is a ready message (supports both 'ready' and 'wallet_ready')
            if (data && (data.type === 'ready' || data.type === 'wallet_ready')) {
              this.log('info', 'Received wallet ready message', { data, source: 'popup' });
              if (firstMessageHandler) {
                window.removeEventListener('message', firstMessageHandler);
                firstMessageHandler = null;
              }
              handleConnected();
            }
          } catch (error) {
            // Log parsing errors for debugging
            this.log('debug', 'Error parsing message during connection', { error });
          }
        };

        window.addEventListener('message', firstMessageHandler);
      } catch (error) {
        cleanupOnFailure()
          .then(() => {
            reject(error);
          })
          .catch((cleanupError) => {
            this.logger?.error('Error during cleanup after connection failure', cleanupError);
            reject(error); // Still reject with original error
          });
      }
    });
  }

  /**
   * Set up the message event listener
   *
   * Creates a message handler that:
   * - Validates message origin for security
   * - Filters messages to only those from our popup
   * - Parses message data (supports JSON strings)
   * - Emits typed transport events
   * - Handles parsing errors gracefully
   */
  private setupMessageListener(): void {
    const messageHandler = (event: MessageEvent) => {
      // Check message source based on context
      let isFromExpectedSource = false;

      if (this.isPopupContext) {
        // In popup context: Accept messages from the opener
        isFromExpectedSource = event.source === this.openerWindow;
      } else {
        // In opener context: Accept messages from the popup we opened
        isFromExpectedSource = event.source === this.popup;
      }

      // Log all incoming messages for debugging
      this.log('debug', 'Received postMessage event', {
        origin: event.origin,
        expectedOrigin: this.targetOrigin,
        isPopupContext: this.isPopupContext,
        fromExpectedSource: isFromExpectedSource,
        eventSource: event.source,
        expectedSource: this.isPopupContext ? this.openerWindow : this.popup,
        dataType: typeof event.data,
        data: event.data,
      });

      // Only accept messages from the expected source window
      // This prevents us from processing messages from other windows, extensions, etc.
      if (!isFromExpectedSource) {
        // Don't log these - there can be many messages from other sources
        return;
      }

      // Now validate origin for messages from our popup - this is the security control
      // This ensures messages actually from our popup come from the expected origin
      if (this.targetOrigin !== '*' && event.origin !== this.targetOrigin) {
        this.log('warn', 'Popup message from unexpected origin', {
          origin: event.origin,
          expectedOrigin: this.targetOrigin,
        });
        return;
      }

      // Capture the browser-validated origin for validation and getLastMessageContext()
      this.captureOrigin(event.origin);
      this.lastMessageOrigin = event.origin;

      // Process the message from our popup
      try {
        // Parse the data if it's a string
        let data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        // Validate _context.origin using shared validation logic
        const validation = this.validateOrigin(data, {
          additionalContext: {
            targetOrigin: this.targetOrigin,
          },
        });

        if (!validation.valid && validation.error) {
          this.log('error', 'Origin validation failed: _context.origin mismatch', validation.context);
          this.emit({
            type: 'error',
            error: validation.error,
          } as TransportErrorEvent);
          return; // Reject message
        }

        // Check if this is a wrapped wallet message from CrossWindowTransport
        // The wallet uses CrossWindowTransport which wraps messages in this format
        if (data && typeof data === 'object' && data.type === 'walletmesh_message') {
          this.log('debug', 'Unwrapping walletmesh_message', {
            wrappedMessage: data,
            actualData: data.data,
          });
          // Unwrap the actual JSON-RPC message from the wrapper
          data = data.data;
        }

        // Emit message event with the (potentially unwrapped) data
        this.emit({
          type: 'message',
          data,
        } as TransportMessageEvent);
      } catch (error) {
        // Emit error event for parsing failures
        const modalError = ErrorFactory.messageFailed('Failed to parse popup message', {
          transport: 'popup',
          originalError: error,
        });
        this.emit({
          type: 'error',
          error: modalError,
        } as TransportErrorEvent);
      }
    };

    window.addEventListener('message', messageHandler);

    // Store the handler to remove it on disconnect
    // biome-ignore lint/suspicious/noExplicitAny: Storing handler as dynamic property
    (this as any).messageHandler = messageHandler;
  }

  /**
   * Set up detection for popup window closing
   *
   * Uses polling to detect when the popup is closed by the user.
   * This is necessary because there's no direct event for popup closure.
   * Polls every 500ms to balance responsiveness with performance.
   */
  private setupCloseDetection(): void {
    // Skip close detection in popup context - we can't reliably detect if opener closed
    if (this.isPopupContext) {
      // In popup context, we could check if opener is still accessible,
      // but this might not work reliably across all browsers
      return;
    }

    // Check periodically if the popup is closed (only in opener context)
    this.checkClosedInterval = setInterval(() => {
      if (this.popup?.closed) {
        // We can't use await in setInterval callback, so we have to handle potential
        // promise rejection explicitly to avoid unhandled promise rejections
        this.handlePopupClosed().catch((error) => {
          this.logError('Error handling popup closure', error);
        });
      }
    }, 500);
  }

  /**
   * Handle popup window being closed
   */
  private async handlePopupClosed(): Promise<void> {
    // Use centralized cleanup logic
    await this.cleanupResources();

    // Emit disconnected event with specific reason
    this.emit({
      type: 'disconnected',
      reason: 'Popup closed',
    } as TransportDisconnectedEvent);
  }

  /**
   * Internal implementation of disconnect method
   */
  protected async disconnectInternal(): Promise<void> {
    await this.cleanupResources();

    // Emit disconnected event
    this.emit({
      type: 'disconnected',
    } as TransportDisconnectedEvent);
  }

  /**
   * Centralized cleanup logic for popup resources
   * Used by both disconnect and destroy methods
   */
  private async cleanupResources(): Promise<void> {
    // Clear the close detection interval
    if (this.checkClosedInterval) {
      clearInterval(this.checkClosedInterval);
      this.checkClosedInterval = null;
    }

    // Close the popup if it exists
    if (this.popup && !this.popup.closed) {
      this.popup.close();
    }

    // Update state
    this.connected = false;
    this.popup = null;

    // Remove message listener
    // biome-ignore lint/suspicious/noExplicitAny: Accessing dynamic property
    if ((this as any).messageHandler) {
      // biome-ignore lint/suspicious/noExplicitAny: Accessing dynamic property
      window.removeEventListener('message', (this as any).messageHandler);
      // biome-ignore lint/suspicious/noExplicitAny: Clearing dynamic property
      (this as any).messageHandler = null;
    }
  }

  /**
   * Internal implementation of send method
   *
   * Sends data to the popup window using postMessage API.
   * Validates connection state and popup availability before sending.
   *
   * @param {unknown} data - Data to send (will be serialized by postMessage)
   * @throws {Error} Transport not connected or popup closed
   *
   * @example
   * ```typescript
   * // Internally called by AbstractTransport.send()
   * await this.sendInternal({
   *   jsonrpc: '2.0',
   *   method: 'wallet_requestPermissions',
        // biome-ignore lint/style/useNamingConvention: RPC method name follows specification
   *   params: [{ eth_accounts: {} }],
   *   id: 1
   * });
   * ```
   */
  protected async sendInternal(data: unknown): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.connected) {
        reject(ErrorFactory.transportError('Not connected', 'popup'));
        return;
      }

      // Get the target window based on context
      const targetWindow = this.isPopupContext ? this.openerWindow : this.popup;

      if (!targetWindow || (targetWindow as Window).closed) {
        reject(
          ErrorFactory.transportDisconnected(
            this.isPopupContext ? 'Opener closed' : 'Popup closed',
            'window_closed',
          ),
        );
        return;
      }

      try {
        // Don't try to access window.location as it will throw a SecurityError for cross-origin
        console.log('[PopupWindowTransport] Sending message:', {
          data,
          targetOrigin: this.targetOrigin,
          isPopupContext: this.isPopupContext,
          targetWindow: this.isPopupContext ? 'opener' : 'popup',
          windowClosed: (targetWindow as Window).closed,
        });
        targetWindow.postMessage(data, this.targetOrigin);
        console.log('[PopupWindowTransport] Message sent successfully');
        resolve();
      } catch (error) {
        console.error('[PopupWindowTransport] Failed to send message:', error);
        reject(error);
      }
    });
  }

  /**
   * Explicit cleanup method that extends AbstractTransport's destroy
   * This adds popup-specific resource cleanup before calling the parent destroy
   * @inheritdoc
   */
  public override async destroy(): Promise<void> {
    // First clean up popup-specific resources
    await this.cleanupResources();

    // Then let the parent class do its cleanup
    await super.destroy();

    this.log('debug', 'Popup transport destroyed');
  }

  /**
   * Get trusted context information for the most recently received message.
   * Provides browser-validated origin from MessageEvent.origin, which is
   * guaranteed to be accurate by the browser's security model.
   *
   * @returns TransportContext with browser-validated origin if available
   *
   * @example
   * ```typescript
   * const context = transport.getLastMessageContext();
   * if (context) {
   *   console.log('Message from origin:', context.origin);
   *   console.log('Browser-validated:', context.trustedSource); // true
   * }
   * ```
   */
  public getLastMessageContext(): TransportContext | undefined {
    if (!this.lastMessageOrigin) {
      return undefined;
    }

    return {
      origin: this.lastMessageOrigin,
      trustedSource: true, // Browser-validated via MessageEvent.origin
      transportType: 'popup',
    };
  }

  /**
   * Get transport type identifier
   */
  protected getTransportType(): string {
    return 'popup';
  }

  /**
   * Override to indicate this transport uses browser-validated origins
   */
  protected override isBrowserValidatedOrigin(): boolean {
    return true;
  }
}
