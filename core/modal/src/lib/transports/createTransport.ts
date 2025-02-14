import { TransportType, type TransportConfig, type Transport } from './types.js';
import { PostMessageTransport } from './PostMessageTransport.js';
import { NullTransport } from './NullTransport.js';
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
 *   type: TransportType.PostMessage,
 *   options: {
 *     origin: 'https://wallet.example.com'
 *   }
 * });
 *
 * // Create Null transport for testing
 * const nullTransport = createTransport({
 *   type: TransportType.Null
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
export function createTransport(config: TransportConfig): Transport {
  switch (config.type) {
    case TransportType.PostMessage:
      return new PostMessageTransport(config.options);
    case TransportType.WebSocket:
      throw new WalletError('WebSocket transport not implemented', 'transport');
    case TransportType.Extension:
      throw new WalletError('Extension transport not implemented', 'transport');
    case TransportType.Null:
      return new NullTransport();
    default:
      throw new WalletError(`Unsupported transport type: ${config.type}`, 'transport');
  }
}
