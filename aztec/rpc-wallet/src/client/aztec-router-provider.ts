import type { JSONRPCTransport } from '@walletmesh/jsonrpc';
import { WalletRouterProvider } from '@walletmesh/router';
import { registerAztecSerializers } from './register-serializers.js';

/**
 * An extended {@link WalletRouterProvider} specifically for Aztec network interactions.
 *
 * This class automatically registers all necessary Aztec-specific type serializers
 * (e.g., for `AztecAddress`, `Fr`, `TxExecutionRequest`) upon instantiation.
 * This ensures that when dApps communicate with an Aztec wallet via this provider,
 * all Aztec types are correctly serialized for JSON-RPC transport and deserialized
 * back into their proper object instances on receipt.
 *
 * It simplifies the setup for dApp developers, as they do not need to manually
 * register serializers for Aztec types.
 *
 * @example
 * ```typescript
 * import { AztecRouterProvider, createAztecWallet } from '@walletmesh/aztec-rpc-wallet';
 * import { MyCustomTransport } from './my-custom-transport'; // Assuming a custom transport
 *
 * // 1. Create a JSON-RPC transport
 * const transport = new MyCustomTransport();
 *
 * // 2. Create the AztecRouterProvider instance
 * const provider = new AztecRouterProvider(transport);
 *
 * // 3. Connect to the Aztec chain (e.g., testnet) and request permissions
 * await provider.connect({
 *   'aztec:testnet': ['aztec_getAddress', 'aztec_sendTx']
 * });
 *
 * // 4. Create an AztecDappWallet instance using the provider
 * const wallet = await createAztecWallet(provider, 'aztec:testnet');
 *
 * // Now, calls made through 'wallet' will automatically handle Aztec type serialization:
 * const address = await wallet.getAddress(); // AztecAddress instance
 * // const txRequest = ...;
 * // const txHash = await wallet.sendTx(await wallet.proveTx(txRequest)); // Tx, TxHash instances
 * ```
 *
 * @see {@link WalletRouterProvider} for the base class functionality.
 * @see {@link registerAztecSerializers} for the underlying serializer registration.
 * @see {@link AztecDappWallet} which is typically used with this provider.
 */
export class AztecRouterProvider extends WalletRouterProvider {
  /**
   * Constructs an instance of `AztecRouterProvider`.
   *
   * Upon construction, it immediately registers all Aztec-specific serializers
   * with the underlying JSON-RPC node managed by the `WalletRouterProvider`.
   *
   * @param transport - The {@link JSONRPCTransport} instance to be used for
   *                    communication between the dApp and the WalletRouter.
   * @param context - Optional context object that can be passed to the
   *                  `WalletRouterProvider` constructor.
   * @param sessionId - Optional pre-existing session ID to use without calling connect.
   */
  constructor(transport: JSONRPCTransport, context?: Record<string, unknown>, sessionId?: string) {
    super(transport, context, sessionId);

    // Register all Aztec serializers on this provider instance
    registerAztecSerializers(this);
  }
}
