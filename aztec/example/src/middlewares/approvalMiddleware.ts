import type { AztecWalletContext, AztecChainWalletMiddleware } from '@walletmesh/aztec-rpc-wallet';
import type { FunctionArgNames } from './functionArgNamesMiddleware';
import type { HistoryEntry } from './historyMiddleware';

export const createApprovalMiddleware = (
  setPendingRequest: React.Dispatch<
    React.SetStateAction<{
      method: string;
      params: unknown;
      origin: string;
      functionArgNames?: FunctionArgNames;
      onApprove: () => void;
      onDeny: () => void;
    } | null>
  >,
  setRequestHistory: React.Dispatch<React.SetStateAction<HistoryEntry[]>>,
  isConnectedRef: React.MutableRefObject<boolean>,
): AztecChainWalletMiddleware => {
  return async (context: AztecWalletContext & { functionCallArgNames?: FunctionArgNames }, req, next) => {
    return new Promise((resolve, reject) => {
      setPendingRequest({
        method: String(req.method),
        params: req.params,
        origin: window.location.origin,
        functionArgNames: context.functionCallArgNames,
        onApprove: async () => {
          setPendingRequest(null);
          if (req.method === 'aztec_connect') {
            isConnectedRef.current = true;
          }
          try {
            const result = await next();
            setRequestHistory((prev) =>
              prev.map((item, i) => (i === prev.length - 1 ? { ...item, status: 'Approved' } : item)),
            );
            resolve(result);
          } catch (error) {
            console.error('Error in approval flow:', error);
            reject(error);
          }
        },
        onDeny: () => {
          setPendingRequest(null);
          setRequestHistory((prev) =>
            prev.map((item, i) => (i === prev.length - 1 ? { ...item, status: 'Denied' } : item)),
          );
          if (req.method === 'aztec_connect') {
            isConnectedRef.current = false;
          }
          reject(new Error('User denied the request.'));
        },
      });
    });
  };
};
