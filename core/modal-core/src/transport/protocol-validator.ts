/**
 * @packageDocumentation
 * Protocol validation utilities and types.
 */

import { ProtocolError, ProtocolErrorCode, createProtocolError } from './errors.js';
import type { Message, ProtocolPayload } from './types.js';

/**
 * Result type for validation operations
 */
export type ValidationResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: ProtocolError;
};

/**
 * Protocol message validator that ensures messages conform to expected format
 */
export class ProtocolValidator<T extends ProtocolPayload> {
  /**
   * Validates a message's basic structure
   */
  validateMessageStructure(message: unknown): ValidationResult<Message<T>> {
    try {
      if (!message || typeof message !== 'object') {
        throw createProtocolError.invalidFormat('Message must be an object');
      }

      const msg = message as Partial<Message<T>>;

      if (!msg.type) {
        throw createProtocolError.missingField('type');
      }

      if (!msg.id) {
        throw createProtocolError.missingField('id');
      }

      if (!msg.payload) {
        throw createProtocolError.missingField('payload');
      }

      if (typeof msg.timestamp !== 'number') {
        throw createProtocolError.invalidFormat('timestamp must be a number');
      }

      return {
        success: true,
        data: message as Message<T>,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof ProtocolError
          ? error
          : createProtocolError.validation('Message validation failed', error),
      };
    }
  }

  /**
   * Validates a message payload matches the expected format
   */
  validatePayload(
    payload: unknown,
    requestExpected = true
  ): ValidationResult<T> {
    try {
      if (!payload || typeof payload !== 'object') {
        throw createProtocolError.invalidPayload('Payload must be an object');
      }

      const typedPayload = payload as Partial<T>;

      // Validate request if expected
      if (requestExpected && !this.isValidRequest(typedPayload.request)) {
        throw createProtocolError.invalidPayload('Invalid request format');
      }

      // Always validate response
      if (!this.isValidResponse(typedPayload.response)) {
        throw createProtocolError.invalidPayload('Invalid response format');
      }

      return {
        success: true,
        data: payload as T,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof ProtocolError
          ? error
          : createProtocolError.validation('Payload validation failed', error),
      };
    }
  }

  /**
   * Validates a complete message including structure and payload
   */
  validateMessage(message: unknown): ValidationResult<Message<T>> {
    const structureResult = this.validateMessageStructure(message);
    if (!structureResult.success) {
      return structureResult;
    }

    const payloadResult = this.validatePayload(structureResult.data.payload);
    if (!payloadResult.success) {
      return {
        success: false,
        error: payloadResult.error,
      };
    }

    return {
      success: true,
      data: structureResult.data,
    };
  }

  private isValidRequest(request: unknown): boolean {
    if (!request || typeof request !== 'object') {
      return false;
    }

    const req = request as Record<string, unknown>;
    return (
      typeof req['method'] === 'string' &&
      req['method'].length > 0 &&
      'params' in req &&
      req['params'] !== null &&
      typeof req['params'] === 'object'
    );
  }

  private isValidResponse(response: unknown): boolean {
    if (!response || typeof response !== 'object') {
      return false;
    }

    const res = response as Record<string, unknown>;
    
    // Response must have either result or error, but not both
    const hasResult = 'result' in res;
    const hasError = typeof res['error'] === 'string';
    
    return (hasResult !== hasError) || (!hasResult && !hasError);
  }
}