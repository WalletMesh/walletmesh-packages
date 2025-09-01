import type { WalletRouterProvider } from '@walletmesh/router';
import type { AztecWalletMethodMap } from '../types.js';
import { AztecWalletSerializer } from '../wallet/serializers.js';

/**
 * Registers the {@link AztecWalletSerializer} for all relevant Aztec JSON-RPC methods
 * on a given {@link WalletRouterProvider} instance.
 *
 * This utility function ensures that any `WalletRouterProvider` (not just the specialized
 * {@link AztecRouterProvider}) can be configured to correctly handle serialization and
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
 * @see {@link AztecRouterProvider} for a provider that calls this automatically.
 * @see {@link AztecWalletMethodMap} for the list of methods and their types.
 */
export function registerAztecSerializers(provider: WalletRouterProvider): void {
  // List of all Aztec wallet methods that need the AztecWalletSerializer.
  // This list should ideally be kept in sync with ALL_AZTEC_METHODS or derived from AztecWalletMethodMap.
  // Note: 'aztec_createTxExecutionRequest' is a client-side method, not a direct RPC method name.
  // The actual RPC methods involved in tx creation are typically aztec_proveTx, aztec_sendTx, etc.
  // However, if it were an RPC method, it would be listed here.
  // For now, using a manually curated list that matches most of AztecWalletMethodMap.
  const aztecMethods: (keyof AztecWalletMethodMap)[] = [
    // Chain/Node Methods
    'aztec_getBlock',
    'aztec_getBlockNumber',
    'aztec_getChainId',
    'aztec_getVersion',
    'aztec_getNodeInfo',
    'aztec_getProvenBlockNumber',
    'aztec_getPXEInfo',
    'aztec_getCurrentBaseFees',

    // Account Methods
    'aztec_getAddress',
    'aztec_getCompleteAddress',

    // AuthWitness Methods
    'aztec_createAuthWit',

    // Sender Methods
    'aztec_registerSender',
    'aztec_getSenders',
    'aztec_removeSender',

    // Contract Methods
    'aztec_getContracts',
    'aztec_getContractMetadata',
    'aztec_getContractClassMetadata',
    'aztec_registerContract',
    'aztec_registerContractClass',

    // Transaction Methods
    // 'aztec_createTxExecutionRequest', // This is a client-side method, not an RPC method.
    'aztec_proveTx',
    'aztec_sendTx',
    'aztec_getTxReceipt',
    'aztec_simulateTx',
    'aztec_profileTx',
    'aztec_simulateUtility',

    // Event Methods
    'aztec_getPrivateEvents',
    'aztec_getPublicEvents',

    // Contract Interaction Methods (WalletMesh specific)
    'aztec_wmExecuteTx',
    'aztec_wmSimulateTx',
    'aztec_wmDeployContract',

    // Base WalletMesh method often included
    'wm_getSupportedMethods',
  ];

  // Register the unified Aztec serializer for all methods
  for (const method of aztecMethods) {
    // The AztecWalletSerializer is already set up with all the proper
    // serialization logic for each method
    provider.registerMethodSerializer(method as string, AztecWalletSerializer);
  }
}
