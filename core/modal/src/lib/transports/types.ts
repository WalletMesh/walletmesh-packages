/**
 * Interface for handling communication between the dapp and wallet
 * @interface Transport
 * @description Transport implementations handle the low-level communication
 * between the dapp and wallet. They abstract the underlying communication
 * mechanism (PostMessage, WebSocket, etc.) into a simple interface.
 *
 * @example
 * ```typescript
 * class MyTransport implements Transport {
 *   async connect(): Promise<void> {
 *     // Setup connection
 *   }
 *
 *   async disconnect(): Promise<void> {
 *     // Cleanup connection
 *   }
 *
 *   async send(data: unknown): Promise<void> {
 *     // Send data to wallet
 *   }
 *
 *   onMessage(handler: (data: unknown) => void): void {
 *     // Register message handler
 *   }
 *
 *   isConnected(): boolean {
 *     // Return connection status
 *     return true;
 *   }
 * }
 * ```
 */
export interface Transport {
  /**
   * Initializes and establishes the transport connection
   * @returns {Promise<void>}
   * @throws {Error} If connection fails or times out
   */
  connect(): Promise<void>;

  /**
   * Terminates the transport connection and cleans up resources
   * @returns {Promise<void>}
   * @throws {Error} If disconnection fails
   */
  disconnect(): Promise<void>;

  /**
   * Sends data to the connected wallet
   * @param {unknown} data - Data to send to the wallet
   * @returns {Promise<void>}
   * @throws {Error} If send fails or connection is lost
   */
  send(data: unknown): Promise<void>;

  /**
   * Registers a callback to handle incoming messages
   * @param {(data: unknown) => void} handler - Callback function for processing messages
   */
  onMessage(handler: (data: unknown) => void): void;

  /**
   * Checks if the transport connection is active
   * @returns {boolean} True if connected, false otherwise
   */
  isConnected(): boolean;
}

/**
 * Configuration for transport initialization
 * @interface TransportConfig
 * @property {TransportType} type - Type of transport to use
 * @property {TransportOptions} [options] - Transport-specific configuration
 *
 * @example
 * ```typescript
 * const config: TransportConfig = {
 *   type: TransportType.PostMessage,
 *   options: {
 *     origin: "https://wallet.example.com"
 *   }
 * };
 * ```
 */
export interface TransportConfig {
  type: TransportType;
  options?: TransportOptions;
}

/**
 * Available transport implementations
 * @enum {string}
 * @property {string} PostMessage - Window postMessage communication
 * @property {string} WebSocket - WebSocket connection
 * @property {string} Extension - Browser extension communication
 * @property {string} Null - No-op transport for testing
 */
export enum TransportType {
  PostMessage = 'postMessage',
  WebSocket = 'websocket',
  Extension = 'extension',
  Null = 'null',
}

/**
 * Common configuration options for all transport types
 * @interface TransportOptions
 * @property {string} [url] - Connection URL for WebSocket transport
 * @property {string} [origin] - Allowed origin for PostMessage transport
 * @property {string} [extensionId] - Browser extension ID for Extension transport
 *
 * @example
 * ```typescript
 * // PostMessage options
 * const postMessageOpts: TransportOptions = {
 *   origin: "https://wallet.example.com"
 * };
 *
 * // WebSocket options
 * const wsOpts: TransportOptions = {
 *   url: "wss://wallet.example.com/ws"
 * };
 *
 * // Extension options
 * const extOpts: TransportOptions = {
 *   extensionId: "wallet-extension-id"
 * };
 * ```
 */
export interface TransportOptions {
  /** Optional URL for connection */
  url?: string;
  /** Allowed origin for messages */
  origin?: string;
  /** Extension ID for extension-based transport */
  extensionId?: string;
}
