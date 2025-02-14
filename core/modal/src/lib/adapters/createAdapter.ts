import type { AdapterConfig, Adapter, AztecAdapterOptions } from './types.js';
import { AdapterType } from './types.js';
import { WalletMeshAztecAdapter } from './WalletMeshAztecAdapter.js';
import { ObsidionAztecAdapter } from './ObsidionAztecAdapter.js';
import { WalletError } from '../client/types.js';

/**
 * Factory function that creates an appropriate wallet adapter instance based on configuration.
 *
 * Instantiates protocol-specific adapters that handle the communication between
 * the dApp and different wallet implementations. The factory determines which adapter
 * to create based on the provided configuration type.
 *
 * @param config - The adapter configuration object
 * @returns An initialized adapter instance that implements the Adapter interface
 * @throws {WalletError} If the specified adapter type is not supported
 *
 * @example
 * ```typescript
 * // Create a WalletMesh Aztec adapter
 * const aztecAdapter = createAdapter({
 *   type: AdapterType.WalletMeshAztec,
 *   options: {
 *     chainId: 'aztec:testnet',
 *     rpcUrl: 'https://api.aztec.network/testnet',
 *     networkId: '11155111'
 *   }
 * });
 *
 * // Create an Obsidion Aztec adapter
 * const obsidionAdapter = createAdapter({
 *   type: AdapterType.ObsidionAztec,
 *   options: {
 *     chainId: 'aztec:mainnet'
 *   }
 * });
 * ```
 *
 * @remarks
 * Currently supported adapter types:
 * - WalletMeshAztec: Standard adapter for Aztec protocol wallets
 * - ObsidionAztec: Specialized adapter for Obsidion wallet implementation
 *
 * Each adapter type may require specific configuration options as defined
 * in their respective interfaces (e.g., AztecAdapterOptions).
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
