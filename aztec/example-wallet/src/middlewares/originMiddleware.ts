import type { JSONRPCMiddleware } from '@walletmesh/jsonrpc';
import type { RouterMethodMap, RouterContext } from '@walletmesh/router';

/**
 * Gets the origin of the dApp that opened this wallet window.
 * Uses window.opener as the primary method since we've configured CORS headers
 * to allow cross-origin access.
 */
function getDappOrigin(): string | undefined {
  // Method 1: Try to access window.opener.location.origin (should work with proper CORS headers)
  if (typeof window !== 'undefined' && window.opener) {
    try {
      const origin = window.opener.location.origin;
      console.log('Successfully detected dApp origin from window.opener:', origin);
      return origin;
    } catch (e) {
      console.warn('Could not access window.opener.location.origin due to CORS:', e);
    }
  }

  // Method 2: Use document.referrer (fallback for popup windows)
  if (typeof document !== 'undefined' && document.referrer) {
    try {
      const referrerUrl = new URL(document.referrer);
      console.log('Detected dApp origin from document.referrer:', referrerUrl.origin);
      return referrerUrl.origin;
    } catch (e) {
      console.warn('Failed to parse document.referrer:', e);
    }
  }

  // Method 3: Try to access window.parent.location.origin (for iframe scenarios)
  if (typeof window !== 'undefined' && window.parent !== window) {
    try {
      const origin = window.parent.location.origin;
      console.log('Detected dApp origin from window.parent:', origin);
      return origin;
    } catch (e) {
      console.warn('Could not access window.parent.location.origin due to CORS:', e);
    }
  }

  console.warn('Could not detect dApp origin from any method');
  return undefined;
}

/**
 * Creates middleware that injects the origin into the router context.
 * The origin is determined by looking at the dApp that opened this wallet window.
 *
 * @param dappOrigin - Optional dApp origin that was already determined (e.g., from window.opener)
 * @returns Middleware function that sets the origin in context
 */
export function createOriginMiddleware(dappOrigin?: string): JSONRPCMiddleware<RouterMethodMap, RouterContext> {
  return async (context, _request, next) => {
    // Use the provided dApp origin if available
    let origin = dappOrigin;

    // If no dApp origin provided, try to detect it
    if (!origin) {
      origin = getDappOrigin();
    }

    // If we still don't have an origin, fall back to current window origin
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
