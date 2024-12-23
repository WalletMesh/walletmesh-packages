/**
 * Interface for wallet clients that can be used with the router
 */
export interface WalletClient {
  /**
   * Call a method on the wallet
   * @param method - Method name to invoke
   * @param params - Method parameters
   * @returns Promise resolving to the method result
   */
  call<T = unknown>(method: string, params?: unknown): Promise<T>;

  /**
   * Get supported capabilities
   * @returns Promise resolving to object containing supported methods
   */
  getSupportedMethods?(): Promise<{ methods: string[] }>;
}

/**
 * Operation types that can be performed
 */
export type OperationType = 'connect' | 'call' | 'disconnect' | 'updatePermissions' | 'reconnect';

/**
 * Context provided to permission callbacks
 */
export interface PermissionContext {
  /** Type of operation being performed */
  operation: OperationType;
  /** Chain ID the operation targets */
  chainId: ChainId;
  /** Method being called (for call operations) */
  method?: string;
  /** Parameters for the operation */
  params?: unknown;
  /** Origin of the request */
  origin: string;
  /** Current session data if available */
  session?: SessionData;
}

/**
 * Permission approval request context
 */
export interface PermissionApprovalContext {
  /** Type of operation being performed */
  operation: OperationType;
  /** Origin of the request */
  origin: string;
  /** Requested permissions per chain */
  requestedPermissions: ChainPermissions;
  /** Current session data if available (for updatePermissions) */
  session?: SessionData;
}

/**
 * Permission callback function type
 * @param context - Complete context for the permission decision
 * @returns Promise<boolean> indicating if the operation should be permitted
 */
export type PermissionCallback = (context: PermissionContext) => Promise<boolean>;

/**
 * Permission approval callback function type
 * @param context - Complete context for the permission approval decision
 * @returns Promise<ChainPermissions> containing the approved permissions for each chain
 */
export type PermissionApprovalCallback = (context: PermissionApprovalContext) => Promise<ChainPermissions>;

/**
 * Configuration for string/wildcard permission matching
 */
export interface WildcardPermissionConfig {
  /** Allowed patterns (e.g. ["eip155:1:eth_*", "eip155:*:eth_call"]) */
  allowedPatterns: string[];
}

/**
 * Chain ID format: namespace:reference
 * Represents a unique identifier for a blockchain network.
 * @example "aztec:testnet"
 * @example "eip155:1" // Ethereum mainnet
 * @example "solana:mainnet-beta"
 */
export type ChainId = string;

/**
 * Chain permissions mapping
 * Maps chain IDs to arrays of method names that are permitted
 */
export type ChainPermissions = Record<ChainId, string[]>;

/**
 * Session data
 * Represents an active wallet connection session with its associated permissions and metadata.
 * A single session can manage permissions for multiple chains.
 */
export interface SessionData {
  /** Unique session identifier */
  id: string;
  /** Origin of the session request */
  origin: string;
  /** Permissions granted to this session per chain */
  permissions: ChainPermissions;
}

/**
 * Router configuration options
 */
export interface RouterConfig {
  /** Default behavior when no permission rules match */
  defaultToStringMatch?: boolean;
}

/**
 * Represents a method call to be executed on a wallet
 */
export interface MethodCall {
  /** Method name to invoke on the wallet */
  method: string;
  /** Method parameters to pass to the wallet method. Type depends on the specific method being called. */
  params?: unknown;
}

/**
 * Method invocation parameters
 * Parameters required to invoke a method on a specific chain through an authenticated session.
 */
export interface CallParams extends Record<string, unknown> {
  /** Target chain ID */
  chainId: ChainId;
  /** Session ID for authorization */
  sessionId: string;
  /** Calls */
  call: MethodCall;
}

export interface BulkCallParams extends Record<string, unknown> {
  /** Target chain ID */
  chainId: ChainId;
  /** Session ID for authorization */
  sessionId: string;
  /** Calls */
  calls: MethodCall[];
}

/**
 * Configuration for wallet instances
 * Maps chain IDs to their corresponding JSON-RPC client instances
 * @example
 * ```typescript
 * const wallets = new Map([
 *   ['aztec:testnet', new JSONRPCClient(...)],
 *   ['eip155:1', new JSONRPCClient(...)]
 * ]);
 * ```
 */
/**
 * Maps chain IDs to their corresponding wallet client instances
 * @example
 * ```typescript
 * const wallets = new Map([
 *   ['aztec:testnet', new MyWalletClient(...)],
 *   ['eip155:1', new JSONRPCWalletClient(...)]
 * ]);
 * ```
 */
export type Wallets = Map<ChainId, WalletClient>;

/**
 * Router method map following JSON-RPC spec
 * Defines all available methods that can be called on the router, their parameters and return types
 */
export type RouterMethodMap = {
  /**
   * Attempt to reconnect to an existing session
   * @param sessionId - ID of the session to reconnect to
   * @returns true if reconnection was successful, false otherwise
   */
  wm_reconnect: {
    params: {
      sessionId: string;
    };
    result: {
      status: boolean;
      permissions: ChainPermissions;
    };
  };

  /**
   * Create a new session
   * @param chainId - The chain to connect to
   * @param permissions - Array of method names that the session requests permission to call
   * @returns Object containing the new session ID
   */
  wm_connect: {
    params: {
      permissions: ChainPermissions;
    };
    result: {
      sessionId: string;
      permissions: ChainPermissions;
    };
  };

  /**
   * End an existing session
   * @param sessionId - ID of the session to end
   * @returns true if session was successfully ended
   */
  wm_disconnect: {
    params: {
      sessionId: string;
    };
    result: boolean;
  };

  /**
   * Get current session permissions
   * @param sessionId - ID of the session to get permissions for
   * @param chainIds - Optional array of chain IDs to get permissions for. If not provided, returns permissions for all chains
   * @returns Record of chain IDs to their permissions
   */
  wm_getPermissions: {
    params: {
      sessionId: string;
      chainIds?: ChainId[];
    };
    result: ChainPermissions;
  };

  /**
   * Update session permissions
   * @param sessionId - ID of the session to update
   * @param permissions - Record of chain IDs to their new permissions
   * @returns true if permissions were successfully updated
   */
  wm_updatePermissions: {
    params: {
      sessionId: string;
      permissions: ChainPermissions;
    };
    result: boolean;
  };

  /**
   * Invoke a method on a specific chain
   * @param chainId - Chain to invoke the method on
   * @param sessionId - Session ID for authorization
   * @param call - Method call details including name and parameters
   * @returns Result of the method call, type depends on the method called
   */
  wm_call: {
    params: CallParams;
    result: unknown;
  };

  wm_bulkCall: {
    params: BulkCallParams;
    result: unknown[];
  };

  /**
   * Get supported methods
   * @param chainId - Optional chain to get methods for. If not provided, returns router's supported methods
   * @returns Object containing array of supported method names
   */
  wm_getSupportedMethods: {
    params: {
      chainIds?: ChainId[];
    };
    result: Record<ChainId, string[]>;
  };
};

export interface RouterContext {
  origin?: string;
  [key: string]: unknown;
}
