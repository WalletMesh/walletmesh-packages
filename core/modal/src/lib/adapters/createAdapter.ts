import type { Adapter, WalletInfo } from '../../types.js';
import { AdapterType } from '../../types.js';
import { WalletMeshAztecAdapter } from './WalletMeshAztecAdapter.js';

/**
 * Creates an adapter based on the wallet's adapter type.
 * @param wallet - The wallet information.
 * @returns The created adapter.
 * @throws Will throw an error if the adapter type is unsupported.
 */
export function createAdapter(wallet: WalletInfo): Adapter {
  switch (wallet.adapterType) {
    case AdapterType.WalletMeshAztecAdapter:
      return new WalletMeshAztecAdapter(wallet.adapterOptions);
    default:
      throw new Error(`Unsupported adapter type: ${wallet.adapterType}`);
  }
}
