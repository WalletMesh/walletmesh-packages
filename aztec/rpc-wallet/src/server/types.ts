import type { Wallet } from '@aztec/aztec.js/wallet';
import type { JSONRPCContext } from '@walletmesh/jsonrpc';
import type { AztecWalletEventMap, AztecWalletMethodMap } from '../types.js';

/**
 * Defines the context object that is passed to all Aztec wallet JSON-RPC method handlers.
 * This context provides handlers with the necessary dependencies to perform their operations.
 * It extends the base {@link JSONRPCContext} with Aztec-specific instances.
 *
 * @property wallet - An instance of {@link Wallet} from `aztec.js`,
 *                    representing the user's accounts and signing capabilities.
 */
export interface AztecWalletHandlerContext extends JSONRPCContext {
  wallet: Wallet;
  notify<M extends keyof (AztecWalletMethodMap & AztecWalletEventMap)>(
    method: M,
    params: (AztecWalletMethodMap & AztecWalletEventMap)[M]['params'],
  ): Promise<void>;
}
