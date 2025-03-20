/**
 * Transport layer type definitions
 */

/**
 * Message types
 */
export enum MessageType {
  REQUEST = 'request',
  RESPONSE = 'response',
  ERROR = 'error'
}

/**
 * Transport states
 */
export enum TransportState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error'
}

/**
 * Transport error codes
 */
export enum TransportErrorCode {
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  INVALID_MESSAGE = 'INVALID_MESSAGE',
  TIMEOUT = 'TIMEOUT',
  RPC_ERROR = 'RPC_ERROR',
  TRANSPORT_ERROR = 'TRANSPORT_ERROR'
}

/**
 * Base message interface
 */
export interface Message<T = unknown> {
  id: string;
  type: MessageType;
  payload: T;
  timestamp: number;
}

/**
 * Transport error
 */
export class TransportError extends Error {
  constructor(
    message: string,
    public readonly code: TransportErrorCode,
    public override readonly cause?: Error
  ) {
    super(message);
    this.name = 'TransportError';
  }
}

/**
 * Protocol interface
 */
export interface Protocol<T = unknown> {
  createRequest: <M extends string>(method: M, params: T) => Message<T>;
  createResponse: (id: string, result: T) => Message<T>;
  createError: (id: string, error: Error) => Message<T>;
  validateMessage: (message: unknown) => ValidationResult<Message<T>>;
  formatMessage: (message: Message<T>) => unknown;
  parseMessage: (data: unknown) => ValidationResult<Message<T>>;
}

/**
 * Transport configuration options
 */
export interface TransportOptions {
  /** Connection timeout in ms */
  timeout?: number;
  /** Auto-reconnect configuration */
  reconnect?: {
    /** Whether to auto-reconnect */
    enabled: boolean;
    /** Max reconnection attempts */
    maxAttempts?: number;
    /** Base delay between attempts in ms */
    delay?: number;
  };
}

/**
 * Validation result type
 */
export type ValidationResult<T> = { success: true; data: T } | 
  { success: false; error: Error };

/**
 * Message handler interface
 */
export interface MessageHandler {
  canHandle: (message: Message) => boolean;
  handle: (message: Message) => Promise<void>;
}

/**
 * Error handler type
 */
export type ErrorHandler = (error: Error | TransportError) => void;

/**
 * Subscription handler interface
 */
export interface Subscription {
  onMessage?: (message: Message) => void;
  onError?: ErrorHandler;
}

/**
 * Transport interface
 */
export interface Transport {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send<T = unknown, R = unknown>(message: Message<T>): Promise<Message<R>>;
  subscribe(subscription: Subscription): () => void;
  isConnected(): boolean;
  getState(): TransportState | string;
  addErrorHandler(handler: ErrorHandler): void;
  removeErrorHandler(handler: ErrorHandler): void;
}
