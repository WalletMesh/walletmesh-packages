import { useState } from 'react';
import './App.css';
import type { FunctionArgNames } from '@walletmesh/aztec-helpers';
import Wallet from './components/Wallet.js';
import { ToastProvider } from './contexts/ToastContext.js';

interface ApprovalRequest {
  origin: string;
  chainId: string;
  method: string;
  params?: unknown;
  functionArgNames?: FunctionArgNames;
  resolve: (approved: boolean) => void;
}

function App() {
  // Use an array queue instead of single pending approval to handle concurrent requests
  // This ensures each request gets its own approval and prevents overwriting/orphaning
  const [approvalQueue, setApprovalQueue] = useState<ApprovalRequest[]>([]);
  const [autoApprove, setAutoApprove] = useState(false);

  const handleApprovalRequest = async (request: {
    origin: string;
    chainId: string;
    method: string;
    params?: unknown;
    functionArgNames?: FunctionArgNames;
  }): Promise<boolean> => {
    // Note: Auto-approve is handled in the Wallet component's permission manager
    // This handler is only called when user interaction is needed

    // Add to approval queue (FIFO) instead of overwriting
    return new Promise((resolve) => {
      const approvalRequest: ApprovalRequest = {
        ...request,
        resolve: (approved: boolean) => {
          resolve(approved);
          // Remove this specific request from queue when resolved
          setApprovalQueue((prev) => prev.slice(1));
        },
      };
      // Add to end of queue
      setApprovalQueue((prev) => [...prev, approvalRequest]);
    });
  };

  const handleApprovalResponse = (approved: boolean) => {
    // Resolve the FIRST item in queue (FIFO order)
    const currentApproval = approvalQueue[0];
    if (currentApproval) {
      currentApproval.resolve(approved);
    }
  };

  const handleEnableAutoApprove = () => {
    setAutoApprove(true);
    // Approve all pending approvals in the queue
    for (const approval of approvalQueue) {
      approval.resolve(true);
    }
  };

  // Get current pending approval (first in queue) for backward compatibility
  const pendingApproval = approvalQueue[0] || null;
  const approvalQueueLength = approvalQueue.length;

  return (
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
        approvalQueueLength={approvalQueueLength}
        onApprovalResponse={handleApprovalResponse}
        onApprovalRequest={handleApprovalRequest}
        onEnableAutoApprove={handleEnableAutoApprove}
        autoApprove={autoApprove}
      />
    </div>
  );
}

const WrappedApp = () => (
  <ToastProvider>
    <App />
  </ToastProvider>
);

export default WrappedApp;
