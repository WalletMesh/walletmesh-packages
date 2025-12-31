[**@walletmesh/aztec-rpc-wallet v0.5.6**](../README.md)

***

[@walletmesh/aztec-rpc-wallet](../globals.md) / registerWalletAztecSerializers

# Function: registerWalletAztecSerializers()

> **registerWalletAztecSerializers**(`node`): `void`

Defined in: [aztec/rpc-wallet/src/wallet/serializers.ts:650](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/wallet/serializers.ts#L650)

Registers the [AztecWalletSerializer](../variables/AztecWalletSerializer.md) for all relevant Aztec JSON-RPC methods
on a given [JSONRPCNode](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/jsonrpc/docs/classes/JSONRPCNode.md) instance.

This function is typically called on the wallet-side (e.g., within
`createAztecWalletNode`) to equip the node with the necessary serialization
capabilities for handling Aztec methods.

It iterates through a predefined list of Aztec methods and associates each
with the `AztecWalletSerializer`.

## Parameters

### node

[`JSONRPCNode`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/jsonrpc/docs/classes/JSONRPCNode.md)\<[`AztecWalletMethodMap`](../interfaces/AztecWalletMethodMap.md)\>

The [JSONRPCNode](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/jsonrpc/docs/classes/JSONRPCNode.md) instance on which to register the serializers.
              This node should be typed with [AztecWalletMethodMap](../interfaces/AztecWalletMethodMap.md).

## Returns

`void`

## See

 - [createAztecWalletNode](createAztecWalletNode.md) where this function is used.
 - [AztecWalletSerializer](../variables/AztecWalletSerializer.md) which provides the serialization logic.
