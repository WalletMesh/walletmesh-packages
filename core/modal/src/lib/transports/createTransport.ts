import type { TransportConfig, Transport, BaseTransportConfig } from './types.js';
import { TransportTypes } from './types.js';
import { PostMessageTransport } from './PostMessageTransport.js';
import { NullTransport } from './NullTransport.js';
import { ChromeExtensionTransport } from './chrome/ChromeExtensionTransport.js';
import type { PostMessageTransportConfig } from './postmessage/types.js';
import type { ChromeTransportConfig } from './chrome/types.js';
import { WalletError } from '../client/types.js';

/**
 * Factory function for creating transport instances based on configuration.
 *
 * Instantiates the appropriate transport implementation based on the
 * provided configuration type. Supports different transport mechanisms
 * for wallet communication.
 *
 * @param config - Transport configuration object
 * @returns Initialized transport instance
 * @throws {WalletError} If transport type is unsupported or not implemented
 *
 * @example
 * ```typescript
 * // Create PostMessage transport
 * const postMessageTransport = createTransport({
 *   type: TransportTypes.POSTMESSAGE,
 *   options: {
 *     origin: 'https://wallet.example.com'
 *   }
 * });
 *
 * // Create Null transport for testing
 * const nullTransport = createTransport({
 *   type: TransportTypes.NULL
 * });
 * ```
 *
 * @remarks
 * Currently supported transport types:
 * - PostMessage: For window/iframe communication
 * - Null: For testing and development
 *
 * Planned but not yet implemented:
 * - WebSocket: For remote wallet connections
 * - Extension: For browser extension wallets
 *
 * When requesting an unimplemented transport, the function
 * will throw a WalletError with a descriptive message.
 */
export function createTransport(config: TransportConfig<BaseTransportConfig>): Transport {
  switch (config.type) {
    case TransportTypes.POSTMESSAGE:
      if (!('origin' in config.config)) {
        throw new WalletError('PostMessage transport requires origin in config', 'transport');
      }
      return new PostMessageTransport(config.config as PostMessageTransportConfig);
    case TransportTypes.CHROME_EXTENSION:
      if (!config.config || !('extensionId' in config.config) || !config.config.extensionId) {
        throw new WalletError('Invalid Chrome extension transport configuration', 'transport');
      }
      return new ChromeExtensionTransport(config.config as ChromeTransportConfig);
    case TransportTypes.WEBSOCKET:
      throw new WalletError('WebSocket transport not implemented', 'transport');
    case TransportTypes.NULL:
      return new NullTransport();
    default:
      throw new WalletError(`Unsupported transport type: ${config.type}`, 'transport');
  }
}
