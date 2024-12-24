import type { JSONRPCPeer, JSONRPCMethodMap, JSONRPCParams } from '@walletmesh/jsonrpc';
import type { WalletClient } from './types.js';

/**
 * Method map for wallet JSON-RPC communication.
 * Extends the base JSONRPCMethodMap to include wallet-specific methods and
 * allows for dynamic method names with unknown parameters and return types.
 *
 * @example
 * ```typescript
 * // Ethereum wallet methods
 * type EthereumMethods = {
 *   eth_accounts: { params: undefined; result: string[] };
 *   eth_sendTransaction: {
 *     params: [{ to: string; value: string; data?: string }];
 *     result: string
 *   };
 * } & WalletMethodMap;
 * ```
 */
export interface WalletMethodMap extends JSONRPCMethodMap {
  wm_getSupportedMethods: {
    params: undefined;
    result: { methods: string[] };
  };
  [method: string]: {
    params?: JSONRPCParams;
    result: unknown;
  };
}

/**
 * Adapter class that wraps a JSONRPCPeer to implement the WalletClient interface.
 * This adapter allows any JSON-RPC peer to be used as a wallet client by
 * translating between the JSON-RPC protocol and the WalletClient interface.
 *
 * The adapter supports both method calls and event handling, making it suitable
 * for modern wallets that require bi-directional communication.
 *
 * @example
 * ```typescript
 * const peer = new JSONRPCPeer({
 *   send: message => {
 *     // Send to wallet
 *     wallet.postMessage(message);
 *   }
 * });
 *
 * const walletClient = new JSONRPCWalletClient(peer);
 *
 * // Listen for account changes
 * walletClient.on('accountsChanged', accounts => {
 *   console.log('Active accounts:', accounts);
 * });
 *
 * // Call methods
 * const accounts = await walletClient.call('eth_accounts');
 * const balance = await walletClient.call('eth_getBalance', [accounts[0]]);
 * ```
 */
export class JSONRPCWalletClient implements WalletClient {
  private peer: JSONRPCPeer<WalletMethodMap>;
  private eventCleanupFns: Map<string, Map<(data: unknown) => void, () => void>> = new Map();

  constructor(peer: JSONRPCPeer<WalletMethodMap>) {
    this.peer = peer;
  }

  /**
   * Calls a method on the underlying JSON-RPC client
   * @param method - The method name to call
   * @param params - Optional parameters to pass to the method
   * @returns Promise resolving to the method result
   * @throws {Error} If the method call fails or returns an error
   *
   * @example
   * ```typescript
   * // Call without parameters
   * const accounts = await client.call('eth_accounts');
   *
   * // Call with parameters
   * const balance = await client.call('eth_getBalance', ['0x...', 'latest']);
   * ```
   */
  async call<T = unknown>(method: string, params?: unknown): Promise<T> {
    // Ensure params matches JSONRPCParams type
    const validParams =
      params === undefined || Array.isArray(params) || (typeof params === 'object' && params !== null)
        ? (params as JSONRPCParams)
        : undefined;

    return this.peer.callMethod(method, validParams) as Promise<T>;
  }

  /**
   * Gets the capabilities (supported methods) of the wallet
   * @returns Promise resolving to an object containing an array of supported method names
   * @throws {Error} If the capabilities request fails
   *
   * @example
   * ```typescript
   * const { methods } = await client.getSupportedMethods();
   * console.log('Supported methods:', methods);
   * ```
   */
  async getSupportedMethods(): Promise<{ methods: string[] }> {
    return this.peer.callMethod('wm_getSupportedMethods') as Promise<{ methods: string[] }>;
  }

  /**
   * Register an event handler for wallet events
   * @param event - Event name to listen for (e.g., 'accountsChanged', 'networkChanged')
   * @param handler - Function to call when the event occurs
   *
   * @example
   * ```typescript
   * client.on('accountsChanged', (accounts: string[]) => {
   *   console.log('Active accounts:', accounts);
   * });
   *
   * client.on('networkChanged', (networkId: string) => {
   *   console.log('Connected to network:', networkId);
   * });
   * ```
   */
  on(event: string, handler: (data: unknown) => void): void {
    if (!this.eventCleanupFns.has(event)) {
      this.eventCleanupFns.set(event, new Map());
    }

    const cleanup = this.peer.on(event, handler);
    this.eventCleanupFns.get(event)?.set(handler, cleanup);
  }

  /**
   * Remove a previously registered event handler
   * @param event - Event name to stop listening for
   * @param handler - Handler function to remove (must be the same reference as used in 'on')
   *
   * @example
   * ```typescript
   * const handler = (accounts: string[]) => {
   *   console.log('Active accounts:', accounts);
   * };
   *
   * // Start listening
   * client.on('accountsChanged', handler);
   *
   * // Stop listening
   * client.off('accountsChanged', handler);
   * ```
   */
  off(event: string, handler: (data: unknown) => void): void {
    const cleanup = this.eventCleanupFns.get(event)?.get(handler);
    if (cleanup) {
      cleanup();
      this.eventCleanupFns.get(event)?.delete(handler);
    }
  }
}
