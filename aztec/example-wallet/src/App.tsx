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

  const handleApprovalRequest = async (request: {
    origin: string;
    chainId: string;
    method: string;
    params?: unknown;
  }): Promise<boolean> => {
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
      <Wallet
        pendingApproval={pendingApproval}
        onApprovalResponse={handleApprovalResponse}
        onApprovalRequest={handleApprovalRequest}
      />
    </div>
  );
}

export default App;
