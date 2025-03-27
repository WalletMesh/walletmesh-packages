import { MessageType, type Message } from './types.js';
import type { ValidationResult } from './protocol-validator.js';

/**
 * Represents a protocol message with request and response types
 */
export interface ProtocolMessage<TRequest = unknown, TResponse = unknown> {
  request: TRequest;
  response: TResponse;
}

/**
 * Interface for protocol implementations
 */
export interface Protocol<T> {
  createRequest<M extends string>(method: M, params: T): Message<T>;
  createResponse<R>(id: string, result: R): Message<R>;
  createError(id: string, error: Error): Message<T>;
  formatMessage<K>(message: Message<K>): unknown;
  validateMessage<K>(message: unknown): ValidationResult<Message<K>>;
  parseMessage<K>(data: unknown): ValidationResult<Message<K>>;
}

/**
 * Helper type for protocol implementations
 */
export type ProtocolImplementation<TRequest, TResponse> = {
  createRequest(method: string, params: TRequest): Message<TRequest>;
  createResponse(id: string, result: TResponse): Message<TResponse>;
  createError(id: string, error: Error): Message<TRequest>;
  formatMessage(message: Message<TRequest | TResponse>): unknown;
  validateMessage(message: unknown): ValidationResult<Message<TRequest | TResponse>>;
  parseMessage(data: unknown): ValidationResult<Message<TRequest | TResponse>>;
};

/**
 * Creates a typed protocol implementation
 */
export function createProtocol<TRequest, TResponse>(): ProtocolImplementation<TRequest, TResponse> {
  return {
    createRequest(method: string, params: TRequest): Message<TRequest> {
      return {
        id: `${method}-${Date.now()}`,
        type: MessageType.REQUEST,
        payload: params,
        timestamp: Date.now(),
      };
    },

    createResponse(id: string, result: TResponse): Message<TResponse> {
      return {
        id,
        type: MessageType.RESPONSE,
        payload: result,
        timestamp: Date.now(),
      };
    },

    createError(id: string, error: Error): Message<TRequest> {
      return {
        id,
        type: MessageType.ERROR,
        payload: { error: error.message } as unknown as TRequest,
        timestamp: Date.now(),
      };
    },

    formatMessage(message: Message<TRequest | TResponse>): unknown {
      return message;
    },

    validateMessage(message: unknown): ValidationResult<Message<TRequest | TResponse>> {
      if (typeof message !== 'object' || message === null) {
        return { success: false, error: new Error('Invalid message format') };
      }
      return {
        success: true,
        data: message as Message<TRequest | TResponse>,
      };
    },

    parseMessage(data: unknown): ValidationResult<Message<TRequest | TResponse>> {
      try {
        return this.validateMessage(data);
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error : new Error('Failed to parse message'),
        };
      }
    },
  };
}
