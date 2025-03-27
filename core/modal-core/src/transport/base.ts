import { ConnectionState, type Message } from './types.js';
import { createTransportError } from './errors.js';
import type { ErrorHandler, Transport } from './types.js';

/**
 * Abstract base class for implementing transports
 */
export abstract class BaseTransport implements Transport {
  protected state = ConnectionState.DISCONNECTED;
  protected errorHandlers: Set<ErrorHandler> = new Set();

  /**
   * Connect to the transport
   */
  public async connect(): Promise<void> {
    if (this.isConnected()) {
      return;
    }

    try {
      this.setState(ConnectionState.CONNECTING);
      await this.connectImpl();
      this.setState(ConnectionState.CONNECTED);
    } catch (error) {
      this.setState(ConnectionState.ERROR);
      throw createTransportError.connectionFailed('Failed to connect transport', { cause: error });
    }
  }

  /**
   * Disconnect from the transport
   */
  public async disconnect(): Promise<void> {
    if (!this.isConnected()) {
      return;
    }

    try {
      await this.disconnectImpl();
      this.setState(ConnectionState.DISCONNECTED);
    } catch (error) {
      this.setState(ConnectionState.ERROR);
      throw createTransportError.error('Failed to disconnect transport', { cause: error });
    }
  }

  /**
   * Send a message via the transport
   */
  public async send<T = unknown, R = unknown>(message: Message<T>): Promise<Message<R>> {
    if (!this.isConnected()) {
      throw createTransportError.notConnected('Not connected to transport');
    }

    try {
      return await this.sendImpl<T, R>(message);
    } catch (error) {
      throw createTransportError.sendFailed('Failed to send message', { cause: error });
    }
  }

  /**
   * Check if connected to transport
   */
  public isConnected(): boolean {
    return this.state === ConnectionState.CONNECTED;
  }

  /**
   * Get current connection state
   */
  public getState(): ConnectionState {
    return this.state;
  }

  /**
   * Add error handler
   */
  public addErrorHandler(handler: ErrorHandler): void {
    this.errorHandlers.add(handler);
  }

  /**
   * Remove error handler
   */
  public removeErrorHandler(handler: ErrorHandler): void {
    this.errorHandlers.delete(handler);
  }

  /**
   * Connect implementation
   */
  protected abstract connectImpl(): Promise<void>;

  /**
   * Disconnect implementation
   */
  protected abstract disconnectImpl(): Promise<void>;

  /**
   * Send implementation
   */
  protected abstract sendImpl<T, R>(message: Message<T>): Promise<Message<R>>;

  /**
   * Update connection state
   */
  protected setState(state: ConnectionState): void {
    this.state = state;
  }

  /**
   * Emit error to handlers
   */
  protected emitError(error: Error): void {
    for (const handler of this.errorHandlers) {
      handler(error);
    }
  }
}
