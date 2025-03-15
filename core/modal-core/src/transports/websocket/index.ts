import type { Transport, TransportConfig } from '../types.js';
import type { WebSocketTransportConfig } from './types.js';
import { TransportError, TransportErrorCode, DEFAULT_TRANSPORT_CONFIG } from '../types.js';

/**
 * Transport implementation using WebSocket for communication
 * Provides bidirectional communication over WebSocket with automatic reconnection
 *
 * @class WebSocketTransport
 * @implements {Transport}
 */
export class WebSocketTransport implements Transport {
  /** Handler for incoming messages */
  public onMessage: ((data: unknown) => void) | null = null;
  /** Current connection state */
  public isConnected = false;

  /** WebSocket instance */
  private ws: WebSocket | null = null;
  /** Combined configuration with defaults */
  private readonly config: WebSocketTransportConfig & Required<TransportConfig>;
  /** Number of connection attempts made */
  private connectAttempts = 0;
  /** Timeout handle for connection attempts */
  private timeoutHandle: ReturnType<typeof setTimeout> | null = null;
  /** Handle for reconnection delay timer */
  private reconnectHandle: ReturnType<typeof setTimeout> | null = null;

  /**
   * Create a new WebSocketTransport instance
   * @param config - WebSocket transport configuration
   */
  constructor(config: WebSocketTransportConfig) {
    this.config = {
      ...DEFAULT_TRANSPORT_CONFIG,
      ...config,
    };
  }

  /**
   * Initialize the transport
   * Verifies that WebSocket API is available
   * @throws {TransportError} If WebSocket API is not available
   */
  async initialize(): Promise<void> {
    if (typeof WebSocket === 'undefined') {
      throw new TransportError(TransportErrorCode.INITIALIZATION_FAILED, 'WebSocket API not available');
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
   * Handle a single connection attempt with timeout
   * @private
   * @param attempt - Current attempt number
   * @returns Promise that resolves when connection is established
   * @throws {TransportError} If connection fails or times out
   */
  private async connectAttempt(attempt: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // Setup timeout for this attempt
      this.timeoutHandle = setTimeout(() => {
        this.clearTimeouts(); // Clear potential reconnect timer
        if (this.ws) {
          try {
            this.ws.close();
          } catch (err) {
            /* Ignore */
          }
          this.ws = null;
        }
        this.isConnected = false;
        reject(new TransportError(TransportErrorCode.TIMEOUT, `Connection attempt ${attempt} timed out`));
      }, this.config.timeout);

      // Attempt to establish connection
      this.establishConnection()
        .then(() => {
          if (this.timeoutHandle) {
            // Clear timeout on success
            clearTimeout(this.timeoutHandle);
            this.timeoutHandle = null;
          }
          resolve(); // Resolve the attempt promise
        })
        .catch((error) => {
          if (this.timeoutHandle) {
            // Clear timeout on failure
            clearTimeout(this.timeoutHandle);
            this.timeoutHandle = null;
          }
          this.isConnected = false; // Ensure state is false on error
          if (this.ws) {
            // Ensure WS is cleaned up
            try {
              this.ws.close();
            } catch (err) {
              /* Ignore */
            }
            this.ws = null;
          }
          reject(error); // Reject the attempt promise
        });
    });
  }

  /**
   * Connect to the WebSocket server
   * Handles connection attempts and retries
   * @throws {TransportError} If connection fails after max retries
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      throw new TransportError(TransportErrorCode.INVALID_STATE, 'Transport is already connected');
    }

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      this.connectAttempts = attempt + 1;

      try {
        await this.connectAttempt(this.connectAttempts);
        this.isConnected = true;
        this.connectAttempts = 0; // Reset attempts on success
        return;
      } catch (error) {
        lastError = error as Error;

        // Don't retry on timeout
        if (error instanceof TransportError && error.code === TransportErrorCode.TIMEOUT) {
          throw error;
        }

        if (attempt === this.config.retries) {
          if (this.config.retries === 0) {
            throw lastError;
          }
          break;
        }

        // Wait for retry delay
        await new Promise((resolve) => {
          this.reconnectHandle = setTimeout(resolve, this.config.retryDelay);
        });
        this.reconnectHandle = null;
      }
    }

    throw new TransportError(
      TransportErrorCode.CONNECTION_FAILED,
      'Max reconnection attempts reached',
      lastError,
    );
  }

  /**
   * Disconnect from the WebSocket server
   * Cleans up resources and event handlers
   */
  async disconnect(): Promise<void> {
    try {
      // Clear any pending timeouts
      if (this.timeoutHandle) {
        clearTimeout(this.timeoutHandle);
        this.timeoutHandle = null;
      }
      if (this.reconnectHandle) {
        clearTimeout(this.reconnectHandle);
        this.reconnectHandle = null;
      }

      // Cleanup event handlers before closing
      if (this.ws) {
        this.ws.onopen = null;
        this.ws.onclose = null;
        this.ws.onerror = null;
        this.ws.onmessage = null;
        this.ws.close();
        this.ws = null;
      }

      this.isConnected = false;
      this.connectAttempts = 0;
    } catch (error) {
      // Log error but don't throw since we're cleaning up
      console.error('Error during disconnect:', error);
    }
  }

  /**
   * Send data through the WebSocket connection
   * @param data - Data to send (will be JSON stringified)
   * @throws {TransportError} If not connected or send fails
   */
  async send(data: unknown): Promise<void> {
    if (!this.isConnected || !this.ws) {
      throw new TransportError(TransportErrorCode.NOT_CONNECTED, 'Transport is not connected');
    }

    try {
      this.ws.send(JSON.stringify(data));
    } catch (error) {
      throw new TransportError(TransportErrorCode.SEND_FAILED, 'Failed to send message', error);
    }
  }

  /**
   * Establish WebSocket connection and set up event handlers
   * @private
   * @returns Promise that resolves when connection is established
   * @throws {TransportError} If connection fails
   */
  private async establishConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.url, this.config.protocols);

        this.ws.onopen = () => {
          this.isConnected = true;
          this.connectAttempts = 0;
          resolve();
        };

        this.ws.onclose = () => {
          // This handler is primarily for unexpected closes *after* a connection was established.
          const wasConnected = this.isConnected;
          this.isConnected = false;
          this.ws = null;
          if (this.reconnectHandle) {
            clearTimeout(this.reconnectHandle);
            this.reconnectHandle = null;
          }
          // Only log a warning if we were previously connected
          if (wasConnected) {
            console.warn('WebSocket disconnected unexpectedly.');
          }
        };

        this.ws.onerror = (event) => {
          // This handles errors during the connection phase or runtime errors.
          this.isConnected = false;
          if (this.ws) {
            try {
              this.ws.close();
            } catch (e) {
              /* ignore */
            }
            this.ws = null;
          }
          reject(
            new TransportError(
              TransportErrorCode.CONNECTION_FAILED,
              'WebSocket connection error',
              event instanceof Error ? event : new Error(String(event)),
            ),
          );
        };

        this.ws.onmessage = (event) => {
          if (this.onMessage) {
            try {
              const data = JSON.parse(event.data);
              this.onMessage(data);
            } catch (error) {
              console.error('Failed to parse WebSocket message:', error);
            }
          }
        };
      } catch (error) {
        reject(
          new TransportError(
            TransportErrorCode.CONNECTION_FAILED,
            'Failed to create WebSocket connection',
            error,
          ),
        );
      }
    });
  }
}
