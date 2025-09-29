import { useAccount, useWalletMeshContext } from '@walletmesh/modal-react/all';
import { useEffect } from 'react';

export function AztecDebugger() {
  const { isConnected, address, chainType, walletId } = useAccount();
  const { client } = useWalletMeshContext();

  useEffect(() => {
    if (chainType === 'aztec') {
      console.log('[AztecDebugger] Aztec wallet detected:', {
        isConnected,
        address,
        chainType,
        walletId,
      });

      // Try to get session info directly if client available
      if (client && 'getState' in client) {
        try {
          const state = (client as any).getState?.();
          console.log('[AztecDebugger] Modal state:', state);
        } catch (e) {
          console.error('[AztecDebugger] Could not access client state:', e);
        }
      }
    }
  }, [isConnected, address, chainType, walletId, client]);

  if (chainType !== 'aztec') {
    return null;
  }

  return (
    <div
      style={{
        padding: '10px',
        margin: '10px',
        backgroundColor: '#fee',
        border: '1px solid #fcc',
        borderRadius: '5px',
      }}
    >
      <h4>Aztec Wallet Debug Info</h4>
      <div>Is Connected: {isConnected ? 'YES' : 'NO'}</div>
      <div>Address: {address || 'None'}</div>
      <div>Chain Type: {chainType}</div>
      <div>Wallet ID: {walletId || 'None'}</div>
    </div>
  );
}
