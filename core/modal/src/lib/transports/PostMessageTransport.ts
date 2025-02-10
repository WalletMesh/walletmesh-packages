import { BaseTransport } from './BaseTransport.js';
import type { TransportOptions } from '../types.js';

interface PostMessageData {
  type: string;
  data: unknown;
  origin?: string;
}

export class PostMessageTransport extends BaseTransport {
  private cleanup: (() => void) | null = null;

  constructor(options: TransportOptions = {}) {
    super(options);
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    const receiveResponse = (event: MessageEvent) => {
      // Only handle messages from the expected origin if specified
      if (this.options.origin && event.origin !== this.options.origin) {
        return;
      }

      // Only handle messages from the same window
      if (event.source !== window) {
        return;
      }

      const message = event.data as PostMessageData;
      
      // Only handle wallet response messages
      if (message?.type !== 'wallet_response') {
        return;
      }

      this.handleIncomingMessage(message.data);
    };

    window.addEventListener('message', receiveResponse);
    this.cleanup = () => window.removeEventListener('message', receiveResponse);
    this.isConnected = true;
  }

  async disconnect(): Promise<void> {
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = null;
    }
    this.isConnected = false;
  }

  async send(data: unknown): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Transport not connected');
    }

    const message: PostMessageData = {
      type: 'wallet_request',
      data,
      origin: window.location.origin
    };

    window.postMessage(message, this.options.origin || '*');
  }

  protected override isValidMessage(message: unknown): boolean {
    if (!super.isValidMessage(message)) {
      return false;
    }

    // Add PostMessage-specific validation if needed
    return true;
  }
}
