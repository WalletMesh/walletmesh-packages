import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChromeExtensionTransport } from './chrome-extension.js';
import { ConnectionState, MessageType } from './types.js';
import { createTransportError } from './errors.js';
import type { Message } from './types.js';
import type { ErrorHandler } from './types.js';

type MockChrome = {
  runtime: {
    connect: ReturnType<typeof vi.fn>;
  };
};

/**
 * Test extension transport that exposes protected methods
 */
class TestChromeExtensionTransport extends ChromeExtensionTransport {
  private mockMessages: Message[] = [];
  private mockErrors: Error[] = [];

  constructor() {
    super({ extensionId: 'test-extension', timeout: 100 });
  }

  public getMessages(): Message[] {
    return this.mockMessages;
  }

  public getErrors(): Error[] {
    return this.mockErrors;
  }

  public async simulateMessage(message: Message): Promise<void> {
    // Access parent protected method via casting
    (this as unknown as { handlePortMessage: (message: Message) => void }).handlePortMessage(message);
  }

  public async simulateDisconnect(): Promise<void> {
    const mockPort = {
      name: 'test-port',
      disconnect: vi.fn(),
      onDisconnect: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
        hasListener: vi.fn(),
        hasListeners: vi.fn(),
        getRules: vi.fn(),
        removeRules: vi.fn(),
        addRules: vi.fn(),
      },
      onMessage: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
        hasListener: vi.fn(),
        hasListeners: vi.fn(),
        getRules: vi.fn(),
        removeRules: vi.fn(),
        addRules: vi.fn(),
      },
      postMessage: vi.fn(),
    } satisfies chrome.runtime.Port;

    // Access parent protected method via casting
    (this as unknown as { handleDisconnect: (port: chrome.runtime.Port) => void }).handleDisconnect(mockPort);
  }

  // Expose protected methods for spying
  public async testConnectImpl(): Promise<void> {
    return this.connectImpl();
  }

  protected override async connectImpl(): Promise<void> {
    // No-op for testing
  }

  protected override async disconnectImpl(): Promise<void> {
    // No-op for testing
  }

  protected override async sendImpl<T, R>(message: Message<T>): Promise<Message<R>> {
    return {
      id: message.id,
      type: MessageType.RESPONSE,
      payload: { success: true } as R,
      timestamp: Date.now(),
    };
  }
}

describe('ChromeExtensionTransport', () => {
  let transport: TestChromeExtensionTransport;
  let mockChromeRuntime: {
    connect: ReturnType<typeof vi.fn>;
  };
  let originalChrome: typeof globalThis.chrome;

  beforeEach(() => {
    transport = new TestChromeExtensionTransport();

    // Store original chrome object
    originalChrome = globalThis.chrome;

    // Create mock chrome runtime
    mockChromeRuntime = {
      connect: vi.fn().mockReturnValue({
        onMessage: {
          addListener: vi.fn(),
          removeListener: vi.fn(),
          hasListener: vi.fn(),
          hasListeners: vi.fn(),
          getRules: vi.fn(),
          removeRules: vi.fn(),
          addRules: vi.fn(),
        },
        onDisconnect: {
          addListener: vi.fn(),
          removeListener: vi.fn(),
          hasListener: vi.fn(),
          hasListeners: vi.fn(),
          getRules: vi.fn(),
          removeRules: vi.fn(),
          addRules: vi.fn(),
        },
        disconnect: vi.fn(),
        postMessage: vi.fn(),
      }),
    };

    // Set mock chrome
    (globalThis as unknown as { chrome: MockChrome }).chrome = {
      runtime: mockChromeRuntime,
    };
  });

  afterEach(() => {
    vi.resetAllMocks();
    // Restore original chrome object
    globalThis.chrome = originalChrome;
  });

  describe('connection', () => {
    it('connects successfully', async () => {
      await transport.connect();
      expect(transport.getState()).toBe(ConnectionState.CONNECTED);
    });

    it('handles connection failures', async () => {
      const error = new Error('Connection failed');
      vi.spyOn(transport, 'testConnectImpl').mockRejectedValueOnce(error);

      await expect(transport.connect()).rejects.toThrow(
        createTransportError.connectionFailed('Failed to connect transport', { cause: error }),
      );
      expect(transport.getState()).toBe(ConnectionState.ERROR);
    });

    it('handles chrome runtime errors', async () => {
      const error = new Error('Runtime error');
      mockChromeRuntime.connect.mockImplementationOnce(() => {
        throw error;
      });

      await expect(transport.connect()).rejects.toThrow(error);
    });
  });

  describe('messaging', () => {
    beforeEach(async () => {
      await transport.connect();
    });

    it('sends and receives messages', async () => {
      const message: Message = {
        id: 'test',
        type: MessageType.REQUEST,
        payload: { test: true },
        timestamp: Date.now(),
      };

      const responsePromise = transport.send(message);
      await transport.simulateMessage({
        id: 'test',
        type: MessageType.RESPONSE,
        payload: { success: true },
        timestamp: Date.now(),
      });

      await expect(responsePromise).resolves.toBeDefined();
    });

    it('handles message timeouts', async () => {
      const message: Message = {
        id: 'test',
        type: MessageType.REQUEST,
        payload: { test: true },
        timestamp: Date.now(),
      };

      const promise = transport.send(message);
      await expect(promise).rejects.toThrow(createTransportError.timeout('Message timeout'));
    });

    it('handles disconnect during message', async () => {
      const message: Message = {
        id: 'test',
        type: MessageType.REQUEST,
        payload: { test: true },
        timestamp: Date.now(),
      };

      const promise = transport.send(message);
      await transport.simulateDisconnect();

      await expect(promise).rejects.toThrow(createTransportError.connectionFailed('Port disconnected'));
    });
  });

  describe('subscriptions', () => {
    beforeEach(async () => {
      await transport.connect();
    });

    it('handles message subscriptions', async () => {
      const errors: Error[] = [];
      const handler: ErrorHandler = (error) => {
        errors.push(error);
      };

      transport.addErrorHandler(handler);
      await transport.simulateMessage({
        id: 'test',
        type: MessageType.ERROR,
        payload: { message: 'Test error' },
        timestamp: Date.now(),
      });

      expect(errors).toHaveLength(1);
      transport.removeErrorHandler(handler);
    });

    it('handles error subscriptions', async () => {
      const errors: Error[] = [];
      const handler: ErrorHandler = (error) => {
        errors.push(error);
      };

      transport.addErrorHandler(handler);
      await transport.simulateDisconnect();

      expect(errors).toHaveLength(1);
      transport.removeErrorHandler(handler);
    });
  });
});
