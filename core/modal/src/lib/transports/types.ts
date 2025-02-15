/**
 * Options for transport configuration
 */
export interface TransportOptions {
  url?: string;
  origin?: string;
  extensionId?: string;
}

/**
 * Configuration for transport initialization.
 */
export interface TransportConfig {
  type: TransportType;
  options?: TransportOptions;
}

/**
 * Available transport types.
 */
export enum TransportType {
  PostMessage = 'postMessage',
  WebSocket = 'websocket',
  Extension = 'extension',
  Null = 'null',
}

/**
 * Core interface for managing communication between dApp and wallet.
 */
export interface Transport {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send(data: unknown): Promise<void>;
  onMessage(handler: (data: unknown) => void): void;
  isConnected(): boolean;
}
