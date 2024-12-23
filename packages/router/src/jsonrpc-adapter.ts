import type { JSONRPCClient, JSONRPCMethodMap, JSONRPCParams } from '@walletmesh/jsonrpc';
import type { WalletClient } from './types.js';

/**
 * Method map for the JSON-RPC client that includes all possible wallet methods.
 * Extends the base JSONRPCMethodMap to include wallet-specific methods and
 * allows for dynamic method names with unknown parameters and return types.
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
 * Adapter class that wraps a JSONRPCClient to implement the WalletClient interface.
 * This adapter allows any JSON-RPC client to be used as a wallet client by
 * translating between the JSON-RPC protocol and the WalletClient interface.
 *
 * @example
 * ```typescript
 * const jsonRpcClient = new JSONRPCClient(...);
 * const walletClient = new JSONRPCWalletClient(jsonRpcClient);
 *
 * // Use as a WalletClient
 * const accounts = await walletClient.call('eth_accounts');
 * ```
 */
export class JSONRPCWalletClient implements WalletClient {
  private client: JSONRPCClient<WalletMethodMap>;

  constructor(client: JSONRPCClient<WalletMethodMap>) {
    this.client = client;
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

    return this.client.callMethod(method, validParams) as Promise<T>;
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
    return this.client.callMethod('wm_getSupportedMethods') as Promise<{ methods: string[] }>;
  }
}
