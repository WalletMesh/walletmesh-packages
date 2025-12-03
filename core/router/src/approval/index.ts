/**
 * Approval Queue System
 *
 * This module provides a secure, request-based approval queue for wallet operations
 * that require user confirmation. The key security feature is using unique JSON-RPC
 * request IDs as approval keys instead of method names, preventing race conditions
 * where concurrent requests could bypass user approval.
 *
 * @module @walletmesh/router/approval
 *
 * @example
 * ```typescript
 * import {
 *   ApprovalQueueManager,
 *   createApprovalQueueMiddleware,
 * } from '@walletmesh/router';
 *
 * // Create the approval manager
 * const approvalManager = new ApprovalQueueManager({
 *   defaultTimeout: 300000, // 5 minutes
 *   debug: true,
 * });
 *
 * // Create middleware for the router
 * const middleware = createApprovalQueueMiddleware(
 *   approvalManager,
 *   {
 *     methodsRequiringApproval: [
 *       'aztec_wmExecuteTx',
 *       'aztec_wmDeployContract',
 *     ],
 *   },
 *   (approvalContext) => {
 *     // Show approval UI
 *     showApprovalDialog(approvalContext).then((approved) => {
 *       approvalManager.resolveApproval(approvalContext.requestId, approved);
 *     });
 *   }
 * );
 *
 * // Add to router
 * router.addMiddleware(middleware);
 * ```
 */

export {
  ApprovalQueueManager,
  type ApprovalContext,
  type ApprovalQueueConfig,
  type ApprovalState,
} from './ApprovalQueueManager.js';

export {
  createApprovalQueueMiddleware,
  type ApprovalQueueMiddlewareConfig,
  type OnApprovalQueuedCallback,
} from './approvalQueueMiddleware.js';
