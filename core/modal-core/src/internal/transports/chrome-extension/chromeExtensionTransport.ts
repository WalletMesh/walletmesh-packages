/**
 * Chrome extension transport implementation
 *
 * Provides communication with Chrome extensions via the Chrome runtime API.
 * Handles connection management, message passing, and error recovery.
 *
 * @module transports/chromeExtension
 * @internal
 */

import type { ChromeExtensionConfig, TransportEvent } from '../../../types.js';
import { ErrorFactory } from '../../core/errors/errorFactory.js';
import type { ErrorHandler } from '../../core/errors/errorHandler.js';
import type { Logger } from '../../core/logger/logger.js';
import { AbstractTransport } from '../AbstractTransport.js';

// Define Chrome types for TypeScript

/**
 * Chrome port interface for extension communication
 * @interface ChromePort
 */
interface ChromePort {
  /**
   * Send a message through the port
   * @param {any} message - Message to send
   * @returns {void}
   */
  // biome-ignore lint/suspicious/noExplicitAny: Chrome extension messages can be any type
  postMessage: (message: any) => void;
  /**
   * Message event handler
   * @type {ChromeEvent}
   */
  onMessage: ChromeEvent;
  /**
   * Disconnect event handler
   * @type {ChromeEvent}
   */
  onDisconnect: ChromeEvent;
  /**
   * Disconnect from the port
   * @returns {void}
   */
  disconnect: () => void;
}

/**
 * Chrome event interface
 * @interface ChromeEvent
 */
interface ChromeEvent {
  /**
   * Add event listener
   * @param {function(any): void} callback - Event callback
   * @returns {void}
   */
  // biome-ignore lint/suspicious/noExplicitAny: Chrome extension event data can be any type
  addListener: (callback: (data: any) => void) => void;
  /**
   * Remove event listener
   * @param {function(any): void} callback - Event callback
   * @returns {void}
   */
  // biome-ignore lint/suspicious/noExplicitAny: Chrome extension event data can be any type
  removeListener: (callback: (data: any) => void) => void;
}

/**
 * Chrome runtime interface
 * @interface ChromeRuntime
 */
interface ChromeRuntime {
  /**
   * Connect to extension
   * @param {string} extensionId - Extension ID
   * @returns {ChromePort}
   */
  connect: (extensionId: string) => ChromePort;
}

/**
 * Chrome API interface
 * @interface Chrome
 */
interface Chrome {
  /**
   * Runtime API
   * @type {ChromeRuntime}
   */
  runtime?: ChromeRuntime;
}

/**
 * Window with Chrome API
 * @interface WindowWithChrome
 * @extends {Window}
 */
interface WindowWithChrome extends Window {
  /**
   * Chrome API
   * @type {Chrome}
   */
  chrome?: Chrome;
}

// Note: chrome types are already declared by @types/chrome

/**
 * Transport implementation for communication with Chrome extensions
 *
 * Provides reliable communication with Chrome browser extensions via the
 * Chrome runtime API. Includes automatic retry logic and connection recovery.
 *
 * @class ChromeExtensionTransport
 * @extends {AbstractTransport}
 */
export class ChromeExtensionTransport extends AbstractTransport {
  /**
   * Create a Chrome extension transport from a discovered wallet
   * @param {QualifiedResponder} wallet - Discovered wallet with transport config
   * @param {Logger} logger - Logger instance
   * @param {ErrorHandler} errorHandler - Error handler instance
   * @param {Partial<ChromeExtensionConfig>} additionalConfig - Additional configuration
   * @returns {ChromeExtensionTransport} New transport instance
   * @throws {ModalError} If wallet doesn't support Chrome extension transport
   * @static
   */
  static fromDiscoveredWallet(
    wallet: import('@walletmesh/discovery').QualifiedResponder,
    logger: Logger,
    errorHandler: ErrorHandler,
    additionalConfig?: Partial<ChromeExtensionConfig>,
  ): ChromeExtensionTransport {
    // Validate wallet supports Chrome extension transport
    if (wallet.transportConfig?.type !== 'extension' || !wallet.transportConfig?.extensionId) {
      throw ErrorFactory.invalidTransport(
        'Wallet does not support Chrome extension transport',
        'chrome-extension',
      );
    }

    // Create configuration from wallet config
    const config: ChromeExtensionConfig = {
      extensionId: wallet.transportConfig.extensionId,
      timeout: additionalConfig?.timeout || 30000,
      retries: additionalConfig?.retries || 3,
      retryDelay: additionalConfig?.retryDelay || 1000,
      reconnect: additionalConfig?.reconnect || false,
      reconnectInterval: additionalConfig?.reconnectInterval || 5000,
      ...additionalConfig,
    };

    return new ChromeExtensionTransport(config, logger, errorHandler);
  }
  /**
   * Chrome runtime port connection
   * @type {ChromePort | null}
   * @private
   */
  private port: ChromePort | null = null;

  /**
   * Current connection attempt timeout
   * @type {ReturnType<typeof setTimeout> | null}
   * @private
   */
  private connectTimeout: ReturnType<typeof setTimeout> | null = null;

  /**
   * Reconnection timer
   * @type {ReturnType<typeof setTimeout> | null}
   * @private
   */
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Configuration with defaults
   * @type {Required<ChromeExtensionConfig>}
   * @protected
   */
  protected override config: Required<ChromeExtensionConfig>;

  /**
   * Constructor for Chrome extension transport
   * @param {ChromeExtensionConfig} config - Transport configuration
   * @param {Logger} logger - Logger instance for this transport
   * @param {ErrorHandler} errorHandler - Error handler instance for this transport
   */
  constructor(config: ChromeExtensionConfig, logger: Logger, errorHandler: ErrorHandler) {
    super(config, logger, errorHandler);

    // Set default values
    this.config = {
      extensionId: config.extensionId,
      timeout: config.timeout || 30000,
      url: config.url || '',
      retries: config.retries || 3,
      retryDelay: config.retryDelay || 1000,
      reconnect: config.reconnect || false,
      reconnectInterval: config.reconnectInterval || 5000,
    };
  }

  /**
   * Internal method to connect to the Chrome extension
   * @throws {ModalError} If Chrome API is unavailable or connection fails
   * @protected
   * @async
   */
  protected async connectInternal(): Promise<void> {
    if (this.connected) {
      return;
    }

    if (typeof window === 'undefined' || !(window as WindowWithChrome).chrome?.runtime) {
      const error = ErrorFactory.transportError('Chrome runtime API not available', 'chrome-extension');
      this.emit({
        type: 'error',
        error,
      } as TransportEvent);
      throw error;
    }

    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.config.retries; attempt++) {
      try {
        await new Promise<void>((resolve, reject) => {
          // Set up timeout
          this.connectTimeout = setTimeout(() => {
            this.clearTimeouts();
            reject(
              ErrorFactory.connectionFailed(`Connection attempt ${attempt} timed out`, {
                transport: 'chrome-extension',
                attempt,
              }),
            );
          }, this.config.timeout);

          try {
            const chromeWindow = window as WindowWithChrome;
            if (!chromeWindow.chrome?.runtime?.connect) {
              throw ErrorFactory.transportError('Chrome runtime connect not available', 'chrome-extension');
            }

            this.port = chromeWindow.chrome.runtime.connect(this.config.extensionId);

            if (!this.port) {
              throw ErrorFactory.connectionFailed('Failed to create port connection', {
                transport: 'chrome-extension',
              });
            }

            // Set up message handlers
            this.port.onMessage.addListener(this.handleMessage);
            this.port.onDisconnect.addListener(this.handleDisconnect);

            // Give time for the timeout to potentially occur first
            queueMicrotask(() => {
              // Check if we've already timed out (timeout was cleared due to timeout occurring)
              if (!this.connectTimeout) {
                // The timeout has already fired and cleared itself, don't proceed
                return;
              }

              // Clear timeout and mark as connected
              this.clearTimeouts();
              this.connected = true;

              // Emit connected event
              this.emit({
                type: 'connected',
              } as TransportEvent);

              resolve();
            });
          } catch (error) {
            this.clearTimeouts();
            reject(error);
          }
        });

        // Connected successfully
        return;
      } catch (error) {
        lastError = error as Error;

        // For the last attempt, don't retry
        if (attempt >= this.config.retries) {
          break;
        }

        // Wait before retrying
        await new Promise((resolve) => {
          this.reconnectTimer = setTimeout(resolve, this.config.retryDelay);
        });
      }
    }

    // Failed after all retries
    const finalError =
      lastError ||
      ErrorFactory.connectionFailed('Failed to connect to Chrome extension', {
        transport: 'chrome-extension',
      });
    this.emit({
      type: 'error',
      error: finalError,
    } as TransportEvent);

    throw finalError;
  }

  /**
   * Internal method to disconnect from the Chrome extension
   * @protected
   * @async
   */
  protected async disconnectInternal(): Promise<void> {
    this.clearTimeouts();

    if (this.port) {
      // Remove event listeners
      if (this.port.onMessage) {
        this.port.onMessage.removeListener(this.handleMessage);
      }
      if (this.port.onDisconnect) {
        this.port.onDisconnect.removeListener(this.handleDisconnect);
      }

      // Disconnect the port
      try {
        this.port.disconnect();
      } catch (error) {
        // Ignore errors on disconnect
      }

      this.port = null;
    }

    this.connected = false;

    // Emit disconnected event
    this.emit({
      type: 'disconnected',
      reason: 'Disconnected by user',
    } as TransportEvent);
  }

  /**
   * Internal method to send data to the Chrome extension
   * @param {unknown} data - Data to send
   * @throws {ModalError} If transport is not connected or sending fails
   * @protected
   * @async
   */
  protected async sendInternal(data: unknown): Promise<void> {
    if (!this.connected || !this.port) {
      throw ErrorFactory.transportError('Transport is not connected', 'chrome-extension');
    }

    try {
      this.port.postMessage(data);
    } catch (error) {
      const modalError = ErrorFactory.messageFailed('Failed to send message', {
        transport: 'chrome-extension',
        originalError: error,
      });
      this.emit({
        type: 'error',
        error: modalError,
      } as TransportEvent);

      throw error;
    }
  }

  /**
   * Handle incoming messages from the Chrome extension
   * @param {unknown} message - Received message data
   * @returns {void}
   * @private
   */
  private handleMessage = (message: unknown) => {
    this.emit({
      type: 'message',
      data: message,
    } as TransportEvent);
  };

  /**
   * Handle port disconnection
   * @returns {void}
   * @private
   */
  private handleDisconnect = () => {
    const wasConnected = this.connected;
    this.connected = false;
    this.port = null;

    if (wasConnected) {
      this.emit({
        type: 'disconnected',
        reason: 'Connection closed by extension',
      } as TransportEvent);
    }
  };

  /**
   * Clear any pending timeouts
   * @private
   */
  private clearTimeouts(): void {
    if (this.connectTimeout) {
      clearTimeout(this.connectTimeout);
      this.connectTimeout = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}
