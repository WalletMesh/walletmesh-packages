/**
 * @packageDocumentation
 * Protocol validation utilities.
 */

import type { Message, ValidationResult } from './types.js';
import { MessageType } from './types.js';
import { ProtocolError, ProtocolErrorCode } from './errors.js';

/**
 * Validates a protocol message.
 */
export class ProtocolValidator<T = unknown> {
  /**
   * Validates a message payload.
   */
  validatePayload(payload: T): ValidationResult<T> {
    if (!payload || typeof payload !== 'object') {
      return {
        success: false,
        error: new ProtocolError('Invalid payload: must be an object', ProtocolErrorCode.INVALID_PAYLOAD),
      };
    }

    // Check if payload has required fields
    const payloadObj = payload as Record<string, unknown>;
    if (!('method' in payloadObj) && !('result' in payloadObj) && !('error' in payloadObj)) {
      return {
        success: false,
        error: new ProtocolError(
          'Invalid payload: must contain method, result, or error',
          ProtocolErrorCode.INVALID_PAYLOAD,
        ),
      };
    }

    return { success: true, data: payload };
  }

  /**
   * Validates a complete message.
   */
  validateMessage(message: Message<T>): ValidationResult<Message<T>> {
    if (!message || typeof message !== 'object') {
      return {
        success: false,
        error: new ProtocolError('Invalid message: must be an object', ProtocolErrorCode.INVALID_FORMAT),
      };
    }

    // Check for required fields presence
    for (const field of ['id', 'type', 'timestamp', 'payload'] as const) {
      if (!(field in message)) {
        return {
          success: false,
          error: new ProtocolError(
            `Invalid message: missing required field '${field}'`,
            ProtocolErrorCode.MISSING_REQUIRED_FIELD,
          ),
        };
      }
    }

    // Validate field types and values
    if (typeof message.id !== 'string' || !message.id) {
      return {
        success: false,
        error: new ProtocolError(
          'Invalid message: id must be a non-empty string',
          ProtocolErrorCode.INVALID_FORMAT,
        ),
      };
    }

    if (typeof message.type !== 'string' || !Object.values(MessageType).includes(message.type)) {
      return {
        success: false,
        error: new ProtocolError(
          'Invalid message: type must be a valid MessageType',
          ProtocolErrorCode.UNKNOWN_MESSAGE_TYPE,
        ),
      };
    }

    if (typeof message.timestamp !== 'number') {
      return {
        success: false,
        error: new ProtocolError(
          'Invalid message: timestamp must be a number',
          ProtocolErrorCode.INVALID_FORMAT,
        ),
      };
    }

    if (!message.payload || typeof message.payload !== 'object') {
      return {
        success: false,
        error: new ProtocolError(
          'Invalid message: payload must be an object',
          ProtocolErrorCode.INVALID_PAYLOAD,
        ),
      };
    }

    const payloadResult = this.validatePayload(message.payload);
    if (!payloadResult.success) {
      return payloadResult as ValidationResult<Message<T>>;
    }

    return { success: true, data: message };
  }
}

export type { ValidationResult };
export interface ProtocolPayload<TRequest = unknown, TResponse = unknown> {
  request: TRequest;
  response: TResponse;
}

export interface Protocol<T = unknown> {
  validateMessage(message: Message<T>): ValidationResult<Message<T>>;
}

export interface TransportOptions {
  timeout?: number;
  retries?: number;
}
