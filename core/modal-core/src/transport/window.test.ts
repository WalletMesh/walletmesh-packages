import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WindowTransport } from './window.js';
import { ConnectionState, MessageType } from './types.js';
import { createTransportError } from './errors.js';
import type { Message } from './types.js';
import type { Mock } from 'vitest';

interface MockWindow {
  postMessage: Mock;
  addEventListener: Mock;
  removeEventListener: Mock;
}

/**
 * Test implementation of WindowTransport
 */
class TestWindowTransport extends WindowTransport {
  private mockWindow: MockWindow;
  private mockMessages: Message[] = [];
  private mockErrors: Error[] = [];
  private testMessageCallback?: (event: MessageEvent) => void;

  constructor() {
    const mockWindow = {
      postMessage: vi.fn(),
      addEventListener: vi.fn((event: string, handler: (event: MessageEvent) => void) => {
        if (event === 'message') {
          this.testMessageCallback = handler;
        }
      }),
      removeEventListener: vi.fn(),
    };

    super({
      target: mockWindow as unknown as Window,
      origin: 'http://test.com',
      timeout: 100,
    });

    this.mockWindow = mockWindow;
  }

  public getMockWindow(): MockWindow {
    return this.mockWindow;
  }

  public getMockMessages(): Message[] {
    return this.mockMessages;
  }

  public getMockErrors(): Error[] {
    return this.mockErrors;
  }

  public simulateMessage(message: Message, origin = 'http://test.com'): void {
    const event = new MessageEvent('message', {
      data: message,
      origin,
    });

    if (this.testMessageCallback) {
      this.testMessageCallback(event);
    }
  }
}

describe('WindowTransport', () => {
  let transport: TestWindowTransport;

  beforeEach(() => {
    transport = new TestWindowTransport();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('connection', () => {
    it('should connect successfully', async () => {
      const connectPromise = transport.connect();

      // Simulate successful ping response
      transport.simulateMessage({
        id: 'ping',
        type: MessageType.RESPONSE,
        payload: { success: true },
        timestamp: Date.now(),
      });

      await connectPromise;
      expect(transport.getState()).toBe(ConnectionState.CONNECTED);
    });

    it('should handle connection timeout', async () => {
      const promise = transport.connect();
      await expect(promise).rejects.toThrow(createTransportError.connectionFailed('Connection timeout'));
    });

    it('should handle invalid origin', async () => {
      const connectPromise = transport.connect();

      // Simulate message from wrong origin
      transport.simulateMessage(
        {
          id: 'ping',
          type: MessageType.RESPONSE,
          payload: { success: true },
          timestamp: Date.now(),
        },
        'http://wrong-origin.com',
      );

      await expect(connectPromise).rejects.toThrow();
    });
  });

  describe('messaging', () => {
    beforeEach(async () => {
      const connectPromise = transport.connect();
      transport.simulateMessage({
        id: 'ping',
        type: MessageType.RESPONSE,
        payload: { success: true },
        timestamp: Date.now(),
      });
      await connectPromise;
    });

    it('should send and receive messages', async () => {
      const requestMessage: Message = {
        id: 'test',
        type: MessageType.REQUEST,
        payload: { method: 'test', params: [] },
        timestamp: Date.now(),
      };

      const sendPromise = transport.send(requestMessage);

      transport.simulateMessage({
        id: 'test',
        type: MessageType.RESPONSE,
        payload: { result: 'success' },
        timestamp: Date.now(),
      });

      const response = await sendPromise;
      expect(response.payload).toEqual({ result: 'success' });
    });

    it('should handle message timeouts', async () => {
      const message: Message = {
        id: 'test',
        type: MessageType.REQUEST,
        payload: { method: 'test', params: [] },
        timestamp: Date.now(),
      };

      const promise = transport.send(message);
      await expect(promise).rejects.toThrow(createTransportError.timeout('Message timeout'));
    });

    it('should handle error messages', async () => {
      const message: Message = {
        id: 'test',
        type: MessageType.REQUEST,
        payload: { method: 'test', params: [] },
        timestamp: Date.now(),
      };

      const sendPromise = transport.send(message);

      transport.simulateMessage({
        id: 'test',
        type: MessageType.ERROR,
        payload: { message: 'Test error' },
        timestamp: Date.now(),
      });

      await expect(sendPromise).rejects.toThrow('Test error');
    });
  });

  describe('disconnection', () => {
    it('should cleanup on disconnect', async () => {
      const mockWindow = transport.getMockWindow();

      await transport.connect();
      await transport.disconnect();

      expect(mockWindow.removeEventListener).toHaveBeenCalledWith('message', expect.any(Function));
    });

    it('should reject pending messages on disconnect', async () => {
      await transport.connect();

      const message: Message = {
        id: 'test',
        type: MessageType.REQUEST,
        payload: { method: 'test', params: [] },
        timestamp: Date.now(),
      };

      const sendPromise = transport.send(message);
      await transport.disconnect();

      await expect(sendPromise).rejects.toThrow(
        createTransportError.connectionFailed('Transport disconnected'),
      );
    });
  });
});
