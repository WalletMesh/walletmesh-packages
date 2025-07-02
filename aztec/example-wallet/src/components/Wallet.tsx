/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from 'react';
import {
  createAztecWalletNode,
} from '@walletmesh/aztec-rpc-wallet'

import {
  WalletRouter,
  type ChainId,
  createLocalTransportPair,
  type WalletRouterConfig,
  type RouterContext,
  type RouterMethodMap,
  type HumanReadableChainPermissions,
} from '@walletmesh/router'
import { getSchnorrAccount } from '@aztec/accounts/schnorr';
import { getInitialTestAccounts } from '@aztec/accounts/testing';
import { createAztecNodeClient, waitForNode, waitForPXE, type AztecNode, type PXE } from '@aztec/aztec.js';
import { createPXEService, getPXEServiceConfig } from '@aztec/pxe/client/lazy';

import Approve from './Approve.js';
import './Wallet.css';
import FunctionCallDisplay from './FunctionCallDisplay.js';
import ParameterDisplay from './ParameterDisplay.js';
import { AllowAskDenyManager, AllowAskDenyState } from '@walletmesh/router/permissions';
import { createOriginMiddleware } from '../middlewares/originMiddleware.js';
import { createFunctionArgNamesMiddleware, type FunctionArgNames } from '../middlewares/functionArgNamesMiddleware.js';
import { createHistoryMiddleware } from '../middlewares/historyMiddleware.js';
import { createDappToWalletTransport } from '../transports/CrossWindowTransport.js';

import initNoircAbiWasm from '@aztec/noir-noirc_abi/web/noirc_abi_wasm.js';
import initAcvmJs from '@aztec/noir-acvm_js/web/acvm_js.js';

// Define types that were removed from the refactored library
interface TransactionFunctionCall {
  contractAddress: string;
  functionName: string;
  args: unknown[];
}

interface TransactionParams {
  functionCalls: TransactionFunctionCall[];
}

/**
 * @internal
 * Type guard to check if an unknown params object matches the {@link TransactionParams} structure.
 * @param params - The parameters to check.
 * @returns True if params is a TransactionParams object, false otherwise.
 */
function isTransactionParams(params: unknown): params is TransactionParams {
  return (
    typeof params === 'object' &&
    params !== null &&
    'functionCalls' in params &&
    Array.isArray((params as TransactionParams).functionCalls)
  );
}

/**
 * @internal
 * Type guard to check if an unknown params object matches the {@link TransactionFunctionCall} structure.
 * @param params - The parameters to check.
 * @returns True if params is a TransactionFunctionCall object, false otherwise.
 */
function isTransactionFunctionCall(params: unknown): params is TransactionFunctionCall {
  return (
    typeof params === 'object' &&
    params !== null &&
    'contractAddress' in params &&
    'functionName' in params &&
    'args' in params
  );
}

/**
 * Creates and initializes a PXE (Private eXecution Environment) client.
 * This function handles the configuration and setup necessary for the PXE service,
 * including specific error handling for browser environments where IndexedDB might be blocked.
 *
 * @param node - An initialized AztecNode client.
 * @param showError - Callback function to display error messages to the user (e.g., via toasts).
 * @returns A promise that resolves to an initialized PXE instance.
 * @throws If PXE creation or initialization fails.
 */
export async function createPXE(node: AztecNode, showError: (msg: string) => void): Promise<PXE> {
  const l1Contracts = await node.getL1ContractAddresses();
  const nodeInfo = await node.getNodeInfo();

  const config = getPXEServiceConfig();
  const fullConfig = {
    ...config,
    l1Contracts,
    l1ChainId: nodeInfo.l1ChainId,
    rollupVersion: nodeInfo.rollupVersion,
    dataDirectory: undefined,
  };


  try {
    const pxe = await createPXEService(node, fullConfig);
    await waitForPXE(pxe);
    return pxe;
  } catch (error: any) {
    // Check if it's an IndexedDB error
    if (error.message?.includes('denied permission') || error.name === 'UnknownError') {
      console.error('IndexedDB is blocked:', error);
      showError('This example requires IndexedDB to work. Your browser is blocking IndexedDB access. Please check: You are not in private/incognito mode, Storage is not disabled in browser settings');
    }
    throw error;
  }
}

/**
 * Represents an entry in the request history log displayed by the Wallet component.
 */
interface HistoryEntry {
  time: string;
  origin: string;
  method: string;
  params: unknown;  // Make required to match middleware
  status?: string;
  functionArgNames?: FunctionArgNames;
  id?: number;
}

/**
 * Props for the {@link Wallet} component.
 */
interface WalletProps {
  /** Details of a pending approval request, if any. Passed from the App component. */
  pendingApproval?: {
    origin: string;
    chainId: string;
    method: string;
    params?: unknown;
    resolve: (approved: boolean) => void;
  } | null;
  /** Callback invoked when the user responds to an approval request. */
  onApprovalResponse?: (approved: boolean) => void;
  /** Callback passed to ApprovalPermissionManager to trigger the UI approval flow in App.tsx. */
  onApprovalRequest?: (request: {
    origin: string;
    chainId: string;
    method: string;
    params?: unknown;
  }) => Promise<boolean>;
}


/**
 * Wallet component for the Aztec example application.
 * This component serves as a standalone wallet that:
 * - Initializes an Aztec Node and PXE client
 * - Sets up an Aztec AccountWallet
 * - Creates a WalletRouter instance with an ApprovalPermissionManager
 * - Communicates with DApps via cross-window postMessage
 * - Displays a history of requests and manages UI for pending approvals
 */
const Wallet: React.FC<WalletProps> = ({ pendingApproval, onApprovalResponse, onApprovalRequest }) => {
  /** State for storing and displaying the history of requests received by the router. */
  const [requestHistory, setRequestHistory] = useState<HistoryEntry[]>([]);
  /** State indicating if the wallet router and underlying services are initialized. */
  const [isConnected, setIsConnected] = useState(false);
  /** State for the connected Aztec account address string. */
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);

  /** Ref to ensure wallet setup runs only once. */
  const setupDoneRef = useRef(false);
  /** Ref to the WalletRouter instance. */
  const routerRef = useRef<WalletRouter | null>(null);

  /** Simple toast-like error display */
  const showError = (message: string) => {
    console.error(message);
    // You can add a proper toast component here if needed
  };

  /** Effect to set up the wallet router, Aztec node, PXE, and account wallet on component mount. */
  useEffect(() => {
    if (setupDoneRef.current) return;
    setupDoneRef.current = true;

    let node: AztecNode;
    let pxe: PXE;

    const setupWalletRouter = async () => {
      try {
        // Initialize WASM modules first!
        await initNoircAbiWasm(fetch('/assets/noirc_abi_wasm_bg.wasm'));
        await initAcvmJs(fetch('/assets/acvm_js_bg.wasm'));

        const nodeUrl = import.meta.env.VITE_NODE_URL || 'https://sandbox.aztec.walletmesh.com/api/v1/public';
        node = createAztecNodeClient(nodeUrl);
        await waitForNode(node);
        pxe = await createPXE(node, showError);
        await waitForPXE(pxe);

        const [account_0] = await getInitialTestAccounts();

        const account = await getSchnorrAccount(
          pxe,
          account_0.secret,
          account_0.signingKey,
          account_0.salt,
        )

        const wallet = await account.register();

        setConnectedAccount(wallet.getAddress().toString());

        // Create local transport pair for wallet node communication
        const [clientTransport, walletTransport] = createLocalTransportPair();

        // Create Aztec wallet node with proper transport
        const aztecWalletNode = createAztecWalletNode(wallet, pxe, walletTransport);

        // Add middleware to the wallet node for function arg names and history
        aztecWalletNode.addMiddleware(createFunctionArgNamesMiddleware(pxe));
        aztecWalletNode.addMiddleware(createHistoryMiddleware((entries) => setRequestHistory(entries as HistoryEntry[])));

        // Create cross-window router transport for DApp communication
        // We need to get the opener (dApp) window reference
        const dappWindow = window.opener;
        if (!dappWindow) {
          throw new Error('No parent window found. Wallet must be opened from a dApp.');
        }

        // Get the dApp origin from the opener
        // In production, you'd want to validate this against a whitelist
        let dappOrigin = '*'; // Using wildcard for simplicity, but you can restrict this
        try {
          dappOrigin = dappWindow.location.origin;
        } catch (e) {
          // Cross-origin access might be blocked, use wildcard
          console.warn('Could not access dApp origin, using wildcard');
        }

        const routerTransport = createDappToWalletTransport(dappWindow, dappOrigin);

                // Create permission manager with AllowAskDenyManager
        const permissionManager = new AllowAskDenyManager<RouterMethodMap, RouterContext>(
          // approvePermissionsCallback: Handle initial connection permissions
          async (context, permissionRequest) => {
            const origin = context.origin || 'unknown';
            const chainIds = Object.keys(permissionRequest).join(', ');

            // Prompt user for initial connection approval
            const userApproved = await (onApprovalRequest || (async () => true))({
              origin,
              chainId: chainIds,
              method: 'wm_connect',
              params: permissionRequest
            });

            if (!userApproved) {
              return {}; // Return empty permissions if denied
            }

            // If approved, convert to human-readable format
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

            // Extract method details from the request
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

            // Now we can use the async approval flow
            return await (onApprovalRequest || (async () => true))({
              origin,
              chainId,
              method,
              params
            });
          },
          // initialState: Define initial permission states
          new Map([
            ['aztec:31337', new Map([
              // Methods that require approval each time (ASK state)
              ['aztec_sendTx', AllowAskDenyState.ASK],
              ['aztec_proveTx', AllowAskDenyState.ASK],
              ['aztec_contractInteraction', AllowAskDenyState.ASK],
              ['aztec_registerContract', AllowAskDenyState.ASK],
              ['aztec_registerContractClass', AllowAskDenyState.ASK],
              ['aztec_createAuthWit', AllowAskDenyState.ASK],
              ['aztec_profileTx', AllowAskDenyState.ASK],
              ['aztec_simulateTx', AllowAskDenyState.ASK],
              ['aztec_simulateUtility', AllowAskDenyState.ASK],
              ['aztec_wmDeployContract', AllowAskDenyState.ASK],
              ['aztec_wmExecuteTx', AllowAskDenyState.ASK],
              ['aztec_wmSimulateTx', AllowAskDenyState.ASK],

              // Methods that are always allowed (ALLOW state)
              ['aztec_getAddress', AllowAskDenyState.ALLOW],
              ['aztec_getCompleteAddress', AllowAskDenyState.ALLOW],
              ['aztec_getPublicEvents', AllowAskDenyState.ALLOW],
              ['aztec_getContractMetadata', AllowAskDenyState.ALLOW],
              ['aztec_getContractClassMetadata', AllowAskDenyState.ALLOW],
              ['aztec_getTxReceipt', AllowAskDenyState.ALLOW],
              ['aztec_getBlock', AllowAskDenyState.ALLOW],
              ['aztec_getBlockNumber', AllowAskDenyState.ALLOW],
              ['aztec_getCurrentBaseFees', AllowAskDenyState.ALLOW],
              ['aztec_getPXEInfo', AllowAskDenyState.ALLOW],

              // Methods that are always denied (DENY state) - if any
              // ['some_risky_method', AllowAskDenyState.DENY],
              ['aztec_removeSender', AllowAskDenyState.DENY],
              ['aztec_getSenders', AllowAskDenyState.DENY],
              ['aztec_getPrivateEvents', AllowAskDenyState.DENY],
              ['aztec_getContracts', AllowAskDenyState.DENY],
            ])]
          ])
        );

        // Create wallets map with the client transport
        const wallets = new Map<ChainId, import('@walletmesh/jsonrpc').JSONRPCTransport>([
          ['aztec:31337', clientTransport]
        ]);


        // Configure router with optional proxy settings
        const routerConfig: WalletRouterConfig = {
          proxyConfig: {
            timeoutMs: 600000, // 10 minutes
            debug: process.env.NODE_ENV === 'development',
          },
          debug: process.env.NODE_ENV === 'development',
        };

        // Create the router with transports
        const router = new WalletRouter(routerTransport, wallets, permissionManager, routerConfig);


        // Add origin middleware to provide proper origin context
        router.addMiddleware(createOriginMiddleware(() => {
          // Try to get the actual dApp origin
          try {
            return dappWindow.location.origin;
          } catch (e) {
            return window.location.origin; // Fallback to wallet origin
          }
        }));

        routerRef.current = router;

        setIsConnected(true);

        // Send ready message to dApp
        dappWindow.postMessage({ type: 'wallet_ready' }, dappOrigin);
      } catch (error) {
        console.error('Error setting up wallet router:', error);
        showError(`Failed to initialize wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    // Initialize
    setupWalletRouter();

  }, [onApprovalRequest]);

  /** Handles the "Approve" action from the approval UI. */
  const handleApprove = () => {
    if (onApprovalResponse) {
      onApprovalResponse(true);
    }
  };

  /** Handles the "Deny" action from the approval UI. */
  const handleDeny = () => {
    if (onApprovalResponse) {
      onApprovalResponse(false);
    }
  };

  return (
    <div className="wallet-server">
      {pendingApproval && onApprovalResponse && (
        <Approve
          method={pendingApproval.method}
          params={pendingApproval.params as { functionCalls?: { contractAddress: string; functionName: string; args: unknown[]; }[] | undefined; } | undefined}
          origin={pendingApproval.origin}
          functionArgNames={requestHistory.find(h => !h.status)?.functionArgNames}
          onApprove={handleApprove}
          onDeny={handleDeny}
        />
      )}

      {!isConnected ? (
        <p className="connection-status disconnected">Initializing Wallet...</p>
      ) : (
        <>
          <p className="connection-status connected">Wallet Ready</p>
          <p className="connection-status">
            <strong>Connected Account:</strong> {connectedAccount || 'Loading...'}
          </p>
          <h3>Request History</h3>
          <ul className="request-history">
            {requestHistory.length === 0 ? (
              <li>None</li>
            ) : (
              [...requestHistory].reverse().map((request, index) => (
                <li key={index}>
                  <p className="request-details">
                    <b>Time:</b> {request.time}
                  </p>
                  <p className="request-details">
                    <b>Origin:</b> {request.origin}
                  </p>
                  <p className="request-details">
                    <b>Method:</b> {request.method}
                  </p>
                  <ParameterDisplay params={request.params} />
                  {request.method === 'aztec_sendTransaction' &&
                    request.params &&
                    isTransactionParams(request.params) ? (
                    request.params.functionCalls.map((call, idx) => (
                      <FunctionCallDisplay
                        key={idx}
                        call={call}
                        functionArgNames={request.functionArgNames}
                      />
                    ))
                  ) : null}
                  {request.method === 'aztec_simulateTransaction' &&
                    request.params &&
                    isTransactionFunctionCall(request.params) ? (
                    <FunctionCallDisplay
                      call={request.params}
                      functionArgNames={request.functionArgNames}
                    />
                  ) : null}
                  {request.status && (
                    <p className="request-details">
                      <b>Status:</b>{' '}
                      <span
                        className={
                          request.status === 'Denied' ? 'denied-status' : ''
                        }
                      >
                        {request.status}
                      </span>
                    </p>
                  )}
                  <hr />
                </li>
              ))
            )}
          </ul>
        </>
      )}
    </div>
  );
};

export default Wallet;
