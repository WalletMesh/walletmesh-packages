import type { Transport } from '../types.js';
import type { ChromeExtensionTransportConfig } from './types.js';
import type ChromeTypes from '../../types/chrome.js';
import { TransportError, TransportErrorCode, DEFAULT_TRANSPORT_CONFIG } from '../types.js';

/**
 * Transport implementation for communication with Chrome extensions
 * Provides messaging capabilities between a web application and Chrome extension
 * using the Chrome runtime messaging API
 *
 * @class ChromeExtensionTransport
 * @implements {Transport}
 */
export class ChromeExtensionTransport implements Transport {
  /** Handler for incoming messages */
  public onMessage: ((data: unknown) => void) | null = null;
  /** Current connection state */
  public isConnected = false;

  /** Chrome runtime port connection */
  private port: ChromeTypes.Runtime.Port | null = null;
  /** Combined configuration with defaults */
  protected readonly config: Required<ChromeExtensionTransportConfig>;
  /** Timeout handle for connection attempts */
  private timeoutHandle: ReturnType<typeof setTimeout> | null = null;
  /** Handle for reconnection delay timer */
  private reconnectHandle: ReturnType<typeof setTimeout> | null = null;

  /**
   * Create a new ChromeExtensionTransport instance
   * @param config - Configuration options for the transport
   */
  constructor(config: ChromeExtensionTransportConfig) {
    this.config = {
      ...DEFAULT_TRANSPORT_CONFIG,
      ...config,
    };
  }

  /**
   * Initialize the transport
   * Verifies that Chrome runtime API is available
   * @throws {TransportError} If Chrome runtime API is not available
   */
  async initialize(): Promise<void> {
    if (typeof window === 'undefined' || !window.chrome?.runtime) {
      throw new TransportError(TransportErrorCode.INITIALIZATION_FAILED, 'Chrome runtime API not available');
    }
  }

  /**
   * Clear any pending timeouts
   * @private
   */
  private clearTimeouts(): void {
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = null;
    }
    if (this.reconnectHandle) {
      clearTimeout(this.reconnectHandle);
      this.reconnectHandle = null;
    }
  }

  /**
   * Connect to the Chrome extension
   * Attempts to establish a connection with retry logic
   * @throws {TransportError} If connection fails after max retries
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      throw new TransportError(TransportErrorCode.INVALID_STATE, 'Transport is already connected');
    }

    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.config.retries + 1; attempt++) {
      try {
        await new Promise<void>((resolve, reject) => {
          // Set up timeout first
          this.timeoutHandle = setTimeout(() => {
            this.clearTimeouts();
            this.isConnected = false;
            reject(new TransportError(TransportErrorCode.TIMEOUT, `Connection attempt ${attempt} timed out`));
          }, this.config.timeout);

          try {
            if (!window.chrome?.runtime?.connect) {
              throw new TransportError(
                TransportErrorCode.CONNECTION_FAILED,
                'Chrome runtime connect not available',
              );
            }

            this.port = window.chrome.runtime.connect(this.config.extensionId);

            if (!this.port) {
              throw new TransportError(
                TransportErrorCode.CONNECTION_FAILED,
                'Failed to create port connection',
              );
            }

            // Setup connection handlers
            this.port.onMessage.addListener(this.handleMessage);
            this.port.onDisconnect.addListener(this.handleDisconnect);

            // Give time for the timeout to potentially occur first
            queueMicrotask(() => {
              // Check if we've timed out during the connection process
              if (!this.timeoutHandle) {
                reject(
                  new TransportError(TransportErrorCode.TIMEOUT, `Connection attempt ${attempt} timed out`),
                );
                return;
              }

              // Clear timeout and mark as connected
              this.clearTimeouts();
              this.isConnected = true;
              resolve();
            });
          } catch (error) {
            this.clearTimeouts();
            reject(
              error instanceof TransportError
                ? error
                : new TransportError(
                    TransportErrorCode.CONNECTION_FAILED,
                    'Failed to establish port connection',
                    error,
                  ),
            );
          }
        });

        // If the promise resolved, we are connected
        return;
      } catch (error) {
        lastError = error as Error;
        this.isConnected = false;

        // For timeouts, throw the original error
        if (error instanceof TransportError && error.code === TransportErrorCode.TIMEOUT) {
          throw error;
        }

        // For other errors, try to reconnect
        if (attempt < this.config.retries + 1) {
          // Wait for retry delay
          await new Promise((resolve) => setTimeout(resolve, this.config.retryDelay));
          continue;
        }

        // Max retries reached
        throw new TransportError(
          TransportErrorCode.CONNECTION_FAILED,
          'Max reconnection attempts reached',
          lastError,
        );
      }
    }
  }

  /**
   * Disconnect from the Chrome extension
   * Cleans up port connection and event listeners
   */
  async disconnect(): Promise<void> {
    this.clearTimeouts();

    if (this.port?.onMessage) {
      this.port.onMessage.removeListener(this.handleMessage);
    }
    if (this.port?.onDisconnect) {
      this.port.onDisconnect.removeListener(this.handleDisconnect);
    }
    if (this.port) {
      try {
        this.port.disconnect();
      } catch (error) {
        // Swallow error on disconnect
      }
      this.port = null;
    }

    this.isConnected = false;
  }

  /**
   * Send data to the Chrome extension
   * @param data - Data to send
   * @throws {TransportError} If not connected or send fails
   */
  async send(data: unknown): Promise<void> {
    if (!this.isConnected || !this.port) {
      throw new TransportError(TransportErrorCode.NOT_CONNECTED, 'Transport is not connected');
    }

    try {
      this.port.postMessage(data);
    } catch (error) {
      throw new TransportError(TransportErrorCode.SEND_FAILED, 'Failed to send message', error);
    }
  }

  /**
   * Handle incoming messages from the Chrome extension
   * @private
   * @param message - Message received from the extension
   */
  private handleMessage = (message: unknown) => {
    if (this.onMessage) {
      this.onMessage(message);
    }
  };

  /**
   * Handle port disconnection
   * Cleans up state when the extension disconnects
   * @private
   */
  private handleDisconnect = () => {
    this.isConnected = false;
    this.port = null;
  };
}
