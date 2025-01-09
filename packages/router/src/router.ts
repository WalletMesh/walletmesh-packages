import { JSONRPCNode, type JSONRPCTransport } from '@walletmesh/jsonrpc';

import { RouterError } from './errors.js';
import { defaultStore, type SessionStore } from './session-store.js';
import { createSessionMiddleware, createPermissionsMiddleware } from './middleware.js';
import type {
  ChainId,
  ChainPermissions,
  MethodCall,
  PermissionManager,
  RouterContext,
  RouterMethodMap,
  RouterEventMap,
  SessionData,
  WalletClient,
  Wallets,
} from './types.js';

/**
 * Multi-chain router for managing wallet connections with bi-directional communication.
 * Routes JSON-RPC requests to appropriate wallet instances based on chain ID and
 * forwards wallet events back to connected clients.
 *
 * The router handles:
 * - Session management and authentication
 * - Permission management and validation
 * - Method routing to appropriate wallet clients
 * - Event forwarding from wallets to clients
 * - Bulk operation support
 *
 * @example
 * ```typescript
 * // Initialize router with wallets and permission manager
 * const router = new WalletRouter(
 *   transport,
 *   new Map([
 *     ['eip155:1', ethereumWallet],
 *     ['solana:mainnet', solanaWallet]
 *   ]),
 *   permissionManager,
 *   sessionStore
 * );
 *
 * // Router automatically handles:
 * // - Session validation
 * // - Permission checks
 * // - Method routing
 * // - Event forwarding
 * ```
 */
export class WalletRouter extends JSONRPCNode<RouterMethodMap, RouterEventMap, RouterContext> {
  /**
   * Store for managing session data persistence and lifecycle
   * @protected
   */
  protected sessionStore: SessionStore;

  /**
   * Map of chain IDs to their corresponding wallet clients
   * @private
   */
  private wallets: Wallets;

  /**
   * Manager for handling permission requests, checks, and updates
   * @private
   */
  private permissionManager: PermissionManager<RouterMethodMap, RouterContext>;

  /**
   * Map of cleanup functions for wallet event handlers.
   * Keys are chain IDs, values are functions that clean up all event handlers for that chain.
   * @private
   */
  private walletEventCleanups: Map<ChainId, () => void> = new Map();

  /**
   * Creates a new WalletRouter instance for managing multi-chain wallet connections.
   *
   * @param transport - Transport layer for sending messages
   * @param wallets - Map of chain IDs to wallet clients
   * @param permissionManager - Manager for handling permissions
   * @param sessionStore - Optional store for session persistence (defaults to in-memory store)
   *
   * @throws {RouterError} If transport is invalid or required components are missing
   *
   * @example
   * ```typescript
   * const router = new WalletRouter(
   *   { send: async (msg) => window.postMessage(msg, '*') },
   *   new Map([['eip155:1', ethereumWallet]]),
   *   new AllowAskDenyManager(askCallback, initialState),
   *   new LocalStorageSessionStore()
   * );
   * ```
   */
  constructor(
    transport: JSONRPCTransport,
    wallets: Wallets,
    permissionManager: PermissionManager<RouterMethodMap, RouterContext>,
    sessionStore: SessionStore = defaultStore,
  ) {
    super(transport);
    this.sessionStore = sessionStore;
    this.wallets = wallets;
    this.permissionManager = permissionManager;

    // Add middleware for session validation and permission checks
    this.addMiddleware(createSessionMiddleware(sessionStore));
    // Add middleware for permission approvals
    this.addMiddleware(
      createPermissionsMiddleware(this.permissionManager.checkPermissions.bind(this.permissionManager)),
    );

    // Register methods
    this.registerMethod('wm_connect', this.connect.bind(this));
    this.registerMethod('wm_reconnect', this.reconnect.bind(this));
    this.registerMethod('wm_disconnect', this.disconnect.bind(this));
    this.registerMethod('wm_getPermissions', this.getPermissions.bind(this));
    this.registerMethod('wm_updatePermissions', this.updatePermissions.bind(this));
    this.registerMethod('wm_call', this.call.bind(this));
    this.registerMethod('wm_bulkCall', this.bulkCall.bind(this));
    this.registerMethod('wm_getSupportedMethods', this.getSupportedMethods.bind(this));

    // Setup initial wallet event listeners
    this.setupWalletEventListeners(wallets);
  }

  /**
   * Validates a chain ID and returns its corresponding JSON-RPC client.
   *
   * @param chainId - Chain ID to validate
   * @returns The wallet client for the specified chain
   * @throws {RouterError} With code 'unknownChain' if the chain ID is not configured
   *
   * @protected
   */
  protected validateChain(chainId: ChainId): WalletClient {
    const client = this.wallets.get(chainId);
    if (!client) {
      throw new RouterError('unknownChain');
    }
    return client;
  }

  /**
   * Adds a new wallet client for a specific chain ID.
   * Sets up event listeners and emits availability notification.
   *
   * @param chainId - Chain ID to add wallet for
   * @param wallet - Wallet client implementation
   * @throws {RouterError} With code 'invalidRequest' if chain is already configured
   *
   * @example
   * ```typescript
   * router.addWallet('eip155:137', new JSONRPCWalletClient(
   *   'https://polygon-rpc.com'
   * ));
   * ```
   */
  public addWallet(chainId: ChainId, wallet: WalletClient): void {
    if (this.wallets.has(chainId)) {
      throw new RouterError('invalidRequest', `Chain ${chainId} already configured`);
    }

    // Add the wallet
    this.wallets.set(chainId, wallet);

    // Setup event listeners just for this new wallet
    const tempMap = new Map([[chainId, wallet]]);
    this.setupWalletEventListeners(tempMap);

    // Emit availability changed event
    this.emit('wm_walletAvailabilityChanged', {
      chainId,
      available: true,
    });
  }

  /**
   * Removes a wallet client for a specific chain ID.
   * Cleans up event listeners and emits availability notification.
   *
   * @param chainId - Chain ID to remove wallet for
   * @throws {RouterError} With code 'unknownChain' if chain is not configured
   *
   * @example
   * ```typescript
   * router.removeWallet('eip155:137'); // Remove Polygon wallet
   * ```
   */
  public removeWallet(chainId: ChainId): void {
    if (!this.wallets.has(chainId)) {
      throw new RouterError('unknownChain');
    }

    // Clean up event listeners
    const cleanup = this.walletEventCleanups.get(chainId);
    if (cleanup) {
      try {
        cleanup();
      } catch (error) {
        // Ignore cleanup errors
        console.error('Error during wallet event cleanup:', error);
      }
      this.walletEventCleanups.delete(chainId);
    }

    // Remove the wallet
    this.wallets.delete(chainId);

    // Emit availability changed event
    this.emit('wm_walletAvailabilityChanged', {
      chainId,
      available: false,
    });
  }

  /**
   * Handles wm_connect method to establish a new session.
   * Creates a new session with requested permissions after approval.
   *
   * @param context - Router context with origin information
   * @param params - Connection parameters including requested permissions
   * @returns Object containing new session ID and approved permissions
   * @throws {RouterError} If origin is unknown or no chains specified
   *
   * @protected
   */
  protected async connect(
    context: RouterContext,
    params: RouterMethodMap['wm_connect']['params'],
  ): Promise<RouterMethodMap['wm_connect']['result']> {
    const { origin } = context;

    if (!origin) {
      throw new RouterError('invalidRequest', 'Unknown origin');
    }

    const { permissions } = params;
    const chainIds = Object.keys(permissions);

    if (chainIds.length === 0) {
      throw new RouterError('invalidRequest', 'No chains specified');
    }

    const sessionId = crypto.randomUUID();
    const session: SessionData = {
      id: sessionId,
      origin,
    };

    context.session = session;

    const approvedPermissions = await this.permissionManager.approvePermissions(context, permissions);

    // Store session data
    await this.sessionStore.set(`${origin}_${sessionId}`, session);

    // Setup event listeners for any new wallets
    this.setupWalletEventListeners(this.wallets);

    return { sessionId, permissions: approvedPermissions };
  }

  /**
   * Sets up event listeners for all wallet clients.
   * Handles wallet events like disconnects and forwards them to clients.
   *
   * @param wallets - Map of chain IDs to wallet clients to setup listeners for
   * @protected
   */
  protected setupWalletEventListeners(wallets: Wallets): void {
    // Clean up any existing listeners
    for (const cleanup of this.walletEventCleanups.values()) {
      try {
        cleanup();
      } catch (error) {
        // Ignore cleanup errors - we still want to clear and setup new listeners
        console.error('Error during wallet event cleanup:', error);
      }
    }
    this.walletEventCleanups.clear();

    // Setup new listeners for each wallet
    for (const [chainId, wallet] of wallets.entries()) {
      if (!wallet.on) continue;

      // Create handlers for wallet events
      const handlers = [
        {
          event: 'disconnect',
          handler: () => {
            this.emit('wm_walletStateChanged', {
              chainId,
              changes: { connected: false },
            });
          },
        },
      ];

      // Register handlers and collect cleanup functions
      const cleanups: Array<() => void> = [];
      for (const { event, handler } of handlers) {
        wallet.on(event as string, handler);
        if (wallet.off) {
          const off = wallet.off; // Capture off method to avoid undefined check
          cleanups.push(() => off(event as string, handler));
        }
      }

      // Store single cleanup function that handles all events
      this.walletEventCleanups.set(chainId, () => {
        for (const cleanup of cleanups) {
          try {
            cleanup();
          } catch (error) {
            // Ignore individual cleanup errors
            console.error('Error during wallet event cleanup:', error);
          }
        }
      });
    }
  }

  /**
   * Handles wm_reconnect method to restore an existing session.
   * Validates the session and returns current permissions if valid.
   *
   * @param context - Router context with origin information
   * @param params - Reconnection parameters including session ID
   * @returns Object with reconnection status and current permissions
   * @throws {RouterError} If origin is unknown
   *
   * @protected
   */
  protected async reconnect(
    context: RouterContext,
    params: RouterMethodMap['wm_reconnect']['params'],
  ): Promise<RouterMethodMap['wm_reconnect']['result']> {
    const { origin } = context;

    if (!origin) {
      throw new RouterError('invalidRequest', 'Unknown origin');
    }

    const { sessionId } = params;
    const session = await this.sessionStore.validateAndRefresh(`${origin}_${sessionId}`);

    if (!session) {
      return { status: false, permissions: {} };
    }

    const permissions = await this.permissionManager.getPermissions(context);

    return { status: true, permissions: permissions };
  }

  /**
   * Handles wm_disconnect method to end an existing session.
   * Cleans up session data and emits termination event.
   *
   * @param context - Router context with session information
   * @param params - Disconnection parameters including session ID
   * @returns true if session was successfully ended
   * @throws {RouterError} With code 'invalidSession' if session is invalid
   *
   * @protected
   */
  protected async disconnect(
    context: RouterContext,
    params: RouterMethodMap['wm_disconnect']['params'],
  ): Promise<RouterMethodMap['wm_disconnect']['result']> {
    const { sessionId } = params;
    const { origin, session } = context;

    if (!session) {
      throw new RouterError('invalidSession');
    }

    if (this.permissionManager.cleanup) {
      await this.permissionManager.cleanup(context, session.id);
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
   * Handles wm_getPermissions method to retrieve current permissions.
   * Returns permissions for specified chains or all chains if none specified.
   *
   * @param context - Router context with session information
   * @param params - Parameters including optional chain IDs to filter by
   * @returns Current permissions in human-readable format
   * @throws {RouterError} With code 'invalidSession' if session is invalid
   *
   * @protected
   */
  protected async getPermissions(
    context: RouterContext,
    params: RouterMethodMap['wm_getPermissions']['params'],
  ): Promise<RouterMethodMap['wm_getPermissions']['result']> {
    const { chainIds } = params;
    const session = context.session;

    if (!session) {
      throw new RouterError('invalidSession');
    }

    const permissions = await this.permissionManager.getPermissions(context, chainIds);
    return permissions;
  }

  /**
   * Handles wm_updatePermissions method to modify existing permissions.
   * Updates session with newly approved permissions.
   *
   * @param context - Router context with session information
   * @param params - Parameters including new permission requests
   * @returns Newly approved permissions in human-readable format
   * @throws {RouterError} With code 'invalidSession' if session is invalid
   *
   * @protected
   */
  protected async updatePermissions(
    context: RouterContext,
    params: RouterMethodMap['wm_updatePermissions']['params'],
  ): Promise<RouterMethodMap['wm_updatePermissions']['result']> {
    const { sessionId, permissions } = params;
    const { origin, session } = context;

    if (!session) {
      throw new RouterError('invalidSession');
    }

    // Update session with new permissions
    const approvedPermissions = await this.permissionManager.approvePermissions(context, permissions);

    await this.sessionStore.set(`${origin}_${sessionId}`, session);

    return approvedPermissions;
  }

  /**
   * Internal helper to execute a method call on a wallet.
   * Handles error translation from wallet-specific to router errors.
   *
   * @param client - Wallet client to execute method on
   * @param methodCall - Method call details including name and parameters
   * @returns Result of the method call
   * @throws {RouterError} With appropriate error code based on failure type
   *
   * @protected
   */
  protected async _call(
    client: WalletClient,
    methodCall: MethodCall,
  ): Promise<RouterMethodMap['wm_call']['result']> {
    try {
      // Forward request to wallet
      return await client.call(String(methodCall.method), methodCall.params);
    } catch (error) {
      // Handle any errors from the wallet client
      if (error && typeof error === 'object' && 'code' in error && error.code === -32601) {
        throw new RouterError('methodNotSupported', String(methodCall.method));
      }
      throw new RouterError('walletNotAvailable', String(error));
    }
  }

  /**
   * Handles wm_call method to execute a single wallet method.
   * Routes the call to appropriate wallet after validation.
   *
   * @param _context - Router context (unused but required by interface)
   * @param params - Parameters including chain ID and method call details
   * @returns Result of the method call
   * @throws {RouterError} If chain validation fails or method execution fails
   *
   * @protected
   */
  protected async call(
    _context: RouterContext,
    params: RouterMethodMap['wm_call']['params'],
  ): Promise<RouterMethodMap['wm_call']['result']> {
    const { chainId, call } = params;
    const client = this.validateChain(chainId);
    return await this._call(client, call);
  }

  /**
   * Handles wm_bulkCall method to execute multiple wallet methods.
   * Executes calls in sequence and handles partial failures.
   *
   * @param _context - Router context (unused but required by interface)
   * @param params - Parameters including chain ID and array of method calls
   * @returns Array of results corresponding to each method call
   * @throws {RouterError} With code 'partialFailure' if some calls succeed
   *
   * @protected
   */
  protected async bulkCall(
    _context: RouterContext,
    params: RouterMethodMap['wm_bulkCall']['params'],
  ): Promise<RouterMethodMap['wm_bulkCall']['result']> {
    const { chainId, calls } = params;
    const client = this.validateChain(chainId);

    const responses: unknown[] = [];
    try {
      for (const call of calls) {
        responses.push(await this._call(client, call));
      }
      return responses as RouterMethodMap['wm_bulkCall']['result'];
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
   * Handles wm_getSupportedMethods method to discover available methods.
   * Returns router methods if no chains specified, otherwise returns
   * methods supported by specified chains.
   *
   * @param _context - Router context (unused but required by interface)
   * @param params - Parameters including optional chain IDs to query
   * @returns Record mapping chain IDs to their supported method names
   * @throws {RouterError} If chain validation fails or capability query fails
   *
   * @protected
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
        result[chainId] = Array.isArray(methods) ? methods : [];
      } catch (error) {
        throw error instanceof RouterError ? error : new RouterError('walletNotAvailable', String(error));
      }
    }

    return result;
  }
}
