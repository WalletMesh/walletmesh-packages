import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BaseTransport } from './base.js';
import { ConnectionState, MessageType } from './types.js';
import { createTransportError } from './errors.js';
import type { Message } from './types.js';

class TestTransport extends BaseTransport {
  protected errorToThrow?: Error;
  protected messages: Message[] = [];

  constructor() {
    super();
    this.messages = [];
  }

  public setError(error: Error): void {
    this.errorToThrow = error;
  }

  public getMessages(): Message[] {
    return this.messages;
  }

  // Expose protected methods for testing
  public async testConnect(): Promise<void> {
    return this.connectImpl();
  }

  public async testDisconnect(): Promise<void> {
    return this.disconnectImpl();
  }

  protected async connectImpl(): Promise<void> {
    if (this.errorToThrow) {
      throw this.errorToThrow;
    }
  }

  protected async disconnectImpl(): Promise<void> {
    if (this.errorToThrow) {
      throw this.errorToThrow;
    }
  }

  protected async sendImpl<T, R>(_message: Message<T>): Promise<Message<R>> {
    if (this.errorToThrow) {
      throw this.errorToThrow;
    }

    return {
      id: 'test',
      type: MessageType.RESPONSE,
      payload: {} as R,
      timestamp: Date.now(),
    };
  }
}

describe('BaseTransport', () => {
  let transport: TestTransport;
  let message: Message;
  let errorHandler: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    transport = new TestTransport();
    message = {
      id: 'test',
      type: MessageType.REQUEST,
      payload: { test: true },
      timestamp: Date.now(),
    };
    errorHandler = vi.fn();
  });

  describe('Connection state', () => {
    it('initializes in disconnected state', () => {
      expect(transport.getState()).toBe(ConnectionState.DISCONNECTED);
      expect(transport.isConnected()).toBe(false);
    });

    it('connects successfully', async () => {
      await transport.connect();
      expect(transport.getState()).toBe(ConnectionState.CONNECTED);
      expect(transport.isConnected()).toBe(true);
    });

    it('handles connection errors', async () => {
      const error = new Error('Connection failed');
      transport.setError(error);

      await expect(transport.connect()).rejects.toThrow(
        createTransportError.connectionFailed('Failed to connect transport', { cause: error }),
      );
      expect(transport.getState()).toBe(ConnectionState.ERROR);
      expect(transport.isConnected()).toBe(false);
    });

    it('skips connect when already connected', async () => {
      await transport.connect();
      const spy = vi.spyOn(transport, 'testConnect');
      await transport.connect();
      expect(spy).not.toHaveBeenCalled();
    });

    it('disconnects successfully', async () => {
      await transport.connect();
      await transport.disconnect();
      expect(transport.getState()).toBe(ConnectionState.DISCONNECTED);
      expect(transport.isConnected()).toBe(false);
    });

    it('handles disconnect errors', async () => {
      await transport.connect();
      const error = new Error('Disconnect failed');
      transport.setError(error);

      await expect(transport.disconnect()).rejects.toThrow(
        createTransportError.error('Failed to disconnect transport', { cause: error }),
      );
      expect(transport.getState()).toBe(ConnectionState.ERROR);
    });

    it('skips disconnect when not connected', async () => {
      const spy = vi.spyOn(transport, 'testDisconnect');
      await transport.disconnect();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('Message handling', () => {
    it('sends messages when connected', async () => {
      await transport.connect();
      await expect(transport.send(message)).resolves.toBeDefined();
    });

    it('rejects messages when not connected', async () => {
      await expect(transport.send(message)).rejects.toThrow(
        createTransportError.notConnected('Not connected to transport'),
      );
    });

    it('handles send errors', async () => {
      await transport.connect();
      const error = new Error('Send failed');
      transport.setError(error);

      await expect(transport.send(message)).rejects.toThrow(
        createTransportError.sendFailed('Failed to send message', { cause: error }),
      );
    });
  });

  describe('Error handling', () => {
    it('manages error handlers', () => {
      transport.addErrorHandler(errorHandler);
      transport['emitError'](new Error('Test error'));
      expect(errorHandler).toHaveBeenCalled();

      transport.removeErrorHandler(errorHandler);
      transport['emitError'](new Error('Another error'));
      expect(errorHandler).toHaveBeenCalledTimes(1);
    });
  });
});
