import type {
  PermissionManager,
  ChainId,
  ChainPermissions,
  RouterContext,
  RouterMethodMap,
  HumanReadableChainPermissions,
} from '@walletmesh/router';
import type { JSONRPCRequest } from '@walletmesh/jsonrpc';

/**
 * Options for configuring the {@link ApprovalPermissionManager}.
 */
interface ApprovalPermissionManagerOptions {
  /**
   * Callback function invoked when a permission request requires user interaction.
   * This function should typically trigger a UI prompt for the user to approve or deny the request.
   *
   * @param request - Details of the permission request, including origin, chainId, method, and params.
   * @returns A promise that resolves to `true` if the user approves the request, `false` otherwise.
   */
  onApprovalRequest: (request: {
    origin: string;
    chainId: ChainId;
    method: string;
    params?: unknown;
  }) => Promise<boolean>;

  /**
   * List of methods that require approval. If not provided, defaults to transaction methods.
   */
  methodsRequiringApproval?: string[];
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

  /**
   * Creates an instance of ApprovalPermissionManager.
   * @param options - Configuration options, including the `onApprovalRequest` callback.
   */
  constructor(options: ApprovalPermissionManagerOptions) {
    this.onApprovalRequest = options.onApprovalRequest;
    this.methodsRequiringApproval = new Set(
      options.methodsRequiringApproval || ['aztec_getAddress', 'aztec_getCompleteAddress', 'aztec_proveTx', 'aztec_sendTx', 'aztec_simulateUtility', 'aztec_contractInteraction', 'aztec_wmDeployContract', 'aztec_getPrivateEvents', 'aztec_registerContract', 'aztec_registerContractClass']
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
    permissions: ChainPermissions
  ): Promise<HumanReadableChainPermissions> {
    const sessionId = context.session?.id;
    const origin = context.origin || 'unknown';


    // For initial connection, prompt user for approval
    const userApproved = await this.onApprovalRequest({
      origin,
      chainId: Object.keys(permissions).join(', '),
      method: 'wm_connect',
      params: permissions
    });

    if (!userApproved || !sessionId) {
      return {};
    }

    const approvedPermissions: HumanReadableChainPermissions = {};

    for (const [chainId, methods] of Object.entries(permissions)) {
      // Store approved permissions
      if (!this.approvedSessions.has(sessionId)) {
        this.approvedSessions.set(sessionId, new Map());
      }
      const sessionChains = this.approvedSessions.get(sessionId)!;

      if (!sessionChains.has(chainId as ChainId)) {
        sessionChains.set(chainId as ChainId, new Set());
      }

      const chainMethods = sessionChains.get(chainId as ChainId)!;
      methods.forEach(method => chainMethods.add(method));


      // Build human-readable permissions
      approvedPermissions[chainId as ChainId] = {};
      for (const method of methods) {
        approvedPermissions[chainId as ChainId][method] = {
          allowed: true,
          shortDescription: method === '*' ? 'All methods' : method,
        };
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
    request: JSONRPCRequest<RouterMethodMap, keyof RouterMethodMap>
  ): Promise<boolean> {
    // Allow wm_connect through - it will be handled by approvePermissions
    if (request.method === 'wm_connect') {
      return true;
    }

    const sessionId = context.session?.id;
    if (!sessionId) {
      return false;
    }

    // Extract method details based on the request method
    let chainId: ChainId | undefined;
    let method: string | undefined;
    let params: unknown;

    if (request.method === 'wm_call' && request.params) {
      const callParams = request.params as any;
      chainId = callParams.chainId;
      method = callParams.call?.method;
      params = callParams.call?.params;
    } else if (request.method === 'wm_bulkCall' && request.params) {
      // For bulk calls, we need to check all methods
      const bulkParams = request.params as any;
      chainId = bulkParams.chainId;
      const calls = bulkParams.calls || [];

      // Check permissions for each method in the bulk call
      for (const call of calls) {
        const hasPermission = await this.checkSingleMethod(
          sessionId,
          context.origin || '',
          chainId || '',
          call.method,
          call.params
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

    return this.checkSingleMethod(sessionId, context.origin || '', chainId, method, params);
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
    params?: unknown
  ): Promise<boolean> {

    // Check if session has permission for this chain and method
    const sessionChains = this.approvedSessions.get(sessionId);
    if (!sessionChains) {
      return false;
    }

    const chainMethods = sessionChains.get(chainId);
    if (!chainMethods) {
      return false;
    }


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
  async getPermissions(
    context: RouterContext,
    chainIds?: ChainId[]
  ): Promise<HumanReadableChainPermissions> {
    const sessionId = context.session?.id;
    if (!sessionId) {
      return {};
    }

    const sessionChains = this.approvedSessions.get(sessionId);
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
    if (sessionId) {
      this.approvedSessions.delete(sessionId);
    }
  }
}
