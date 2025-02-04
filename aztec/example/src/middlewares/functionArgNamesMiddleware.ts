import type {
  AztecWalletContext,
  AztecChainWalletMiddleware,
  TransactionParams,
  TransactionFunctionCall,
} from '@walletmesh/aztec-rpc-wallet';

import { applyToMethods } from '@walletmesh/jsonrpc';
import {
  getFunctionParameterInfoFromContractAddress,
  type FunctionParameterInfo,
} from '@walletmesh/aztec/helpers';

export type FunctionArgNames = Record<string, Record<string, FunctionParameterInfo[]>>;

/**
 * Stores function parameter information for a given contract and function
 * @param context - The RPC context containing PXE and function argument names
 * @param contractAddress - The address of the contract
 * @param functionName - The name of the function
 */
async function storeFunctionParamInfo(
  context: AztecWalletContext,
  contractAddress: string,
  functionName: string,
) {
  const paramInfo = await getFunctionParameterInfoFromContractAddress(
    context.pxe,
    contractAddress,
    functionName,
  );

  if (!context.functionCallArgNames) {
    context.functionCallArgNames = {} as FunctionArgNames;
  }

  const functionCallArgNames = context.functionCallArgNames as FunctionArgNames;
  if (!functionCallArgNames[contractAddress]) {
    functionCallArgNames[contractAddress] = {};
  }

  functionCallArgNames[contractAddress][functionName] = paramInfo;
}

/**
 * Middleware that captures and stores function argument names for transactions
 * @param isConnectedRef - Reference to connection status
 * @returns Middleware function that processes aztec_sendTransaction and aztec_simulateTransaction
 */
export const functionArgNamesMiddleware = (
  isConnectedRef: React.MutableRefObject<boolean>,
): AztecChainWalletMiddleware => {
  return applyToMethods(
    ['aztec_sendTransaction', 'aztec_simulateTransaction'],
    async (context, req, next) => {
      if (!isConnectedRef.current) return next();

      if (req.method === 'aztec_sendTransaction') {
        const { functionCalls } = req.params as TransactionParams;
        if (functionCalls) {
          const uniqueCalls = new Set<string>();
          const uniqueFunctionCalls = functionCalls.filter((call) => {
            const key = `${call.contractAddress}-${call.functionName}`;
            if (uniqueCalls.has(key)) return false;
            uniqueCalls.add(key);
            return true;
          });

          await Promise.all(
            uniqueFunctionCalls.map((call) =>
              storeFunctionParamInfo(context, call.contractAddress, call.functionName),
            ),
          );
        }
      } else {
        const { contractAddress, functionName } = req.params as TransactionFunctionCall;
        await storeFunctionParamInfo(context, contractAddress, functionName);
      }

      return next();
    },
  );
};
