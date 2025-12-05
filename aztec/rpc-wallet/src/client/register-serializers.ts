import type { WalletRouterProvider } from '@walletmesh/router';
import { SERIALIZERS } from '../serializers.js';
import type { AztecWalletMethodMap } from '../types.js';

/**
 * Registers the {@link AztecWalletSerializer} for all relevant Aztec JSON-RPC methods
 * on a given {@link WalletRouterProvider} instance.
 *
 * This utility function ensures that any `WalletRouterProvider` (not just the specialized
 * {@link AztecWalletRouterProvider}) can be configured to correctly handle serialization and
 * deserialization of Aztec-specific data types (e.g., `AztecAddress`, `Fr`, `TxExecutionRequest`)
 * when interacting with an Aztec wallet.
 *
 * It iterates through a predefined list of Aztec methods and associates them with
 * the comprehensive {@link AztecWalletSerializer}.
 *
 * @param provider - The {@link WalletRouterProvider} instance on which to register the serializers.
 *                   After this function call, the provider will be equipped to handle Aztec methods.
 *
 * @example
 * ```typescript
 * import { WalletRouterProvider } from '@walletmesh/router';
 * import { registerAztecSerializers, ALL_AZTEC_METHODS } from '@walletmesh/aztec-rpc-wallet';
 * import { MyCustomTransport } from './my-custom-transport';
 *
 * // 1. Create a generic WalletRouterProvider
 * const transport = new MyCustomTransport();
 * const provider = new WalletRouterProvider(transport);
 *
 * // 2. Register Aztec serializers on it
 * registerAztecSerializers(provider);
 *
 * // 3. Now the provider can correctly handle Aztec methods and types
 * await provider.connect({ 'aztec:testnet': ALL_AZTEC_METHODS });
 * const address = await provider.call('aztec:testnet', { method: 'aztec_getAddress' });
 * // 'address' will be correctly deserialized into an AztecAddress instance (or equivalent based on serializer)
 * ```
 *
 * @see {@link AztecWalletSerializer} for the actual serialization logic.
 * @see {@link AztecWalletRouterProvider} for a provider that calls this automatically.
 * @see {@link AztecWalletMethodMap} for the list of methods and their types.
 */
export function registerAztecWalletSerializers(provider: WalletRouterProvider): void {
  for (const method of Object.keys(SERIALIZERS)) {
    if (!SERIALIZERS[method]) {
      // This should never trigger
      throw new Error(`No serializer found for method: ${method}`);
    }
    provider.registerMethodSerializer(method, SERIALIZERS[method]);
  }
}
