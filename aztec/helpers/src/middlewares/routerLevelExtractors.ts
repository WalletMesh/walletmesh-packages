/**
 * @module routerLevelExtractors
 *
 * Router-Level Parameter Extractors for Aztec WalletMesh Methods
 *
 * This module provides type-safe extraction functions for WalletMesh method parameters
 * at the ROUTER level, before the serializer transforms them.
 *
 * ## Parameter Format Differences
 *
 * **Router Level** (before serializer):
 * - Parameters are in OBJECT format
 * - Example: `{ executionPayload: {...}, sendOptions: {} }`
 * - This is the format sent by `AztecDappWallet` via `routerProvider.call()`
 * - Used by middleware and permission managers at the router layer
 *
 * **Wallet Level** (after serializer):
 * - Parameters are in TUPLE format
 * - Example: `[executionPayload, sendOptions]`
 * - The serializer (`@walletmesh/aztec-rpc-wallet/src/wallet/serializers.ts`)
 *   performs the transformation from object → tuple
 * - Used by wallet node handlers
 *
 * ## When to Use These Extractors
 *
 * Use these extractors when:
 * - Implementing router-level middleware
 * - Checking permissions before serialization
 * - Extracting transaction data for approval UI
 * - Any operation that runs BEFORE the serializer
 *
 * Do NOT use these extractors when:
 * - Working at the wallet node level (use tuple format directly)
 * - After serialization has occurred
 *
 * @example
 * ```typescript
 * // In a router-level middleware
 * router.addMiddleware(async (context, request, next) => {
 *   if (request.method === 'wm_call') {
 *     const callParams = request.params as { call?: { method?: string; params?: unknown[] } };
 *
 *     if (callParams.call?.method === 'aztec_wmBatchExecute') {
 *       const params = extractBatchExecuteParams(callParams.call.params);
 *       if (params?.executionPayloads) {
 *         console.log(`Processing batch with ${params.executionPayloads.length} operations`);
 *       }
 *     }
 *   }
 *   return next();
 * });
 * ```
 */

interface ExecutionPayloadCall {
  name: string;
  to: { toString: () => string } | string;
  args: unknown[];
  selector?: string;
  type?: string;
  isStatic?: boolean;
  returnTypes?: unknown[];
}

/**
 * ExecutionPayload structure as used at the router level
 */
export interface ExecutionPayload {
  calls?: ExecutionPayloadCall[];
  authWitnesses?: unknown[];
  capsules?: unknown[];
  extraHashedArgs?: unknown[];
}

/**
 * Router-level params for aztec_wmBatchExecute
 */
export interface BatchExecuteParams {
  executionPayloads?: ExecutionPayload[];
  sendOptions?: unknown;
}

/**
 * Router-level params for aztec_wmExecuteTx
 */
export interface ExecuteTxParams {
  executionPayload?: ExecutionPayload;
  sendOptions?: unknown;
}

/**
 * Router-level params for aztec_wmSimulateTx
 */
export interface SimulateTxParams {
  executionPayload?: ExecutionPayload;
}

/**
 * Router-level params for aztec_wmDeployContract
 */
export interface DeployContractParams {
  artifact?: unknown;
  args?: unknown[];
  constructorName?: string;
}

/**
 * Extracts parameters for aztec_wmBatchExecute from router-level object format.
 *
 * At the router level, params are: `{ executionPayloads: [...], sendOptions?: {} }`
 * After serialization, they become: `[executionPayloads, sendOptions]`
 *
 * @param methodParams - The params array from the JSON-RPC request (call.params)
 * @returns Extracted batch execute parameters, or undefined if invalid
 *
 * @example
 * ```typescript
 * const params = extractBatchExecuteParams(callParams.call.params);
 * if (params?.executionPayloads) {
 *   for (const payload of params.executionPayloads) {
 *     // Process each payload
 *   }
 * }
 * ```
 */
export function extractBatchExecuteParams(methodParams: unknown): BatchExecuteParams | undefined {
  if (!Array.isArray(methodParams) || methodParams.length === 0) {
    return undefined;
  }

  const paramsObj = methodParams[0];

  // Validate it's an object with the expected structure (not an array)
  if (typeof paramsObj !== 'object' || paramsObj === null || Array.isArray(paramsObj)) {
    return undefined;
  }

  const batchParams = paramsObj as BatchExecuteParams;

  // Validate executionPayloads is an array
  if (batchParams.executionPayloads !== undefined && !Array.isArray(batchParams.executionPayloads)) {
    return undefined;
  }

  return batchParams;
}

/**
 * Extracts parameters for aztec_wmExecuteTx from router-level object format.
 *
 * At the router level, params are: `{ executionPayload: {...}, sendOptions?: {} }`
 * After serialization, they become: `[executionPayload, sendOptions]`
 *
 * @param methodParams - The params array from the JSON-RPC request (call.params)
 * @returns Extracted execute tx parameters, or undefined if invalid
 *
 * @example
 * ```typescript
 * const params = extractExecuteTxParams(callParams.call.params);
 * if (params?.executionPayload?.calls) {
 *   for (const call of params.executionPayload.calls) {
 *     console.log(`Function: ${call.name}`);
 *   }
 * }
 * ```
 */
export function extractExecuteTxParams(methodParams: unknown): ExecuteTxParams | undefined {
  if (!Array.isArray(methodParams) || methodParams.length === 0) {
    return undefined;
  }

  const paramsObj = methodParams[0];

  // Validate it's an object with the expected structure (not an array)
  if (typeof paramsObj !== 'object' || paramsObj === null || Array.isArray(paramsObj)) {
    return undefined;
  }

  const executeParams = paramsObj as ExecuteTxParams;

  // Validate executionPayload structure if present
  if (
    executeParams.executionPayload !== undefined &&
    (typeof executeParams.executionPayload !== 'object' || executeParams.executionPayload === null)
  ) {
    return undefined;
  }

  return executeParams;
}

/**
 * Extracts parameters for aztec_wmSimulateTx from router-level object format.
 *
 * At the router level, params are: `{ executionPayload: {...} }`
 * After serialization, they become: `[executionPayload]`
 *
 * @param methodParams - The params array from the JSON-RPC request (call.params)
 * @returns Extracted simulate tx parameters, or undefined if invalid
 *
 * @example
 * ```typescript
 * const params = extractSimulateTxParams(callParams.call.params);
 * if (params?.executionPayload) {
 *   // Prepare simulation data
 * }
 * ```
 */
export function extractSimulateTxParams(methodParams: unknown): SimulateTxParams | undefined {
  if (!Array.isArray(methodParams) || methodParams.length === 0) {
    return undefined;
  }

  const paramsObj = methodParams[0];

  // Validate it's an object with the expected structure (not an array)
  if (typeof paramsObj !== 'object' || paramsObj === null || Array.isArray(paramsObj)) {
    return undefined;
  }

  const simulateParams = paramsObj as SimulateTxParams;

  // Validate executionPayload structure if present
  if (
    simulateParams.executionPayload !== undefined &&
    (typeof simulateParams.executionPayload !== 'object' || simulateParams.executionPayload === null)
  ) {
    return undefined;
  }

  return simulateParams;
}

/**
 * Extracts parameters for aztec_wmDeployContract from router-level object format.
 *
 * At the router level, params are: `{ artifact: {...}, args: [...], constructorName?: string }`
 * After serialization, they become: `[{ artifact, args, constructorName }]`
 *
 * @param methodParams - The params array from the JSON-RPC request (call.params)
 * @returns Extracted deploy contract parameters, or undefined if invalid
 *
 * @example
 * ```typescript
 * const params = extractDeployContractParams(callParams.call.params);
 * if (params?.artifact && params?.args) {
 *   console.log(`Deploying contract with ${params.args.length} constructor args`);
 * }
 * ```
 */
export function extractDeployContractParams(methodParams: unknown): DeployContractParams | undefined {
  if (!Array.isArray(methodParams) || methodParams.length === 0) {
    return undefined;
  }

  const paramsObj = methodParams[0];

  // Validate it's an object with the expected structure (not an array)
  if (typeof paramsObj !== 'object' || paramsObj === null || Array.isArray(paramsObj)) {
    return undefined;
  }

  const deployParams = paramsObj as DeployContractParams;

  // Validate args is an array if present
  if (deployParams.args !== undefined && !Array.isArray(deployParams.args)) {
    return undefined;
  }

  return deployParams;
}

/**
 * Map of Aztec WalletMesh methods to their router-level parameter types
 */
export interface RouterMethodParamMap {
  aztec_wmBatchExecute: BatchExecuteParams;
  aztec_wmExecuteTx: ExecuteTxParams;
  aztec_wmSimulateTx: SimulateTxParams;
  aztec_wmDeployContract: DeployContractParams;
}

/**
 * Generic extractor that dispatches to the appropriate method-specific extractor
 * based on the method name.
 *
 * @param method - The Aztec WalletMesh method name
 * @param methodParams - The params array from the JSON-RPC request
 * @returns Extracted parameters for the specified method, or undefined if invalid
 *
 * @example
 * ```typescript
 * const method = callParams.call?.method;
 * if (method && isAztecWalletMeshMethod(method)) {
 *   const params = extractRouterLevelParams(method, callParams.call.params);
 *   // TypeScript knows the correct param type based on the method
 * }
 * ```
 */
export function extractRouterLevelParams<M extends keyof RouterMethodParamMap>(
  method: M,
  methodParams: unknown,
): RouterMethodParamMap[M] | undefined {
  switch (method) {
    case 'aztec_wmBatchExecute':
      return extractBatchExecuteParams(methodParams) as RouterMethodParamMap[M] | undefined;
    case 'aztec_wmExecuteTx':
      return extractExecuteTxParams(methodParams) as RouterMethodParamMap[M] | undefined;
    case 'aztec_wmSimulateTx':
      return extractSimulateTxParams(methodParams) as RouterMethodParamMap[M] | undefined;
    case 'aztec_wmDeployContract':
      return extractDeployContractParams(methodParams) as RouterMethodParamMap[M] | undefined;
    default:
      return undefined;
  }
}

/**
 * Type guard to check if a method is an Aztec WalletMesh method
 *
 * @param method - The method name to check
 * @returns True if the method is an Aztec WalletMesh method
 */
export function isAztecWalletMeshMethod(method: string): method is keyof RouterMethodParamMap {
  return (
    method === 'aztec_wmBatchExecute' ||
    method === 'aztec_wmExecuteTx' ||
    method === 'aztec_wmSimulateTx' ||
    method === 'aztec_wmDeployContract'
  );
}
