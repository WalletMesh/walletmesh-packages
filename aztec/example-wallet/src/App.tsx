import { useState } from 'react';
import './App.css';
import Wallet from './components/Wallet.js';
import { ToastProvider } from './contexts/ToastContext.js';

interface ApprovalRequest {
  origin: string;
  chainId: string;
  method: string;
  params?: unknown;
  resolve: (approved: boolean) => void;
}

function App() {
  const [pendingApproval, setPendingApproval] = useState<ApprovalRequest | null>(null);
  const [autoApprove, setAutoApprove] = useState(false);

  const handleApprovalRequest = async (request: {
    origin: string;
    chainId: string;
    method: string;
    params?: unknown;
  }): Promise<boolean> => {
    // Note: Auto-approve is handled in the Wallet component's permission manager
    // This handler is only called when user interaction is needed

    // Show the approval UI
    return new Promise((resolve) => {
      setPendingApproval({
        ...request,
        resolve: (approved: boolean) => {
          resolve(approved);
          setPendingApproval(null);
        },
      });
    });
  };

  const handleApprovalResponse = (approved: boolean) => {
    if (pendingApproval) {
      pendingApproval.resolve(approved);
    }
  };

  const handleEnableAutoApprove = () => {
    // Enable auto-approve globally
    setAutoApprove(true);

    // If there's a pending approval, approve it immediately
    if (pendingApproval) {
      pendingApproval.resolve(true);
    }
  };

  return (
    <ToastProvider>
      <div className="App">
        <h1>WalletMesh Aztec Wallet</h1>

        <div className="auto-approve-toggle">
          <label>
            <input type="checkbox" checked={autoApprove} onChange={(e) => setAutoApprove(e.target.checked)} />
            Auto Approve All Requests
          </label>
          {autoApprove && (
            <p className="auto-approve-warning">
              ⚠️ Warning: All requests will be automatically approved without user confirmation.
            </p>
          )}
        </div>

        <Wallet
          pendingApproval={pendingApproval}
          onApprovalResponse={handleApprovalResponse}
          onApprovalRequest={handleApprovalRequest}
          onEnableAutoApprove={handleEnableAutoApprove}
          autoApprove={autoApprove}
        />
      </div>
    </ToastProvider>
  );
}

export default App;
