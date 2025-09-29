import { JSONRPCNode, type JSONRPCSerializer, type JSONRPCTransport } from '@walletmesh/jsonrpc';
import { RouterError, RouterErrorMap } from './errors.js';
import { OperationBuilder } from './operation.js';
import { ProviderSerializerRegistry } from './provider-serialization.js';
import type {
  ChainId,
  ChainPermissions,
  HumanReadableChainPermissions,
  MethodCall,
  MethodResults,
  RouterContext,
  RouterEventMap,
  RouterMethodMap,
} from './types.js';

/**
 * Client-side provider for interacting with the multi-chain router.
 * Provides a simplified interface for applications to connect to and interact with wallets.
 *
 * The provider handles session management and method invocation, abstracting away
 * the underlying JSON-RPC communication details. It uses a bi-directional peer connection
 * to support both sending requests and receiving events from the router.
 *
 * Events inherited from JSONRPCNode:
 * - wm_walletStateChanged: Emitted when wallet state changes (accounts, network, etc.)
 * - wm_permissionsChanged: Emitted when session permissions are updated
 * - wm_sessionTerminated: Emitted when the session is terminated
 * - wm_walletAvailabilityChanged: Emitted when wallet availability changes
 *
 * @see {@link RouterEventMap} for detailed event documentation
 *
 * @example
 * ```typescript
 * const provider = new WalletRouterProvider({
 *   send: async (message) => {
 *     // Send message to router
 *     await fetch('/api/wallet', {
 *       method: 'POST',
 *       body: JSON.stringify(message)
 *     });
 *   }
 * });
 *
 * // Connect to a chain
 * const { sessionId, permissions } = await provider.connect({
 *   'eip155:1': ['eth_accounts', 'eth_sendTransaction']
 * });
 *
 * // Listen for wallet state changes
 * provider.on('wm_walletStateChanged', ({ chainId, changes }) => {
 *   console.log(`Wallet state changed for ${chainId}:`, changes);
 * });
 *
 * // Call methods
 * const accounts = await provider.call('eip155:1', {
 *   method: 'eth_accounts'
 * });
 * ```
 */
export class WalletRouterProvider extends JSONRPCNode<RouterMethodMap, RouterEventMap, RouterContext> {
  private _sessionId: string | undefined;
  private serializerRegistry = new ProviderSerializerRegistry();

  /**
   * Creates a new WalletRouterProvider instance.
   *
   * @param transport - The JSON-RPC transport for communication
   * @param context - Optional context object for the JSON-RPC node
   * @param sessionId - Optional pre-existing session ID to use without calling connect
   */
  constructor(transport: JSONRPCTransport, context?: RouterContext, sessionId?: string) {
    super(transport, context);
    if (sessionId) {
      this._sessionId = sessionId;
    }
  }

  /**
   * Gets the current session ID if connected, undefined otherwise.
   * The session ID is required for most operations and is set after
   * a successful connection.
   *
   * @returns The current session ID or undefined if not connected
   * @see {@link connect} for establishing a session
   * @see {@link disconnect} for ending a session
   */
  get sessionId(): string | undefined {
    return this._sessionId;
  }

  /**
   * Connects to multiple chains with specified permissions.
   * Establishes a session and requests method permissions for each chain.
   *
   * @param permissions - Map of chain IDs to their requested permissions
   * @param timeout - Optional timeout in milliseconds. If the request takes longer,
   *                 it will be cancelled and throw a TimeoutError
   * @returns Session ID that can be used for future requests
   * @throws {RouterError} With code 'invalidRequest' if permissions are invalid
   * @throws {RouterError} With code 'unknownChain' if a chain is not supported
   * @throws {TimeoutError} If the request times out
   * @see {@link RouterMethodMap['wm_connect']} for detailed request/response types
   *
   * @example
   * ```typescript
   * // Connect to multiple chains with specific permissions
   * const { sessionId, permissions } = await provider.connect({
   *   'eip155:1': ['eth_accounts', 'eth_sendTransaction'],
   *   'eip155:137': ['eth_getBalance', 'eth_call']
   * });
   *
   * // Connect with a 5 second timeout
   * const { sessionId, permissions } = await provider.connect({
   *   'eip155:1': ['eth_accounts']
   * }, 5000);
   * ```
   */
  async connect(
    permissions: ChainPermissions,
    timeout?: number,
  ): Promise<{ sessionId: string; permissions: HumanReadableChainPermissions }> {
    const result = await this.callMethod('wm_connect', { permissions }, timeout);
    this._sessionId = result.sessionId;
    return result;
  }

  /**
   * Disconnects the current session if one exists.
   * Cleans up session state and notifies the router to terminate the session.
   *
   * @param timeout - Optional timeout in milliseconds. If the request takes longer,
   *                 it will be cancelled and throw a TimeoutError
   * @throws {RouterError} With code 'invalidSession' if not connected
   * @throws {TimeoutError} If the request times out
   * @see {@link RouterMethodMap['wm_disconnect']} for detailed request/response types
   */
  async disconnect(timeout?: number): Promise<void> {
    if (!this._sessionId) {
      return;
    }

    try {
      await this.callMethod('wm_disconnect', { sessionId: this._sessionId }, timeout);
    } catch (error) {
      // Check if this is a transport-level error (e.g., window closed)
      const isTransportError =
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof error.message === 'string' &&
        (error.message.includes('window closed') ||
          error.message.includes('Not connected') ||
          error.message.includes('disconnected'));

      if (isTransportError) {
        // Transport errors during disconnect are expected when the wallet window
        // is already closed. Log for debugging but don't throw.
        console.debug('[WalletRouterProvider] Transport already disconnected during disconnect:', error);
      } else {
        // For other errors, rethrow since they may indicate real problems
        throw error;
      }
    } finally {
      // Always clear session ID, even if disconnect message failed
      // This ensures we don't try to use a stale session
      this._sessionId = undefined;
    }
  }

  /**
   * Gets current session permissions.
   * Returns a human-readable format suitable for displaying to users.
   *
   * @param chainIds - Optional array of chain IDs to get permissions for. If not provided, returns permissions for all chains
   * @param timeout - Optional timeout in milliseconds. If the request takes longer,
   *                 it will be cancelled and throw a TimeoutError
   * @returns Record of chain IDs to their permissions with human-readable descriptions
   * @throws {RouterError} With code 'invalidSession' if not connected
   * @throws {TimeoutError} If the request times out
   * @see {@link HumanReadableChainPermissions} for return type details
   * @see {@link RouterMethodMap['wm_getPermissions']} for detailed request/response types
   */
  async getPermissions(chainIds?: ChainId[], timeout?: number): Promise<HumanReadableChainPermissions> {
    if (!this._sessionId) {
      return {};
    }
    const params: RouterMethodMap['wm_getPermissions']['params'] = {
      sessionId: this._sessionId,
    };
    if (chainIds !== undefined) {
      params.chainIds = chainIds;
    }
    return this.callMethod('wm_getPermissions', params, timeout);
  }

  /**
   * Updates session permissions.
   * Requests additional permissions or modifies existing ones.
   *
   * @param permissions - Record of chain IDs to their new permissions
   * @param timeout - Optional timeout in milliseconds. If the request takes longer,
   *                 it will be cancelled and throw a TimeoutError
   * @throws {RouterError} With code 'invalidSession' if not connected
   * @throws {RouterError} With code 'invalidRequest' if permissions are invalid
   * @throws {TimeoutError} If the request times out
   * @see {@link RouterMethodMap['wm_updatePermissions']} for detailed request/response types
   *
   * @example
   * ```typescript
   * // Update permissions for multiple chains
   * await provider.updatePermissions({
   *   'eip155:1': ['eth_accounts', 'eth_sendTransaction'],
   *   'eip155:137': ['eth_getBalance', 'eth_call']
   * });
   * ```
   */
  async updatePermissions(
    permissions: Record<ChainId, string[]>,
    timeout?: number,
  ): Promise<HumanReadableChainPermissions> {
    if (!this._sessionId) {
      throw new RouterError('invalidSession');
    }
    const approvedPermissions = await this.callMethod(
      'wm_updatePermissions',
      {
        sessionId: this._sessionId,
        permissions,
      },
      timeout,
    );

    return approvedPermissions;
  }

  /**
   * Invokes a method on the connected wallet.
   * Routes the call to the appropriate wallet client based on chain ID.
   *
   * @param chainId - Target chain identifier (must match the chain ID used to connect)
   * @param call - Method call details including name and parameters
   * @param timeout - Optional timeout in milliseconds. If the request takes longer,
   *                 it will be cancelled and throw a TimeoutError
   * @returns Result from the wallet method call with proper type inference
   * @throws {RouterError} With code 'invalidSession' if not connected
   * @throws {RouterError} With code 'unknownChain' if chain ID is invalid
   * @throws {RouterError} With code 'insufficientPermissions' if method not permitted
   * @throws {RouterError} With code 'methodNotSupported' if method not supported
   * @throws {TimeoutError} If the request times out
   * @see {@link RouterMethodMap['wm_call']} for detailed request/response types
   *
   * @example
   * ```typescript
   * // Get accounts with proper type inference
   * const accounts = await provider.call('eip155:1', {
   *   method: 'eth_accounts'
   * } as const);
   *
   * // Send transaction with proper type inference
   * const txHash = await provider.call('eip155:1', {
   *   method: 'eth_sendTransaction',
   *   params: [{
   *     to: '0x...',
   *     value: '0x...'
   *   }]
   * } as const);
   * ```
   */
  async call<M extends keyof RouterMethodMap>(
    chainId: ChainId,
    call: MethodCall<M>,
    timeout?: number,
  ): Promise<RouterMethodMap[M]['result']> {
    if (!this._sessionId) {
      throw new RouterError('invalidSession');
    }

    const startTime = Date.now();
    console.log('🚀 WalletRouterProvider.call starting', {
      chainId,
      method: call.method,
      sessionId: this._sessionId,
      timeout,
      timestamp: new Date().toISOString(),
    });

    // Transport state check removed (transport is private in JSONRPCNode)

    // Serialize the method call parameters if a serializer is registered
    const serializedCall = await this.serializerRegistry.serializeCall(call as MethodCall<string>);

    try {
      console.log('📤 WalletRouterProvider.call sending wm_call request', {
        chainId,
        method: call.method,
        sessionId: this._sessionId,
        timeout,
        serializedCallMethod: serializedCall?.method,
        hasParams: !!serializedCall?.params,
        paramsType: typeof serializedCall?.params,
      });

      const result = await this.callMethod(
        'wm_call',
        {
          chainId,
          call: serializedCall as MethodCall,
          sessionId: this._sessionId,
        },
        timeout,
      );

      const elapsed = Date.now() - startTime;
      console.log(`✅ WalletRouterProvider.call succeeded after ${elapsed}ms`, {
        chainId,
        method: call.method,
        sessionId: this._sessionId,
        elapsed,
        hasResult: !!result,
        resultType: typeof result,
        result: result,
      });

      // Deserialize the result if a serializer is registered
      const deserializedResult = await this.serializerRegistry.deserializeResult(
        call.method as string,
        result,
      );

      return deserializedResult as RouterMethodMap[M]['result'];
    } catch (error) {
      const elapsed = Date.now() - startTime;

      // Enhanced error logging with transport state
      console.error(`❌ WalletRouterProvider.call failed after ${elapsed}ms`, {
        chainId,
        method: call.method,
        sessionId: this._sessionId,
        elapsed,
        timeout,
        error: error instanceof Error ? error.message : error,
        errorType: typeof error,
        errorName: error instanceof Error ? error.constructor.name : 'Unknown',
        errorStack: error instanceof Error ? error.stack : undefined,
        // Transport state logging removed (transport is private)
      });

      // Enhanced permission violation logging
      if (error instanceof RouterError && error.code === RouterErrorMap.insufficientPermissions.code) {
        console.error('🚫 PERMISSION VIOLATION DETECTED', {
          chainId,
          method: call.method,
          sessionId: this._sessionId,
          message: '❌ dApp tried to use a permission it does not have',
          actionRequired: 'Add this method to your dApp permission declaration',
          howToFix: `Include '${call.method}' in your connection options permissions array`,
          example: `
// In your dApp configuration:
permissions: [
  // ... other permissions
  '${call.method}',  // <-- Add this method
]`,
          troubleshooting: {
            '1_checkDappConfig': 'Verify your dApp declares this permission in connection options',
            '2_checkWalletState': 'Check if wallet has this method in ALLOW or ASK state',
            '3_reconnect': 'Try disconnecting and reconnecting to refresh permissions',
            '4_updatePermissions': 'Use provider.updatePermissions() to request this permission dynamically',
          },
          docs: 'See WalletMesh permission system documentation for more details',
        });

        // Also log to console with clear formatting for developers
        console.group('🚫 dApp Permission Violation');
        console.error(`Method "${call.method}" was denied by wallet`);
        console.info('💡 To fix this issue:');
        console.info(`   1. Add "${call.method}" to your dApp's permissions configuration`);
        console.info(`   2. Or use provider.updatePermissions() to request it dynamically`);
        console.info(`   3. Or check if the wallet has this method in ALLOW state`);
        console.groupEnd();
      }

      // Additional logging for transport-related errors
      if (error instanceof Error && error.message.includes('Transport')) {
        console.error('🔴 Transport-specific error details', {
          message: error.message,
          stack: error.stack,
          // Transport details removed (transport is private in JSONRPCNode)
        });
      }

      throw error;
    }
  }

  /**
   * Executes multiple method calls in sequence on the same chain.
   * More efficient than multiple individual calls for related operations.
   *
   * @param chainId - Target chain identifier (must match the chain ID used to connect)
   * @param calls - Array of method calls to execute
   * @param timeout - Optional timeout in milliseconds. If the request takes longer,
   *                 it will be cancelled and throw a TimeoutError
   * @returns Array of results from the wallet method calls
   * @throws {RouterError} With code 'invalidSession' if not connected
   * @throws {RouterError} With code 'unknownChain' if chain ID is invalid
   * @throws {RouterError} With code 'insufficientPermissions' if any method not permitted
   * @throws {RouterError} With code 'partialFailure' if some calls succeed but others fail
   * @throws {TimeoutError} If the request times out
   * @see {@link RouterMethodMap['wm_bulkCall']} for detailed request/response types
   *
   * @example
   * ```typescript
   * // Get accounts and balance in one request
   * const [accounts, balance] = await provider.bulkCall('eip155:1', [
   *   { method: 'eth_accounts' },
   *   {
   *     method: 'eth_getBalance',
   *     params: ['0x...', 'latest']
   *   }
   * ]);
   * ```
   */
  async bulkCall<T extends readonly MethodCall<keyof RouterMethodMap>[]>(
    chainId: ChainId,
    calls: T,
    timeout?: number,
  ): Promise<MethodResults<T>> {
    if (!this._sessionId) {
      throw new RouterError('invalidSession');
    }

    // Serialize each method call
    const serializedCalls = await Promise.all(
      calls.map((call) => this.serializerRegistry.serializeCall(call as MethodCall<string>)),
    );

    const results = await this.callMethod(
      'wm_bulkCall',
      {
        chainId,
        calls: serializedCalls as MethodCall[],
        sessionId: this._sessionId,
      },
      timeout,
    );

    // Deserialize each result
    const deserializedResults = await Promise.all(
      (results as unknown[]).map((result, index) =>
        this.serializerRegistry.deserializeResult(String(calls[index]?.method), result),
      ),
    );

    return deserializedResults as MethodResults<T>;
  }

  /**
   * Gets supported methods for one or more chains.
   * Used for capability discovery and feature detection.
   *
   * @param chainIds - Optional array of chain identifiers. If not provided, returns router's supported methods
   * @param timeout - Optional timeout in milliseconds. If the request takes longer,
   *                 it will be cancelled and throw a TimeoutError
   * @returns Record mapping chain IDs to their supported methods
   * @throws {RouterError} With code 'unknownChain' if any chain ID is invalid
   * @throws {RouterError} With code 'walletNotAvailable' if wallet capability check fails
   * @throws {TimeoutError} If the request times out
   * @see {@link RouterMethodMap['wm_getSupportedMethods']} for detailed request/response types
   *
   * @example
   * ```typescript
   * // Get methods for multiple chains
   * const methods = await provider.getSupportedMethods(['eip155:1', 'eip155:137']);
   * if (methods['eip155:1'].includes('eth_signMessage')) {
   *   // Ethereum mainnet wallet supports message signing
   * }
   *
   * // Get router's supported methods
   * const routerMethods = await provider.getSupportedMethods();
   * ```
   */
  async getSupportedMethods(chainIds?: ChainId[], timeout?: number): Promise<Record<ChainId, string[]>> {
    const params: RouterMethodMap['wm_getSupportedMethods']['params'] = {};
    if (chainIds !== undefined) {
      params.chainIds = chainIds;
    }
    return this.callMethod('wm_getSupportedMethods', params, timeout);
  }

  /**
   * Creates a new operation builder for chaining method calls.
   * Enables fluent method call chaining with proper type inference.
   *
   * @param chainId - The chain to execute operations on
   * @returns A new operation builder instance
   *
   * @example
   * ```typescript
   * const [balance, code] = await provider
   *   .chain('eip155:1')
   *   .call('eth_getBalance', ['0x123...'])
   *   .call('eth_getCode', ['0x456...'])
   *   .execute();
   * ```
   */
  public chain(chainId: ChainId): OperationBuilder<readonly []> {
    return new OperationBuilder(chainId, this, [] as const);
  }

  /**
   * Registers a serializer for a specific wallet method.
   * This allows the provider to properly serialize parameters and deserialize results
   * for wallet methods before they are wrapped in wm_call.
   *
   * @param method - The wallet method name (e.g., 'aztec_getAddress', 'eth_getBalance')
   * @param serializer - The serializer for the method
   *
   * @example
   * ```typescript
   * // Register a serializer for Aztec addresses
   * provider.registerMethodSerializer('aztec_getAddress', {
   *   result: {
   *     serialize: async (result) => ({ serialized: result.toString() }),
   *     deserialize: async (data) => AztecAddress.fromString(data.serialized)
   *   }
   * });
   *
   * // Now calls to aztec_getAddress will automatically serialize/deserialize
   * const address = await provider.call('aztec:mainnet', {
   *   method: 'aztec_getAddress'
   * });
   * // address is properly typed as AztecAddress
   * ```
   */
  public registerMethodSerializer<P = unknown, R = unknown>(
    method: string,
    serializer: JSONRPCSerializer<P, R>,
  ): void {
    this.serializerRegistry.register(method, serializer);
  }
}
