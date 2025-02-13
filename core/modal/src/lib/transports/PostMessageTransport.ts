import type { Transport, TransportOptions } from './types.js';
import { messageValidation, errorMessages } from '../utils/validation.js';

interface PostMessageData {
  type: string;
  data: unknown;
  origin?: string;
}

export class PostMessageTransport implements Transport {
  private messageHandler: ((data: unknown) => void) | null = null;
  private cleanup: (() => void) | null = null;
  private connected = false;
  private readonly options: TransportOptions;

  constructor(options: TransportOptions = {}) {
    this.options = options;
  }

  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    const receiveResponse = (event: MessageEvent) => {
      console.log('[PostMessageTransport] Received message:', event);

      // Validate origin if specified
      if (!messageValidation.isValidOrigin(event.origin, this.options.origin)) {
        console.warn(
          '[PostMessageTransport] Invalid origin:',
          event.origin,
          'expected:',
          this.options.origin,
        );
        return;
      }

      // Only handle messages from the same window
      if (event.source !== window) {
        console.warn('[PostMessageTransport] Invalid source:', event.source);
        return;
      }

      const message = event.data as PostMessageData;
      console.log('[PostMessageTransport] Message:', message);

      // Only handle wallet response messages
      if (message?.type !== 'wallet_response') {
        console.warn('[PostMessageTransport] Invalid message type:', message?.type);
        return;
      }

      // Validate message format
      if (!messageValidation.isValidMessage(message.data)) {
        console.warn('[PostMessageTransport] Invalid message format:', message.data);
        return;
      }

      // Pass message to handler
      if (this.messageHandler) {
        console.log('[PostMessageTransport] Handling message:', message.data);
        this.messageHandler(message.data);
      } else {
        console.warn('[PostMessageTransport] No message handler registered');
      }
    };

    window.addEventListener('message', receiveResponse);
    this.cleanup = () => window.removeEventListener('message', receiveResponse);
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = null;
    }
    this.connected = false;
    this.messageHandler = null;
  }

  async send(data: unknown): Promise<void> {
    if (!this.connected) {
      throw new Error(errorMessages.notConnected);
    }

    if (!messageValidation.isValidMessage(data)) {
      throw new Error(errorMessages.invalidMessage);
    }

    const message: PostMessageData = {
      type: 'wallet_request',
      data,
      origin: window.location.origin,
    };

    console.log('[PostMessageTransport] Sending message:', message, 'to:', this.options.origin || '*');
    window.postMessage(message, this.options.origin || '*');
  }

  onMessage(handler: (data: unknown) => void): void {
    this.messageHandler = handler;
  }

  isConnected(): boolean {
    return this.connected;
  }
}
