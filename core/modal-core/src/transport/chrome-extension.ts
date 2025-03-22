import { BaseTransport } from './base.js';
import { TransportErrorCode, TransportError } from './errors.js';
import { TransportState } from './types.js';
import type { Message } from './types.js';

export interface ChromeExtensionTransportOptions {
  extensionId?: string;
  timeout?: number;
  connectionInfo?: chrome.runtime.ConnectInfo;
}

type PortEventHandlers = {
  messageHandler: (message: Message) => void;
  disconnectHandler: () => void;
};

const DEFAULT_OPTIONS: Required<Omit<ChromeExtensionTransportOptions, 'extensionId'>> & {
  extensionId: string | undefined;
} = {
  extensionId: undefined,
  timeout: 30000,
  connectionInfo: {},
};

export class ChromeExtensionTransport extends BaseTransport {
  private port: chrome.runtime.Port | null = null;
  private readonly portHandlers = new WeakMap<chrome.runtime.Port, PortEventHandlers>();
  private readonly options: typeof DEFAULT_OPTIONS;
  private readonly pendingMessages = new Map<
    string,
    {
      resolve: (value: Message) => void;
      reject: (error: Error) => void;
      timeoutId: number;
    }
  >();
  private messageQueue: Message[] = [];

  constructor(options: ChromeExtensionTransportOptions = {}) {
    super();
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
      connectionInfo: {
        ...DEFAULT_OPTIONS.connectionInfo,
        ...options.connectionInfo,
      },
    };
  }

  protected async connectImpl(): Promise<void> {
    if (this.port) {
      return;
    }

    try {
      this.port = this.options.extensionId
        ? chrome.runtime.connect(this.options.extensionId, this.options.connectionInfo)
        : chrome.runtime.connect(this.options.connectionInfo);

      this.setupPortListeners();
      this.state = TransportState.CONNECTED;
      console.log('Transport connected');
    } catch (error) {
      this.port = null;
      this.state = TransportState.DISCONNECTED;
      console.error('Connection failed', error);
      throw this.createError('Connection failed', TransportErrorCode.CONNECTION_FAILED, error);
    }
  }

  protected async doDisconnect(): Promise<void> {
    const port = this.port;
    if (port) {
      this.port = null;
      this.removePortListeners(port);
      try {
        port.disconnect();
      } catch {
        // Ignore disconnect errors
      }
    }

    this.state = TransportState.DISCONNECTED;
    this.clearPendingMessages(this.createError('Connection lost', TransportErrorCode.CONNECTION_FAILED));

    console.log('Transport disconnected');
  }

  protected async sendImpl<T = unknown, R = unknown>(message: Message<T>): Promise<Message<R>> {
    return new Promise<Message<R>>((resolve, reject) => {
      const currentPort = this.port;
      if (!currentPort || !this.isConnected()) {
        reject(this.createError('Transport not connected', TransportErrorCode.CONNECTION_FAILED));
        return;
      }

      let isHandled = false;

      const pending = {
        resolve: (value: Message) => {
          if (!isHandled) {
            isHandled = true;
            window.clearTimeout(timeoutId);
            this.pendingMessages.delete(message.id);
            resolve(value as Message<R>);
          }
        },
        reject: (error: Error) => {
          if (!isHandled) {
            isHandled = true;
            window.clearTimeout(timeoutId);
            this.pendingMessages.delete(message.id);
            reject(error);
          }
        },
        timeoutId: 0,
      };

      const timeoutId = window.setTimeout(() => {
        if (!isHandled) {
          pending.reject(new TransportError('Failed to send message', TransportErrorCode.TIMEOUT));
        }
      }, this.options.timeout);

      pending.timeoutId = timeoutId;
      this.pendingMessages.set(message.id, pending);

      try {
        currentPort.postMessage(message);
        console.log('Message sent', message);
      } catch (error) {
        pending.reject(
          this.createError('Failed to send message', TransportErrorCode.CONNECTION_FAILED, error),
        );
        console.error('Failed to send message', error);
      }
    });
  }

  public override isConnected(): boolean {
    return this.port !== null && this.state === TransportState.CONNECTED;
  }

  private setupPortListeners(): void {
    if (!this.port) {
      return;
    }

    const port = this.port;
    const handlers: PortEventHandlers = {
      messageHandler: this.handlePortMessage.bind(this),
      disconnectHandler: this.handlePortDisconnect.bind(this),
    };

    port.onMessage.addListener(handlers.messageHandler);
    port.onDisconnect.addListener(handlers.disconnectHandler);
    this.portHandlers.set(port, handlers);
  }

  private removePortListeners(port: chrome.runtime.Port): void {
    const handlers = this.portHandlers.get(port);
    if (handlers) {
      try {
        port.onMessage.removeListener(handlers.messageHandler);
      } catch {
        // Ignore listener removal errors
      }
      try {
        port.onDisconnect.removeListener(handlers.disconnectHandler);
      } catch {
        // Ignore listener removal errors
      }
      this.portHandlers.delete(port);
    }
  }

  private handlePortMessage(message: Message): void {
    if (!message || !message.id) {
      return;
    }

    this.messageQueue.push(message);
    this.processMessageQueue();
    console.log('Message received', message);
  }

  private processMessageQueue(): void {
    if (this.messageQueue.length === 0) {
      return;
    }

    const message = this.messageQueue.shift();
    if (!message) {
      return;
    }

    const pending = this.pendingMessages.get(message.id);
    if (pending) {
      pending.resolve(message);
    }

    for (const handler of Array.from(this.handlers)) {
      if (handler.onMessage) {
        handler.onMessage(message);
      }
    }

    this.processMessageQueue();
  }

  private handlePortDisconnect(): void {
    if (this.port) {
      this.removePortListeners(this.port);
      this.port = null;
    }

    this.state = TransportState.DISCONNECTED;
    this.clearPendingMessages(this.createError('Connection lost', TransportErrorCode.CONNECTION_FAILED));

    console.log('Transport disconnected');
  }

  private clearPendingMessages(error?: Error): void {
    for (const [, { reject, timeoutId }] of this.pendingMessages) {
      window.clearTimeout(timeoutId);
      if (error) {
        reject(error);
      }
    }
    this.pendingMessages.clear();
  }
}
