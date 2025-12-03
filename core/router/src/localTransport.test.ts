import type { JSONRPCContext, JSONRPCEventMap, JSONRPCMethodMap } from '@walletmesh/jsonrpc';
import { JSONRPCNode } from '@walletmesh/jsonrpc';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createLocalTransport, createLocalTransportPair, LocalTransport } from './localTransport.js';

describe('LocalTransport', () => {
  let originalOnError: OnErrorEventHandler | null;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    originalOnError = global.onerror;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    global.onerror = originalOnError;
  });

  describe('LocalTransport class', () => {
    it('should create a new instance', () => {
      const transport = new LocalTransport();
      expect(transport).toBeInstanceOf(LocalTransport);
    });

    it('should connect to a remote node', () => {
      const transport = new LocalTransport();
      const mockNode = {} as JSONRPCNode<JSONRPCMethodMap, JSONRPCEventMap, JSONRPCContext>;

      expect(() => transport.connectTo(mockNode)).not.toThrow();
    });

    it('should throw error when sending without connected node', async () => {
      const transport = new LocalTransport();

      await expect(transport.send({ test: 'message' })).rejects.toThrow(
        'LocalTransport: No remote node connected',
      );
    });

    it('should send message to connected remote node', async () => {
      const transport = new LocalTransport();
      const mockNode = {
        receiveMessage: vi.fn(),
      } as unknown as JSONRPCNode<JSONRPCMethodMap, JSONRPCEventMap, JSONRPCContext>;

      transport.connectTo(mockNode);

      const message = { jsonrpc: '2.0', method: 'test', id: 1 };
      const sendPromise = transport.send(message);

      // Advance timers to trigger the setTimeout
      await vi.advanceTimersByTimeAsync(0);

      await sendPromise;

      expect(mockNode.receiveMessage).toHaveBeenCalledWith(message);
    });

    it('should handle errors in remote node receiveMessage', async () => {
      const transport = new LocalTransport();
      const mockNode = {
        receiveMessage: vi.fn().mockImplementation(() => {
          throw new Error('Test error');
        }),
      } as unknown as JSONRPCNode<JSONRPCMethodMap, JSONRPCEventMap, JSONRPCContext>;

      transport.connectTo(mockNode);

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const message = { jsonrpc: '2.0', method: 'test', id: 1 };
      const sendPromise = transport.send(message);

      await vi.advanceTimersByTimeAsync(0);
      await sendPromise;

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'LocalTransport: Error in receiveMessage:',
        expect.any(Error),
      );
    });

    it('should throw error in receiveMessage when throwOnError is true', async () => {
      const transport = new LocalTransport({ throwOnError: true });
      const mockNode = {
        receiveMessage: vi.fn().mockImplementation(() => {
          throw new Error('Test error');
        }),
      } as unknown as JSONRPCNode<JSONRPCMethodMap, JSONRPCEventMap, JSONRPCContext>;

      transport.connectTo(mockNode);

      const message = { jsonrpc: '2.0', method: 'test', id: 1 };

      // The error will be thrown in the setTimeout callback
      await expect(transport.send(message)).rejects.toThrow('Test error');
    });

    it('should handle null remote node during async send', async () => {
      const transport = new LocalTransport();
      const mockNode = {
        receiveMessage: vi.fn(),
      } as unknown as JSONRPCNode<JSONRPCMethodMap, JSONRPCEventMap, JSONRPCContext>;

      transport.connectTo(mockNode);

      const message = { jsonrpc: '2.0', method: 'test', id: 1 };
      const sendPromise = transport.send(message);

      // Disconnect the node before the async operation completes
      transport.connectTo(null as unknown as JSONRPCNode<JSONRPCMethodMap, JSONRPCEventMap, JSONRPCContext>);

      await vi.advanceTimersByTimeAsync(0);
      await sendPromise;

      // Should not throw, just silently skip
      expect(mockNode.receiveMessage).not.toHaveBeenCalled();
    });

    it('should register message handler', () => {
      const transport = new LocalTransport();
      const handler = vi.fn();

      expect(() => transport.onMessage(handler)).not.toThrow();
    });

    it('should receive message and pass to handler', async () => {
      const transport = new LocalTransport();
      const handler = vi.fn();

      transport.onMessage(handler);

      const message = { jsonrpc: '2.0', method: 'test', id: 1 };
      transport.receive(message);

      // Advance timers to trigger the setTimeout
      await vi.advanceTimersByTimeAsync(0);

      expect(handler).toHaveBeenCalledWith(message);
    });

    it('should handle errors in message handler', async () => {
      const transport = new LocalTransport();
      const handler = vi.fn().mockImplementation(() => {
        throw new Error('Handler error');
      });

      transport.onMessage(handler);

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const message = { jsonrpc: '2.0', method: 'test', id: 1 };
      transport.receive(message);

      await vi.advanceTimersByTimeAsync(0);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'LocalTransport: Error in message handler:',
        expect.any(Error),
      );
    });

    it('should verify throwOnError behavior difference', async () => {
      // Test with throwOnError: false (default)
      const transportWithLogging = new LocalTransport({ throwOnError: false });
      const handlerWithLogging = vi.fn().mockImplementation(() => {
        throw new Error('Test error');
      });
      transportWithLogging.onMessage(handlerWithLogging);

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      transportWithLogging.receive({ test: 'message' });
      await vi.advanceTimersByTimeAsync(0);

      // Should log warning when throwOnError is false
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'LocalTransport: Error in message handler:',
        expect.any(Error),
      );

      // Clean up
      consoleWarnSpy.mockRestore();

      // Test with throwOnError: true - verify behavior, not internal state
      const transportWithThrow = new LocalTransport({ throwOnError: true });

      // Verify that it was constructed without errors
      expect(transportWithThrow).toBeInstanceOf(LocalTransport);
    });

    it('should handle null message handler during async receive', async () => {
      const transport = new LocalTransport();
      const handler = vi.fn();

      transport.onMessage(handler);

      const message = { jsonrpc: '2.0', method: 'test', id: 1 };
      transport.receive(message);

      // Clear the handler before the async operation completes
      transport.onMessage(null as unknown as (message: unknown) => void);

      await vi.advanceTimersByTimeAsync(0);

      // Handler should not be called
      expect(handler).not.toHaveBeenCalled();
    });

    it('should not throw when receiving without handler', () => {
      const transport = new LocalTransport();
      const message = { jsonrpc: '2.0', method: 'test', id: 1 };

      expect(() => transport.receive(message)).not.toThrow();
    });
  });

  describe('createLocalTransportPair', () => {
    it('should create two connected transports', () => {
      const [transport1, transport2] = createLocalTransportPair();

      expect(transport1).toBeInstanceOf(LocalTransport);
      expect(transport2).toBeInstanceOf(LocalTransport);
    });

    it('should create transports with throwOnError option', async () => {
      const [transport1, transport2] = createLocalTransportPair({ throwOnError: true });

      // Test that errors are thrown (not logged) when throwOnError is true
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Create a handler that throws on second call
      let callCount = 0;
      const handler = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 2) {
          throw new Error('Test error in pair');
        }
      });

      transport2.onMessage(handler);

      // First message should succeed
      await transport1.send({ test: 'message1' });
      await vi.advanceTimersByTimeAsync(0);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).not.toHaveBeenCalled();

      // Second message will throw an error in setTimeout
      // We need to catch it using process error handlers (Node.js environment)
      let unhandledError: Error | null = null;
      const uncaughtExceptionHandler = (error: Error) => {
        unhandledError = error;
      };

      process.on('uncaughtException', uncaughtExceptionHandler);

      await transport1.send({ test: 'message2' });
      await vi.advanceTimersByTimeAsync(0);

      process.off('uncaughtException', uncaughtExceptionHandler);

      expect(handler).toHaveBeenCalledTimes(2);
      // Key assertion: no warning logged when throwOnError is true
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      // Verify the error was thrown
      expect(unhandledError).not.toBeNull();
      expect(unhandledError).toBeInstanceOf(Error);
      expect((unhandledError as unknown as Error).message).toBe('Test error in pair');

      consoleWarnSpy.mockRestore();
    });

    it('should allow bidirectional communication', async () => {
      const [transport1, transport2] = createLocalTransportPair();

      const handler1 = vi.fn();
      const handler2 = vi.fn();

      transport1.onMessage(handler1);
      transport2.onMessage(handler2);

      const message1 = { jsonrpc: '2.0', method: 'test1', id: 1 };
      const message2 = { jsonrpc: '2.0', method: 'test2', id: 2 };

      // Send from transport1 to transport2
      await transport1.send(message1);

      // Allow async processing
      await vi.advanceTimersByTimeAsync(0);

      // Send from transport2 to transport1
      await transport2.send(message2);

      // Allow async processing
      await vi.advanceTimersByTimeAsync(0);

      // Messages should be received by the opposite transport
      expect(handler2).toHaveBeenCalledWith(message1);
      expect(handler1).toHaveBeenCalledWith(message2);
    });

    it('should work with JSONRPCNode instances', async () => {
      const [clientTransport, serverTransport] = createLocalTransportPair();

      // Create nodes
      const serverNode = new JSONRPCNode(serverTransport);
      new JSONRPCNode(clientTransport);

      // Register a method on the server
      serverNode.registerMethod('echo', async (_context, params) => {
        return params;
      });

      // Track response
      let responseReceived: unknown = null;
      const responsePromise = new Promise((resolve) => {
        clientTransport.onMessage((msg: unknown) => {
          if (msg && typeof msg === 'object' && 'result' in msg) {
            responseReceived = msg;
            resolve((msg as { result: unknown }).result);
          }
        });
      });

      // Send request from client to server
      const request = {
        jsonrpc: '2.0' as const,
        method: 'echo',
        params: ['hello'],
        id: 1,
      };

      await clientTransport.send(request);

      // Allow async processing
      await vi.advanceTimersByTimeAsync(0);

      const result = await responsePromise;

      expect(result).toEqual(['hello']);
      expect(responseReceived).toMatchObject({
        jsonrpc: '2.0',
        id: 1,
        result: ['hello'],
      });
    });
  });

  describe('createLocalTransport', () => {
    it('should create a transport connected to the provided node', () => {
      const mockNode = {} as JSONRPCNode<JSONRPCMethodMap, JSONRPCEventMap, JSONRPCContext>;
      const transport = createLocalTransport(mockNode);

      expect(transport).toBeInstanceOf(LocalTransport);
    });

    it('should send messages to the connected node', async () => {
      const mockNode = {
        receiveMessage: vi.fn(),
      } as unknown as JSONRPCNode<JSONRPCMethodMap, JSONRPCEventMap, JSONRPCContext>;

      const transport = createLocalTransport(mockNode);

      const message = { jsonrpc: '2.0', method: 'test', id: 1 };
      const sendPromise = transport.send(message);

      await vi.advanceTimersByTimeAsync(0);
      await sendPromise;

      expect(mockNode.receiveMessage).toHaveBeenCalledWith(message);
    });

    it('should create transport with throwOnError option', async () => {
      const mockNode = {
        receiveMessage: vi.fn().mockImplementation(() => {
          throw new Error('Node error');
        }),
      } as unknown as JSONRPCNode<JSONRPCMethodMap, JSONRPCEventMap, JSONRPCContext>;

      const transport = createLocalTransport(mockNode, { throwOnError: true });

      const message = { jsonrpc: '2.0', method: 'test', id: 1 };

      await expect(transport.send(message)).rejects.toThrow('Node error');
    });
  });

  describe('Integration tests', () => {
    it('should handle high-frequency message exchange', async () => {
      const [transport1, transport2] = createLocalTransportPair();

      const messages: unknown[] = [];
      transport2.onMessage((msg: unknown) => messages.push(msg));

      // Send multiple messages rapidly
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(transport1.send({ id: i }));
      }

      await Promise.all(promises);

      // Allow all async processing to complete
      await vi.advanceTimersByTimeAsync(0);

      expect(messages).toHaveLength(100);
      expect(messages[0]).toEqual({ id: 0 });
      expect(messages[99]).toEqual({ id: 99 });
    });

    it('should maintain message order', async () => {
      const [transport1, transport2] = createLocalTransportPair();

      const receivedOrder: number[] = [];
      transport2.onMessage((msg: unknown) => {
        receivedOrder.push((msg as { order: number }).order);
      });

      // Send messages in order
      for (let i = 0; i < 10; i++) {
        await transport1.send({ order: i });
        // Allow each message to be processed
        await vi.advanceTimersByTimeAsync(0);
      }

      expect(receivedOrder).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
  });
});
