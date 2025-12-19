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

// Type definitions for browser extension APIs
type RuntimePort = {
  onMessage: {
    addListener: (callback: (message: unknown) => void) => void;
    removeListener: (callback: (message: unknown) => void) => void;
  };
  onDisconnect: {
    addListener: (callback: () => void) => void;
    removeListener: (callback: () => void) => void;
  };
  postMessage: (message: unknown) => void;
  disconnect: () => void;
};

type RuntimeAPI = {
  connect: (extensionId: string, connectInfo?: { name?: string }) => RuntimePort;
};

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
   * Browser extension port connection (Chrome or Firefox)
   * @type {RuntimePort | null}
   * @private
   */
  private port: RuntimePort | null = null;
  private ready = false;
  private readyTimeout: ReturnType<typeof setTimeout> | null = null;
  private pendingQueue: unknown[] = [];
  private connectionResolve: (() => void) | null = null;
  private connectionReject: ((error: Error) => void) | null = null;

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
   * Internal method to connect to the browser extension
   * Works with both Chrome and Firefox extensions from dApp context
   * @throws {ModalError} If browser extension API is unavailable or connection fails
   * @protected
   * @async
   */
  protected async connectInternal(): Promise<void> {
    if (this.connected) {
      return;
    }

    // Direct browser API detection - works from dApp context
    // Check for browser.runtime (Firefox) or chrome.runtime (Chrome, Edge, Opera, Brave)
    const browserGlobal = (globalThis as { browser?: { runtime?: RuntimeAPI } }).browser;
    const chromeGlobal = (globalThis as { chrome?: { runtime?: RuntimeAPI } }).chrome;

    const runtimeAPI = browserGlobal?.runtime || chromeGlobal?.runtime;
    const apiType = browserGlobal?.runtime ? 'browser' : chromeGlobal?.runtime ? 'chrome' : 'none';

    if (!runtimeAPI) {
      const error = ErrorFactory.transportError(
        `Browser extension API not available (detected: ${apiType})`,
        'chrome-extension',
      );
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
            (this.logger.info || this.logger.debug || console.info).call(
              this.logger,
              `ChromeExtensionTransport: connecting to extension (using ${apiType} API)`,
              {
                extensionId: this.config.extensionId,
                attempt,
                apiType,
              },
            );

            // Connect to extension using native browser API
            // This works from any web page context (dApp) to connect to an extension
            this.port = runtimeAPI.connect(this.config.extensionId, {
              name: 'walletmesh-transport',
            });

            if (!this.port) {
              throw ErrorFactory.connectionFailed('Failed to create port connection', {
                transport: 'chrome-extension',
              });
            }

            // Set up message handlers
            this.port.onMessage.addListener(this.handleMessage);
            this.port.onDisconnect.addListener(this.handleDisconnect);
            (this.logger.info || this.logger.debug || console.info).call(
              this.logger,
              'ChromeExtensionTransport: port established, handlers attached',
            );

            // Give time for the timeout to potentially occur first
            queueMicrotask(() => {
              // Check if we've already timed out (timeout was cleared due to timeout occurring)
              if (!this.connectTimeout) {
                // The timeout has already fired and cleared itself, don't proceed
                return;
              }

              // Clear initial connection timeout
              if (this.connectTimeout) {
                clearTimeout(this.connectTimeout);
                this.connectTimeout = null;
              }

              // Store resolve/reject for later use when wallet_ready is received or times out
              this.connectionResolve = resolve;
              this.connectionReject = reject;

              // Wait for explicit wallet_ready message before marking as connected
              this.ready = false;
              this.readyTimeout = setTimeout(() => {
                (this.logger.error || this.logger.warn || console.error).call(
                  this.logger,
                  'ChromeExtensionTransport: wallet_ready timeout - connection failed',
                );

                // Clear other timeouts (but not readyTimeout since we're inside it)
                if (this.connectTimeout) {
                  clearTimeout(this.connectTimeout);
                  this.connectTimeout = null;
                }
                if (this.reconnectTimer) {
                  clearTimeout(this.reconnectTimer);
                  this.reconnectTimer = null;
                }

                // Save and clear connection callbacks
                const rejectCallback = this.connectionReject;
                this.connectionResolve = null;
                this.connectionReject = null;

                this.connected = false;
                this.readyTimeout = null; // Clear readyTimeout reference

                // Remove event listeners
                if (this.port) {
                  if (this.port.onMessage) {
                    this.port.onMessage.removeListener(this.handleMessage);
                  }
                  if (this.port.onDisconnect) {
                    this.port.onDisconnect.removeListener(this.handleDisconnect);
                  }
                  try {
                    this.port.disconnect();
                  } catch (_error) {
                    // Ignore errors on disconnect
                  }
                  this.port = null;
                }

                // Create connection timeout error
                const error = ErrorFactory.connectionFailed(
                  'Connection timeout: wallet_ready message not received',
                  {
                    transport: 'chrome-extension',
                    timeout: this.config.timeout,
                  },
                );

                // Emit error event
                this.emit({
                  type: 'error',
                  error,
                } as TransportEvent);

                // Reject the connection using the saved callback
                if (rejectCallback) {
                  rejectCallback(error);
                }
              }, this.config.timeout);

              (this.logger.info || this.logger.debug || console.info).call(
                this.logger,
                'ChromeExtensionTransport: port established, waiting for wallet_ready message',
              );
            });
          } catch (error) {
            this.clearTimeouts();
            (this.logger.error || this.logger.warn || console.error).call(
              this.logger,
              'ChromeExtensionTransport: connect failed',
              error,
            );
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
      } catch (_error) {
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
      // Send raw JSON-RPC message - wallet adds type field for routing
      (this.logger.info || this.logger.debug || console.info).call(
        this.logger,
        'ChromeExtensionTransport: sending message',
        {
          payload:
            data && typeof data === 'object'
              ? {
                  jsonrpc: (data as any).jsonrpc,
                  id: (data as any).id,
                  method: (data as any).method,
                }
              : { type: typeof data },
        },
      );
      if (!this.ready) {
        this.pendingQueue.push(data);
        (this.logger.info || this.logger.debug || console.info).call(
          this.logger,
          'ChromeExtensionTransport: queued message (not ready yet)',
        );
        return;
      }
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
    (this.logger.info || this.logger.debug || console.info).call(
      this.logger,
      'ChromeExtensionTransport: received message',
    );
    // Detect readiness notification from extension
    try {
      const m = message as any;
      if ((m && m.type === 'wallet_ready') || (m && m.jsonrpc === '2.0' && m.method === 'wallet_ready')) {
        (this.logger.info || this.logger.debug || console.info).call(
          this.logger,
          'ChromeExtensionTransport: received wallet_ready, marking as connected',
        );

        // Mark as ready and connected
        this.ready = true;
        this.connected = true;

        // Clear the ready timeout
        if (this.readyTimeout) {
          clearTimeout(this.readyTimeout);
          this.readyTimeout = null;
        }

        // Flush any queued messages
        this.flushQueue();

        // Emit connected event
        this.emit({
          type: 'connected',
        } as TransportEvent);

        // Resolve the connection promise if waiting
        if (this.connectionResolve) {
          this.connectionResolve();
          this.connectionResolve = null;
          this.connectionReject = null;
        }

        return;
      }
      // Detect PXE readiness status; propagate as normal message so providers can subscribe
      if (
        m &&
        m.jsonrpc === '2.0' &&
        m.method === 'aztec_status' &&
        m.params &&
        typeof m.params === 'object'
      ) {
        // Do not alter ready flag here; this is separate from transport readiness
        // Forward event to consumers
      }
    } catch {}

    // Validate _context.origin using shared validation logic
    // Extension sees dApp origin via sender.origin and can include it in _context
    const validation = this.validateOrigin(message, {
      additionalContext: {
        extensionId: this.config.extensionId,
      },
    });

    if (!validation.valid && validation.error) {
      (this.logger.error || this.logger.warn || console.error).call(
        this.logger,
        'ChromeExtensionTransport: Origin validation failed - _context.origin mismatch',
        validation.context,
      );

      this.emit({
        type: 'error',
        error: validation.error,
      } as TransportEvent);

      return; // Reject message
    }

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
    (this.logger.info || this.logger.debug || console.info).call(
      this.logger,
      'ChromeExtensionTransport: port disconnected',
    );
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
    if (this.readyTimeout) {
      clearTimeout(this.readyTimeout);
      this.readyTimeout = null;
    }

    // Clear connection promise callbacks
    this.connectionResolve = null;
    this.connectionReject = null;
  }

  private flushQueue(): void {
    if (!this.port) {
      this.pendingQueue = [];
      return;
    }
    const items = this.pendingQueue;
    this.pendingQueue = [];
    for (const item of items) {
      try {
        this.port.postMessage(item);
      } catch (err) {
        (this.logger.error || this.logger.warn || console.error).call(
          this.logger,
          'ChromeExtensionTransport: failed to flush queued message',
          err,
        );
      }
    }
  }

  /**
   * Get transport type identifier
   */
  protected getTransportType(): string {
    return 'chrome-extension';
  }
}
