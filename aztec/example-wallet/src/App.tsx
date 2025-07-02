import { useState } from 'react';
import './App.css';
import Wallet from './components/Wallet.js';

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
    // If auto-approve is enabled, automatically approve all requests
    if (autoApprove) {
      return true;
    }

    // Otherwise, show the approval UI
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

  return (
    <div className="App">
      <h1>WalletMesh Aztec Wallet</h1>

      <div className="auto-approve-toggle">
        <label>
          <input
            type="checkbox"
            checked={autoApprove}
            onChange={(e) => setAutoApprove(e.target.checked)}
          />
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
      />
    </div>
  );
}

export default App;
