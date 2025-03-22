/**
 * @packageDocumentation
 * Tests for protocol implementation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { Protocol } from './types.js';
import { MessageType } from './types.js';
import type { Message, ValidationResult } from './types.js';
import { ProtocolError, ProtocolErrorCode } from './errors.js';

interface TestPayload {
  request: {
    method: string;
    params: unknown[];
  };
  response: {
    result?: unknown;
    error?: string;
  };
}

class TestProtocol implements Protocol<TestPayload> {
  private validatePayloadRequest(request: unknown): ValidationResult<TestPayload['request']> {
    if (!request || typeof request !== 'object') {
      return {
        success: false,
        error: new ProtocolError('Invalid request format', ProtocolErrorCode.INVALID_PAYLOAD),
      };
    }

    const req = request as Partial<TestPayload['request']>;
    if (typeof req.method !== 'string') {
      return {
        success: false,
        error: new ProtocolError('Method must be a string', ProtocolErrorCode.INVALID_PAYLOAD),
      };
    }

    if (!Array.isArray(req.params)) {
      return {
        success: false,
        error: new ProtocolError('Params must be an array', ProtocolErrorCode.INVALID_PAYLOAD),
      };
    }

    return {
      success: true,
      data: { method: req.method, params: req.params },
    };
  }

  private validatePayloadResponse(response: unknown): ValidationResult<TestPayload['response']> {
    if (!response || typeof response !== 'object') {
      return {
        success: false,
        error: new ProtocolError('Invalid response format', ProtocolErrorCode.INVALID_PAYLOAD),
      };
    }

    const res = response as Partial<TestPayload['response']>;
    if (res.error !== undefined && typeof res.error !== 'string') {
      return {
        success: false,
        error: new ProtocolError('Error must be a string', ProtocolErrorCode.INVALID_PAYLOAD),
      };
    }

    // Return an empty object if no fields are present
    const response_: TestPayload['response'] = {};
    if ('result' in res) response_.result = res.result;
    if (typeof res.error === 'string') response_.error = res.error;

    return {
      success: true,
      data: response_,
    };
  }

  validateMessage(message: unknown): ValidationResult<Message<TestPayload>> {
    try {
      // Basic message structure validation
      if (!message || typeof message !== 'object') {
        return {
          success: false,
          error: new ProtocolError('Invalid message format', ProtocolErrorCode.INVALID_FORMAT),
        };
      }

      const msg = message as Partial<Message<TestPayload>>;

      // Required fields validation
      if (!msg.id || typeof msg.id !== 'string') {
        return {
          success: false,
          error: new ProtocolError('Missing or invalid id', ProtocolErrorCode.MISSING_REQUIRED_FIELD),
        };
      }

      if (!msg.type) {
        return {
          success: false,
          error: new ProtocolError('Missing message type', ProtocolErrorCode.MISSING_REQUIRED_FIELD),
        };
      }

      if (!Object.values(MessageType).includes(msg.type)) {
        return {
          success: false,
          error: new ProtocolError('Unknown message type', ProtocolErrorCode.UNKNOWN_MESSAGE_TYPE),
        };
      }

      if (!msg.timestamp || typeof msg.timestamp !== 'number') {
        return {
          success: false,
          error: new ProtocolError('Missing or invalid timestamp', ProtocolErrorCode.MISSING_REQUIRED_FIELD),
        };
      }

      // Payload validation
      if (!msg.payload || typeof msg.payload !== 'object') {
        return {
          success: false,
          error: new ProtocolError('Missing or invalid payload', ProtocolErrorCode.INVALID_PAYLOAD),
        };
      }

      const payload = msg.payload as Partial<TestPayload>;

      // Validate request
      const requestResult = this.validatePayloadRequest(payload.request);
      if (!requestResult.success) {
        return requestResult;
      }

      // Validate response
      const responseResult = this.validatePayloadResponse(payload.response);
      if (!responseResult.success) {
        return responseResult;
      }

      return {
        success: true,
        data: message as Message<TestPayload>,
      };
    } catch (error) {
      return {
        success: false,
        error: new ProtocolError('Validation failed', ProtocolErrorCode.INVALID_FORMAT),
      };
    }
  }

  parseMessage(data: unknown): ValidationResult<Message<TestPayload>> {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      return this.validateMessage(parsed);
    } catch (error) {
      return {
        success: false,
        error: new ProtocolError('Parse failed', ProtocolErrorCode.INVALID_FORMAT),
      };
    }
  }

  formatMessage(message: Message<TestPayload>): string {
    return JSON.stringify(message);
  }

  createRequest<M extends string>(_: M, data: TestPayload): Message<TestPayload> {
    return {
      id: Math.random().toString(36).slice(2),
      type: MessageType.REQUEST,
      timestamp: Date.now(),
      payload: data,
    };
  }

  createResponse(id: string, result: unknown): Message<TestPayload> {
    return {
      id,
      type: MessageType.RESPONSE,
      timestamp: Date.now(),
      payload: {
        request: {
          method: '',
          params: [],
        },
        response: {
          result,
        },
      },
    };
  }

  createError(id: string, error: Error): Message<TestPayload> {
    return {
      id,
      type: MessageType.ERROR,
      timestamp: Date.now(),
      payload: {
        request: {
          method: 'error',
          params: [],
        },
        response: {
          error: error.message,
        },
      },
    };
  }
}

describe('Protocol', () => {
  let protocol: TestProtocol;
  let timestamp: number;

  beforeEach(() => {
    protocol = new TestProtocol();
    timestamp = Date.now();
  });

  const createValidMessage = (overrides?: Partial<Message<TestPayload>>): Message<TestPayload> => ({
    id: '1',
    type: MessageType.REQUEST,
    timestamp,
    payload: {
      request: {
        method: 'test',
        params: [],
      },
      response: {},
    },
    ...overrides,
  });

  describe('Message Format Validation', () => {
    it('should validate valid messages', () => {
      const message = createValidMessage();
      const result = protocol.validateMessage(message);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(message);
      }
    });

    it('should reject messages with missing fields', () => {
      const invalidMessages = [
        null,
        undefined,
        {},
        { id: '1' },
        { id: '1', type: MessageType.REQUEST },
        { id: '1', type: MessageType.REQUEST, payload: null },
      ];

      for (const message of invalidMessages) {
        const result = protocol.validateMessage(message);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBeInstanceOf(ProtocolError);
          if (result.error instanceof ProtocolError) {
            expect([ProtocolErrorCode.INVALID_FORMAT, ProtocolErrorCode.MISSING_REQUIRED_FIELD]).toContain(
              result.error.code,
            );
          }
        }
      }
    });

    it('should validate payload structure', () => {
      const invalidMessages = [
        // Missing request field
        createValidMessage({
          payload: { response: {} } as unknown as TestPayload,
        }),
        // Missing response field
        createValidMessage({
          payload: { request: { method: 'test', params: [] } } as unknown as TestPayload,
        }),
        // Invalid method type
        createValidMessage({
          payload: {
            request: { method: 123 as unknown as string, params: [] },
            response: {},
          },
        }),
        // Invalid params type
        createValidMessage({
          payload: {
            request: { method: 'test', params: 'invalid' as unknown as unknown[] },
            response: {},
          },
        }),
        // Invalid error type
        createValidMessage({
          payload: {
            request: { method: 'test', params: [] },
            response: { error: 123 as unknown as string },
          },
        }),
      ];

      for (const message of invalidMessages) {
        const result = protocol.validateMessage(message);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBeInstanceOf(ProtocolError);
          if (result.error instanceof ProtocolError) {
            expect(result.error.code).toBe(ProtocolErrorCode.INVALID_PAYLOAD);
          }
        }
      }
    });

    it('should reject invalid message types', () => {
      const message = createValidMessage({
        type: 'invalid' as MessageType,
      });

      const result = protocol.validateMessage(message);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ProtocolError);
        if (result.error instanceof ProtocolError) {
          expect(result.error.code).toBe(ProtocolErrorCode.UNKNOWN_MESSAGE_TYPE);
        }
      }
    });
  });

  describe('Message Creation', () => {
    it('should create valid request messages', () => {
      const testData: TestPayload = {
        request: {
          method: 'test',
          params: ['param1', 2],
        },
        response: {},
      };
      const request = protocol.createRequest('test', testData);
      const result = protocol.validateMessage(request);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe(MessageType.REQUEST);
        expect(result.data.payload.request.method).toBe('test');
        expect(result.data.payload.request.params).toEqual(['param1', 2]);
      }
    });

    it('should create valid response messages', () => {
      const responseData = { data: 'success' };
      const response = protocol.createResponse('test-id', responseData);
      const result = protocol.validateMessage(response);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe(MessageType.RESPONSE);
        expect(result.data.id).toBe('test-id');
        expect(result.data.payload.response.result).toEqual(responseData);
      }
    });

    it('should create valid error messages', () => {
      const error = new Error('test error');
      const errorMessage = protocol.createError('test-id', error);
      const result = protocol.validateMessage(errorMessage);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe(MessageType.ERROR);
        expect(result.data.id).toBe('test-id');
        expect(result.data.payload.response.error).toBe(error.message);
      }
    });
  });

  describe('Message Processing', () => {
    it('should parse valid JSON messages', () => {
      const message = createValidMessage();
      const jsonStr = JSON.stringify(message);
      const result = protocol.parseMessage(jsonStr);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(message);
      }
    });

    it('should handle invalid JSON input', () => {
      const result = protocol.parseMessage('invalid json');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ProtocolError);
        if (result.error instanceof ProtocolError) {
          expect(result.error.code).toBe(ProtocolErrorCode.INVALID_FORMAT);
        }
      }
    });

    it('should format messages to JSON strings', () => {
      const message = createValidMessage();
      const formatted = protocol.formatMessage(message);
      expect(typeof formatted).toBe('string');
      expect(JSON.parse(formatted)).toEqual(message);
    });
  });
});
