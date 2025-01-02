import { JSONRPCNode } from '@walletmesh/jsonrpc';

import { RouterError } from './errors.js';
import { defaultStore, type SessionStore } from './session-store.js';
import { createSessionMiddleware, createPermissionsMiddleware } from './middleware.js';
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
} from './types.js';

/**
 * Multi-chain router for managing wallet connections with bi-directional communication.
 * Routes JSON-RPC requests to appropriate wallet instances based on chain ID and
 * forwards wallet events back to connected clients.
 */
export class WalletRouter extends JSONRPCNode<RouterMethodMap, RouterEventMap, RouterContext> {
  protected sessionStore: SessionStore;
  private wallets: Wallets;
  private permissionApprovalCallback: PermissionApprovalCallback;

  /**
   * Map of cleanup functions for wallet event handlers
   * chainId -> cleanup function
   */
  private walletEventCleanups: Map<ChainId, () => void> = new Map();

  /**
   * Creates a new WalletRouter instance for managing multi-chain wallet connections.
   */
  constructor(
    transport: { send: (message: unknown) => Promise<void> },
    wallets: Wallets,
    permissionCallback: PermissionCallback,
    permissionApprovalCallback: PermissionApprovalCallback,
    sessionStore: SessionStore = defaultStore,
  ) {
    super(transport);
    this.sessionStore = sessionStore;
    this.wallets = wallets;
    this.permissionApprovalCallback = permissionApprovalCallback;

    // Add middleware for session validation and permission checks
    this.addMiddleware(createSessionMiddleware(sessionStore));
    // Add middleware for permission approvals
    this.addMiddleware(createPermissionsMiddleware(permissionCallback));

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
   * Validates a chain ID and returns its corresponding JSON-RPC client
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
   */
  public removeWallet(chainId: ChainId): void {
    if (!this.wallets.has(chainId)) {
      throw new RouterError('unknownChain');
    }

    // Clean up event listeners
    const cleanup = this.walletEventCleanups.get(chainId);
    if (cleanup) {
      cleanup();
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
   * Handles wm_connect method
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

    // Get permission approvals
    context.session.permissions = await this.permissionApprovalCallback(context, params.permissions);

    // Store session data
    await this.sessionStore.set(`${origin}_${sessionId}`, session);

    // Setup event listeners for any new wallets
    this.setupWalletEventListeners(this.wallets);

    return { sessionId, permissions };
  }

  /**
   * Sets up event listeners for all wallet clients
   */
  protected setupWalletEventListeners(wallets: Wallets): void {
    // Clean up any existing listeners
    for (const cleanup of this.walletEventCleanups.values()) {
      cleanup();
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
        wallet.on(event, handler);
        if (wallet.off) {
          const off = wallet.off; // Capture off method to avoid undefined check
          cleanups.push(() => off(event, handler));
        }
      }

      // Store single cleanup function that handles all events
      this.walletEventCleanups.set(chainId, () => {
        for (const cleanup of cleanups) {
          cleanup();
        }
      });
    }
  }

  /**
   * Handles wm_reconnect method
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

    if (!session.permissions) {
      throw new RouterError('invalidSession', 'No permissions found in session');
    }

    return { status: true, permissions: session.permissions };
  }

  /**
   * Handles wm_disconnect method
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

    if (session.permissions) {
      // Clean up event listeners for this session's chains
      for (const chainId of Object.keys(session.permissions)) {
        const cleanup = this.walletEventCleanups.get(chainId);
        if (cleanup) {
          cleanup();
          this.walletEventCleanups.delete(chainId);
        }
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
   * Handles wm_getPermissions method
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

    const result: ChainPermissions = {};
    const chainsToInclude = chainIds || (session.permissions && Object.keys(session.permissions)) || [];

    for (const chainId of chainsToInclude) {
      if (!session.permissions || !session.permissions[chainId]) {
        throw new RouterError('invalidSession', `Chain ${chainId} not found in session`);
      }
      result[chainId] = session.permissions[chainId];
    }
    return result;
  }

  /**
   * Handles wm_updatePermissions method
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
    session.permissions = await this.permissionApprovalCallback(context, permissions);

    await this.sessionStore.set(`${origin}_${sessionId}`, session);

    return session.permissions;
  }

  /**
   * Internal helper to execute a method call on a wallet
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
   * Handles wm_call method
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
   * Handles wm_bulkCall method
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
