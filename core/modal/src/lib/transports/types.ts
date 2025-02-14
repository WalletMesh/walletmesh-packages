/**
 * Core interface for managing communication between dApp and wallet.
 *
 * Transport implementations provide a standardized way to handle
 * bi-directional communication between a dApp and wallet, abstracting
 * the underlying transport mechanism (PostMessage, WebSocket, etc.).
 *
 * Key responsibilities:
 * - Connection management
 * - Message sending and receiving
 * - Error handling
 * - Resource cleanup
 *
 * @remarks
 * Each transport type handles specific communication scenarios:
 * - PostMessage: For iframe/popup communication
 * - WebSocket: For remote wallet connections
 * - Extension: For browser extension wallets
 * - Null: For testing and development
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
   * Initializes and establishes the transport connection.
   *
   * @returns Promise that resolves when connection is ready
   * @throws {Error} If connection fails, times out, or is rejected
   *
   * @remarks
   * Connection process typically involves:
   * 1. Validating configuration
   * 2. Setting up communication channel
   * 3. Performing handshake if required
   * 4. Initializing message handlers
   *
   * @example
   * ```typescript
   * const transport = new PostMessageTransport(config);
   * await transport.connect();
   * console.log('Connected:', transport.isConnected());
   * ```
   */
  connect(): Promise<void>;

  /**
   * Terminates the transport connection and cleans up resources.
   *
   * @returns Promise that resolves when cleanup is complete
   * @throws {Error} If disconnection or cleanup fails
   *
   * @remarks
   * Cleanup tasks include:
   * - Closing communication channels
   * - Removing event listeners
   * - Canceling pending operations
   * - Releasing system resources
   *
   * @example
   * ```typescript
   * try {
   *   await transport.disconnect();
   *   console.log('Disconnected successfully');
   * } catch (error) {
   *   console.error('Cleanup failed:', error);
   * }
   * ```
   */
  disconnect(): Promise<void>;

  /**
   * Sends data to the connected wallet.
   *
   * @param data - Data to transmit to the wallet
   * @returns Promise that resolves when send is complete
   * @throws {Error} If send fails, connection is lost, or data is invalid
   *
   * @remarks
   * Sending process includes:
   * - Connection state validation
   * - Data serialization if needed
   * - Transmission error handling
   * - Delivery confirmation (if supported)
   *
   * @example
   * ```typescript
   * await transport.send({
   *   type: 'REQUEST',
   *   method: 'eth_requestAccounts',
   *   params: []
   * });
   * ```
   */
  send(data: unknown): Promise<void>;

  /**
   * Registers a callback to handle incoming messages.
   *
   * @param handler - Function to process incoming messages
   *
   * @remarks
   * Handler registration:
   * - Multiple handlers can be registered
   * - Handlers should be lightweight to avoid blocking
   * - Errors in handlers won't affect transport
   * - Messages are processed in order received
   *
   * @example
   * ```typescript
   * transport.onMessage((data) => {
   *   console.log('Received:', data);
   *   // Process message...
   * });
   *
   * // Error handling
   * transport.onMessage((data) => {
   *   try {
   *     processMessage(data);
   *   } catch (error) {
   *     console.error('Handler error:', error);
   *   }
   * });
   * ```
   */
  onMessage(handler: (data: unknown) => void): void;

  /**
   * Checks if the transport connection is active.
   *
   * @returns True if connected and ready, false otherwise
   *
   * @remarks
   * Connection states:
   * - true: Connection established and ready for messages
   * - false: Not connected, disconnected, or connection failed
   *
   * @example
   * ```typescript
   * if (!transport.isConnected()) {
   *   await transport.connect();
   * }
   * ```
   */
  isConnected(): boolean;
}

/**
 * Configuration object for initializing transport instances.
 *
 * Specifies the transport type and its associated configuration options.
 * Each transport type may require different options for proper initialization.
 *
 * @property type - The transport mechanism to use
 * @property options - Optional transport-specific settings
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
 * Supported transport mechanisms for wallet communication.
 *
 * Each type represents a different communication strategy:
 *
 * - PostMessage: For secure cross-origin communication between windows/frames
 *   Ideal for wallet interfaces in popups or iframes
 *
 * - WebSocket: For real-time bi-directional communication
 *   Suitable for remote wallet connections
 *
 * - Extension: For communication with browser extensions
 *   Used when wallet functionality is provided via extension
 *
 * - Null: No-op implementation for testing
 *   Useful for development and testing scenarios
 *
 * @enum {string}
 */
export enum TransportType {
  PostMessage = 'postMessage',
  WebSocket = 'websocket',
  Extension = 'extension',
  Null = 'null',
}

/**
 * Configuration options for transport initialization.
 *
 * Provides a unified interface for configuring different transport types.
 * Each transport implementation uses the relevant options for its type.
 *
 * @property url - WebSocket connection URL
 * @property origin - Allowed origin for PostMessage security
 * @property extensionId - Browser extension identifier
 *
 * @remarks
 * Option requirements vary by transport type:
 * - PostMessage: Requires origin for security
 * - WebSocket: Requires URL for connection
 * - Extension: Requires extensionId for communication
 * - Null: No options required
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
