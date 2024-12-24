import { JSONRPCPeer } from '@walletmesh/jsonrpc';

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
  RouterEventMap,
  SessionData,
  WalletClient,
  Wallets,
  OperationType,
} from './types.js';

/**
 * Multi-chain router for managing wallet connections with bi-directional communication.
 * Routes JSON-RPC requests to appropriate wallet instances based on chain ID and
 * forwards wallet events back to connected clients.
 *
 * The router manages:
 * - Wallet sessions and permissions through callbacks
 * - Bi-directional communication with wallets and clients
 * - Event propagation for wallet state changes
 * - Session lifecycle events
 *
 * @example
 * ```typescript
 * const wallets = new Map([
 *   ['aztec:testnet', new JSONRPCWalletClient(new JSONRPCPeer(...))],
 *   ['eip155:1', new JSONRPCWalletClient(new JSONRPCPeer(...))]
 * ]);
 *
 * const router = new WalletRouter(
 *   {
 *     send: async (message) => {
 *       // Send response/event to client
 *       await sendToClient(message);
 *     }
 *   },
 *   wallets,
 *   // Example permission callback
 *   async (context) => {
 *     // Allow everything in development
 *     return true;
 *   }
 * );
 * ```
 */
export class WalletRouter extends JSONRPCPeer<RouterMethodMap, RouterEventMap, RouterContext> {
  protected sessionStore: SessionStore;
  private wallets: Wallets;
  private permissionCallback: PermissionCallback;
  private permissionApprovalCallback: PermissionApprovalCallback;

  /**
   * Map of event cleanup functions for each wallet
   * chainId -> eventName -> cleanup function
   */
  private walletEventCleanups: Map<ChainId, Map<string, () => void>> = new Map();

  /**
   * Creates a new WalletRouter instance for managing multi-chain wallet connections.
   *
   * @param transport - Transport layer for JSON-RPC communication
   *                   Must implement a send method that handles message delivery
   *                   Messages include method calls, responses, and events
   *                   Example: { send: msg => websocket.send(JSON.stringify(msg)) }
   *
   * @param wallets - Map of supported blockchain networks to their wallet clients
   *                 Keys are chain IDs (e.g., 'eip155:1' for Ethereum mainnet)
   *                 Values are WalletClient implementations for each chain
   *                 Example: new Map([['eip155:1', ethereumWallet]])
   *
   * @param permissionCallback - Function to validate operation permissions
   *                           Called before every method call and state change
   *                           Receives complete context including chain, method, and session
   *                           Must return Promise<boolean> indicating if operation is allowed
   *
   * @param permissionApprovalCallback - Function to approve permission requests
   *                                   Called during connect and permission update operations
   *                                   Can modify requested permissions before approval
   *                                   Must return Promise<ChainPermissions> with approved permissions
   *
   * @param sessionStore - Optional custom session storage implementation
   *                     Must implement SessionStore interface
   *                     Defaults to in-memory store if not provided
   *                     Use for persistent sessions across restarts
   *
   * @example
   * ```typescript
   * const router = new WalletRouter(
   *   {
   *     send: msg => websocket.send(JSON.stringify(msg))
   *   },
   *   new Map([
   *     ['eip155:1', ethereumWallet],
   *     ['eip155:137', polygonWallet]
   *   ]),
   *   async (context) => {
   *     // Check if operation is allowed
   *     return isOperationAllowed(context);
   *   },
   *   async (context) => {
   *     // Approve and possibly modify permissions
   *     return approvePermissions(context);
   *   },
   *   new CustomSessionStore()
   * );
   * ```
   */
  constructor(
    transport: { send: (message: unknown) => Promise<void> },
    wallets: Wallets,
    permissionCallback: PermissionCallback,
    permissionApprovalCallback: PermissionApprovalCallback,
    sessionStore: SessionStore = defaultStore,
  ) {
    super(transport);
    this.setupWalletEventListeners(wallets);
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
   * Handles the wm_reconnect method to restore an existing session.
   * Validates and refreshes an existing session without requiring new permissions.
   * Used when clients need to re-establish connection after page reload or disconnect.
   *
   * @param context - Router context containing:
   *                  - origin: Origin attempting to reconnect
   *                  Must match the original session origin
   *
   * @param params - Reconnection parameters including:
   *                - sessionId: ID of session to reconnect to
   *                Must be a valid UUID from previous connect call
   *
   * @returns Object containing:
   *          - status: boolean indicating if reconnection succeeded
   *          - permissions: Current permissions if successful, empty if failed
   *
   * @example
   * ```typescript
   * const result = await reconnect(
   *   { origin: 'https://app.example.com' },
   *   { sessionId: 'previous-session-id' }
   * );
   * if (result.status) {
   *   console.log('Reconnected with permissions:', result.permissions);
   * }
   * ```
   */
  protected async reconnect(
    context: RouterContext,
    params: RouterMethodMap['wm_reconnect']['params'],
  ): Promise<RouterMethodMap['wm_reconnect']['result']> {
    const { sessionId } = params;
    const origin = context?.origin ?? 'unknown';
    const session = await this.sessionStore.validateAndRefresh(`${origin}_${sessionId}`);

    if (!session) {
      return { status: false, permissions: {} };
    }

    return { status: true, permissions: session.permissions };
  }

  /**
   * Validates a session and its permissions for an operation.
   * Performs comprehensive validation including:
   * - Session existence and expiration
   * - Chain ID validation
   * - Permission checks
   * - Origin verification
   *
   * @param operation - Type of operation being performed
   *                   Examples: 'connect', 'call', 'disconnect'
   *                   Used to apply operation-specific validation rules
   *
   * @param sessionId - ID of the session to validate
   *                   Must be a valid UUID from a previous connect call
   *                   Combined with origin to form unique session key
   *
   * @param chainId - Chain ID for the request
   *                 Must match format: namespace:reference
   *                 Example: 'eip155:1' for Ethereum mainnet
   *                 Use '*' only for updatePermissions operations
   *
   * @param method - Method being called
   *                Must be included in session's permissions
   *                Example: 'eth_sendTransaction'
   *                Wildcard '*' only allowed for permission updates
   *
   * @param params - Method parameters (optional)
   *                Passed to permission callback for validation
   *                Type depends on the specific method
   *
   * @param context - Router context containing origin
   *                 Must include origin for session validation
   *                 Example: { origin: 'https://app.example.com' }
   *
   * @returns The validated session data if all checks pass
   *
   * @throws {RouterError} With specific error codes:
   *         - 'invalidSession': Session doesn't exist or is expired
   *         - 'insufficientPermissions': Method not allowed for session
   *         - 'invalidRequest': Invalid parameters or chain ID
   *
   * @example
   * ```typescript
   * try {
   *   const session = await validateSession(
   *     'call',
   *     'session-123',
   *     'eip155:1',
   *     'eth_sendTransaction',
   *     { to: '0x...', value: '0x...' },
   *     { origin: 'https://app.example.com' }
   *   );
   *   // Session is valid, proceed with operation
   * } catch (error) {
   *   if (error instanceof RouterError) {
   *     // Handle specific validation failure
   *   }
   * }
   * ```
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
   * @param context - Router context (unused)
   * @param params - Connection parameters including chain ID and permissions
   * @returns Object containing the new session ID
   * @throws {RouterError} If chain ID is invalid
   */
  protected async connect(
    context: RouterContext,
    params: RouterMethodMap['wm_connect']['params'],
  ): Promise<RouterMethodMap['wm_connect']['result']> {
    const { permissions } = params;
    const chainIds = Object.keys(permissions);

    if (chainIds.length === 0) {
      throw new RouterError('invalidRequest', 'No chains specified');
    }

    const origin = context?.origin ?? 'unknown';

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

    // Setup event listeners for any new wallets
    this.setupWalletEventListeners(this.wallets);

    await this.sessionStore.set(`${origin}_${sessionId}`, session);
    return { sessionId, permissions: approvedPermissions };
  }

  /**
   * Sets up event listeners for all wallet clients
   * @param wallets - Map of chain IDs to wallet clients
   */
  private setupWalletEventListeners(wallets: Wallets): void {
    // Clean up any existing listeners
    for (const cleanups of this.walletEventCleanups.values()) {
      for (const cleanup of cleanups.values()) {
        cleanup();
      }
    }
    this.walletEventCleanups.clear();

    // Setup new listeners for each wallet
    for (const [chainId, wallet] of wallets.entries()) {
      if (!wallet.on) continue;

      if (!this.walletEventCleanups.has(chainId)) {
        this.walletEventCleanups.set(chainId, new Map());
      }

      // Store handlers so we can remove them later
      const handlers = new Map<string, (data: unknown) => void>();

      // Account changes handler
      const accountsHandler = (data: unknown) => {
        if (Array.isArray(data)) {
          this.emit('wm_walletStateChanged', {
            chainId,
            changes: { accounts: data },
          });
        }
      };
      handlers.set('accountsChanged', accountsHandler);
      wallet.on('accountsChanged', accountsHandler);

      // Network changes handler
      const networkHandler = (data: unknown) => {
        if (typeof data === 'string') {
          this.emit('wm_walletStateChanged', {
            chainId,
            changes: { networkId: data },
          });
        }
      };
      handlers.set('networkChanged', networkHandler);
      wallet.on('networkChanged', networkHandler);

      // Disconnect handler
      const disconnectHandler = () => {
        this.emit('wm_walletStateChanged', {
          chainId,
          changes: { connected: false },
        });
      };
      handlers.set('disconnect', disconnectHandler);
      wallet.on('disconnect', disconnectHandler);

      // Store cleanup functions
      const cleanupFns = new Map<string, () => void>();

      // Only add cleanup functions if the wallet supports off method
      if (wallet.off) {
        for (const [event, _handler] of handlers.entries()) {
          cleanupFns.set(event, () => {
            const h = handlers.get(event);
            if (h && wallet.off) {
              wallet.off(event, h);
            }
          });
        }
      }

      this.walletEventCleanups.set(chainId, cleanupFns);
    }
  }

  /**
   * Handles the wm_disconnect method to terminate an active session.
   * Performs complete cleanup including:
   * - Session removal from store
   * - Event listener cleanup
   * - State cleanup for affected chains
   * - Event emission for disconnection
   *
   * @param context - Router context containing:
   *                  - origin: Origin requesting disconnect
   *                  Must match the session origin for security
   *
   * @param params - Disconnect parameters including:
   *                - sessionId: ID of session to terminate
   *                Must be a valid UUID from previous connect call
   *
   * @returns true if session was successfully terminated
   *
   * @throws {RouterError} With codes:
   *         - 'invalidSession': Session doesn't exist or origin mismatch
   *
   * @emits wm_sessionTerminated When session is successfully terminated
   *
   * @example
   * ```typescript
   * await disconnect(
   *   { origin: 'https://app.example.com' },
   *   { sessionId: 'active-session-id' }
   * );
   * // Emits: wm_sessionTerminated event
   * ```
   */
  protected async disconnect(
    context: RouterContext,
    params: RouterMethodMap['wm_disconnect']['params'],
  ): Promise<RouterMethodMap['wm_disconnect']['result']> {
    const { sessionId } = params;
    const origin = context?.origin ?? 'unknown';
    const session = await this.sessionStore.validateAndRefresh(`${origin}_${sessionId}`);

    if (!session) {
      throw new RouterError('invalidSession');
    }

    // Clean up event listeners for this session's chains
    for (const chainId of Object.keys(session.permissions)) {
      const cleanups = this.walletEventCleanups.get(chainId);
      if (cleanups) {
        for (const cleanup of cleanups.values()) {
          cleanup();
        }
        this.walletEventCleanups.delete(chainId);
      }
    }

    await this.sessionStore.delete(`${origin}_${sessionId}`);

    // Emit session terminated event
    this.emit('wm_sessionTerminated', {
      sessionId,
      reason: 'User disconnected',
    });

    return true;
  }

  /**
   * Handles the wm_getPermissions method to retrieve current session permissions.
   * Can return permissions for specific chains or all chains in the session.
   * Validates session before returning permissions.
   *
   * @param context - Router context containing:
   *                  - origin: Origin requesting permissions
   *                  Must match the session origin
   *
   * @param params - Permission request parameters:
   *                - sessionId: ID of session to query
   *                - chainIds: Optional array of specific chains to query
   *                  If omitted, returns permissions for all chains
   *
   * @returns ChainPermissions object mapping chain IDs to allowed methods
   *
   * @throws {RouterError} With codes:
   *         - 'invalidSession': Session doesn't exist or origin mismatch
   *         - 'invalidSession': Requested chain not in session
   *
   * @example
   * ```typescript
   * // Get all permissions
   * const allPerms = await getPermissions(
   *   { origin: 'https://app.example.com' },
   *   { sessionId: 'session-id' }
   * );
   *
   * // Get specific chain permissions
   * const ethPerms = await getPermissions(
   *   { origin: 'https://app.example.com' },
   *   {
   *     sessionId: 'session-id',
   *     chainIds: ['eip155:1']
   *   }
   * );
   * ```
   */
  protected async getPermissions(
    context: RouterContext,
    params: RouterMethodMap['wm_getPermissions']['params'],
  ): Promise<RouterMethodMap['wm_getPermissions']['result']> {
    const { sessionId, chainIds } = params;
    const origin = context?.origin ?? 'unknown';
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
   * @param context - Router context (unused)
   * @param params - Parameters including session ID and new permissions
   * @returns true if permissions were successfully updated
   * @throws {RouterError} If session ID is invalid
   */
  protected async updatePermissions(
    context: RouterContext,
    params: RouterMethodMap['wm_updatePermissions']['params'],
  ): Promise<RouterMethodMap['wm_updatePermissions']['result']> {
    const { sessionId, permissions } = params;
    const origin = context?.origin ?? 'unknown';
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

    // Emit permissions changed event
    this.emit('wm_permissionsChanged', {
      sessionId,
      permissions: approvedPermissions,
    });

    return true;
  }

  /**
   * Handles wm_call method
   * Routes method calls to the appropriate wallet instance after validating permissions
   * @param context - Router context (unused)
   * @param params - Call parameters including chain ID, session ID, and method details
   * @returns Result from the wallet method call
   * @throws {RouterError} If session is invalid, chain is unknown, or permissions are insufficient
   */
  protected async call(
    context: RouterContext,
    params: RouterMethodMap['wm_call']['params'],
  ): Promise<RouterMethodMap['wm_call']['result']> {
    const { chainId, call, sessionId } = params;

    // Validate session and chain with permission system
    await this.validateSession('call', sessionId, chainId, call.method, call.params, context);
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
   * @param context - Router context (unused)
   * @param params - Parameters including chain ID, session ID, and array of method calls
   * @returns Array of results from the wallet method calls
   * @throws {RouterError} If session is invalid, chain is unknown, permissions are insufficient,
   *                      or if there's a partial failure during execution
   */
  protected async bulkCall(
    context: RouterContext,
    params: RouterMethodMap['wm_bulkCall']['params'],
  ): Promise<RouterMethodMap['wm_bulkCall']['result']> {
    const { chainId, calls, sessionId } = params;

    // Validate session and chain
    const client = this.validateChain(chainId);

    // Check permissions for all methods before making any calls
    for (const call of calls) {
      await this.validateSession('call', sessionId, chainId, call.method, call.params, context);
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
   * @param context - Router context (unused)
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
