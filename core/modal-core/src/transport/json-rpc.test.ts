import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { JsonRpcTransport, type JsonRpcMessage } from './json-rpc.js';
import { ConnectionState, MessageType } from './types.js';
import { createTransportError } from './errors.js';
import type { Message } from './types.js';

class TestJsonRpcTransport extends JsonRpcTransport {
  private mockMessages: JsonRpcMessage[] = [];
  private mockErrors: Error[] = [];

  constructor() {
    super(100); // Short timeout for tests
  }

  public getMockMessages(): JsonRpcMessage[] {
    return this.mockMessages;
  }

  public getMockErrors(): Error[] {
    return this.mockErrors;
  }

  // Accept any message-like object for testing
  public simulateIncomingMessage(message: { id: string } & Record<string, unknown>): void {
    // Cast to unknown first to avoid direct type assertion
    this.handleMessage(message as unknown as JsonRpcMessage);
  }

  protected override sendJsonRpcMessage(message: JsonRpcMessage): void {
    this.mockMessages.push(message);
  }
}

describe('JsonRpcTransport', () => {
  let transport: TestJsonRpcTransport;

  beforeEach(() => {
    transport = new TestJsonRpcTransport();
    transport['setState'](ConnectionState.CONNECTED);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Message handling', () => {
    it('should handle request messages', async () => {
      const requestMessage: Message = {
        id: 'test',
        type: MessageType.REQUEST,
        payload: {
          method: 'test_method',
          params: ['param1', 'param2'],
        },
        timestamp: Date.now(),
      };

      const sendPromise = transport.send(requestMessage);

      // Use type that matches simulator input
      const jsonRpcResponse: { id: string } & Record<string, unknown> = {
        jsonrpc: '2.0',
        id: 'test',
        result: { success: true },
      };

      transport.simulateIncomingMessage(jsonRpcResponse);
      const response = await sendPromise;

      expect(response).toBeDefined();
      expect(response.payload).toEqual({ success: true });
    });

    it('should handle message timeouts', async () => {
      const requestMessage: Message = {
        id: 'test',
        type: MessageType.REQUEST,
        payload: {
          method: 'test_method',
          params: [],
        },
        timestamp: Date.now(),
      };

      const promise = transport.send(requestMessage);
      await expect(promise).rejects.toThrow(createTransportError.timeout('Message timeout'));
    });

    it('should validate message format', async () => {
      // Use type that matches simulator input
      const invalidMessage: { id: string } & Record<string, unknown> = {
        jsonrpc: '1.0',
        id: 'test',
        result: {},
      };

      transport.simulateIncomingMessage(invalidMessage);
      const errors = transport.getMockErrors();
      expect(errors[0]).toEqual(createTransportError.error('Invalid JSON-RPC message'));
    });

    it('should handle protocol errors', async () => {
      const requestMessage: Message = {
        id: 'test',
        type: MessageType.REQUEST,
        payload: {
          method: 'test_method',
          params: [],
        },
        timestamp: Date.now(),
      };

      const sendPromise = transport.send(requestMessage);

      // Use type that matches simulator input
      const errorResponse: { id: string } & Record<string, unknown> = {
        jsonrpc: '2.0',
        id: 'test',
        error: {
          code: -32000,
          message: 'Test error',
        },
      };

      transport.simulateIncomingMessage(errorResponse);
      await expect(sendPromise).rejects.toThrow('Test error');
    });
  });

  describe('Connection state', () => {
    it('should reject messages when not connected', async () => {
      transport['setState'](ConnectionState.DISCONNECTED);

      const message: Message = {
        id: 'test',
        type: MessageType.REQUEST,
        payload: {
          method: 'test_method',
          params: [],
        },
        timestamp: Date.now(),
      };

      await expect(transport.send(message)).rejects.toThrow(
        createTransportError.notConnected('Transport not connected'),
      );
    });

    it('should handle connection state changes', async () => {
      transport['setState'](ConnectionState.DISCONNECTED);
      expect(transport.isConnected()).toBe(false);

      transport['setState'](ConnectionState.CONNECTED);
      expect(transport.isConnected()).toBe(true);
    });
  });
});
