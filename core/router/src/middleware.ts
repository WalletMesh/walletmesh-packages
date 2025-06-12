import type { JSONRPCMiddleware, JSONRPCRequest, JSONRPCResponse } from '@walletmesh/jsonrpc';
import { RouterError } from './errors.js';
import type { RouterContext, PermissionCheckCallback, RouterMethodMap } from './types.js';
import type { SessionStore } from './session-store.js';

/**
 * Creates middleware for session validation and management.
 * This middleware handles:
 * - Session validation for existing sessions
 * - Session ID verification
 * - Special cases for connect/reconnect methods
 * - Session context population
 *
 * Session Flow:
 * 1. For wm_connect: Ensures no session ID is provided (new session)
 * 2. For wm_reconnect: Ensures session ID is provided
 * 3. For other methods: Validates existing session
 * 4. On success: Adds session to context for method handlers
 *
 * @param sessionStore - Store implementation for session persistence
 * @returns Middleware function for session handling
 *
 * @throws {RouterError} With code:
 * - 'invalidRequest' if session ID is missing or invalid
 * - 'invalidSession' if session validation fails
 *
 * @example
 * ```typescript
 * const router = new WalletRouter(...);
 *
 * // Add session middleware with persistent storage
 * router.addMiddleware(createSessionMiddleware(
 *   new LocalStorageSessionStore({
 *     lifetime: 24 * 60 * 60 * 1000, // 24 hours
 *     refreshOnAccess: true
 *   })
 * ));
 * ```
 *
 * @see {@link SessionStore} for session storage interface
 * @see {@link RouterError} for error codes and messages
 */
export function createSessionMiddleware(
  sessionStore: SessionStore,
): JSONRPCMiddleware<RouterMethodMap, RouterContext> {
  /**
   * Session middleware implementation.
   * Validates and manages session state for each request.
   *
   * @param context - Router context containing origin information
   * @param request - JSON-RPC request containing session ID
   * @param next - Next middleware in chain
   * @returns Promise resolving to JSON-RPC response
   * @throws {RouterError} If session validation fails
   */
  return async (
    context: RouterContext,
    request: JSONRPCRequest<RouterMethodMap, keyof RouterMethodMap>,
    next: () => Promise<JSONRPCResponse<RouterMethodMap>>,
  ) => {
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

    // Try to find the session with proper origin handling
    let session = null;
    let actualOrigin = context?.origin;

    console.debug('Session middleware: Looking for session:', {
      sessionId,
      origin: actualOrigin,
      method: request.method,
    });

    if (actualOrigin) {
      // Try with the provided origin first
      const sessionKey = `${actualOrigin}_${sessionId}`;
      console.debug('Session middleware: Trying session key:', sessionKey);
      session = await sessionStore.validateAndRefresh(sessionKey);
      if (session) {
        console.debug('Session middleware: Found session with origin:', actualOrigin);
      }
    }

    if (!session) {
      // If that failed, try to find the session by checking all sessions
      // This handles cases where origin extraction failed but session exists
      console.debug('Session middleware: Checking all sessions for sessionId:', sessionId);
      const allSessions = await sessionStore.getAll();
      console.debug('Session middleware: Available sessions:', Array.from(allSessions.keys()));
      for (const [sessionKey] of allSessions) {
        if (sessionKey.endsWith(`_${sessionId}`)) {
          // Found a session with matching session ID
          const originFromKey = sessionKey.substring(0, sessionKey.length - sessionId.length - 1);
          console.debug(
            'Session middleware: Found matching session key:',
            sessionKey,
            'origin:',
            originFromKey,
          );
          session = await sessionStore.validateAndRefresh(sessionKey);
          if (session) {
            actualOrigin = originFromKey;
            // Update context with the correct origin
            context.origin = actualOrigin;
            console.debug('Session middleware: Session validated, updated context origin to:', actualOrigin);
            break;
          }
        }
      }
    }

    if (!session) {
      console.error('Session middleware: No valid session found for sessionId:', sessionId);
      throw new RouterError('invalidSession');
    }

    // Store session in context for use by method handlers
    context.session = session;

    return next();
  };
}

/**
 * Creates middleware for permission validation.
 * This middleware ensures that each method call is permitted based on:
 * - Current session permissions
 * - Method-specific requirements
 * - Chain-specific permissions
 *
 * Permission Flow:
 * 1. Calls permission callback with request context
 * 2. Throws error if permission check fails
 * 3. Allows request to proceed if permitted
 *
 * @param permissionCallback - Callback to check if method is permitted
 * @returns Middleware function for permission checking
 *
 * @throws {RouterError} With code:
 * - 'insufficientPermissions' if method is not permitted
 * - 'insufficientPermissions' with error details if check fails
 *
 * @example
 * ```typescript
 * const router = new WalletRouter(...);
 *
 * // Add permissions middleware with custom checker
 * router.addMiddleware(createPermissionsMiddleware(
 *   async (context, request) => {
 *     // Check if method is permitted for the chain
 *     const chainId = request.params?.chainId;
 *     const method = request.params?.call?.method;
 *     return context.session?.permissions?.[chainId]?.includes(method) ?? false;
 *   }
 * ));
 * ```
 *
 * @see {@link PermissionCheckCallback} for callback interface
 * @see {@link RouterError} for error codes and messages
 */
export function createPermissionsMiddleware(
  permissionCallback: PermissionCheckCallback<RouterMethodMap, RouterContext>,
): JSONRPCMiddleware<RouterMethodMap, RouterContext> {
  /**
   * Permission middleware implementation.
   * Validates method permissions before allowing execution.
   *
   * @param context - Router context with session information
   * @param request - JSON-RPC request to validate
   * @param next - Next middleware in chain
   * @returns Promise resolving to JSON-RPC response
   * @throws {RouterError} If permission check fails
   */
  return async (
    context: RouterContext,
    request: JSONRPCRequest<RouterMethodMap, keyof RouterMethodMap>,
    next: () => Promise<JSONRPCResponse<RouterMethodMap>>,
  ) => {
    const hasPermission = await permissionCallback(context, request).catch((error) => {
      throw new RouterError(
        'insufficientPermissions',
        error instanceof Error ? error.message : String(error),
      );
    });
    if (!hasPermission) {
      throw new RouterError('insufficientPermissions');
    }

    return next();
  };
}
