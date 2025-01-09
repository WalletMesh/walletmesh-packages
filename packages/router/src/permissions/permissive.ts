import type {
  ChainPermissions,
  HumanReadableChainPermissions,
  PermissionManager,
  RouterContext,
  RouterMethodMap,
} from '../types.js';

/**
 * A permissive implementation of the PermissionManager interface that allows all operations.
 * This implementation is designed for:
 * - Development environments where quick iteration is prioritized
 * - Testing scenarios where permission checks would add complexity
 * - Trusted contexts where permission enforcement is not required
 * - Prototyping before implementing proper permission controls
 *
 * Features:
 * - Zero-configuration setup
 * - All operations automatically permitted
 * - Wildcard chain and method matching
 * - No user interaction required
 * - Consistent permissive behavior
 *
 * Security Note:
 * This implementation provides NO security guarantees and should NOT be used in production
 * environments where access control is required.
 *
 * @template T - Router method map type for type-safe method handling
 * @template C - Router context type for session and origin information
 *
 * @example
 * ```typescript
 * // Create a permissive manager for development
 * const devPermissions = new PermissivePermissionsManager();
 *
 * // All permission checks pass automatically
 * const allowed = await devPermissions.checkPermissions(context, {
 *   method: 'eth_sendTransaction',
 *   params: [...]
 * }); // Returns true
 *
 * // All chains and methods are permitted
 * const permissions = await devPermissions.getPermissions();
 * // Returns: { '*': { '*': { allowed: true, shortDescription: 'Permissive' } } }
 * ```
 *
 * @see {@link PermissionManager} for interface definition
 * @see {@link AllowAskDenyManager} for production-ready implementation
 */
export class PermissivePermissionsManager<
  T extends RouterMethodMap = RouterMethodMap,
  C extends RouterContext = RouterContext,
> implements PermissionManager<T, C>
{
  /**
   * Pre-configured permissive permissions that allow all operations.
   * Uses a two-level wildcard structure:
   * - First '*': Matches any chain ID (e.g., 'eip155:1', 'solana:mainnet')
   * - Second '*': Matches any method name (e.g., 'eth_sendTransaction')
   *
   * This configuration ensures that:
   * - All chains are automatically supported
   * - All methods are automatically permitted
   * - No permission updates are required
   *
   * @private
   */
  private permissive: HumanReadableChainPermissions = {
    '*': {
      '*': {
        allowed: true,
        shortDescription: 'Permissive',
      },
    },
  };

  /**
   * Get current permissions, which are always the permissive wildcard configuration.
   * This method is part of the PermissionManager interface but always returns
   * the same wildcard configuration regardless of input parameters.
   *
   * @param _context - Router context (unused in permissive implementation)
   * @param _chainIds - Optional chain IDs to filter by (unused in permissive implementation)
   * @returns Promise resolving to the permissive permissions configuration
   * @see {@link HumanReadableChainPermissions} for return type structure
   */
  async getPermissions(): Promise<HumanReadableChainPermissions> {
    return this.permissive;
  }

  /**
   * Check if a method call is permitted. Always returns true.
   * This method implements the PermissionManager interface's permission
   * checking but provides no actual security checks.
   *
   * @param _context - Router context (unused in permissive implementation)
   * @param _request - JSON-RPC request (unused in permissive implementation)
   * @returns Promise resolving to true for all requests
   * @see {@link RouterMethodMap} for supported method types
   */
  async checkPermissions(_context: C, _request: unknown): Promise<boolean> {
    return true;
  }

  /**
   * Handle permission approval requests. Always returns the permissive configuration.
   * This method implements the PermissionManager interface's permission approval
   * but automatically approves all requests without user interaction.
   *
   * @param _context - Router context (unused in permissive implementation)
   * @param _permissionRequest - Requested permissions (unused in permissive implementation)
   * @returns Promise resolving to the permissive permissions configuration
   * @see {@link HumanReadableChainPermissions} for return type structure
   * @see {@link ChainPermissions} for permission request structure
   */
  async approvePermissions(
    _context: C,
    _PermissionRequest: ChainPermissions,
  ): Promise<HumanReadableChainPermissions> {
    return this.permissive;
  }
}
