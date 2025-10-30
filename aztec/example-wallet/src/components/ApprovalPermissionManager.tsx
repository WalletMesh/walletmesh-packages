import type { JSONRPCRequest } from '@walletmesh/jsonrpc';
import type {
  ChainId,
  ChainPermissions,
  HumanReadableChainPermissions,
  PermissionManager,
  RouterContext,
  RouterMethodMap,
  SessionStore,
} from '@walletmesh/router';
import type { FunctionArgNames } from '@walletmesh/aztec-helpers';

/**
 * Options for configuring the {@link ApprovalPermissionManager}.
 */
interface ApprovalPermissionManagerOptions {
  /**
   * Callback function invoked when a permission request requires user interaction.
   * This function should typically trigger a UI prompt for the user to approve or deny the request.
   *
   * @param request - Details of the permission request, including origin, chainId, method, params, and optional function argument names.
   * @returns A promise that resolves to `true` if the user approves the request, `false` otherwise.
   */
  onApprovalRequest: (request: {
    origin: string;
    chainId: ChainId;
    method: string;
    params?: unknown;
    functionArgNames?: FunctionArgNames;
  }) => Promise<boolean>;

  /**
   * List of methods that require approval. If not provided, defaults to transaction methods.
   */
  methodsRequiringApproval?: string[];

  /**
   * Session store for persisting permissions across page refreshes.
   * If not provided, permissions will only be stored in memory.
   */
  sessionStore?: SessionStore;
}

/**
 * A {@link PermissionManager} implementation for the WalletMesh router that
 * uses a UI-based approval flow for certain permission requests.
 * It stores approved session permissions in memory and delegates decisions
 * for specific sensitive methods or initial connection requests to a UI
 * prompt via the `onApprovalRequest` callback.
 *
 * This manager is suitable for example applications where user interaction
 * for permissions is desired.
 */
export class ApprovalPermissionManager implements PermissionManager<RouterMethodMap, RouterContext> {
  /**
   * Stores approved methods per session and chain.
   * Outer Map: sessionId -> Inner Map
   * Inner Map: chainId -> Set of approved method names
   */
  private approvedSessions: Map<string, Map<ChainId, Set<string>>> = new Map();
  private onApprovalRequest: ApprovalPermissionManagerOptions['onApprovalRequest'];
  private methodsRequiringApproval: Set<string>;
  private sessionStore?: SessionStore;

  /**
   * Creates an instance of ApprovalPermissionManager.
   * @param options - Configuration options, including the `onApprovalRequest` callback and optional sessionStore.
   */
  constructor(options: ApprovalPermissionManagerOptions) {
    this.onApprovalRequest = options.onApprovalRequest;
    this.sessionStore = options.sessionStore;
    this.methodsRequiringApproval = new Set(
      options.methodsRequiringApproval || [
        'aztec_getAddress',
        'aztec_getCompleteAddress',
        'aztec_proveTx',
        'aztec_sendTx',
        'aztec_simulateUtility',
        'aztec_contractInteraction',
        'aztec_getPrivateEvents',
      ],
    );
  }

  /**
   * Handles the approval of initial connection permissions (`wm_connect`).
   * It invokes the `onApprovalRequest` callback to prompt the user.
   * If approved, it stores the granted permissions for the session.
   *
   * @param context - The router context, containing session and origin information.
   * @param permissions - The chain permissions being requested by the dApp.
   * @returns A promise that resolves to the human-readable permissions that were approved.
   *          Returns an empty object if approval is denied or if there's no session ID.
   */
  async approvePermissions(
    context: RouterContext,
    permissions: ChainPermissions,
  ): Promise<HumanReadableChainPermissions> {
    const sessionId = context.session?.id;
    const origin = context.origin || 'unknown';

    // Add defensive check for null/undefined permissions
    if (!permissions || typeof permissions !== 'object') {
      console.warn('Invalid permissions received in ApprovalPermissionManager:', permissions);
      return {};
    }

    // For initial connection, prompt user for approval
    const userApproved = await this.onApprovalRequest({
      origin,
      chainId: Object.keys(permissions).join(', '),
      method: 'wm_connect',
      params: permissions,
    });

    if (!userApproved || !sessionId) {
      return {};
    }

    const approvedPermissions: HumanReadableChainPermissions = {};

    // Use composite key for session storage
    const sessionKey = `${origin}_${sessionId}`;

    console.log('[ApprovalPermissionManager] approvePermissions STORING session:', {
      sessionId,
      sessionKey,
      permissions,
      origin,
      existingKeys: Array.from(this.approvedSessions.keys()),
    });

    for (const [chainId, methods] of Object.entries(permissions)) {
      // Ensure methods is an array before processing
      if (!Array.isArray(methods)) {
        console.warn(`Invalid methods for chain ${chainId}:`, methods);
        continue;
      }

      // Store approved permissions with composite key
      if (!this.approvedSessions.has(sessionKey)) {
        this.approvedSessions.set(sessionKey, new Map());
      }
      const sessionChains = this.approvedSessions.get(sessionKey);
      if (!sessionChains) {
        throw new Error(`Session chains not found for key: ${sessionKey}`);
      }

      if (!sessionChains.has(chainId as ChainId)) {
        sessionChains.set(chainId as ChainId, new Set());
      }

      const chainMethods = sessionChains.get(chainId as ChainId);
      if (!chainMethods) {
        throw new Error(`Chain methods not found for chainId: ${chainId}`);
      }
      methods.forEach((method) => {
        chainMethods.add(method);
      });

      console.log('[ApprovalPermissionManager] Stored permissions for chain:', {
        sessionKey,
        chainId,
        methods: Array.from(chainMethods),
        totalMethods: chainMethods.size,
      });

      // Build human-readable permissions
      approvedPermissions[chainId as ChainId] = {};
      for (const method of methods) {
        approvedPermissions[chainId as ChainId][method] = {
          allowed: true,
          shortDescription: method === '*' ? 'All methods' : method,
        };
      }
    }

    // Persist permissions to SessionStore if available
    if (this.sessionStore && sessionId) {
      try {
        const existingSession = await this.sessionStore.get(sessionId);
        if (existingSession) {
          // Update session with permissions
          await this.sessionStore.set(sessionId, {
            ...existingSession,
            permissions,
          });
          console.log('[ApprovalPermissionManager] Persisted permissions to SessionStore:', {
            sessionId,
            permissions,
          });
        }
      } catch (error) {
        console.error('[ApprovalPermissionManager] Failed to persist permissions:', error);
      }
    }

    return approvedPermissions;
  }

  /**
   * Checks if a specific JSON-RPC request is permitted for the current session and context.
   * - Allows `wm_connect` to pass through (handled by `approvePermissions`).
   * - For `wm_call` and `wm_bulkCall`, it delegates to `checkSingleMethod`.
   * - Other router methods are generally allowed.
   *
   * @param context - The router context.
   * @param request - The JSON-RPC request to check.
   * @returns A promise that resolves to `true` if permitted, `false` otherwise.
   */
  async checkPermissions(
    context: RouterContext,
    request: JSONRPCRequest<RouterMethodMap, keyof RouterMethodMap>,
  ): Promise<boolean> {
    // Allow wm_connect through - it will be handled by approvePermissions
    if (request.method === 'wm_connect') {
      return true;
    }

    const sessionId = context.session?.id;
    const origin = context.origin || 'unknown';

    console.log('[ApprovalPermissionManager] checkPermissions ENTRY:', {
      method: request.method,
      sessionId,
      hasSession: !!context.session,
      origin: context.origin,
      expectedKey: sessionId ? `${origin}_${sessionId}` : 'N/A',
      approvedSessions: Array.from(this.approvedSessions.keys()),
    });

    if (!sessionId) {
      console.warn('[ApprovalPermissionManager] No session ID in context');
      return false;
    }

    // Extract method details based on the request method
    let chainId: ChainId | undefined;
    let method: string | undefined;
    let params: unknown;

    if (request.method === 'wm_call' && request.params) {
      const callParams = request.params as { chainId: string; call?: { method?: string; params?: unknown } };
      chainId = callParams.chainId;
      method = callParams.call?.method;
      params = callParams.call?.params;
    } else if (request.method === 'wm_bulkCall' && request.params) {
      // For bulk calls, we need to check all methods
      const bulkParams = request.params as { chainId: string; calls?: unknown[] };
      chainId = bulkParams.chainId;
      const calls = bulkParams.calls || [];

      // Check permissions for each method in the bulk call
      for (const call of calls) {
        const callObj = call as { method?: string; params?: unknown };
        const hasPermission = await this.checkSingleMethod(
          sessionId,
          context.origin || 'unknown',
          chainId || '',
          callObj.method || '',
          callObj.params,
        );
        if (!hasPermission) {
          return false;
        }
      }
      return true;
    } else {
      // For non-call methods, generally allow them
      return true;
    }

    if (!chainId || !method) {
      return false;
    }

    return this.checkSingleMethod(sessionId, context.origin || 'unknown', chainId, method, params);
  }

  /**
   * Checks permission for a single method call against stored session permissions
   * or prompts the user via `onApprovalRequest` for sensitive methods.
   *
   * @param sessionId - The current session ID.
   * @param origin - The origin of the request.
   * @param chainId - The chain ID for the method call.
   * @param method - The method name to check.
   * @param params - Optional parameters for the method call (used in UI prompt).
   * @returns A promise that resolves to `true` if permitted, `false` otherwise.
   */
  private async checkSingleMethod(
    sessionId: string,
    origin: string,
    chainId: ChainId,
    method: string,
    params?: unknown,
  ): Promise<boolean> {
    // Use composite key for session lookup
    const sessionKey = `${origin}_${sessionId}`;

    console.log('[ApprovalPermissionManager] checkSingleMethod LOOKING UP:', {
      sessionId,
      sessionKey,
      chainId,
      method,
      origin,
      approvedSessionsKeys: Array.from(this.approvedSessions.keys()),
      keyMatch: this.approvedSessions.has(sessionKey),
    });

    // Check if session has permission for this chain and method
    let sessionChains = this.approvedSessions.get(sessionKey);

    // If not in memory, try to load from SessionStore
    if (!sessionChains && this.sessionStore) {
      try {
        const sessionData = await this.sessionStore.get(sessionId);
        if (sessionData?.permissions) {
          console.log('[ApprovalPermissionManager] Loaded permissions from SessionStore:', {
            sessionId,
            permissions: sessionData.permissions,
          });

          // Restore permissions to memory for future lookups
          const restoredChains = new Map<ChainId, Set<string>>();
          for (const [chainId, methods] of Object.entries(sessionData.permissions)) {
            restoredChains.set(chainId as ChainId, new Set(methods));
          }
          this.approvedSessions.set(sessionKey, restoredChains);
          sessionChains = restoredChains;
        }
      } catch (error) {
        console.error('[ApprovalPermissionManager] Failed to load permissions from SessionStore:', error);
      }
    }

    if (!sessionChains) {
      console.error('[ApprovalPermissionManager] SESSION NOT FOUND!', {
        lookingForKey: sessionKey,
        availableKeys: Array.from(this.approvedSessions.keys()),
        sessionId,
        origin,
        method,
      });
      return false;
    }

    console.log('[ApprovalPermissionManager] Session found, checking chain permissions:', {
      sessionKey,
      availableChains: Array.from(sessionChains.keys()),
      lookingForChain: chainId,
    });

    const chainMethods = sessionChains.get(chainId);
    if (!chainMethods) {
      console.error('[ApprovalPermissionManager] CHAIN NOT FOUND!', {
        lookingForChain: chainId,
        availableChains: Array.from(sessionChains.keys()),
        sessionKey,
      });
      return false;
    }

    console.log('[ApprovalPermissionManager] Chain found, checking method permissions:', {
      chainId,
      availableMethods: Array.from(chainMethods),
      lookingForMethod: method,
      hasWildcard: chainMethods.has('*'),
      hasMethod: chainMethods.has(method),
    });

    // If wildcard permission, allow all methods
    if (chainMethods.has('*')) {
      return true;
    }

    // If specific method permission exists, check if it requires approval
    if (chainMethods.has(method)) {
      // Even if method is in approved list, check if it requires approval each time
      if (this.methodsRequiringApproval.has(method)) {
        return this.onApprovalRequest({ origin, chainId, method, params });
      }
      return true;
    }

    // For methods that need approval, show UI
    if (this.methodsRequiringApproval.has(method)) {
      return this.onApprovalRequest({ origin, chainId, method, params });
    }

    return false;
  }

  /**
   * Retrieves the currently approved human-readable permissions for the session.
   *
   * @param context - The router context.
   * @param chainIds - Optional array of chain IDs to filter permissions for.
   * @returns A promise that resolves to the human-readable permissions.
   */
  async getPermissions(context: RouterContext, chainIds?: ChainId[]): Promise<HumanReadableChainPermissions> {
    const sessionId = context.session?.id;
    const origin = context.origin || 'unknown';
    if (!sessionId) {
      return {};
    }

    // Use composite key for session lookup
    const sessionKey = `${origin}_${sessionId}`;
    const sessionChains = this.approvedSessions.get(sessionKey);
    if (!sessionChains) {
      return {};
    }

    const permissions: HumanReadableChainPermissions = {};
    for (const [chainId, methods] of sessionChains) {
      if (chainIds && !chainIds.includes(chainId)) {
        continue;
      }
      permissions[chainId] = {};
      for (const method of methods) {
        permissions[chainId][method] = {
          allowed: true,
          shortDescription: method === '*' ? 'All methods' : method,
        };
      }
    }

    return permissions;
  }

  /**
   * Cleans up stored permissions for a terminated session.
   *
   * @param context - The router context.
   * @returns A promise that resolves when cleanup is complete.
   */
  async cleanup(context: RouterContext): Promise<void> {
    const sessionId = context.session?.id;
    const origin = context.origin || 'unknown';
    if (sessionId) {
      // Use composite key for session cleanup
      const sessionKey = `${origin}_${sessionId}`;
      this.approvedSessions.delete(sessionKey);
    }
  }
}
