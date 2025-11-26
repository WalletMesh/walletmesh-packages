/**
 * Approval Queue Middleware for request-based approval flow.
 *
 * This middleware intercepts requests that require user approval and
 * blocks them until the user explicitly approves or denies each request.
 *
 * @module @walletmesh/router/approval
 */

import type { JSONRPCMiddleware, JSONRPCRequest, JSONRPCResponse } from '@walletmesh/jsonrpc';
import { RouterError } from '../errors.js';
import type { RouterContext, RouterMethodMap } from '../types.js';
import type { ApprovalQueueManager, ApprovalContext } from './ApprovalQueueManager.js';

/**
 * Configuration for the approval queue middleware.
 */
export interface ApprovalQueueMiddlewareConfig {
  /** Array of method names that require user approval */
  methodsRequiringApproval: string[];
  /** Timeout in milliseconds for approval requests. Defaults to 5 minutes */
  timeout?: number | undefined;
  /** Enable debug logging */
  debug?: boolean | undefined;
}

/**
 * Callback invoked when a new approval is queued.
 * The wallet UI should use this to show the approval dialog.
 */
export type OnApprovalQueuedCallback = (context: ApprovalContext) => void;

/**
 * Creates middleware for request-based approval queuing.
 *
 * This middleware:
 * 1. Intercepts requests for methods that require approval
 * 2. Uses the unique JSON-RPC request ID as the approval key (NOT method name)
 * 3. Generates a txStatusId for correlation with transaction tracking
 * 4. Creates a Promise that BLOCKS until user approves/denies
 * 5. Calls onApprovalQueued to notify the wallet UI
 *
 * The key security fix is using `request.id` as the unique key instead of
 * method name. This ensures concurrent requests for the same method each
 * get their own approval requirement.
 *
 * @param manager - The approval queue manager instance
 * @param config - Configuration for which methods require approval
 * @param onApprovalQueued - Callback to notify wallet UI of pending approval
 * @returns Middleware function for approval handling
 *
 * @example
 * ```typescript
 * const manager = new ApprovalQueueManager({ debug: true });
 *
 * const middleware = createApprovalQueueMiddleware(
 *   manager,
 *   {
 *     methodsRequiringApproval: [
 *       'aztec_wmExecuteTx',
 *       'aztec_wmDeployContract',
 *       'aztec_wmBatchExecute',
 *       'aztec_createAuthWit',
 *     ],
 *   },
 *   async (approvalContext) => {
 *     // Show approval dialog in wallet UI
 *     const approved = await showApprovalDialog(approvalContext);
 *     // Resolve the approval
 *     manager.resolveApproval(approvalContext.requestId, approved);
 *   }
 * );
 *
 * router.addMiddleware(middleware);
 * ```
 */
export function createApprovalQueueMiddleware(
  manager: ApprovalQueueManager,
  config: ApprovalQueueMiddlewareConfig,
  onApprovalQueued: OnApprovalQueuedCallback,
): JSONRPCMiddleware<RouterMethodMap, RouterContext> {
  const { methodsRequiringApproval, timeout, debug } = config;
  const methodSet = new Set(methodsRequiringApproval);

  const log = (message: string, data?: unknown): void => {
    if (debug) {
      console.log(`[ApprovalMiddleware] ${message}`, data ?? '');
    }
  };

  return async (
    context: RouterContext,
    request: JSONRPCRequest<RouterMethodMap, keyof RouterMethodMap>,
    next: () => Promise<JSONRPCResponse<RouterMethodMap>>,
  ) => {
    // Check if this is a wm_call request that wraps a method requiring approval
    if (request.method !== 'wm_call') {
      return next();
    }

    // Extract the inner method from wm_call params
    const params = request.params as { chainId?: string; call?: { method?: string; params?: unknown } };
    const innerMethod = params?.call?.method;

    if (!innerMethod || !methodSet.has(innerMethod)) {
      return next();
    }

    // This request requires approval
    const requestId = request.id;
    if (requestId === undefined || requestId === null) {
      log('Request has no ID, cannot queue approval');
      throw new RouterError('invalidRequest', 'Request ID is required for approval');
    }

    log(`Request ${requestId} requires approval for method: ${innerMethod}`);

    // Generate a unique txStatusId for correlation with transaction tracking
    const txStatusId = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Create the approval context
    const approvalContext: ApprovalContext = {
      requestId,
      chainId: params.chainId ?? 'unknown',
      method: innerMethod,
      params: params.call?.params,
      origin: context.origin,
      sessionId: context.session?.id,
      txStatusId,
      state: 'pending',
      queuedAt: Date.now(),
    };

    // Notify the wallet UI about the pending approval
    // This is called asynchronously - the wallet UI should resolve the approval
    // by calling manager.resolveApproval(requestId, approved)
    log(`Notifying wallet UI of pending approval for request ${requestId}`);

    // Queue the approval and BLOCK until resolved
    // The onApprovalQueued callback is called synchronously to notify the wallet UI
    // but we don't await it - the wallet UI will call resolveApproval when ready
    try {
      // Notify wallet UI (non-blocking)
      onApprovalQueued(approvalContext);

      // Block until the approval is resolved
      const approved = await manager.queueApproval(approvalContext, timeout);

      if (!approved) {
        log(`Request ${requestId} was denied by user`);
        throw new RouterError('insufficientPermissions', 'User denied the transaction request');
      }

      log(`Request ${requestId} was approved, proceeding with execution`);

      // User approved - continue to next middleware
      return next();
    } catch (error) {
      // Handle timeout or other errors
      if (error instanceof RouterError) {
        throw error;
      }

      if (error instanceof Error && error.message.includes('timed out')) {
        throw new RouterError('insufficientPermissions', 'Approval request timed out');
      }

      // Detect duplicate request ID error (when a second request with same ID arrives)
      if (error instanceof Error && error.message.includes('already pending')) {
        throw new RouterError('duplicateRequestId', error.message);
      }

      throw new RouterError('walletNotAvailable', error instanceof Error ? error.message : String(error));
    }
  };
}
