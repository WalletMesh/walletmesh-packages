import type { Message } from './types.js';
import type { ValidationResult } from './protocol-validator.js';

/**
 * Represents a protocol message with request and response types
 */
export interface ProtocolMessage<Req = unknown, Res = unknown> {
  request: Req;
  response: Res;
}

/**
 * Interface for protocol implementations
 */
export interface Protocol<T extends ProtocolMessage> {
  createRequest: <M extends string>(method: M, params: T['request']) => Message<T['request']>;
  createResponse: (id: string, result: T['response']) => Message<T['response']>;
  createError: (id: string, error: Error) => Message<T['request']>;
  formatMessage: <K extends keyof T>(message: Message<T[K]>) => unknown;
  validateMessage: <K extends keyof T>(message: unknown) => ValidationResult<Message<T[K]>>;
  parseMessage: <K extends keyof T>(data: unknown) => ValidationResult<Message<T[K]>>;
}