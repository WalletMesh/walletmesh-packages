import { BaseTransport } from './base.js';
import { createTransportError } from './errors.js';
import { ConnectionState, MessageType } from './types.js';
import type { Message } from './types.js';

export interface ChromeExtensionTransportConfig {
  extensionId: string;
  timeout?: number;
}

interface PendingMessage<R> {
  resolve: (value: Message<R>) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

/**
 * Chrome extension transport implementation
 */
export class ChromeExtensionTransport extends BaseTransport {
  private port: chrome.runtime.Port | null = null;
  private pendingMessages: Map<string, PendingMessage<unknown>> = new Map();
  private readonly extensionId: string;
  private readonly timeout: number;

  constructor(config: ChromeExtensionTransportConfig) {
    super();
    this.extensionId = config.extensionId;
    this.timeout = config.timeout ?? 5000;
  }

  protected async connectImpl(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(createTransportError.connectionFailed('Connection timeout'));
      }, this.timeout);

      try {
        this.port = chrome.runtime.connect(this.extensionId);
        this.port.onMessage.addListener(this.handlePortMessage);
        this.port.onDisconnect.addListener(this.handleDisconnect);
        resolve();
        clearTimeout(timer);
      } catch (error) {
        clearTimeout(timer);
        reject(error);
      }
    });
  }

  protected async disconnectImpl(): Promise<void> {
    const port = this.port;
    if (port) {
      port.onMessage.removeListener(this.handlePortMessage);
      port.onDisconnect.removeListener(this.handleDisconnect);
      port.disconnect();
      this.port = null;
    }
  }

  protected async sendImpl<T, R>(message: Message<T>): Promise<Message<R>> {
    const port = this.port;
    if (!port) {
      throw createTransportError.notConnected('Port not connected');
    }

    return new Promise<Message<R>>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingMessages.delete(message.id);
        reject(createTransportError.timeout('Message timeout'));
      }, this.timeout);

      this.pendingMessages.set(message.id, {
        resolve: resolve as (value: Message<unknown>) => void,
        reject,
        timer,
      });

      try {
        port.postMessage(message);
      } catch (error) {
        clearTimeout(timer);
        this.pendingMessages.delete(message.id);
        reject(createTransportError.sendFailed('Failed to send message', { cause: error }));
      }
    });
  }

  /**
   * Handle incoming port messages
   */
  private handlePortMessage = (message: Message): void => {
    if (message.type === MessageType.ERROR) {
      const errorMessage =
        typeof message.payload === 'object' && message.payload
          ? String((message.payload as { message?: string }).message ?? 'Unknown error')
          : 'Unknown error';
      this.emitError(createTransportError.error(errorMessage));
      return;
    }

    const pending = this.pendingMessages.get(message.id);
    if (pending) {
      clearTimeout(pending.timer);
      this.pendingMessages.delete(message.id);
      pending.resolve(message);
    }
  };

  /**
   * Handle port disconnection
   */
  private handleDisconnect = (): void => {
    const error = createTransportError.connectionFailed('Port disconnected');

    for (const [id, { reject, timer }] of this.pendingMessages) {
      clearTimeout(timer);
      this.pendingMessages.delete(id);
      reject(error);
    }

    this.emitError(error);
    this.setState(ConnectionState.ERROR);
  };
}
