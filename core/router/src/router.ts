import {
  JSONRPCNode,
  JSONRPCProxy,
  type JSONRPCTransport,
  type JSONRPCProxyConfig,
  JSONRPCError,
} from '@walletmesh/jsonrpc';

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
  Wallets,
} from './types.js';

/**
 * Configuration options for the WalletRouter.
 */
export interface WalletRouterConfig {
  /**
   * Optional session store instance for persisting session data.
   * Defaults to an in-memory store if not provided.
   * @see {@link SessionStore}
   * @see {@link MemorySessionStore}
   * @see {@link LocalStorageSessionStore}
   */
  sessionStore?: SessionStore;
  /**
   * Optional base configuration for JSONRPCProxy instances created by the router.
   * This configuration is applied to each wallet proxy, with `chainId` being
   * automatically set per proxy.
   * @see JSONRPCProxyConfig from @walletmesh/jsonrpc
   */
  proxyConfig?: Omit<JSONRPCProxyConfig, 'chainId'>;
  /**
   * Optional flag to enable debug logging for router operations.
   * If true, detailed logs will be output to the console.
   * This also enables debug logging for underlying JSONRPCProxy instances
   * unless overridden in `proxyConfig`.
   * @default false
   */
  debug?: boolean;
}

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
   * Map of chain IDs to their corresponding proxies
   * @private
   */
  private walletProxies: Map<ChainId, JSONRPCProxy>;

  /**
   * Configuration for the router
   * @private
   */
  private config: WalletRouterConfig;

  /**
   * Manager for handling permission requests, checks, and updates
   * @private
   */
  private permissionManager: PermissionManager<RouterMethodMap, RouterContext>;

  /**
   * Creates a new WalletRouter instance for managing multi-chain wallet connections.
   *
   * @param transport - Transport layer for sending messages
   * @param wallets - Map of chain IDs to wallet transports
   * @param permissionManager - Manager for handling permissions
   * @param config - Optional router configuration
   *
   * @throws {RouterError} If transport is invalid or required components are missing
   *
   * @example
   * ```typescript
   * const router = new WalletRouter(
   *   { send: async (msg) => window.postMessage(msg, '*') },
   *   new Map([['eip155:1', ethereumTransport]]),
   *   new AllowAskDenyManager(askCallback, initialState),
   *   { sessionStore: new LocalStorageSessionStore(), debug: true }
   * );
   * ```
   */
  constructor(
    transport: JSONRPCTransport,
    wallets: Wallets,
    permissionManager: PermissionManager<RouterMethodMap, RouterContext>,
    config: WalletRouterConfig = {},
  ) {
    super(transport);
    this.config = config;
    this.sessionStore = config.sessionStore || defaultStore;
    this.permissionManager = permissionManager;

    // Create proxies for each wallet transport with chain-specific configuration
    this.walletProxies = new Map();
    for (const [chainId, walletTransport] of wallets) {
      const proxyConfig: JSONRPCProxyConfig = {
        ...config.proxyConfig,
        chainId,
      };
      if (config.debug || config.proxyConfig?.debug) {
        proxyConfig.debug = true;
      }
      this.walletProxies.set(chainId, new JSONRPCProxy(walletTransport, proxyConfig));
    }

    // Add middleware for session validation and permission checks
    this.addMiddleware(createSessionMiddleware(this.sessionStore));
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

    // We no longer need to setup wallet event listeners for proxies
  }

  /**
   * Validates a chain ID and returns its corresponding proxy.
   *
   * @param chainId - Chain ID to validate
   * @returns The proxy instance for the specified chain
   * @throws {RouterError} With code 'unknownChain' if the chain ID is not configured
   *
   * @protected
   */
  protected validateChain(chainId: ChainId): JSONRPCProxy {
    const proxy = this.walletProxies.get(chainId);
    if (!proxy) {
      throw new RouterError('unknownChain', `Unknown chain: ${chainId}`);
    }
    return proxy;
  }

  /**
   * Adds a new wallet for a specific chain ID.
   *
   * @param chainId - Chain ID to add wallet for
   * @param transport - Wallet transport instance
   * @throws {RouterError} With code 'chainAlreadyExists' if chain is already configured
   *
   * @example
   * ```typescript
   * const polygonTransport = createPolygonTransport();
   * router.addWallet('eip155:137', polygonTransport);
   * ```
   */
  public addWallet(chainId: ChainId, transport: JSONRPCTransport): void {
    if (this.walletProxies.has(chainId)) {
      throw new RouterError('invalidRequest', `Chain ${chainId} already exists`);
    }

    const proxyConfig: JSONRPCProxyConfig = {
      ...this.config.proxyConfig,
      chainId,
    };
    if (this.config.debug || this.config.proxyConfig?.debug) {
      proxyConfig.debug = true;
    }

    this.walletProxies.set(chainId, new JSONRPCProxy(transport, proxyConfig));

    // Emit availability changed event
    this.emit('wm_walletAvailabilityChanged', {
      chainId,
      available: true,
    });
  }

  /**
   * Removes a wallet for a specific chain ID.
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
    const proxy = this.walletProxies.get(chainId);
    if (!proxy) {
      throw new RouterError('unknownChain');
    }

    proxy.close();
    this.walletProxies.delete(chainId);

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

    return { sessionId, permissions: approvedPermissions };
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
   * Forward a method call to a wallet using the proxy
   *
   * @param proxy - Proxy instance to forward the call through
   * @param methodCall - Method call details including name and parameters
   * @returns Result of the method call
   * @throws {RouterError} With appropriate error code based on failure type
   *
   * @protected
   */
  protected async _call(
    proxy: JSONRPCProxy,
    methodCall: MethodCall,
  ): Promise<RouterMethodMap['wm_call']['result']> {
    // Create inner JSON-RPC request
    const innerRequest = {
      jsonrpc: '2.0' as const,
      method: methodCall.method,
      params: methodCall.params,
      id: crypto.randomUUID(),
    };

    try {
      // Forward the raw message through the proxy
      const response = await proxy.forward(innerRequest);

      // Extract result or error from response
      if (response && typeof response === 'object') {
        if ('result' in response) {
          return (response as { result: unknown }).result;
        }
        if ('error' in response) {
          const error = (response as { error: { code: number; message: string; data?: unknown } }).error;
          throw new RouterError(
            'walletError',
            error.data ? { message: error.message, data: error.data } : error.message,
          );
        }
      }

      throw new RouterError('walletNotAvailable', 'Invalid response from wallet');
    } catch (error) {
      if (error instanceof RouterError) {
        throw error;
      }

      // Convert JSONRPCError to RouterError for consistent error handling
      if (error instanceof JSONRPCError) {
        throw new RouterError(
          'walletError',
          error.data ? { message: error.message, data: error.data } : error.message,
        );
      }

      throw new RouterError('walletNotAvailable', error instanceof Error ? error.message : String(error));
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
          error: error instanceof Error ? 'Error: Method failed' : String(error),
        });
      }
      throw new RouterError(
        'walletNotAvailable',
        error instanceof Error ? 'Error: Complete failure' : String(error),
      );
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
      const proxy = this.validateChain(chainId);
      try {
        // Try to call wm_getSupportedMethods via proxy
        const response = await this._call(proxy, { method: 'wm_getSupportedMethods' });
        result[chainId] = Array.isArray(response) ? response : [];
      } catch (error: unknown) {
        // If the method doesn't exist, return an empty array
        if (error instanceof RouterError && error.message === 'Wallet returned an error') {
          result[chainId] = [];
          continue;
        }
        throw error;
      }
    }

    return result;
  }

  /**
   * Clean up when closing
   */
  override async close(): Promise<void> {
    // Close all proxies
    for (const [chainId, proxy] of this.walletProxies) {
      try {
        proxy.close();
      } catch (error) {
        console.warn(`Failed to close proxy for chain ${chainId}:`, error);
      }
    }
    this.walletProxies.clear();
    await super.close();
  }
}
