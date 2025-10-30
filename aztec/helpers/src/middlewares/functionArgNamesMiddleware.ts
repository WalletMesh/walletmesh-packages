import type { AbiType, PXE } from '@aztec/aztec.js';
import { getEnhancedParameterInfo } from '../helpers.js';
import type { EnhancedParameterInfo } from '../types.js';
import type { AztecHandlerContext, AztecWalletMethodMap } from '@walletmesh/aztec-rpc-wallet';
import type { JSONRPCMiddleware } from '@walletmesh/jsonrpc';

export type FunctionArgNames = Record<string, Record<string, EnhancedParameterInfo[]>>;

/**
 * Shared artifact cache for recently deployed contracts.
 * Maps contract address (as string) to its artifact.
 * This helps when contracts are deployed and called in quick succession.
 */
const deploymentArtifactCache = new Map<string, { name: string; artifact: unknown }>();

/**
 * Extracts function argument names for an array of execution payloads (batch execute).
 * This is a helper function that can be used in router-level middleware.
 *
 * @param pxe - The PXE instance to query contract ABIs
 * @param executionPayloads - Array of execution payloads containing calls
 * @returns Function argument names organized by contract address and function name
 */
export async function extractFunctionArgNamesForBatch(
  pxe: PXE,
  executionPayloads: ExecutionPayload[],
): Promise<FunctionArgNames> {
  const functionCallArgNames: FunctionArgNames = {};

  for (const executionPayload of executionPayloads) {
    if (!executionPayload?.calls) continue;

    const calls = executionPayload.calls as Array<{
      name: string;
      to: { toString: () => string };
      args: unknown[];
    }>;

    for (const call of calls) {
      if (!call.to || !call.name) continue;

      try {
        const contractAddress = call.to.toString();
        const paramInfo = await getEnhancedParameterInfo(pxe, contractAddress, call.name);

        if (!functionCallArgNames[contractAddress]) {
          functionCallArgNames[contractAddress] = {};
        }

        functionCallArgNames[contractAddress][call.name] = paramInfo;
      } catch (error) {
        console.warn(`Failed to get parameter info for ${call.name}:`, error);
      }
    }
  }

  return functionCallArgNames;
}

/**
 * Extracts function argument names for a single execution payload.
 * This is a helper function that can be used in router-level middleware.
 *
 * @param pxe - The PXE instance to query contract ABIs
 * @param executionPayload - Single execution payload containing calls
 * @returns Function argument names organized by contract address and function name
 */
export async function extractFunctionArgNamesForSingle(
  pxe: PXE,
  executionPayload: ExecutionPayload,
): Promise<FunctionArgNames> {
  const functionCallArgNames: FunctionArgNames = {};

  if (!executionPayload?.calls) return functionCallArgNames;

  const calls = executionPayload.calls as Array<{
    name: string;
    to: { toString: () => string };
    args: unknown[];
  }>;

  for (const call of calls) {
    if (!call.to || !call.name) continue;

    try {
      const contractAddress = call.to.toString();
      const paramInfo = await getEnhancedParameterInfo(pxe, contractAddress, call.name);

      if (!functionCallArgNames[contractAddress]) {
        functionCallArgNames[contractAddress] = {};
      }

      functionCallArgNames[contractAddress][call.name] = paramInfo;
    } catch (error) {
      console.warn(`Failed to get parameter info for ${call.name}:`, error);
    }
  }

  return functionCallArgNames;
}

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
    console.log('[FunctionArgNamesMiddleware] Processing request:', {
      method: req.method,
      paramsType: typeof req.params,
      isArray: Array.isArray(req.params),
    });

    // Track deployment artifact to cache after successful deployment
    let deploymentArtifact: { name: string; artifact: unknown } | null = null;

    // Only process transaction-related methods
    if (
      req.method === 'aztec_wmExecuteTx' ||
      req.method === 'aztec_wmSimulateTx' ||
      req.method === 'aztec_wmBatchExecute' ||
      req.method === 'aztec_wmDeployContract'
    ) {
      const functionCallArgNames: FunctionArgNames = {};

      console.log('[FunctionArgNamesMiddleware] Matched transaction method:', req.method);

      try {
        if (
          (req.method === 'aztec_wmExecuteTx' || req.method === 'aztec_wmSimulateTx') &&
          req.params &&
          Array.isArray(req.params)
        ) {
          // Single ExecutionPayload methods
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
              if (!call.to || !call.name) {
                console.log('[FunctionArgNamesMiddleware] Skipping call without to/name');
                continue;
              }

              try {
                const contractAddress = call.to.toString();
                console.log('[FunctionArgNamesMiddleware] Fetching param info for:', {
                  contractAddress,
                  functionName: call.name,
                });

                let paramInfo: EnhancedParameterInfo[];

                try {
                  // First, try to get from PXE (for already deployed contracts)
                  paramInfo = await getEnhancedParameterInfo(pxe, contractAddress, call.name);
                } catch (pxeError) {
                  console.log('[FunctionArgNamesMiddleware] PXE lookup failed, trying fallbacks:', {
                    contractAddress,
                    functionName: call.name,
                    cacheSize: deploymentArtifactCache.size,
                    cachedAddresses: Array.from(deploymentArtifactCache.keys()),
                  });

                  // Fallback 1: Try deployment artifact cache (for contracts deployed in this session)
                  const cachedDeployment = deploymentArtifactCache.get(contractAddress);
                  if (cachedDeployment?.artifact) {
                    console.log('[FunctionArgNamesMiddleware] ✓ Found in deployment cache:', {
                      contractAddress,
                      artifactName: cachedDeployment.name,
                    });

                    const artifact = cachedDeployment.artifact as {
                      functions?: Array<{
                        name: string;
                        parameters?: Array<{
                          name?: string;
                          type?: AbiType;
                        }>;
                      }>;
                    };

                    const functionArtifact = artifact.functions?.find((f) => f.name === call.name);
                    if (functionArtifact?.parameters) {
                      paramInfo = functionArtifact.parameters.map((p) => ({
                        name: p.name || 'param',
                        abiType: (p.type as AbiType) || ({ kind: 'field' } as AbiType),
                        typeString: p.type?.kind || 'unknown',
                      }));
                    } else {
                      throw pxeError; // Function not found in cached artifact
                    }
                  } else {
                    // No fallback available, re-throw original error
                    throw pxeError;
                  }
                }

                if (!functionCallArgNames[contractAddress]) {
                  functionCallArgNames[contractAddress] = {};
                }

                functionCallArgNames[contractAddress][call.name] = paramInfo;
                console.log('[FunctionArgNamesMiddleware] Stored param info:', {
                  contractAddress,
                  functionName: call.name,
                  paramCount: paramInfo.length,
                });
              } catch (error) {
                // Silently ignore errors for individual calls
                console.warn(`Failed to get parameter info for ${call.name}:`, error);
              }
            }
          }
        } else if (req.method === 'aztec_wmBatchExecute' && req.params && Array.isArray(req.params)) {
          // Batch execute: params[0] is an array of ExecutionPayloads
          const executionPayloads = req.params[0] as ExecutionPayload[];

          console.log('[FunctionArgNamesMiddleware] Processing batch execute:', {
            executionPayloadsLength: executionPayloads?.length,
            isArray: Array.isArray(executionPayloads),
          });

          // Process each execution payload in the batch
          for (const executionPayload of executionPayloads) {
            if (!executionPayload?.calls) {
              console.log('[FunctionArgNamesMiddleware] Skipping payload without calls');
              continue;
            }

            console.log('[FunctionArgNamesMiddleware] Processing payload with calls:', {
              callsCount: executionPayload.calls.length,
            });

            const calls = executionPayload.calls as Array<{
              name: string;
              to: { toString: () => string };
              args: unknown[];
            }>;

            // Extract parameter info for each function call
            for (const call of calls) {
              if (!call.to || !call.name) {
                console.log('[FunctionArgNamesMiddleware] Skipping call without to/name');
                continue;
              }

              try {
                const contractAddress = call.to.toString();
                console.log('[FunctionArgNamesMiddleware] Fetching param info for:', {
                  contractAddress,
                  functionName: call.name,
                });

                let paramInfo: EnhancedParameterInfo[];

                try {
                  // First, try to get from PXE (for already deployed contracts)
                  paramInfo = await getEnhancedParameterInfo(pxe, contractAddress, call.name);
                } catch (pxeError) {
                  console.log('[FunctionArgNamesMiddleware] PXE lookup failed, trying fallbacks:', {
                    contractAddress,
                    functionName: call.name,
                    cacheSize: deploymentArtifactCache.size,
                    cachedAddresses: Array.from(deploymentArtifactCache.keys()),
                  });

                  // Fallback 1: Try deployment artifact cache (for contracts deployed in this session)
                  const cachedDeployment = deploymentArtifactCache.get(contractAddress);
                  if (cachedDeployment?.artifact) {
                    console.log('[FunctionArgNamesMiddleware] ✓ Found in deployment cache:', {
                      contractAddress,
                      artifactName: cachedDeployment.name,
                    });

                    const artifact = cachedDeployment.artifact as {
                      functions?: Array<{
                        name: string;
                        parameters?: Array<{
                          name?: string;
                          type?: AbiType;
                        }>;
                      }>;
                    };

                    const functionArtifact = artifact.functions?.find((f) => f.name === call.name);
                    if (functionArtifact?.parameters) {
                      paramInfo = functionArtifact.parameters.map((p) => ({
                        name: p.name || 'param',
                        abiType: (p.type as AbiType) || ({ kind: 'field' } as AbiType),
                        typeString: p.type?.kind || 'unknown',
                      }));
                    } else {
                      throw pxeError; // Function not found in cached artifact
                    }
                  } else {
                    // No fallback available, re-throw original error
                    throw pxeError;
                  }
                }

                if (!functionCallArgNames[contractAddress]) {
                  functionCallArgNames[contractAddress] = {};
                }

                functionCallArgNames[contractAddress][call.name] = paramInfo;
                console.log('[FunctionArgNamesMiddleware] Stored param info:', {
                  contractAddress,
                  functionName: call.name,
                  paramCount: paramInfo.length,
                });
              } catch (error) {
                // Silently ignore errors for individual calls
                console.warn(`Failed to get parameter info for ${call.name}:`, error);
              }
            }
          }
        } else if (req.method === 'aztec_wmDeployContract' && req.params && Array.isArray(req.params)) {
          // For deployContract, extract constructor parameter info from the artifact
          // The params[0] contains { artifact, args, constructorName?, salt? }
          const deploymentParams = req.params[0] as DeploymentParams & { salt?: unknown };

          console.log('[FunctionArgNamesMiddleware] Processing deployment:', {
            hasArtifact: !!deploymentParams?.artifact,
            artifactName: deploymentParams?.artifact?.name,
            hasArgs: !!deploymentParams?.args,
            argsLength: deploymentParams?.args?.length,
            constructorName: deploymentParams?.constructorName,
          });

          if (deploymentParams?.artifact) {
            const artifact = deploymentParams.artifact;

            // Store artifact to cache after deployment succeeds
            deploymentArtifact = {
              name: artifact.name,
              artifact: artifact,
            };
            console.log('[FunctionArgNamesMiddleware] Stored artifact for post-deployment caching:', {
              artifactName: artifact.name,
            });

            const constructorName = deploymentParams.constructorName || 'constructor';

            console.log('[FunctionArgNamesMiddleware] Artifact details:', {
              name: artifact.name,
              hasFunctions: !!artifact.functions,
              functionsCount: artifact.functions?.length,
            });

            // Try to extract constructor parameter info from the artifact
            if (artifact.functions) {
              // Find the constructor function in the artifact
              const constructorFn = artifact.functions.find(
                (fn) => fn.name === constructorName || fn.isInitializer,
              );

              if (constructorFn?.parameters) {
                const paramInfo: EnhancedParameterInfo[] = constructorFn.parameters.map((param) => {
                  const abiType: AbiType = (param.type as AbiType) || ({ kind: 'field' } as AbiType);
                  return {
                    name: param.name || 'param',
                    abiType,
                    typeString: param.type?.kind || 'unknown',
                  };
                });

                functionCallArgNames['__deployment__'] = {
                  [artifact.name]: paramInfo,
                };
              } else {
                // Fallback if we can't find constructor info
                functionCallArgNames['__deployment__'] = {
                  [artifact.name]: [
                    {
                      name: 'constructor',
                      abiType: { kind: 'field' } as AbiType,
                      typeString: constructorName,
                    },
                  ],
                };
              }
            } else {
              // Simple fallback
              functionCallArgNames['__deployment__'] = {
                [artifact.name]: [
                  {
                    name: 'constructor',
                    abiType: { kind: 'field' } as AbiType,
                    typeString: constructorName,
                  },
                ],
              };
            }
          }
        }
      } catch (error) {
        console.error('[FunctionArgNamesMiddleware] Error:', error);
      }

      // Add to context for downstream use
      const argNamesCount = Object.keys(functionCallArgNames).length;
      console.log('[FunctionArgNamesMiddleware] Setting context.functionCallArgNames:', {
        contractCount: argNamesCount,
        contracts: Object.keys(functionCallArgNames),
      });
      context.functionCallArgNames = functionCallArgNames;
    } else {
      console.log('[FunctionArgNamesMiddleware] Method not matched for processing:', req.method);
    }

    // Call the handler and get the result
    const result = await next();

    // If this was a deployment and it succeeded, cache the artifact for future method calls
    if (deploymentArtifact) {
      console.log('[FunctionArgNamesMiddleware] Deployment completed, checking result for caching:', {
        hasResult: !!result,
        resultType: typeof result,
        resultKeys: result && typeof result === 'object' ? Object.keys(result) : [],
        hasContractAddress: result && typeof result === 'object' && 'contractAddress' in result,
      });

      if (result && typeof result === 'object' && 'contractAddress' in result) {
        const contractAddressObj = (result as { contractAddress?: { toString?: () => string } })
          .contractAddress;
        const contractAddress = contractAddressObj?.toString
          ? contractAddressObj.toString()
          : String(contractAddressObj);

        if (contractAddress && contractAddress !== 'undefined') {
          deploymentArtifactCache.set(contractAddress, deploymentArtifact);
          console.log('[FunctionArgNamesMiddleware] ✓ Cached deployment artifact for future lookups:', {
            contractAddress,
            artifactName: deploymentArtifact.name,
            cacheSize: deploymentArtifactCache.size,
            allCachedAddresses: Array.from(deploymentArtifactCache.keys()),
          });
        } else {
          console.warn('[FunctionArgNamesMiddleware] Deployment succeeded but contract address is invalid:', {
            contractAddress,
            contractAddressObj,
          });
        }
      } else {
        console.warn('[FunctionArgNamesMiddleware] Deployment completed but result structure unexpected');
      }
    }

    return result;
  };
};
