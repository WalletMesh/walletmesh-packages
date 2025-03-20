import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WindowTransport } from './window.js';
import { TransportState, MessageType, type Message } from './types.js';
import { TransportErrorCode } from './errors.js';
import type { TransportError } from './errors.js';

describe('WindowTransport', () => {
  const mockUrl = 'https://test.com';
  let transport: WindowTransport;
  let mockFrame: HTMLIFrameElement;
  let mockWindow: Window;
  let messageHandlers: Array<(ev: MessageEvent) => void>;

  // Helper to create a valid message for testing
  const createTestMessage = (override: Partial<Message> = {}): Message => ({
    id: '1',
    type: MessageType.REQUEST,
    payload: { test: true },
    timestamp: Date.now(),
    ...override
  });

  const setupMocks = () => {
    messageHandlers = [];

    mockFrame = {
      remove: vi.fn(),
      contentWindow: {
        postMessage: vi.fn()
      } as unknown as Window,
      style: {
        display: 'none'
      } as CSSStyleDeclaration,
      src: '',
      onload: null
    } as unknown as HTMLIFrameElement;

    mockWindow = {
      addEventListener: vi.fn((event, handler) => {
        if (event === 'message') {
          messageHandlers.push(handler as (ev: MessageEvent) => void);
        }
      }),
      removeEventListener: vi.fn(),
      location: { origin: 'http://localhost' }
    } as unknown as Window;

    const documentSpy = {
      createElement: vi.fn(() => mockFrame),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn()
      }
    };

    vi.stubGlobal('window', mockWindow);
    vi.stubGlobal('document', documentSpy);
  };

  async function simulateIframeLoad() {
    if (mockFrame.onload) {
      mockFrame.onload(new Event('load'));
      await vi.advanceTimersByTimeAsync(0);
    }
  }

  async function simulateHandshake() {
    const handshakeEvent = new MessageEvent('message', {
      data: { type: 'handshake' },
      source: mockFrame.contentWindow,
      origin: mockUrl
    });

    for (const handler of messageHandlers) {
      handler(handshakeEvent);
    }
    await vi.advanceTimersByTimeAsync(0);
  }

  async function connectTransport() {
    const connectPromise = transport.connect();
    await vi.advanceTimersByTimeAsync(0);
    await simulateIframeLoad();
    await simulateHandshake();
    return connectPromise;
  }

  beforeEach(() => {
    vi.useFakeTimers();
    setupMocks();
    transport = new WindowTransport({ 
      url: mockUrl,
      timeout: 1000
    });
  });

  afterEach(() => {
    transport.disconnect();
    messageHandlers = [];
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.resetAllMocks();
    vi.unstubAllGlobals();
  });

  describe('connection', () => {
    it('initializes in disconnected state', () => {
      expect(transport.getState()).toBe(TransportState.DISCONNECTED);
      expect(transport.isConnected()).toBe(false);
    });

    it('connects successfully', async () => {
      await connectTransport();
      expect(transport.getState()).toBe(TransportState.CONNECTED);
      expect(transport.isConnected()).toBe(true);
    });

    it('handles connection failure', async () => {
      const error = new Error('Connection failed');
      const errorHandler = vi.fn();
      transport.addErrorHandler(errorHandler);

      const spyCreate = vi.spyOn(document, 'createElement').mockImplementationOnce(() => {
        throw error;
      });

      const rejection = await getError<TransportError>(() => transport.connect());
      await vi.advanceTimersByTimeAsync(0);

      expect(spyCreate).toHaveBeenCalled();
      expect(rejection.code).toBe(TransportErrorCode.CONNECTION_FAILED);
      expect(rejection.name).toBe('TransportError');
      expect((rejection as unknown as { cause: Error }).cause).toBe(error);
      expect(transport.getState()).toBe(TransportState.ERROR);
      expect(errorHandler).toHaveBeenCalledWith(rejection);
    });

    it('disconnects properly', async () => {
      const errorHandler = vi.fn();
      transport.addErrorHandler(errorHandler);
      await connectTransport();
      
      transport.disconnect();
      await vi.advanceTimersByTimeAsync(0);
      
      expect(mockFrame.remove).toHaveBeenCalled();
      expect(transport.getState()).toBe(TransportState.DISCONNECTED);
      expect(errorHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          code: TransportErrorCode.CONNECTION_FAILED,
          name: 'TransportError'
        })
      );

      // Verify handlers are cleared
      errorHandler.mockClear();
      const message = createTestMessage();
      await getError<TransportError>(() => transport.send(message));
      await vi.advanceTimersByTimeAsync(0);
      expect(errorHandler).not.toHaveBeenCalled();
    });
  });

  describe('messaging', () => {
    beforeEach(async () => {
      await connectTransport();
    });

    it('sends and receives messages', async () => {
      const message = createTestMessage();
      const sendPromise = transport.send(message);
      await vi.advanceTimersByTimeAsync(0);
      
      expect(mockFrame.contentWindow?.postMessage).toHaveBeenCalledWith(message, '*');

      const responseEvent = new MessageEvent('message', {
        data: {
          id: message.id,
          type: MessageType.RESPONSE,
          payload: { success: true }
        },
        source: mockFrame.contentWindow,
        origin: mockUrl
      });

      for (const handler of messageHandlers) {
        handler(responseEvent);
      }

      await vi.advanceTimersByTimeAsync(0);
      const response = await sendPromise;
      expect(response.id).toBe(message.id);
      expect(response.type).toBe(MessageType.RESPONSE);
    });

    it('validates messages synchronously', async () => {
      const invalidMessage = {} as Message;
      const errorHandler = vi.fn();
      transport.addErrorHandler(errorHandler);

      const error = await getError<TransportError>(() => transport.send(invalidMessage));
      await vi.advanceTimersByTimeAsync(0);

      expect(error).toEqual(
        expect.objectContaining({
          code: TransportErrorCode.INVALID_MESSAGE,
          name: 'TransportError'
        })
      );

      expect(errorHandler).toHaveBeenCalledWith(error);
    });

    it('validates connection state', async () => {
      const errorHandler = vi.fn();
      transport.addErrorHandler(errorHandler);

      transport.disconnect();
      await vi.advanceTimersByTimeAsync(0);
      errorHandler.mockClear(); // Clear disconnect notification

      const message = createTestMessage();
      const error = await getError<TransportError>(() => transport.send(message));
      await vi.advanceTimersByTimeAsync(0);

      // Handlers are cleared on disconnect
      expect(error.code).toBe(TransportErrorCode.CONNECTION_FAILED);
      expect(error.name).toBe('TransportError');
      expect(errorHandler).not.toHaveBeenCalled();
    });

    it('clears error handlers on disconnect', async () => {
      const errorHandler = vi.fn();
      transport.addErrorHandler(errorHandler);
      
      transport.disconnect();
      await vi.advanceTimersByTimeAsync(0);
      
      // Should receive disconnect notification
      expect(errorHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          code: TransportErrorCode.CONNECTION_FAILED,
          name: 'TransportError'
        })
      );

      errorHandler.mockClear();

      // Should not receive any more notifications after disconnect
      const message = createTestMessage();
      await getError<TransportError>(() => transport.send(message));
      await vi.advanceTimersByTimeAsync(0);
      
      expect(errorHandler).not.toHaveBeenCalled();
    });
  });

  describe('subscriptions', () => {
    beforeEach(async () => {
      await connectTransport();
    });

    it('handles subscriptions', async () => {
      const handler = vi.fn();
      const unsubscribe = transport.subscribe({ onMessage: handler });
      await vi.advanceTimersByTimeAsync(0);

      const message = createTestMessage();
      const messageEvent = new MessageEvent('message', {
        data: message,
        source: mockFrame.contentWindow,
        origin: mockUrl
      });

      for (const h of messageHandlers) {
        h(messageEvent);
      }
      await vi.advanceTimersByTimeAsync(0);
      expect(handler).toHaveBeenCalledWith(message);

      unsubscribe();
      await vi.advanceTimersByTimeAsync(0);

      for (const h of messageHandlers) {
        h(messageEvent);
      }
      await vi.advanceTimersByTimeAsync(0);
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });
});

async function getError<T extends Error>(fn: () => Promise<unknown>): Promise<T> {
  try {
    await fn();
    throw new Error('Expected function to throw');
  } catch (error) {
    return error as T;
  }
}
