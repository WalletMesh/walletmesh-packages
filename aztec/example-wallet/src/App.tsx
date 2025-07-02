import { useState, useRef, useEffect } from 'react';
import './App.css';
import Wallet from './components/Wallet.js';
import { CustomPermissionManager } from './components/CustomPermissionManager.js';
import { AllowAskDenyState } from '@walletmesh/router/permissions';

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
  const permissionManagerRef = useRef<CustomPermissionManager | null>(null);

  // Update the permission manager when auto-approve state changes
  useEffect(() => {
    if (permissionManagerRef.current) {
      permissionManagerRef.current.setAutoApprove(autoApprove);
    }
  }, [autoApprove]);

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

  const handleAlwaysAllow = () => {
    if (pendingApproval && permissionManagerRef.current) {
      // Update the permission state to ALLOW
      permissionManagerRef.current.updatePermissionState(
        pendingApproval.chainId as any,
        pendingApproval.method,
        AllowAskDenyState.ALLOW
      );

      // Resolve the approval as true
      pendingApproval.resolve(true);
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
        onAlwaysAllow={handleAlwaysAllow}
        onEnableAutoApprove={handleEnableAutoApprove}
        permissionManagerRef={permissionManagerRef}
      />
    </div>
  );
}

export default App;
