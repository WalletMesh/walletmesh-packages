import type { JSONRPCRequest } from '@walletmesh/jsonrpc';
import type { ChainId, PermissionApprovalCallback, RouterContext, RouterMethodMap } from '@walletmesh/router';
import type {
  AllowAskDenyChainPermissions,
  AllowAskDenyState,
  AskCallback,
} from '@walletmesh/router/permissions';
import { AllowAskDenyManager } from '@walletmesh/router/permissions';

/**
 * Custom permission manager that extends AllowAskDenyManager to add
 * the ability to update permission states dynamically and support auto-approval.
 */
export class CustomPermissionManager extends AllowAskDenyManager<RouterMethodMap, RouterContext> {
  private autoApproveEnabled = false;

  /**
   * Explicitly declare the approvePermissions property to ensure proper override.
   * Without this declaration, TypeScript may not properly recognize the override in the constructor.
   */
  public approvePermissions: PermissionApprovalCallback<RouterContext>;

  /**
   * Explicitly declare the askPermissions property to ensure proper override.
   * This handles individual method approval prompts in ASK state.
   */
  public askPermissions: AskCallback<RouterMethodMap, RouterContext>;

  /**
   * Creates a new CustomPermissionManager instance.
   * Overrides the approvePermissions callback to check auto-approve state in real-time,
   * fixing the closure problem where the callback captured stale state.
   *
   * @param approvePermissionsCallback - Original callback for handling new permission requests
   * @param askCallback - Callback for prompting user about methods in ASK state
   * @param initialState - Initial permission states for chains and methods
   */
  constructor(
    approvePermissionsCallback: PermissionApprovalCallback<RouterContext>,
    askCallback: AskCallback<RouterMethodMap, RouterContext>,
    initialState: AllowAskDenyChainPermissions<RouterMethodMap> = new Map(),
  ) {
    super(approvePermissionsCallback, askCallback, initialState);

    // Override the approvePermissions property to check auto-approve in real-time
    // This fixes the closure problem where the callback would capture stale autoApprove state
    this.approvePermissions = async (context, permissionRequest) => {
      // If auto-approve is enabled, automatically approve all connections
      if (this.autoApproveEnabled) {
        // Let the original approvePermissions callback handle the approval
        // and return the correct HumanReadableChainPermissions structure
        return approvePermissionsCallback(context, permissionRequest);
      }

      // Otherwise, use the original callback
      return approvePermissionsCallback(context, permissionRequest);
    };

    // Override the askPermissions property to check auto-approve for individual method calls
    // This handles approval prompts for methods in ASK state
    this.askPermissions = async (context, request) => {
      // If auto-approve is enabled, automatically approve all method calls
      if (this.autoApproveEnabled) {
        return true;
      }

      // Otherwise, use the original callback
      return askCallback(context, request);
    };
  }

  /**
   * Enables or disables auto-approval mode.
   * When enabled, all permission checks will return true regardless of the permission state.
   *
   * @param enabled - Whether auto-approval should be enabled
   */
  setAutoApprove(enabled: boolean): void {
    this.autoApproveEnabled = enabled;
  }

  /**
   * Gets the current auto-approval state.
   *
   * @returns Whether auto-approval is currently enabled
   */
  isAutoApproveEnabled(): boolean {
    return this.autoApproveEnabled;
  }

  /**
   * Updates the permission state for a specific method on a specific chain.
   *
   * @param chainId - The chain ID
   * @param method - The method name
   * @param state - The new permission state
   */
  updatePermissionState(chainId: ChainId, method: string, state: AllowAskDenyState): void {
    // Access the private permissions map using bracket notation
    const permissions = (this as unknown as { permissions: Map<ChainId, Map<string, AllowAskDenyState>> })
      .permissions;

    if (!permissions.has(chainId)) {
      permissions.set(chainId, new Map());
    }

    const chainPermissions = permissions.get(chainId);
    if (chainPermissions) {
      chainPermissions.set(method, state);
    }
  }

  /**
   * Gets the current permission state for a specific method on a specific chain.
   *
   * @param chainId - The chain ID
   * @param method - The method name
   * @returns The current permission state or undefined if not set
   */
  getPermissionState(chainId: ChainId, method: string): AllowAskDenyState | undefined {
    const permissions = (this as unknown as { permissions: Map<ChainId, Map<string, AllowAskDenyState>> })
      .permissions;
    return permissions.get(chainId)?.get(method);
  }

  /**
   * Override checkCallPermissions to support auto-approval.
   * When auto-approval is enabled, this method returns true for all requests.
   */
  async checkCallPermissions(
    context: RouterContext,
    request: JSONRPCRequest<RouterMethodMap, 'wm_call', RouterMethodMap['wm_call']['params']>,
  ): Promise<boolean> {
    // If auto-approve is enabled, allow all requests
    if (this.autoApproveEnabled) {
      return true;
    }

    // Otherwise, use the parent implementation
    return super.checkCallPermissions(context, request);
  }

  /**
   * Override checkBulkCallPermissions to support auto-approval.
   * When auto-approval is enabled, this method returns true for all requests.
   */
  async checkBulkCallPermissions(
    context: RouterContext,
    request: JSONRPCRequest<RouterMethodMap, 'wm_bulkCall', RouterMethodMap['wm_bulkCall']['params']>,
  ): Promise<boolean> {
    // If auto-approve is enabled, allow all requests
    if (this.autoApproveEnabled) {
      return true;
    }

    // Otherwise, use the parent implementation
    return super.checkBulkCallPermissions(context, request);
  }
}
