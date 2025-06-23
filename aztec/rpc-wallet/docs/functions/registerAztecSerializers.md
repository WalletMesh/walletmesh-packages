[**@walletmesh/aztec-rpc-wallet v0.4.1**](../README.md)

***

[@walletmesh/aztec-rpc-wallet](../globals.md) / registerAztecSerializers

# Function: registerAztecSerializers()

> **registerAztecSerializers**(`provider`): `void`

Defined in: [aztec/rpc-wallet/src/client/register-serializers.ts:43](https://github.com/WalletMesh/walletmesh-packages/blob/c22c9775e630bf48780e547c01c8f5442dc5b36c/aztec/rpc-wallet/src/client/register-serializers.ts#L43)

Registers the [AztecWalletSerializer](../variables/AztecWalletSerializer.md) for all relevant Aztec JSON-RPC methods
on a given [WalletRouterProvider](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/classes/WalletRouterProvider.md) instance.

This utility function ensures that any `WalletRouterProvider` (not just the specialized
[AztecRouterProvider](../classes/AztecRouterProvider.md)) can be configured to correctly handle serialization and
deserialization of Aztec-specific data types (e.g., `AztecAddress`, `Fr`, `TxExecutionRequest`)
when interacting with an Aztec wallet.

It iterates through a predefined list of Aztec methods and associates them with
the comprehensive [AztecWalletSerializer](../variables/AztecWalletSerializer.md).

## Parameters

### provider

[`WalletRouterProvider`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/classes/WalletRouterProvider.md)

The [WalletRouterProvider](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/classes/WalletRouterProvider.md) instance on which to register the serializers.
                  After this function call, the provider will be equipped to handle Aztec methods.

## Returns

`void`

## Example

```typescript
import { WalletRouterProvider } from '@walletmesh/router';
import { registerAztecSerializers, ALL_AZTEC_METHODS } from '@walletmesh/aztec-rpc-wallet';
import { MyCustomTransport } from './my-custom-transport';

// 1. Create a generic WalletRouterProvider
const transport = new MyCustomTransport();
const provider = new WalletRouterProvider(transport);

// 2. Register Aztec serializers on it
registerAztecSerializers(provider);

// 3. Now the provider can correctly handle Aztec methods and types
await provider.connect({ 'aztec:testnet': ALL_AZTEC_METHODS });
const address = await provider.call('aztec:testnet', { method: 'aztec_getAddress' });
// 'address' will be correctly deserialized into an AztecAddress instance (or equivalent based on serializer)
```

## See

 - [AztecWalletSerializer](../variables/AztecWalletSerializer.md) for the actual serialization logic.
 - [AztecRouterProvider](../classes/AztecRouterProvider.md) for a provider that calls this automatically.
 - [AztecWalletMethodMap](../interfaces/AztecWalletMethodMap.md) for the list of methods and their types.
