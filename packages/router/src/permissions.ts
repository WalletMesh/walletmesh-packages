import type {
  PermissionCallback,
  PermissionContext,
  PermissionApprovalCallback,
  ChainPermissions,
} from './types.js';

/**
 * A fully permissive permission callback that allows all operations.
 * Useful for development and testing.
 */
export const createPermissivePermissions = (): PermissionCallback => {
  return async (_context: PermissionContext) => true;
};

/**
 * A fully permissive permission approval callback that approves all requested permissions.
 * Useful for development and testing.
 */
export const createPermissivePermissionApproval = (): PermissionApprovalCallback => {
  return async (context) => context.requestedPermissions;
};

/**
 * Creates a permission approval callback that filters requested permissions based on patterns.
 * Only methods matching the allowed patterns will be approved.
 * @param allowedPatterns Array of patterns to match against
 */
export const createStringMatchPermissionApproval = (
  allowedPatterns: string[],
): PermissionApprovalCallback => {
  // Convert patterns to RegExp for efficient matching
  const patterns = allowedPatterns.map((pattern) => {
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    const regex = escaped.replace(/\*/g, '.*');
    return new RegExp(`^${regex}$`);
  });

  return async (context) => {
    const approvedPermissions: ChainPermissions = {};

    // For each chain and its requested permissions
    for (const [chainId, methods] of Object.entries(context.requestedPermissions)) {
      const approvedMethods: string[] = [];

      // Check each method against patterns
      for (const method of methods) {
        const callPattern = `${chainId}:${method}`;
        if (patterns.some((pattern) => pattern.test(callPattern))) {
          approvedMethods.push(method);
        }
      }

      // Only include chain if some methods were approved
      if (approvedMethods.length > 0) {
        approvedPermissions[chainId] = approvedMethods;
      }
    }

    return approvedPermissions;
  };
};

/**
 * Creates a permission callback that uses string/wildcard pattern matching.
 * Patterns can include '*' for wildcards, e.g.:
 * - "eip155:1:eth_*" matches all eth_ methods on Ethereum mainnet
 * - "eip155:*:eth_call" matches eth_call on any EIP-155 chain
 * - "*:eth_call" matches eth_call on any chain
 * - "eip155:*:*" matches any method on any EIP-155 chain
 * - "*" matches everything
 */
export const createStringMatchPermissions = (allowedPatterns: string[]): PermissionCallback => {
  // Convert patterns to RegExp for efficient matching
  const patterns = allowedPatterns.map((pattern) => {
    // Escape special chars except *
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    // Convert * to regex wildcard
    const regex = escaped.replace(/\*/g, '.*');
    return new RegExp(`^${regex}$`);
  });

  return async (context: PermissionContext) => {
    // For non-call operations, check if the chain is allowed
    if (context.operation !== 'call') {
      const chainPattern = `${context.chainId}`;
      return patterns.some((pattern) => pattern.test(chainPattern));
    }

    // For call operations, check chain:method pattern
    const callPattern = `${context.chainId}:${context.method}`;
    return patterns.some((pattern) => pattern.test(callPattern));
  };
};

/**
 * Example usage:
 *
 * ```typescript
 * // Fully permissive for development
 * const devPermissions = createPermissivePermissions();
 *
 * // Wildcard matching for production
 * const prodPermissions = createStringMatchPermissions([
 *   // Allow eth_call on any chain
 *   "*:eth_call",
 *   // Allow all eth_ methods on Ethereum mainnet
 *   "eip155:1:eth_*",
 *   // Allow specific method on specific chain
 *   "eip155:5:eth_getBalance"
 * ]);
 * ```
 */
