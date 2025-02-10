import type { Transport, TransportOptions } from './types.js';

export abstract class BaseTransport implements Transport {
  protected messageHandler: ((data: unknown) => void) | null = null;
  protected options: TransportOptions;
  protected isConnected = false;

  constructor(options: TransportOptions = {}) {
    this.options = options;
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract send(data: unknown): Promise<void>;

  onMessage(handler: (data: unknown) => void): void {
    this.messageHandler = handler;
  }

  protected isValidMessage(message: unknown): boolean {
    if (!message || typeof message !== 'object') {
      return false;
    }

    // Check if the message has required properties
    // This is a basic check - specific transports may add additional validation
    return true;
  }

  protected handleIncomingMessage(data: unknown): void {
    if (this.isValidMessage(data) && this.messageHandler) {
      this.messageHandler(data);
    }
  }
}
