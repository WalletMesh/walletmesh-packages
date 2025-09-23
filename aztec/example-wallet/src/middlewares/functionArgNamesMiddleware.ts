import type { PXE } from '@aztec/aztec.js';
import { getFunctionParameterInfoFromContractAddress } from '@walletmesh/aztec-helpers';
import type { AztecHandlerContext, AztecWalletMethodMap } from '@walletmesh/aztec-rpc-wallet';
import type { JSONRPCMiddleware } from '@walletmesh/jsonrpc';

export type FunctionArgNames = Record<string, Record<string, Array<{ name: string; type: string }>>>;

interface ExecutionPayload {
  calls?: Array<{
    name: string;
    to: { toString: () => string };
    args: unknown[];
  }>;
}

interface DeploymentParams {
  artifact?: {
    name: string;
    functions?: Array<{
      name: string;
      isInitializer?: boolean;
      parameters?: Array<{
        name?: string;
        type?: { kind?: string };
      }>;
    }>;
  };
  args?: unknown[];
  constructorName?: string;
}

/**
 * Middleware that extracts function parameter information for Aztec transactions.
 * This enriches the context with parameter names and types for better transaction display.
 * Updated to support the latest @walletmesh/aztec-rpc-wallet methods.
 */
export const createFunctionArgNamesMiddleware = (
  pxe: PXE,
): JSONRPCMiddleware<
  AztecWalletMethodMap,
  AztecHandlerContext & { functionCallArgNames?: FunctionArgNames }
> => {
  return async (context, req, next) => {
    // Only process transaction-related methods
    // Updated to use the new method names: aztec_wmExecuteTx and aztec_wmSimulateTx
    if (
      req.method === 'aztec_wmExecuteTx' ||
      req.method === 'aztec_wmSimulateTx' ||
      req.method === 'aztec_wmDeployContract'
    ) {
      const functionCallArgNames: FunctionArgNames = {};

      try {
        if (
          (req.method === 'aztec_wmExecuteTx' || req.method === 'aztec_wmSimulateTx') &&
          req.params &&
          Array.isArray(req.params)
        ) {
          // The new methods take an array with a single ExecutionPayload parameter
          const executionPayload = req.params[0] as ExecutionPayload;

          // Extract function calls from executionPayload
          if (executionPayload?.calls) {
            const calls = executionPayload.calls as Array<{
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
        } else if (req.method === 'aztec_wmDeployContract' && req.params && Array.isArray(req.params)) {
          // For deployContract, extract constructor parameter info from the artifact
          // The params[0] contains { artifact, args, constructorName? }
          const deploymentParams = req.params[0] as DeploymentParams;

          if (deploymentParams?.artifact) {
            const artifact = deploymentParams.artifact;
            const constructorName = deploymentParams.constructorName || 'constructor';

            // Try to extract constructor parameter info from the artifact
            if (artifact.functions) {
              // Find the constructor function in the artifact
              const constructorFn = artifact.functions.find(
                (fn) => fn.name === constructorName || fn.isInitializer,
              );

              if (constructorFn?.parameters) {
                const paramInfo = constructorFn.parameters.map((param) => ({
                  name: param.name || 'param',
                  type: param.type?.kind || 'unknown',
                }));

                functionCallArgNames['__deployment__'] = {
                  [artifact.name]: paramInfo,
                };
              } else {
                // Fallback if we can't find constructor info
                functionCallArgNames['__deployment__'] = {
                  [artifact.name]: [{ name: 'constructor', type: constructorName }],
                };
              }
            } else {
              // Simple fallback
              functionCallArgNames['__deployment__'] = {
                [artifact.name]: [{ name: 'constructor', type: constructorName }],
              };
            }
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
