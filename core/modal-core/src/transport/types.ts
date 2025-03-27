export enum MessageType {
  REQUEST = 'request',
  RESPONSE = 'response',
  ERROR = 'error',
  NOTIFICATION = 'notification',
}

export interface Message<T = unknown> {
  id: string;
  type: MessageType;
  payload: T;
  timestamp: number;
}

export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}

export interface JsonRpcMessage {
  jsonrpc: '2.0';
  id?: string;
  method?: string;
  params?: unknown;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export interface Transport {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send<T = unknown, R = unknown>(message: Message<T>): Promise<Message<R>>;
  isConnected(): boolean;
  getState(): ConnectionState;
  addErrorHandler(handler: ErrorHandler): void;
  removeErrorHandler(handler: ErrorHandler): void;
}

/**
 * Protocol message structures
 */
export interface ProtocolRequest {
  method: string;
  params: unknown[];
}

export interface ProtocolResponse {
  result?: unknown;
  error?: {
    message: string;
    [key: string]: unknown;
  };
}

/**
 * Protocol interface for handling messages
 */
export interface Protocol<TRequest> {
  validate(message: unknown): ValidationResult<Message<TRequest>>;
  validateMessage(message: Message<TRequest>): ValidationResult<Message<TRequest>>;
  parseMessage(message: unknown): ValidationResult<Message<TRequest>>;
  formatMessage(message: Message<TRequest>): unknown;
  createRequest(method: string, params: TRequest): Message<TRequest>;
  createResponse<TResponse>(id: string, result: TResponse): Message<TResponse>;
  createError(id: string, error: Error): Message<TRequest>;
}

export interface ValidationResult<T = unknown> {
  success: boolean;
  error?: Error;
  data?: T;
}

export interface TransportOptions {
  timeout?: number;
  [key: string]: unknown;
}

/**
 * Message handling types
 */
export interface MessageHandler<T = unknown> {
  onMessage(message: Message<T>): Promise<void>;
  onError?(error: Error): void;
}

export type ErrorHandler = (error: Error) => void;

/**
 * Subscription types
 */
export interface Unsubscribable {
  unsubscribe(): void;
}

export interface Subscription extends Unsubscribable {
  onMessage?(message: Message): Promise<void>;
  onError?(error: Error): void;
}

/**
 * Helper to create type-safe subscriptions
 */
export function createSubscription(
  handlers: Partial<{
    onMessage(message: Message): Promise<void>;
    onError(error: Error): void;
    unsubscribe(): void;
  }> = {},
): Subscription {
  return {
    unsubscribe: handlers.unsubscribe ?? (() => undefined),
    ...(handlers.onMessage && { onMessage: handlers.onMessage }),
    ...(handlers.onError && { onError: handlers.onError }),
  };
}

/**
 * Create a mock protocol for testing
 */
export function createMockProtocol<TRequest>(mockData: TRequest): Protocol<TRequest> {
  const mockRequestMessage: Message<TRequest> = {
    id: 'mock-id',
    type: MessageType.REQUEST,
    payload: mockData,
    timestamp: Date.now(),
  };

  return {
    validate: () => ({ success: true, data: mockRequestMessage }),
    validateMessage: () => ({ success: true, data: mockRequestMessage }),
    parseMessage: () => ({ success: true, data: mockRequestMessage }),
    formatMessage: () => mockRequestMessage,
    createRequest: () => mockRequestMessage,
    createResponse: <TResponse>(id: string, result: TResponse) => ({
      id,
      type: MessageType.RESPONSE,
      payload: result,
      timestamp: Date.now(),
    }),
    createError: (id: string, error: Error) => ({
      id,
      type: MessageType.ERROR,
      payload: { error: error.message } as unknown as TRequest,
      timestamp: Date.now(),
    }),
  };
}

// Re-export types for backward compatibility
export type MessageSubscription = MessageHandler;
