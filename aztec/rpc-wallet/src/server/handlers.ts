import { createLogger } from '@aztec/foundation/log';
import { JSONRPCError, type JSONRPCNode } from '@walletmesh/jsonrpc';
import type { AztecWalletEventMap, AztecWalletMethodMap } from '../types.js';
import type { AztecWalletHandlerContext } from './types.js';

const logger = createLogger('aztec-rpc-wallet:handlers');

export const HANDLERS: Record<keyof AztecWalletMethodMap, unknown> = {
  aztec_getContractClassMetadata: async (
    ctx: AztecWalletHandlerContext,
    paramsTuple: AztecWalletMethodMap['aztec_getContractClassMetadata']['params'], // Will be `[Fr, boolean?]`
  ): Promise<AztecWalletMethodMap['aztec_getContractClassMetadata']['result']> => {
    logger.debug('aztec_getContractClassMetadata');
    const [id, includeArtifact] = paramsTuple;
    return ctx.wallet.getContractClassMetadata(id, includeArtifact);
  },
  aztec_getContractMetadata: async (
    ctx: AztecWalletHandlerContext,
    paramsTuple: AztecWalletMethodMap['aztec_getContractMetadata']['params'], // Will be `[AztecAddress]`
  ): Promise<AztecWalletMethodMap['aztec_getContractMetadata']['result']> => {
    logger.debug('aztec_getContractMetadata');
    const [address] = paramsTuple;
    return ctx.wallet.getContractMetadata(address);
  },
  aztec_getPrivateEvents: async (
    ctx: AztecWalletHandlerContext,
    paramsTuple: AztecWalletMethodMap['aztec_getPrivateEvents']['params'],
  ): Promise<AztecWalletMethodMap['aztec_getPrivateEvents']['result']> => {
    logger.debug('aztec_getPrivateEvents');
    const [contractAddress, eventMetadata, from, numBlocks, recipients] = paramsTuple;
    return ctx.wallet.getPrivateEvents(contractAddress, eventMetadata, from, numBlocks, recipients);
  },
  aztec_getChainInfo: async (
    ctx: AztecWalletHandlerContext,
    _paramsTuple: AztecWalletMethodMap['aztec_getChainInfo']['params'], // Will be `[]`
  ): Promise<AztecWalletMethodMap['aztec_getChainInfo']['result']> => {
    logger.debug('aztec_getChainInfo');
    return ctx.wallet.getChainInfo();
  },
  aztec_getTxReceipt: async (
    ctx: AztecWalletHandlerContext,
    _paramsTuple: AztecWalletMethodMap['aztec_getTxReceipt']['params'], // Will be `[TxHash]`
  ): Promise<AztecWalletMethodMap['aztec_getTxReceipt']['result']> => {
    logger.debug('aztec_getTxReceipt');
    const [txHash] = _paramsTuple;
    return ctx.wallet.getTxReceipt(txHash);
  },
  aztec_registerSender: async (
    ctx: AztecWalletHandlerContext,
    _paramsTuple: AztecWalletMethodMap['aztec_registerSender']['params'], // Will be `[AztecAddress]`
  ): Promise<AztecWalletMethodMap['aztec_registerSender']['result']> => {
    logger.debug('aztec_registerSender');
    const [senderAddress] = _paramsTuple;
    return ctx.wallet.registerSender(senderAddress);
  },
  aztec_getAddressBook: async (
    ctx: AztecWalletHandlerContext,
    _paramsTuple: AztecWalletMethodMap['aztec_getAddressBook']['params'], // Will be `[]`
  ): Promise<AztecWalletMethodMap['aztec_getAddressBook']['result']> => {
    logger.debug('aztec_getAddressBook');
    return ctx.wallet.getAddressBook();
  },
  aztec_getAccounts: async (
    ctx: AztecWalletHandlerContext,
    _paramsTuple: AztecWalletMethodMap['aztec_getAccounts']['params'], // Will be `[]`
  ): Promise<AztecWalletMethodMap['aztec_getAccounts']['result']> => {
    logger.debug('aztec_getAccounts');
    return ctx.wallet.getAccounts();
  },
  aztec_registerContract: async (
    ctx: AztecWalletHandlerContext,
    _paramsTuple: AztecWalletMethodMap['aztec_registerContract']['params'], // Will be `[ExecutionPayload]`
  ): Promise<AztecWalletMethodMap['aztec_registerContract']['result']> => {
    logger.debug('aztec_registerContract');
    const [instance, artifact] = _paramsTuple;
    return ctx.wallet.registerContract(instance, artifact);
  },
  aztec_simulateTx: async (
    ctx: AztecWalletHandlerContext,
    paramsTuple: AztecWalletMethodMap['aztec_simulateTx']['params'], // Will be `[ExecutionPayload, SimulateOptions]`
  ): Promise<AztecWalletMethodMap['aztec_simulateTx']['result']> => {
    logger.debug('aztec_simulateTx');
    const [payload, options] = paramsTuple;
    return ctx.wallet.simulateTx(payload, options);
  },
  aztec_simulateUtility: async (
    ctx: AztecWalletHandlerContext,
    paramsTuple: AztecWalletMethodMap['aztec_simulateUtility']['params'], // Will be `[FunctionCall, AuthWitness[]?]`
  ): Promise<AztecWalletMethodMap['aztec_simulateUtility']['result']> => {
    logger.debug('aztec_simulateUtility');
    const [functionCall, authWitnesses] = paramsTuple;
    return ctx.wallet.simulateUtility(functionCall, authWitnesses);
  },
  aztec_profileTx: async (
    ctx: AztecWalletHandlerContext,
    paramsTuple: AztecWalletMethodMap['aztec_profileTx']['params'], // Will be `[ExecutionPayload, ProfileOptions]`
  ): Promise<AztecWalletMethodMap['aztec_profileTx']['result']> => {
    logger.debug('aztec_profileTx');
    const [payload, options] = paramsTuple;
    return ctx.wallet.profileTx(payload, options);
  },
  aztec_sendTx: async (
    ctx: AztecWalletHandlerContext,
    paramsTuple: AztecWalletMethodMap['aztec_sendTx']['params'], // Will be `[ExecutionPayload, SendOptions]`
  ): Promise<AztecWalletMethodMap['aztec_sendTx']['result']> => {
    logger.debug('aztec_sendTx');
    const [payload, options] = paramsTuple;
    return ctx.wallet.sendTx(payload, options);
  },
  aztec_createAuthWit: async (
    ctx: AztecWalletHandlerContext,
    paramsTuple: AztecWalletMethodMap['aztec_createAuthWit']['params'],
  ): Promise<AztecWalletMethodMap['aztec_createAuthWit']['result']> => {
    const [from, messageHashOrIntent] = paramsTuple;
    logger.debug(
      `aztec_createAuthWit: from = ${from.toString()}, intent type = ${typeof messageHashOrIntent}`,
    );
    return ctx.wallet.createAuthWit(from, messageHashOrIntent);
  },
  aztec_batch: async (
    ctx: AztecWalletHandlerContext,
    paramsTuple: AztecWalletMethodMap['aztec_batch']['params'], // Will be `[BatchedMethod<keyof BatchableMethods>[]]`
  ): Promise<AztecWalletMethodMap['aztec_batch']['result']> => {
    logger.debug('aztec_batch');
    const [batchedMethods] = paramsTuple;
    return ctx.wallet.batch(batchedMethods);
  },

  aztec_wmExecuteTx: async (
    _ctx: AztecWalletHandlerContext,
    _paramsTuple: AztecWalletMethodMap['aztec_wmExecuteTx']['params'], // Will be `[ExecutionPayload, AztecSendOptions]`
  ): Promise<AztecWalletMethodMap['aztec_wmExecuteTx']['result']> => {
    logger.debug('aztec_wmExecuteTx');
    throw new JSONRPCError(-32601, 'Method not implemented');
  },
  aztec_wmBatchExecute: async (
    _ctx: AztecWalletHandlerContext,
    _paramsTuple: AztecWalletMethodMap['aztec_wmBatchExecute']['params'], // Will be `[ExecutionPayload[], AztecSendOptions | undefined]`
  ): Promise<AztecWalletMethodMap['aztec_wmBatchExecute']['result']> => {
    logger.debug('aztec_wmBatchExecute');
    throw new JSONRPCError(-32601, 'Method not implemented');
  },
  aztec_wmDeployContract: async (
    _ctx: AztecWalletHandlerContext,
    _paramsTuple: AztecWalletMethodMap['aztec_wmDeployContract']['params'], // Will be `[{ artifact: ContractArtifact; args: unknown[]; constructorName?: string }]`
  ): Promise<AztecWalletMethodMap['aztec_wmDeployContract']['result']> => {
    logger.debug('aztec_wmDeployContract');
    throw new JSONRPCError(-32601, 'Method not implemented');
  },
  aztec_wmSimulateTx: async (
    _ctx: AztecWalletHandlerContext,
    _paramsTuple: AztecWalletMethodMap['aztec_wmSimulateTx']['params'], // Will be `[ExecutionPayload, SimulateOptions]`
  ): Promise<AztecWalletMethodMap['aztec_wmSimulateTx']['result']> => {
    logger.debug('aztec_wmSimulateTx');
    throw new JSONRPCError(-32601, 'Method not implemented');
  },
};

export function registerAztecWalletHandlers(
  node: JSONRPCNode<AztecWalletMethodMap, AztecWalletEventMap, AztecWalletHandlerContext>,
): void {
  for (const [methodStr, handlerFunc] of Object.entries(HANDLERS)) {
    const typedMethodKey = methodStr as keyof AztecWalletMethodMap;
    // Cast the handler to the specific type expected by registerMethod
    // This relies on HANDLERS providing correctly typed handlers
    // for each method string.
    node.registerMethod(
      methodStr, // Use the string key here
      handlerFunc as (
        context: AztecWalletHandlerContext,
        params: AztecWalletMethodMap[typeof typedMethodKey]['params'],
      ) => Promise<AztecWalletMethodMap[typeof typedMethodKey]['result']>,
    );
  }
}
