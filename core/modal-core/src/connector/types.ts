/**
 * @packageDocumentation
 * Connector type definitions
 */

import type { Message, Transport, ErrorHandler } from '../transport/types.js';
import type { Provider } from '../types.js';
import type { ProtocolError } from '../transport/errors.js';

/**
 * Cleanup handler type
 */
export type CleanupHandler = () => void;

// Re-export types
export type { Transport, ErrorHandler, Provider };

/**
 * Protocol message interface
 */
export interface ProtocolMessage<TReq = unknown, TRes = unknown> {
  request: TReq;
  response: TRes;
}

/**
 * Request message interface
 */
export interface RequestMessage<T = unknown> {
  method: string;
  params: T[];
}

/**
 * Protocol interface
 */
export interface Protocol<T extends ProtocolMessage = ProtocolMessage> {
  createRequest: <M extends string>(method: M, params: T['request']) => Message<T['request']>;
  createResponse: (id: string, result: T['response']) => Message<T['response']>;
  createError: (id: string, error: Error) => Message<T['request']>;
  validateMessage: <K extends keyof T>(message: unknown) => ValidationResult<Message<T[K]>>;
  formatMessage: <K extends keyof T>(message: Message<T[K]>) => unknown;
  parseMessage: <K extends keyof T>(data: unknown) => ValidationResult<Message<T[K]>>;
}

/**
 * Protocol validation result
 */
export type ValidationResult<T> = 
  | { success: true; data: T } 
  | { success: false; error: ProtocolError };
