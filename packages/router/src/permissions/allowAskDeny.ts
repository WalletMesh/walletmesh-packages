import type { JSONRPCRequest } from '@walletmesh/jsonrpc';
import type {
  HumanReadableChainPermissions,
  PermissionApprovalCallback,
  PermissionManager,
  RouterContext,
  RouterMethodMap,
} from '../types.js';
import type { ChainId } from '../types.js';

/**
 * Callback for handling permission prompts when a method is in ASK state.
 * This callback is invoked to determine if a method call should be allowed.
 *
 * @template T - Router method map type for type-safe method handling
 * @template C - Router context type for session and origin information
 * @param context - Router context containing session and origin information
 * @param request - The JSON-RPC request being checked
 * @returns boolean indicating if the method call should be allowed
 *
 * @example
 * ```typescript
 * const askCallback: AskCallback = (context, request) => {
 *   // Show a prompt to the user
 *   return window.confirm(`Allow ${request.method}?`);
 * };
 * ```
 */
export type AskCallback<T extends RouterMethodMap, C extends RouterContext> = (
  context: C,
  request: JSONRPCRequest<T, keyof T>,
) => boolean;

/**
 * Permission states for the three-state permission model.
 * Each method can be in one of these three states.
 */
export enum AllowAskDenyState {
  /** Method is always allowed without prompting */
  ALLOW = 'allow',
  /** Method is always denied without prompting */
  DENY = 'deny',
  /** User should be prompted for permission each time */
  ASK = 'ask',
}

/**
 * Nested map structure for storing permission states.
 * Maps chain IDs to their method permissions, where each method
 * has an associated AllowAskDenyState.
 *
 * @template T - Router method map type for type-safe method names
 *
 * @example
 * ```typescript
 * const permissions = new Map([
 *   ['eip155:1', new Map([
 *     ['eth_sendTransaction', AllowAskDenyState.ASK],
 *     ['eth_accounts', AllowAskDenyState.ALLOW]
 *   ])]
 * ]);
 * ```
 */
type AllowAskDenyChainPermissions<T extends RouterMethodMap> = Map<ChainId, Map<keyof T, AllowAskDenyState>>;

/**
 * Implementation of the PermissionManager interface using a three-state model.
 * Manages permissions using ALLOW/DENY/ASK states with interactive prompts
 * for methods in the ASK state.
 *
 * Permission States:
 * - ALLOW: Method calls are automatically permitted without prompting
 * - DENY: Method calls are automatically rejected without prompting
 * - ASK: User is prompted via askCallback to approve/deny each call
 *
 * Features:
 * - Granular per-method permission control
 * - Chain-specific permission management
 * - Interactive permission prompts
 * - Bulk operation support with all-or-nothing semantics
 * - Human-readable permission descriptions
 *
 * @template T - Router method map type for type-safe method handling
 * @template C - Router context type for session and origin information
 *
 * @implements {PermissionManager<T, C>}
 *
 * @example
 * ```typescript
 * // Initialize with custom prompt handling
 * const manager = new AllowAskDenyManager(
 *   // Approval callback for new permission requests
 *   async (context, request) => {
 *     const approved = await showPermissionDialog(request);
 *     return approved ? request : {};
 *   },
 *   // Ask callback for methods in ASK state
 *   async (context, request) => {
 *     return await showMethodPrompt(request.method);
 *   },
 *   // Initial permission states
 *   new Map([
 *     ['eip155:1', new Map([
 *       ['eth_sendTransaction', AllowAskDenyState.ASK],
 *       ['eth_accounts', AllowAskDenyState.ALLOW],
 *       ['personal_sign', AllowAskDenyState.DENY]
 *     ])]
 *   ])
 * );
 * ```
 *
 * @see {@link PermissionManager} for interface definition
 * @see {@link AllowAskDenyState} for permission state definitions
 */
export class AllowAskDenyManager<
  T extends RouterMethodMap = RouterMethodMap,
  C extends RouterContext = RouterContext,
> implements PermissionManager<T, C>
{
  private permissions: AllowAskDenyChainPermissions<T>;
  approvePermissions: PermissionApprovalCallback<C>;
  askPermissions: AskCallback<T, C>;

  /**
   * Creates a new AllowAskDenyManager instance.
   *
   * @param approvePermissionsCallback - Callback for handling new permission requests
   * @param askCallback - Callback for prompting user about methods in ASK state
   * @param initialState - Initial permission states for chains and methods
   *
   * @throws {Error} If required callbacks are not provided
   */
  constructor(
    approvePermissionsCallback: PermissionApprovalCallback<C>,
    askCallback: AskCallback<T, C>,
    initialState: AllowAskDenyChainPermissions<T> = new Map(),
  ) {
    this.permissions = initialState;
    this.approvePermissions = approvePermissionsCallback;
    this.askPermissions = askCallback;
  }

  /**
   * Gets current permissions in a human-readable format.
   * Converts internal permission states to a format suitable for display.
   *
   * @param context - Router context containing session and origin information
   * @param chainIds - Optional array of chain IDs to filter permissions by
   * @returns Promise resolving to permissions in human-readable format:
   *          - allowed: Whether the method is currently allowed
   *          - shortDescription: String representation of the permission state
   * @throws {Error} If context is missing required session or origin information
   *
   * @see {@link HumanReadableChainPermissions} for return type details
   */
  async getPermissions(context: C, chainIds?: ChainId[]): Promise<HumanReadableChainPermissions> {
    // If no session or origin, return empty permissions
    if (!context.session || !context.origin) return {};

    const result: HumanReadableChainPermissions = {};

    // If chainIds are provided, filter permissions
    if (chainIds) {
      for (const chainId of chainIds) {
        const permissions = this.permissions.get(chainId);
        if (permissions) {
          result[chainId] = {};
          for (const [method, state] of permissions.entries()) {
            result[chainId][String(method)] = {
              allowed: state === AllowAskDenyState.ALLOW || state === AllowAskDenyState.ASK,
              shortDescription: state,
            };
          }
        }
      }
      return result;
    }

    // No chainIds provided, return all permissions
    for (const [chainId, methodPermissions] of this.permissions.entries()) {
      for (const [method, state] of methodPermissions.entries()) {
        if (!result[chainId]) {
          result[chainId] = {};
        }
        result[chainId][String(method)] = {
          allowed: state === AllowAskDenyState.ALLOW || state === AllowAskDenyState.ASK,
          shortDescription: state,
        };
      }
    }
    return result;
  }

  /**
   * Check if a method call is permitted based on its current permission state.
   * Routes permission checks to appropriate handler based on method type.
   *
   * Permission Check Flow:
   * 1. For wm_call: Routes to checkCallPermissions
   * 2. For wm_bulkCall: Routes to checkBulkCallPermissions
   * 3. For other methods: Returns true (router methods are always allowed)
   *
   * @template M - Method name type from the router method map
   * @param context - Router context containing session and origin information
   * @param request - The JSON-RPC request being checked
   * @returns Promise resolving to true if the method call is permitted
   * @throws {Error} If request is malformed or missing required parameters
   * @throws {Error} If context is missing required session or origin information
   *
   * @see {@link checkCallPermissions} for single method permission logic
   * @see {@link checkBulkCallPermissions} for bulk operation permission logic
   */
  async checkPermissions<M extends keyof T>(
    context: C,
    request: JSONRPCRequest<T, M, T[M]['params']>,
  ): Promise<boolean> {
    const method = request.method;

    switch (method) {
      case 'wm_call':
        return this.checkCallPermissions(
          context,
          request as JSONRPCRequest<T, 'wm_call', T['wm_call']['params']>,
        );
      case 'wm_bulkCall':
        return this.checkBulkCallPermissions(
          context,
          request as JSONRPCRequest<T, 'wm_bulkCall', T['wm_bulkCall']['params']>,
        );
      default:
        return true;
    }
  }

  /**
   * Check permissions for a bulk method call request.
   * All methods in the bulk call must be permitted for the call to be allowed.
   *
   * Permission checking logic:
   * 1. If any method is explicitly DENY, the entire call is denied
   * 2. If any method is ASK or undefined, user is prompted
   * 3. If all methods are ALLOW, the call is allowed
   *
   * This implements an all-or-nothing approach where either all methods
   * are permitted or none are. This ensures atomic operations where
   * partial execution is not desirable.
   *
   * @param context - Router context containing session and origin information
   * @param request - The bulk call JSON-RPC request
   * @returns Promise resolving to true if all method calls are permitted
   * @throws {Error} If request is malformed or missing required parameters
   * @throws {Error} If context is missing required session or origin information
   * @throws {Error} If chainId is invalid or not provided
   *
   * @see {@link RouterMethodMap['wm_bulkCall']} for request parameter details
   */
  async checkBulkCallPermissions(
    context: C,
    request: JSONRPCRequest<RouterMethodMap, 'wm_bulkCall', RouterMethodMap['wm_bulkCall']['params']>,
  ): Promise<boolean> {
    const params = request.params as RouterMethodMap['wm_bulkCall']['params'];
    const chainId = params['chainId'];
    if (!chainId) return false;

    const uniqueCallMethods = Array.from(new Set(params.calls.map((call) => call.method)));

    // If no call methods, deny
    if (uniqueCallMethods.length === 0) return false;

    // If any call method is denied, deny
    const denied = uniqueCallMethods.some((method) => {
      const state = this.permissions.get(chainId)?.get(method);
      return state === AllowAskDenyState.DENY;
    });
    if (denied) return false;

    // If any call method is ask or undefined, ask
    const ask = uniqueCallMethods.some((method) => {
      const state = this.permissions.get(chainId)?.get(method);
      return state === AllowAskDenyState.ASK || state === undefined;
    });

    if (ask) return this.askPermissions ? this.askPermissions(context, request) : false;

    // If all call methods are allowed, allow. This should only be reached if all methods are allowed
    // but we check to be safe
    const allowed = uniqueCallMethods.every((method) => {
      const state = this.permissions.get(chainId)?.get(method);
      return state === AllowAskDenyState.ALLOW;
    });

    return allowed;
  }

  /**
   * Check permissions for a single method call request.
   * The method's permission state determines the outcome:
   * - ALLOW: Returns true without prompting
   * - DENY: Returns false without prompting
   * - ASK: Prompts user via askCallback for decision
   * - undefined: Treated as ASK state
   *
   * @param context - Router context containing session and origin information
   * @param request - The method call JSON-RPC request
   * @returns Promise resolving to true if the method call is permitted
   * @throws {Error} If request is malformed or missing required parameters
   * @throws {Error} If context is missing required session or origin information
   * @throws {Error} If chainId is invalid or not provided
   * @throws {Error} If askCallback is not provided for ASK state
   *
   * @see {@link RouterMethodMap['wm_call']} for request parameter details
   * @see {@link AllowAskDenyState} for permission state definitions
   */
  async checkCallPermissions(
    context: C,
    request: JSONRPCRequest<RouterMethodMap, 'wm_call', RouterMethodMap['wm_call']['params']>,
  ): Promise<boolean> {
    const params = request.params as RouterMethodMap['wm_call']['params'];
    const chainId = params['chainId'];
    if (!chainId) return false;

    const state = this.permissions.get(chainId)?.get(params.call.method);
    switch (state) {
      case AllowAskDenyState.ALLOW:
        return true;
      case AllowAskDenyState.DENY:
        return false;
      case AllowAskDenyState.ASK:
        return this.askPermissions ? this.askPermissions(context, request) : false;
      default:
        return false;
    }
  }
}
