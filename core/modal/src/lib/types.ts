/**
 * Base transport interface for handling communication between frontend and backend
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
 * Information about a DApp using the wallet
 */
export interface DappInfo {
  name: string;
  description: string;
  icon: string; // Data URI for the Dapp icon
  origin: string;
}

/**
 * Information about a wallet that can be connected
 */
export interface TransportDefinition {
  type: TransportType;
  options?: TransportOptions;
}

/**
 * Options for configuring a transport
 */
export interface TransportOptions {
  url?: string;
  origin?: string;
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
