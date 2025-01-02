import type { JSONRPCMiddleware, JSONRPCRequest, JSONRPCResponse } from '@walletmesh/jsonrpc';
import { RouterError } from './errors.js';
import type { RouterContext, PermissionCallback, RouterMethodMap } from './types.js';
import type { SessionStore } from './session-store.js';

/**
 * Creates middleware for session validation and permission checking
 */
export function createSessionMiddleware(
  sessionStore: SessionStore,
): JSONRPCMiddleware<RouterMethodMap, RouterContext> {
  return async (
    context: RouterContext,
    request: JSONRPCRequest<RouterMethodMap, keyof RouterMethodMap>,
    next: () => Promise<JSONRPCResponse<RouterMethodMap>>,
  ) => {
    const origin = context?.origin ?? 'unknown';

    const { sessionId } = (request.params ?? {}) as { sessionId?: string };

    // New session
    if (request.method === 'wm_connect') {
      if (!sessionId) {
        return next();
      }
      throw new RouterError('invalidRequest', 'Session ID provided for connect method');
    }

    if (request.method === 'wm_reconnect') {
      if (!sessionId) {
        throw new RouterError('invalidRequest', 'No session ID provided for reconnect method');
      }
    }

    if (!sessionId) {
      throw new RouterError('invalidRequest', 'No session ID provided');
    }

    // Existing session, ensure it is valid & refresh timestamp
    const session = await sessionStore.validateAndRefresh(`${origin}_${sessionId}`);
    if (!session) {
      throw new RouterError('invalidSession');
    }

    // Store session in context for use by method handlers
    context.session = session;

    return next();
  };
}

export function createPermissionsMiddleware(
  permissionCallback: PermissionCallback,
): JSONRPCMiddleware<RouterMethodMap, RouterContext> {
  return async (
    context: RouterContext,
    request: JSONRPCRequest<RouterMethodMap, keyof RouterMethodMap>,
    next: () => Promise<JSONRPCResponse<RouterMethodMap>>,
  ) => {
    const hasPermission = await permissionCallback(context, request).catch((error) => {
      throw new RouterError('insufficientPermissions', String(error));
    });
    if (!hasPermission) {
      throw new RouterError('insufficientPermissions');
    }

    return next();
  };
}
