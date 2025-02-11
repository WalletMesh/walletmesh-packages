/**
 * Base transport interface for handling communication
 */
export interface Transport {
  /** Establishes the transport connection */
  connect(): Promise<void>;

  /** Closes the transport connection and cleans up resources */
  disconnect(): Promise<void>;

  /** Sends data through the transport */
  send(data: unknown): Promise<void>;

  /** Registers a handler for incoming messages */
  onMessage(handler: (data: unknown) => void): void;
}

/**
 * Configuration options for transports
 */
export interface TransportOptions {
  /** Optional URL for connection */
  url?: string;
  /** Allowed origin for messages */
  origin?: string;
  /** Extension ID for extension-based transport */
  extensionId?: string;
}

/**
 * Available transport types
 */
export enum TransportType {
  PostMessage = 'postMessage',
  WebSocket = 'websocket',
  Extension = 'extension',
}

/**
 * Transport configuration
 */
export interface TransportConfig {
  type: TransportType;
  options?: TransportOptions;
}
