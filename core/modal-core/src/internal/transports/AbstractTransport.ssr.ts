/**
 * Base transport implementation with SSR safety
 * Defines common functionality for all transport types with error handling and recovery
 *
 * @internal
 */

import { isBrowser } from '../../api/utils/environment.js';
import { createLazy } from '../../api/utils/lazy.js';
import type { Transport, TransportConfig, TransportEvent } from '../../types.js';
import { ErrorFactory } from '../core/errors/errorFactory.js';
import type { ErrorHandler } from '../core/errors/errorHandler.js';
import { isModalError } from '../core/errors/utils.js';
import type { Logger } from '../core/logger/logger.js';
import { createSafeTimeout as setDOMTimeout } from '../utils/dom-essentials.js';

/**
 * Base implementation for all transport types with SSR safety
 * Provides common functionality for connection management, event handling,
 * and error recovery that all transport implementations can inherit
 *
 * @implements {Transport}
 * @class AbstractTransport
 */
export abstract class AbstractTransport implements Transport {
  /**
   * Whether the transport is connected
   */
  protected connected = false;

  /**
   * Lazy event target for transport events
   */
  protected getEventTarget = createLazy(() => {
    if (!isBrowser()) {
      // Provide a minimal EventTarget polyfill for SSR
      return {
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      } as EventTarget;
    }
    return new EventTarget();
  });

  /**
   * Transport configuration
   */
  protected config: TransportConfig;

  /**
   * Error handler for transport errors
   */
  protected errorHandler: ErrorHandler;

  /**
   * Logger instance
   */
  protected logger: Logger;

  /**
   * Base constructor for transports
   *
   * @param config - Transport configuration options including timeouts
   * @param logger - Logger instance (required)
   * @param errorHandler - Error handler for transport errors
   *
   * @example
   * ```typescript
   * // Creating a transport with configuration
   * const logger = createDebugLogger('PopupTransport', true);
   * const transport = new PopupTransport({
   *   timeout: 60000, // 60 seconds timeout
   *   target: document.getElementById('modal-container')
   * }, logger, errorHandler);
   * ```
   */
  constructor(config: TransportConfig, logger: Logger, errorHandler: ErrorHandler) {
    // Initialize with default configuration
    const safeConfig = config || {};
    this.config = {
      timeout: 30000, // 30 seconds
      ...safeConfig,
    };

    this.logger = logger;
    this.errorHandler = errorHandler;
  }

  /**
   * Connect to the transport with error handling and recovery
   */
  async connect(): Promise<void> {
    try {
      await this.connectWithRetry();
    } catch (error) {
      // Create transport error using ErrorFactory
      const modalError = ErrorFactory.connectionFailed('Failed to connect to transport', {
        context: 'connect',
      });

      // Log the error
      this.logError('Connection failed', modalError);

      // Emit error event synchronously to avoid unhandled rejections
      try {
        this.emitErrorEvent(new Error(modalError.message));
      } catch (emitError) {
        this.logError('Failed to emit error event', emitError);
      }

      throw modalError;
    }
  }

  /**
   * Internal method to implement connection logic
   */
  protected abstract connectInternal(): Promise<void>;

  /**
   * Connect with simple retry logic
   */
  private async connectWithRetry(): Promise<void> {
    // Simple retry logic - attempt connection 3 times with 1 second delay
    const MAX_RETRIES = 3;
    const DELAY_MS = 1000;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await this.connectInternal();
      } catch (error) {
        if (attempt === MAX_RETRIES) {
          throw error; // Re-throw on final attempt
        }
        await this.delay(DELAY_MS);
      }
    }
  }

  /**
   * Disconnect from the transport with error handling
   */
  async disconnect(): Promise<void> {
    try {
      await this.disconnectInternal();
    } catch (error) {
      // Create transport error using ErrorFactory
      const modalError = ErrorFactory.transportDisconnected('Failed to disconnect from transport', 'manual');

      // Log the error
      this.logError('Disconnect failed', modalError);

      // Emit error event synchronously to avoid unhandled rejections
      try {
        this.emitErrorEvent(new Error(modalError.message));
      } catch (emitError) {
        this.logError('Failed to emit error event', emitError);
      }

      throw modalError;
    }
  }

  /**
   * Internal method to implement disconnection logic
   */
  protected abstract disconnectInternal(): Promise<void>;

  /**
   * Send data through the transport with error handling and retry
   *
   * @param {unknown} data - Data to send
   */
  async send(data: unknown): Promise<void> {
    try {
      // Check if we're connected before attempting to send
      if (!this.isConnected()) {
        throw ErrorFactory.connectionFailed('Transport is not connected', { context: 'send' });
      }

      // Simple retry logic - attempt sending 2 times with 500ms delay
      const MAX_RETRIES = 2;
      const DELAY_MS = 500;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          return await this.sendInternal(data);
        } catch (error) {
          if (attempt === MAX_RETRIES) {
            throw error; // Re-throw on final attempt
          }
          await this.delay(DELAY_MS);
        }
      }
    } catch (error) {
      // Create transport error using ErrorFactory
      const modalError = ErrorFactory.messageFailed('Failed to send message through transport', { data });

      // Log the error
      this.logError('Send failed', modalError, { data });

      // Emit error event synchronously to avoid unhandled rejections
      try {
        this.emitErrorEvent(new Error(modalError.message));
      } catch (emitError) {
        this.logError('Failed to emit error event', emitError);
      }

      throw modalError;
    }
  }

  /**
   * Internal method to implement send logic
   *
   * @param {unknown} data - Data to send through the transport
   * @protected
   * @abstract
   */
  protected abstract sendInternal(data: unknown): Promise<void>;

  // Store active subscriptions for proper cleanup
  private subscriptions = new Map<string, Map<(event: TransportEvent) => void, (e: Event) => void>>();

  /**
   * Subscribe to transport events
   *
   * @param {string} event - Event name to subscribe to
   * @param {(event: TransportEvent) => void} listener - Callback function for the event
   * @returns {() => void} Unsubscribe function
   */
  on(event: string, listener: (event: TransportEvent) => void): () => void {
    const eventTarget = this.getEventTarget();

    // Create a wrapper listener for EventTarget
    const wrappedListener = (e: Event) => {
      const customEvent = e as CustomEvent<TransportEvent>;
      listener(customEvent.detail);
    };

    // Add event listener
    eventTarget.addEventListener(event, wrappedListener);

    // Track the subscription for cleanup
    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, new Map());
    }

    const eventSubscriptions = this.subscriptions.get(event);
    if (eventSubscriptions) {
      eventSubscriptions.set(listener, wrappedListener);
    }

    // Return a function to unsubscribe
    return () => {
      this.off(event, listener);
    };
  }

  /**
   * Unsubscribe from transport events
   *
   * @param {string} event - Event name to unsubscribe from
   * @param {(event: TransportEvent) => void} listener - Callback function to remove
   */
  off(event: string, listener: (event: TransportEvent) => void): void {
    const eventTarget = this.getEventTarget();

    // Get the event's subscriptions
    const eventSubscriptions = this.subscriptions.get(event);
    if (!eventSubscriptions) return;

    // Find the specific wrapped listener
    const wrappedListener = eventSubscriptions.get(listener);
    if (!wrappedListener) return;

    // Remove event listener
    eventTarget.removeEventListener(event, wrappedListener);
    eventSubscriptions.delete(listener);

    // Clean up empty maps
    if (eventSubscriptions.size === 0) {
      this.subscriptions.delete(event);
    }
  }

  /**
   * Emit a transport event
   *
   * @param {TransportEvent} event - Event to emit
   * @protected
   */
  protected emit(event: TransportEvent): void {
    const eventTarget = this.getEventTarget();

    if (isBrowser()) {
      eventTarget.dispatchEvent(new CustomEvent(event.type, { detail: event }));
    } else {
      // In SSR, log the event instead of dispatching
      this.logger.debug('SSR: Would emit transport event', { event });
    }
  }

  /**
   * Get whether the transport is connected
   * @returns {boolean} True if connected, false otherwise
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * SSR-safe delay function
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>} Promise that resolves after delay
   * @protected
   */
  protected delay(ms: number): Promise<void> {
    if (!isBrowser()) {
      // In SSR, resolve immediately
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      setDOMTimeout(() => {
        resolve();
      }, ms);

      // Note: cleanup is called automatically when timeout fires
      // but we can't cancel it in this pattern
    });
  }

  /**
   * Log a message using the injected logger
   *
   * @param {'debug' | 'info' | 'warn' | 'error'} level - Log level
   * @param {string} message - Message to log
   * @param {Record<string, unknown>} [data] - Additional data to log
   * @protected
   */
  protected log(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    data?: Record<string, unknown>,
  ): void {
    this.logger[level](message, data);
  }

  /**
   * Log an error using the injected logger
   *
   * @param {string} message - Error message to log
   * @param {Error | unknown} error - Error to log
   * @param {Record<string, unknown>} [data] - Additional data to log
   * @protected
   */
  protected logError(message: string, error: Error | unknown, data?: Record<string, unknown>): void {
    if (isModalError(error)) {
      this.logger.error(message, { error, ...data });
    } else if (error instanceof Error) {
      this.logger.error(message, { error: error.message, stack: error.stack, ...data });
    } else {
      this.logger.error(message, { error: String(error), ...data });
    }
  }

  /**
   * Emit an error event
   *
   * @param {Error} error - Error to emit
   * @protected
   */
  protected emitErrorEvent(error: Error): void {
    // Convert to ModalError if needed
    const modalError = isModalError(error) ? error : ErrorFactory.transportError(error.message);

    this.emit({
      type: 'error',
      error: modalError,
    });
  }

  /**
   * Clean up resources and subscriptions
   * @protected
   */
  protected cleanup(): void {
    // Clear all subscriptions
    for (const [event, eventSubscriptions] of this.subscriptions.entries()) {
      for (const [listener] of eventSubscriptions) {
        this.off(event, listener);
      }
    }
    this.subscriptions.clear();

    // Reset connection state
    this.connected = false;
  }

  /**
   * Destroy the transport and clean up all resources
   * @returns Promise that resolves when cleanup is complete
   * @public
   */
  async destroy(): Promise<void> {
    // Disconnect if connected
    if (this.connected) {
      await this.disconnect();
    }

    // Clean up resources
    this.cleanup();
  }
}
