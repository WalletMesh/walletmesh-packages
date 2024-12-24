import { JSONRPCPeer } from '@walletmesh/jsonrpc';

import type { ChainId, MethodCall, RouterMethodMap, RouterEventMap, RouterContext } from './types.js';

/**
 * Client-side provider for interacting with the multi-chain router.
 * Provides a simplified interface for applications to connect to and interact with wallets.
 *
 * The provider handles session management and method invocation, abstracting away
 * the underlying JSON-RPC communication details. It uses a bi-directional peer connection
 * to support both sending requests and receiving events from the router.
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
 * const sessionId = await provider.connect({
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
export class WalletRouterProvider extends JSONRPCPeer<RouterMethodMap, RouterEventMap, RouterContext> {
  private _sessionId: string | undefined;

  /**
   * Gets the current session ID if connected, undefined otherwise
   * @returns The current session ID or undefined if not connected
   */
  get sessionId(): string | undefined {
    return this._sessionId;
  }

  /**
   * Connects to multiple chains with specified permissions
   * @param permissions - Map of chain IDs to their requested permissions
   * @param timeout - Optional timeout in milliseconds for the request
   * @returns Session ID that can be used for future requests
   * @throws {Error} If the connection fails or is rejected
   *
   * @example
   * ```typescript
   * // Connect to multiple chains with specific permissions
   * const sessionId = await provider.connect({
   *   'eip155:1': ['eth_accounts', 'eth_sendTransaction'],
   *   'eip155:137': ['eth_getBalance', 'eth_call']
   * });
   *
   * // Connect with a 5 second timeout
   * const sessionId = await provider.connect({
   *   'eip155:1': ['eth_accounts']
   * }, 5000);
   * ```
   */
  async connect(permissions: Record<ChainId, string[]>, timeout?: number): Promise<string> {
    const result = await this.callMethod('wm_connect', { permissions }, timeout);
    this._sessionId = result.sessionId;
    return result.sessionId;
  }

  /**
   * Disconnects the current session if one exists
   * @param timeout - Optional timeout in milliseconds for the request
   * @throws {Error} If not connected or if the disconnection fails
   */
  async disconnect(timeout?: number): Promise<void> {
    if (!this._sessionId) {
      return;
    }
    await this.callMethod('wm_disconnect', { sessionId: this._sessionId }, timeout);
    this._sessionId = undefined;
  }

  /**
   * Gets current session permissions
   * @param chainIds - Optional array of chain IDs to get permissions for. If not provided, returns permissions for all chains
   * @param timeout - Optional timeout in milliseconds for the request
   * @returns Record of chain IDs to their permissions
   * @throws {Error} If the request fails
   */
  async getPermissions(chainIds?: ChainId[], timeout?: number): Promise<Record<ChainId, string[]>> {
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
   * Updates session permissions
   * @param permissions - Record of chain IDs to their new permissions
   * @param timeout - Optional timeout in milliseconds for the request
   * @throws {Error} If not connected or if the update fails
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
  async updatePermissions(permissions: Record<ChainId, string[]>, timeout?: number): Promise<void> {
    if (!this._sessionId) {
      throw new Error('Not connected');
    }
    await this.callMethod(
      'wm_updatePermissions',
      {
        sessionId: this._sessionId,
        permissions,
      },
      timeout,
    );
  }

  /**
   * Invokes a method on the connected wallet
   * @param chainId - Target chain identifier (must match the chain ID used to connect)
   * @param call - Method call details including name and parameters
   * @param timeout - Optional timeout in milliseconds for the request
   * @returns Result from the wallet method call
   * @throws {Error} If not connected, if the chain ID doesn't match, or if the call fails
   *
   * @example
   * ```typescript
   * // Get accounts
   * const accounts = await provider.call('eip155:1', {
   *   method: 'eth_accounts'
   * });
   *
   * // Send transaction
   * const txHash = await provider.call('eip155:1', {
   *   method: 'eth_sendTransaction',
   *   params: [{
   *     to: '0x...',
   *     value: '0x...'
   *   }]
   * });
   * ```
   */
  async call(chainId: ChainId, call: MethodCall, timeout?: number): Promise<unknown> {
    if (!this._sessionId) {
      throw new Error('Not connected');
    }
    return this.callMethod('wm_call', {
      chainId,
      call,
      sessionId: this._sessionId,
      timeout,
    });
  }

  /**
   * Executes multiple method calls in sequence on the same chain
   * @param chainId - Target chain identifier (must match the chain ID used to connect)
   * @param calls - Array of method calls to execute
   * @param timeout - Optional timeout in milliseconds for the request
   * @returns Array of results from the wallet method calls
   * @throws {Error} If not connected, if the chain ID doesn't match, or if any call fails
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
  async bulkCall(chainId: ChainId, calls: MethodCall[], timeout?: number): Promise<unknown[]> {
    if (!this._sessionId) {
      throw new Error('Not connected');
    }
    return this.callMethod('wm_bulkCall', {
      chainId,
      calls,
      sessionId: this._sessionId,
      timeout,
    });
  }

  /**
   * Gets supported methods for one or more chains
   * @param chainIds - Optional array of chain identifiers. If not provided, returns router's supported methods
   * @param timeout - Optional timeout in milliseconds for the request
   * @returns Record mapping chain IDs to their supported methods
   * @throws {Error} If the request fails
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
}
