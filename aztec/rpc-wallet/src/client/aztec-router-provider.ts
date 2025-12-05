import type { JSONRPCTransport } from '@walletmesh/jsonrpc';
import { WalletRouterProvider } from '@walletmesh/router';
import { registerAztecWalletSerializers } from './register-serializers.js';

/**
 * Callback function to handle session termination
 */
export type SessionTerminationHandler = (params: {
  sessionId: string;
  reason: string;
}) => void | Promise<void>;

/**
 * Configuration options for AztecRouterProvider
 */
export interface AztecRPCWalletRouterProviderOptions {
  /**
   * Optional context object passed to WalletRouterProvider
   */
  context?: Record<string, unknown>;

  /**
   * Optional pre-existing session ID to use without calling connect
   */
  sessionId?: string;

  /**
   * Optional callback to handle session termination events from the wallet.
   * This is called when the wallet revokes the session (e.g., user disconnects from wallet UI).
   *
   * @param params - Session termination parameters
   * @param params.sessionId - ID of the terminated session
   * @param params.reason - Human-readable reason for termination
   *
   * @example
   * ```typescript
   * const provider = new AztecRouterProvider(transport, {
   *   onSessionTerminated: ({ sessionId, reason }) => {
   *     console.log(`Session ${sessionId} terminated: ${reason}`);
   *     // Clean up your application state
   *   }
   * });
   * ```
   */
  onSessionTerminated?: SessionTerminationHandler;
}

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
 * ## Session Termination Handling
 *
 * The provider automatically listens for `wm_sessionTerminated` events from the wallet.
 * You can provide a custom handler via the `onSessionTerminated` option to clean up
 * your application state when the session is terminated.
 *
 * @example
 * ```typescript
 * import { AztecRouterProvider, createAztecWallet } from '@walletmesh/aztec-rpc-wallet';
 * import { MyCustomTransport } from './my-custom-transport'; // Assuming a custom transport
 *
 * // 1. Create a JSON-RPC transport
 * const transport = new MyCustomTransport();
 *
 * // 2. Create the AztecRouterProvider instance with session termination handler
 * const provider = new AztecRouterProvider(transport, {
 *   onSessionTerminated: ({ sessionId, reason }) => {
 *     console.log(`Session ${sessionId} was terminated: ${reason}`);
 *     // Clean up application state
 *   }
 * });
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
 * @see {@link registerAztecWalletSerializers} for the underlying serializer registration.
 * @see {@link AztecDappWallet} which is typically used with this provider.
 */
export class AztecWalletRouterProvider extends WalletRouterProvider {
  private sessionTerminationCleanup?: () => void;

  /**
   * Constructs an instance of `AztecRouterProvider`.
   *
   * Upon construction, it immediately registers all Aztec-specific serializers
   * with the underlying JSON-RPC node managed by the `WalletRouterProvider`.
   *
   * @param transport - The {@link JSONRPCTransport} instance to be used for
   *                    communication between the dApp and the WalletRouter.
   * @param options - Optional configuration including context, sessionId, and event handlers.
   *                 Can also be a plain context object for backward compatibility.
   */
  constructor(
    transport: JSONRPCTransport,
    options?: AztecRPCWalletRouterProviderOptions,
  ) {

    super(transport, options?.context, options?.sessionId);

    // Register all Aztec serializers on this provider instance
    registerAztecWalletSerializers(this);

    // Set up session termination handler if provided
    const onSessionTerminated = options?.onSessionTerminated;
    if (onSessionTerminated) {
      this.setupSessionTerminationListener(onSessionTerminated);
    }
  }

  /**
   * Set up listener for session termination events from the wallet
   * @private
   */
  private setupSessionTerminationListener(handler: SessionTerminationHandler): void {
    // Subscribe to wm_sessionTerminated notifications
    this.sessionTerminationCleanup = this.onNotification('wm_sessionTerminated', (params) => {
      const { sessionId, reason } = params as { sessionId: string; reason: string };

      if (!sessionId) {
        console.warn('[AztecRouterProvider] wm_sessionTerminated missing sessionId', params);
        return;
      }

      console.log(`[AztecRouterProvider] Session ${sessionId} terminated by wallet: ${reason}`);

      // Call the user-provided handler
      try {
        const result = handler({ sessionId, reason });
        // Handle both sync and async handlers
        if (result instanceof Promise) {
          result.catch((error) => {
            console.error('[AztecRouterProvider] Error in session termination handler:', error);
          });
        }
      } catch (error) {
        console.error('[AztecRouterProvider] Error in session termination handler:', error);
      }
    });
  }

  /**
   * Clean up resources when disposing the provider
   * @public
   */
  public dispose(): void {
    // Clean up session termination listener
    if (this.sessionTerminationCleanup) {
      this.sessionTerminationCleanup();
      delete this.sessionTerminationCleanup;
    }
  }
}
