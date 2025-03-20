import { TransportState } from './types.js';
import type { Message, Transport, Subscription } from './types.js';
import { TransportError, TransportErrorCode } from './errors.js';

/**
 * Base transport implementation with common functionality
 */
export abstract class BaseTransport implements Transport {
  protected handlers = new Set<Subscription>();
  protected state = TransportState.DISCONNECTED;

  public async connect(): Promise<void> {
    try {
      this.state = TransportState.CONNECTING;
      await this.connectImpl();
      this.state = TransportState.CONNECTED;
    } catch (error) {
      const transportError = this.createError('Connection failed', TransportErrorCode.CONNECTION_FAILED, error);
      this.state = TransportState.ERROR;
      this.notifyError(transportError);
      throw transportError;
    }
  }

  public async disconnect(): Promise<void> {
    const disconnectError = this.createError(
      'Transport disconnected',
      TransportErrorCode.CONNECTION_FAILED
    );

    // Store current handlers and clear
    const currentHandlers = Array.from(this.handlers);
    this.handlers.clear();

    // Perform disconnect
    try {
      await this.doDisconnect();
    } finally {
      this.state = TransportState.DISCONNECTED;

      // Notify handlers after cleanup
      for (const handler of currentHandlers) {
        if (handler.onError) {
          handler.onError(disconnectError);
        }
      }
    }
  }

  public abstract isConnected(): boolean;

  public getState(): TransportState {
    return this.state;
  }

  public async send<T = unknown, R = unknown>(message: Message<T>): Promise<Message<R>> {
    if (!message || !message.id || !message.type || typeof message.timestamp !== 'number') {
      const error = this.createError(
        'Invalid message format',
        TransportErrorCode.INVALID_MESSAGE
      );
      this.notifyError(error);
      throw error;
    }

    if (!this.isConnected()) {
      const error = this.createError(
        'Transport not connected',
        TransportErrorCode.CONNECTION_FAILED
      );
      this.notifyError(error);
      throw error;
    }

    try {
      return await this.sendImpl(message);
    } catch (error) {
      const transportError = this.createError(
        'Failed to send message',
        TransportErrorCode.CONNECTION_FAILED,
        error
      );
      this.notifyError(transportError);
      throw transportError;
    }
  }

  public subscribe(subscription: Subscription): () => void {
    this.handlers.add(subscription);
    return () => {
      this.handlers.delete(subscription);
    };
  }

  public addErrorHandler(handler: (error: Error) => void): void {
    this.handlers.add({ onError: handler });
  }

  public removeErrorHandler(handler: (error: Error) => void): void {
    for (const subscription of this.handlers) {
      if (subscription.onError === handler) {
        this.handlers.delete(subscription);
      }
    }
  }

  protected abstract connectImpl(): Promise<void>;
  protected abstract sendImpl<T, R>(message: Message<T>): Promise<Message<R>>;
  protected abstract doDisconnect(): Promise<void>;

  protected notifyError(error: Error): void {
    const handlers = Array.from(this.handlers);
    for (const handler of handlers) {
      if (handler.onError) {
        handler.onError(error);
      }
    }
  }

  protected createError(
    message: string,
    code: TransportErrorCode,
    cause?: unknown
  ): TransportError {
    const error = new TransportError(message, code);
    if (cause) {
      error.cause = cause instanceof Error ? cause : new Error(String(cause));
    }
    return error;
  }
}