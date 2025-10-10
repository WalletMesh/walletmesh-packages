import { createAztecWalletNode } from '@walletmesh/aztec-rpc-wallet';
import { useEffect, useMemo, useRef, useState } from 'react';

// Type definitions for window extensions
declare global {
  interface Window {
    testConnection?: () => Promise<void>;
    walletRouter?: WalletRouter;
    walletTransport?: unknown;
    walletPermissionManager?: unknown;
    sessionStore?: unknown;
  }
}

<<<<<<< HEAD
import {
  WalletRouter,
  type ChainId,
  createLocalTransportPair,
  type WalletRouterConfig,
} from '@walletmesh/router'
=======
>>>>>>> c65878d3 (feat(examples): add comprehensive example applications)
import { getSchnorrAccount } from '@aztec/accounts/schnorr';
import { getInitialTestAccounts } from '@aztec/accounts/testing';
import { type AccountWallet, type AztecNode, createAztecNodeClient, type PXE, waitForNode, waitForPXE } from '@aztec/aztec.js';
import { createPXEService, getPXEServiceConfig } from '@aztec/pxe/client/lazy';
import {
  type ChainId,
  createLocalTransportPair,
  type HumanReadableChainPermissions,
  MemorySessionStore,
  type PermissionApprovalCallback,
  WalletRouter,
  type WalletRouterConfig,
} from '@walletmesh/router';

import Approve from './Approve.js';
import './Wallet.css';
<<<<<<< HEAD
import FunctionCallDisplay from './FunctionCallDisplay.js';
import ParameterDisplay from './ParameterDisplay.js';
import { createOriginMiddleware } from '../middlewares/originMiddleware.js';
=======
import type { JSONRPCRequest } from '@walletmesh/jsonrpc';
import type { RouterContext, RouterMethodMap } from '@walletmesh/router';
import {
  type AllowAskDenyChainPermissions,
  AllowAskDenyManager,
  AllowAskDenyState,
  type AskCallback,
} from '@walletmesh/router/permissions';
import { useToast } from '../contexts/ToastContext.js';
>>>>>>> c65878d3 (feat(examples): add comprehensive example applications)
import { createFunctionArgNamesMiddleware } from '../middlewares/functionArgNamesMiddleware.js';
import type { FunctionArgNames } from '../middlewares/functionArgNamesMiddleware.js';
import { createHistoryMiddleware, type HistoryEntry } from '../middlewares/historyMiddleware.js';
import { createTransactionSummaryMiddleware, type TransactionSummary } from '../middlewares/transactionSummaryMiddleware.js';
import { createOriginMiddleware } from '../middlewares/originMiddleware.js';
import { createWalletSideTransport } from '../transports/CrossWindowTransport.js';
import FunctionCallDisplay from './FunctionCallDisplay.js';
import ParameterDisplay from './ParameterDisplay.js';

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

import initAcvmJs from '@aztec/noir-acvm_js/web/acvm_js.js';
import initNoircAbiWasm from '@aztec/noir-noirc_abi/web/noirc_abi_wasm.js';

// Extend Window interface to add walletReadySent flag
declare global {
  interface Window {
    walletReadySent?: boolean;
  }
}

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

  return (
    <span>
      {displayValue}
      {displayUnit}
    </span>
  );
};

const PROVING_METHODS = new Set([
  'aztec_proveTx',
  'aztec_wmExecuteTx',
  'aztec_wmDeployContract',
]);

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
  } catch (error) {
    // Check if it's an IndexedDB error
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : '';
    if (errorMessage?.includes('denied permission') || errorName === 'UnknownError') {
      console.error('IndexedDB is blocked:', error);
      showError(
        'This example requires IndexedDB to work. Your browser is blocking IndexedDB access. Please check: You are not in private/incognito mode, Storage is not disabled in browser settings',
      );
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
    functionArgNames?: FunctionArgNames;
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
    functionArgNames?: FunctionArgNames;
  }) => Promise<boolean>;
  /** Callback invoked when the user enables auto-approve from an approval prompt. */
  onEnableAutoApprove?: () => void;
<<<<<<< HEAD
  /** Instance of the permission manager for the router. */
  permissionManager: CustomPermissionManager;
=======
  /** Whether auto-approve mode is enabled. */
  autoApprove?: boolean;
>>>>>>> c65878d3 (feat(examples): add comprehensive example applications)
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
<<<<<<< HEAD
  onAlwaysAllow,
  onEnableAutoApprove,
  permissionManager,
=======
  onApprovalRequest,
  onEnableAutoApprove,
  autoApprove = false,
>>>>>>> c65878d3 (feat(examples): add comprehensive example applications)
}) => {
  /** State for storing and displaying the history of requests received by the router. */
  const [requestHistory, setRequestHistory] = useState<HistoryEntry[]>([]);
  /** State to track if wallet_ready message has been sent to prevent duplicates */
  // walletReadySent is tracked via window.walletReadySent flag
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
  /** Ref to track current auto-approve state for permission callbacks. */
  const autoApproveRef = useRef(autoApprove);
  /** Retry attempt counter */
  const [retryAttempt, setRetryAttempt] = useState(0);

  /** Connection status states */
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'failed'>(
    'idle',
  );
  const [connectionError, setConnectionError] = useState<string | null>(null);

  /** Node connection details */
  const [nodeUrl, setNodeUrl] = useState<string>('');
  const [nodeStatus, setNodeStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');

  /** Toast system for error display */
  const { showError, showWarning } = useToast();

  const activeProvingRequests = useMemo(
    () =>
      requestHistory.filter(
        (entry) => entry.processingStatus === 'processing' && PROVING_METHODS.has(entry.method),
      ),
    [requestHistory],
  );

  const activeProvingCount = activeProvingRequests.length;
  /** Update auto-approve ref when prop changes */
  useEffect(() => {
    autoApproveRef.current = autoApprove;
  }, [autoApprove]);

  // Note: wallet_ready message is sent directly in the router setup useEffect
  // We don't need a separate helper function as it's only sent once during setup

  /** Create a global test function that's always available */
  useEffect(() => {
    window.testConnection = async () => {
      console.log('[Wallet] Testing connection request manually');
      const storedRouter = window.walletRouter;
      if (!storedRouter) {
        console.error(
          '[Wallet] No router found on window.walletRouter - router setup may not have completed yet',
        );
        return;
      }
      try {
        const result = await storedRouter.receiveMessage({
          jsonrpc: '2.0',
          method: 'wm_connect',
          params: {
            permissions: {
              'aztec:31337': ['aztec_getAccount', 'aztec_wmExecuteTx'],
            },
          },
          id: `test-${Date.now()}`,
        });
        console.log('[Wallet] Test connection result:', result);
      } catch (error) {
        console.error('[Wallet] Test connection failed:', error);
      }
    };
    console.log('[Wallet] Test function window.testConnection() is now available');
  }, []);

  /** Retry connection handler */
  const handleRetryConnection = () => {
    setupDoneRef.current = false; // Reset to allow setup to run again
    setRetryAttempt((prev) => prev + 1);
    setConnectionStatus('idle');
    setConnectionError(null);
  };

  /** Helper to create user-friendly error messages */
  const getUserFriendlyErrorMessage = (error: unknown): string => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    // Use the nodeUrl from state if available, otherwise fall back to env var
    const currentNodeUrl =
      nodeUrl || import.meta.env.VITE_AZTEC_RPC_URL || 'https://sandbox.aztec.walletmesh.com/api/v1/public';
    const isLocalNode = currentNodeUrl.includes('localhost') || currentNodeUrl.includes('127.0.0.1');

    // Check for common error patterns and provide helpful messages
    if (errorMessage.includes('fetch failed') || errorMessage.includes('ECONNREFUSED')) {
      if (isLocalNode) {
        return (
          `❌ Cannot connect to local Aztec sandbox at ${currentNodeUrl}\n\n` +
          '🔧 To fix this:\n' +
          '1. Start your local Aztec sandbox: aztec sandbox\n' +
          "2. Ensure it's running on the expected port\n" +
          '3. Check firewall/security settings'
        );
      }
      return (
        `❌ Cannot connect to Aztec node at ${currentNodeUrl}\n\n` +
        '🔧 Possible causes:\n' +
        '• Network connection issues\n' +
        '• Server is down or unreachable\n' +
        '• Firewall blocking the connection'
      );
    }

    if (errorMessage.includes('503') || errorMessage.includes('Service Unavailable')) {
      return (
        `⚠️ Aztec node at ${currentNodeUrl} returned 503 Service Unavailable\n\n` +
        '📊 This means:\n' +
        '• The server is running but the Aztec service is not ready\n' +
        '• The node might be syncing or starting up\n' +
        '• There may be maintenance in progress\n\n' +
        '🔄 Try again in a few moments...'
      );
    }

    if (errorMessage.includes('timeout')) {
      return (
        `⏱️ Connection to ${currentNodeUrl} timed out\n\n` +
        '🐌 Possible reasons:\n' +
        '• Slow network connection\n' +
        '• Server is overloaded\n' +
        '• Request took longer than 60 seconds\n\n' +
        '💡 Try refreshing the page or check your connection'
      );
    }

    if (
      errorMessage.includes('Cannot connect to local Aztec sandbox') ||
      errorMessage.includes('Cannot connect to Aztec network')
    ) {
      // Pass through our own formatted error messages
      return errorMessage;
    }

    if (errorMessage.includes('WASM') || errorMessage.includes('wasm')) {
      return (
        '🔧 Failed to initialize WebAssembly components\n\n' +
        'Please refresh the page and ensure your browser supports WebAssembly'
      );
    }

    if (errorMessage.includes('PXE')) {
      return (
        '🔐 Failed to create Private Execution Environment\n\n' +
        'This is needed for secure transaction processing. Please try again.'
      );
    }

    if (errorMessage.includes('account') || errorMessage.includes('wallet')) {
      return (
        '👛 Failed to set up your wallet account\n\n' +
        'The account initialization process failed. Please try again.'
      );
    }

    // Return the original message if no pattern matches
    return `❌ Error: ${errorMessage}`;
  };

  /** Effect to set up the wallet router, Aztec node, PXE, and account wallet on component mount. */
  // biome-ignore lint/correctness/useExhaustiveDependencies: detectDappOrigin and getUserFriendlyErrorMessage are helper functions that don't depend on state
  useEffect(() => {
    if (setupDoneRef.current) return;
    setupDoneRef.current = true;

    let node: AztecNode;
    let pxe: PXE;

    const setupWalletRouter = async () => {
      setConnectionStatus('connecting');
      setConnectionError(null);

      try {
        // Initialize WASM modules first!
        await initNoircAbiWasm(fetch('/assets/noirc_abi_wasm_bg.wasm'));
        await initAcvmJs(fetch('/assets/acvm_js_bg.wasm'));

        const aztecNodeUrl =
          import.meta.env.VITE_AZTEC_RPC_URL || 'https://sandbox.aztec.walletmesh.com/api/v1/public';
        const isLocal = aztecNodeUrl.includes('localhost') || aztecNodeUrl.includes('127.0.0.1');

        setNodeUrl(aztecNodeUrl);
        setNodeStatus('connecting');

        node = createAztecNodeClient(aztecNodeUrl);

        try {
          await waitForNode(node);
          setNodeStatus('connected');
        } catch (nodeError) {
          console.error('[Wallet] Failed to connect to Aztec node:', nodeError);

          // Determine the specific error type
          const errorStr = nodeError instanceof Error ? nodeError.message : String(nodeError);
          let errorMsg: string;

          setNodeStatus('error');

          if (errorStr.includes('503') || errorStr.includes('Service Unavailable')) {
            errorMsg = `503 Service Unavailable: The Aztec node at ${aztecNodeUrl} is not ready. It may be starting up or undergoing maintenance.`;
          } else if (errorStr.includes('fetch failed') || errorStr.includes('ECONNREFUSED')) {
            errorMsg = isLocal
              ? `Cannot connect to local Aztec sandbox at ${aztecNodeUrl}. Please ensure the sandbox is running (aztec sandbox).`
              : `Cannot connect to Aztec network at ${aztecNodeUrl}. The server may be down or unreachable.`;
          } else if (errorStr.includes('timeout')) {
            errorMsg = `Connection timeout: Failed to get response from ${aztecNodeUrl} within 60 seconds.`;
          } else {
            errorMsg = `Failed to connect to Aztec node at ${aztecNodeUrl}: ${errorStr}`;
          }

          throw new Error(errorMsg);
        }

        pxe = await createPXE(node, (error) => {
          console.error('[Wallet] PXE Error:', error);
          const errorMessage =
            typeof error === 'string' ? error : (error as Error).message || 'PXE Error occurred';
          showError(`PXE Error: ${errorMessage}`);
        });

        await waitForPXE(pxe);

        const [account_0] = await getInitialTestAccounts();

        // Keep using the original API - it still works
        const account = await getSchnorrAccount(pxe, account_0.secret, account_0.signingKey, account_0.salt);

        // Check if account needs registration and handle gracefully
        let wallet: AccountWallet | null = null;
        try {
          // First check if the account is already registered
          const accountAddress = account.getAddress();
          const registeredAccounts = await pxe.getRegisteredAccounts();
          const isAlreadyRegistered = registeredAccounts.some((registered) =>
            registered.address.equals(accountAddress),
          );

          console.log('[Wallet] Account address:', accountAddress.toString());
          console.log('[Wallet] Account already registered:', isAlreadyRegistered);

          if (isAlreadyRegistered) {
            // Account is already registered, just get the wallet
            console.log('[Wallet] Using already registered account');
            wallet = await account.getWallet();
          } else {
            // Try to register the account
            console.log('[Wallet] Attempting to register new account...');
            try {
              wallet = await account.register();
              console.log('[Wallet] Account registered successfully');
            } catch (registerError) {
              console.warn('[Wallet] Account registration failed:', registerError);

              // Registration might fail if the account exists but isn't in our local PXE
              // Try to get the wallet anyway
              try {
                wallet = await account.getWallet();
                console.log('[Wallet] Got wallet despite registration failure');
              } catch (getWalletError) {
                console.error('[Wallet] Could not get wallet:', getWalletError);
                // Use the account directly as last resort
                wallet = account as unknown as AccountWallet;
              }
            }
          }
        } catch (error) {
          console.error('[Wallet] Error during account setup:', error);
          // Last resort: use the account directly
          wallet = account as unknown as AccountWallet;
        }

        if (!wallet) {
          throw new Error('Failed to create wallet');
        }

        setConnectedAccount(wallet.getAddress().toString());

        // Create local transport pair for wallet node communication
        const [clientTransport, walletTransport] = createLocalTransportPair();

        // Create Aztec wallet node with proper transport
        const aztecWalletNode = createAztecWalletNode(wallet, pxe, walletTransport);

        // Add debugging middleware to see all incoming requests
        aztecWalletNode.addMiddleware(async (context, request, next) => {
          console.log('[DEBUG] Incoming request to wallet node:');
          console.log('  Method:', request.method);
          console.log('  Params:', request.params);
          console.log('  Params Type:', typeof request.params);
          console.log('  Params Keys:', request.params ? Object.keys(request.params) : null);
          console.log('  Params JSON:', JSON.stringify(request.params, null, 2));
          console.log('  Request ID:', request.id);
          console.log('  Context:', context);

          try {
            const response = await next();
            console.log('[DEBUG] Response from wallet node:', {
              method: request.method,
              response,
              id: request.id,
            });
            return response;
          } catch (error) {
            console.error('[DEBUG] Error in wallet node:');
            console.error('  Method:', request.method);
            console.error('  Error:', error);
            console.error('  Error Message:', error instanceof Error ? error.message : 'Unknown error');
            console.error('  Error Stack:', error instanceof Error ? error.stack : undefined);
            console.error('  Error JSON:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
            console.error('  Request Params:', request.params);
            console.error('  Request Params JSON:', JSON.stringify(request.params, null, 2));
            throw error;
          }
        });

        // Add middleware to the wallet node for function arg names, summaries, and history
        aztecWalletNode.addMiddleware(createFunctionArgNamesMiddleware(pxe));
<<<<<<< HEAD
<<<<<<< HEAD
        aztecWalletNode.addMiddleware(createHistoryMiddleware((entries) => {
          setRequestHistory(entries as HistoryEntry[]);
=======
=======
        aztecWalletNode.addMiddleware(createTransactionSummaryMiddleware());
>>>>>>> bd392add (feat(modal-react,modal-core): enhance Aztec transaction flow with simulation, summaries, and improved execution)
        aztecWalletNode.addMiddleware(
          createHistoryMiddleware((entries) => {
            setRequestHistory(entries as HistoryEntry[]);
>>>>>>> c65878d3 (feat(examples): add comprehensive example applications)

            // Update transaction statistics
            const historyEntries = entries as HistoryEntry[];
            const pendingCount = historyEntries.filter((e) => e.processingStatus === 'processing').length;
            const successCount = historyEntries.filter((e) => e.processingStatus === 'success').length;
            const errorCount = historyEntries.filter((e) => e.processingStatus === 'error').length;
            const totalCount = historyEntries.length;

<<<<<<< HEAD
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
=======
            setTransactionStats({
              pending: pendingCount,
              total: totalCount,
              successful: successCount,
              errors: errorCount,
            });

            // Calculate timing statistics
            const newTimingStats: TimingStatistics = {};
            historyEntries
              .filter((entry) => entry.processingStatus === 'success' && entry.duration !== undefined)
              .forEach((entry) => {
                const method = entry.method;
                const duration = entry.duration as number;
>>>>>>> c65878d3 (feat(examples): add comprehensive example applications)

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
            Object.keys(newTimingStats).forEach((method) => {
              const stats = newTimingStats[method];
              const times = stats.times;

              stats.count = times.length;
              stats.min = Math.min(...times);
              stats.max = Math.max(...times);
              stats.avg = times.reduce((a, b) => a + b, 0) / times.length;

              // Calculate standard deviation
              const variance =
                times.reduce((acc, time) => {
                  return acc + (time - stats.avg) ** 2;
                }, 0) / times.length;
              stats.stdDev = Math.sqrt(variance);
            });

            setTimingStats(newTimingStats);

            // Show toast for errors only
            const latestEntry = historyEntries[historyEntries.length - 1];
            if (latestEntry?.processingStatus === 'error' && latestEntry?.error) {
              showError(`Request failed: ${latestEntry.error.message}`);
            }
          }),
        );

        // Create cross-window router transport for DApp communication
        // We need to get the opener (dApp) window reference
        console.log('[Wallet] Checking for window.opener:', {
          hasOpener: !!window.opener,
          openerType: typeof window.opener,
          locationHref: window.location.href,
          referrer: document.referrer,
        });

        // Note: wallet_ready message is sent from the useEffect to prevent duplicates

        const dappWindow = window.opener;
        if (!dappWindow) {
          console.warn('[Wallet] No parent window found. Wallet may not have been opened from a dApp.');
          // Continue anyway - we already sent the ready message above
          // Skip only the cross-window router setup
          return;
        }

        // Get the dApp origin using consistent detection logic
        // Security: ALWAYS require explicit origin - no wildcards
        const detectedOrigin = detectDappOrigin();
        if (!detectedOrigin) {
          console.error('[Wallet] Security Error: Cannot determine dApp origin for secure communication');
          showError('Security Error: Cannot establish secure connection - dApp origin unknown');
          return;
        }
        const dappOrigin = detectedOrigin; // Use the detected origin - no wildcards

        // Use the wallet-side transport that properly receives from and sends to the dApp
        const routerTransport = createWalletSideTransport(dappWindow, dappOrigin);

        // Add logging to verify transport is set up
        console.log('[Wallet] Router transport created:', {
          hasSend: typeof routerTransport.send === 'function',
          hasOnMessage: typeof routerTransport.onMessage === 'function',
          dappOrigin,
        });

        // Create custom permission manager with detailed logging and session tracking
        class DebugAllowAskDenyManager extends AllowAskDenyManager {
          // Track which methods were actually approved during connection per session
          private approvedMethods: Map<string, Set<string>> = new Map();
          // Store the initial state for checking permissions
          private permissionState: AllowAskDenyChainPermissions<RouterMethodMap>;

          constructor(
            approvePermissionsCallback: PermissionApprovalCallback<RouterContext>,
            askCallback: AskCallback<RouterMethodMap, RouterContext>,
            initialState: AllowAskDenyChainPermissions<RouterMethodMap>,
          ) {
            // Store the initial state for reference
            const stateCopy = new Map(initialState);

            // Wrap the approval callback to track approved methods
            const wrappedApprovalCallback = async (
              context: RouterContext,
              permissions: Record<string, string[]>,
            ): Promise<HumanReadableChainPermissions> => {
              // First call the original callback
              const result = await approvePermissionsCallback(context, permissions);

              // Store which methods were actually requested and approved
              const sessionId = context.session?.id;
              if (sessionId) {
                const origin = context.origin || 'unknown';
                const sessionKey = `${origin}_${sessionId}`;

                // Store all requested methods as approved (for ASK state tracking)
                for (const [chainId, methods] of Object.entries(permissions)) {
                  if (Array.isArray(methods)) {
                    const approvedSet = this.approvedMethods.get(sessionKey) || new Set();
                    methods.forEach((method) => {
                      // Store all requested methods for ASK state checking
                      approvedSet.add(`${chainId}:${method}`);
                    });
                    this.approvedMethods.set(sessionKey, approvedSet);
                    console.log(
                      '[Wallet] Tracked',
                      approvedSet.size,
                      'requested methods for session',
                      sessionKey,
                    );
                  }
                }
              }

              return result;
            };

            super(wrappedApprovalCallback, askCallback, initialState);
            this.permissionState = stateCopy;
          }

          async checkCallPermissions(
            context: RouterContext,
            request: JSONRPCRequest<RouterMethodMap, 'wm_call', RouterMethodMap['wm_call']['params']>,
          ): Promise<boolean> {
            const params = request.params as RouterMethodMap['wm_call']['params'];

            // Debug logging for malformed requests
            if (!params) {
              console.error('[Wallet] checkCallPermissions: params is undefined or null');
              return false;
            }

            if (!params.call) {
              console.error('[Wallet] checkCallPermissions: params.call is undefined or null');
              console.error('[Wallet] Full request:', JSON.stringify(request, null, 2));
              console.error('[Wallet] Params structure:', JSON.stringify(params, null, 2));
              return false;
            }

            const chainId = params['chainId'];
            const method = params.call.method;
            const sessionId = context.session?.id;
            const origin = context.origin || 'unknown';

            // Validate we have required fields
            if (!chainId) {
              console.error('[Wallet] checkCallPermissions: chainId is missing');
              return false;
            }

            if (!method) {
              console.error('[Wallet] checkCallPermissions: method is missing from params.call');
              console.error('[Wallet] params.call structure:', JSON.stringify(params.call, null, 2));
              return false;
            }

            // First check the static permission state
            const state = this.permissionState.get(chainId)?.get(method);

            // If method is in ALLOW state, always permit it
            if (state === AllowAskDenyState.ALLOW) {
              console.log('[Wallet] Method', method, 'is in ALLOW state, permitting');
              return true;
            }

            // If method is in DENY state, always deny it
            if (state === AllowAskDenyState.DENY) {
              console.log('[Wallet] Method', method, 'is in DENY state, denying');
              return false;
            }

            // For ASK state or undefined, check if it was approved during connection
            if (sessionId) {
              const sessionKey = `${origin}_${sessionId}`;
              const methodKey = `${chainId}:${method}`;
              const approvedSet = this.approvedMethods.get(sessionKey);

              // Check if this method was explicitly approved
              if (approvedSet?.has(methodKey)) {
                console.log('[Wallet] Method', method, 'was approved during connection, permitting');
                return true;
              }

              // For ASK state, we should prompt the user
              console.log('[Wallet] Method', method, 'is in ASK state, prompting user for approval');
              if (this.askPermissions) {
                return await this.askPermissions(context, request);
              }

              console.log('[Wallet] Method', method, 'is in ASK state but no askCallback available, denying');
              return false;
            }

            // No session or no approval record, deny by default
            console.log('[Wallet] No session or approval record for method:', method);
            return false;
          }
        }

<<<<<<< HEAD
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
=======
        const permissionManager = new DebugAllowAskDenyManager(
          // approvePermissionsCallback: Handle initial connection permissions
          async (context, permissionRequest) => {
            const origin = context.origin || 'unknown';
            // Add defensive check for null/undefined permissions
            if (!permissionRequest || typeof permissionRequest !== 'object') {
              console.warn('Invalid permission request received:', permissionRequest);
              return {};
            }
            const chainIds = Object.keys(permissionRequest).join(', ');

            // If auto-approve is enabled, automatically approve
            const userApproved = autoApproveRef.current
              ? true
              : await (onApprovalRequest || (async () => true))({
                  origin,
                  chainId: chainIds,
                  method: 'wm_connect',
                  params: permissionRequest,
                });

            if (!userApproved) {
              return {}; // Return empty permissions if denied
            }

            // Convert to human-readable format
            const result: HumanReadableChainPermissions = {};
            for (const [chainId, methods] of Object.entries(permissionRequest)) {
              result[chainId] = {};
              // Ensure methods is an array before iterating
              if (Array.isArray(methods)) {
                for (const method of methods) {
                  result[chainId][method] = {
                    allowed: true,
                    shortDescription: 'allowed',
                  };
                }
              } else {
                console.warn(`Invalid methods for chain ${chainId}:`, methods);
              }
            }
            return result;
          },
          // askCallback: Handle individual method calls in ASK state
          async (context, request) => {
            console.log('[Wallet] askCallback called with context:', context, 'request:', request);

            // If auto-approve is enabled, automatically approve
            if (autoApproveRef.current) {
              console.log('[Wallet] Auto-approve enabled, returning true');
              return true;
            }

            const origin = context.origin || 'unknown';

            // Extract method details from the request
            let chainId = '';
            let method = '';
            let params: unknown;

            if (request.method === 'wm_call' && request.params) {
              const callParams = request.params as {
                chainId: string;
                call?: { method?: string; params?: unknown };
                sessionId?: string;
              };
              chainId = callParams.chainId;
              method = callParams.call?.method || '';
              params = callParams.call?.params;
              console.log(
                '[Wallet] wm_call for method:',
                method,
                'chainId:',
                chainId,
                'sessionId:',
                callParams.sessionId,
              );
            } else if (request.method === 'wm_bulkCall' && request.params) {
              const bulkParams = request.params as { chainId: string; sessionId?: string; calls?: unknown[] };
              chainId = bulkParams.chainId;
              method = 'bulk_call'; // Simplified for UI
              params = bulkParams.calls;
              console.log('[Wallet] wm_bulkCall for chainId:', chainId, 'sessionId:', bulkParams.sessionId);
            }

            const transactionSummary = (context as { transactionSummary?: TransactionSummary }).transactionSummary;
            const functionArgNames = (context as { functionCallArgNames?: FunctionArgNames }).functionCallArgNames;

            const displayParams =
              transactionSummary && transactionSummary.functionCalls.length > 0
                ? {
                    functionCalls: transactionSummary.functionCalls,
                    originalParams: params,
                  }
                : params;

            // Now we can use the async approval flow
            return await (onApprovalRequest || (async () => true))({
              origin,
              chainId,
              method,
              params: displayParams,
              functionArgNames,
            });
          },
          // initialState: Define initial permission states
          (() => {
            const initialState = new Map([
              [
                'aztec:31337',
                new Map([
                  // Methods that are always allowed (ALLOW state)
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
                  ['aztec_simulateTx', AllowAskDenyState.ALLOW],
                  ['aztec_wmSimulateTx', AllowAskDenyState.ALLOW],

                  // Methods that require approval each time (ASK state)
                  ['aztec_sendTx', AllowAskDenyState.ASK],
                  ['aztec_proveTx', AllowAskDenyState.ASK],
                  ['aztec_wmExecuteTx', AllowAskDenyState.ASK],
                  ['aztec_wmDeployContract', AllowAskDenyState.ASK],
                  ['aztec_contractInteraction', AllowAskDenyState.ASK],
                  ['aztec_registerContract', AllowAskDenyState.ASK],
                  ['aztec_registerContractClass', AllowAskDenyState.ASK],
                  ['aztec_registerSender', AllowAskDenyState.ASK],
                  ['aztec_createAuthWit', AllowAskDenyState.ASK],
                  ['aztec_profileTx', AllowAskDenyState.ASK],
                  ['aztec_simulateUtility', AllowAskDenyState.ASK],

                  // Methods that are always denied (DENY state)
                  ['aztec_removeSender', AllowAskDenyState.DENY],
                  ['aztec_getSenders', AllowAskDenyState.DENY],
                  ['aztec_getPrivateEvents', AllowAskDenyState.DENY],
                  ['aztec_getContracts', AllowAskDenyState.DENY],
                ]),
              ],
            ]);

            // Log the initial state for debugging
            const aztecMethods = initialState.get('aztec:31337');
            console.log('[Wallet] Permission manager initial state:', {
              chainIds: Array.from(initialState.keys()),
              'aztec:31337_methods': aztecMethods
                ? Array.from(aztecMethods.entries()).map(([method, state]) => `${method}: ${state}`)
                : [],
            });

            return initialState;
          })(),
        );
>>>>>>> c65878d3 (feat(examples): add comprehensive example applications)

        // Create wallets map with the client transport
        const wallets = new Map<ChainId, import('@walletmesh/jsonrpc').JSONRPCTransport>([
          ['aztec:31337', clientTransport],
        ]);

        // Create session store with persistent configuration
        const sessionStore = new MemorySessionStore({
          lifetime: 24 * 60 * 60 * 1000, // 24 hours lifetime
          refreshOnAccess: true, // Refresh expiry on each access
        });

        console.log('[Wallet] Created session store with 24h lifetime and auto-refresh');

        // Configure router with session store and optional proxy settings
        const routerConfig: WalletRouterConfig = {
          sessionStore, // Add explicit session store
          proxyConfig: {
            timeoutMs: 600000, // 10 minutes
            debug: process.env.NODE_ENV === 'development',
          },
          debug: process.env.NODE_ENV === 'development',
        };

        // Create the router with transports
        const router = new WalletRouter(routerTransport, wallets, permissionManager, routerConfig);

<<<<<<< HEAD
        // Add origin middleware to provide proper origin context
        router.addMiddleware(createOriginMiddleware(detectedOrigin));
=======
        // IMPORTANT: Add origin middleware FIRST, before any other middleware
        // This ensures the origin is available for session validation
        router.addMiddleware(createOriginMiddleware(detectedOrigin));
        console.log('[Wallet] Added origin middleware with detected origin:', detectedOrigin);

        // Store router and transport references to prevent garbage collection
        window.walletRouter = router;
        window.walletTransport = routerTransport;
        window.walletPermissionManager = permissionManager;
        window.sessionStore = sessionStore; // Also store session store for debugging

        // Log router creation
        console.log('[Wallet] WalletRouter created:', {
          hasTransport: !!routerTransport,
          walletsCount: wallets.size,
          hasPermissionManager: !!permissionManager,
          routerMethods: router.getRegisteredMethods ? router.getRegisteredMethods() : 'N/A',
        });

        // Test function is already created globally in a separate useEffect

        // Permission manager reference no longer needed since we recreate based on autoApprove prop

        // Send ready message to the opener window (PopupWindowTransport expects this)
        // Send wallet_ready message with retry mechanism and confirmation
        if (dappWindow && !window.walletReadySent) {
          const sendWalletReady = async (retries = 3) => {
            for (let i = 0; i < retries; i++) {
              try {
                console.log(
                  `[Wallet] Sending wallet_ready message attempt ${i + 1}/${retries} to dApp at`,
                  dappOrigin,
                );

                // Send the wallet_ready message
                dappWindow.postMessage(
                  {
                    type: 'wallet_ready',
                    origin: window.location.origin,
                    timestamp: Date.now(),
                  },
                  dappOrigin,
                );

                // Wait for acknowledgment with timeout
                await new Promise<void>((resolve, reject) => {
                  const timeout = setTimeout(() => reject(new Error('No acknowledgment received')), 2000);

                  const handler = (event: MessageEvent) => {
                    if (event.data?.type === 'wallet_ready_ack' && event.origin === dappOrigin) {
                      clearTimeout(timeout);
                      window.removeEventListener('message', handler);
                      console.log('[Wallet] ✓ Received wallet_ready acknowledgment from dApp');
                      resolve();
                    }
                  };

                  window.addEventListener('message', handler);
                });

                console.log('[Wallet] ✓ wallet_ready message sent and acknowledged');
                window.walletReadySent = true;
                break; // Success - exit retry loop
              } catch (error) {
                console.warn(`[Wallet] ⚠ wallet_ready attempt ${i + 1} failed:`, error);
                if (i === retries - 1) {
                  // On final failure, send anyway without waiting for ack
                  console.log('[Wallet] Sending final wallet_ready without waiting for ack');
                  dappWindow.postMessage({ type: 'wallet_ready' }, dappOrigin);
                  window.walletReadySent = true;
                  break;
                }
                // Wait before retry
                await new Promise((resolve) => setTimeout(resolve, 1000));
              }
            }
          };

          // Start the async sending process
          sendWalletReady().catch((error) => {
            console.error('[Wallet] Failed to send wallet_ready message:', error);
          });
        }

        // Add debugging middleware to the router (with enhanced session debugging)
        router.addMiddleware(async (context, request, next) => {
          console.log('[ROUTER DEBUG] Incoming request:', {
            method: request.method,
            params: request.params,
            id: request.id,
            hasContext: !!context,
            contextOrigin: context?.origin,
            contextSession: context?.session?.id,
            sessionStore: sessionStore ? 'configured' : 'missing',
          });

          // Log session store state for debugging
          if (request.method === 'wm_connect' || request.method === 'wm_call') {
            const allSessions = await sessionStore.getAll();
            console.log('[ROUTER DEBUG] Session store state:', {
              sessionCount: allSessions.size,
              sessionKeys: Array.from(allSessions.keys()),
              requestSessionId: (request.params as { sessionId?: string })?.sessionId,
              contextSessionId: context?.session?.id,
            });
          }

          try {
            const response = await next();
            console.log('[ROUTER DEBUG] Response:', {
              method: request.method,
              responseType: typeof response,
              hasResult: !!(response as { result?: unknown })?.result,
              id: request.id,
            });
            return response;
          } catch (error) {
            console.error('[ROUTER DEBUG] Error:', {
              method: request.method,
              error,
              errorMessage: error instanceof Error ? error.message : 'Unknown error',
              errorStack: error instanceof Error ? error.stack : undefined,
              errorCode: (error as { code?: unknown })?.code,
              errorData: (error as { data?: unknown })?.data,
              id: request.id,
            });
            throw error;
          }
        });

        // Origin middleware already added above before other middleware
>>>>>>> c65878d3 (feat(examples): add comprehensive example applications)

        routerRef.current = router;

        setIsConnected(true);
        setConnectionStatus('connected');
        setConnectionError(null);

        // Notify connected dApps that PXE is ready to accept requests
        void router
          .notify('aztec_status', {
            pxeReady: true,
            timestamp: Date.now(),
          })
          .catch((error) => {
            console.error('[Wallet] Failed to emit aztec_status notification', error);
          });

        // Ready message is already sent above after router creation
        console.log('[Wallet] Wallet router setup complete');
      } catch (error) {
        console.error('Error setting up wallet router:', error);
        const friendlyMessage = getUserFriendlyErrorMessage(error);
        setConnectionStatus('failed');
        setConnectionError(friendlyMessage);
        showError(friendlyMessage);
      }
    };

    // Initialize
    setupWalletRouter();
  }, [onApprovalRequest, showError, showWarning]);

<<<<<<< HEAD
  }, [permissionManager, showError, showSuccess]);
=======
  // Helper function to detect dApp origin consistently
  const detectDappOrigin = (): string | undefined => {
    let detectedOrigin: string | undefined;

    // Method 1: Try URL parameter first (most reliable, passed by dApp)
    // This is the REQUIRED method for secure communication
    if (window?.location.search) {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const dappOriginParam = urlParams.get('dappOrigin');
        if (dappOriginParam) {
          detectedOrigin = decodeURIComponent(dappOriginParam);
          // Validate the origin format
          try {
            const url = new URL(detectedOrigin);
            detectedOrigin = url.origin; // Use normalized origin
            console.log('[Wallet] dApp origin detected and validated from URL parameter:', detectedOrigin);
            return detectedOrigin;
          } catch (e) {
            console.error('[Wallet] Invalid dApp origin format in URL parameter:', dappOriginParam, e);
            return undefined;
          }
        }
      } catch (e) {
        console.warn('[Wallet] Failed to parse URL parameters:', e);
      }
    }

    // Method 2: Try document.referrer (less reliable fallback)
    if (document?.referrer) {
      try {
        const referrerUrl = new URL(document.referrer);
        detectedOrigin = referrerUrl.origin;
        console.log('[Wallet] dApp origin detected from document.referrer (less secure):', detectedOrigin);
        showWarning(
          'Security Warning: Using referrer for origin detection. Please update dApp to pass origin in URL.',
        );
        return detectedOrigin;
      } catch (e) {
        console.warn('[Wallet] Failed to parse document.referrer:', e);
      }
    }

    // Method 3: Try window.opener.location.origin (only for same-origin - rarely works)
    if (window?.opener) {
      try {
        detectedOrigin = window.opener.location.origin;
        console.log('[Wallet] dApp origin detected from window.opener (same-origin only):', detectedOrigin);
        return detectedOrigin;
      } catch (_e) {
        console.log('[Wallet] Cross-origin context detected, cannot access window.opener.location');
      }
    }

    console.error(
      '[Wallet] SECURITY ERROR: Could not determine dApp origin. URL parameter "dappOrigin" is required.',
    );
    return undefined;
  };

  // Note: wallet_ready message is sent in the router setup useEffect above
  // We don't need a separate useEffect for this as it causes duplicate sends
  // The router setup already handles sending wallet_ready when appropriate
>>>>>>> c65878d3 (feat(examples): add comprehensive example applications)

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
  const filteredHistory = requestHistory.filter(
    (req) => req.processingStatus && statusFilters[req.processingStatus],
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
    setTimingSortConfig((prev) => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
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
          params={
            pendingApproval.params as
              | {
                  functionCalls?:
                    | { contractAddress: string; functionName: string; args: unknown[] }[]
                    | undefined;
                }
              | undefined
          }
          origin={pendingApproval.origin}
          functionArgNames={
            pendingApproval.functionArgNames ?? requestHistory.find((h) => !h.status)?.functionArgNames
          }
          onApprove={handleApprove}
          onDeny={handleDeny}
          onEnableAutoApprove={onEnableAutoApprove || (() => {})}
        />
      )}

      {connectionStatus === 'failed' ? (
        <div className="error-container">
          <p className="connection-status error">❌ Connection Failed</p>
          <div className="error-details">
            <div className="error-message-container">
              {connectionError?.split('\n').map((line, index) => (
                <p
                  key={`error-line-${index}-${line.substring(0, 10)}`}
                  className={`error-message ${line.startsWith('🔧') || line.startsWith('💡') || line.startsWith('📊') || line.startsWith('•') ? 'error-help' : ''}`}
                >
                  {line}
                </p>
              ))}
            </div>
            {retryAttempt > 0 && <p className="retry-info">🔄 Retry attempt: {retryAttempt}</p>}
            <button type="button" className="retry-button" onClick={handleRetryConnection}>
              🔄 Retry Connection
            </button>
          </div>
        </div>
      ) : !isConnected ? (
        <div className="initializing-simple">
          <p className="connection-status">Initializing...</p>
        </div>
      ) : (
        <>
          <div className="connection-header">
            <p className="connection-status connected">
              ✅ Wallet Ready
              {nodeUrl && (
                <span className="node-info" title={`Connected to ${nodeUrl}`}>
                  • {nodeUrl.includes('localhost') ? 'Local' : 'Remote'} Node
                </span>
              )}
            </p>
          </div>
          <p className="connection-status account-info">
            <strong>Account:</strong> <code className="account-address">{connectedAccount || 'Loading...'}</code>
          </p>
          {activeProvingCount > 0 && (
            <div className="proving-banner" role="status" aria-live="polite">
              <div className="proving-banner__header">
                <span className="proving-banner__spinner" aria-hidden="true" />
                <div>
                  <strong>Generating zero-knowledge proof</strong>
                  <div className="proving-banner__subtitle">
                    {activeProvingCount === 1
                      ? '1 transaction is currently proving'
                      : `${activeProvingCount} transactions are currently proving`}
                  </div>
                </div>
              </div>
              <ul className="proving-banner__list">
                {activeProvingRequests.map((entry) => (
                  <li key={`${entry.time}-${entry.method}`} className="proving-banner__item">
                    <span className="proving-banner__method">{entry.method}</span>
                    <span className="proving-banner__timer">
                      Started {new Date(entry.requestTimestamp).toLocaleTimeString()}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="proving-banner__hint">This can take a couple of minutes. Sit tight!</p>
            </div>
          )}
          <div className="transaction-stats">
            <div className="stat-item">
              <div className="stat-label">Node</div>
              <div className="stat-value node-stat">
                <span className={`node-indicator ${nodeStatus}`}>●</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Pending</div>
              <div className={`stat-value ${transactionStats.pending > 0 ? 'pending' : 'total'}`}>
                {transactionStats.pending}
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Success</div>
              <div className="stat-value success">{transactionStats.successful}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Errors</div>
              <div className={`stat-value error ${transactionStats.errors > 0 ? 'has-errors' : ''}`}>
                {transactionStats.errors}
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Total</div>
              <div className="stat-value total">{transactionStats.total}</div>
            </div>
          </div>

          {/* Timing Statistics Section */}
          <div className="timing-stats-container">
            <button
<<<<<<< HEAD
=======
              type="button"
>>>>>>> c65878d3 (feat(examples): add comprehensive example applications)
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
                  <p className="no-timing-data">
                    No timing data available. Complete some successful requests to see statistics.
                  </p>
                ) : (
                  <div className="timing-stats-table-container">
                    <table className="timing-stats-table">
                      <thead>
                        <tr>
<<<<<<< HEAD
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
=======
                          <th className="sortable-header" onClick={() => handleSort('method')}>
                            Method{getSortIndicator('method')}
                          </th>
                          <th className="sortable-header" onClick={() => handleSort('count')}>
                            Count{getSortIndicator('count')}
                          </th>
                          <th className="sortable-header" onClick={() => handleSort('min')}>
                            Min{getSortIndicator('min')}
                          </th>
                          <th className="sortable-header" onClick={() => handleSort('max')}>
                            Max{getSortIndicator('max')}
                          </th>
                          <th className="sortable-header" onClick={() => handleSort('avg')}>
                            Avg{getSortIndicator('avg')}
                          </th>
                          <th className="sortable-header" onClick={() => handleSort('stdDev')}>
>>>>>>> c65878d3 (feat(examples): add comprehensive example applications)
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
                type="button"
                className="filter-button"
                onClick={() => setStatusFilters({ processing: true, success: true, error: true })}
              >
                Select All
              </button>
              <button
                type="button"
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
                  onChange={(e) => setStatusFilters((prev) => ({ ...prev, processing: e.target.checked }))}
                />
                ⏳ Processing
              </label>
              <label className="filter-label">
                <input
                  type="checkbox"
                  checked={statusFilters.success}
                  onChange={(e) => setStatusFilters((prev) => ({ ...prev, success: e.target.checked }))}
                />
                ✅ Success
              </label>
              <label className="filter-label">
                <input
                  type="checkbox"
                  checked={statusFilters.error}
                  onChange={(e) => setStatusFilters((prev) => ({ ...prev, error: e.target.checked }))}
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
                <li key={`history-${request.time}-${index}`}>
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
                  isTransactionParams(request.params)
                    ? request.params.functionCalls.map((call, idx) => (
                        <FunctionCallDisplay
                          key={`call-${request.time}-${idx}`}
                          call={call}
                          functionArgNames={request.functionArgNames}
                        />
                      ))
                    : null}
                  {request.method === 'aztec_simulateTransaction' &&
                  request.params &&
                  isTransactionFunctionCall(request.params) ? (
                    <FunctionCallDisplay call={request.params} functionArgNames={request.functionArgNames} />
                  ) : null}
                  {request.approvalStatus && (
                    <p className="request-details">
                      <b>Approval Status:</b>{' '}
                      <span className={request.approvalStatus === 'denied' ? 'denied-status' : ''}>
                        {request.approvalStatus === 'approved' ? 'Approved' : 'Denied'}
                      </span>
                    </p>
                  )}
                  {request.processingStatus && (
                    <p className="request-details">
                      <b>Processing Status:</b>{' '}
                      <span
                        className={
                          request.processingStatus === 'processing'
                            ? 'processing-status'
                            : request.processingStatus === 'error'
                              ? 'error-status'
                              : 'success-status'
                        }
                      >
                        {request.processingStatus === 'processing'
                          ? '⏳ Processing'
                          : request.processingStatus === 'error'
                            ? '❌ Error'
                            : '✅ Success'}
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
                  ) : (
                    request.duration && (
                      <p className="request-details">
                        <b>Duration:</b>{' '}
                        {request.duration >= 1000
                          ? `${(request.duration / 1000).toFixed(1)}s`
                          : `${request.duration}ms`}
                      </p>
                    )
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
