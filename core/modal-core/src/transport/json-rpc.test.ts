/**
 * @packageDocumentation
 * Tests for JSON-RPC protocol implementation.
 */

import { describe, it, expect } from 'vitest';
import { JsonRpcProtocol } from './json-rpc.js';
import { MessageType, type Message, TransportError, TransportErrorCode } from './types.js';
import type { ValidationResult } from './protocol-validator.js';

interface JsonRpcRequestPayload {
  method: string;
  params: unknown[];
}

describe('JsonRpcProtocol', () => {
  const protocol = new JsonRpcProtocol();

  describe('message validation', () => {
    it('should validate valid JSON-RPC request', () => {
      const request: Message<JsonRpcRequestPayload> = {
        id: '1',
        type: MessageType.REQUEST,
        timestamp: Date.now(),
        payload: {
          method: 'test',
          params: ['param1'],
        },
      };

      const result = protocol.validateMessage(request);
      expect(result.success).toBe(true);
    });

    it('should validate valid JSON-RPC response', () => {
      const response: Message<JsonRpcRequestPayload> = {
        id: '1',
        type: MessageType.RESPONSE,
        timestamp: Date.now(),
        payload: {
          method: 'response',
          params: ['success'],
        },
      };

      const result = protocol.validateMessage(response);
      expect(result.success).toBe(true);
    });

    it('should validate valid JSON-RPC error', () => {
      const error: Message<JsonRpcRequestPayload> = {
        id: '1',
        type: MessageType.ERROR,
        timestamp: Date.now(),
        payload: {
          method: 'error',
          params: [{
            code: -32000,
            message: 'Error message',
            data: { details: 'test' },
          }],
        },
      };

      const result = protocol.validateMessage(error);
      expect(result.success).toBe(true);
    });

    it('should reject invalid messages', () => {
      const invalidMessages = [
        null,
        undefined,
        {},
        { jsonrpc: '1.0', id: '1' },
        { jsonrpc: '2.0' },
        { jsonrpc: '2.0', id: 1 },
      ];

      for (const msg of invalidMessages) {
        const result = protocol.validateMessage(msg);
        expect(result.success).toBe(false);
      }
    });

    it('should validate error response with optional data', () => {
      const withData: Message<JsonRpcRequestPayload> = {
        id: '1',
        type: MessageType.ERROR,
        timestamp: Date.now(),
        payload: {
          method: 'error',
          params: [{
            code: -32000,
            message: 'Error with data',
            data: { extra: 'info' },
          }],
        },
      };

      const withoutData: Message<JsonRpcRequestPayload> = {
        id: '1',
        type: MessageType.ERROR,
        timestamp: Date.now(),
        payload: {
          method: 'error',
          params: [{
            code: -32000,
            message: 'Error without data',
          }],
        },
      };

      expect(protocol.validateMessage(withData).success).toBe(true);
      expect(protocol.validateMessage(withoutData).success).toBe(true);
    });
  });

  describe('message parsing', () => {
    it('should parse request message', () => {
      const request = {
        jsonrpc: '2.0',
        id: '1',
        method: 'test',
        params: ['param1', 'param2'],
      };

      const result = protocol.parseMessage(request);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          id: '1',
          type: MessageType.REQUEST,
          payload: {
            method: 'test',
            params: ['param1', 'param2'],
            jsonrpc: '2.0',
          },
          timestamp: expect.any(Number),
        });
      }
    });

    it('should parse response message', () => {
      const response = {
        jsonrpc: '2.0',
        id: '1',
        result: 'success',
      };

      expect(() => protocol.parseMessage(response)).toThrow(TransportError);
    });

    it('should handle malformed responses', () => {
      const malformedResponses = [
        { jsonrpc: '2.0', id: '1' },
        { jsonrpc: '1.0', id: '1', result: 'wrong version' },
        { id: '1', error: { code: -32000, message: 'error' } },
      ];

      for (const response of malformedResponses) {
        expect(() => protocol.parseMessage(response)).toThrow(TransportError);
      }
    });

    it('should throw on invalid messages', () => {
      expect(() => protocol.parseMessage({})).toThrow(TransportError);
      expect(() => protocol.parseMessage({ jsonrpc: '1.0' })).toThrow(TransportError);
    });
  });

  describe('message creation', () => {
    it('should create request message', () => {
      const params = [{ test: true }];
      const message = protocol.createRequest('test_method', params);

      expect(message.type).toBe(MessageType.REQUEST);
      expect(message.payload.method).toBe('test_method');
      expect(message.payload.params).toEqual(params);
    });

    it('should handle non-array params in createRequest', () => {
      const params = { test: true };
      const message = protocol.createRequest('test_method', params);

      expect(message).toMatchObject({
        type: MessageType.REQUEST,
        payload: {
          method: 'test_method',
          params: [params],
        },
      });
    });

    it('should create response message', () => {
      const result = { success: true };
      const message = protocol.createResponse('1', result);

      const formatted = protocol.formatMessage(message);
      const parsed = JSON.parse(formatted);

      expect(parsed).toEqual({
        jsonrpc: '2.0',
        id: '1',
        result,
      });
    });

    it('should create error message', () => {
      const error = new Error('Test error');
      const message = protocol.createError('1', error);

      const formatted = protocol.formatMessage(message);
      const parsed = JSON.parse(formatted);

      expect(parsed).toMatchObject({
        jsonrpc: '2.0',
        id: '1',
        error: expect.objectContaining({
          code: -32603,
          message: 'Test error',
        }),
      });
    });

    it('should handle null parameters', () => {
      const message = protocol.createRequest('test_method', null);
      expect(message.payload.params).toEqual([]);
    });
  });

  describe('message formatting', () => {
    it('should format request message', () => {
      const params = ['param1', 'param2'];
      const message = protocol.createRequest('test_method', params);
      const formatted = JSON.parse(protocol.formatMessage(message));

      expect(formatted).toEqual({
        jsonrpc: '2.0',
        id: message.id,
        method: 'test_method',
        params,
      });
    });

    it('should format response message', () => {
      const result = { success: true };
      const message = protocol.createResponse('1', result);
      const formatted = JSON.parse(protocol.formatMessage(message));

      expect(formatted).toEqual({
        jsonrpc: '2.0',
        id: '1',
        result,
      });
    });

    it('should format error message', () => {
      const error = new Error('Test error');
      const message = protocol.createError('1', error);
      const formatted = JSON.parse(protocol.formatMessage(message));

      expect(formatted).toEqual({
        jsonrpc: '2.0',
        id: '1',
        error: expect.objectContaining({
          code: -32603,
          message: 'Test error',
        }),
      });
    });

    it('should handle complex parameter types', () => {
      const params = [
        { nested: { object: true } },
        [1, 2, 3],
        null,
      ];
      const message = protocol.createRequest('test_method', params);
      const formatted = JSON.parse(protocol.formatMessage(message));

      expect(formatted.params).toEqual(params);
    });

    it('should throw on unsupported message type', () => {
      const invalidMessage = {
        id: '1',
        type: 'invalid' as MessageType,
        timestamp: Date.now(),
        payload: {
          method: 'test',
          params: [],
          jsonrpc: '2.0',
        },
      };

      expect(() => protocol.formatMessage(invalidMessage)).toThrow(TransportError);
    });
  });
});
