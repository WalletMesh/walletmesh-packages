import type { AztecAddress } from '@aztec/aztec.js';
import type { AztecHandlerContext, AztecWalletMethodMap } from '@walletmesh/aztec-rpc-wallet';
import type { JSONRPCMiddleware } from '@walletmesh/jsonrpc';
import type { SessionData } from '@walletmesh/router';
import type { FunctionArgNames } from './functionArgNamesMiddleware.js';

interface ExecutionPayloadCall {
  name: string;
  to: AztecAddress | { toString: () => string };
  args: unknown[];
}

interface ExecutionPayload {
  calls?: ExecutionPayloadCall[];
}

export interface FunctionCallSummary {
  contractAddress: string;
  functionName: string;
  args: unknown[];
}

export interface TransactionSummary {
  functionCalls: FunctionCallSummary[];
}

/**
 * Builds a transaction summary from an array of execution payloads (batch execute).
 * This is a helper function that can be used in router-level middleware.
 *
 * @param executionPayloads - Array of execution payloads containing calls
 * @returns Transaction summary with all function calls
 */
export function buildTransactionSummaryForBatch(
  executionPayloads: ExecutionPayload[] | undefined,
): TransactionSummary | undefined {
  if (!Array.isArray(executionPayloads) || executionPayloads.length === 0) {
    return undefined;
  }

  const allFunctionCalls: FunctionCallSummary[] = [];

  for (const payload of executionPayloads) {
    if (payload?.calls && Array.isArray(payload.calls)) {
      for (const call of payload.calls) {
        allFunctionCalls.push({
          contractAddress: call.to?.toString?.() ?? 'unknown',
          functionName: call.name ?? 'unknown',
          args: Array.isArray(call.args) ? call.args : [],
        });
      }
    }
  }

  if (allFunctionCalls.length === 0) {
    return undefined;
  }

  return { functionCalls: allFunctionCalls };
}

/**
 * Builds a transaction summary from a single execution payload.
 * This is a helper function that can be used in router-level middleware.
 *
 * @param executionPayload - Single execution payload containing calls
 * @returns Transaction summary with function calls
 */
export function buildTransactionSummaryForSingle(
  executionPayload: ExecutionPayload | undefined,
): TransactionSummary | undefined {
  if (!executionPayload?.calls || executionPayload.calls.length === 0) {
    return undefined;
  }

  const functionCalls: FunctionCallSummary[] = executionPayload.calls.map((call) => ({
    contractAddress: call.to?.toString?.() ?? 'unknown',
    functionName: call.name ?? 'unknown',
    args: Array.isArray(call.args) ? call.args : [],
  }));

  return { functionCalls };
}

const summaryStore = new Map<string, { summary: TransactionSummary; functionArgNames?: FunctionArgNames }>();

function getSessionKey(session?: SessionData): string {
  return session?.id ?? 'default-session';
}

function buildSummary(payload: ExecutionPayload | undefined): TransactionSummary | undefined {
  if (!payload?.calls || payload.calls.length === 0) {
    return undefined;
  }

  const functionCalls: FunctionCallSummary[] = payload.calls.map((call) => ({
    contractAddress: call.to?.toString?.() ?? 'unknown',
    functionName: call.name ?? 'unknown',
    args: Array.isArray(call.args) ? call.args : [],
  }));

  return { functionCalls };
}

function buildBatchSummary(payloads: ExecutionPayload[] | undefined): TransactionSummary | undefined {
  if (!Array.isArray(payloads) || payloads.length === 0) {
    return undefined;
  }

  const allFunctionCalls: FunctionCallSummary[] = [];

  for (const payload of payloads) {
    if (payload?.calls && Array.isArray(payload.calls)) {
      for (const call of payload.calls) {
        allFunctionCalls.push({
          contractAddress: call.to?.toString?.() ?? 'unknown',
          functionName: call.name ?? 'unknown',
          args: Array.isArray(call.args) ? call.args : [],
        });
      }
    }
  }

  if (allFunctionCalls.length === 0) {
    return undefined;
  }

  return { functionCalls: allFunctionCalls };
}

export const createTransactionSummaryMiddleware = (): JSONRPCMiddleware<
  AztecWalletMethodMap,
  AztecHandlerContext & {
    functionCallArgNames?: FunctionArgNames;
    transactionSummary?: TransactionSummary;
  }
> => {
  return async (context, req, next) => {
    const sessionKey = getSessionKey(context.session as SessionData | undefined);

    // Handle single execution payload methods
    if (
      (req.method === 'aztec_wmExecuteTx' ||
        req.method === 'aztec_wmSimulateTx' ||
        req.method === 'aztec_wmDeployContract') &&
      Array.isArray(req.params) &&
      req.params.length > 0
    ) {
      const payload = req.params[0] as ExecutionPayload;
      const summary = buildSummary(payload);
      if (summary) {
        summaryStore.set(sessionKey, { summary, functionArgNames: context.functionCallArgNames });
        context.transactionSummary = summary;
      }
    }

    // Handle atomic batch execution
    if (req.method === 'aztec_wmBatchExecute' && Array.isArray(req.params) && req.params.length > 0) {
      console.log('[TransactionSummary] Processing aztec_wmBatchExecute:', {
        paramsLength: req.params.length,
        firstParamType: typeof req.params[0],
        isArray: Array.isArray(req.params[0]),
      });
      const executionPayloads = req.params[0] as ExecutionPayload[];
      const summary = buildBatchSummary(executionPayloads);
      console.log('[TransactionSummary] Built batch summary:', {
        hasSummary: !!summary,
        functionCallsCount: summary?.functionCalls.length,
        hasFunctionArgNames: !!context.functionCallArgNames,
      });
      if (summary) {
        summaryStore.set(sessionKey, { summary, functionArgNames: context.functionCallArgNames });
        context.transactionSummary = summary;
      }
    }

    if (req.method === 'aztec_proveTx' || req.method === 'aztec_sendTx') {
      const stored = summaryStore.get(sessionKey);
      if (stored) {
        context.transactionSummary = stored.summary;
        if (stored.functionArgNames) {
          context.functionCallArgNames = stored.functionArgNames;
        }
      }
    }

    try {
      const result = await next();
      if (req.method === 'aztec_sendTx') {
        summaryStore.delete(sessionKey);
      }
      return result;
    } catch (error) {
      if (req.method === 'aztec_sendTx') {
        summaryStore.delete(sessionKey);
      }
      throw error;
    }
  };
};
