/**
 * Transport layer types
 *
 * Defines internal types and interfaces for transport layer functionality.
 * Provides additional testing and internal configuration interfaces.
 *
 * ## Transport Events
 *
 * The transport layer emits four types of events:
 * - **Connected**: Transport successfully established connection
 * - **Disconnected**: Transport connection terminated
 * - **Message**: Data received through transport
 * - **Error**: Transport error occurred
 *
 * ## Testing Support
 *
 * The `TestableTransport` and `InternalTransport` interfaces provide
 * access to internal state for testing without polluting the public API.
 * These properties are prefixed with underscore to indicate internal use.
 *
 * @module transports/types
 * @internal
 */

import type { Transport } from '../../types.js';

/**
 * Enum for transport event types
 *
 * Defines the standard events that all transports must support.
 * These events enable consistent event handling across transport types.
 *
 * @example
 * ```typescript
 * transport.on(TransportEventType.Message, (event) => {
 *   handleIncomingMessage(event.data);
 * });
 *
 * transport.on(TransportEventType.Error, (event) => {
 *   console.error('Transport error:', event.error);
 *   attemptReconnection();
 * });
 * ```
 *
 * @enum {string}
 */
export enum TransportEventType {
  /**
   * Transport connected successfully
   * @type {string}
   */
  Connected = 'connected',

  /**
   * Transport disconnected
   * @type {string}
   */
  Disconnected = 'disconnected',

  /**
   * Message received through transport
   * @type {string}
   */
  Message = 'message',

  /**
   * Error occurred in transport
   * @type {string}
   */
  Error = 'error',
}

/**
 * Extended Transport interface with testing properties
 *
 * Provides optional internal properties for testing and debugging
 * transport implementations without affecting the public API.
 *
 * ## Usage in Tests
 *
 * ```typescript
 * // In test files
 * const transport = createTransport(TransportType.Popup, config);
 * const testableTransport = transport as TestableTransport;
 *
 * expect(testableTransport.transportType).toBe('popup');
 * expect(testableTransport.transportConfig).toMatchObject({ url: 'https://...' });
 * ```
 *
 * @interface TestableTransport
 * @internal
 */
export interface TestableTransport {
  /**
   * Transport type (for testing)
   * @type {string}
   * @optional
   */
  transportType?: string;

  /**
   * Transport configuration (for testing)
   * @type {Record<string, unknown>}
   * @optional
   */
  transportConfig?: Record<string, unknown>;
}

/**
 * Internal transport interface
 *
 * Extends the public Transport interface with internal properties
 * required for testing and debugging. These properties are not
 * exposed in the public API.
 *
 * ## Implementation Note
 *
 * All transport implementations should set these properties in their
 * constructors for debugging and testing purposes:
 *
 * ```typescript
 * class MyTransport extends AbstractTransport implements InternalTransport {
 *   transportType = 'my-transport';
 *   transportConfig: Record<string, unknown>;
 *
 *   constructor(config: MyTransportConfig) {
 *     super(config);
 *     this.transportConfig = { ...config };
 *   }
 * }
 * ```
 *
 * @interface InternalTransport
 * @extends {Transport}
 * @internal
 */
export interface InternalTransport extends Transport {
  /**
   * Transport type (for internal use and testing)
   * @type {string}
   * @internal
   */
  transportType: string;

  /**
   * Transport configuration (for internal use and testing)
   * @type {Record<string, unknown>}
   * @internal
   */
  transportConfig: Record<string, unknown>;
}
