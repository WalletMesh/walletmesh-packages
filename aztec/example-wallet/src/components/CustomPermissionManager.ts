import { AllowAskDenyManager, AllowAskDenyState } from '@walletmesh/router/permissions';
import type { RouterMethodMap, RouterContext, ChainId } from '@walletmesh/router';

/**
 * Custom permission manager that extends AllowAskDenyManager to add
 * the ability to update permission states dynamically.
 */
export class CustomPermissionManager extends AllowAskDenyManager<RouterMethodMap, RouterContext> {
  /**
   * Updates the permission state for a specific method on a specific chain.
   *
   * @param chainId - The chain ID
   * @param method - The method name
   * @param state - The new permission state
   */
  updatePermissionState(chainId: ChainId, method: string, state: AllowAskDenyState): void {
    // Access the private permissions map using bracket notation
    const permissions = (this as any).permissions as Map<ChainId, Map<string, AllowAskDenyState>>;

    if (!permissions.has(chainId)) {
      permissions.set(chainId, new Map());
    }

    const chainPermissions = permissions.get(chainId)!;
    chainPermissions.set(method, state);
  }

  /**
   * Gets the current permission state for a specific method on a specific chain.
   *
   * @param chainId - The chain ID
   * @param method - The method name
   * @returns The current permission state or undefined if not set
   */
  getPermissionState(chainId: ChainId, method: string): AllowAskDenyState | undefined {
    const permissions = (this as any).permissions as Map<ChainId, Map<string, AllowAskDenyState>>;
    return permissions.get(chainId)?.get(method);
  }
}
