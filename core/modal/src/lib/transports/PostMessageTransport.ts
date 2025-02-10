import type { Transport, TransportOptions } from '../types.js';
import { messageValidation, errorMessages } from '../utils/validation.js';

interface PostMessageData {
  type: string;
  data: unknown;
  origin?: string;
}

export class PostMessageTransport implements Transport {
  private messageHandler: ((data: unknown) => void) | null = null;
  private cleanup: (() => void) | null = null;
  private isConnected = false;
  private readonly options: TransportOptions;

  constructor(options: TransportOptions = {}) {
    this.options = options;
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    const receiveResponse = (event: MessageEvent) => {
      // Validate origin if specified
      if (!messageValidation.isValidOrigin(event.origin, this.options.origin)) {
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

      // Validate message format
      if (!messageValidation.isValidMessage(message.data)) {
        return;
      }

      // Pass message to handler
      if (this.messageHandler) {
        this.messageHandler(message.data);
      }
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
    this.messageHandler = null;
  }

  async send(data: unknown): Promise<void> {
    if (!this.isConnected) {
      throw new Error(errorMessages.notConnected);
    }

    if (!messageValidation.isValidMessage(data)) {
      throw new Error(errorMessages.invalidMessage);
    }

    const message: PostMessageData = {
      type: 'wallet_request',
      data,
      origin: window.location.origin
    };

    window.postMessage(message, this.options.origin || '*');
  }

  onMessage(handler: (data: unknown) => void): void {
    this.messageHandler = handler;
  }
}
