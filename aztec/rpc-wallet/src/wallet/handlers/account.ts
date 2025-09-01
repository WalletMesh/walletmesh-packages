import { createLogger } from '@aztec/foundation/log';
import type { AztecWalletMethodMap } from '../../types.js';
import type { AztecHandlerContext } from './index.js';

const logger = createLogger('aztec-rpc-wallet:account');

/**
 * Creates handlers for account-related Aztec wallet JSON-RPC methods.
 * These handlers are responsible for managing wallet identity, retrieving addresses,
 * and creating authorization witnesses.
 *
 * Each handler function receives an {@link AztecHandlerContext} which provides access
 * to the core {@link AccountWallet} instance, the {@link PXE} client, and a
 * {@link ContractArtifactCache}.
 *
 * @returns An object where keys are account-related method names
 *          (e.g., "aztec_getAddress", "aztec_createAuthWit") and values are their
 *          corresponding handler functions.
 * @see {@link AztecWalletMethodMap} for method definitions.
 */
export function createAccountHandlers() {
  return {
    /**
     * Handles the "aztec_getAddress" JSON-RPC method.
     * Retrieves the primary {@link AztecAddress} of the account associated with the
     * {@link AccountWallet} in the current context.
     *
     * @param ctx - The {@link AztecHandlerContext} containing the `wallet` instance.
     * @param _paramsTuple - Parameters for this method (expected to be an empty array).
     *                       Defined by {@link AztecWalletMethodMap.aztec_getAddress.params}.
     * @returns A promise that resolves to the {@link AztecAddress} of the wallet.
     *          Type defined by {@link AztecWalletMethodMap.aztec_getAddress.result}.
     */
    aztec_getAddress: async (
      ctx: AztecHandlerContext,
      _paramsTuple: AztecWalletMethodMap['aztec_getAddress']['params'], // Will be `[]`
    ): Promise<AztecWalletMethodMap['aztec_getAddress']['result']> => {
      logger.debug('[HANDLER] aztec_getAddress');
      return ctx.wallet.getAddress();
    },

    /**
     * Handles the "aztec_getCompleteAddress" JSON-RPC method.
     * Retrieves the {@link CompleteAddress} (which includes public keys and partial address)
     * of the account associated with the {@link AccountWallet} in the current context.
     *
     * The complete address typically contains:
     * - The {@link AztecAddress}
     * - Public keys (e.g., nullifier key, incoming viewing key)
     * - Partial address
     *
     * @param ctx - The {@link AztecHandlerContext} containing the `wallet` instance.
     * @param _paramsTuple - Parameters for this method (expected to be an empty array).
     *                       Defined by {@link AztecWalletMethodMap.aztec_getCompleteAddress.params}.
     * @returns A promise that resolves to the {@link CompleteAddress} of the wallet.
     *          Type defined by {@link AztecWalletMethodMap.aztec_getCompleteAddress.result}.
     */
    aztec_getCompleteAddress: async (
      ctx: AztecHandlerContext,
      _paramsTuple: AztecWalletMethodMap['aztec_getCompleteAddress']['params'], // Will be `[]`
    ): Promise<AztecWalletMethodMap['aztec_getCompleteAddress']['result']> => {
      logger.debug('[HANDLER] aztec_getCompleteAddress');
      return ctx.wallet.getCompleteAddress();
    },

    /**
     * Handles the "aztec_createAuthWit" JSON-RPC method.
     * Creates an {@link AuthWitness} for a given message hash or intent, using the
     * {@link AccountWallet} in the current context.
     *
     * Authorization witnesses are used to delegate actions, allowing a contract or another
     * entity to perform operations on behalf of the wallet owner (e.g., for token approvals).
     *
     * @param ctx - The {@link AztecHandlerContext} containing the `wallet` instance.
     * @param paramsTuple - A tuple containing the intent to authorize.
     *                      Defined by {@link AztecWalletMethodMap.aztec_createAuthWit.params}.
     * @param paramsTuple.0 - The intent to authorize, which can be a message hash ({@link Fr} or `Buffer`),
     *                        an {@link IntentInnerHash}, or an {@link IntentAction}.
     * @returns A promise that resolves to the created {@link AuthWitness}.
     *          Type defined by {@link AztecWalletMethodMap.aztec_createAuthWit.result}.
     * @throws {Error} If the `intent` parameter is missing or invalid, though type checking
     *                 and serializer validation should ideally catch this earlier.
     */
    aztec_createAuthWit: async (
      ctx: AztecHandlerContext,
      paramsTuple: AztecWalletMethodMap['aztec_createAuthWit']['params'],
    ): Promise<AztecWalletMethodMap['aztec_createAuthWit']['result']> => {
      const [intent] = paramsTuple;
      logger.debug(`[HANDLER] aztec_createAuthWit: intent type = ${typeof intent}`);
      // Intent is not optional in the tuple type.
      // Add runtime check for robustness if needed.
      if (intent === undefined) {
        // Basic check, though TS should prevent this if tuple type is correct
        throw new Error('Invalid intent parameter received in tuple');
      }
      return await ctx.wallet.createAuthWit(intent);
    },
  };
}
