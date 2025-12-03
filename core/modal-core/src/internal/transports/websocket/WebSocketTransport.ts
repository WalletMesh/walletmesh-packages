/**
 * WebSocket Transport Implementation
 *
 * This transport provides real-time bidirectional communication
 * with wallets using WebSocket connections.
 *
 * @module internal/transports/websocket
 */

import type { TransportConfig } from '../../../types.js';
import { ErrorFactory } from '../../core/errors/errorFactory.js';
import type { ErrorHandler } from '../../core/errors/errorHandler.js';
import type { Logger } from '../../core/logger/logger.js';
import { AbstractTransport } from '../AbstractTransport.js';

/**
 * WebSocket transport configuration
 */
export interface WebSocketTransportConfig extends TransportConfig {
  /** WebSocket URL to connect to */
  url: string;

  /** WebSocket subprotocols */
  protocols?: string[];

  /** Auto-reconnect configuration */
  autoReconnect?: {
    enabled: boolean;
    maxAttempts?: number;
    delay?: number;
  };
}

/**
 * WebSocket connection states
 */
enum WebSocketState {
  Connecting = 0,
  Open = 1,
  Closing = 2,
  Closed = 3,
}

/**
 * WebSocket Transport implementation
 */
export class WebSocketTransport extends AbstractTransport {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private connectionTimeoutTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private messageQueue: unknown[] = [];
  private readonly wsConfig: WebSocketTransportConfig;

  constructor(config: WebSocketTransportConfig, logger: Logger, errorHandler: ErrorHandler) {
    super(config, logger, errorHandler);
    this.wsConfig = config;
  }

  /**
   * Connect to WebSocket server
   */
  protected async connectInternal(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.log('debug', 'Connecting to WebSocket', { url: this.wsConfig.url });

        // Create WebSocket connection
        this.ws = new WebSocket(this.wsConfig.url, this.wsConfig.protocols);

        // Setup timeout
        this.connectionTimeoutTimer = setTimeout(() => {
          if (this.ws?.readyState === WebSocketState.Connecting) {
            this.ws.close();
            reject(ErrorFactory.transportError('WebSocket connection timeout'));
          }
        }, this.config.timeout || 30000);

        // Handle connection events
        this.ws.onopen = () => {
          this.clearConnectionTimeout();
          this.log('info', 'WebSocket connected', { url: this.wsConfig.url });

          this.connected = true;
          this.reconnectAttempts = 0;

          // Send queued messages
          this.flushMessageQueue();

          // Emit connected event
          this.emit({ type: 'connected' });

          resolve();
        };

        this.ws.onerror = (event) => {
          this.clearConnectionTimeout();
          const error = ErrorFactory.transportError('WebSocket error');
          this.log('error', 'WebSocket error', { event });

          if (this.ws?.readyState === WebSocketState.Connecting) {
            reject(error);
          } else {
            this.emit({ type: 'error', error });
          }
        };

        this.ws.onclose = (event) => {
          this.clearConnectionTimeout();
          this.log('info', 'WebSocket closed', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
          });

          const wasConnected = this.connected;
          this.connected = false;

          // Handle reconnection if enabled
          if (wasConnected && this.wsConfig.autoReconnect?.enabled) {
            this.attemptReconnect();
          }

          // Emit disconnected event
          this.emit({
            type: 'disconnected',
            reason: event.reason || 'Connection closed',
          });
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            // Validate _context.origin using shared validation logic
            // For defense-in-depth, even though WebSocket has URL-based security
            const validation = this.validateOrigin(data, {
              additionalContext: {
                wsUrl: this.wsConfig.url,
              },
            });

            if (!validation.valid && validation.error) {
              this.log('error', 'Origin validation failed: _context.origin mismatch', validation.context);
              this.emit({ type: 'error', error: validation.error });
              return; // Reject message
            }

            this.emit({ type: 'message', data });
          } catch (error) {
            this.log('error', 'Failed to parse WebSocket message', {
              data: event.data,
              error,
            });
          }
        };
      } catch (_error) {
        reject(ErrorFactory.transportError('Failed to create WebSocket'));
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  protected async disconnectInternal(): Promise<void> {
    this.stopReconnect();
    this.clearConnectionTimeout();

    if (this.ws) {
      if (this.ws.readyState === WebSocketState.Open) {
        this.ws.close(1000, 'Normal closure');
      }
      this.ws = null;
    }

    this.connected = false;
    this.messageQueue = [];
  }

  /**
   * Send message over WebSocket
   */
  protected async sendInternal(data: unknown): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocketState.Open) {
      // Queue message if reconnection is enabled
      if (this.wsConfig.autoReconnect?.enabled) {
        this.messageQueue.push(data);
        this.log('debug', 'Message queued for sending');
        return;
      }

      throw ErrorFactory.transportDisconnected('WebSocket not connected');
    }

    try {
      const message = JSON.stringify(data);
      this.ws.send(message);
      this.log('debug', 'Message sent over WebSocket');
    } catch (_error) {
      throw ErrorFactory.messageFailed('Failed to send WebSocket message');
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectTimer) return;

    const config = this.wsConfig.autoReconnect;
    if (!config?.enabled) return;

    const maxAttempts = config.maxAttempts || 5;
    const delay = config.delay || 1000;

    if (this.reconnectAttempts >= maxAttempts) {
      this.log('error', 'Max reconnection attempts reached');
      this.emit({
        type: 'error',
        error: ErrorFactory.transportError('Max reconnection attempts reached'),
      });
      return;
    }

    this.reconnectAttempts++;

    this.log('info', 'Scheduling reconnection', {
      attempt: this.reconnectAttempts,
      delay,
    });

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;

      this.connect().catch((error) => {
        this.log('error', 'Reconnection failed', { error });
        // Will trigger another reconnection attempt via onclose handler
      });
    }, delay);
  }

  /**
   * Stop reconnection attempts
   */
  private stopReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempts = 0;
  }

  /**
   * Clear connection timeout to prevent memory leaks
   */
  private clearConnectionTimeout(): void {
    if (this.connectionTimeoutTimer) {
      clearTimeout(this.connectionTimeoutTimer);
      this.connectionTimeoutTimer = null;
    }
  }

  /**
   * Flush queued messages
   */
  private flushMessageQueue(): void {
    if (this.messageQueue.length === 0) return;

    this.log('debug', 'Flushing message queue', { count: this.messageQueue.length });

    const messages = [...this.messageQueue];
    this.messageQueue = [];

    for (const message of messages) {
      this.sendInternal(message).catch((error) => {
        this.log('error', 'Failed to send queued message', { error });
      });
    }
  }

  /**
   * Clean up resources
   */
  override async destroy(): Promise<void> {
    this.stopReconnect();
    await this.disconnect();
  }

  /**
   * Get transport type identifier
   */
  protected getTransportType(): string {
    return 'websocket';
  }
}
