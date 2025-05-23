import { useState } from 'react';
import './App.css';
import DApp from './components/DApp.js';
import Wallet from './components/Wallet.js';

import { ToastProvider } from './contexts/ToastContext.js';
import type { ChainId } from '@walletmesh/router';

/**
 * The main application component for the Aztec example.
 * It sets up the DApp and Wallet components and manages the UI flow
 * for permission approvals between them. It also initializes the ToastProvider
 * for displaying notifications.
 */
function App() {
  /**
   * State to hold details of a pending approval request that requires user interaction.
   * When not null, an approval UI is typically shown (managed by the Wallet component).
   */
  const [pendingApproval, setPendingApproval] = useState<{
    origin: string;
    chainId: ChainId;
    method: string;
    params?: unknown;
    resolve: (approved: boolean) => void;
  } | null>(null);

  /**
   * Handles an approval request originating from the Wallet component (typically via ApprovalPermissionManager).
   * It sets the `pendingApproval` state to display an approval UI and returns a promise
   * that will be resolved when the user responds to the approval prompt.
   *
   * @param request - The details of the approval request.
   * @returns A promise that resolves to `true` if approved, `false` otherwise.
   */
  const handleApprovalRequest = async (request: {
    origin: string;
    chainId: ChainId;
    method: string;
    params?: unknown;
  }): Promise<boolean> => {
    return new Promise((resolve) => {
      setPendingApproval({ ...request, resolve });
    });
  };

  /**
   * Handles the user's response (approve/deny) from the approval UI.
   * It resolves the pending promise created by `handleApprovalRequest` and clears
   * the `pendingApproval` state.
   *
   * @param approved - Boolean indicating whether the request was approved by the user.
   */
  const handleApprovalResponse = (approved: boolean) => {
    if (pendingApproval) {
      pendingApproval.resolve(approved);
      setPendingApproval(null);
    }
  };

  return (
    <ToastProvider>
      <div className="app-container">

        <div className="pane">
          <h2>DApp</h2>
          <DApp />
        </div>
        <div className="pane wallet-pane">
          <h2>Wallet Server</h2>
          <Wallet
            pendingApproval={pendingApproval}
            onApprovalResponse={handleApprovalResponse}
            onApprovalRequest={handleApprovalRequest}
          />
        </div>
      </div>
    </ToastProvider>
  );
}

export default App;
