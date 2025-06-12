import type { JSONRPCMiddleware } from '@walletmesh/jsonrpc';
import type { RouterMethodMap, RouterContext } from '@walletmesh/router';

/**
 * Creates middleware that injects the origin into the router context.
 * The origin is provided by a function that returns the current origin for the request.
 *
 * @param getOrigin - Function that returns the current origin
 * @returns Middleware function that sets the origin in context
 */
export function createOriginMiddleware(
  getOrigin: () => string | undefined,
): JSONRPCMiddleware<RouterMethodMap, RouterContext> {
  return async (context, _request, next) => {
    // Get the origin for this request
    let origin = getOrigin();

    // If we don't have an origin, try to extract it from window.location as fallback
    if (!origin && typeof window !== 'undefined') {
      origin = window.location.origin;
    }

    // Set the origin in the context so it's available to the router methods
    // Always set an origin, use 'unknown' as final fallback
    context.origin = origin || 'unknown';

    // Continue to next middleware
    return next();
  };
}
