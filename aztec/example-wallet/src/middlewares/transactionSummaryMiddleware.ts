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

export const createTransactionSummaryMiddleware = (): JSONRPCMiddleware<
  AztecWalletMethodMap,
  AztecHandlerContext & {
    functionCallArgNames?: FunctionArgNames;
    transactionSummary?: TransactionSummary;
  }
> => {
  return async (context, req, next) => {
    const sessionKey = getSessionKey(context.session as SessionData | undefined);

    if (
      (req.method === 'aztec_wmExecuteTx' || req.method === 'aztec_wmSimulateTx' || req.method === 'aztec_wmDeployContract') &&
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
