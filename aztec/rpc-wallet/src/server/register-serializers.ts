import { createLogger } from '@aztec/foundation/log';
import type { JSONRPCNode } from '@walletmesh/jsonrpc';
import { SERIALIZERS } from '../serializers.js';
import type { AztecWalletEventMap, AztecWalletMethodMap } from '../types.js';
import type { AztecWalletHandlerContext } from './types.js';

const logger = createLogger('aztec-rpc-wallet:wallet:serializers');

/**
 * Registers the {@link AztecWalletSerializer} for all relevant Aztec JSON-RPC methods
 * on a given {@link JSONRPCNode} instance.
 *
 * This function is typically called on the wallet-side (e.g., within
 * `createAztecWalletNode`) to equip the node with the necessary serialization
 * capabilities for handling Aztec methods.
 *
 * It iterates through a predefined list of Aztec methods and associates each
 * with the `AztecWalletSerializer`.
 *
 * @param node - The {@link JSONRPCNode} instance on which to register the serializers.
 *               This node should be typed with {@link AztecWalletMethodMap}.
 *
 * @see {@link createAztecWalletNode} where this function is used.
 * @see {@link AztecWalletSerializer} which provides the serialization logic.
 */
export function registerAztecWalletSerializers(
  node: JSONRPCNode<AztecWalletMethodMap, AztecWalletEventMap, AztecWalletHandlerContext>,
) {
  for (const method of Object.keys(SERIALIZERS)) {
    if (!SERIALIZERS[method]) {
      // This should never trigger
      logger.error(`No serializer found for method: ${method}, skipping registration.`);
      throw new Error(`No serializer found for method: ${method}`);
    }
    node.registerSerializer(method as keyof AztecWalletMethodMap, SERIALIZERS[method]);
  }
}
