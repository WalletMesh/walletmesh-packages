import { AllowAskDenyManager } from '@walletmesh/router/permissions';
import type { AllowAskDenyState } from '@walletmesh/router/permissions';
import type { RouterMethodMap, RouterContext, ChainId } from '@walletmesh/router';
import type { JSONRPCRequest } from '@walletmesh/jsonrpc';

/**
 * Custom permission manager that extends AllowAskDenyManager to add
 * the ability to update permission states dynamically and support auto-approval.
 */
export class CustomPermissionManager extends AllowAskDenyManager<RouterMethodMap, RouterContext> {
  private autoApproveEnabled = false;

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
    const permissions = (this as unknown as { permissions: Map<ChainId, Map<string, AllowAskDenyState>> }).permissions;

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
    const permissions = (this as unknown as { permissions: Map<ChainId, Map<string, AllowAskDenyState>> }).permissions;
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
