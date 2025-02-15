import type { Transport, TransportType } from './types.js';
import { TransportTypes } from './types.js';
import type { ChromeTransportConfig, ChromePort, ChromeMessage } from './chrome/types.js';
import { ChromeMessageType } from './chrome/types.js';
import { WalletError } from '../client/types.js';

/**
 * Transport implementation for communicating with Chrome extensions using the chrome.runtime API.
 */
export class ChromeExtensionTransport implements Transport {
  private port: ChromePort | null = null;
  private messageHandler: ((data: unknown) => void) | null = null;
  private connected = false;
  private readonly extensionId: string;
  private readonly portName: string;

  constructor(config: ChromeTransportConfig) {
    if (!config.extensionId) {
      throw new WalletError('Extension ID is required for ChromeExtensionTransport', 'transport');
    }
    this.extensionId = config.extensionId;
    this.portName = config.portName || 'walletmesh-connector';
  }

  /**
   * Establishes connection with the Chrome extension.
   * @throws {WalletError} If connection fails or extension is not found
   */
  public async connect(): Promise<void> {
    try {
      // Verify chrome runtime is available
      if (!window.chrome?.runtime?.connect) {
        throw new WalletError('Chrome runtime not available', 'transport');
      }

      // Connect to the extension
      this.port = window.chrome?.runtime.connect(this.extensionId, {
        name: this.portName,
      });

      // Set up disconnect handler
      this.port.onDisconnect.addListener(() => {
        this.handleDisconnect();
      });

      // Set up message handler
      this.port?.onMessage.addListener((message: unknown) => {
        if (this.messageHandler) {
          this.messageHandler(message);
        }
      });

      this.connected = true;
    } catch (error) {
      this.connected = false;
      this.port = null;
      throw new WalletError(
        `Failed to connect to extension: ${(error as Error).message}`,
        'transport',
        error as Error,
      );
    }
  }

  /**
   * Disconnects from the Chrome extension and cleans up resources.
   */
  public async disconnect(): Promise<void> {
    if (this.port) {
      this.port.disconnect();
    }
    this.handleDisconnect();
  }

  /**
   * Sends data to the connected Chrome extension.
   * @param data - The data to send
   * @throws {WalletError} If not connected or send fails
   */
  public async send(data: unknown): Promise<void> {
    if (!this.isConnected()) {
      throw new WalletError('Cannot send message: Not connected to extension', 'transport');
    }

    try {
      const message: ChromeMessage = {
        type: ChromeMessageType.REQUEST,
        payload: data,
        timestamp: Date.now(),
        id: crypto.randomUUID(),
      };

      this.port?.postMessage(message);
    } catch (error) {
      throw new WalletError(
        `Failed to send message: ${(error as Error).message}`,
        'transport',
        error as Error,
      );
    }
  }

  /**
   * Sets up message handler for incoming extension messages.
   * @param handler - Function to handle incoming messages
   */
  public onMessage(handler: (data: unknown) => void): void {
    this.messageHandler = handler;
  }

  /**
   * Removes message handler for incoming extension messages.
   * @param handler - Previously registered handler to remove
   */
  public offMessage(handler: (data: unknown) => void): void {
    if (this.messageHandler === handler) {
      this.messageHandler = null;
    }
  }

  public getType(): TransportType {
    return TransportTypes.CHROME_EXTENSION;
  }

  /**
   * Checks if currently connected to the extension.
   */
  public isConnected(): boolean {
    return this.connected && this.port !== null;
  }

  /**
   * Handles cleanup when port disconnects.
   */
  private handleDisconnect(): void {
    this.connected = false;
    this.port = null;
    this.messageHandler = null;
  }
}
