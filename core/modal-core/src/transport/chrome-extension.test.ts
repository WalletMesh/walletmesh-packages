import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ChromeExtensionTransport } from './chrome-extension.js';
import { TransportError } from './errors.js';
import { MessageType, type Message } from './types.js';

describe('ChromeExtensionTransport', () => {
  // Mock chrome.runtime
  const mockPort = {
    name: 'test-port',
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    onDisconnect: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    postMessage: vi.fn(),
    disconnect: vi.fn(),
  };

  const mockConnect = vi.fn(() => mockPort);
  const mockRuntime = {
    connect: mockConnect,
    lastError: null,
  };

  beforeEach(() => {
    vi.stubGlobal('chrome', { runtime: mockRuntime });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe('connection', () => {
    it('should connect to extension', async () => {
      const transport = new ChromeExtensionTransport({
        extensionId: 'test-id',
        timeout: 1000,
        connectionInfo: { name: 'test-id' },
      });

      await transport.connect();
      expect(mockConnect).toHaveBeenCalledWith('test-id', { name: 'test-id' });
      expect(mockPort.onMessage.addListener).toHaveBeenCalled();
      expect(mockPort.onDisconnect.addListener).toHaveBeenCalled();
    });

    it('should handle connection failures', async () => {
      mockConnect.mockImplementationOnce(() => {
        throw new Error('Connection failed');
      });

      const transport = new ChromeExtensionTransport({ extensionId: 'test-id' });
      await expect(transport.connect()).rejects.toThrow(TransportError);
    });

    it('should handle chrome runtime errors', async () => {
      mockConnect.mockImplementationOnce(() => {
        throw new Error('Chrome runtime error');
      });

      const transport = new ChromeExtensionTransport({ extensionId: 'test-id' });
      await expect(transport.connect()).rejects.toThrow(TransportError);
    });
  });

  describe('message handling', () => {
    it('should send and receive messages', async () => {
      const transport = new ChromeExtensionTransport({ extensionId: 'test-id' });
      await transport.connect();

      const request: Message = {
        id: 'test-id',
        type: MessageType.REQUEST,
        payload: { test: true },
        timestamp: Date.now(),
      };

      mockPort.postMessage.mockImplementationOnce((msg: Message) => {
        // Simulate response by calling the message handler directly
        const calls = mockPort.onMessage.addListener.mock.calls;
        const messageHandler = calls[0]?.[0] as (message: Message) => void;

        if (!messageHandler) {
          throw new Error('Message handler not registered');
        }

        messageHandler({
          id: msg.id,
          type: MessageType.RESPONSE,
          payload: { result: true },
          timestamp: Date.now(),
        });
      });

      const response = await transport.send(request);
      expect(response.type).toBe(MessageType.RESPONSE);
      expect(response.payload).toEqual({ result: true });
    });

    it('should handle message timeouts', async () => {
      const transport = new ChromeExtensionTransport({
        extensionId: 'test-id',
        timeout: 100,
      });
      await transport.connect();

      const request: Message = {
        id: 'test-id',
        type: MessageType.REQUEST,
        payload: { test: true },
        timestamp: Date.now(),
      };

      await expect(transport.send(request)).rejects.toThrow(TransportError);
    });

    it('should handle send failures', async () => {
      const transport = new ChromeExtensionTransport({ extensionId: 'test-id' });
      await transport.connect();

      mockPort.postMessage.mockImplementationOnce(() => {
        throw new Error('Send error');
      });

      const request: Message = {
        id: 'test-id',
        type: MessageType.REQUEST,
        payload: { test: true },
        timestamp: Date.now(),
      };

      await expect(transport.send(request)).rejects.toThrow(TransportError);
    });
  });

  describe('cleanup', () => {
    it('should clean up on disconnect', async () => {
      const transport = new ChromeExtensionTransport({ extensionId: 'test-id' });
      await transport.connect();

      mockPort.disconnect.mockImplementationOnce(() => {
        throw new Error('Disconnect error');
      });

      transport.disconnect();
      expect(mockPort.onMessage.removeListener).toHaveBeenCalled();
      expect(mockPort.onDisconnect.removeListener).toHaveBeenCalled();
    });

    it('should handle cleanup errors gracefully', async () => {
      const transport = new ChromeExtensionTransport({ extensionId: 'test-id' });
      await transport.connect();

      mockPort.onMessage.removeListener.mockImplementationOnce(() => {
        throw new Error('Remove listener error');
      });
      mockPort.onDisconnect.removeListener.mockImplementationOnce(() => {
        throw new Error('Remove listener error');
      });

      transport.disconnect();
      // Should not throw despite cleanup errors
      expect(transport.isConnected()).toBe(false);
    });
  });
});
