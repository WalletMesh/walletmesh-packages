/**
 * Context extraction middleware for wallet nodes
 *
 * Extracts context information (like origin) that has been forwarded from the router
 * via the `_context` field in JSON-RPC requests. This allows wallet nodes to access
 * trusted origin information when processing requests.
 *
 * @module middlewares/contextExtractionMiddleware
 */

import type { JSONRPCMiddleware } from '@walletmesh/jsonrpc';

/**
 * Creates middleware that extracts forwarded context from requests.
 *
 * This middleware checks if the request contains a `_context` field (added by the router
 * when forwarding requests) and extracts it into the RPC context. This makes the origin
 * and other context information available to method handlers and other middleware.
 *
 * The middleware sets the following context properties:
 * - `context.origin`: The dApp origin forwarded from the router
 * - `context.sessionId`: The session ID if included in forwarded context
 *
 * **Important**: This middleware should be added BEFORE permission middleware so that
 * permission checks have access to the correct origin.
 *
 * @returns Middleware function that extracts context from requests
 *
 * @example
 * ```typescript
 * import { JSONRPCNode } from '@walletmesh/jsonrpc';
 * import { createContextExtractionMiddleware } from '@walletmesh/aztec/helpers';
 *
 * // Create Aztec wallet node
 * const walletNode = createAztecWalletNode(wallet, pxe, transport);
 *
 * // Add context extraction middleware BEFORE permission middleware
 * walletNode.addMiddleware(createContextExtractionMiddleware());
 *
 * // Permission middleware can now use context.origin
 * walletNode.addMiddleware(async (context, request, next) => {
 *   const origin = context.origin || 'unknown';
 *   console.log('Request from:', origin); // Correctly shows dApp origin
 *   return next();
 * });
 * ```
 *
 * @example
 * ```typescript
 * // In Wallet.tsx - apply before permission middleware
 * const aztecWalletNode = createAztecWalletNode(wallet, pxe, walletTransport);
 *
 * // Add context extraction middleware FIRST
 * aztecWalletNode.addMiddleware(createContextExtractionMiddleware());
 *
 * // Then add permission middleware (which needs origin)
 * aztecWalletNode.addMiddleware(permissionMiddleware);
 * ```
 */
export function createContextExtractionMiddleware(): JSONRPCMiddleware<any, any> {
  return async (context, request, next) => {
    // Extract _context from request if present (added by router when forwarding)
    const requestContext = (request as any)._context;

    if (requestContext) {
      // Inject origin into context
      if (requestContext.origin) {
        (context as any).origin = requestContext.origin;
      }

      // Inject session ID if present
      if (requestContext.sessionId) {
        (context as any).sessionId = requestContext.sessionId;
      }
    }

    // Continue to next middleware/handler
    return next();
  };
}
