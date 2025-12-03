import type { AztecHandlerContext, AztecWalletMethodMap } from '@walletmesh/aztec-rpc-wallet';
import type { JSONRPCMiddleware } from '@walletmesh/jsonrpc';
import type { RefObject } from 'react';
import type { FunctionArgNames } from './functionArgNamesMiddleware.js';
import type { TransactionSummary } from './transactionSummaryMiddleware.js';

/**
 * Wallet node level permission middleware that handles auto-approve mode.
 *
 * Note: The primary approval mechanism has been moved to the router's ApprovalQueueManager
 * which provides request-based (not method-based) approval tracking to prevent race conditions.
 *
 * This middleware is kept for:
 * 1. Auto-approve mode support for testing/development
 * 2. Extracting transaction data for the approval context
 *
 * Security features:
 * - Respects auto-approve mode for testing
 * - Works with deserialized params and extracted transaction data
 *
 * @param autoApproveRef - React ref to check if auto-approve mode is enabled
 * @returns Middleware function for the wallet node
 */
export const createWalletNodePermissionMiddleware = (
  autoApproveRef: RefObject<boolean>,
): JSONRPCMiddleware<
  AztecWalletMethodMap,
  AztecHandlerContext & {
    requiresUserApproval?: boolean;
    transactionSummary?: TransactionSummary;
    functionCallArgNames?: FunctionArgNames;
    origin?: string;
    txStatusId?: string;
  }
> => {
  return async (_context, request, next) => {
    const methodName = String(request.method);

    // Auto-approve if enabled (for testing/development)
    if (autoApproveRef.current) {
      console.log('[WalletNodePermission] Auto-approve enabled for:', methodName);
      return next();
    }

    // All other approval logic is now handled by the router's ApprovalQueueManager
    // The request has already been approved if it reaches this point
    console.log('[WalletNodePermission] Request approved by router, proceeding:', methodName);

    return next();
  };
};
