import { createLogger } from '@aztec/foundation/log';
import type { AztecWalletMethodMap } from '../../types.js';
import type { AztecHandlerContext } from './index.js';

const logger = createLogger('aztec-rpc-wallet:event');

/**
 * Creates handlers for event-related Aztec wallet JSON-RPC methods.
 * These handlers are responsible for querying private (encrypted) and public
 * (unencrypted) events emitted by Aztec contracts.
 *
 * Each handler function receives an {@link AztecHandlerContext} which provides access
 * to the {@link PXE} client, essential for event retrieval.
 *
 * @returns An object where keys are event-related method names
 *          (e.g., "aztec_getPrivateEvents", "aztec_getPublicEvents") and values are
 *          their corresponding handler functions.
 * @see {@link AztecWalletMethodMap} for method definitions.
 */
export function createEventHandlers() {
  return {
    /**
     * Handles the "aztec_getPrivateEvents" JSON-RPC method.
     * Retrieves encrypted private events emitted by a specific contract within a given
     * block range, for a specified set of recipients.
     *
     * Private events are decrypted by the {@link PXE} using the viewing keys
     * associated with the recipient addresses.
     *
     * @param ctx - The {@link AztecHandlerContext} containing the `pxe` instance.
     * @param paramsTuple - A tuple containing parameters for querying private events.
     *                      Defined by {@link AztecWalletMethodMap.aztec_getPrivateEvents.params}.
     * @param paramsTuple.0 - The {@link AztecAddress} of the contract that emitted the events.
     * @param paramsTuple.1 - The {@link EventMetadataDefinition} describing the event structure.
     * @param paramsTuple.2 - The starting block number (inclusive) from which to query.
     * @param paramsTuple.3 - The number of blocks to scan from the `from` block.
     * @param paramsTuple.4 - An array of {@link AztecAddress} recipients whose events are to be fetched and decrypted.
     * @returns A promise that resolves to an array of decoded private event data. The specific type
     *          of the event data depends on the `eventMetadata`.
     *          Type defined by {@link AztecWalletMethodMap.aztec_getPrivateEvents.result}.
     * @throws {Error} If any required parameters are missing or invalid, though type checking
     *                 and serializer validation should catch this earlier.
     */
    aztec_getPrivateEvents: async (
      ctx: AztecHandlerContext,
      paramsTuple: AztecWalletMethodMap['aztec_getPrivateEvents']['params'],
    ): Promise<AztecWalletMethodMap['aztec_getPrivateEvents']['result']> => {
      const [contractAddress, eventMetadata, from, numBlocks, recipients] = paramsTuple;
      logger.debug(
        `[HANDLER] aztec_getPrivateEvents: contractAddress = ${contractAddress?.toString()}, from = ${from}, numBlocks = ${numBlocks}`,
      );
      // All parameters are mandatory in the tuple type definition.
      // Add runtime checks if there's any doubt about them being undefined, though TS should catch.
      if (
        !contractAddress ||
        !eventMetadata ||
        from === undefined ||
        numBlocks === undefined ||
        !recipients
      ) {
        throw new Error('Invalid parameters received in tuple for aztec_getPrivateEvents');
      }
      return await ctx.pxe.getPrivateEvents(contractAddress, eventMetadata, from, numBlocks, recipients);
    },

    /**
     * Handles the "aztec_getPublicEvents" JSON-RPC method.
     * Retrieves unencrypted public events matching a specific {@link EventMetadataDefinition}
     * starting from a given block number, up to a specified limit.
     *
     * Public events are visible to all network participants and are typically used for
     * information that does not require privacy.
     *
     * @param ctx - The {@link AztecHandlerContext} containing the `pxe` instance.
     * @param paramsTuple - A tuple containing parameters for querying public events.
     *                      Defined by {@link AztecWalletMethodMap.aztec_getPublicEvents.params}.
     * @param paramsTuple.0 - The {@link EventMetadataDefinition} describing the event structure.
     * @param paramsTuple.1 - The starting block number (inclusive) from which to query.
     * @param paramsTuple.2 - The maximum number of events to return.
     * @returns A promise that resolves to an array of decoded public event data. The specific type
     *          of the event data depends on the `eventMetadata`.
     *          Type defined by {@link AztecWalletMethodMap.aztec_getPublicEvents.result}.
     * @throws {Error} If any required parameters are missing or invalid, though type checking
     *                 and serializer validation should catch this earlier.
     */
    aztec_getPublicEvents: async (
      ctx: AztecHandlerContext,
      paramsTuple: AztecWalletMethodMap['aztec_getPublicEvents']['params'],
    ): Promise<AztecWalletMethodMap['aztec_getPublicEvents']['result']> => {
      const [eventMetadata, from, limit] = paramsTuple;
      logger.debug(`[HANDLER] aztec_getPublicEvents: from = ${from}, limit = ${limit}`);
      // All parameters are mandatory in the tuple type definition.
      if (!eventMetadata || from === undefined || limit === undefined) {
        throw new Error('Invalid parameters received in tuple for aztec_getPublicEvents');
      }
      return await ctx.pxe.getPublicEvents(eventMetadata, from, limit);
    },
  };
}
