import { TransportType, type TransportConfig, type Transport } from './types.js';
import { PostMessageTransport } from './PostMessageTransport.js';
import { WalletError } from '../client/types.js';

/**
 * Creates a transport instance based on configuration
 */
export function createTransport(config: TransportConfig): Transport {
  switch (config.type) {
    case TransportType.PostMessage:
      return new PostMessageTransport(config.options);
    case TransportType.WebSocket:
      throw new WalletError(
        'WebSocket transport not implemented',
        'transport'
      );
    case TransportType.Extension:
      throw new WalletError(
        'Extension transport not implemented',
        'transport'
      );
    default:
      throw new WalletError(
        `Unsupported transport type: ${config.type}`,
        'transport'
      );
  }
}
