import type { WalletInfo } from '../../types.js';
import type { Adapter } from './types.js';
import { AdapterType } from './types.js';
import { WalletMeshAztecAdapter } from './WalletMeshAztecAdapter.js';

/**
 * Creates an adapter based on the wallet's adapter type.
 * @param wallet - The wallet information.
 * @returns The created adapter.
 * @throws Will throw an error if the adapter type is unsupported.
 */
export function createAdapter(wallet: WalletInfo): Adapter {
  switch (wallet.adapter.type) {
    case AdapterType.WalletMeshAztec:
      return new WalletMeshAztecAdapter(wallet.adapter.options);
    default:
      throw new Error(`Unsupported adapter type: ${wallet.adapter.type}`);
  }
}
