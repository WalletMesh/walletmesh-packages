import { describe, it, expect, vi } from 'vitest';
import { TransportState, MessageType } from '../types.js';
import { TransportError, TransportErrorCode } from '../errors.js';
import {
  JsonRpcTransport,
  type JsonRpcMessage,
  type JsonRpcSendFn
} from '../json-rpc.js';


describe('JsonRpcTransport', () => {
  const timeout = 100; // Short timeout for tests
  
  function createMockSendFn(): JsonRpcSendFn {
    return vi.fn().mockImplementation(async (_: JsonRpcMessage) => {
      await Promise.resolve();
    }) as JsonRpcSendFn;
  }
  
  function createTransport() {
    const mockSendRpc = createMockSendFn();
    const transport = new JsonRpcTransport(mockSendRpc, { timeout });
    return { transport, mockSendRpc };
  }

  describe('connection management', () => {
    it('should handle successful connection', async () => {
      const { transport, mockSendRpc } = createTransport();

      await transport.connect();
      expect(transport.getState()).toBe(TransportState.CONNECTED);
      expect(transport.isConnected()).toBe(true);
      expect(mockSendRpc).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        method: 'connect'
      });
    });

    it('should handle connection failures', async () => {
      const error = new Error('Connection failed');
      const mockSendRpc = vi.fn().mockRejectedValue(error) as unknown as JsonRpcSendFn;
      const transport = new JsonRpcTransport(mockSendRpc, { timeout });
      const errorHandler = vi.fn();

      transport.addErrorHandler(errorHandler);
      await expect(transport.connect()).rejects.toThrow(TransportError);
      expect(transport.getState()).toBe(TransportState.ERROR);
      expect(errorHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          code: TransportErrorCode.CONNECTION_FAILED,
          cause: error
        })
      );
    });

    it('should handle disconnection', async () => {
      const { transport, mockSendRpc } = createTransport();

      await transport.connect();
      await transport.disconnect();

      expect(transport.getState()).toBe(TransportState.DISCONNECTED);
      expect(transport.isConnected()).toBe(false);
      expect(mockSendRpc).toHaveBeenLastCalledWith({
        jsonrpc: '2.0',
        method: 'disconnect'
      });
    });

    it('should handle error handlers cleanup on disconnect', async () => {
      const { transport } = createTransport();
      const errorHandler = vi.fn();

      await transport.connect();
      transport.addErrorHandler(errorHandler);
      await transport.disconnect();

      // Should receive disconnect notification
      expect(errorHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          code: TransportErrorCode.CONNECTION_FAILED,
          message: 'Transport disconnected'
        })
      );
    });
  });

  describe('message handling', () => {
    it('should handle successful requests', async () => {
      const { transport, mockSendRpc } = createTransport();

      // Set up mock to simulate response via handleMessage
      (mockSendRpc as ReturnType<typeof vi.fn>).mockImplementation((message: JsonRpcMessage) => {
        if ('id' in message && message.id) {
          transport.handleMessage({
            jsonrpc: '2.0',
            id: message.id,
            result: { success: true }
          });
        }
        return Promise.resolve();
      });

      await transport.connect();

      const response = await transport.send({
        id: '1',
        type: MessageType.REQUEST,
        payload: { test: true },
        timestamp: Date.now()
      });

      expect(response).toEqual(expect.objectContaining({ success: true }));
    });

    it('should handle RPC errors', async () => {
      const { transport, mockSendRpc } = createTransport();
      const errorHandler = vi.fn();

      (mockSendRpc as ReturnType<typeof vi.fn>).mockImplementation((message: JsonRpcMessage) => {
        if ('id' in message && message.id) {
          transport.handleMessage({
            jsonrpc: '2.0',
            id: message.id,
            error: {
              code: -32000,
              message: 'RPC Error'
            }
          });
        }
        return Promise.resolve();
      });

      await transport.connect();
      transport.addErrorHandler(errorHandler);

      const message = {
        id: '1',
        type: MessageType.REQUEST,
        payload: { test: true },
        timestamp: Date.now()
      };

      await expect(transport.send(message)).rejects.toThrow(TransportError);
      expect(errorHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          code: TransportErrorCode.INVALID_MESSAGE,
          message: 'RPC Error'
        })
      );
    });

    it('should handle transport errors', async () => {
      const error = new Error('Transport error');
      const fn = createMockSendFn();
      (fn as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(undefined) // For connect
        .mockRejectedValueOnce(error); // For send
      const transport = new JsonRpcTransport(fn, { timeout });
      const errorHandler = vi.fn();

      await transport.connect();
      transport.addErrorHandler(errorHandler);

      const message = {
        id: '1',
        type: MessageType.REQUEST,
        payload: { test: true },
        timestamp: Date.now()
      };

      await expect(transport.send(message)).rejects.toThrow(TransportError);
      expect(errorHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          code: TransportErrorCode.CONNECTION_FAILED,
          message: 'Failed to send message'
        })
      );
    });

    it('should validate connection state before sending', async () => {
      const { transport, mockSendRpc } = createTransport();
      const errorHandler = vi.fn();

      transport.addErrorHandler(errorHandler);

      const message = {
        id: '1',
        type: MessageType.REQUEST,
        payload: { test: true },
        timestamp: Date.now()
      };

      await expect(transport.send(message)).rejects.toThrow(TransportError);
      expect(mockSendRpc).not.toHaveBeenCalled();
      expect(errorHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          code: TransportErrorCode.CONNECTION_FAILED,
          message: 'Transport not connected'
        })
      );
    });

    it('should format JSON-RPC requests correctly', async () => {
      const { transport, mockSendRpc } = createTransport();

      (mockSendRpc as ReturnType<typeof vi.fn>).mockImplementation((message: JsonRpcMessage) => {
        if ('id' in message && message.id) {
          transport.handleMessage({
            jsonrpc: '2.0',
            id: message.id,
            result: { success: true }
          });
        }
        return Promise.resolve();
      });

      await transport.connect();

      const message = {
        id: '1',
        type: MessageType.REQUEST,
        payload: { test: true },
        timestamp: Date.now()
      };

      await transport.send(message);

      expect(mockSendRpc).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        id: '1',
        method: MessageType.REQUEST,
        params: { test: true }
      });
    });
  });

  describe('subscription handling', () => {
    it('should allow subscribing to messages', async () => {
      const { transport } = createTransport();
      const handler = vi.fn();

      const unsubscribe = transport.subscribe({ onMessage: handler });
      expect(typeof unsubscribe).toBe('function');
    });

    it('should allow unsubscribing from messages', async () => {
      const { transport } = createTransport();
      const handler = vi.fn();

      const unsubscribe = transport.subscribe({ onMessage: handler });
      unsubscribe();
    });

    it('should handle multiple subscriptions', async () => {
      const { transport } = createTransport();
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      const unsubscribe1 = transport.subscribe({ onMessage: handler1 });
      const unsubscribe2 = transport.subscribe({ onMessage: handler2 });

      unsubscribe1();
      unsubscribe2();
    });
  });
});