import { useWalletContext } from '../../../core/modal/src/components/WalletContext.js';
import type { WalletContextValue, EnhancedConnection } from '../../../core/modal/src/types.js';

export function useWalletInfo() {
  const {
    recentConnections,
    activeWallets,
    setDefaultWallet,
    availableWallets,
    customWallets
  } = useWalletContext();

  const walletLookup = new Map<string, EnhancedConnection>();

  for (const conn of recentConnections) {
    walletLookup.set(conn.wallet.id, conn);
  }

  return {
    recentConnections,
    walletLookup
  };
}