import type { AdapterConfig, Adapter, AztecAdapterOptions } from './types.js';
import { AdapterType } from './types.js';
import { WalletMeshAztecAdapter } from './WalletMeshAztecAdapter.js';
import { ObsidionAztecAdapter } from './ObsidionAztecAdapter.js';
import { WalletError } from '../client/types.js';

/**
 * Creates an adapter instance based on configuration
 * @param config - The adapter configuration
 * @returns The created adapter
 * @throws Will throw an error if the adapter type is unsupported
 */
export function createAdapter(config: AdapterConfig): Adapter {
  console.log('[createAdapter] Creating adapter with config:', config);

  switch (config.type) {
    case AdapterType.WalletMeshAztec: {
      console.log('[createAdapter] Creating WalletMeshAztecAdapter with options:', config.options);
      const adapter = new WalletMeshAztecAdapter(config.options as AztecAdapterOptions);
      console.log('[createAdapter] Created adapter:', adapter);
      return adapter;
    }
    case AdapterType.ObsidionAztec: {
      console.log('[createAdapter] Creating ObsidionAztecAdapter with options:', config.options);
      const adapter = new ObsidionAztecAdapter(config.options as AztecAdapterOptions);
      console.log('[createAdapter] Created adapter:', adapter);
      return adapter;
    }
    default:
      console.error('[createAdapter] Unsupported adapter type:', config.type);
      throw new WalletError(`Unsupported adapter type: ${config.type}`, 'adapter');
  }
}
