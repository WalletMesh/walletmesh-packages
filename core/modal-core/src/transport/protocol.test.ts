import { describe, expect, it } from 'vitest';
import { MessageType, type Message, type ValidationResult } from './types.js';
import type { Protocol } from './protocol.js';
import { TransportError, TransportErrorCode } from './errors.js';

interface TestRequest {
  method: string;
  params: unknown[];
}

interface TestResponse {
  result?: unknown;
  error?: {
    message: string;
    [key: string]: unknown;
  };
}

class TestProtocol implements Protocol<TestRequest> {
  public createRequest<M extends string>(method: M, params: TestRequest): Message<TestRequest> {
    return {
      id: `${method}-${Date.now()}`,
      type: MessageType.REQUEST,
      payload: params,
      timestamp: Date.now(),
    };
  }

  public createResponse<R>(id: string, result: R): Message<R> {
    return {
      id,
      type: MessageType.RESPONSE,
      payload: result,
      timestamp: Date.now(),
    };
  }

  public createError(id: string, error: Error): Message<TestRequest> {
    return {
      id,
      type: MessageType.ERROR,
      payload: {
        method: 'error',
        params: [error.message],
      },
      timestamp: Date.now(),
    };
  }

  public formatMessage<K>(message: Message<K>): unknown {
    return message;
  }

  public validateMessage<K>(message: unknown): ValidationResult<Message<K>> {
    if (
      typeof message === 'object' &&
      message !== null &&
      'type' in message &&
      'id' in message &&
      'payload' in message &&
      'timestamp' in message
    ) {
      return {
        success: true,
        data: message as Message<K>,
      };
    }
    return {
      success: false,
      error: new TransportError('Invalid message format', TransportErrorCode.PROTOCOL_ERROR),
    };
  }

  public parseMessage<K>(data: unknown): ValidationResult<Message<K>> {
    try {
      return this.validateMessage(data);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Failed to parse message'),
      };
    }
  }
}

describe('TestProtocol', () => {
  const protocol = new TestProtocol();

  describe('message creation', () => {
    it('creates request messages', () => {
      const method = 'test';
      const params: TestRequest = {
        method,
        params: ['param1', 2],
      };
      const message = protocol.createRequest(method, params);

      expect(message.type).toBe(MessageType.REQUEST);
      expect(message.payload.method).toBe(method);
      expect(message.payload.params).toEqual(['param1', 2]);
    });

    it('creates response messages', () => {
      const id = 'test-id';
      const responseData: TestResponse = {
        result: { success: true },
      };
      const message = protocol.createResponse(id, responseData);

      expect(message.type).toBe(MessageType.RESPONSE);
      expect(message.id).toBe(id);
      expect(message.payload.result).toEqual({ success: true });
    });

    it('creates error messages', () => {
      const id = 'test-id';
      const error = new Error('Test error');
      const message = protocol.createError(id, error);

      expect(message.type).toBe(MessageType.ERROR);
      expect(message.id).toBe(id);
      expect(message.payload.method).toBe('error');
      expect(message.payload.params[0]).toBe(error.message);
    });
  });

  describe('message validation', () => {
    it('validates request messages', () => {
      const method = 'test';
      const params: TestRequest = {
        method,
        params: ['param1', 2],
      };
      const message = protocol.createRequest(method, params);
      const result = protocol.validateMessage<TestRequest>(message);

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.type).toBe(MessageType.REQUEST);
        expect(result.data.payload.method).toBe('test');
        expect(result.data.payload.params).toEqual(['param1', 2]);
      }
    });

    it('validates response messages', () => {
      const id = 'test-id';
      const responseData: TestResponse = {
        result: { success: true },
      };
      const message = protocol.createResponse(id, responseData);
      const result = protocol.validateMessage<TestResponse>(message);

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.type).toBe(MessageType.RESPONSE);
        expect(result.data.id).toBe('test-id');
        expect(result.data.payload.result).toEqual({ success: true });
      }
    });

    it('validates error messages', () => {
      const id = 'test-id';
      const error = new Error('Test error');
      const message = protocol.createError(id, error);
      const result = protocol.validateMessage<TestRequest>(message);

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.type).toBe(MessageType.ERROR);
        expect(result.data.id).toBe('test-id');
        expect(result.data.payload.method).toBe('error');
        expect(result.data.payload.params[0]).toBe(error.message);
      }
    });

    it('handles invalid message format', () => {
      const result = protocol.validateMessage({});
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Invalid message format');
    });
  });
});
