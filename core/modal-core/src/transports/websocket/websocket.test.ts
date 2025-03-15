import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebSocketTransport } from './index.js';
import { TransportErrorCode } from '../types.js';

describe('WebSocketTransport', () => {
  const mockWsInstance = {
    onopen: null as (() => void) | null,
    onclose: null as (() => void) | null,
    onmessage: null as ((event: { data: string }) => void) | null,
    onerror: null as ((event: Event & { error?: Error }) => void) | null,
    close: vi.fn(),
    send: vi.fn(),
  };

  let MockWebSocket: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Create WebSocket mock class
    MockWebSocket = vi.fn().mockImplementation(() => mockWsInstance);

    // Setup global WebSocket
    Object.defineProperty(globalThis, 'WebSocket', {
      value: MockWebSocket,
      configurable: true,
    });

    vi.useFakeTimers();
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'WebSocket', {
      value: undefined,
      configurable: true,
    });
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should initialize successfully when WebSocket is available', async () => {
    const transport = new WebSocketTransport({ url: 'ws://localhost:8080' });
    await expect(transport.initialize()).resolves.not.toThrow();
  });

  it('should fail initialization when WebSocket is not available', async () => {
    Object.defineProperty(globalThis, 'WebSocket', {
      value: undefined,
      configurable: true,
    });
    const transport = new WebSocketTransport({ url: 'ws://localhost:8080' });

    await expect(transport.initialize()).rejects.toThrow();
    await expect(transport.initialize()).rejects.toMatchObject({
      code: TransportErrorCode.INITIALIZATION_FAILED,
    });
  });

  it('should connect successfully', async () => {
    const transport = new WebSocketTransport({ url: 'ws://localhost:8080' });
    await transport.initialize();
    const connectPromise = transport.connect();

    // Simulate successful connection
    mockWsInstance.onopen?.();

    await connectPromise;
    expect(transport.isConnected).toBe(true);
    expect(MockWebSocket).toHaveBeenCalledWith('ws://localhost:8080', undefined);
  });

  it('should support protocol option', async () => {
    const transport = new WebSocketTransport({
      url: 'ws://localhost:8080',
      protocols: ['v1'],
    });
    await transport.initialize();
    const connectPromise = transport.connect();

    mockWsInstance.onopen?.();

    await connectPromise;
    expect(MockWebSocket).toHaveBeenCalledWith('ws://localhost:8080', ['v1']);
  });

  it('should handle connection timeout', async () => {
    const transport = new WebSocketTransport({
      url: 'ws://localhost:8080',
      timeout: 1000,
      retries: 0, // Disable retries for this test
    });

    await transport.initialize();

    const connectAttempt = async () => {
      try {
        await transport.connect();
      } catch (err) {
        // Expected timeout error, return it for assertion
        return err;
      }
    };

    const connectPromise = connectAttempt();
    await vi.advanceTimersByTimeAsync(1000);

    const error = await connectPromise;
    expect(error).toBeDefined();
    expect(error).toMatchObject({
      code: TransportErrorCode.TIMEOUT,
    });
    expect(transport.isConnected).toBe(false);
  });

  it('should handle disconnection', async () => {
    const transport = new WebSocketTransport({ url: 'ws://localhost:8080' });
    await transport.initialize();
    const connectPromise = transport.connect();
    mockWsInstance.onopen?.();
    await connectPromise;

    await transport.disconnect();
    expect(transport.isConnected).toBe(false);
    expect(mockWsInstance.close).toHaveBeenCalled();
  });

  it('should handle message sending', async () => {
    const transport = new WebSocketTransport({ url: 'ws://localhost:8080' });
    await transport.initialize();
    const connectPromise = transport.connect();
    mockWsInstance.onopen?.();
    await connectPromise;

    const testData = { type: 'test' };
    await transport.send(testData);

    expect(mockWsInstance.send).toHaveBeenCalledWith(JSON.stringify(testData));
  });

  it('should handle message receiving', async () => {
    const transport = new WebSocketTransport({ url: 'ws://localhost:8080' });
    const onMessage = vi.fn();
    transport.onMessage = onMessage;

    await transport.initialize();
    const connectPromise = transport.connect();
    mockWsInstance.onopen?.();
    await connectPromise;

    const testMessage = { type: 'test' };
    mockWsInstance.onmessage?.({
      data: JSON.stringify(testMessage),
    });

    expect(onMessage).toHaveBeenCalledWith(testMessage);
  });

  it('should handle connection errors', async () => {
    const transport = new WebSocketTransport({
      url: 'ws://localhost:8080',
      timeout: 100,
      retries: 0,
    });

    await transport.initialize();
    const connectPromise = transport.connect();

    // Create WebSocket error event
    const mockError = new Error('Connection failed');
    const errorEvent = new ErrorEvent('error', { error: mockError });
    mockWsInstance.onerror?.(errorEvent);

    await expect(connectPromise).rejects.toMatchObject({
      code: TransportErrorCode.CONNECTION_FAILED,
      message: expect.stringContaining('WebSocket connection error'),
    });
    expect(transport.isConnected).toBe(false);
  });

  it('should handle automatic reconnection', async () => {
    const transport = new WebSocketTransport({
      url: 'ws://localhost:8080',
      retries: 1,
      retryDelay: 100,
      timeout: 500,
    });

    await transport.initialize();
    const connectPromise = transport.connect();

    // Simulate initial connection
    mockWsInstance.onopen?.();
    await connectPromise;

    // Simulate disconnection
    mockWsInstance.onclose?.();
    expect(transport.isConnected).toBe(false);

    // Wait for reconnection attempt
    await vi.advanceTimersByTimeAsync(100);

    // Simulate successful reconnection
    mockWsInstance.onopen?.();
    await Promise.resolve(); // Allow state to update
    expect(transport.isConnected).toBe(true);
  });

  it('should fail after max reconnection attempts', async () => {
    const transport = new WebSocketTransport({
      url: 'ws://localhost:8080',
      retries: 1,
      retryDelay: 1,
      timeout: 10,
    });

    await transport.initialize();

    // Mock WebSocket to fail immediately
    MockWebSocket.mockImplementation(() => {
      const ws = {
        ...mockWsInstance,
        close: vi.fn(),
      };
      // Fail immediately
      queueMicrotask(() => {
        ws.onerror?.(
          new ErrorEvent('error', {
            error: new Error('Connection failed'),
          }),
        );
        ws.onclose?.();
      });
      return ws;
    });

    const connectAttempt = async () => {
      try {
        await transport.connect();
      } catch (err) {
        // Expected error after max retries, return it for assertion
        return err;
      }
    };

    const connectPromise = connectAttempt();
    await vi.advanceTimersByTimeAsync(20); // Wait for retry delay

    const error = await connectPromise;
    expect(error).toBeDefined();
    expect(error).toMatchObject({
      code: TransportErrorCode.CONNECTION_FAILED,
      message: expect.stringContaining('Max reconnection attempts reached'),
    });
    expect(transport.isConnected).toBe(false);
    expect(MockWebSocket).toHaveBeenCalledTimes(2);
  }, 1000); // Set explicit test timeout
});
