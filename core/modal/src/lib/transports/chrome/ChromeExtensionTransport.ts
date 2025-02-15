/**
 * @file ChromeExtensionTransport.ts
 * @packageDocumentation
 * Chrome extension transport implementation.
 */

import type { Transport, BaseTransportConfig, TransportType } from '../types.js';
import { TransportError, TransportTypes } from '../types.js';
import type { ChromeMessage, ChromePort } from './types.js';
import { ChromeMessageType, isChromeMessage } from './types.js';

/**
 * Configuration for Chrome extension transport.
 */
export interface ChromeExtensionConfig extends BaseTransportConfig {
  /** Chrome extension ID to connect to */
  extensionId: string;
  /** Optional port name for the connection */
  portName?: string | undefined;
}

/**
 * Transport implementation for Chrome extension communication.
 */
export class ChromeExtensionTransport implements Transport {
  private port: ChromePort | null = null;
  private connected = false;
  private messageHandlers = new Set<(data: unknown) => void>();
  private reconnectTimeout: number | undefined;
  private reconnectAttempts = 0;

  constructor(private readonly config: ChromeExtensionConfig) {}

  async connect(): Promise<void> {
    if (this.connected) return;

    try {
      if (!window.chrome?.runtime) {
        throw new Error('Chrome runtime not available');
      }

      this.port = window.chrome.runtime.connect(this.config.extensionId, {
        name: this.config.portName || undefined,
      });

      this.setupPortListeners();
      this.connected = true;
      this.reconnectAttempts = 0;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      const chromeError = window.chrome?.runtime?.lastError;
      throw new TransportError(
        `Failed to connect to extension: ${chromeError?.message || error.message}`,
        'connection',
        error,
      );
    }
  }

  async disconnect(): Promise<void> {
    if (this.reconnectTimeout) {
      window.clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = undefined;
    }

    if (this.port) {
      try {
        this.port.disconnect();
      } catch (error) {
        console.warn('Error disconnecting port:', error);
      }
      this.port = null;
    }

    this.connected = false;
    this.messageHandlers.clear();
  }

  async send(data: unknown): Promise<void> {
    if (!this.port || !this.connected) {
      throw new TransportError('Cannot send message: Not connected', 'connection');
    }

    try {
      const message: ChromeMessage = {
        type: ChromeMessageType.REQUEST,
        payload: data,
        timestamp: Date.now(),
        id: crypto.randomUUID(),
      };

      this.port.postMessage(message);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      throw new TransportError(`Failed to send message: ${error.message}`, 'message', error);
    }
  }

  onMessage(handler: (data: unknown) => void): void {
    this.messageHandlers.add(handler);
  }

  offMessage(handler: (data: unknown) => void): void {
    this.messageHandlers.delete(handler);
  }

  isConnected(): boolean {
    return this.connected;
  }

  getType(): TransportType {
    return TransportTypes.CHROME_EXTENSION;
  }

  private setupPortListeners(): void {
    if (!this.port) return;

    this.port.onMessage.addListener((message: unknown) => {
      try {
        if (!isChromeMessage(message)) {
          console.warn('Invalid message format:', message);
          return;
        }

        for (const handler of this.messageHandlers) {
          handler(message);
        }
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });

    this.port.onDisconnect.addListener(() => {
      this.handleDisconnect();
    });
  }

  private handleDisconnect(): void {
    const wasConnected = this.connected;
    this.connected = false;
    this.port = null;

    const shouldReconnect =
      wasConnected &&
      this.config.autoReconnect &&
      this.reconnectAttempts < (this.config.reconnectAttempts || 0);

    if (shouldReconnect) {
      this.scheduleReconnect();
    } else {
      const disconnectMessage: ChromeMessage = {
        type: ChromeMessageType.DISCONNECT,
        timestamp: Date.now(),
        id: crypto.randomUUID(),
      };

      for (const handler of this.messageHandlers) {
        handler(disconnectMessage);
      }
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      window.clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = window.setTimeout(async () => {
      this.reconnectAttempts++;
      try {
        await this.connect();
      } catch (error) {
        const shouldRetry =
          this.config.autoReconnect && this.reconnectAttempts < (this.config.reconnectAttempts || 0);

        if (shouldRetry) {
          this.scheduleReconnect();
        } else {
          const errorMessage: ChromeMessage = {
            type: ChromeMessageType.ERROR,
            error: {
              message: 'Failed to reconnect',
              code: 'RECONNECT_FAILED',
              details: error instanceof Error ? error.message : 'Unknown error',
            },
            timestamp: Date.now(),
            id: crypto.randomUUID(),
          };

          for (const handler of this.messageHandlers) {
            handler(errorMessage);
          }
        }
      }
    }, this.config.reconnectDelay);
  }
}
