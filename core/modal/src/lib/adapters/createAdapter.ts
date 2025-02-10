import type { AdapterConfig, Adapter, AztecAdapterOptions } from './types.js';
import { AdapterType } from './types.js';
import { WalletMeshAztecAdapter } from './WalletMeshAztecAdapter.js';
import { WalletError } from '../client/types.js';

/**
 * Creates an adapter instance based on configuration
 * @param config - The adapter configuration
 * @returns The created adapter
 * @throws Will throw an error if the adapter type is unsupported
 */
export function createAdapter(config: AdapterConfig): Adapter {
  switch (config.type) {
    case AdapterType.WalletMeshAztec:
      return new WalletMeshAztecAdapter(config.options as AztecAdapterOptions);
    default:
      throw new WalletError(`Unsupported adapter type: ${config.type}`, 'adapter');
  }
}
