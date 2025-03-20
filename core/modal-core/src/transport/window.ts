/**
 * @packageDocumentation
 * Window transport implementation
 */

import { TransportState } from './types.js';
import type { Transport, Message, Subscription } from './types.js';
import { TransportError, TransportErrorCode } from './errors.js';

interface MessageHandler {
  canHandle: (message: Message) => boolean;
  handle: (message: Message) => Promise<void>;
}

export interface WindowTransportOptions {
  url: string;
  timeout?: number;
  debug?: boolean;
  retries?: number;
  dimensions?: { width: number; height: number };
}

const DEFAULT_OPTIONS = {
  timeout: 30000,
  debug: false,
  retries: 3
};

/**
 * Window-based transport implementation
 */
export class WindowTransport implements Transport {
  private frame: HTMLIFrameElement | null = null;
  private connected = false;
  private messageHandlers: MessageHandler[] = [];
  private handlers = new Set<Subscription>();
  private state: TransportState = TransportState.DISCONNECTED;
  private readonly options: WindowTransportOptions;
  private readonly baseOptions: Required<Omit<WindowTransportOptions, 'url' | 'dimensions'>>;
  readonly #windowRef: Window | null;

  constructor(options: WindowTransportOptions) {
    this.options = options;
    this.#windowRef = typeof window !== 'undefined' ? window : null;
    this.baseOptions = {
      ...DEFAULT_OPTIONS,
      ...options
    };

    // Initialize message handling
    if (this.#windowRef) {
      this.#windowRef.addEventListener('message', this.onWindowMessage);
    }
  }

  public async connect(): Promise<void> {
    try {
      this.state = TransportState.CONNECTING;
      this.frame = await this.createFrame(this.options.url);
      await this.waitForWindowLoad();
      this.connected = true;
      this.state = TransportState.CONNECTED;
    } catch (error) {
      const transportError = createTransportError(
        'Connection failed', 
        TransportErrorCode.CONNECTION_FAILED,
        error
      );
      this.state = TransportState.ERROR;
      this.notifyError(transportError);
      throw transportError;
    }
  }

  public async disconnect(): Promise<void> {
    const disconnectError = createTransportError(
      'Transport disconnected',
      TransportErrorCode.CONNECTION_FAILED
    );
    
    // Set state first
    this.connected = false;
    this.state = TransportState.DISCONNECTED;

    // Clean up resources
    if (this.#windowRef) {
      this.#windowRef.removeEventListener('message', this.onWindowMessage);
    }
    if (this.frame) {
      this.frame.remove();
      this.frame = null;
    }

    // Store current handlers and clear
    const currentHandlers = Array.from(this.handlers);
    this.handlers.clear();
    this.messageHandlers = [];

    // Notify after clearing
    for (const handler of currentHandlers) {
      if (handler.onError) {
        handler.onError(disconnectError);
      }
    }
  }

  public async send<T = unknown, R = unknown>(message: Message<T>): Promise<Message<R>> {
    // Validate message format synchronously
    if (!message || !message.id || !message.type || typeof message.timestamp !== 'number') {
      const error = createTransportError(
        'Invalid message format',
        TransportErrorCode.INVALID_MESSAGE
      );
      this.notifyError(error);
      throw error;
    }

    if (!this.isConnected() || !this.frame?.contentWindow) {
      const error = createTransportError(
        'Transport not connected',
        TransportErrorCode.CONNECTION_FAILED
      );
      this.notifyError(error);
      throw error;
    }

    return new Promise<Message<R>>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        const error = createTransportError(
          'Message timeout',
          TransportErrorCode.TIMEOUT
        );
        this.notifyError(error);
        reject(error);
      }, this.baseOptions.timeout);

      const handler: MessageHandler = {
        canHandle: (response: Message) => response.id === message.id,
        handle: async (response: Message): Promise<void> => {
          clearTimeout(timeoutId);
          this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
          resolve(response as Message<R>);
        }
      };

      this.messageHandlers.push(handler);
      const win = this.frame?.contentWindow;
      if (win) {
        win.postMessage(message, '*');
      }
    });
  }

  public subscribe(subscription: Subscription): () => void {
    const handler: MessageHandler = {
      canHandle: () => true,
      handle: async (message: Message) => {
        try {
          if (subscription.onMessage) {
            await subscription.onMessage(message);
          }
        } catch (error) {
          if (subscription.onError) {
            subscription.onError(error instanceof Error ? error : new Error(String(error)));
          }
        }
      }
    };

    this.messageHandlers.push(handler);
    this.handlers.add(subscription);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
      this.handlers.delete(subscription);
    };
  }

  public isConnected(): boolean {
    return this.connected && !!this.frame?.contentWindow;
  }

  public getState(): TransportState {
    return this.state;
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

  private createFrame(url: string): Promise<HTMLIFrameElement> {
    return new Promise((resolve, reject) => {
      try {
        const frame = document.createElement('iframe');
        frame.style.display = 'none';
        if (this.options.dimensions) {
          frame.width = String(this.options.dimensions.width);
          frame.height = String(this.options.dimensions.height);
        }
        frame.src = url;
        frame.onload = () => resolve(frame);
        document.body.appendChild(frame);
      } catch (error) {
        reject(error);
      }
    });
  }

  protected async waitForWindowLoad(): Promise<void> {
    if (!this.frame) {
      throw createTransportError(
        'No window to wait for',
        TransportErrorCode.CONNECTION_FAILED
      );
    }

    return new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        const error = createTransportError(
          'Window load timeout',
          TransportErrorCode.TIMEOUT
        );
        this.notifyError(error);
        reject(error);
      }, this.baseOptions.timeout);

      const handler = (event: MessageEvent) => {
        const win = this.frame?.contentWindow;
        if (event.source === win) {
          if (this.#windowRef) {
            this.#windowRef.removeEventListener('message', handler);
          }
          clearTimeout(timeoutId);
          resolve();
        }
      };

      if (this.#windowRef) {
        this.#windowRef.addEventListener('message', handler);
      }
    });
  }

  private notifyError(error: Error): void {
    const handlers = Array.from(this.handlers);
    for (const handler of handlers) {
      if (handler.onError) {
        handler.onError(error);
      }
    }
  }

  private onWindowMessage = async (event: MessageEvent): Promise<void> => {
    if (!this.frame || event.source !== this.frame.contentWindow) {
      return;
    }

    try {
      const { data } = event;
      for (const handler of this.messageHandlers) {
        if (handler.canHandle(data)) {
          await handler.handle(data);
        }
      }
    } catch (error) {
      const transportError = createTransportError(
        'Failed to process message',
        TransportErrorCode.INVALID_MESSAGE,
        error
      );
      this.notifyError(transportError);
    }
  };

  protected get window(): Window | null {
    return this.#windowRef;
  }
}

function createTransportError(
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
