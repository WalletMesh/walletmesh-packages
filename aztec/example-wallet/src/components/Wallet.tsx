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
} from '@walletmesh/router'
import { getSchnorrAccount } from '@aztec/accounts/schnorr';
import { getInitialTestAccounts } from '@aztec/accounts/testing';
import { createAztecNodeClient, waitForNode, waitForPXE, type AztecNode, type PXE } from '@aztec/aztec.js';
import { createPXEService, getPXEServiceConfig } from '@aztec/pxe/client/lazy';

import Approve from './Approve.js';
import './Wallet.css';
import FunctionCallDisplay from './FunctionCallDisplay.js';
import ParameterDisplay from './ParameterDisplay.js';
import { createOriginMiddleware } from '../middlewares/originMiddleware.js';
import { createFunctionArgNamesMiddleware } from '../middlewares/functionArgNamesMiddleware.js';
import { createHistoryMiddleware, type HistoryEntry } from '../middlewares/historyMiddleware.js';
import { createDappToWalletTransport } from '../transports/CrossWindowTransport.js';
import { CustomPermissionManager } from './CustomPermissionManager.js';
import { useToast } from '../contexts/ToastContext.js';

// Statistics types
interface MethodTimingStats {
  count: number;
  min: number;
  max: number;
  avg: number;
  stdDev: number;
  times: number[];
}

interface TimingStatistics {
  [method: string]: MethodTimingStats;
}

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
 * Live timer component that shows elapsed time for processing requests
 */
const LiveTimer: React.FC<{ startTime: number }> = ({ startTime }) => {
  const [elapsed, setElapsed] = useState(() => Date.now() - startTime);

  useEffect(() => {
    const updateTimer = () => {
      const elapsedMs = Date.now() - startTime;
      setElapsed(elapsedMs);
    };

    // Update immediately to show current elapsed time
    updateTimer();

    // Update every 1 second for consistent, readable updates
    const interval = setInterval(() => {
      const elapsedMs = Date.now() - startTime;
      setElapsed(elapsedMs);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  // Display in seconds if >= 1 second, otherwise in milliseconds
  const displayValue = elapsed >= 1000 ? (elapsed / 1000).toFixed(1) : elapsed;
  const displayUnit = elapsed >= 1000 ? 's' : 'ms';

  return <span>{displayValue}{displayUnit}</span>;
};

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
    proverEnabled: false, // TODO: Make this configurable by the user
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
  /** Callback invoked when the user selects "Always Allow". */
  onAlwaysAllow?: () => void;
  /** Callback invoked when the user enables auto-approve from an approval prompt. */
  onEnableAutoApprove?: () => void;
  /** Instance of the permission manager for the router. */
  permissionManager: CustomPermissionManager;
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
const Wallet: React.FC<WalletProps> = ({
  pendingApproval,
  onApprovalResponse,
  onAlwaysAllow,
  onEnableAutoApprove,
  permissionManager,
}) => {
  /** State for storing and displaying the history of requests received by the router. */
  const [requestHistory, setRequestHistory] = useState<HistoryEntry[]>([]);
  /** State indicating if the wallet router and underlying services are initialized. */
  const [isConnected, setIsConnected] = useState(false);
  /** State for the connected Aztec account address string. */
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  /** State for filtering request history by processing status */
  const [statusFilters, setStatusFilters] = useState<Record<string, boolean>>({
    processing: true,
    success: true,
    error: true,
  });

  /** State for tracking transaction statistics */
  const [transactionStats, setTransactionStats] = useState({
    pending: 0,
    total: 0,
    successful: 0,
    errors: 0,
  });

  /** State for tracking timing statistics by method */
  const [timingStats, setTimingStats] = useState<TimingStatistics>({});
  /** State for controlling timing stats display */
  const [showTimingStats, setShowTimingStats] = useState(false);
  /** State for sorting timing statistics table */
  const [timingSortConfig, setTimingSortConfig] = useState<{
    column: 'method' | 'count' | 'min' | 'max' | 'avg' | 'stdDev';
    direction: 'asc' | 'desc';
  }>({ column: 'count', direction: 'desc' });

  /** Ref to ensure wallet setup runs only once. */
  const setupDoneRef = useRef(false);
  /** Ref to the WalletRouter instance. */
  const routerRef = useRef<WalletRouter | null>(null);

  /** Toast system for error display */
  const { showError, showSuccess } = useToast();

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
        aztecWalletNode.addMiddleware(createHistoryMiddleware((entries) => {
          setRequestHistory(entries as HistoryEntry[]);

          // Update transaction statistics
          const historyEntries = entries as HistoryEntry[];
          const pendingCount = historyEntries.filter(e => e.processingStatus === 'processing').length;
          const successCount = historyEntries.filter(e => e.processingStatus === 'success').length;
          const errorCount = historyEntries.filter(e => e.processingStatus === 'error').length;
          const totalCount = historyEntries.length;

          setTransactionStats({
            pending: pendingCount,
            total: totalCount,
            successful: successCount,
            errors: errorCount,
          });

          // Calculate timing statistics
          const newTimingStats: TimingStatistics = {};
          historyEntries
            .filter(entry => entry.processingStatus === 'success' && entry.duration !== undefined)
            .forEach(entry => {
              const method = entry.method;
              const duration = entry.duration as number;

              if (!newTimingStats[method]) {
                newTimingStats[method] = {
                  count: 0,
                  min: Infinity,
                  max: -Infinity,
                  avg: 0,
                  stdDev: 0,
                  times: [],
                };
              }

              newTimingStats[method].times.push(duration);
            });

          // Calculate statistics for each method
          Object.keys(newTimingStats).forEach(method => {
            const stats = newTimingStats[method];
            const times = stats.times;

            stats.count = times.length;
            stats.min = Math.min(...times);
            stats.max = Math.max(...times);
            stats.avg = times.reduce((a, b) => a + b, 0) / times.length;

            // Calculate standard deviation
            const variance = times.reduce((acc, time) => {
              return acc + Math.pow(time - stats.avg, 2);
            }, 0) / times.length;
            stats.stdDev = Math.sqrt(variance);
          });

          setTimingStats(newTimingStats);

          // Show toast for errors
          const latestEntry = historyEntries[historyEntries.length - 1];
          if (latestEntry?.processingStatus === 'error' && latestEntry?.error) {
            showError(`Request failed: ${latestEntry.error.message}`);
          } else if (latestEntry?.processingStatus === 'success') {
            showSuccess(`Request completed successfully`);
          }
        }));

        // Create cross-window router transport for DApp communication
        // We need to get the opener (dApp) window reference
        const dappWindow = window.opener;
        if (!dappWindow) {
          throw new Error('No parent window found. Wallet must be opened from a dApp.');
        }

        // Get the dApp origin from the opener
        // In production, you'd want to validate this against a whitelist
        let dappOrigin = '*'; // Using wildcard for simplicity, but you can restrict this
        let detectedOrigin: string | undefined;

        // Method 1: Try document.referrer first (most reliable for cross-origin scenarios)
        if (typeof document !== 'undefined' && document.referrer) {
          try {
            const referrerUrl = new URL(document.referrer);
            detectedOrigin = referrerUrl.origin;
            dappOrigin = detectedOrigin;
            console.log('Detected dApp origin from document.referrer:', detectedOrigin);
          } catch (e) {
            console.warn('Failed to parse document.referrer:', e);
          }
        }

        // Method 2: Fallback to window.opener.location.origin (only for same-origin scenarios)
        if (!detectedOrigin && typeof window !== 'undefined' && window.opener) {
          try {
            detectedOrigin = dappWindow.location.origin;
            dappOrigin = detectedOrigin || '*';
            console.log('Detected dApp origin from window.opener:', detectedOrigin);
          } catch (e) {
            // Cross-origin access might be blocked, use wildcard
            // This is expected behavior in cross-origin scenarios
            console.log('Cross-origin context detected, using wildcard for dApp origin');
          }
        }

        const routerTransport = createDappToWalletTransport(dappWindow, dappOrigin);

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
        router.addMiddleware(createOriginMiddleware(detectedOrigin));

        routerRef.current = router;

        setIsConnected(true);

        // Send ready message to dApp
        if (dappWindow) {
          dappWindow.postMessage({ type: 'wallet_ready' }, dappOrigin);
        } else {
          // In fallback mode, broadcast the ready message
          window.postMessage({ type: 'wallet_ready' }, '*');
        }
      } catch (error) {
        console.error('Error setting up wallet router:', error);
        showError(`Failed to initialize wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    // Initialize
    setupWalletRouter();

  }, [permissionManager, showError, showSuccess]);

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

  /** Filter request history based on selected status filters */
  const filteredHistory = requestHistory.filter(req =>
    req.processingStatus && statusFilters[req.processingStatus]
  );

  /** Format time with appropriate unit */
  const formatTime = (ms: number): string => {
    if (ms >= 1000) {
      return `${(ms / 1000).toFixed(2)}s`;
    }
    return `${Math.round(ms)}ms`;
  };

  /** Sort timing statistics based on current sort configuration */
  const getSortedTimingStats = () => {
    const entries = Object.entries(timingStats);

    return entries.sort((a, b) => {
      const [methodA, statsA] = a;
      const [methodB, statsB] = b;

      let comparison = 0;

      switch (timingSortConfig.column) {
        case 'method':
          comparison = methodA.localeCompare(methodB);
          break;
        case 'count':
          comparison = statsA.count - statsB.count;
          break;
        case 'min':
          comparison = statsA.min - statsB.min;
          break;
        case 'max':
          comparison = statsA.max - statsB.max;
          break;
        case 'avg':
          comparison = statsA.avg - statsB.avg;
          break;
        case 'stdDev':
          comparison = statsA.stdDev - statsB.stdDev;
          break;
      }

      return timingSortConfig.direction === 'asc' ? comparison : -comparison;
    });
  };

  /** Handle column header click for sorting */
  const handleSort = (column: typeof timingSortConfig.column) => {
    setTimingSortConfig(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  /** Get sort indicator for column header */
  const getSortIndicator = (column: typeof timingSortConfig.column) => {
    if (timingSortConfig.column !== column) return '';
    return timingSortConfig.direction === 'asc' ? ' ▲' : ' ▼';
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
          onAlwaysAllow={onAlwaysAllow || (() => {})}
          onEnableAutoApprove={onEnableAutoApprove || (() => {})}
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
          <div className="transaction-stats">
            <div className="stat-item">
              <div className="stat-label">Pending</div>
              <div className={`stat-value ${transactionStats.pending > 0 ? 'pending' : 'total'}`}>
                {transactionStats.pending}
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Total</div>
              <div className="stat-value total">
                {transactionStats.total}
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Successful</div>
              <div className="stat-value success">
                {transactionStats.successful}
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Errors</div>
              <div className={`stat-value error ${transactionStats.errors > 0 ? 'has-errors' : ''}`}>
                {transactionStats.errors}
              </div>
            </div>
          </div>

          {/* Timing Statistics Section */}
          <div className="timing-stats-container">
            <button
              className="timing-stats-toggle"
              onClick={() => setShowTimingStats(!showTimingStats)}
              aria-expanded={showTimingStats}
            >
              <span className="toggle-icon">{showTimingStats ? '▼' : '▶'}</span>
              Processing Time Statistics
              <span className="stats-count">({Object.keys(timingStats).length} methods)</span>
            </button>

            {showTimingStats && (
              <div className="timing-stats-content">
                {Object.keys(timingStats).length === 0 ? (
                  <p className="no-timing-data">No timing data available. Complete some successful requests to see statistics.</p>
                ) : (
                  <div className="timing-stats-table-container">
                    <table className="timing-stats-table">
                      <thead>
                        <tr>
                          <th
                            className="sortable-header"
                            onClick={() => handleSort('method')}
                          >
                            Method{getSortIndicator('method')}
                          </th>
                          <th
                            className="sortable-header"
                            onClick={() => handleSort('count')}
                          >
                            Count{getSortIndicator('count')}
                          </th>
                          <th
                            className="sortable-header"
                            onClick={() => handleSort('min')}
                          >
                            Min{getSortIndicator('min')}
                          </th>
                          <th
                            className="sortable-header"
                            onClick={() => handleSort('max')}
                          >
                            Max{getSortIndicator('max')}
                          </th>
                          <th
                            className="sortable-header"
                            onClick={() => handleSort('avg')}
                          >
                            Avg{getSortIndicator('avg')}
                          </th>
                          <th
                            className="sortable-header"
                            onClick={() => handleSort('stdDev')}
                          >
                            Std Dev{getSortIndicator('stdDev')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {getSortedTimingStats().map(([method, stats]) => (
                          <tr key={method}>
                            <td className="method-cell">{method}</td>
                            <td className="count-cell">{stats.count}</td>
                            <td className="time-cell min">{formatTime(stats.min)}</td>
                            <td className="time-cell max">{formatTime(stats.max)}</td>
                            <td className="time-cell avg">{formatTime(stats.avg)}</td>
                            <td className="time-cell stddev">{formatTime(stats.stdDev)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          <h3>Request History</h3>
          <div className="history-filters">
            <div className="filter-controls">
              <button
                className="filter-button"
                onClick={() => setStatusFilters({ processing: true, success: true, error: true })}
              >
                Select All
              </button>
              <button
                className="filter-button"
                onClick={() => setStatusFilters({ processing: false, success: false, error: false })}
              >
                Clear All
              </button>
            </div>
            <div className="filter-options">
              <label className="filter-label">
                <input
                  type="checkbox"
                  checked={statusFilters.processing}
                  onChange={(e) => setStatusFilters(prev => ({ ...prev, processing: e.target.checked }))}
                />
                ⏳ Processing
              </label>
              <label className="filter-label">
                <input
                  type="checkbox"
                  checked={statusFilters.success}
                  onChange={(e) => setStatusFilters(prev => ({ ...prev, success: e.target.checked }))}
                />
                ✅ Success
              </label>
              <label className="filter-label">
                <input
                  type="checkbox"
                  checked={statusFilters.error}
                  onChange={(e) => setStatusFilters(prev => ({ ...prev, error: e.target.checked }))}
                />
                ❌ Error
              </label>
            </div>
          </div>
                    <ul className="request-history">
            {filteredHistory.length === 0 ? (
              <li key="no-results">No requests match the current filters</li>
            ) : (
              [...filteredHistory].reverse().map((request, index) => (
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
                  {request.approvalStatus && (
                    <p className="request-details">
                      <b>Approval Status:</b>{' '}
                      <span
                        className={
                          request.approvalStatus === 'denied' ? 'denied-status' : ''
                        }
                      >
                        {request.approvalStatus === 'approved' ? 'Approved' : 'Denied'}
                      </span>
                    </p>
                  )}
                  {request.processingStatus && (
                    <p className="request-details">
                      <b>Processing Status:</b>{' '}
                      <span
                        className={
                          request.processingStatus === 'processing' ? 'processing-status' :
                          request.processingStatus === 'error' ? 'error-status' :
                          'success-status'
                        }
                      >
                        {request.processingStatus === 'processing' ? '⏳ Processing' :
                         request.processingStatus === 'error' ? '❌ Error' :
                         '✅ Success'}
                      </span>
                    </p>
                  )}
                  {request.error && (
                    <div className="error-details">
                      <p className="request-details">
                        <b>Error:</b> {request.error.message}
                      </p>
                      {request.error.stack && (
                        <details className="error-stack">
                          <summary>Stack Trace</summary>
                          <pre className="error-stack-content">{request.error.stack}</pre>
                        </details>
                      )}
                    </div>
                  )}
                  {request.processingStatus === 'processing' ? (
                    <p className="request-details">
                      <b>Duration:</b> <LiveTimer startTime={request.requestTimestamp} />
                    </p>
                  ) : request.duration && (
                    <p className="request-details">
                      <b>Duration:</b> {request.duration >= 1000
                        ? `${(request.duration / 1000).toFixed(1)}s`
                        : `${request.duration}ms`
                      }
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
