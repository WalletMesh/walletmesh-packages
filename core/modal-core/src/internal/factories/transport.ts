/**
 * Transport factory
 *
 * Factory module for creating transport instances with proper validation
 * and dependency injection. Centralizes transport creation logic and
 * ensures consistent configuration across the application.
 *
 * ## Supported Transports
 *
 * - **Popup**: Opens a new window for wallet communication
 * - **Extension**: Communicates with Chrome extensions
 * - **Future**: WebSocket, WebRTC, iframe (extensible design)
 *
 * ## Design Pattern
 *
 * Uses the Factory pattern to:
 * - Validate configuration with Zod schemas
 * - Create appropriate transport instances
 * - Inject required dependencies (logger, error handler)
 * - Provide consistent error handling
 *
 * @module factories/transport
 * @internal
 */

import { ZodError } from 'zod';
import { chromeExtensionConfigSchema, popupConfigSchema } from '../../schemas/index.js';
import {
  type AnyTransportConfig,
  type ChromeExtensionConfig,
  type PopupConfig,
  type Transport,
  TransportType,
} from '../../types.js';
import { ErrorFactory } from '../core/errors/errorFactory.js';
import { createComponentServices } from '../core/factories/serviceFactory.js';
import { ChromeExtensionTransport, PopupWindowTransport } from '../transports/index.js';

/**
 * Create a transport with the specified type and configuration
 *
 * Factory function that creates and configures transport instances.
 * Validates configuration using Zod schemas and injects required services.
 *
 * @param {TransportType} type - The type of transport to create
 * @param {AnyTransportConfig} [config={}] - Configuration for the transport
 * @returns {Transport} A configured transport instance ready for use
 * @throws {ModalError} If configuration validation fails or transport type is unsupported
 *
 * @example
 * ```typescript
 * // Create a popup transport
 * const popupTransport = createTransport(TransportType.Popup, {
 *   url: 'https://wallet.example.com/connect',
 *   width: 450,
 *   height: 700,
 *   target: '_blank'
 * });
 *
 * // Create a Chrome extension transport
 * const extensionTransport = createTransport(TransportType.Extension, {
 *   extensionId: 'abcdefghijklmnopqrstuvwxyz',
 *   timeout: 60000
 * });
 *
 * // Use the transport
 * await popupTransport.connect();
 * popupTransport.on('message', handleMessage);
 * await popupTransport.send({ method: 'eth_accounts' });
 * ```
 *
 * @public
 */
export function createTransport(type: TransportType, config: AnyTransportConfig = {}): Transport {
  // Create services using service factory for memory efficiency
  const services = createComponentServices(`Transport-${type}`);
  const { logger, errorHandler } = services;

  try {
    switch (type) {
      case TransportType.Popup: {
        (logger.info || logger.debug || console.info).call(logger, 'TransportFactory: creating Popup transport', { type });
        // Validate and create popup transport
        const validConfig = popupConfigSchema.parse(config) as PopupConfig;
        return new PopupWindowTransport(validConfig, logger, errorHandler);
      }

      case TransportType.Extension: {
        (logger.info || logger.debug || console.info).call(logger, 'TransportFactory: creating Extension transport', { type, hasExtensionId: !!(config as ChromeExtensionConfig).extensionId });
        // Validate and create extension transport
        const validConfig = chromeExtensionConfigSchema.parse(config) as ChromeExtensionConfig;

        if (!validConfig.extensionId) {
          throw ErrorFactory.configurationError('extensionId is required for Chrome extension transport', {
            type,
          });
        }

        const transport = new ChromeExtensionTransport(validConfig, logger, errorHandler);
        (logger.info || logger.debug || console.info).call(logger, 'TransportFactory: Extension transport created');
        return transport;
      }

      default:
        throw ErrorFactory.invalidTransport(`Unsupported transport type: ${type}`, type);
    }
  } catch (error) {
    // Wrap Zod validation errors in a cleaner message
    if (error instanceof ZodError) {
      throw ErrorFactory.configurationError(`Invalid transport configuration for ${type.toLowerCase()}`, {
        type,
        validationErrors: error.errors,
      });
    }
    throw error;
  }
}
