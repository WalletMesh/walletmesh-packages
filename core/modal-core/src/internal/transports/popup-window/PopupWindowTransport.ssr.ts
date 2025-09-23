/**
 * Popup window transport implementation with SSR safety
 * Implements a transport using a popup window for cross-origin communication
 *
 * @internal
 */

import { getWindow, isBrowser } from '../../../api/utils/environment.js';
import { createLazy } from '../../../api/utils/lazy.js';
import type {
  PopupConfig,
  TransportConnectedEvent,
  TransportDisconnectedEvent,
  TransportMessageEvent,
} from '../../../types.js';
import { ErrorFactory } from '../../core/errors/errorFactory.js';
import type { ErrorHandler } from '../../core/errors/errorHandler.js';
import type { Logger } from '../../core/logger/logger.js';
import {
  attachGlobalListener as addGlobalListener,
  createSafeInterval as setDOMInterval,
  createSafeTimeout as setDOMTimeout,
} from '../../utils/dom-essentials.js';
import { AbstractTransport } from '../AbstractTransport.ssr.js';

/**
 * Implementation of a popup window transport with SSR safety
 * Opens a popup window and establishes message communication with it
 *
 * @extends AbstractTransport
 *
 * @example
 * ```typescript
 * // Create a popup transport to a wallet URL
 * const transport = new PopupTransport({
 *   url: 'https://my-wallet.com/connect',
 *   width: 400,
 *   height: 600
 * });
 *
 * // Connect and listen for messages
 * await transport.connect();
 * transport.on('message', (event) => {
 *   console.log('Received message:', event.data);
 * });
 * ```
 * @class PopupWindow
 */
export class PopupWindow extends AbstractTransport {
  /**
   * The popup window instance
   */
  private popup: Window | null = null;

  /**
   * Cleanup function for interval
   */
  private checkClosedCleanup: ReturnType<typeof setInterval> | null = null;

  /**
   * Cleanup function for message listener
   */
  private messageListenerCleanup: (() => void) | null = null;

  /**
   * Whether the transport is connected
   */
  protected override connected = false;

  /**
   * Configuration for the transport
   */
  protected override config: PopupConfig = {};

  /**
   * Target origin for postMessage
   */
  private targetOrigin = '*';

  /**
   * Popup configuration
   */
  private popupConfig: PopupConfig;

  /**
   * Lazy window getter
   */
  private getWindowSafe = createLazy(() => {
    const win = getWindow();
    if (!win) {
      throw ErrorFactory.renderFailed('Window not available in SSR environment', 'PopupWindow');
    }
    return win;
  });

  /**
   * Create a new popup transport
   *
   * @param config - Transport configuration
   * @param logger - Logger instance for this transport
   * @param errorHandler - Error handler instance for this transport
   */
  constructor(config: PopupConfig, logger: Logger, errorHandler: ErrorHandler) {
    super(config, logger, errorHandler);

    // Create a deep copy of the config to avoid mutation
    this.popupConfig = {
      // Default empty string if url is undefined
      url: config.url ?? '',
      target: config.target ?? '_blank',
      features: config.features ?? this.createFeatures(config),
    };

    // Extract origin from URL for security
    if (config.url && isBrowser()) {
      try {
        const url = new URL(config.url);
        this.targetOrigin = url.origin;
      } catch (e) {
        // If URL parsing fails, we'll keep the default '*'
        this.log('warn', 'Invalid URL provided to popup transport, using wildcard origin', {
          url: config.url,
          error: e,
        });
      }
    }
  }

  /**
   * Create default window features string for the popup
   * Calculates position to center the popup on screen
   *
   * @param {PopupConfig} config - Configuration object with optional width and height
   * @returns Window features string formatted for window.open()
   */
  private createFeatures(config: PopupConfig): string {
    const width = config.width ?? 500;
    const height = config.height ?? 600;

    if (!isBrowser()) {
      return `width=${width},height=${height},left=0,top=0,resizable=yes,scrollbars=yes`;
    }

    const win = getWindow();
    const left = win ? (win.innerWidth - width) / 2 : 0;
    const top = win ? (win.innerHeight - height) / 2 : 0;

    return `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`;
  }

  /**
   * Get typed config
   */
  private get typedConfig(): PopupConfig {
    return this.config;
  }

  /**
   * Emit a transport event
   *
   * @param event - Event to emit
   */
  // biome-ignore lint/suspicious/noExplicitAny: Event type is defined by base class
  protected override emit(event: any): void {
    // Call the parent emit method which uses EventTarget
    super.emit(event);
  }

  /**
   * Internal implementation of connect method
   */
  protected async connectInternal(): Promise<void> {
    // Don't reconnect if already connected
    if (this.connected) {
      return;
    }

    if (!isBrowser()) {
      throw ErrorFactory.renderFailed('Popup transport requires browser environment', 'PopupWindow');
    }

    return new Promise((resolve, reject) => {
      try {
        const win = this.getWindowSafe();

        // Open the popup window
        this.popup = win.open(
          this.popupConfig.url || '',
          this.popupConfig.target || '_blank',
          this.popupConfig.features,
        );

        if (!this.popup) {
          const error = ErrorFactory.connectionFailed('Failed to open popup window - may be blocked', {
            blocked: true,
          });
          reject(error);
          return;
        }

        // Set up message listener for popup communication
        const handleMessage = (event: MessageEvent) => {
          // Verify the message is from our popup
          if (this.targetOrigin !== '*' && event.origin !== this.targetOrigin) {
            return;
          }

          // Check if this is a connection confirmation
          if (event.data?.type === 'connected') {
            this.connected = true;
            this.emit({
              type: 'connected',
              url: this.popupConfig.url || '',
            } as TransportConnectedEvent);
            resolve();
          } else {
            // Handle other messages
            this.emit({
              type: 'message',
              data: event.data,
            } as TransportMessageEvent);
          }
        };

        this.messageListenerCleanup = addGlobalListener('window', 'message', handleMessage as EventListener);

        // Start checking if the popup was closed
        this.checkClosedCleanup = setDOMInterval(() => {
          if (this.popup?.closed) {
            this.handlePopupClosed();
          }
        }, 1000);

        // Set a timeout for connection
        const timeoutMs = this.typedConfig.timeout || 30000;
        setDOMTimeout(() => {
          if (!this.connected) {
            this.popup?.close();
            this.popup = null;
            const error = ErrorFactory.connectionFailed('Popup connection timeout', {
              timeout: timeoutMs,
            });
            reject(error);
          }
        }, timeoutMs);

        // Note: We can't cleanup the timeout if connection succeeds
        // because setDOMTimeout returns a cleanup function that only works before timeout fires
      } catch (error) {
        this.log('error', 'Failed to open popup', { error });
        const modalError = ErrorFactory.connectionFailed('Failed to open popup window', {
          originalError: error,
        });
        reject(modalError);
      }
    });
  }

  /**
   * Internal implementation of disconnect method
   */
  protected async disconnectInternal(): Promise<void> {
    // Close the popup if it's open
    if (this.popup && !this.popup.closed) {
      this.popup.close();
    }

    // Clean up
    this.cleanup();

    // Emit disconnected event
    this.emit({
      type: 'disconnected',
      reason: 'Manual disconnect',
    } as TransportDisconnectedEvent);
  }

  /**
   * Internal implementation of send method
   */
  protected async sendInternal(data: unknown): Promise<void> {
    if (!this.popup || this.popup.closed) {
      throw ErrorFactory.connectionFailed('Popup window is not open', {
        closed: true,
      });
    }

    try {
      this.popup.postMessage(data, this.targetOrigin);
    } catch (error) {
      throw ErrorFactory.messageFailed('Failed to send message to popup', {
        error,
      });
    }
  }

  /**
   * Handle popup being closed
   */
  private handlePopupClosed(): void {
    if (this.connected) {
      this.connected = false;
      this.emit({
        type: 'disconnected',
        reason: 'Popup window closed',
      } as TransportDisconnectedEvent);
    }

    this.cleanup();
  }

  /**
   * Clean up resources
   */
  protected override cleanup(): void {
    // Clean up interval
    if (this.checkClosedCleanup) {
      clearInterval(this.checkClosedCleanup);
      this.checkClosedCleanup = null;
    }

    // Clean up message listener
    if (this.messageListenerCleanup) {
      this.messageListenerCleanup();
      this.messageListenerCleanup = null;
    }

    // Reset state
    this.popup = null;
    this.connected = false;

    // Call parent cleanup
    super.cleanup();
  }
}
