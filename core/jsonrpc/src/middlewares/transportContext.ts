/**
 * Transport context middleware for JSON-RPC
 *
 * Provides middleware that extracts trusted context information from transports
 * and injects it into the RPC context. This allows middleware and method handlers
 * to access browser-validated origin information and other transport metadata.
 *
 * @module middlewares/transportContext
 */

import type {
  JSONRPCContext,
  JSONRPCMiddleware,
  JSONRPCTransport,
  TransportContext,
} from '../types.js';

/**
 * Creates middleware that extracts context from transports.
 *
 * This middleware checks if the transport implements `getMessageContext()` and,
 * if so, extracts trusted context information (like browser-validated origin)
 * and injects it into the RPC context.
 *
 * The middleware sets the following context properties:
 * - `context.origin`: The trusted origin from the transport (if available)
 * - `context._transportMeta`: Full transport context metadata
 *
 * @param transport - The JSON-RPC transport instance
 * @returns Middleware function that injects transport context
 *
 * @example
 * ```typescript
 * import { JSONRPCNode } from '@walletmesh/jsonrpc';
 * import { createTransportContextMiddleware } from '@walletmesh/jsonrpc/middlewares';
 *
 * // Create transport (e.g., PopupWindowTransport that implements getMessageContext)
 * const transport = new PopupWindowTransport({...});
 *
 * // Create JSON-RPC node
 * const node = new JSONRPCNode(transport, {});
 *
 * // Add transport context middleware FIRST (before other middleware)
 * node.addMiddleware(createTransportContextMiddleware(transport));
 *
 * // Add other middleware that can now access context.origin
 * node.addMiddleware(async (context, request, next) => {
 *   console.log('Request from origin:', context.origin); // Browser-validated!
 *   return next();
 * });
 * ```
 *
 * @example
 * ```typescript
 * // In WalletRouter - automatic origin injection
 * class WalletRouter {
 *   constructor(transport, wallets, options) {
 *     this.node = new JSONRPCNode(transport, {});
 *
 *     // Add transport context middleware FIRST
 *     this.node.addMiddleware(createTransportContextMiddleware(transport));
 *
 *     // Permission middleware can now use context.origin
 *     this.node.addMiddleware(async (context, request, next) => {
 *       const origin = context.origin || 'unknown';
 *       // Validate permissions based on browser-validated origin
 *       if (!isAllowedOrigin(origin)) {
 *         throw new Error('Unauthorized origin');
 *       }
 *       return next();
 *     });
 *   }
 * }
 * ```
 */
export function createTransportContextMiddleware<C extends JSONRPCContext>(
  transport: JSONRPCTransport,
): JSONRPCMiddleware<any, C> {
  return async (context, _request, next) => {
    // Check if transport provides context
    if (transport.getMessageContext) {
      const transportContext: TransportContext | undefined = transport.getMessageContext();

      if (transportContext) {
        // Inject origin into context (only if not already present)
        // Use type assertion since origin is not a standard JSONRPCContext property
        const ctx = context as any;
        if (transportContext.origin && !ctx.origin) {
          ctx.origin = transportContext.origin;
        }

        // Store full transport metadata for debugging/logging
        ctx._transportMeta = transportContext;
      }
    }

    // Continue to next middleware/handler
    return next();
  };
}
