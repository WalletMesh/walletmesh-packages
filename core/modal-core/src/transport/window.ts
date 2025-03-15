/**
 * @packageDocumentation
 * Window-based transport implementation using postMessage.
 */

import type { Message, MessageHandler, Transport, TransportOptions } from './types.js';
import { TransportError, TransportErrorCode } from './types.js';

export interface WindowTransportOptions extends TransportOptions {
  /** Target window URL */
  url: string | URL;
  /** Window features for popup */
  windowFeatures?: string;
  /** Window name */
  windowName?: string;
  /** Window dimensions */
  dimensions?: {
    width: number;
    height: number;
  };
}

const DEFAULT_OPTIONS: Required<Omit<WindowTransportOptions, 'url'>> = {
  timeout: 30000,
  retries: 3,
  debug: false,
  windowFeatures: '',
  windowName: 'WalletMesh',
  dimensions: {
    width: 420,
    height: 540,
  },
};

/**
 * Window-based transport using postMessage for communication.
 */
export class WindowTransport implements Transport {
  private window: Window | null = null;
  private connected = false;
  private handlers = new Set<MessageHandler>();
  private messageListener: ((event: MessageEvent) => void) | null = null;
  private closeInterval: ReturnType<typeof setInterval> | null = null;
  private readonly options: Required<WindowTransportOptions>;
  private readonly targetOrigin: string;

  constructor(options: WindowTransportOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.targetOrigin = new URL(this.options.url).origin;
  }

  async connect(): Promise<void> {
    if (this.connected) {
      throw new TransportError('Transport already connected', TransportErrorCode.CONNECTION_FAILED);
    }

    try {
      this.window = this.openWindow();
      if (!this.window) {
        throw new TransportError('Failed to open window', TransportErrorCode.CONNECTION_FAILED);
      }

      // Setup message listener
      this.messageListener = (event: MessageEvent) => {
        if (event.origin !== this.targetOrigin) return;
        this.handleMessage(event.data);
      };
      window.addEventListener('message', this.messageListener);

      // Monitor window state
      this.closeInterval = setInterval(() => {
        if (!this.window || this.window.closed) {
          void this.disconnect();
        }
      }, 100);

      // Wait for window to load
      await this.waitForWindowLoad();
      this.connected = true;
    } catch (error) {
      await this.disconnect();
      if (error instanceof TransportError) {
        throw error;
      }
      throw new TransportError('Failed to establish connection', TransportErrorCode.CONNECTION_FAILED, error);
    }
  }

  async disconnect(): Promise<void> {
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
      this.messageListener = null;
    }

    if (this.closeInterval) {
      clearInterval(this.closeInterval);
      this.closeInterval = null;
    }

    if (this.window && !this.window.closed) {
      this.window.close();
    }
    this.window = null;
    this.connected = false;
    this.handlers.clear();
  }

  async send<T, R>(message: Message<T>): Promise<Message<R>> {
    if (!this.connected || !this.window) {
      throw new TransportError('Transport not connected', TransportErrorCode.TRANSPORT_ERROR);
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new TransportError('Message timeout', TransportErrorCode.TIMEOUT, message));
      }, this.options.timeout);

      // Setup response handler
      const responseHandler: MessageHandler = {
        canHandle: (response) => response.id === message.id,
        handle: async (response) => {
          clearTimeout(timeout);
          this.handlers.delete(responseHandler);
          resolve(response as Message<R>);
        },
      };
      this.handlers.add(responseHandler);

      // Send message
      this.window?.postMessage(message, this.targetOrigin);
    });
  }

  subscribe(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  isConnected(): boolean {
    return this.connected && !!this.window && !this.window.closed;
  }

  private openWindow(): Window | null {
    const { width, height } = this.options.dimensions;
    const left = (window.innerWidth - width) / 2 + window.screenX;
    const top = (window.innerHeight - height) / 2 + window.screenY;

    const features = this.options.windowFeatures || `width=${width},height=${height},left=${left},top=${top}`;

    return window.open(this.options.url, this.options.windowName, features);
  }

  private async waitForWindowLoad(): Promise<void> {
    if (!this.window) {
      throw new TransportError('No window to wait for', TransportErrorCode.TRANSPORT_ERROR);
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new TransportError('Window load timeout', TransportErrorCode.TIMEOUT));
      }, this.options.timeout);

      const checkWindow = () => {
        if (this.window?.closed) {
          clearTimeout(timeout);
          reject(new TransportError('Window closed before loading', TransportErrorCode.CONNECTION_FAILED));
          return;
        }

        // Try to access window to check if it's loaded
        try {
          if (this.window?.location.href) {
            clearTimeout(timeout);
            resolve();
            return;
          }
        } catch (e) {
          // Cross-origin access error, fail the connection
          clearTimeout(timeout);
          reject(
            new TransportError(
              'Failed to establish connection: Cross-origin access denied',
              TransportErrorCode.CONNECTION_FAILED,
              e,
            ),
          );
        }

        requestAnimationFrame(checkWindow);
      };

      checkWindow();
    });
  }

  private handleMessage(data: unknown): void {
    for (const handler of this.handlers) {
      if (handler.canHandle(data as Message)) {
        void handler.handle(data as Message);
      }
    }
  }
}
