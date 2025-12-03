/**
 * Transport implementations and utilities for the modal system
 *
 * This module provides transport-related interfaces, factories, and utilities
 * for communication between the modal and wallets. It includes implementations
 * for different transport mechanisms like WebSockets, popup windows, and extensions.
 *
 * @packageDocumentation
 */

import { ErrorFactory } from '../../internal/core/errors/errorFactory.js';
import { createTransport as createTransportInstance } from '../../internal/factories/transport.js';
import {
  baseTransportConfigSchema,
  chromeExtensionConfigSchema,
  popupConfigSchema,
} from '../../schemas/index.js';
import {
  type ChromeExtensionConfig,
  type PopupConfig,
  type Transport,
  type TransportConfig,
  type TransportConnectedEvent,
  type TransportDisconnectedEvent,
  type TransportErrorEvent,
  type TransportEvent,
  type TransportMessageEvent,
  TransportType,
} from '../../types.js';

/**
 * Re-export transport types and interfaces
 * @public
 */
export type {
  Transport,
  TransportConfig,
  PopupConfig,
  ChromeExtensionConfig,
  TransportEvent,
  TransportMessageEvent,
  TransportConnectedEvent,
  TransportDisconnectedEvent,
  TransportErrorEvent,
};

/**
 * Re-export transport enums
 * @public
 */
export { TransportType };

/**
 * Transport configuration
 * All transports have these base settings by default
 * @public
 */
export const TRANSPORT_CONFIG: TransportConfig = {
  timeout: 30000, // 30 seconds
  reconnect: true,
  reconnectInterval: 5000, // 5 seconds
};

/**
 * Create a transport instance
 *
 * @param {TransportType} type - Type of transport to create
 * @param {T} [config] - Transport configuration
 * @returns A transport instance
 * @throws {Error} If configuration validation fails
 *
 * @example
 * ```typescript
 * // Create a Popup transport
 * const transport = createTransport(TransportType.Popup, {
 *   url: 'https://example.com/wallet'
 * });
 *
 * // Connect to the transport
 * await transport.connect();
 *
 * // Send data
 * await transport.send({ method: 'eth_requestAccounts' });
 *
 * // Listen for responses
 * transport.on('message', (event) => {
 *   console.log('Received message:', event.data);
 * });
 * ```
 *
 * @public
 */
export function createTransport<T extends TransportConfig>(type: TransportType, config?: T): Transport {
  // Validate configuration at API boundary
  if (config) {
    try {
      switch (type) {
        case TransportType.Popup:
          popupConfigSchema.parse(config);
          break;
        case TransportType.Extension:
          chromeExtensionConfigSchema.parse(config);
          break;
        default:
          baseTransportConfigSchema.parse(config);
          break;
      }
    } catch (error) {
      throw ErrorFactory.invalidTransport(
        `Invalid transport configuration for ${type}: ${error instanceof Error ? error.message : 'Unknown validation error'}`,
        type,
      );
    }
  }

  return createTransportInstance(type, config);
}
