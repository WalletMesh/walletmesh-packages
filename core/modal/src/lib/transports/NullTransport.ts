import type { Transport } from './types.js';

export class NullTransport implements Transport {
  private connected = false;
  private messageHandler: ((data: unknown) => void) | null = null;

  async connect(): Promise<void> {
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.messageHandler = null;
  }

  async send(data: unknown): Promise<void> {
    if (!this.connected) {
      throw new Error('Transport not connected');
    }
    // Still a no-op but now checks connection state
    if (this.messageHandler) {
      // Simulate message handling for state changes
      this.messageHandler(data);
    }
  }

  onMessage(handler: (data: unknown) => void): void {
    this.messageHandler = handler;
  }

  // Add method to check connection state
  isConnected(): boolean {
    return this.connected;
  }
}
