import type { JSONRPCMethodMap, JSONRPCEventMap, JSONRPCRequest } from '@walletmesh/jsonrpc';

/**
 * Interface for wallet clients that can be used with the router.
 * Wallet clients provide a standardized way to interact with different blockchain wallets,
 * supporting both method calls and event handling.
 *
 * @example
 * ```typescript
 * class EthereumWalletClient implements WalletClient {
 *   async call<T>(method: string, params?: unknown): Promise<T> {
 *     // Forward to Ethereum wallet
 *     return ethereum.request({ method, params });
 *   }
 *
 *   on(event: string, handler: (data: unknown) => void): void {
 *     // Listen for Ethereum events
 *     ethereum.on(event, handler);
 *   }
 *
 *   off(event: string, handler: (data: unknown) => void): void {
 *     ethereum.removeListener(event, handler);
 *   }
 * }
 * ```
 */
export interface WalletClient {
  /**
   * Call a method on the wallet
   * @template T - The expected return type of the method call
   * @param method - Method name to invoke (e.g., 'eth_accounts', 'eth_sendTransaction')
   * @param params - Method parameters, can be an array for positional params or an object for named params
   * @returns Promise resolving to the method result of type T
   * @throws {Error} If the method call fails or is rejected by the wallet
   */
  call<T = unknown>(method: string, params?: unknown): Promise<T>;

  /**
   * Get supported capabilities of the wallet
   * @returns Promise resolving to the list of supported method names
   * @throws {Error} If the capabilities request fails
   */
  getSupportedMethods?(): Promise<string[]>;

  /**
   * Register an event handler for wallet events
   * Events include:
   * - 'disconnect': Emitted when the wallet disconnects
   *
   * @param event - Event name to listen for
   * @param handler - Function to call when the event occurs
   */
  on?(event: string, handler: (data: unknown) => void): void;

  /**
   * Remove a previously registered event handler
   * @param event - Event name to stop listening for
   * @param handler - Handler function to remove (must be the same reference as used in 'on')
   */
  off?(event: string, handler: (data: unknown) => void): void;
}

/**
 * A structured representation of permissions in a human-readable format.
 * Used for displaying and communicating permission states to users and applications.
 *
 * @example
 * ```typescript
 * {
 *   "eip155:1": {
 *     "eth_sendTransaction": {
 *       allowed: true,
 *       shortDescription: "Send transactions",
 *       longDescription: "Allow sending Ethereum transactions from your account"
 *     }
 *   }
 * }
 * ```
 */
export type HumanReadableChainPermissions = {
  [chainId: ChainId]: {
    [methodName: string]: {
      /** Whether the method is currently allowed */
      allowed: boolean;
      /** Short description of what the permission allows */
      shortDescription: string;
      /** Optional detailed description of the permission's implications */
      longDescription?: string;
    };
  };
};

/**
 * Callback for handling permission approval requests.
 * Called when a client requests new permissions or updates existing ones.
 *
 * @param context - Router context containing session and origin information
 * @param permissionRequest - Requested permissions per chain
 * @returns Promise resolving to approved permissions in human-readable format
 *
 * @example
 * ```typescript
 * const approvalCallback: PermissionApprovalCallback = async (context, request) => {
 *   const approved = await showPermissionDialog(request);
 *   return approved ? request : {};
 * };
 * ```
 */
export type PermissionApprovalCallback<C extends RouterContext> = (
  context: C,
  permissionRequest: ChainPermissions,
) => Promise<HumanReadableChainPermissions>;

/**
 * Callback for checking if a specific method call is permitted.
 * Called before each method invocation to verify permissions.
 *
 * @param context - Router context containing session and origin information
 * @param request - The JSON-RPC request being checked
 * @returns Promise resolving to true if the method call is permitted
 *
 * @example
 * ```typescript
 * const checkCallback: PermissionCheckCallback = async (context, request) => {
 *   return context.session?.permissions?.[request.params.chainId]
 *     ?.includes(request.params.call.method) ?? false;
 * };
 * ```
 */
export type PermissionCheckCallback<T extends RouterMethodMap, C extends RouterContext> = (
  context: C,
  request: JSONRPCRequest<T, keyof T>,
) => Promise<boolean>;

/**
 * Callback for retrieving current permissions.
 * Used to get the current permission state for display or verification.
 *
 * @param context - Router context containing session and origin information
 * @param chainIds - Optional array of chain IDs to filter permissions by
 * @returns Promise resolving to current permissions in human-readable format
 */
export type PermissionGetCallback<C extends RouterContext> = (
  context: C,
  chainIds?: ChainId[],
) => Promise<HumanReadableChainPermissions>;

/**
 * Callback for cleaning up permissions when a session ends.
 * Called during session termination to ensure proper permission cleanup.
 *
 * @param context - Router context containing session and origin information
 * @param sessionId - ID of the session being cleaned up
 */
export type PermissionCleanupCallback<C extends RouterContext> = (
  context: C,
  sessionId: string,
) => Promise<void>;

/**
 * Interface for implementing permission management strategies.
 * Handles all aspects of permission lifecycle including approval,
 * verification, retrieval, and cleanup.
 *
 * @template T - Router method map type for type-safe method handling
 * @template C - Router context type for session and origin information
 *
 * @example
 * ```typescript
 * class MyPermissionManager implements PermissionManager {
 *   async approvePermissions(context, request) {
 *     // Custom permission approval logic
 *   }
 *
 *   async checkPermissions(context, request) {
 *     // Custom permission verification logic
 *   }
 *
 *   async getPermissions(context, chainIds) {
 *     // Custom permission retrieval logic
 *   }
 * }
 * ```
 */
export interface PermissionManager<T extends RouterMethodMap, C extends RouterContext> {
  /**
   * Handle permission approval requests.
   * Called when new permissions are requested or existing ones are updated.
   */
  approvePermissions: PermissionApprovalCallback<C>;

  /**
   * Verify if a method call is permitted.
   * Called before each method invocation to enforce permissions.
   */
  checkPermissions: PermissionCheckCallback<T, C>;

  /**
   * Get current permissions in human-readable format.
   * Used for displaying current permission state to users.
   */
  getPermissions: PermissionGetCallback<C>;

  /**
   * Optional cleanup handler for when sessions end.
   * Used to clean up any permission state when sessions are terminated.
   */
  cleanup?: PermissionCleanupCallback<C>;
}

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
 * Chain permissions mapping.
 * Maps chain IDs to arrays of method names that are permitted.
 * Used for both requesting and storing permissions.
 */
export type ChainPermissions = Record<ChainId, string[]>;

/**
 * Session data structure representing an active wallet connection.
 * Contains metadata about the session including its unique identifier
 * and the origin that initiated the connection.
 */
export interface SessionData {
  /** Unique session identifier */
  id: string;
  /** Origin of the session request (e.g., "https://app.example.com") */
  origin: string;
}

/**
 * Represents a method call to be executed on a wallet.
 * Encapsulates both the method name and its parameters.
 */
export interface MethodCall {
  /** Method name to invoke on the wallet (e.g., "eth_sendTransaction") */
  method: string;
  /** Method parameters to pass to the wallet method. Type depends on the specific method being called. */
  params?: unknown;
}

/**
 * Parameters required to invoke a single method on a specific chain.
 * Used with the wm_call method to execute wallet operations.
 */
export interface CallParams extends Record<string, unknown> {
  /** Target chain ID where the method will be executed */
  chainId: ChainId;
  /** Session ID for authorization and context */
  sessionId: string;
  /** Method call details including name and parameters */
  call: MethodCall;
}

/**
 * Parameters for executing multiple method calls in sequence on a specific chain.
 * Used with the wm_bulkCall method to batch multiple operations efficiently.
 * All calls in the sequence must be permitted for the operation to succeed.
 */
export interface BulkCallParams extends Record<string, unknown> {
  /** Target chain ID where the methods will be executed */
  chainId: ChainId;
  /** Session ID for authorization and context */
  sessionId: string;
  /** Array of method calls to execute in sequence */
  calls: MethodCall[];
}

/**
 * Maps chain IDs to their corresponding wallet client instances.
 * Used by the router to maintain connections to multiple chains.
 *
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
 * Router event map for bi-directional communication.
 * Defines events that can be emitted by the router for real-time state updates
 * and session management.
 */
export interface RouterEventMap extends JSONRPCEventMap {
  /**
   * Emitted when a wallet's state changes (e.g., account changes, network changes)
   * @property chainId - The chain ID where the state change occurred
   * @property changes - Object containing the state changes:
   *   - accounts: New list of authorized accounts if changed
   *   - networkId: New network ID if changed
   *   - Additional chain-specific state changes as key-value pairs
   */
  wm_walletStateChanged: {
    chainId: ChainId;
    changes: {
      accounts?: string[];
      networkId?: string;
      [key: string]: unknown;
    };
  };

  /**
   * Emitted when a session's permissions are updated
   * @property sessionId - ID of the session whose permissions changed
   * @property permissions - New set of permissions for the session
   */
  wm_permissionsChanged: {
    sessionId: string;
    permissions: ChainPermissions;
  };

  /**
   * Emitted when a session is terminated by the router
   * @property sessionId - ID of the terminated session
   * @property reason - Human-readable reason for termination (e.g., "timeout", "user_request")
   */
  wm_sessionTerminated: {
    sessionId: string;
    reason: string;
  };

  /**
   * Emitted when a wallet's availability changes (added or removed)
   * @property chainId - The chain ID of the wallet whose availability changed
   * @property available - Whether the wallet is now available (true) or unavailable (false)
   */
  wm_walletAvailabilityChanged: {
    chainId: ChainId;
    available: boolean;
  };
  [event: string]: unknown;
}

/**
 * Router method map following JSON-RPC spec.
 * Defines all available methods that can be called on the router,
 * their parameters, and return types.
 */
export interface RouterMethodMap extends JSONRPCMethodMap {
  /**
   * Attempt to reconnect to an existing session
   * @param sessionId - ID of the session to reconnect to
   * @returns Object containing reconnection status and current permissions
   */
  wm_reconnect: {
    params: {
      sessionId: string;
    };
    result: {
      status: boolean;
      permissions: HumanReadableChainPermissions;
    };
  };

  /**
   * Create a new session with specified permissions
   * @param permissions - Record of chain IDs to their requested method permissions
   * @returns Object containing the new session ID and approved permissions
   */
  wm_connect: {
    params: {
      permissions: ChainPermissions;
    };
    result: {
      sessionId: string;
      permissions: HumanReadableChainPermissions;
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
   * @param chainIds - Optional array of chain IDs to filter permissions by
   * @returns Current permissions in human-readable format
   */
  wm_getPermissions: {
    params: {
      sessionId: string;
      chainIds?: ChainId[];
    };
    result: HumanReadableChainPermissions;
  };

  /**
   * Update session permissions
   * @param sessionId - ID of the session to update
   * @param permissions - Record of chain IDs to their new requested permissions
   * @returns Newly approved permissions in human-readable format
   */
  wm_updatePermissions: {
    params: {
      sessionId: string;
      permissions: ChainPermissions;
    };
    result: HumanReadableChainPermissions;
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

  /**
   * Execute multiple method calls in sequence
   * @param chainId - Chain to invoke the methods on
   * @param sessionId - Session ID for authorization
   * @param calls - Array of method calls to execute
   * @returns Array of results corresponding to each method call
   */
  wm_bulkCall: {
    params: BulkCallParams;
    result: unknown[];
  };

  /**
   * Get supported methods for specified chains
   * @param chainIds - Optional array of chain IDs to get methods for
   * @returns Record mapping chain IDs to their supported method names
   */
  wm_getSupportedMethods: {
    params: {
      chainIds?: ChainId[];
    };
    result: Record<ChainId, string[]>;
  };
}

/**
 * Context object passed to router operations.
 * Contains information about the current request context
 * including origin and session data.
 */
export interface RouterContext {
  /** Origin of the request (e.g., "https://app.example.com") */
  origin?: string;
  /** Current session data if authenticated */
  session?: SessionData;
  /** Additional context properties */
  [key: string]: unknown;
}
