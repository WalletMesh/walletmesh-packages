/**
 * Transport system types and interfaces
 * Defines core abstractions for communication between dApp and wallet
 */

/**
 * Base configuration options for transports
 * @interface TransportConfig
 */
export interface TransportConfig {
  /** Connection timeout in milliseconds */
  timeout?: number;
  /** Number of reconnection attempts */
  retries?: number;
  /** Delay between reconnection attempts in milliseconds */
  retryDelay?: number;
}

/**
 * Error codes specific to transport operations
 * Defines standard error types that can occur during transport operations
 * @enum {string}
 */
export enum TransportErrorCode {
  /** Failed to establish connection */
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  /** Failed to initialize transport */
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
  /** Failed to send data */
  SEND_FAILED = 'SEND_FAILED',
  /** Transport not initialized */
  NOT_INITIALIZED = 'NOT_INITIALIZED',
  /** Transport not connected */
  NOT_CONNECTED = 'NOT_CONNECTED',
  /** Operation timed out */
  TIMEOUT = 'TIMEOUT',
  /** Invalid transport state */
  INVALID_STATE = 'INVALID_STATE',
}

/**
 * Base error class for transport-related errors
 * Provides detailed error information for transport failures
 * @class TransportError
 * @extends Error
 */
export class TransportError extends Error {
  /**
   * Create a new TransportError
   * @param code - Error code identifying the type of error
   * @param message - Human-readable error description
   * @param cause - Optional underlying cause of the error
   */
  public constructor(
    public code: TransportErrorCode,
    message: string,
    public override readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'TransportError';
  }
}

/**
 * Interface for bidirectional communication transports
 * Handles the mechanics of data transmission between dApp and wallet
 *
 * This is the core interface that all transport implementations must implement.
 * It provides a standard API for establishing connections and sending data
 * regardless of the underlying transport mechanism (WebSocket, Chrome Extension, etc.).
 *
 * @interface Transport
 */
export interface Transport {
  /** Current connection state */
  readonly isConnected: boolean;

  /**
   * Handler for incoming messages
   * Called when data is received from the other end of the transport
   */
  onMessage: ((data: unknown) => void) | null;

  /**
   * Initialize the transport
   * Sets up any required resources or configurations
   * @throws {TransportError} If initialization fails
   */
  initialize(): Promise<void>;

  /**
   * Establish connection with the target
   * Opens the communication channel
   * @throws {TransportError} If connection fails
   */
  connect(): Promise<void>;

  /**
   * Close the connection
   * Cleans up resources and closes the communication channel
   * @throws {TransportError} If disconnection fails
   */
  disconnect(): Promise<void>;

  /**
   * Send data through the transport
   * Transmits data to the other end of the connection
   * @param data - The data to send
   * @throws {TransportError} If send operation fails
   */
  send(data: unknown): Promise<void>;
}

/**
 * Default configuration values for transports
 * Provides sensible defaults for transport configuration
 * @const DEFAULT_TRANSPORT_CONFIG
 */
export const DEFAULT_TRANSPORT_CONFIG: Required<TransportConfig> = {
  /** Default timeout of 5 seconds */
  timeout: 5000,
  /** Default of 3 retry attempts */
  retries: 3,
  /** Default delay of 1 second between retries */
  retryDelay: 1000,
};
