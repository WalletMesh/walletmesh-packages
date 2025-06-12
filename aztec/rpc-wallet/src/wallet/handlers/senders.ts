import type { AztecHandlerContext } from './index.js';
import type { AztecWalletMethodMap } from '../../types.js';
import { createLogger } from '@aztec/foundation/log';

const logger = createLogger('aztec-rpc-wallet:senders');

/**
 * Creates handlers for managing authorized senders in an Aztec wallet via JSON-RPC.
 * Authorized senders are {@link AztecAddress}es permitted to submit transactions
 * on behalf of the user's account. This functionality is crucial for delegation,
 * enabling other accounts or smart contracts to act for the user under controlled conditions.
 *
 * Each handler function receives an {@link AztecHandlerContext}, providing access to the
 * {@link AccountWallet} instance necessary for sender management.
 *
 * @returns An object where keys are sender-related method names
 *          (e.g., "aztec_registerSender", "aztec_getSenders", "aztec_removeSender")
 *          and values are their corresponding handler functions.
 * @see {@link AztecWalletMethodMap} for method definitions.
 */
export function createSenderHandlers() {
  return {
    /**
     * Handles the "aztec_registerSender" JSON-RPC method.
     * Registers a new {@link AztecAddress} as an authorized sender for the account
     * managed by the {@link AccountWallet} in the context.
     *
     * This allows the specified sender address to initiate transactions on behalf of the user.
     * Common use cases include:
     * - Delegating transaction submission to a different account.
     * - Authorizing a smart contract to perform actions for the user.
     * - Setting up automated transaction systems or relayers.
     *
     * @param ctx - The {@link AztecHandlerContext} containing the `wallet` instance.
     * @param paramsTuple - A tuple containing the sender's address to register.
     *                      Defined by {@link AztecWalletMethodMap.aztec_registerSender.params}.
     * @param paramsTuple.0 - The {@link AztecAddress} to authorize as a sender.
     * @returns A promise that resolves to the registered {@link AztecAddress}.
     *          Type defined by {@link AztecWalletMethodMap.aztec_registerSender.result}.
     * @throws {Error} If the `sender` parameter is missing or invalid, though type checking
     *                 and serializer validation should catch this earlier.
     */
    aztec_registerSender: async (
      ctx: AztecHandlerContext,
      paramsTuple: AztecWalletMethodMap['aztec_registerSender']['params'],
    ): Promise<AztecWalletMethodMap['aztec_registerSender']['result']> => {
      const [sender] = paramsTuple;
      logger.debug(`[HANDLER] aztec_registerSender: sender = ${sender?.toString()}`);
      if (!sender || typeof sender.toString !== 'function') {
        // Basic check
        throw new Error('Invalid sender parameter received in tuple');
      }
      return await ctx.wallet.registerSender(sender);
    },

    /**
     * Handles the "aztec_getSenders" JSON-RPC method.
     * Retrieves a list of all {@link AztecAddress}es currently authorized to send
     * transactions on behalf of the account managed by the {@link AccountWallet} in the context.
     * This is useful for auditing and managing delegation permissions.
     *
     * @param ctx - The {@link AztecHandlerContext} containing the `wallet` instance.
     * @param _paramsTuple - Parameters for this method (expected to be an empty array).
     *                       Defined by {@link AztecWalletMethodMap.aztec_getSenders.params}.
     * @returns A promise that resolves to an array of authorized {@link AztecAddress}es.
     *          Type defined by {@link AztecWalletMethodMap.aztec_getSenders.result}.
     */
    aztec_getSenders: async (
      ctx: AztecHandlerContext,
      _paramsTuple: AztecWalletMethodMap['aztec_getSenders']['params'], // Will be `[]`
    ): Promise<AztecWalletMethodMap['aztec_getSenders']['result']> => {
      logger.debug('[HANDLER] aztec_getSenders');
      return await ctx.wallet.getSenders();
    },

    /**
     * Handles the "aztec_removeSender" JSON-RPC method.
     * Revokes the authorization for a previously registered sender for the account
     * managed by the {@link AccountWallet} in the context.
     * After successful removal, the specified address will no longer be able to
     * submit transactions on behalf of this wallet.
     *
     * @param ctx - The {@link AztecHandlerContext} containing the `wallet` instance.
     * @param paramsTuple - A tuple containing the sender's address to remove.
     *                      Defined by {@link AztecWalletMethodMap.aztec_removeSender.params}.
     * @param paramsTuple.0 - The {@link AztecAddress} to remove from the list of authorized senders.
     * @returns A promise that resolves to `true` if the removal was successful.
     *          Type defined by {@link AztecWalletMethodMap.aztec_removeSender.result}.
     * @throws {Error} If the `sender` parameter is missing or invalid, though type checking
     *                 and serializer validation should catch this earlier.
     */
    aztec_removeSender: async (
      ctx: AztecHandlerContext,
      paramsTuple: AztecWalletMethodMap['aztec_removeSender']['params'],
    ): Promise<AztecWalletMethodMap['aztec_removeSender']['result']> => {
      const [sender] = paramsTuple;
      logger.debug(`[HANDLER] aztec_removeSender: sender = ${sender?.toString()}`);
      if (!sender || typeof sender.toString !== 'function') {
        // Basic check
        throw new Error('Invalid sender parameter received in tuple');
      }
      await ctx.wallet.removeSender(sender);
      return true;
    },
  };
}
