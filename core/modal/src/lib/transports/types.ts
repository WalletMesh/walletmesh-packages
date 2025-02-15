/**
 * @packageDocumentation
 * Core type definitions for the transport layer.
 */

/**
 * Base configuration interface for transports.
 */
export interface BaseTransportConfig {
  /** Maximum time to wait for operations (ms) */
  timeout?: number;
  /** Number of reconnection attempts */
  reconnectAttempts?: number;
  /** Delay between reconnection attempts (ms) */
  reconnectDelay?: number;
  /** Auto-reconnect on disconnect */
  autoReconnect?: boolean;
}

/**
 * Error types that can occur in transport operations
 */
export type TransportErrorType = 'connection' | 'message' | 'timeout' | 'protocol';

/**
 * Transport-specific error class.
 */
export class TransportError extends Error {
  public override name = 'TransportError';
  public override cause?: Error;

  constructor(
    message: string,
    public readonly type: TransportErrorType,
    cause?: Error,
  ) {
    super(message);
    if (cause) this.cause = cause;
  }
}

/**
 * Available transport types
 */
export const TransportTypes = {
  CHROME_EXTENSION: 'chrome_extension',
  WEBSOCKET: 'websocket',
  POSTMESSAGE: 'postmessage',
  NULL: 'null',
} as const;

export type TransportType = (typeof TransportTypes)[keyof typeof TransportTypes];

/**
 * Transport configuration type
 */
export interface TransportConfig<T extends BaseTransportConfig = BaseTransportConfig> {
  /** Transport type identifier */
  type: TransportType;
  /** Transport-specific configuration */
  config: T;
}

/**
 * Core transport interface.
 *
 * Provides a standardized way to communicate between the dApp and wallet,
 * abstracting the underlying transport mechanism (PostMessage, Chrome Extension, WebSocket).
 */
export interface Transport {
  /**
   * Establishes the transport connection.
   * @throws {TransportError} If connection fails
   */
  connect(): Promise<void>;

  /**
   * Terminates the transport connection.
   * @throws {TransportError} If disconnection fails
   */
  disconnect(): Promise<void>;

  /**
   * Sends data through the transport.
   * @param data - Data to send
   * @throws {TransportError} If send operation fails
   */
  send(data: unknown): Promise<void>;

  /**
   * Registers message handler.
   * @param handler - Function to handle incoming messages
   */
  onMessage(handler: (data: unknown) => void): void;

  /**
   * Removes message handler.
   * @param handler - Previously registered handler to remove
   */
  offMessage(handler: (data: unknown) => void): void;

  /**
   * Checks if transport is currently connected.
   */
  isConnected(): boolean;

  /**
   * Gets transport type identifier.
   */
  getType(): TransportType;
}
