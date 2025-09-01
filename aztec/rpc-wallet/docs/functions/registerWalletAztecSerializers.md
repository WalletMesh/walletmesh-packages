[**@walletmesh/aztec-rpc-wallet v0.5.0**](../README.md)

***

[@walletmesh/aztec-rpc-wallet](../globals.md) / registerWalletAztecSerializers

# Function: registerWalletAztecSerializers()

> **registerWalletAztecSerializers**(`node`): `void`

Defined in: [aztec/rpc-wallet/src/wallet/serializers.ts:550](https://github.com/WalletMesh/walletmesh-packages/blob/fd734440d9c5e6ff3c77f868722c74b1be65d39d/aztec/rpc-wallet/src/wallet/serializers.ts#L550)

Registers the [AztecWalletSerializer](../variables/AztecWalletSerializer.md) for all relevant Aztec JSON-RPC methods
on a given JSONRPCNode instance.

This function is typically called on the wallet-side (e.g., within
`createAztecWalletNode`) to equip the node with the necessary serialization
capabilities for handling Aztec methods.

It iterates through a predefined list of Aztec methods and associates each
with the `AztecWalletSerializer`.

## Parameters

### node

`JSONRPCNode`\<[`AztecWalletMethodMap`](../interfaces/AztecWalletMethodMap.md)\>

The JSONRPCNode instance on which to register the serializers.
              This node should be typed with [AztecWalletMethodMap](../interfaces/AztecWalletMethodMap.md).

## Returns

`void`

## See

 - [createAztecWalletNode](createAztecWalletNode.md) where this function is used.
 - [AztecWalletSerializer](../variables/AztecWalletSerializer.md) which provides the serialization logic.
