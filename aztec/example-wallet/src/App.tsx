<<<<<<< HEAD
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from 'react';
import './App.css';
import Wallet from './components/Wallet.js';
import { CustomPermissionManager } from './components/CustomPermissionManager.js';
import { AllowAskDenyState } from '@walletmesh/router/permissions';
import { ToastProvider, useToast } from './contexts/ToastContext.js';
import type { HumanReadableChainPermissions } from '@walletmesh/router';
=======
import { useState } from 'react';
import './App.css';
import Wallet from './components/Wallet.js';
import { ToastProvider } from './contexts/ToastContext.js';
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> c65878d3 (feat(examples): add comprehensive example applications)
=======
import type { FunctionArgNames } from './middlewares/functionArgNamesMiddleware.js';
>>>>>>> bd392add (feat(modal-react,modal-core): enhance Aztec transaction flow with simulation, summaries, and improved execution)
=======
import type { FunctionArgNames } from '@walletmesh/aztec-helpers';
>>>>>>> 578f948e (refactor(aztec-helpers): move middleware to shared package and add comprehensive tests)

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
<<<<<<< HEAD
  const { showError } = useToast();
=======
>>>>>>> c65878d3 (feat(examples): add comprehensive example applications)

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

  const permissionManager = useRef(
    new CustomPermissionManager(
      // approvePermissionsCallback: Handle initial connection permissions
      async (context, permissionRequest) => {
        const origin = context.origin || 'unknown';
        const chainIds = Object.keys(permissionRequest).join(', ');

        const userApproved = await handleApprovalRequest({
          origin,
          chainId: chainIds,
          method: 'wm_connect',
          params: permissionRequest,
        });

        if (!userApproved) {
          showError('Connection request denied.');
          return {}; // Return empty permissions if denied
        }

        const result: HumanReadableChainPermissions = {};
        for (const [chainId, methods] of Object.entries(permissionRequest)) {
          result[chainId] = {};
          for (const method of methods) {
            result[chainId][method] = {
              allowed: true,
              shortDescription: 'allowed',
            };
          }
        }
        return result;
      },
      // askCallback: Handle individual method calls in ASK state
      async (context, request) => {
        const origin = context.origin || 'unknown';

        let chainId = '';
        let method = '';
        let params: unknown;

        if (request.method === 'wm_call' && request.params) {
          const callParams = request.params as any;
          chainId = callParams.chainId;
          method = callParams.call?.method;
          params = callParams.call?.params;
        } else if (request.method === 'wm_bulkCall' && request.params) {
          const bulkParams = request.params as any;
          chainId = bulkParams.chainId;
          method = 'bulk_call'; // Simplified for UI
          params = bulkParams.calls;
        }

        return handleApprovalRequest({
          origin,
          chainId,
          method,
          params,
        });
      },
      // initialState
      new Map([
        [
          'aztec:31337',
          new Map([
            ['aztec_sendTx', AllowAskDenyState.ASK],
            ['aztec_proveTx', AllowAskDenyState.ASK],
            ['aztec_contractInteraction', AllowAskDenyState.ASK],
            ['aztec_registerContract', AllowAskDenyState.ASK],
            ['aztec_registerContractClass', AllowAskDenyState.ASK],
            ['aztec_registerSender', AllowAskDenyState.ASK],
            ['aztec_createAuthWit', AllowAskDenyState.ASK],
            ['aztec_profileTx', AllowAskDenyState.ASK],
            ['aztec_simulateTx', AllowAskDenyState.ASK],
            ['aztec_simulateUtility', AllowAskDenyState.ASK],
            ['aztec_wmDeployContract', AllowAskDenyState.ASK],
            ['aztec_wmExecuteTx', AllowAskDenyState.ASK],
            ['aztec_wmSimulateTx', AllowAskDenyState.ASK],
            ['aztec_getAddress', AllowAskDenyState.ALLOW],
            ['aztec_getCompleteAddress', AllowAskDenyState.ALLOW],
            ['aztec_getChainId', AllowAskDenyState.ALLOW],
            ['aztec_getVersion', AllowAskDenyState.ALLOW],
            ['aztec_getNodeInfo', AllowAskDenyState.ALLOW],
            ['aztec_getPublicEvents', AllowAskDenyState.ALLOW],
            ['aztec_getContractMetadata', AllowAskDenyState.ALLOW],
            ['aztec_getContractClassMetadata', AllowAskDenyState.ALLOW],
            ['aztec_getTxReceipt', AllowAskDenyState.ALLOW],
            ['aztec_getBlock', AllowAskDenyState.ALLOW],
            ['aztec_getBlockNumber', AllowAskDenyState.ALLOW],
            ['aztec_getCurrentBaseFees', AllowAskDenyState.ALLOW],
            ['aztec_getPXEInfo', AllowAskDenyState.ALLOW],
            ['aztec_removeSender', AllowAskDenyState.DENY],
            ['aztec_getSenders', AllowAskDenyState.DENY],
            ['aztec_getPrivateEvents', AllowAskDenyState.DENY],
            ['aztec_getContracts', AllowAskDenyState.DENY],
          ]),
        ],
      ]),
    ),
  );

  // Update the permission manager when auto-approve state changes
  useEffect(() => {
    permissionManager.current.setAutoApprove(autoApprove);
  }, [autoApprove, permissionManager]);

  const handleApprovalResponse = (approved: boolean) => {
    // Resolve the FIRST item in queue (FIFO order)
    const currentApproval = approvalQueue[0];
    if (currentApproval) {
      currentApproval.resolve(approved);
    }
  };

<<<<<<< HEAD
  const handleAlwaysAllow = () => {
    if (pendingApproval) {
      permissionManager.current.updatePermissionState(
        pendingApproval.chainId as any,
        pendingApproval.method,
        AllowAskDenyState.ALLOW,
      );
      pendingApproval.resolve(true);
    }
  };

<<<<<<< HEAD
=======
>>>>>>> c65878d3 (feat(examples): add comprehensive example applications)
  const handleEnableAutoApprove = () => {
    setAutoApprove(true);
    if (pendingApproval) {
      pendingApproval.resolve(true);
=======
    // Approve all pending approvals in the queue
    for (const approval of approvalQueue) {
      approval.resolve(true);
>>>>>>> ae9a0494 (feat(router): add approval queue system for concurrent transaction handling)
    }
  };

  // Get current pending approval (first in queue) for backward compatibility
  const pendingApproval = approvalQueue[0] || null;
  const approvalQueueLength = approvalQueue.length;

  return (
    <div className="App">
      <h1>WalletMesh Aztec Wallet</h1>

<<<<<<< HEAD
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
=======
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
>>>>>>> c65878d3 (feat(examples): add comprehensive example applications)
      </div>

      <Wallet
        pendingApproval={pendingApproval}
        onApprovalResponse={handleApprovalResponse}
        onAlwaysAllow={handleAlwaysAllow}
        onEnableAutoApprove={handleEnableAutoApprove}
        permissionManager={permissionManager.current}
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
