import type { AztecHandlerContext } from './index.js';
import type { AztecWalletMethodMap } from '../../types.js';
import { createLogger } from '@aztec/foundation/log';

const logger = createLogger('aztec-rpc-wallet:node');

/**
 * A constant array listing all JSON-RPC methods supported by this Aztec wallet implementation.
 * This list is returned by the `wm_getSupportedMethods` RPC call, allowing clients (dApps)
 * to discover the capabilities of the connected wallet node.
 * It should be kept in sync with the methods defined in {@link AztecWalletMethodMap}
 * and implemented by the various handler creation functions.
 *
 * Note: `aztec_createTxExecutionRequest` is intentionally omitted as it's a client-side
 * convenience method in `AztecDappWallet` rather than a direct RPC method handled here.
 * The actual RPC methods for transactions are `aztec_proveTx`, `aztec_sendTx`, etc.,
 * or the higher-level `aztec_wmExecuteTx`.
 */
const SUPPORTED_AZTEC_METHODS = [
  'wm_getSupportedMethods',
  'aztec_getChainId',
  'aztec_getVersion',
  'aztec_getNodeInfo',
  'aztec_getCurrentBaseFees',
  'aztec_getPXEInfo',
  'aztec_getBlock',
  'aztec_getBlockNumber',
  'aztec_getAddress',
  'aztec_getCompleteAddress',
  'aztec_createAuthWit',
  'aztec_registerSender',
  'aztec_getSenders',
  'aztec_removeSender',
  'aztec_getContracts',
  'aztec_getContractMetadata',
  'aztec_getContractClassMetadata',
  'aztec_registerContract',
  'aztec_registerContractClass',
  // 'aztec_createTxExecutionRequest', // This is a client-side method, not an RPC method.
  'aztec_proveTx',
  'aztec_sendTx',
  'aztec_getTxReceipt',
  'aztec_simulateTx',
  'aztec_profileTx',
  'aztec_simulateUtility',
  'aztec_getPrivateEvents',
  'aztec_getPublicEvents',
  'aztec_wmExecuteTx',
  'aztec_wmSimulateTx',
  'aztec_wmDeployContract',
] as const;

/**
 * Creates handlers for node and network information-related Aztec wallet JSON-RPC methods.
 * These handlers provide dApps with insights into the connected Aztec node's state,
 * network parameters (like chain ID, version, fees), and block information.
 *
 * Each handler function receives an {@link AztecHandlerContext} which provides access
 * to the {@link AccountWallet} and {@link PXE} client.
 *
 * @returns An object where keys are node-related method names
 *          (e.g., "aztec_getNodeInfo", "aztec_getBlockNumber") and values are their
 *          corresponding handler functions.
 * @see {@link AztecWalletMethodMap} for method definitions.
 */
export function createNodeHandlers() {
  return {
    /**
     * Handles the "wm_getSupportedMethods" JSON-RPC method.
     * Returns a list of all JSON-RPC methods supported by this wallet implementation.
     * This allows clients to discover the capabilities of the wallet.
     *
     * @param _ctx - The {@link AztecHandlerContext} (unused for this method).
     * @param _paramsTuple - Parameters for this method (expected to be an empty array).
     *                       Defined by {@link AztecWalletMethodMap.wm_getSupportedMethods.params}.
     * @returns A promise that resolves to an array of strings, where each string is a
     *          supported method name.
     *          Type defined by {@link AztecWalletMethodMap.wm_getSupportedMethods.result}.
     * @see {@link SUPPORTED_AZTEC_METHODS}
     */
    wm_getSupportedMethods: async (
      _ctx: AztecHandlerContext,
      _paramsTuple: AztecWalletMethodMap['wm_getSupportedMethods']['params'], // Will be `[]`
    ): Promise<AztecWalletMethodMap['wm_getSupportedMethods']['result']> => {
      logger.debug('[HANDLER] wm_getSupportedMethods');
      return Array.from(SUPPORTED_AZTEC_METHODS);
    },

    /**
     * Handles the "aztec_getChainId" JSON-RPC method.
     * Retrieves the chain ID of the Aztec network to which the {@link AccountWallet}
     * in the context is connected.
     *
     * @param ctx - The {@link AztecHandlerContext} containing the `wallet` instance.
     * @param _paramsTuple - Parameters for this method (expected to be an empty array).
     *                       Defined by {@link AztecWalletMethodMap.aztec_getChainId.params}.
     * @returns A promise that resolves to the chain ID as an {@link Fr} (Field element).
     *          Type defined by {@link AztecWalletMethodMap.aztec_getChainId.result}.
     */
    aztec_getChainId: async (
      ctx: AztecHandlerContext,
      _paramsTuple: AztecWalletMethodMap['aztec_getChainId']['params'], // Will be `[]`
    ): Promise<AztecWalletMethodMap['aztec_getChainId']['result']> => {
      logger.debug('[HANDLER] aztec_getChainId');
      return ctx.wallet.getChainId();
    },

    /**
     * Handles the "aztec_getVersion" JSON-RPC method.
     * Retrieves the version of the Aztec software stack, typically the version of the
     * PXE (Private Execution Environment) or the node the wallet is interacting with.
     *
     * @param ctx - The {@link AztecHandlerContext} containing the `wallet` instance.
     * @param _paramsTuple - Parameters for this method (expected to be an empty array).
     *                       Defined by {@link AztecWalletMethodMap.aztec_getVersion.params}.
     * @returns A promise that resolves to the version as an {@link Fr} (Field element).
     *          Type defined by {@link AztecWalletMethodMap.aztec_getVersion.result}.
     */
    aztec_getVersion: async (
      ctx: AztecHandlerContext,
      _paramsTuple: AztecWalletMethodMap['aztec_getVersion']['params'], // Will be `[]`
    ): Promise<AztecWalletMethodMap['aztec_getVersion']['result']> => {
      logger.debug('[HANDLER] aztec_getVersion');
      return ctx.wallet.getVersion();
    },

    /**
     * Handles the "aztec_getNodeInfo" JSON-RPC method.
     * Retrieves comprehensive information about the connected Aztec node, such as
     * protocol version, chain ID, and addresses of core protocol contracts.
     *
     * @param ctx - The {@link AztecHandlerContext} containing the `wallet` instance.
     * @param _paramsTuple - Parameters for this method (expected to be an empty array).
     *                       Defined by {@link AztecWalletMethodMap.aztec_getNodeInfo.params}.
     * @returns A promise that resolves to a {@link NodeInfo} object.
     *          Type defined by {@link AztecWalletMethodMap.aztec_getNodeInfo.result}.
     */
    aztec_getNodeInfo: async (
      ctx: AztecHandlerContext,
      _paramsTuple: AztecWalletMethodMap['aztec_getNodeInfo']['params'], // Will be `[]`
    ): Promise<AztecWalletMethodMap['aztec_getNodeInfo']['result']> => {
      logger.debug('[HANDLER] aztec_getNodeInfo');
      return await ctx.wallet.getNodeInfo();
    },

    /**
     * Handles the "aztec_getCurrentBaseFees" JSON-RPC method.
     * Retrieves the current base gas fees applicable on the Aztec network.
     * This information is essential for estimating transaction costs.
     *
     * @param ctx - The {@link AztecHandlerContext} containing the `wallet` instance.
     * @param _paramsTuple - Parameters for this method (expected to be an empty array).
     *                       Defined by {@link AztecWalletMethodMap.aztec_getCurrentBaseFees.params}.
     * @returns A promise that resolves to a {@link GasFees} object.
     *          Type defined by {@link AztecWalletMethodMap.aztec_getCurrentBaseFees.result}.
     */
    aztec_getCurrentBaseFees: async (
      ctx: AztecHandlerContext,
      _paramsTuple: AztecWalletMethodMap['aztec_getCurrentBaseFees']['params'], // Will be `[]`
    ): Promise<AztecWalletMethodMap['aztec_getCurrentBaseFees']['result']> => {
      logger.debug('[HANDLER] aztec_getCurrentBaseFees');
      return await ctx.wallet.getCurrentBaseFees();
    },

    /**
     * Handles the "aztec_getPXEInfo" JSON-RPC method.
     * Retrieves information about the Private Execution Environment (PXE) service
     * that the wallet is connected to, including its version and core contract addresses.
     *
     * @param ctx - The {@link AztecHandlerContext} containing the `pxe` instance.
     * @param _paramsTuple - Parameters for this method (expected to be an empty array).
     *                       Defined by {@link AztecWalletMethodMap.aztec_getPXEInfo.params}.
     * @returns A promise that resolves to a {@link PXEInfo} object.
     *          Type defined by {@link AztecWalletMethodMap.aztec_getPXEInfo.result}.
     */
    aztec_getPXEInfo: async (
      ctx: AztecHandlerContext,
      _paramsTuple: AztecWalletMethodMap['aztec_getPXEInfo']['params'], // Will be `[]`
    ): Promise<AztecWalletMethodMap['aztec_getPXEInfo']['result']> => {
      logger.debug('[HANDLER] aztec_getPXEInfo');
      return await ctx.pxe.getPXEInfo();
    },

    /**
     * Handles the "aztec_getBlock" JSON-RPC method.
     * Retrieves a specific L2 block by its number from the connected PXE.
     *
     * @param ctx - The {@link AztecHandlerContext} containing the `pxe` instance.
     * @param paramsTuple - A tuple containing the block number.
     *                      Defined by {@link AztecWalletMethodMap.aztec_getBlock.params}.
     * @param paramsTuple.0 - The number of the block to retrieve.
     * @returns A promise that resolves to the {@link L2Block} data, or `null` / `undefined`
     *          if the block is not found (behavior depends on PXE implementation, typically throws).
     *          Type defined by {@link AztecWalletMethodMap.aztec_getBlock.result}.
     * @throws {Error} If the `blockNumber` parameter is missing or invalid, or if the block is not found.
     */
    aztec_getBlock: async (
      ctx: AztecHandlerContext,
      paramsTuple: AztecWalletMethodMap['aztec_getBlock']['params'],
    ): Promise<AztecWalletMethodMap['aztec_getBlock']['result']> => {
      const [blockNumber] = paramsTuple;
      logger.debug(`[HANDLER] aztec_getBlock: blockNumber = ${blockNumber}`);
      if (blockNumber === undefined) {
        // Should be caught by TS if tuple type is `[number]`
        throw new Error('Missing required parameter: number');
      }
      const block = await ctx.pxe.getBlock(blockNumber);
      if (!block) throw new Error('Block not found');
      return block;
    },

    /**
     * Handles the "aztec_getBlockNumber" JSON-RPC method.
     * Retrieves the current (latest) L2 block number from the connected PXE.
     *
     * @param ctx - The {@link AztecHandlerContext} containing the `pxe` instance.
     * @param _paramsTuple - Parameters for this method (expected to be an empty array).
     *                       Defined by {@link AztecWalletMethodMap.aztec_getBlockNumber.params}.
     * @returns A promise that resolves to the current block number (a `number`).
     *          Type defined by {@link AztecWalletMethodMap.aztec_getBlockNumber.result}.
     */
    aztec_getBlockNumber: async (
      ctx: AztecHandlerContext,
      _paramsTuple: AztecWalletMethodMap['aztec_getBlockNumber']['params'], // Will be `[]`
    ): Promise<AztecWalletMethodMap['aztec_getBlockNumber']['result']> => {
      logger.debug('[HANDLER] aztec_getBlockNumber');
      return await ctx.pxe.getBlockNumber();
    },
  };
}
