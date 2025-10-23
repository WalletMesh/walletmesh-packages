import type { AztecHandlerContext, AztecWalletMethodMap } from '@walletmesh/aztec-rpc-wallet';
import type { JSONRPCMiddleware } from '@walletmesh/jsonrpc';
import type { MutableRefObject } from 'react';
import type { FunctionArgNames } from './functionArgNamesMiddleware.js';
import type { TransactionSummary } from './transactionSummaryMiddleware.js';

/**
 * Wallet node level permission middleware that enforces user approval for sensitive methods.
 *
 * This middleware implements the second layer of a two-factor permission system:
 * 1. Router layer marks requests via shared state (ASK state methods)
 * 2. This middleware enforces approval by checking the shared state
 *
 * Security features:
 * - Checks shared state for approval requirements set by router
 * - Shows approval UI with transaction details from middleware context
 * - Respects auto-approve mode for testing
 * - Works with deserialized params and extracted transaction data
 *
 * @param onApprovalRequest - Callback to show approval UI and get user decision
 * @param autoApproveRef - React ref to check if auto-approve mode is enabled
 * @param pendingApprovals - Shared map of methods requiring approval (set by router)
 * @returns Middleware function for the wallet node
 */
export const createWalletNodePermissionMiddleware = (
  onApprovalRequest: (request: {
    origin: string;
    chainId: string;
    method: string;
    params?: unknown;
    functionArgNames?: FunctionArgNames;
  }) => Promise<boolean>,
  autoApproveRef: MutableRefObject<boolean>,
  pendingApprovals: Map<string, boolean>,
): JSONRPCMiddleware<
  AztecWalletMethodMap,
  AztecHandlerContext & {
    requiresUserApproval?: boolean;
    transactionSummary?: TransactionSummary;
    functionCallArgNames?: FunctionArgNames;
    origin?: string;
  }
> => {
  return async (context, request, next) => {
    const methodName = String(request.method);

    // Check if this method requires approval via shared state (set by router)
    const approvalKey = `aztec:31337:${methodName}`;
    const requiresUserApproval = pendingApprovals.get(approvalKey);

    console.log('[WalletNodePermission] Checking approval for:', {
      method: methodName,
      approvalKey,
      requiresUserApproval,
      pendingApprovalsSize: pendingApprovals.size,
    });

    // If not marked for approval by router, allow through
    if (!requiresUserApproval) {
      console.log('[WalletNodePermission] Method not marked for approval, allowing');
      return next();
    }

    // Clear the pending approval flag (single-use)
    pendingApprovals.delete(approvalKey);
    console.log('[WalletNodePermission] Cleared pending approval for', approvalKey);

    // If router marked this as requiring approval
    if (requiresUserApproval === true) {
      // Auto-approve if enabled
      if (autoApproveRef.current) {
        console.log('[Wallet] Auto-approve enabled, skipping approval prompt');
        return next();
      }

      // Get transaction data from context (populated by previous middleware)
      const transactionSummary = context.transactionSummary;
      const functionArgNames = context.functionCallArgNames;

      console.log('[Wallet] Wallet node requesting user approval:', {
        method: methodName,
        hasTransactionSummary: !!transactionSummary,
        hasFunctionArgNames: !!functionArgNames,
        functionCallsCount: transactionSummary?.functionCalls.length,
      });

      // Show approval UI with transaction details or deserialized params
      const approved = await onApprovalRequest({
        origin: context.origin || 'wallet-node',
        chainId: 'aztec:31337',
        method: methodName,
        params: transactionSummary?.functionCalls
          ? { functionCalls: transactionSummary.functionCalls }
          : request.params, // Pass deserialized params (from deserialization middleware)
        functionArgNames,
      });

      if (!approved) {
        console.log('[Wallet] User denied transaction');
        throw new Error('User denied transaction');
      }

      console.log('[Wallet] User approved transaction');
    }

    return next();
  };
};
