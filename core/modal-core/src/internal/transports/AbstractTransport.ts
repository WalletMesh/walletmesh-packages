/**
 * Base transport implementation
 *
 * Defines common functionality for all transport types with error handling and recovery.
 * This abstract class provides the foundation for all wallet communication transports.
 *
 * ## Architecture
 *
 * The transport layer abstracts the communication mechanism between the dApp and wallet:
 * - **Popup Transport**: Uses window.postMessage for cross-origin communication
 * - **Chrome Extension Transport**: Uses Chrome runtime messaging API
 * - **Future Transports**: WebSocket, WebRTC, iframe, etc.
 *
 * ## Key Features
 *
 * - **Connection Management**: Automated retry logic and connection state tracking
 * - **Error Recovery**: Built-in retry mechanisms with exponential backoff
 * - **Event System**: EventTarget-based pub/sub for transport events
 * - **Resource Cleanup**: Proper cleanup of listeners and connections
 * - **Type Safety**: Full TypeScript support with generic event types
 *
 * ## Implementation Guidelines
 *
 * When extending AbstractTransport:
 * 1. Implement `connectInternal()` for establishing connections
 * 2. Implement `disconnectInternal()` for cleanup
 * 3. Implement `sendInternal()` for message transmission
 * 4. Use `emit()` to notify subscribers of events
 * 5. Call parent methods for common functionality
 *
 * @example
 * ```typescript
 * class WebSocketTransport extends AbstractTransport {
 *   private socket: WebSocket | null = null;
 *
 *   protected async connectInternal(): Promise<void> {
 *     this.socket = new WebSocket(this.config.url);
 *     this.socket.onopen = () => {
 *       this.connected = true;
 *       this.emit({ type: 'connected' });
 *     };
 *   }
 *
 *   protected async sendInternal(data: unknown): Promise<void> {
 *     this.socket?.send(JSON.stringify(data));
 *   }
 * }
 * ```
 *
 * @internal
 */

import type { Transport, TransportConfig, TransportEvent } from '../../types.js';
import { ErrorFactory } from '../core/errors/errorFactory.js';
import type { ErrorHandler } from '../core/errors/errorHandler.js';
import type { ModalError } from '../core/errors/types.js';
import { isModalError } from '../core/errors/utils.js';
import type { Logger } from '../core/logger/logger.js';
import {
	OriginValidator,
	type OriginValidationResult,
} from './validation/OriginValidator.js';

/**
 * Base implementation for all transport types
 *
 * Provides common functionality for connection management, event handling,
 * and error recovery that all transport implementations can inherit.
 *
 * ## Lifecycle
 *
 * 1. **Construction**: Initialize config, logger, error handler
 * 2. **Connection**: Call `connect()` which uses retry logic
 * 3. **Communication**: Use `send()` for outbound, events for inbound
 * 4. **Disconnection**: Call `disconnect()` for graceful shutdown
 * 5. **Destruction**: Call `destroy()` for complete cleanup
 *
 * ## Error Handling
 *
 * All errors are wrapped in ModalError using ErrorFactory:
 * - Connection failures: `connectionFailed`
 * - Message failures: `messageFailed`
 * - Transport errors: `transportError`
 * - Cleanup failures: `cleanupFailed`
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
   * Event target for transport events
   */
  protected eventTarget = new EventTarget();

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
   * Captured browser-validated origin (for postMessage transports)
   * Set by subclasses when they receive MessageEvent with validated origin
   */
  protected capturedOrigin?: string;

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
   *
   * Implements connection with automatic retry logic (3 attempts, 1s delay).
   * Subclasses should implement `connectInternal()` for specific logic.
   *
   * @throws {ModalError} Connection failed after all retry attempts
   *
   * @example
   * ```typescript
   * try {
   *   await transport.connect();
   *   console.log('Connected successfully');
   * } catch (error) {
   *   if (error.code === 'CONNECTION_FAILED') {
   *     // Handle connection failure
   *   }
   * }
   * ```
   */
  async connect(): Promise<void> {
    try {
      await this.connectWithRetry();
    } catch (_error) {
      // Create transport error using ErrorFactory
      const modalError = ErrorFactory.connectionFailed('Failed to connect to transport', {
        context: 'connect',
      });

      // Log the error
      this.logError('Connection failed', modalError);

      // Emit error event synchronously to avoid unhandled rejections
      try {
        this.emitErrorEvent(modalError);
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
   *
   * Attempts connection up to 3 times with 1 second delay between attempts.
   * This provides resilience against temporary network issues or timing problems.
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
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
      }
    }
  }

  /**
   * Disconnect from the transport with error handling
   */
  async disconnect(): Promise<void> {
    try {
      await this.disconnectInternal();
    } catch (_error) {
      // Create transport error using ErrorFactory
      const modalError = ErrorFactory.transportDisconnected('Failed to disconnect from transport', 'manual');

      // Log the error
      this.logError('Disconnect failed', modalError);

      // Emit error event synchronously to avoid unhandled rejections
      try {
        this.emitErrorEvent(modalError);
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
   * Validates connection state and implements retry logic (2 attempts, 500ms delay).
   * Data is passed to `sendInternal()` which subclasses must implement.
   *
   * @param {unknown} data - Data to send (will be serialized by transport)
   * @throws {ModalError} Not connected or send failed after retries
   *
   * @example
   * ```typescript
   * // Send JSON-RPC request
   * await transport.send({
   *   jsonrpc: '2.0',
   *   method: 'eth_accounts',
   *   params: [],
   *   id: 1
   * });
   *
   * // Send custom message
   * await transport.send({
   *   type: 'WALLET_CONNECT',
   *   payload: { chainId: '0x1' }
   * });
   * ```
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
          await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
        }
      }
    } catch (_error) {
      // Create transport error using ErrorFactory
      const modalError = ErrorFactory.messageFailed('Failed to send message through transport', { data });

      // Log the error
      this.logError('Send failed', modalError, { data });

      // Emit error event synchronously to avoid unhandled rejections
      try {
        this.emitErrorEvent(modalError);
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
   * Uses EventTarget internally for standards-compliant event handling.
   * Events are automatically cleaned up on transport destruction.
   *
   * @param {string} event - Event name to subscribe to
   * @param {(event: TransportEvent) => void} listener - Callback function for the event
   * @returns {() => void} Unsubscribe function - Call to remove subscription
   *
   * @example
   * ```typescript
   * // Subscribe to connection events
   * const unsubscribe = transport.on('connected', (event) => {
   *   console.log('Transport connected');
   * });
   *
   * // Subscribe to messages
   * transport.on('message', (event) => {
   *   console.log('Received:', event.data);
   * });
   *
   * // Subscribe to errors
   * transport.on('error', (event) => {
   *   console.error('Transport error:', event.error);
   * });
   *
   * // Cleanup when done
   * unsubscribe();
   * ```
   */
  on(event: string, listener: (event: TransportEvent) => void): () => void {
    // Create a wrapper listener for EventTarget
    const wrappedListener = (e: Event) => {
      const customEvent = e as CustomEvent<TransportEvent>;
      listener(customEvent.detail);
    };

    // Add event listener
    this.eventTarget.addEventListener(event, wrappedListener);

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
    // Get the event's subscriptions
    const eventSubscriptions = this.subscriptions.get(event);
    if (!eventSubscriptions) return;

    // Find the specific wrapped listener
    const wrappedListener = eventSubscriptions.get(listener);
    if (!wrappedListener) return;

    // Remove event listener
    this.eventTarget.removeEventListener(event, wrappedListener);
    eventSubscriptions.delete(listener);

    // Clean up empty maps
    if (eventSubscriptions.size === 0) {
      this.subscriptions.delete(event);
    }
  }

  /**
   * Emit a transport event
   *
   * Used by transport implementations to notify subscribers of state changes,
   * messages, and errors. Events are dispatched synchronously.
   *
   * @param {TransportEvent} event - Event to emit with type and data
   * @protected
   *
   * @example
   * ```typescript
   * // In transport implementation
   * this.emit({ type: 'connected' });
   * this.emit({ type: 'message', data: parsedData });
   * this.emit({ type: 'error', error: modalError });
   * this.emit({ type: 'disconnected', reason: 'User closed popup' });
   * ```
   */
  protected emit(event: TransportEvent): void {
    this.eventTarget.dispatchEvent(new CustomEvent(event.type, { detail: event }));
  }

  /**
   * Get whether the transport is connected
   * @returns {boolean} True if connected, false otherwise
   */
  isConnected(): boolean {
    return this.connected;
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
   * @param {string} message - Error message
   * @param {unknown} error - Error object or value
   * @param {Record<string, unknown>} [data] - Additional context data
   * @protected
   */
  protected logError(message: string, error: unknown, data?: Record<string, unknown>): void {
    // Convert error to a string or object to ensure it can be included in the data object
    const errorData =
      error instanceof Error ? { message: error.message, name: error.name } : { error: String(error) };

    this.logger.error(message, { ...errorData, ...(data || {}) });
  }

  /**
   * Get a user-friendly error message
   *
   * @param {unknown} error - Error object or value
   * @returns {string} User-friendly error message
   * @protected
   */
  protected getErrorMessage(error: unknown): string {
    return this.errorHandler.getUserMessage(error);
  }

  /**
   * Emit an error event through the event emitter
   *
   * @param {Error} error - Error object to emit
   * @protected
   */
  protected emitErrorEvent(error: Error | ModalError): void {
    // Convert to ModalError if not already
    const modalError = isModalError(error) ? error : ErrorFactory.transportError(error.message);

    this.emit({
      type: 'error',
      error: modalError,
    });
  }

  /**
   * Clears all event listeners registered with this transport
   */
  protected clearAllEventListeners(): void {
    // Create a copy of the keys to avoid modification during iteration
    const eventTypes = Array.from(this.subscriptions.keys());

    for (const eventType of eventTypes) {
      const listeners = this.subscriptions.get(eventType);
      if (listeners) {
        // Create a copy of the keys to avoid modification during iteration
        const listenerFunctions = Array.from(listeners.keys());

        for (const listener of listenerFunctions) {
          this.off(eventType, listener);
        }
      }
    }

    // Verify that all subscriptions were cleared
    if (this.subscriptions.size > 0) {
      this.log('warn', `Failed to clear all subscriptions, ${this.subscriptions.size} remaining`);
    }
  }

  /**
   * Destroys the transport, cleaning up all resources
   *
   * This should be called when the transport is no longer needed.
   * Ensures proper cleanup of connections, listeners, and resources.
   * Safe to call multiple times.
   *
   * @throws {ModalError} Cleanup failed (non-fatal, resources still released)
   *
   * @example
   * ```typescript
   * // Cleanup transport
   * try {
   *   await transport.destroy();
   * } catch (error) {
   *   // Log but continue - transport is unusable regardless
   *   console.error('Transport cleanup error:', error);
   * }
   * ```
   */
  public async destroy(): Promise<void> {
    try {
      // Ensure disconnected first
      if (this.isConnected()) {
        try {
          await this.disconnect();
        } catch (error) {
          // Log but continue with cleanup
          this.logError('Error disconnecting during destroy', error);
        }
      }

      // Clean up all event listeners
      this.clearAllEventListeners();

      // Emit disconnected event to notify subscribers that the transport has been destroyed
      this.emit({ type: 'disconnected', reason: 'Transport destroyed' });

      this.log('debug', 'Transport destroyed');
    } catch (error) {
      this.logError('Error during transport destroy', error);

      // Create and emit error event using ErrorFactory
      const modalError = ErrorFactory.cleanupFailed('Failed to properly destroy transport', 'destroy');

      // Emit error event synchronously to avoid unhandled rejections
      try {
        this.emitErrorEvent(modalError);
      } catch (emitError) {
        this.logError('Failed to emit error event during destroy', emitError);
      }

      throw modalError;
    }
  }

  // ========================================
  // Origin Validation Methods
  // ========================================

  /**
   * Get the transport type identifier
   *
   * Used for error messages and logging. Subclasses must implement this
   * to provide a descriptive transport type name.
   *
   * @returns Transport type identifier (e.g., 'popup', 'chrome-extension', 'websocket')
   * @protected
   * @abstract
   *
   * @example
   * ```typescript
   * class PopupTransport extends AbstractTransport {
   *   protected getTransportType(): string {
   *     return 'popup';
   *   }
   * }
   * ```
   */
  protected abstract getTransportType(): string;

  /**
   * Check if this transport uses browser-validated origins
   *
   * PostMessage-based transports (popup, cross-window) receive origins
   * directly from the browser via MessageEvent.origin, which is the most
   * trusted source. Other transports may need to rely on dApp origin.
   *
   * @returns True if transport uses browser-validated origins
   * @protected
   *
   * @example
   * ```typescript
   * // PostMessage transports
   * protected isBrowserValidatedOrigin(): boolean {
   *   return true; // MessageEvent.origin from browser
   * }
   *
   * // Extension/WebSocket transports
   * protected isBrowserValidatedOrigin(): boolean {
   *   return false; // Uses window.location.origin
   * }
   * ```
   */
  protected isBrowserValidatedOrigin(): boolean {
    // Default: Not browser-validated (extension, websocket, etc.)
    // PostMessage transports should override to return true
    return false;
  }

  /**
   * Capture browser-validated origin from MessageEvent
   *
   * Should be called by postMessage-based transports when they receive
   * a MessageEvent to store the browser-validated origin for validation.
   *
   * @param origin - Origin from MessageEvent.origin
   * @protected
   *
   * @example
   * ```typescript
   * // In postMessage handler
   * window.addEventListener('message', (event: MessageEvent) => {
   *   this.captureOrigin(event.origin);
   *   // ... process message
   * });
   * ```
   */
  protected captureOrigin(origin: string): void {
    this.capturedOrigin = origin;
  }

  /**
   * Get the trusted origin for validation
   *
   * Returns either the browser-validated origin (postMessage) or
   * dApp origin (extension, websocket) depending on transport type.
   *
   * @returns The trusted origin or undefined if not available (SSR)
   * @protected
   */
  protected getTrustedOrigin(): string | undefined {
    // PostMessage transports: use captured browser-validated origin
    if (this.isBrowserValidatedOrigin() && this.capturedOrigin) {
      return this.capturedOrigin;
    }

    // Non-postMessage transports: use dApp origin
    return OriginValidator.getDAppOrigin();
  }

  /**
   * Validate message origin against trusted origin
   *
   * Validates that _context.origin in the message matches the trusted origin.
   * The trusted origin depends on transport type:
   * - PostMessage transports: Browser-validated MessageEvent.origin
   * - Other transports: dApp's window.location.origin
   *
   * @param message - Message to validate
   * @param options - Additional validation options
   * @returns Validation result with error if validation fails
   * @protected
   *
   * @example
   * ```typescript
   * // In message handler
   * const validation = this.validateOrigin(message);
   * if (!validation.valid) {
   *   this.log('error', 'Origin validation failed', validation.context);
   *   this.emit({ type: 'error', error: validation.error });
   *   return; // Reject message
   * }
   * // ... process valid message
   * ```
   */
  protected validateOrigin(
    message: unknown,
    options?: {
      requireOriginField?: boolean;
      additionalContext?: Record<string, unknown>;
    },
  ): OriginValidationResult {
    const trustedOrigin = this.getTrustedOrigin();

    return OriginValidator.validateContextOrigin(message, trustedOrigin, {
      transportType: this.getTransportType(),
      isBrowserValidated: this.isBrowserValidatedOrigin(),
      ...(options?.requireOriginField !== undefined && {
        requireOriginField: options.requireOriginField,
      }),
      ...(options?.additionalContext !== undefined && {
        additionalContext: options.additionalContext,
      }),
    });
  }

  /**
   * Validate wrapped message origin (for CrossWindowTransport)
   *
   * Validates the origin field in wrapped messages. This is used by
   * CrossWindowTransport which wraps messages with metadata including origin.
   *
   * @param wrappedMessage - Wrapped message to validate
   * @param options - Validation options
   * @returns Validation result with error if validation fails
   * @protected
   *
   * @example
   * ```typescript
   * // Validate wrapped message
   * const validation = this.validateWrappedOrigin(wrappedMessage, {
   *   requireOriginField: true // Strict validation
   * });
   * if (!validation.valid) {
   *   this.emit({ type: 'error', error: validation.error });
   *   return;
   * }
   * ```
   */
  protected validateWrappedOrigin(
    wrappedMessage: unknown,
    options?: {
      requireOriginField?: boolean;
      additionalContext?: Record<string, unknown>;
    },
  ): OriginValidationResult {
    const trustedOrigin = this.getTrustedOrigin();

    return OriginValidator.validateWrappedOrigin(wrappedMessage, trustedOrigin, {
      transportType: this.getTransportType(),
      isBrowserValidated: this.isBrowserValidatedOrigin(),
      requireOriginField: options?.requireOriginField ?? false,
      ...(options?.additionalContext !== undefined && {
        additionalContext: options.additionalContext,
      }),
    });
  }

  /**
   * Get message context for logging
   *
   * Extracts relevant context from a message for logging purposes.
   * Default implementation provides basic message type and structure info.
   * Subclasses can override to provide transport-specific context.
   *
   * @param message - Message to extract context from
   * @returns Context object for logging
   * @protected
   *
   * @example
   * ```typescript
   * const context = this.getMessageContext(message);
   * this.log('debug', 'Processing message', context);
   * ```
   */
  protected getMessageContext(message: unknown): Record<string, unknown> {
    return {
      hasContext: message && typeof message === 'object' && '_context' in message,
      messageType: typeof message,
      transportType: this.getTransportType(),
    };
  }
}
