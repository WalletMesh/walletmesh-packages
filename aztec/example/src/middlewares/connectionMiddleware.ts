import type { AztecChainWalletMiddleware } from '@walletmesh/aztec-rpc-wallet';

export const createConnectionMiddleware = (
  isConnectedRef: React.MutableRefObject<boolean>,
): AztecChainWalletMiddleware => {
  return async (_context, req, next) => {
    if (req.method === 'aztec_connect') {
      return next();
    }
    if (req.method === 'aztec_getAccount' && isConnectedRef.current) {
      return next();
    }
    if (!isConnectedRef.current) {
      throw new Error('Wallet not connected. Please connect first.');
    }
    return next();
  };
};
