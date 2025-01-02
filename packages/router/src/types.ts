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
 * Permission callback function type
 * @param context - Complete context for the permission decision
 * @returns Promise<boolean> indicating if the operation should be permitted
 */
export type PermissionCallback = (
  context: RouterContext,
  request: JSONRPCRequest<RouterMethodMap, keyof RouterMethodMap>,
) => Promise<boolean>;

/**
 * Permission approval callback function type
 * @param context - Complete context for the permission approval decision
 * @returns Promise<ChainPermissions> containing the approved permissions for each chain
 */
export type PermissionApprovalCallback = (
  context: RouterContext,
  permissions: ChainPermissions,
) => Promise<ChainPermissions>;

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
  /** Permissions for each connected chain */
  permissions?: ChainPermissions;
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
 * Router event map for bi-directional communication
 * Defines events that can be emitted by the router
 */
export interface RouterEventMap extends JSONRPCEventMap {
  /**
   * Emitted when a wallet's state changes (e.g., account changes, network changes)
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
   */
  wm_permissionsChanged: {
    sessionId: string;
    permissions: ChainPermissions;
  };

  /**
   * Emitted when a session is terminated by the router
   */
  wm_sessionTerminated: {
    sessionId: string;
    reason: string;
  };

  /**
   * Emitted when a wallet's availability changes (added or removed)
   */
  wm_walletAvailabilityChanged: {
    chainId: ChainId;
    available: boolean;
  };
  [event: string]: unknown;
}

/**
 * Router method map following JSON-RPC spec
 * Defines all available methods that can be called on the router, their parameters and return types
 */
export interface RouterMethodMap extends JSONRPCMethodMap {
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
    result: ChainPermissions;
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
}

export interface RouterContext {
  origin?: string;
  session?: SessionData;
  [key: string]: unknown;
}
