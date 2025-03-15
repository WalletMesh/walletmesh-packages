/**
 * @packageDocumentation
 * Core transport layer types and interfaces for WalletMesh.
 */

import type { ValidationResult, ProtocolValidator } from './protocol-validator.js';

/**
 * Message types supported by the transport layer.
 */
export enum MessageType {
  REQUEST = 'request',
  RESPONSE = 'response',
  NOTIFICATION = 'notification',
  ERROR = 'error',
}

/**
 * Core message structure for transport layer communication.
 */
export interface Message<T = unknown> {
  id: string;
  type: MessageType;
  payload: T;
  timestamp: number;
}

/**
 * Handler for processing transport messages.
 */
export interface MessageHandler {
  canHandle(message: Message): boolean;
  handle(message: Message): Promise<void>;
}

/**
 * Configuration options for transport implementations.
 */
export interface TransportOptions {
  /** Maximum time to wait for a response (ms) */
  timeout?: number;
  /** Number of retry attempts for failed operations */
  retries?: number;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Error codes specific to transport operations.
 */
export enum TransportErrorCode {
  CONNECTION_FAILED = 'connection_failed',
  TIMEOUT = 'timeout',
  INVALID_MESSAGE = 'invalid_message',
  PROTOCOL_ERROR = 'protocol_error',
  TRANSPORT_ERROR = 'transport_error',
}

/**
 * Transport-specific error type.
 */
export class TransportError extends Error {
  constructor(
    message: string,
    public readonly code: TransportErrorCode,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'TransportError';
  }
}

/**
 * Core transport interface for wallet communication.
 */
export interface Transport {
  /**
   * Establishes the transport connection.
   * @throws {TransportError} If connection fails
   */
  connect(): Promise<void>;

  /**
   * Closes the transport connection and cleans up resources.
   */
  disconnect(): Promise<void>;

  /**
   * Sends a message and waits for a response.
   * @param message - The message to send
   * @returns Promise resolving to the response message
   * @throws {TransportError} If send fails or times out
   */
  send<T, R>(message: Message<T>): Promise<Message<R>>;

  /**
   * Subscribes to incoming messages.
   * @param handler - The message handler to register
   * @returns Function to unsubscribe the handler
   */
  subscribe(handler: MessageHandler): () => void;

  /**
   * Checks if the transport is currently connected.
   */
  isConnected(): boolean;
}

/**
 * Request/Response types for protocols
 */
export interface ProtocolPayload<TReq = unknown, TRes = unknown> {
  request: TReq;
  response: TRes;
}

/**
 * Base protocol interface for message formatting and validation.
 */
export interface Protocol<T extends ProtocolPayload = ProtocolPayload> {
  /**
   * The validator instance for this protocol.
   */
  validator: ProtocolValidator<T>;

  /**
   * Parses and validates raw message data.
   * @returns Validation result containing parsed message or error
   */
  parseMessage(data: unknown): ValidationResult<Message<T['request']>>;

  /**
   * Formats a message for transport.
   */
  formatMessage(message: Message<T['request']>): unknown;

  /**
   * Validates an incoming message.
   * @returns Validation result containing validated message or error
   */
  validateMessage(message: unknown): ValidationResult<Message<T>>;

  /**
   * Creates a request message.
   */
  createRequest<M extends string>(method: M, params: T['request']): Message<T['request']>;

  /**
   * Creates a response message.
   */
  createResponse(requestId: string, result: T['response']): Message<T['response']>;

  /**
   * Creates an error message.
   */
  createError(requestId: string, error: Error): Message<T['request']>;
}
