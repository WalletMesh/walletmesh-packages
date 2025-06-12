import type { JSONRPCMiddleware } from '@walletmesh/jsonrpc';
import type { AztecWalletMethodMap, AztecHandlerContext } from '@walletmesh/aztec-rpc-wallet';
import type { PXE } from '@aztec/aztec.js';
import { getFunctionParameterInfoFromContractAddress } from '@walletmesh/aztec-helpers';

export type FunctionArgNames = Record<string, Record<string, Array<{ name: string; type: string }>>>;

// TODO(twt): this middleware does not work and needs an overhaul to support the latest @walletmesh/aztec-rpc-wallet methods

/**
 * Middleware that extracts function parameter information for Aztec transactions.
 * This enriches the context with parameter names and types for better transaction display.
 */
export const createFunctionArgNamesMiddleware = (
  pxe: PXE,
): JSONRPCMiddleware<
  AztecWalletMethodMap,
  AztecHandlerContext & { functionCallArgNames?: FunctionArgNames }
> => {
  return async (context, req, next) => {
    // Only process transaction-related methods
    if (req.method === 'aztec_contractInteraction' || req.method === 'aztec_wmDeployContract') {
      const functionCallArgNames: FunctionArgNames = {};

      try {
        if (req.method === 'aztec_contractInteraction' && req.params && typeof req.params === 'object') {
          // biome-ignore lint/suspicious/noExplicitAny: demo
          const params = req.params as any;

          // Extract function calls from executionPayload
          if ('executionPayload' in params && params.executionPayload?.calls) {
            const calls = params.executionPayload.calls as Array<{
              name: string;
              to: { toString: () => string };
              args: unknown[];
            }>;

            // Extract parameter info for each function call
            for (const call of calls) {
              if (!call.to || !call.name) continue;

              try {
                const contractAddress = call.to.toString();
                const paramInfo = await getFunctionParameterInfoFromContractAddress(
                  pxe,
                  contractAddress,
                  call.name,
                );

                if (!functionCallArgNames[contractAddress]) {
                  functionCallArgNames[contractAddress] = {};
                }

                functionCallArgNames[contractAddress][call.name] = paramInfo;
              } catch (error) {
                // Silently ignore errors for individual calls
                console.warn(`Failed to get parameter info for ${call.name}:`, error);
              }
            }
          }
        } else if (req.method === 'aztec_wmDeployContract' && req.params && typeof req.params === 'object') {
          // For deployContract, we could potentially extract constructor parameter info
          // from the artifact, but this would require a different approach
          // For now, we'll just note that this is a deployment
          // biome-ignore lint/suspicious/noExplicitAny: demo
          const params = req.params as any;
          if ('artifact' in params && params.artifact?.name) {
            // Store a special marker for deployments
            functionCallArgNames['__deployment__'] = {
              [params.artifact.name]: params.constructorName
                ? [{ name: 'constructor', type: params.constructorName }]
                : [{ name: 'constructor', type: 'default' }],
            };
          }
        }
      } catch (error) {
        console.error('Error in functionArgNamesMiddleware:', error);
      }

      // Add to context for downstream use
      context.functionCallArgNames = functionCallArgNames;
    }

    return next();
  };
};
