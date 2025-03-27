import { BaseTransport } from './base.js';
import { createTransportError } from './errors.js';
import { MessageType } from './types.js';
import type { Message } from './types.js';

export interface WindowTransportConfig {
  target: Window;
  origin: string;
  timeout?: number;
}

interface PendingMessage<R> {
  resolve: (value: Message<R>) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

interface ErrorPayload {
  message: string;
  [key: string]: unknown;
}

/**
 * Window transport implementation for cross-window messaging
 */
export class WindowTransport extends BaseTransport {
  private readonly target: Window;
  private readonly origin: string;
  private readonly timeout: number;
  private pendingMessages: Map<string, PendingMessage<unknown>> = new Map();
  private messageHandler: ((event: MessageEvent) => void) | undefined;

  constructor(config: WindowTransportConfig) {
    super();
    this.target = config.target;
    this.origin = config.origin;
    this.timeout = config.timeout ?? 5000;
  }

  protected async connectImpl(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(createTransportError.connectionFailed('Connection timeout'));
      }, this.timeout);

      try {
        // Create message handler
        this.messageHandler = this.createMessageHandler();
        window.addEventListener('message', this.messageHandler);

        // Send ping message
        const pingMessage: Message = {
          id: 'ping',
          type: MessageType.REQUEST,
          payload: { method: 'ping' },
          timestamp: Date.now(),
        };

        this.target.postMessage(pingMessage, this.origin);
        resolve();
        clearTimeout(timer);
      } catch (error) {
        clearTimeout(timer);
        if (this.messageHandler) {
          window.removeEventListener('message', this.messageHandler);
          this.messageHandler = undefined;
        }
        reject(error);
      }
    });
  }

  protected async disconnectImpl(): Promise<void> {
    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler);
      this.messageHandler = undefined;
    }

    // Clean up pending messages
    for (const { reject, timer } of this.pendingMessages.values()) {
      clearTimeout(timer);
      reject(createTransportError.connectionFailed('Transport disconnected'));
    }
    this.pendingMessages.clear();
  }

  protected async sendImpl<T, R>(message: Message<T>): Promise<Message<R>> {
    if (!this.messageHandler) {
      throw createTransportError.notConnected('Transport not connected');
    }

    return new Promise<Message<R>>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingMessages.delete(message.id);
        reject(createTransportError.timeout('Message timeout'));
      }, this.timeout);

      this.pendingMessages.set(message.id, {
        resolve: (value: Message<unknown>) => resolve(value as Message<R>),
        reject,
        timer,
      });

      try {
        this.target.postMessage(message, this.origin);
      } catch (error) {
        clearTimeout(timer);
        this.pendingMessages.delete(message.id);
        reject(createTransportError.sendFailed('Failed to send message', { cause: error }));
      }
    });
  }

  private createMessageHandler(): (event: MessageEvent) => void {
    return (event: MessageEvent): void => {
      // Validate origin
      if (event.origin !== this.origin) {
        return;
      }

      // Validate message format
      const message = event.data as Message;
      if (!this.validateMessage(message)) {
        this.emitError(createTransportError.error('Invalid message format'));
        return;
      }

      // Handle pending messages
      const pending = this.pendingMessages.get(message.id);
      if (pending) {
        clearTimeout(pending.timer);
        this.pendingMessages.delete(message.id);
        if (message.type === MessageType.ERROR) {
          const payload = message.payload as ErrorPayload;
          const error = createTransportError.error(payload.message ?? 'Unknown error', { cause: payload });
          this.emitError(error);
          pending.reject(error);
        } else {
          pending.resolve(message);
        }
      }
    };
  }

  private validateMessage(message: unknown): message is Message {
    return (
      typeof message === 'object' &&
      message !== null &&
      typeof (message as Message).id === 'string' &&
      typeof (message as Message).type === 'string' &&
      typeof (message as Message).timestamp === 'number' &&
      (message as Message).payload !== undefined
    );
  }
}
