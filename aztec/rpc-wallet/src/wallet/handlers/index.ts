import type { AccountWallet, PXE } from '@aztec/aztec.js';
import type { JSONRPCContext, JSONRPCParams } from '@walletmesh/jsonrpc';
import type { ContractArtifactCache } from '../../contractArtifactCache.js';
import type { AztecWalletMethodMap } from '../../types.js';

import { createAccountHandlers } from './account.js';
import { createContractHandlers } from './contract.js';
import { createContractInteractionHandlers } from './contract-interaction.js';
import { createEventHandlers } from './event.js';
import { createNodeHandlers } from './node.js';
import { createSenderHandlers } from './senders.js';
import { createTransactionHandlers } from './transaction.js';

/**
 * Defines the context object that is passed to all Aztec wallet JSON-RPC method handlers.
 * This context provides handlers with the necessary dependencies to perform their operations.
 * It extends the base {@link JSONRPCContext} with Aztec-specific instances.
 *
 * @property wallet - An instance of {@link AccountWallet} from `aztec.js`,
 *                    representing the user's account and signing capabilities.
 * @property pxe - An instance of {@link PXE} (Private Execution Environment) client
 *                 from `aztec.js`, used for interacting with the Aztec network.
 * @property cache - An instance of {@link ContractArtifactCache} used for caching
 *                   contract artifacts to optimize performance.
 */
export interface AztecHandlerContext extends JSONRPCContext {
  wallet: AccountWallet;
  pxe: PXE;
  cache: ContractArtifactCache;
}

/**
 * Defines the generic signature for an Aztec wallet JSON-RPC method handler function.
 *
 * @template M - A key from {@link AztecWalletMethodMap}, representing the specific Aztec method being handled.
 * @param context - The {@link AztecHandlerContext} providing access to wallet, PXE, and cache.
 * @param params - The parameters for the RPC method, typed as {@link JSONRPCParams} (typically an array or object).
 *                 The specific structure of `params` is defined by `AztecWalletMethodMap[M]['params']`.
 * @returns A promise that resolves to the result of the RPC method, typed according to `AztecWalletMethodMap[M]['result']`.
 */
export type AztecHandler<M extends keyof AztecWalletMethodMap> = (
  context: AztecHandlerContext,
  params: AztecWalletMethodMap[M]['params'], // More specific than JSONRPCParams
) => Promise<AztecWalletMethodMap[M]['result']>;

/**
 * Creates and aggregates all Aztec JSON-RPC method handlers.
 *
 * This factory function consolidates handlers from various specialized modules
 * (account, transaction, contract, etc.) into a single object. This object
 * maps method names (as defined in {@link AztecWalletMethodMap}) to their
 * respective handler functions.
 *
 * The resulting map of handlers is typically registered with a {@link JSONRPCNode}
 * instance on the wallet-side.
 *
 * @returns An object where keys are Aztec method names (e.g., "aztec_getAddress")
 *          and values are the corresponding handler functions. Each handler
 *          conforms to the {@link AztecHandler} type.
 *
 * @see {@link createAccountHandlers}
 * @see {@link createTransactionHandlers}
 * @see {@link createContractHandlers}
 * @see {@link createContractInteractionHandlers}
 * @see {@link createSenderHandlers}
 * @see {@link createEventHandlers}
 * @see {@link createNodeHandlers}
 * @see {@link createAztecWalletNode} where these handlers are typically used.
 */
export function createAztecHandlers() {
  return {
    // Note: The individual createXYZHandlers() functions return objects whose methods
    // might have params typed as general JSONRPCParams or a more specific tuple.
    // The createAztecWalletNode function correctly casts these to the specific
    // handler signatures expected by JSONRPCNode.registerMethod, using AztecWalletMethodMap.
    ...createAccountHandlers(),
    ...createTransactionHandlers(),
    ...createContractHandlers(),
    ...createContractInteractionHandlers(),
    ...createSenderHandlers(),
    ...createEventHandlers(),
    ...createNodeHandlers(),
  };
}
