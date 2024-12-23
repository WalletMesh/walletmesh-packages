import { JSONRPCServer } from '@walletmesh/jsonrpc';

import { RouterError } from './errors.js';
import { defaultStore, type SessionStore } from './session-store.js';
import type {
  ChainId,
  ChainPermissions,
  MethodCall,
  PermissionCallback,
  PermissionApprovalCallback,
  RouterContext,
  RouterMethodMap,
  SessionData,
  WalletClient,
  Wallets,
  OperationType,
} from './types.js';

/**
 * Multi-chain router for managing wallet connections.
 * Routes JSON-RPC requests to appropriate wallet instances based on chain ID.
 *
 * The router manages wallet sessions and permissions through a single permission callback
 * that receives complete context about each operation.
 *
 * @example
 * ```typescript
 * const wallets = new Map([
 *   ['aztec:testnet', new JSONRPCClient(...)],
 *   ['eip155:1', new JSONRPCClient(...)]
 * ]);
 *
 * const router = new WalletRouter(
 *   async (response) => console.log(response),
 *   wallets,
 *   // Example permission callback
 *   async (context) => {
 *     // Allow everything in development
 *     return true;
 *   }
 * );
 * ```
 */
export class WalletRouter extends JSONRPCServer<RouterMethodMap, RouterContext> {
  protected sessionStore: SessionStore;
  private wallets: Wallets;
  private permissionCallback: PermissionCallback;
  private permissionApprovalCallback: PermissionApprovalCallback;

  /**
   * Creates a new WalletRouter instance
   * @param sendResponse - Function to send JSON-RPC responses back to the client
   * @param wallets - Map of chain IDs to their corresponding JSON-RPC client instances
   * @param permissionCallback - Callback to check permissions for all operations
   * @param permissionApprovalCallback - Callback to approve and return complete permission sets
   */
  constructor(
    sendResponse: (response: unknown) => Promise<void>,
    wallets: Wallets,
    permissionCallback: PermissionCallback,
    permissionApprovalCallback: PermissionApprovalCallback,
    sessionStore: SessionStore = defaultStore,
  ) {
    super(sendResponse);
    this.sessionStore = sessionStore;
    this.wallets = wallets;
    this.permissionCallback = permissionCallback;
    this.permissionApprovalCallback = permissionApprovalCallback;

    // Register methods
    this.registerMethod('wm_connect', this.connect.bind(this));
    this.registerMethod('wm_reconnect', this.reconnect.bind(this));
    this.registerMethod('wm_disconnect', this.disconnect.bind(this));
    this.registerMethod('wm_getPermissions', this.getPermissions.bind(this));
    this.registerMethod('wm_updatePermissions', this.updatePermissions.bind(this));
    this.registerMethod('wm_call', this.call.bind(this));
    this.registerMethod('wm_bulkCall', this.bulkCall.bind(this));
    this.registerMethod('wm_getSupportedMethods', this.getSupportedMethods.bind(this));
  }

  /**
   * Handles wm_reconnect method
   * Attempts to reconnect to an existing session
   * @param _context - Router context
   * @param params - Parameters including session ID
   * @returns true if reconnection was successful, false if session doesn't exist or is expired
   */
  protected async reconnect(
    _context: RouterContext,
    params: RouterMethodMap['wm_reconnect']['params'],
  ): Promise<RouterMethodMap['wm_reconnect']['result']> {
    const { sessionId } = params;
    const origin = _context?.origin ?? 'unknown';
    const session = await this.sessionStore.validateAndRefresh(`${origin}_${sessionId}`);

    if (!session) {
      return { status: false, permissions: {} };
    }

    return { status: true, permissions: session.permissions };
  }

  /**
   * Validates a session and its permissions
   * @param operation - Type of operation being performed
   * @param sessionId - ID of the session to validate
   * @param chainId - Chain ID for the request
   * @param method - Method being called
   * @param params - Method parameters
   * @param context - Router context containing origin
   * @returns The validated session data
   * @throws {RouterError} If session is invalid, expired, or has insufficient permissions
   */
  protected async validateSession(
    operation: OperationType,
    sessionId: string,
    chainId: string,
    method: string,
    params?: unknown,
    context?: RouterContext,
  ): Promise<SessionData> {
    const origin = context?.origin ?? 'unknown';
    const sessionKey = `${origin}_${sessionId}`;
    const session = await this.sessionStore.validateAndRefresh(sessionKey);

    if (!session) {
      throw new RouterError('invalidSession');
    }

    // Special case: wildcard method is only allowed for updatePermissions
    if (method === '*' && operation !== 'updatePermissions') {
      throw new RouterError('insufficientPermissions', method);
    }

    // Check if chain is configured in session
    if (chainId !== '*' && !session.permissions[chainId]) {
      throw new RouterError('invalidSession');
    }

    // Check permissions using the callback
    const isPermitted = await this.permissionCallback({
      operation,
      chainId,
      method,
      params,
      origin,
      session,
    });

    if (!isPermitted) {
      throw new RouterError('insufficientPermissions', method);
    }

    return session;
  }

  /**
   * Validates a chain ID and returns its corresponding JSON-RPC client
   * @param chainId - Chain ID to validate
   * @returns JSON-RPC client for the chain
   * @throws {RouterError} If chain ID is unknown or not configured
   */
  protected validateChain(chainId: ChainId): WalletClient {
    const client = this.wallets.get(chainId);
    if (!client) {
      throw new RouterError('unknownChain');
    }
    return client;
  }

  /**
   * Handles wm_connect method
   * Creates a new session for the specified chain with requested permissions
   * @param _context - Router context (unused)
   * @param params - Connection parameters including chain ID and permissions
   * @returns Object containing the new session ID
   * @throws {RouterError} If chain ID is invalid
   */
  protected async connect(
    _context: RouterContext,
    params: RouterMethodMap['wm_connect']['params'],
  ): Promise<RouterMethodMap['wm_connect']['result']> {
    const { permissions } = params;
    const chainIds = Object.keys(permissions);

    if (chainIds.length === 0) {
      throw new RouterError('invalidRequest', 'No chains specified');
    }

    const origin = _context?.origin ?? 'unknown';

    // Get approved permissions from callback
    const approvedPermissions = await this.permissionApprovalCallback({
      operation: 'connect',
      origin,
      requestedPermissions: permissions,
    });

    // Create session with approved permissions
    const sessionId = crypto.randomUUID();

    const session: SessionData = {
      id: sessionId,
      origin,
      permissions: approvedPermissions,
    };

    await this.sessionStore.set(`${origin}_${sessionId}`, session);
    return { sessionId, permissions: approvedPermissions };
  }

  /**
   * Handles wm_disconnect method
   * Ends an existing session and removes it from the router
   * @param _context - Router context (unused)
   * @param params - Disconnect parameters including session ID
   * @returns true if session was successfully ended
   * @throws {RouterError} If session ID is invalid
   */
  protected async disconnect(
    _context: RouterContext,
    params: RouterMethodMap['wm_disconnect']['params'],
  ): Promise<RouterMethodMap['wm_disconnect']['result']> {
    const { sessionId } = params;
    const origin = _context?.origin ?? 'unknown';
    const session = await this.sessionStore.validateAndRefresh(`${origin}_${sessionId}`);

    if (!session) {
      throw new RouterError('invalidSession');
    }

    await this.sessionStore.delete(`${origin}_${sessionId}`);
    return true;
  }

  /**
   * Handles wm_getPermissions method
   * Returns the current permissions for an existing session
   * @param _context - Router context (unused)
   * @param params - Parameters including session ID
   * @returns Array of permitted method names
   * @throws {RouterError} If session ID is invalid
   */
  protected async getPermissions(
    _context: RouterContext,
    params: RouterMethodMap['wm_getPermissions']['params'],
  ): Promise<RouterMethodMap['wm_getPermissions']['result']> {
    const { sessionId, chainIds } = params;
    const origin = _context?.origin ?? 'unknown';
    const session = await this.sessionStore.validateAndRefresh(`${origin}_${sessionId}`);

    if (!session) {
      throw new RouterError('invalidSession');
    }

    const result: ChainPermissions = {};
    const chainsToInclude = chainIds || Object.keys(session.permissions);

    for (const chainId of chainsToInclude) {
      if (!session.permissions[chainId]) {
        throw new RouterError('invalidSession', `Chain ${chainId} not found in session`);
      }
      result[chainId] = session.permissions[chainId];
    }

    return result;
  }

  /**
   * Handles wm_updatePermissions method
   * Updates the permissions for an existing session
   * @param _context - Router context (unused)
   * @param params - Parameters including session ID and new permissions
   * @returns true if permissions were successfully updated
   * @throws {RouterError} If session ID is invalid
   */
  protected async updatePermissions(
    _context: RouterContext,
    params: RouterMethodMap['wm_updatePermissions']['params'],
  ): Promise<RouterMethodMap['wm_updatePermissions']['result']> {
    const { sessionId, permissions } = params;
    const origin = _context?.origin ?? 'unknown';
    const session = await this.sessionStore.validateAndRefresh(`${origin}_${sessionId}`);

    if (!session) {
      throw new RouterError('invalidSession');
    }

    // Get approved permissions from callback
    const approvedPermissions = await this.permissionApprovalCallback({
      operation: 'updatePermissions',
      origin,
      requestedPermissions: permissions,
      session,
    });

    // Update session with approved permissions
    session.permissions = approvedPermissions;
    await this.sessionStore.set(`${origin}_${sessionId}`, session);
    return true;
  }

  /**
   * Handles wm_call method
   * Routes method calls to the appropriate wallet instance after validating permissions
   * @param _context - Router context (unused)
   * @param params - Call parameters including chain ID, session ID, and method details
   * @returns Result from the wallet method call
   * @throws {RouterError} If session is invalid, chain is unknown, or permissions are insufficient
   */
  protected async call(
    _context: RouterContext,
    params: RouterMethodMap['wm_call']['params'],
  ): Promise<RouterMethodMap['wm_call']['result']> {
    const { chainId, call, sessionId } = params;

    // Validate session and chain with permission system
    await this.validateSession('call', sessionId, chainId, call.method, call.params, _context);
    const client = this.validateChain(chainId);

    return await this._call(client, params.call);
  }

  /**
   * Internal helper to execute a method call on a wallet
   * @param client - JSON-RPC client instance for the wallet
   * @param methodCall - Method call details
   * @returns Result from the wallet method call
   * @throws {RouterError} If method is not supported or wallet is unavailable
   */
  protected async _call(
    client: WalletClient,
    methodCall: MethodCall,
  ): Promise<RouterMethodMap['wm_call']['result']> {
    try {
      // Forward request to wallet
      return await client.call(methodCall.method, methodCall.params);
    } catch (error) {
      // Handle any errors from the wallet client
      if (error && typeof error === 'object' && 'code' in error && error.code === -32601) {
        throw new RouterError('methodNotSupported', methodCall.method);
      }
      throw new RouterError('walletNotAvailable', String(error));
    }
  }

  /**
   * Handles wm_bulkCall method
   * Executes multiple method calls in sequence on the same chain
   * @param _context - Router context (unused)
   * @param params - Parameters including chain ID, session ID, and array of method calls
   * @returns Array of results from the wallet method calls
   * @throws {RouterError} If session is invalid, chain is unknown, permissions are insufficient,
   *                      or if there's a partial failure during execution
   */
  protected async bulkCall(
    _context: RouterContext,
    params: RouterMethodMap['wm_bulkCall']['params'],
  ): Promise<RouterMethodMap['wm_bulkCall']['result']> {
    const { chainId, calls, sessionId } = params;

    // Validate session and chain
    const client = this.validateChain(chainId);

    // Check permissions for all methods before making any calls
    for (const call of calls) {
      await this.validateSession('call', sessionId, chainId, call.method, call.params, _context);
    }

    const responses: unknown[] = [];
    try {
      for (const call of calls) {
        responses.push(await this._call(client, call));
      }
      return responses;
    } catch (error) {
      // Always throw partialFailure if we have partial responses
      if (responses.length > 0) {
        throw new RouterError('partialFailure', {
          partialResponses: responses,
          error: String(error),
        });
      }
      throw new RouterError('walletNotAvailable', String(error));
    }
  }

  /**
   * Handles wm_getSupportedMethods method
   * If chainIds is provided, queries the wallets for their supported methods
   * If no chainIds provided, returns the methods supported by the router itself
   * @param _context - Router context (unused)
   * @param params - Parameters including optional array of chain IDs
   * @returns Record mapping chain IDs to their supported methods
   * @throws {RouterError} If any chain is unknown or wallet is unavailable
   */
  protected async getSupportedMethods(
    _context: RouterContext,
    params: RouterMethodMap['wm_getSupportedMethods']['params'],
  ): Promise<RouterMethodMap['wm_getSupportedMethods']['result']> {
    // If no chainIds provided, return router's supported methods under special 'router' chain ID
    if (!params.chainIds || params.chainIds.length === 0) {
      return {
        router: [
          'wm_connect',
          'wm_disconnect',
          'wm_getPermissions',
          'wm_updatePermissions',
          'wm_call',
          'wm_bulkCall',
          'wm_getSupportedMethods',
          'wm_reconnect',
        ],
      };
    }

    // Otherwise get methods from all specified chains
    const result: ChainPermissions = {};

    for (const chainId of params.chainIds) {
      const client = this.validateChain(chainId);
      if (!client.getSupportedMethods) {
        result[chainId] = [];
        continue;
      }
      try {
        const methods = await client.getSupportedMethods();
        result[chainId] = methods.methods;
      } catch (error) {
        throw error instanceof RouterError ? error : new RouterError('walletNotAvailable', String(error));
      }
    }

    return result;
  }
}
