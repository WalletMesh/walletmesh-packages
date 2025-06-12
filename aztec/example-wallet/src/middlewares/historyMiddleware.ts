import type { JSONRPCMiddleware } from '@walletmesh/jsonrpc';
import type { AztecWalletMethodMap, AztecHandlerContext } from '@walletmesh/aztec-rpc-wallet';
import type { FunctionArgNames } from './functionArgNamesMiddleware';

export type HistoryEntry = {
  method: string;
  params: unknown;
  origin: string;
  time: string;
  status?: string;
  functionArgNames?: FunctionArgNames;
  id?: number;
};

export const createHistoryMiddleware = (
  setRequestHistory: React.Dispatch<React.SetStateAction<HistoryEntry[]>>,
): JSONRPCMiddleware<
  AztecWalletMethodMap,
  AztecHandlerContext & { functionCallArgNames?: FunctionArgNames }
> => {
  return async (context, req, next) => {
    const timestamp = new Date().toLocaleString();
    const entry: HistoryEntry = {
      method: String(req.method),
      params: req.params,
      origin: window.location.origin,
      time: timestamp,
      functionArgNames: context.functionCallArgNames,
    };

    // Add new entry
    const newHistoryId = Date.now(); // Use timestamp as unique identifier
    setRequestHistory((prev) => [...prev, { ...entry, id: newHistoryId }]);

    try {
      const result = await next();
      setRequestHistory((prev) =>
        prev.map((item) => (item.id === newHistoryId ? { ...item, status: 'Approved' } : item)),
      );
      return result;
    } catch (error) {
      setRequestHistory((prev) =>
        prev.map((item) => (item.id === newHistoryId ? { ...item, status: 'Denied' } : item)),
      );
      throw error;
    }
  };
};
