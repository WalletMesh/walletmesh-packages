import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JsonRpcTransport } from './json-rpc.js';
import { TransportState, MessageType, type Message } from './types.js';
import { TransportError, TransportErrorCode } from './errors.js';
import type { JsonRpcMessage, JsonRpcSendFn } from './json-rpc.js';

interface TestPayload {
  method: string;
  params: unknown[];
}

describe('JsonRpcTransport', () => {
  const TEST_TIMEOUT = 5000;
  let transport: JsonRpcTransport;
  let mockSendRpc: JsonRpcSendFn;

  beforeEach(() => {
    mockSendRpc = vi.fn().mockImplementation(async (message: JsonRpcMessage) => {
      if ('method' in message) {
        if (message.method === 'connect' || message.method === 'disconnect') {
          return Promise.resolve();
        }
      }

      // Don't auto-respond to messages, let tests control responses
      return Promise.resolve();
    });

    vi.clearAllMocks();
    transport = new JsonRpcTransport(mockSendRpc);
  });

  describe('connection management', () => {
    it('should handle successful connection', async () => {
      await transport.connect();
      expect(transport.getState()).toBe(TransportState.CONNECTED);
      expect(transport.isConnected()).toBe(true);
    });

    it('should handle connection failures', async () => {
      const errorHandler = vi.fn();
      transport.addErrorHandler(errorHandler);

      (mockSendRpc as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Connection failed'));
      await expect(transport.connect()).rejects.toThrow(TransportError);

      expect(transport.getState()).toBe(TransportState.ERROR);
      expect(transport.isConnected()).toBe(false);
      expect(errorHandler).toHaveBeenCalledWith(expect.any(TransportError));
    });

    it('should handle disconnection', async () => {
      await transport.connect();
      await transport.disconnect();
      expect(transport.getState()).toBe(TransportState.DISCONNECTED);
      expect(transport.isConnected()).toBe(false);
    });

    it(
      'should remove error handlers after disconnect',
      async () => {
        const errorHandler = vi.fn();
        transport.addErrorHandler(errorHandler);
        await transport.connect();

        await transport.disconnect();
        errorHandler.mockClear(); // Clear the disconnect notification

        await expect(transport.connect()).resolves.toBeUndefined();
        expect(errorHandler).not.toHaveBeenCalled();
      },
      TEST_TIMEOUT,
    );
  });

  describe('message handling', () => {
    it(
      'should handle successful requests',
      async () => {
        await transport.connect();

        const message: Message<TestPayload> = {
          id: '1',
          type: MessageType.REQUEST,
          payload: { method: 'test', params: [] },
          timestamp: Date.now(),
        };

        const sendPromise = transport.send(message);

        // Simulate successful response
        transport.handleMessage({
          jsonrpc: '2.0',
          id: message.id,
          result: { success: true },
        });

        const result = await sendPromise;
        expect(result).toEqual({ success: true });
      },
      TEST_TIMEOUT,
    );

    it(
      'should handle RPC errors',
      async () => {
        await transport.connect();
        const errorHandler = vi.fn();
        transport.addErrorHandler(errorHandler);

        (mockSendRpc as ReturnType<typeof vi.fn>).mockImplementation((msg: JsonRpcMessage) => {
          if ('id' in msg) {
            transport.handleMessage({
              jsonrpc: '2.0',
              id: msg.id,
              error: {
                code: -32000,
                message: 'RPC Error',
              },
            });
          }
          return Promise.resolve();
        });

        const message: Message<TestPayload> = {
          id: '1',
          type: MessageType.REQUEST,
          payload: { method: 'test', params: [] },
          timestamp: Date.now(),
        };

        await expect(transport.send(message)).rejects.toThrow(TransportError);
        expect(mockSendRpc).toHaveBeenCalled();
        expect(errorHandler).toHaveBeenCalledWith(expect.any(TransportError));
      },
      TEST_TIMEOUT,
    );

    it(
      'should handle transport errors',
      async () => {
        await transport.connect();
        const errorHandler = vi.fn();
        transport.addErrorHandler(errorHandler);

        (mockSendRpc as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
          new TransportError('Send failed', TransportErrorCode.SEND_FAILED),
        );

        const message: Message<TestPayload> = {
          id: '1',
          type: MessageType.REQUEST,
          payload: { method: 'test', params: [] },
          timestamp: Date.now(),
        };

        await expect(transport.send(message)).rejects.toThrow(TransportError);
        expect(mockSendRpc).toHaveBeenCalled();
        expect(errorHandler).toHaveBeenCalledWith(expect.any(TransportError));
      },
      TEST_TIMEOUT,
    );

    it('should validate connection state before sending', async () => {
      const message: Message<TestPayload> = {
        id: '1',
        type: MessageType.REQUEST,
        payload: { method: 'test', params: [] },
        timestamp: Date.now(),
      };

      await expect(transport.send(message)).rejects.toThrow('Transport not connected');
      expect(mockSendRpc).not.toHaveBeenCalled();
    });

    it(
      'should format JSON-RPC requests correctly',
      async () => {
        await transport.connect();

        const message: Message<TestPayload> = {
          id: '1',
          type: MessageType.REQUEST,
          payload: { method: 'test', params: ['param1'] },
          timestamp: Date.now(),
        };

        const sendPromise = transport.send(message);

        expect(mockSendRpc).toHaveBeenCalledWith({
          jsonrpc: '2.0',
          id: message.id,
          method: message.type,
          params: message.payload,
        });

        // Complete the request
        transport.handleMessage({
          jsonrpc: '2.0',
          id: message.id,
          result: { success: true },
        });

        await sendPromise;
      },
      TEST_TIMEOUT,
    );
  });

  describe('subscription handling', () => {
    it('should allow subscribing to messages', () => {
      const onMessage = vi.fn();
      const unsubscribe = transport.subscribe({ onMessage });
      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    it('should allow unsubscribing from messages', () => {
      const onMessage = vi.fn();
      const unsubscribe = transport.subscribe({ onMessage });
      unsubscribe();
    });

    it('should handle multiple subscriptions', async () => {
      const errorSub1 = vi.fn();
      const errorSub2 = vi.fn();

      transport.addErrorHandler(errorSub1);
      transport.addErrorHandler(errorSub2);

      (mockSendRpc as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Test error'));
      await expect(transport.connect()).rejects.toThrow(TransportError);

      expect(errorSub1).toHaveBeenCalledWith(expect.any(TransportError));
      expect(errorSub2).toHaveBeenCalledWith(expect.any(TransportError));
    });
  });
});
