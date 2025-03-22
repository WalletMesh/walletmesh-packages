import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseTransport } from './base.js';
import { TransportState, MessageType, type Message } from './types.js';
import { TransportError, TransportErrorCode } from './errors.js';

class TestTransport extends BaseTransport {
  private connected = false;
  public mockConnect = vi.fn().mockResolvedValue(undefined);
  public mockSend = vi.fn().mockImplementation(
    async <T, R>(_message: Message<T>): Promise<Message<R>> => ({
      id: '1',
      type: MessageType.RESPONSE,
      payload: {} as R,
      timestamp: Date.now(),
    }),
  );
  public mockDisconnect = vi.fn().mockResolvedValue(undefined);

  public override async connect(): Promise<void> {
    try {
      this.state = TransportState.CONNECTING;
      await this.connectImpl();
      this.state = TransportState.CONNECTED;
      this.connected = true;
    } catch (error) {
      const transportError = this.createError(
        'Connection failed',
        TransportErrorCode.CONNECTION_FAILED,
        error,
      );
      this.state = TransportState.ERROR;
      this.notifyError(transportError);
      throw transportError;
    }
  }

  public override async disconnect(): Promise<void> {
    await super.disconnect();
    this.connected = false;
  }

  public override isConnected(): boolean {
    return this.connected;
  }

  protected async connectImpl(): Promise<void> {
    return this.mockConnect();
  }

  protected async sendImpl<T, R>(message: Message<T>): Promise<Message<R>> {
    return this.mockSend(message);
  }

  protected async doDisconnect(): Promise<void> {
    return this.mockDisconnect();
  }

  protected override createError(message: string, code: TransportErrorCode, cause?: unknown): TransportError {
    const error = new TransportError(message, code);
    if (cause instanceof Error) {
      error.cause = cause;
    }
    return error;
  }
}

describe('BaseTransport', () => {
  let transport: TestTransport;

  beforeEach(() => {
    transport = new TestTransport();
  });

  describe('connection management', () => {
    it('should handle successful connection', async () => {
      await transport.connect();
      expect(transport.getState()).toBe(TransportState.CONNECTED);
      expect(transport.isConnected()).toBe(true);
    });

    it('should handle connection failures', async () => {
      const error = new Error('Connection failed');
      transport.mockConnect.mockRejectedValueOnce(error);

      const rejection = await getError<TransportError>(() => transport.connect());
      expect(rejection.code).toBe(TransportErrorCode.CONNECTION_FAILED);
      expect(rejection.cause).toBe(error);
      expect(transport.getState()).toBe(TransportState.ERROR);
    });

    it('should handle disconnection', async () => {
      await transport.connect();
      await transport.disconnect();
      expect(transport.getState()).toBe(TransportState.DISCONNECTED);
      expect(transport.isConnected()).toBe(false);
    });

    it('should handle state transitions', async () => {
      expect(transport.getState()).toBe(TransportState.DISCONNECTED);

      const connectPromise = transport.connect();
      expect(transport.getState()).toBe(TransportState.CONNECTING);

      await connectPromise;
      expect(transport.getState()).toBe(TransportState.CONNECTED);

      await transport.disconnect();
      expect(transport.getState()).toBe(TransportState.DISCONNECTED);
    });

    it('should handle error state transition', async () => {
      const error = new Error('Connection failed');
      transport.mockConnect.mockRejectedValueOnce(error);

      const rejection = await getError<TransportError>(() => transport.connect());
      expect(rejection.code).toBe(TransportErrorCode.CONNECTION_FAILED);
      expect(rejection.cause).toBe(error);
      expect(transport.getState()).toBe(TransportState.ERROR);
    });
  });

  describe('error handling', () => {
    it('should handle multiple error handlers', async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      transport.addErrorHandler(handler1);
      transport.addErrorHandler(handler2);

      const error = new Error('Test error');
      transport.mockConnect.mockRejectedValueOnce(error);

      await expect(transport.connect()).rejects.toThrow(TransportError);

      expect(handler1).toHaveBeenCalledWith(expect.any(TransportError));
      expect(handler2).toHaveBeenCalledWith(expect.any(TransportError));
    });

    it('should allow removing error handlers', async () => {
      const handler = vi.fn();

      transport.addErrorHandler(handler);
      transport.removeErrorHandler(handler);

      const error = new Error('Test error');
      transport.mockConnect.mockRejectedValueOnce(error);

      await expect(transport.connect()).rejects.toThrow(TransportError);
      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle send errors', async () => {
      const handler = vi.fn();
      transport.addErrorHandler(handler);

      const error = new Error('Send error');
      await transport.connect();

      transport.mockSend.mockRejectedValueOnce(error);

      await expect(
        transport.send({
          id: '1',
          type: MessageType.REQUEST,
          payload: {},
          timestamp: Date.now(),
        }),
      ).rejects.toThrow(TransportError);

      expect(handler).toHaveBeenCalledWith(expect.any(TransportError));
    });

    it('should clear error handlers after disconnect', async () => {
      const handler = vi.fn();

      await transport.connect();
      transport.addErrorHandler(handler);
      await transport.disconnect();

      // Should receive disconnect notification
      expect(handler).toHaveBeenCalledWith(expect.any(TransportError));
      handler.mockClear();

      const error = new Error('Test error');
      transport.mockConnect.mockRejectedValueOnce(error);

      await expect(transport.connect()).rejects.toThrow(TransportError);
      expect(handler).not.toHaveBeenCalled(); // Should not be called after disconnect
    });
  });
});

async function getError<T extends Error>(fn: () => Promise<unknown>): Promise<T> {
  try {
    await fn();
    throw new Error('Expected function to throw');
  } catch (error) {
    if (!(error instanceof Error)) {
      throw new Error('Expected error to be an Error instance');
    }
    return error as T;
  }
}
